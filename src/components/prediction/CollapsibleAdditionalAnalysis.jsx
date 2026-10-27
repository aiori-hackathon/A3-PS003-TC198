import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import MultiSensorForecastComparison from './MultiSensorForecastComparison';

export default function CollapsibleAdditionalAnalysis({
  selectedSensorId = '773869',
  onSelectSensor
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-2xl overflow-hidden shadow-sm transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#0B2033]/60 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-[#F7FAFF] uppercase tracking-wider">
            Additional Analysis
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Multi-Sensor Corridor Forecast Comparison
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-200 dark:border-[#17364E] bg-slate-50/50 dark:bg-[#04101A]">
          <MultiSensorForecastComparison
            selectedSensorId={selectedSensorId}
            onSelectSensor={onSelectSensor}
          />
        </div>
      )}
    </div>
  );
}
