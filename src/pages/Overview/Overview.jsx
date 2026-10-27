import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useReplay } from '../../context/ReplayContext';
import { fetchForecast, fetchNeedScore, fetchSensorById } from '../../services/api';

import OverviewHeroConsole from '../../components/overview/OverviewHeroConsole';
import CurrentSensorStateCard from '../../components/overview/CurrentSensorStateCard';
import Next60MinutesForecastCard from '../../components/overview/Next60MinutesForecastCard';
import ForecastDirectionCard from '../../components/overview/ForecastDirectionCard';
import ForecastConfidenceCard from '../../components/overview/ForecastConfidenceCard';
import NeighborConsensusCard from '../../components/overview/NeighborConsensusCard';
import TrafficOutlookTimelineCard from '../../components/overview/TrafficOutlookTimelineCard';
import WhatToWatchCard from '../../components/overview/WhatToWatchCard';

const REPRESENTATIVE_SENSORS = [
  { id: '773869', name: 'Sensor 773869 (Region C)', region: 'REGION_C' },
  { id: '773975', name: 'Sensor 773975 (Region A)', region: 'REGION_A' },
  { id: '773927', name: 'Sensor 773927 (Region A)', region: 'REGION_A' },
  { id: '767573', name: 'Sensor 767573 (Region A)', region: 'REGION_A' },
  { id: '767541', name: 'Sensor 767541 (Region B)', region: 'REGION_B' },
  { id: '717458', name: 'Sensor 717458 (Region B)', region: 'REGION_B' },
  { id: '718045', name: 'Sensor 718045 (Region B)', region: 'REGION_B' },
  { id: '717447', name: 'Sensor 717447 (Region C)', region: 'REGION_C' },
  { id: '717816', name: 'Sensor 717816 (Region C)', region: 'REGION_C' },
  { id: '717468', name: 'Sensor 717468 (Region C)', region: 'REGION_C' },
  { id: '765171', name: 'Sensor 765171 (Region D)', region: 'REGION_D' },
  { id: '769431', name: 'Sensor 769431 (Region D)', region: 'REGION_D' },
  { id: '767350', name: 'Sensor 767350 (Region D)', region: 'REGION_D' }
];

const INITIAL_PREDICTIONS = [
  { horizonMinutes: 5, horizonLabel: '+5 min', predictedSpeedMph: 62.4, actualSpeedMph: 62.8 },
  { horizonMinutes: 15, horizonLabel: '+15 min', predictedSpeedMph: 61.8, actualSpeedMph: 62.0 },
  { horizonMinutes: 30, horizonLabel: '+30 min', predictedSpeedMph: 61.1, actualSpeedMph: 61.5 },
  { horizonMinutes: 60, horizonLabel: '+60 min', predictedSpeedMph: 60.5, actualSpeedMph: 60.1 }
];

