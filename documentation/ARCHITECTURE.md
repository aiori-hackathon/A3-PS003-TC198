# TrafficPulse-X System Architecture

## System Overview

TrafficPulse-X is a federated spatio-temporal traffic speed forecasting and communication-cost evaluation platform. It integrates Chebyshev spectral graph convolutions and recurrent neural networks (`SpatialGraphLSTM`), a 9-factor active decision intelligence engine (Need Score, Physics Plausibility Gate, Sensor Jury), and a 4-region decentralized federated learning framework (`FedAvg`) evaluated against selective client participation policies.

```
+---------------------------------------------------------------------------------------+
|                                    DATASETS                                           |
|     METR-LA: 207 Sensors | 34,272 Timestamps | Speed (mph) | Historical Replay        |
|     PeMS08 (Optional Ext): 170 Sensors | 17,856 Timestamps | Flow (veh/5min)         |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                              FASTAPI BACKEND SERVICES                                 |
|  +------------------------+  +------------------------+  +-------------------------+  |
|  | DataSourceManager      |  | PredictionService      |  | FederatedService        |  |
|  | (Replay / Streaming)   |  | (Spatial Graph+LSTM)   |  | (FedAvg / 4 Partitions) |  |
|  +------------------------+  +------------------------+  +-------------------------+  |
|  +------------------------+  +------------------------+  +-------------------------+  |
|  | Decision Intelligence  |  | CommIntelligenceService|  | Experiments Router      |  |
|  | (Need Score, Jury)     |  | (CCV Policies, Bytes)  |  | (3-Seed, DP, PeMS08)    |  |
|  +------------------------+  +------------------------+  +-------------------------+  |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                           CENTRALIZED API CLIENT GATEWAY                              |
|          src/services/api.js (Single Source of Truth, 10s AbortSignal Timeout)        |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                REACT 19 FRONTEND                                      |
|   /overview   /network   /predictions   /decision   /federated   /communication   /alerts |
+---------------------------------------------------------------------------------------+
```

---

## 1. Machine Learning Pipeline

### Model Architecture (`ml/spatiotemporal/model.py`)
The primary model is `SpatialGraphLSTM`, consisting of:
1. **Spatial Graph Convolution Layer (`SpatialGCN`)**:
   - Chebyshev-normalized graph operator:
     $$\tilde{A} = A + I_{207}, \quad A_{norm} = \tilde{D}^{-1/2} \tilde{A} \tilde{D}^{-1/2}$$
   - Performs spatial feature aggregation across 207 interconnected highway sensors.
2. **Temporal Recurrent Layer**:
   - 2-layer Long Short-Term Memory (`LSTM`) processing 12 sequential 5-minute historical observations (60-minute window).
3. **Multi-Horizon Linear Projection**:
   - Simultaneously outputs forecasts at 4 chronological horizons: +5 min, +15 min, +30 min, and +60 min.
   - Total model parameters: **26,596 float32 weights** (106,384 raw parameter bytes; 110,271 bytes serialized PyTorch state dict).

### Federated Training & Aggregation (`ml/federated/`)
- **Partitions**: 4 Non-IID geographic client sectors (Region A: 48, Region B: 57, Region C: 58, Region D: 44 sensors).
- **Client Training**: Local Adam optimizer ($\eta = 0.001$, batch size 64) trained for 20 batches per communication round.
- **Server Aggregation**: Federated Averaging (`FedAvg`) weighted by regional sample count:
  $$\theta_{global}^{t+1} = \sum_{k=1}^K \frac{n_k}{N} \theta_k^{t+1}$$
- **Model Checkpoint**: Round 8 validation-selected model (`data/processed/metr-la/checkpoints/global_best.pt`, SHA-256: `24710dae...`).

---

## 2. Decision Intelligence Engine

The active sensing layer computes a composite 9-factor **Need Score** ($\in [0.0, 1.0]$) for every sensor at each timestep to prioritize on-demand telemetry queries:
1. **Calibrated Prediction Uncertainty**: Derived from empirical validation residuals.
2. **Spatial Speed Disagreement**: Divergence between sensor reading and topological graph neighbors.
3. **Traffic Drift**: Temporal velocity change over the preceding 15 minutes.
4. **Spatial Influence**: Topological centrality within the road graph.
5. **Freshness**: Elapsed time since the last telemetry acquisition.
6. **Information Debt**: Cumulative uncertainty accumulation during deferred reporting.
7. **Coverage Need**: Regional spatial sparsity compensation.
8. **Data Quality**: Penalty for missing or invalid sensor telemetry.
9. **Redundancy Penalty**: Attenuation applied to clustered, co-located sensors reporting identical speeds.

Auxiliary components include:
- **Sensor Jury**: Multi-neighbor voting consensus to isolate transient sensor faults.
- **Physics Plausibility Gate**: Acceleration and speed boundary validation preventing physically implausible state transitions.

---

## 3. Communication Accounting Architecture

Communication efficiency is evaluated across two distinct measurement methodologies:

### Methodology A: Serialized Application Payload (Authoritative Project Metric)
- Measures exact application-layer bytes exchanged between FL clients and the central aggregation server.
- Each model transfer (upload or download) consists of a 110,271-byte serialized PyTorch state dictionary.
- **Policy 4/4 (Full)**: 104 transfers = 11,468,184 Bytes (11.47 MB).
- **Policy 2/4 (50% Selective CCV Budget)**: 52 transfers = 5,734,092 Bytes (5.73 MB, 50.0% reduction).

### Methodology B: Controlled Network Transfer Bytes — Local Test (Secondary Transport Benchmark)
- Localhost socket wire benchmark intercepting TCP wire bytes and HTTP/1.1 request/response headers.
- Quantifies realistic transport-layer encapsulation overhead (+0.298% overhead on top of application payload).
- *Strict boundary: Local loopback test only; does not model cellular radio networks.*

---

## 4. Streaming Provider Interface & Shared State

### Streaming Provider Abstraction (`backend/data_sources/streaming_adapter.py`)
All real-time and playback telemetry flows through a unified interface:
```python
class IStreamingProvider(ABC):
    @abstractmethod
    def get_snapshot(self, time_index: int, region_id: str) -> Dict[str, Any]: ...
    @abstractmethod
    def is_available(self) -> bool: ...
```
- **`HistoricalReplayProvider` (Default)**: Deterministic replay over 34,272 METR-LA timesteps.
- **`ExternalLiveProvider` (Optional)**: Pluggable adapter for live municipal feeds. If unconfigured, explicitly reports `503 Unavailable / Not Configured` without synthesizing fake data.

### Frontend ReplayContext & State Synchronization (`src/context/ReplayContext.jsx`)
- Single application context managing the global temporal replay clock (`timeIndex`, `playbackSpeed`, `isPlaying`).
- Synchronizes Leaflet map layers, prediction charts, decision rankings, and alert telemetry streams across all 7 views.
- All backend HTTP requests are dispatched through `src/services/api.js` with an automatic 10-second `AbortSignal` timeout.
