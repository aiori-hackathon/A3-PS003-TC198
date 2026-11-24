// Map Configuration & Geographic Constants for Los Angeles METR-LA Network

// 1. Basemap Tile Providers (ArcGIS World Maps - 100% Watermark-Free)
export const BASEMAP_TILES = {
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

export const BASEMAP_OPTIONS = [
  { id: 'street', label: 'Street' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'dark', label: 'Dark' }
];

// 2. Real Region Boundary Polygons, Centroids & Bounding Boxes (Calibrated from 207 METR-LA Sensors)
export const REAL_REGIONS = {
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

// 3. Viewport Defaults
export const FULL_NETWORK_BOUNDS = [
  [34.030, -118.555],
  [34.235, -118.170]
];

export const DEFAULT_CENTER = [34.135, -118.320];
export const DEFAULT_ZOOM = 11.8;

// 4. Metric & Edge Modes
export const METRIC_OPTIONS = [
  { id: 'speed', label: 'Traffic Speed' },
  { id: 'need_score', label: 'Need Score' },
  { id: 'uncertainty', label: 'Model Uncertainty' },
  { id: 'drift', label: 'Traffic Drift' },
  { id: 'quality', label: 'Data Quality' }
];

export const EDGE_OPTIONS = [
  { id: 'neighborhood', label: 'Selected Edges' },
  { id: 'all', label: 'All Edges' },
  { id: 'none', label: 'Edges Off' }
];

export const REGION_ITEMS = [
  { id: 'ALL', label: 'All', count: '207', color: 'bg-slate-400' },
  { id: 'REGION_A', label: 'Region A', count: '48', color: 'bg-blue-500' },
  { id: 'REGION_B', label: 'Region B', count: '57', color: 'bg-orange-500' },
  { id: 'REGION_C', label: 'Region C', count: '58', color: 'bg-purple-500' },
  { id: 'REGION_D', label: 'Region D', count: '44', color: 'bg-emerald-500' }
];
