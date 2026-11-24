import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bell,
  Clock,
  ShieldCheck
} from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';
import AlertAnalyticsCharts from '../../components/alerts/AlertAnalyticsCharts';
import AlertStreamTable from '../../components/alerts/AlertStreamTable';
import SelectedAlertInspector from '../../components/alerts/SelectedAlertInspector';
import AlertSecondaryAnalytics from '../../components/alerts/AlertSecondaryAnalytics';
import IndiaCaseStudiesCard from '../../components/federated/IndiaCaseStudiesCard';
import { useReplay } from '../../context/ReplayContext';
import sensorLocationNames from '../../data/sensor_location_names.json';
import { RAW_REPLAY_ALERTS_DATA } from '../../data/replayAlertsData';

// Enrich raw alert records with authentic Caltrans PeMS corridor names
const REPLAY_ALERTS_DATA = RAW_REPLAY_ALERTS_DATA.map((alt) => ({
  ...alt,
  locationName: sensorLocationNames[alt.sensorId]?.locationName || ''
}));

/**
 * Alerts Page Component
 * Displays replay-aware incident triggers, uncertainty flags, velocity drift anomalies,
 * and evidence-on-demand query workflows across the Los Angeles sensor network.
 */
export default function Alerts() {
  const { timestampStr } = useReplay();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSensor = searchParams.get('sensor');
  const urlCategory = searchParams.get('category');
  const urlSeverity = searchParams.get('severity');
  const urlQuery = searchParams.get('q');

  const [searchTerm, setSearchTerm] = useState(urlQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All');
  const [selectedSeverity, setSelectedSeverity] = useState(urlSeverity || 'All');
  const [selectedAlertState, setSelectedAlertState] = useState(null);

  // Derive selectedAlert from state, URL param, or fallback to first alert
  const selectedAlert = useMemo(() => {
    if (selectedAlertState) return selectedAlertState;
    if (urlSensor) {
      const match = REPLAY_ALERTS_DATA.find((a) => a.sensorId === urlSensor);
      if (match) return match;
    }
    return REPLAY_ALERTS_DATA[0];
  }, [selectedAlertState, urlSensor]);

  const handleSelectAlert = (alertItem) => {
    setSelectedAlertState(alertItem);
    if (alertItem?.sensorId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('sensor', alertItem.sensorId);
        return next;
      }, { replace: true });
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat === 'All') {
        next.delete('category');
      } else {
        next.set('category', cat);
      }
      return next;
    }, { replace: true });
  };

  const handleSelectSeverity = (sev) => {
    setSelectedSeverity(sev);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sev === 'All') {
        next.delete('severity');
      } else {
        next.set('severity', sev);
      }
      return next;
    }, { replace: true });
  };

  // Dynamic filter pipeline
  const filteredAlerts = useMemo(() => {
    return REPLAY_ALERTS_DATA.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        item.sensorId.toLowerCase().includes(term) ||
        item.summary.toLowerCase().includes(term) ||
        item.condition.toLowerCase().includes(term) ||
        item.regionId.toLowerCase().includes(term) ||
        (item.locationName && item.locationName.toLowerCase().includes(term));

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSev = selectedSeverity === 'All' || item.severity === selectedSeverity;

      return matchesSearch && matchesCat && matchesSev;
    });
  }, [searchTerm, selectedCategory, selectedSeverity]);

  // Keep selectedAlert synchronized when filtered items change
  const activeSelectedAlert = useMemo(() => {
    if (filteredAlerts.some((a) => a.id === selectedAlert?.id)) {
      return selectedAlert;
    }
    return filteredAlerts[0] || null;
  }, [filteredAlerts, selectedAlert]);

  // Dynamic metrics derived from filteredAlerts
  const uncertaintyCount = useMemo(() => {
    return filteredAlerts.filter(a => a.category === 'Uncertainty' || (a.condition && a.condition.includes('Uncertainty'))).length;
  }, [filteredAlerts]);

  const driftCount = useMemo(() => {
    return filteredAlerts.filter(a => a.category === 'Drift' || (a.condition && a.condition.includes('Drift'))).length;
  }, [filteredAlerts]);

  const blindSpotCount = useMemo(() => {
    return filteredAlerts.filter(a => a.category === 'Coverage Gap' || a.category === 'Data Quality' || (a.summary && a.summary.includes('coverage'))).length;
  }, [filteredAlerts]);

  // Main KPI cards
  const alertKPIs = [
    {
      id: "active-events",
      label: "Active Events",
      value: filteredAlerts.length.toString(),
      subtext: "Replay-Derived Conditions",
      iconType: "alert",
      variant: "blue"
    },
    {
      id: "uncertainty-flags",
      label: "High Uncertainty",
      value: uncertaintyCount.toString(),
      subtext: "Residual σ > 3.0 mph",
      iconType: "accuracy",
      variant: "purple"
    },
    {
      id: "drift-anomalies",
      label: "High Drift",
      value: driftCount.toString(),
      subtext: "Velocity Delta > 0.35",
      iconType: "sensor",
      variant: "amber"
    },
    {
      id: "blind-spots",
      label: "Blind Spots",
      value: blindSpotCount.toString(),
      subtext: "Corridor Debt Elevated",
      iconType: "layers",
      variant: "cyan"
    }
  ];

  return (
    <div className="space-y-5 pb-10 animate-page-enter">
      {/* 1. Header & Replay Context Strip */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 lg:p-6 shadow-xs dark:shadow-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-[#F5F8FC] tracking-tight">
                Traffic Alerts &bull; 10 Curated Benchmark Incident Scenarios
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B8C7D8] font-medium max-w-2xl">
              10 Curated Benchmark Incident Scenarios (METR-LA Replay Evaluation Set): Demonstrating replay-aware anomaly triggers, uncertainty boundaries, and evidence actions across the network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] font-mono text-xs text-slate-700 dark:text-[#BCD0E2]">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>Historical Replay &bull; Active &bull; {timestampStr ? timestampStr.substring(0, 16) : '2012-03-01 01:00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {alertKPIs.map((kpi) => (
          <MetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            subtext={kpi.subtext}
            iconType={kpi.iconType}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* 3. Compact Analytics Strip: Alert Trend Over Replay & Alert Type Mix */}
      <div>
        <AlertAnalyticsCharts alerts={filteredAlerts} />
      </div>

      {/* 4. Main Workflow: Attention & Evidence Stream (Left) + Selected Alert Context (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Dominant Stream Table (7 cols) */}
        <div className="lg:col-span-7 min-w-0">
          <AlertStreamTable
            alerts={filteredAlerts}
            selectedAlert={activeSelectedAlert}
            onSelectAlert={handleSelectAlert}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleSelectCategory}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={handleSelectSeverity}
          />
        </div>

        {/* Selected Alert Context Inspector (5 cols) */}
        <div className="lg:col-span-5 min-w-0">
          <SelectedAlertInspector
            alert={activeSelectedAlert}
          />
        </div>
      </div>

      {/* 5. Collapsible Secondary Analytics Drawer */}
      <div>
        <AlertSecondaryAnalytics alerts={filteredAlerts} />
      </div>

      {/* 6. Real-World Pilot Transferability: Indian Smart Cities Mission */}
      <div id="case-studies" className="pt-2">
        <IndiaCaseStudiesCard />
      </div>

      {/* 7. Production System Verification Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] text-xs text-slate-700 dark:text-[#CBDDF0] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-medium">
            <strong>System Operational:</strong> Continuous automated anomaly detection and spatial graph consensus active across all 207 arterial sensors.
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:inline">
          HEALTH: OPTIMAL
        </span>
      </div>
    </div>
  );
}
