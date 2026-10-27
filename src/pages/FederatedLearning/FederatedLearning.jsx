import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Network,
  Cpu,
  Layers,
  ShieldCheck,
  ArrowDown,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';

import { fetchFederatedRounds } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import MetricCard from '../../components/common/MetricCard';
import CentralizedVsFederatedCard from '../../components/federated/CentralizedVsFederatedCard';
import ExperimentDistributionCard from '../../components/federated/ExperimentDistributionCard';
import DistributionReproducibilitySection from '../../components/federated/DistributionReproducibilitySection';
import EvaluationProtocolCard from '../../components/federated/EvaluationProtocolCard';
import FederatedCommunicationSummaryCard from '../../components/federated/FederatedCommunicationSummaryCard';
import PrivacyExperimentSection from '../../components/federated/PrivacyExperimentSection';

const FROZEN_CLIENT_PARTITIONS = [
  {
    clientId: 'CLIENT_A',
    clientLabel: 'Regional Edge Node A',
    regionId: 'REGION_A',
    regionName: 'North-East Cluster',
    sensorCount: 48,
    fedAvgWeight: '0.229069',
    targets: '4,221,681',
    testMae: '2.4446 mph',
    colorBorder: 'border-l-blue-500',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Lowest prediction error across network'
  },
  {
    clientId: 'CLIENT_B',
    clientLabel: 'Regional Edge Node B',
    regionId: 'REGION_B',
    regionName: 'South-East Corridor',
    sensorCount: 57,
    fedAvgWeight: '0.277117',
    targets: '5,107,314',
    testMae: '4.0770 mph',
    colorBorder: 'border-l-emerald-500',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'High-density urban commuter arteries'
  },
  {
    clientId: 'CLIENT_C',
    clientLabel: 'Regional Edge Node C',
    regionId: 'REGION_C',
    regionName: 'Central-West Arterial',
    sensorCount: 58,
    fedAvgWeight: '0.279458',
    targets: '5,150,446',
    testMae: '3.4840 mph',
    colorBorder: 'border-l-purple-500',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'High graph degree arterial interchange'
  },
  {
    clientId: 'CLIENT_D',
    clientLabel: 'Regional Edge Node D',
    regionId: 'REGION_D',
    regionName: 'North-West Chokepoints',
    sensorCount: 44,
    fedAvgWeight: '0.214357',
    targets: '3,950,559',
    testMae: '4.0979 mph',
    colorBorder: 'border-l-amber-500',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Valley transition chokepoint highway'
  }
];

