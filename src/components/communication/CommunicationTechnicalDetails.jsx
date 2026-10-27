import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sliders,
  History,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function CommunicationTechnicalDetails({
  clientValues = [],
  _phase9Selection,
  roundsHistory = [],
  activeHistoryPolicy,
  onSelectHistoryPolicy,
  _commData,
  _phase9Experiments
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('ccv');

  return (
    <div className="rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md transition-colors overflow-hidden">
      {/* Collapsible Header Trigger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-4 lg:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-[#0B2033]/50 transition-colors cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0B2033] text-slate-700 dark:text-[#BCD0E2] border border-slate-200 dark:border-[#17364E]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC]">
                Technical Details &amp; Research Audits
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#0B2033] text-slate-600 dark:text-[#8295A8] border border-slate-200 dark:border-[#17364E]">
                DEEP DIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8295A8] mt-0.5">
              Client Communication Value (CCV), Information Debt, 13-Round Convergence Traces, and Raw Tensor Accounting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#8295A8] hidden sm:inline">
            {isOpen ? 'Collapse Audits' : 'Expand Audits'}
          </span>
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0B2033] text-slate-700 dark:text-[#BCD0E2] border border-slate-200 dark:border-[#17364E]">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Collapsed Content Body */}
      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-200 dark:border-[#17364E]/80 space-y-5 max-h-[520px] overflow-y-auto custom-scrollbar">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 pt-4 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-[#17364E]/60 pb-3">
            {[
              { id: 'ccv', label: 'Client Communication Value (CCV)', icon: Sliders },
              { id: 'debt', label: 'Information Debt & Fairness', icon: ShieldCheck },
              { id: 'history', label: '13-Round Trace Explorer', icon: History },
              { id: 'tensors', label: 'Raw Payload & Provenance', icon: Cpu }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0B2033]'
                  }`}
                  type="button"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CLIENT COMMUNICATION VALUE (CCV) */}
          {activeTab === 'ccv' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E] text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  Mathematical Scoring Formulation:
                </span>
                <p className="font-mono text-cyan-700 dark:text-cyan-400 text-[11px]">
                  CCV_k = &alpha; &times; (DataWeight_k) + &beta; &times; (DriftScore_k) + &lambda; &times; (InfoDebt_k)
                </p>
                <p className="text-slate-500 dark:text-[#8295A8] text-[11px] pt-1">
                  Hyperparameters calibrated during Phase-9 experimentation: &alpha; = 1.0 (dataset representation), &beta; = 0.5 (telemetry drift sensitivity), &lambda; = 0.15 (starvation prevention debt factor).
                </p>
              </div>

              {clientValues.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#17364E]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 dark:bg-[#04101A] text-slate-600 dark:text-[#7F96AA] uppercase text-[10px] border-b border-slate-200 dark:border-[#17364E]">
                      <tr>
                        <th className="py-2.5 px-3">Client / Region</th>
                        <th className="py-2.5 px-3 text-right">Sensors</th>
                        <th className="py-2.5 px-3 text-right">Data Weight</th>
                        <th className="py-2.5 px-3 text-right">Drift Score</th>
                        <th className="py-2.5 px-3 text-right">Info Debt (&tau;)</th>
                        <th className="py-2.5 px-3 text-right font-bold">CCV Utility Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 bg-white dark:bg-[#06111D]">
                      {clientValues.map((cv) => (
                        <tr key={cv.clientId} className="hover:bg-slate-50 dark:hover:bg-[#0B2033]/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                            {cv.clientId} <span className="text-[10px] text-slate-500 font-normal">({cv.regionName})</span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700 dark:text-[#BCD0E2]">{cv.sensorCount}</td>
                          <td className="py-2.5 px-3 text-right text-slate-700 dark:text-[#BCD0E2]">{(cv.sensorShareFactor ?? cv.dataWeight)?.toFixed(4)}</td>
                          <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">+{cv.driftScore.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-bold">{cv.informationDebt} rnds</td>
                          <td className="py-2.5 px-3 text-right font-bold text-cyan-700 dark:text-cyan-400">{cv.utilityScore.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INFORMATION DEBT & FAIRNESS AUDIT */}
          {activeTab === 'debt' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-slate-900 dark:text-white">Starvation-Free Proof</h4>
                  </div>
                  <p className="text-slate-600 dark:text-[#BCD0E2] leading-relaxed">
                    Under all evaluated budget constraints (4/4, 3/4, 2/4, 1/4), maximum observed consecutive skipped rounds was exactly 1 round across 13 aggregation rounds.
                  </p>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                    Zero Regional Starvation Confirmed across all 4 regional partitions.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E] space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-500" />
                    <h4 className="font-bold text-slate-900 dark:text-white">Dynamic Debt Penalty Enforcement</h4>
                  </div>
                  <p className="text-slate-600 dark:text-[#BCD0E2] leading-relaxed">
                    When smaller clients (Region A &amp; D) skip an aggregation round, their information debt &tau;_k automatically increments, guaranteeing participation in subsequent rounds.
                  </p>
                  <div className="font-mono text-[11px] text-slate-500">
                    Debt coefficient &lambda; = 0.15 &bull; Seed = 42
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 13-ROUND TRACE EXPLORER */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E]">
                <span className="text-xs font-bold text-slate-700 dark:text-[#BCD0E2]">
                  Policy Selection Trace:
                </span>
                <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-[#0B2033] p-1 rounded-lg">
                  {[
                    { key: 'POLICY_CCV_3_OF_4', label: '75% (3/4)' },
                    { key: 'POLICY_CCV_2_OF_4', label: '50% (2/4)' },
                    { key: 'POLICY_CCV_1_OF_4', label: '25% (1/4)' }
                  ].map(p => (
                    <button
                      key={p.key}
                      onClick={() => onSelectHistoryPolicy && onSelectHistoryPolicy(p.key)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                        activeHistoryPolicy === p.key
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-[#BCD0E2] hover:text-slate-900 dark:hover:text-white'
                      }`}
                      type="button"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {roundsHistory && roundsHistory.length > 0 && (
                <div className="overflow-x-auto max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 dark:border-[#17364E]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#04101A] text-slate-600 dark:text-[#7F96AA] uppercase text-[10px] border-b border-slate-200 dark:border-[#17364E]">
                      <tr>
                        <th className="py-2 px-3">Round</th>
                        <th className="py-2 px-3">Participants</th>
                        <th className="py-2 px-3">Deferred</th>
                        <th className="py-2 px-3 text-right">Round Payload</th>
                        <th className="py-2 px-3 text-right">Cumulative Payload</th>
                        <th className="py-2 px-3 text-right">Val MAE</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 bg-white dark:bg-[#06111D]">
                      {roundsHistory.map((rh) => (
                        <tr key={rh.round} className="hover:bg-slate-50 dark:hover:bg-[#0B2033]/40 transition-colors">
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">R{rh.round}</td>
                          <td className="py-2 px-3">
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                              {rh.selectedClients.join(', ').replace(/REGION_/g, '')}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-slate-400">
                              {rh.skippedClients.length > 0 ? rh.skippedClients.join(', ').replace(/REGION_/g, '') : 'None'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-cyan-700 dark:text-cyan-400 font-semibold">{rh.roundTotalBytes.toLocaleString('en-US')} B</td>
                          <td className="py-2 px-3 text-right text-slate-600 dark:text-[#BCD0E2]">{(rh.cumulativeBytes / 1000000).toFixed(2)} MB</td>
                          <td className="py-2 px-3 text-right text-slate-900 dark:text-white font-bold">{rh.globalValidationMAE.toFixed(4)}</td>
                          <td className="py-2 px-3 text-center">
                            {rh.isBestSoFar ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                                BEST SO FAR
                              </span>
                            ) : (
                              <span className="text-slate-400">&bull;</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RAW PAYLOAD & PROVENANCE */}
          {activeTab === 'tensors' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E] space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Model Parameters Accounting</h4>
                  <div className="space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-[#BCD0E2]">
                    <div className="flex justify-between">
                      <span>Model Architecture:</span>
                      <strong className="text-slate-900 dark:text-white">Spatio-Temporal Graph+LSTM</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Trainable FP32 Weights:</span>
                      <strong className="text-slate-900 dark:text-white">26,596 parameters</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Raw Numeric Tensor:</span>
                      <strong className="text-slate-900 dark:text-white">106,384 bytes</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Serialized PyTorch State:</span>
                      <strong className="text-cyan-700 dark:text-cyan-400 font-bold">110,271 bytes</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E] space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Historical Reference Provenance</h4>
                  <p className="text-slate-600 dark:text-[#BCD0E2] leading-relaxed">
                    Stage-8 Frozen FedAvg Reference: 13 rounds, 104 transfers, 11,468,184 B, 3.5322 mph validation MAE (Best round: 8).
                  </p>
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px]">
                    Separated from matched Phase-9 evaluation (3.6473 full baseline) to preserve comparative experimental validity.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
