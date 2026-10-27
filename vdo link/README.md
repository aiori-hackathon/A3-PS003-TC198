# TrafficPulse-X • Video Demonstrations & Team Introduction

This directory contains the official video demonstration links, team background, and problem statement breakdown for **TrafficPulse-X** submitted for the **AIORI 3 Hackathon Grand Finale**.

---

## AIORI-3 Hackathon Submission Details

- **Hackathon**: AIORI 3 (All India Open Research Initiative)
- **Problem Statement ID**: PS-003
- **Problem Statement**: Federated Traffic-Flow Prediction with Communication-Cost Evaluation
- **Team Code**: A3-PS003-TC198
- **Project Name**: TrafficPulse-X
- **Team Leader**: Adarsh Singh (`adarsh04455@gmail.com`)
- **Team Member**: Shaurya Singh (`shauryapratapsingh723@gmail.com`)
- **Faculty Mentor**: Aditya Sir

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

---

## Problem Statement Explanation (PS-003)

### Core Challenge
Municipal traffic intelligence systems traditionally rely on centralized architectures where hundreds of high-frequency loop detector sensors stream raw readings continuously to a central datacenter. This centralized model faces severe real-world constraints:
1. **Communication Bottlenecks**: Continuous transmission of 5-minute interval sensor readings across municipal highway grids leads to WAN congestion, high telemetry costs, and packet drops.
2. **Regional Non-IID Heterogeneity**: Highway sectors exhibit distinct topological bottlenecks, differing speed distributions, and unequal sensor densities, violating standard independent and identically distributed (IID) assumptions.
3. **Data Sovereignty & Edge Privacy**: Centralizing high-resolution velocity and trajectory data across municipal jurisdictions creates administrative friction and governance risks.
4. **Accuracy vs. Communication Trade-off**: Prior studies evaluate model forecasting accuracy in isolation without measuring the communication payload required to train or operate decentralized models.

### TrafficPulse-X Solution
**TrafficPulse-X** addresses PS-003 by implementing a decentralized, communication-aware traffic intelligence system:
- **Spatial Deep Learning**: Combines Chebyshev spectral graph convolutions with LSTM cells (`SpatialGraphLSTM`) on the 207-sensor METR-LA network and 170-sensor PeMS08 flow network.
- **Target-Weighted FedAvg**: Slices the highway graph into 4 regional non-IID client sectors (Glendale, Downtown LA, San Fernando Valley, East LA) that train locally and communicate only parameter weight deltas.
- **Communication-Constrained Value (CCV) Scheduling**: Evaluates selective client participation across 4 budget tiers, proving that selecting 2 out of 4 clients per round achieves a **50.0% application-layer communication payload reduction** (5.73 MB vs. 11.47 MB) with only a **+0.0944 mph (+2.75%) MAE penalty**.
- **Dual Communication Accounting**: Formally distinguishes between application payload (110,271 Bytes serialized PyTorch state dict) and controlled socket wire bytes (+0.298% HTTP framing overhead).
- **Interactive Operator Console**: Features a 7-page tactical operations dashboard with Leaflet geospatial maps, multi-horizon forecasts (+5m, +15m, +30m, +60m), 9-factor Need Score decision intelligence, and deterministic historical replay over 34,272 observations.

---

## Video Demonstration Links

### 1. Team Introduction & Technical Solution Walkthrough Video
- **YouTube URL**: [https://youtu.be/kbMFY39V_l4](https://youtu.be/kbMFY39V_l4)
- **Duration**: ~6 Minutes
- **Content Covered**:
  - Introduction of team members and project governance.
  - Problem Statement (PS-003) formulation and real-world municipal motivation.
  - End-to-end architecture (Data Layer $\rightarrow$ Graph Modeling $\rightarrow$ FedAvg $\rightarrow$ Dashboard).
  - Multi-horizon forecasting evaluation and 7-model centralized benchmark matrix.
  - Federated convergence results, CCV policy scheduling, and 50% communication payload reduction.
  - Differential Privacy guarantees and system integrity disclosures.

---

### 2. Interactive Dashboard Demonstration Video
- **YouTube URL**: 
- **Duration**: 
- **Content Covered**:
  - Live walkthrough of the 7-page operations console.
  - Tactical Leaflet 207-sensor map and regional cluster filtering.
  - Multi-horizon speed forecasting cards with uncertainty intervals.
  - Federated learning convergence view, non-IID client partition cards, and 3-seed reproducibility.
  - Decision intelligence console featuring the 9-factor Need Score and Sensor Jury consensus.
  - Historical replay timeline scrubber and temporal playhead synchronization across 34,272 timesteps.
