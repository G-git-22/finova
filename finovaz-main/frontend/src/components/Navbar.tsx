import React from 'react';
import { UserRole } from '@finova/shared';

interface NavbarProps {
  userRole: UserRole;
  entityName: string;
  identifier: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  entityName,
  identifier,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchRole
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-surface-border px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('cockpit')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-purple flex items-center justify-center shadow-glow-accent">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider font-mono text-white flex items-center gap-1.5">
                FINOVA<span className="text-accent text-xs font-sans px-1.5 py-0.5 rounded bg-accent/10 border border-accent/30">ENGINE</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>VERISHIELD CONSENSUS: ONLINE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-surface p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'cockpit'
                ? 'bg-accent text-black font-semibold shadow-glow-accent'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {userRole === 'SUPPLIER' ? 'Supplier Cockpit' : 'Marketplace Radar'}
          </button>
          
          {userRole === 'LENDER' && (
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-accent text-black font-semibold shadow-glow-accent'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Portfolio Twin
            </button>
          )}

          <button
            onClick={() => setActiveTab('syndication')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'syndication'
                ? 'bg-accent text-black font-semibold shadow-glow-accent'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Syndication Vault
          </button>

          <button
            onClick={() => setActiveTab('chaos')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'chaos'
                ? 'bg-danger text-white font-semibold shadow-glow-danger'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chaos Sandbox
          </button>
        </div>

        {/* Profile & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchRole}
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-accent px-3 py-1.5 rounded-lg border border-surface-border hover:border-accent/40 bg-surface/60 transition-colors"
            title="Switch dual-role perspective"
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Switch Role ({userRole === 'SUPPLIER' ? 'Lender' : 'Supplier'})</span>
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface/80 border border-surface-border">
            <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center font-mono text-xs font-bold text-accent">
              {entityName.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white truncate max-w-[140px]">{entityName}</div>
              <div className="text-[10px] font-mono text-slate-400">{identifier}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl border border-surface-border hover:border-danger/50 text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
