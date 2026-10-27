import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { GitCompare, CheckCircle2, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const COMPARISON_BAR_DATA = [
  {
    metric: 'Speed MAE',
    Centralized: 3.4378,
    Federated: 3.5322,
    unit: 'mph'
  },
  {
    metric: 'Speed RMSE',
    Centralized: 6.8873,
    Federated: 7.0956,
    unit: 'mph'
  }
];

export default function CentralizedVsFederatedCard() {
  const { isDark } = useTheme();

  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-5 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-[#17364E]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F8FC]">
              Centralized vs Federated Performance
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              Controlled empirical comparison on the authoritative METR-LA 207-sensor test set
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Δ MAE: +0.0944 mph (+2.75%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 items-stretch">
        {/* Left Side: Side-by-Side Metric Panels (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Centralized Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Centralized Graph+LSTM
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                  Single Host
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#7F96AA]">
                Full network data pooled and trained on a centralized compute node.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-[#17364E]/80 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Speed MAE:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">3.4378 mph</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Speed RMSE:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">6.8873 mph</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Speed MAPE:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">9.57%</span>
                </div>
              </div>
            </div>

            {/* Federated Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Full FedAvg (4 Clients)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
                  Decentralized
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#7F96AA]">
                Decentralized training across 4 regional clients with valid-target weighting.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-[#17364E]/80 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Speed MAE:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">3.5322 mph</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Speed RMSE:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">7.0956 mph</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Speed MAPE:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">9.99%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade-off summary note */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B2033]/60 border border-slate-200 dark:border-[#17364E] text-xs text-slate-600 dark:text-[#BCD0E2] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Observed Accuracy Trade-off:</strong> The decentralized model incurs only a{' '}
                <strong className="text-slate-900 dark:text-white font-mono">+0.0944 mph</strong> error increase over the centralized ceiling while preserving regional data locality.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Grouped Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/50 dark:bg-[#0B2033]/40 border border-slate-200 dark:border-[#17364E] rounded-xl p-3 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between px-1">
            <span>Metric Comparison (Speed Forecast Error)</span>
            <span className="text-[10px] text-slate-400">Lower is better</span>
          </div>

          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={COMPARISON_BAR_DATA}
                margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
                barGap={8}
                barCategoryGap="25%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#17364E" : "#E2E8F0"}
                  vertical={false}
                  opacity={0.7}
                />
                <XAxis
                  dataKey="metric"
                  stroke={isDark ? "#8295A8" : "#64748B"}
                  fontSize={11}
                  tickLine={false}
                  fontWeight={500}
                />
                <YAxis
                  domain={[0, 8]}
                  stroke={isDark ? "#8295A8" : "#64748B"}
                  fontSize={11}
                  tickLine={false}
                  unit=" mph"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-xl space-y-1">
                          <div className="font-bold border-b border-slate-100 dark:border-slate-800 pb-1 text-slate-600 dark:text-slate-300">
                            {label}
                          </div>
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex justify-between gap-4">
                              <span style={{ color: entry.fill }}>{entry.name}:</span>
                              <span className="font-bold">{entry.value.toFixed(4)} mph</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                  iconSize={10}
                />
                <Bar
                  dataKey="Centralized"
                  name="Centralized"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Federated"
                  name="Federated"
                  fill="#9D5CFF"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-[#7F96AA] text-center pt-1 border-t border-slate-200/50 dark:border-[#17364E]/50">
            Evaluated on all 207 METR-LA sensors across the 6,855-step test split
          </div>
        </div>
      </div>
    </div>
  );
}
