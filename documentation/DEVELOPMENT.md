# TrafficPulse-X Development Guide

This guide outlines setup, execution, testing, and repository development conventions for TrafficPulse-X.

---

## 1. Environment Requirements

- **Python**: Python 3.10+ (Tested on Python 3.14.7)
- **Node.js**: Node.js v18+ / v20+ (Tested with npm & Vite v8.3.3)

---

## 2. Installation & Setup

### Step 1: Environment Setup

#### Option A: Windows (PowerShell)
```powershell
# 1. Create a dedicated virtual environment
python -m venv .venv

# 2. Activate the virtual environment
.\.venv\Scripts\Activate.ps1
# If PowerShell blocks script execution, run:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 3. Install backend Python dependencies
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt

# 4. Install frontend JavaScript dependencies
npm install
```

#### Option B: Linux / macOS (Bash)
```bash
# 1. Create a dedicated virtual environment
python3 -m venv .venv

# 2. Activate the virtual environment
source .venv/bin/activate

# 3. Install backend Python dependencies
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt

# 4. Install frontend JavaScript dependencies
npm install
```

---

## 3. Running TrafficPulse-X Locally

Open two separate terminal windows from the project root:

### Terminal 1: Backend API Server (FastAPI)
```powershell
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
```bash
# Linux / macOS (Bash):
source .venv/bin/activate
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- **FastAPI Documentation (Swagger)**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`
- **Stop Server**: Press `Ctrl + C`

### Terminal 2: Frontend Development Server (React + Vite)
```bash
npm run dev -- --host 127.0.0.1 --port 5173
```
- **Web Interface**: `http://127.0.0.1:5173/`
- **Stop Server**: Press `Ctrl + C`

---

## 4. Testing & Verification

Run the verification test suite:

```bash
# 1. Run all backend tests (Pytest - 343 tests)
python -m pytest backend -q

# 2. Verify frontend code quality (Oxlint)
npm run lint

# 3. Verify production build bundle (Vite)
npm run build
```

---

## 5. Branch Workflow & Pull Request Expectations

1. **Main Branch Protection**: The `main` branch represents production-ready, submission-frozen code.
2. **Feature Branching**: Development occurs on descriptive feature or fix branches (e.g., `feat/decision-metrics`, `fix/route-nav`).
3. **Pull Request Requirements**:
   - Clean lint (`npm run lint` with 0 errors).
   - Successful production bundle (`npm run build`).
   - 100% backend test pass (`pytest backend -v` passing all 343 tests).
   - Zero hardcoded secrets or environment dumps.
   - Preserved scientific provenance and model checkpoints.

---

## 6. Environment Variables & Secrets

- **Frontend**: Contains **zero** secrets. All frontend configuration connects to the backend API (`http://localhost:8000/api`).
- **Backend**:
  - `GEMINI_API_KEY` (Optional): Set in `.env` or system environment for the server-side Gemini AI assistant proxy (`backend/assistant.py`).
  - `.env` is ignored by `.gitignore` and must never be committed to source control.

---

## 7. Key Repository Conventions

1. **Single FastAPI Rule**: All API routes are declared in `backend/main.py` under `/api/*`. Do NOT spawn parallel backend servers.
2. **Frontend Gateway Rule**: All UI components fetch data through `src/services/api.js`. Do NOT write component-level `fetch` calls.
3. **No Environment Dumps (`pip freeze`)**: Keep `backend/requirements.txt` restricted to direct project runtime, ML, and test dependencies.
4. **Frozen Scientific Checkpoints**: Model weight files (`graph_lstm_best.pt`, `global_best.pt`) and evaluation summaries are frozen contracts. Do NOT retrain or overwrite them without explicit directives.
5. **Standardized Terminology**: Refer to dataset replay as *Historical Replay*, FL participants as *Regional FL Clients*, and Need Score as a *DERIVED* 9-factor metric.
