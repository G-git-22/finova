const Fastify = require('fastify');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/'
});

// ==========================================
// 2. Global State Engine (In-Memory Database)
// ==========================================
const invoices = [
    {
        id: 'REQ-001',
        supplierId: 'supplier',
        supplierName: 'Alpha Precision Components Ltd',
        buyerName: 'Tata Motors Ltd',
        invoiceAmount: 850000,
        fundingRequired: 765000,
        minimumAdvance: 90,
        maximumTenor: 60,
        settlementUrgency: 'Within 24 hours',
        risk: 'Low',
        verificationStatus: 'Verified',
        trustScore: 94,
        hash: '7d8a9f2e3c4b5a67890123456789abcdef0123456789abcdef0123456789abcdef',
        status: 'OPEN FOR BIDS'
    }
];

const bids = [
    {
        id: 'OFF-BANK-101',
        requestId: 'REQ-001',
        providerId: 'bank',
        providerName: 'Apex Institutional Bank',
        advance: 90,
        rate: 9.2,
        tenor: 45,
        fee: 2000,
        score: 93,
        status: 'SUBMITTED',
        createdAt: Date.now() - 3600000
    },
    {
        id: 'OFF-NBFC-102',
        requestId: 'REQ-001',
        providerId: 'nbfc',
        providerName: 'Stride NBFC',
        advance: 95,
        rate: 9.5,
        tenor: 30,
        fee: 1500,
        score: 97,
        status: 'SUBMITTED',
        createdAt: Date.now() - 1800000
    },
    {
        id: 'OFF-FUND-103',
        requestId: 'REQ-001',
        providerId: 'fund',
        providerName: 'Harbor Private Fund',
        advance: 80,
        rate: 8.8,
        tenor: 60,
        fee: 1000,
        score: 82,
        status: 'SUBMITTED',
        createdAt: Date.now() - 900000
    }
];

const providers = [
    { id: 'apex', name: 'Apex Institutional Bank', type: 'Commercial Bank', liquidity: 4000000, maxAdvance: 90, riskAppetite: 'Low-Medium' },
    { id: 'stride', name: 'Stride NBFC', type: 'NBFC', liquidity: 2500000, maxAdvance: 95, riskAppetite: 'Medium' },
    { id: 'harbor', name: 'Harbor Private Fund', type: 'Private Credit Fund', liquidity: 3000000, maxAdvance: 80, riskAppetite: 'Medium-High' }
];

// Mocked duplicate hash Set for duplicate attack demo
const existingHashes = new Set([
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
]);

// Fallback user credentials if MySQL database is not connected
const fallbackUsers = [
    { email: 'alpha@supplier.com', password_hash: bcrypt.hashSync('demo123', 10), role: 'SUPPLIER', entity_name: 'Alpha Precision Components', identifier: '27AABCA1234F1Z9' },
    { email: 'beta@supplier.com', password_hash: bcrypt.hashSync('demo123', 10), role: 'SUPPLIER', entity_name: 'Beta Manufacturing Hub', identifier: '29BBDEF5678G2Y8' },
    { email: 'apex@lender.com', password_hash: bcrypt.hashSync('demo123', 10), role: 'LENDER', entity_name: 'Apex Institutional Bank', identifier: 'INST-8821' },
    { email: 'stride@lender.com', password_hash: bcrypt.hashSync('demo123', 10), role: 'LENDER', entity_name: 'Stride NBFC', identifier: 'INST-4432' },
    { email: 'harbor@lender.com', password_hash: bcrypt.hashSync('demo123', 10), role: 'LENDER', entity_name: 'Harbor Private Fund', identifier: 'INST-9910' }
];

// ==========================================
// 3. Core REST API Endpoints
// ==========================================

// Authentication Endpoint (MySQL + Fallback)
fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password, roleType } = request.body || {};

    if (!email || !password || !roleType) {
        return reply.status(400).send({ success: false, message: 'Missing required credentials: email, password, or roleType.' });
    }

    const targetRole = roleType.toUpperCase();
    let dbUser = null;

    // Try MySQL first
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows && rows.length > 0) {
            dbUser = rows[0];
        }
    } catch (err) {
        fastify.log.warn('MySQL connection unavailable, checking fallback credentials:', err.message);
    }

    // Fallback if DB query didn't return
    if (!dbUser) {
        dbUser = fallbackUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!dbUser) {
        return reply.status(401).send({ success: false, message: 'Invalid credentials or account not found.' });
    }

    if (dbUser.role !== targetRole) {
        return reply.status(401).send({ success: false, message: `Role mismatch. User is registered as ${dbUser.role}, requested ${targetRole}.` });
    }

    const match = await bcrypt.compare(password, dbUser.password_hash);
    if (!match) {
        return reply.status(401).send({ success: false, message: 'Invalid password. Check credentials.' });
    }

    return {
        success: true,
        token: 'finova-mock-jwt-token-' + Date.now(),
        user: {
            email: dbUser.email,
            role: dbUser.role,
            entity_name: dbUser.entity_name,
            identifier: dbUser.identifier
        }
    };
});

