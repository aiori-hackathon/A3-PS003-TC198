# AIORI 3 Hackathon – Team A3-PS003-TC198

## Team Details

- **Team Code:** A3-PS003-TC198
- **Problem Statement ID:** PS-003
- **Hackathon:** AIORI 3
- **Project Name:** TrafficPulse-X
- **Team Leader:** Adarsh Singh 
- **Team Member:** Shaurya Singh 
- **Faculty Mentor:** Aditya Sir

---

## Problem Statement

**Federated Traffic-Flow Prediction with Communication-Cost Evaluation**

The problem focuses on building a traffic forecasting system using federated learning while also evaluating the communication required between distributed clients and a central server.

---

## Our Proposed Solution

Our solution is **TrafficPulse-X**.

TrafficPulse-X uses historical traffic sensor data to forecast future traffic conditions while allowing regional clients to train locally.

Instead of continuously sending all raw traffic data to a central server, regional clients train locally and share model updates for federated aggregation.

Our proposed solution includes:

- Graph + LSTM based traffic-speed forecasting (`SpatialGraphLSTM`)
- Federated Learning using FedAvg across regional client sectors
- Regional non-IID client partitions (METR-LA and PeMS08)
- Communication-cost evaluation (dual application and transport wire accounting)
- Selective client participation (50% communication reduction via CCV)
- Decision Intelligence (9-factor Need Score & Sensor Jury consensus)
- Interactive traffic analysis dashboard (React 19, Leaflet, 34,272-step replay)

The aim is to study whether federated traffic forecasting can maintain useful prediction quality while reducing unnecessary communication.

---

## Project Presentation

Our AIORI project presentation is available here:

[View Project Presentation](./A3-PS003-TC198-Presentation.pdf)

---

## Working Demo & Video Links


1. **Working Demo Link**:
   - `[Live Working Demo Link to be added here]`
   - *(Runbook for local execution is provided in [`src/README.md`](./src/README.md))*

2. **Team Member Intro and Problem Statement Explanation Video**:
   - [Watch Team Introduction Video](https://youtu.be/kbMFY39V_l4)
   - `[Video Link to be added here]`

3. **Dashboard Explanation Video**:
   - `[Dashboard Explanation Video Link to be added here]`

*(Full details and video descriptions are also available in [`working demo and video link/README.md`](./working%20demo%20and%20video%20link/README.md))*

---

## Project Documentation


Our comprehensive technical and project documentation is available here:

[View Project Documentation](./documentation/FULL_PROJECT_DOCUMENTATION.md)

---

## Submission Status (Steps 01 – 10)

- **Step 01:** GitHub collaboration setup completed
- **Step 02:** Repository naming completed (`A3-PS003-TC198`)
- **Step 03:** AIORI GitHub collaboration completed
- **Step 04:** Repository ownership transferred to AIORI
- **Step 05:** Project presentation uploaded ([`A3-PS003-TC198-Presentation.pdf`](./A3-PS003-TC198-Presentation.pdf))
- **Step 06:** Team introduction video created
- **Step 07:** YouTube video link added
- **Step 08:** Mentoring sessions attended with Faculty Mentor
- **Step 09:** Complete source code ([`src/`](./src/)) and project documentation ([`documentation/`](./documentation/)) submitted
- **Step 10:** Working demo link and video demonstration provided

---

## Repository Structure (Kahan Par Kya Hai)

```text
A3-PS003-TC198/
├── A3-PS003-TC198-Presentation.pdf   # Official Hackathon Project Presentation Slide Deck
├── README.md                         # Main Repository Overview & Submission Status (Steps 01-10)
├── documentation/                    # Project Documentation (Architecture, Specs, Audit)
├── working demo and video link/       # Working Demo Link & Video Demonstrations
└── src/                              # Source Code (React Frontend, FastAPI Backend, ML Models, Datasets, 343 Tests)
```

---

## Team Member Roles & Responsibilities

- **Adarsh Singh (Team Leader)**: FastAPI backend architecture, tactical React dashboard, communication benchmarks & temporal replay engine.
- **Shaurya Singh (Team Member)**: Spatio-temporal graph neural networks (`SpatialGraphLSTM`), decentralized FedAvg, CCV scheduling & differential privacy.
- **Aditya Sir (Faculty Mentor)**: Academic supervision, spatial graph formulations, non-IID client partitioning & empirical evaluation advisory.
