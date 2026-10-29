# TrafficPulse-X AI Assistant Service
# High-performance server-side assistant with comprehensive domain knowledge engine, live web search, and Gemini integration

import os
import re
import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

logger = logging.getLogger("trafficpulse.assistant")

SYSTEM_PROMPT = """You are TrafficPulse-X Assistant, an expert AI traffic-mobility systems engineer embedded in the TrafficPulse-X platform.

TrafficPulse-X System Architecture & Context:
1. Core Mission: Spatio-temporal traffic forecasting, active decision intelligence, and privacy-preserving federated learning with communication-cost evaluation on real-world traffic networks (AIORI Problem Statement PS-003).
2. Datasets:
   - Primary: METR-LA (207 inductive loop sensors, Los Angeles freeway network, 5-minute sampling intervals, 34,272 timesteps from March 1 to June 27, 2012).
   - Secondary Extension: Caltrans PeMS08 (170 flow volume sensors across San Bernardino freeway corridors, 17,856 timesteps).
3. Primary Forecasting Model: SpatialGraphLSTM combining Chebyshev spectral graph convolutions (polynomial order K=3) with recurrent LSTM cells.
   - Evaluated against 7 candidate baselines: SpatialGraphLSTM (Rank 1: MAE 3.4378 mph, RMSE 6.8873 mph), STGCN, DCRNN, LSTM, Ridge Linear, ARIMA, Historical Average.
   - Multi-horizon forecasts: +5 min (2.36 mph), +15 min (3.00 mph), +30 min (3.67 mph), +60 min (4.72 mph).
4. Federated Learning (FedAvg):
   - 4 Regional Client Partitions (Clients A, B, C, D) partitioned via K-Means spatial graph clustering across 207 sensors.
   - FedAvg aggregation weighted strictly by valid targets (w_k = |D_k| / sum(|D_j|)).
   - Trained across 14 rounds (Rounds 0–13), with optimal global checkpoint selected at Round 8 (Val MAE: 3.1536 mph).
   - Test MAE: 3.5322 mph with only a +2.75% (+0.0944 mph) trade-off compared to centralized training, preserving data sovereignty.
5. Communication-Cost Evaluation & CCV:
   - Dual accounting: Serialized application tensor payload (110,271 Bytes / round) and controlled transport socket wire bytes (+0.298% HTTP framing).
   - Client Contribution Value (CCV) Scheduling: 2-of-4 selective client participation achieves a 50% communication reduction (5.73 MB vs 11.47 MB) with only +0.0944 mph MAE impact.
6. Decision Intelligence & Operations:
   - 9-factor Need Score engine prioritizing sensors under bandwidth constraints.
   - Multi-sensor agreement Jury eliminating false-positive incidents.
   - Deterministic 34,272-step temporal replay engine.
"""

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    source: str  # "gemini" | "local_knowledge_base" | "search_engine"
    model: str


def _search_live_knowledge(query: str) -> Optional[str]:
    """Queries DuckDuckGo Instant Answer and Wikipedia REST API for any real-time / general question."""
    clean_q = query.strip()
    search_term = re.sub(
        r'^(what is|who is|tell me about|explain|meaning of|kya hai|kaun hai|kise kehte hain)\s+',
        '',
        clean_q,
        flags=re.IGNORECASE
    ).strip()
    if not search_term:
        search_term = clean_q

    # 1. DuckDuckGo Instant Answer API
    try:
        url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(clean_q)}&format=json&no_html=1"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TrafficPulseBot/2.0"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            abstract = data.get("AbstractText", "").strip()
            if abstract:
                heading = data.get("Heading", clean_q)
                source_url = data.get("AbstractURL", "")
                res = f"**{heading}:**\n\n{abstract}"
                if source_url:
                    res += f"\n\n*Source: {source_url}*"
                return res
            # Check RelatedTopics for summary snippet
            for item in data.get("RelatedTopics", []):
                txt = item.get("Text", "").strip()
                if txt and len(txt) > 40:
                    return f"**{search_term.title()}:**\n\n{txt}"
    except Exception as e:
        logger.debug(f"DuckDuckGo search error: {e}")

    # 2. Wikipedia REST Summary API
    for term in [search_term, clean_q]:
        try:
            search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(term)}&utf8=&format=json&srlimit=1"
            req = urllib.request.Request(search_url, headers={"User-Agent": "TrafficPulseAssistant/2.0"})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                results = data.get("query", {}).get("search", [])
                if results:
                    title = results[0]["title"]
                    sum_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
                    req2 = urllib.request.Request(sum_url, headers={"User-Agent": "TrafficPulseAssistant/2.0"})
                    with urllib.request.urlopen(req2, timeout=4) as resp2:
                        sum_data = json.loads(resp2.read().decode("utf-8"))
                        extract = sum_data.get("extract", "").strip()
                        if extract:
                            return f"**{title}:**\n\n{extract}\n\n*Reference: Wikipedia ({title})*"
        except Exception as e:
            logger.debug(f"Wikipedia search error: {e}")

    return None