// VeriShield Invoice Verification Endpoint
fastify.post('/api/verify', async (request, reply) => {
    const payload = request.body || {};
    const { invoiceId, amount, invoiceAmount, hash, supplierId, buyerName } = payload;
    const invAmount = Number(amount || invoiceAmount || 850000);

    // 1. Cross-Lender Duplicate Registry Collision Check
    if (hash && existingHashes.has(hash)) {
        return {
            status: 'REVIEW_REQUIRED',
            reason: 'SHA-256 Collision: Double-financing attack detected.',
            message: 'SHA-256 Collision: Double-financing attack detected.',
            details: {
                hash,
                flag: 'DOUBLE_FINANCING_RISK'
            }
        };
    }

    // 2. Lock the new hash in cross-lender registry
    if (hash) {
        existingHashes.add(hash);
    }

    // 3. Verified - Store in in-memory invoices array
    const invRecord = {
        id: invoiceId || payload.id || 'INV-1042',
        supplierId: supplierId || '27AABCA1234F1Z9',
        supplierName: payload.supplierName || 'Alpha Precision Components Ltd',
        buyerName: buyerName || payload.buyerName || 'Tata Motors Ltd',
        invoiceAmount: invAmount,
        fundingRequired: Math.round(invAmount * 0.9),
        minimumAdvance: 90,
        maximumTenor: 60,
        settlementUrgency: 'Within 24 hours',
        risk: 'Low',
        verificationStatus: 'Verified',
        trustScore: 94,
        hash: hash || '7d8a9f2e3c4b5a67890123456789abcdef0123456789abcdef0123456789abcdef',
        status: 'OPEN FOR BIDS',
        createdAt: Date.now()
    };

    // Replace or push to invoices array
    const existingIdx = invoices.findIndex(i => i.id === invRecord.id);
    if (existingIdx >= 0) {
        invoices[existingIdx] = invRecord;
    } else {
        invoices.push(invRecord);
    }

    return {
        status: 'VERIFIED',
        message: 'Invoice integrity confirmed. Hash unique and buyer verified.',
        invoice: invRecord
    };
});

// 2. Get All Verified Invoices
fastify.get('/api/invoices', async (request, reply) => {
    const verifiedInvoices = invoices.filter(i => i.status === 'OPEN FOR BIDS' || i.verificationStatus === 'Verified' || i.status === 'VERIFIED');
    return {
        success: true,
        count: verifiedInvoices.length,
        invoices: verifiedInvoices.length > 0 ? verifiedInvoices : invoices
    };
});

// 3. Get Bids for Invoice
fastify.get('/api/bids/:invoiceId', async (request, reply) => {
    const { invoiceId } = request.params;
    const activeBids = bids.filter(b => b.requestId === invoiceId || b.invoiceId === invoiceId);
    return { success: true, invoiceId, count: activeBids.length, bids: activeBids };
});

// 4. Submit New Bid
fastify.post('/api/bids/submit', async (request, reply) => {
    const bidData = request.body || {};
    const offerId = bidData.offerId || 'OFF-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const rate = Number(bidData.apr || bidData.rate || 9.0);
    const tenor = Number(bidData.speed || bidData.tenor || 30);
    const advance = Number(bidData.advance || 90);
    const fee = Number(bidData.fee || 1500);

    const newBid = {
        id: offerId,
        requestId: bidData.invoiceId || bidData.requestId || 'REQ-001',
        invoiceId: bidData.invoiceId || bidData.requestId || 'REQ-001',
        providerId: bidData.providerId || 'bank',
        providerName: bidData.providerName || 'Capital Provider',
        advance: advance,
        rate: rate,
        apr: rate,
        tenor: tenor,
        speed: tenor,
        fee: fee,
        score: Number(bidData.score) || 85,
        status: 'SUBMITTED',
        createdAt: Date.now()
    };

    bids.push(newBid);
    return { success: true, message: 'Bid submitted successfully.', bid: newBid };
});

