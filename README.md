# TrafficPulse-X

## AIORI 3 Hackathon — Team A3-PS003-TC198

- **Team Code:** A3-PS003-TC198
- **Problem Statement ID:** PS-003
- **Hackathon:** AIORI 3
- **Project Name:** TrafficPulse-X
- **Team Leader:** Adarsh Singh
- **Team Member:** Shaurya Pratap Singh
- **Faculty Mentor:** Aditya Srivastava 

---

## Problem Statement

**Federated Traffic-Flow Prediction with Communication-Cost Evaluation**

Building a decentralized traffic forecasting system using federated learning across regional road networks, while evaluating the trade-off between prediction accuracy and communication payload across distributed clients.

---

## Project Overview & Key Capabilities

TrafficPulse-X is a communication-aware decentralized traffic intelligence system. Instead of continuously transmitting raw sensor data from municipal highway networks to a central server, regional client nodes train locally on road subgraphs and share model updates through federated aggregation.

### Key Capabilities:
- **Spatio-Temporal Forecasting:** Chebyshev spectral graph convolutions coupled with recurrent LSTM cells (`SpatialGraphLSTM`) to capture road topology and temporal dynamics.
- **Federated Model Aggregation:** Target-weighted `FedAvg` consensus across 4 regional non-IID client sectors on the METR-LA (207 sensors) and PeMS08 (170 sensors) benchmarks.
- **Communication-Cost Accounting:** Empirical measurement of serialized tensor payload (110,271 bytes per client update round) alongside transport socket wire overhead.
- **Selective Client Participation:** Client Contribution Value (CCV) scheduling to evaluate trade-offs between communication payload reduction and forecasting quality.
- **Decision Intelligence Engine:** Rule-based 9-factor Need Score scoring and sensor agreement consensus for operational anomaly triage.
- **Interactive Operations Console:** Single-page dashboard (React 19 / Vite, Leaflet mapping) featuring multi-horizon predictions and deterministic historical dataset replay.

---

## Submission Status (Steps 01 – 10)

- **Step 01 (GitHub Collaboration):** **Completed** — Repository initialized from the official AIORI template.
- **Step 02 (Repository Name):** **Completed** — Repository named strictly according to team code: `A3-PS003-TC198`.
- **Step 03 (Add AIORI GitHub Account):** **Completed** — `aiori-hackathon` collaborator access confirmed.
- **Step 04 (Transfer Repository Ownership):** **Completed** — Repository ownership transferred to `aiori-hackathon`.
- **Step 05 (Upload Presentation):** **Completed** — Presentation uploaded at repository root ([`A3-PS003-TC198-Presentation.pdf`](./A3-PS003-TC198-Presentation.pdf)).
- **Step 06 (Create Team Introduction Video):** **Completed** — Team member introduction and problem statement walkthrough recorded ([Watch Video](https://youtu.be/kbMFY39V_l4?si=_hMvLyEBpfnS8q6p)).
- **Step 07 (Add YouTube Video Link):** **Completed** — Team introduction video and dashboard demonstration video uploaded and linked.
- **Step 08 (Attend Mentoring Sessions):** **Completed** — Mentoring sessions attended under the guidance of Faculty Mentor Aditya Sir.
- **Step 09 (Submission of Code):** **Completed** — Production source code submitted in [`src/`](./src/), and technical documentation submitted in [`documentation/`](./documentation/).
- **Step 10 (Working Demo):** **Pending** — Will be uploaded soon (Local setup and runbook available in [`src/README.md`](./src/README.md)).

---

## Working Demo & Video Links

- **Working Demo:**
  - **Status:** Pending — Will be uploaded soon
  - **URL:** `Will be uploaded soon`
  - *(Instructions for local execution are documented in [`src/README.md`](./src/README.md))*

- **Team Member Introduction and Problem Statement Explanation Video:**
  - **Status:** Available
  - **URL:** [https://youtu.be/kbMFY39V_l4?si=_hMvLyEBpfnS8q6p](https://youtu.be/kbMFY39V_l4?si=_hMvLyEBpfnS8q6p)

- **Dashboard Explanation / Project Demonstration Video:**
  - **Status:** Available
  - **URL:** [https://youtu.be/_b2-zvt9JjI?si=gZSDJmwlXJjFjqb_](https://youtu.be/_b2-zvt9JjI?si=gZSDJmwlXJjFjqb_)

*(Video outlines and descriptions are documented in [`working demo and video link/README.md`](./working%20demo%20and%20video%20link/README.md))*

---

## Project Presentation & Documentation

- **Project Presentation:**
  - **Status:** Available
  - **File:** [View Project Presentation Deck (`A3-PS003-TC198-Presentation.pdf`)](./A3-PS003-TC198-Presentation.pdf) (located at repository root)

- **Full Project Documentation:**
  - **Status:** Available
  - **Specifications:** [View Full Project Documentation (`documentation/FULL_PROJECT_DOCUMENTATION.md`)](./documentation/FULL_PROJECT_DOCUMENTATION.md)
  - **Documentation Index:** [`documentation/README.md`](./documentation/README.md)

---

## Repository Structure

```text
A3-PS003-TC198/
├── A3-PS003-TC198-Presentation.pdf   # Official Hackathon Project Presentation Slide Deck
├── README.md                         # Main Repository Overview, Submission Status & Links
├── documentation/                    # Technical & Scientific Documentation
│   ├── FULL_PROJECT_DOCUMENTATION.md # Comprehensive documentation index
│   └── README.md                     # Documentation table of contents
├── working demo and video link/      # Working demo link and video explanation documentation
│   └── README.md                     # Video demonstration details and submission placeholders
└── src/                              # Production Source Code (Frontend, Backend, ML Models, Datasets)
    ├── backend/                      # FastAPI REST application
    ├── data/                         # METR-LA and PeMS08 traffic datasets
    ├── ml/                           # PyTorch spatio-temporal and federated learning models
    ├── app/ & pages/                 # React 19 / Vite operations dashboard
    └── README.md                     # Local setup, runbook, and verification commands
```

---

## Final Link-Completion Checklist

- [ ] **Working Demo:** Will be uploaded soon *(Local execution instructions available in [`src/README.md`](./src/README.md))*
- [x] **Team Member Introduction Video:** Available ([Watch Video](https://youtu.be/kbMFY39V_l4?si=_hMvLyEBpfnS8q6p))
- [x] **Dashboard Demonstration Video:** Available ([Watch Video](https://youtu.be/_b2-zvt9JjI?si=gZSDJmwlXJjFjqb_))

---

## Team Member Roles & Responsibilities

- **Adarsh Singh (Team Leader)**: FastAPI backend architecture, tactical React dashboard, communication benchmarks & temporal replay engine.
- **Shaurya Singh (Team Member)**: Spatio-temporal graph neural networks (`SpatialGraphLSTM`), decentralized FedAvg, CCV scheduling & differential privacy experiments.
- **Aditya Sir (Faculty Mentor)**: Academic supervision, spatial graph formulations, non-IID client partitioning & empirical evaluation advisory.
