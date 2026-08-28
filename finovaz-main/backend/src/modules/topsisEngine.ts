import { Bid, TopsisResult, TopsisWeights } from '@finova/shared';

export class TopsisEngine {
  private static DEFAULT_WEIGHTS: TopsisWeights = {
    rate: 0.45,   // Cost criterion (lower is better)
    advance: 0.35, // Benefit criterion (higher is better)
    tenor: 0.20   // Cost criterion (faster is better)
  };

  /**
   * Evaluates candidate financing bids using the TOPSIS algorithm
   * (Technique for Order of Preference by Similarity to Ideal Solution)
   */
  public static evaluate(bids: Bid[], customWeights?: Partial<TopsisWeights>): TopsisResult {
    if (!bids || bids.length === 0) {
      throw new Error('No candidate bids provided for TOPSIS evaluation');
    }

    const weights: TopsisWeights = {
      ...TopsisEngine.DEFAULT_WEIGHTS,
      ...(customWeights || {})
    };

    // Step 1: Calculate vector normalization factors (sum of squares)
    const normRate = Math.sqrt(bids.reduce((acc, b) => acc + Math.pow(b.rate || b.apr || 9.0, 2), 0)) || 1;
    const normAdv = Math.sqrt(bids.reduce((acc, b) => acc + Math.pow(b.advance || 90, 2), 0)) || 1;
    const normTenor = Math.sqrt(bids.reduce((acc, b) => acc + Math.pow(b.tenor || b.speed || 30, 2), 0)) || 1;

    // Step 2: Calculate weighted normalized decision matrix
    const matrix = bids.map(bid => {
      const rateVal = bid.rate || bid.apr || 9.0;
      const advVal = bid.advance || 90;
      const tenorVal = bid.tenor || bid.speed || 30;

      return {
        bid,
        vRate: (rateVal / normRate) * weights.rate,
        vAdv: (advVal / normAdv) * weights.advance,
        vTenor: (tenorVal / normTenor) * weights.tenor
      };
    });

    // Step 3: Determine Ideal Best (A*) and Ideal Worst (A-) solutions
    // Rate: Cost (Minimize) -> best = min, worst = max
    // Advance: Benefit (Maximize) -> best = max, worst = min
    // Tenor: Cost (Minimize) -> best = min, worst = max
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

    // Step 4: Calculate Euclidean distances and Relative Closeness (Ci*)
    const rankedOffers: Bid[] = matrix.map(item => {
      const distBest = Math.sqrt(
        Math.pow(item.vRate - idealBest.vRate, 2) +
        Math.pow(item.vAdv - idealBest.vAdv, 2) +
        Math.pow(item.vTenor - idealBest.vTenor, 2)
      );

      const distWorst = Math.sqrt(
        Math.pow(item.vRate - idealWorst.vRate, 2) +
        Math.pow(item.vAdv - idealWorst.vAdv, 2) +
        Math.pow(item.vTenor - idealWorst.vTenor, 2)
      );

      const totalDist = distBest + distWorst;
      const topsisScore = totalDist === 0 ? 0.5 : distWorst / totalDist;
      const scaledScore = Math.min(99, Math.max(70, Math.round(topsisScore * 100)));

      return {
        ...item.bid,
        topsisScore: Number(topsisScore.toFixed(4)),
        score: scaledScore
      };
    }).sort((a, b) => (b.topsisScore || 0) - (a.topsisScore || 0));

    return {
      success: true,
      algorithm: 'TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)',
      bestMatch: rankedOffers[0],
      rankedOffers
    };
  }
}
