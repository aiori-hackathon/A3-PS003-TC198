# TrafficPulse-X: Final Authoritative A–Z Implementation & Provenance Audit Report

> [!IMPORTANT]
> **Audit Revision**: Authoritative Audit generated directly from local HEAD [`850657ea16ba2cacdf9d661679014e3056c182c8`](#) (`origin/main` [`850657ea16ba2cacdf9d661679014e3056c182c8`](#)). Supersedes all prior draft audit notes.

---

## 1. Executive Summary & Provenance Verification

TrafficPulse-X is an **Evidence-on-Demand Federated Traffic-Flow Prediction Platform** built on the real **METR-LA** benchmark dataset (Los Angeles County highway network, 207 speed sensors).

### Tag & Commit Provenance Table
| Phase | Title | Status | Tag Object / Commit SHA | Peeled Target Commit SHA |
|---|---|---|---|---|
| **Phase 1** | Frontend Foundation | **COMPLETE** | — | — |
| **Phase 2** | Traffic Network + Decision UI | **COMPLETE** | — | — |
| **Phase 3** | Backend + Sensor Graph | **COMPLETE** | — | — |
| **Phase 4** | Real Decision Intelligence | **COMPLETE** | [`phase-4-complete`](#) | `c741ac06403317ed151d2dddb141525663e78cc0` |
| **Phase 5** | Real Dataset + Geospatial Traffic Network | **COMPLETE** | [`phase-5-complete`](#) | `ff668cf616f8ca8e09d9f8853a9d2a6c998b65a9` |
| **Phase 6** | Traffic Prediction ML | **COMPLETE / FROZEN** | [`phase-6-complete`](#) (`e789daab...`) | `660d28d0147945c126635d6f2f0273939f965cb6` |
| **Phase 7** | Prediction + Decision Intelligence Fusion | **COMPLETE / FROZEN** | [`phase-7-complete`](#) (`b14bb4c9...`) | `9548a14f964fdc0fede7971e3652296ef473aa47` |
| **Phase 8** | Federated Learning | **COMPLETE / FROZEN** | [`phase-8-complete`](#) (`22743db3...`) | `d42c67e025c46cd2337a513f98a95105ea0940bc` |
| **Phase 9** | Communication Intelligence | **COMPLETE & EVALUATED** | — | — |
| **Phase 10** | Experiments + Final System | **COMPLETE & FROZEN** | — | — |

---

## 2. Dataset, Splits & Input Tensor Contract

### Dataset Contract
- **Authoritative Raw Dataset Source Path**: `data/raw/metr-la/metr-la.h5` (57,038,056 bytes). Note: `df_in_sine.h5` was an intermediate/original dataset artifact during initial extraction.
- **ML-Ready Artifact Location**: `data/processed/metr-la/ml_ready/` (`train.npz`, `val.npz`, `test.npz`).
- **Raw Matrix Shape**: **34,272 × 207** (34,272 time steps across 207 traffic sensors).
- **Sampling Interval**: 5 minutes.
- **Authoritative Date Bounds**: `2012-03-01 00:00:00` to `2012-06-27 23:55:00`.
- **Note on Replay UI Bounds**: Any historical replay selector bound extending beyond June 27 is a minor UI bounds display artifact; actual underlying traffic dataset tensor ends strictly at `2012-06-27 23:55:00`.

### Data Splits & Window Counts
- **Chronological Index Ranges**:
  - **Train**: `[0, 23990)` (70%)
  - **Val**: `[23990, 27417)` (10%)
  - **Test**: `[27417, 34272)` (20%)
- **Sliding-Window Sample Counts** (Historical window = 12 steps / 1 hour; Target step offsets = `[1, 3, 6, 12]` for four selected forecast horizons):
  - **Train**: **23,967** samples
  - **Val**: **3,404** samples
  - **Test**: **6,832** samples

### Tensor Contracts
- **Stored NPZ Arrays**:
  - `x`: `[N, 12, 207, 1]` (Normalized speed sequence)
  - `x_mask`: `[N, 12, 207, 1]` (Binary data validity mask)
  - `y`: `[N, 4, 207, 1]` (**Raw target traffic speed in mph**)
  - `y_mask`: `[N, 4, 207, 1]` (Binary target validity mask)
- **Runtime Model Input (`Graph+LSTM`)**: `[B, 12, 207, 2]`
  - Channel 1: Normalized speed values
  - Channel 2: Binary validity mask
- **Feature Consumption Note**: Time-of-day feature is NOT an input to `Graph+LSTM`. Model inputs consist strictly of Channel 1 (normalized speed) and Channel 2 (validity mask).

### Authoritative Scaler Parameters
- **Mean ($\mu$)**: **58.584258 mph**
- **Std ($\sigma$)**: **12.822883 mph**
- *Calculated exclusively over valid (non-masked) values in the training set.*

---

## 3. Geospatial Subgraphs & Regional FL Client Distribution

### Canonical Client Partitioning
Sensors are mapped across 4 geographical subgraphs defined in `data/processed/metr-la/regions.json`:

| Client ID | Region Name | Sector | Sensor Count | Valid Target Cells ($n_i$) | Authoritative FedAvg Weight |
|---|---|---|---|---|---|
| **CLIENT_A** | `REGION_A` | North-East | **48** | 4,221,681 | `0.229069` |
| **CLIENT_B** | `REGION_B` | South-East | **57** | 5,107,193 | `0.277117` |
| **CLIENT_C** | `REGION_C` | Central-West | **58** | 5,150,335 | `0.279458` |
| **CLIENT_D** | `REGION_D` | North-West | **44** | 3,950,552 | `0.214357` |
| **TOTAL** | — | — | **207** | **18,429,761** | `1.000000` |

### Authoritative Region Checksums
- `regions.json` Raw File SHA-256: `3af9827ff16eea2c8469dcfd3f712e7a9074d1ab10ef61c9ee78f99e9b5463b3`
- Canonical Content Checksum (`json.dumps(sort_keys=True)`): `ad064c643b6eb30cf9f7ef57cce71391ac4d94f7e41529dfcf4f0b1cd46e4ff2`

---

## 4. Phase-6 Model Benchmark & Frozen Checkpoints

### Spatial Graph Normalization
Adjacency formulation in `ml/spatiotemporal/model.py`:
$$\tilde{A} = A + I_{207}$$
$$\tilde{D}_{ii} = \sum_j \tilde{A}_{ij}$$
$$A_{norm} = \tilde{D}^{-1/2} \tilde{A} \tilde{D}^{-1/2}$$
Termed: **weighted symmetrically normalized adjacency with self-loops**.

### 7-Model Benchmark Evaluation (Phase 6 Frozen Tag Results)
| Model | MAE (mph) | RMSE (mph) | MAPE (%) | Ranking / Performance Notes |
|---|---|---|---|---|
| **Last Value** | 3.9839 | 7.6411 | 10.15% | Simple baseline |
| **Historical Average** | 4.1930 | 7.8618 | 13.06% | **Winner at +60m horizon (4.1934 mph)** |
| **Linear Regression** | 3.9763 | 7.2053 | 11.14% | Ridge regularized linear baseline |
| **Temporal GRU** | 3.5669 | 7.2345 | 10.03% | Temporal baseline |
| **Temporal LSTM** | 3.5613 | 7.2420 | 9.93% | Non-spatial sequence baseline |
| **Spatial GCN** | 5.4604 | 8.9625 | 15.67% | Pure GCN without temporal memory |
| **Graph+LSTM (Selected)** | **3.4378** | **6.8873** | **9.57%** | **Overall Winner** (Best overall MAE, RMSE, MAPE) |

### Graph+LSTM Horizon Breakdown (Four Selected Forecast Horizons)
- **+5 min** (`step 1`): **2.3648 mph**
- **+15 min** (`step 3`): **3.0007 mph**
- **+30 min** (`step 6`): **3.6699 mph**
- **+60 min** (`step 12`): **4.7158 mph** *(Historical Average wins +60m at 4.1934 mph due to long-horizon variance smoothing)*

### Model Checkpoints Verification
- **Centralized Checkpoint**: `data/processed/metr-la/models/graph_lstm_best.pt`
  - Raw File Size: **111,047 bytes**
  - Raw File SHA-256: `ca1030e527d7fc57a2e8c2ec1f440536413240212f4ea7c897669d27f80db71c`
- **Federated Checkpoint**: `data/processed/metr-la/checkpoints/global_best.pt`
  - Raw File Size: **111,047 bytes**
  - Raw File SHA-256: `24710dae0fe0554ca8111ad21e05de03b69a282f0b8d8868a1433ba6fd9c2930`

---

## 5. Federated Learning (Phase 8) Provenance

- **Setup**: 4 Regional FL Clients executing FedAvg across 13 rounds (`ml/federated/`).
- **Best Validation Round**: **Round 8** (Validation MAE = **3.1536 mph**).
- **Final FL Test Metrics**:
  - **MAE**: **3.5322 mph**
  - **RMSE**: **7.0956 mph**
  - **MAPE**: **9.99%**
- **FL vs. Centralized Reference Baseline**:
  - Full-participation FedAvg achieved **3.5322 mph** test MAE, **2.75% higher** (+0.0944 mph) than the frozen centralized Graph+LSTM reference baseline of **3.4378 mph** under the evaluated regional federated setup.

---

## 6. Baseline Communication Accounting

Communication is tracked at two distinct protocol levels:

### Level 1: Sensor-to-Edge Single Query & Telemetry
- **Event A (Single Sensor Query / Heartbeat)**:
  - Raw numeric data bytes: **32 bytes** (`NUMERIC_FIELD_RAW_BYTES` = 4 IEEE-754 float64 values: `speedMph`, `timestampEpoch`, `dataQuality`, `needScore`). Excludes string metadata headers.
  - Serialized application payload: **187 bytes** (`MEASURED_SERIALIZED_APPLICATION_PAYLOAD`).
- **Event B (12-Step Detailed Telemetry Batch)**:
  - Application payload proxy: **~4.2 KB** (`APPLICATION_PAYLOAD_PROXY`).

### Level 2: Regional FL Client-to-Server Weight Updates
- **Model State Size**: 26,596 FP32 parameters.
  - Raw Float32 tensor payload: **106,384 bytes** ($26,596 \times 4$ bytes).
  - Serialized PyTorch state dict payload: **110,271 bytes**.
- **13-Round Communication Accounting**:
  - **Upload Transports**: 52 transfers (4 clients × 13 rounds) = **5,734,092 bytes**.
  - **Download Transports**: 52 transfers (4 clients × 13 rounds) = **5,734,092 bytes**.
  - **Combined Transport Total**: **104 transfers** = **11,468,184 bytes** (11.47 MB).

---

## 7. Decision Intelligence & Need Score Architecture

- **Need Score Definition**: Need Score is a deterministic derived score combining nine factors: spatial influence, calibrated prediction uncertainty, spatial speed disagreement, traffic drift, freshness, information debt, coverage need, data quality, and redundancy penalty.
- **Architectural Classification**:
  - `Need Score = DERIVED`
  - `uncertaintyProxy = CALIBRATED_PROXY` (calibrated against `val.npz` residual errors)

---

## 8. Standardized Terminology & Scope Restrictions

To maintain scientific integrity, the platform enforces strict terminology boundaries:

### Standardized Terms
- **Historical Replay** (NOT live present-day traffic)
- **Runtime Inference** (NOT physical edge hardware deployment)
- **Regional FL Client** (NOT privacy security guarantee)
- **Federated Learning Simulation**
- **Data Quality** (NOT hardware health)
- **Coverage Certificate** (NOT signed cryptographic certificate)
- **Application Payload**
- **Need Score = DERIVED**

### Strictly Disallowed Claims
- "Live present-day traffic" / "Real-time LA traffic"
- "Privacy guaranteed" / "Privacy-preserving security guarantee"
- "Physical edge deployment"
- "Signed Coverage Certificate" / "Hardware Health"
- "Normalized Laplacian"
- "78.2% Network Bandwidth Saved" / "Communication Optimized" (Phase 9 feature)

---

## 9. Frontend & Service Architecture Status

- **UI State**:
  - **Overview**: De-cluttered, hardcoded 78.2% bandwidth card removed.
  - **Decision Intelligence**: Representative selector displays special primary sensor `773869` plus one selected representative from `REGION_A`, `REGION_B` and `REGION_D`. (The canonical `representatives.json` artifact contains 5 top representative sensors per region). Hardcoded 78.2% bandwidth card removed.
  - **Communication Dashboard**: Integrated via frontend API service layer: `Communication.jsx` $\rightarrow$ `src/services/api.js` $\rightarrow$ `/api/federated/communication`.
  - **Federated Learning Dashboard**: Updated with "Regional FL Client" terminology and Round 8 validation-selected metrics.
- **Backend API**: Single FastAPI server (`backend/main.py`) exposing 38 endpoints without synthetic fallbacks.
- **Test Suite Status**: **300 PASSED, 0 FAILED**.
- **Frontend Build Status**: **SUCCESS** (`dist/assets/index-*.js` bundled cleanly).
- **Phase 9 Status**: **COMPLETE & EVALUATED** (Selective FL participation evaluated; CCV 2/4 achieves 50% application payload reduction with 3.6448 mph test MAE, Pareto-Optimal).
- **Phase 10 Status**: **COMPLETE & FROZEN** (Final evaluation, scientific contract reconciliation, and release lock).
