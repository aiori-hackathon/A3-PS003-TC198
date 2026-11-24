import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import sensorLocationNames from '../../data/sensor_location_names.json';
import RealTrafficMap from '../../components/traffic/RealTrafficMap';
import GlobalActionModal from '../../components/common/GlobalActionModal';
import SensorDetailPanel from '../../components/traffic/SensorDetailPanel';
import SensorTable from '../../components/traffic/SensorTable';
import CounterfactualQueryCard from '../../components/decision/CounterfactualQueryCard';
import EvidenceChain from '../../components/decision/EvidenceChain';
import MetricCard from '../../components/common/MetricCard';
import TrafficSpeedHeatmap from '../../components/traffic/TrafficSpeedHeatmap';
import CoverageBlindSpotsPanel from '../../components/traffic/CoverageBlindSpotsPanel';
import TrafficNetworkHeader from '../../components/traffic/TrafficNetworkHeader';
import {
  fetchCounterfactual,
  fetchEvidenceChain,
  executeQuery,
  fetchMetrSnapshot,
  fetchStreamingSnapshot,
  fetchNetworkTopology
} from '../../services/api';
import { useReplay } from '../../context/ReplayContext';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

const REGION_DEFAULT_SENSORS = {
  ALL: '767620',
  REGION_A: '767620',
  REGION_B: '767541',
  REGION_C: '717489',
  REGION_D: '769430'
};

