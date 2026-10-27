import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ErrorBar
} from 'recharts';
import {
  Layers,
  Sparkles,
  Shuffle,
  MapPin,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Sliders
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  fetchDistributionComparison,
  fetchSeedSummary,
  fetchExperimentConvergence
} from '../../services/api';

export default function DistributionReproducibilitySection() {
  const { isDark } = useTheme();
  const [comparison, setComparison] = useState(null);
  const [seedSummary, setSeedSummary] = useState(null);
  const [convergence, setConvergence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  const loadAllExperimentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, seedRes, convRes] = await Promise.all([
        fetchDistributionComparison().catch(() => null),
        fetchSeedSummary().catch(() => null),
        fetchExperimentConvergence().catch(() => null)
      ]);
      setComparison(compRes);
      setSeedSummary(seedRes);
      setConvergence(convRes);
    } catch (err) {
      setError(err.message || 'Failed to fetch experiment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllExperimentData();
    const interval = setInterval(() => {
      setComparison(curr => {
        if (!curr || curr.status === 'PENDING') {
          loadAllExperimentData();
        }
        return curr;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [loadAllExperimentData]);

  const isCompleted = comparison?.status === 'COMPLETED' && comparison?.statisticalSummary;

  // Fallback state if experiments are still running
  if (!isCompleted) {
    return (
      <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#17364E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F8FC]">
                Distribution & Reproducibility (3-Seed Evaluation)
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
                Multi-seed IID vs Non-IID performance evaluation and convergence benchmarking
              </p>
            </div>
          </div>

          <button
            onClick={loadAllExperimentData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#0B2033] dark:hover:bg-[#122E49] text-slate-700 dark:text-[#BCD0E2] border border-slate-200 dark:border-[#17364E] transition-colors w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        <div className="p-8 my-4 rounded-xl bg-slate-50 dark:bg-[#0B2033]/50 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              Experiment Pending / In Progress
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-white pt-1">
              3-Seed Evaluation Pipeline Active (Seeds 42, 123, 2026)
            </p>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA] max-w-lg mx-auto">
              Training and evaluating matched 13-round FedAvg simulations across both IID (uniform-random) and Non-IID (geographic) partitions on the 207-sensor METR-LA dataset. Real statistical values (Mean &plusmn; Std) and error bars will render automatically upon completion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Completed State
  const { nonIID, iid, heterogeneityImpact } = comparison.statisticalSummary;
  const rawRuns = seedSummary?.rawRuns || { nonIID: [], iid: [] };

  // Data for Grouped Bar Chart with Error Bars
  const barChartData = [
    {
      metric: 'Speed MAE',
      NonIID: nonIID.testMAE.mean,
      NonIID_error: [nonIID.testMAE.std, nonIID.testMAE.std],
      IID: iid.testMAE.mean,
      IID_error: [iid.testMAE.std, iid.testMAE.std],
      unit: 'mph'
    },
    {
      metric: 'Speed RMSE',
      NonIID: nonIID.testRMSE.mean,
      NonIID_error: [nonIID.testRMSE.std, nonIID.testRMSE.std],
      IID: iid.testRMSE.mean,
      IID_error: [iid.testRMSE.std, iid.testRMSE.std],
      unit: 'mph'
    }
  ];

  const convRounds = convergence?.roundsHistory || [];

  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-5 shadow-xs transition-colors space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#17364E]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F8FC]">
              Distribution & Reproducibility (3-Seed Evaluation)
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              Statistical evaluation of IID vs Non-IID client heterogeneity across seeds 42, 123, 2026
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            3 Seeds Evaluated
          </span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-600 dark:text-[#BCD0E2]">
            Error Bars: &plusmn;1 Std Dev
          </span>
        </div>
      </div>

      {/* Row 1: Statistical Summary Cards (Non-IID vs IID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Non-IID Geographic Summary Card */}
        <div className="p-4.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-purple-500/30 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">
                  Non-IID / Geographic Partition
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                4 Regional Clusters
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              Geographically clustered sub-networks (48, 57, 58, 44 sensors) reflecting authentic highway spatial heterogeneity.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-slate-200/60 dark:border-[#17364E]/80">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-[#7F96AA]">Speed MAE (Mean &plusmn; Std):</span>
                <div className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
                  {nonIID.testMAE.formatted} mph
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Min: {nonIID.testMAE.min} | Max: {nonIID.testMAE.max}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-[#7F96AA]">Speed RMSE (Mean &plusmn; Std):</span>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-white">
                  {nonIID.testRMSE.formatted} mph
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Min: {nonIID.testRMSE.min} | Max: {nonIID.testRMSE.max}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-purple-700 dark:text-purple-300 font-mono pt-2 border-t border-slate-200 dark:border-[#17364E]/60 flex items-center justify-between">
            <span>Best Round Range: Rd {nonIID.bestRound.min}–{nonIID.bestRound.max}</span>
            <span>Speed MAPE: {nonIID.testMAPE.formatted}</span>
          </div>
        </div>

        {/* IID Uniform-Random Summary Card */}
        <div className="p-4.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-cyan-500/30 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-mono">
                  IID / Uniform-Random Comparator
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold">
                Balanced (52, 52, 52, 51)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              Sensors uniformly interleaved across clients, ensuring identical statistical distribution per partition.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-slate-200/60 dark:border-[#17364E]/80">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-[#7F96AA]">Speed MAE (Mean &plusmn; Std):</span>
                <div className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-400">
                  {iid.testMAE.formatted} mph
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Min: {iid.testMAE.min} | Max: {iid.testMAE.max}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-[#7F96AA]">Speed RMSE (Mean &plusmn; Std):</span>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-white">
                  {iid.testRMSE.formatted} mph
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Min: {iid.testRMSE.min} | Max: {iid.testRMSE.max}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-mono pt-2 border-t border-slate-200 dark:border-[#17364E]/60 flex items-center justify-between">
            <span>Best Round Range: Rd {iid.bestRound.min}–{iid.bestRound.max}</span>
            <span>Speed MAPE: {iid.testMAPE.formatted}</span>
          </div>
        </div>
      </div>

      {/* Heterogeneity Impact Callout */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] flex items-center gap-3 text-xs">
        <TrendingUp className="w-5 h-5 text-indigo-500 shrink-0" />
        <div className="space-y-0.5">
          <strong className="text-slate-900 dark:text-white">Empirical Heterogeneity Finding:</strong>
          <p className="text-slate-600 dark:text-[#BCD0E2]">
            {heterogeneityImpact.finding}
          </p>
        </div>
      </div>

      {/* Row 2: Charts (Bar Chart with Error Bars & Convergence Line Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Bar Chart with Error Bars (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/50 dark:bg-[#0B2033]/40 border border-slate-200 dark:border-[#17364E] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-[#F5F8FC] flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                IID vs Non-IID Performance (&plusmn;1 Std Dev)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Lower is better</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#7F96AA] mb-3">
              Error bars represent &plusmn;1 standard deviation across 3 random seeds (42, 123, 2026).
            </p>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 15, left: -15, bottom: 0 }}
                  barGap={10}
                  barCategoryGap="28%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#17364E" : "#E2E8F0"} vertical={false} opacity={0.7} />
                  <XAxis dataKey="metric" stroke={isDark ? "#8295A8" : "#64748B"} fontSize={11} tickLine={false} fontWeight={500} />
                  <YAxis domain={[0, 8]} stroke={isDark ? "#8295A8" : "#64748B"} fontSize={11} tickLine={false} unit=" mph" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-xl space-y-1">
                            <div className="font-bold border-b border-slate-100 dark:border-slate-800 pb-1">{label}</div>
                            {payload.map((e) => (
                              <div key={e.name} className="flex justify-between gap-4">
                                <span style={{ color: e.fill }}>{e.name}:</span>
                                <span className="font-bold">{e.value.toFixed(4)} mph</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} iconSize={10} />
                  <Bar dataKey="NonIID" name="Non-IID (Geographic)" fill="#9D5CFF" radius={[4, 4, 0, 0]}>
                    <ErrorBar dataKey="NonIID_error" width={4} strokeWidth={1.5} stroke={isDark ? "#E2E8F0" : "#334155"} />
                  </Bar>
                  <Bar dataKey="IID" name="IID (Uniform-Random)" fill="#06B6D4" radius={[4, 4, 0, 0]}>
                    <ErrorBar dataKey="IID_error" width={4} strokeWidth={1.5} stroke={isDark ? "#E2E8F0" : "#334155"} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-[#7F96AA] text-center pt-2 border-t border-slate-200/50 dark:border-[#17364E]/50">
            Evaluated strictly on full 207-sensor METR-LA test split
          </div>
        </div>

        {/* Right: Convergence Trajectories (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/50 dark:bg-[#0B2033]/40 border border-slate-200 dark:border-[#17364E] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-[#F5F8FC] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                IID vs Non-IID Convergence (Rounds 0–13)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Mean Val Speed MAE</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#7F96AA] mb-3">
              Validation speed MAE trajectory averaged across seeds 42, 123, 2026 at every federated round.
            </p>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={convRounds} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#17364E" : "#E2E8F0"} opacity={0.6} vertical={false} />
                  <XAxis dataKey="round" stroke={isDark ? "#8295A8" : "#60758A"} fontSize={11} tickLine={false} unit=" r" />
                  <YAxis domain={[3.0, 9.5]} stroke={isDark ? "#8295A8" : "#60758A"} fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-xl space-y-1">
                            <div className="font-bold border-b border-slate-100 dark:border-slate-800 pb-1">Round {label}</div>
                            <div className="text-purple-600 dark:text-purple-400">
                              Non-IID Mean: {d.nonIIDMean?.toFixed(4)} &plusmn; {d.nonIIDStd?.toFixed(4)} mph
                            </div>
                            <div className="text-cyan-600 dark:text-cyan-400">
                              IID Mean: {d.iidMean?.toFixed(4)} &plusmn; {d.iidStd?.toFixed(4)} mph
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} iconSize={10} />
                  <Line
                    type="monotone"
                    dataKey="nonIIDMean"
                    name="Non-IID Mean Val MAE"
                    stroke="#9D5CFF"
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: '#9D5CFF' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="iidMean"
                    name="IID Mean Val MAE"
                    stroke="#06B6D4"
                    strokeWidth={2.2}
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: '#06B6D4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-[#7F96AA] text-center pt-2 border-t border-slate-200/50 dark:border-[#17364E]/50">
            Solid line = Non-IID | Dashed line = IID | Evaluated under identical client budgets
          </div>
        </div>
      </div>

      {/* Row 3: Granular 3-Seed Evaluation Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7F96AA] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            3-Seed Run Breakdown (Per-Seed Observations)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">Seeds: [42, 123, 2026]</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#17364E]">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-100 dark:bg-[#071727] text-slate-600 dark:text-[#7F96AA] border-b border-slate-200 dark:border-[#17364E]">
              <tr>
                <th className="px-3.5 py-2.5 font-bold">Partition</th>
                <th className="px-3 py-2.5 font-bold">Seed</th>
                <th className="px-3 py-2.5 font-bold">Best Rd</th>
                <th className="px-3 py-2.5 font-bold">Best Val MAE</th>
                <th className="px-3 py-2.5 font-bold">Test Speed MAE</th>
                <th className="px-3 py-2.5 font-bold">Test Speed RMSE</th>
                <th className="px-3 py-2.5 font-bold">Test Speed MAPE</th>
                <th className="px-3 py-2.5 font-bold">Total Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 bg-white dark:bg-[#081827]">
              {/* Non-IID Runs */}
              {rawRuns.nonIID?.map((r) => (
                <tr key={`non-iid-${r.seed}`} className="hover:bg-slate-50/50 dark:hover:bg-[#0B2033]/50">
                  <td className="px-3.5 py-2 font-sans font-semibold text-purple-600 dark:text-purple-400">
                    Non-IID (Geographic) {r.isBaselineFrozen && <span className="text-[10px] text-emerald-500 font-bold font-mono">★ Frozen</span>}
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">{r.seed}</td>
                  <td className="px-3 py-2">Rd {r.bestRound}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-[#BCD0E2]">{r.bestValidationMAE?.toFixed(4)} mph</td>
                  <td className="px-3 py-2 font-bold text-purple-600 dark:text-purple-400">{r.testMAE?.toFixed(4)} mph</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-white">{r.testRMSE?.toFixed(4)} mph</td>
                  <td className="px-3 py-2 text-slate-500">{r.testMAPE?.toFixed(2)}%</td>
                  <td className="px-3 py-2 text-slate-400">11,468,184 B</td>
                </tr>
              ))}
              {/* IID Runs */}
              {rawRuns.iid?.map((r) => (
                <tr key={`iid-${r.seed}`} className="hover:bg-slate-50/50 dark:hover:bg-[#0B2033]/50">
                  <td className="px-3.5 py-2 font-sans font-semibold text-cyan-600 dark:text-cyan-400">
                    IID (Uniform-Random)
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-800 dark:text-white">{r.seed}</td>
                  <td className="px-3 py-2">Rd {r.bestRound}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-[#BCD0E2]">{r.bestValidationMAE?.toFixed(4)} mph</td>
                  <td className="px-3 py-2 font-bold text-cyan-600 dark:text-cyan-400">{r.testMAE?.toFixed(4)} mph</td>
                  <td className="px-3 py-2 text-slate-800 dark:text-white">{r.testRMSE?.toFixed(4)} mph</td>
                  <td className="px-3 py-2 text-slate-500">{r.testMAPE?.toFixed(2)}%</td>
                  <td className="px-3 py-2 text-slate-400">11,468,184 B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