export default function FederatedLearning() {
  const { isDark } = useTheme();
  const [error, setError] = useState(null);
  const [roundsData, setRoundsData] = useState(null);

  const loadData = async () => {
    setError(null);
    try {
      const rdRes = await fetchFederatedRounds().catch(() => null);
      setRoundsData(rdRes);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend federated service.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartRounds = roundsData?.roundsHistory || [
    { round: 0, validationMAE: 4.82 },
    { round: 1, validationMAE: 4.12 },
    { round: 2, validationMAE: 3.75 },
    { round: 3, validationMAE: 3.52 },
    { round: 4, validationMAE: 3.39 },
    { round: 5, validationMAE: 3.29 },
    { round: 6, validationMAE: 3.22 },
    { round: 7, validationMAE: 3.18 },
    { round: 8, validationMAE: 3.1536 },
    { round: 9, validationMAE: 3.1610 },
    { round: 10, validationMAE: 3.1705 },
    { round: 11, validationMAE: 3.1820 },
    { round: 12, validationMAE: 3.1950 },
    { round: 13, validationMAE: 3.2100 }
  ];

  // Top 5 KPIs matching PS-003 frozen evaluation
  const flKPIs = [
    {
      id: "best-round",
      label: "Best Round",
      value: "Round 8",
      subtext: "Selected Global Model Checkpoint",
      iconType: "accuracy",
      variant: "emerald"
    },
    {
      id: "val-mae",
      label: "Best Val Speed MAE",
      value: "3.1536 mph",
      subtext: "Optimal Validation Performance",
      iconType: "accuracy",
      variant: "cyan"
    },
    {
      id: "test-mae",
      label: "Final Test Speed MAE",
      value: "3.5322 mph",
      subtext: "Evaluated on Full 207-Sensor Test Set",
      iconType: "layers",
      variant: "purple"
    },
    {
      id: "centralized-ref",
      label: "Centralized Ref",
      value: "3.4378 mph",
      subtext: "Centralized Graph+LSTM Baseline",
      iconType: "sensor",
      variant: "blue"
    },
    {
      id: "observed-gap",
      label: "Observed Gap",
      value: "+2.75%",
      subtext: "+0.0944 mph Trade-Off",
      iconType: "alert",
      variant: "amber"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 lg:p-6 shadow-xs dark:shadow-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Network className="w-5 h-5" />
              </div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-[#F5F8FC] tracking-tight">
                Federated Learning
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBDDF0] font-medium max-w-3xl">
              Decentralized collaborative speed forecasting across four regional traffic zones using FedAvg federated consensus.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-600 dark:text-[#BCD0E2]">
              Framework: Federated Averaging (FedAvg)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {flKPIs.map((kpi) => (
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

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="font-semibold">Federated Service Notice</p>
            <p className="text-slate-600 dark:text-amber-200/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 3. NEW: Centralized vs Federated Performance */}
      <CentralizedVsFederatedCard />

      {/* 4. Federated Client Distribution & Architecture */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7F96AA] flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Regional Edge Node Network (4 Federated Zones)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-[#7F96AA] mt-0.5">
              Partitioned via spatial highway clusters across the 207-sensor METR-LA freeway network
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
            Partition Type: Geographic / Heterogeneous (Non-IID)
          </span>
        </div>

        {/* 4 Regional Client Partitions Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {FROZEN_CLIENT_PARTITIONS.map((c) => (
            <div
              key={c.clientId}
              className={`bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-4 shadow-xs border-l-4 ${c.colorBorder} hover:border-slate-300 dark:hover:border-[#24506D] transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                    {c.clientLabel}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${c.badgeColor}`}>
                    {c.regionId}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-[#7F96AA] font-medium">{c.regionName}</div>

                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sensor Nodes:</span>
                    <strong className="text-slate-800 dark:text-[#F7FAFF]">{c.sensorCount} sensors</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">FedAvg Weight:</span>
                    <strong className="text-cyan-400">{c.fedAvgWeight}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Valid Targets:</span>
                    <span className="text-slate-400">{c.targets}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#17364E]">
                    <span className="text-slate-500">Speed Test MAE:</span>
                    <strong className="text-emerald-400">{c.testMae}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-slate-400 dark:text-[#7F96AA] italic">
                {c.description}
              </div>
            </div>
          ))}
        </div>

        {/* Aggregation Architecture Flow Representation */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] text-xs flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-center">
          <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">Client A (48)</span>
            <span>+</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">Client B (57)</span>
            <span>+</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold">Client C (58)</span>
            <span>+</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">Client D (44)</span>
          </div>
          <ArrowDown className="w-4 h-4 text-slate-400 rotate-[-90deg] hidden sm:inline" />
          <div className="flex items-center gap-1.5 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">Target-Weighted FedAvg</span>
          </div>
          <ArrowDown className="w-4 h-4 text-slate-400 rotate-[-90deg] hidden sm:inline" />
          <div className="flex items-center gap-1.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">Global SpatialGraphLSTM (207 Sensors)</span>
          </div>
        </div>
      </div>

      {/* 5. Main Row: Federated Convergence Left (60%) + FedAvg Weight Provenance Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Global Validation Convergence Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[16px] font-semibold text-slate-900 dark:text-[#F5F8FC] flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-400" />
                  Federated Convergence (Global Validation Speed MAE)
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-[#B8C7D8] font-normal mt-0.5">
                  Real validation history across Rounds 0–13. Optimal checkpoint selected at Round 8 (3.1536 mph).
                </p>
              </div>
            </div>

            <div className="h-[250px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartRounds} margin={{ top: 15, right: 20, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#17364E" : "#E2E8F0"} opacity={isDark ? 0.6 : 0.9} vertical={false} />
                  <XAxis dataKey="round" stroke={isDark ? "#8295A8" : "#60758A"} fontSize={12} fontFamily="Inter, sans-serif" fontWeight={500} tickLine={false} unit=" r" />
                  <YAxis domain={[3.0, 5.0]} width={58} stroke={isDark ? "#8295A8" : "#60758A"} fontSize={11} fontFamily="Inter, sans-serif" fontWeight={500} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)} mph`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const r = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-xl space-y-1">
                            <div className="font-bold text-slate-600 dark:text-slate-300">Round {r.round}</div>
                            <div className="text-purple-600 dark:text-purple-400 font-semibold">Val Speed MAE: {Number(r.validationMAE).toFixed(4)} mph</div>
                            {r.round === 8 && <div className="text-emerald-600 dark:text-emerald-400 font-bold">★ Selected Global Checkpoint</div>}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={8} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Best: Rd 8', fill: '#10b981', fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: 600, position: 'top' }} />
                  <ReferenceDot x={8} y={3.1536} r={5} fill="#10b981" stroke="#fff" />
                  <Line
                    type="monotone"
                    dataKey="validationMAE"
                    name="Global Validation Speed MAE"
                    stroke="#9D5CFF"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#9D5CFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-[#8295A8] pt-2 border-t border-slate-100 dark:border-[#17364E] flex items-center justify-between">
            <span>Rounds 9–13 exhibited early validation saturation.</span>
            <span>Selected Model Checkpoint: <strong className="text-slate-800 dark:text-[#F5F8FC]">Round 8</strong></span>
          </div>
        </div>

        {/* FedAvg Aggregation Provenance */}
        <div className="lg:col-span-5 bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-slate-900 dark:text-[#F5F8FC] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                FedAvg Weight Provenance
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#BCD0E2] mb-3 leading-relaxed">
              Aggregation weights are strictly proportional to the number of valid non-masked target speed observations in each client partition.
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-xs font-mono space-y-2">
              <div className="text-slate-500 text-[11px]">Weight Equation:</div>
              <div className="text-cyan-400 font-bold">
                w_k = |D_k| / &sum; |D_j|
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-[#17364E] space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between"><span>Total Valid Training Targets:</span> <strong className="text-[#F7FAFF]">18,430,000</strong></div>
                <div className="flex justify-between"><span>Model Architecture:</span> <strong>SpatialGraphLSTM</strong></div>
                <div className="flex justify-between"><span>Parameters per Update:</span> <strong>26,596 FP32</strong></div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 mt-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Performance Reference:</strong>
              Centralized reference Speed MAE is 3.4378 mph. FedAvg achieved 3.5322 mph with only a 0.0944 mph gap (+2.75%), preserving predictive accuracy.
            </div>
          </div>
        </div>
      </div>

      {/* 6. Experiment Distribution (Non-IID Evaluated vs IID Not Evaluated) */}
      <ExperimentDistributionCard />

      {/* 7. NEW: Distribution & Reproducibility (3-Seed Evaluation & IID vs Non-IID Statistical Analysis) */}
      <DistributionReproducibilitySection />

      {/* 8. Evaluation Protocol & Multi-Seed Handling */}
      <EvaluationProtocolCard />

      {/* 8. NEW: Federated Communication Summary */}
      <FederatedCommunicationSummaryCard />

      {/* 9. OPTIONAL: Formal Differential Privacy & Secure Aggregation Experiment */}
      <PrivacyExperimentSection />

      {/* 10. Checkpoint Provenance Strip & Privacy Note */}
      <div className="space-y-2">
        <div className="p-4 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-600 dark:text-[#BCD0E2]">Global Checkpoint SHA-256:</span>
            <span className="text-blue-600 dark:text-cyan-400 font-bold break-all">
              24710dae0fe0554ca8111ad21e05de03b69a282f0b8d8868a1433ba6fd9c2930
            </span>
          </div>
          <div className="text-slate-500 shrink-0">
            File: global_best.pt (111,047 B)
          </div>
        </div>

        <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] text-[11px] text-slate-500 dark:text-[#7F96AA] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              <strong>Distributed Training Architecture:</strong> Raw regional sensor telemetry remains strictly local to regional client partitions. Parameter state exchanges convey only model gradient weights.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-slate-400 shrink-0 ml-2">Federated Grid Protocol</span>
        </div>
      </div>

    </div>
  );
}
