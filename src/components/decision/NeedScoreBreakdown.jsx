import React, { useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';

const FACTOR_DEFINITIONS = {
  "Spatial Influence": {
    desc: "Graph eigenvector centrality and downstream node degree impact.",
    weight: 0.15
  },
  "Prediction Uncertainty": {
    desc: "Calibrated model epistemic uncertainty from multi-horizon forecast residual.",
    weight: 0.20
  },
  "Spatial Speed Disagreement": {
    desc: "Speed delta between target sensor and its k-nearest graph neighbors.",
    weight: 0.20
  },
  "Speed Drift": {
    desc: "Temporal rate of change in speed over recent window relative to median.",
    weight: 0.15
  },
  "Freshness Need": {
    desc: "Time elapsed since last active high-fidelity telemetry sample was pulled.",
    weight: 0.10
  },
  "Information Debt": {
    desc: "Cumulative divergence between predicted state and actual road traffic from skips.",
    weight: 0.10
  },
  "Coverage Need": {
    desc: "Regional topological coverage deficit within the local cluster.",
    weight: 0.10
  },
  "Data Quality": {
    desc: "Ratio of valid speed readings vs masked null records in METR-LA detectors.",
    weight: 0.05
  },
  "Redundancy Penalty": {
    desc: "Negative penalty applied when nearby connected sensors already provide sufficient telemetry.",
    weight: -0.05
  }
};

const DEFAULT_FACTORS = [
  { name: "Spatial Influence", value: 1.0, coefficient: 0.15, weightedContribution: 0.15, isNegative: false },
  { name: "Prediction Uncertainty", value: 0.36, coefficient: 0.20, weightedContribution: 0.07, isNegative: false },
  { name: "Spatial Speed Disagreement", value: 0.61, coefficient: 0.20, weightedContribution: 0.12, isNegative: false },
  { name: "Speed Drift", value: 0.05, coefficient: 0.15, weightedContribution: 0.01, isNegative: false },
  { name: "Freshness Need", value: 1.0, coefficient: 0.10, weightedContribution: 0.10, isNegative: false },
  { name: "Information Debt", value: 0.40, coefficient: 0.10, weightedContribution: 0.04, isNegative: false },
  { name: "Coverage Need", value: 0.40, coefficient: 0.10, weightedContribution: 0.04, isNegative: false },
  { name: "Data Quality", value: 0.95, coefficient: 0.05, weightedContribution: 0.05, isNegative: false },
  { name: "Redundancy Penalty", value: 0.05, coefficient: 0.05, weightedContribution: -0.01, isNegative: true }
];

export default function NeedScoreBreakdown({ data, onClose, sensorId: propSensorId }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Authoritative score resolution: MUST MATCH Top KPI
  const rawScore = data?.needScore ?? data?.finalNeedScore;
  const scoreNum = typeof rawScore === 'number' ? rawScore : (parseFloat(rawScore) || 0.58);
  const clampedScore = Math.min(1.0, Math.max(0.05, scoreNum));
  const sensorId = propSensorId || data?.sensorId || "767620";

  // Priority classification
  let priorityLabel = 'LOW QUERY PRIORITY';
  let priorityClass = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/40';
  let PriorityIcon = CheckCircle2;

  if (clampedScore >= 0.70) {
    priorityLabel = 'HIGH QUERY PRIORITY';
    priorityClass = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600/40';
    PriorityIcon = AlertCircle;
  } else if (clampedScore >= 0.40) {
    priorityLabel = 'MODERATE NEED';
    priorityClass = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600/40';
    PriorityIcon = AlertTriangle;
  }

  // Parse factor list cleanly
  let factors = DEFAULT_FACTORS;
  if (data?.factors) {
    if (Array.isArray(data.factors) && data.factors.length > 0) {
      factors = data.factors
        .filter(f => FACTOR_DEFINITIONS[f.name] !== undefined)
        .map(f => {
        const isNeg = f.isNegative || f.name?.toLowerCase().includes("redundancy");
        const val = typeof f.value === 'number' ? f.value : (parseFloat(f.value) || 0);
        const coeff = f.coefficient || (FACTOR_DEFINITIONS[f.name]?.weight ? Math.abs(FACTOR_DEFINITIONS[f.name].weight) : 0.10);
        const weighted = f.weightedContribution !== undefined ? f.weightedContribution : (isNeg ? -Math.abs(val * coeff) : val * coeff);
        return {
          name: f.name,
          value: Math.abs(val),
          coefficient: coeff,
          weightedContribution: weighted,
          isNegative: isNeg
        };
      });
    } else if (typeof data.factors === 'object') {
      const keys = [
        { key: "spatialInfluence", name: "Spatial Influence", coeff: 0.15, isNeg: false },
        { key: "uncertaintyProxy", name: "Prediction Uncertainty", coeff: 0.20, isNeg: false },
        { key: "spatialSpeedDisagreement", name: "Spatial Speed Disagreement", coeff: 0.20, isNeg: false },
        { key: "trafficDrift", name: "Speed Drift", coeff: 0.15, isNeg: false },
        { key: "freshness", name: "Freshness Need", coeff: 0.10, isNeg: false },
        { key: "informationDebt", name: "Information Debt", coeff: 0.10, isNeg: false },
        { key: "coverageNeed", name: "Coverage Need", coeff: 0.10, isNeg: false },
        { key: "sensorHealth", name: "Data Quality", coeff: 0.05, isNeg: false },
        { key: "redundancyPenalty", name: "Redundancy Penalty", coeff: 0.05, isNeg: true }
      ];
      factors = keys.map(k => {
        const val = data.factors[k.key] !== undefined ? data.factors[k.key] : 0.1;
        const numVal = typeof val === 'number' ? val : (parseFloat(val) || 0);
        const weighted = k.isNeg ? -Math.abs(numVal * k.coeff) : numVal * k.coeff;
        return {
          name: k.name,
          value: Math.abs(numVal),
          coefficient: k.coeff,
          weightedContribution: weighted,
          isNegative: k.isNeg
        };
      });
    }
  }

  const reasons = data?.reasons && data.reasons.length > 0 ? data.reasons : [
    "Spatial speed disagreement across adjacent corridor",
    "Core arterial chokepoint influence",
    "Regional topological coverage deficit"
  ];

  const strokeColor = clampedScore >= 0.70 ? '#ef4444' : clampedScore >= 0.40 ? '#f59e0b' : '#10b981';

  return (
    <SectionCard
      title={`Need Analysis — Sensor ${sensorId}`}
      subtitle="Derived 9-factor urgency assessment determining communication necessity"
      icon={Cpu}
      action={
        <div className="flex items-center gap-2">
          <ScientificBadge type="DERIVED" label="EVIDENCE SCORE" size="xs" />
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      }
      className="flex flex-col"
    >
      <div className="space-y-4">
        {/* Top Need Score Arc Gauge & Decision Classification */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] flex flex-col sm:flex-row items-center justify-between gap-5 transition-colors">
          {/* Gauge Arc */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              <svg height="86" width="160" viewBox="0 0 160 86" className="overflow-visible">
                {/* Background Arc */}
                <path
                  d="M 18 78 A 62 62 0 0 1 142 78"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-[#17364E]"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                {/* Active Score Arc */}
                <path
                  d="M 18 78 A 62 62 0 0 1 142 78"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray="194.78"
                  strokeDashoffset={194.78 * (1 - clampedScore)}
                  className="transition-all duration-500"
                />
                {/* Main Centered Score */}
                <text
                  x="80"
                  y="70"
                  textAnchor="middle"
                  className="font-mono text-[30px] font-extrabold fill-slate-900 dark:fill-[#F5F8FC] tabular-nums"
                >
                  {clampedScore.toFixed(2)}
                </text>
              </svg>
            </div>
            <div className="mt-1 text-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#8295A8]">
                RANGE [0.05, 1.00]
              </span>
            </div>
          </div>

          {/* Right Status Block */}
          <div className="space-y-2 text-center sm:text-right flex flex-col items-center sm:items-end">
            <div className={`inline-flex items-center gap-1.5 h-6 px-3 rounded-full text-xs font-mono font-bold border ${priorityClass}`}>
              <PriorityIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{priorityLabel}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#B8C7D8] max-w-xs leading-relaxed">
              Authoritative urgency gating metric combining spatio-temporal dynamics with telemetry quality.
            </p>
          </div>
        </div>

        {/* Primary Decision Triggers */}
        {reasons && reasons.length > 0 && (
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-blue-700 dark:text-cyan-400 block">
              Active Decision Triggers:
            </span>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-xs">
              {reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 9-Factor Decomposition Header */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>9-Factor Decomposition</span>
            <div className="flex items-center gap-3 font-mono text-[11px] lowercase text-slate-400">
              <span>value</span>
              <span>weighted</span>
            </div>
          </div>

          {/* Factor List */}
          <div className="space-y-2 text-xs">
            {factors.map((f, idx) => {
              const def = FACTOR_DEFINITIONS[f.name] || { desc: "Urgency contributor", weight: 0.10 };
              const barWidth = Math.min(100, Math.max(4, f.value * 100));
              const isHovered = activeTooltip === f.name;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveTooltip(f.name)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="p-2 rounded-lg bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all relative"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-800 dark:text-slate-200 font-medium text-xs">
                        {f.name}
                      </span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help" />
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs tabular-nums font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {f.value.toFixed(2)}
                      </span>
                      <span className={`w-14 text-right font-bold ${
                        f.isNegative
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-cyan-600 dark:text-cyan-400'
                      }`}>
                        {f.weightedContribution >= 0 ? `+${f.weightedContribution.toFixed(2)}` : f.weightedContribution.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Factor Influence Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        f.isNegative
                          ? 'bg-rose-500 shadow-xs'
                          : 'bg-cyan-500 dark:bg-cyan-400 shadow-xs'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute left-0 -top-11 z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] shadow-lg border border-slate-700 pointer-events-none whitespace-normal max-w-xs animate-fade-in">
                      <span className="font-bold text-cyan-300">{f.name}: </span>
                      {def.desc} (Weight: {f.isNegative ? '-' : '+'}{Math.abs(f.coefficient).toFixed(2)})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
