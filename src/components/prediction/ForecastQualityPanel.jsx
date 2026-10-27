import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import ScientificBadge from '../common/ScientificBadge';

export default function ForecastQualityPanel({
  selectedSensorId = '773869',
  selectedHorizon = 'ALL'
}) {
  const { isDark } = useTheme();

  const horizonProfileData = [
    {
      horizon: '+5 min',
      label: '+5m',
      uncertaintyVal: 1.65,
      uncertaintyStr: '±1.65 mph',
      confidence: 'HIGH',
      confidencePct: 92,
      mae: '2.36 mph',
      statusColor: '#10B981', // emerald
      statusBg: 'bg-emerald-500/15',
      statusText: 'text-emerald-600 dark:text-emerald-400',
      statusBorder: 'border-emerald-500/30'
    },
    {
      horizon: '+15 min',
      label: '+15m',
      uncertaintyVal: 2.10,
      uncertaintyStr: '±2.10 mph',
      confidence: 'HIGH',
      confidencePct: 84,
      mae: '3.00 mph',
      statusColor: '#06B6D4', // cyan
      statusBg: 'bg-cyan-500/15',
      statusText: 'text-cyan-600 dark:text-cyan-400',
      statusBorder: 'border-cyan-500/30'
    },
    {
      horizon: '+30 min',
      label: '+30m',
      uncertaintyVal: 2.85,
      uncertaintyStr: '±2.85 mph',
      confidence: 'MEDIUM',
      confidencePct: 68,
      mae: '3.67 mph',
      statusColor: '#F59E0B', // amber
      statusBg: 'bg-amber-500/15',
      statusText: 'text-amber-600 dark:text-amber-400',
      statusBorder: 'border-amber-500/30'
    },
    {
      horizon: '+60 min',
      label: '+60m',
      uncertaintyVal: 3.90,
      uncertaintyStr: '±3.90 mph',
      confidence: 'LOW',
      confidencePct: 45,
      mae: '4.72 mph',
      statusColor: '#F43F5E', // rose
      statusBg: 'bg-rose-500/15',
      statusText: 'text-rose-600 dark:text-rose-400',
      statusBorder: 'border-rose-500/30'
    }
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xl p-5 transition-colors">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-[#17364E]/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
              Forecast Quality &amp; Uncertainty Profile
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-1 font-medium">
              Empirical 1σ residual variance bounds across forecast horizons for detector {selectedSensorId}
            </p>
          </div>
        </div>

        <ScientificBadge type="EVIDENCE" label="CALIBRATED 1σ" size="xs" />
      </div>

      {/* Uncertainty Profile Area Chart */}
      <div className="flex-1 w-full min-h-[140px] pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={horizonProfileData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="uncertaintyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={isDark ? 0.4 : 0.25} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#17364E" : "#E2E8F0"} vertical={false} opacity={0.6} />
            <XAxis
              dataKey="horizon"
              stroke={isDark ? "#8295A8" : "#64748B"}
              fontSize={11}
              fontFamily="Inter, sans-serif"
              fontWeight={600}
              tickLine={false}
            />
            <YAxis
              domain={[0, 4.5]}
              width={42}
              stroke={isDark ? "#8295A8" : "#64748B"}
              fontSize={10}
              fontFamily="Inter, sans-serif"
              tickLine={false}
              tickFormatter={(v) => `${v} mph`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-xl space-y-1">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                        <strong className="text-purple-600 dark:text-purple-400">{d.horizon} Horizon</strong>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${d.statusBg} ${d.statusText} border ${d.statusBorder}`}>
                          {d.confidence}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-600 dark:text-[#BCD0E2]">
                        <span>Uncertainty (1σ):</span>
                        <strong className="text-slate-900 dark:text-white">{d.uncertaintyStr}</strong>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-600 dark:text-[#BCD0E2]">
                        <span>Historical MAE:</span>
                        <span>{d.mae}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="uncertaintyVal"
              name="Uncertainty (± mph)"
              stroke="#A855F7"
              strokeWidth={2.5}
              fill="url(#uncertaintyGradient)"
              isAnimationActive={false}
              dot={(props) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    key={`dot-${payload.horizon}`}
                    cx={cx}
                    cy={cy}
                    r={4.5}
                    fill={payload.statusColor}
                    stroke={isDark ? "#081827" : "#FFFFFF"}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Horizon Progression Chips */}
      <div className="grid grid-cols-4 gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-[#17364E]/60 text-xs font-mono">
        {horizonProfileData.map((h) => {
          const isSelected = selectedHorizon === h.horizon;

          return (
            <div
              key={h.horizon}
              className={`p-2 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-purple-500/15 border-purple-500/50 shadow-xs ring-1 ring-purple-500/30'
                  : 'bg-slate-50 dark:bg-[#071624] border-slate-200 dark:border-[#17364E]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">{h.label}</span>
                <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold uppercase ${h.statusBg} ${h.statusText}`}>
                  {h.confidence}
                </span>
              </div>
              <div className="font-extrabold text-[12px] text-slate-900 dark:text-white tabular-nums">
                {h.uncertaintyStr}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2 mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-[#647C92] font-mono">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-purple-400" />
          Short horizons maintain narrow residual dispersion
        </span>
        <span>Empirical Calibrated Band</span>
      </div>

    </div>
  );
}
