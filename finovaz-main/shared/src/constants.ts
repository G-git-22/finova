import { CapitalProvider, Invoice, User } from './types';

export const KNOWN_DUPLICATE_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export const DEMO_USERS: User[] = [
  {
    id: 'alpha-supplier',
    email: 'alpha@supplier.com',
    role: 'SUPPLIER',
    entityName: 'Alpha Precision Components Ltd',
    identifier: '27AABCA1234F1Z9'
  },
  {
    id: 'beta-supplier',
    email: 'beta@supplier.com',
    role: 'SUPPLIER',
    entityName: 'Beta Manufacturing Hub Ltd',
    identifier: '29BBDEF5678G2Y8'
  },
  {
    id: 'apex',
    email: 'apex@lender.com',
    role: 'LENDER',
    entityName: 'Apex Institutional Bank',
    identifier: 'INST-8821',
    liquidity: 4000000,
    riskAppetite: 'Low-Medium',
    maxFinancing: 5000000,
    preferredTenor: '30-60 Days'
  },
  {
    id: 'stride',
    email: 'stride@lender.com',
    role: 'LENDER',
    entityName: 'Stride NBFC',
    identifier: 'INST-4432',
    liquidity: 2500000,
    riskAppetite: 'Medium',
    maxFinancing: 3000000,
    preferredTenor: '15-45 Days'
  },
  {
    id: 'harbor',
    email: 'harbor@lender.com',
    role: 'LENDER',
    entityName: 'Harbor Private Fund',
    identifier: 'INST-9910',
    liquidity: 3000000,
    riskAppetite: 'Medium-High',
    maxFinancing: 4000000,
    preferredTenor: '45-90 Days'
  }
];

export const DEFAULT_PROVIDERS: CapitalProvider[] = [
  {
    id: 'apex',
    name: 'Apex Institutional Bank',
    type: 'Tier-1 Scheduled Commercial Bank',
    liquidity: 4000000,
    maxAdvance: 90,
    riskAppetite: 'Low-Medium',
    deployedCapital: 12500000,
    activeDeals: 14,
    preferredTenor: '30 - 60 Days'
  },
  {
    id: 'stride',
    name: 'Stride NBFC',
    type: 'Systemically Important NBFC',
    liquidity: 2500000,
    maxAdvance: 95,
    riskAppetite: 'Medium',
    deployedCapital: 8200000,
    activeDeals: 21,
    preferredTenor: '15 - 45 Days'
  },
  {
    id: 'harbor',
    name: 'Harbor Private Fund',
    type: 'Alternative Investment Fund (AIF-II)',
    liquidity: 3000000,
    maxAdvance: 80,
    riskAppetite: 'Medium-High',
    deployedCapital: 6400000,
    activeDeals: 9,
    preferredTenor: '45 - 90 Days'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-1042',
    supplierId: '27AABCA1234F1Z9',
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
    status: 'OPEN FOR BIDS',
    lineItems: [
      { description: 'Precision CNC Machined Gear Units', quantity: 50, unitPrice: 12000, amount: 600000 },
      { description: 'High-Tensile Transmission Shaft Assemblies', quantity: 25, unitPrice: 10000, amount: 250000 }
    ],
    createdAt: Date.now() - 3600000
  }
];

export interface VoiceOption {
  id: string;
  name: string;
  role: string;
  category: string;
}

export const ELEVENLABS_VOICES: VoiceOption[] = [
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    role: 'Executive Deal Analyst',
    category: 'Financial Intelligence'
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    role: 'Institutional Underwriter',
    category: 'Risk Management'
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    role: 'Market Strategist',
    category: 'Consensus Dispatch'
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    role: 'Fraud Intelligence Desk',
    category: 'VeriShield Security'
  }
];