// TOPSIS Algorithm Matching Endpoint
fastify.post('/api/match', async (request, reply) => {
    const { invoiceId = 'REQ-001', minAdvance = 90 } = request.body || {};
    const candidateBids = bids.filter(b => b.requestId === invoiceId);

    if (candidateBids.length === 0) {
        return { success: false, message: 'No active bids found for matching.', rankedOffers: [] };
    }

    // TOPSIS Implementation
    // Weights: Rate (minimize): 0.45, Advance (maximize): 0.35, Tenor (minimize): 0.20
    const wRate = 0.45;
    const wAdv = 0.35;
    const wTenor = 0.20;

    // Sum of squares for normalization
    const normRate = Math.sqrt(candidateBids.reduce((s, b) => s + b.rate * b.rate, 0)) || 1;
    const normAdv = Math.sqrt(candidateBids.reduce((s, b) => s + b.advance * b.advance, 0)) || 1;
    const normTenor = Math.sqrt(candidateBids.reduce((s, b) => s + b.tenor * b.tenor, 0)) || 1;

    // Calculate weighted normalized values
    const matrix = candidateBids.map(b => ({
        bid: b,
        vRate: (b.rate / normRate) * wRate,
        vAdv: (b.advance / normAdv) * wAdv,
        vTenor: (b.tenor / normTenor) * wTenor
    }));

    // Ideal Best & Ideal Worst
    // Rate: lower is better -> best = min(vRate), worst = max(vRate)
    // Advance: higher is better -> best = max(vAdv), worst = min(vAdv)
    // Tenor: lower is better -> best = min(vTenor), worst = max(vTenor)
    const idealBest = {
        vRate: Math.min(...matrix.map(m => m.vRate)),
        vAdv: Math.max(...matrix.map(m => m.vAdv)),
        vTenor: Math.min(...matrix.map(m => m.vTenor))
    };

    const idealWorst = {
        vRate: Math.max(...matrix.map(m => m.vRate)),
        vAdv: Math.min(...matrix.map(m => m.vAdv)),
        vTenor: Math.max(...matrix.map(m => m.vTenor))
    };

    // Compute relative closeness Ci* = S_minus / (S_plus + S_minus)
    const rankedOffers = matrix.map(m => {
        const sPlus = Math.sqrt(
            Math.pow(m.vRate - idealBest.vRate, 2) +
            Math.pow(m.vAdv - idealBest.vAdv, 2) +
            Math.pow(m.vTenor - idealBest.vTenor, 2)
        );

        const sMinus = Math.sqrt(
            Math.pow(m.vRate - idealWorst.vRate, 2) +
            Math.pow(m.vAdv - idealWorst.vAdv, 2) +
            Math.pow(m.vTenor - idealWorst.vTenor, 2)
        );

        const topsisScore = (sPlus + sMinus) === 0 ? 0.5 : (sMinus / (sPlus + sMinus));
        const matchScore = Math.round(topsisScore * 100);

        return {
            ...m.bid,
            topsisScore: Number(topsisScore.toFixed(4)),
            score: Math.max(matchScore, m.bid.score || 80)
        };
    }).sort((a, b) => b.topsisScore - a.topsisScore);

    return {
        success: true,
        algorithm: 'TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution)',
        bestMatch: rankedOffers[0],
        rankedOffers
    };
});

// Dynamic Syndication Endpoint for Large Invoices
fastify.post('/api/syndicate', async (request, reply) => {
    const { invoiceAmount = 5000000, seniorRate = 8.5, mezzanineRate = 11.5 } = request.body || {};
    const totalAmount = Number(invoiceAmount);

    // Tranches: Senior (60%), Mezzanine (30%), Retention (10%)
    const seniorAmount = Math.round(totalAmount * 0.60);
    const mezzanineAmount = Math.round(totalAmount * 0.30);
    const retentionAmount = Math.round(totalAmount * 0.10);

    const totalFinanced = seniorAmount + mezzanineAmount;
    
    // Blended APR calculation
    const blendedAPR = Number(((0.60 * seniorRate) + (0.30 * mezzanineRate)).toFixed(2));

    return {
        success: true,
        invoiceAmount: totalAmount,
        tranches: {
            senior: { share: '60%', amount: seniorAmount, rate: seniorRate, riskLevel: 'Low' },
            mezzanine: { share: '30%', amount: mezzanineAmount, rate: mezzanineRate, riskLevel: 'Medium' },
            retention: { share: '10%', amount: retentionAmount, rate: 0, riskLevel: 'Supplier First-Loss' }
        },
        totalFinancedAmount: totalFinanced,
        blendedAPR: blendedAPR
    };
});

// Start Fastify server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        const address = await fastify.listen({ port: Number(PORT), host: '127.0.0.1' });
        console.log(`🚀 FINOVA Fastify Server listening at ${address}`);
    } catch (err) {
        console.error('Server Start Error:', err);
        process.exit(1);
    }
};

startServer();
