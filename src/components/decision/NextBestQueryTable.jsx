import React, { useState } from 'react';
import { Sparkles, Zap, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';
import Button from '../common/Button';

export default function NextBestQueryTable({ onQuery, onSelectSensor, data }) {
  const [showFullRanking, setShowFullRanking] = useState(true);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);

  // Normalize candidate list from live backend
  const candidates = (Array.isArray(data) && data.length > 0)
    ? data.map((item, idx) => ({
        rank: idx + 1,
        sensorId: item.sensor || item.sensorId || `S${idx + 1}`,
        regionId: item.region || item.regionId || item.sector || 'REGION_B',
        needScore: typeof item.needScore === 'number' ? item.needScore : parseFloat(item.needScore) || 0.80,
        queryUtility: typeof item.queryUtility === 'number' ? item.queryUtility : (typeof item.utility === 'number' ? item.utility : parseFloat(item.queryUtility || 0.95 - idx * 0.05)),
        expectedBenefit: item.expectedBenefit || `+${Math.max(5, 49 - idx * 8)}%`,
        reason: item.reason || 'Spatio-temporal disagreement with high information utility',
        payload: '187 B / compact query',
        detailedPayloadProxy: '~4.2 KB telemetry proxy',
        isPrimary: idx === 0
      }))
    : [
        {
          rank: 1,
          sensorId: "771667",
          regionId: "REGION_B",
          needScore: 0.83,
          queryUtility: 0.97,
          expectedBenefit: "+49.0%",
          reason: "Spatial speed disagreement across adjacent corridor",
          payload: "187 B / compact query",
          detailedPayloadProxy: "~4.2 KB telemetry proxy",
          isPrimary: true
        },
        {
          rank: 2,
          sensorId: "765171",
          regionId: "REGION_D",
          needScore: 0.83,
          queryUtility: 0.97,
          expectedBenefit: "+49.0%",
          reason: "Valley chokepoint; high residual uncertainty",
          payload: "187 B / compact query",
          detailedPayloadProxy: "~4.2 KB telemetry proxy",
          isPrimary: false
        },
        {
          rank: 3,
          sensorId: "767350",
          regionId: "REGION_D",
          needScore: 0.82,
          queryUtility: 0.96,
          expectedBenefit: "+49.0%",
          reason: "Regional boundary deficit with elevated information debt",
          payload: "187 B / compact query",
          detailedPayloadProxy: "~4.2 KB telemetry proxy",
          isPrimary: false
        },
        {
          rank: 4,
          sensorId: "767541",
          regionId: "REGION_B",
          needScore: 0.74,
          queryUtility: 0.88,
          expectedBenefit: "+38.0%",
          reason: "Corridor neighbor speed validation",
          payload: "187 B / compact query",
          detailedPayloadProxy: "~4.2 KB telemetry proxy",
          isPrimary: false
        },
        {
          rank: 5,
          sensorId: "717447",
          regionId: "REGION_C",
          needScore: 0.69,
          queryUtility: 0.82,
          expectedBenefit: "+29.0%",
          reason: "Topological arterial bridge with stale telemetry",
          payload: "187 B / compact query",
          detailedPayloadProxy: "~4.2 KB telemetry proxy",
          isPrimary: false
        }
      ];

  const bestCandidate = candidates[0];
  const top5 = candidates.slice(0, 5);
  const maxUtility = Math.max(...top5.map(c => c.queryUtility), 1.0);

  return (
    <SectionCard
      title="Next-Best Query Recommendations"
      subtitle="Ranked acquisition candidates maximizing forecast benefit per communication byte"
      icon={Sparkles}
      action={<ScientificBadge type="DERIVED" label="QUERY UTILITY" size="xs" />}
      className="flex flex-col"
    >
      <div className="space-y-4">
        {/* Best Next Query Highlight Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-[#0B2033] dark:to-[#091E2F] border border-blue-200 dark:border-[#1E4364] shadow-2xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-400 bg-blue-100/80 dark:bg-blue-900/40 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700/50">
                BEST CANDIDATE
              </span>
              <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                Sensor {bestCandidate.sensorId}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                ({bestCandidate.regionId})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-[#8295A8]">Query Utility:</span>
              <span className="text-sm font-mono font-extrabold text-cyan-600 dark:text-cyan-300 tabular-nums">
                {bestCandidate.queryUtility.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-[#B8C7D8] leading-relaxed mb-3">
            {bestCandidate.reason}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-blue-100 dark:border-[#17364E] text-xs">
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              <span>Payload: <strong className="text-slate-800 dark:text-slate-200">{bestCandidate.payload}</strong></span>
              <span>Need: <strong className="text-slate-800 dark:text-slate-200">{bestCandidate.needScore.toFixed(2)}</strong></span>
            </div>

            <Button
              size="xs"
              variant="primary"
              onClick={() => onQuery && onQuery(bestCandidate)}
              className="flex items-center gap-1.5 px-3 py-1 font-semibold text-xs shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Execute Query</span>
            </Button>
          </div>
        </div>

        {/* Top 5 Query Candidates (Horizontal Utility Bars) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Top-5 Candidates by Utility</span>
            <span className="font-mono text-[11px] lowercase text-slate-400">utility score</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {top5.map((c, idx) => {
              const isBest = idx === 0;
              const barPercent = Math.min(100, (c.queryUtility / maxUtility) * 100);
              const isHovered = hoveredCandidate === c.sensorId;

              return (
                <div
                  key={c.sensorId}
                  onMouseEnter={() => setHoveredCandidate(c.sensorId)}
                  onMouseLeave={() => setHoveredCandidate(null)}
                  onClick={() => onSelectSensor && onSelectSensor(c)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                    isBest
                      ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 hover:border-blue-400"
                      : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500 w-4">
                        #{c.rank}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {c.sensorId}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {c.regionId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-extrabold text-cyan-600 dark:text-cyan-400 tabular-nums">
                        {c.queryUtility.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onQuery) onQuery(c);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Query sensor"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isBest
                          ? "bg-blue-600 dark:bg-cyan-400"
                          : "bg-slate-400 dark:bg-slate-600"
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>

                  {/* Hover Detail Tooltip */}
                  {isHovered && (
                    <div className="absolute left-0 -top-11 z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] shadow-lg border border-slate-700 pointer-events-none whitespace-normal max-w-sm animate-fade-in">
                      <span className="font-bold text-cyan-300">Sensor {c.sensorId}: </span>
                      {c.reason} ({c.payload})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Full Query Ranking Table */}
        <div className="pt-2 border-t border-slate-200 dark:border-[#17364E]">
          <button
            onClick={() => setShowFullRanking(!showFullRanking)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#071624] hover:bg-slate-100 dark:hover:bg-[#0C243B] text-xs font-semibold text-slate-700 dark:text-[#B8C7D8] border border-slate-200 dark:border-[#17364E] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Full Query Ranking ({candidates.length} candidates)</span>
            </div>
            {showFullRanking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFullRanking && (
            <div className="mt-2 rounded-lg border border-slate-200 dark:border-[#17364E] overflow-hidden">
              <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-[#0B2033] border-b border-slate-200 dark:border-[#17364E] text-slate-500 dark:text-[#8295A8] text-[11px] uppercase">
                    <tr>
                      <th className="py-2 px-2.5 w-8">#</th>
                      <th className="py-2 px-2.5">Sensor</th>
                      <th className="py-2 px-2.5">Region</th>
                      <th className="py-2 px-2.5 text-right">Utility</th>
                      <th className="py-2 px-2.5 text-right">Need</th>
                      <th className="py-2 px-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 text-slate-700 dark:text-[#B8C7D8]">
                    {candidates.map((c) => (
                      <tr
                        key={c.sensorId}
                        onClick={() => onSelectSensor && onSelectSensor(c)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                      >
                        <td className="py-1.5 px-2.5 text-slate-400">{c.rank}</td>
                        <td className="py-1.5 px-2.5 font-bold text-slate-900 dark:text-white">{c.sensorId}</td>
                        <td className="py-1.5 px-2.5 text-slate-500">{c.regionId}</td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-cyan-600 dark:text-cyan-400">{c.queryUtility.toFixed(2)}</td>
                        <td className="py-1.5 px-2.5 text-right">{c.needScore.toFixed(2)}</td>
                        <td className="py-1.5 px-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onQuery) onQuery(c);
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-cyan-300 border border-blue-500/30 cursor-pointer"
                          >
                            Query
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
