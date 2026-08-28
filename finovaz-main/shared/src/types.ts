/**
 * FINOVA - Shared Domain Types, Math Contracts & Interfaces
 */

export type UserRole = 'SUPPLIER' | 'LENDER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  entityName: string;
  identifier: string;
  liquidity?: number;
  riskAppetite?: string;
  maxFinancing?: number;
  preferredTenor?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    email: string;
    role: UserRole;
    entity_name: string;
    identifier: string;
  };
  message?: string;
}

export type InvoiceStatus = 'PENDING' | 'VERIFIED' | 'REVIEW_REQUIRED' | 'OPEN FOR BIDS' | 'MATCHED' | 'FUNDED' | 'SETTLED';

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  supplierId: string;
  supplierName: string;
  buyerName: string;
  invoiceAmount: number;
  fundingRequired: number;
  minimumAdvance: number;
  maximumTenor: number;
  settlementUrgency: string;
  risk: 'Low' | 'Medium' | 'High';
  verificationStatus: 'Verified' | 'Review Required' | 'Uncertain';
  trustScore: number;
  hash: string;
  status: InvoiceStatus;
  lineItems?: LineItem[];
  createdAt: number;
}

export interface Bid {
  id: string;
  requestId: string;
  invoiceId?: string;
  providerId: string;
  providerName: string;
  advance: number; // e.g. 90 -> 90%
  rate: number; // APR % e.g. 9.2
  apr?: number;
  tenor: number; // days e.g. 30
  speed?: number;
  fee: number; // INR
  score: number; // match score (0-100)
  topsisScore?: number; // relative closeness (0-1)
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  createdAt: number;
}

export interface CapitalProvider {
  id: string;
  name: string;
  type: string;
  liquidity: number;
  maxAdvance: number;
  riskAppetite: 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High';
  deployedCapital: number;
  activeDeals: number;
  preferredTenor: string;
}

export interface VerificationRequest {
  invoiceId?: string;
  amount?: number;
  invoiceAmount?: number;
  hash: string;
  supplierId?: string;
  buyerName?: string;
  lineItems?: LineItem[];
}

export interface VerificationResult {
  status: 'VERIFIED' | 'REVIEW_REQUIRED' | 'UNCERTAIN';
  code?: number;
  reason?: string;
  message: string;
  details?: {
    hash?: string;
    flag?: string;
    actionRequired?: string;
    buyerName?: string;
    lineItemTotal?: number;
    invoiceAmount?: number;
  };
  invoice?: Invoice;
}

export interface TopsisWeights {
  rate: number; // Cost (minimize)
  advance: number; // Benefit (maximize)
  tenor: number; // Cost (minimize)
}

export interface TopsisResult {
  success: boolean;
  algorithm: string;
  bestMatch: Bid;
  rankedOffers: Bid[];
}

export interface Tranche {
  share: string;
  amount: number;
  rate: number;
  riskLevel: string;
}

export interface SyndicationPlan {
  success: boolean;
  totalInvoiceAmount: number;
  tranches: {
    senior: Tranche;
    mezzanine: Tranche;
    retention: Tranche;
  };
  totalFinancedAmount: number;
  blendedAPR: number;
}

export interface ChaosEvent {
  type: 'LIQUIDITY_SHOCK' | 'DUPLICATE_INJECTION' | 'TENOR_DELAY' | 'RATE_HIKE';
  intensity: number; // 0-100
  targetProviderId?: string;
}

export interface ChaosResult {
  applied: boolean;
  eventType: string;
  description: string;
  impactMetrics: {
    liquidityReduction: number;
    delinquencyRisk: number;
    systemResilienceScore: number;
  };
}
