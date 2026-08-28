import React, { useState } from 'react';
import { Sliders, Calculator, DollarSign, ArrowRight } from 'lucide-react';

interface WhatIfSliderProps {
  invoiceAmount?: number;
}

export const WhatIfSlider: React.FC<WhatIfSliderProps> = ({ invoiceAmount = 850000 }) => {
  const [advance, setAdvance] = useState<number>(90);
  const [rate, setRate] = useState<number>(9.2);
  const [tenor, setTenor] = useState<number>(45);

  const financedPrincipal = Math.round((invoiceAmount * advance) / 100);
  const dailyInterest = (financedPrincipal * (rate / 100)) / 365;
  const totalInterestCost = Math.round(dailyInterest * tenor);
  const netSupplierDisbursement = financedPrincipal - 1500; // deducting processing fee

  return (
    <div className="glass-panel rounded-2xl p-6 border border-surface-border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-white text-base">What-If Liquidity & Cost Simulator</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Dynamic Risk Pricing</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Slider 1: Advance % */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Advance Liquidity:</span>
            <span className="font-mono font-bold text-accent">{advance}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="98"
            step="1"
            value={advance}
            onChange={(e) => setAdvance(Number(e.target.value))}
            className="w-full accent-accent bg-surface cursor-pointer"
          />
          <div className="text-[11px] font-mono text-slate-500 flex justify-between">
            <span>60% (Conservative)</span>
            <span>98% (Aggressive)</span>
          </div>
        </div>

        {/* Slider 2: APR % */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Interest Spread (APR):</span>
            <span className="font-mono font-bold text-purple">{rate}%</span>
          </div>
          <input
            type="range"
            min="7.5"
            max="14.0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-purple bg-surface cursor-pointer"
          />
          <div className="text-[11px] font-mono text-slate-500 flex justify-between">
            <span>7.5% (Prime Bank)</span>
            <span>14.0% (Sub-Prime)</span>
          </div>
        </div>

        {/* Slider 3: Tenor (Days) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Settlement Horizon:</span>
            <span className="font-mono font-bold text-emerald-400">{tenor} Days</span>
          </div>
          <input
            type="range"
            min="15"
            max="90"
            step="5"
            value={tenor}
            onChange={(e) => setTenor(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-surface cursor-pointer"
          />
          <div className="text-[11px] font-mono text-slate-500 flex justify-between">
            <span>15 Days</span>
            <span>90 Days</span>
          </div>
        </div>

      </div>

      {/* Instant Calculated Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-surface-border">
        <div className="p-3 rounded-xl bg-surface/80 border border-surface-border">
          <span className="text-[11px] text-slate-400">Immediate Liquidity Advance</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ₹{financedPrincipal.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface/80 border border-surface-border">
          <span className="text-[11px] text-slate-400">Total Financial Carry Cost</span>
          <div className="text-xl font-bold font-mono text-danger mt-1">
            ₹{totalInterestCost.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface/80 border border-surface-border">
          <span className="text-[11px] text-slate-400">Net Supplier Treasury Inflow</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ₹{netSupplierDisbursement.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};
