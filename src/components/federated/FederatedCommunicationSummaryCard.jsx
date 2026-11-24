import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowRight, HardDrive, Cpu, Activity } from 'lucide-react';

export default function FederatedCommunicationSummaryCard() {
  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#17364E]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F8FC]">
              Federated Communication Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              Serialized model payload transfers across federated training rounds
            </p>
          </div>
        </div>

        <Link
          to="/communication"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-colors w-fit"
        >
          <span>View Communication Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-1.5">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#7F96AA] text-xs">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>Serialized Model State</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            110,271 B
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#7F96AA]">
            Per upload/download (26,596 FP32 parameters)
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-1.5">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#7F96AA] text-xs">
            <HardDrive className="w-3.5 h-3.5 text-purple-500" />
            <span>Full-Participation Total</span>
          </div>
          <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
            11,468,184 B
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#7F96AA]">
            104 total transfers across 13 rounds (~11.47 MB)
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-1.5">
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#7F96AA] text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Selective Policy Savings</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            Up to 50.0%
          </div>
          <p className="text-[11px] text-slate-400 dark:text-[#7F96AA]">
            Under 2/4 CCV policy (5,734,092 B) at 3.5350 mph MAE
          </p>
        </div>
      </div>

      {/* Mathematical Accounting Equation Box */}
      <div className="mt-3.5 p-3 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between text-slate-500 text-[11px]">
          <span>Byte Transmission Accounting Formulation:</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">Total Bytes = R &times; K &times; (Down + Up) &times; S</span>
        </div>
        <div className="p-2 rounded bg-white dark:bg-[#071624] border border-slate-200/80 dark:border-[#17364E]/80 text-[11px] text-slate-600 dark:text-[#CBDDF0] space-y-0.5">
          <div>13 Rounds &times; 4 Clients &times; 2 Transfers &times; 110,271 Bytes = <strong className="text-purple-600 dark:text-purple-400">11,468,184 Bytes (~11.47 MB)</strong></div>
          <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-100 dark:border-[#17364E]">
            Model Size: 26,596 FP32 params &times; 4B = 106,384B uncompressed + 3,887B PyTorch state_dict framing = 110,271B/transfer.
          </div>
        </div>
      </div>

      <div className="mt-3.5 text-[11px] text-slate-500 dark:text-[#7F96AA] flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#17364E]">
        <span>Scope: Application payload accounting (PyTorch serialized state_dict tensors).</span>
        <span className="font-mono text-slate-400">Physical transport overhead omitted</span>
      </div>
    </div>
  );
}
