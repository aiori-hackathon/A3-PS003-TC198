import React from 'react';
import { Table, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function PredictedValuesTable({
  predictions = [],
  benchmarks = {},
  selectedHorizon = 'ALL',
  onSelectHorizon,
  currentSpeed = 62.0
}) {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xl p-4.5 transition-colors">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-[#17364E]/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-blue-500/20">
            <Table className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Predicted Values
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-[#8295A8]">
              Multi-horizon speed &amp; delta from current
            </p>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
          GRAPH+LSTM
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#04101A] text-slate-500 dark:text-[#7F96AA] uppercase text-[10px] border-b border-slate-200 dark:border-[#17364E]">
            <tr>
              <th className="py-2.5 px-2.5">Horizon</th>
              <th className="py-2.5 px-2.5 text-right">Predicted Value</th>
              <th className="py-2.5 px-2.5 text-right">Change</th>
              <th className="py-2.5 px-2.5 text-center">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 bg-white dark:bg-[#06111D]">
            {predictions.map((p) => {
              const bench = benchmarks[p.horizonLabel] || {};
              const isSelected = selectedHorizon === p.horizonLabel;
              const conf = bench.confidence || 'MEDIUM';
              const isFlow = p.predictedFlowVeh !== undefined;
              const predVal = isFlow ? Number(p.predictedFlowVeh) : p.predictedSpeedMph !== undefined ? Number(p.predictedSpeedMph) : null;
              const currentVal = isFlow && p.currentFlowVeh !== undefined ? Number(p.currentFlowVeh) : currentSpeed;
              const delta = predVal !== null ? Number((predVal - currentVal).toFixed(1)) : null;
              const unit = isFlow ? (p.unit || 'veh/5min') : 'mph';

              return (
                <tr
                  key={p.horizonLabel}
                  onClick={() => onSelectHorizon && onSelectHorizon(p.horizonLabel === selectedHorizon ? 'ALL' : p.horizonLabel)}
                  className={`hover:bg-slate-50 dark:hover:bg-[#0B2033]/60 transition-colors cursor-pointer ${
                    isSelected ? 'bg-cyan-500/10 dark:bg-cyan-500/15' : ''
                  }`}
                >
                  {/* Horizon Pill */}
                  <td className="py-3 px-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                        : 'bg-blue-500/10 text-blue-700 dark:text-cyan-300 border-blue-500/20'
                    }`}>
                      {p.horizonLabel}
                    </span>
                  </td>

                  {/* Predicted Value */}
                  <td className="py-3 px-2.5 text-right">
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                      {predVal !== null ? predVal.toFixed(1) : '--'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans ml-1">{unit}</span>
                  </td>

                  {/* Change vs Current */}
                  <td className="py-3 px-2.5 text-right">
                    {delta !== null ? (
                      <span className={`inline-flex items-center gap-0.5 font-bold tabular-nums text-xs ${
                        delta > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : delta < 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {delta > 0 ? (
                          <>
                            <ArrowUpRight className="w-3 h-3 shrink-0" />
                            +{delta.toFixed(1)}
                          </>
                        ) : delta < 0 ? (
                          <>
                            <ArrowDownRight className="w-3 h-3 shrink-0" />
                            {delta.toFixed(1)}
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3 shrink-0" />
                            0.0
                          </>
                        )}
                        <span className="text-[10px] font-normal ml-0.5">{unit}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>

                  {/* Confidence Classification */}
                  <td className="py-3 px-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider ${
                      conf === 'HIGH'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : conf === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {conf}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-[#17364E]/60 text-[10px] text-slate-400 dark:text-[#647C92] flex items-center justify-between font-mono">
        <span>Click row to filter horizon</span>
        <span>Current: {currentSpeed.toFixed(1)} mph</span>
      </div>

    </div>
  );
}
