# TrafficPulse-X API Specification

The TrafficPulse-X backend is exposed via a unified FastAPI application instance running by default at `http://127.0.0.1:8000`. All routes are versioned and namespaced under `/api/*`.

Interactive OpenAPI documentation is available locally at:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## High-Level Route Namespace Overview

| Namespace Prefix | Primary Domain | Key Responsibilities |
| :--- | :--- | :--- |
| `/api/health` | System Health | Server liveness check and runtime environment info |
| `/api/datasets/*` | Dataset & Telemetry | METR-LA 207-sensor metadata, spatial partitions, snapshots, and replay heartbeats |
| `/api/prediction/*` | Model Inference | Multi-horizon speed forecasts (+5m to +60m), uncertainty bounds, benchmark comparison |
| `/api/decision/*` | Decision Intelligence | 9-factor Need Score, Sensor Jury consensus, Physics Plausibility Gate, ranker |
| `/api/federated/*` | Federated Learning | 4-client FedAvg training metrics, Round 8 convergence history, India municipal case studies |
| `/api/communication/*`| Communication Intelligence | CCV policies, serialized application payload accounting, regional transfer logs |
| `/api/streaming/*` | Streaming Engine | Historical Replay manager, external live stream adapter status and snapshots |
| `/api/experiments/*` | Experimental Extensions | 3-seed reproducibility, IID vs non-IID stats, differential privacy, PeMS08 flow volume, network accounting |
| `/api/assistant/*` | Domain Assistant | Server-side AI assistant engine (local knowledge base with optional Gemini fallback) |

---

## Key Endpoint Schemas & Descriptions

### 1. Dataset & Replay Telemetry (`/api/datasets/*`)

#### `GET /api/datasets/metr-la/summary`
Returns canonical dataset parameters (207 sensors, date range, splits, sample counts).

#### `GET /api/datasets/metr-la/snapshot`
Query Parameters:
- `time_index` (`int`, default: 0): Historical time step index $\in [0, 34271]$.
- `region_id` (`str`, optional): Region filter (`ALL`, `REGION_A`, `REGION_B`, `REGION_C`, `REGION_D`).

Returns: Array of sensor speed observations, validity flags, coordinates, and regional membership.

---

### 2. Multi-Horizon Prediction (`/api/prediction/*`)

#### `GET /api/prediction/forecast`
Query Parameters:
- `sensor_id` (`str`, required): Inductive loop sensor ID (e.g. `773869`).
- `time_index` (`int`, default: 0): Timestep index for input window.

Returns:
```json
{
  "sensorId": "773869",
  "historical12Steps": [62.4, 61.8, 62.1, ...],
  "predictions": {
    "+5 min": 61.52,
    "+15 min": 59.84,
    "+30 min": 56.12,
    "+60 min": 52.41
  },
  "uncertaintyBounds": {
    "+5 min": {"lower": 58.12, "upper": 64.92},
    ...
  }
}
```

---

### 3. Decision Intelligence (`/api/decision/*`)

#### `GET /api/decision/need-score`
Returns the 9-factor Need Score breakdown for all active sensors at the current timestep.

#### `GET /api/decision/next-best-query`
Returns prioritized ranking of high-entropy sensors recommended for telemetry acquisition.

---

### 4. Federated Learning & Selective Communication (`/api/federated/*`, `/api/communication/*`)

#### `GET /api/federated/status`
Returns global FedAvg status, model checkpoint hash, best round (Round 8), and client partition weights.

#### `GET /api/communication/phase9/policies`
Returns the 4 evaluated communication budget tiers (4/4, 3/4, 2/4, 1/4) with exact application-payload byte counts.

---

### 5. Experimental Extensions (`/api/experiments/*`)

#### `GET /api/experiments/status`
Overview of all experimental layers (3-seed evaluation, DP add-on, PeMS08 flow extension, network accounting).

#### `GET /api/experiments/distribution/summary`
Returns the 3-seed statistical comparison between Non-IID (Geographic) and IID (Stratified Random) partitions.

#### `GET /api/experiments/privacy/status`
Returns $(\epsilon, \delta)$-DP evaluation results from the Opacus training experiment.

#### `GET /api/experiments/flow/forecast`
Multi-horizon traffic flow volume forecasting on PeMS08 (`veh/5min`).

#### `GET /api/experiments/network-accounting/report`
Controlled network-byte measurement report quantifying measured wire transfer bytes vs serialized application payload.

---

### 6. Streaming Adapter (`/api/streaming/*`)

#### `GET /api/streaming/status`
Returns active provider state:
- `activeProvider`: `"historical"` (default) or `"external_live"`.
- `historicalReplayAvailable`: `true`.
- `externalLiveAvailable`: `false` (unless external feed configured).
- `message`: Clear explanation that no fabricated data is generated when unconfigured.
