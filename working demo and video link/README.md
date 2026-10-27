# TrafficPulse-X • Working Demo and Video Links

This directory contains the working demo link, team introduction & problem statement explanation video, and dashboard demonstration video for **TrafficPulse-X** (Problem Statement: **PS-003**, Team Code: **A3-PS003-TC198**).

---

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

## Working Demo & Video Links

### links are here:

### 1. Working Demo Link
- **Live Demo URL:** `[Live Working Demo Link to be added here]`
- **Status:** Link placeholder provided (ready for deployment URL)
- **Local Reproduction Runbook:** Available in [`src/README.md`](../src/README.md)

---

### 2. Team Member Intro and Problem Statement Explanation Video
- **Video URL:** [https://youtu.be/kbMFY39V_l4](https://youtu.be/kbMFY39V_l4)
- **Alternative / Updated URL:** `[Video Link to be added here]`
- **Content Covered:**
  - Team member introductions and assigned roles.
  - Problem Statement (PS-003) formulation and municipal motivation.
  - Spatio-temporal graph neural network architecture (`SpatialGraphLSTM`).
  - Federated learning framework (FedAvg across 4 regional client sectors).
  - Selective client participation (CCV) achieving 50% communication reduction.

---

### 3. Dashboard Explanation Video
- **Video URL:** `[Dashboard Explanation Video Link to be added here]`
- **Content Covered:**
  - Walkthrough of the tactical operator console and Leaflet sensor map.
  - Multi-horizon traffic forecasting (+5m, +15m, +30m, +60m).
  - Client convergence, communication payload tracking, and DP bounds.
  - 9-factor Need Score decision intelligence engine and Sensor Jury consensus.
  - 34,272-step historical replay engine demonstration.

---

## Team Member Roles & Responsibilities

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
  - **Research Supervision**: Academic guidance on spatial graph formulation and non-IID client partitioning.
  - **Methodology Advisory**: Guidance on baseline benchmarking and empirical communication accounting.

---

## Problem Statement Explanation (PS-003)

Municipal traffic intelligence systems traditionally stream continuous raw sensor data from hundreds of municipal loop detectors to a central server, causing severe bandwidth bottlenecks, WAN congestion, and telemetry dropouts. Real-world road networks exhibit non-IID spatial heterogeneity across municipal sectors, and centralizing raw traffic data raises privacy and governance concerns.

**TrafficPulse-X** resolves PS-003 by enabling regional road sectors to train locally using Chebyshev Graph Convolutions + LSTM cells (`SpatialGraphLSTM`) and share only parameter deltas via FedAvg aggregation. Coupled with Communication-Constrained Value (CCV) scheduling, TrafficPulse-X achieves a **50% communication reduction** with negligible accuracy impact.
