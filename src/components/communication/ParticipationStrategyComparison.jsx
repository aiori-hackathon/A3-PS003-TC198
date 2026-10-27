import React from 'react';
import { Sliders, CheckCircle2 } from 'lucide-react';

export default function ParticipationStrategyComparison({
  activeStrategy = 'FIFTY',
  onSelectStrategy
}) {
  const strategies = [
    {
      id: 'FULL',
      name: 'Full Participation',
      clients: '4 / 4 clients',
      payloadBytes: 11468184,
      payloadFormatted: '11.47 MB',
      reduction: '0.0%',
      reductionSub: 'Baseline',
      testMAE: 3.6473,
      accuracyChange: '0.0000',
      changeType: 'neutral',
      paretoStatus: 'Full Baseline',
      badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      description: 'Synchronous all-client aggregation across all 13 rounds.'
    },
    {
      id: 'SEVENTY_FIVE',
      name: '75% Participation',
      clients: '3 / 4 clients',
      payloadBytes: 8601138,
      payloadFormatted: '8.60 MB',
      reduction: '25.0%',
      reductionSub: '-2.87 MB',
      testMAE: 3.6530,
      accuracyChange: '+0.0057',
      changeType: 'worse',
      paretoStatus: 'Dominated by 50%',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      description: 'Saves 25% payload but strictly dominated by 50% policy.'
    },
    {
      id: 'FIFTY',
      name: '50% Participation',
      clients: '2 / 4 clients',
      payloadBytes: 5734092,
      payloadFormatted: '5.73 MB',
      reduction: '50.0%',
      reductionSub: '-5.73 MB',
      testMAE: 3.6448,
      accuracyChange: '-0.0025',
      changeType: 'better',
      paretoStatus: 'Best Balanced Trade-off',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      isBestTradeoff: true,
      description: 'Optimal trade-off: 50% payload cut with equivalent accuracy.'
    },
    {
      id: 'TWENTY_FIVE',
      name: '25% Participation',
      clients: '1 / 4 client',
      payloadBytes: 2867046,
      payloadFormatted: '2.87 MB',
      reduction: '75.0%',
      reductionSub: '-8.60 MB',
      testMAE: 3.6699,
      accuracyChange: '+0.0226',
      changeType: 'worse',
      paretoStatus: 'Max Reduction',
      badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
      description: 'Maximum communication compression under tight network budgets.'
    }
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md p-5 transition-colors">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
              Participation Strategy Comparison
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-1 font-medium">
              Empirical multi-round evaluation across client budget constraints
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-500 dark:text-[#8295A8] bg-slate-100 dark:bg-[#0B2033] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#17364E] self-start sm:self-auto">
          Click to activate strategy
        </span>
      </div>

      {/* 4 Interactive Strategy Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {strategies.map((strat) => {
          const isSelected = activeStrategy === strat.id;

          return (
            <div
              key={strat.id}
              onClick={() => onSelectStrategy && onSelectStrategy(strat.id)}
              className={`rounded-xl p-4 transition-all cursor-pointer border flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-slate-50 dark:bg-[#0C243C] border-blue-500 dark:border-cyan-400 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-slate-50/60 dark:bg-[#081B2E] border-slate-200 dark:border-[#17364E] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Card Header: Name + Badge */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {strat.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border truncate ${strat.badgeClass}`}>
                    {strat.paretoStatus}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500 dark:text-[#8295A8] mt-0.5">
                  {strat.clients}
                </div>

                {/* Primary Metric: Application Payload */}
                <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8295A8]">
                      Application Payload
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {strat.payloadFormatted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-[#647C92] text-[10px]">
                      {strat.payloadBytes.toLocaleString('en-US')} B
                    </span>
                    <span className={`font-bold ${
                      strat.reduction !== '0.0%' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}>
                      -{strat.reduction}
                    </span>
                  </div>
                </div>

                {/* Secondary Metric: Test MAE & Delta */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8295A8]">
                      Test MAE
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {strat.testMAE.toFixed(4)} <span className="text-[10px] font-normal text-slate-500">mph</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-[#647C92] text-[10px]">
                      Accuracy Delta
                    </span>
                    <span className={`font-bold ${
                      strat.changeType === 'better'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : strat.changeType === 'worse'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                    }`}>
                      {strat.accuracyChange}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selection Status Footer */}
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-[#8295A8] text-[10px] truncate max-w-[140px]">
                  {strat.description}
                </span>
                {isSelected ? (
                  <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-cyan-400 shrink-0 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-[#647C92] shrink-0 text-[10px] hover:text-slate-700">
                    Select
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
