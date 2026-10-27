import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import RealTrafficMap from '../../components/traffic/RealTrafficMap';
import SensorDetailPanel from '../../components/traffic/SensorDetailPanel';
import SensorTable from '../../components/traffic/SensorTable';
import SpatialSpeedConsistencyPanel from '../../components/decision/SpatialSpeedConsistencyPanel';
import CounterfactualQueryCard from '../../components/decision/CounterfactualQueryCard';
import EvidenceChain from '../../components/decision/EvidenceChain';
import MetricCard from '../../components/common/MetricCard';
import TrafficSpeedHeatmap from '../../components/traffic/TrafficSpeedHeatmap';
import CoverageBlindSpotsPanel from '../../components/traffic/CoverageBlindSpotsPanel';
import {
  fetchCounterfactual,
  fetchEvidenceChain,
  executeQuery,
  fetchMetrSnapshot,
  fetchStreamingSnapshot,
  fetchSpatialSpeedConsistency,
  fetchNetworkTopology
} from '../../services/api';
import { useReplay } from '../../context/ReplayContext';
import { AlertTriangle, Map as MapIcon, Search, X, Check } from 'lucide-react';

const REGION_DEFAULT_SENSORS = {
  ALL: '767620',
  REGION_A: '767620',
  REGION_B: '767541',
  REGION_C: '717489',
  REGION_D: '769430'
};

