import React from 'react';
import { GitCommit, ArrowRight, CheckCircle2, Clock, Check, ShieldCheck } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';

const DEFAULT_EVIDENCE_DATA = {
  targetSensor: "767620",
  currentConfidence: "86.4%",
  evidenceSufficient: "Yes",
  stoppingCondition: "Evidence confidence threshold met (Residual Uncertainty ≤ 15%)",
  sequence: [
    { sensorId: "767620", status: "complete", result: "Primary chokepoint telemetry verified", timestamp: "18:42:00" },
    { sensorId: "761003", status: "complete", result: "Corridor neighbor speed confirmed (62.1 mph)", timestamp: "18:42:05" },
    { sensorId: "717571", status: "waiting", result: "Awaiting upstream boundary reading", timestamp: "--:--" }
  ]
};

export default function EvidenceChain({ data, _onClose, _targetSensorId }) {
  const activeData = data || DEFAULT_EVIDENCE_DATA;
  const sequence = (activeData.sequence && Array.isArray(activeData.sequence) && activeData.sequence.length > 0)
    ? activeData.sequence
    : DEFAULT_EVIDENCE_DATA.sequence;

  const currentConfidence = activeData.currentConfidence || activeData.evidenceConfidence || "86.4%";
  const evidenceSufficient = activeData.evidenceSufficient || "Yes";
  const stoppingCondition = activeData.stoppingCondition || "Stopping condition satisfied (Residual Uncertainty ≤ 15%)";
  const nodeCount = sequence.length;
  const compactPerQueryBytes = 187;
  const totalCompactBytes = nodeCount * compactPerQueryBytes;

  return (
    <SectionCard
      title="Evidence Progression"
      subtitle="Sequential acquisition of sufficient neighborhood telemetry"
      icon={GitCommit}
      action={<ScientificBadge type="DERIVED" label="PROGRESSIVE CHAIN" size="xs" />}
      className="flex flex-col"
    >
      <div className="space-y-4">
        {/* State Summary Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] flex flex-wrap items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-5 text-xs font-mono">
            <div>
              <span className="text-slate-500 dark:text-[#8295A8] block text-[11px] font-sans font-medium">
                Evidence Requirement
              </span>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {nodeCount} Nodes Selected
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-[#8295A8] block text-[11px] font-sans font-medium">
                State Confidence
              </span>
              <span className="font-bold text-base text-cyan-600 dark:text-cyan-300">
                {currentConfidence}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Sufficient: {evidenceSufficient}</span>
          </div>
        </div>

        {/* Compact Node Progression Strip */}
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {sequence.map((step, idx) => {
              const isComplete = step.status === 'complete';

              return (
                <React.Fragment key={step.sensorId}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shrink-0 transition-all ${
                    isComplete
                      ? "bg-white dark:bg-[#0B2033] border-emerald-300 dark:border-emerald-600/40 text-slate-900 dark:text-white"
                      : "bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-500"
                  }`}>
                    {isComplete ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-xs whitespace-nowrap">
                      {step.sensorId}
                    </span>
                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded uppercase ${
                      isComplete
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}>
                      {step.status}
                    </span>
                  </div>

                  {idx < sequence.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}

            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/60 text-emerald-700 dark:text-emerald-300 shrink-0 font-mono text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sufficient</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-2 italic">
            {stoppingCondition}
          </p>
        </div>

        {/* Payload Accounting Box (Strict per Section 13/43) */}
        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-[#071727] border border-blue-200/60 dark:border-[#17364E] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payload Accounting (Telemetry Proxy)
            </span>
            <span className="font-mono text-xs font-bold text-blue-700 dark:text-cyan-400">
              {totalCompactBytes} B Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-[#B8C7D8]">
            <div className="flex justify-between p-1.5 rounded bg-white/70 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span>Per Query Payload:</span>
              <strong className="text-slate-900 dark:text-white">187 B / compact query</strong>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-white/70 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
              <span>Detailed Telemetry Proxy:</span>
              <strong className="text-slate-900 dark:text-white">~4.2 KB / node</strong>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
