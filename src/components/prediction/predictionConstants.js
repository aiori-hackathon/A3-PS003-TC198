// Prediction & Forecasting Benchmarks and Representative Sensors
import sensorLocationNames from '../../data/sensor_location_names.json';

// METR-LA Representative Sensors (Calibrated on Los Angeles Loop Detectors)
export const RAW_METR_REPRESENTATIVE_SENSORS = [
  { id: '773975', region: 'REGION_A' },
  { id: '773927', region: 'REGION_A' },
  { id: '767573', region: 'REGION_A' },
  { id: '767541', region: 'REGION_B' },
  { id: '717458', region: 'REGION_B' },
  { id: '718045', region: 'REGION_B' },
  { id: '773869', region: 'REGION_C' },
  { id: '717447', region: 'REGION_B' },
  { id: '717816', region: 'REGION_D' },
  { id: '717468', region: 'REGION_C' },
  { id: '765171', region: 'REGION_D' },
  { id: '769431', region: 'REGION_D' },
  { id: '767350', region: 'REGION_D' }
];

export const REPRESENTATIVE_SENSORS = RAW_METR_REPRESENTATIVE_SENSORS.map((s) => {
  const loc = sensorLocationNames[s.id]?.locationName || '';
  return {
    ...s,
    name: loc ? `${s.id} • ${loc}` : `${s.id} (${s.region})`,
    locationName: loc
  };
});

// PeMS08 Representative Sensors (San Bernardino Freeway System)
export const PEMS08_REPRESENTATIVE_SENSORS = [
  { id: 'PEMS08_009', name: 'PEMS08_009 (I-10 Corridor)', region: 'I-10 Corridor' },
  { id: 'PEMS08_028', name: 'PEMS08_028 (I-15 Corridor)', region: 'I-15 Corridor' },
  { id: 'PEMS08_062', name: 'PEMS08_062 (SR-60 Corridor)', region: 'SR-60 Corridor' },
  { id: 'PEMS08_111', name: 'PEMS08_111 (I-215 Interchange)', region: 'I-215 Interchange' },
  { id: 'PEMS08_133', name: 'PEMS08_133 (I-10 Corridor)', region: 'I-10 Corridor' },
  { id: 'PEMS08_138', name: 'PEMS08_138 (I-15 Corridor)', region: 'I-15 Corridor' },
  { id: 'PEMS08_153', name: 'PEMS08_153 (SR-60 Corridor)', region: 'SR-60 Corridor' },
  { id: 'PEMS08_163', name: 'PEMS08_163 (I-215 Interchange)', region: 'I-215 Interchange' },
  { id: 'PEMS08_164', name: 'PEMS08_164 (I-10 Corridor)', region: 'I-10 Corridor' },
  { id: 'PEMS08_167', name: 'PEMS08_167 (I-15 Corridor)', region: 'I-15 Corridor' },
  { id: 'PEMS08_039', name: 'PEMS08_039 (SR-60 Corridor)', region: 'SR-60 Corridor' },
  { id: 'PEMS08_058', name: 'PEMS08_058 (I-215 Interchange)', region: 'I-215 Interchange' }
];

// Horizon Multi-Step Benchmarks
export const HORIZON_BENCHMARKS = {
  '+5 min': { testMae: '2.3648', winner: 'Graph+LSTM', confidence: 'HIGH', uncertaintyMph: '±1.65' },
  '+15 min': { testMae: '3.0007', winner: 'Graph+LSTM', confidence: 'HIGH', uncertaintyMph: '±2.10' },
  '+30 min': { testMae: '3.6699', winner: 'Graph+LSTM', confidence: 'MEDIUM', uncertaintyMph: '±2.85' },
  '+60 min': { testMae: '4.7158', winner: 'Historical Avg (4.1934)', confidence: 'LOW', uncertaintyMph: '±3.90' }
};

// Initial Baseline Predictions to prevent zero-state flicker
export const INITIAL_PREDICTIONS = [
  { horizonMinutes: 5, horizonLabel: '+5 min', predictedSpeedMph: 62.4, actualSpeedMph: 62.8, absoluteErrorMph: 0.4 },
  { horizonMinutes: 15, horizonLabel: '+15 min', predictedSpeedMph: 61.8, actualSpeedMph: 62.0, absoluteErrorMph: 0.2 },
  { horizonMinutes: 30, horizonLabel: '+30 min', predictedSpeedMph: 61.1, actualSpeedMph: 61.5, absoluteErrorMph: 0.4 },
  { horizonMinutes: 60, horizonLabel: '+60 min', predictedSpeedMph: 60.5, actualSpeedMph: 60.1, absoluteErrorMph: 0.4 }
];
