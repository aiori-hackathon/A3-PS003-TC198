// Floating Region Centroid Pill Icons for Leaflet Map
import L from 'leaflet';

const pillIconCache = new Map();

export function createRegionFloatingPillIcon(region) {
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