def _query_local_knowledge_base(user_message: str) -> Optional[str]:
    """Comprehensive domain knowledge base matching 100+ keywords, Hindi/Hinglish phrasing, and technical queries."""
    msg = user_message.lower().strip()

    # ------------------------------------------------------------------------
    # 0. GREETINGS (hi, hello, hey, namaste, kaise ho)
    # ------------------------------------------------------------------------
    if re.search(r'\b(hi|hello|hey|namaste|pranam|kese ho|kaise ho|kya haal|sup|good morning|good afternoon|good evening|who are you|tum kaun ho|aap kaun ho)\b', msg):
        return (
            "Hello! Main **TrafficPulse-X AI Assistant** hoon.\n\n"
            "Main TrafficPulse-X ke 207-sensor network, 14-round Federated Learning model, live replay engine, ya kisi bhi general traffic / technical query ka direct answer de sakta hoon. Aap kya jaanna chahte hain?"
        )

    # ------------------------------------------------------------------------
    # 1. SENSORS & NETWORK COUNT (kitne sensor, sensor count, loop detectors)
    # ------------------------------------------------------------------------
    if any(k in msg for k in [
        "sensor", "sensors", "kitne sensor", "sensor kitne", "kitne sensors", 
        "how many sensors", "sensor count", "total sensors", "loop detector",
        "nodes", "stations", "metr-la sensor", "pems08 sensor", "sensor network"
    ]):
        return (
            "### 📡 TrafficPulse-X Sensor Network Specifications\n\n"
            "TrafficPulse-X is evaluated on **two real-world traffic sensor networks**:\n\n"
            "1. **Primary Network — METR-LA (Los Angeles Freeway Grid):**\n"
            "   - **Total Sensors:** **207 inductive loop sensors** embedded in highway roadbeds across Los Angeles County.\n"
            "   - **Sampling Cadence:** Aggregated every **5 minutes** (288 observations per sensor per day).\n"
            "   - **Temporal Scope:** **34,272 timesteps** (March 1, 2012 to June 27, 2012).\n"
            "   - **4 Regional Client Partitions:**\n"
            "     - **Client A (North-East Cluster):** 48 sensors *(FedAvg Weight: 0.2291)*\n"
            "     - **Client B (South-East Corridor):** 57 sensors *(FedAvg Weight: 0.2771)*\n"
            "     - **Client C (Central-West Arterial):** 58 sensors *(FedAvg Weight: 0.2795)*\n"
            "     - **Client D (North-West Chokepoints):** 44 sensors *(FedAvg Weight: 0.2144)*\n\n"
            "2. **Secondary Network — PeMS08 (Caltrans District 8):**\n"
            "   - **Total Sensors:** **170 vehicle flow stations** across San Bernardino freeways (I-10, I-15, SR-60, I-215).\n"
            "   - **Metric:** Freeway vehicle volume (**veh/5min**).\n"
            "   - **Temporal Scope:** **17,856 timesteps** (July 1 to August 31, 2016).\n\n"
            "💡 *Tip: Aap dashboard ke **Traffic Network (/network)** tab me sabhi 207 sensors ko Leaflet interactive map par click karke inspect kar sakte hain.*"
        )

    # ------------------------------------------------------------------------
    # 2. TRAINING ROUNDS & CONVERGENCE (kitne round, round, fedavg rounds)
    # ------------------------------------------------------------------------
    if any(k in msg for k in [
        "round", "rounds", "kitne round", "round kitne", "kitne rounds",
        "how many rounds", "training rounds", "best round", "round 8", "convergence",
        "iterations", "checkpoint", "epochs"
    ]):
        return (
            "### 🔄 Federated Training Rounds & Convergence\n\n"
            "- **Total Training Rounds:** Hamara model total **14 Federated Learning Rounds (Round 0 to Round 13)** me train hua hai.\n"
            "- **Best Model Checkpoint:** **Round 8** par optimal global validation accuracy mili:\n"
            "  - **Best Validation MAE:** **3.1536 mph**\n"
            "  - **Final Test MAE:** **3.5322 mph** (evaluated across all 207 sensors)\n"
            "- **Saturation Period:** Rounds 9 se 13 me early validation saturation dekhi gayi, isliye production deployment ke liye **Round 8 checkpoint freeze** kiya gaya hai.\n"
            "- **Centralized vs Federated Gap:** Centralized baseline (3.4378 mph) ke mukable federated model sirf **+2.75% (+0.0944 mph)** trade-off deta hai, jabki raw data poori tarah regional edge nodes par private rehta hai.\n\n"
            "📊 *Dashboard Location: **Federated Learning (/federated)** tab me live 'Federated Convergence' chart aur 'Best Round: Round 8' KPI card par yeh data visually present hai.*"
        )

    # ------------------------------------------------------------------------
    # 3. ALL DASHBOARD PAGES & FUNCTIONS (dashboard, kis function ka kya kaam)
    # ------------------------------------------------------------------------
    if any(k in msg for k in [
        "dashboard", "kya kya hai", "kya kya feature", "features", "functions",
        "kaise use kare", "kis function", "kya kaam hai", "modules", "pages", "tabs",
        "project overview", "kahan hai", "what are the pages"
    ]) and not any(k in msg for k in ["prediction", "forecast", "federated", "communication", "decision", "alert", "network"]):
        return (
            "### 🖥️ TrafficPulse-X Dashboard — Sabhi Modules & Functions ka Kaam\n\n"
            "TrafficPulse-X dashboard 7 dedicated tactical pages me structured hai:\n\n"
            "1. **Overview (`/`):**\n"
            "   - **Kaam:** Executive operational cockpit — real-time network speed gauge, active incidents summary, sensor selector, aur next-hour speed trajectory.\n\n"
            "2. **Traffic Network (`/network`):**\n"
            "   - **Kaam:** Leaflet GIS spatial map showing all 207 real METR-LA inductive sensors across Los Angeles freeway corridors with live telemetry, speed color codes (green/yellow/red), and quadrant filters.\n\n"
            "3. **Prediction Engine (`/prediction`):**\n"
            "   - **Kaam:** Multi-horizon forecasting (+5m, +15m, +30m, +60m) using our top-ranked `SpatialGraphLSTM` model against 7 comparative baselines, complete with 95% calibrated confidence intervals.\n\n"
            "4. **Federated Learning (`/federated`):**\n"
            "   - **Kaam:** Decentralized edge training dashboard covering 4 regional partitions (A, B, C, D), 14 global aggregation rounds, Round 8 optimal checkpoint, and data sovereignty guarantees.\n\n"
            "5. **Communication Intelligence (`/communication`):**\n"
            "   - **Kaam:** Evaluates communication overhead, wire-level socket transport bytes, and demonstrates **50% bandwidth reduction** via Client Contribution Value (CCV) 2-of-4 scheduling.\n\n"
            "6. **Decision Intelligence (`/decisions`):**\n"
            "   - **Kaam:** Autonomous operational interventions — 9-factor Need Score triage, multi-sensor agreement Jury (eliminating false alarms), and incident dynamic rerouting.\n\n"
            "7. **Alerts & Incidents (`/alerts`):**\n"
            "   - **Kaam:** Real-time congestion event monitoring, threshold-triggered alerts (<25 mph severe bottlenecks), and incident clearance estimation."
        )

    # ------------------------------------------------------------------------
    # 4. PREDICTION PAGE & FORECASTING
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["prediction", "forecast", "forecasting", "horizon", "future speed", "bhavishya"]):
        return (
            "### 🔮 TrafficPulse-X Forecasting Models & Benchmark\n\n"
            "- **Page:** **Prediction Engine (`/prediction`)**\n"
            "- **Primary Model:** **SpatialGraphLSTM** (Chebyshev Graph Convolution polynomial order $K=3$ + LSTM temporal cells).\n"
            "- **Multi-Horizon Forecasts:**\n"
            "  - **+5 Min:** 2.36 mph MAE *(Short-term ramp metering)*\n"
            "  - **+15 Min:** 3.00 mph MAE *(Signal coordination window)*\n"
            "  - **+30 Min:** 3.67 mph MAE *(Tactical congestion avoidance)*\n"
            "  - **+60 Min:** 4.72 mph MAE *(Strategic routing horizon)*\n"
            "- **Benchmark Ranking:** SpatialGraphLSTM ranked **#1** against 7 peer models (STGCN, DCRNN, LSTM, Ridge, ARIMA, Historical Average).\n"
            "- **Uncertainty Quantification:** Epistemic + aleatoric uncertainty 95% confidence intervals calculate forecast risk in real time."
        )

    # ------------------------------------------------------------------------
    # 5. FEDERATED LEARNING ARCHITECTURE
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["federated", "fedavg", "fl", "privacy", "client a", "decentralized", "aggregation"]):
        return (
            "### 🌐 Federated Learning Architecture (AIORI PS-003)\n\n"
            "- **Algorithm:** Federated Averaging (`FedAvg`) weighted strictly by local dataset target volume: $w_k = |D_k| / \\sum |D_j|$.\n"
            "- **Clients:** 4 non-overlapping spatial clusters (Clients A, B, C, D) mapped to 207 freeway sensors.\n"
            "- **Training:** 14 rounds executed. **Round 8 selected as authoritative checkpoint** with 3.1536 mph validation MAE.\n"
            "- **Privacy:** Raw telemetry never leaves regional client nodes. Only model parameter gradients (26,596 FP32 parameters, ~104 KB) are shared with the central coordinator.\n"
            "- **Security Bounds:** Differential Privacy guarantee with $(\\epsilon=2.5, \\delta=10^{-5})$ using DP-SGD gradient clipping."
        )

    # ------------------------------------------------------------------------
    # 6. COMMUNICATION INTELLIGENCE & BANDWIDTH SAVINGS (50% savings, ccv)
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["communication", "bandwidth", "ccv", "cost", "wire bytes", "savings", "network cost"]):
        return (
            "### 📉 Communication Intelligence & 50% Bandwidth Reduction\n\n"
            "- **Page:** **Communication Intelligence (`/communication`)**\n"
            "- **Problem Solved:** Traditional FL transmits full model updates across all clients every round, congesting cellular backhauls.\n"
            "- **Our Solution (CCV Scheduling):** **Client Contribution Value (CCV)** ranks clients by gradient magnitude and prediction variance, selecting only **2 out of 4 clients per round**.\n"
            "- **Results:**\n"
            "  - **50% Total Communication Reduction:** Cut network transmission from **11.47 MB** to **5.73 MB** over 14 rounds.\n"
            "  - **Minimal Accuracy Trade-off:** Model accuracy only differed by **+0.0944 mph** (+2.75%), proving massive edge bandwidth savings with near-zero loss in performance."
        )

    # ------------------------------------------------------------------------
    # 7. DECISION INTELLIGENCE & SENSOR JURY (need score, triage, jury)
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["decision", "need score", "jury", "triage", "intervention", "rerouting", "actions"]):
        return (
            "### 🧠 TrafficPulse-X Decision Intelligence\n\n"
            "- **Page:** **Decision Intelligence (`/decisions`)**\n"
            "- **9-Factor Need Score Engine:** Under telemetry bandwidth constraints, prioritizes which sensors need urgent transmission based on speed drop, spatial volatility, and uncertainty.\n"
            "- **Multi-Sensor Agreement Jury:** Prevents false alarms by validating an anomaly against 3 neighboring graph sensors before triggering emergency rerouting or alerts.\n"
            "- **Dynamic Traffic Management:** Suggests automated speed advisories, corridor rerouting, and ramp metering adjustments in under 50ms."
        )

    # ------------------------------------------------------------------------
    # 8. REPLAY ENGINE (replay, timeline, scrubber, 34272, history)
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["replay", "scrubber", "timeline", "historical", "slider", "playback", "34272", "step"]):
        return (
            "### ⏱️ Deterministic Historical Replay Engine\n\n"
            "- **Timeline Length:** **34,272 continuous 5-minute timesteps** spanning 4 months of actual Los Angeles highway sensor recordings (March 1 to June 27, 2012).\n"
            "- **Top Scrubber Bar:** Allows instant jumping or continuous playback at 1x, 2x, 5x, or 10x speeds.\n"
            "- **Universal State Synchronization:** Dragging the replay scrubber synchronously updates the Map, Predictions, Decision Need Scores, and Incidents across all 7 dashboard pages."
        )

    # ------------------------------------------------------------------------
    # 9. MODELS & ARCHITECTURE (SpatialGraphLSTM, STGCN, DCRNN, Baselines)
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["model", "models", "kaun sa model", "best model", "spatialgraphlstm", "stgcn", "dcrnn", "lstm", "arima", "chebyshev", "graph convolution"]):
        return (
            "### 🏆 Model Comparison & SpatialGraphLSTM Architecture\n\n"
            "- **Champion Model:** **SpatialGraphLSTM** (Chebyshev order $K=3$ graph convolutions + LSTM temporal recurrent units).\n"
            "- **Overall Performance:**\n"
            "  - **Test MAE:** **3.4378 mph** *(Rank 1 across all 7 candidate models)*\n"
            "  - **Test RMSE:** **6.8873 mph**\n"
            "  - **Test MAPE:** **7.82%**\n"
            "- **Candidate Benchmarks:**\n"
            "  1. `SpatialGraphLSTM`: **3.4378 mph** (Winner)\n"
            "  2. `STGCN` (Spatio-Temporal Graph Conv): **3.6120 mph**\n"
            "  3. `DCRNN` (Diffusion Convolutional RNN): **3.7450 mph**\n"
            "  4. `LSTM` (Temporal Only): **3.8920 mph**\n"
            "  5. `Ridge Regression`: **4.1200 mph**\n"
            "  6. `ARIMA`: **4.3800 mph**\n"
            "  7. `Historical Average`: **4.1934 mph** at +60m"
        )

    # ------------------------------------------------------------------------
    # 10. ACCURACY & METRICS (MAE, RMSE, MAPE)
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["mae", "rmse", "mape", "accuracy", "metric", "metrics", "error", "loss"]):
        return (
            "### 📊 Benchmark Metrics Summary\n\n"
            "- **Validation MAE (Round 8 Checkpoint):** **3.1536 mph**\n"
            "- **Test MAE (Centralized SpatialGraphLSTM):** **3.4378 mph**\n"
            "- **Test MAE (Federated Round 8 Global Model):** **3.5322 mph**\n"
            "- **Federated Privacy Gap:** Only **+0.0944 mph (+2.75%)**, demonstrating enterprise-grade forecasting without centralized data collection."
        )

    # ------------------------------------------------------------------------
    # 11. TEAM & HACKATHON DETAILS (team, aiori, ps003, adarsh, shaurya, aditya)
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["team", "members", "aiori", "ps-003", "ps003", "adarsh", "shaurya", "aditya", "mentor", "who made", "developer", "author"]):
        return (
            "### 👥 AIORI-3 Team A3-PS003-TC198\n\n"
            "- **Hackathon:** AIORI 3 (Grand Finale)\n"
            "- **Problem Statement:** PS-003 — *Federated Traffic-Flow Prediction with Communication-Cost Evaluation*\n"
            "- **Project Name:** TrafficPulse-X\n"
            "- **Team Members:**\n"
            "  - **Adarsh Singh (Team Leader):** FastAPI REST backend (53 endpoints), React 19 dashboard, socket communication benchmarks, temporal replay engine.\n"
            "  - **Shaurya Pratap Singh (Team Member):** Spatio-temporal `SpatialGraphLSTM`, decentralized FedAvg, CCV scheduling (50% savings), differential privacy.\n"
            "  - **Aditya Srivastava (Faculty Mentor):** Research supervision, spatial graph formulations, non-IID client partitioning advisory."
        )

    # ------------------------------------------------------------------------
    # 12. TECH STACK & ARCHITECTURE (tech stack, fastapi, react, vite, pytorch)
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["tech stack", "technologies", "fastapi", "react", "vite", "pytorch", "tailwind", "python"]):
        return (
            "### 🛠️ Production Technology Stack\n\n"
            "- **Frontend:** React 19, Vite, Tailwind CSS, Leaflet GIS mapping, Recharts, Lucide Icons.\n"
            "- **Backend:** FastAPI (Python 3.10+), PyTorch 2.0+, NumPy, SciPy, Uvicorn, Pydantic.\n"
            "- **Testing & Quality:** **343 automated tests** (`pytest`) with 100% pass rate covering API contracts, physics bounds, and mathematical reconciliation.\n"
            "- **Code Quality:** Oxlint with zero linter errors across 77 frontend files."
        )

    # ------------------------------------------------------------------------
    # 13. ALERTS & INCIDENT DETECTION
    # ------------------------------------------------------------------------
    if any(k in msg for k in ["alert", "alerts", "incident", "incidents", "congestion", "jam"]):
        return (
            "### 🚨 Alerts & Real-Time Incident Management\n\n"
            "- **Page:** **Alerts & Incidents (`/alerts`)**\n"
            "- **Congestion Thresholds:** Speeds below 25 mph trigger yellow/red bottleneck flags.\n"
            "- **Incident Triaging:** Incidents are scored by severity, affected lanes, estimated clearance time, and downstream propagation delay."
        )

    # No domain match found; return None to trigger live web search
    return None


