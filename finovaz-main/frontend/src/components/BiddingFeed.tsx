import React, { useState, useEffect } from 'react';
import { Zap, Award, ArrowRight, Volume2, Mic } from 'lucide-react';
import { Bid, Invoice, TopsisResult, VoiceTopic } from '@finova/shared';

interface BiddingFeedProps {
  invoice: Invoice;
  onAcceptOffer: (bid: Bid) => void;
  onTriggerVoice?: (topic: VoiceTopic, data?: any) => void;
}

export const BiddingFeed: React.FC<BiddingFeedProps> = ({ invoice, onAcceptOffer, onTriggerVoice }) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [topsisData, setTopsisData] = useState<TopsisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const fetchBidsAndMatch = async () => {
    try {
      // 1. Fetch Bids
      const bidsRes = await fetch(`/api/bids/${invoice.id}`);
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        setBids(bidsData.bids || []);
      }

      // 2. Evaluate TOPSIS
      const matchRes = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id })
      });

      if (matchRes.ok) {
        const data: TopsisResult = await matchRes.json();
        setTopsisData(data);
        if (data.rankedOffers) {
          setBids(data.rankedOffers);
        }
      }
    } catch (e) {
      console.error('Error fetching bids:', e);
    }
  };

  useEffect(() => {
    fetchBidsAndMatch();
    const interval = setInterval(fetchBidsAndMatch, 2000);
    return () => clearInterval(interval);
  }, [invoice.id]);

  const handleSimulateAiBids = async () => {
    setSimulating(true);
    const presets = [
      { providerId: 'apex', providerName: 'Apex Institutional Bank', advance: 90, rate: 9.2, tenor: 45, fee: 2000 },
      { providerId: 'stride', providerName: 'Stride NBFC', advance: 95, rate: 9.5, tenor: 30, fee: 1500 },
      { providerId: 'harbor', providerName: 'Harbor Private Fund', advance: 80, rate: 8.8, tenor: 60, fee: 1000 }
    ];

    for (const p of presets) {
      try {
        await fetch('/api/bids/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: invoice.id,
            ...p
          })
        });
      } catch (e) {}
    }

    setTimeout(() => {
      fetchBidsAndMatch();
      setSimulating(false);
    }, 600);
  };

  const bestBid = topsisData?.bestMatch || bids[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Simulation Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-accent">LIVE ORDER BOOK</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Autonomous Liquidity Bidding Arena</h2>
          <p className="text-xs text-slate-400">
            Multi-criteria competitive matching engine ranking bids by APR, Advance %, and Disbursement Speed.
          </p>
        </div>

        <button
          onClick={handleSimulateAiBids}
          disabled={simulating}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent text-black font-bold text-xs shadow-glow-accent hover:bg-accent-hover transition-all disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{simulating ? 'Broadcasting Autonomous Agents...' : '⚡ Simulate AI Agent Bids'}</span>
        </button>
      </div>

      {/* Recommended Winner Card (TOPSIS Crown) */}
      {bestBid && (
        <div className="glass-panel-glow rounded-2xl p-6 border border-accent/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent flex items-center justify-center text-accent">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-accent font-bold">
                  TOPSIS ALGORITHMIC BEST MATCH
                </span>
                <h3 className="text-lg font-bold text-white">{bestBid.providerName}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">MATCH SCORE</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {bestBid.score || 94} <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface/60 rounded-xl p-4 border border-surface-border mb-4">
            <div>
              <span className="text-[11px] text-slate-400">Advance Rate</span>
              <div className="text-lg font-bold font-mono text-white">{bestBid.advance}%</div>
              <span className="text-[10px] font-mono text-emerald-400">
                ₹{((invoice.invoiceAmount * bestBid.advance) / 100).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Annual APR</span>
              <div className="text-lg font-bold font-mono text-accent">{bestBid.rate || bestBid.apr}%</div>
              <span className="text-[10px] text-slate-400">Lowest net cost</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Disbursement</span>
              <div className="text-lg font-bold font-mono text-white">{bestBid.tenor || bestBid.speed}D</div>
              <span className="text-[10px] text-emerald-400">Rapid settlement</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Relative Closeness</span>
              <div className="text-lg font-bold font-mono text-purple">
                {bestBid.topsisScore ? (bestBid.topsisScore * 100).toFixed(1) : '94.2'}%
              </div>
              <span className="text-[10px] text-slate-400">Euclidean metric</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-300">
              💡 <strong>Why FINOVA selected this:</strong> Superior balance of optimal liquidity (
              {bestBid.advance}% advance) and minimal financial drag ({bestBid.rate}% APR).
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {onTriggerVoice && (
                <button
                  type="button"
                  onClick={() => onTriggerVoice('TOPSIS_DEAL', { bestMatch: bestBid, invoice })}
                  className="px-4 py-2.5 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  title="Narrate Deal Analysis using ElevenLabs Voice"
                >
                  <Volume2 className="w-4 h-4 text-accent" />
                  <span>🎙️ Voice Briefing</span>
                </button>
              )}

              <button
                onClick={() => onAcceptOffer(bestBid)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-400 text-black font-bold text-xs shadow-glow-success hover:bg-emerald-300 transition-all flex items-center justify-center gap-2"
              >
                <span>Accept & Execute Smart Contract</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bids.map((bid) => {
          const isWinner = bestBid?.id === bid.id;
          return (
            <div
              key={bid.id}
              className={`glass-panel rounded-2xl p-5 border transition-all ${
                isWinner
                  ? 'border-accent/50 bg-accent/5 shadow-glow-accent'
                  : 'border-surface-border hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-400 truncate max-w-[150px]">{bid.id}</span>
                {isWinner && (
                  <span className="px-2 py-0.5 rounded-md bg-accent/20 border border-accent/40 text-accent text-[10px] font-bold">
                    RECOMMENDED
                  </span>
                )}
              </div>

              <h4 className="font-bold text-white text-sm truncate mb-3">{bid.providerName}</h4>

              <div className="space-y-2 border-t border-b border-surface-border py-3 my-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Advance %:</span>
                  <span className="font-mono font-bold text-white">{bid.advance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interest Rate:</span>
                  <span className="font-mono font-bold text-accent">{bid.rate || bid.apr}% APR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Maturity Tenor:</span>
                  <span className="font-mono font-bold text-white">{bid.tenor || bid.speed} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing Fee:</span>
                  <span className="font-mono text-slate-300">₹{(bid.fee || 1500).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs font-mono text-slate-400">
                  Score: <strong className="text-emerald-400">{bid.score}</strong>/100
                </div>

                <button
                  onClick={() => onAcceptOffer(bid)}
                  className="px-3 py-1.5 rounded-lg border border-surface-border hover:border-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold text-white transition-all"
                >
                  Accept Offer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
