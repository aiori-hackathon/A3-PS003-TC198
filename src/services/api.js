// TrafficPulse-X API Service (Centralized Real-Data Backend Gateway)

// Deterministic API URL normalization:
// Accepts https://backend.onrender.com or https://backend.onrender.com/api with or without trailing slashes.
// Preserves localhost development fallback (http://127.0.0.1:8000).
const rawEnvUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ? import.meta.env.VITE_API_URL : "";
const rawUrl = (typeof rawEnvUrl === 'string' && rawEnvUrl.trim()) ? rawEnvUrl.trim() : "http://127.0.0.1:8000";
const sanitizedUrl = rawUrl.replace(/\/+$/, "");
const API_BASE = sanitizedUrl.endsWith("/api") ? sanitizedUrl : `${sanitizedUrl}/api`;

// 60-second timeout to accommodate Render free tier cold-starts without premature client aborts
const TIMEOUT_MS = 60000;

const factorNames = {
  spatialInfluence: "Spatial Influence",
  uncertaintyProxy: "Prediction Uncertainty",
  spatialSpeedDisagreement: "Spatial Speed Disagreement",
  trafficDrift: "Speed Drift",
  freshness: "Freshness Need",
  informationDebt: "Information Debt",
  coverageNeed: "Coverage Need",
  sensorHealth: "Data Quality",
  redundancyPenalty: "Redundancy Penalty"
};

/**
 * Centralized fetch wrapper with robust timeout error handling, signal preservation, and cold-start tolerance.
 */
async function apiFetch(url, options = {}) {
  const timeoutMs = options.timeout || TIMEOUT_MS;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  let signal = timeoutSignal;
  if (options.signal) {
    if (typeof AbortSignal.any === 'function') {
      signal = AbortSignal.any([options.signal, timeoutSignal]);
    } else {
      const controller = new AbortController();
      const onAbort = () => controller.abort(options.signal.reason);
      const onTimeout = () => controller.abort(timeoutSignal.reason);
      options.signal.addEventListener('abort', onAbort, { once: true });
      timeoutSignal.addEventListener('abort', onTimeout, { once: true });
      signal = controller.signal;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      signal
    });
    return res;
  } catch (err) {
    // If aborted specifically by timeout signal, or timed out
    if (timeoutSignal.aborted || err.name === 'TimeoutError' || err.message?.includes('timed out')) {
      const timeoutErr = new Error(`Connection timed out (${timeoutMs / 1000}s)`);
      timeoutErr.name = 'TimeoutError';
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    throw err;
  }
}

