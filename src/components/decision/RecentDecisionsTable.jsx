import React from 'react';
import { History, CheckCircle2, XCircle } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';

const DEFAULT_RECENT_DECISIONS = [
  {
    time: "18:42:00",
    sensor: "773869",
    needScore: 0.58,
    decision: "QUERY",
    evidence: "3 Nodes",
    reason: "Spatial speed disagreement across adjacent corridor"
  },
  {
    time: "18:40:00",
    sensor: "767541",
    needScore: 0.74,
    decision: "QUERY",
    evidence: "2 Nodes",
    reason: "Downstream arterial speed validation"
  },
  {
    time: "18:35:00",
    sensor: "717445",
    needScore: 0.28,
    decision: "SKIP",
    evidence: "0 Nodes",
    reason: "Nominal conditions; low query priority"
  },
  {
    time: "18:30:00",
    sensor: "765171",
    needScore: 0.83,
    decision: "QUERY",
    evidence: "3 Nodes",
    reason: "Valley chokepoint residual uncertainty elevated"
  },
  {
    time: "18:25:00",
    sensor: "717447",
    needScore: 0.69,
    decision: "QUERY",
    evidence: "2 Nodes",
    reason: "Information debt accumulation from skip cycle"
  },
  {
    time: "18:20:00",
    sensor: "717816",
    needScore: 0.32,
    decision: "SKIP",
    evidence: "0 Nodes",
    reason: "Corridor telemetry within stable confidence band"
  },
  {
    time: "18:15:00",
    sensor: "767350",
    needScore: 0.82,
    decision: "QUERY",
    evidence: "3 Nodes",
    reason: "Regional boundary deficit; cross-validation acquired"
  }
];

export default function RecentDecisionsTable({ data, onSelectSensor }) {
  const list = (Array.isArray(data) && data.length > 0) ? data : DEFAULT_RECENT_DECISIONS;

  return (
    <SectionCard
      title="Recent Sensor Decisions"
      subtitle="Auditable log of automated evidence-on-demand query determinations"
      icon={History}
      action={<ScientificBadge type="DERIVED" label="DECISION LOG" size="xs" />}
      className="flex flex-col"
    >
      <div className="rounded-xl border border-slate-200 dark:border-[#17364E] overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-100 dark:bg-[#0B2033] border-b border-slate-200 dark:border-[#17364E] text-slate-500 dark:text-[#8295A8] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Replay Time</th>
                <th className="py-2.5 px-3">Sensor</th>
                <th className="py-2.5 px-3 text-right">Need</th>
                <th className="py-2.5 px-3 text-center">Decision</th>
                <th className="py-2.5 px-3">Evidence</th>
                <th className="py-2.5 px-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 text-slate-700 dark:text-[#B8C7D8]">
              {list.map((row, idx) => {
                const isQuery = (row.decision || '').toUpperCase() === 'QUERY';
                const score = typeof row.needScore === 'number' ? row.needScore.toFixed(2) : (row.score || "0.58");

                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectSensor && onSelectSensor(row.sensor || row.sensorId)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 text-slate-500 dark:text-[#8295A8] whitespace-nowrap">
                      {row.time || "18:42:00"}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {row.sensor || row.sensorId}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-cyan-600 dark:text-cyan-400 tabular-nums whitespace-nowrap">
                      {score}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isQuery
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {isQuery ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {row.decision || "QUERY"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {row.evidence || (isQuery ? "3 Nodes" : "0 Nodes")}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-[#B8C7D8] text-[11px] leading-snug">
                      {row.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
