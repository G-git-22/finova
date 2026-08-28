import React, { useState, useEffect } from 'react';
import { SyndicationPlan } from '@finova/shared';

interface SyndicationBarProps {
  invoiceAmount?: number;
}

export const SyndicationBar: React.FC<SyndicationBarProps> = ({ invoiceAmount = 5000000 }) => {
  const [seniorRate, setSeniorRate] = useState<number>(8.5);
  const [mezzanineRate, setMezzanineRate] = useState<number>(11.5);
  const [plan, setPlan] = useState<SyndicationPlan | null>(null);

  const fetchSyndication = async () => {
    try {
      const res = await fetch('/api/syndicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceAmount,
          seniorRate,
          mezzanineRate
        })
      });
      if (res.ok) {
        const data: SyndicationPlan = await res.json();
        setPlan(data);
      }
    } catch (e) {
      console.error('Syndication error:', e);
    }
  };

  useEffect(() => {
    fetchSyndication();
  }, [invoiceAmount, seniorRate, mezzanineRate]);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-surface-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple/10 border border-purple/30 text-purple">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Multi-Tier Syndication Waterfall</h3>
            <p className="text-xs text-slate-400">
              Co-financing structured risk tranches for large-ticket supply chain assets
            </p>
          </div>
        </div>

        {plan && (
          <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-surface-border">
            <span className="text-xs text-slate-400 font-mono">BLENDED APR:</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{plan.blendedAPR}%</span>
          </div>
        )}
      </div>

      {/* Visual Tranche Bar */}
      <div className="space-y-2">
        <div className="w-full h-8 rounded-xl overflow-hidden flex border border-surface-border p-1 bg-surface gap-1">
          {/* Senior Tranche 60% */}
          <div
            style={{ width: '60%' }}
            className="h-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-[11px] font-mono font-bold text-white shadow-sm"
            title="Senior Tranche (60%)"
          >
            Senior 60%
          </div>

          {/* Mezzanine Tranche 30% */}
          <div
            style={{ width: '30%' }}
            className="h-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-[11px] font-mono font-bold text-white shadow-sm"
            title="Mezzanine Tranche (30%)"
          >
            Mezz 30%
          </div>

          {/* Retention Tranche 10% */}
          <div
            style={{ width: '10%' }}
            className="h-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-[11px] font-mono font-bold text-white shadow-sm"
            title="Retention Equity (10%)"
          >
            10%
          </div>
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="text-cyan-400">● Senior: ₹{((invoiceAmount * 0.6)).toLocaleString('en-IN')}</span>
          <span className="text-purple-400">● Mezzanine: ₹{((invoiceAmount * 0.3)).toLocaleString('en-IN')}</span>
          <span className="text-amber-400">● Retention: ₹{((invoiceAmount * 0.1)).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Tranche Configuration Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Senior */}
        <div className="p-4 rounded-xl bg-surface/70 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Senior Tranche
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              Low Risk
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            ₹{(invoiceAmount * 0.6).toLocaleString('en-IN')}
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Target APR:</span>
            <input
              type="number"
              step="0.1"
              value={seniorRate}
              onChange={(e) => setSeniorRate(Number(e.target.value))}
              className="w-16 bg-black/40 border border-surface-border text-right px-2 py-0.5 rounded font-mono text-cyan-400"
            />
          </div>
          <p className="text-[10px] text-slate-400">First-priority liquidation claim on buyer receivables.</p>
        </div>

        {/* Mezzanine */}
        <div className="p-4 rounded-xl bg-surface/70 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Mezzanine Tranche
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
              High Yield
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            ₹{(invoiceAmount * 0.3).toLocaleString('en-IN')}
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Target APR:</span>
            <input
              type="number"
              step="0.1"
              value={mezzanineRate}
              onChange={(e) => setMezzanineRate(Number(e.target.value))}
              className="w-16 bg-black/40 border border-surface-border text-right px-2 py-0.5 rounded font-mono text-purple-400"
            />
          </div>
          <p className="text-[10px] text-slate-400">Subordinated risk position providing yield enhancement.</p>
        </div>

        {/* Retention */}
        <div className="p-4 rounded-xl bg-surface/70 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Retention Equity
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              0% Carry
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-white">
            ₹{(invoiceAmount * 0.1).toLocaleString('en-IN')}
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">First-Loss Skin:</span>
            <span className="font-mono text-amber-400 font-bold">10.0%</span>
          </div>
          <p className="text-[10px] text-slate-400">Supplier skin-in-the-game aligning counterparty incentives.</p>
        </div>

      </div>
    </div>
  );
};
