import React from 'react';
import { Network, CheckCircle, AlertTriangle } from 'lucide-react';

export default function NeighborConsensusCard({
  sensorId = '773869',
  currentSpeed = 62.0,
  neighborCount = 6,
  neighborMeanSpeed = 63.4
}) {
  const diff = Number(Math.abs(currentSpeed - neighborMeanSpeed).toFixed(1));
  const isConsistent = diff < 3.5;

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xl transition-colors">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Neighbor Consensus
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-[#8295A8]">
                Adjacent sensor speed consistency
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
            isConsistent
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
          }`}>
            {isConsistent ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            <span>{isConsistent ? 'CONSISTENT' : 'DIVERGING'}</span>
          </span>
        </div>

        {/* Selected vs Neighbors Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-3 font-mono">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/60 dark:border-[#17364E]">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-medium">Selected ({sensorId})</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {currentSpeed.toFixed(1)} <span className="text-xs font-normal text-slate-400">mph</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200/60 dark:border-[#17364E]">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-medium">Neighbor Mean ({neighborCount} sensors)</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {neighborMeanSpeed.toFixed(1)} <span className="text-xs font-normal text-slate-400">mph</span>
            </div>
          </div>
        </div>

        {/* Spatial Difference Banner */}
        <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0B2033]/60 border border-slate-100 dark:border-[#17364E]/60 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 dark:text-[#7F96AA]">Spatial Speed Difference:</span>
          <span className={`font-bold tabular-nums ${
            isConsistent ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
          }`}>
            {diff} mph
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#17364E]/80 text-[10px] text-slate-400 font-mono">
        {isConsistent
          ? 'Adjacent sensors exhibit coherent corridor speeds.'
          : 'Elevated spatial gradient detected across graph edges.'}
      </div>

    </div>
  );
}
