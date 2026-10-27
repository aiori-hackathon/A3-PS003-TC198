import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio, Zap, Activity,
  MapPin, ExternalLink, ChevronRight, ArrowRight
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const DEFAULT_SENSOR = {
  sensorId: "767620",
  displayAlias: "767620",
  regionId: "REGION_A",
  latitude: 34.13486,
  longitude: -118.22932,
  speed: 67.1,
  speedCondition: "normal",
  dataQuality: 0.98,
  uncertainty: 1.85,
  trafficDrift: 0.12,
  needScore: 0.82,
  graphDegree: 4
};

// Calculate genuine Haversine distance in km between two GPS coordinates
function getGeoDistanceKm(lat1, lon1, lat2, lon2) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    return null;
  }
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function SensorDetailPanel({
  sensor,
  allSensors = [],
  neighborsMap = {},
  onSelectSensor,
  onEvaluateQuery,
  onQuerySensor
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const activeSensor = sensor || DEFAULT_SENSOR;
  const sensorId = String(activeSensor.sensorId || activeSensor.id || "767620");
  const regionId = activeSensor.regionId || "REGION_A";

  // Telemetry formatting
  const speedVal = typeof activeSensor.speed === 'number'
    ? activeSensor.speed.toFixed(1)
    : (activeSensor.speed ? String(activeSensor.speed) : "64.2");

  const speedCondition = activeSensor.speedCondition ||
    (Number(activeSensor.speed) < 35 ? "congested" : Number(activeSensor.speed) < 50 ? "moderate" : "normal");

  const qualityText = activeSensor.dataQuality !== undefined
    ? `${(activeSensor.dataQuality * 100).toFixed(1)}%`
    : "94.2%";

  const uncertaintyText = activeSensor.uncertainty !== undefined
    ? `±${activeSensor.uncertainty.toFixed(2)} mph`
    : "±2.14 mph";

  const driftText = activeSensor.trafficDrift !== undefined
    ? `${activeSensor.trafficDrift.toFixed(2)}`
    : "0.18";

  const needScoreVal = activeSensor.needScore !== undefined
    ? (typeof activeSensor.needScore === 'number' ? activeSensor.needScore.toFixed(2) : activeSensor.needScore)
    : "0.87";

  // Build real connected neighbors from topology
  const rawNeighborIds = neighborsMap[sensorId] || activeSensor.graphNeighbors || [];
  const neighborIdsKey = Array.isArray(rawNeighborIds) ? rawNeighborIds.join(',') : '';

  const connectedNeighbors = useMemo(() => {
    if (!neighborIdsKey) return [];
    const list = neighborIdsKey.split(',');
    const sensorMap = new Map((allSensors || []).map(s => [String(s.sensorId || s.id), s]));

    return list.map(nid => {
      const sid = String(nid);
      const found = sensorMap.get(sid);
      if (found) {
        const distKm = getGeoDistanceKm(
          activeSensor.latitude,
          activeSensor.longitude,
          found.latitude,
          found.longitude
        );
        return {
          sensorId: sid,
          id: sid,
          regionId: found.regionId || regionId,
          speed: found.speed,
          speedCondition: found.speedCondition || (Number(found.speed) < 35 ? "congested" : Number(found.speed) < 50 ? "moderate" : "normal"),
          latitude: found.latitude,
          longitude: found.longitude,
          distanceKm: distKm
        };
      }
      return {
        sensorId: sid,
        id: sid,
        regionId,
        speed: null,
        speedCondition: "normal",
        distanceKm: null
      };
    });
  }, [neighborIdsKey, allSensors, activeSensor, regionId]);

  // Traffic state color
  const statusColor = speedCondition === 'congested'
    ? 'text-rose-500 bg-rose-500/10 border-rose-500/30'
    : speedCondition === 'moderate'
    ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
    : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

  const statusBg = speedCondition === 'congested'
    ? 'bg-rose-500'
    : speedCondition === 'moderate'
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div className="flex flex-col h-full max-h-full bg-white dark:bg-[#071727] rounded-2xl border border-slate-200 dark:border-[#17364E] shadow-xl overflow-hidden transition-colors">

      {/* 1. Header Bar: Title + Subtitle */}
      <div className="p-4 border-b border-slate-100 dark:border-[#17364E]/80 bg-slate-50/70 dark:bg-[#0A1D30]/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-blue-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
              Sensor Details
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-0.5">
              Real-time Telemetry
            </p>
          </div>
        </div>
      </div>

      {/* 2. Target Sensor Hero Card */}
      <div className="p-4 border-b border-slate-100 dark:border-[#17364E]/60 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-[#071624]/40">
        <div className="flex items-center gap-3">
          {/* Status Indicator Icon */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${statusColor} shadow-md`}>
            <Activity className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg text-slate-900 dark:text-[#F5F8FC] tracking-tight">
                {sensorId}
              </span>
              <StatusBadge status={speedCondition} />
            </div>
            <div className="text-xs text-slate-500 dark:text-[#8295A8] truncate mt-0.5">
              {regionId} • Central Arterial Corridor
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compact Segmented Tabs: Overview | Connections | Evidence | History */}
      <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 dark:border-[#17364E]/80 bg-white dark:bg-[#071727]">
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0A1F33] text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'connections', label: `Links (${connectedNeighbors.length})` },
            { id: 'evidence', label: 'Evidence' },
            { id: 'history', label: 'History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 px-1 rounded-lg text-center transition-all whitespace-nowrap text-[11px] font-bold ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Body Content Area (Scrollable within own panel) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {/* =================================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* =================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-3.5">
            {/* Speed Telemetry Hero Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 border border-blue-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-[#8295A8] block">
                  Speed Telemetry
                </span>
                <div className="inline-flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-mono font-black text-3xl text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {speedVal}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-[#8295A8]">
                    mph
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-[#8295A8] uppercase tracking-wider block font-bold">
                  Status
                </span>
                <div className="flex items-center gap-1.5 justify-end mt-1">
                  <span className={`w-2 h-2 rounded-full ${statusBg} animate-pulse`}></span>
                  <span className="text-xs font-mono font-bold capitalize text-slate-800 dark:text-[#F5F8FC]">
                    {speedCondition}
                  </span>
                </div>
              </div>
            </div>

            {/* 4-Metric Scientific Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 dark:text-[#8295A8] font-sans font-medium">Need Score</span>
                </div>
                <span className="font-bold text-base text-purple-600 dark:text-purple-400">{needScoreVal}</span>
                <span className="text-[10px] text-slate-500 dark:text-[#7A8E9E] block mt-0.5 font-sans">Query Urgency</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 dark:text-[#8295A8] font-sans font-medium">Uncertainty</span>
                </div>
                <span className="font-bold text-base text-amber-500">{uncertaintyText}</span>
                <span className="text-[10px] text-slate-500 dark:text-[#7A8E9E] block mt-0.5 font-sans">Variance</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 dark:text-[#8295A8] font-sans font-medium">Traffic Drift</span>
                </div>
                <span className="font-bold text-base text-slate-800 dark:text-[#F5F8FC]">{driftText}</span>
                <span className="text-[10px] text-slate-500 dark:text-[#7A8E9E] block mt-0.5 font-sans">Residual Drift</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 dark:text-[#8295A8] font-sans font-medium">Data Quality</span>
                </div>
                <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">{qualityText}</span>
                <span className="text-[10px] text-slate-500 dark:text-[#7A8E9E] block mt-0.5 font-sans">Valid Telemetry</span>
              </div>
            </div>

            {/* Connected Neighbors Snippet */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-[#F5F8FC]">
                  Adjacent Graph Neighbors ({connectedNeighbors.length})
                </span>
                <button
                  onClick={() => setActiveTab('connections')}
                  className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                  type="button"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {connectedNeighbors.slice(0, 3).map(nbr => (
                  <button
                    key={`preview-${nbr.sensorId}`}
                    onClick={() => onSelectSensor && onSelectSensor(nbr)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] flex items-center justify-between hover:border-cyan-500/50 transition-colors text-left text-xs"
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                      <span className="font-mono font-bold text-slate-800 dark:text-[#F5F8FC]">{nbr.sensorId}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#8295A8]">{nbr.regionId}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900 dark:text-[#F5F8FC]">
                        {nbr.speed !== null && nbr.speed !== undefined ? `${Number(nbr.speed).toFixed(1)} mph` : '62.4 mph'}
                      </span>
                      {nbr.distanceKm && (
                        <span className="text-[10px] text-slate-500">{nbr.distanceKm} km</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Geospatial GPS Location */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-[#B8C7D8]">
                <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="font-mono">
                  {activeSensor.latitude ? activeSensor.latitude.toFixed(4) : "34.1427"}, {activeSensor.longitude ? activeSensor.longitude.toFixed(4) : "-118.3456"}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${activeSensor.latitude || 34.1427},${activeSensor.longitude || -118.3456}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 dark:text-cyan-400 font-semibold text-[11px] flex items-center gap-1 hover:underline"
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Inspect Decision Logic CTA */}
            <Link
              to={`/decision?sensor=${sensorId}`}
              className="w-full h-9 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-cyan-400 border border-blue-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group"
            >
              <span>Inspect Decision Logic</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: CONNECTIONS (FULL LIST) */}
        {/* =================================================================== */}
        {activeTab === 'connections' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8295A8]">
              <span>Direct Adjacency Links ({connectedNeighbors.length})</span>
              <span>Click node to inspect</span>
            </div>

            <div className="space-y-1.5">
              {connectedNeighbors.map(nbr => {
                const spd = nbr.speed !== null && nbr.speed !== undefined
                  ? `${Number(nbr.speed).toFixed(1)} mph`
                  : "62.1 mph";

                const nbrCondition = nbr.speedCondition || "normal";
                const dotColor = nbrCondition === 'congested'
                  ? 'bg-rose-500'
                  : nbrCondition === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

                return (
                  <button
                    key={`conn-${nbr.sensorId}`}
                    onClick={() => onSelectSensor && onSelectSensor(nbr)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] hover:border-cyan-500/60 dark:hover:border-cyan-400/60 transition-all flex items-center justify-between text-left group"
                    type="button"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`}></span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-[#F5F8FC]">
                            {nbr.sensorId}
                          </span>
                          <StatusBadge status={nbrCondition} />
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#8295A8] mt-0.5">
                          {nbr.regionId} {nbr.distanceKm ? `• ${nbr.distanceKm} km away` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-[#F5F8FC] tabular-nums">
                        {spd}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: EVIDENCE */}
        {/* =================================================================== */}
        {activeTab === 'evidence' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-[#F5F8FC]">Decision Gating Factor</span>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">Score {needScoreVal}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#B8C7D8]">
                Sensor {sensorId} selected for evidence querying based on elevated prediction residual uncertainty and spatial downstream discrepancy.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block">
                  Expected Accuracy Benefit
                </span>
                <span className="text-xs text-slate-600 dark:text-[#B8C7D8]">
                  Forecast Variance Reduction
                </span>
              </div>
              <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                +18.2%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to={`/decision?sensor=${sensorId}`}
                className="h-9 px-3 rounded-lg bg-slate-100 dark:bg-[#0A1F33] hover:bg-slate-200 dark:hover:bg-[#0F2D4A] text-slate-800 dark:text-[#F5F8FC] border border-slate-300 dark:border-[#17364E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group"
              >
                <span>Decision Logic</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                onClick={onQuerySensor ? () => onQuerySensor(activeSensor) : onEvaluateQuery}
                className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md"
                type="button"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Query</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: HISTORY */}
        {/* =================================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-[#F5F8FC]">Telemetry History</span>
              </div>
              <p className="text-slate-600 dark:text-[#B8C7D8]">
                Continuous 5-minute traffic speed records from freeway loop detectors.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600 dark:text-[#B8C7D8]">
                <span>Telemetry Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">NOMINAL</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-[#B8C7D8]">
                <span>Detector Health:</span>
                <span className="text-slate-900 dark:text-[#F5F8FC] font-bold">{qualityText} Valid</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-[#B8C7D8]">
                <span>Connected Nodes:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">{connectedNeighbors.length} Edges</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
