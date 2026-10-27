import React, { useState } from 'react';
import { BarChart2, Radio, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import ScientificBadge from '../common/ScientificBadge';

export default function MultiSensorForecastComparison({
  selectedSensorId = '773869',
  selectedRegion = 'ALL',
  onSelectSensor
}) {
  const { isDark } = useTheme();
  const [horizonWindow, setHorizonWindow] = useState('15m'); // '5m' | '15m' | '30m' | '60m'

  // Canonical contextual representative sensors & telemetry
  const sensorDataMap = {
    '773869': { id: '773869', label: '773869 (Selected)', region: 'REGION_C', current: 61.1, f5: 61.8, f15: 62.9, f30: 62.8, f60: 62.5 },
    '773906': { id: '773906', label: '773906 (Corridor)', region: 'REGION_C', current: 68.5, f5: 68.0, f15: 67.2, f30: 66.8, f60: 65.4 },
    '718204': { id: '718204', label: '718204 (Arterial)', region: 'REGION_C', current: 60.8, f5: 61.0, f15: 61.4, f30: 62.0, f60: 61.8 },
    '767541': { id: '767541', label: '767541 (Corridor)', region: 'REGION_B', current: 67.6, f5: 67.2, f15: 66.8, f30: 66.1, f60: 65.2 },
    '717447': { id: '717447', label: '717447 (Highway)', region: 'REGION_C', current: 61.5, f5: 61.8, f15: 62.1, f30: 61.9, f60: 61.0 },
    '765171': { id: '765171', label: '765171 (Junction)', region: 'REGION_D', current: 64.2, f5: 64.6, f15: 65.0, f30: 64.8, f60: 64.1 },
    '773975': { id: '773975', label: '773975 (Loop)', region: 'REGION_A', current: 65.4, f5: 65.8, f15: 66.0, f30: 65.8, f60: 65.0 }
  };

  // 5 Representative sensors
  let rawSensors = [];
  if (selectedRegion === 'REGION_A') {
    rawSensors = ['773975', '773869', '767541', '765171', '718204'];
  } else if (selectedRegion === 'REGION_B') {
    rawSensors = ['767541', '773869', '773906', '717447', '765171'];
  } else if (selectedRegion === 'REGION_D') {
    rawSensors = ['765171', '773869', '767541', '773906', '718204'];
  } else {
    rawSensors = ['773869', '767541', '773906', '765171', '718204'];
  }

  // Ensure selectedSensorId is in the 5 if possible
  if (!rawSensors.includes(selectedSensorId) && sensorDataMap[selectedSensorId]) {
    rawSensors[0] = selectedSensorId;
  }

  const chartData = rawSensors.map(id => {
    const s = sensorDataMap[id] || { id, label: id, region: 'CORRIDOR', current: 63.5, f5: 63.8, f15: 64.2, f30: 64.0, f60: 63.1 };
    const forecast = horizonWindow === '5m' ? (s.f5 ?? s.f15) : horizonWindow === '15m' ? s.f15 : horizonWindow === '30m' ? s.f30 : s.f60;
    const delta = Number((forecast - s.current).toFixed(1));
    return {
      id: s.id,
      label: s.id,
      region: s.region,
      current: s.current,
      forecast: forecast,
      delta: delta,
      isSelected: s.id === selectedSensorId
    };
  });

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xl p-5 transition-colors">

      {/* Header with Title & Horizon Window Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-[#17364E]/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-blue-500/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
              Multi-Sensor Forecast Comparison
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-1 font-medium">
              Current vs predicted speed across 5 representative corridor detectors
            </p>
          </div>
        </div>

        {/* Controls and Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Horizon Toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
            {[
              { id: '5m', label: '+5 Min' },
              { id: '15m', label: '+15 Min' },
              { id: '30m', label: '+30 Min' },
              { id: '60m', label: '+60 Min' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setHorizonWindow(btn.id)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  horizonWindow === btn.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white'
                }`}
                type="button"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <ScientificBadge type="MODEL OUTPUT" label="CORRIDOR BENCHMARK" size="xs" />
        </div>
      </div>

      {/* Legend & Target Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pb-2 border-b border-slate-100 dark:border-[#17364E]/60 mb-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-[#7F96AA]">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Target: <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{selectedSensorId}</strong></span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
            <span className="text-slate-700 dark:text-[#B8C7D8]">Current Speed (mph)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-cyan-400 inline-block" />
            <span className="text-slate-700 dark:text-cyan-300 font-bold">+{horizonWindow} Forecast</span>
          </div>
        </div>
      </div>

      {/* Grouped Bar Chart Area */}
      <div className="w-full h-[230px] pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            barGap={4}
          >
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
              domain={[50, 75]}
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
                        <span className="font-extrabold text-cyan-600 dark:text-cyan-400">Sensor {data.id}</span>
                        <span className="text-[10px] text-slate-400">({data.region})</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                        <span>Current Speed:</span>
                        <strong>{data.current.toFixed(1)} mph</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2]">
                        <span>+{horizonWindow} Forecast:</span>
                        <strong className="text-cyan-500">{data.forecast.toFixed(1)} mph</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-[#BCD0E2] pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>Predicted Delta:</span>
                        <strong className={data.delta >= 0 ? 'text-emerald-500' : 'text-amber-500'}>
                          {data.delta >= 0 ? `+${data.delta}` : data.delta} mph
                        </strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={60} stroke="#64748B" strokeDasharray="3 3" opacity={0.4} />
            <Bar
              dataKey="current"
              name="Current Speed"
              fill={isDark ? "#2563EB" : "#3B82F6"}
              radius={[4, 4, 0, 0]}
              barSize={20}
              isAnimationActive={false}
              onClick={(entry) => onSelectSensor && onSelectSensor(entry.id)}
              className="cursor-pointer"
            />
            <Bar
              dataKey="forecast"
              name={`+${horizonWindow} Forecast`}
              fill="#00D2FF"
              radius={[4, 4, 0, 0]}
              barSize={20}
              isAnimationActive={false}
              onClick={(entry) => onSelectSensor && onSelectSensor(entry.id)}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Sensor Selector Strip */}
      <div className="grid grid-cols-5 gap-2 pt-3 mt-1 border-t border-slate-100 dark:border-[#17364E]/60 text-center font-mono">
        {chartData.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectSensor && onSelectSensor(s.id)}
            type="button"
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
              s.isSelected
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-300 font-bold shadow-xs'
                : 'bg-slate-50 dark:bg-[#071624] border-slate-200 dark:border-[#17364E] text-slate-600 dark:text-[#8295A8] hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="text-[11px] font-bold">{s.id}</div>
            <div className={`text-[10px] flex items-center justify-center gap-0.5 mt-0.5 ${
              s.delta >= 0 ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {s.delta >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              <span>{s.delta >= 0 ? `+${s.delta}` : s.delta}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Instructions */}
      <div className="mt-2 text-[10px] text-slate-400 dark:text-[#647C92] font-mono flex items-center justify-between">
        <span>Click any sensor column or pill above to switch active forecast sensor</span>
        <span>GCN-LSTM Multi-Horizon Inference</span>
      </div>

    </div>
  );
}
