import React, { useState, useMemo } from 'react';
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

const REPLAY_ALERTS_DATA = [
  {
    id: 'ALT-101',
    timestamp: '2012-03-01 01:00',
    sensorId: '773869',
    regionId: 'REGION_A',
    condition: 'High Forecast Uncertainty',
    category: 'Uncertainty',
    severity: 'Warning',
    summary: 'Residual prediction uncertainty elevated to ±3.82 mph on 60-min horizon.',
    currentSpeed: 64.4,
    recentMean: 62.1,
    drift: 0.22,
    driftStatus: 'STABLE',
    uncertaintyMph: '±3.82 mph',
    needScore: 0.58,
    dataQuality: 0.95,
    primaryTrigger: 'Epistemic prediction uncertainty exceeded nominal residual band (±3.82 mph vs ±3.0 mph baseline).',
    supportingEvidence: [
      '60-min prediction horizon variance elevated across arterial segment',
      'Downstream arterial chokepoint influence detected',
      'Information debt increasing due to consecutive skips'
    ],
    evidenceSufficiency: 'Additional Evidence Needed',
    actionState: 'Query Requested',
    actionPayload: '187 B / compact query',
    neighborSensor: '767541',
    neighborSpeed: 67.6,
    speedDiff: '3.2 mph',
    targetRoute: '/predictions',
    routeLabel: 'Open Forecast'
  },
  {
    id: 'ALT-102',
    timestamp: '2012-03-01 00:55',
    sensorId: '767541',
    regionId: 'REGION_B',
    condition: 'Elevated Traffic Drift',
    category: 'Drift',
    severity: 'Warning',
    summary: 'Temporal traffic speed drift (0.42) exceeds nominal baseline threshold.',
    currentSpeed: 52.8,
    recentMean: 64.1,
    drift: 0.42,
    driftStatus: 'ELEVATED',
    uncertaintyMph: '±2.45 mph',
    needScore: 0.74,
    dataQuality: 0.98,
    primaryTrigger: 'Sudden velocity rate of change relative to 30-min moving median (Δv = -11.3 mph).',
    supportingEvidence: [
      'Speed reduction detected across corridor transition zone',
      'Spatial neighbor agreement decaying over consecutive 5-min intervals'
    ],
    evidenceSufficiency: 'Evidence In Progress',
    actionState: 'Query Dispatched',
    actionPayload: '187 B / compact query',
    neighborSensor: '773869',
    neighborSpeed: 64.4,
    speedDiff: '11.6 mph',
    targetRoute: '/decision',
    routeLabel: 'Open in Decision'
  },
  {
    id: 'ALT-103',
    timestamp: '2012-03-01 00:50',
    sensorId: '717458',
    regionId: 'REGION_B',
    condition: 'Data Quality Degradation',
    category: 'Data Quality',
    severity: 'Info',
    summary: '29 loop detector readings masked as zero in historical telemetry snapshot.',
    currentSpeed: 58.2,
    recentMean: 59.0,
    drift: 0.08,
    driftStatus: 'STABLE',
    uncertaintyMph: '±1.80 mph',
    needScore: 0.45,
    dataQuality: 0.86,
    primaryTrigger: 'Masked null telemetry ratio (14%) exceeded quality inspection baseline.',
    supportingEvidence: [
      'Empirical loop detector dropouts observed in raw METR-LA HDF5 stream',
      'Spatial neighbor interpolation activated for missing timesteps'
    ],
    evidenceSufficiency: 'Sufficient with Mask',
    actionState: 'Monitored',
    actionPayload: '0 B (Passive)',
    neighborSensor: '717447',
    neighborSpeed: 61.3,
    speedDiff: '3.1 mph',
    targetRoute: '/network',
    routeLabel: 'View on Network'
  },
  {
    id: 'ALT-104',
    timestamp: '2012-03-01 00:45',
    sensorId: '765171',
    regionId: 'REGION_D',
    condition: 'Kinematic Gate Continuity Flag',
    category: 'Kinematic Check',
    severity: 'Info',
    summary: 'Plausibility Gate verified acceleration continuity (step delta 1.8 mph < 25 mph limit).',
    currentSpeed: 61.2,
    recentMean: 62.0,
    drift: 0.12,
    driftStatus: 'STABLE',
    uncertaintyMph: '±2.10 mph',
    needScore: 0.83,
    dataQuality: 0.99,
    primaryTrigger: 'Deterministic kinematic filter check passed all 3 consistency criteria.',
    supportingEvidence: [
      'Speed within bounds: 0 ≤ 61.2 ≤ 85 mph (PASS)',
      'Step acceleration continuity: |Δv| = 1.8 ≤ 25 mph (PASS)',
      'Spatial gradient consistency: |v_target - <v_nbr>| = 4.2 ≤ 30 mph (PASS)'
    ],
    evidenceSufficiency: 'Verified Nominal',
    actionState: 'Validated',
    actionPayload: '0 B (Filter)',
    neighborSensor: '767350',
    neighborSpeed: 57.0,
    speedDiff: '4.2 mph',
    targetRoute: '/decision',
    routeLabel: 'Open in Decision'
  },
  {
    id: 'ALT-105',
    timestamp: '2012-03-01 00:40',
    sensorId: '717447',
    regionId: 'REGION_C',
    condition: 'Evidence Query Triggered',
    category: 'Evidence Query',
    severity: 'Info',
    summary: 'Evidence-on-demand query executed: transferred 187 B serialized query payload.',
    currentSpeed: 63.5,
    recentMean: 63.8,
    drift: 0.10,
    driftStatus: 'STABLE',
    uncertaintyMph: '±1.65 mph',
    needScore: 0.69,
    dataQuality: 0.97,
    primaryTrigger: 'Counterfactual utility threshold exceeded cost justification (Utility = 0.82).',
    supportingEvidence: [
      'Information debt cleared from 0.40 to 0.00',
      'Uncertainty reduced from ±3.82 mph to ±1.65 mph (-56%)',
      '187 B application payload exchanged instead of 4.2 KB raw stream'
    ],
    evidenceSufficiency: 'Sufficient',
    actionState: 'Query Completed',
    actionPayload: '187 B / compact query',
    neighborSensor: '717816',
    neighborSpeed: 65.0,
    speedDiff: '1.5 mph',
    targetRoute: '/communication',
    routeLabel: 'View Communication'
  },
  {
    id: 'ALT-106',
    timestamp: '2012-03-01 00:35',
    sensorId: '771667',
    regionId: 'REGION_B',
    condition: 'Spatial Speed Disagreement',
    category: 'Spatial Disagreement',
    severity: 'Warning',
    summary: 'Spatial speed gradient of 8.9 mph detected across adjacent corridor link.',
    currentSpeed: 55.3,
    recentMean: 63.0,
    drift: 0.31,
    driftStatus: 'ELEVATED',
    uncertaintyMph: '±2.90 mph',
    needScore: 0.83,
    dataQuality: 0.96,
    primaryTrigger: 'Corridor speed disagreement exceeded 7.0 mph threshold between connected detectors.',
    supportingEvidence: [
      'Adjacent sensor 767541 reports 64.2 mph while target reports 55.3 mph',
      'Graph adjacency weight: A_ij = 0.84 on Interstate 10 connector'
    ],
    evidenceSufficiency: 'Additional Evidence Needed',
    actionState: 'Query Dispatched',
    actionPayload: '187 B / compact query',
    neighborSensor: '767541',
    neighborSpeed: 64.2,
    speedDiff: '8.9 mph',
    targetRoute: '/decision',
    routeLabel: 'Open in Decision'
  },
  {
    id: 'ALT-107',
    timestamp: '2012-03-01 00:25',
    sensorId: '717816',
    regionId: 'REGION_C',
    condition: 'Evidence Coverage Gap',
    category: 'Coverage Gap',
    severity: 'Warning',
    summary: 'Regional topological coverage deficit: downstream information debt elevated.',
    currentSpeed: 65.2,
    recentMean: 66.0,
    drift: 0.14,
    driftStatus: 'STABLE',
    uncertaintyMph: '±2.70 mph',
    needScore: 0.62,
    dataQuality: 0.94,
    primaryTrigger: 'Sector coverage dropped below 80% coverage threshold due to consecutive skip cycles.',
    supportingEvidence: [
      'Downstream arterial bridge sensor unpolled for 4 consecutive intervals',
      'Information debt component contributed +0.10 to Need Score'
    ],
    evidenceSufficiency: 'Coverage Deficit',
    actionState: 'Candidate Flagged',
    actionPayload: '187 B / compact query',
    neighborSensor: '717447',
    neighborSpeed: 63.5,
    speedDiff: '1.7 mph',
    targetRoute: '/network',
    routeLabel: 'View on Network'
  },
  {
    id: 'ALT-108',
    timestamp: '2012-03-01 00:15',
    sensorId: '773927',
    regionId: 'REGION_A',
    condition: 'High Forecast Uncertainty',
    category: 'Uncertainty',
    severity: 'Warning',
    summary: 'Prediction variance spiked on +30 min horizon (residual σ = 3.42 mph).',
    currentSpeed: 62.8,
    recentMean: 63.1,
    drift: 0.18,
    driftStatus: 'STABLE',
    uncertaintyMph: '±3.42 mph',
    needScore: 0.67,
    dataQuality: 0.98,
    primaryTrigger: 'Multi-horizon GCN-LSTM residual uncertainty exceeded upper confidence envelope.',
    supportingEvidence: [
      '+30 min horizon uncertainty band widened by 28%',
      'Sensor Jury deliberation quorum reached: QUERY_REQUIRED finding'
    ],
    evidenceSufficiency: 'Inconclusive',
    actionState: 'Query Requested',
    actionPayload: '187 B / compact query',
    neighborSensor: '773869',
    neighborSpeed: 64.4,
    speedDiff: '1.6 mph',
    targetRoute: '/predictions',
    routeLabel: 'Open Forecast'
  },
  {
    id: 'ALT-109',
    timestamp: '2012-03-01 00:10',
    sensorId: '767350',
    regionId: 'REGION_D',
    condition: 'Elevated Traffic Drift',
    category: 'Drift',
    severity: 'Warning',
    summary: 'Velocity deceleration drift rate reached 0.38 on valley arterial corridor.',
    currentSpeed: 54.0,
    recentMean: 62.5,
    drift: 0.38,
    driftStatus: 'ELEVATED',
    uncertaintyMph: '±2.60 mph',
    needScore: 0.82,
    dataQuality: 0.96,
    primaryTrigger: 'Temporal speed deceleration exceeded 8.5 mph over 15-min replay window.',
    supportingEvidence: [
      'Interstate 5 North corridor speed contraction',
      'Need Score escalated to 0.82'
    ],
    evidenceSufficiency: 'Additional Evidence Needed',
    actionState: 'Query Dispatched',
    actionPayload: '187 B / compact query',
    neighborSensor: '765171',
    neighborSpeed: 61.2,
    speedDiff: '7.2 mph',
    targetRoute: '/decision',
    routeLabel: 'Open in Decision'
  },
  {
    id: 'ALT-110',
    timestamp: '2012-03-01 00:05',
    sensorId: '761003',
    regionId: 'REGION_A',
    condition: 'Evidence Query Triggered',
    category: 'Evidence Query',
    severity: 'Info',
    summary: 'Progressive evidence step executed: neighbor speed confirmed (62.1 mph).',
    currentSpeed: 62.1,
    recentMean: 62.0,
    drift: 0.05,
    driftStatus: 'STABLE',
    uncertaintyMph: '±1.40 mph',
    needScore: 0.52,
    dataQuality: 0.97,
    primaryTrigger: 'Target sensor 773869 triggered upstream cross-validation step.',
    supportingEvidence: [
      'Second node in progressive evidence chain satisfied',
      'Corridor speed verified within nominal 3 mph bounds'
    ],
    evidenceSufficiency: 'Chain Step 2/3 Complete',
    actionState: 'Query Completed',
    actionPayload: '187 B / compact query',
    neighborSensor: '773869',
    neighborSpeed: 64.4,
    speedDiff: '2.3 mph',
    targetRoute: '/decision',
    routeLabel: 'Open in Decision'
  }
];

