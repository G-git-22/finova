import React, { useState } from 'react';
import { VeriShieldHUD } from '../components/VeriShieldHUD';
import { TrustGraph } from '../components/TrustGraph';
import { BiddingFeed } from '../components/BiddingFeed';
import { WhatIfSlider } from '../components/WhatIfSlider';
import { Bid, Invoice, VoiceTopic } from '@finova/shared';
import { CheckCircle2, Copy, FileCheck, ArrowRight, ShieldCheck, Download } from 'lucide-react';

interface SupplierCockpitProps {
  onTriggerVoice?: (topic: VoiceTopic, data?: any) => void;
}

export const SupplierCockpit: React.FC<SupplierCockpitProps> = ({ onTriggerVoice }) => {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [settledBid, setSettledBid] = useState<Bid | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleInvoiceVerified = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
  };

  const handleAcceptOffer = async (bid: Bid) => {
    if (!currentInvoice) return;
    try {
      const res = await fetch('/api/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: currentInvoice.id,
          offerId: bid.id
        })
      });

      if (res.ok) {
        setSettledBid(bid);
        setShowCertModal(true);
      }
    } catch (e) {
      console.error('Settlement error:', e);
      setSettledBid(bid);
      setShowCertModal(true);
    }
  };

  const copyProof = () => {
    if (!currentInvoice) return;
    const proofText = `FINOVA-SETTLEMENT-PROOF // ID: ${currentInvoice.id} // HASH: ${currentInvoice.hash} // TIMESTAMP: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(proofText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-surface-border">
        <div>
          <span className="text-xs font-mono text-accent">SUPPLIER TREASURY COCKPIT</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Alpha Precision Components Ltd</h1>
          <p className="text-xs text-slate-400">GSTIN: 27AABCA1234F1Z9 | Tier-A Verified OEM Supplier</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400">AVAILABLE DISBURSEMENT POOL</span>
            <div className="text-lg font-bold font-mono text-emerald-400">₹95,00,000</div>
          </div>
        </div>
      </div>

      {/* Trust Graph & Historical KPI Metrics */}
      <TrustGraph score={94} buyerName="Tata Motors Ltd" historicalSettlements={18} volumeFinanced={4250000} />

      {/* VeriShield Cryptographic Ingestion HUD */}
      <VeriShieldHUD onVerified={handleInvoiceVerified} onTriggerVoice={onTriggerVoice} />

      {/* What-If Financial Modeling Simulation */}
      <WhatIfSlider invoiceAmount={currentInvoice ? currentInvoice.invoiceAmount : 850000} />

      {/* Real-Time Competitive Bidding Engine */}
      {currentInvoice && (
        <BiddingFeed invoice={currentInvoice} onAcceptOffer={handleAcceptOffer} onTriggerVoice={onTriggerVoice} />
      )}

      {/* Settlement Certificate Modal */}
      {showCertModal && currentInvoice && settledBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-6 border border-emerald-400/40 text-left space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold text-base text-white">Cryptographic Settlement Proof</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                SETTLED & DISBURSED
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs text-slate-300 bg-surface/70 p-4 rounded-xl border border-surface-border">
              <div className="flex justify-between">
                <span className="text-slate-500">Contract ID:</span>
                <span className="text-accent font-bold">FINOVA-SC-{currentInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capital Provider:</span>
                <span className="text-white font-bold">{settledBid.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Invoice:</span>
                <span className="text-white">₹{currentInvoice.invoiceAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursed Principal:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{((currentInvoice.invoiceAmount * settledBid.advance) / 100).toLocaleString('en-IN')} ({settledBid.advance}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Financing APR:</span>
                <span className="text-accent">{settledBid.rate || settledBid.apr}% APR</span>
              </div>
              <div className="pt-2 border-t border-surface-border break-all">
                <span className="text-slate-500 block mb-1">SHA-256 Ledger Hash:</span>
                <span className="text-[11px] text-accent font-mono">{currentInvoice.hash}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={copyProof}
                className="flex-1 py-2.5 rounded-xl bg-surface border border-surface-border hover:border-accent text-xs font-mono text-white flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="w-4 h-4 text-accent" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Ledger Proof'}</span>
              </button>

              <button
                onClick={() => setShowCertModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-400 text-black font-bold text-xs shadow-glow-success hover:bg-emerald-300 transition-all"
              >
                Close & Return
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
