import { Bid, CapitalProvider, Invoice, User, DEFAULT_PROVIDERS, DEMO_USERS, INITIAL_INVOICES, KNOWN_DUPLICATE_HASH } from '@finova/shared';

export class MemoryStore {
  private static instance: MemoryStore;

  public users: User[] = [...DEMO_USERS];
  public invoices: Invoice[] = [...INITIAL_INVOICES];
  public bids: Bid[] = [
    {
      id: 'OFF-BANK-101',
      requestId: 'INV-1042',
      invoiceId: 'INV-1042',
      providerId: 'apex',
      providerName: 'Apex Institutional Bank',
      advance: 90,
      rate: 9.2,
      apr: 9.2,
      tenor: 45,
      speed: 45,
      fee: 2000,
      score: 93,
      topsisScore: 0.88,
      status: 'SUBMITTED',
      createdAt: Date.now() - 1800000
    },
    {
      id: 'OFF-NBFC-102',
      requestId: 'INV-1042',
      invoiceId: 'INV-1042',
      providerId: 'stride',
      providerName: 'Stride NBFC',
      advance: 95,
      rate: 9.5,
      apr: 9.5,
      tenor: 30,
      speed: 30,
      fee: 1500,
      score: 97,
      topsisScore: 0.94,
      status: 'SUBMITTED',
      createdAt: Date.now() - 900000
    },
    {
      id: 'OFF-FUND-103',
      requestId: 'INV-1042',
      invoiceId: 'INV-1042',
      providerId: 'harbor',
      providerName: 'Harbor Private Fund',
      advance: 80,
      rate: 8.8,
      apr: 8.8,
      tenor: 60,
      speed: 60,
      fee: 1000,
      score: 82,
      topsisScore: 0.65,
      status: 'SUBMITTED',
      createdAt: Date.now() - 300000
    }
  ];
  public providers: CapitalProvider[] = [...DEFAULT_PROVIDERS];
  public existingHashes: Set<string> = new Set([KNOWN_DUPLICATE_HASH]);
  public financings: Record<string, { offerId: string; providerId: string; amount: number; settledAt: number }> = {};
  public auditLogs: Array<{ timestamp: number; action: string; metadata: any }> = [];

  private constructor() {
    this.log('INIT', 'Memory store initialized with seeded demo state');
  }

  public static getInstance(): MemoryStore {
    if (!MemoryStore.instance) {
      MemoryStore.instance = new MemoryStore();
    }
    return MemoryStore.instance;
  }

  public log(action: string, metadata: any) {
    this.auditLogs.unshift({
      timestamp: Date.now(),
      action,
      metadata
    });
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  public getInvoice(id: string): Invoice | undefined {
    return this.invoices.find(i => i.id === id);
  }

  public upsertInvoice(invoice: Invoice) {
    const idx = this.invoices.findIndex(i => i.id === invoice.id);
    if (idx >= 0) {
      this.invoices[idx] = invoice;
    } else {
      this.invoices.push(invoice);
    }
    this.log('INVOICE_UPSERT', { id: invoice.id, amount: invoice.invoiceAmount });
  }

  public addBid(bid: Bid) {
    this.bids.push(bid);
    this.log('BID_SUBMITTED', { id: bid.id, provider: bid.providerName, rate: bid.rate });
  }

  public getBidsForInvoice(invoiceId: string): Bid[] {
    return this.bids.filter(b => b.requestId === invoiceId || b.invoiceId === invoiceId);
  }

  public acceptBid(invoiceId: string, offerId: string): boolean {
    const invoice = this.getInvoice(invoiceId);
    const bid = this.bids.find(b => b.id === offerId);
    if (!invoice || !bid) return false;

    invoice.status = 'FUNDED';
    bid.status = 'ACCEPTED';

    this.bids.filter(b => (b.requestId === invoiceId || b.invoiceId === invoiceId) && b.id !== offerId)
      .forEach(b => { b.status = 'REJECTED'; });

    this.financings[invoiceId] = {
      offerId,
      providerId: bid.providerId,
      amount: Math.round(invoice.invoiceAmount * (bid.advance / 100)),
      settledAt: Date.now()
    };

    const prov = this.providers.find(p => p.id === bid.providerId);
    if (prov) {
      prov.liquidity = Math.max(0, prov.liquidity - this.financings[invoiceId].amount);
      prov.deployedCapital += this.financings[invoiceId].amount;
      prov.activeDeals += 1;
    }

    this.log('FINANCING_SETTLED', { invoiceId, offerId, providerId: bid.providerId });
    return true;
  }
}
