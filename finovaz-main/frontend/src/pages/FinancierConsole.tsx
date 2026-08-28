import React, { useState, useEffect } from 'react';
import { Zap, Send } from 'lucide-react';
import { Invoice } from '@finova/shared';

interface FinancierConsoleProps {
  providerName: string;
  identifier: string;
  liquidity: number;
}

export const FinancierConsole: React.FC<FinancierConsoleProps> = ({
  providerName,
  identifier,
  liquidity
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [advance, setAdvance] = useState<number>(92);
  const [apr, setApr] = useState<number>(9.1);
  const [speed, setSpeed] = useState<number>(30);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        if (data.invoices?.length > 0 && !selectedInvoice) {
          setSelectedInvoice(data.invoices[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching invoices:', e);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleBroadcastBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/bids/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          providerName,
          providerId: identifier.toLowerCase().includes('apex') ? 'apex' : identifier.toLowerCase().includes('stride') ? 'stride' : 'harbor',
          advance,
          apr,
          speed,
          rate: apr,
          tenor: speed,
          fee: 1500
        })
      });

      if (res.ok) {
        setToastMessage(`⚡ Bid Broadcasted: ${advance}% Advance @ ${apr}% APR!`);
        setTimeout(() => setToastMessage(''), 4000);
      }
    } catch (err) {
      console.error('Bid error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-glow-success flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-surface-border">
        <div>
          <span className="text-xs font-mono text-accent">INSTITUTIONAL CAPITAL CONSOLE</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{providerName}</h1>
          <p className="text-xs text-slate-400">Node ID: {identifier} | Direct Liquidity Underwriter</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400">AVAILABLE VAULT</span>
            <div className="text-xl font-bold font-mono text-accent">₹{liquidity.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Marketplace Invoices & Bidding Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Open Invoices Radar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Verified Marketplace Opportunities ({invoices.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live ERP Feed</span>
          </div>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`glass-panel rounded-2xl p-5 border transition-all cursor-pointer ${
                  selectedInvoice?.id === inv.id
                    ? 'border-accent bg-accent/5 shadow-glow-accent'
                    : 'border-surface-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-accent">{inv.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Tier-A (Score {inv.trustScore || 94})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{inv.settlementUrgency}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Supplier:</span>
                    <span className="text-white font-semibold truncate block">{inv.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Buyer:</span>
                    <span className="text-white font-semibold truncate block">{inv.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gross Invoice:</span>
                    <span className="text-white font-mono font-bold block">₹{inv.invoiceAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Funding Reqd:</span>
                    <span className="text-accent font-mono font-bold block">₹{inv.fundingRequired.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 truncate pt-2 border-t border-surface-border">
                  SHA-256: {inv.hash}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Broadcast Bid Form */}
        {selectedInvoice && (
          <div className="glass-panel-glow rounded-2xl p-6 border border-accent/40 space-y-5 h-fit">
            <div>
              <span className="text-xs font-mono text-accent">DIRECT UNDERWRITING TERMINAL</span>
              <h3 className="text-base font-bold text-white mt-1">Broadcast Bid for {selectedInvoice.id}</h3>
              <p className="text-xs text-slate-400">Buyer: {selectedInvoice.buyerName}</p>
            </div>

            <form onSubmit={handleBroadcastBid} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Advance %:</span>
                  <span className="font-mono font-bold text-white">{advance}%</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="98"
                  value={advance}
                  onChange={(e) => setAdvance(Number(e.target.value))}
                  className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Financing APR (%):</span>
                  <span className="font-mono font-bold text-accent">{apr}%</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="7.0"
                  max="16.0"
                  value={apr}
                  onChange={(e) => setApr(Number(e.target.value))}
                  className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Disbursement Speed (Days):</span>
                  <span className="font-mono font-bold text-white">{speed}D</span>
                </div>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface border border-surface-border text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Deployed Capital:</span>
                  <span className="text-white">₹{((selectedInvoice.invoiceAmount * advance) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Net Yield:</span>
                  <span className="text-emerald-400 font-bold">₹{Math.round(((selectedInvoice.invoiceAmount * advance) / 100) * (apr / 100) * (speed / 365)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-accent text-black font-bold text-xs shadow-glow-accent hover:bg-accent-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting Offer...' : 'Broadcast Competitive Bid'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
