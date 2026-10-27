import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ForecastConfidenceCard() {
  const horizons = [
    { label: '+5 min', tier: 'HIGH', uncertainty: '±1.65 mph', widthPercent: 88, color: 'emerald' },
    { label: '+15 min', tier: 'HIGH', uncertainty: '±2.10 mph', widthPercent: 80, color: 'emerald' },
    { label: '+30 min', tier: 'MEDIUM', uncertainty: '±2.85 mph', widthPercent: 55, color: 'amber' },
    { label: '+60 min', tier: 'LOW', uncertainty: '±3.90 mph', widthPercent: 30, color: 'rose' }
  ];

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xl transition-colors">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Forecast Confidence
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-[#8295A8]">
                Confidence by horizon
              </p>
            </div>
          </div>
        </div>

        {/* 4 Horizon Confidence Bars */}
        <div className="space-y-2.5">
          {horizons.map((h) => (
            <div
              key={h.label}
              className="p-2 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/60 dark:border-[#17364E]/60 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="font-bold text-slate-900 dark:text-white">{h.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">{h.uncertainty}</span>
                  <span className={`px-1.5 py-0.2 text-[9.5px] rounded font-bold uppercase tracking-wider font-sans ${
                    h.color === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : h.color === 'amber'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}>
                    {h.tier}
                  </span>
                </div>
              </div>

              {/* Confidence Tier Bar */}
              <div className="w-full bg-slate-200/80 dark:bg-[#04101A] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    h.color === 'emerald'
                      ? 'bg-emerald-500'
                      : h.color === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${h.widthPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#17364E]/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <span>Empirical 1σ residual bounds</span>
        <span>Graph+LSTM</span>
      </div>

    </div>
  );
}