export default function Alerts() {
  const { timestampStr } = useReplay();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedAlert, setSelectedAlert] = useState(REPLAY_ALERTS_DATA[0]);

  // Dynamic filter pipeline
  const filteredAlerts = useMemo(() => {
    return REPLAY_ALERTS_DATA.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        item.sensorId.toLowerCase().includes(term) ||
        item.summary.toLowerCase().includes(term) ||
        item.condition.toLowerCase().includes(term) ||
        item.regionId.toLowerCase().includes(term);

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSev = selectedSeverity === 'All' || item.severity === selectedSeverity;

      return matchesSearch && matchesCat && matchesSev;
    });
  }, [searchTerm, selectedCategory, selectedSeverity]);

  // Keep selectedAlert synchronized when filtered items change
  const activeSelectedAlert = useMemo(() => {
    if (filteredAlerts.some(a => a.id === selectedAlert?.id)) {
      return selectedAlert;
    }
    return filteredAlerts[0] || null;
  }, [filteredAlerts, selectedAlert]);

  // Dynamically compute sub-KPI counts from current filter pipeline
  const highUncertaintyCount = useMemo(() =>
    filteredAlerts.filter(a => a.category === 'Uncertainty' || (typeof a.uncertaintyMph === 'string' && parseFloat(a.uncertaintyMph.replace(/[^\d.]/g, '')) > 3.0)).length,
    [filteredAlerts]
  );
  const highDriftCount = useMemo(() =>
    filteredAlerts.filter(a => a.category === 'Drift' || a.driftStatus === 'ELEVATED' || (typeof a.drift === 'number' && a.drift > 0.30)).length,
    [filteredAlerts]
  );
  const blindSpotCount = useMemo(() =>
    filteredAlerts.filter(a => a.category === 'Blind Spot' || (typeof a.needScore === 'number' && a.needScore >= 0.70)).length,
    [filteredAlerts]
  );

  // Exactly FOUR Main KPIs dynamically bound to current filter state
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
      value: highUncertaintyCount.toString(),
      subtext: "Residual σ > 3.0 mph",
      iconType: "accuracy",
      variant: "purple"
    },
    {
      id: "drift-anomalies",
      label: "High Drift",
      value: highDriftCount.toString(),
      subtext: "Velocity Delta > 0.30",
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
    <div className="space-y-5 pb-10">
      {/* 1. Header & Replay Context Strip (Prompt Section 1, 2) */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 lg:p-6 shadow-xs dark:shadow-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-[#F5F8FC] tracking-tight">
                Traffic Alerts
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B8C7D8] font-medium max-w-2xl">
              Replay-aware incident triggers, uncertainty boundaries, and evidence actions across the network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Historical Telemetry Context */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] font-mono text-xs text-slate-700 dark:text-[#BCD0E2]">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>Historical Replay &bull; Active &bull; {timestampStr ? timestampStr.substring(0, 16) : '2012-03-01 00:00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Exactly FOUR KPI Cards (Prompt Section 6) */}
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

      {/* 3. Compact Analytics Strip: Alert Trend Over Replay & Alert Type Mix (Prompt Section 8, 9) */}
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
            onSelectAlert={setSelectedAlert}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
          />
        </div>

        {/* Selected Alert Context Inspector (5 cols) */}
        <div className="lg:col-span-5 min-w-0">
          <SelectedAlertInspector
            alert={activeSelectedAlert}
          />
        </div>
      </div>

      {/* 5. Collapsible Secondary Analytics Drawer (Prompt Section 23) */}
      <div>
        <AlertSecondaryAnalytics alerts={filteredAlerts} />
      </div>

      {/* 6. Smart-Mobility Incident & Anomaly Case Studies */}
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
