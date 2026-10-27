import React from 'react';
import { Layers, MapPin, Shuffle, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function ExperimentDistributionCard() {
  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-5 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-[#17364E]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F8FC]">
              Experiment Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              PS-003 partition setup and data heterogeneity evaluation status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-600 dark:text-[#BCD0E2]">
            Dataset: METR-LA (207 Sensors)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* State 1: Non-IID / Geographic (EVALUATED) */}
        <div className="p-4.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-emerald-500/30 dark:border-emerald-500/30 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Non-IID / Geographic
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-3 h-3" />
                EVALUATED
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#BCD0E2] leading-relaxed">
              Four geographically separated regional sensor groups partitioned by spatial highway sub-networks. Reflects authentic non-identical spatio-temporal dynamics across urban corridors.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E]">
                <div className="text-[10px] text-slate-500">Region A (North-East)</div>
                <div className="font-bold text-slate-800 dark:text-white">48 sensors</div>
              </div>
              <div className="p-2 rounded bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E]">
                <div className="text-[10px] text-slate-500">Region B (South-East)</div>
                <div className="font-bold text-slate-800 dark:text-white">57 sensors</div>
              </div>
              <div className="p-2 rounded bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E]">
                <div className="text-[10px] text-slate-500">Region C (Central-West)</div>
                <div className="font-bold text-slate-800 dark:text-white">58 sensors</div>
              </div>
              <div className="p-2 rounded bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E]">
                <div className="text-[10px] text-slate-500">Region D (North-West)</div>
                <div className="font-bold text-slate-800 dark:text-white">44 sensors</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium pt-2 border-t border-slate-200 dark:border-[#17364E]/60 flex items-center justify-between">
            <span>Client Sensor Union: 207 / 207</span>
            <span>Heterogeneous: Yes</span>
          </div>
        </div>

        {/* State 2: IID Comparator (NOT EVALUATED) */}
        <div className="p-4.5 rounded-xl bg-slate-50/60 dark:bg-[#0B2033]/50 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  IID Comparator
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                <AlertCircle className="w-3 h-3" />
                NOT EVALUATED
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-[#7F96AA] leading-relaxed">
              A synthetic uniform-random client partition (IID shuffling of sensors across clients) has not been evaluated in the frozen benchmark.
            </p>

            <div className="mt-3 p-3 rounded-lg bg-white/60 dark:bg-[#081827]/60 border border-slate-200/80 dark:border-[#17364E]/80 text-xs text-slate-500 dark:text-[#7F96AA] space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Scientific Integrity Safeguard:
              </div>
              <p className="text-[11px] leading-normal">
                To prevent misleading comparisons, no placeholder or fabricated IID metrics (MAE/RMSE/Convergence) are presented.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-[#7F96AA] pt-2 border-t border-slate-200 dark:border-[#17364E]/60 flex items-center justify-between">
            <span>Future Target: Controlled IID Baseline</span>
            <span>Status: Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
