import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import sensorLocationNames from '../../data/sensor_location_names.json';

// Modular Map Helpers & Configurations
import {
  BASEMAP_TILES,
  REAL_REGIONS,
  FULL_NETWORK_BOUNDS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM
} from './map/mapConfig';
import { createRealSensorIcon, getSensorColorByMode } from './map/sensorIcons';
import { createRegionFloatingPillIcon } from './map/regionIcons';
import ViewportController from './map/ViewportController';
import UnifiedMapControls from './map/UnifiedMapControls';

/**
 * RealTrafficMap Component
 * High-performance Leaflet traffic map displaying 207 real METR-LA sensors,
 * dynamic graph topology connections, regional convex boundaries, and live telemetry overlays.
 */
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
  // 1. Overlay Intelligence Metric Mode ('speed', 'need_score', 'uncertainty', 'drift', 'quality')
  const [overlayMode, setOverlayMode] = useState('speed');

  // 2. Basemap Selector (street [Default], satellite, dark)
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

  // 3. Connection Edges Mode ('neighborhood' [Default] | 'all' | 'none')
  const [edgeMode, setEdgeMode] = useState('neighborhood');

  // 4. Region Boundaries Visibility
  const showRegionBoundaries = true;

  // 5. Selected Sensor ID & Neighbor Set
  const activeSelectedId = String(selectedSensor?.sensorId || selectedSensor?.id || "767620");

  const neighborIdSet = useMemo(() => {
    const list = neighborsMap[activeSelectedId] || selectedSensor?.graphNeighbors || [];
    return new Set(list.map(String));
  }, [neighborsMap, activeSelectedId, selectedSensor]);

  // 6. Viewport Navigation Target (Center, Zoom, or Bounding Box)
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

  // Smooth camera pan to selected sensor when it changes
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

  // Smooth camera framing when activeRegion tab changes
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

  // Filter sensors based on activeRegion
  const visibleSensors = useMemo(() => {
    if (!sensors || sensors.length === 0) return [];
    const valid = sensors.filter(s =>
      typeof s?.latitude === 'number' && !isNaN(s.latitude) &&
      typeof s?.longitude === 'number' && !isNaN(s.longitude)
    );
    if (activeRegion === 'ALL') return valid;
    return valid.filter(s => s.regionId === activeRegion);
  }, [sensors, activeRegion]);

  // Edge line stabilization during camera flight transitions
  const [linesReady, setLinesReady] = useState(false);
  const [prevRegion, setPrevRegion] = useState(activeRegion);
  const [prevSensorId, setPrevSensorId] = useState(activeSelectedId);

  if (activeRegion !== prevRegion) {
    setPrevRegion(activeRegion);
    setLinesReady(false);
  }
  if (activeSelectedId !== prevSensorId) {
    setPrevSensorId(activeSelectedId);
    setLinesReady(false);
  }

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

  // Multi-tier layered graph topology edges
  const edgesToRender = useMemo(() => {
    if (!linesReady || !showGraphEdges || edgeMode === 'none' || !graphEdges || graphEdges.length === 0) {
      return [];
    }

    const visibleSensorIdSet = new Set(visibleSensors.map(s => String(s.sensorId || s.id)));

    let candidateEdges = [];
    if (edgeMode === 'neighborhood') {
      candidateEdges = graphEdges.filter(e =>
        String(e.fromSensorId) === activeSelectedId ||
        String(e.toSensorId) === activeSelectedId
      );
    } else {
      candidateEdges = graphEdges.slice(0, 250);
    }

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
      let color = '#64748b'; // Muted slate
      let weight = 1.2;
      let opacity = 0.22;
      let glow = false;
      let glowColor = '';

      if (isDirectSelected) {
        tier = 2;
        color = '#ef4444'; // Red accent styling
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

    return styled.sort((a, b) => a.tier - b.tier);
  }, [linesReady, showGraphEdges, edgeMode, graphEdges, activeSelectedId, neighborIdSet, visibleSensors, activeRegion]);

  const activeTileConfig = BASEMAP_TILES[basemapId] || BASEMAP_TILES.street;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#17364E] bg-slate-100 dark:bg-[#050b14] shadow-xl flex flex-col select-none transition-all ${
      isFullscreen ? 'h-full flex-1 min-h-0' : 'h-[640px] min-h-[580px]'
    }`}>

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
          {/* Active Basemap Tile Layer */}
          <TileLayer
            key={activeTileConfig.id}
            url={activeTileConfig.url}
            attribution={activeTileConfig.attribution}
            maxZoom={activeTileConfig.maxZoom}
          />

          {/* Unified Map Controls Toolbar */}
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

          {/* Animated Viewport Navigation Controller */}
          <ViewportController
            targetCenter={navTarget.center}
            targetZoom={navTarget.zoom}
            targetBounds={navTarget.bounds}
            triggerCount={navTrigger}
            isFullscreen={isFullscreen}
          />

          {/* 1. Regional Boundary Polygons (Convex hulls of actual sensor GPS positions) */}
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

          {/* 2. Floating Centroid Pill Markers */}
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

          {/* 3. Multi-tier Layered Graph Topology Connections */}
          {edgesToRender.map((edge, idx) => (
            <React.Fragment key={`real-edge-${idx}-${activeSelectedId}-${activeRegion}`}>
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
          ))}

          {/* 4. Real 207 Sensors at Exact GPS Coordinates */}
          {visibleSensors.map(sensor => {
            const sid = String(sensor.sensorId || sensor.id);
            const isSelected = activeSelectedId === sid;
            const isNeighbor = neighborIdSet.has(sid);
            const color = getSensorColorByMode(sensor, overlayMode);
            const locMeta = sensorLocationNames[sid] || {};
            const locationName = locMeta.locationName || sensor.locationName || '';
            const speedDisplay = sensor.speed !== null && sensor.speed !== undefined && !sensor.maskedNull
              ? `${Number(sensor.speed).toFixed(1)} mph`
              : 'Masked Null';

            const icon = createRealSensorIcon({
              sensorId: sid,
              locationName,
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
                  click: () => onSelectSensor && onSelectSensor({ ...sensor, locationName })
                }}
              >
                {/* Instant Hover Tooltip for Zero-Clutter Readability */}
                <Tooltip direction="top" offset={[0, -8]} opacity={0.96}>
                  <div className="font-sans text-xs font-semibold py-0.5">
                    <span className="text-red-600 dark:text-red-400 font-bold">{sid}</span>
                    {locationName && (
                      <span className="text-slate-800 dark:text-slate-100 font-bold ml-1.5">• {locationName}</span>
                    )}
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
