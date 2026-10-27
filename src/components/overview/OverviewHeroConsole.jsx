import React from 'react';
import { Radio, Clock, Filter, Eye } from 'lucide-react';

export default function OverviewHeroConsole({
  selectedSensor = '773869',
  onSelectSensor,
  sensorOptions = [],
  selectedRegion = 'REGION_C',
  onSelectRegion,
  timestampStr = '2012-03-01 00:00:00',
  timeIndex = 12
}) {
  const quickReps = [
    { id: '773869', name: '773869', region: 'REGION_C', label: 'Region C' },
    { id: '773975', name: '773975', region: 'REGION_A', label: 'Region A' },
    { id: '767541', name: '767541', region: 'REGION_B', label: 'Region B' },
    { id: '765171', name: '765171', region: 'REGION_D', label: 'Region D' }
  ];

  const regions = [
    { id: 'ALL', label: 'All Regions' },
    { id: 'REGION_A', label: 'Region A (North-East)' },
    { id: 'REGION_B', label: 'Region B (South-East)' },
    { id: 'REGION_C', label: 'Region C (Central-West)' },
    { id: 'REGION_D', label: 'Region D (North-West)' }
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 lg:p-6 shadow-xs dark:shadow-xl transition-colors">

      {/* Ambient background curve lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 160">
          <path d="M 0,140 Q 250,80 500,100 T 800,30" stroke="#00D2FF" strokeWidth="2.5" fill="none" />
          <path d="M 0,90 Q 300,130 600,60 T 800,120" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-blue-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F7FAFF] tracking-tight whitespace-nowrap">
              TrafficPulse-X
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-[#B8C7D8] font-medium">
            Current traffic state and next-hour outlook for the selected sensor.
          </p>

          {/* Context Badges Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-xs font-mono text-slate-700 dark:text-[#CBDDF0]">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>Historical Replay &bull; {timestampStr ? timestampStr.substring(0, 16) : 'Active Feed'}</span>
            </span>
          </div>
        </div>

        {/* Mini Sensor Switcher & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">

          {/* Quick Representative Sensor Pills */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033]/80 p-1 rounded-xl border border-slate-200 dark:border-[#17364E]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 hidden xl:inline">
              Quick:
            </span>
            {quickReps.map((rep) => {
              const isSelected = selectedSensor === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => onSelectSensor(rep.id)}
                  type="button"
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-sm font-extrabold'
                      : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#17364E]/50'
                  }`}
                >
                  {rep.name}
                </button>
              );
            })}
          </div>

          {/* Region & Sensor Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Region Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#17364E] text-xs">
              <Filter className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <select
                value={selectedRegion}
                onChange={(e) => onSelectRegion(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-[#F7FAFF] font-bold focus:outline-hidden cursor-pointer"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id} className="dark:bg-[#081827]">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sensor Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#17364E] text-xs">
              <Radio className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <select
                value={selectedSensor}
                onChange={(e) => onSelectSensor(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-[#F7FAFF] font-bold focus:outline-hidden cursor-pointer font-mono"
              >
                {sensorOptions.map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-[#081827]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
