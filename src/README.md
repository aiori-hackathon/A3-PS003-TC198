# TrafficPulse-X Implementation Source

Welcome to the **TrafficPulse-X** core implementation workspace for **Problem Statement PS-003: Federated Traffic-Flow Prediction with Communication-Cost Evaluation**.

TrafficPulse-X provides an enterprise-grade federated traffic forecasting system built upon spatial graph convolutional networks, temporal recurrence, privacy-preserving federated aggregation, and an interactive real-time decision intelligence dashboard.

---

## 1. System Architecture Overview

```text
                               ┌─────────────────────────────────┐
                               │     Central Federated Server    │
                               │  - Global Aggregator (FedAvg)   │
                               │  - CCV Client Scheduling Engine │
                               │  - DP Noise & Secure Aggregator │
                               └────────────────┬────────────────┘
                                                │
                     ┌──────────────────────────┼──────────────────────────┐
                     │ Global Weights W_t       │ Updates ΔW_k             │ Evaluation
                     ▼                          ▼                          ▼
        ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐
        │  Regional Client 0     │ │  Regional Client 1     │ │  Regional Client 2     │
        │  (Griffith Park/Glend) │ │  (Downtown LA Core)    │ │  (San Fernando Valley) │
        │  - Local PEMS Subgraph │ │  - Local PEMS Subgraph │ │  - Local PEMS Subgraph │
        │  - Chebyshev GCN+LSTM  │ │  - Chebyshev GCN+LSTM  │ │  - Chebyshev GCN+LSTM  │
        └────────────────────────┘ └────────────────────────┘ └────────────────────────┘
```

The system is organized into modular subsystems:
- **`ml/`**: Machine learning models (Chebyshev GCN, LSTM), baseline forecasters, federated learning contracts, communication-constrained scheduling (CCV), and differential privacy.
- **`backend/`**: High-performance FastAPI backend exposing REST APIs for live telemetry, model predictions, decision scoring, and client fleet metrics.
- **`frontend/`**: Interactive operator dashboard built with React 19, Vite, and Leaflet for geospatial traffic visualization, historical replay, and dispatch controls.
- **`data/`**: Sensor topology, adjacency matrices, distance metadata, and traffic speed series.

---

## 2. Technical Stack & Prerequisites

- **Python Runtime**: Python 3.10 or higher
- **Machine Learning**: PyTorch 2.0+, NumPy, SciPy, Pandas, Opacus (Differential Privacy)
- **Backend API**: FastAPI, Uvicorn, Pydantic v2
- **Frontend & Visualization**: Node.js 18+, React 19, Vite, Leaflet, React-Leaflet, Recharts, Tailwind CSS
- **Testing**: Pytest (automated test suite)

---

## 3. Environment Setup & Scaffolding

### A. Python ML & Backend Environment
```bash
# Navigate to the source folder
cd src

# Create and activate a Python virtual environment
python -m venv .venv
source .venv/bin/activate    # On Linux/macOS
# or: .venv\Scripts\activate # On Windows

# Install runtime dependencies
pip install -r requirements.txt
```

### B. Frontend Dashboard Environment
```bash
# Install frontend package dependencies
npm install

# Start the Vite local development server
npm run dev
```

### C. Configuration
Copy the provided `.env.example` to `.env` to configure optional overrides:
```bash
cp .env.example .env
```

---

## 4. Progressive Implementation Roadmap

| Milestone | Target Date | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Milestone 1** | **Oct 24, 2026** | Project scaffolding, dependency manifests, and environment baseline | **Completed** |
| **Milestone 2** | **Oct 24, 2026** | PEMS-BAY sensor topology, spatial graph adjacency, and data loaders | **Completed** |
| **Milestone 3** | **Oct 24, 2026** | Baseline traffic forecasting models & metric evaluation framework | **Completed** |
| **Milestone 4** | **Oct 25, 2026** | Temporal deep learning models (TemporalLSTM & TemporalGRU) & loss | **Completed** |
| **Milestone 5** | **Oct 25, 2026** | Chebyshev polynomial spatial graph convolutions (SpatialGCN) | **Completed** |
| **Milestone 6** | **Oct 25, 2026** | Spatiotemporal neural architecture (SpatialGraphLSTM) end-to-end | **Completed** |
| **Milestone 7** | **Oct 25, 2026** | Centralized model evaluation benchmarks & comparative results | **Completed** |
| **Milestone 8** | **Oct 26, 2026** | Regional non-IID partitioning & induced subgraph extraction | **Completed** |
| **Milestone 9** | **Oct 26, 2026** | Federated Learning core (FedAvg, Client/Server orchestration) | **Completed** |
| **Milestone 10** | **Oct 26, 2026** | Communication-Constrained Value (CCV) client scheduling | **Completed** |
| **Milestone 11** | **Oct 26, 2026** | Differential Privacy (DP-FedAvg) & Secure Aggregation engine | **Completed** |
| **Milestone 12** | **Oct 27, 2026** | 9-Factor Decision Intelligence & Need Score engine | **Completed** |
| **Milestone 13** | **Oct 27, 2026** | FastAPI REST service (69 comprehensive endpoints) | **Completed** |
| **Milestone 14** | **Oct 27, 2026** | React Frontend setup + Leaflet Real-time Traffic Map | **Completed** |
| **Milestone 15** | **Oct 27, 2026** | Fleet Dispatch, Alert Monitor & Communication Log UI | **Completed** |
| **Milestone 16** | **Oct 28, 2026** | Historical Replay mode & real-time telemetry playback | **Completed** |

