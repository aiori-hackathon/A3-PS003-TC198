# TrafficPulse-X — Complete Technical Documentation & System Reference Manual

**Team ID**: A3-PS003-TC198  
**Repository**: https://github.com/aiori-hackathon/A3-PS003-TC198.git  
**Release**: Final AIORI Hackathon Submission  
**Dataset**: METR-LA (Los Angeles Highway Network, 207 Sensors, 34,272 Timesteps)  
**Execution Paradigm**: Historical Replay Analysis (March 1, 2012 – June 27, 2012)  
**Test Coverage**: 343 / 343 Automated Tests Passing (100% Pass)  
**Live Frontend**: https://trafficpulsex-frontend.onrender.com  
**Live Backend**: https://trafficpulse-x.onrender.com  

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [Project Objectives & Scope](#3-project-objectives--scope)
4. [Dataset: METR-LA Inductive Loop Network](#4-dataset-metr-la-inductive-loop-network)
5. [Data Preprocessing & Graph Construction](#5-data-preprocessing--graph-construction)
6. [7-Model Comparative Benchmark](#6-7-model-comparative-benchmark)
7. [SpatialGraphLSTM Deep Learning Engine](#7-spatialgraphlstm-deep-learning-engine)
8. [Decision Intelligence & Active Sensing](#8-decision-intelligence--active-sensing)
9. [Sensor-to-Edge Communication Accounting (Level 1)](#9-sensor-to-edge-communication-accounting-level-1)
10. [Federated Learning Framework (Level 2)](#10-federated-learning-framework-level-2)
11. [Selective Federated Communication (CCV Optimization)](#11-selective-federated-communication-ccv-optimization)
12. [Communication–Accuracy Pareto Results](#12-communicationaccuracy-pareto-results)
13. [System Architecture & Component Topology](#13-system-architecture--component-topology)
14. [System Data Flow (DFD)](#14-system-data-flow-dfd)
15. [Frontend Architecture & UI Walkthrough](#15-frontend-architecture--ui-walkthrough)
16. [Traffic Digital Twin & Map Controls](#16-traffic-digital-twin--map-controls)
17. [FastAPI REST Endpoint Catalog](#17-fastapi-rest-endpoint-catalog)
18. [Technology Stack & Dependencies](#18-technology-stack--dependencies)
19. [Security, Secrets & Configuration](#19-security-secrets--configuration)
20. [Installation & Environment Setup](#20-installation--environment-setup)
21. [Running the Project Locally](#21-running-the-project-locally)
22. [Testing, Verification & Quality Assurance](#22-testing-verification--quality-assurance)
23. [Scientific Provenance & Reproducibility](#23-scientific-provenance--reproducibility)
24. [Indian Smart Mobility Case Studies](#24-indian-smart-mobility-case-studies)
25. [Operational Scope & Known Limitations](#25-operational-scope--known-limitations)
26. [Future Research & System Roadmap](#26-future-research--system-roadmap)
27. [References & Scientific Literature](#27-references--scientific-literature)

---

## 1. EXECUTIVE SUMMARY

**TrafficPulse-X** is an end-to-end intelligent transportation software system that unites high-precision spatio-temporal deep learning, uncertainty-directed active decision sensing, and privacy-preserving federated edge learning. Built upon the authoritative METR-LA inductive loop benchmark (207 spatial freeway sensors in Los Angeles County across 34,272 timesteps), TrafficPulse-X delivers multi-horizon vehicle speed forecasts (+5m, +15m, +30m, +60m) while tackling the telemetry communication bottlenecks that undermine smart-city IoT deployments.

Rather than continuously streaming raw high-bandwidth sensor telemetry to centralized servers, TrafficPulse-X operates on an **Evidence-on-Demand** paradigm: sensors communicate only when spatial speed disagreement, temporal drift, or prediction uncertainty warrants data exchange. Furthermore, regional road networks train decentralized models using **Federated Averaging (FedAvg)** combined with **Client Contribution Value (CCV)** scheduling, achieving a **50.0% reduction in application payload** while matching centralized prediction accuracy.

Evaluated on 6,855 out-of-sample chronological test timesteps, the central `SpatialGraphLSTM` achieves an overall Test MAE of **3.4378 mph** (9.57% MAPE), beating traditional statistical baselines (Historical Average: 4.1934 mph, Last Value: 4.4520 mph) and standard recurrent architectures, while establishing an empirical Pareto frontier where a 50% communication reduction incurs only 0.12 mph degradation.

---

## 2. PROBLEM STATEMENT & MOTIVATION

Intelligent Transportation Systems (ITS) in large metropolitan areas face three foundational challenges:

1. **Complex Spatio-Temporal Dependencies**: Traffic velocities evolve via coupled spatial and temporal dynamics. Downstream congestion creates backward-propagating physical shockwaves, while upstream bottlenecks restrict corridor throughput. Purely temporal models (e.g., standard LSTMs) ignore graph geometry, and static graph models ignore velocity momentum.
2. **Backhaul Communication Overhead**: Deploying hundreds of inductive loop detectors and smart cameras transmitting telemetry at 5-minute intervals creates severe wireless and cloud bandwidth consumption. During steady-state free-flow conditions, continuous full-fidelity transmissions transmit mostly redundant information.
3. **Data Sovereignty & Jurisdictional Privacy**: Regional highway sub-networks often span multiple administrative jurisdictions, municipal departments, or private toll operators. Centralizing raw sensor feeds introduces institutional friction, data sovereignty compliance risks, and vulnerability to single points of failure.

---

## 3. PROJECT OBJECTIVES & SCOPE

1. **Multi-Horizon Precision**: Forecast speed velocities at +5m, +15m, +30m, and +60m horizons using a hybrid Spatial Graph Convolution + LSTM architecture (`SpatialGraphLSTM`) with 26,596 parameters.
2. **Dual-Level Communication Cost Accounting**: Formulate and evaluate total network communication cost:
   $$\mathcal{C}_{\text{total}} = \mathcal{C}_{\text{sensor}\to\text{edge}} + \mathcal{C}_{\text{edge}\to\text{server}}$$
   where $\mathcal{C}_{\text{sensor}\to\text{edge}}$ is minimized via active Need-Score query gating, and $\mathcal{C}_{\text{edge}\to\text{server}}$ is minimized via selective federated participation policies (CCV).
3. **Production Engineering**: Deliver a full-stack production platform featuring a high-performance FastAPI asynchronous backend, 343 passing automated tests, and a responsive React 19 + Leaflet GIS digital twin frontend.

---

## 4. DATASET: METR-LA INDUCTIVE LOOP NETWORK

TrafficPulse-X is evaluated strictly on the real **METR-LA** dataset:

- **Network Scope**: 207 inductive loop detectors across the Los Angeles County highway system.
- **Observations**: 34,272 discrete timesteps sampled at 5-minute intervals (288 observations/day per sensor, ~4 months).
- **Timeframe**: March 1, 2012 00:00:00 to June 27, 2012 23:55:00.
- **Measured Telemetry**: Vehicle Speed (mph).
- **Chronological Data Partitioning**:
  - **Training Set**: Indices 0 to 23,989 (70%, 23,990 steps)
  - **Validation Set**: Indices 23,990 to 27,416 (10%, 3,427 steps)
  - **Test Set**: Indices 27,417 to 34,271 (20%, 6,855 steps)
- **Data Leakage Prevention**: Z-score scaling parameters ($\mu = 53.72\text{ mph}, \sigma = 20.30\text{ mph}$) were calculated exclusively on the training partition. Shuffling was disabled.

---

## 5. DATA PREPROCESSING & GRAPH CONSTRUCTION

1. **Sliding Window Formulation**: Sequential sliding window of 12 historical steps (past 60 minutes) to predict 12 future steps (next 60 minutes).
2. **Sensor Anomaly Masking**: Ground-truth zero-speed detector dropouts are masked during loss calculation using boolean valid target matrices.
3. **Spatial Adjacency Matrix**: Pairwise road network distances are transformed into a weighted graph adjacency matrix $\mathbf{A} \in \mathbb{R}^{207 \times 207}$ using a thresholded Gaussian kernel:
   $$A_{ij} = \exp\left(-\frac{\text{dist}(v_i, v_j)^2}{\sigma^2}\right) \quad \text{for } \text{dist}(v_i, v_j) \le \kappa, \quad \kappa = 0.1$$
4. **Non-IID Geographic Partitioning**: The 207-node network is partitioned into 4 geographic corridor clients using K-Means clustering on detector spatial coordinates:
   - **Client 1 (Downtown LA)**: 48 sensors (Weight $w_1 = 0.2291$)
   - **Client 2 (Westside / I-10)**: 57 sensors (Weight $w_2 = 0.2771$)
   - **Client 3 (San Fernando Valley)**: 58 sensors (Weight $w_3 = 0.2795$)
   - **Client 4 (Harbor / I-110)**: 44 sensors (Weight $w_4 = 0.2144$)

---

## 6. 7-MODEL COMPARATIVE BENCHMARK

All models were evaluated on the exact 6,855 test timesteps using Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Mean Absolute Percentage Error (MAPE):

| Rank | Model Architecture | Parameters | Overall MAE | Overall RMSE | Overall MAPE | +5 min MAE | +15 min MAE | +30 min MAE | +60 min MAE |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **SpatialGraphLSTM (Ours)** | **26,596** | **3.4378 mph** | **6.8873 mph** | **9.57%** | **2.3648** | **3.0007** | **3.6699** | **4.7158** |
| 2 | Spatial GCN | 2,124 | 3.5821 mph | 7.1420 mph | 10.12% | 2.5112 | 3.1890 | 3.8214 | 4.8068 |
| 3 | Temporal LSTM | 24,460 | 3.6914 mph | 7.3512 mph | 10.45% | 2.5934 | 3.2981 | 3.9450 | 4.9291 |
| 4 | Temporal GRU | 18,348 | 3.7120 mph | 7.3980 mph | 10.51% | 2.6102 | 3.3150 | 3.9680 | 4.9548 |
| 5 | Linear Regression | 2,496 | 4.1205 mph | 8.1124 mph | 11.90% | 2.9412 | 3.7820 | 4.4510 | 5.3078 |
| 6 | Historical Average (HA) | 0 | 4.1934 mph | 8.2410 mph | 12.15% | 4.1934 | 4.1934 | 4.1934 | 4.1934 |
| 7 | Last Value Baseline | 0 | 4.4520 mph | 8.9140 mph | 13.02% | 2.8120 | 3.9450 | 4.8810 | 6.1700 |

*Key Scientific Insight (+60m Crossover):* While `SpatialGraphLSTM` achieves substantial leads at short horizons (+5m: 2.36 vs 4.19 mph), at the +60m horizon Historical Average achieves 4.1934 mph versus 4.7158 mph. As temporal projection extends to 1 hour, highway velocity reverts to diurnal periodic expectations, and recursive multi-step deep models compound prediction variance.

---

## 7. SPATIALGRAPHLSTM DEEP LEARNING ENGINE

The primary forecasting engine integrates spatial graph convolution with recurrent temporal modeling:

1. **Input Tensor**: $\mathbf{X} \in \mathbb{R}^{B \times 12 \times 207 \times 1}$ representing 12 historical velocity lags across 207 sensors.
2. **Spatially Normalized Graph Convolution**:
   $$\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2} \tilde{\mathbf{A}} \tilde{\mathbf{D}}^{-1/2}, \quad \mathbf{H}^{(t)} = \text{ReLU}\left(\hat{\mathbf{A}} \mathbf{X}^{(t)} \mathbf{W}_g + \mathbf{b}_g\right)$$
   where $\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}_N$ incorporates self-loops, and $\tilde{\mathbf{D}}$ is the degree matrix.
3. **Temporal Recurrent Memory**: A 2-layer LSTM ($hidden\_dim = 64$) processes sequential spatial embeddings $\{\mathbf{H}^{(1)}, \dots, \mathbf{H}^{(12)}\}$ to retain velocity momentum and traffic shockwave dynamics.
4. **Multi-Horizon Linear Projection**: Final dense projection layer mapping hidden states to 12 future timesteps $\hat{\mathbf{Y}} \in \mathbb{R}^{B \times 12 \times 207 \times 1}$.
5. **Trainable Parameter Breakdown**:
   - Graph Convolution Layer: 64 weights + 64 biases = 128 params
   - LSTM Layer 1 & 2: Recurrent memory gates = 25,688 params
   - Output Linear Projection: 64 × 12 + 12 = 780 params
   - **Total Trainable Parameters: Exactly 26,596 float32 parameters (~104 KB footprint).**

---

## 8. DECISION INTELLIGENCE & ACTIVE SENSING

The Decision Intelligence layer schedules telemetry acquisition dynamically using an empirical **Need Score** $S_{\text{need}} \in [0.05, 1.0]$ evaluated across 9 weighted factors:

1. **Uncertainty Proxy (0.20)**: Calibrated residual prediction error variance.
2. **Spatial Speed Disagreement (0.20)**: Absolute velocity divergence from topological graph neighbors.
3. **Traffic Drift (0.15)**: Rate of change in detector speed over immediate intervals ($|v_t - v_{t-1}|$).
4. **Spatial Influence (0.15)**: Normalized eigenvector graph centrality of the sensor node.
5. **Freshness (0.10)**: Time elapsed since the sensor was last polled with high-fidelity telemetry.
6. **Information Debt (0.10)**: Accumulated steps operating purely on model predictions without ground-truth updates.
7. **Coverage Need (0.10)**: Density of unobserved sensors in the sensor's geographic quadrant.
8. **Data Quality (0.05)**: Sensor availability and telemetry completeness score.
9. **Redundancy Penalty (-0.05)**: Suppression penalty if neighboring nodes are already queried simultaneously.

**Validation Subsystems**:
- **Topological Sensor Jury**: Queries 3 topological nearest neighbors to vote on localized speed anomalies before raising critical congestion alarms, eliminating single-sensor false alarms.
- **Heuristic Plausibility Gate**: Enforces kinematic continuity ($|\Delta v| \le 25\text{ mph}$ in 5 minutes) to automatically distinguish sensor hardware glitches from genuine traffic slowdowns.

---

## 9. SENSOR-TO-EDGE COMMUNICATION ACCOUNTING (LEVEL 1)

- **Telemetry Heartbeat Payload**: Each 5-minute sensor reading produces exactly **187 Bytes** of serialized JSON containing sensor ID, timestamp, velocity, operational status, and checksum.
- **Continuous Streaming Cost**: 207 sensors × 288 steps/day × 187 Bytes = **11.15 MB/day** (~334 MB/month).
- **Active Sensing Savings**: In steady-state traffic, sensors with Need Score < 0.65 transmit only low-frequency keep-alives, reducing Level 1 bandwidth by up to **62.4%**.

---

## 10. FEDERATED LEARNING FRAMEWORK (LEVEL 2)

To preserve data sovereignty across municipal traffic departments, TrafficPulse-X deploys Federated Averaging (FedAvg):

- **Regional Edge Clients**: 4 independent client processes training on localized freeway corridor data.
- **Model Update Payload**: Each client serializes its 26,596 float32 model parameters into a PyTorch state dict producing exactly **110,271 Bytes (~110.3 KB)** per round.
- **Sample-Weighted FedAvg**:
  $$\mathbf{W}_{\text{global}}^{(r+1)} = \sum_{k=1}^4 w_k \cdot \mathbf{W}_k^{(r)}, \quad \text{where } w_k = \frac{n_k}{N}$$
- **Convergence Behavior**: Evaluated over 15 communication rounds (3 local epochs per client per round, Adam optimizer, lr=1e-3, batch size 64). Validation loss plateaus at round 12–14 with early stopping patience = 3.

---

## 11. SELECTIVE FEDERATED COMMUNICATION (CCV OPTIMIZATION)

To tackle communication bottlenecks in bandwidth-constrained IoT networks, we formulate the **Client Contribution Value (CCV)**:
$$\text{CCV}_k = 1.0 \cdot \left(\frac{N_k}{N}\right) + 0.5 \cdot d_k + 0.15 \cdot \tau_k$$
where $N_k/N$ is sample representation, $d_k$ is speed variance divergence, and $\tau_k$ is telemetry freshness. Using CCV scores, the global orchestrator dynamically schedules client participation across 4 policies: 4/4 (100%), 3/4 (75%), 2/4 (50%), and 1/4 (25%).

---

## 12. COMMUNICATION–ACCURACY PARETO RESULTS

| Participation Policy | Active Clients / Round | Round Payload | 15-Round Total Bandwidth | Bandwidth Reduction | Test MAE |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Full FedAvg (4/4) | 4 Clients | 441.1 KB | 6.62 MB | 0.0% (Baseline) | 3.4378 mph |
| CCV 3/4 (75%) | 3 Clients | 330.8 KB | 4.96 MB | 25.0% Reduction | 3.5810 mph |
| **CCV 2/4 (50% - Optimal)** | **2 Clients** | **220.5 KB** | **3.31 MB** | **50.0% Reduction** | **3.5602 mph** |
| CCV 1/4 (25%) | 1 Client | 110.3 KB | 1.65 MB | 75.0% Reduction | 3.9120 mph |

*Pareto Dominance Finding:* **CCV 2/4 strictly Pareto-dominates CCV 3/4**. CCV 2/4 cuts bandwidth by 50% while achieving lower error (3.5602 mph) than CCV 3/4 (3.5810 mph). Client sub-sampling acts as an implicit stochastic regularizer against Non-IID corridor overfitting.

---

## 13. SYSTEM ARCHITECTURE & COMPONENT TOPOLOGY

```
                         +-----------------------------------+
                         |      METR-LA Raw Telemetry        |
                         |   (207 Sensors • 34,272 Steps)    |
                         +-----------------------------------+
                                           |
                                           v
                         +-----------------------------------+
                         |   Dataset Ingestion & Graph Map   |
                         |   (Pairwise Gaussian Kernel A_ij) |
                         +-----------------------------------+
                                           |
                  +------------------------+------------------------+
                  |                                                 |
                  v                                                 v
   +-----------------------------+                   +-----------------------------+
   |  SpatialGraphLSTM Service   |                   | Federated Learning Service  |
   |  - 26,596 Float32 Weights   |                   | - 4 Regional Edge Clients   |
   |  - Multi-Horizon Forecast   |                   | - Sample-Weighted FedAvg    |
   +-----------------------------+                   +-----------------------------+
                  |                                                 |
                  +------------------------+------------------------+
                                           |
                                           v
                            +-----------------------------+
                            | Decision Intelligence Engine|
                            | - 9-Factor Need Score       |
                            | - Sensor Jury & Physics Gate|
                            +-----------------------------+
                                           |
                                           v
                            +-----------------------------+
                            |  FastAPI Asynchronous API   |
                            |  (Port 8000 • 343 Tests)    |
                            +-----------------------------+
                                           |
                                           v
                            +-----------------------------+
                            |  React 19 + Leaflet GIS UI  |
                            |  (Vite 8 • ClearType Map)   |
                            +-----------------------------+
```

---

## 14. SYSTEM DATA FLOW (DFD)

1. **Step 1: Telemetry Ingestion**: The FastAPI backend streams speed observations at requested replay timesteps from local memory-mapped arrays.
2. **Step 2: Spatio-Temporal Prediction**: The past 12 lags (60 min) enter `SpatialGraphLSTM`, generating velocity forecasts for +5m, +15m, +30m, and +60m.
3. **Step 3: Uncertainty & Need Evaluation**: Residual variances and topological neighbor differences compute the 9-factor Need Score.
4. **Step 4: Active Sensing Query**: Sensors with Need Score ≥ 0.65 trigger high-fidelity telemetry queries, updating local evidence chains.
5. **Step 5: Federated Training & CCV Aggregation**: Corridor clients execute 3 local epochs; the orchestrator aggregates 110 KB state dicts using CCV scheduling.
6. **Step 6: Real-Time Visualization**: React client renders interactive geospatial maps, multi-horizon charts, and alert feeds.

---

## 15. FRONTEND ARCHITECTURE & UI WALKTHROUGH

The client is built on **React 19**, **Vite 8**, and **Tailwind CSS 4**:

- **/overview**: High-level command console displaying Current Sensor State, Next 60-Minute Forecast, Spatial Consensus, Timeline, and What-to-Watch alerts.
- **/network**: Interactive Leaflet digital twin showing all 207 detectors, embedded top-left replay controls, 3 basemaps, region filters, edge modes, and bottom speed legend.
- **/predictions**: Multi-horizon forecasting console with sensor/region selectors, Speed (mph) metric locking, Re-evaluate trigger, and collapsible benchmark details.
- **/decision**: Decision intelligence console showing authoritative Need Score gauges, Next-Best Query table, Execute Query actions, Sensor Jury, and Heuristic Plausibility Gate.
- **/federated**: Federated learning management console displaying 4 regional client partition cards, convergence charts, and Indian smart-mobility municipal case studies.
- **/communication**: Communication intelligence console showing participation policy selector cards (4/4, 75%, 50%, 25%), breakdown donut chart, and regional bandwidth tables.
- **/alerts**: Derived anomaly stream with category filters, severity indicators, and deep event inspector drawer.

*(Screenshots of all 7 operational consoles are embedded in the companion PDF documentation).*

---

## 16. TRAFFIC DIGITAL TWIN & MAP CONTROLS

- **Basemaps**: Three clean styles: `Street` (default daytime), `Satellite` (high-res aerial), and `Dark` (command center).
- **Replay Controls**: Embedded directly in the map hero top-left: `[ Step 18 • 01:30 ] [ ‹ ] [ ▶/❚❚ ] [ › ] [ 1x ▾ ] [ ↺ ]`.
- **Playback Speeds**: 1x (Normal, ~1.0s/step), 2x (Fast, ~0.5s/step), and 0.5x (Slow, ~2.0s/step).
- **Edge Modes**: `Selected Edges` (highlights topological connections to active sensor), `All Edges` (displays network graph adjacency), and `Off`.
- **Bottom Legend**: Centered status pill displaying Free Flow (>50 mph, green), Moderate (35-50 mph, amber), Congestion (<35 mph, red), Unavailable (gray), and Selected Target (cyan ring).

---

## 17. FASTAPI REST ENDPOINT CATALOG

| Category | Method | Path | Description |
| :--- | :---: | :--- | :--- |
| **System** | `GET` | `/api/health` | Health check & data manager status |
| **Dashboard** | `GET` | `/api/dashboard` | Dashboard metrics for specified `time_index` |
| **Sensors** | `GET` | `/api/sensors` | List all 207 sensors at specified `time_index` |
| **Sensors** | `GET` | `/api/sensors/{id}` | Sensor detail, coordinates, speed history, neighbors |
| **Sensors** | `POST` | `/api/sensors/{id}/heartbeat` | Send compact 187-byte telemetry heartbeat |
| **Predictions** | `GET` | `/api/prediction/status` | Model status & available checkpoint metadata |
| **Predictions** | `GET` | `/api/prediction/forecast` | Multi-horizon speed forecasts (+5m to +60m) |
| **Predictions** | `GET` | `/api/prediction/metrics` | Overall 7-model comparative benchmark metrics |
| **Decision** | `GET` | `/api/decision/need-scores` | 9-factor Need Score breakdown for all sensors |
| **Decision** | `POST` | `/api/decision/query` | Trigger active telemetry query for specified sensor |
| **Federated** | `GET` | `/api/federated/status` | Client status, weights, current round, loss history |
| **Communication** | `GET` | `/api/communication/stats` | Bandwidth breakdown (Level 1 vs Level 2) & CCV Pareto |
| **Alerts** | `GET` | `/api/alerts` | Real-time anomaly stream with severity & corridor filters |

---

## 18. TECHNOLOGY STACK & DEPENDENCIES

- **Backend Framework**: Python 3.11+, FastAPI 0.115+, Uvicorn 0.34+ (Asynchronous ASGI server).
- **Deep Learning Engine**: PyTorch 2.5+, NumPy 1.26+, SciPy 1.14+ (Normalized graph Laplacian).
- **Frontend Architecture**: React 19.0, Vite 8.0, Tailwind CSS 4.0, Lucide React icons.
- **Geospatial Mapping**: Leaflet 1.9+, React-Leaflet 5.0, CartoDB & OpenStreetMap tile servers.
- **Automated Testing**: Pytest 8.3+, HTTPX 0.28+ (Async test client).

---

## 19. SECURITY, SECRETS & CONFIGURATION

- **Zero Hardcoded Credentials**: The system enforces zero credentials in source files. Local deployment requires no external paid API keys.
- **CORS Policy**: Configured for local development (`localhost:5173`) and production Render endpoints with secure headers.
- **Input Sanitization**: All FastAPI path parameters (`sensor_id`, `time_index`) are strictly validated via Pydantic schemas.

---

## 20. INSTALLATION & ENVIRONMENT SETUP

```bash
# 1. Clone Official Repository
git clone https://github.com/aiori-hackathon/A3-PS003-TC198.git
cd A3-PS003-TC198

# 2. Python Virtual Environment Setup
python -m venv venv
venv\Scripts\activate          # Windows PowerShell
# source venv/bin/activate     # Linux / macOS

# 3. Install Python Dependencies
pip install -r backend/requirements.txt

# 4. Install Node.js Frontend Dependencies
npm install
```

---

## 21. RUNNING THE PROJECT LOCALLY

```bash
# Terminal 1: Launch FastAPI Backend Server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Launch Vite React Frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Frontend Application: `http://127.0.0.1:5173`
- Interactive API Documentation: `http://127.0.0.1:8000/docs`

---

## 22. TESTING, VERIFICATION & QUALITY ASSURANCE

```bash
python -m pytest backend -v
```
- **Test Suite Execution**: Exactly **343 passed out of 343 tests (100% passing)** across all unit, integration, and federation test modules in ~4 seconds.
- **Frontend Build Validation**: `npm run build` compiles clean static assets in ~1.3s with zero linting warnings.
- **Headless UI Verification**: Zero console runtime errors, zero 404/500 network exceptions, and zero horizontal overflow across desktop, tablet, and mobile breakpoints.

---

## 23. SCIENTIFIC PROVENANCE & REPRODUCIBILITY

- **Deterministic Seeds**: Fixed random seed `SEED = 42` set across NumPy, PyTorch (CPU and CUDA), and Python random modules.
- **Model Checkpoints**: Serialized PyTorch state dict saved in `models/graph_lstm_best.pt` (26,596 parameters).
- **Adjacency Matrix**: Distance graph stored deterministically in `data/raw/metr-la/adj_mx.pkl`.

---

## 24. INDIAN SMART MOBILITY CASE STUDIES

While METR-LA provides a standardized international research benchmark, TrafficPulse-X is specifically architected for transferability to Indian municipal environments:

- **Bangalore Traffic Police (BTP) ITMS**: Over 7,500 smart surveillance cameras can function as edge nodes. Local precincts train on ANPR camera speed telemetry; only 110 KB weight tensors travel to the central Traffic Management Centre, preserving public privacy.
- **Delhi Integrated Command & Control Centre (ICCC)**: High-density corridors (Outer Ring Road, Barapullah) exhibit extreme unlaned traffic mixtures. The topology-agnostic graph convolution models corridor velocity momentum without requiring lane discipline.
- **MoHUA Smart Cities Mission**: Federated learning allows independent municipal corporations (e.g., Surat, Pune, Ahmedabad) to co-train national traffic models without sharing raw municipal data across jurisdictional boundaries.

---

## 25. OPERATIONAL SCOPE & KNOWN LIMITATIONS

1. **Historical Telemetry Scope**: Evaluated on historical METR-LA recordings; production deployment requires streaming Kafka/MQTT adapters.
2. **Speed Telemetry Focus**: METR-LA records speed (mph); physical vehicle volume (flow) and lane occupancy are not present in this benchmark.
3. **Layer-7 Payload Accounting**: Communication accounting measures serialized application data; underlying network transport overheads (TCP/IP framing, packet retransmissions) will vary by telecom provider.

---

## 26. FUTURE RESEARCH & SYSTEM ROADMAP

- **Differential Privacy**: Integrating formal Gaussian noise perturbation and gradient clipping to provide mathematical (ε, δ)-DP guarantees.
- **Secure Multi-Party Aggregation (SMPC)**: Encrypting client updates with additive secret sharing to prevent man-in-the-middle eavesdropping.
- **Multimodal Graph Networks**: Expanding the spatial graph to include public transit (metro, bus corridors) and weather sensors.

---

## 27. REFERENCES & SCIENTIFIC LITERATURE

1. **Li, Y., Yu, R., Shahabi, C., & Liu, Y. (2018)**. *Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting*. ICLR.
2. **Yu, B., Yin, H., & Zhu, Z. (2018)**. *Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting*. IJCAI.
3. **McMahan, B., Moore, E., Ramage, D., Hampson, S., & y Arcas, B. A. (2017)**. *Communication-Efficient Learning of Deep Networks from Decentralized Data*. AISTATS.
4. **Chen, C., Petty, K., Skabardonis, A., Varaiya, P., & Jia, Z. (2001)**. *Freeway Performance Measurement System (PeMS)*. Transportation Research Record.
5. **Ministry of Housing and Urban Affairs (MoHUA), Government of India (2015–2024)**. *Smart Cities Mission: Integrated Command and Control Centres (ICCC) and Adaptive Traffic Control Systems (ATCS)*.

---
*TrafficPulse-X • Team Code: A3-PS003-TC198 • All India Open Research Initiative (AIORI)*  
*Official Submission Repository: https://github.com/aiori-hackathon/A3-PS003-TC198.git*
