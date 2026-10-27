import React from 'react';
import { Sparkles, ArrowRight, TrendingDown, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhatToWatchCard({
  sensorId = '773869',
  currentSpeed = 62.0,
  speedAt60 = 60.5,
  neighborDiff = 1.4,
  _needScore = 0.42
}) {
  const delta60 = Number((speedAt60 - currentSpeed).toFixed(1));

  // Dynamic forward-looking briefing observations (1 to 3 items)
  const observations = [];

  // Observation 1: Trend
  if (delta60 <= -2.0) {
    observations.push({
      icon: TrendingDown,
      iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      title: 'Corridor Slowdown Expected',
      text: `+60 min forecast shows the largest reduction (${delta60} mph) from ${currentSpeed.toFixed(1)} to ${speedAt60.toFixed(1)} mph.`
    });
  } else if (delta60 < 0) {
    observations.push({
      icon: TrendingDown,
      iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      title: 'Gradual Speed Adjustment',
      text: `Mild ${Math.abs(delta60)} mph easing over 60 minutes; baseline speed expected to hold stable.`
    });
  } else {
    observations.push({
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      title: 'Steady Traffic Speed',
      text: `Traffic speed remains stable through the next hour with minimal fluctuation (+${delta60} mph).`
    });
  }

  // Observation 2: Uncertainty
  observations.push({
    icon: ShieldAlert,
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    title: 'Horizon Uncertainty Transition',
    text: 'Forecast uncertainty transitions from HIGH (±1.65 mph) to MEDIUM (±2.85 mph) past the +30 min window.'
  });

  // Observation 3: Spatial consensus
  if (neighborDiff >= 3.5) {
    observations.push({
      icon: ShieldAlert,
      iconColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      title: 'Local Spatial Disagreement',
      text: `Neighbor speeds diverge by ${neighborDiff} mph from sensor ${sensorId}, signaling potential localized bottleneck.`
    });
  } else {
    observations.push({
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      title: 'Neighbor Consensus Verified',
      text: `Connected sensors agree within ${neighborDiff} mph, indicating consistent corridor speeds.`
    });
  }

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xs dark:shadow-xl transition-colors">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                What To Watch
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-[#8295A8]">
                Operational highlights
              </p>
            </div>
          </div>
        </div>

        {/* 2 to 3 Observations */}
        <div className="space-y-2.5">
          {observations.slice(0, 3).map((obs, idx) => {
            const Icon = obs.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/60 dark:border-[#17364E]/60 flex items-start gap-2.5"
              >
                <div className={`p-1.5 rounded-lg border shrink-0 ${obs.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {obs.title}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-[#8295A8] mt-0.5 leading-snug">
                    {obs.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="pt-3 mt-4 border-t border-slate-100 dark:border-[#17364E]/80">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Detailed Operational Modules:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold">
          <Link
            to="/predictions"
            onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); if (document.documentElement) document.documentElement.scrollTop = 0; if (document.body) document.body.scrollTop = 0; }}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200/80 dark:border-[#17364E] text-slate-700 dark:text-[#BCD0E2] hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          >
            <span>Forecast Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/network"
            onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); if (document.documentElement) document.documentElement.scrollTop = 0; if (document.body) document.body.scrollTop = 0; }}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200/80 dark:border-[#17364E] text-slate-700 dark:text-[#BCD0E2] hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          >
            <span>Sensor on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/decision"
            onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); if (document.documentElement) document.documentElement.scrollTop = 0; if (document.body) document.body.scrollTop = 0; }}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200/80 dark:border-[#17364E] text-slate-700 dark:text-[#BCD0E2] hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
          >
            <span>Decision Context</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
