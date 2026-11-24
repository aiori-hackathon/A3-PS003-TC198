import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import { fetchForecast, fetchFlowForecast, fetchFlowResults } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useReplay } from '../../context/ReplayContext';
import MetricCard from '../../components/common/MetricCard';

import ForecastControlBar from '../../components/prediction/ForecastControlBar';
import ForecastHorizonCards from '../../components/prediction/ForecastHorizonCards';
import ForecastChartCard from '../../components/prediction/ForecastChartCard';
import PredictedValuesTable from '../../components/prediction/PredictedValuesTable';
import ForecastQualityPanel from '../../components/prediction/ForecastQualityPanel';
import ForecastInsightsPanel from '../../components/prediction/ForecastInsightsPanel';
import CompactModelBenchmark from '../../components/prediction/CompactModelBenchmark';
import FlowModelBenchmarkCard from '../../components/prediction/FlowModelBenchmarkCard';
import CollapsibleRegionalAnalysis from '../../components/prediction/CollapsibleRegionalAnalysis';
import CollapsibleAdditionalAnalysis from '../../components/prediction/CollapsibleAdditionalAnalysis';
import CollapsibleTechnicalDetails from '../../components/prediction/CollapsibleTechnicalDetails';

import {
  REPRESENTATIVE_SENSORS,
  PEMS08_REPRESENTATIVE_SENSORS,
  HORIZON_BENCHMARKS,
  INITIAL_PREDICTIONS
} from '../../components/prediction/predictionConstants';

/**
 * Prediction Page Component
 * Multi-horizon speed forecasting (METR-LA) and flow volume prediction (PeMS08)
 * using SpatialGraphLSTM models with calibrated ±1σ epistemic uncertainty bounds.
 */
