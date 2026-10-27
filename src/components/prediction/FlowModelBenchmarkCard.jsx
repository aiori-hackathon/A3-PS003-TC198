import React from 'react';
import { Award, CheckCircle2, AlertCircle, Database, GitBranch } from 'lucide-react';

export default function FlowModelBenchmarkCard({
  results = null,
  loading = false
}) {
  const isEvaluated = results && results.status === 'EVALUATED';

  return (
    <div className="rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#17364E]/70">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F7FAFF]">
                PeMS08 Flow Forecasting Benchmark
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                SpatialGraphLSTM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8295A8] mt-0.5">
              Empirical multi-horizon vehicle volume evaluation on Caltrans District 8 (170 Loop Detectors)
            </p>
          </div>
        </div>

        <div>
          {isEvaluated ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Evaluated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              Not Evaluated
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading PeMS08 benchmark results...</div>
      ) : isEvaluated ? (
        <div className="mt-4 space-y-4">
          {/* Top 3 Empirical Overall Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#7F96AA] block">
                Overall Test MAE
              </span>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {results.overall?.testMae} <span className="text-xs font-normal text-slate-400 font-sans">veh/5min</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#8295A8] mt-0.5 block">
                Absolute prediction error
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#7F96AA] block">
                Overall Test RMSE
              </span>
              <span className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1 block">
                {results.overall?.testRmse} <span className="text-xs font-normal text-slate-400 font-sans">veh/5min</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#8295A8] mt-0.5 block">
                Root mean squared error
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#7F96AA] block">
                Overall Test MAPE
              </span>
              <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1 block">
                {results.overall?.testMape}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#8295A8] mt-0.5 block">
                Mean absolute percentage error
              </span>
            </div>
          </div>

          {/* Horizon Breakdown Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-[#04101A] text-[10px] uppercase text-slate-400 dark:text-[#7F96AA] border-b border-slate-200 dark:border-[#17364E]">
                <tr>
                  <th className="py-2 px-3">Horizon</th>
                  <th className="py-2 px-3">Forecast Minutes</th>
                  <th className="py-2 px-3 text-right">MAE (veh/5min)</th>
                  <th className="py-2 px-3 text-right">RMSE (veh/5min)</th>
                  <th className="py-2 px-3 text-right">MAPE (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 font-mono">
                {Object.entries(results.horizons || {}).map(([hName, hData]) => (
                  <tr key={hName} className="hover:bg-slate-50 dark:hover:bg-[#0B2033]/40">
                    <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">{hName}</td>
                    <td className="py-2 px-3 text-slate-500 dark:text-[#8295A8]">{hData.horizonMinutes} min</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{hData.mae}</td>
                    <td className="py-2 px-3 text-right text-cyan-600 dark:text-cyan-400">{hData.rmse}</td>
                    <td className="py-2 px-3 text-right text-purple-600 dark:text-purple-400">{hData.mape}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Methodology Details Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#081827] border border-slate-200 dark:border-[#17364E]/80 text-[11px] text-slate-600 dark:text-[#8EACB8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Chronological Protocol:</strong> 70% Train (12,499 steps) • 10% Val (1,785 steps) • 20% Test (3,572 steps)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fitted Scaler: Mean={results.datasetContext?.trainMeanFlow} • Std={results.datasetContext?.trainStdFlow} veh/5min</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Model Not Evaluated</p>
          <p className="mt-1">PeMS08 flow forecasting model evaluation has not been completed.</p>
        </div>
      )}
    </div>
  );
}
