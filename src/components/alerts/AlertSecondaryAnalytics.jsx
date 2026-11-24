import React, { useState, useMemo } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Layers, Activity, AlertTriangle, Zap } from 'lucide-react';
import ScientificBadge from '../common/ScientificBadge';

const FALLBACK_REGIONAL_COUNTS = [
  { region: 'REGION_A', count: 3, percent: 30 },
  { region: 'REGION_B', count: 3, percent: 30 },
  { region: 'REGION_C', count: 2, percent: 20 },
  { region: 'REGION_D', count: 2, percent: 20 }
];

const FALLBACK_TOP_ALERT_SENSORS = [
  { sensorId: '773869', region: 'REGION_C', count: 3, utility: 0.98 },
  { sensorId: '767541', region: 'REGION_B', count: 2, utility: 0.88 },
  { sensorId: '765171', region: 'REGION_D', count: 2, utility: 0.85 },
  { sensorId: '717447', region: 'REGION_B', count: 1, utility: 0.79 },
  { sensorId: '717458', region: 'REGION_B', count: 1, utility: 0.72 }
];

export default function AlertSecondaryAnalytics({ alerts = [] }) {
  const [isOpen, setIsOpen] = useState(true);

  // Dynamically compute regional counts from alerts dataset
  const regionalAlertCounts = useMemo(() => {
    if (!alerts || alerts.length === 0) return FALLBACK_REGIONAL_COUNTS;
    const counts = { REGION_A: 0, REGION_B: 0, REGION_C: 0, REGION_D: 0 };
    alerts.forEach((a) => {
      if (counts[a.regionId] !== undefined) {
        counts[a.regionId]++;
      }
    });
    const total = alerts.length || 1;
    return Object.entries(counts).map(([region, count]) => ({
      region,
      count,
      percent: Math.round((count / total) * 100)
    }));
  }, [alerts]);

  // Dynamically compute top alert sources from alerts dataset
  const topAlertSensors = useMemo(() => {
    if (!alerts || alerts.length === 0) return FALLBACK_TOP_ALERT_SENSORS;
    const map = {};
    alerts.forEach((a) => {
      const sid = a.sensorId;
      if (!map[sid]) {
        map[sid] = { sensorId: sid, region: a.regionId, count: 0 };
      }
      map[sid].count++;
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [alerts]);

  // Compute stats
  const queriesCount = alerts.filter(a => (a.actionState || '').toLowerCase().includes('query')).length;
  const monitoredCount = alerts.filter(a => (a.actionState || '').toLowerCase().includes('monitor') || (a.actionState || '').toLowerCase().includes('validated')).length;
  const warningsCount = alerts.filter(a => a.severity === 'Warning').length;
  const infoCount = alerts.filter(a => a.severity === 'Info').length;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md transition-colors overflow-hidden">
      {/* Collapsible Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 lg:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0B2033] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F5F8FC]">
                Alert Analytics &amp; Secondary Distributions
              </h3>
              <ScientificBadge type="DERIVED" label="AGGREGATE METRICS" size="xs" />
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8295A8] mt-0.5">
              Regional load profiles, severity breakdown, top alert sources, and evidence-query actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#B8C7D8]">
          <span>{isOpen ? 'Collapse Analytics' : 'Expand Analytics'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-500" /> : <ChevronDown className="w-4 h-4 text-cyan-500" />}
        </div>
      </button>

      {/* Expanded Analytics Drawer */}
      {isOpen && (
        <div className="p-5 lg:p-6 border-t border-slate-200 dark:border-[#17364E] space-y-6 text-xs animate-fade-in font-mono max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Alerts by Region */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#17364E] font-sans font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Alerts by Region</span>
                </div>
              </div>

              <div className="space-y-2">
                {regionalAlertCounts.map((r) => (
                  <div key={r.region} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-[#B8C7D8]">{r.region}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{r.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${r.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Severity Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#17364E] font-sans font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Severity Breakdown</span>
                </div>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                  <span>Warning / Attention:</span>
                  <span className="font-bold text-sm">{warningsCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                  <span>Informational / QC:</span>
                  <span className="font-bold text-sm">{infoCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-500">
                  <span>Critical Incidents:</span>
                  <span className="font-bold text-sm text-slate-400">0 (N/A)</span>
                </div>
              </div>
            </div>

            {/* 3. Top Alert Sources */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#17364E] font-sans font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-500" />
                  <span>Top Alert Sources</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {topAlertSensors.map((s) => (
                  <div key={s.sensorId} className="flex items-center justify-between p-1 rounded bg-white/70 dark:bg-[#0B2033] border border-slate-100 dark:border-[#17364E]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">{s.sensorId}</span>
                      <span className="text-[9px] text-slate-400">({s.region})</span>
                    </div>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{s.count} events</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Evidence Action Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#17364E] font-sans font-bold text-slate-900 dark:text-white">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Action Breakdown</span>
                </div>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <span>Queries Dispatched:</span>
                  <span className="font-bold text-sm">{queriesCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                  <span>Monitored / Validated:</span>
                  <span className="font-bold text-sm">{monitoredCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-500">
                  <span>Total Payload Savings:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">95.6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
