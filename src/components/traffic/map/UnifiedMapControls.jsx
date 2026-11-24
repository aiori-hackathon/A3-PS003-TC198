// Unified Map Controls Toolbar (Overlays for Leaflet Map)
import React, { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import {
  ChevronDown, Crosshair, Check, Maximize2, Minimize2,
  Globe, Play, Pause, ChevronLeft, ChevronRight, RotateCcw,
  Activity, GitFork, AlertTriangle, X
} from 'lucide-react';
import { useReplay } from '../../../context/ReplayContext';
import {
  METRIC_OPTIONS,
  EDGE_OPTIONS,
  BASEMAP_OPTIONS,
  REGION_ITEMS
} from './mapConfig';
import MapLegend from './MapLegend';

export default function UnifiedMapControls({
  overlayMode,
  setOverlayMode,
  basemapId,
  setBasemapId,
  edgeMode,
  setEdgeMode,
  activeSelectedId,
  onFullNetworkOverview,
  onRecenterSelected,
  isFullscreen,
  onToggleFullscreen,
  activeRegion = 'ALL',
  onRegionChange
}) {
  const map = useMap();
  const {
    timestampStr,
    isPlaying,
    replaySpeed,
    setReplaySpeed,
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStep,
    dataSourceMode,
    switchDataSource,
    streamingStatus,
    liveSourceNotice,
    clearLiveNotice
  } = useReplay();

  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [edgeDropdownOpen, setEdgeDropdownOpen] = useState(false);
  const [basemapDropdownOpen, setBasemapDropdownOpen] = useState(false);
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);

  const metricRef = useRef(null);
  const edgeRef = useRef(null);
  const basemapRef = useRef(null);
  const speedRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (metricRef.current && !metricRef.current.contains(event.target)) {
        setMetricDropdownOpen(false);
      }
      if (edgeRef.current && !edgeRef.current.contains(event.target)) {
        setEdgeDropdownOpen(false);
      }
      if (basemapRef.current && !basemapRef.current.contains(event.target)) {
        setBasemapDropdownOpen(false);
      }
      if (speedRef.current && !speedRef.current.contains(event.target)) {
        setSpeedDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMetricDropdownOpen(false);
        setEdgeDropdownOpen(false);
        setBasemapDropdownOpen(false);
        setSpeedDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeMetricLabel = METRIC_OPTIONS.find(o => o.id === overlayMode)?.label || 'Traffic Speed';
  const activeBasemapLabel = BASEMAP_OPTIONS.find(b => b.id === basemapId)?.label || 'Street';
  const activeEdgeLabel = EDGE_OPTIONS.find(e => e.id === edgeMode)?.label || 'Selected Edges';

  return (
    <>
      {/* 1. TOP-LEFT OVERLAYS: HISTORICAL REPLAY + DATA SOURCE SELECTOR */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2 pointer-events-none max-w-[calc(100%-110px)] sm:max-w-[calc(100%-240px)]">

        {/* Row 0: Data Source Selector */}
        <div className="pointer-events-auto self-start relative z-30">
          <div className="flex items-center h-8 bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md px-2 rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md text-xs font-semibold select-none gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-[#8295A8] uppercase tracking-wider">
              Data Source:
            </span>
            <button
              type="button"
              onClick={() => switchDataSource && switchDataSource('historical')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                dataSourceMode === 'historical'
                  ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-600 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Historical Replay
            </button>
            <button
              type="button"
              onClick={() => switchDataSource && switchDataSource('external_live')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                dataSourceMode === 'external_live'
                  ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold'
                  : 'text-slate-600 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white'
              }`}
              title={
                streamingStatus?.providers?.external_live?.configured
                  ? "Live Data Adapter (External Streaming Experiment)"
                  : "External Stream: Unavailable / Not Configured"
              }
            >
              <span>External Stream</span>
              {!streamingStatus?.providers?.external_live?.configured && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono">
                  Unavailable / Not Configured
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live Source Notice / Warning */}
        {liveSourceNotice && (
          <div className="pointer-events-auto self-start max-w-md p-2.5 rounded-xl bg-amber-50 dark:bg-[#1a1c23] border border-amber-300 dark:border-amber-600/40 text-amber-900 dark:text-amber-200 text-xs shadow-lg backdrop-blur-md flex items-start justify-between gap-2 z-40">
            <div className="space-y-0.5">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Live Source Notice</span>
              </div>
              <p className="text-[11px] leading-tight text-amber-800 dark:text-amber-300">
                {liveSourceNotice}
              </p>
            </div>
            <button
              type="button"
              onClick={clearLiveNotice}
              className="p-1 hover:bg-amber-500/20 rounded-md text-amber-700 dark:text-amber-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Row 1: Historical Replay Control Bar */}
        <div className="pointer-events-auto self-start relative z-20">
          <div className="relative flex items-center h-8 bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md px-1.5 rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md text-xs font-semibold select-none gap-1">

            {/* Step & Time Display */}
            <div className="flex items-center gap-1.5 px-1.5 font-mono text-xs text-slate-800 dark:text-[#F5F8FC]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shrink-0" />
              <span className="font-bold text-cyan-600 dark:text-cyan-400">REPLAY</span>
              <span className="text-slate-400 dark:text-[#8295A8] font-normal hidden sm:inline">•</span>
              <span className="text-slate-700 dark:text-[#BACCDA] font-bold hidden sm:inline">
                {timestampStr ? timestampStr.substring(11, 16) : '00:00'}
              </span>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#17364E] mx-0.5" />

            {/* Previous Interval */}
            <button
              onClick={stepBackward}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] rounded-md transition-colors cursor-pointer"
              title="Previous Interval (-5m)"
              type="button"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={togglePlay}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                  : 'text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10'
              }`}
              title="Play / Pause"
              type="button"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            {/* Next Interval */}
            <button
              onClick={stepForward}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] rounded-md transition-colors cursor-pointer"
              title="Next Interval (+5m)"
              type="button"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#17364E] mx-0.5" />

            {/* Playback Speed Selector (0.5x / 1x / 2x) */}
            <div className="relative" ref={speedRef}>
              <button
                onClick={() => setSpeedDropdownOpen(prev => !prev)}
                className={`h-6 px-1.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-0.5 transition-colors cursor-pointer ${
                  speedDropdownOpen
                    ? 'bg-slate-200 dark:bg-[#0E2438] text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-[#BACCDA] hover:bg-slate-100 dark:hover:bg-[#0E2438]'
                }`}
                title="Playback Speed"
                type="button"
              >
                <span>{replaySpeed}x</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${speedDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {speedDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-28 bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-2xl backdrop-blur-xl p-1 z-[70]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5">
                    Speed
                  </div>
                  {[
                    { val: 0.5, label: '0.5x' },
                    { val: 1, label: '1x (Normal)' },
                    { val: 2, label: '2x (Fast)' }
                  ].map(spd => (
                    <button
                      key={spd.val}
                      onClick={() => {
                        setReplaySpeed(spd.val);
                        setSpeedDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        replaySpeed === spd.val
                          ? 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0E2438]'
                      }`}
                      type="button"
                    >
                      <span>{spd.label}</span>
                      {replaySpeed === spd.val && <Check className="w-3 h-3 text-cyan-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#17364E] mx-0.5" />

            {/* Reset Replay */}
            <button
              onClick={() => jumpToStep(0)}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0E2438] rounded-md transition-colors cursor-pointer"
              title="Reset Replay"
              type="button"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* 2. TOP-RIGHT OVERLAYS: METRIC + EDGES + BASEMAP + REGION SELECTOR */}
      <div className="absolute top-3 right-3 z-[500] flex flex-col items-end gap-2 pointer-events-none max-w-[calc(100%-110px)]">

        {/* Row 1: Metric + Edges + Basemap */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">

          {/* Metric Selector */}
          <div className="pointer-events-auto relative" ref={metricRef}>
            <button
              onClick={() => setMetricDropdownOpen(prev => !prev)}
              className="h-8 px-2.5 bg-white/95 dark:bg-[#071727]/95 hover:bg-slate-50 dark:hover:bg-[#0B2033] text-slate-800 dark:text-[#F5F8FC] rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Overlay Metric Mode"
              type="button"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">{activeMetricLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${metricDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {metricDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-2xl backdrop-blur-xl p-1 z-[60]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5">
                  Metric Mode
                </div>
                {METRIC_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setOverlayMode(opt.id);
                      setMetricDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      overlayMode === opt.id
                        ? 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0E2438]'
                    }`}
                    type="button"
                  >
                    <span>{opt.label}</span>
                    {overlayMode === opt.id && <Check className="w-3 h-3 text-cyan-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edge Visibility Mode */}
          <div className="pointer-events-auto relative hidden sm:block" ref={edgeRef}>
            <button
              onClick={() => setEdgeDropdownOpen(prev => !prev)}
              className="h-8 px-2.5 bg-white/95 dark:bg-[#071727]/95 hover:bg-slate-50 dark:hover:bg-[#0B2033] text-slate-800 dark:text-[#F5F8FC] rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Graph Connection Edges"
              type="button"
            >
              <GitFork className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline">{activeEdgeLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${edgeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {edgeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-2xl backdrop-blur-xl p-1 z-[60]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5">
                  Connection Edges
                </div>
                {EDGE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setEdgeMode(opt.id);
                      setEdgeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      edgeMode === opt.id
                        ? 'bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0E2438]'
                    }`}
                    type="button"
                  >
                    <span>{opt.label}</span>
                    {edgeMode === opt.id && <Check className="w-3 h-3 text-cyan-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Basemap Style Selector */}
          <div className="pointer-events-auto relative" ref={basemapRef}>
            <button
              onClick={() => setBasemapDropdownOpen(prev => !prev)}
              className="h-8 px-2.5 bg-white/95 dark:bg-[#071727]/95 hover:bg-slate-50 dark:hover:bg-[#0B2033] text-slate-800 dark:text-[#F5F8FC] rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Map Style"
              type="button"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span className="hidden sm:inline">{activeBasemapLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${basemapDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {basemapDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-2xl backdrop-blur-xl p-1 z-[60]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5">
                  Base Map
                </div>
                {BASEMAP_OPTIONS.map(bm => (
                  <button
                    key={bm.id}
                    onClick={() => {
                      setBasemapId(bm.id);
                      setBasemapDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      basemapId === bm.id
                        ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0E2438]'
                    }`}
                    type="button"
                  >
                    <span>{bm.label}</span>
                    {basemapId === bm.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Row 2: Region Filter */}
        <div className="pointer-events-auto self-end relative z-10">
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md border border-slate-200 dark:border-[#17364E] shadow-md select-none overflow-x-auto no-scrollbar max-w-full">
            {REGION_ITEMS.map(reg => {
              const isCur = activeRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  onClick={() => onRegionChange && onRegionChange(reg.id)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isCur
                      ? 'bg-slate-100 dark:bg-[#0E2438] text-slate-900 dark:text-white shadow-xs border border-slate-300/80 dark:border-[#1D4566] font-bold'
                      : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#0E2438]/60 border border-transparent'
                  }`}
                  type="button"
                  title={reg.id === 'ALL' ? 'All 207 Sensors' : `Filter to ${reg.label} (${reg.count} sensors)`}
                >
                  <span className={`w-2 h-2 rounded-full ${reg.color} shrink-0 ring-1 ring-black/10 dark:ring-white/10`} />
                  <span>{reg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. BOTTOM OVERLAYS: VIEWPORT CONTROLS + SPEED LEGEND */}
      <div className="absolute bottom-3 left-3 right-3 z-[500] flex flex-col items-center gap-2 pointer-events-none">

        {/* Viewport Navigation Toolbar */}
        <div className="w-full flex items-center justify-between pointer-events-none">

          {/* Left: Full Network & Focus Target */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md select-none">
            <button
              onClick={onFullNetworkOverview}
              className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] transition-colors cursor-pointer"
              title="Fit Full LA Freeway Network Overview"
              type="button"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Full Network</span>
            </button>

            <button
              onClick={onRecenterSelected}
              className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] transition-colors cursor-pointer"
              title={`Focus Target Sensor ${activeSelectedId || ''}`}
              type="button"
            >
              <Crosshair className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Focus Target</span>
            </button>
          </div>

          {/* Right: Zoom In, Zoom Out, Fullscreen */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md select-none">
            <button
              onClick={() => map.zoomIn()}
              className="w-7 h-7 flex items-center justify-center text-slate-800 dark:text-[#F5F8FC] hover:bg-slate-100 dark:hover:bg-[#0E2438] rounded-md font-bold text-sm transition-colors cursor-pointer"
              title="Zoom In"
              type="button"
            >
              +
            </button>

            <button
              onClick={() => map.zoomOut()}
              className="w-7 h-7 flex items-center justify-center text-slate-800 dark:text-[#F5F8FC] hover:bg-slate-100 dark:hover:bg-[#0E2438] rounded-md font-bold text-sm transition-colors cursor-pointer"
              title="Zoom Out"
              type="button"
            >
              −
            </button>

            {onToggleFullscreen && (
              <>
                <div className="w-px h-4 bg-slate-200 dark:bg-[#17364E] mx-0.5" />
                <button
                  onClick={onToggleFullscreen}
                  className="w-7 h-7 flex items-center justify-center text-slate-700 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] rounded-md transition-colors cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                  type="button"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Speed Legend */}
        <MapLegend />

      </div>
    </>
  );
}
