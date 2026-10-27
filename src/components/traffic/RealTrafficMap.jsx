import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ChevronDown, Crosshair, Check, Maximize2, Minimize2,
  Globe, Play, Pause, ChevronLeft, ChevronRight, RotateCcw,
  Layers, Activity, GitFork, AlertTriangle, X
} from 'lucide-react';
import { useReplay } from '../../context/ReplayContext';

// ============================================================================
// BASEMAP TILES CONFIGURATION (100% Watermark-Free, Production Grade)
// Simplified choices: Street (Default), Satellite, Dark (Hybrid removed)
// ============================================================================
const BASEMAP_TILES = {
  street: {
    id: 'street',
    name: 'Street',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom',
    maxZoom: 19
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 18
  }
};

// ============================================================================
// REAL REGION BOUNDARY POLYGONS, CENTROIDS & BOUNDING BOXES
// Calibrated from actual 207 METR-LA sensors GPS coordinates
// ============================================================================
const REAL_REGIONS = {
  REGION_A: {
    id: 'REGION_A',
    label: 'Region A',
    directionalName: 'North-East',
    sensorCount: 48,
    color: '#3b82f6', // Blue
    centroid: [34.162, -118.234],
    bounds: [[34.115, -118.295], [34.225, -118.175]],
    polygon: [
      [34.15407, -118.28711],
      [34.21846, -118.23931],
      [34.20672, -118.19992],
      [34.20584, -118.19803],
      [34.19638, -118.18442],
      [34.14163, -118.18290],
      [34.11966, -118.23143],
      [34.14224, -118.27812]
    ]
  },
  REGION_B: {
    id: 'REGION_B',
    label: 'Region B',
    directionalName: 'South-East',
    sensorCount: 57,
    color: '#f97316', // Orange
    centroid: [34.085, -118.255],
    bounds: [[34.040, -118.315], [34.135, -118.200]],
    polygon: [
      [34.09335, -118.20616],
      [34.04301, -118.21724],
      [34.08265, -118.29755],
      [34.08558, -118.30174],
      [34.08993, -118.30607],
      [34.09359, -118.30918],
      [34.09373, -118.30907],
      [34.12769, -118.27372],
      [34.11641, -118.23819]
    ]
  },
  REGION_C: {
    id: 'REGION_C',
    label: 'Region C',
    directionalName: 'Central-West',
    sensorCount: 58,
    color: '#a855f7', // Purple
    centroid: [34.143, -118.345],
    bounds: [[34.095, -118.410], [34.185, -118.290]],
    polygon: [
      [34.15655, -118.40441],
      [34.17886, -118.39497],
      [34.17115, -118.30539],
      [34.16588, -118.29809],
      [34.15544, -118.29344],
      [34.15522, -118.29344],
      [34.09710, -118.31366],
      [34.09699, -118.31381],
      [34.11027, -118.33441]
    ]
  },
  REGION_D: {
    id: 'REGION_D',
    label: 'Region D',
    directionalName: 'North-West',
    sensorCount: 44,
    color: '#10b981', // Green
    centroid: [34.172, -118.465],
    bounds: [[34.090, -118.545], [34.230, -118.400]],
    polygon: [
      [34.09478, -118.47605],
      [34.17339, -118.53680],
      [34.22164, -118.47307],
      [34.21979, -118.40931],
      [34.20164, -118.40366],
      [34.20000, -118.40337],
      [34.15664, -118.41326]
    ]
  }
};

// Full Network Bounding Box (Frames all 4 regions A, B, C, D seamlessly)
const FULL_NETWORK_BOUNDS = [
  [34.030, -118.555],
  [34.235, -118.170]
];

const DEFAULT_CENTER = [34.135, -118.320];
const DEFAULT_ZOOM = 11.8;

// Available Real Metric Overlay Modes
const METRIC_OPTIONS = [
  { id: 'speed', label: 'Traffic Speed' },
  { id: 'need_score', label: 'Need Score' },
  { id: 'uncertainty', label: 'Model Uncertainty' },
  { id: 'drift', label: 'Traffic Drift' },
  { id: 'quality', label: 'Data Quality' }
];

