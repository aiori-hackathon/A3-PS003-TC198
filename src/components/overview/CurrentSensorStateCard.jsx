import React from 'react';
import { Radio, Gauge, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CurrentSensorStateCard({
  sensorId = '773869',
  regionId = 'REGION_C',
  currentSpeed = 62.0,
  recentMean = 62.8,
  driftState = 'normal',
  dataQuality = 'Operational'
}) {
  // Derive traffic state classification
  let trafficState = 'Moderate / Stable';
  let trafficBadgeColor = 'emerald';
  if (currentSpeed >= 64.0) {
    trafficState = 'Free-Flow / Stable';
    trafficBadgeColor = 'emerald';
  } else if (currentSpeed < 45.0) {
    trafficState = 'Congested Speed';
    trafficBadgeColor = 'rose';
  } else if (driftState === 'drift' || Math.abs(currentSpeed - recentMean) > 3.0) {
    trafficState = 'Elevated Speed Drift';
    trafficBadgeColor = 'amber';
  }

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xl transition-colors">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-blue-500/20">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Current Sensor State
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-[#8295A8]">
                Detector status
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20">
            {regionId}
          </span>
        </div>

        {/* Sensor ID Banner */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-[#7F96AA] uppercase font-semibold block">
              Loop Detector ID
            </span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {sensorId}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-[#7F96AA] uppercase font-semibold block">
              Network Region
            </span>
            <span className="text-sm font-bold font-mono text-slate-700 dark:text-[#BCD0E2]">
              {regionId.replace('REGION_', 'Region ')}
            </span>
          </div>
        </div>

        {/* Speed Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/80 dark:border-[#17364E]">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#7F96AA] text-[11px] mb-1 font-medium">
              <Gauge className="w-3.5 h-3.5 text-cyan-500" />
              <span>Current Speed</span>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {currentSpeed.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">mph</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/80 dark:border-[#17364E]">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-[#7F96AA] text-[11px] mb-1 font-medium">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Recent Mean</span>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {recentMean.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">mph</span>
            </div>
          </div>
        </div>

        {/* Traffic State & Data Quality */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0B2033]/60 border border-slate-100 dark:border-[#17364E]/60">
            <span className="text-slate-500 dark:text-[#7F96AA] text-[11px]">Traffic State:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              trafficBadgeColor === 'emerald'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : trafficBadgeColor === 'amber'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}>
              {trafficState}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0B2033]/60 border border-slate-100 dark:border-[#17364E]/60">
            <span className="text-slate-500 dark:text-[#7F96AA] text-[11px]">Data Quality:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{dataQuality}</span>
            </span>
          </div>
        </div>

        {/* Speed Drift & Telemetry Cadence */}
        <div className="grid grid-cols-2 gap-2.5 pt-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0B2033]/60 border border-slate-100 dark:border-[#17364E]/60">
            <span className="text-slate-400 text-[10px] block uppercase font-medium">Mean Deviation</span>
            <span className={`font-bold tabular-nums ${Math.abs(currentSpeed - recentMean) > 2.0 ? 'text-amber-500' : 'text-slate-800 dark:text-white'}`}>
              {(currentSpeed - recentMean) >= 0 ? `+${(currentSpeed - recentMean).toFixed(1)}` : (currentSpeed - recentMean).toFixed(1)} mph
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0B2033]/60 border border-slate-100 dark:border-[#17364E]/60">
            <span className="text-slate-400 text-[10px] block uppercase font-medium">Sampling Rate</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              30s Cadence
            </span>
          </div>
        </div>
      </div>

      {/* Footer Nav Link */}
      <div className="pt-3 mt-4 border-t border-slate-100 dark:border-[#17364E]/80">
        <Link
          to="/network"
          onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); if (document.documentElement) document.documentElement.scrollTop = 0; if (document.body) document.body.scrollTop = 0; }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          <span>View Sensor on Network</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