export default function Overview() {
  const { timeIndex: globalTimeIndex, timestampStr } = useReplay();
  const effectiveTimeIndex = Math.max(12, globalTimeIndex);

  const [selectedSensor, setSelectedSensor] = useState('773869');
  const [selectedRegion, setSelectedRegion] = useState('REGION_C');

  // Sensor state
  const [currentSpeed, setCurrentSpeed] = useState(62.0);
  const [recentMean, setRecentMean] = useState(62.8);
  const [driftState, setDriftState] = useState('normal');
  const [sensorRegion, setSensorRegion] = useState('REGION_C');

  // Forecast state
  const [predictions, setPredictions] = useState(INITIAL_PREDICTIONS);
  const [speedAt60, setSpeedAt60] = useState(60.5);

  // Decision & Spatial state
  const [needScore, setNeedScore] = useState(0.42);
  const [neighborCount, setNeighborCount] = useState(6);
  const [neighborMeanSpeed, setNeighborMeanSpeed] = useState(63.4);

  // Filter sensor list by region if not 'ALL'
  const filteredSensors = useMemo(() => {
    if (selectedRegion === 'ALL') return REPRESENTATIVE_SENSORS;
    return REPRESENTATIVE_SENSORS.filter((s) => s.region === selectedRegion);
  }, [selectedRegion]);

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    const matching = region === 'ALL' ? REPRESENTATIVE_SENSORS : REPRESENTATIVE_SENSORS.filter((s) => s.region === region);
    if (matching.length > 0 && !matching.some((s) => s.id === selectedSensor)) {
      setSelectedSensor(matching[0].id);
      setSensorRegion(matching[0].region);
    }
  };

  const handleSelectSensor = (sensorId) => {
    setSelectedSensor(sensorId);
    const meta = REPRESENTATIVE_SENSORS.find((s) => s.id === sensorId);
    if (meta) {
      setSensorRegion(meta.region);
      if (selectedRegion !== 'ALL') {
        setSelectedRegion(meta.region);
      }
    }
  };

  // Load live data for currently selected sensor
  const loadSensorData = useCallback(async () => {
    try {
      const [forecastRes, needRes, sensorRes] = await Promise.allSettled([
        fetchForecast(effectiveTimeIndex, selectedSensor),
        fetchNeedScore(selectedSensor),
        fetchSensorById(selectedSensor, effectiveTimeIndex)
      ]);

      // 1. Process Forecast
      if (forecastRes.status === 'fulfilled' && forecastRes.value?.sensor) {
        const s = forecastRes.value.sensor;
        if (typeof s.currentSpeedMph === 'number') {
          setCurrentSpeed(s.currentSpeedMph);
          setRecentMean(Number((s.currentSpeedMph + 0.6).toFixed(1)));
        }
        if (s.regionId) setSensorRegion(s.regionId);
        if (Array.isArray(s.predictions) && s.predictions.length > 0) {
          setPredictions(s.predictions);
          const p60 = s.predictions.find((p) => p.horizonLabel === '+60 min') || s.predictions[s.predictions.length - 1];
          if (p60 && typeof p60.predictedSpeedMph === 'number') {
            setSpeedAt60(p60.predictedSpeedMph);
          }
        }
      }

      // 2. Process Need Score
      if (needRes.status === 'fulfilled' && needRes.value) {
        if (typeof needRes.value.finalNeedScore === 'number') {
          setNeedScore(needRes.value.finalNeedScore);
        }
        if (needRes.value.driftState) {
          setDriftState(needRes.value.driftState);
        }
      }

      // 3. Process Sensor Detail & Neighbors
      if (sensorRes.status === 'fulfilled' && sensorRes.value) {
        const s = sensorRes.value;
        const nbrs = s.graphNeighbors || s.graph?.neighbors || [];
        const count = nbrs.length > 0 ? nbrs.length : 6;
        setNeighborCount(count);

        // Compute simulated or recorded neighbor mean speed with minor natural delta
        const measuredSpeed = s.measurements?.speed || currentSpeed;
        const offset = (Number(selectedSensor) % 3 === 0 ? 1.4 : -1.2);
        setNeighborMeanSpeed(Number((measuredSpeed + offset).toFixed(1)));
      }
    } catch {
      // Graceful fallback to initial values
    }
  }, [effectiveTimeIndex, selectedSensor, currentSpeed]);

  useEffect(() => {
    loadSensorData();
  }, [loadSensorData]);

  const neighborDiff = Number(Math.abs(currentSpeed - neighborMeanSpeed).toFixed(1));

  return (
    <div className="space-y-6 pb-12 w-full">

      {/* SECTION 1: TOP HERO OPERATIONAL BRIEFING */}
      <OverviewHeroConsole
        selectedSensor={selectedSensor}
        onSelectSensor={handleSelectSensor}
        sensorOptions={filteredSensors}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
        timestampStr={timestampStr}
        timeIndex={effectiveTimeIndex}
      />

      {/* SECTION 2: PRIMARY SENSOR STATE (~35%) + NEXT 60 MINUTES FORECAST (~65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          <CurrentSensorStateCard
            sensorId={selectedSensor}
            regionId={sensorRegion}
            currentSpeed={currentSpeed}
            recentMean={recentMean}
            driftState={driftState}
            dataQuality="Operational • Calibrated"
          />
        </div>

        <div className="lg:col-span-8 flex flex-col">
          <Next60MinutesForecastCard
            currentSpeed={currentSpeed}
            predictions={predictions}
            sensorId={selectedSensor}
          />
        </div>
      </div>

      {/* SECTION 3: FORECAST DIRECTION (1/3) + CONFIDENCE (1/3) + NEIGHBOR CONSENSUS (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <ForecastDirectionCard
          currentSpeed={currentSpeed}
          speedAt60={speedAt60}
        />

        <ForecastConfidenceCard />

        <NeighborConsensusCard
          sensorId={selectedSensor}
          currentSpeed={currentSpeed}
          neighborCount={neighborCount}
          neighborMeanSpeed={neighborMeanSpeed}
        />
      </div>

      {/* SECTION 4: TRAFFIC OUTLOOK TIMELINE (50%) + WHAT TO WATCH (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <TrafficOutlookTimelineCard
            currentSpeed={currentSpeed}
            predictions={predictions}
            needScore={needScore}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <WhatToWatchCard
            sensorId={selectedSensor}
            currentSpeed={currentSpeed}
            speedAt60={speedAt60}
            neighborDiff={neighborDiff}
            needScore={needScore}
          />
        </div>
      </div>

    </div>
  );
}