// Region Selector Options (Canonical Regions)
const REGION_ITEMS = [
  { id: 'ALL', label: 'All', count: '207', color: 'bg-slate-400' },
  { id: 'REGION_A', label: 'Region A', count: '48', color: 'bg-blue-500' },
  { id: 'REGION_B', label: 'Region B', count: '57', color: 'bg-orange-500' },
  { id: 'REGION_C', label: 'Region C', count: '58', color: 'bg-purple-500' },
  { id: 'REGION_D', label: 'Region D', count: '44', color: 'bg-emerald-500' }
];

// Basemap Options (Street [Default], Satellite, Dark - Hybrid removed)
const BASEMAP_OPTIONS = [
  { id: 'street', label: 'Street' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'dark', label: 'Dark' }
];

// Connection Edges Mode Options
const EDGE_OPTIONS = [
  { id: 'neighborhood', label: 'Selected Edges' },
  { id: 'all', label: 'All Edges' },
  { id: 'none', label: 'Edges Off' }
];

// Color computation based on active overlayMode
function getSensorColorByMode(sensor, overlayMode) {
  if (!sensor || sensor.maskedNull || sensor.speed === null || sensor.speed === undefined) {
    return '#94a3b8'; // Slate (Inactive / Masked)
  }

  const speed = Number(sensor.speed);

  if (overlayMode === 'need_score') {
    const ns = sensor.needScore !== undefined ? sensor.needScore : 0.42;
    if (ns > 0.75) return '#ef4444';
    if (ns > 0.50) return '#f59e0b';
    return '#10b981';
  }

  if (overlayMode === 'uncertainty') {
    const u = sensor.uncertainty !== undefined ? sensor.uncertainty : 2.14;
    if (u > 4.0) return '#ef4444';
    if (u > 2.8) return '#f59e0b';
    return '#10b981';
  }

  if (overlayMode === 'drift') {
    const d = sensor.trafficDrift !== undefined ? Math.abs(sensor.trafficDrift) : 0.18;
    if (d > 0.35) return '#ef4444';
    if (d > 0.20) return '#f59e0b';
    return '#10b981';
  }

  if (overlayMode === 'quality') {
    const q = sensor.dataQuality !== undefined ? sensor.dataQuality : 0.95;
    if (q >= 0.90) return '#10b981';
    if (q >= 0.75) return '#f59e0b';
    return '#ef4444';
  }

  // Default: 'speed' (Traffic Speed)
  if (speed < 35) return '#ef4444'; // Congestion (< 35 mph)
  if (speed < 50) return '#f59e0b'; // Moderate (35 - 50 mph)
  return '#10b981'; // Free Flow (>= 50 mph)
}

// ============================================================================
// CUSTOM LEAFLET DIV-ICONS FOR REAL SENSOR NODES (WITH MEMOIZATION CACHE)
// Multi-tier hierarchy: Red Selected Radar Beacon, Glowing Neighbor, Crisp Node
// ============================================================================
const sensorIconCache = new Map();

