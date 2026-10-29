import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MapPin,
  Clock,
  RefreshCw,
  Gauge,
  SlidersHorizontal,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Database
} from 'lucide-react';

export default function ForecastControlBar({
  selectedDataset = 'METR_LA',
  onDatasetChange,
  selectedRegion = 'ALL',
  onRegionChange,
  selectedSensor = '773869',
  onSensorChange,
  sensorOptions = [],
  selectedHorizon = 'ALL',
  onHorizonChange,
  selectedMetric = 'speed',
  onMetricChange,
  effectiveTimeIndex = 12,
  timestampStr = '',
  onStepForward,
  onStepBackward,
  onReevaluate,
  loading = false
}) {
  const [metricOpen, setMetricOpen] = useState(false);
  const metricRef = useRef(null);

  const displayTime = useMemo(() => {
    if (timestampStr && timestampStr.length >= 16) {
      return timestampStr.substring(11, 16);
    }
    const currentTimestampMs = new Date('2012-03-01T00:00:00Z').getTime() + effectiveTimeIndex * 5 * 60 * 1000;
    const d = new Date(currentTimestampMs);
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }, [timestampStr, effectiveTimeIndex]);

  // Close dropdown on outside click, Escape key, or browser navigation
  useEffect(() => {
    function handleClickOutside(event) {
      if (metricRef.current && !metricRef.current.contains(event.target)) {
        setMetricOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMetricOpen(false);
      }
    }
    function handlePopState() {
      setMetricOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const metrRegions = [
    { id: 'ALL', label: 'All Regions' },
    { id: 'REGION_A', label: 'Region A (North-East)' },
    { id: 'REGION_B', label: 'Region B (South-East)' },
    { id: 'REGION_C', label: 'Region C (Central-West)' },
    { id: 'REGION_D', label: 'Region D (North-West)' }
  ];

  const pemsCorridors = [
    { id: 'ALL', label: 'All Corridors' },
    { id: 'I-10 Corridor', label: 'I-10 Corridor' },
    { id: 'I-15 Corridor', label: 'I-15 Corridor' },
    { id: 'SR-60 Corridor', label: 'SR-60 Corridor' },
    { id: 'I-215 Interchange', label: 'I-215 Interchange' }
  ];

  const regions = selectedDataset === 'PEMS08' ? pemsCorridors : metrRegions;

  const horizons = [
    { id: 'ALL', label: 'All Horizons' },
    { id: '+5 min', label: '+5 min' },
    { id: '+15 min', label: '+15 min' },
    { id: '+30 min', label: '+30 min' },
    { id: '+60 min', label: '+60 min' }
  ];

  const metrMetrics = [
    { id: 'speed', label: 'Speed (mph)', description: 'Primary Traffic Velocity Forecast' },
    { id: 'delta', label: 'Speed Delta (mph)', description: 'Relative Speed Change vs Current' },
    { id: 'residual', label: 'Residual Error (mph)', description: 'Absolute Deviation (|Target - Prediction|)' }
  ];

  const pemsMetrics = [
    { id: 'flow', label: 'Traffic Flow (veh/5min)', description: 'Freeway Vehicle Volume Forecast' }
  ];

  const metrics = selectedDataset === 'PEMS08' ? pemsMetrics : metrMetrics;
  const currentMetricObj = metrics.find(m => m.id === selectedMetric) || metrics[0];

  return (
    <div className="relative z-30 rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-2.5 sm:p-3 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">

        {/* Main Controls: Dataset, Region, Sensor, Horizon, Metric */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">

          {/* Group 0: Dataset Selector */}
          <div className="h-9 flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 rounded-xl border border-slate-200 dark:border-[#17364E] text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
            <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-slate-500 dark:text-[#7F96AA] font-medium hidden sm:inline">Dataset:</span>
            <div className="relative flex items-center">
              <select
                value={selectedDataset}
                onChange={(e) => onDatasetChange?.(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-[#F7FAFF] font-bold focus:outline-hidden cursor-pointer appearance-none pr-4.5 py-1 text-xs"
              >
                <option value="METR_LA" className="dark:bg-[#081827]">METR-LA</option>
                <option value="PEMS08" className="dark:bg-[#081827]">PeMS08 Freeway Flow</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-0" />
            </div>
          </div>

          {/* Group 1: Region & Sensor */}
          <div className="flex items-center gap-2">
            {/* 1. Region Selector */}
            <div className="h-9 flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 rounded-xl border border-slate-200 dark:border-[#17364E] text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <Filter className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span className="text-slate-500 dark:text-[#7F96AA] font-medium hidden sm:inline">{selectedDataset === 'PEMS08' ? 'Corridor:' : 'Region:'}</span>
              <div className="relative flex items-center">
                <select
                  value={selectedRegion}
                  onChange={(e) => onRegionChange?.(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-[#F7FAFF] font-bold focus:outline-hidden cursor-pointer appearance-none pr-4.5 py-1 text-xs"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id} className="dark:bg-[#081827]">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-0" />
              </div>
            </div>

            {/* 2. Sensor Selector */}
            <div className="h-9 flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 rounded-xl border border-slate-200 dark:border-[#17364E] text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-slate-500 dark:text-[#7F96AA] font-medium hidden sm:inline">Sensor:</span>
              <div className="relative flex items-center">
                <select
                  value={selectedSensor}
                  onChange={(e) => onSensorChange?.(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-[#F7FAFF] font-bold focus:outline-hidden cursor-pointer font-mono appearance-none pr-4.5 py-1 text-xs max-w-[130px] sm:max-w-[180px] truncate"
                >
                  {sensorOptions.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-[#081827]">
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-0" />
              </div>
            </div>
          </div>

          {/* Group 2: Horizon & Metric */}
          <div className="flex items-center gap-2">
            {/* 3. Forecast Horizon Selector */}
            <div className="h-9 flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 rounded-xl border border-slate-200 dark:border-[#17364E] text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-slate-500 dark:text-[#7F96AA] font-medium hidden sm:inline">Horizon:</span>
              <div className="relative flex items-center">
                <select
                  value={selectedHorizon}
                  onChange={(e) => onHorizonChange?.(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-[#F7FAFF] font-bold focus:outline-hidden cursor-pointer appearance-none pr-4.5 py-1 text-xs"
                >
                  {horizons.map((h) => (
                    <option key={h.id} value={h.id} className="dark:bg-[#081827]">
                      {h.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-0" />
              </div>
            </div>

            {/* 4. Interactive Metric Selector Dropdown */}
            <div ref={metricRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMetricOpen(prev => !prev);
                }}
                className={`h-9 flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 rounded-xl border text-xs font-bold text-slate-900 dark:text-[#F7FAFF] transition-all cursor-pointer ${
                  metricOpen
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-[#17364E] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                aria-expanded={metricOpen}
                aria-haspopup="listbox"
                id="prediction-metric-selector-btn"
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-slate-500 dark:text-[#7F96AA] font-medium hidden sm:inline">Metric:</span>
                <span className="tabular-nums font-bold">{currentMetricObj.label}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${metricOpen ? 'rotate-180 text-cyan-500' : ''}`} />
              </button>

              {/* Floating Dropdown Menu (Guaranteed above cards via z-[60]) */}
              {metricOpen && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-68 z-[60] rounded-xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-2xl p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1"
                  role="listbox"
                  id="prediction-metric-menu"
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#647C92] border-b border-slate-100 dark:border-[#17364E]/60 mb-1">
                    Supported Forecast Metrics
                  </div>
                  {metrics.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        if (onMetricChange) onMetricChange(m.id);
                        setMetricOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col cursor-pointer ${
                        selectedMetric === m.id
                          ? 'bg-blue-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-blue-500/20'
                          : 'text-slate-700 dark:text-[#BCD0E2] hover:bg-slate-100 dark:hover:bg-[#0B2033]'
                      }`}
                      role="option"
                      aria-selected={selectedMetric === m.id}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{m.label}</span>
                        {selectedMetric === m.id && <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-[#7A8E9E] font-normal mt-0.5">
                        {m.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right: Group 3: Dataset Badge, Replay Step & Re-evaluate Action */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-[#17364E]/60">
          {/* Requirement 7: Clearly display which dataset is active */}
          <div className="h-9 hidden sm:flex items-center gap-1.5 px-2.5 rounded-xl border text-xs font-bold tabular-nums shrink-0 bg-slate-50 dark:bg-[#0B2033] border-slate-200 dark:border-[#17364E]" id="active-dataset-badge">
            {selectedDataset === 'PEMS08' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                PeMS08 • Flow Volume
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                METR-LA • Speed
              </span>
            )}
          </div>

          <div className="h-9 flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B2033] px-2.5 rounded-xl border border-slate-200 dark:border-[#17364E] text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className="text-slate-500 dark:text-[#7F96AA] font-medium hidden sm:inline">Replay:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-[#F7FAFF] px-0.5 whitespace-nowrap">
              {displayTime} <span className="text-[10px] text-slate-400 font-normal">(Step {effectiveTimeIndex})</span>
            </span>
            {onStepBackward && (
              <button
                onClick={onStepBackward}
                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#17364E]/50 rounded transition-colors cursor-pointer"
                title={`Previous Replay Step (-5m) • Step ${effectiveTimeIndex - 1}`}
                type="button"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            )}
            {onStepForward && (
              <button
                onClick={onStepForward}
                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#17364E]/50 rounded transition-colors cursor-pointer"
                title={`Next Replay Step (+5m) • Step ${effectiveTimeIndex + 1}`}
                type="button"
                aria-label="Next step"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={onReevaluate}
            disabled={loading}
            className="h-9 flex items-center gap-1.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            type="button"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-evaluate</span>
          </button>
        </div>

      </div>
    </div>
  );
}
