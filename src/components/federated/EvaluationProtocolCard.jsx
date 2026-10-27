import React from 'react';
import { Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';

const PROTOCOL_ITEMS = [
  { label: 'Random Seed', value: '42', note: 'Single evaluated seed' },
  { label: 'Federated Clients', value: '4', note: 'Simulated FL clients' },
  { label: 'Training Rounds', value: '13', note: 'Checkpoint at Round 8' },
  { label: 'Optimizer', value: 'Adam', note: 'Standard adaptive gradient' },
  { label: 'Learning Rate', value: '0.001', note: 'Constant client lr' },
  { label: 'Batch Size', value: '64', note: 'Client batch mini-batches' },
  { label: 'Max Batches / Round', value: '30', note: 'Selective communication runs' }
];

export default function EvaluationProtocolCard() {
  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-5 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-[#17364E]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F8FC]">
              Evaluation Protocol
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              Hyperparameters and reproducible experimental configuration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Seed: 42 (Deterministic)
          </span>
        </div>
      </div>

      {/* Protocol Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-4">
        {PROTOCOL_ITEMS.map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] flex flex-col justify-between space-y-1"
          >
            <span className="text-[11px] text-slate-500 dark:text-[#7F96AA] font-medium leading-tight">
              {item.label}
            </span>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
              {item.value}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-[#6A8197] leading-tight">
              {item.note}
            </span>
          </div>
        ))}
      </div>

      {/* Multi-Seed Evaluation Status Bar */}
      <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-[#0B2033]/60 border border-slate-200 dark:border-[#17364E] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-600 dark:text-[#BCD0E2]">
          <ShieldAlert className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>
            <strong>Multi-Seed Evaluation Status:</strong> Currently evaluated on a single seed (42). Framework is structured to support <em>Mean &plusmn; Std</em> aggregation upon completion of secondary random trials.
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0 self-start sm:self-auto">
          Single Seed (42) Active
        </span>
      </div>
    </div>
  );
}
