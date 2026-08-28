import { SyndicationPlan } from '@finova/shared';

export class SyndicationModule {
  /**
   * Calculates waterfall risk tranches and blended APR for large invoices (e.g. ₹50L)
   * Splits into Senior (60%), Mezzanine (30%), and Retention / Equity (10%)
   */
  public static calculateTranches(
    invoiceAmount: number,
    seniorRate: number = 8.5,
    mezzanineRate: number = 11.5
  ): SyndicationPlan {
    const totalAmount = Number(invoiceAmount) || 5000000;

    const seniorAmount = Math.round(totalAmount * 0.60);
    const mezzanineAmount = Math.round(totalAmount * 0.30);
    const retentionAmount = Math.round(totalAmount * 0.10);

    const totalFinanced = seniorAmount + mezzanineAmount;

    // Blended APR = (0.60 * seniorRate) + (0.30 * mezzanineRate) + (0.10 * 0)
    const blendedAPR = Number(((0.60 * seniorRate) + (0.30 * mezzanineRate)).toFixed(2));

    return {
      success: true,
      totalInvoiceAmount: totalAmount,
      tranches: {
        senior: {
          share: '60%',
          amount: seniorAmount,
          rate: seniorRate,
          riskLevel: 'Low (First Lien Asset-Backed)'
        },
        mezzanine: {
          share: '30%',
          amount: mezzanineAmount,
          rate: mezzanineRate,
          riskLevel: 'Medium (Subordinated High-Yield)'
        },
        retention: {
          share: '10%',
          amount: retentionAmount,
          rate: 0,
          riskLevel: 'Supplier First-Loss Skin-in-the-game'
        }
      },
      totalFinancedAmount: totalFinanced,
      blendedAPR
    };
  }
}
