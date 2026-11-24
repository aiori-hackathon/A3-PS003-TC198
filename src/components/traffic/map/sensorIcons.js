// Sensor Icon Factory & Color Utilities for Traffic Map Nodes
import L from 'leaflet';

/**
 * Calculates sensor node color based on the selected telemetry overlay mode.
 * Supports: Traffic Speed, Need Score, Model Uncertainty, Drift, Quality.
 */
export function getSensorColorByMode(sensor, overlayMode) {
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

const sensorIconCache = new Map();

/**
 * Creates or retrieves a cached Leaflet DivIcon for a traffic sensor.
 * Multi-tier hierarchy:
 * 1. Selected Sensor: Prominent Red tactical beacon with animated radar pulse rings and location pill
 * 2. Connected Neighbor: Electric cyan glowing ring
 * 3. Standard Sensor: Crisp node with speed-colored aura
 */
export function createRealSensorIcon({
  sensorId = '',
  locationName = '',
  color = '#10b981',
  isSelected = false,
  isNeighbor = false
}) {
  const cacheKey = `${sensorId}_${locationName}_${color}_${isSelected ? 1 : 0}_${isNeighbor ? 1 : 0}`;
  const cached = sensorIconCache.get(cacheKey);
  if (cached) return cached;

  let icon;

  if (isSelected) {
    // 1. SELECTED SENSOR: Red tactical radar beacon with animated ripple rings & corridor label pill
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

        <!-- High-Contrast Attached Sensor Label Pill with Red Border & Real Location Name -->
        <div style="margin-left: 7px; padding: 3px 9px; border-radius: 6px; background-color: #071727; color: #ffffff; border: 2px solid #ef4444; font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; font-weight: 800; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.65); white-space: nowrap; pointer-events: none; line-height: 1.2; display: flex; align-items: center; gap: 5px; z-index: 10;">
          <span style="width: 5px; height: 5px; border-radius: 9999px; background-color: #ef4444; flex-shrink: 0;"></span>
          <span style="letter-spacing: 0.02em;">${sensorId}</span>
          ${locationName ? `<span style="color: #cbd5e1; font-weight: 600; font-size: 10px; border-left: 1px solid #334155; padding-left: 6px; margin-left: 2px;">${locationName}</span>` : ''}
        </div>
      </div>
    `;
    icon = L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [locationName ? 340 : 120, 36],
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