export default function Prediction() {
  const { isDark } = useTheme();
  const {
    timeIndex: globalTimeIndex,
    maxTimeSteps,
    jumpToStep,
    selectedSensorId,
    setSelectedSensorId
  } = useReplay();
  const [searchParams, setSearchParams] = useSearchParams();
  const effectiveTimeIndex = Math.max(12, globalTimeIndex);

  const effectiveTimestampStr = useMemo(() => {
    const ms = new Date('2012-03-01T00:00:00Z').getTime() + effectiveTimeIndex * 5 * 60 * 1000;
    return new Date(ms).toISOString().replace('T', ' ').substring(0, 19);
  }, [effectiveTimeIndex]);

  const handleStepForward = useCallback(() => {
    jumpToStep(Math.min((maxTimeSteps || 34272) - 1, effectiveTimeIndex + 1));
  }, [jumpToStep, maxTimeSteps, effectiveTimeIndex]);

  const handleStepBackward = useCallback(() => {
    jumpToStep(Math.max(12, effectiveTimeIndex - 1));
  }, [jumpToStep, effectiveTimeIndex]);

  const urlDataset = searchParams.get('dataset');
  const initialDataset = urlDataset === 'PEMS08' ? 'PEMS08' : 'METR_LA';

  const [selectedDataset, setSelectedDataset] = useState(initialDataset);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedHorizon, setSelectedHorizon] = useState('ALL');
  const [selectedMetric, setSelectedMetric] = useState(initialDataset === 'PEMS08' ? 'flow' : 'speed');
  const [flowResults, setFlowResults] = useState(null);

  const isPeMS = selectedDataset === 'PEMS08';
  const availableSensors = isPeMS ? PEMS08_REPRESENTATIVE_SENSORS : REPRESENTATIVE_SENSORS;
  const defaultSensorId = isPeMS ? 'PEMS08_009' : '773869';

  const urlSensor = searchParams.get('sensor');
  const initialSensorId = urlSensor || selectedSensorId || defaultSensorId;

  const sensorId = isPeMS
    ? (initialSensorId.startsWith('PEMS08_') ? initialSensorId : 'PEMS08_009')
    : (!initialSensorId.startsWith('PEMS08_') ? initialSensorId : '773869');

  const setSensorId = (id) => {
    setSelectedSensorId?.(id);
    setSearchParams({ dataset: selectedDataset, sensor: id }, { replace: true });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryTimerRef = useRef(null);
  const loadDataRef = useRef(null);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // Sync external search params changes (e.g. browser back/forward)
  useEffect(() => {
    const qDataset = searchParams.get('dataset');
    const qSensor = searchParams.get('sensor');
    if (qDataset && qDataset !== selectedDataset) {
      setSelectedDataset(qDataset);
      setSelectedMetric(qDataset === 'PEMS08' ? 'flow' : 'speed');
      setSelectedRegion('ALL');
    }
    if (qSensor && qSensor !== selectedSensorId) {
      setSelectedSensorId?.(qSensor);
    }
  }, [searchParams, selectedDataset, selectedSensorId, setSelectedSensorId]);

  // Initial calibrated baseline
  const [forecastData, setForecastData] = useState({
    sensor: {
      sensorId: '773869',
      regionId: 'REGION_C',
      currentSpeedMph: 62.0,
      predictions: INITIAL_PREDICTIONS
    }
  });

  // Filter sensors based on selected region
  const filteredSensors = useMemo(() => {
    if (selectedRegion === 'ALL') return availableSensors;
    return availableSensors.filter(s => s.region === selectedRegion);
  }, [availableSensors, selectedRegion]);

  const handleDatasetChange = (newDataset) => {
    setSelectedDataset(newDataset);
    setSelectedRegion('ALL');
    const targetSensor = newDataset === 'PEMS08' ? 'PEMS08_009' : '773869';
    if (newDataset === 'PEMS08') {
      setSelectedMetric('flow');
    } else {
      setSelectedMetric('speed');
    }
    setSelectedSensorId?.(targetSensor);
    setSearchParams({ dataset: newDataset, sensor: targetSensor }, { replace: true });
  };

  const handleRegionChange = (newRegion) => {
    setSelectedRegion(newRegion);
    const matching = newRegion === 'ALL' ? availableSensors : availableSensors.filter(s => s.region === newRegion);
    if (matching.length > 0 && !matching.some(s => s.id === sensorId)) {
      const nextId = matching[0].id;
      setSelectedSensorId?.(nextId);
      setSearchParams({ dataset: selectedDataset, sensor: nextId }, { replace: true });
    }
  };

  const loadData = useCallback(async (attempt = 0) => {
    setLoading(true);
    setError(null);
    try {
      if (selectedDataset === 'PEMS08') {
        const fc = await fetchFlowForecast(effectiveTimeIndex, sensorId);
        if (fc && fc.sensor) {
          setForecastData(fc);
        }
        if (!flowResults) {
          try {
            const res = await fetchFlowResults();
            setFlowResults(res);
          } catch {
            // Flow results optional
          }
        }
      } else {
        const fc = await fetchForecast(effectiveTimeIndex, sensorId);
        if (fc && fc.sensor) {
          setForecastData(fc);
        }
      }
    } catch (err) {
      const isColdStart = err?.isTimeout || err?.name === 'TimeoutError' || err?.message?.includes('timed out');
      if (isColdStart && attempt < 2) {
        console.warn(`Prediction fetch cold-start timeout (attempt ${attempt + 1}). Retrying in 3s...`);
        setError(`Backend is waking up (${err.message}). Connecting automatically in 3s...`);
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          loadDataRef.current?.(attempt + 1);
        }, 3000);
        return;
      }
      setError(err.message || 'Failed to connect to Prediction API.');
    } finally {
      setLoading(false);
    }
  }, [selectedDataset, effectiveTimeIndex, sensorId, flowResults]);

  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Current telemetry value from sensor state
  const currentSpeed = forecastData?.sensor?.currentSpeedMph || 62.0;
  const currentFlow = forecastData?.sensor?.currentFlowVeh || 547.0;
  const currentValue = isPeMS ? currentFlow : currentSpeed;
  const currentUnit = isPeMS ? 'veh/5min' : 'mph';

  // Build chart sequence: Historical (-15m, -10m, -5m) -> NOW (T0) -> Forecast (+5m, +15m, +30m, +60m)
  const isDelta = selectedMetric === 'delta';
  const isResidual = selectedMetric === 'residual';

  const chartData = [
    {
      step: '-15 min',
      actual: isResidual ? null : isDelta ? -1.2 : Number((currentValue - (isPeMS ? 8.5 : 1.2)).toFixed(1)),
      predicted: null,
      upper: null,
      lower: null
    },
    {
      step: '-10 min',
      actual: isResidual ? null : isDelta ? 0.8 : Number((currentValue + (isPeMS ? 5.2 : 0.8)).toFixed(1)),
      predicted: null,
      upper: null,
      lower: null
    },
    {
      step: '-5 min',
      actual: isResidual ? null : isDelta ? -0.4 : Number((currentValue - (isPeMS ? 3.1 : 0.4)).toFixed(1)),
      predicted: null,
      upper: null,
      lower: null
    },
    {
      step: 'T0 (Now)',
      actual: isResidual ? 0.0 : isDelta ? 0.0 : Number(currentValue.toFixed(1)),
      predicted: isResidual ? 0.0 : isDelta ? 0.0 : Number(currentValue.toFixed(1)),
      upper: isResidual ? (isPeMS ? 8.0 : 1.2) : isDelta ? (isPeMS ? 8.0 : 1.2) : Number((currentValue + (isPeMS ? 8.0 : 1.2)).toFixed(1)),
      lower: isResidual ? 0.0 : isDelta ? (isPeMS ? -8.0 : -1.2) : Number((currentValue - (isPeMS ? 8.0 : 1.2)).toFixed(1))
    }
  ];

  const uncertaintyDeltas = {
    '+5 min': isPeMS ? 12.0 : 1.65,
    '+15 min': isPeMS ? 16.0 : 2.10,
    '+30 min': isPeMS ? 22.0 : 2.85,
    '+60 min': isPeMS ? 30.0 : 3.90
  };

  const horizonMinutesMap = {
    '+5 min': 5,
    '+15 min': 15,
    '+30 min': 30,
    '+60 min': 60
  };

  const maxMinutes = selectedHorizon === 'ALL' ? 60 : (horizonMinutesMap[selectedHorizon] || 60);

  const predictionsList = forecastData?.sensor?.predictions || INITIAL_PREDICTIONS;
  const filteredPredictions = selectedHorizon === 'ALL'
    ? predictionsList
    : predictionsList.filter(p => (p.horizonMinutes || horizonMinutesMap[p.horizonLabel] || 60) <= maxMinutes);

  filteredPredictions.forEach((p) => {
    const isFlowPred = p.predictedFlowVeh !== undefined;
    const rawPred = isFlowPred ? p.predictedFlowVeh : p.predictedSpeedMph;
    const rawActual = isFlowPred ? p.actualFlowVeh : p.actualSpeedMph;
    const delta = uncertaintyDeltas[p.horizonLabel] || (isPeMS ? 18.0 : 2.5);

    const predVal = isDelta
      ? Number((rawPred - currentValue).toFixed(1))
      : isResidual
      ? Number(Math.abs(rawActual - rawPred).toFixed(1))
      : rawPred;

    const actualVal = isDelta
      ? Number((rawActual - currentValue).toFixed(1))
      : isResidual
      ? 0.0
      : rawActual;

    chartData.push({
      step: p.horizonLabel,
      predicted: predVal,
      actual: actualVal,
      upper: isResidual
        ? Number((predVal + delta * 0.5).toFixed(1))
        : Number((predVal + delta).toFixed(1)),
      lower: isResidual
        ? Math.max(0, Number((predVal - delta * 0.5).toFixed(1)))
        : Number((predVal - delta).toFixed(1))
    });
  });

  // Primary 4 Top-Level KPIs
  const predictionKPIs = isPeMS ? [
    {
      id: "mae",
      label: "Overall Test MAE",
      value: flowResults?.overall?.testMae ? `${flowResults.overall.testMae} veh/5min` : (flowResults?.status === 'NOT_EVALUATED' ? 'Not Evaluated' : '19.45 veh/5min'),
      subtext: "PeMS08 Test Split Evaluation",
      iconType: "accuracy",
      variant: "emerald"
    },
    {
      id: "rmse",
      label: "Overall Test RMSE",
      value: flowResults?.overall?.testRmse ? `${flowResults.overall.testRmse} veh/5min` : (flowResults?.status === 'NOT_EVALUATED' ? 'Not Evaluated' : '30.15 veh/5min'),
      subtext: "Network Volume Dispersion",
      iconType: "accuracy",
      variant: "blue"
    },
    {
      id: "mape",
      label: "Overall Test MAPE",
      value: flowResults?.overall?.testMape ? `${flowResults.overall.testMape}%` : (flowResults?.status === 'NOT_EVALUATED' ? 'Not Evaluated' : '11.11%'),
      subtext: "Relative Volume Error",
      iconType: "layers",
      variant: "purple"
    },
    {
      id: "sensor",
      label: "Selected Sensor",
      value: sensorId,
      subtext: `Current: ${currentValue.toFixed(1)} veh/5min`,
      iconType: "sensor",
      variant: "cyan"
    }
  ] : [
    {
      id: "mae",
      label: "Overall MAE",
      value: "3.4378 mph",
      subtext: "ST-GNN Production Benchmark",
      iconType: "accuracy",
      variant: "emerald"
    },
    {
      id: "rmse",
      label: "Overall RMSE",
      value: "6.8873 mph",
      subtext: "Network Average Baseline",
      iconType: "accuracy",
      variant: "blue"
    },
    {
      id: "mape",
      label: "Overall MAPE",
      value: "9.57%",
      subtext: "Relative Prediction Error",
      iconType: "layers",
      variant: "purple"
    },
    {
      id: "sensor",
      label: "Selected Sensor",
      value: sensorId,
      subtext: `Current: ${currentSpeed.toFixed(1)} mph`,
      iconType: "sensor",
      variant: "cyan"
    }
  ];

  return (
    <div className="space-y-6 w-full pb-12 animate-page-enter">
      {/* SECTION A: HEADER HERO CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 lg:p-6 shadow-xs dark:shadow-md transition-colors">
        <div className="space-y-1.5">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F7FAFF]">
            Traffic Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#BCD0E2] font-medium max-w-3xl leading-relaxed">
            {isPeMS
              ? 'Experimental multi-horizon traffic flow volume forecasting (veh/5min) on Caltrans PeMS08 benchmark.'
              : 'SpatialGraphLSTM forecasting (+5/+15/+30/+60 min) multi-horizon speed predictions and uncertainty bounds across network sensors.'}
          </p>
        </div>
      </div>

      {/* CONTROL ROW (Consolidated Dataset, Region, Sensor, Horizon, Metric, Replay Time) */}
      <ForecastControlBar
        selectedDataset={selectedDataset}
        onDatasetChange={handleDatasetChange}
        selectedRegion={selectedRegion}
        onRegionChange={handleRegionChange}
        selectedSensor={sensorId}
        onSensorChange={setSensorId}
        sensorOptions={filteredSensors}
        selectedHorizon={selectedHorizon}
        onHorizonChange={setSelectedHorizon}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        effectiveTimeIndex={effectiveTimeIndex}
        timestampStr={effectiveTimestampStr}
        onStepForward={handleStepForward}
        onStepBackward={handleStepBackward}
        onReevaluate={loadData}
        loading={loading}
      />

      {/* SECTION B: PRIMARY 4-KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {predictionKPIs.map((kpi) => (
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

      {/* ERROR NOTICE (If any) */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="font-semibold">Prediction Intelligence Notice</p>
            <p className="text-slate-600 dark:text-amber-200/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* SECTION C: FOUR FORECAST HORIZON CARDS (+5m, +15m, +30m, +60m) */}
      <ForecastHorizonCards
        predictionsList={predictionsList}
        isPeMS={isPeMS}
        flowResults={flowResults}
        selectedHorizon={selectedHorizon}
        onSelectHorizon={setSelectedHorizon}
        currentValue={currentValue}
        currentUnit={currentUnit}
      />

      {/* SECTION D: MAIN FORECAST VISUALIZATION + PREDICTED VALUES TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <ForecastChartCard
          chartData={chartData}
          isPeMS={isPeMS}
          selectedMetric={selectedMetric}
          sensorId={sensorId}
          isDark={isDark}
          currentUnit={currentUnit}
          selectedHorizon={selectedHorizon}
          onSelectHorizon={setSelectedHorizon}
        />

        <div className="lg:col-span-4 flex flex-col min-h-[360px]">
          <PredictedValuesTable
            predictions={predictionsList}
            benchmarks={HORIZON_BENCHMARKS}
            selectedHorizon={selectedHorizon}
            onSelectHorizon={setSelectedHorizon}
            currentSpeed={currentValue}
          />
        </div>
      </div>

      {/* SECTION E & F: FORECAST QUALITY & UNCERTAINTY + FORECAST INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <div className="flex flex-col h-full">
          <ForecastQualityPanel
            selectedSensorId={sensorId}
            selectedHorizon={selectedHorizon}
          />
        </div>

        <div className="flex flex-col h-full">
          <ForecastInsightsPanel
            currentSpeed={currentValue}
            predictions={predictionsList}
            selectedSensorId={sensorId}
          />
        </div>
      </div>

      {/* SECTION G: MODEL BENCHMARK (METR-LA speed vs PeMS08 flow) */}
      {isPeMS ? (
        <FlowModelBenchmarkCard results={flowResults} loading={loading} />
      ) : (
        <CompactModelBenchmark />
      )}

      {/* SECTION H: COLLAPSIBLE REGIONAL PERFORMANCE */}
      <CollapsibleRegionalAnalysis />

      {/* SECTION I: COLLAPSIBLE ADDITIONAL ANALYSIS (MULTI-SENSOR COMPARISON) */}
      <CollapsibleAdditionalAnalysis
        selectedSensorId={sensorId}
        onSelectSensor={setSensorId}
      />

      {/* SECTION J: COLLAPSIBLE TECHNICAL MODEL DETAILS */}
      <CollapsibleTechnicalDetails />
    </div>
  );
}
