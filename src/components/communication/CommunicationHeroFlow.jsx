import React from 'react';
import { ArrowDown, Activity } from 'lucide-react';

export default function CommunicationHeroFlow({
  _activeStrategy = 'FIFTY',
  _onSelectStrategy,
  baselineTotalBytes = 11468184,
  selectedTotalBytes = 5734092,
  reductionPercent = 50.0,
  selectedStrategyName = "50% Participation",
  isBestTradeoff = true
}) {
  const formattedSelected = (selectedTotalBytes / 1000000).toFixed(2) + " MB";
  const formattedBaseline = (baselineTotalBytes / 1000000).toFixed(2) + " MB";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#061220] border border-slate-200 dark:border-cyan-900/40 shadow-xs dark:shadow-2xl p-5 lg:p-6 transition-colors">

      {/* Background Ambience: Subtle Perspective Grid & Traffic Light Streaks */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, black 40%, transparent 100%)'
        }}
      />

      {/* Subtle Glowing Beams */}
      <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-l from-cyan-500/10 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

      {/* Main Container: Flow Strip (Left/Center/Right Stages) + Summary Callout */}
      <div className="relative z-10 flex flex-col xl:flex-row items-stretch gap-6">

        {/* ==================================================================== */}
        {/* LEFT & CENTER: TWO-TIER HIERARCHICAL PIPELINE                        */}
        {/* ==================================================================== */}
        <div className="flex-1 flex flex-col justify-between">

          {/* Top Labels for Sensor-to-Edge and Federated Model Exchange */}
          <div className="grid grid-cols-2 gap-4 pb-2.5 border-b border-slate-200 dark:border-cyan-900/30 text-xs font-semibold">
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Sensor-to-Edge Communication</span>
            </div>
            <div className="flex items-center gap-2 justify-end text-purple-700 dark:text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>Federated Model Exchange</span>
            </div>
          </div>

          {/* Interactive Graphic Stages Row */}
          <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3 py-3">

            {/* STAGE 1: METR-LA SENSORS (Cols 1-3) */}
            <div className="md:col-span-3 flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50 dark:bg-[#091C31]/80 border border-slate-200 dark:border-cyan-500/30 shadow-xs dark:shadow-md relative group hover:border-cyan-500/50 transition-all">
              {/* Isometric Road & Sensor Towers Graphic */}
              <div className="relative w-40 h-24 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 160 100" fill="none">
                  {/* Perspective Freeway Road */}
                  <path d="M10 70 L80 32 L150 70 L80 98 Z" className="fill-slate-200 dark:fill-[#0c233c] stroke-slate-300 dark:stroke-[#18426b]" strokeWidth="1.5" />
                  <path d="M30 60 L80 34 L130 60" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />

                  {/* Sensor Tower 1 (Left - Cyan) */}
                  <line x1="45" y1="60" x2="45" y2="30" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="45" cy="28" r="4.5" fill="#0284c7" />

                  {/* Sensor Tower 2 (Center Active - Pulse) */}
                  <line x1="80" y1="48" x2="80" y2="18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="80" cy="16" r="5.5" fill="#10b981" />
                  <circle cx="80" cy="16" r="12" stroke="#10b981" strokeWidth="1.5" opacity="0.4" className="animate-ping" style={{ animationDuration: '3s' }} />

                  {/* Sensor Tower 3 (Right - Cyan) */}
                  <line x1="115" y1="60" x2="115" y2="30" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="115" cy="28" r="4.5" fill="#0284c7" />
                </svg>
              </div>

              {/* Sensor Badge */}
              <div className="mt-1 px-3 py-1 rounded-lg bg-white dark:bg-cyan-950/90 border border-slate-200 dark:border-cyan-500/40 text-center shadow-xs">
                <div className="text-xs font-black text-slate-900 dark:text-white tracking-wide">
                  207 METR-LA Sensors
                </div>
                <div className="text-[10px] text-cyan-700 dark:text-cyan-300 font-semibold">
                  178 Valid Telemetry Nodes
                </div>
              </div>
            </div>

            {/* FLOW 1: SENSOR -> EDGE STREAM (Col 4) */}
            <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
              <div className="text-center space-y-1 mb-1">
                <div className="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 whitespace-nowrap bg-cyan-50 dark:bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/30">
                  187 B
                </div>
                <div className="text-[9px] text-slate-500 dark:text-cyan-400/80 font-mono">
                  Compact
                </div>
              </div>

              {/* Directional Flow Beam */}
              <div className="w-full flex items-center justify-center py-1">
                <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 16">
                  <path
                    d="M 5 8 Q 30 14 55 8"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    className="animate-pulse"
                  />
                  <polygon points="53,5 59,8 53,11" fill="#06b6d4" />
                </svg>
              </div>

              <div className="mt-1 text-center">
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block">Detailed</span>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">~4.2 KB</span>
              </div>
            </div>

            {/* STAGE 2: 4 REGIONAL FL CLIENTS (Cols 5-7) */}
            <div className="md:col-span-3 flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F1B35]/80 border border-slate-200 dark:border-blue-500/30 shadow-xs dark:shadow-md relative group hover:border-blue-500/50 transition-all">
              {/* Regional Client Node Building Graphic */}
              <div className="relative w-40 h-24 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 160 100" fill="none">
                  {/* Glowing Base Platform */}
                  <ellipse cx="80" cy="80" rx="52" ry="14" className="fill-slate-200 dark:fill-[#132a4e] stroke-blue-400 dark:stroke-[#2563eb]" strokeWidth="1.5" />

                  {/* 3D Edge Server Chassis Block */}
                  <path d="M55 42 L80 30 L80 72 L55 84 Z" className="fill-blue-100 dark:fill-[#1e3a63] stroke-blue-400 dark:stroke-[#3b82f6]" strokeWidth="1" />
                  <path d="M80 30 L105 42 L105 84 L80 72 Z" className="fill-blue-200 dark:fill-[#294f85] stroke-blue-400 dark:stroke-[#3b82f6]" strokeWidth="1" />
                  <path d="M55 42 L80 30 L105 42 L80 54 Z" fill="#3b82f6" opacity="0.8" />

                  {/* Antenna & Beacon Ring */}
                  <line x1="80" y1="30" x2="80" y2="12" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="80" cy="10" r="3" fill="#2563eb" />
                </svg>
              </div>

              {/* Edge Clients Badge */}
              <div className="mt-1 px-3 py-1 rounded-lg bg-white dark:bg-blue-950/90 border border-slate-200 dark:border-blue-500/40 text-center shadow-xs">
                <div className="text-xs font-black text-slate-900 dark:text-white tracking-wide">
                  4 Regional FL Clients
                </div>
                <div className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
                  Regions A, B, C &amp; D
                </div>
              </div>
            </div>

            {/* FLOW 2: EDGE -> GLOBAL SERVER STREAM (Col 8) */}
            <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
              <div className="text-center space-y-1 mb-1">
                <div className="text-[10px] font-bold text-purple-800 dark:text-purple-300 whitespace-nowrap bg-purple-50 dark:bg-purple-950/70 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/30">
                  110.3 KB
                </div>
                <div className="text-[9px] text-slate-500 dark:text-purple-400/80 font-mono">
                  Upload
                </div>
              </div>

              {/* Directional Flow Beam */}
              <div className="w-full flex items-center justify-center py-1">
                <svg className="w-16 h-5 overflow-visible" viewBox="0 0 60 16">
                  <path
                    d="M 5 8 Q 30 2 55 8"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                    className="animate-pulse"
                  />
                  <polygon points="53,5 59,8 53,11" fill="#a855f7" />
                </svg>
              </div>

              <div className="mt-1 text-center">
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block">Download</span>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">110.3 KB</span>
              </div>
            </div>

            {/* STAGE 3: GLOBAL FEDAVG SERVER (Cols 9-11) */}
            <div className="md:col-span-3 flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50 dark:bg-[#19112E]/80 border border-slate-200 dark:border-purple-500/30 shadow-xs dark:shadow-md relative group hover:border-purple-500/50 transition-all">
              {/* Server Racks Graphic */}
              <div className="relative w-40 h-24 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 160 100" fill="none">
                  {/* Base Platform */}
                  <ellipse cx="80" cy="85" rx="45" ry="12" className="fill-slate-200 dark:fill-[#201138] stroke-purple-400 dark:stroke-[#7e22ce]" strokeWidth="1.5" />

                  {/* Rack 1 */}
                  <rect x="52" y="36" width="56" height="12" rx="2" className="fill-purple-100 dark:fill-[#2d1b4e] stroke-purple-400 dark:stroke-[#a855f7]" strokeWidth="1.2" />
                  <circle cx="58" cy="42" r="2" fill="#10b981" />
                  <circle cx="64" cy="42" r="2" fill="#38bdf8" />
                  <line x1="72" y1="42" x2="102" y2="42" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Rack 2 */}
                  <rect x="52" y="52" width="56" height="12" rx="2" className="fill-purple-100 dark:fill-[#2d1b4e] stroke-purple-400 dark:stroke-[#a855f7]" strokeWidth="1.2" />
                  <circle cx="58" cy="58" r="2" fill="#10b981" />
                  <circle cx="64" cy="58" r="2" fill="#f59e0b" />
                  <line x1="72" y1="58" x2="102" y2="58" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Rack 3 */}
                  <rect x="52" y="68" width="56" height="12" rx="2" className="fill-purple-100 dark:fill-[#2d1b4e] stroke-purple-400 dark:stroke-[#a855f7]" strokeWidth="1.2" />
                  <circle cx="58" cy="74" r="2" fill="#10b981" />
                  <circle cx="64" cy="74" r="2" fill="#38bdf8" />
                  <line x1="72" y1="74" x2="102" y2="74" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Global Server Badge */}
              <div className="mt-1 px-3 py-1 rounded-lg bg-white dark:bg-purple-950/90 border border-slate-200 dark:border-purple-500/40 text-center shadow-xs">
                <div className="text-xs font-black text-slate-900 dark:text-white tracking-wide">
                  Global FedAvg Server
                </div>
                <div className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                  Graph+LSTM Aggregator
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ==================================================================== */}
        {/* RIGHT: TOTAL COMMUNICATION SUMMARY (REACTIVE TO STRATEGY)           */}
        {/* ==================================================================== */}
        <div className="xl:w-80 shrink-0 flex flex-col justify-between p-4 lg:p-5 rounded-xl bg-slate-50 dark:bg-[#07172B]/90 border border-slate-200 dark:border-cyan-500/30 shadow-xs dark:shadow-xl backdrop-blur-md">

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Total Communication
              </span>
              <span className="p-1 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Activity className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Selected Strategy Label */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedStrategyName}
              </span>
              {isBestTradeoff && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Best Balanced
                </span>
              )}
            </div>

            {/* Giant Metric Value */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {selectedTotalBytes.toLocaleString('en-US')} <span className="text-xs font-normal text-slate-500">B</span>
              </span>
              {reductionPercent > 0 ? (
                <div className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ArrowDown className="w-3 h-3 mr-0.5" />
                  <span>{reductionPercent.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Full Baseline
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#8295A8] font-medium mt-0.5">
              {reductionPercent > 0 ? `${reductionPercent.toFixed(1)}% application-payload reduction vs full baseline` : 'Reference full-federation baseline'}
            </p>
          </div>

          {/* Progress Comparison Bars */}
          <div className="space-y-3 mt-4 pt-3 border-t border-slate-200 dark:border-cyan-900/40">
            {/* Baseline Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Full Participation Baseline</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formattedBaseline}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full w-full" />
              </div>
            </div>

            {/* Active Selected Strategy Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{selectedStrategyName}</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formattedSelected}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(15, 100 - reductionPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Protocol Note */}
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-cyan-900/30 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Payload Accounting</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-semibold">Evidence on Demand</span>
          </div>

        </div>

      </div>

    </div>
  );
}
