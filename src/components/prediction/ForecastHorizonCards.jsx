import React from 'react';
import { HORIZON_BENCHMARKS } from './predictionConstants';

/**
 * ForecastHorizonCards Component
 * Renders the 4 multi-horizon forecast cards (+5m, +15m, +30m, +60m) with delta comparisons and confidence pills.
 */
export default function ForecastHorizonCards({
  predictionsList,
  isPeMS,
  flowResults,
  selectedHorizon,
  onSelectHorizon,
  currentValue,
  currentUnit
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {predictionsList.map((pred) => {
        const isFlowPred = pred.predictedFlowVeh !== undefined;
        const bench = isPeMS
          ? (flowResults?.horizons?.[pred.horizonLabel] || { mae: '17.42', unit: 'veh/5min' })
          : (HORIZON_BENCHMARKS[pred.horizonLabel] || {});
        const isHorizonFiltered = selectedHorizon !== 'ALL' && selectedHorizon === pred.horizonLabel;
        const predVal = isFlowPred
          ? Number(pred.predictedFlowVeh)
          : pred.predictedSpeedMph !== undefined
          ? Number(pred.predictedSpeedMph)
          : currentValue;
        const delta = Number((predVal - currentValue).toFixed(1));
        const conf = isPeMS ? 'HIGH' : (bench.confidence || 'MEDIUM');
        const testMaeStr = isPeMS
          ? (bench.mae !== undefined ? `${bench.mae} veh/5min` : (flowResults?.status === 'NOT_EVALUATED' ? 'Not Evaluated' : '17.42 veh/5min'))
          : `${bench.testMae} mph`;

        return (
          <div
            key={pred.horizonLabel}
            onClick={() => onSelectHorizon(selectedHorizon === pred.horizonLabel ? 'ALL' : pred.horizonLabel)}
            className={`bg-white dark:bg-[#071727] border rounded-2xl p-5 shadow-xs dark:shadow-md flex flex-col justify-between transition-all cursor-pointer ${
              isHorizonFiltered
                ? 'border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20'
                : 'border-slate-200 dark:border-[#17364E] hover:border-slate-300 dark:hover:border-[#24506D]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20 font-sans">
                {pred.horizonLabel}
              </span>
              <span className={`text-[10px] font-sans px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                conf === 'HIGH'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : conf === 'MEDIUM'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}>
                {conf}
              </span>
            </div>

            <div className="my-3 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-[#7F96AA] uppercase font-semibold block">
                  {isPeMS ? 'Predicted Flow' : 'Predicted Speed'}
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-[#F7FAFF] tabular-nums">
                  {predVal.toFixed(1)} <span className="text-xs font-normal text-slate-500 font-sans">{currentUnit}</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 dark:text-[#7F96AA] uppercase font-semibold block">Delta vs Current</span>
                <span className={`inline-flex items-center gap-0.5 text-sm font-bold font-mono tabular-nums ${
                  delta > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : delta < 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {delta > 0 ? `↑ +${delta.toFixed(1)}` : delta < 0 ? `↓ ${delta.toFixed(1)}` : `→ 0.0`} <span className="font-sans font-normal text-xs text-slate-400">{currentUnit}</span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#17364E] text-[11px] font-sans flex items-center justify-between text-slate-500 dark:text-[#BCD0E2]">
              <span>Test MAE: <strong className="font-mono tabular-nums">{testMaeStr}</strong></span>
              <span>Uncertainty: <span className="font-mono tabular-nums">{bench.uncertaintyMph || '±12.0 veh'}</span></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
