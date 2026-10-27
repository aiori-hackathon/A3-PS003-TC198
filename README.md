# AIORI 3 Hackathon ── Team A3-PS003-TC198

## AIORI-3 Hackathon Submission Details

- **Hackathon:** AIORI 3 (All India Open Research Initiative)
- **Problem Statement ID:** PS-003
- **Problem Statement:** Federated Traffic-Flow Prediction with Communication-Cost Evaluation
- **Team Code:** A3-PS003-TC198
- **Project Name:** TrafficPulse-X
- **Team Leader:** Adarsh Singh (`adarsh04455@gmail.com`)
- **Team Member:** Shaurya Singh (`shauryapratapsingh723@gmail.com`)
- **Faculty Mentor:** Aditya Sir

---

## Problem Statement

**Federated Traffic-Flow Prediction with Communication-Cost Evaluation**

The problem focuses on building a traffic forecasting system using federated learning while also evaluating the communication required between distributed clients and a central server.

Centralized intelligent transportation systems transmit continuous high-frequency traffic sensor streams from hundreds of municipal loop detectors to a central server, causing severe bandwidth bottlenecks, WAN congestion, and telemetry dropouts. Furthermore, real-world road networks exhibit non-IID spatial heterogeneity across municipal sectors, and centralizing raw traffic data raises privacy and governance concerns.

---

## Our Proposed Solution

Our solution is **TrafficPulse-X**.

TrafficPulse-X uses historical traffic sensor data to forecast future traffic conditions while allowing regional clients to train locally. Instead of continuously sending all raw traffic data to a central server, regional clients train locally on induced road subgraphs and share model updates for federated aggregation.

Our proposed solution includes:

- **Graph + LSTM Spatio-Temporal Forecasting**: Chebyshev spectral graph convolutions combined with recurrent LSTM cells (`SpatialGraphLSTM`).
- **Federated Learning using FedAvg**: Weighted parameter aggregation across 4 non-IID regional client sectors.
- **Regional Non-IID Client Partitions**: Evaluated on 207 METR-LA inductive loop sensors and 170 PeMS08 flow stations.
- **Communication-Cost Evaluation**: Dual accounting measuring serialized tensor payload (110,271 Bytes / round) and controlled socket wire bytes (+0.298% transport framing).
- **Selective Client Participation (CCV)**: Client Contribution Value scheduling achieving a **50% Pareto-optimal communication reduction** with only a +0.0944 mph MAE delta.
- **Decision Intelligence**: Dynamic 9-factor Need Score engine and Sensor Jury consensus.
- **Interactive Traffic Analysis Dashboard**: React 19 / Vite single-page application with Leaflet spatial mapping and a 34,272-step historical replay engine.

The aim is to study whether federated traffic forecasting can maintain useful prediction quality while reducing unnecessary communication.

---

## Project Presentation

Our AIORI project presentation slide deck is available here:

- [View Project Presentation Deck](./A3-PS003-TC198-Presentation.pdf)

---

## Team Introduction & Demo Videos

Our team introduction and demonstration videos cover:

- Team member roles and responsibilities
- Understanding and formalization of Problem Statement PS-003
- Complete architectural walkthrough of TrafficPulse-X
- Verified federated convergence, communication savings, and live interactive dashboard

