import React from 'react';
import { Award, TrendingUp, CheckCircle, Building2, BarChart2 } from 'lucide-react';

interface TrustGraphProps {
  score?: number;
  buyerName?: string;
  historicalSettlements?: number;
  volumeFinanced?: number;
}

export const TrustGraph: React.FC<TrustGraphProps> = ({
  score = 94,
  buyerName = 'Tata Motors Ltd',
  historicalSettlements = 18,
  volumeFinanced = 4250000
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* KPI 1: Trust Score */}
      <div className="glass-panel rounded-2xl p-5 border border-surface-border relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-400">FINOVA TRUST SCORE</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Tier-A
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-mono text-white">{score}</span>
          <span className="text-sm font-mono text-slate-500">/ 100</span>
        </div>
        <div className="mt-3 w-full bg-surface rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-400 h-full rounded-full shadow-glow-success" style={{ width: `${score}%` }}></div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>Zero defaults across 24-month trading history</span>
        </p>
      </div>

      {/* KPI 2: Counterparty Credibility */}
      <div className="glass-panel rounded-2xl p-5 border border-surface-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-400">BUYER CREDIBILITY</span>
          <Award className="w-4 h-4 text-accent" />
        </div>
        <div className="text-lg font-bold text-white truncate">{buyerName}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-accent font-mono font-medium">AAA+ Corporate Rating</span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-xs text-slate-400">98.8% on-time</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          <Building2 className="w-3 h-3 text-accent" />
          <span>Automated ERP webhook reconciliation active</span>
        </p>
      </div>

      {/* KPI 3: Lifetime Volume */}
      <div className="glass-panel rounded-2xl p-5 border border-surface-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-400">TRACK RECORD</span>
          <TrendingUp className="w-4 h-4 text-purple" />
        </div>
        <div className="text-2xl font-bold font-mono text-white">
          ₹{(volumeFinanced).toLocaleString('en-IN')}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-mono text-purple">{historicalSettlements} Invoices</span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-xs text-slate-400">Avg Tenor 38D</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          <BarChart2 className="w-3 h-3 text-purple" />
          <span>Optimal pricing eligible (Spread &lt; 9.5% APR)</span>
        </p>
      </div>

    </div>
  );
};
