import React, { useState } from 'react';
import { Flame, AlertOctagon, ShieldCheck, Activity, Zap, Volume2 } from 'lucide-react';
import { ChaosEvent, ChaosResult, VoiceTopic } from '@finova/shared';

interface ChaosSandboxProps {
  onTriggerVoice?: (topic: VoiceTopic, data?: any) => void;
}

export const ChaosSandbox: React.FC<ChaosSandboxProps> = ({ onTriggerVoice }) => {
  const [intensity, setIntensity] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ChaosResult | null>(null);

  const triggerChaos = async (type: ChaosEvent['type']) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chaos/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          intensity
        })
      });
      if (res.ok) {
        const data: ChaosResult = await res.json();
        setLastResult(data);
      }
    } catch (e) {
      console.error('Chaos error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-danger/40 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-danger/10 border border-danger/30 text-danger shadow-glow-danger">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Chaos Sandbox & System Stress Simulator</h3>
            <p className="text-xs text-slate-400">
              Inject adversarial macroeconomic shocks, delinquency delays, and forged collision attacks
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-danger/20 text-danger border border-danger/30 animate-pulse">
          ADVERSARIAL LAB
        </span>
      </div>

      {/* Intensity Slider */}
      <div className="bg-surface/60 p-4 rounded-xl border border-surface-border space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 font-mono">STRESS TEST SEVERITY:</span>
          <span className="font-bold font-mono text-danger">{intensity}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="90"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-danger bg-surface cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Mild Market Tremor (10%)</span>
          <span>Black Swan Systemic Freeze (90%)</span>
        </div>
      </div>

      {/* Trigger Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => triggerChaos('LIQUIDITY_SHOCK')}
          disabled={loading}
          className="p-4 rounded-xl bg-surface hover:bg-danger/10 border border-surface-border hover:border-danger/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertOctagon className="w-5 h-5 text-danger group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-slate-500">RUN TEST</span>
          </div>
          <div className="font-bold text-white text-sm">Liquidity Freeze</div>
          <p className="text-[11px] text-slate-400 mt-1">Sudden withdrawal of interbank credit lines</p>
        </button>

        <button
          onClick={() => triggerChaos('DUPLICATE_INJECTION')}
          disabled={loading}
          className="p-4 rounded-xl bg-surface hover:bg-danger/10 border border-surface-border hover:border-danger/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <ShieldCheck className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-slate-500">RUN TEST</span>
          </div>
          <div className="font-bold text-white text-sm">Duplicate Attack</div>
          <p className="text-[11px] text-slate-400 mt-1">Inject duplicate invoice hash into registry</p>
        </button>

        <button
          onClick={() => triggerChaos('TENOR_DELAY')}
          disabled={loading}
          className="p-4 rounded-xl bg-surface hover:bg-danger/10 border border-surface-border hover:border-danger/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-warning group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-slate-500">RUN TEST</span>
          </div>
          <div className="font-bold text-white text-sm">Supply Chain Delay</div>
          <p className="text-[11px] text-slate-400 mt-1">Simulate 30-day extended settlement delay</p>
        </button>

        <button
          onClick={() => triggerChaos('RATE_HIKE')}
          disabled={loading}
          className="p-4 rounded-xl bg-surface hover:bg-danger/10 border border-surface-border hover:border-danger/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-purple group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-slate-500">RUN TEST</span>
          </div>
          <div className="font-bold text-white text-sm">Rate Spike</div>
          <p className="text-[11px] text-slate-400 mt-1">Simulate aggressive benchmark interest rate hike</p>
        </button>
      </div>

      {/* Output Simulation Log */}
      {lastResult && (
        <div className="p-4 rounded-xl bg-black/60 border border-danger/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-danger font-bold">CHAOS INJECTION REPORT: {lastResult.eventType}</span>
            <div className="flex items-center gap-2">
              {onTriggerVoice && (
                <button
                  onClick={() => onTriggerVoice('CHAOS_REPORT', lastResult)}
                  className="px-2.5 py-1 rounded bg-danger/20 hover:bg-danger/30 text-danger text-[11px] font-mono flex items-center gap-1 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🎙️ Voice Verdict</span>
                </button>
              )}
              <span className="text-emerald-400">Resilience Score: {lastResult.impactMetrics.systemResilienceScore}/100</span>
            </div>
          </div>
          <p className="text-slate-300">{lastResult.description}</p>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-border text-[11px]">
            <div>
              <span className="text-slate-500">Liquidity Impact:</span>
              <div className="text-white">₹{lastResult.impactMetrics.liquidityReduction.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <span className="text-slate-500">Delinquency Risk:</span>
              <div className="text-warning">{lastResult.impactMetrics.delinquencyRisk}%</div>
            </div>
            <div>
              <span className="text-slate-500">Consensus Status:</span>
              <div className="text-emerald-400">AUTO-HEALED</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