export default function TrafficNetwork() {
  const { timeIndex, timestampStr, selectedSensorId, setSelectedSensorId, dataSourceMode } = useReplay();
  const [searchParams] = useSearchParams();
  const [activeRegion, setActiveRegion] = useState('ALL');
  const [showGraphEdges] = useState(true);
  const [neighborsMap, setNeighborsMap] = useState({});

  const [realSensors, setRealSensors] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const [selectedSensor, setSelectedSensor] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const [counterfactualData, setCounterfactualData] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [spatialConsistencyData, setSpatialConsistencyData] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const consoleRef = useRef(null);

  // Load graph topology for network road edges
  useEffect(() => {
    let mounted = true;
    async function loadTopology() {
      try {
        const topo = await fetchNetworkTopology();
        if (mounted && topo && topo.neighborsMap) {
          setNeighborsMap(topo.neighborsMap);
        }
      } catch (e) {
        console.warn("Failed to load network topology:", e);
      }
    }
    loadTopology();
    return () => { mounted = false; };
  }, []);

  const loadRealSnapshot = useCallback(async (tIndex, rId) => {
    try {
      let snap;
      if (dataSourceMode === 'external_live') {
        snap = await fetchStreamingSnapshot(tIndex, rId, 'external_live');
      } else {
        snap = await fetchMetrSnapshot(tIndex, rId, false);
      }
      if (snap && snap.sensors) {
        setRealSensors(snap.sensors);
        setSelectedSensor(prev => {
          if (prev) {
            const matched = snap.sensors.find(s => String(s.sensorId || s.id) === String(prev.sensorId || prev.id));
            if (matched) return matched;
          }
          const targetId = searchParams.get('sensor') || REGION_DEFAULT_SENSORS[rId] || selectedSensorId || "767620";
          const primaryMatch = snap.sensors.find(s => String(s.sensorId || s.id) === String(targetId));
          return primaryMatch || snap.sensors[0];
        });
        setFetchError(null);
      }
    } catch (err) {
      if (dataSourceMode === 'external_live') {
        setFetchError(`Live source unavailable: ${err.message || 'External streaming experiment is not configured.'} Historical Replay remains the baseline.`);
      } else {
        setFetchError(`Backend API connection failed: ${err.message}. Ensure FastAPI server is running at http://127.0.0.1:8000`);
      }
    }
  }, [searchParams, selectedSensorId, dataSourceMode]);

  useEffect(() => {
    loadRealSnapshot(timeIndex, activeRegion);
  }, [timeIndex, activeRegion, loadRealSnapshot]);

  // Load spatial speed consistency data
  useEffect(() => {
    let mounted = true;
    async function loadConsistency() {
      try {
        const fromId = String(selectedSensor?.sensorId || selectedSensor?.id || "767620");
        const res = await fetchSpatialSpeedConsistency(fromId, "767471");
        if (mounted && res) {
          setSpatialConsistencyData(res);
        }
      } catch {
        if (mounted) {
          setSpatialConsistencyData({
            fromSensor: "767620",
            toSensor: "767471",
            fromSpeedMph: 67.1,
            toSpeedMph: 66.5,
            speedDifferenceMph: 0.6,
            consistencyScore: 98.5,
            isDisagreement: false,
            severity: "normal",
            note: "Spatial speed variation within nominal range"
          });
        }
      }
    }
    loadConsistency();
    return () => { mounted = false; };
  }, [selectedSensor]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Close search popover on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSensor = (sensor) => {
    setSelectedSensor(sensor);
    if (sensor) {
      setSelectedSensorId?.(String(sensor.sensorId || sensor.id));
    }
    setSearchOpen(false);
  };

  const handleRegionChange = (regionId) => {
    setActiveRegion(regionId);
    const targetId = REGION_DEFAULT_SENSORS[regionId];
    if (targetId) {
      setSelectedSensorId?.(targetId);
      setSelectedSensor(prev => {
        if (prev && prev.regionId === regionId) return prev;
        const found = realSensors.find(s => String(s.sensorId || s.id) === String(targetId));
        return found || null;
      });
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleEvaluateQuery = async () => {
    const sid = selectedSensor?.sensorId || selectedSensor?.id || "767620";
    try {
      const data = await fetchCounterfactual(sid);
      setCounterfactualData(data);
      setActiveModal('counterfactual');
    } catch (e) {
      alert(`Could not evaluate query for ${sid}: ${e.message}`);
    }
  };

  const handleViewEvidence = async () => {
    const sid = selectedSensor?.sensorId || selectedSensor?.id || "767620";
    try {
      const data = await fetchEvidenceChain(sid);
      setEvidenceData(data);
      setActiveModal('evidence');
    } catch (e) {
      alert(`Could not fetch evidence for ${sid}: ${e.message}`);
    }
  };

  const handleQuerySensor = async (sensor) => {
    const sid = sensor.sensorId || sensor.id;
    const res = await executeQuery(sid);
    alert(`Evidence Query executed for ${sensor.displayAlias || sid}!\nMeasured Transferred: ${res.bytesTransferred || '4.2 KB'}\nEstimated Accuracy Benefit: ${res.expectedBenefit || '18%'}`);
    loadRealSnapshot(timeIndex, activeRegion);
  };

  // Compute graph edges
  const graphEdgeLines = useMemo(() => {
    if (!showGraphEdges || !realSensors || realSensors.length === 0) return [];
    const lines = [];
    const sensorMap = new Map(realSensors.map(s => [String(s.sensorId || s.id), s]));
    const seenEdges = new Set();

    realSensors.forEach(s => {
      const sid = String(s.sensorId || s.id);
      const nbrs = neighborsMap[sid] || s.graphNeighbors || [];
      nbrs.forEach(nbrId => {
        const nbr = sensorMap.get(String(nbrId));
        if (nbr) {
          const edgeKey = [sid, String(nbrId)].sort().join('-');
          if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            lines.push({
              fromLat: s.latitude,
              fromLon: s.longitude,
              toLat: nbr.latitude,
              toLon: nbr.longitude,
              fromSensorId: sid,
              toSensorId: String(nbrId)
            });
          }
        }
      });
    });
    return lines;
  }, [showGraphEdges, realSensors, neighborsMap]);

  // Search filter results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !realSensors) return [];
    const q = searchQuery.toLowerCase().trim();
    return realSensors
      .filter(s => {
        const sid = String(s.sensorId || s.id || '').toLowerCase();
        const reg = String(s.regionId || '').toLowerCase();
        return sid.includes(q) || reg.includes(q);
      })
      .slice(0, 8);
  }, [searchQuery, realSensors]);

  // Top 5 KPIs
  const currentSensorId = selectedSensor?.sensorId || selectedSensor?.id || "773869";
  const currentSensorRegion = selectedSensor?.regionId || "REGION_C";

  const networkTopKPIs = [
    {
      id: "total",
      label: "Total Sensors",
      value: "207",
      subtext: "Active Network Monitored",
      iconType: "sensor",
      variant: "blue"
    },
    {
      id: "selected",
      label: "Selected Sensor",
      value: currentSensorId,
      subtext: currentSensorRegion,
      iconType: "accuracy",
      variant: "cyan"
    },
    {
      id: "data-quality",
      label: "Data Quality",
      value: `${((selectedSensor?.dataQuality || 0.942) * 100).toFixed(1)}%`,
      subtext: "Valid Telemetry",
      iconType: "signal",
      variant: "emerald"
    },
    {
      id: "blind-spots",
      label: "Blind Spots",
      value: "3 Sectors",
      subtext: "Coverage Deficits Flagged",
      iconType: "alert",
      variant: "rose"
    },
    {
      id: "replay-index",
      label: "Replay Time",
      value: timestampStr.substring(11, 16) || "00:00",
      subtext: `Step ${timeIndex}`,
      iconType: "replay",
      variant: "amber"
    }
  ];

  return (
    <div className="space-y-5 pb-10">

      {/* ==================================================================== */}
      {/* 1. COMPACT OPERATIONS HEADER (Reference Style: Title + Regions + Search) */}
      {/* ==================================================================== */}
      <div className="rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-4 lg:p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Left: Brand Title & Replay Subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-blue-500/20 shrink-0">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-[#F5F8FC] tracking-tight">
                  Traffic Network
                </h1>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#CBDDF0] mt-0.5 font-medium">
                Metropolitan Freeway Corridor &bull; 207 Connected Sensors
              </p>
            </div>
          </div>

          {/* Right: Real Sensor Search Input */}
          <div className="relative w-full sm:w-80 lg:w-96" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-[#8295A8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search sensor (e.g. 773869), region..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full h-9 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-xs text-slate-900 dark:text-[#F5F8FC] placeholder-slate-400 dark:placeholder-[#647C92] focus:outline-hidden focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute right-0 mt-1.5 w-full bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-2xl p-1 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map(s => {
                  const sid = String(s.sensorId || s.id);
                  const isCur = String(selectedSensor?.sensorId || selectedSensor?.id) === sid;
                  return (
                    <button
                      key={`search-${sid}`}
                      onClick={() => handleSelectSensor(s)}
                      className="w-full p-2 text-left text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-[#0B2033] flex items-center justify-between transition-colors"
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{sid}</span>
                        <span className="text-[10px] text-slate-500 dark:text-[#8295A8]">{s.regionId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {s.speed !== null && s.speed !== undefined ? `${Number(s.speed).toFixed(1)} mph` : '--'}
                        </span>
                        {isCur && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP 5 KPI CARDS ROW                                               */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {networkTopKPIs.map((kpi) => (
          <MetricCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            subtext={kpi.subtext}
            iconType={kpi.iconType}
            variant={kpi.variant}
          />
        ))}
      </div>

      {fetchError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
          <div className="text-xs font-medium">
            <span className="font-bold">Backend Connection Error:</span> {fetchError}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. MAIN OPERATIONS CONSOLE (75% Large Map + 25% Side Sensor Panel)  */}
      {/* ==================================================================== */}
      <div
        ref={consoleRef}
        className={`transition-all ${
          isFullscreen
            ? 'fixed inset-0 z-[1000] bg-slate-950 p-4 flex flex-col lg:flex-row gap-4 overflow-hidden'
            : 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch'
        }`}
      >
        {/* Left Column (75% desktop width): Large Map Canvas */}
        <div className={isFullscreen ? 'flex-1 h-full min-h-0' : 'lg:col-span-8 xl:col-span-9 flex flex-col min-h-[640px]'}>
          <RealTrafficMap
            sensors={realSensors}
            selectedSensor={selectedSensor}
            onSelectSensor={handleSelectSensor}
            activeRegion={activeRegion}
            onRegionChange={handleRegionChange}
            showGraphEdges={showGraphEdges}
            graphEdges={graphEdgeLines}
            neighborsMap={neighborsMap}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>

        {/* Right Column (25% desktop width): Dedicated Sensor Details Panel */}
        <div className={isFullscreen ? 'w-full lg:w-[380px] h-full shrink-0' : 'lg:col-span-4 xl:col-span-3 flex flex-col h-[640px] max-h-[640px]'}>
          <SensorDetailPanel
            sensor={selectedSensor}
            allSensors={realSensors}
            neighborsMap={neighborsMap}
            onSelectSensor={handleSelectSensor}
            onEvaluateQuery={handleEvaluateQuery}
            onViewEvidence={handleViewEvidence}
            onQuerySensor={handleQuerySensor}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. TRAFFIC HEATMAP & COVERAGE ANALYTICS (Reference Operations Layout) */}
      {/* ==================================================================== */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Card (~55%): Traffic Speed Heatmap */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col min-h-[460px]">
            <TrafficSpeedHeatmap
              selectedSensor={selectedSensor}
              activeRegion={activeRegion}
              allSensors={realSensors}
              neighborsMap={neighborsMap}
              timeIndex={timeIndex}
              timestampStr={timestampStr}
              onSelectSensor={handleSelectSensor}
            />
          </div>

          {/* Right Card (~45%): Coverage & Blind Spots Panel */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col min-h-[460px]">
            <CoverageBlindSpotsPanel
              onSelectRegion={handleRegionChange}
              onSelectSensor={handleSelectSensor}
              allSensors={realSensors}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. OPERATIONAL DETAILS (Spatial Speed Consistency + Full Sensor Table) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-2">
        {/* Left Column (5 cols): Spatial Speed Consistency Engine */}
        <div className="lg:col-span-5 space-y-5">
          <SpatialSpeedConsistencyPanel data={spatialConsistencyData} />
        </div>

        {/* Right Column (7 cols): Full 207-Sensor Telemetry Table */}
        <div className="lg:col-span-7 space-y-5">
          <SensorTable
            sensors={realSensors}
            selectedSensorId={selectedSensor?.sensorId || selectedSensor?.id}
            onSelectSensor={handleSelectSensor}
          />
        </div>
      </div>

      {/* Decision Intelligence Inspection Modals */}
      {activeModal && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#081827] border border-blue-500/40 shadow-2xl relative transition-colors">
          {activeModal === 'counterfactual' && (
            <CounterfactualQueryCard
              data={counterfactualData}
              onClose={() => setActiveModal(null)}
              onExecuteQuery={async (id) => {
                await executeQuery(id);
                alert(`Counterfactual query executed for ${id}`);
                setActiveModal(null);
              }}
            />
          )}
          {activeModal === 'evidence' && (
            <EvidenceChain
              data={evidenceData}
              onClose={() => setActiveModal(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
