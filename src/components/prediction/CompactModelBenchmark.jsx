import React, { useState } from 'react';
import {
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const BENCHMARK_MODELS = [
  {
    name: 'Graph+LSTM',
    shortName: 'Graph+LSTM',
    mae: 3.4378,
    mae60: 4.7158,
    type: 'Spatio-Temporal',
    isWinner: true,
    badge: 'Best Overall',
    overallScore: 92.5,
    longHorizonScore: 76.1
  },
  {
    name: 'LSTM (Temporal)',
    shortName: 'LSTM',
    mae: 3.5613,
    mae60: 4.9156,
    type: 'Standard Recurrent',
    isWinner: false,
    overallScore: 87.1,
    longHorizonScore: 69.5
  },
  {
    name: 'GRU (Temporal)',
    shortName: 'GRU',
    mae: 3.5669,
    mae60: 4.9284,
    type: 'Gated Recurrent',
    isWinner: false,
    overallScore: 86.9,
    longHorizonScore: 69.1
  },
  {
    name: 'Linear Regression',
    shortName: 'Linear Reg',
    mae: 3.9763,
    mae60: 5.5879,
    type: 'Linear Baseline',
    isWinner: false,
    overallScore: 72.3,
    longHorizonScore: 47.1
  },
  {
    name: 'Last Value',
    shortName: 'Last Value',
    mae: 3.9839,
    mae60: 5.3987,
    type: 'Naive Persistent',
    isWinner: false,
    overallScore: 72.0,
    longHorizonScore: 53.4
  },
  {
    name: 'Historical Average',
    shortName: 'Hist Avg',
    mae: 4.1930,
    mae60: 4.1934,
    type: 'Long-Horizon Robust',
    isWinner: false,
    badge: '+60m Baseline',
    overallScore: 64.5,
    longHorizonScore: 93.6
  },
  {
    name: 'Spatial GCN',
    shortName: 'Spatial GCN',
    mae: 5.4604,
    mae60: 6.4201,
    type: 'Pure Spatial',
    isWinner: false,
    overallScore: 22.0,
    longHorizonScore: 19.3
  }
];

export default function CompactModelBenchmark() {
  const { isDark } = useTheme();
  const [showDetails, setShowDetails] = useState(true);
  const [activeMetric, setActiveMetric] = useState('both'); // 'both' | 'overall' | 'long'
  const [hoveredModel, setHoveredModel] = useState(null);

  // Radar chart data mapping
  const radarData = BENCHMARK_MODELS.map((m) => ({
    model: m.shortName,
    fullName: m.name,
    overallScore: m.overallScore,
    longHorizonScore: m.longHorizonScore,
    mae: m.mae,
    mae60: m.mae60,
    type: m.type,
    isWinner: m.isWinner,
    badge: m.badge
  }));

  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-2xl p-5 shadow-xl transition-colors">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-[#17364E]/80">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F7FAFF] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            7-Model Benchmark Evaluation
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8295A8] mt-0.5">
            Spatio-temporal radar comparison across 7 candidate models (Lower MAE = Higher Accuracy Index)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Radar Metric Filter */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-xs font-mono">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                activeMetric === 'both'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white'
              }`}
              type="button"
            >
              Dual Horizon
            </button>
            <button
              onClick={() => setActiveMetric('overall')}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                activeMetric === 'overall'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white'
              }`}
              type="button"
            >
              Overall
            </button>
            <button
              onClick={() => setActiveMetric('long')}
              className={`px-2 py-1 rounded-md font-bold transition-all ${
                activeMetric === 'long'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white'
              }`}
              type="button"
            >
              +60m Horizon
            </button>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Optimal: Graph+LSTM (3.4378 mph)
          </span>
        </div>
      </div>

      {/* Main Grid: Radar Chart (Left) + Model Analytical Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">

        {/* Left (~58%): Radar / Spider Chart */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[340px] pt-2">

          {/* Subtle Radar Legend */}
          <div className="flex items-center justify-center gap-5 text-xs font-mono mb-2">
            {(activeMetric === 'both' || activeMetric === 'overall') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 border border-cyan-500 inline-block shadow-xs" />
                <span className="text-slate-700 dark:text-cyan-300 font-bold">Overall Accuracy Index (1/MAE)</span>
              </div>
            )}
            {(activeMetric === 'both' || activeMetric === 'long') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 inline-block shadow-xs" />
                <span className="text-slate-700 dark:text-amber-300 font-bold">+60m Long Horizon Robustness</span>
              </div>
            )}
          </div>

          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid
                  stroke={isDark ? "#1B3B56" : "#E2E8F0"}
                  strokeOpacity={isDark ? 0.7 : 0.9}
                />
                <PolarAngleAxis
                  dataKey="model"
                  tick={{
                    fill: isDark ? "#A0B8D0" : "#4A5D6E",
                    fontSize: 11,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke={isDark ? "#17364E" : "#CBD5E1"}
                  tick={{ fill: isDark ? "#607386" : "#94A3B8", fontSize: 9 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-2xl space-y-1.5 min-w-[210px]">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                            <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{data.fullName}</span>
                            {data.badge && (
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                data.isWinner ? 'bg-cyan-500 text-slate-950' : 'bg-amber-500/20 text-amber-500'
                              }`}>
                                {data.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                            <span>Overall Test MAE:</span>
                            <strong className="text-slate-900 dark:text-white">{data.mae.toFixed(4)} mph</strong>
                          </div>
                          <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                            <span>+60m Horizon MAE:</span>
                            <strong className="text-slate-900 dark:text-white">{data.mae60.toFixed(4)} mph</strong>
                          </div>
                          <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                            <span>Architecture:</span>
                            <span className="text-[10px] text-slate-500">{data.type}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Overall Accuracy Radar Polygon */}
                {(activeMetric === 'both' || activeMetric === 'overall') && (
                  <Radar
                    name="Overall Accuracy"
                    dataKey="overallScore"
                    stroke="#00D2FF"
                    fill="#00D2FF"
                    fillOpacity={isDark ? 0.35 : 0.25}
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    dot={{ r: 3.5, fill: '#00D2FF', stroke: '#081827', strokeWidth: 1 }}
                  />
                )}

                {/* +60m Horizon Robustness Radar Polygon */}
                {(activeMetric === 'both' || activeMetric === 'long') && (
                  <Radar
                    name="+60m Robustness"
                    dataKey="longHorizonScore"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={isDark ? 0.2 : 0.15}
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    isAnimationActive={false}
                    dot={{ r: 3, fill: '#F59E0B', stroke: '#081827', strokeWidth: 1 }}
                  />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 dark:text-[#657E94] font-mono text-center mt-1">
            Radar distance from center represents normalized prediction quality score (0–100%)
          </div>
        </div>

        {/* Right (~42%): Highlighted Model Analytical Cards */}
        <div className="lg:col-span-5 space-y-2.5">

          {/* Primary Highlight Card: Graph+LSTM */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/40 dark:border-cyan-500/40 shadow-xs relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-sm text-blue-700 dark:text-cyan-300 font-mono">
                  Graph+LSTM
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-blue-600 text-white dark:bg-cyan-400 dark:text-slate-950 uppercase tracking-wider">
                  Rank 1 • Pareto Optimal
                </span>
              </div>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                3.4378 mph
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-[#A8BFD3] leading-snug">
              Captures non-euclidean spatial road geometry via Chebyshev graph convolution combined with temporal recurrent memory. Lowest overall MAE.
            </p>
            <div className="mt-2.5 pt-2 border-t border-blue-200/50 dark:border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>+60m MAE: <strong>4.7158 mph</strong></span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">+3.6% ahead of standard LSTM</span>
            </div>
          </div>

          {/* Secondary Highlight Card: Historical Average */}
          <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-xs text-slate-900 dark:text-[#F7FAFF] font-mono">
                  Historical Average
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                  +60m Robust Baseline
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                4.1934 mph
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-[#9FB7CC] leading-snug">
              Exhibits zero recurrent attenuation at the 1-hour horizon, providing a reliable fallback ceiling when long-range neural variance widens.
            </p>
          </div>

          {/* Compact Quick Rankings Strip */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-100 dark:border-[#17364E] text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between items-center text-slate-500 dark:text-[#7F96AA] text-[10px] uppercase font-semibold">
              <span>Other Evaluated Architectures</span>
              <span>Test MAE</span>
            </div>
            {BENCHMARK_MODELS.filter(m => !m.isWinner && m.name !== 'Historical Average').map(m => (
              <div
                key={m.name}
                onMouseEnter={() => setHoveredModel(m.shortName)}
                onMouseLeave={() => setHoveredModel(null)}
                className={`flex justify-between items-center py-0.5 px-1.5 rounded transition-colors ${
                  hoveredModel === m.shortName ? 'bg-cyan-500/15 text-white' : 'text-slate-700 dark:text-[#B8C7D8]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span>{m.name}</span>
                  <span className="text-[9.5px] text-slate-400">({m.type})</span>
                </div>
                <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">{m.mae.toFixed(4)} mph</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Collapsible Benchmark Details Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#17364E]/80">
        <button
          onClick={() => setShowDetails(!showDetails)}
          type="button"
          className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-[#8295A8] hover:text-cyan-500 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            {showDetails ? 'Hide Detailed Benchmark Table' : 'Benchmark Details & Calibration Statistics'}
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-3 overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar pt-2 space-y-3 animate-fade-in">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#17364E] text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-3 font-semibold">Model Architecture</th>
                  <th className="py-2 px-3 font-semibold text-right">Overall MAE</th>
                  <th className="py-2 px-3 font-semibold text-right">+60m MAE</th>
                  <th className="py-2 px-3 font-semibold text-center">Accuracy Index</th>
                  <th className="py-2 px-3 font-semibold text-center">Category Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 text-[11px]">
                {BENCHMARK_MODELS.map((m) => (
                  <tr
                    key={m.name}
                    className={`hover:bg-slate-50 dark:hover:bg-[#0B2033]/50 ${
                      m.isWinner ? 'bg-cyan-500/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-800 dark:text-[#BCD0E2] flex items-center gap-2">
                      {m.isWinner && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{m.name}</span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-900 dark:text-white font-bold">
                      {m.mae.toFixed(4)} mph
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-600 dark:text-[#8295A8]">
                      {m.mae60.toFixed(4)} mph
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums text-cyan-600 dark:text-cyan-400 font-bold">
                      {m.overallScore}%
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500 text-[10px]">
                      {m.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