def generate_chat_reply(request: ChatRequest) -> ChatResponse:
    """Processes chat request: first via Gemini (if key exists), then local domain knowledge, then live web search."""
    raw_message = (request.message or "").strip()
    if not raw_message:
        return ChatResponse(
            reply="Please enter a question about TrafficPulse-X models, federated learning, sensors, or dashboard functions.",
            source="local_knowledge_base",
            model="trafficpulse-knowledge-v2"
        )

    clean_message = raw_message[:1000]
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    # 1. If Gemini API key is configured, attempt calling Gemini REST endpoint
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [
                    {"role": "user" if m.role == "user" else "model", "parts": [{"text": m.content}]}
                    for m in (request.history or [])[-4:]
                ] + [{"role": "user", "parts": [{"text": clean_message}]}]
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return ChatResponse(
                    reply=reply_text,
                    source="gemini",
                    model="gemini-1.5-flash"
                )
        except Exception as e:
            logger.warning(f"Gemini API request failed ({e}), falling back to knowledge base / search.")

    # 2. Check local verified domain knowledge base
    domain_reply = _query_local_knowledge_base(clean_message)
    if domain_reply:
        return ChatResponse(
            reply=domain_reply,
            source="local_knowledge_base",
            model="trafficpulse-knowledge-v2"
        )

    # 3. If no domain keyword matched, perform live web search (DuckDuckGo + Wikipedia)
    search_reply = _search_live_knowledge(clean_message)
    if search_reply:
        return ChatResponse(
            reply=search_reply,
            source="search_engine",
            model="live-web-search"
        )

    # 4. Clean, direct fallback if no match and search offline
    fallback_text = (
        f"Aapke sawal **\"{clean_message}\"** ke liye direct match nahi mila.\n\n"
        "TrafficPulse-X platform par aap in mukhya topics ke baare me pooch sakte hain:\n"
        "- **Sensors:** 207 METR-LA + 170 PeMS08 sensors ki detail.\n"
        "- **Federated Learning:** 14 rounds training, Round 8 optimal checkpoint.\n"
        "- **Bandwidth:** CCV scheduling dwara 50% communication savings.\n"
        "- **Models:** SpatialGraphLSTM architecture aur comparison metrics.\n"
        "- **Dashboard Pages:** Overview, Traffic Network, Prediction, FL, Comm, Decisions, Alerts."
    )
    return ChatResponse(
        reply=fallback_text,
        source="local_knowledge_base",
        model="trafficpulse-knowledge-v2"
    )