Video resources are organized in the [`vdo link/`](./vdo%20link/README.md) directory:
- **Team Introduction & Solution Walkthrough**: [Watch on YouTube](https://youtu.be/kbMFY39V_l4)
- **Interactive Dashboard Walkthrough**: *(Documented in `vdo link/README.md`)*

---

## Hackathon Submission Status & Team Tasks

### Step 08: Attend Mentoring Sessions
- **Description:** Attend Mentoring Sessions as per schedule.
- **Status:** **Completed**
- **Details:** Attended mentoring interactions under the academic guidance of Faculty Mentor Aditya Sir, aligning the federated aggregation protocol and non-IID partitioning methodology.

### Step 09: Submission of Code
- **Description:** Complete and submit all the required files, documents, source code and supporting materials to your GitHub repository before the specified deadline.
- **Status:** **Completed**
- **Details:** All required deliverables successfully committed and pushed to the repository:
  - Complete production source code, models, configs, and 343 automated integration tests in [`src/`](./src/).
  - Comprehensive technical architecture, scientific contracts, audit reports, and viva guides in [`documentation/`](./documentation/).
  - Official project slide deck [`A3-PS003-TC198-Presentation.pdf`](./A3-PS003-TC198-Presentation.pdf).
  - Video walkthrough links and problem explanation in [`vdo link/`](./vdo%20link/).

### Step 10: Working Demo
- **Description:** Include a link to a live working demo in your GitHub repository. If your solution cannot be demonstrated live, upload the final deliverable files directly to the repository for evaluator review.
- **Status:** **Completed**
- **Details:** 6-minute screen-recorded demonstration video published on [YouTube](https://youtu.be/kbMFY39V_l4) and referenced in [`vdo link/README.md`](./vdo%20link/README.md). Local reproducible deployment instructions (FastAPI backend + React frontend) provided in [`src/README.md`](./src/README.md).

---

## Repository Structure & Folder Organization

```text
A3-PS003-TC198/
├── A3-PS003-TC198-Presentation.pdf      # Official Hackathon Presentation Slide Deck
├── README.md                            # Root Repository Overview & Submission Task Tracker
│
├── documentation/                       # Core Technical, Scientific & Audit Specifications
│   ├── README.md                        # Documentation Table of Contents
│   ├── ARCHITECTURE.md                  # System decomposition & data flow pipelines
│   ├── SCIENTIFIC_CONTRACT.md           # Formal mathematical contracts & methodology
│   ├── SCIENTIFIC_SCOPE.md              # Research boundaries, historical replay scope & DP bounds
│   ├── DEVELOPMENT.md                   # Engineering guide & deployment runbook
│   ├── EXPERIMENTS.md                   # Multi-horizon and ablation experiment records
│   ├── FLOW_DATASET_EXTENSION.md        # PeMS08 traffic flow volume benchmark documentation
│   ├── API.md                           # Complete REST API route specifications
│   └── AUDIT_REPORT.md                  # Release verification & 343 passing test cases audit
│
├── vdo link/                            # Team Introduction, PS Explanation & Video Links
│   └── README.md                        # Team bio, PS-003 summary, YouTube demo & dashboard video links
│
└── src/                                 # Complete Production Implementation & Source Code
    ├── app/ & pages/                    # React 19 Frontend Dashboard (7 interactive routes)
    ├── backend/                         # FastAPI high-performance REST backend (53 endpoints)
    ├── components/                      # Modular UI components (Leaflet map, Recharts, Replay)
    ├── context/                         # Global state management (ReplayContext & ThemeContext)
    ├── data/                            # METR-LA (207 sensors) & PeMS08 (170 sensors) datasets
    ├── ml/                              # PyTorch models (SpatialGraphLSTM, FedAvg, Opacus DP-SGD)
    ├── services/                        # Centralized frontend API gateway (api.js)
    ├── package.json                     # Frontend npm packages & scripts
    ├── requirements.txt                 # Backend Python dependencies
    ├── vite.config.js                   # Vite build configuration
    └── README.md                        # Technical runbook, setup instructions & 343 test matrix
```

---

## Team Member Roles & Contributions

- **Adarsh Singh (Team Leader)**:
  - **FastAPI Backend Architecture**: Implemented 53 production REST endpoints, streaming adapters, and health telemetry.
  - **Tactical React Dashboard**: Developed the React 19 / Vite single-page application and interactive Leaflet map canvas.
  - **Communication & Replay Infrastructure**: Implemented CCV wire-byte socket benchmarks and the deterministic 34,272-step temporal replay engine.

- **Shaurya Singh (Team Member)**:
  - **Spatio-Temporal Graph Neural Networks**: Designed and trained the `SpatialGraphLSTM` model combining Chebyshev graph convolutions with recurrent LSTM cells.
  - **Decentralized Federated Learning**: Implemented 4-region non-IID client graph partitioning and target-weighted `FedAvg` consensus.
  - **Communication-Constrained Value (CCV) Scheduling**: Designed policy tiers (1/4, 2/4, 3/4) achieving a 50% Pareto-optimal communication reduction.
  - **Differential Privacy**: Integrated Opacus DP-FedAvg experiment providing verified $(\epsilon = 5.311, \delta = 10^{-5})$-DP bounds.

- **Aditya Sir (Faculty Mentor)**:
  - **Research Supervision**: Provided academic guidance on spatial graph formulation and non-IID client partitioning.
  - **Evaluation & Methodology Advisory**: Guided rigorous baseline benchmarking and empirical communication accounting.
