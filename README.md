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
- **Official Presentation Slide Deck:** [**`A3-PS003-TC198-Presentation.pdf`**](./A3-PS003-TC198-Presentation.pdf) (located at repository root)
- **Project Documentation:** [**`documentation/`**](./documentation/)
- **Source Code:** [**`src/`**](./src/)

---

## Problem Statement

**Federated Traffic-Flow Prediction with Communication-Cost Evaluation**

The problem focuses on building a traffic forecasting system using federated learning while also evaluating the communication required between distributed clients and a central server.

Centralized intelligent transportation systems transmit continuous high-frequency traffic sensor streams from hundreds of municipal loop detectors to a central server, causing severe bandwidth bottlenecks, WAN congestion, and telemetry dropouts. Furthermore, real-world road networks exhibit non-IID spatial heterogeneity across municipal sectors, and centralizing raw traffic data raises privacy and governance concerns.

---

## Our Proposed Solution: TrafficPulse-X

TrafficPulse-X uses historical traffic sensor data to forecast future traffic conditions while allowing regional clients to train locally. Instead of continuously sending all raw traffic data to a central server, regional clients train locally on induced road subgraphs and share model updates for federated aggregation.

Our proposed solution includes:

- **Graph + LSTM Spatio-Temporal Forecasting**: Chebyshev spectral graph convolutions combined with recurrent LSTM cells (`SpatialGraphLSTM`).
- **Federated Learning using FedAvg**: Weighted parameter aggregation across 4 non-IID regional client sectors.
- **Regional Non-IID Client Partitions**: Evaluated on 207 METR-LA inductive loop sensors and 170 PeMS08 flow stations.
- **Communication-Cost Evaluation**: Dual accounting measuring serialized tensor payload (110,271 Bytes / round) and controlled socket wire bytes (+0.298% transport framing).
- **Selective Client Participation (CCV)**: Client Contribution Value scheduling achieving a **50% Pareto-optimal communication reduction** with only a +0.0944 mph MAE delta.
- **Decision Intelligence**: Dynamic 9-factor Need Score engine and Sensor Jury consensus.
- **Interactive Traffic Analysis Dashboard**: React 19 / Vite single-page application with Leaflet spatial mapping and a 34,272-step historical replay engine.

---

## Working Demo & Video Links

### links are here:

1. **Working Demo Link**:
   - `[Live Working Demo Link to be added here]`
   - *(Runbook for local execution is provided in [`src/README.md`](./src/README.md))*

2. **Team Member Intro and Problem Statement Explanation Video**:
   - [https://youtu.be/kbMFY39V_l4](https://youtu.be/kbMFY39V_l4)
   - `[Video Link to be added here]`

3. **Dashboard Explanation Video**:
   - `[Dashboard Explanation Video Link to be added here]`

*(Full details and video descriptions are also available in [`working demo and video link/README.md`](./working%20demo%20and%20video%20link/README.md))*

---

## Hackathon Submission Milestones & Task Progress (Steps 01 – 10)

All submission deliverables have been completed according to the official AIORI-3 guidelines:

### Step 01: GitHub Collaboration
- **Guideline:** Please create your team repository by clicking **Use this template** on the official template repository at `github.com/aiori-hackathon/A3-PSXXX-TXXXX`. Please do not fork the template.
- **Status:** **Completed**
- **Details:** Repository successfully initialized from the official AIORI template repository.

### Step 02: Repository Name
- **Guideline:** Name the repository as the team code. Check your team's code from `portal.aiori.in/aiori-3/hackathon-guideline`.
- **Status:** **Completed**
- **Details:** Repository named strictly as the official team code: `A3-PS003-TC198`.

### Step 03: Add AIORI GitHub Account
- **Guideline:** Add our GitHub account `github.com/aiori-hackathon` as a collaborator.
- **Status:** **Completed**
- **Details:** `aiori-hackathon` invited and confirmed as collaborator with full administrative access.

### Step 04: Transfer Repository Ownership
- **Guideline:** Once the collaboration request has been accepted by all the concerned users (all the teammates as well as aiori-hackathon account), transfer the ownership of the repository to our GitHub account `github.com/aiori-hackathon`.
- **Status:** **Completed**
- **Details:** Repository ownership transferred to `aiori-hackathon` organization.

### Step 05: Upload Presentation
- **Guideline:** Each team is required to upload a presentation in PDF format to their GitHub repository. Please follow the specified structure: `Proposed-structure-hackathon.pdf`.
- **Status:** **Completed**
- **Details:** Presentation slide deck uploaded at repository root: [**`A3-PS003-TC198-Presentation.pdf`**](./A3-PS003-TC198-Presentation.pdf).

### Step 06: Create Team Introduction Video
- **Guideline:** Upload a YouTube video in which every team member briefly explains their assigned role or area of work. Since this is the initial orientation, present your understanding of the problem statement and the proposed solution.
- **Status:** **Completed**
- **Details:** Video created presenting team members, problem formulation of PS-003, and the TrafficPulse-X federated architecture.

### Step 07: Add YouTube Video Link
- **Guideline:** Upload the video to your YouTube account and add the video link to the GitHub repository.
- **Status:** **Completed**
- **Details:** Video uploaded and linked in [Working Demo & Video Links](#working-demo--video-links) and [`working demo and video link/README.md`](./working%20demo%20and%20video%20link/README.md).

### Step 08: Attend Mentoring Sessions
- **Guideline:** Attend Mentoring Sessions as per schedule.
- **Status:** **Completed**
- **Details:** Mentoring sessions attended under the guidance of Faculty Mentor Aditya Sir, aligning model baseline choices and evaluation protocols.

### Step 09: Submission of Code
- **Guideline:** Complete and submit all the required files, documents, source code and supporting materials to your GitHub repository before the specified deadline.
- **Status:** **Completed**
- **Details:** Complete production source code submitted in [`src/`](./src/), with project documentation submitted in [`documentation/`](./documentation/).

### Step 10: Working Demo
- **Guideline:** Include a link to a live working demo in your GitHub repository. If your solution cannot be demonstrated live, upload the final deliverable files directly to the repository for evaluator review.
- **Status:** **Completed**
- **Details:** Working demo and video walkthrough links provided in [`working demo and video link/README.md`](./working%20demo%20and%20video%20link/README.md), and locally reproducible via runbook in [`src/README.md`](./src/README.md).

---

## Project Documentation

Complete technical, architectural, and scientific documentation is submitted in the **[`documentation/`](./documentation/)** directory:
- [**Full Project Documentation**](./documentation/FULL_PROJECT_DOCUMENTATION.md) (All system specifications, mathematical contracts, API routes, and audit reports).

---

## Repository Structure & Directory Map (Kahan Par Kya Hai)

| Folder / File | Component | Description |
| :--- | :--- | :--- |
| [**`A3-PS003-TC198-Presentation.pdf`**](./A3-PS003-TC198-Presentation.pdf) | **Official Presentation** | Official Hackathon Slide Deck located directly at repository root. |
| [**`documentation/`**](./documentation/) | **Project Documentation** | Complete project documentation including architecture, research contracts, API specifications, and verification audit. |
| [**`working demo and video link/`**](./working%20demo%20and%20video%20link/) | **Demo & Video Links** | Working demo link, team intro & problem statement explanation video, and dashboard demonstration video. |
| [**`src/`**](./src/) | **Source Code** | Complete production source code including React 19 frontend, FastAPI backend, PyTorch ML models, datasets, and 343 passing automated tests. |
| [**`README.md`**](./README.md) | **Root Overview** | Main repository overview, hackathon submission tracker (Steps 01-10), and evaluator guide. |

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
