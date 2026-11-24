import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

/**
 * ForecastChartCard Component
 * Renders the multi-horizon speed/flow trajectory chart with ±1σ uncertainty envelopes.
 */
export default function ForecastChartCard({
  chartData,
  isPeMS,
  selectedMetric,
  sensorId,
  isDark,
  currentUnit,
  selectedHorizon = 'ALL',
  onSelectHorizon
}) {
  return (
    <div className="lg:col-span-8 bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-2xl p-5 shadow-xs dark:shadow-md flex flex-col justify-between transition-colors">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              {isPeMS
                ? 'Next-Hour Traffic Flow Volume Forecast'
                : selectedMetric === 'delta'
                ? 'Next-Hour Traffic Speed Delta Forecast'
                : selectedMetric === 'residual'
                ? 'Next-Hour Forecast Residual Error Deviation'
                : 'Next-Hour Traffic Speed Forecast'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#B8C7D8] font-normal mt-0.5">
              {isPeMS
                ? 'Empirical multi-horizon traffic volume prediction (veh/5min) • PeMS08 SpatialGraphLSTM model'
                : selectedMetric === 'delta'
                ? 'Relative Speed Change vs Current Velocity (mph) • Multi-Horizon Inference (+5m → +60m)'
                : selectedMetric === 'residual'
                ? 'Absolute Residual Deviation |Ground Truth - Predicted| (mph) across prediction horizons'
                : selectedHorizon !== 'ALL'
                ? `Historical Input Window (-15m → -5m) • Target Horizon Filter: ${selectedHorizon} Forecast`
                : 'Historical Input Window (-15m → -5m) • Current State (Now) • Multi-Horizon Inference (+5m → +60m)'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-cyan-300 border border-blue-500/20">
              {sensorId}
            </span>
            {selectedHorizon !== 'ALL' ? (
              <button
                type="button"
                onClick={() => onSelectHorizon?.('ALL')}
                className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors flex items-center gap-1 cursor-pointer"
                title="Click to reset to all horizons"
              >
                <span>TARGET: {selectedHorizon}</span>
                <span className="text-xs font-bold leading-none">×</span>
              </button>
            ) : (
              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                ALL HORIZONS
              </span>
            )}
            <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              {isPeMS ? 'PeMS08 FLOW FORECAST' : 'ACTIVE FORECAST'}
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#17364E" : "#E2E8F0"} opacity={isDark ? 0.6 : 0.9} vertical={false} />
              <XAxis dataKey="step" stroke={isDark ? "#8295A8" : "#60758A"} fontSize={11} fontFamily="Inter, sans-serif" fontWeight={500} tickLine={false} />
              <YAxis
                domain={[(dataMin) => Math.max(0, Math.floor(dataMin - 6)), (dataMax) => Math.ceil(dataMax + 8)]}
                width={54}
                stroke={isDark ? "#8295A8" : "#60758A"}
                fontSize={11}
                fontFamily="Inter, sans-serif"
                fontWeight={500}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v)} ${isPeMS ? 'veh' : 'mph'}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-2xl space-y-1.5">
                        <div className="font-bold text-slate-700 dark:text-cyan-400 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</div>
                        {payload.map((entry, idx) => (
                          <div key={idx} style={{ color: entry.color }} className="flex items-center justify-between gap-4">
                            <span>{entry.name}:</span>
                            <strong>{entry.value !== null ? `${entry.value} ${currentUnit}` : 'N/A'}</strong>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Shaded Forecast Region */}
              <ReferenceArea x1="T0 (Now)" stroke="none" fill="#0284c7" fillOpacity={isDark ? 0.08 : 0.05} />
              {/* Prominent Vertical NOW line */}
              <ReferenceLine
                x="T0 (Now)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: 'NOW (T0)', fill: '#f59e0b', fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 700, position: 'top' }}
              />
              {/* Optional Target Horizon Reference Line when filtered */}
              {selectedHorizon !== 'ALL' && (
                <ReferenceLine
                  x={selectedHorizon}
                  stroke="#00D2FF"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{
                    value: `TARGET (${selectedHorizon})`,
                    fill: '#00D2FF',
                    fontSize: 10,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    position: 'top'
                  }}
                />
              )}
              {/* Upper Uncertainty Envelope */}
              <Line
                type="monotone"
                dataKey="upper"
                name="Uncertainty Bound (+1σ)"
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                connectNulls={true}
              />
              {/* Predicted Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                name={isPeMS ? "Predicted Flow (veh/5min)" : "Predicted Speed (mph)"}
                stroke="#00D2FF"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload || payload.predicted === null || payload.predicted === undefined) return null;
                  const isTarget = selectedHorizon !== 'ALL' && payload.step === selectedHorizon;
                  return (
                    <g key={`pred-dot-${payload.step}`}>
                      {isTarget && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="none"
                          stroke="#00D2FF"
                          strokeWidth={2}
                          strokeDasharray="2 2"
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isTarget ? 5.5 : 4.5}
                        fill={isTarget ? '#FFFFFF' : '#00D2FF'}
                        stroke="#00D2FF"
                        strokeWidth={isTarget ? 2.5 : 1.5}
                      />
                    </g>
                  );
                }}
                activeDot={{ r: 6.5, fill: '#00D2FF' }}
                connectNulls={true}
              />
              {/* Lower Uncertainty Envelope */}
              <Line
                type="monotone"
                dataKey="lower"
                name="Uncertainty Bound (-1σ)"
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                connectNulls={true}
              />
              {/* Actual Telemetry Line */}
              <Line
                type="monotone"
                dataKey="actual"
                name={isPeMS ? "Actual Flow (veh/5min)" : "Actual / Replay Speed (mph)"}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3.5, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 dark:text-[#7F96AA] pt-3 mt-2 border-t border-slate-100 dark:border-[#17364E]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-sans">
        <span>Input Window: Past 60 minutes (12 timesteps @ 5-min intervals)</span>
        <span>
          {selectedHorizon === 'ALL'
            ? 'Forecast Horizon: Up to 60 minutes ahead (4 multi-step horizons)'
            : `Filtered Horizon: Showing forecast trajectory up to ${selectedHorizon} • Click another horizon or ALL to expand`}
        </span>
      </div>
    </div>
  );
}
