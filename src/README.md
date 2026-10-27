# TrafficPulse-X Source Architecture & Technical Specification

> **Official AIORI-3 Submission (Problem Statement PS-003)**  
> **Team Code:** A3-PS003-TC198  
> **Project Title:** TrafficPulse-X: Federated Traffic-Flow Prediction with Communication-Cost Evaluation  
> **Team Members:** Adarsh Singh (Lead), Shaurya Singh &bull; **Faculty Mentor:** Aditya Sir  
> **Official Repository:** [aiori-hackathon/A3-PS003-TC198](https://github.com/aiori-hackathon/A3-PS003-TC198)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Directory Layout & Module Structure](#2-directory-layout--module-structure)
3. [Sensor Network Specification (METR-LA 207 Sensors)](#3-sensor-network-specification-metr-la-207-sensors)
4. [Data Pipeline & Chronological Preprocessing](#4-data-pipeline--chronological-preprocessing)
5. [Prediction Intelligence Engine (Spatio-Temporal Graph-LSTM)](#5-prediction-intelligence-engine-spatio-temporal-graph-lstm)
6. [Federated Learning Framework (FedAvg & Non-IID Regional Partitioning)](#6-federated-learning-framework-fedavg--non-iid-regional-partitioning)
7. [Communication Cost Valuation (CCV) & Client Selection Policies](#7-communication-cost-valuation-ccv--client-selection-policies)
8. [Evidence-on-Demand Telemetry Framework (9-Factor Need Score & Jury)](#8-evidence-on-demand-telemetry-framework-9-factor-need-score--jury)
9. [Differential Privacy & Secure Aggregation Framework](#9-differential-privacy--secure-aggregation-framework)
10. [Historical Replay Engine (34,272 Observations)](#10-historical-replay-engine-34272-observations)
11. [Live Data Streaming Adapter & Real-Time Ingestion](#11-live-data-streaming-adapter--real-time-ingestion)
12. [Decision Console & Alert Dispatch Workflow](#12-decision-console--alert-dispatch-workflow)
13. [Network Accounting & Transport Serialization Metrics](#13-network-accounting--transport-serialization-metrics)
14. [Authoritative REST API Catalog (65 Routes)](#14-authoritative-rest-api-catalog-65-routes)
15. [Pydantic Response Schemas & Type Safety Contracts](#15-pydantic-response-schemas--type-safety-contracts)
16. [Frontend Component Architecture (React 19 & Tailwind CSS)](#16-frontend-component-architecture-react-19--tailwind-css)
17. [State Management & Context Machines](#17-state-management--context-machines)
18. [Installation & Environment Setup](#18-installation--environment-setup)
19. [Running the Backend Application Server](#19-running-the-backend-application-server)
20. [Running the Frontend Client Dashboard](#20-running-the-frontend-client-dashboard)
21. [Automated Verification Suite (343 Pytest Tests)](#21-automated-verification-suite-343-pytest-tests)
22. [Frontend Linting & Production Build Pipeline](#22-frontend-linting--production-build-pipeline)
23. [Reproducibility, Checksum Verification & Frozen Artifacts](#23-reproducibility-checksum-verification--frozen-artifacts)
24. [Operational Constraints, Assumptions & Future Extensions](#24-operational-constraints-assumptions--future-extensions)

---

## 1. Architecture Overview

TrafficPulse-X introduces an Evidence-on-Demand Spatio-Temporal Federated Learning paradigm designed for municipal highway sensor networks. Traditional Intelligent Transportation Systems (ITS) require continuous streaming of high-frequency sensor readings to a central datacenter, creating network congestion and violating administrative data governance. TrafficPulse-X solves this challenge through three core technical innovations:

1. **Decentralized Spatio-Temporal Modeling**: Local training of Graph Convolutional LSTM networks across 4 geographic client sectors, preventing raw telemetry leakage.
2. **Selective Client Participation via CCV**: Communication Cost Valuation algorithms prioritizing client model uploads based on temporal novelty and gradient diversity, reducing application payload by up to 50% without statistically degrading validation accuracy.
3. **Evidence-on-Demand On-Demand Sensing**: A 9-factor Need Score mathematical engine that queries full sensor telemetry only when prediction uncertainty or corridor velocity drift crosses dynamically calibrated confidence thresholds.

```mermaid
flowchart TD
    subgraph Data Layer
        A["METR-LA Benchmark (207 Sensors)"] --> B["Chronological Preprocessing (70/10/20)"]
        B --> C["Normalized Graph Construction (A_norm)"]
    end

    subgraph Machine Learning Core
        C --> D["Centralized Benchmark (Graph+LSTM)"]
        C --> E["4-Region Non-IID Partition (A, B, C, D)"]
        E --> F["Federated Learning Simulation (FedAvg)"]
        F --> G["Selective Participation Policies (CCV)"]
    end

    subgraph Backend Application (FastAPI)
        D --> H["Inference Engine (+5, +15, +30, +60 min)"]
        G --> I["Payload & Wire Byte Accounting"]
        H --> J["FastAPI REST Gateway (/api/*)"]
        I --> J
    end

    subgraph Frontend Control Center (React 19)
        J --> K["Centralized API Gateway (api.js)"]
        K --> L["Interactive Map (Leaflet)"]
        K --> M["Decision & Alert Console"]
        K --> N["Communication Trade-Off Dashboard"]
    end
```

---

## 2. Directory Layout & Module Structure

The application source code is organized under `src/` following domain separation:

```text
src/
├── backend/                              # FastAPI Backend Application Server
│   ├── config.py                         # Typed Settings & deterministic root discovery
│   ├── main.py                           # 65 API route registrations & CORS middleware
│   ├── data_source.py                    # Sensor snapshot provider & state management
│   ├── graph.py                          # Sensor adjacency & normalized Laplacian calculator
│   ├── assistant.py                      # Rule-based and generative AI operator assistant
│   ├── communication_intelligence/       # Bandwidth accounting & CCV policy definitions
│   │   ├── policies.py                   # 4 CCV participation policy specifications
│   │   └── service.py                    # Bandwidth and transport reporting service
│   ├── data_sources/                     # Additional dataset adapters & streaming managers
│   │   ├── pems08.py                     # PeMS08 traffic flow volume reader (170 sensors)
│   │   └── streaming_adapter.py          # Synthetic & mock live streaming adapter
│   ├── datasets/                         # Dataset inspection & preprocessing logic
│   │   ├── metr_la.py                    # METR-LA HDF5 parser & region partitioning
│   │   └── prepare_metr_la.py            # Splitting and Z-score normalization script
│   ├── decision/                         # Evidence-on-Demand algorithmic core
│   │   ├── config.py                     # Hyperparameters for Need Score & thresholds
│   │   ├── coverage.py                   # Sensor coverage certificate generator
│   │   ├── evidence.py                   # Evidence batch generator & query collector
│   │   ├── jury.py                       # Multi-sensor spatial consensus voting
│   │   ├── need_score.py                 # 9-Factor Need Score calculation engine
│   │   ├── physics.py                    # Kinematic velocity and flow constraints
│   │   ├── query_ranker.py               # Priority-ranked telemetry query dispatch
│   │   ├── state.py                      # Sensor uncertainty and corridor debt tracker
│   │   └── uncertainty.py                # Residual variance & conformal prediction bounds
│   ├── experiments/                      # Non-IID experiments & network transport routers
│   │   ├── flow_router.py                # PeMS08 flow prediction endpoints
│   │   ├── network_accounting.py         # Wire-byte measurement & report endpoints
│   │   └── router.py                     # Non-IID partition & seed reproducibility routes
│   ├── federated/                        # Federated learning service & response schemas
│   │   ├── schemas.py                    # Pydantic response models for FL endpoints
│   │   └── service.py                    # Authoritative FedAvg service & checkpoint manager
│   ├── prediction/                       # Multi-horizon spatio-temporal prediction service
│   │   ├── schemas.py                    # Pydantic response models for prediction routes
│   │   └── service.py                    # Graph-LSTM inference service (CUDA/CPU fallback)
│   └── privacy/                          # Differential Privacy & secure aggregation
│       └── router.py                     # DP-FedAvg experiment evaluation routes
│
├── ml/                                   # PyTorch Machine Learning Architecture
│   ├── baselines/                        # Benchmark baseline models
│   │   ├── evaluate_baselines.py         # HA, VAR, FNN evaluation pipeline
│   │   ├── evaluate_linear.py            # Ridge / Lasso linear models
│   │   ├── linear_regression.py          # Autoregressive linear formulation
│   │   └── models.py                     # Historical Average & Naive implementations
│   ├── experiments/                      # Partitioning & benchmark training pipelines
│   │   ├── flow/                         # PeMS08 traffic flow volume model scripts
│   │   ├── iid_client.py                 # Uniform client training script
│   │   ├── iid_partition.py              # Synthetic IID partition generator
│   │   ├── runner.py                     # Multi-seed experimental runner
│   │   └── transport_benchmark.py        # Localhost socket transmission benchmark
│   ├── federated/                        # Federated Learning Engine
│   │   ├── aggregation.py                # Parameter-weighted FedAvg aggregation logic
│   │   ├── client.py                     # Local client SGD trainer with gradient clipping
│   │   ├── prepare_clients.py            # Regional client data splitting & caching
│   │   ├── run_phase9_experiments.py     # Selective CCV policy evaluation harness
│   │   ├── server.py                     # Federated aggregation orchestrator
│   │   └── train_federated.py            # 15-round full federated training workflow
│   ├── freeze_stage_6_6.py               # Benchmark checkpoint freeze & verification
│   ├── graph/                            # Graph Convolutional Network (GCN) layers
│   │   ├── evaluate_graph.py             # Spatial-only GCN evaluation
│   │   ├── model.py                      # 2-layer Chebyshev spectral GCN
│   │   └── train.py                      # Standalone GCN training script
│   ├── privacy/                          # Opacus Differential Privacy integration
│   │   ├── dp_client.py                  # DP-SGD client trainer with Rényi accountant
│   │   ├── dp_config.py                  # Epsilon, delta, and max_grad_norm settings
│   │   ├── runner.py                     # DP-FedAvg comparison experiment runner
│   │   └── secure_aggregation.py         # Cryptographic secret sharing simulation
│   ├── spatiotemporal/                   # Joint Spatio-Temporal Graph-LSTM Model
│   │   ├── evaluate_spatiotemporal.py    # Authoritative evaluation over test set
│   │   ├── model.py                      # Joint GraphConvolution + LSTMCell architecture
│   │   └── train.py                      # Spatio-temporal model training pipeline
│   └── temporal/                         # Pure temporal recurrent networks
│       ├── dataset.py                    # Sliding window temporal dataset generator
│       ├── evaluate_temporal.py          # Standard LSTM & GRU evaluation
│       ├── models.py                     # PyTorch FC-LSTM and GRU definitions
│       └── train.py                      # Recurrent baseline training script
│
├── app/                                  # Frontend shell and navigation layout
├── components/                           # React domain components (traffic, decision, etc.)
├── context/                              # ReplayContext & ThemeContext
├── pages/                                # 7 core dashboard pages
├── services/                             # Centralized API service (api.js)
└── utils/                                # UI math helpers and formatting
```

---

## 3. Sensor Network Specification (METR-LA 207 Sensors)

TrafficPulse-X utilizes the benchmark **METR-LA** dataset, comprising 207 inductive loop detectors on the Los Angeles County highway network (I-5, I-10, I-101, I-110, I-210, I-405):

- **Total Sensor Count:** Exactly 207 operational highway loop detectors.
- **Geographic Bounds:** Latitude 33.914°N to 34.249°N; Longitude -118.498°W to -118.175°W.
- **Temporal Coverage:** March 1, 2012 to June 27, 2012 (119 total calendar days).
- **Sampling Frequency:** Aggregated into 5-minute intervals (288 observations per day; 34,272 total timesteps).
- **Physical Adjacency Matrix:** Derived via thresholded Gaussian kernel over network road network distance:
  $$W_{ij} = \exp\left(-\frac{\text{dist}(v_i, v_j)^2}{\sigma^2}\right) \quad \text{for } \text{dist}(v_i, v_j) \le \kappa$$
  where $\sigma = 10\text{ km}$ and $\kappa = 2\text{ km}$.
- **Regional Client Partitioning:** Sensors are partitioned into 4 distinct geographic clusters based on highway corridors:
  - **Region A (North-West / San Fernando Valley):** 53 sensors (Aggregation Weight: 0.2560)
  - **Region B (South-East / Gateway Cities):** 58 sensors (Aggregation Weight: 0.2802)
  - **Region C (Central-West / Downtown & Santa Monica):** 51 sensors (Aggregation Weight: 0.2464)
  - **Region D (North-East / Pasadena & San Gabriel):** 45 sensors (Aggregation Weight: 0.2174)

---

## 4. Data Pipeline & Chronological Preprocessing

To ensure zero future data leakage, all splits and normalizations are performed strictly chronologically:

1. **Chronological Splitting:**
   - **Training Set (70%):** Timesteps 0 to 23,990 (March 1, 2012 – May 23, 2012).
   - **Validation Set (10%):** Timesteps 23,991 to 27,417 (May 23, 2012 – June 5, 2012).
   - **Test Set (20%):** Timesteps 27,418 to 34,271 (June 5, 2012 – June 27, 2012).
2. **Standard Scaling:**
   $$\mu = 53.69\text{ mph}, \quad \sigma = 20.25\text{ mph}$$
   Fit solely on the training split; frozen and applied invariantly across all baseline models, federated partitions, and online inference endpoints.
3. **Sequence Window Framing:**
   Input tensor shape: $(B, T_{\text{in}}, N, C) = (B, 12, 207, 2)$ where $T_{\text{in}} = 12$ (past 60 minutes) and $C = 2$ (Speed in mph, Time-of-Day feature normalized to $[0, 1]$). Target prediction horizon: $T_{\text{out}} = 12$ (+60 minutes into the future).

---

## 5. Prediction Intelligence Engine (Spatio-Temporal Graph-LSTM)

The primary centralized and federated modeling architecture is a joint **Spatio-Temporal Graph-LSTM** combining 1st-order Chebyshev spectral graph convolutions with Recurrent LSTM cells:

1. **Spatial Graph Convolution:**
   Given normalized graph Laplacian $\tilde{L} = \frac{2}{\lambda_{\max}} L - I_N$:
   $$H^{(l+1)} = \sigma\left(\tilde{A} H^{(l)} W^{(l)}\right)$$
   captures spatial correlations and bottleneck propagation between upstream and downstream sensors.
2. **Temporal Recurrence:**
   The spatially enriched node representations are passed into a 2-layer LSTM sequence encoder:
   $$f_t = \sigma(W_f \cdot [h_{t-1}, x_t] + b_f), \quad i_t = \sigma(W_i \cdot [h_{t-1}, x_t] + b_i)$$
   $$c_t = f_t \odot c_{t-1} + i_t \odot \tanh(W_c \cdot [h_{t-1}, x_t] + b_c)$$
   $$o_t = \sigma(W_o \cdot [h_{t-1}, x_t] + b_o), \quad h_t = o_t \odot \tanh(c_t)$$
3. **Multi-Horizon Decoding:**
   Separate linear projection heads output forecasts at +5 min (Horizon 1), +15 min (Horizon 3), +30 min (Horizon 6), and +60 min (Horizon 12).
4. **Authoritative 7-Model Benchmark Comparison (Frozen Stage 6.6):**

| Model Architecture | 15-min MAE | 30-min MAE | 60-min MAE | Overall Test MAE | Parameter Count |
|---|---|---|---|---|---|
| Historical Average (HA) | 4.8812 | 5.1245 | 5.6102 | 5.2053 | 0 (Heuristic) |
| Vector Autoregression (VAR) | 4.2150 | 4.6820 | 5.2340 | 4.7103 | 43,263 |
| Feedforward Neural Net (FNN) | 3.9210 | 4.3120 | 4.9540 | 4.3957 | 105,472 |
| Fully Connected LSTM (FC-LSTM) | 3.5120 | 3.8450 | 4.4120 | 3.9230 | 264,192 |
| Spatial-Only GCN | 3.4210 | 3.7540 | 4.2980 | 3.8243 | 182,528 |
| **Centralized Graph+LSTM (Ours)** | **3.0112** | **3.3854** | **3.9168** | **3.4378** | **328,448** |
| **Federated FedAvg (Round 8 Checkpoint)** | **3.0924** | **3.4811** | **4.0231** | **3.5322** | **328,448** |

---

## 6. Federated Learning Framework (FedAvg & Non-IID Regional Partitioning)

The federated simulation engine trains the Spatio-Temporal Graph-LSTM across 4 regional client sectors without centralizing sensor observations:

1. **Federated Aggregation Formulation (FedAvg):**
   $$w_{t+1} = \sum_{k=1}^K \frac{n_k}{N} w_{t+1}^k$$
   where $n_k$ is the number of sensors in Region $k$ and $N = 207$.
2. **Authoritative Training Progression (15 Rounds):**
   - **Round 0 (Pre-training Initialization):** Validation MAE = 4.1205
   - **Round 1:** Validation MAE = 3.6821
   - **Round 4:** Validation MAE = 3.2984
   - **Round 8 (Authoritative Selected Checkpoint):** Best Validation MAE = **3.1536**; Final Test MAE = **3.5322** (+2.75% relative to Centralized 3.4378).
   - **Rounds 9–15:** Gradual plateau with slight over-fitting (Round 15 Validation MAE = 3.1942).
3. **Non-IID Characteristics:**
   Because each client sector covers a distinct highway network topological sub-graph, client gradients exhibit natural distribution skew ($\Delta_{\text{non-IID}} = 0.2847$), validating realistic municipal conditions.

---

## 7. Communication Cost Valuation (CCV) & Client Selection Policies

To eliminate communication waste in decentralized edge networks, TrafficPulse-X evaluates **Selective Client Participation** using the Client Contribution Value (CCV) utility metric:

$$\text{CCV}_k(t) = \alpha \cdot \text{LossDelta}_k(t) + \beta \cdot \|\nabla w_k(t) - \nabla w_{\text{global}}(t)\|_2 + \gamma \cdot \text{SensorWeight}_k$$

Under CCV scheduling, the central orchestrator ranks regional clients and accepts updates only from the top $M$ of $K$ clients per round:

- **Policy 1: Full Participation (4 of 4 clients):**
  - Serialized Payload: **11,468,184 Bytes** (11.47 MB) &bull; Test MAE: 3.6473 &bull; Bandwidth Reduction: **0.0%**
- **Policy 2: Top-3 Selective (3 of 4 clients):**
  - Serialized Payload: **8,601,138 Bytes** (8.60 MB) &bull; Test MAE: 3.6821 (+0.95%) &bull; Bandwidth Reduction: **25.0%**
- **Policy 3: Top-2 Selective (2 of 4 clients):**
  - Serialized Payload: **5,734,092 Bytes** (5.73 MB) &bull; Test MAE: 3.7410 (+2.57%) &bull; Bandwidth Reduction: **50.0%**
- **Policy 4: Single Client Budget (1 of 4 clients):**
  - Serialized Payload: **2,867,046 Bytes** (2.87 MB) &bull; Test MAE: 4.0125 (+10.01%) &bull; Bandwidth Reduction: **75.0%**

---

## 8. Evidence-on-Demand Telemetry Framework (9-Factor Need Score & Jury)

Instead of continuous streaming of 207 sensors at 5-minute intervals, the **Evidence-on-Demand** engine dynamically computes an actionable **Need Score** $S_i(t) \in [0, 1]$ for each sensor:

$$S_i(t) = \sum_{j=1}^9 w_j \cdot f_j(i, t)$$

### The 9 Need Score Factors:
1. **Residual Uncertainty Proxy ($f_1$):** Model predictive variance based on recent prediction error.
2. **Velocity Drift ($f_2$):** Rate of speed change over the preceding 15 minutes ($|\Delta v| / \Delta t$).
3. **Spatial Speed Disagreement ($f_3$):** Discrepancy between sensor reading and 1-hop topological neighbors.
4. **Corridor Information Debt ($f_4$):** Time elapsed since the sensor last transmitted a full evidence payload.
5. **Bottleneck Centrality ($f_5$):** Network betweenness centrality and interchange proximity.
6. **Physical Plausibility Violation ($f_6$):** Readings exceeding kinematic acceleration limits ($\Delta v > 25\text{ mph}$ in 5 min).
7. **Temporal Peak Regime ($f_7$):** Rush-hour weighting (07:00–09:30 and 16:30–19:00 PST).
8. **Downstream Shockwave Risk ($f_8$):** Decelerating downstream cluster indicating queue spillback.
9. **Sensor Failure / Stalling ($f_9$):** Identical values repeated across consecutive timesteps (zero variance).

### Dynamic Action Dispatch:
- **$S_i(t) < 0.35$ (Normal Operation):** Sensor transmits 4-byte compact heartbeat telemetry.
- **$0.35 \le S_i(t) < 0.70$ (Elevated Attention):** Polled at 15-minute intervals; neighboring sensors alert the spatial jury.
- **$S_i(t) \ge 0.70$ (Critical Evidence Query):** Full 4.2 KB high-resolution telemetry batch dispatched immediately.

---

## 9. Differential Privacy & Secure Aggregation Framework

TrafficPulse-X incorporates evaluated **Differential Privacy** and **Secure Multi-Party Aggregation** simulation modules:

1. **Rényi Differential Privacy (RDP):**
   Evaluated with Opacus under DP-SGD:
   $$w_k^{(t+1)} = w_k^{(t)} - \eta \cdot \left(\text{Clip}(\nabla \mathcal{L}_k, C) + \mathcal{N}\left(0, \sigma^2 C^2 I\right)\right)$$
   Yields certified privacy bounds of $(\epsilon = 5.311, \delta = 10^{-5})$ with gradient clipping norm $C = 1.0$ and noise multiplier $\sigma = 0.5$.
2. **Secure Aggregation Simulation:**
   Simulates Diffie-Hellman pairwise masking:
   $$y_k = w_k + \sum_{j > k} s_{k,j} - \sum_{j < k} s_{j,k} \pmod M$$
   Ensures the central server decrypts only the true sum $\sum_k w_k$ without inspecting any individual client's gradient vector.

---

## 10. Historical Replay Engine (34,272 Observations)

The dashboard context incorporates a deterministic **Historical Replay Engine**:

- **Timestep Range:** 0 to 34,271 (34,272 distinct 5-minute epochs).
- **Time Window:** March 1, 2012 00:00:00 to June 27, 2012 23:55:00 UTC.
- **Playback Controls:** Play, Pause, Step Forward (+5m), Step Backward (-5m), Seek Timeline, and Playback Speed multipliers (0.5x, 1x, 2x).
- **Time Semantics:** Derived dynamically via `useMemo` from timestamp milliseconds (Day of Week, Hour, Minute, Time-of-Day classification) preventing cascading re-renders.

---

## 11. Live Data Streaming Adapter & Real-Time Ingestion

TrafficPulse-X provides a pluggable adapter for live external streaming sources:

- **Historical Mode (Default):** Feeds observations directly from the preprocessed METR-LA benchmark.
- **Live Ingestion Interface:** Implements `get_streaming_manager()` in `src/backend/data_sources/streaming_adapter.py`.
- **Honest Fallback Protocol:** If an external streaming URL is not configured, the endpoint returns an honest HTTP 503 Service Unavailable notice rather than injecting ungrounded synthetic data.

---

## 12. Decision Console & Alert Dispatch Workflow

The Decision Console (`/decision` and `/alerts`) operationalizes predictive alerts into prioritized municipal interventions:

1. **Alert Classification:**
   - **Congestion Alert:** Corridor average speed drops below 35 mph.
   - **High Uncertainty Alert:** Predictive residual standard deviation $\sigma > 3.0\text{ mph}$.
   - **Speed Drift Alert:** Spatial velocity delta exceeds 0.30 between adjacent timesteps.
   - **Blind Spot Alert:** Corridor debt elevated ($S_i(t) \ge 0.70$) without recent evidence transmission.
2. **Multi-Sensor Spatial Jury:**
   Three topologically adjacent sensors cast votes to confirm whether an anomalous drop is a true incident or a localized sensor hardware failure, mitigating false alarms.

---

## 13. Network Accounting & Transport Serialization Metrics

TrafficPulse-X distinguishes between **Application Payload Bytes** and **Measured Wire Bytes**:

1. **Authoritative Application Payload:**
   Measures raw parameter tensors serialized as standard PyTorch state dicts:
   - Parameters per Model: 328,448 $\times$ 4 bytes (FP32) $\approx$ 1,313,792 raw bytes.
   - Compressed State Dict Transfer: **110,271 bytes** per client upload/download.
   - 4 Clients $\times$ (1 Upload + 1 Download) $\times$ 13 active rounds = **11,468,184 Bytes** total baseline payload.
2. **Localhost Socket Transport Benchmark:**
   Local socket measurements capture HTTP/1.1 framing headers, chunked transfer encoding, and TCP ACK overhead ($\sim$11,885,000 wire bytes), showing $<3.6\%$ protocol framing overhead.

---

## 14. Authoritative REST API Catalog (65 Routes)

The FastAPI server registers 65 typed endpoints across 8 functional modules:

### System & Health (4 Routes)
- `GET /api/health` &bull; Backend health status, device info, loaded sensor count (207).
- `GET /openapi.json` &bull; Full OpenAPI 3.1.0 JSON schema.
- `GET /docs` &bull; Interactive Swagger UI documentation.
- `GET /redoc` &bull; ReDoc API documentation.

### Prediction Intelligence (4 Routes)
- `GET /api/prediction/status` &bull; Checkpoint status, active device (CUDA/CPU), model name.
- `GET /api/prediction/forecast` &bull; Multi-horizon forecast (15m, 30m, 60m) for sensor or region.
- `GET /api/prediction/metrics` &bull; Overall, horizon-wise, and regional test MAE/RMSE/MAPE.
- `GET /api/prediction/models` &bull; 7-model comparative benchmark matrix.

### Federated Learning (5 Routes)
- `GET /api/federated/status` &bull; FL training status, selected round (Round 8), best validation MAE (3.1536).
- `GET /api/federated/clients` &bull; 4 regional client partitions and FedAvg aggregation weights.
- `GET /api/federated/rounds` &bull; Compact validation MAE progression across all 15 rounds.
- `GET /api/federated/metrics` &bull; Final test metrics comparing FL against centralized baseline (+2.75%).
- `GET /api/federated/communication` &bull; Full-participation baseline communication payload accounting.

### METR-LA Datasets & Spatial Metadata (8 Routes)
- `GET /api/datasets/metr-la/status` &bull; HDF5 file size, total sensors, date coverage.
- `GET /api/datasets/metr-la/sensors` &bull; List of all 207 real sensor canonical IDs.
- `GET /api/datasets/metr-la/sensor/{sensor_id}` &bull; Individual sensor metadata (Lat, Lng, Region, Freeway).
- `GET /api/datasets/metr-la/regions` &bull; Geographic polygon bounds and sensor allocations for Regions A–D.
- `GET /api/datasets/metr-la/feature-support` &bull; Feature matrix verification (Speed, Flow, Occupancy).
- `GET /api/datasets/metr-la/representative-sensors` &bull; Key corridor loop detectors for fast telemetry.
- `GET /api/datasets/metr-la/ml-ready` &bull; Chronological split shapes and standard scaler statistics.
- `GET /api/datasets/metr-la/snapshot` &bull; Spatial velocity vector snapshot for timestep $T$ and region.

### Decision Intelligence & Evidence-on-Demand (9 Routes)
- `GET /api/decision/state` &bull; Complete 207-sensor Need Score and alert status vector.
- `GET /api/decision/coverage` &bull; Regional coverage certificate and observation density.
- `GET /api/decision/need-score` &bull; 9-factor decomposition for a target sensor.
- `GET /api/decision/next-best-queries` &bull; Priority-ranked list of high-debt sensors requiring queries.
- `GET /api/decision/evidence` &bull; Detailed evidence payload batch for high-uncertainty sensors.
- `GET /api/decision/jury` &bull; Spatial consensus verification for candidate anomalies.
- `GET /api/decision/physics` &bull; Kinematic violation check for velocity drops.
- `GET /api/decision/uncertainty` &bull; Conformal uncertainty envelope bounds.
- `GET /api/decision/config` &bull; Active decision engine hyperparameters and alert thresholds.

### Selective Participation & CCV Experiments (6 Routes)
- `GET /api/experiments/status` &bull; Verification status of multi-seed and CCV experiments.
- `GET /api/experiments/phase9/experiments` &bull; Policy evaluation results for 4/4, 3/4, 2/4, 1/4 budget tiers.
- `GET /api/experiments/phase9/selection` &bull; Client selection breakdown for a specified budget tier.
- `GET /api/experiments/phase9/tradeoff` &bull; Accuracy vs bandwidth reduction Pareto curve data.
- `GET /api/experiments/phase9/client-values` &bull; Historical CCV utility scores across all training rounds.
- `GET /api/experiments/phase9/rounds` &bull; Per-round training loss and validation MAE for selective policies.

### Network Accounting & Transport Metrics (3 Routes)
- `GET /api/experiments/network-accounting/status` &bull; Localhost wire-byte benchmark artifact status.
- `GET /api/experiments/network-accounting/report` &bull; Measured wire bytes vs application payload comparison.
- `POST /api/experiments/network-accounting/run` &bull; Trigger local socket transmission measurement benchmark.

### Additional Benchmark & Auxiliary Routes (26 Routes)
- `GET /api/experiments/distribution-comparison` &bull; Non-IID vs IID gradient divergence comparison.
- `GET /api/experiments/seed-summary` &bull; 3-seed variance evaluation (Seed 42, 123, 999).
- `GET /api/experiments/convergence-trajectories` &bull; Loss convergence curves across client partitions.
- `GET /api/experiments/iid-partitions` &bull; Synthetic uniform client partition specifications.
- `GET /api/experiments/flow/*` &bull; 6 PeMS08 traffic flow volume prediction endpoints.
- `GET /api/privacy/*` &bull; 5 Differential privacy and secure aggregation endpoints.
- `POST /api/assistant/chat` &bull; AI operator assistant natural language query endpoint.
- `GET /api/streaming/status` &bull; Live telemetry streaming adapter status.

---

## 15. Pydantic Response Schemas & Type Safety Contracts

FastAPI routes enforce typed Pydantic models guaranteeing contract safety:

```python
# src/backend/federated/schemas.py
class FederatedStatusResponse(BaseModel):
    phase: str = "8"
    stage: str = "8.3"
    trainingComplete: bool
    selectedRound: Optional[int] = None
    bestValidationMAE: Optional[float] = None
    finalTestMAE: Optional[float] = None
    clientCount: int = 4
    participationMode: str = "FULL_PARTICIPATION_FEDAVG_SIMULATION"
    checkpointReady: bool
    checkpointPath: str

class ClientPartitionInfo(BaseModel):
    clientId: str
    regionId: str
    regionName: str
    sensorCount: int
    aggregationWeight: float
    trainValidTargets: Optional[int] = None
    valValidTargets: Optional[int] = None
    testValidTargets: Optional[int] = None
    sensors: Optional[List[str]] = None

class FederatedMetricsResponse(BaseModel):
    overall: Dict[str, Any]
    byHorizon: Dict[str, Any]
    centralizedReferenceComparison: Optional[Dict[str, Any]] = None
```

---

## 16. Frontend Component Architecture (React 19 & Tailwind CSS)

The user interface is engineered with **React 19**, **Vite 8**, **Tailwind CSS**, and **Leaflet**:

- **`RealTrafficMap.jsx`:** Interactive Leaflet geospatial map rendering all 207 real METR-LA sensors with velocity heatmaps, corridor connectivity lines, regional boundary polygons, and focus-target actions.
- **`ReplayTimeline.jsx`:** Modular scrubbing controller synchronizing the global replay state across 34,272 timesteps.
- **`CommunicationHeroFlow.jsx`:** Interactive animated SVG diagram illustrating parameter upload/download flows between regional clients and the aggregation server.
- **`ParticipationStrategyComparison.jsx`:** Interactive comparison widget toggleable between 4/4, 3/4, 2/4, and 1/4 budget policies.
- **`CollapsibleRegionalAnalysis.jsx`:** Regional error residual breakdown and horizon-specific accuracy metrics.

---

## 17. State Management & Context Machines

Global application state is managed cleanly using React Context:

- **`ReplayContext.jsx`:** Maintains active `timeIndex` (0 to 34,271), playback speed, play/pause interval timer, and derives `timeSemantics` (Day, Hour, Minute) via `useMemo` without cascading render loops.
- **`ThemeContext.jsx`:** Manages dark/light theme switching with persistence in `localStorage`.

---

## 18. Installation & Environment Setup

### System Prerequisites
- **Python:** Version 3.10 or higher.
- **Node.js:** Version 18.0.0 or higher (with npm 9+).
- **RAM:** Minimum 8 GB recommended (for PyTorch tensors).

### Installation Steps
```powershell
# 1. Clone repository
git clone https://github.com/aiori-hackathon/A3-PS003-TC198.git
cd A3-PS003-TC198

# 2. Setup Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Install backend dependencies
pip install -r requirements.txt

# 4. Install frontend dependencies
npm install
```

---

## 19. Running the Backend Application Server

Start the FastAPI application with Uvicorn:

```powershell
uvicorn src.backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The server automatically bootstraps `sys.path` to include `src/` and starts on `http://127.0.0.1:8000`. OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

---

## 20. Running the Frontend Client Dashboard

Start the Vite development server:

```powershell
npm run dev
```

The interactive dashboard opens at `http://localhost:5173`. It connects dynamically to the backend at `http://127.0.0.1:8000/api` (configurable via `VITE_API_URL`).

---

## 21. Automated Verification Suite (343 Pytest Tests)

All models, normalizations, API endpoints, and decision algorithms are verified by 343 comprehensive automated tests across 22 test files in `tests/`:

```powershell
# Run the complete test suite
pytest

# Run targeted contract & API verification
pytest tests/test_config.py tests/test_api_contracts.py tests/test_stage_8_3_fl_api.py -v
```

---

## 22. Frontend Linting & Production Build Pipeline

```powershell
# Run linter (oxlint)
npm run lint

# Build optimized production bundle
npm run build
```

---

## 23. Reproducibility, Checksum Verification & Frozen Artifacts

All authoritative evaluation metrics are frozen in validated JSON artifacts:
- **`data/processed/metr-la/models/spatiotemporal/graph_lstm_summary.json`:** Stage 6.6 centralized benchmark metrics.
- **`data/processed/metr-la/federated/fl_evaluation_summary.json`:** Stage 8.2 / 8.3 authoritative federated learning metrics.
- **`data/processed/metr-la/regions.json`:** SHA-256 verified regional sensor allocations.
- **`data/processed/metr-la/scaler.json`:** Immutable standard scaler parameters ($\mu = 53.69$, $\sigma = 20.25$).

---

## 24. Operational Constraints, Assumptions & Future Extensions

1. **Benchmark Scope:** Evaluated primarily on the METR-LA highway network; extended to PeMS08 traffic flow volume to prove multi-dataset generalizability.
2. **Federated Execution:** Executed as a synchronous multi-process simulation on unified compute, accurately tracking serialization bytes.
3. **Future Work:** Asynchronous FedProx aggregation for heterogeneous edge devices and over-the-air 5G vehicular edge computing integration.
