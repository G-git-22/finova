import React, { useState } from 'react';
import { UserRole } from '@finova/shared';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; role: UserRole; entity_name: string; identifier: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [roleType, setRoleType] = useState<UserRole>('SUPPLIER');
  const [email, setEmail] = useState<string>('alpha@supplier.com');
  const [password, setPassword] = useState<string>('demo123');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleRoleChange = (newRole: UserRole) => {
    setRoleType(newRole);
    setErrorMessage('');
    if (newRole === 'SUPPLIER') {
      setEmail('alpha@supplier.com');
    } else {
      setEmail('apex@lender.com');
    }
  };

  const handleQuickFill = (accEmail: string, role: UserRole) => {
    setRoleType(role);
    setEmail(accEmail);
    setPassword('demo123');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, roleType })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem('FINOVA_AUTH_TOKEN', data.token);
        localStorage.setItem('FINOVA_USER_DATA', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.message || 'Authentication failed. Check credentials.');
      }
    } catch (err) {
      setErrorMessage('Could not connect to FINOVA financial engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative">
      
      <div className="max-w-md w-full glass-panel-glow rounded-3xl p-8 border border-surface-border relative z-10 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-purple mx-auto flex items-center justify-center shadow-glow-accent mb-3">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wider">FINOVA PORTAL</h1>
          <p className="text-xs text-slate-400 mt-1">Institutional Supply Chain Liquidity Network</p>
        </div>

        {/* Dual-Role Selector */}
        <div className="grid grid-cols-2 gap-2 bg-surface p-1.5 rounded-2xl border border-surface-border mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('SUPPLIER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              roleType === 'SUPPLIER'
                ? 'bg-accent text-black shadow-glow-accent'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Supplier</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('LENDER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              roleType === 'LENDER'
                ? 'bg-accent text-black shadow-glow-accent'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Capital Provider</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Work Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface/90 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Master Key / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface/90 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors font-mono"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Default demo password: demo123</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-black font-bold text-xs shadow-glow-accent hover:bg-accent-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : `Enter as ${roleType === 'SUPPLIER' ? 'Supplier' : 'Lender'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="mt-6 pt-5 border-t border-surface-border">
          <div className="text-[11px] font-mono text-slate-400 mb-2">QUICK DEMO ACCOUNTS:</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('alpha@supplier.com', 'SUPPLIER')}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-surface border border-surface-border hover:border-accent/40 text-slate-300 transition-colors"
            >
              Alpha Supplier
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('apex@lender.com', 'LENDER')}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-surface border border-surface-border hover:border-accent/40 text-slate-300 transition-colors"
            >
              Apex Bank
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('stride@lender.com', 'LENDER')}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-surface border border-surface-border hover:border-accent/40 text-slate-300 transition-colors"
            >
              Stride NBFC
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('harbor@lender.com', 'LENDER')}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-surface border border-surface-border hover:border-accent/40 text-slate-300 transition-colors"
            >
              Harbor Fund
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
