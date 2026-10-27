import React from 'react';
import { Activity, Search, AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import SectionCard from '../common/SectionCard';

const CATEGORIES = ['All', 'Uncertainty', 'Drift', 'Spatial Disagreement', 'Coverage Gap', 'Data Quality', 'Evidence Query'];
const SEVERITIES = ['All', 'Warning', 'Info'];

export default function AlertStreamTable({
  alerts = [],
  selectedAlert,
  onSelectAlert,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSeverity,
  setSelectedSeverity
}) {
  const severityBadge = (sev) => {
    if (sev === 'Critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          CRITICAL
        </span>
      );
    }
    if (sev === 'Warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
        <Info className="w-3 h-3 text-cyan-500" />
        INFO
      </span>
    );
  };

  return (
    <SectionCard
      title="Attention &amp; Evidence Stream"
      subtitle="Active arterial anomaly conditions and automated evidence actions"
      icon={Activity}
      action={
        <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E] text-cyan-700 dark:text-cyan-400 leading-none whitespace-nowrap shrink-0">
          {alerts.length} Matching Events
        </span>
      }
      className="flex flex-col"
    >
      <div className="space-y-3.5">
        {/* Compact Integrated Filter Toolbar (Prompt Section 12) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2.5 transition-colors">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#8295A8] absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sensor (e.g. 773869), region, or keyword..."
                className="w-full h-8 pl-9 pr-3 bg-white dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] rounded-lg text-xs text-slate-900 dark:text-[#F5F8FC] placeholder:text-slate-400 dark:placeholder:text-[#8295A8] focus:outline-none focus:border-cyan-500 leading-none"
              />
            </div>

            {/* Severity Toolbar */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-[#8295A8] font-medium whitespace-nowrap">Severity:</span>
              <div className="flex items-center gap-1 bg-white dark:bg-[#0B2033] p-0.5 rounded-lg border border-slate-200 dark:border-[#17364E] text-xs h-8">
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeverity(s)}
                    className={`inline-flex items-center justify-center h-6.5 px-2.5 rounded text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap leading-none ${
                      selectedSeverity === s
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-[#B8C7D8] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-[#8295A8] font-medium mr-1 flex items-center gap-1 whitespace-nowrap shrink-0">
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center justify-center h-6 px-2.5 rounded-md whitespace-nowrap transition-colors font-medium text-[11px] cursor-pointer shrink-0 leading-none ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-white dark:bg-[#0B2033] text-slate-600 dark:text-[#B8C7D8] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#17364E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stream Table with Sticky Header & Controlled Max Height (Prompt Section 13/14) */}
        <div className="rounded-xl border border-slate-200 dark:border-[#17364E] overflow-hidden bg-white dark:bg-[#071726] shadow-xs">
          <div className="overflow-x-auto max-h-[360px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-[#0B2033] border-b border-slate-200 dark:border-[#17364E] shadow-2xs">
                <tr className="text-slate-600 dark:text-[#8295A8] text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Sensor / Region</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-2 text-center">Severity</th>
                  <th className="py-2.5 px-3 font-sans">Summary &amp; Findings</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 text-slate-700 dark:text-[#B8C7D8] bg-white dark:bg-[#071726]">
                {alerts.length > 0 ? (
                  alerts.map((alt) => {
                    const isSelected = selectedAlert?.id === alt.id;

                    return (
                      <tr
                        key={alt.id}
                        onClick={() => onSelectAlert && onSelectAlert(alt)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-[#0F2B48] font-semibold text-slate-900 dark:text-white'
                            : 'hover:bg-slate-50/80 dark:hover:bg-[#0B2033]/60'
                        }`}
                      >
                        <td className={`py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-[#8295A8] tabular-nums border-l-4 ${
                          isSelected ? 'border-l-blue-600 dark:border-l-cyan-400 font-bold' : 'border-l-transparent'
                        }`}>
                          {alt.timestamp.slice(11)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white">{alt.sensorId}</span>
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 ml-1">({alt.regionId})</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#06111D] border border-slate-200 dark:border-[#17364E] text-[11px]">
                            {alt.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          {severityBadge(alt.severity)}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-800 dark:text-[#E2EDF8] max-w-sm truncate leading-snug">
                          {alt.summary}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            isSelected ? 'text-blue-600 dark:text-cyan-300 font-bold' : 'text-slate-400 hover:text-blue-500'
                          }`}>
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-[#8295A8] text-xs">
                      No matching events found for the active filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
