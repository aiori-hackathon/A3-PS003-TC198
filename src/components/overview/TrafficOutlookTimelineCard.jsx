import React from 'react';
import { CalendarClock, AlertCircle } from 'lucide-react';

export default function TrafficOutlookTimelineCard({
  currentSpeed = 62.0,
  predictions = [],
  needScore = 0.42
}) {
  // Derive operational status for each horizon point
  const getStatus = (speed, baseSpeed, _horizonMin) => {
    const delta = speed - baseSpeed;
    if (delta <= -3.0) return { label: 'Attention Required', color: 'rose' };
    if (delta <= -1.2) return { label: 'Moderate Slowdown', color: 'amber' };
    if (delta < -0.4) return { label: 'Slight Slowdown', color: 'blue' };
    if (delta >= 1.5) return { label: 'Speed Recovery', color: 'emerald' };
    return { label: 'Stable Speed', color: 'emerald' };
  };

  const timelineSteps = [
    {
      horizon: 'NOW (T0)',
      speed: currentSpeed,
      ...getStatus(currentSpeed, currentSpeed, 0)
    }
  ];

  predictions.forEach((p) => {
    const pSpeed = p.predictedSpeedMph !== undefined ? Number(p.predictedSpeedMph) : currentSpeed;
    timelineSteps.push({
      horizon: p.horizonLabel,
      speed: pSpeed,
      ...getStatus(pSpeed, currentSpeed, p.horizonMinutes)
    });
  });

  // Derive Attention Level from Need Score
  let attentionLevel = 'LOW';
  let attentionColor = 'emerald';
  let attentionPct = 30;
  if (needScore > 0.65) {
    attentionLevel = 'HIGH';
    attentionColor = 'rose';
    attentionPct = 85;
  } else if (needScore > 0.35) {
    attentionLevel = 'MODERATE';
    attentionColor = 'amber';
    attentionPct = 58;
  }

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xl transition-colors">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Traffic Outlook Timeline
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-[#8295A8]">
                Condition progression over next 60 minutes
              </p>
            </div>
          </div>

          {/* Attention Level Chip */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-[10px] text-slate-400">Attention:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                attentionColor === 'emerald'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : attentionColor === 'amber'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {attentionLevel}
            </span>
          </div>
        </div>

        {/* Stepped Timeline Progression */}
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#17364E]">
          {timelineSteps.map((step) => (
            <div key={step.horizon} className="relative flex items-center justify-between text-xs font-sans">
              {/* Dot */}
              <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                step.color === 'emerald'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : step.color === 'amber'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : step.color === 'rose'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  step.color === 'emerald'
                    ? 'bg-emerald-500'
                    : step.color === 'amber'
                    ? 'bg-amber-500'
                    : step.color === 'rose'
                    ? 'bg-rose-500'
                    : 'bg-cyan-400'
                }`} />
              </div>

              {/* Horizon & Speed */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {step.horizon}
                </span>
                <span className="text-slate-400 dark:text-[#7F96AA] font-mono tabular-nums text-[11px]">
                  ({step.speed.toFixed(1)} mph)
                </span>
              </div>

              {/* Status Chip */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                step.color === 'emerald'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : step.color === 'amber'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : step.color === 'rose'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
              }`}>
                ● {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Attention Meter Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#17364E]/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8295A8]">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>Next-Hour Attention Meter</span>
          </span>
          <span title="Derived from current Need Score.">
            Score: {needScore.toFixed(2)} &bull; {attentionLevel}
          </span>
        </div>
        <div className="w-full bg-slate-200/80 dark:bg-[#04101A] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              attentionColor === 'emerald'
                ? 'bg-emerald-500'
                : attentionColor === 'amber'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${attentionPct}%` }}
          />
        </div>
      </div>

    </div>
  );
}