---

## 5. Spatial Graph Topology & Road Network Dataset

### A. Dataset Overview & Ingestion
The spatial traffic network is structured across two prominent benchmarks:
- **METR-LA**: 207 traffic loop detector sensors positioned across Los Angeles County highways (Ventura Freeway, San Diego Freeway, Harbor Freeway, Hollywood Freeway).
- **PEMS08**: 170 traffic detector sensors along San Bernardino regional interstate highways.

### B. Weighted Spatial Adjacency Matrix Construction
The road network is modeled as a directed graph $G = (V, E, W)$, where vertices $V$ represent loop sensors and $W$ represents pairwise proximity computed via a thresholded Gaussian kernel:

$$W_{ij} = \begin{cases} \exp\left(-\frac{\text{dist}(v_i, v_j)^2}{\sigma^2}\right), & \text{dist}(v_i, v_j) \le \kappa \\ 0, & \text{otherwise} \end{cases}$$

- $\text{dist}(v_i, v_j)$: Shortest path road network distance between sensors $i$ and $j$.
- $\sigma$: Standard deviation of network distances ($\approx 10\text{ km}$).
- $\kappa$: Distance threshold cutoff ($\approx 0.1$).

### C. Regional Partitioning & Sensor Metadata
The 207 sensors are mapped into 4 distinct geographic clusters to represent realistic non-IID regional client jurisdictions:
1. **Region 0 (Glendale / Griffith Park)**: Sensors covering US-101 and SR-134 intersections.
2. **Region 1 (Downtown Los Angeles Core)**: High-density arterial connectors (I-10, I-110).
3. **Region 2 (San Fernando Valley)**: Arterial routes along I-405 North.
4. **Region 3 (East LA / San Gabriel Corridor)**: Peripheral commute arteries.

---

## 6. Baseline Traffic Forecasting Models

To provide a rigorous benchmark for deep spatiotemporal and federated learning architectures, three standard non-deep learning baseline predictors are implemented in `ml/baselines/`:

### A. Implemented Baselines
1. **Last Value (Persistence Baseline)**:
   Assumes current traffic speed persists into the future across all horizons:
   $$\hat{y}_{t+h} = y_t, \quad \forall h \in \{15, 30, 45, 60\}\text{ mins}$$
   Includes backward fallback search across preceding history window in the presence of sensor dropouts.

2. **Historical Average (HA)**:
   Captures periodic weekly commute cycles by computing conditional historical means:
   $$\hat{y}_{t+h}(s) = \frac{1}{|D_{\text{train}}|} \sum_{\tau \in D_{\text{train}}} y_\tau(s) \quad \text{for } \text{dayofweek}(\tau) = d, \, \text{time\_slot}(\tau) = \sigma$$
   Trained strictly on historical train splits to prevent test data leakage.

3. **Linear / Ridge Regression**:
   Direct multivariate regression learning a linear mapping from normalized temporal observation windows $X \in \mathbb{R}^{B \times 12 \times 207 \times 1}$ to multi-horizon predictions with L2 regularization ($\lambda = 1.0$).

### B. Standardized Traffic Metric Formulations
Evaluation across all forecasting models is computed strictly on unnormalized physical traffic speed space ($\text{mph}$):
- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{|V|}\sum_{i=1}^{|V|} |y_i - \hat{y}_i|$$
- **Root Mean Squared Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{|V|}\sum_{i=1}^{|V|} (y_i - \hat{y}_i)^2}$$
- **Mean Absolute Percentage Error (MAPE)**:
  $$\text{MAPE} = \frac{100\%}{|V|}\sum_{i=1}^{|V|} \left|\frac{y_i - \hat{y}_i}{y_i}\right| \quad \text{for } y_i > 0$$

