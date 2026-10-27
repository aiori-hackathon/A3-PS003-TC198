import React from 'react';
import { TrendingDown, TrendingUp, Minus, Compass, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForecastDirectionCard({
  currentSpeed = 62.0,
  speedAt60 = 60.5
}) {
  const delta = Number((speedAt60 - currentSpeed).toFixed(1));

  let label = 'Stable Corridor Speed';
  let subLabel = 'Speed expected to remain steady';
  let badgeColor = 'blue';
  let DirectionIcon = Minus;

  if (delta <= -3.0) {
    label = 'Strong Slowdown';
    subLabel = 'Significant speed drop anticipated';
    badgeColor = 'rose';
    DirectionIcon = TrendingDown;
  } else if (delta < -0.8) {
    label = 'Gradual Slowdown';
    subLabel = 'Moderate reduction over next hour';
    badgeColor = 'amber';
    DirectionIcon = TrendingDown;
  } else if (delta >= 3.0) {
    label = 'Strong Speed Recovery';
    subLabel = 'Significant acceleration projected';
    badgeColor = 'emerald';
    DirectionIcon = TrendingUp;
  } else if (delta > 0.8) {
    label = 'Improving Traffic';
    subLabel = 'Speed trending slightly upward';
    badgeColor = 'emerald';
    DirectionIcon = TrendingUp;
  }

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xl transition-colors">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Forecast Direction
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-[#8295A8]">
                Trajectory over 60 min
              </p>
            </div>
          </div>
        </div>

        {/* Direction Card Body */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/80 dark:border-[#17364E] space-y-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${
              badgeColor === 'emerald'
                ? 'bg-emerald-500/15 text-emerald-500'
                : badgeColor === 'amber'
                ? 'bg-amber-500/15 text-amber-500'
                : badgeColor === 'rose'
                ? 'bg-rose-500/15 text-rose-500'
                : 'bg-cyan-500/15 text-cyan-400'
            }`}>
              <DirectionIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {label}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#8295A8]">
                {subLabel}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-[#17364E]/60 flex items-baseline justify-between font-mono">
            <span className="text-xs text-slate-500 dark:text-[#8295A8]">Projected Delta:</span>
            <span className={`text-base font-black tabular-nums ${
              delta > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : delta < 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}>
              {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} mph
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2.5 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/60 dark:border-[#17364E]/60">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-medium">Trajectory Rate</span>
            <span className="font-bold text-slate-800 dark:text-white tabular-nums">
              {(delta / 4).toFixed(2)} mph/15m
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/60 dark:border-[#17364E]/60">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-medium">Projected 60m</span>
            <span className="font-bold text-slate-800 dark:text-white tabular-nums">
              {speedAt60.toFixed(1)} mph
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-[#8295A8] font-mono leading-snug">
          Evaluated from current {currentSpeed.toFixed(1)} mph to {speedAt60.toFixed(1)} mph at +60m.
        </p>
      </div>

      {/* Footer Nav Link */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#17364E]/80">
        <Link
          to="/predictions"
          onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); if (document.documentElement) document.documentElement.scrollTop = 0; if (document.body) document.body.scrollTop = 0; }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          <span>View Forecast Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
