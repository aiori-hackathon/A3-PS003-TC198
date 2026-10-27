import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Cpu
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import ScientificBadge from '../common/ScientificBadge';
import { useTheme } from '../../context/ThemeContext';

export const REGIONAL_METRICS = [
  {
    id: 'REGION_A',
    label: 'Region A',
    fullName: 'REGION_A (North-East)',
    sensors: 48,
    mae: 2.4446,
    note: 'Lowest error across network',
    isBest: true,
    color: '#10B981', // emerald
    lightColor: '#059669',
    advantage: '-28.9% vs global'
  },
  {
    id: 'REGION_C',
    label: 'Region C',
    fullName: 'REGION_C (Central-West)',
    sensors: 58,
    mae: 3.4840,
    note: 'Arterial highway cluster',
    isBest: false,
    color: '#3B82F6', // blue
    lightColor: '#2563EB',
    advantage: '+1.3% vs global'
  },
  {
    id: 'REGION_B',
    label: 'Region B',
    fullName: 'REGION_B (South-East)',
    sensors: 57,
    mae: 4.0770,
    note: 'High-density corridor',
    isBest: false,
    color: '#F59E0B', // amber
    lightColor: '#D97706',
    advantage: '+18.6% vs global'
  },
  {
    id: 'REGION_D',
    label: 'Region D',
    fullName: 'REGION_D (North-West)',
    sensors: 44,
    mae: 4.0979,
    note: 'Valley transition chokepoint',
    isBest: false,
    color: '#F43F5E', // rose
    lightColor: '#E11D48',
    advantage: '+19.2% vs global'
  }
];

export default function CollapsibleRegionalAnalysis() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(true); // Default open for analytical visibility

  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-2xl overflow-hidden shadow-xl transition-colors">

      {/* Header Button Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0B2033]/60 transition-colors text-left cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-[#F7FAFF] uppercase tracking-wider">
            Regional Performance Analysis
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            4 Regions &bull; Graph+LSTM Spatial Test MAE &bull; 207 Detectors
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hidden md:inline">
            Region A Best: 2.4446 mph
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded Chart & Comparison Area */}
      {isOpen && (
        <div className="p-5 border-t border-slate-200 dark:border-[#17364E] bg-slate-50/40 dark:bg-[#05111D] space-y-4 animate-fade-in">

          {/* Header Subtitle with Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div>
              <p className="text-slate-600 dark:text-[#A0B8D0] font-medium">
                Spatial test MAE comparison across regional sub-networks (Lower bar = Higher regional accuracy)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400 border-dashed border-b inline-block" />
                <span className="text-slate-500 dark:text-slate-400">Global MAE Baseline (3.4378)</span>
              </div>
              <ScientificBadge type="ST-GNN" label="SPATIAL EVALUATION" size="xs" />
            </div>
          </div>

          {/* Analytical Column Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">

            {/* Chart Area (~65%) */}
            <div className="lg:col-span-8 bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-4 shadow-xs">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REGIONAL_METRICS} margin={{ top: 20, right: 20, left: -20, bottom: 5 }} barSize={38}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#17364E" : "#E2E8F0"} vertical={false} opacity={0.7} />
                    <XAxis
                      dataKey="label"
                      stroke={isDark ? "#8295A8" : "#64748B"}
                      fontSize={11}
                      fontFamily="Inter, monospace"
                      fontWeight={600}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      stroke={isDark ? "#8295A8" : "#64748B"}
                      fontSize={11}
                      fontFamily="Inter, monospace"
                      tickLine={false}
                      unit=" mph"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 rounded-xl bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-xl space-y-1.5 min-w-[190px]">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                                <span className="font-bold" style={{ color: data.color }}>{data.fullName}</span>
                                {data.isBest && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    BEST
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                                <span>Spatial Test MAE:</span>
                                <strong className="text-slate-900 dark:text-white">{data.mae.toFixed(4)} mph</strong>
                              </div>
                              <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                                <span>Detector Count:</span>
                                <strong>{data.sensors} detectors</strong>
                              </div>
                              <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                                <span>Error Relative to Avg:</span>
                                <span className={data.isBest ? 'text-emerald-500 font-bold' : 'text-slate-400'}>{data.advantage}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                                {data.note}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Global MAE Reference Line */}
                    <ReferenceLine
                      y={3.4378}
                      stroke="#00D2FF"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{ value: 'Network Baseline 3.44 mph', fill: isDark ? '#00D2FF' : '#0284C7', fontSize: 10, position: 'top', fontFamily: 'monospace' }}
                    />
                    <Bar
                      dataKey="mae"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={false}
                      barSize={34}
                    >
                      {REGIONAL_METRICS.map((entry) => (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={isDark ? entry.color : entry.lightColor}
                          opacity={entry.isBest ? 1 : 0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Region Comparison Cards (~35%) */}
            <div className="lg:col-span-4 space-y-2 text-xs font-mono">
              {REGIONAL_METRICS.map((reg) => (
                <div
                  key={reg.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    reg.isBest
                      ? 'bg-emerald-500/10 border-emerald-500/40 dark:border-emerald-500/30 shadow-xs'
                      : 'bg-white dark:bg-[#081827] border-slate-200 dark:border-[#17364E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: reg.color }} />
                      <strong className="text-slate-900 dark:text-white font-bold">{reg.label}</strong>
                      {reg.isBest && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-slate-950 uppercase">
                          <Award className="w-2.5 h-2.5" /> Best
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <strong className="text-sm font-black tabular-nums text-slate-900 dark:text-white">
                        {reg.mae.toFixed(4)}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-sans">mph</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#8295A8] mt-1 pt-1 border-t border-slate-100 dark:border-[#17364E]/60">
                    <span>{reg.sensors} detectors</span>
                    <span className={reg.isBest ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>{reg.advantage}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Regional Summary Footer Strip */}
          <div className="pt-2 border-t border-slate-200 dark:border-[#17364E]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-slate-500 dark:text-[#7F96AA]">
            <span>Region A features the highest spatial correlation density (μ = 2.44 mph test error).</span>
            <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>4 Federated Client Models Verified</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