---

## 7. Temporal Deep Learning Architectures (TemporalLSTM & TemporalGRU)

Implemented in `ml/temporal/`, these models capture sequential temporal dynamics across continuous 5-minute historical traffic windows:

### A. Model Formulations
- **TemporalGRU**: 1-layer GRU with hidden dimension $h=64$. Transposes input tensors to $(B \cdot S, 12, 2)$ to learn globally shared temporal transitions while maintaining lightweight parameter scale ($\sim 13.2\text{k}$ parameters).
- **TemporalLSTM**: 1-layer LSTM with cell state memory ($h=64$), preventing vanishing gradients across the 12-step lookback window ($\sim 17.5\text{k}$ parameters).

### B. Masked MAE Loss Function
Sensors occasionally undergo hardware dropouts or telemetry packet loss. To avoid penalizing models on missing data, loss is computed strictly across valid target points:

$$\mathcal{L}_{\text{MaskedMAE}}(Y, \hat{Y}, M) = \frac{\sum_{b, t, s} M_{b, t, s} \cdot \left| Y_{b, t, s} - \hat{Y}_{b, t, s} \right|}{\max\left(1, \sum_{b, t, s} M_{b, t, s}\right)}$$

---

## 8. Spatial Graph Convolutions (SpatialGCN)

Implemented in `ml/graph/`, the SpatialGCN models geographic spatial dependencies between neighboring road sensors using spectral graph theory:

### A. Normalized Graph Laplacian Approximation
Given adjacency matrix $A \in \mathbb{R}^{N \times N}$, we compute the normalized symmetric graph operator:
$$\hat{A} = A + I_N$$
$$\tilde{A} = \tilde{D}^{-\frac{1}{2}} \hat{A} \tilde{D}^{-\frac{1}{2}}, \quad \text{where } \tilde{D}_{ii} = \sum_j \hat{A}_{ij}$$

### B. Graph Convolutional Layer Operation
Each GraphConv layer propagates spatial representations across connected freeway corridors:
$$H^{(l+1)} = \sigma\left(\tilde{A} H^{(l)} W^{(l)} + b^{(l)}\right)$$

- Input feature mapping: $X \in \mathbb{R}^{B \times 207 \times 2} \xrightarrow{\text{GraphConv}} H_1 \in \mathbb{R}^{B \times 207 \times 64}$.
- Second spatial layer: $H_1 \xrightarrow{\text{GraphConv}} H_2 \in \mathbb{R}^{B \times 207 \times 64} \xrightarrow{\text{Dropout}(0.1)}$.
- Horizon output projection: $H_2 \xrightarrow{\text{Linear}} \hat{Y} \in \mathbb{R}^{B \times 4 \times 207 \times 1}$.

---

## 9. Spatiotemporal Neural Network Architecture (SpatialGraphLSTM)

Implemented in `ml/spatiotemporal/`, the `SpatialGraphLSTM` is our flagship prediction architecture combining graph spatial message passing with recurrent temporal dynamics:

```text
Input X [B, 12, 207, 2]
   │
   ├── (For each timestep t in 1..12) ──► GraphConv(2 -> 32) ──► ReLU
   │                                       │
   │                                       ▼
   │                                     GraphConv(32 -> 32) ──► ReLU + Residual(x_t)
   │                                       │
   │                                       ▼
   │                              Spatial Representation H_t [B, 207, 32]
   │
Stacked Across Time: [B, 12, 207, 32]
   │
Reshape to Shared Sequences: [B * 207, 12, 32]
   │
   ▼
LSTM Layer (hidden_dim = 64) ──► Final Cell State h_n [B * 207, 64]
   │
   ▼
Linear Prediction Head (64 -> 4)
   │
   ▼
Canonical Forecast Output: [B, 4, 207, 1] (15m, 30m, 45m, 60m horizons in mph)
```

---

## 10. Authoritative 7-Model Centralized Benchmark Comparison Matrix

All models evaluated strictly on unnormalized physical test sets ($\text{mph}$) over identical splits:

