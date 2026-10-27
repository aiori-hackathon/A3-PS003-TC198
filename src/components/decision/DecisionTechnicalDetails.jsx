import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Database, Shield, Cpu, Activity } from 'lucide-react';
import ScientificBadge from '../common/ScientificBadge';

const FACTOR_WEIGHT_TABLE = [
  { factor: "Spatial Influence", symbol: "w_1", weight: 0.15, domain: "[0.05, 1.0]", source: "Graph Laplacian & Node Centrality", type: "DERIVED" },
  { factor: "Prediction Uncertainty", symbol: "w_2", weight: 0.20, domain: "[0.0, 1.0]", source: "Multi-horizon residual σ_t", type: "CALIBRATED_PROXY" },
  { factor: "Spatial Speed Disagreement", symbol: "w_3", weight: 0.20, domain: "[0.0, 1.0]", source: "Adjacent corridor speed delta", type: "REAL_TELEMETRY" },
  { factor: "Speed Drift", symbol: "w_4", weight: 0.15, domain: "[0.0, 1.0]", source: "Temporal median divergence", type: "REAL_TELEMETRY" },
  { factor: "Freshness Need", symbol: "w_5", weight: 0.10, domain: "[0.0, 1.0]", source: "Elapsed time since detailed query", type: "TEMPORAL_STATE" },
  { factor: "Information Debt", symbol: "w_6", weight: 0.10, domain: "[0.0, 1.0]", source: "Cumulative skip counter deficit", type: "DERIVED_STATE" },
  { factor: "Coverage Need", symbol: "w_7", weight: 0.10, domain: "[0.0, 1.0]", source: "Sub-network topological deficit", type: "TOPOLOGICAL" },
  { factor: "Data Quality", symbol: "w_8", weight: 0.05, domain: "[0.0, 1.0]", source: "Valid readings vs null mask ratio", type: "TELEMETRY_QC" },
  { factor: "Redundancy Penalty", symbol: "w_9", weight: -0.05, domain: "[-0.35, -0.05]", source: "Nearby queried neighbor density", type: "COMMUNICATION_PENALTY" }
];

export default function DecisionTechnicalDetails() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md transition-colors overflow-hidden">
      {/* Collapsible Trigger Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 lg:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0B2033] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F8FC]">
                Technical Decision Details &amp; Scientific Provenance
              </h3>
              <ScientificBadge type="FORMULA" label="9-FACTOR SPECIFICATION" size="xs" />
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8295A8] mt-0.5">
              Mathematical formulations, weighting matrices, kinematic bounds, and benchmark derivation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#B8C7D8]">
          <span>{isOpen ? 'Collapse Details' : 'Expand Details'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-500" /> : <ChevronDown className="w-4 h-4 text-cyan-500" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 lg:p-6 border-t border-slate-200 dark:border-[#17364E] space-y-6 text-xs animate-fade-in max-h-[500px] overflow-y-auto custom-scrollbar">
          {/* Formula Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>Dynamic Sensor Need Score Formulation</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-cyan-300 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
              <p className="leading-relaxed">
                NeedScore(s, t) = min(1.0, max(0.05, ∑ [w_i · F_i(s, t)] - w_redundancy · RedundancyPenalty(s, t)))
              </p>
              <p className="text-slate-400 text-[11px] mt-1.5">
                where F_i ∈ &#123;Spatial, Uncertainty, Disagreement, Drift, Freshness, Debt, Coverage, Health&#125;
              </p>
            </div>
          </div>

          {/* 9-Factor Weighting Matrix Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              <Database className="w-4 h-4 text-purple-500" />
              <span>Factor Weighting &amp; Provenance Matrix</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-[#17364E] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-100 dark:bg-[#0B2033] border-b border-slate-200 dark:border-[#17364E] text-slate-600 dark:text-[#8295A8] uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Factor Name</th>
                      <th className="py-2 px-3 text-center">Symbol</th>
                      <th className="py-2 px-3 text-right">Weight</th>
                      <th className="py-2 px-3">Domain</th>
                      <th className="py-2 px-3">Data Source</th>
                      <th className="py-2 px-3">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 text-slate-700 dark:text-[#B8C7D8]">
                    {FACTOR_WEIGHT_TABLE.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.factor}</td>
                        <td className="py-2 px-3 text-center text-cyan-600 dark:text-cyan-400">{row.symbol}</td>
                        <td className={`py-2 px-3 text-right font-bold ${row.weight < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {row.weight > 0 ? `+${row.weight.toFixed(2)}` : row.weight.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{row.domain}</td>
                        <td className="py-2 px-3 font-sans text-xs">{row.source}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            {row.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kinematic Rules & Consensus Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gate Rules */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Plausibility Gate Kinematic Thresholds</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-[#B8C7D8] font-mono text-[11px] leading-relaxed">
                <li>• <strong>Highway Speed Boundary:</strong> 0 ≤ v ≤ 85 mph</li>
                <li>• <strong>Temporal Acceleration Continuity:</strong> |Δv| ≤ 25 mph per 5-min step</li>
                <li>• <strong>Spatial Gradient Consistency:</strong> |v_target - &lt;v_neighbors&gt;| ≤ 30 mph</li>
              </ul>
              <p className="text-[10px] text-slate-500 italic mt-1">
                Note: Rule-based heuristic filters; not physical-law guarantees.
              </p>
            </div>

            {/* Protocol Accounting */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                <Activity className="w-4 h-4 text-cyan-500" />
                <span>Evidence Acquisition Accounting</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-[#B8C7D8] font-mono text-[11px] leading-relaxed">
                <li>• <strong>Compact Query Payload:</strong> 187 B serialized query header</li>
                <li>• <strong>Detailed Telemetry Proxy:</strong> ~4.2 KB payload per full telemetry pull</li>
                <li>• <strong>Confidence Stopping Condition:</strong> Epistemic residual uncertainty ≤ 15%</li>
                <li>• <strong>Jury Deliberation Quorum:</strong> 3+ multi-modal signals evaluated</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