function createRealSensorIcon({
  sensorId,
  color,
  isSelected,
  isNeighbor
}) {
  const cacheKey = `${sensorId}_${color}_${isSelected ? 1 : 0}_${isNeighbor ? 1 : 0}`;
  const cached = sensorIconCache.get(cacheKey);
  if (cached) return cached;

  let icon;
  // 1. SELECTED SENSOR: Prominent RED tactical radar beacon with animated expanding ripple rings
  if (isSelected) {
    const html = `
      <div style="position: relative; display: flex; align-items: center; user-select: none;">
        <!-- Animated Expanding Red Radar Ripple Wave 1 -->
        <div class="red-radar-pulse-ring" style="position: absolute; top: -28px; left: -28px; width: 78px; height: 78px; border-radius: 9999px; border: 2px solid rgba(239, 68, 68, 0.75); background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 72%); pointer-events: none;"></div>

        <!-- Animated Expanding Red Radar Ripple Wave 2 (Phase Delayed) -->
        <div class="red-radar-pulse-ring-delayed" style="position: absolute; top: -28px; left: -28px; width: 78px; height: 78px; border-radius: 9999px; border: 1.5px solid rgba(239, 68, 68, 0.55); pointer-events: none;"></div>

        <!-- Intermediate Static Soft Red Glow Ring -->
        <div style="position: absolute; top: -14px; left: -14px; width: 50px; height: 50px; border-radius: 9999px; border: 2px solid rgba(239, 68, 68, 0.9); background: rgba(239, 68, 68, 0.18); pointer-events: none;"></div>

        <!-- Central Red Tactical Beacon -->
        <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background-color: #ef4444; border: 2.5px solid #ffffff; box-shadow: 0 0 18px rgba(239, 68, 68, 0.95); display: flex; align-items: center; justify-content: center; z-index: 10;">
          <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #ffffff;"></span>
        </div>

        <!-- High-Contrast Attached Sensor Label Pill with Red Border -->
        <div style="margin-left: 7px; padding: 2.5px 8.5px; border-radius: 6px; background-color: #071727; color: #ffffff; border: 2px solid #ef4444; font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; font-weight: 800; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.65); white-space: nowrap; pointer-events: none; line-height: 1.2; display: flex; align-items: center; gap: 4px; z-index: 10;">
          <span style="width: 5px; height: 5px; border-radius: 9999px; background-color: #ef4444;"></span>
          <span>${sensorId}</span>
        </div>
      </div>
    `;
    icon = L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [115, 36],
      iconAnchor: [11, 18]
    });
  } else if (isNeighbor) {
    // 2. CONNECTED NEIGHBOR SENSOR: Glowing ring with electric cyan accent and speed-coded core
    const html = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 9999px; background: radial-gradient(circle, #06b6d445 0%, transparent 72%); border: 1.5px solid #00D2FF; box-shadow: 0 0 10px rgba(0, 210, 255, 0.65); cursor: pointer;">
        <div style="width: 13px; height: 13px; border-radius: 9999px; background-color: ${color}; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.45);"></div>
      </div>
    `;
    icon = L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  } else {
    // 3. STANDARD SENSOR: Crisp 10px circular node with high-contrast white border and ambient speed aura
    const html = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 9999px; background: radial-gradient(circle, ${color}35 0%, transparent 70%); cursor: pointer;">
        <div style="width: 10px; height: 10px; border-radius: 9999px; background-color: ${color}; border: 1.5px solid #ffffff; box-shadow: 0 0 6px ${color}90; transition: transform 0.15s ease;"></div>
      </div>
    `;
    icon = L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  }

  sensorIconCache.set(cacheKey, icon);
  return icon;
}

// Region Floating Centroid Pill Label (with memoization)
const pillIconCache = new Map();

function createRegionFloatingPillIcon(region) {
  const cacheKey = `${region.id}_${region.color}`;
  const cached = pillIconCache.get(cacheKey);
  if (cached) return cached;

  const html = `
    <div style="padding: 4px 10px; border-radius: 9999px; background-color: rgba(7, 23, 39, 0.90); border: 1.5px solid ${region.color}; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55); color: #ffffff; font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 0.03em; user-select: none; pointer-events: none; display: flex; align-items: center; gap: 6px; white-space: nowrap; backdrop-filter: blur(4px);">
      <span style="width: 7px; height: 7px; border-radius: 9999px; background-color: ${region.color}; box-shadow: 0 0 6px ${region.color};"></span>
      <span>${region.label}</span>
    </div>
  `;
  const icon = L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [110, 26],
    iconAnchor: [55, 13]
  });
  pillIconCache.set(cacheKey, icon);
  return icon;
}

// ============================================================================
// VIEWPORT CONTROLLER (Handles smooth flyToBounds and flyTo transitions)
// ============================================================================
function ViewportController({ targetCenter, targetZoom, targetBounds, triggerCount, isFullscreen }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, isFullscreen]);

  useEffect(() => {
    if (triggerCount > 0) {
      if (targetBounds) {
        map.flyToBounds(targetBounds, {
          padding: [45, 45],
          duration: 0.75,
          easeLinearity: 0.25
        });
      } else if (targetCenter) {
        map.flyTo(targetCenter, targetZoom || 13.5, {
          duration: 0.75,
          easeLinearity: 0.25
        });
      }
    }
  }, [triggerCount, targetCenter, targetZoom, targetBounds, map]);

  return null;
}

