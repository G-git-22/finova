import { ChaosEvent, ChaosResult } from '@finova/shared';
import { MemoryStore } from '../state/memoryStore';

export class ChaosEngine {
  private store = MemoryStore.getInstance();

  /**
   * Simulates systemic macroeconomic or adversarial stress shocks
   */
  public simulate(event: ChaosEvent): ChaosResult {
    const { type, intensity = 50, targetProviderId } = event;

    switch (type) {
      case 'LIQUIDITY_SHOCK': {
        const factor = Math.max(0.1, 1 - intensity / 100);
        let totalReduction = 0;
        this.store.providers.forEach(p => {
          if (!targetProviderId || p.id === targetProviderId) {
            const oldLiq = p.liquidity;
            p.liquidity = Math.round(p.liquidity * factor);
            totalReduction += (oldLiq - p.liquidity);
          }
        });
        this.store.log('CHAOS_LIQUIDITY_SHOCK', { intensity, totalReduction });
        return {
          applied: true,
          eventType: 'LIQUIDITY_SHOCK',
          description: `Simulated a sudden ${intensity}% systemic capital freeze across liquidity pools.`,
          impactMetrics: {
            liquidityReduction: totalReduction,
            delinquencyRisk: Math.min(100, Math.round(intensity * 0.45)),
            systemResilienceScore: Math.max(10, 100 - Math.round(intensity * 0.7))
          }
        };
      }

      case 'DUPLICATE_INJECTION': {
        const testHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        this.store.existingHashes.add(testHash);
        this.store.log('CHAOS_DUPLICATE_INJECTION', { hash: testHash });
        return {
          applied: true,
          eventType: 'DUPLICATE_INJECTION',
          description: 'Injected a forged duplicate invoice hash into the cross-lender registry.',
          impactMetrics: {
            liquidityReduction: 0,
            delinquencyRisk: 95,
            systemResilienceScore: 98
          }
        };
      }

      case 'TENOR_DELAY': {
        this.store.invoices.forEach(inv => {
          inv.maximumTenor += Math.round(intensity * 0.5);
        });
        this.store.log('CHAOS_TENOR_DELAY', { intensity });
        return {
          applied: true,
          eventType: 'TENOR_DELAY',
          description: `Simulated a supply chain disruption delaying invoice maturities by ${Math.round(intensity * 0.5)} days.`,
          impactMetrics: {
            liquidityReduction: Math.round(intensity * 15000),
            delinquencyRisk: Math.min(100, Math.round(intensity * 0.6)),
            systemResilienceScore: Math.max(20, 100 - Math.round(intensity * 0.5))
          }
        };
      }

      case 'RATE_HIKE': {
        this.store.bids.forEach(b => {
          b.rate = Number((b.rate + (intensity * 0.05)).toFixed(2));
          if (b.apr) b.apr = b.rate;
        });
        this.store.log('CHAOS_RATE_HIKE', { intensity });
        return {
          applied: true,
          eventType: 'RATE_HIKE',
          description: `Simulated a central bank interest rate hike of +${(intensity * 0.05).toFixed(2)}% APR.`,
          impactMetrics: {
            liquidityReduction: 0,
            delinquencyRisk: Math.min(100, Math.round(intensity * 0.35)),
            systemResilienceScore: 85
          }
        };
      }

      default:
        return {
          applied: false,
          eventType: 'UNKNOWN',
          description: 'Unknown chaos scenario type.',
          impactMetrics: { liquidityReduction: 0, delinquencyRisk: 0, systemResilienceScore: 100 }
        };
    }
  }
}