export async function fetchHealth() {
  const res = await apiFetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Backend Health Check Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchDashboard(timeIndex = 0) {
  const url = `${API_BASE}/dashboard?time_index=${timeIndex}`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Dashboard Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchSensors(timeIndex = 0) {
  const url = `${API_BASE}/sensors?time_index=${timeIndex}`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Sensors Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchSensorById(sensorId, timeIndex = 0) {
  const url = `${API_BASE}/sensors/${sensorId}?time_index=${timeIndex}`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Sensor Fetch Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchNetworkTopology() {
  const url = `${API_BASE}/network`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Network Topology Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchSpatialSpeedConsistency(fromId = "767620", toId = "767471") {
  const res = await apiFetch(`${API_BASE}/network/spatial-consistency?from_id=${fromId}&to_id=${toId}`);
  if (!res.ok) throw new Error(`Spatial Speed Consistency Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchFlowConservation(fromId = "767620", toId = "767471") {
  // Alias for backward compatibility
  return fetchSpatialSpeedConsistency(fromId, toId);
}

export async function fetchEvents() {
  const res = await apiFetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error(`Events Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

// -------------------------------------------------------------
// Decision Intelligence Endpoints
// -------------------------------------------------------------

export async function fetchNeedScore(sensorId = "767620") {
  const res = await apiFetch(`${API_BASE}/decision/sensors/${sensorId}/need-score`);
  if (!res.ok) throw new Error(`Need Score Fetch Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  const data = await res.json();

  const factorWeights = {
    spatialInfluence: 0.15,
    uncertaintyProxy: 0.20,
    spatialSpeedDisagreement: 0.20,
    trafficDrift: 0.15,
    freshness: 0.10,
    informationDebt: 0.10,
    coverageNeed: 0.10,
    sensorHealth: 0.05,
    redundancyPenalty: 0.05
  };

  let factorsList = [];
  if (data.factors && typeof data.factors === 'object' && !Array.isArray(data.factors)) {
    factorsList = Object.entries(data.factors)
      .filter(([k]) => factorWeights[k] !== undefined)
      .map(([k, val]) => {
      const isNeg = k === 'redundancyPenalty';
      const numVal = typeof val === 'number' ? val : (parseFloat(val) || 0);
      const coeff = factorWeights[k] || 0.10;
      const weightedVal = isNeg ? -Math.abs(numVal * coeff) : numVal * coeff;
      return {
        key: k,
        name: factorNames[k] || k,
        value: numVal,
        coefficient: coeff,
        weightedContribution: weightedVal,
        weight: isNeg ? `-${Math.abs(weightedVal).toFixed(2)}` : `+${weightedVal.toFixed(2)}`,
        isNegative: isNeg
      };
    });
  } else if (Array.isArray(data.factors)) {
    factorsList = data.factors;
  }

  return {
    sensorId: data.sensorId || sensorId,
    needScore: data.needScore,
    finalNeedScore: data.needScore,
    reasons: data.reasons || [],
    driftState: data.driftState || "normal",
    confidenceLevel: data.confidenceLevel || "MEDIUM",
    residualUncertaintyMph: data.residualUncertaintyMph,
    factors: factorsList,
    rawFactors: data.factors
  };
}

export async function fetchQueryCandidates() {
  const res = await apiFetch(`${API_BASE}/decision/query-candidates`);
  if (!res.ok) throw new Error(`Query Candidates Fetch Failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.candidates || []);
}

export async function fetchCounterfactual(sensorId = "767620") {
  const res = await apiFetch(`${API_BASE}/decision/counterfactual/${sensorId}`);
  if (!res.ok) throw new Error(`Counterfactual Fetch Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchBlindSpots() {
  const res = await apiFetch(`${API_BASE}/decision/blind-spots`);
  if (!res.ok) throw new Error(`Blind Spots Fetch Failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return {
    coveragePercent: data.overallCoveragePercent || 75,
    coveredRoads: data.coveredRoads || 155,
    uncoveredRoads: data.uncoveredRoads || 52,
    blindSpots: data.blindSpots ? data.blindSpots.length : 0,
    blindSpotItems: data.blindSpots || [],
    sectorSummaries: data.sectorSummaries || []
  };
}

export async function fetchEvidenceChain(sensorId = "767620") {
  const res = await apiFetch(`${API_BASE}/decision/evidence/${sensorId}`);
  if (!res.ok) throw new Error(`Evidence Chain Fetch Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function executeQuery(sensorId) {
  const res = await apiFetch(`${API_BASE}/query/${sensorId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Query Execution Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function sendHeartbeat(sensorId, telemetry = {}) {
  const res = await apiFetch(`${API_BASE}/sensors/${sensorId}/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(telemetry),
  });
  if (!res.ok) throw new Error(`Heartbeat Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchCoverageCertificate(regionId = "REGION_A") {
  const res = await apiFetch(`${API_BASE}/decision/certificate/${regionId}`);
  if (!res.ok) throw new Error(`Coverage Certificate Fetch Failed for '${regionId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchSensorJury(sensorId = "767620", timeIndex = 0) {
  const res = await apiFetch(`${API_BASE}/decision/jury/${sensorId}?time_index=${timeIndex}`);
  if (!res.ok) throw new Error(`Sensor Jury Fetch Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchPhysicsGate(sensorId = "767620", timeIndex = 0) {
  const res = await apiFetch(`${API_BASE}/decision/physics-gate/${sensorId}?time_index=${timeIndex}`);
  if (!res.ok) throw new Error(`Physics Gate Fetch Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchMinimumEvidenceSet(regionId = "REGION_A", timeIndex = 0) {
  const res = await apiFetch(`${API_BASE}/decision/minimum-evidence/${regionId}?time_index=${timeIndex}`);
  if (!res.ok) throw new Error(`Minimum Evidence Set Fetch Failed for '${regionId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

// -------------------------------------------------------------
// METR-LA Benchmark Dataset Endpoints
// -------------------------------------------------------------

export async function fetchMetrStatus() {
  const res = await apiFetch(`${API_BASE}/datasets/status`);
  if (!res.ok) throw new Error(`Dataset Status Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchMetrRegions() {
  const res = await apiFetch(`${API_BASE}/datasets/metr-la/regions`);
  if (!res.ok) throw new Error(`Regions Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchMetrRepresentatives() {
  const res = await apiFetch(`${API_BASE}/datasets/metr-la/representatives`);
  if (!res.ok) throw new Error(`Representatives Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchMetrSnapshot(timeIndex = 0, regionId = "ALL", repsOnly = true) {
  const url = `${API_BASE}/datasets/metr-la/snapshot?time_index=${timeIndex}&region_id=${regionId}&representatives_only=${repsOnly}`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`Snapshot Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchMetrSensor(sensorId, timeIndex = 0) {
  const res = await apiFetch(`${API_BASE}/datasets/metr-la/sensors/${sensorId}?time_index=${timeIndex}`);
  if (!res.ok) throw new Error(`METR Sensor Fetch Failed for '${sensorId}': ${res.status} ${res.statusText}`);
  return await res.json();
}

// -------------------------------------------------------------
// Prediction Intelligence API Methods (Stage 6.7)
// -------------------------------------------------------------

export async function fetchPredictionStatus() {
  const res = await apiFetch(`${API_BASE}/prediction/status`);
  if (!res.ok) throw new Error(`Prediction Status Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchForecast(timeIndex = 12, sensorId = null, regionId = null) {
  let url = `${API_BASE}/prediction/forecast?time_index=${timeIndex}`;
  if (sensorId) url += `&sensor_id=${encodeURIComponent(sensorId)}`;
  if (regionId) url += `&region_id=${encodeURIComponent(regionId)}`;

  const res = await apiFetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const detail = errData.detail || `Prediction Forecast Failed: ${res.status} ${res.statusText}`;
    throw new Error(detail);
  }
  return await res.json();
}

export async function fetchPredictionMetrics() {
  const res = await apiFetch(`${API_BASE}/prediction/metrics`);
  if (!res.ok) throw new Error(`Prediction Metrics Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchPredictionModels() {
  const res = await apiFetch(`${API_BASE}/prediction/models`);
  if (!res.ok) throw new Error(`Prediction Models Table Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

// -------------------------------------------------------------
// Stage 8.3 Federated Learning API Gateway Functions
// -------------------------------------------------------------

export async function fetchFederatedStatus() {
  const res = await apiFetch(`${API_BASE}/federated/status`);
  if (!res.ok) throw new Error(`Federated Status Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchFederatedClients() {
  const res = await apiFetch(`${API_BASE}/federated/clients`);
  if (!res.ok) throw new Error(`Federated Clients Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchFederatedRounds() {
  const res = await apiFetch(`${API_BASE}/federated/rounds`);
  if (!res.ok) throw new Error(`Federated Rounds Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchFederatedMetrics() {
  const res = await apiFetch(`${API_BASE}/federated/metrics`);
  if (!res.ok) throw new Error(`Federated Metrics Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchFederatedCommunication() {
  const res = await apiFetch(`${API_BASE}/federated/communication`);
  if (!res.ok) throw new Error(`Federated Communication Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

// -------------------------------------------------------------
// Phase 9.1 Communication Intelligence Foundation Endpoints
// -------------------------------------------------------------

export async function fetchPhase9Status() {
  const res = await apiFetch(`${API_BASE}/communication/phase9/status`);
  if (!res.ok) throw new Error(`Phase 9 Status Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchPhase9Selection(budget = "3/4") {
  const res = await apiFetch(`${API_BASE}/communication/phase9/select?budget=${encodeURIComponent(budget)}`);
  if (!res.ok) throw new Error(`Phase 9 Selection Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchPhase9ClientValues() {
  const res = await apiFetch(`${API_BASE}/communication/phase9/client-values`);
  if (!res.ok) throw new Error(`Phase 9 Client Values Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

// -------------------------------------------------------------
// Phase 9.2 Controlled Selective FL Experiment Endpoints
// -------------------------------------------------------------

export async function fetchPhase9Experiments() {
  const res = await apiFetch(`${API_BASE}/communication/phase9/experiments`);
  if (!res.ok) throw new Error(`Phase 9 Experiments Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchPhase9Policy(policy) {
  const res = await apiFetch(`${API_BASE}/communication/phase9/experiments/${encodeURIComponent(policy)}`);
  if (!res.ok) throw new Error(`Phase 9 Policy Details Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchPhase9Tradeoff() {
  const res = await apiFetch(`${API_BASE}/communication/phase9/tradeoff`);
  if (!res.ok) throw new Error(`Phase 9 Tradeoff Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchPhase9Rounds(policy) {
  const res = await apiFetch(`${API_BASE}/communication/phase9/rounds/${encodeURIComponent(policy)}`);
  if (!res.ok) throw new Error(`Phase 9 Rounds History Fetch Failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

// Aliases matching getFederated* naming requirement
export const getFederatedStatus = fetchFederatedStatus;
export const getFederatedClients = fetchFederatedClients;
export const getFederatedRounds = fetchFederatedRounds;
export const getFederatedMetrics = fetchFederatedMetrics;
export const getFederatedCommunication = fetchFederatedCommunication;

export async function sendAssistantMessage(message, history = []) {
  const res = await apiFetch(`${API_BASE}/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });
  if (!res.ok) throw new Error(`Assistant Service Error: ${res.status} ${res.statusText}`);
  return await res.json();
}

// 3-Seed Extension & IID vs Non-IID Experiment Endpoints
export async function fetchExperimentStatus() {
  const res = await apiFetch(`${API_BASE}/experiments/status`);
  if (!res.ok) throw new Error(`Experiment Status Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchDistributionComparison() {
  const res = await apiFetch(`${API_BASE}/experiments/distribution-comparison`);
  if (!res.ok) throw new Error(`Distribution Comparison Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchSeedSummary() {
  const res = await apiFetch(`${API_BASE}/experiments/seed-summary`);
  if (!res.ok) throw new Error(`Seed Summary Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchExperimentConvergence() {
  const res = await apiFetch(`${API_BASE}/experiments/convergence`);
  if (!res.ok) throw new Error(`Experiment Convergence Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchIIDPartitions() {
  const res = await apiFetch(`${API_BASE}/experiments/iid-partitions`);
  if (!res.ok) throw new Error(`IID Partitions Fetch Failed: ${res.status}`);
  return await res.json();
}

// Differential Privacy & Secure Aggregation Experiment Endpoints
export async function fetchPrivacyStatus() {
  const res = await apiFetch(`${API_BASE}/experiments/privacy/status`);
  if (!res.ok) throw new Error(`Privacy Status Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchPrivacyResults() {
  const res = await apiFetch(`${API_BASE}/experiments/privacy/results`);
  if (!res.ok) throw new Error(`Privacy Results Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchSecureAggregationSimulation() {
  const res = await apiFetch(`${API_BASE}/experiments/privacy/secure-aggregation`);
  if (!res.ok) throw new Error(`Secure Aggregation Fetch Failed: ${res.status}`);
  return await res.json();
}

// -------------------------------------------------------------
// PeMS08 Traffic Flow Dataset Extension Endpoints
// -------------------------------------------------------------

export async function fetchFlowStatus() {
  const res = await apiFetch(`${API_BASE}/experiments/flow/status`);
  if (!res.ok) throw new Error(`Flow Status Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchFlowMetadata() {
  const res = await apiFetch(`${API_BASE}/experiments/flow/metadata`);
  if (!res.ok) throw new Error(`Flow Metadata Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchFlowResults() {
  const res = await apiFetch(`${API_BASE}/experiments/flow/results`);
  if (!res.ok) throw new Error(`Flow Results Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchFlowSensors() {
  const res = await apiFetch(`${API_BASE}/experiments/flow/sensors`);
  if (!res.ok) throw new Error(`Flow Sensors Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchFlowForecast(timeIndex = 100, sensorId = "PEMS08_009") {
  const res = await apiFetch(`${API_BASE}/experiments/flow/forecast?step=${timeIndex}&sensorId=${sensorId}`);
  if (!res.ok) throw new Error(`Flow Forecast Fetch Failed: ${res.status}`);
  return await res.json();
}

// -------------------------------------------------------------
// Controlled Network-Byte Accounting Endpoints
// -------------------------------------------------------------

export async function fetchNetworkAccountingStatus() {
  const res = await apiFetch(`${API_BASE}/experiments/network-accounting/status`);
  if (!res.ok) throw new Error(`Network Accounting Status Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchNetworkAccountingReport() {
  const res = await apiFetch(`${API_BASE}/experiments/network-accounting`);
  if (!res.ok) throw new Error(`Network Accounting Report Fetch Failed: ${res.status}`);
  return await res.json();
}

// -------------------------------------------------------------
// Streaming Adapter Endpoints (Historical Replay + Live Adapter)
// -------------------------------------------------------------

export async function fetchStreamingStatus() {
  const res = await apiFetch(`${API_BASE}/streaming/status`);
  if (!res.ok) throw new Error(`Streaming Status Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function fetchStreamingConfig() {
  const res = await apiFetch(`${API_BASE}/streaming/config`);
  if (!res.ok) throw new Error(`Streaming Config Fetch Failed: ${res.status}`);
  return await res.json();
}

export async function setStreamingProvider(provider) {
  const res = await apiFetch(`${API_BASE}/streaming/provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail?.error || errData.detail || `Provider switch failed (${res.status})`);
  }
  return await res.json();
}

export async function fetchStreamingSnapshot(timeIndex = 0, regionId = "ALL", provider = null) {
  let url = `${API_BASE}/streaming/snapshot?time_index=${timeIndex}&region_id=${regionId}`;
  if (provider) url += `&provider=${encodeURIComponent(provider)}`;
  const res = await apiFetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Streaming Snapshot Fetch Failed: ${res.status}`);
  }
  return await res.json();
}
