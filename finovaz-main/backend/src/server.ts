import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { MemoryStore } from './state/memoryStore';
import { VeriShieldModule } from './modules/verishield';
import { TopsisEngine } from './modules/topsisEngine';
import { SyndicationModule } from './modules/syndication';
import { ChaosEngine } from './modules/chaosEngine';
import { ElevenLabsService } from './modules/elevenLabsService';
import { Bid, ChaosEvent, VerificationRequest, VoiceNarrateRequest, VoiceTopic, ELEVENLABS_VOICES } from '@finova/shared';

dotenv.config();

const server: FastifyInstance = Fastify({
  logger: true
});

const store = MemoryStore.getInstance();
const verishield = new VeriShieldModule();
const chaosEngine = new ChaosEngine();

// Register CORS
server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Serve frontend static assets if built
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  server.register(fastifyStatic, {
    root: frontendDist,
    prefix: '/',
    decorateReply: false
  });
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Dual-Role Authentication
server.post('/api/auth/login', async (request, reply) => {
  const { email, password, roleType } = (request.body || {}) as {
    email?: string;
    password?: string;
    roleType?: string;
  };

  if (!email || !password || !roleType) {
    return reply.status(400).send({
      success: false,
      message: 'Missing required credentials: email, password, and roleType.'
    });
  }

  const targetRole = roleType.toUpperCase();
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return reply.status(401).send({
      success: false,
      message: 'Authentication failed. Account not found.'
    });
  }

  if (user.role !== targetRole) {
    return reply.status(401).send({
      success: false,
      message: `Role mismatch. User is registered as ${user.role}, requested ${targetRole}.`
    });
  }

  // Password verification: demo password 'demo123'
  const isMatch = password === 'demo123' || (await bcrypt.compare(password, await bcrypt.hash('demo123', 10)));
  if (!isMatch) {
    return reply.status(401).send({
      success: false,
      message: 'Invalid password. Check credentials.'
    });
  }

  return {
    success: true,
    token: `finova-jwt-${Date.now()}`,
    user: {
      email: user.email,
      role: user.role,
      entity_name: user.entityName,
      identifier: user.identifier,
      liquidity: user.liquidity
    }
  };
});

// 2. VeriShield Cryptographic Verification
server.post('/api/verify', async (request, reply) => {
  const payload = (request.body || {}) as VerificationRequest;
  const result = verishield.verify(payload);
  if (result.code) {
    return reply.status(result.code).send(result);
  }
  return result;
});

// 3. Get Invoices Feed
server.get('/api/invoices', async () => {
  return {
    success: true,
    count: store.invoices.length,
    invoices: store.invoices
  };
});

// 4. Get Single Invoice
server.get('/api/invoices/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const invoice = store.getInvoice(id);
  if (!invoice) {
    return reply.status(404).send({ success: false, message: 'Invoice not found.' });
  }
  return { success: true, invoice };
});

// 5. Get Bids for Invoice
server.get('/api/bids/:invoiceId', async (request) => {
  const { invoiceId } = request.params as { invoiceId: string };
  const activeBids = store.getBidsForInvoice(invoiceId);
  return {
    success: true,
    invoiceId,
    count: activeBids.length,
    bids: activeBids
  };
});

