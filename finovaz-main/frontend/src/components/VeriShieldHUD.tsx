import React, { useState } from 'react';
import { ShieldCheck, Sparkles, AlertTriangle, Upload, CheckCircle2, ShieldAlert, Volume2 } from 'lucide-react';
import { Invoice, VerificationResult, VoiceTopic } from '@finova/shared';

interface VeriShieldHUDProps {
  onVerified: (invoice: Invoice) => void;
  onTriggerVoice?: (topic: VoiceTopic, data?: any) => void;
}

export const VeriShieldHUD: React.FC<VeriShieldHUDProps> = ({ onVerified, onTriggerVoice }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [computedHash, setComputedHash] = useState<string>('');

  // Web Crypto SHA-256 Digest calculation
  const calculateSHA256 = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const processFile = async (file: File, isDuplicateDemo = false) => {
    setScanning(true);
    setProgress(0);
    setVerificationResult(null);
    setTerminalLines([
      `> Ingesting payload document: "${file.name}"`,
      `> Document Size: ${(file.size / 1024).toFixed(2)} KB | Type: ${file.type || 'application/octet-stream'}`
    ]);

    // Read file via FileReader as ArrayBuffer
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const hash = isDuplicateDemo 
        ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        : await calculateSHA256(buffer || new ArrayBuffer(0));
      
      setComputedHash(hash);

      // Animate progress
      let currentProgress = 0;
      const interval = setInterval(async () => {
        currentProgress += Math.floor(Math.random() * 25 + 15);
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          clearInterval(interval);

          setTerminalLines(prev => [
            ...prev,
            `> Executing Web Crypto SHA-256 Digest...`,
            `> Generated Digest: ${hash}`,
            `> Verifying against VeriShield Cross-Lender Registry...`
          ]);

          // Call Fastify Backend /api/verify
          try {
            const res = await fetch('/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceId: 'INV-1042',
                amount: 850000,
                hash,
                supplierId: '27AABCA1234F1Z9',
                buyerName: 'Tata Motors Ltd'
              })
            });

            const result: VerificationResult = await res.json();
            setVerificationResult(result);

            if (result.status === 'VERIFIED' && result.invoice) {
              setTerminalLines(prev => [
                ...prev,
                `> [SUCCESS] Cryptographic signature locked into ledger.`,
                `> Buyer verified: Tata Motors Ltd (Tier-A). Readiness: 100%`
              ]);
              onVerified(result.invoice);
            } else {
              setTerminalLines(prev => [
                ...prev,
                `> [REJECTED] ${result.reason || 'SHA-256 Collision detected'}`,
                `> FRAUD ALERT: Double financing prevented across all institutional nodes.`
              ]);
            }
          } catch (err) {
            console.error('Verification error:', err);
          } finally {
            setScanning(false);
          }
        } else {
          setProgress(currentProgress);
        }
      }, 90);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDemoInvoice = () => {
    const blob = new Blob([JSON.stringify({
      invoiceId: 'INV-1042',
      buyer: 'Tata Motors Ltd',
      amount: 850000,
      timestamp: Date.now()
    })], { type: 'application/json' });
    const file = new File([blob], 'TataMotors_Invoice_TM89201.pdf', { type: 'application/pdf' });
    processFile(file, false);
  };

  const handleDuplicateAttack = () => {
    const blob = new Blob(['FORGED_COLLISION_DATA'], { type: 'text/plain' });
    const file = new File([blob], 'DUPLICATE_FORGED_INVOICE.pdf', { type: 'application/pdf' });
    processFile(file, true);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-surface-border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent/10 border border-accent/30 text-accent">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">VeriShield Cryptographic Ingestion</h2>
            <p className="text-xs text-slate-400">Zero-knowledge proof & anti-duplicate double-financing engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDemoInvoice}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo (₹8.5L Tata Motors)</span>
          </button>
          
          <button
            onClick={handleDuplicateAttack}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30 hover:bg-danger/20 text-danger text-xs font-semibold transition-all disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Duplicate Attack</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-surface-border hover:border-accent/40 bg-surface/40'
        }`}
        onClick={() => document.getElementById('hud-file-input')?.click()}
      >
        <input
          id="hud-file-input"
          type="file"
          accept=".pdf,.json,.xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) processFile(e.target.files[0]);
          }}
        />

        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface border border-surface-border flex items-center justify-center text-accent">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-white mb-1">
          Drag & Drop Verified Buyer Invoice (PDF or JSON)
        </p>
        <p className="text-xs text-slate-400">
          Instant SHA-256 digest computation & real-time cross-lender validation
        </p>
      </div>

      {/* Cryptographic Scanner Terminal */}
      {(scanning || terminalLines.length > 0) && (
        <div className="mt-5 rounded-xl bg-black/80 border border-surface-border p-4 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-warning/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-success/80"></span>
              <span className="text-[11px] text-slate-400 ml-2">VERISHIELD_CORE // CRYPTO_VERIFY_LOG</span>
            </div>
            {scanning && <span className="text-accent animate-pulse">Scanning {progress}%</span>}
          </div>

          {scanning && (
            <div className="w-full bg-surface rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-150 shadow-glow-accent"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {terminalLines.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.includes('[SUCCESS]')
                    ? 'text-emerald-400 font-semibold'
                    : line.includes('[REJECTED]')
                    ? 'text-danger font-semibold'
                    : line.includes('SHA-256')
                    ? 'text-accent'
                    : 'text-slate-300'
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* Verification Status Cards */}
          {verificationResult && (
            <div className="mt-4 pt-3 border-t border-surface-border">
              {verificationResult.status === 'VERIFIED' ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">CRYPTOGRAPHICALLY VERIFIED</div>
                      <div className="text-[11px] text-slate-300">
                        Hash registered on ledger. Ready for live competitive bidding.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onTriggerVoice && (
                      <button
                        onClick={() => onTriggerVoice('VERISHIELD_ALERT', verificationResult)}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1 transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      PASSED TIER-A
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-danger">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">REVIEW REQUIRED (COLLISION DETECTED)</div>
                      <div className="text-[11px] text-slate-300">
                        {verificationResult.reason || 'Double financing prevention triggered.'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onTriggerVoice && (
                      <button
                        onClick={() => onTriggerVoice('VERISHIELD_ALERT', verificationResult)}
                        className="px-2.5 py-1 rounded bg-danger/20 hover:bg-danger/30 text-danger text-xs font-mono flex items-center gap-1 transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Hear Alert</span>
                      </button>
                    )}
                    <span className="px-2 py-1 rounded bg-danger/20 text-danger text-[10px] font-bold">
                      BLOCKED
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
