# TrafficPulse-X

> **Federated Traffic-Flow Prediction with Communication-Cost Evaluation**  
> AIORI-3 Hackathon Submission &bull; Problem Statement PS-003 &bull; Team Code A3-PS003-TC198

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch 2.0+](https://img.shields.io/badge/PyTorch-2.0+-ee4c2c.svg)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3+-646cff.svg)](https://vitejs.dev/)
[![Tests: 343 Passed](https://img.shields.io/badge/tests-343%20passed-brightgreen.svg)](#testing-and-verification)

---

## AIORI-3 Submission Identifiers

| Metadata | Details |
|---|---|
| **Hackathon** | AIORI 3 (All India Open Research Initiative) |
| **Problem Statement** | **PS-003:** Federated Traffic-Flow Prediction with Communication-Cost Evaluation |
| **Team Code** | **A3-PS003-TC198** |
| **Team Leader** | Adarsh Singh |
| **Team Member** | Shaurya Singh |
| **Faculty Mentor** | Aditya Sir |
| **Official Team Repository** | [https://github.com/aiori-hackathon/A3-PS003-TC198](https://github.com/aiori-hackathon/A3-PS003-TC198) |
| **Presentation Slide Deck** | [View Presentation PDF](./A3-PS003-TC198-Presentation.pdf) |
| **Video Demonstration** | [Watch Demonstration Video](https://youtu.be/kbMFY39V_l4) |
| **Deep-Dive Technical Guide** | [src/README.md](./src/README.md) |

---

## Repository Directory Layout

The TrafficPulse-X codebase follows a clean, decoupled `src/`-centered architecture with root-level configuration, tests, documentation, and external benchmark data:

```
A3-PS003-TC198/
├── src/                                  # Application Source Tree
│   ├── backend/                          # FastAPI REST Application Server & Modules
│   │   ├── config.py                     # Deterministic root discovery & typed Pydantic Settings
│   │   ├── main.py                       # 65 API route registrations & CORS middleware
│   │   ├── data_source.py                # Telemetry ingestion & spatial sensor data adapter
│   │   ├── graph.py                      # Sensor adjacency & normalized Laplacian calculator
│   │   ├── assistant.py                  # AI assistant inference dispatcher
│   │   ├── communication_intelligence/   # CCV policy engines & transport metrics
│   │   ├── data_sources/                 # PeMS08 adapter & streaming interfaces
│   │   ├── datasets/                     # METR-LA HDF5 inspection & partition logic
│   │   ├── decision/                     # 9-factor Need Score & Sensor Jury consensus
│   │   ├── experiments/                  # Non-IID distributions & accounting routers
│   │   ├── federated/                    # FedAvg service & strict Pydantic schemas
│   │   ├── prediction/                   # Spatio-Temporal Graph-LSTM prediction service
│   │   └── privacy/                      # DP-FedAvg & secure aggregation endpoints
│   ├── ml/                               # PyTorch Machine Learning Models & Pipelines
│   │   ├── baselines/                    # 7 baseline models (HA, VAR, FNN, FC-LSTM, etc.)
│   │   ├── experiments/                  # Client partition runners & transport benchmarks
│   │   ├── federated/                    # FedAvg aggregation server & client trainers
│   │   ├── graph/                        # Chebyshev spectral graph convolutions
│   │   ├── privacy/                      # Rényi DP accountants & Gaussian perturbation
│   │   ├── spatiotemporal/               # Authoritative Graph-LSTM joint architecture
│   │   ├── temporal/                     # Sequence-to-sequence LSTM forecasting
│   │   └── freeze_stage_6_6.py           # Benchmark checkpoint freeze & verification
│   ├── app/                              # React App root & top-level layout wrappers
│   ├── components/                       # Modular UI components (Map, Charts, Panels)
│   ├── context/                          # ReplayContext (34,272 timesteps) & ThemeContext
│   ├── pages/                            # 7 core route views (Overview, Network, etc.)
│   ├── services/                         # Centralized API gateway & HTTP client (api.js)
│   ├── utils/                            # Mathematical helpers, formatting & color scales
│   └── README.md                         # Comprehensive 24-point Technical Documentation
│
├── data/                                 # Benchmark Datasets (Canonical External Data)
│   ├── raw/                              # Original benchmark archives (metr-la.h5, pems08.npz)
│   └── processed/                        # Normalized splits, distance matrices, checkpoints
│
├── tests/                                # Authoritative Verification Suite (343 Tests)
│   ├── test_config.py                    # Root discovery & Pydantic settings tests
│   ├── test_api_contracts.py             # OpenAPI contract & response model verification
│   ├── test_reconciliation_contracts.py  # Anti-regression & data reconciliation tests
│   ├── test_stage_6_*.py                 # Spatio-temporal baseline & model tests
│   ├── test_stage_8_*.py                 # Federated learning & FedAvg contract tests
│   ├── test_phase_9_*.py                 # Communication accounting & non-IID tests
│   └── ...                               # (22 test modules covering 100% of pipeline)
│
├── docs/                                 # Architectural specifications & evaluation logs
├── A3-PS003-TC198-Presentation.pdf       # Official AIORI-3 Presentation Slide Deck
├── package.json                          # Frontend dependencies (React 19, Tailwind, Leaflet)
├── vite.config.js                        # Vite 8.3 build & dev server configuration
├── requirements.txt                      # Python dependencies (PyTorch, FastAPI, PyUvicorn)
├── pytest.ini                            # Pytest configuration (pythonpath = . src)
└── README.md                             # This repository orientation document
```

---

## Quick Start Guide

### 1. Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18 or higher (with npm)
- **Git**

### 2. Backend Setup & Startup
```powershell
# Navigate to repository root
cd C:\Users\adars\Desktop\A3-PS003-TC198

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server on http://127.0.0.1:8000
uvicorn src.backend.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup & Startup
```powershell
# In a separate terminal
npm install
npm run dev
# Dashboard accessible at http://localhost:5173
```

---

## Testing and Verification

All backend models, endpoints, and data pipelines are fully verified through an extensive test suite:

```powershell
# Run the complete test suite (343 tests)
pytest

# Run targeted contract tests
pytest tests/test_config.py tests/test_api_contracts.py tests/test_stage_8_3_fl_api.py -v

# Run frontend linting & production build
npm run lint
npm run build
```

---

## Comprehensive Technical Documentation

For complete technical details including:
- Spatio-temporal mathematical formulations & Graph-LSTM architectures
- Federated learning aggregation, CCV client selection policies, and communication formulas
- 9-factor Need Score calibration & Sensor Jury consensus algorithms
- Differential Privacy $(\epsilon, \delta)$ accounting and secure aggregation proofs
- Complete 65-route REST API documentation with request/response schemas
- Reproducibility artifacts, checksums, and benchmark comparisons

Please consult the exhaustive architecture reference:  
👉 **[src/README.md](./src/README.md)**
