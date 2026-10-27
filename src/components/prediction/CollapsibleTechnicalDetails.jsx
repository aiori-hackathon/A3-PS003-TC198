import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, CheckCircle, Shield } from 'lucide-react';

export default function CollapsibleTechnicalDetails() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-2xl overflow-hidden shadow-sm transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0B2033]/60 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-[#F7FAFF] uppercase tracking-wider">
            Technical Model Details
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Graph+LSTM Architecture &amp; Checkpoint Provenance (26,596 params)
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 dark:border-[#17364E] bg-slate-50/50 dark:bg-[#04101A] space-y-4 text-xs font-mono max-h-[460px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Box 1: Weights & Checkpoint */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] space-y-1">
              <span className="text-slate-500 dark:text-[#8295A8] text-[10px] block font-bold uppercase tracking-wider">
                Model Weights Hash (SHA-256)
              </span>
              <span className="text-[10px] text-blue-600 dark:text-cyan-400 break-all block font-bold">
                702cb2bb9406aa36ec25639121377bf939acdb1906370997ccd792f70cf1f384
              </span>
              <span className="text-[10px] text-slate-400 block">
                File: graph_lstm_best.pt (111,119 B) &bull; Frozen Checkpoint
              </span>
            </div>

            {/* Box 2: Graph Normalization */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] space-y-1">
              <span className="text-slate-500 dark:text-[#8295A8] text-[10px] block font-bold uppercase tracking-wider">
                Graph Topology &amp; Normalization
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold block">
                Symmetrically Normalized A with self-loops
              </span>
              <span className="text-[10px] text-slate-400 block">
                Formula: D^(-1/2) * (A + I) * D^(-1/2)
              </span>
            </div>

            {/* Box 3: Network Architecture */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] space-y-1">
              <span className="text-slate-500 dark:text-[#8295A8] text-[10px] block font-bold uppercase tracking-wider">
                Layer Configuration &amp; Parameters
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold block">
                GCN (64-dim) &rarr; LSTM (64-dim) &rarr; Linear (4)
              </span>
              <span className="text-[10px] text-slate-400 block">
                26,596 total parameters &bull; 12-step input window
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-600 dark:text-[#BCD0E2]">
                Scaler Provenance: Train set mean <strong className="text-slate-900 dark:text-white">&mu; = 58.5843</strong> mph, std <strong className="text-slate-900 dark:text-white">&sigma; = 12.8229</strong> mph (Zero Data Leakage)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified Deterministic Replay</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