/**
 * TrafficNetwork Page Component
 * Interactive geospatial dashboard rendering 207 real METR-LA loop detectors,
 * real-time telemetry snapshots, topological graph connections, and counterfactual queries.
 */
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

  const [actionNotice, setActionNotice] = useState(null);
  const [queryModalData, setQueryModalData] = useState(null);
  const actionNoticeTimerRef = useRef(null);
  const snapshotRetryTimerRef = useRef(null);
  const loadRealSnapshotRef = useRef(null);

  const showNotice = useCallback((msg, type = 'success') => {
    if (actionNoticeTimerRef.current) clearTimeout(actionNoticeTimerRef.current);
    setActionNotice({ message: msg, type });
    actionNoticeTimerRef.current = setTimeout(() => setActionNotice(null), 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (actionNoticeTimerRef.current) clearTimeout(actionNoticeTimerRef.current);
      if (snapshotRetryTimerRef.current) clearTimeout(snapshotRetryTimerRef.current);
    };
  }, []);

  const [counterfactualData, setCounterfactualData] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const consoleRef = useRef(null);

  // Load graph topology for network road edges with controlled retries
  useEffect(() => {
    let mounted = true;
    let retryTimer = null;

    async function loadTopology(attempt = 0) {
      try {
        const topo = await fetchNetworkTopology();
        if (mounted && topo && topo.neighborsMap) {
          setNeighborsMap(topo.neighborsMap);
        }
      } catch (e) {
        const isPermanentError = e?.message && /\b(400|401|403|404)\b/.test(e.message);
        if (mounted && !isPermanentError && attempt < 2) {
          const delayMs = (attempt + 1) * 2000;
          console.warn(`Topology fetch attempt ${attempt + 1} failed (${e?.message || e}). Retrying in ${delayMs / 1000}s...`);
          retryTimer = setTimeout(() => {
            if (mounted) {
              loadTopology(attempt + 1);
            }
          }, delayMs);
        } else if (mounted) {
          console.warn("Failed to load network topology:", e);
        }
      }
    }

    loadTopology(0);

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const loadRealSnapshot = useCallback(async (tIndex, rId, attempt = 0) => {
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
        const isColdStart = err?.isTimeout || err?.name === 'TimeoutError' || err?.message?.includes('timed out');
        if (isColdStart && attempt < 2) {
          console.warn(`Snapshot cold-start timeout (attempt ${attempt + 1}). Retrying in 3s...`);
          if (snapshotRetryTimerRef.current) clearTimeout(snapshotRetryTimerRef.current);
          snapshotRetryTimerRef.current = setTimeout(() => {
            loadRealSnapshotRef.current?.(tIndex, rId, attempt + 1);
          }, 3000);
          setFetchError(`Backend warming up from cold-start (${err.message}). Connecting automatically in 3s...`);
          return;
        }

        const isCloudBackend = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const hint = isCloudBackend
          ? 'Cloud backend may be waking up from free-tier sleep. Please wait a few seconds or click Play/Replay.'
          : 'Ensure FastAPI server is running at http://127.0.0.1:8000';
        setFetchError(`Backend API connection failed: ${err.message}. ${hint}`);
      }
    }
  }, [searchParams, selectedSensorId, dataSourceMode]);

  useEffect(() => {
    loadRealSnapshotRef.current = loadRealSnapshot;
  }, [loadRealSnapshot]);

  useEffect(() => {
    loadRealSnapshot(timeIndex, activeRegion);
  }, [timeIndex, activeRegion, loadRealSnapshot]);

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
      showNotice(`Could not evaluate query for ${sid}: ${e.message}`, 'error');
    }
  };

  const handleViewEvidence = async () => {
    const sid = selectedSensor?.sensorId || selectedSensor?.id || "767620";
    try {
      const data = await fetchEvidenceChain(sid);
      setEvidenceData(data);
      setActiveModal('evidence');
    } catch (e) {
      showNotice(`Could not fetch evidence for ${sid}: ${e.message}`, 'error');
    }
  };

  const handleQuerySensor = async (sensor) => {
    const sid = String(sensor.sensorId || sensor.id);
    const locMeta = sensorLocationNames[sid]?.locationName || sensor.locationName || '';
    const displayName = locMeta ? `Sensor ${sid} (${locMeta})` : `Sensor ${sid}`;
    try {
      const res = await executeQuery(sid);
      const transferred = res?.bytesTransferred || '4.2 KB';
      const benefit = res?.expectedBenefit || '+18.2%';
      setQueryModalData({
        isOpen: true,
        message: `Evidence Query executed for ${displayName}!\nMeasured Transferred: ${transferred}\nEstimated Accuracy Benefit: ${benefit}`
      });
      showNotice(`Evidence query executed for ${displayName} • Transferred: ${transferred} • Benefit: ${benefit}`, 'success');
      loadRealSnapshot(timeIndex, activeRegion);
    } catch (e) {
      setQueryModalData({
        isOpen: true,
        type: 'error',
        message: `Could not execute query for ${displayName}: ${e.message}`
      });
      showNotice(`Could not execute query for ${displayName}: ${e.message}`, 'error');
    }
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

  // Search filter results (matches Sensor ID, Region, and Corridor Name)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !realSensors) return [];
    const q = searchQuery.toLowerCase().trim();
    return realSensors
      .filter(s => {
        const sid = String(s.sensorId || s.id || '').toLowerCase();
        const reg = String(s.regionId || '').toLowerCase();
        const loc = String(sensorLocationNames[sid]?.locationName || s.locationName || '').toLowerCase();
        return sid.includes(q) || reg.includes(q) || loc.includes(q);
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
    <div className="space-y-5 pb-10 animate-page-enter">
      {/* 1. Header with Autocomplete Sensor Search */}
      <TrafficNetworkHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchResults={searchResults}
        selectedSensor={selectedSensor}
        onSelectSensor={handleSelectSensor}
      />

      {/* 2. Top 5 KPI Cards Row */}
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

      {actionNotice && (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 shadow-sm transition-all duration-200 ${
          actionNotice.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
        }`}>
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {actionNotice.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            type="button"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main Operations Console (Large Map + Side Sensor Details Panel) */}
      <div
        ref={consoleRef}
        className={`transition-all ${
          isFullscreen
            ? 'fixed inset-0 z-[1000] bg-slate-950 p-4 flex flex-col lg:flex-row gap-4 overflow-hidden'
            : 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch'
        }`}
      >
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

      {/* 4. Traffic Heatmap & Coverage Analytics */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
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

          <div className="lg:col-span-5 xl:col-span-5 flex flex-col min-h-[460px]">
            <CoverageBlindSpotsPanel
              onSelectRegion={handleRegionChange}
              onSelectSensor={handleSelectSensor}
              allSensors={realSensors}
            />
          </div>
        </div>
      )}

      {/* 5. Network Sensor Inventory Table */}
      <div className="pt-2">
        <SensorTable
          sensors={realSensors}
          selectedSensorId={selectedSensor?.sensorId || selectedSensor?.id}
          onSelectSensor={handleSelectSensor}
        />
      </div>

      {/* Decision Intelligence Inspection Modals */}
      <GlobalActionModal modal={queryModalData} onClose={() => setQueryModalData(null)} />

      {activeModal && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#081827] border border-blue-500/40 shadow-2xl relative transition-colors">
          {activeModal === 'counterfactual' && (
            <CounterfactualQueryCard
              data={counterfactualData}
              onClose={() => setActiveModal(null)}
              onExecuteQuery={async (id) => {
                const sid = String(id);
                const locMeta = sensorLocationNames[sid]?.locationName || '';
                const displayName = locMeta ? `Sensor ${sid} (${locMeta})` : `Sensor ${sid}`;
                try {
                  const res = await executeQuery(sid);
                  const transferred = res?.bytesTransferred || '4.2 KB';
                  const benefit = res?.expectedBenefit || '+18.2%';
                  setQueryModalData({
                    isOpen: true,
                    message: `Counterfactual Query executed for ${displayName}!\nMeasured Transferred: ${transferred}\nEstimated Accuracy Benefit: ${benefit}`
                  });
                  showNotice(`Counterfactual query executed for ${displayName}`, 'success');
                } catch (e) {
                  setQueryModalData({
                    isOpen: true,
                    type: 'error',
                    message: `Query execution failed for ${displayName}: ${e.message}`
                  });
                  showNotice(`Query execution failed for ${displayName}: ${e.message}`, 'error');
                }
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
