import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Activity, Volume2 } from 'lucide-react';
import { CapitalProvider, VoiceTopic } from '@finova/shared';

interface PortfolioTwinProps {
  onTriggerVoice?: (topic: VoiceTopic, data?: any) => void;
}

export const PortfolioTwin: React.FC<PortfolioTwinProps> = ({ onTriggerVoice }) => {
  const [providers, setProviders] = useState<CapitalProvider[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [totalDeployed, setTotalDeployed] = useState<number>(0);
  const [totalLiquidity, setTotalLiquidity] = useState<number>(0);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/portfolio');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
        setAuditLogs(data.auditLogs || []);
        setTotalDeployed(data.totalDeployedCapital || 0);
        setTotalLiquidity(data.totalAvailableLiquidity || 0);
      }
    } catch (e) {
      console.error('Analytics fetch error:', e);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Executive Briefing Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-surface-border">
        <div>
          <span className="text-xs font-mono text-accent">PORTFOLIO DIGITAL TWIN</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Live Capital Deployment & Counterparty Exposure</h2>
          <p className="text-xs text-slate-400">Continuous liquidity monitoring across institutional lender vaults</p>
        </div>

        {onTriggerVoice && (
          <button
            onClick={() => onTriggerVoice('PORTFOLIO_BRIEFING', { totalDeployedCapital: totalDeployed, totalAvailableLiquidity: totalLiquidity })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent font-mono text-xs font-semibold shadow-sm transition-all"
          >
            <Volume2 className="w-4 h-4 text-accent animate-pulse" />
            <span>🎙️ Hear Executive Morning Brief</span>
          </button>
        )}
      </div>

      {/* Overview KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>TOTAL LIQUIDITY POOL</span>
            <Landmark className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ₹{totalLiquidity.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Available across 3 verified capital vaults</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>DEPLOYED CAPITAL</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ₹{totalDeployed.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Earning live blended yield of 9.2% APR</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>PORTFOLIO HEALTH</span>
            <Activity className="w-4 h-4 text-purple" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            99.2% <span className="text-xs text-slate-500 font-sans">Performing</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Zero non-performing assets (NPAs)</p>
        </div>
      </div>

      {/* Institutional Capital Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => {
          const utilization = Math.round((p.deployedCapital / (p.deployedCapital + p.liquidity)) * 100) || 0;
          return (
            <div key={p.id} className="glass-panel rounded-2xl p-5 border border-surface-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{p.type}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent">
                  {p.riskAppetite}
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-b border-surface-border py-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Available Vault:</span>
                  <span className="font-mono font-bold text-white">₹{p.liquidity.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deployed Assets:</span>
                  <span className="font-mono font-bold text-emerald-400">₹{p.deployedCapital.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Deals:</span>
                  <span className="font-mono text-slate-300">{p.activeDeals} Structured Invoices</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Vault Utilization</span>
                  <span>{utilization}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                  <div className="bg-accent h-full rounded-full" style={{ width: `${utilization}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Audit Event Log */}
      <div className="glass-panel rounded-2xl p-5 border border-surface-border">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
          FINOVA Immutable Audit Trail
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs text-slate-400">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface/50 border border-surface-border">
              <span className="text-accent font-semibold">{log.action}</span>
              <span className="truncate max-w-[300px] text-slate-300">{JSON.stringify(log.metadata)}</span>
              <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
