# PeMS08 Traffic Flow Dataset Extension Specification

## 1. Executive Summary & Preservation Invariant
TrafficPulse-X incorporates **PeMS08** as an optional, isolated experimental traffic flow dataset extension.
- **METR-LA remains the primary project dataset** for historical freeway speed forecasting (mph).
- **METR-LA speed is never relabeled as vehicle flow.**
- PeMS08 introduces true, empirical **traffic flow volume telemetry** (`veh/5min`) through a verified public benchmark.
- All scalers, checkpoints, APIs, and pages for METR-LA remain 100% frozen and unmodified.

---

## 2. Dataset Provenance & Source
- **Dataset Name**: PeMS08 (Caltrans Performance Measurement System District 8 - San Bernardino, CA)
- **Authoritative Source**: California Department of Transportation (Caltrans) PeMS
- **Benchmark Provenance**: Established in AAAI 2019 by Guo et al. (*Attention Based Spatial-Temporal Graph Convolutional Networks for Traffic Flow Forecasting*, ASTGCN); curated in the PyTorch Spatiotemporal (`tsl`) benchmark repository:
  `https://huggingface.co/datasets/TorchSpatiotemporal/ProcessedDatasets/resolve/main/traffic/pems08.zip`
- **License / Terms of Use**: Caltrans Open Data Policy / Public Domain for Academic Research (CC BY 4.0 / Public Research Use)
- **Raw Storage Location**: `data/raw/pems08/`
- **Cryptographic Verification**:
  - `pems08.zip` (18,277,942 bytes): SHA-256 `c137a96b8542050dab929470c311d8bae4f462981e6e569bf592f629695c9a88`
  - `pems08.npz` (18,525,419 bytes): SHA-256 `e1d03ce74e9fb79149e6e7c37c680214822c4a285baa2f42278cacabcd25c075`
  - `distance.csv` (4,032 bytes): SHA-256 `859d68e7583ed4e6016588eaaca494d3ece286dae361614c5c1833017f87eaa7`

---

## 3. Schema & Physical Units
The raw telemetry array `data/raw/pems08/pems08.npz` contains shape `(17856, 170, 3)`:

| Dimension / Channel | Description | Physical Unit | Range & Distribution |
| :--- | :--- | :--- | :--- |
| **Timesteps ($T$)** | 17,856 consecutive 5-min intervals | July 1, 2016 00:00 to August 31, 2016 23:55 (62 days) | 5-minute sampling rate |
| **Sensors ($N$)** | 170 loop detector stations | San Bernardino freeway network (I-10, I-15, SR-60, I-215) | Fixed station IDs |
| **Channel 0 (`flow`)** | Aggregated vehicle volume | **`veh/5min`** | Min: 0.0, Max: 1,147.0, Mean: 230.68 |
| **Channel 1 (`occupancy`)** | Loop detector occupancy ratio | Ratio $\in [0.0, 1.0]$ | Min: 0.0, Max: 0.8955, Mean: 0.0651 |
| **Channel 2 (`speed`)** | Average vehicle velocity | **`mph`** | Min: 3.0, Max: 82.3, Mean: 63.76 |

---

## 4. Chronological Splits & Train-Only Preprocessing

To prevent look-ahead bias and data leakage, chronological ordering is strictly preserved:

1. **Chronological Splits**:
   - **Train**: Steps `0` to `12,499` (12,500 timesteps, **70.0%**)
   - **Validation**: Steps `12,500` to `14,284` (1,785 timesteps, **10.0%**)
   - **Test**: Steps `14,285` to `17,855` (3,572 timesteps, **20.0%**)

2. **Z-Score Normalization**:
   - Scaler fitted **strictly on the Train split only**:
     $$\mu_{\text{train}} = 230.2189 \text{ veh/5min}, \quad \sigma_{\text{train}} = 145.8735 \text{ veh/5min}$$
   - Saved exclusively to `data/processed/pems08/scaler.json`.
   - Never touches or modifies `data/processed/metr-la/scaler.json`.

3. **Graph Topology Construction**:
   - Road network distance matrix in `distance.csv` contains 295 physical freeway adjacency links.
   - Gaussian threshold kernel applied ($\sigma = 216.7\text{ m}$):
     $$A_{u, v} = \exp\left(-\left(\frac{\text{cost}_{u, v}}{\sigma}\right)^2\right)$$
   - Symmetric normalized graph Laplacian computed with self-loops:
     $$\tilde{A}_{\text{norm}} = \tilde{D}^{-1/2}(A + I_{170})\tilde{D}^{-1/2}$$
   - Persisted to `data/processed/pems08/adj_pems08.npy`.

