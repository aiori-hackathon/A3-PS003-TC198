import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function SavingsVsPredictionQualityChart({
  activeStrategy = 'FIFTY',
  onSelectStrategy
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const strategies = [
    {
      id: 'FULL',
      name: 'Full Participation',
      short: 'Full (4/4)',
      bytes: 11468184,
      mb: 11.47,
      mae: 3.6473,
      reduction: '0.0%',
      isBaseline: true
    },
    {
      id: 'SEVENTY_FIVE',
      name: '75% Participation',
      short: '75% (3/4)',
      bytes: 8601138,
      mb: 8.60,
      mae: 3.6530,
      reduction: '25.0%',
      isDominated: true
    },
    {
      id: 'FIFTY',
      name: '50% Participation',
      short: '50% (2/4)',
      bytes: 5734092,
      mb: 5.73,
      mae: 3.6448,
      reduction: '50.0%',
      isBestTradeoff: true
    },
    {
      id: 'TWENTY_FIVE',
      name: '25% Participation',
      short: '25% (1/4)',
      bytes: 2867046,
      mb: 2.87,
      mae: 3.6699,
      reduction: '75.0%',
      isMaxReduction: true
    }
  ];

  // SVG Chart Geometry
  const width = 500;
  const height = 200;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 26;
  const padBottom = 38;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxMB = 14.0;
  const minMAE = 3.62;
  const maxMAE = 3.70;

  // Bar spacing
  const barWidth = 36;
  const colStep = chartW / strategies.length;

  const getBarX = (i) => padLeft + i * colStep + (colStep - barWidth) / 2;
  const getBarY = (mb) => padTop + chartH - (mb / maxMB) * chartH;
  const getBarH = (mb) => (mb / maxMB) * chartH;

  const getLineX = (i) => padLeft + i * colStep + colStep / 2;
  const getLineY = (mae) => {
    const clamped = Math.max(minMAE, Math.min(maxMAE, mae));
    return padTop + chartH - ((clamped - minMAE) / (maxMAE - minMAE)) * chartH;
  };

  // Connect MAE line
  const maeLinePath = strategies.reduce((acc, p, i) => {
    const x = getLineX(i);
    const y = getLineY(p.mae);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md p-5 transition-colors justify-between min-h-[350px]">

      {/* Header: Title + Legends */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
                Communication–Accuracy Trade-off
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-1 font-medium">
                Application payload vs predictive precision across participation strategies
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500" />
              <span className="text-slate-600 dark:text-[#8295A8]">Payload (MB)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
              <span className="text-slate-600 dark:text-[#8295A8]">Test MAE (mph)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Dual-Axis SVG Chart */}
      <div className="flex-1 flex flex-col justify-center relative py-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid lines */}
          {[0, 3.5, 7.0, 10.5, 14.0].map((tick) => {
            const y = getBarY(tick);
            const maeTick = minMAE + (tick / maxMB) * (maxMAE - minMAE);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-[#132A40]"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Left Y-axis (Payload MB) */}
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 dark:fill-[#647C92] font-mono"
                >
                  {tick.toFixed(1)}
                </text>
                {/* Right Y-axis (MAE mph) */}
                <text
                  x={width - padRight + 6}
                  y={y + 3}
                  textAnchor="start"
                  className="text-[9px] fill-rose-500 dark:fill-rose-400 font-mono"
                >
                  {maeTick.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Vertical Bars for Serialized Application Payload */}
          {strategies.map((p, i) => {
            const x = getBarX(i);
            const y = getBarY(p.mb);
            const h = getBarH(p.mb);
            const isHovered = hoveredIdx === i;
            const isSelected = activeStrategy === p.id;

            return (
              <g
                key={p.name}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectStrategy && onSelectStrategy(p.id)}
                className="cursor-pointer"
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx="4"
                  className={`transition-all duration-200 ${
                    p.isBestTradeoff
                      ? isSelected
                        ? 'fill-emerald-500 stroke-2 stroke-emerald-300'
                        : 'fill-emerald-500/80 hover:fill-emerald-500'
                      : isSelected
                        ? 'fill-blue-600 stroke-2 stroke-cyan-300'
                        : 'fill-blue-500/70 hover:fill-blue-500'
                  }`}
                  opacity={isHovered || isSelected ? 1 : 0.85}
                />

                {/* Bar Top Value Label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold fill-slate-700 dark:fill-slate-300"
                >
                  {p.mb.toFixed(2)}M
                </text>

                {/* X-axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={padTop + chartH + 15}
                  textAnchor="middle"
                  className={`text-[10px] font-bold ${
                    isSelected
                      ? 'fill-blue-600 dark:fill-cyan-400 font-extrabold'
                      : 'fill-slate-600 dark:fill-[#A0B3C6]'
                  }`}
                >
                  {p.short}
                </text>

                {/* X-axis reduction tag */}
                <text
                  x={x + barWidth / 2}
                  y={padTop + chartH + 26}
                  textAnchor="middle"
                  className="text-[8px] font-mono fill-emerald-600 dark:fill-emerald-400 font-semibold"
                >
                  {p.reduction}
                </text>
              </g>
            );
          })}

          {/* Test MAE Line connecting points */}
          <path
            d={maeLinePath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="filter drop-shadow-xs"
          />

          {/* Test MAE Point Circles */}
          {strategies.map((p, i) => {
            const cx = getLineX(i);
            const cy = getLineY(p.mae);
            const isHovered = hoveredIdx === i;
            const labelY = (i === 3) ? cy - 9 : cy + 14;

            return (
              <g key={`mae-${p.name}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 4}
                  className="fill-rose-500 stroke-white dark:stroke-[#071727] stroke-2 transition-all"
                />
                {/* Floating MAE Value on Line with pill background */}
                <g transform={`translate(${cx}, ${labelY})`}>
                  <rect
                    x="-22"
                    y="-7"
                    width="44"
                    height="14"
                    rx="3"
                    className="fill-white/95 dark:fill-[#071727]/95 stroke stroke-rose-400/40"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[8.5px] font-mono font-bold fill-rose-600 dark:fill-rose-400"
                  >
                    {p.mae.toFixed(4)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Callout: Highlight 50% Participation */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-semibold text-slate-700 dark:text-[#B8C7D8]">
            50% Participation (2/4 clients):
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            Best Observed Balanced Trade-off
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-[#647C92] hidden sm:inline">
          50.0% reduction &bull; 3.6448 MAE
        </span>
      </div>

    </div>
  );
}
