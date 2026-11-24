import React, { useEffect } from 'react';
import { Zap, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function GlobalActionModal({ modal, onClose }) {
  useEffect(() => {
    if (!modal?.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal?.isOpen, onClose]);

  if (!modal || !modal.isOpen) return null;

  const raw = modal.message || '';
  const isEvidenceQuery = raw.toLowerCase().includes('evidence query') || raw.toLowerCase().includes('counterfactual query');
  const isError = modal.type === 'error' || raw.toLowerCase().includes('failed') || raw.toLowerCase().includes('error');

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = isEvidenceQuery ? 'Evidence Query Executed' : (isError ? 'System Alert' : 'System Notification');

  // Extract key-value lines like "Measured Transferred: 4.2 KB"
  const details = {};
  lines.forEach((line) => {
    if (line.includes(':')) {
      const parts = line.split(':');
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (key && val) {
        details[key] = val;
      }
    }
  });

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#07192A] border border-slate-200 dark:border-cyan-500/40 p-5 sm:p-6 shadow-2xl shadow-cyan-500/10 text-slate-900 dark:text-[#F5F8FC] transition-all transform animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isError
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {isError ? <AlertCircle className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-emerald-500/20" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#8295A8]">
                TrafficPulse-X Telemetry Orchestration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3 my-3 text-xs font-mono">
          {lines.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-800 dark:text-[#CBDDF0] font-semibold text-xs leading-relaxed">
              {lines[0]}
            </div>
          )}

          {/* Structured stats grid */}
          {Object.keys(details).length > 0 && (
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(details).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#0E2438] border border-slate-200/80 dark:border-[#17364E] flex flex-col justify-between"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-[#7E93A7] tracking-wider truncate">
                    {key}
                  </span>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* State Verification Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Telemetry verified &bull; Consensus model synchronized</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer font-sans"
          >
            Acknowledge &bull; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
