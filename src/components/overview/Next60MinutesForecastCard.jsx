import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { useTheme } from '../../context/ThemeContext';

export default function Next60MinutesForecastCard({
  currentSpeed = 62.0,
  predictions = [],
  sensorId = '773869'
}) {
  const { isDark } = useTheme();

  // Uncertainty deltas calibrated to empirical 1-sigma bounds
  const uncertaintyDeltas = {
    '+5 min': 1.65,
    '+15 min': 2.10,
    '+30 min': 2.85,
    '+60 min': 3.90
  };

  // Build the 5 points: NOW, +5m, +15m, +30m, +60m
  const chartData = [
    {
      step: 'NOW',
      speed: Number(currentSpeed.toFixed(1)),
      upper: Number((currentSpeed + 1.2).toFixed(1)),
      lower: Number((currentSpeed - 1.2).toFixed(1))
    }
  ];

  predictions.forEach((p) => {
    const delta = uncertaintyDeltas[p.horizonLabel] || 2.5;
    const pSpeed = p.predictedSpeedMph !== undefined ? Number(p.predictedSpeedMph) : currentSpeed;
    chartData.push({
      step: p.horizonLabel,
      speed: Number(pSpeed.toFixed(1)),
      upper: Number((pSpeed + delta).toFixed(1)),
      lower: Number((pSpeed - delta).toFixed(1))
    });
  });

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 shadow-xl transition-colors">

      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F7FAFF] flex items-center gap-2">
                NEXT 60 MINUTES
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8295A8]">
                Speed trajectory forecast
              </p>
            </div>
          </div>
        </div>

        {/* Stepped Horizon Value Strip */}
        <div className="grid grid-cols-5 gap-2 mb-4 bg-slate-50 dark:bg-[#04101A] p-2.5 rounded-xl border border-slate-200/80 dark:border-[#17364E]/60 text-center font-mono">
          {chartData.map((pt, idx) => (
            <div key={pt.step} className="space-y-0.5">
              <span className={`text-[10px] uppercase font-bold block ${
                idx === 0 ? 'text-amber-500' : 'text-slate-400 dark:text-[#7F96AA]'
              }`}>
                {pt.step}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                {pt.speed.toFixed(1)}
              </span>
              <span className="text-[9px] text-slate-400 block font-sans">mph</span>
            </div>
          ))}
        </div>

        {/* Main Trajectory Chart */}
        <div className="h-[210px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#17364E" : "#E2E8F0"} opacity={isDark ? 0.6 : 0.9} vertical={false} />
              <XAxis dataKey="step" stroke={isDark ? "#8295A8" : "#60758A"} fontSize={11} fontFamily="Inter, sans-serif" fontWeight={600} tickLine={false} />
              <YAxis domain={['dataMin - 3', 'dataMax + 3']} width={56} stroke={isDark ? "#8295A8" : "#60758A"} fontSize={11} fontFamily="Inter, sans-serif" fontWeight={500} tickLine={false} tickFormatter={(v) => `${Math.round(v)} mph`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#04101A] border border-slate-200 dark:border-[#17364E] text-slate-900 dark:text-white text-xs font-mono shadow-2xl space-y-1">
                        <div className="font-bold text-slate-700 dark:text-cyan-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                          Horizon: {label}
                        </div>
                        <div className="text-cyan-500 font-bold">
                          Forecast Speed: {payload[0]?.value} mph
                        </div>
                        {payload[1] && (
                          <div className="text-purple-400 text-[10px]">
                            Upper (+1σ): {payload[1]?.value} mph
                          </div>
                        )}
                        {payload[2] && (
                          <div className="text-purple-400 text-[10px]">
                            Lower (-1σ): {payload[2]?.value} mph
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Shaded Forecast Horizon Area */}
              <ReferenceArea x1="NOW" stroke="none" fill="#0284c7" fillOpacity={isDark ? 0.08 : 0.05} />

              {/* Vertical NOW Line */}
              <ReferenceLine
                x="NOW"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: 'NOW', fill: '#f59e0b', fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, position: 'top' }}
              />

              {/* Upper Uncertainty Bound */}
              <Line
                type="monotone"
                dataKey="upper"
                name="Uncertainty (+1σ)"
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
              />

              {/* Primary Forecast Speed Trajectory */}
              <Line
                type="monotone"
                dataKey="speed"
                name="Speed (mph)"
                stroke="#00D2FF"
                strokeWidth={3}
                dot={{ r: 5, fill: '#00D2FF', stroke: isDark ? '#071727' : '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#00D2FF' }}
              />

              {/* Lower Uncertainty Bound */}
              <Line
                type="monotone"
                dataKey="lower"
                name="Uncertainty (-1σ)"
                stroke="#a855f7"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Nav Link */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-[#17364E]/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-mono">
          Horizons: Now to +60 min
        </span>
        <Link
          to={`/predictions?sensor=${sensorId}`}
          onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); if (document.documentElement) document.documentElement.scrollTop = 0; if (document.body) document.body.scrollTop = 0; }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          <span>View Forecast Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