---

## 5. Flow Forecasting Experimental Model & Empirical Results

The model architecture reuses the scientifically compatible `SpatialGraphLSTM` (2-layer Spatial GCN + 1-layer LSTM temporal processor):
- Input: Past 12 timesteps (60-minute window) `[B, 12, 170, 2]` (normalized flow + time-of-day).
- Adjacency: `[170, 170]` normalized graph matrix.
- Output: 4 forecast horizons `[B, 4, 170, 1]` (+5m, +15m, +30m, +60m).
- Checkpoint: Saved to `data/processed/pems08/models/flow_spatial_graph_lstm_best.pt`.

### Empirical Test Set Evaluation Report

| Horizon | Minutes Ahead | Test MAE (`veh/5min`) | Test RMSE (`veh/5min`) | Test MAPE (`%`) |
| :--- | :---: | :---: | :---: | :---: |
| **+5 min** | 5 min | **14.96** | 22.32 | **8.85%** |
| **+15 min** | 15 min | **17.42** | 26.58 | **9.98%** |
| **+30 min** | 30 min | **20.14** | 31.01 | **11.17%** |
| **+60 min** | 60 min | **25.29** | 38.35 | **14.43%** |
| **Overall** | **1-Hour** | **19.45** | **30.15** | **11.11%** |

*Artifact location*: `data/processed/pems08/flow_evaluation_results.json`

---

## 6. Software Architecture & API Endpoints

### Data Adapter
- Located in [`backend/data_sources/pems08.py`](../backend/data_sources/pems08.py).
- Exposes clean methods:
  - `get_sensor_ids() -> List[str]`
  - `get_snapshot(time_index) -> Dict`
  - `get_sensor_time_series(sensor_id, start_step, end_step) -> List[Dict]`
  - `get_graph_adjacency() -> np.ndarray`

### FastAPI Endpoints
Integrated under `/api/experiments/flow/`:
- `GET /api/experiments/flow/status` — Returns dataset capability, sensor count (170), evaluation status (`EVALUATED` or `NOT_EVALUATED`).
- `GET /api/experiments/flow/metadata` — Returns channel breakdown, provenance, and chronological splits.
- `GET /api/experiments/flow/results` — Returns empirical test evaluation results.
- `GET /api/experiments/flow/sensors` — Returns 12 corridor-representative and 170 total station records.
- `GET /api/experiments/flow/forecast?step={step}&sensorId={sensorId}` — Returns real-time multi-horizon flow predictions and actual telemetry.

---

## 7. UI Controls & Scientific Dataset Badging

On the **Predictions** page ([`src/pages/Prediction/Prediction.jsx`](../src/pages/Prediction/Prediction.jsx)):
1. **Dataset Selector**:
   - `METR-LA` (Default):
     - Metric options: `Speed (mph)`, `Speed Delta (mph)`, `Residual Error (mph)`.
     - Active Badge: `METR-LA • Speed`.
     - Traffic flow is **never** shown for METR-LA.
   - `PeMS08 (Experimental)`:
     - Metric options: `Traffic Flow (veh/5min)`.
     - Active Badge: `PeMS08 • Flow Volume`.
     - Corridor selector: All Corridors, I-10 Corridor, I-15 Corridor, SR-60 Corridor, I-215 Interchange.
     - Sensors switch to PeMS08 stations (e.g. `PEMS08_009`).
     - Renders `FlowModelBenchmarkCard` displaying real empirical test metrics (19.45 veh/5min MAE).

---

## 8. Known Limitations
1. **Geographic Coverage**: PeMS08 covers Caltrans District 8 (San Bernardino County freeways), distinct from METR-LA (Los Angeles County). Cross-regional transfer is treated as an experimental domain shift.
2. **Aggregated Temporal Bins**: Vehicle counts are aggregated into 5-minute bins (standard for loop detector infrastructure); individual vehicle trajectories are not tracked.
3. **Sensor Density**: The PeMS08 graph comprises 170 detectors vs 207 in METR-LA. Adjacency topologies are distinct.
4. **Experimental Isolation**: PeMS08 flow models and data sources are isolated in experimental namespaces and do not replace the primary METR-LA baseline.
