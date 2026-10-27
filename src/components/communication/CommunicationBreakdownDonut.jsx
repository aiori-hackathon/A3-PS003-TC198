import React, { useState } from 'react';
import { PieChart } from 'lucide-react';

export default function CommunicationBreakdownDonut({
  totalBytes = 11468184,
  strategyName = "Full Participation"
}) {
  const [hoveredId, setHoveredId] = useState(null);

  // Compute breakdown dynamically based on current strategy
  // Upload and Download are equal in synchronous FedAvg (half each of the federated total)
  const halfBytes = Math.round(totalBytes / 2);
  const uploadBytes = halfBytes;
  const downloadBytes = halfBytes;

  // Queries are evidence-on-demand proxies
  const segments = [
    {
      id: 'upload',
      label: 'FL Model Upload',
      category: 'Federated Model Exchange',
      bytesNum: uploadBytes,
      bytes: (uploadBytes / 1000000).toFixed(2) + ' MB',
      bytesRaw: `${uploadBytes.toLocaleString('en-US')} B`,
      percent: 49.8,
      color: '#a855f7',
      isMeasured: true
    },
    {
      id: 'download',
      label: 'FL Model Download',
      category: 'Federated Model Exchange',
      bytesNum: downloadBytes,
      bytes: (downloadBytes / 1000000).toFixed(2) + ' MB',
      bytesRaw: `${downloadBytes.toLocaleString('en-US')} B`,
      percent: 49.8,
      color: '#3b82f6',
      isMeasured: true
    },
    {
      id: 'detailed-queries',
      label: 'Detailed Queries',
      category: 'Evidence Telemetry',
      bytesNum: 38709,
      bytes: '~38.7 KB',
      bytesRaw: '4,301 B / batch',
      percent: 0.3,
      color: '#10b981',
      isProxy: true
    },
    {
      id: 'compact-queries',
      label: 'Compact Queries',
      category: 'Sensor Heartbeat',
      bytesNum: 14960,
      bytes: '~15.0 KB',
      bytesRaw: '187 B / req',
      percent: 0.1,
      color: '#06b6d4',
      isMeasured: true
    }
  ];

  // SVG Donut Calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~376.99

  // Calculate arc lengths for SVG rendering
  // Ensure small categories remain visible with a minimum stroke width
  const displayPercents = segments.map(s => {
    if (s.id === 'compact-queries') return 3.0;
    if (s.id === 'detailed-queries') return 4.0;
    return s.percent * 0.93;
  });

  let runningOffset = 0;
  const arcData = segments.map((seg, idx) => {
    const len = (displayPercents[idx] / 100) * circumference;
    const offset = runningOffset;
    runningOffset -= len;
    return {
      ...seg,
      dashArray: `${len} ${circumference}`,
      dashOffset: offset
    };
  });

  const hoveredSegment = hoveredId ? segments.find(s => s.id === hoveredId) : null;
  const totalDisplay = (totalBytes / 1000000).toFixed(2) + " MB";

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md p-5 transition-colors justify-between min-h-[350px]">

      {/* Header: Title + Subtitle */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
                Communication Breakdown
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-1 font-medium">
                Payload contribution by communication component
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#0B2033] text-slate-600 dark:text-[#8295A8] border border-slate-200 dark:border-[#17364E]">
            {strategyName}
          </span>
        </div>
      </div>

      {/* Middle: Donut + Legend */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-7 py-3">

        {/* Donut Container */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform overflow-visible" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-slate-100 dark:text-[#0C243B]"
            />

            {/* Segment Arcs */}
            {arcData.map((arc) => {
              const isHovered = hoveredId === arc.id;
              return (
                <circle
                  key={arc.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={isHovered ? 20 : 16}
                  strokeDasharray={arc.dashArray}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredId(arc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {hoveredSegment ? hoveredSegment.bytes : totalDisplay}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8295A8] mt-0.5 truncate max-w-[120px]">
              {hoveredSegment ? hoveredSegment.label : 'Total Payload'}
            </span>
          </div>
        </div>

        {/* Legend on Right Side */}
        <div className="w-full sm:w-auto flex-1 flex flex-col justify-center space-y-2">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                hoveredId === seg.id
                  ? 'bg-slate-100 dark:bg-[#0E2740] border-slate-300 dark:border-[#1E4B72] shadow-xs'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#0B2033]/60 hover:border-slate-200 dark:hover:border-[#17364E]'
              }`}
              onMouseEnter={() => setHoveredId(seg.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-bold text-slate-800 dark:text-[#D1DFEC] truncate">
                    {seg.label}
                  </span>
                  {seg.isProxy && (
                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                      proxy
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2 text-right shrink-0 font-mono">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {seg.percent}%
                </span>
                <span className="text-[10px] text-slate-400 dark:text-[#647C92]">
                  ({seg.bytes})
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer Note */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        <span>Serialized Application Layer</span>
        <span>Physical transport excluded</span>
      </div>

    </div>
  );
}
