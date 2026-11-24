// Speed Threshold & Target Legend for Leaflet Map
import React from 'react';

export default function MapLegend() {
  return (
    <div className="pointer-events-auto bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md border border-slate-200 dark:border-[#17364E] rounded-xl px-3 sm:px-4 py-1.5 shadow-xl flex items-center justify-center gap-2.5 sm:gap-3.5 select-none text-xs max-w-full">
      {/* Free Flow (Green) */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] ring-2 ring-[#10b981]/30 inline-block" />
        <span className="text-slate-900 dark:text-[#F5F8FC] font-semibold flex items-center gap-1">
          Free Flow
          <span className="text-slate-500 dark:text-[#CBDDF0] font-normal text-[11px]">(&ge; 50 mph)</span>
        </span>
      </div>

      {/* Moderate (Amber) */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] ring-2 ring-[#f59e0b]/30 inline-block" />
        <span className="text-slate-900 dark:text-[#F5F8FC] font-semibold flex items-center gap-1">
          Moderate
          <span className="text-slate-500 dark:text-[#CBDDF0] font-normal text-[11px]">(35 - 50 mph)</span>
        </span>
      </div>

      {/* Congestion (Red) */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] ring-2 ring-[#ef4444]/30 inline-block" />
        <span className="text-slate-900 dark:text-[#F5F8FC] font-semibold flex items-center gap-1">
          Congestion
          <span className="text-slate-500 dark:text-[#CBDDF0] font-normal text-[11px]">(&lt; 35 mph)</span>
        </span>
      </div>

      {/* Unavailable (Gray) */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] inline-block" />
        <span className="text-slate-600 dark:text-[#CBDDF0]">
          Unavailable
        </span>
      </div>

      {/* Selected Target Pulse Beacon */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap border-l border-slate-200 dark:border-[#17364E] pl-2.5 sm:pl-3">
        <div className="relative flex items-center justify-center w-4 h-4">
          <span className="absolute w-4 h-4 rounded-full border border-red-500 opacity-80 animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        </div>
        <span className="text-red-600 dark:text-red-400 font-bold whitespace-nowrap">
          Selected Target
        </span>
      </div>
    </div>
  );
}