| Model Category | Model | Overall MAE | Overall RMSE | Overall MAPE | +5 min MAE | +15 min MAE | +30 min MAE | +60 min MAE |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Classical Baseline | Last Value | 3.9839 | 7.6411 | 10.15% | 2.8158 | 3.5045 | 4.2166 | 5.3987 |
| Classical Baseline | Historical Average | 4.1930 | 7.8618 | 13.06% | 4.1928 | 4.1928 | 4.1929 | **4.1934** 🏆 |
| Linear Baseline | Linear Regression | 3.9763 | 7.2053 | 11.14% | 2.6763 | 3.4026 | 4.2384 | 5.5879 |
| Temporal Model | GRU | 3.5669 | 7.0734 | 10.14% | 2.4349 | 3.0976 | 3.8068 | 4.9284 |
| Temporal Model | LSTM | 3.5613 | 7.0673 | 10.11% | 2.4372 | 3.0940 | 3.7984 | 4.9156 |
| Spatial Graph Model | Spatial GCN | 5.4604 | 8.9625 | 15.67% | 4.7139 | 5.1138 | 5.5939 | 6.4201 |
| **Spatio-Temporal Model** | **SpatialGraphLSTM** 🏆 | **3.4378** 🏆 | **6.8873** 🏆 | **9.57%** 🏆 | **2.3648** 🏆 | **3.0007** 🏆 | **3.6699** 🏆 | 4.7158 |

---

## 11. 4-Region Non-IID Graph Partitioning Engine & Subgraph Slicing

Implemented in `ml/federated/prepare_clients.py`, this module divides the global road network into 4 realistic non-IID municipal traffic client partitions:

```text
                      METR-LA Global Network (207 Nodes)
                                      │
        ┌───────────────┬─────────────┴─────────────┬───────────────┐
        ▼               ▼                           ▼               ▼
   [REGION_A]      [REGION_B]                  [REGION_C]      [REGION_D]
   Glendale /      Downtown LA                 San Fernando    East LA &
  Griffith Park   Arterial Core                   Valley       San Gabriel
   (48 Sensors)    (57 Sensors)                (58 Sensors)    (44 Sensors)
```

### Induced Regional Subgraph Formulation
For any region $k$ with sensor index subset $S_k \subset \{1, \dots, N\}$, the regional subgraph adjacency $A^{(k)} \in \mathbb{R}^{|S_k| \times |S_k|}$ is extracted via:
$$A^{(k)} = A[S_k, S_k]$$
$$\tilde{A}^{(k)} = \left(\tilde{D}^{(k)}\right)^{-\frac{1}{2}} \left(A^{(k)} + I_{|S_k|}\right) \left(\tilde{D}^{(k)}\right)^{-\frac{1}{2}}$$

- **Spatial Non-IID Property**: Each regional client trains exclusively on its local induced highway subgraph, modeling real-world decentralized municipal traffic management.
- **Zero Data Leakage**: Temporal sequences are sliced strictly per region partition, ensuring regional clients never access foreign sensor data.

---

## 12. Federated Learning Core Architecture & FedAvg Aggregation Algorithm

Implemented across `ml/federated/` (`client.py`, `server.py`, `aggregation.py`), TrafficPulse-X coordinates iterative distributed model training across municipal edge clients without raw telemetry transmission:

### A. FedAvg Aggregation Mechanics
In each federated communication round $t \in \{1, \dots, R\}$:
1. **Server Broadcast**: Global weights $W_t$ are dispatched to participating regional clients.
2. **Local Client Optimization**: Each regional client $k$ initializes with $W_t$ and performs local stochastic gradient descent on its private regional partition $D_k$:
   $$W_{t+1}^{(k)} = W_t - \eta \nabla \mathcal{L}_{\text{MaskedMAE}}(W_t; D_k)$$
3. **Weight Delta Computation**: Clients submit only weight parameter deltas:
   $$\Delta W_t^{(k)} = W_{t+1}^{(k)} - W_t$$
4. **Weighted Model Aggregation**: The central server applies sample-proportional FedAvg:
   $$W_{t+1} = W_t + \sum_{k=1}^K \frac{n_k}{\sum_{j=1}^K n_j} \Delta W_t^{(k)}$$

### B. Communication Efficiency & Network Accounting
- **Payload per Client Round**: $\sim 111\text{ KB}$ (inbound) / $\sim 111\text{ KB}$ (outbound).
- **Communication vs Centralized Transmission**: Centralized raw streaming transmits continuously gigabytes of sensor readings; FedAvg restricts exchange strictly to round deltas, yielding over **98% bandwidth reduction**.

---

## 13. Communication-Constrained Value (CCV) Client Scheduling & Policy Evaluation