// 6. Submit Financing Bid
server.post('/api/bids/submit', async (request, reply) => {
  const body = (request.body || {}) as Partial<Bid> & { apr?: number; speed?: number };
  const offerId = body.id || `OFF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const rateVal = Number(body.apr || body.rate || 9.2);
  const tenorVal = Number(body.speed || body.tenor || 30);
  const advanceVal = Number(body.advance || 90);

  const newBid: Bid = {
    id: offerId,
    requestId: body.requestId || body.invoiceId || 'INV-1042',
    invoiceId: body.invoiceId || body.requestId || 'INV-1042',
    providerId: body.providerId || 'apex',
    providerName: body.providerName || 'Apex Institutional Bank',
    advance: advanceVal,
    rate: rateVal,
    apr: rateVal,
    tenor: tenorVal,
    speed: tenorVal,
    fee: Number(body.fee || 1500),
    score: Number(body.score || 90),
    status: 'SUBMITTED',
    createdAt: Date.now()
  };

  store.addBid(newBid);
  return { success: true, message: 'Financing bid submitted successfully.', bid: newBid };
});

// 7. TOPSIS AI Matching Algorithm
server.post('/api/match', async (request, reply) => {
  const { invoiceId = 'INV-1042' } = (request.body || {}) as { invoiceId?: string };
  const candidateBids = store.getBidsForInvoice(invoiceId);

  if (candidateBids.length === 0) {
    return reply.status(404).send({
      success: false,
      message: 'No active candidate bids found for TOPSIS evaluation.',
      rankedOffers: []
    });
  }

  const result = TopsisEngine.evaluate(candidateBids);
  return result;
});

// 8. Accept Winning Offer / Smart Contract Settlement
server.post('/api/settle', async (request, reply) => {
  const { invoiceId, offerId } = (request.body || {}) as { invoiceId: string; offerId: string };
  if (!invoiceId || !offerId) {
    return reply.status(400).send({ success: false, message: 'Missing invoiceId or offerId.' });
  }

  const success = store.acceptBid(invoiceId, offerId);
  if (!success) {
    return reply.status(400).send({ success: false, message: 'Failed to settle financing contract.' });
  }

  return {
    success: true,
    message: 'Financing smart contract settled. Capital successfully disbursed.',
    financing: store.financings[invoiceId]
  };
});

// 9. Dynamic Syndication & Tranche Calculation
server.post('/api/syndicate', async (request) => {
  const { invoiceAmount = 5000000, seniorRate = 8.5, mezzanineRate = 11.5 } = (request.body || {}) as {
    invoiceAmount?: number;
    seniorRate?: number;
    mezzanineRate?: number;
  };

  const plan = SyndicationModule.calculateTranches(invoiceAmount, seniorRate, mezzanineRate);
  return plan;
});

// 10. Chaos Sandbox & Stress Testing
server.post('/api/chaos/simulate', async (request) => {
  const payload = (request.body || {}) as ChaosEvent;
  const result = chaosEngine.simulate(payload);
  return result;
});

// 11. Capital Provider Portfolio Twin
server.get('/api/analytics/portfolio', async () => {
  return {
    success: true,
    providers: store.providers,
    auditLogs: store.auditLogs.slice(0, 15),
    totalDeployedCapital: store.providers.reduce((s, p) => s + p.deployedCapital, 0),
    totalAvailableLiquidity: store.providers.reduce((s, p) => s + p.liquidity, 0)
  };
});

// 12. ElevenLabs AI Voice Intelligence Routes
server.get('/api/voice/voices', async () => {
  return {
    success: true,
    voices: ELEVENLABS_VOICES,
    defaultVoiceId: '21m00Tcm4TlvDq8ikWAM'
  };
});

server.post('/api/voice/narrate', async (request, reply) => {
  try {
    const body = (request.body || {}) as VoiceNarrateRequest;
    const result = await ElevenLabsService.narrate(body);
    return result;
  } catch (err: any) {
    return reply.status(500).send({
      success: false,
      message: err?.message || 'Failed to synthesize voice narration.'
    });
  }
});

server.get('/api/voice/briefing/:topic', async (request, reply) => {
  const { topic } = request.params as { topic: VoiceTopic };
  const query = (request.query || {}) as { voiceId?: string; apiKey?: string };

  let contextData: any = {};
  if (topic === 'PORTFOLIO_BRIEFING') {
    contextData = {
      totalDeployedCapital: store.providers.reduce((s, p) => s + p.deployedCapital, 0),
      totalAvailableLiquidity: store.providers.reduce((s, p) => s + p.liquidity, 0)
    };
  } else if (topic === 'TOPSIS_DEAL') {
    const bids = store.getBidsForInvoice('INV-1042');
    if (bids.length > 0) {
      const topsis = TopsisEngine.evaluate(bids);
      contextData = topsis;
    }
  }

  const result = await ElevenLabsService.narrate({
    topic,
    voiceId: query.voiceId,
    apiKey: query.apiKey,
    contextData
  });

  return result;
});

// Start Server
const PORT = Number(process.env.PORT || 4000);
const start = async () => {
  try {
    const address = await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n🚀 FINOVA Fastify Financial Engine online at: ${address}`);
    console.log(`📊 Monitoring Active Invoices, TOPSIS Matching & Syndication\n`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
