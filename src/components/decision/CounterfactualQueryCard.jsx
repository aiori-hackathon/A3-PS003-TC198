import React from 'react';
import { HelpCircle, CheckCircle2, XCircle, Zap } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';

const DEFAULT_COUNTERFACTUAL = {
  sensorId: "767620",
  decision: "QUERY",
  expectedBenefit: "45%",
  uncertaintyReduction: "-22%",
  reason: "High uncertainty reduction and state coverage gain justify communication cost.",
  withoutQuery: {
    estimatedUncertainty: "36%",
    blindSpotRisk: "Moderate",
    informationDebt: 0.40,
    coverageGap: "40%"
  },
  withQuery: {
    estimatedUncertainty: "14%",
    blindSpotRisk: "Low",
    informationDebt: 0.00,
    coverageGain: "+20%",
    expectedCost: "~4.2 KB (proxy)"
  }
};

export default function CounterfactualQueryCard({ data, _onClose, onExecuteQuery }) {
  const activeData = data || DEFAULT_COUNTERFACTUAL;
  const {
    sensorId = "767620",
    withoutQuery = {},
    withQuery = {},
    expectedBenefit = "45%",
    uncertaintyReduction = "-22%",
    decision = "QUERY",
    reason
  } = activeData;

  const isQuery = decision === "QUERY";

  return (
    <SectionCard
      title={`Query Impact Evaluation — Sensor ${sensorId}`}
      subtitle="Counterfactual comparison estimating state benefit against telemetry byte cost"
      icon={HelpCircle}
      action={<ScientificBadge type="COUNTERFACTUAL" label="ESTIMATED BENEFIT" size="xs" />}
      className="flex flex-col"
    >
      <div className="space-y-4">
        {/* Without Query vs With Query Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs tabular-nums">
          {/* Without Query (Current State) */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2.5 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              <span className="text-[12px] font-bold">WITHOUT QUERY</span>
              <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                Current
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Uncertainty Proxy:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {withoutQuery.estimatedUncertainty || "36%"}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Information Debt:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                {withoutQuery.informationDebt !== undefined ? withoutQuery.informationDebt : 0.40}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Blind Spot Risk:</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {withoutQuery.blindSpotRisk || "Moderate"}
              </span>
            </div>
          </div>

          {/* With Query (Simulated / Projected State) */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 space-y-2.5 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-500/20 text-cyan-800 dark:text-cyan-300 font-semibold">
              <span className="text-[12px] font-bold">WITH QUERY</span>
              <span className="text-[10px] text-cyan-700 dark:text-cyan-300 font-mono uppercase bg-blue-100/80 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                Projected
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Uncertainty Proxy:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {withQuery.estimatedUncertainty || "14%"}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  ({uncertaintyReduction})
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Information Debt:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {withQuery.informationDebt !== undefined ? withQuery.informationDebt : 0.00}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Coverage Gain:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {withQuery.coverageGain || "+20%"}
              </span>
            </div>
          </div>
        </div>

        {/* Rationale Quote */}
        {reason && (
          <p className="text-xs text-slate-600 dark:text-[#B8C7D8] italic bg-slate-50 dark:bg-[#071624] p-2.5 rounded-lg border border-slate-200 dark:border-[#17364E] leading-normal">
            &ldquo;{reason}&rdquo;
          </p>
        )}

        {/* State Benefit & Execution Strip */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-[#8295A8] font-medium">Estimated State Benefit:</span>
              <span className="text-xs font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                DERIVED
              </span>
            </div>
            <div className="text-[18px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {String(expectedBenefit).startsWith('+') ? expectedBenefit : `+${expectedBenefit}`} Forecast Benefit
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-bold font-mono tracking-wider bg-white dark:bg-[#0B2033] border-slate-200 dark:border-[#17364E] whitespace-nowrap shrink-0">
              {isQuery ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="text-emerald-700 dark:text-emerald-300">DECISION: QUERY</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-[#B8C7D8]">DECISION: SKIP</span>
                </>
              )}
            </div>

            {isQuery && onExecuteQuery && (
              <button
                onClick={() => onExecuteQuery(sensorId)}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Query</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