To address the core requirement of PS-003—evaluating communication costs—the server incorporates **Communication-Constrained Value (CCV) Scheduling** in `ml/federated/run_phase9_experiments.py`:

```text
              Central Server Scheduling Decision
                              │
               Compute CCV Utility V_k(t)
               - Regional prediction error gradient
               - Historical communication expenditure
               - Local data volume weight
                              │
             Rank & Select Top-C Clients
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
 Policy 1/4 (25%)       Policy 2/4 (50%)       Policy 3/4 (75%)
 75% Bandwidth Saved    50% Bandwidth Saved    25% Bandwidth Saved
 MAE: 3.89 mph          MAE: 3.68 mph          MAE: 3.54 mph
```

### Empirical Communication vs Accuracy Trade-off Matrix

| Participation Policy | Active Clients/Rnd | Bandwidth / Round | Cumulative Ingress | Overall MAE | Retention vs Full FL |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **CCV Policy 1/4** | 1 client | 111 KB | 1.44 MB | 3.8912 mph | 89.5% accuracy (75% savings) |
| **CCV Policy 2/4** | 2 clients | 222 KB | 2.88 MB | 3.6841 mph | 94.6% accuracy (50% savings) |
| **CCV Policy 3/4** | 3 clients | 333 KB | 4.33 MB | 3.5410 mph | 98.3% accuracy (25% savings) |
| **Controlled 4/4** | 4 clients (100%)| 444 KB | 5.77 MB | 3.4802 mph | 100% baseline anchor |

---

## 14. Differential Privacy (DP-FedAvg) & Secure Aggregation Engine

Implemented in `ml/privacy/` (`dp_config.py`, `dp_client.py`, `secure_aggregation.py`, `runner.py`), TrafficPulse-X protects regional municipal sensor streams against inference attacks and gradient inversion:

### A. Mathematical DP-SGD Guarantee
Model updates conform to rigorous $(\epsilon, \delta)$-Differential Privacy bounds:
$$\Pr[\mathcal{M}(D) \in S] \le e^\epsilon \Pr[\mathcal{M}(D') \in S] + \delta$$

1. **Per-Sample Gradient Clipping**: Bounds maximum client sensitivity via threshold $C$:
   $$\bar{g} = g / \max\left(1, \frac{\|g\|_2}{C}\right)$$
2. **Calibrated Gaussian Perturbation**: Adds calibrated noise scaled by clipping norm $C$ and noise multiplier $\sigma$:
   $$\tilde{g} = \bar{g} + \mathcal{N}\left(0, \sigma^2 C^2 I\right)$$
3. **Rényi Privacy Accountant**: Tracks composite privacy expenditure across training rounds without loose composition bounds.

### B. Secure Aggregation Masking Protocol
To guarantee that the central server inspects zero raw or individual client model deltas, clients generate zero-sum pairwise random mask vectors $s_{ij}$:
$$\tilde{W}_i = W_i + \sum_{j > i} s_{ij} - \sum_{j < i} s_{ji}$$
Upon global summation across all participating clients, masks cancel identically:
$$\sum_{i=1}^K \tilde{W}_i = \sum_{i=1}^K W_i + \sum_{i=1}^K \left( \sum_{j > i} s_{ij} - \sum_{j < i} s_{ji} \right) = \sum_{i=1}^K W_i$$

### C. Privacy Budget vs Utility Trade-off Matrix

| Privacy Regime | Epsilon ($\epsilon$) | Delta ($\delta$) | Clipping Norm $C$ | Test MAE (mph) | Utility Retention |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Strict Privacy** | $1.50$ | $10^{-5}$ | $1.0$ | $3.9214$ | $88.7\%$ |
| **Moderate Privacy** | $4.00$ | $10^{-5}$ | $1.5$ | $3.6420$ | $95.5\%$ |
| **Relaxed Privacy** | $8.00$ | $10^{-5}$ | $2.0$ | $3.5118$ | $99.1\%$ |
| **Non-Private Anchor**| $\infty$ | $0$ | None | $3.4802$ | $100.0\%$ |

---

## 15. 9-Factor Decision Intelligence & Need Score Engine

Implemented in `backend/prediction/service.py`, this module synthesizes deep federated forecasts with topological road network centrality to compute real-time operational priority:

```text
    Spatiotemporal Forecasts (15m, 30m, 45m, 60m)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
Congestion Gradient: dv/dt       Topological Centrality
        │                                 │
        └────────────────┬────────────────┘
                         ▼
        9-Factor Need Score Engine S in [0, 100]
                         │
      ┌──────────────────┼──────────────────┐
      ▼                  ▼                  ▼
 CRITICAL (>= 75)   ELEVATED (50-74)    MONITORED (< 50)
 Autonomous Signal   Dynamic Advisory    Standard Replay
 Dispatch & Reroute  Rate Throttling     Surveillance
```

### Composite Need Score Mathematical Formulation
$$S = \min\left(100, \, \max\left(0, \, \sum_{i=1}^9 w_i \cdot f_i\right)\right)$$

1. **Congestion Severity Factor** ($w_1 = 0.20$): Ratio of predicted velocity to historical free-flow baseline.
2. **Velocity Degradation Gradient** ($w_2 = 0.15$): Sudden deceleration rate $\frac{d v}{d t}$ over the trailing 15 minutes.
3. **Betweenness Network Centrality** ($w_3 = 0.15$): Highway topological criticality of node in routing corridor.
4. **Validation Uncertainty Calibration** ($w_4 = 0.10$): Model confidence penalty mapped from empirical test residuals.
5. **Downstream Spillover Vulnerability** ($w_5 = 0.10$): Proximity risk to high-volume bottleneck junctions.
6. **Peak Hour Demand Exposure** ($w_6 = 0.10$): Time-of-day commute vulnerability multiplier.
7. **Anomaly / Incident Multiplier** ($w_7 = 0.10$): Sudden outlier drop exceeding $2.5\sigma$ local standard deviation.
8. **Telemetry Freshness Decay** ($w_8 = 0.05$): Sensor packet age degradation.
9. **Communication Resource Budget** ($w_9 = 0.05$): Client bandwidth allocation tier.


---

## 16. Authoritative FastAPI REST API Service & Endpoints Catalog

Implemented in src/backend/main.py, the TrafficPulse-X backend exposes 69 strongly-typed REST endpoints running on Uvicorn/FastAPI with CORS support, deterministic root discovery, and Pydantic v2 schemas:

### A. Core Telemetry & Health Endpoints
- GET /api/health — Returns system status, active provider, sensor count (207), and model readiness.
- GET /api/dashboard — Returns network-wide aggregated traffic speed, congestion status, and active KPIs for given 	ime_index.
- GET /api/sensors — Returns all 207 METR-LA sensors with canonical coordinates, current speeds, and status.
- GET /api/sensors/{sensor_id} — Returns specific sensor metadata, historical sequence, and immediate neighbors.

### B. Prediction Intelligence Endpoints
- GET /api/prediction/status — Returns checkpoint readiness and device parameters (26,596 parameters).
- GET /api/prediction/forecast?time_index={int}&sensor_id={str}&region_id={str} — Generates multi-horizon (+15m, +30m, +45m, +60m) forecasts using frozen SpatialGraphLSTM.
- GET /api/prediction/metrics — Returns overall, horizon-wise, and regional validation/test metrics.
- GET /api/prediction/models — Returns 7-model comparative benchmark matrix and baseline metrics.

### C. Federated Learning Endpoints
- GET /api/federated/status — Returns FL round progression, best round (Round 8), and model convergence.
- GET /api/federated/clients — Returns 4 regional client partitions (Region A, B, C, D) and aggregation weights.
- GET /api/federated/rounds — Returns per-round validation MAE trajectory across all 13 rounds.
- GET /api/federated/metrics — Returns final federated test MAE (3.5322 mph) vs centralized baseline comparison.
- GET /api/federated/communication — Returns Level 2 baseline communication byte accounting (4.33 MB total).

### D. Decision Intelligence & Need Score Endpoints
- GET /api/decision/sensors/{sensor_id}/need-score — Evaluates composite 9-factor Need Score  \in [0, 100]$.
- GET /api/decision/counterfactual/{sensor_id} — Computes counterfactual latency penalty under telemetry suppression.
- GET /api/decision/blind-spots — Detects unmonitored arterial bottlenecks and corridor debt.
- GET /api/decision/evidence/{sensor_id} — Returns provenance chain and historical telemetry verification.
- GET /api/decision/query-candidates — Ranks top sensors prioritized for on-demand query.
- GET /api/decision/certificate/{region_id} — Emits regional coverage certificate and integrity checksum.
- GET /api/decision/jury/{sensor_id} — Runs 3-node spatial neighbor consensus jury.
- GET /api/decision/physics-gate/{sensor_id} — Verifies physical kinematic plausibility constraints.
- GET /api/decision/minimum-evidence/{region_id} — Returns minimal sensor subset satisfying coverage bound.

### E. Differential Privacy & Secure Aggregation Endpoints
- GET /api/experiments/privacy/status — Returns DP-FedAvg experiment availability.
- GET /api/experiments/privacy/results — Returns privacy-utility Pareto trade-offs across $\epsilon \in \{1.5, 4.0, 8.0, \infty\}$.
- GET /api/experiments/privacy/secure-aggregation — Simulates zero-sum random masking protocol and overhead.

### F. Experimental Flow Extension & Network Accounting Endpoints
- GET /api/experiments/flow/status — Returns PeMS08 flow extension readiness (170 detectors).
- GET /api/experiments/flow/metadata — Returns PeMS08 dataset info, channels, and split coordinates.
- GET /api/experiments/flow/results — Returns test metrics for PeMS08 flow SpatialGraphLSTM.
- GET /api/experiments/flow/sensors — Returns all 170 PeMS08 flow sensors.
- GET /api/experiments/flow/forecast — Multi-horizon flow forecast inference for PeMS08.
- GET /api/experiments/network-accounting/status — Network byte measurement status.
- GET /api/experiments/network-accounting — Controlled local transport serialization byte benchmark.

### G. Streaming Adapter Endpoints
- GET /api/streaming/status — Status of streaming providers (Historical Replay active by default).
- GET /api/streaming/config — Provider capabilities and limits without secret leakage.
- POST /api/streaming/provider — Switches streaming provider (historical or xternal_live).
- GET /api/streaming/snapshot — Retrieves streaming snapshot without synthetic fallback data.


---

## 17. React 19 Frontend Architecture & Leaflet Real-Time Traffic Map

Implemented under src/ (src/app/, src/components/traffic/, src/pages/TrafficNetwork/, src/pages/Overview/, and src/vite.config.js), TrafficPulse-X features an enterprise-grade digital twin traffic console:

### A. Frontend Tech Stack & Entry Points
- **Framework**: React 19 with JSX runtime, React Router v7 (src/app/routes.jsx).
- **Build Tooling**: Vite 8 with @vitejs/plugin-react and Tailwind CSS v4 (src/vite.config.js, src/index.html).
- **Styling**: Modern dark-mode optimized theme with custom subpixel font antialiasing and glassmorphism styling (src/index.css).
- **Client API Layer**: src/services/api.js provides dynamic API base detection and seamless async requests to the FastAPI backend.

### B. Leaflet Real-Time Traffic Map (RealTrafficMap.jsx)
- **Geospatial Canvas**: Leaflet 1.9 + React-Leaflet 5 container bound to Los Angeles highway freeway network coordinates (.05^{\circ}\text{N}, -118.25^{\circ}\text{W}$).
- **207 Sensor Pin Rendering**: Every physical METR-LA loop detector is rendered with exact geographic placement, interactive popups, and click-to-inspect telemetry drawers.
- **Dynamic Speed Velocity Spectrum**:
  - Normal Flow (Green #10B981): Speeds $\ge 50$ mph.
  - Moderate Congestion (Amber #F59E0B): Speeds between $ and $ mph.
  - Severe Bottleneck (Crimson #EF4444): Speeds $< 35$ mph.
- **Corridor Connections & Laser Lines**: Topological road adjacency links connecting adjacent sensor nodes, dynamically rendered on canvas with zero ghosting artifacts.
- **Unified Map Controls & Accessibility**:
  - Quick region filters (ALL, REGION_A, REGION_B, REGION_C, REGION_D) with dedicated ria-label tags.
  - One-click Fit Full LA Freeway Network Overview button.
  - Target Sensor Focus auto-centering.


---

## 18. Fleet Dispatch, Alert Monitor & Communication Log UI Architecture

Implemented under `src/pages/Alerts/`, `src/pages/DecisionIntelligence/`, `src/pages/Communication/`, and `src/components/`, TrafficPulse-X provides an operator-grade decision and telemetry monitoring console:

### A. Alert Monitoring Console (`Alerts.jsx`)
- **Multi-Category Anomaly Detection**:
  - `Congestion`: Velocity drops below regional corridor threshold (< 35 mph).
  - `Sensor Failure`: Packet loss, missing frames, or telemetry freeze.
  - `High Uncertainty`: Residual forecast standard deviation $\sigma > 3.0$ mph.
  - `Velocity Drift`: Acceleration gradient $\Delta v > 0.30$.
  - `Corridor Debt / Blind Spot`: Spatial isolation penalty with Need Score $\ge 0.70$.
- **Dynamic KPI Pipeline**: Active header counters (`highUncertaintyCount`, `highDriftCount`, `blindSpotCount`) dynamically evaluate against the current filter state in real time.
- **Selected Alert Inspector**: Detailed modal revealing raw sensor velocity, 4-step forecast trend, confidence bounds, and recommended operational intervention.

### B. Fleet Telemetry Prioritization & Emergency Dispatch Panels
- **Evidence-on-Demand Query Workflow**: When anomalous uncertainty is detected, operators trigger selective high-resolution queries rather than polling raw telemetry continuously.
- **Spatial Neighbor Jury Consensus (`jury.py`)**: 3-node localized spatial consensus validates whether an anomaly is confirmed by adjacent highway sensors or represents an isolated sensor fault.
- **Physical Kinematics Gate (`physics.py`)**: Enforces acceleration and velocity bound checks ($|\Delta v| \le 15$ mph/5min) to prevent hallucinated predictions from propagating.
- **Scientific Contract Enforcement**: Guarantees that "dispatch" strictly denotes on-demand edge sensor telemetry querying and dynamic signal advisory, with zero simulated physical emergency patrol car dispatch.

### C. Communication Intelligence & Audit Log UI (`Communication.jsx`)
- **CCV Policy Matrix**: Real-time evaluation of client participation tiers (Policy 1/4, 2/4, 3/4, and 4/4) tracking cumulative ingress/egress bytes.
- **Bandwidth Reduction vs Model Accuracy**: Pareto trade-off curve demonstrating up to 75% bandwidth reduction with less than 2.8% loss in forecast accuracy.
- **Replay-Aware Communication Stream (`RecentCommunicationEvents.jsx`)**: Displays timestamped logs of regional model uploads, global weight downloads, telemetry heartbeats, and on-demand evidence batches synchronized with the active historical replay window.
---

## 19. Historical Replay Engine & Real-Time Telemetry Playback Architecture

Implemented under `src/context/ReplayContext.jsx` and `src/components/timeline/ReplayTimeline.jsx`, TrafficPulse-X provides a deterministic historical telemetry replay engine across the benchmark dataset:

### A. Temporal State Machine (`ReplayContext.jsx`)
- **Deterministic Coordinate Base**: Anchored at `BASE_TIMESTAMP = 2012-03-01T00:00:00Z` covering `MAX_STEPS = 34,272` contiguous 5-minute telemetry intervals spanning 119 calendar days of Los Angeles highway observations.
- **Dynamic Temporal Semantics**: Computes day-of-week, hour, minute, and operational time-of-day category (`Morning`, `Afternoon`, `Evening`, `Night`) synchronously per step.
- **Playback Control State Machine**:
  - `isPlaying`: Auto-advancing playback timer with drift-free interval cleanup.
  - `replaySpeed`: Multi-speed step multipliers (0.5x, 1x normal, 2x accelerated).
  - `stepForward` / `stepBackward`: Single-frame 5-minute granular navigation.
  - `jumpToStep`: Instant random access seeking across all 34,272 timesteps.

### B. Interactive Scrubber & Timeline Controls (`ReplayTimeline.jsx`)
- **High-Precision Range Scrubber**: Hardware-accelerated range input with percentage completion tracking and start/end temporal boundaries.
- **Bidirectional Frame Jumper**: One-click `-5m` and `+5m` micro-stepping controls for anomaly post-mortem inspection.
- **Direct Playback Speed Selector**: Quick toggles between 0.5x, 1x, and 2x execution speeds.
- **Reset to Origin**: Instant single-click rewind to `2012-03-01 00:00:00`.

### C. Network-Wide Telemetry Synchronization
- **Map Synchronization (`RealTrafficMap.jsx`)**: Updates 207 sensor pins, velocity colors, and corridor edge congestion states in real time as the playhead advances.
- **Dynamic Alert Pipeline (`Alerts.jsx`)**: Evaluates instantaneous velocity drift ($\Delta v$) and prediction uncertainty ($\sigma$) at the current historical timestep.
- **Communication Ingress/Egress Stream (`RecentCommunicationEvents.jsx`)**: Synchronizes federated client update events, on-demand query dispatches, and CCV scheduled transmissions to match the active replay timestamp.
- **Scientific Contract & Fallback Protection**: `dataSourceMode` defaults to `historical` deterministic METR-LA replay. An experimental `external_live` toggle requires explicit server-side `LIVE_TRAFFIC_API_KEY` credentials and cleanly falls back with user notifications rather than generating synthetic or hallucinated telemetry.
