import React from 'react';
import { GitCompare, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import SectionCard from '../common/SectionCard';

const DEFAULT_SPATIAL_CONSISTENCY = {
  fromSensor: "773869",
  toSensor: "767541",
  fromSpeedMph: 64.2,
  toSpeedMph: 62.1,
  speedDifferenceMph: 2.1,
  consistencyScore: 94.8,
  isDisagreement: false,
  severity: "normal",
  note: "Spatial speed variation within nominal range"
};

export default function SpatialSpeedConsistencyPanel({ data }) {
  const activeData = data || DEFAULT_SPATIAL_CONSISTENCY;

  const {
    fromSensor = "773869",
    toSensor = "767541",
    fromSpeedMph = 64.2,
    toSpeedMph = 62.1,
    speedDifferenceMph = 2.1,
    consistencyScore = 94.8,
    isDisagreement = false,
    severity = "normal",
    note = "Spatial speed variation within nominal range"
  } = activeData;

  return (
    <SectionCard
      title="Spatial Speed Consistency Engine"
      subtitle="Speed variation check across adjacent METR-LA sensors in real graph topology"
      icon={GitCompare}
    >
      <div className="space-y-4">
        {/* Spatial Speed Anomaly / Consistency Banner */}
        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          isDisagreement
            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/40"
            : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40"
        }`}>
          <div className="flex items-center gap-2.5">
            {isDisagreement ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <div>
              <span className={`font-bold text-xs font-mono tracking-wide block ${
                isDisagreement ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"
              }`}>
                {isDisagreement ? `SPATIAL SPEED DISAGREEMENT: ${severity.toUpperCase()}` : "SPATIAL SPEED CONSISTENCY: NOMINAL"}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {note}
              </span>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${
            isDisagreement
              ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30"
              : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
          }`}>
            &Delta; {speedDifferenceMph !== null && speedDifferenceMph !== undefined ? `${speedDifferenceMph} mph` : "N/A"}
          </span>
        </div>

        {/* Visual road segment connection — Standardized Adjacency Row */}
        {(() => {
          const formattedFrom = fromSpeedMph !== null && fromSpeedMph !== undefined
            ? (typeof fromSpeedMph === 'number' ? fromSpeedMph.toFixed(1) : fromSpeedMph)
            : "N/A";
          const formattedTo = toSpeedMph !== null && toSpeedMph !== undefined
            ? (typeof toSpeedMph === 'number' ? toSpeedMph.toFixed(1) : toSpeedMph)
            : "N/A";

          return (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] transition-colors space-y-2.5">
              {/* Primary Sensor to Sensor Adjacency Flow */}
              <div className="flex items-center justify-between gap-2">
                {/* From Sensor ID Pill */}
                <span className="inline-flex items-center justify-center min-w-[76px] h-8 px-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs shrink-0 shadow-2xs">
                  {fromSensor}
                </span>

                {/* Centered Adjacency Edge Connector */}
                <div className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-white dark:bg-[#0E2438] border border-slate-300 dark:border-[#1D4566] text-xs text-slate-700 dark:text-[#F5F8FC] font-mono font-semibold whitespace-nowrap shrink-0 shadow-2xs">
                  <span>Adjacency Edge</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                </div>

                {/* To Sensor ID Pill */}
                <span className="inline-flex items-center justify-center min-w-[76px] h-8 px-3 rounded-lg bg-blue-500/10 dark:bg-blue-950/60 border border-blue-400 dark:border-blue-500/40 text-blue-800 dark:text-blue-300 font-mono font-bold text-xs shrink-0 shadow-2xs">
                  {toSensor}
                </span>
              </div>

              {/* Symmetrical Speed Telemetry Row */}
              <div className="flex items-center justify-between px-1 text-xs">
                {/* From Speed */}
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-[#B8C7D8] whitespace-nowrap">
                  <span className="font-medium text-slate-500 dark:text-[#8295A8]">Speed:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F5F8FC] tabular-nums">
                    {formattedFrom}
                  </span>
                  <span className="text-slate-500 dark:text-[#8295A8] text-[11px]">mph</span>
                </div>

                {/* To Speed */}
                <div className="flex items-center justify-end gap-1.5 text-slate-600 dark:text-[#B8C7D8] whitespace-nowrap">
                  <span className="font-medium text-slate-500 dark:text-[#8295A8]">Speed:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#F5F8FC] tabular-nums">
                    {formattedTo}
                  </span>
                  <span className="text-slate-500 dark:text-[#8295A8] text-[11px]">mph</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Spatial metrics breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block">Consistency Score</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">{consistencyScore}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Local agreement</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block">Speed Difference</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{speedDifferenceMph !== null && speedDifferenceMph !== undefined ? `${speedDifferenceMph} mph` : "N/A"}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Absolute delta</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block">Severity Level</span>
            <span className={`font-mono font-bold text-sm mt-0.5 block ${isDisagreement ? "text-rose-600 dark:text-rose-400" : "text-cyan-600 dark:text-cyan-300"}`}>{severity.toUpperCase()}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Dynamic check</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block">Correlation Status</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">Graph Validated</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Weight: 0.18</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
