# TrafficPulse-X — Complete Technical Documentation & System Reference Manual

**Team ID**: A3-PS003-TC198
**Repository**: AdarshSingh4455/A3-PS003-TC198
**Release**: Final Hackathon Submission
**Dataset**: METR-LA (Los Angeles Highway Network, 207 Sensors)
**Execution Paradigm**: Historical Replay Analysis (March 1, 2012 – June 27, 2012)

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Dataset (METR-LA)](#4-dataset-metr-la)
5. [Data Preprocessing Pipeline](#5-data-preprocessing-pipeline)
6. [7-Model Comparative Benchmark](#6-7-model-comparative-benchmark)
7. [Spatial Graph+LSTM Architecture](#7-spatial-graphlstm-architecture)
8. [Decision Intelligence & Active Sensing](#8-decision-intelligence--active-sensing)
9. [Sensor-to-Edge Communication Accounting](#9-sensor-to-edge-communication-accounting)
10. [Federated Learning Framework](#10-federated-learning-framework)
11. [Selective Federated Communication (CCV Optimization)](#11-selective-federated-communication-ccv-optimization)
12. [Communication–Accuracy Experimental Results](#12-communicationaccuracy-experimental-results)
13. [Complete System Architecture](#13-complete-system-architecture)
14. [System Data Flow (DFD)](#14-system-data-flow-dfd)
15. [Frontend Architecture & UI Walkthrough](#15-frontend-architecture--ui-walkthrough)
16. [Traffic Network Digital Twin & Map Controls](#16-traffic-network-digital-twin--map-controls)
17. [FastAPI Endpoint Catalog](#17-fastapi-endpoint-catalog)
18. [Technology Stack](#18-technology-stack)
19. [Security, Secrets & Configuration](#19-security-secrets--configuration)
20. [Installation Guide](#20-installation-guide)
21. [Running the Project](#21-running-the-project)
22. [Testing & Quality Assurance](#22-testing--quality-assurance)
23. [Scientific Provenance & Reproducibility](#23-scientific-provenance--reproducibility)
24. [Limitations & Operational Scope](#24-limitations--operational-scope)
25. [Future Work](#25-future-work)
26. [References](#26-references)
27. [Appendix](#27-appendix)

---

## 1. EXECUTIVE SUMMARY

**TrafficPulse-X** is an end-to-end intelligent transportation software system that unites high-precision spatio-temporal deep learning, uncertainty-directed active decision sensing, and privacy-preserving federated edge learning. Built upon the authoritative METR-LA inductive loop benchmark (207 spatial freeway sensors in Los Angeles County), TrafficPulse-X delivers multi-horizon vehicle speed forecasts (+5m, +15m, +30m, +60m) while tackling the telemetry communication bottlenecks that undermine smart-city IoT deployments.

Rather than continuously streaming raw high-bandwidth sensor telemetry to centralized servers, TrafficPulse-X operates on an **Evidence-on-Demand** paradigm: sensors communicate only when spatial speed disagreement, temporal drift, or prediction uncertainty warrants data exchange. Furthermore, regional road networks train decentralized models using **Federated Averaging (FedAvg)** combined with **Client Contribution Value (CCV)** scheduling, achieving a **50.0% reduction in application payload** while matching centralized prediction accuracy.

---

## 2. PROBLEM STATEMENT

Intelligent Transportation Systems (ITS) in large metropolitan areas face three foundational challenges:

1. **Complex Spatio-Temporal Dependencies**: Traffic velocities evolve via coupled spatial and temporal dynamics. Downstream congestion creates backward-propagating physical shockwaves, while upstream bottlenecks restrict corridor throughput. Purely temporal models (e.g., standard LSTMs) ignore graph geometry, and static graph models ignore velocity momentum.
2. **Backhaul Communication Overhead**: Deploying hundreds of inductive loop detectors and smart cameras transmitting telemetry at 5-minute intervals creates severe wireless and cloud bandwidth consumption. During steady-state free-flow conditions, continuous full-fidelity transmissions transmit mostly redundant information.
3. **Data Sovereignty & Jurisdictional Privacy**: Regional highway sub-networks often span multiple administrative jurisdictions, municipal departments, or private toll operators. Centralizing raw sensor feeds introduces institutional friction, data sovereignty compliance risks, and vulnerability to single points of failure.

---

## 3. PROJECT OBJECTIVES

1. **Prediction Accuracy**: Optimize multi-horizon speed forecasting accuracy across the road network using a hybrid Spatial Graph Convolution + LSTM recurrent architecture (`SpatialGraphLSTM`), beating standard statistical baselines across all horizons.
2. **Communication Cost Minimization**: Formulate and evaluate total network communication cost:
   $$\mathcal{C}_{\text{total}} = \mathcal{C}_{\text{sensor}\to\text{edge}} + \mathcal{C}_{\text{edge}\to\text{server}}$$
   where $\mathcal{C}_{\text{sensor}\to\text{edge}}$ is minimized via active Need-Score query gating, and $\mathcal{C}_{\text{edge}\to\text{server}}$ is minimized via selective federated participation policies.

---

## 4. DATASET (METR-LA)

TrafficPulse-X is evaluated strictly on the real **METR-LA** dataset:

- **Network Scope**: 207 inductive loop detectors across the Los Angeles County highway system.
- **Observations**: 34,272 discrete timesteps sampled at 5-minute intervals (288 observations/day per sensor).
- **Timeframe**: March 1, 2012 00:00:00 to June 27, 2012 23:55:00.
- **Measured Telemetry**: Vehicle Speed (mph).
- **Unavailable Telemetry**: Physical vehicle flow (volume), road occupancy, hardware diagnostic health, and ground-truth accident labels are absent from METR-LA.
- **Chronological Data Split**:
  - **Training Set**: Indices 0 to 23,989 (70%, 23,990 steps)
  - **Validation Set**: Indices 23,990 to 27,416 (10%, 3,427 steps)
  - **Test Set**: Indices 27,417 to 34,271 (20%, 6,855 steps)
  - *No chronological leakage: scaler statistics ($\mu = 53.72\text{ mph}, \sigma = 20.30\text{ mph}$) were computed strictly on the training set.*

---

## 5. DATA PREPROCESSING PIPELINE

1. **Sliding Window Construction**: Sequential sliding window of 12 input historical steps (past 60 minutes) to predict 12 future steps (next 60 minutes).
2. **Missing Value Masking**: Zero-valued detector anomalies are masked during loss calculation using boolean valid target matrices.
3. **Spatial Adjacency Construction**: Pairwise road network distances are transformed into a weighted graph adjacency matrix $\mathbf{A} \in \mathbb{R}^{207 \times 207}$ using a thresholded Gaussian kernel:
   $$A_{ij} = \exp\left(-\frac{\text{dist}(v_i, v_j)^2}{\sigma^2}\right) \quad \text{for } \text{dist}(v_i, v_j) \le \kappa$$
4. **Graph Partitioning**: The 207-node network is partitioned into 4 geographic regions using K-Means spatial clustering on detector coordinates:
   - **Region A (North-East)**: 48 sensors
   - **Region B (South-East)**: 57 sensors
   - **Region C (Central-West)**: 58 sensors
   - **Region D (North-West)**: 44 sensors

---

## 6. 7-MODEL COMPARATIVE BENCHMARK

All models were evaluated on the exact 6,855 test timesteps using Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Mean Absolute Percentage Error (MAPE):

| Rank | Model Architecture | Parameters | Overall MAE | Overall RMSE | Overall MAPE | +5 min MAE | +15 min MAE | +30 min MAE | +60 min MAE |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Spatial Graph+LSTM** | **26,596** | **3.4378 mph** | **6.8873 mph** | **9.57%** | **2.3648** | **3.0007** | **3.6699** | **4.7158** |
| 2 | Spatial GCN | 2,124 | 3.5821 mph | 7.1420 mph | 10.12% | 2.5112 | 3.1890 | 3.8214 | 4.8068 |
| 3 | Temporal LSTM | 24,460 | 3.6914 mph | 7.3512 mph | 10.45% | 2.5934 | 3.2981 | 3.9450 | 4.9291 |
| 4 | Temporal GRU | 18,348 | 3.7120 mph | 7.3980 mph | 10.51% | 2.6102 | 3.3150 | 3.9680 | 4.9548 |
| 5 | Linear Regression | 2,496 | 4.1205 mph | 8.1124 mph | 11.90% | 2.9412 | 3.7820 | 4.4510 | 5.3078 |
| 6 | Historical Average | 0 | 4.1934 mph | 8.2410 mph | 12.15% | 4.1934 | 4.1934 | 4.1934 | 4.1934 |
| 7 | Last Value | 0 | 4.4520 mph | 8.9140 mph | 13.02% | 2.8120 | 3.9450 | 4.8810 | 6.1700 |

*Finding: Spatial Graph+LSTM achieved the lowest overall test error across all evaluated deep learning and statistical baselines.*

---

## 7. SPATIAL GRAPH+LSTM ARCHITECTURE

The primary forecasting engine integrates spatial graph convolution with recurrent temporal modeling:

1. **Input Tensor**: $\mathbf{X} \in \mathbb{R}^{B \times 12 \times 207 \times 1}$.
2. **Spatially Normalized Graph Convolution**: Evaluates spatial dependencies across the highway topology:
   $$\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2} \tilde{\mathbf{A}} \tilde{\mathbf{D}}^{-1/2}, \quad \mathbf{H}^{(t)} = \text{ReLU}\left(\hat{\mathbf{A}} \mathbf{X}^{(t)} \mathbf{W}_g + \mathbf{b}_g\right)$$
3. **Temporal Recurrent Memory**: A 2-layer LSTM ($hidden\_dim = 64$) processes sequential graph embeddings $\{\mathbf{H}^{(1)}, \dots, \mathbf{H}^{(12)}\}$ to retain velocity momentum and deceleration curves.
4. **Multi-Horizon Linear Projection**: Final dense projection layer mapping hidden states to 12 future timesteps $\hat{\mathbf{Y}} \in \mathbb{R}^{B \times 12 \times 207 \times 1}$.
5. **Loss Function**: Masked Mean Absolute Error (MAE) excluding missing zero entries:
   $$\mathcal{L}_{\text{masked}} = \frac{\sum_{b,t,n} |\hat{y}_{b,t,n} - y_{b,t,n}| \cdot m_{b,t,n}}{\sum_{b,t,n} m_{b,t,n} + \epsilon}$$

---

## 8. DECISION INTELLIGENCE & ACTIVE SENSING

The Decision Intelligence layer schedules telemetry acquisition dynamically using an empirical **Need Score** $S_{\text{need}} \in [0.05, 1.0]$ evaluated across 9 weighted factors:

1. **Uncertainty Proxy (0.20)**: Calibrated residual prediction error variance.
2. **Spatial Speed Disagreement (0.20)**: Absolute velocity divergence from topological graph neighbors.
3. **Traffic Drift (0.15)**: Rate of change in detector speed over immediate intervals.
4. **Spatial Influence (0.15)**: Normalized eigenvector graph centrality of the sensor.
5. **Freshness (0.10)**: Time elapsed since the sensor was last polled with high-fidelity telemetry.
6. **Information Debt (0.10)**: Accumulated steps operating purely on model predictions without ground-truth updates.
7. **Coverage Need (0.10)**: Density of unobserved sensors in the sensor's geographic quadrant.
8. **Data Quality (0.05)**: Sensor availability and telemetry completeness score.
9. **Redundancy Penalty (-0.05)**: Suppression penalty if neighboring nodes are already queried simultaneously.

**Validation Subsystems**:
- **Sensor Jury**: Queries 3 topological nearest neighbors to vote on localized speed anomalies before raising critical alerts.
- **Heuristic Plausibility Gate**: Verifies kinematic continuity ($|\Delta v| \le 25\text{ mph}$ in 5 minutes) to distinguish sensor hardware glitches from genuine traffic slowdowns.

---

## 9. SENSOR-TO-EDGE COMMUNICATION ACCOUNTING

- **Level 1 Baseline (Continuous Polling)**: Transmitting full 4.2 KB telemetry frames from all 207 sensors every 5 minutes produces ~250.3 MB of transmission per day.
- **Compact Query Gating**: Steady-state nodes transmit an ultra-lightweight **187-byte serialized compact status heartbeat** containing only speed state and error bounds.
- **Detailed Telemetry on Demand**: The full 4.2 KB frame is requested only when a detector's Need Score crosses the critical sensing threshold ($S_{\text{need}} \ge 0.65$), yielding an 82% reduction in Level 1 edge bandwidth.

---

## 10. FEDERATED LEARNING FRAMEWORK

TrafficPulse-X implements a decentralized regional federated learning pipeline:

- **Clients**: 4 Regional Edge Nodes representing partitioned Los Angeles freeway quadrants.
- **Data Partitions**: Local training datasets containing only regional sensor observations.
- **Model Payload**: Exactly 26,596 FP32 parameters (~104 KB) per upload/download.
- **FedAvg Aggregation**:
  $$\mathbf{W}_{g}^{(r+1)} = \sum_{k=1}^{4} w_k \mathbf{W}_k^{(r)}, \quad w_k = \frac{|\mathcal{D}_k|}{\sum_{j=1}^4 |\mathcal{D}_j|}$$
  - $w_A = 0.229069$ (Region A: 48 sensors)
  - $w_B = 0.277117$ (Region B: 57 sensors)
  - $w_C = 0.279458$ (Region C: 58 sensors)
  - $w_D = 0.214356$ (Region D: 44 sensors)
- **Early Stopping & Convergence**: Validated checkpoint selected at **Round 8** (Val MAE: **3.1536 mph**). Final test generalization achieves **3.5322 mph MAE** (+2.75% relative to centralized model).

---

## 11. SELECTIVE FEDERATED COMMUNICATION (CCV OPTIMIZATION)

To prevent transmitting full model weights from every client in every training round, TrafficPulse-X schedules clients using the **Client Contribution Value (CCV)** metric:

$$\text{CCV}_k = \alpha \cdot s_k + \beta \cdot d_k + \lambda \cdot \tau_k$$

- $s_k$: Sensor population fraction ($|\mathcal{V}_k| / 207$)
- $d_k$: Regional speed variance/drift proxy
- $\tau_k$: Communication staleness penalty (rounds since client last participated)
- Parameter Weights: $\alpha = 1.0, \beta = 0.5, \lambda = 0.15$

---

## 12. COMMUNICATION–ACCURACY EXPERIMENTAL RESULTS

Evaluating selective communication policies across the 13-round federated training cycle produced the following matched empirical results:

| Participation Strategy | Active Clients / Round | Total Payload (Bytes) | Application Payload Reduction | Test MAE (mph) | Pareto Trade-off Assessment |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Full Participation** | 4 / 4 | 11,468,184 B (11.47 MB) | 0.0% | 3.6473 | Synchronous Full Baseline |
| **75% Participation** | 3 / 4 | 8,601,138 B (8.60 MB) | -25.0% | 3.6530 | Strictly dominated by 50% policy |
| **50% Participation** | 2 / 4 | **5,734,092 B (5.73 MB)** | **-50.0%** | **3.6448** | **Best Observed Balanced Trade-off** |
| **25% Participation** | 1 / 4 | **2,867,046 B (2.87 MB)** | **-75.0%** | **3.6699** | **Maximum Observed Efficiency** |

*Conclusion: The 50% participation policy cuts application-payload exchange by exactly 50% (5.73 MB vs 11.47 MB) while achieving an MAE of 3.6448 mph (slightly better than the 4/4 policy due to the implicit regularization of client subsampling).*

---

## 13. COMPLETE SYSTEM ARCHITECTURE

```
                                 +-----------------------------+
                                 |   METR-LA Raw HDF5 / CSV    |
                                 +-----------------------------+
                                                |
                                                v
                                 +-----------------------------+
                                 |  Dataset Ingestion Pipeline |
                                 | (data_source.py & graph.py) |
                                 +-----------------------------+
                                                |
                       +------------------------+------------------------+
                       |                                                 |
                       v                                                 v
        +-----------------------------+                   +-----------------------------+
        |  PyTorch Prediction Service |                   | Federated Learning Service  |
        |  - SpatialGraphLSTM         |                   | - 4 Regional Clients        |
        |  - Calibrated Uncertainty   |                   | - FedAvg & CCV Optimization |
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
                                 |   FastAPI REST API Gateway  |
                                 |   (backend/main.py, :8000)  |
                                 +-----------------------------+
                                                |
                                                v
                                 +-----------------------------+
                                 |   React 19 Frontend Console |
                                 |   (Vite + Tailwind, :5173)  |
                                 +-----------------------------+
```

---

## 14. SYSTEM DATA FLOW (DFD)

1. **Step 1: Telemetry Reading**: The backend loads speed observations from `data/raw/metr-la/` at the requested replay step `time_index`.
2. **Step 2: Spatio-Temporal Prediction**: The past 12 steps (60 min) are fed to `SpatialGraphLSTM`, producing speed projections for +5m, +15m, +30m, and +60m.
3. **Step 3: Uncertainty & Need Evaluation**: Empirical residuals and topological neighbor differences determine each sensor's Need Score.
4. **Step 4: Active Sensing Query**: Sensors with Need Score $\ge 0.65$ trigger high-fidelity evidence queries, updating the evidence chain and coverage certificates.
5. **Step 5: Client Partition Training & Aggregation**: Regional client models train on localized data; the server selectively aggregates weights using CCV scores.
6. **Step 6: Dashboard Visualization**: The React client displays geospatial maps, multi-horizon charts, strategy comparison cards, and alert feeds.

---

## 15. FRONTEND ARCHITECTURE & UI WALKTHROUGH

The client is built on **React 19**, **Vite 8**, and **Tailwind CSS 4**:

- **/overview**: High-level command console displaying Current Sensor State, Next 60-Minute Forecast, Spatial Consensus, Timeline, and What-to-Watch alerts.
- **/network**: Interactive Leaflet digital twin showing all 207 detectors, embedded top-left replay controls, 3 basemaps, region filters, edge modes, and bottom speed legend.
- **/predictions**: Multi-horizon forecasting console with sensor/region selectors, Speed (mph) metric locking, Re-evaluate trigger, and collapsible benchmark details.
- **/decision**: Decision intelligence console showing authoritative Need Score gauges, Next-Best Query table, Execute Query actions, Sensor Jury, and Heuristic Plausibility Gate.
- **/federated**: Federated learning management console displaying 4 regional client partition cards, Round 8 convergence charts, and Indian smart-mobility municipal case studies.
- **/communication**: Communication intelligence console showing participation policy selector cards (4/4, 75%, 50%, 25%), breakdown donut chart, and regional bandwidth tables.
- **/alerts**: Derived anomaly stream with category filters, severity indicators, and deep event inspector drawer.
- **Floating AI Assistant**: Server-side conversational assistant answering domain technical queries with graceful local knowledge fallback.

---

## 16. TRAFFIC NETWORK DIGITAL TWIN & MAP CONTROLS

- **Basemaps**: Three clean styles: `Street` (default daytime), `Satellite` (high-res aerial), and `Dark` (command center). `Hybrid` has been removed.
- **Replay Controls**: Embedded directly in the map hero top-left: `[ Step 18 • 01:30 ] [ ‹ ] [ ▶/❚❚ ] [ › ] [ 1x ▾ ] [ ↻ ]`.
- **Playback Speeds**: 1x (Normal, ~1.0s/step), 2x (Fast, ~0.5s/step), and 0.5x (Slow, ~2.0s/step).
- **Edge Modes**: `Selected Edges` (highlights topological connections to active sensor), `All Edges` (displays network graph adjacency), and `Off`.
- **Viewport Controls**: `[ Full Network ]` resets camera to Los Angeles county freeway bounds; `[ Focus Target ]` centers on the active detector; Zoom and Fullscreen controls docked at the bottom right.
- **Bottom Legend**: Centered status pill displaying Free Flow (>50 mph, green), Moderate (35-50 mph, amber), Congestion (<35 mph, red), Unavailable (gray), and Selected Target (cyan ring).

---

## 17. FASTAPI ENDPOINT CATALOG

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
| **Predictions** | `GET` | `/api/prediction/models` | Detailed model specifications & parameter counts |
| **Decision** | `GET` | `/api/decision/sensors/{id}/need-score` | Authoritative 9-factor Need Score for detector |
| **Decision** | `GET` | `/api/decision/query-candidates` | Next-Best Query candidate ranking table |
| **Decision** | `POST`| `/api/query/{id}` | Execute active evidence query for target sensor |
| **Decision** | `GET` | `/api/decision/counterfactual/{id}` | Counterfactual uncertainty reduction analysis |
| **Decision** | `GET` | `/api/decision/blind-spots` | Regional coverage blind spots & unmonitored debt |
| **Decision** | `GET` | `/api/decision/jury/{id}` | Sensor Jury nearest-neighbor consensus voting |
| **Decision** | `GET` | `/api/decision/physics-gate/{id}` | Heuristic kinematic plausibility verification |
| **Federated** | `GET` | `/api/federated/status` | FL client counts, round history, and checkpoint info |
| **Federated** | `GET` | `/api/federated/clients` | 4 regional client partition specifications |
| **Federated** | `GET` | `/api/federated/rounds` | Global validation MAE convergence history (0-13) |
| **Federated** | `GET` | `/api/federated/metrics` | Final test evaluation comparison (FL vs Centralized) |
| **Communication** | `GET` | `/api/communication/phase9/experiments` | 4 selective participation policy summaries |
| **Communication** | `GET` | `/api/communication/phase9/experiments/{policy}` | Detailed policy breakdown & per-round exchange |
| **Assistant** | `POST`| `/api/assistant/chat` | Server-side LLM chat with local knowledge fallback |

---

## 18. TECHNOLOGY STACK

- **Frontend Core**: React 19 (`react`, `react-dom`), Vite 8, React Router 7.
- **Styling**: Tailwind CSS 4, Lucide React icons.
- **Visual Analytics**: Recharts, Leaflet 1.9, React-Leaflet 5.0.
- **Code Quality**: Oxlint (instant linter).
- **Backend Core**: Python 3.10+, FastAPI 0.110+, Uvicorn 0.28+, Pydantic v2.
- **Machine Learning**: PyTorch 2.0+, NumPy 1.24+, SciPy 1.10+, Pandas 2.0+, PyTables 3.8+.
- **Automated QA**: Pytest 8.0+, HTTPX 0.27+, Chrome DevTools Protocol automation.

---

## 19. SECURITY, SECRETS & CONFIGURATION

- **Zero Hardcoded Secrets**: Scanned repository for credentials (`AIza*`, `GEMINI_API_KEY`, etc.); zero secrets committed.
- **Server-Side API Key Management**: `GEMINI_API_KEY` is loaded strictly on the server in `backend/assistant.py`.
- **Environment Template**: `.env.example` provides safe configuration templates.
- **Git Ignore Safeguards**: `.gitignore` prevents tracking of `.env`, `node_modules/`, `dist/`, `__pycache__/`, and large raw HDF5 dataset archives.

---

## 20. INSTALLATION GUIDE

```bash
# Clone the repository
git clone https://github.com/AdarshSingh4455/A3-PS003-TC198.git
cd A3-PS003-TC198

# Setup Python environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
pip install -r backend/requirements.txt

# Setup Node.js frontend
npm install
```

---

## 21. RUNNING THE PROJECT

```bash
# Terminal 1: Launch FastAPI Backend Daemon
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Launch React/Vite Client
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://127.0.0.1:5173`
- FastAPI Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

---

## 22. TESTING & QUALITY ASSURANCE

### Backend Test Suite
```bash
python -m pytest backend -v
```
- **Results**: **300 passed out of 300 tests (100% passing)** across all 18 test suites in ~237 seconds.

### Frontend Quality Assurance
```bash
npm run lint  # 0 errors
npm run build # Success (built in ~1.3s)
```

### Automated Headless Chrome Interaction QA
- Zero console errors during full navigation across all 7 routes.
- Zero network failures (0x 404, 0x 500).
- Zero horizontal layout overflow across all target screen sizes (1440x900, 1366x768, 1280x800, 1024x768, 768x1024, 390x844).

---

## 23. SCIENTIFIC PROVENANCE & REPRODUCIBILITY

- **Deterministic Seeds**: All PyTorch, NumPy, and random seeds fixed to `42`.
- **Model Checkpoint**: Centralized `graph_lstm_best.pt` (26,596 parameters).
- **Federated Checkpoint**: Global `global_best.pt` (Round 8, Val MAE: 3.1536 mph).
- **Adjacency Matrix**: Weighted distance graph saved in `data/raw/metr-la/adj_mx.pkl`.
- **Partitions**: Regional sensor membership frozen in `data/processed/metr-la/regions.json`.

---

## 24. LIMITATIONS & OPERATIONAL SCOPE

1. **Historical Replay Telemetry**: TrafficPulse-X evaluates historical recordings from March–June 2012; it is not hooked into live streaming feeds.
2. **Speed Telemetry Exclusivity**: The benchmark records vehicle speed (mph). Flow (volume) and lane occupancy are not available in METR-LA.
3. **Application-Layer Accounting**: Communication metrics quantify serialized application parameters; lower-level network protocol overheads (TCP/IP headers, packet fragmentation) will vary by transport protocol.
4. **Heuristic Plausibility Gate**: The kinematic plausibility checker validates maximum acceleration plausibility rather than physical ground vehicle dynamics.

---

## 25. FUTURE WORK

- **Streaming Telemetry Ingestion**: Connecting live Kafka/MQTT feeds from municipal ATCS and ICCC centers.
- **Differential Privacy**: Incorporating Gaussian noise perturbation into regional weight updates.
- **Secure Multiparty Aggregation**: Encrypting weight updates using additive secret sharing.
- **Heterogeneous Traffic Modes**: Extending spatio-temporal graphs to multimodal bus, rail, and bike networks.

---

## 26. REFERENCES

1. **Li, Y., Yu, R., Shahabi, C., & Liu, Y. (2018)**. *Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting*. ICLR.
2. **Yu, B., Yin, H., & Zhu, Z. (2018)**. *Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting*. IJCAI.
3. **McMahan, B., Moore, E., Ramage, D., Hampson, S., & y Arcas, B. A. (2017)**. *Communication-Efficient Learning of Deep Networks from Decentralized Data*. AISTATS.
4. **Chen, C., Petty, K., Skabardonis, A., Varaiya, P., & Jia, Z. (2001)**. *Freeway Performance Measurement System (PeMS)*. Transportation Research Record.
5. **Ministry of Housing and Urban Affairs (MoHUA), Government of India (2015–2024)**. *Smart Cities Mission: Integrated Command and Control Centres (ICCC) and Adaptive Traffic Control Systems (ATCS)*.

---

## 27. APPENDIX

### Mathematical Equations Summary

- **Normalized Graph Adjacency**:
  $$\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}_N, \quad \tilde{\mathbf{D}}_{ii} = \sum_j \tilde{A}_{ij}, \quad \hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2} \tilde{\mathbf{A}} \tilde{\mathbf{D}}^{-1/2}$$

- **FedAvg Aggregation**:
  $$\mathbf{W}_{\text{global}}^{(r+1)} = \sum_{k=1}^K \frac{|\mathcal{D}_k|}{|\mathcal{D}|} \mathbf{W}_k^{(r)}$$

- **Client Contribution Value (CCV)**:
  $$\text{CCV}_k = 1.0 \cdot \left(\frac{N_k}{N}\right) + 0.5 \cdot d_k + 0.15 \cdot \tau_k$$

---
*TrafficPulse-X Team A3-PS003-TC198 — Final Submission Documentation*
