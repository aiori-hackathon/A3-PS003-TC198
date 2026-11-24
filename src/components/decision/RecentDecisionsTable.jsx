import React from 'react';
import { History, CheckCircle2, XCircle } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';
import { useReplay } from '../../context/ReplayContext';
import sensorLocationNames from '../../data/sensor_location_names.json';

export default function RecentDecisionsTable({ data, onSelectSensor }) {
  const { timeIndex } = useReplay();

  const formatOffsetTime = (offsetMins) => {
    const totalMinutes = Math.max(0, (timeIndex || 0) * 5 - offsetMins);
    const h = String(Math.floor((totalMinutes / 60) % 24)).padStart(2, '0');
    const m = String(totalMinutes % 60).padStart(2, '0');
    return `${h}:${m}:00`;
  };

  const defaultDecisions = [
    {
      time: formatOffsetTime(0),
      sensor: "773869",
      needScore: 0.58,
      decision: "QUERY",
      evidence: "3 Nodes",
      reason: "Spatial speed disagreement across adjacent corridor"
    },
    {
      time: formatOffsetTime(2),
      sensor: "767541",
      needScore: 0.74,
      decision: "QUERY",
      evidence: "2 Nodes",
      reason: "Downstream arterial speed validation"
    },
    {
      time: formatOffsetTime(7),
      sensor: "717445",
      needScore: 0.28,
      decision: "SKIP",
      evidence: "0 Nodes",
      reason: "Nominal conditions; low query priority"
    },
    {
      time: formatOffsetTime(12),
      sensor: "765171",
      needScore: 0.83,
      decision: "QUERY",
      evidence: "3 Nodes",
      reason: "Valley chokepoint residual uncertainty elevated"
    },
    {
      time: formatOffsetTime(17),
      sensor: "717447",
      needScore: 0.69,
      decision: "QUERY",
      evidence: "2 Nodes",
      reason: "Information debt accumulation from skip cycle"
    },
    {
      time: formatOffsetTime(22),
      sensor: "717816",
      needScore: 0.32,
      decision: "SKIP",
      evidence: "0 Nodes",
      reason: "Corridor telemetry within stable confidence band"
    },
    {
      time: formatOffsetTime(27),
      sensor: "767350",
      needScore: 0.82,
      decision: "QUERY",
      evidence: "3 Nodes",
      reason: "Regional boundary deficit; cross-validation acquired"
    }
  ];

  const list = (Array.isArray(data) && data.length > 0) ? data : defaultDecisions;

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
                      {row.time || formatOffsetTime(idx * 5)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white block">{row.sensor || row.sensorId}</span>
                      {sensorLocationNames[row.sensor || row.sensorId]?.locationName && (
                        <span className="text-[10px] text-slate-400 font-sans truncate block max-w-[150px]">
                          {sensorLocationNames[row.sensor || row.sensorId].locationName}
                        </span>
                      )}
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
