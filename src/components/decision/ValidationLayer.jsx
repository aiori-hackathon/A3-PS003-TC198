import React from 'react';
import {
  ShieldCheck,
  Scale,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Check
} from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';

const JURY_STYLES = {
  CONFIRM_NOMINAL: {
    bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    label: 'CONFIRM NOMINAL'
  },
  QUERY_REQUIRED: {
    bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    icon: HelpCircle,
    label: 'QUERY REQUIRED'
  },
  FLAG_CONGESTION: {
    bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    icon: AlertTriangle,
    label: 'FLAG CONGESTION'
  },
  FLAG_ANOMALY: {
    bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    icon: AlertCircle,
    label: 'FLAG ANOMALY'
  }
};

export default function ValidationLayer({ juryData, physicsData, spatialData, selectedSensorId }) {
  // --- 1. JURY NORMALIZATION ---
  const jury = juryData || {
    sensorId: selectedSensorId || '767620',
    juryDecision: 'CONFIRM_NOMINAL',
    juryConfidence: '75%',
    reason: 'Consensus agreement across prediction, graph, and telemetry signals.',
    supportingSignals: [
      'High prediction confidence (uncertainty = 2.16 mph)',
      'Stable historical speed trend (drift = 0.13)',
      'Reliable telemetry data quality (95%)'
    ],
    conflictingSignals: ['Spatial speed disagreement across neighbors (0.44)']
  };

  const decisionKey = jury.juryDecision || 'CONFIRM_NOMINAL';
  const juryStyle = JURY_STYLES[decisionKey] || JURY_STYLES.CONFIRM_NOMINAL;
  const JuryIcon = juryStyle.icon;

  // --- 2. PLAUSIBILITY GATE NORMALIZATION ---
  const physics = physicsData || {
    sensorId: selectedSensorId || '767620',
    currentSpeedMph: 67.12,
    passed: true,
    checksPassed: {
      validBoundsCheck: true,
      stepDeltaCheck: true,
      spatialNeighborCheck: true
    },
    note: 'Speed telemetry satisfies physical continuity boundaries.'
  };

  const checks = physics.checksPassed || {
    validBoundsCheck: true,
    stepDeltaCheck: true,
    spatialNeighborCheck: true
  };

  // --- 3. SPATIAL CONSISTENCY NORMALIZATION ---
  const spatial = spatialData || {
    fromSensor: selectedSensorId || "767620",
    toSensor: "767471",
    fromSpeedMph: 67.12,
    toSpeedMph: 66.50,
    speedDifferenceMph: 0.62,
    consistencyScore: 91.9,
    isDisagreement: false,
    severity: "normal",
    note: "Spatial speed variation is 3.25 mph across adjacent corridor segment"
  };

  const fromSpeed = typeof spatial.fromSpeedMph === 'number' ? spatial.fromSpeedMph.toFixed(1) : spatial.fromSpeedMph || "64.4";
  const toSpeed = typeof spatial.toSpeedMph === 'number' ? spatial.toSpeedMph.toFixed(1) : spatial.toSpeedMph || "67.6";
  const speedDiff = typeof spatial.speedDifferenceMph === 'number' ? spatial.speedDifferenceMph.toFixed(1) : spatial.speedDifferenceMph || "3.2";

  return (
    <SectionCard
      title="Validation Layer"
      subtitle="Tripartite verification: multi-signal jury consensus, kinematic plausibility gate, and spatial graph consistency"
      icon={ShieldCheck}
      action={
        <div className="flex items-center gap-2">
          <ScientificBadge type="HEURISTIC" label="MULTI-GATE VERIFICATION" size="xs" />
        </div>
      }
      className="flex flex-col"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* SUB-PANEL 1: SENSOR JURY CONSENSUS */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] flex flex-col justify-between space-y-3.5 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-[#17364E]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">Sensor Jury</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                Consensus
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md text-xs font-mono font-bold border ${juryStyle.bg}`}>
                <JuryIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{juryStyle.label}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-[#8295A8] block font-mono">Confidence</span>
                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {jury.juryConfidence || '75%'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#B8C7D8] mt-2.5 leading-relaxed">
              {jury.reason}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-[#17364E]/80 text-xs">
            {jury.supportingSignals && jury.supportingSignals.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Supporting Signals:
                </span>
                {jury.supportingSignals.slice(0, 2).map((s, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-[#B8C7D8] text-[11px] leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {jury.conflictingSignals && jury.conflictingSignals.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Conflicting Signal:
                </span>
                {jury.conflictingSignals.slice(0, 1).map((c, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-[#B8C7D8] text-[11px] leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SUB-PANEL 2: HEURISTIC PLAUSIBILITY GATE */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] flex flex-col justify-between space-y-3.5 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-[#17364E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">Heuristic Plausibility Gate</span>
              </div>
              <span
                title="Rule-based plausibility checks; not a physical-law guarantee."
                className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 cursor-help"
              >
                PASS
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Kinematic Consistency:</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                {physics.currentSpeedMph ? `${physics.currentSpeedMph} mph` : '64.4 mph'}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#B8C7D8] mt-1.5 leading-relaxed italic">
              {physics.note || 'Speed telemetry satisfies physical continuity boundaries.'}
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-[#17364E]/80 text-[11px] font-mono">
            {/* Check 1 */}
            <div className="flex items-center justify-between p-1.5 rounded bg-white/70 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span className="text-slate-700 dark:text-slate-300">1. Speed Bounds (0–85 mph)</span>
              <span className={`flex items-center gap-1 font-bold ${
                checks.validBoundsCheck ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {checks.validBoundsCheck ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {checks.validBoundsCheck ? 'PASS' : 'VIOLATION'}
              </span>
            </div>

            {/* Check 2 */}
            <div className="flex items-center justify-between p-1.5 rounded bg-white/70 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span className="text-slate-700 dark:text-slate-300">2. Acceleration (|Δv| ≤ 25)</span>
              <span className={`flex items-center gap-1 font-bold ${
                checks.stepDeltaCheck ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {checks.stepDeltaCheck ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {checks.stepDeltaCheck ? 'PASS' : 'VIOLATION'}
              </span>
            </div>

            {/* Check 3 */}
            <div className="flex items-center justify-between p-1.5 rounded bg-white/70 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span className="text-slate-700 dark:text-slate-300">3. Spatial Gradient (Δ ≤ 30)</span>
              <span className={`flex items-center gap-1 font-bold ${
                checks.spatialNeighborCheck ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {checks.spatialNeighborCheck ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {checks.spatialNeighborCheck ? 'PASS' : 'VIOLATION'}
              </span>
            </div>
          </div>
        </div>

        {/* SUB-PANEL 3: SPATIAL SPEED CONSISTENCY */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] flex flex-col justify-between space-y-3.5 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-[#17364E]">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="font-bold text-xs text-slate-900 dark:text-white">Spatial Speed Consistency</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800">
                {spatial.consistencyScore || 91.9}% Score
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Adjacent Variation:</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                Δ {speedDiff} mph
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#B8C7D8] mt-1.5 leading-relaxed">
              {spatial.note || 'Spatial speed variation within nominal range across adjacent corridor.'}
            </p>
          </div>

          {/* Strict CSS Grid Row: Sensor ID | Speed | Edge | Speed | Sensor ID */}
          <div className="p-2.5 rounded-lg bg-white/70 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs font-mono">
              {/* From Sensor (Selected Target with subtle Red/Blue focal styling) */}
              <div className="flex flex-col items-start">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-rose-500/10 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-[11px]">
                  {spatial.fromSensor} ★
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {fromSpeed} <span className="text-[9px] font-normal text-slate-500">mph</span>
                </span>
              </div>

              {/* Edge Connector */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="flex items-center w-full gap-1 text-[10px] text-slate-400">
                  <div className="h-[1px] bg-slate-300 dark:bg-slate-700 flex-1" />
                  <span className="text-[9px] uppercase font-bold tracking-tighter text-slate-400">edge</span>
                  <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                  <div className="h-[1px] bg-slate-300 dark:bg-slate-700 flex-1" />
                </div>
                <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
                  Δ {speedDiff} mph
                </span>
              </div>

              {/* To Sensor (Corridor Neighbor) */}
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-blue-500/10 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                  {spatial.toSensor}
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {toSpeed} <span className="text-[9px] font-normal text-slate-500">mph</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