// ============================================================================
// UNIFIED MAP HEADER TOOLBAR (Top Map Overlay)
// Consolidates Metric dropdown, Basemap pills, Edge mode, Overview & Zoom
// ============================================================================
function UnifiedMapControls({
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
      {/* ==================================================================== */}
      {/* 1. TOP-LEFT OVERLAYS: HISTORICAL REPLAY + REGION SELECTOR (Screenshots 1 & 5) */}
      {/* ==================================================================== */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2 pointer-events-none max-w-[calc(100%-110px)] sm:max-w-[calc(100%-240px)]">

        {/* Row 0: Data Source Selector (Historical Replay Default + External Stream) */}
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

        {/* Live Source Notice / Unavailable Warning */}
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

      {/* ==================================================================== */}
      {/* 2. TOP-RIGHT OVERLAYS: METRIC + EDGES + BASEMAP + REGION SELECTOR   */}
      {/* ==================================================================== */}
      <div className="absolute top-3 right-3 z-[500] flex flex-col items-end gap-2 pointer-events-none max-w-[calc(100%-110px)]">

        {/* Row 1: Metric + Edges + Basemap */}
        <div className="flex items-center gap-2 pointer-events-none">

          {/* Metric Overlay Selector */}
          <div className="pointer-events-auto relative hidden sm:block" ref={metricRef}>
            <button
              onClick={() => setMetricDropdownOpen(prev => !prev)}
              className="h-8 px-2.5 bg-white/95 dark:bg-[#071727]/95 hover:bg-slate-50 dark:hover:bg-[#0B2033] text-slate-800 dark:text-[#F5F8FC] rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Traffic Metric Overlay"
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
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span className="capitalize">{activeBasemapLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${basemapDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {basemapDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-2xl backdrop-blur-xl p-1 z-[60]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5">
                  Map Style
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

        {/* Row 2: Region Filter (Repositioned to the other side - Top Right) */}
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
                  aria-label={reg.id === 'ALL' ? 'All 207 Sensors' : `Filter to ${reg.label} (${reg.count} sensors)`}
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

      {/* ==================================================================== */}
      {/* 3. BOTTOM OVERLAYS: VIEWPORT CONTROLS + SPEED LEGEND (Screenshots 6 & 7) */}
      {/* ==================================================================== */}
      <div className="absolute bottom-3 left-3 right-3 z-[500] flex flex-col items-center gap-2 pointer-events-none">

        {/* Row 1: Viewport Navigation Toolbar */}
        <div className="w-full flex items-center justify-between pointer-events-none">

          {/* Left: Full Network & Focus Target (Screenshot 6 repositioned to Screenshot 7 area) */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-[#17364E] shadow-md select-none">
            <button
              onClick={onFullNetworkOverview}
              className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] transition-colors cursor-pointer"
              aria-label="Fit Full LA Freeway Network Overview"
              title="Fit Full LA Freeway Network Overview"
              type="button"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Full Network</span>
            </button>

            <button
              onClick={onRecenterSelected}
              className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] transition-colors cursor-pointer"
              aria-label={`Focus target sensor ${activeSelectedId || ''}`}
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

        {/* Row 2: Bottom Speed Legend Bar (Screenshot 7 clean integration) */}
        <div className="pointer-events-auto bg-white/95 dark:bg-[#071727]/95 backdrop-blur-md border border-slate-200 dark:border-[#17364E] rounded-xl px-3 sm:px-4 py-1.5 shadow-xl flex items-center justify-center gap-2.5 sm:gap-3.5 select-none text-xs max-w-full">
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] ring-2 ring-[#10b981]/30 inline-block" />
            <span className="text-slate-900 dark:text-[#F5F8FC] font-semibold flex items-center gap-1">
              Free Flow
              <span className="text-slate-500 dark:text-[#CBDDF0] font-normal text-[11px]">(&ge; 50 mph)</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] ring-2 ring-[#f59e0b]/30 inline-block" />
            <span className="text-slate-900 dark:text-[#F5F8FC] font-semibold flex items-center gap-1">
              Moderate
              <span className="text-slate-500 dark:text-[#CBDDF0] font-normal text-[11px]">(35 - 50 mph)</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] ring-2 ring-[#ef4444]/30 inline-block" />
            <span className="text-slate-900 dark:text-[#F5F8FC] font-semibold flex items-center gap-1">
              Congestion
              <span className="text-slate-500 dark:text-[#CBDDF0] font-normal text-[11px]">(&lt; 35 mph)</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] inline-block" />
            <span className="text-slate-600 dark:text-[#CBDDF0]">
              Unavailable
            </span>
          </div>

          {/* Selected Target Beacon (Red Radar Pulse Style) */}
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

      </div>
    </>
  );
}

// ============================================================================
// MAIN COMPONENT: RealTrafficMap
// ============================================================================
export default function RealTrafficMap({
  sensors = [],
  selectedSensor,
  onSelectSensor,
  activeRegion = "ALL",
  onRegionChange,
  showGraphEdges = true,
  graphEdges = [],
  neighborsMap = {},
  isFullscreen = false,
  onToggleFullscreen
}) {
  // Active Intelligence Metric Mode (Traffic Speed [Default], Need Score, Uncertainty, Drift, Quality)
  const [overlayMode, setOverlayMode] = useState('speed');

  // Basemap Selector: street (Default), satellite, dark (Hybrid removed)
  const [basemapId, setBasemapId] = useState(() => {
    try {
      const saved = localStorage.getItem('tp_basemap');
      if (saved && ['street', 'satellite', 'dark'].includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage read errors
    }
    return 'street';
  });

  const handleBasemapChange = useCallback((id) => {
    const valid = ['street', 'satellite', 'dark'].includes(id) ? id : 'street';
    setBasemapId(valid);
    try {
      localStorage.setItem('tp_basemap', valid);
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  // Connection Edges Mode ('neighborhood' [Default] | 'all' | 'none')
  const [edgeMode, setEdgeMode] = useState('neighborhood');

  // Region Boundaries
  const showRegionBoundaries = true;

  // Selected sensor ID & neighbor set
  const activeSelectedId = String(selectedSensor?.sensorId || selectedSensor?.id || "767620");

  const neighborIdSet = useMemo(() => {
    const list = neighborsMap[activeSelectedId] || selectedSensor?.graphNeighbors || [];
    return new Set(list.map(String));
  }, [neighborsMap, activeSelectedId, selectedSensor]);

  // Viewport Navigation Target (Center, Zoom, or Bounding Box)
  const [navTarget, setNavTarget] = useState({
    center: null,
    zoom: null,
    bounds: FULL_NETWORK_BOUNDS
  });
  const [navTrigger, setNavTrigger] = useState(0);

  // Full Network Overview Fit
  const handleFullNetworkOverview = useCallback(() => {
    setNavTarget({ bounds: FULL_NETWORK_BOUNDS, center: null, zoom: null });
    setNavTrigger(c => c + 1);
    if (onRegionChange) {
      onRegionChange('ALL');
    }
  }, [onRegionChange]);

  // Recenter on Target Sensor
  const handleRecenterSelected = useCallback(() => {
    if (selectedSensor && typeof selectedSensor.latitude === 'number' && typeof selectedSensor.longitude === 'number') {
      setNavTarget({
        center: [selectedSensor.latitude, selectedSensor.longitude],
        zoom: 13.5,
        bounds: null
      });
      setNavTrigger(c => c + 1);
    } else {
      handleFullNetworkOverview();
    }
  }, [selectedSensor, handleFullNetworkOverview]);

  // Fly to selected sensor when it changes
  useEffect(() => {
    if (selectedSensor && typeof selectedSensor.latitude === 'number' && typeof selectedSensor.longitude === 'number') {
      setNavTarget({
        center: [selectedSensor.latitude, selectedSensor.longitude],
        zoom: 13.5,
        bounds: null
      });
      setNavTrigger(c => c + 1);
    }
  }, [selectedSensor]);

  // Smooth auto-zoom when activeRegion changes from header
  useEffect(() => {
    if (activeRegion === 'ALL') {
      setNavTarget({ bounds: FULL_NETWORK_BOUNDS, center: null, zoom: null });
    } else {
      const reg = REAL_REGIONS[activeRegion];
      if (reg && reg.bounds) {
        setNavTarget({ bounds: reg.bounds, center: null, zoom: null });
      } else if (reg) {
        setNavTarget({ center: reg.centroid, zoom: 12.8, bounds: null });
      }
    }
    setNavTrigger(c => c + 1);
  }, [activeRegion]);

  // Filter real sensors based on activeRegion tab
  const visibleSensors = useMemo(() => {
    if (!sensors || sensors.length === 0) return [];
    const valid = sensors.filter(s =>
      typeof s?.latitude === 'number' && !isNaN(s.latitude) &&
      typeof s?.longitude === 'number' && !isNaN(s.longitude)
    );
    if (activeRegion === 'ALL') return valid;
    return valid.filter(s => s.regionId === activeRegion);
  }, [sensors, activeRegion]);

  // Control edge connection visibility:
  // Lines are kept strictly hidden on initial page load and during sector/sensor switching.
  // Lines connect smoothly only AFTER the map camera flight has fully settled.
  const [linesReady, setLinesReady] = useState(false);
  const [prevRegion, setPrevRegion] = useState(activeRegion);
  const [prevSensorId, setPrevSensorId] = useState(activeSelectedId);

  // Synchronously hide lines during render when sector or selected sensor changes
  if (activeRegion !== prevRegion) {
    setPrevRegion(activeRegion);
    setLinesReady(false);
  }
  if (activeSelectedId !== prevSensorId) {
    setPrevSensorId(activeSelectedId);
    setLinesReady(false);
  }

  // Once the map view and sensors have settled, connect the lines
  useEffect(() => {
    if (!sensors || sensors.length === 0 || !selectedSensor) {
      setLinesReady(false);
      return;
    }

    if (!linesReady) {
      const timer = setTimeout(() => {
        setLinesReady(true);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [linesReady, sensors, selectedSensor, activeRegion, activeSelectedId]);

  // Compute graph edges to render with multi-tier hierarchy & layering
  const edgesToRender = useMemo(() => {
    if (!linesReady || !showGraphEdges || edgeMode === 'none' || !graphEdges || graphEdges.length === 0) {
      return [];
    }

    const visibleSensorIdSet = new Set(visibleSensors.map(s => String(s.sensorId || s.id)));

    let candidateEdges = [];
    if (edgeMode === 'neighborhood') {
      // DEFAULT: only highlight direct neighbors of the selected sensor
      candidateEdges = graphEdges.filter(e =>
        String(e.fromSensorId) === activeSelectedId ||
        String(e.toSensorId) === activeSelectedId
      );
    } else {
      // ALL EDGES mode: take up to 250 connections
      candidateEdges = graphEdges.slice(0, 250);
    }

    // When a specific region/sector is active, only draw edges between visible sensors in that sector
    if (activeRegion !== 'ALL') {
      candidateEdges = candidateEdges.filter(e =>
        visibleSensorIdSet.has(String(e.fromSensorId)) &&
        visibleSensorIdSet.has(String(e.toSensorId))
      );
    }

    const styled = candidateEdges.map(edge => {
      const isDirectSelected =
        String(edge.fromSensorId) === activeSelectedId ||
        String(edge.toSensorId) === activeSelectedId;

      const isNeighborLink =
        !isDirectSelected && (
          neighborIdSet.has(String(edge.fromSensorId)) &&
          neighborIdSet.has(String(edge.toSensorId))
        );

      let tier = 0;
      let color = '#64748b'; // Muted slate for general background edges
      let weight = 1.2;
      let opacity = 0.22;
      let glow = false;
      let glowColor = '';

      if (isDirectSelected) {
        tier = 2;
        color = '#ef4444'; // Red accent styling dominant
        weight = 3.2;
        opacity = 0.95;
        glow = true;
        glowColor = '#ef4444';
      } else if (isNeighborLink) {
        tier = 1;
        color = '#00D2FF'; // Electric cyan
        weight = 2.0;
        opacity = 0.70;
        glow = true;
        glowColor = '#00D2FF';
      }

      return {
        ...edge,
        tier,
        color,
        weight,
        opacity,
        glow,
        glowColor,
        isDirectSelected
      };
    });

    // Sort by tier ascending so direct selected links are rendered on top
    return styled.sort((a, b) => a.tier - b.tier);
  }, [linesReady, showGraphEdges, edgeMode, graphEdges, activeSelectedId, neighborIdSet, visibleSensors, activeRegion]);

  const activeTileConfig = BASEMAP_TILES[basemapId] || BASEMAP_TILES.street;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#17364E] bg-slate-100 dark:bg-[#050b14] shadow-xl flex flex-col select-none transition-all ${
      isFullscreen ? 'h-full flex-1 min-h-0' : 'h-[640px] min-h-[580px]'
    }`}>

      {/* ==================================================================== */}
      {/* LEAFLET MAP CONTAINER                                                */}
      {/* ==================================================================== */}
      <div className="relative w-full h-full z-0 flex-1 min-h-[580px]">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={9}
          maxZoom={18}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '580px' }}
          className="w-full h-full"
        >
          {/* Active Basemap TileLayer */}
          <TileLayer
            key={activeTileConfig.id}
            url={activeTileConfig.url}
            attribution={activeTileConfig.attribution}
            maxZoom={activeTileConfig.maxZoom}
          />

          {/* Unified Map Controls (Overlays for Replay, Regions, Map Style & Viewport) */}
          <UnifiedMapControls
            overlayMode={overlayMode}
            setOverlayMode={setOverlayMode}
            basemapId={basemapId}
            setBasemapId={handleBasemapChange}
            edgeMode={edgeMode}
            setEdgeMode={setEdgeMode}
            activeSelectedId={activeSelectedId}
            onFullNetworkOverview={handleFullNetworkOverview}
            onRecenterSelected={handleRecenterSelected}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            activeRegion={activeRegion}
            onRegionChange={onRegionChange}
          />

          {/* Animated Viewport Controller */}
          <ViewportController
            targetCenter={navTarget.center}
            targetZoom={navTarget.zoom}
            targetBounds={navTarget.bounds}
            triggerCount={navTrigger}
            isFullscreen={isFullscreen}
          />

          {/* 1. Real Regional Boundary Polygons (Convex hulls of actual sensor GPS positions) */}
          {showRegionBoundaries && Object.values(REAL_REGIONS).map(region => {
            const isRegActive = activeRegion === 'ALL' || activeRegion === region.id;
            return (
              <Polygon
                key={`poly-${region.id}`}
                positions={region.polygon}
                pathOptions={{
                  color: region.color,
                  weight: isRegActive ? 2 : 1,
                  dashArray: isRegActive ? '4, 6' : '2, 6',
                  fillColor: region.color,
                  fillOpacity: isRegActive ? 0.06 : 0.02
                }}
              />
            );
          })}

          {/* 2. Floating Region Pill Labels near Centroids */}
          {showRegionBoundaries && Object.values(REAL_REGIONS).map(region => {
            if (activeRegion !== 'ALL' && activeRegion !== region.id) return null;
            return (
              <Marker
                key={`centroid-${region.id}`}
                position={region.centroid}
                icon={createRegionFloatingPillIcon(region)}
                interactive={false}
              />
            );
          })}

          {/* 3. Multi-tier Layered Connection Graph Edges */}
          {edgesToRender.map((edge, idx) => {
            return (
              <React.Fragment key={`real-edge-${idx}-${activeSelectedId}-${activeRegion}`}>
                {/* Glowing Outer Tube for selected local & neighbor edges */}
                {edge.glow && (
                  <Polyline
                    positions={[[edge.fromLat, edge.fromLon], [edge.toLat, edge.toLon]]}
                    pathOptions={{
                      color: edge.glowColor,
                      weight: edge.isDirectSelected ? 5 : 3.5,
                      opacity: edge.isDirectSelected ? 0.35 : 0.25,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />
                )}
                {/* Core Line */}
                <Polyline
                  positions={[[edge.fromLat, edge.fromLon], [edge.toLat, edge.toLon]]}
                  pathOptions={{
                    color: edge.color,
                    weight: edge.isDirectSelected ? 2.2 : edge.weight,
                    opacity: edge.opacity,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* 4. Real 207 Sensors at Exact GPS Coordinates */}
          {visibleSensors.map(sensor => {
            const sid = String(sensor.sensorId || sensor.id);
            const isSelected = activeSelectedId === sid;
            const isNeighbor = neighborIdSet.has(sid);
            const color = getSensorColorByMode(sensor, overlayMode);
            const speedDisplay = sensor.speed !== null && sensor.speed !== undefined && !sensor.maskedNull
              ? `${Number(sensor.speed).toFixed(1)} mph`
              : 'Masked Null';

            const icon = createRealSensorIcon({
              sensorId: sid,
              color,
              isSelected,
              isNeighbor
            });

            return (
              <Marker
                key={`sensor-${sid}`}
                position={[sensor.latitude, sensor.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectSensor && onSelectSensor(sensor)
                }}
              >
                {/* Instant Hover Tooltip for Zero-Clutter Readability */}
                <Tooltip direction="top" offset={[0, -8]} opacity={0.96}>
                  <div className="font-sans text-xs font-semibold py-0.5">
                    <span className="text-red-600 dark:text-red-400 font-bold">{sid}</span>
                    {isNeighbor && (
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold ml-1">• Neighbor</span>
                    )}
                    <span className="mx-1.5 text-slate-400 dark:text-slate-500">•</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{speedDisplay}</span>
                    <span className="mx-1.5 text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-blue-600 dark:text-blue-300">{sensor.regionId}</span>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
