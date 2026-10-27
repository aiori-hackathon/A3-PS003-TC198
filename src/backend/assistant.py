# TrafficPulse-X AI Assistant Service
# Secure server-side LLM integration using Gemini REST API with domain knowledge fallback

import os
import json
import logging
import urllib.request
import urllib.error
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

logger = logging.getLogger("trafficpulse.assistant")

SYSTEM_PROMPT = """You are TrafficPulse-X Assistant, an expert AI pair-programmer and traffic-mobility systems engineer embedded in the TrafficPulse-X platform.

TrafficPulse-X System Architecture & Context:
1. Core Mission: Spatio-temporal traffic forecasting, active decision intelligence, and privacy-preserving federated learning on real-world traffic networks.
2. Dataset & Telemetry: Evaluated on the METR-LA traffic speed benchmark (207 inductive loop sensors, Los Angeles freeway network, 5-minute telemetry intervals).
3. Primary Forecasting Model: Spatial Graph Convolution + LSTM (Chebyshev spectral graph convolutions with temporal recurrent units). Produces multi-horizon forecasts (+5 min, +15 min, +30 min, +60 min).
   - Best overall test MAE: 3.4378 mph (Rank 1 across 7 evaluated benchmark models).
   - Historical Average baseline provides long-horizon ceiling at +60 min (4.1934 mph).
4. Federated Learning Architecture:
   - 4 Regional Client Partitions (Clients A, B, C, D) partitioned via K-Means spatial graph clustering.
   - FedAvg aggregation with weights proportional to partition target counts (w_k = |D_k| / sum(|D_j|)).
   - Optimal validation checkpoint: Round 8 (Val MAE: 3.1536 mph).
   - Test MAE: 3.5322 mph with only a +2.75% (+0.0944 mph) trade-off compared to centralized training, preserving data sovereignty.
   - Each model update payload is strictly 26,596 FP32 parameters (~104 KB).
5. Indian Smart-Mobility Infrastructure & Case Studies:
   - Ranchi Smart City: 81 locations with Adaptive Traffic Control Systems (ATCS), ANPR cameras, and Red Light Violation Detection (RLVD).
   - Tumakuru Smart City: 33+ junctions integrated into an Integrated Command and Control Centre (ICCC), dynamic signal phase tuning.
   - Visakhapatnam (Vizag) Smart City: 10 major junctions, 65 lanes, >100 cameras, automated corridor management.
   - SCIENTIFIC BOUNDARY: Ranchi, Tumakuru, and Visakhapatnam operate physical ATCS/ICCC deployments under India's Smart Cities Mission (MoHUA). TrafficPulse-X presents an architectural framework showing how multi-city municipal infrastructure can securely learn collaborative traffic models via Federated Learning without centralizing raw camera or sensor feeds.
6. Decision & Communication Intelligence:
   - Need-score based active sensing under bandwidth and communication budget constraints.
   - Counterfactual reasoning, graph-level blind-spot detection, and gradient sparsification.

Instructions:
- Provide concise, technically accurate, helpful responses.
- Maintain scientific integrity: never fabricate benchmark statistics or claim false production adoptions.
- Answer user queries about TrafficPulse-X, spatio-temporal deep learning, traffic engineering, federated learning, and general technical questions.
"""

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    source: str  # "gemini" | "local_knowledge_base"
    model: str


def _query_local_knowledge_base(user_message: str) -> str:
    """Provides authentic, comprehensive domain answers when Gemini API key is not configured."""
    msg = user_message.lower()

    if any(k in msg for k in ["ranchi", "tumakuru", "tumkur", "vizag", "visakhapatnam", "india", "mohua", "case study", "case studies"]):
        return (
            "**TrafficPulse-X & Indian Smart-Mobility Deployments:**\n\n"
            "TrafficPulse-X connects its federated learning architecture to 3 documented Indian smart-mobility municipal deployments under the **Ministry of Housing and Urban Affairs (MoHUA) Smart Cities Mission**:\n\n"
            "1. **Ranchi Smart City (Jharkhand)**: 81 intersections equipped with Adaptive Traffic Control Systems (ATCS), ANPR cameras, and Red Light Violation Detection (RLVD). In our FL architecture, this maps to an Edge Client Node where raw camera video stays local at the Ranchi ICCC and only ~104 KB of model weights are transmitted.\n"
            "2. **Tumakuru Smart City (Karnataka)**: 33+ junctions and an Integrated Command & Control Centre (ICCC). Demonstrates cross-jurisdiction transfer along the Bengaluru–Tumakuru industrial corridor without sharing citizen trip traces.\n"
            "3. **Visakhapatnam (Vizag) Smart City (Andhra Pradesh)**: 10 major multi-approach junctions across 65 traffic lanes with >100 ATCS cameras, mapping to coastal arterial graph partitions with localized Chebyshev graph convolution.\n\n"
            "> *Scientific Boundary:* These cities operate verified municipal ATCS/ICCC infrastructure. TrafficPulse-X demonstrates how Federated Learning can collaboratively train across such municipal edge nodes without centralizing raw camera/sensor data."
        )

    if any(k in msg for k in ["federated", "fl", "fedavg", "client", "partition", "round 8", "privacy"]):
        return (
            "**TrafficPulse-X Federated Learning (Regional FedAvg):**\n\n"
            "- **Partitioning**: 207 METR-LA sensors clustered into 4 regional clients (Clients A, B, C, D) using K-Means spatial topology.\n"
            "- **Aggregation**: Federated Averaging with weights strictly proportional to observation targets ($w_k = |D_k| / \\sum |D_j|$).\n"
            "- **Validation Checkpoint**: Early stopping selected **Round 8** with a Validation MAE of **3.1536 mph**.\n"
            "- **Test Generalization**: Evaluated on full test set at **3.5322 mph MAE**—only a **+2.75% (+0.0944 mph)** trade-off compared to the centralized baseline (3.4378 mph).\n"
            "- **Bandwidth Efficiency**: Model updates contain exactly 26,596 FP32 parameters (~104 KB per round), drastically reducing WAN transmission overhead."
        )

    if any(k in msg for k in ["model", "benchmark", "graph+lstm", "lstm", "mae", "rmse", "prediction", "radar"]):
        return (
            "**TrafficPulse-X Forecasting Models & Benchmark:**\n\n"
            "- **Primary Architecture**: `SpatialGraphLSTM` combining Chebyshev spectral graph convolutions (capturing road network geometry) with LSTM recurrent cells (temporal flow dynamics).\n"
            "- **Overall Performance**: Lowest test MAE of **3.4378 mph** and RMSE of **6.8873 mph** across 7 evaluated candidate models.\n"
            "- **Multi-Horizon Breakdown**:\n"
            "  - **+5 min**: 2.3648 mph MAE (Graph+LSTM)\n"
            "  - **+15 min**: 3.0007 mph MAE (Graph+LSTM)\n"
            "  - **+30 min**: 3.6699 mph MAE (Graph+LSTM)\n"
            "  - **+60 min**: 4.7158 mph MAE (Historical Average baseline excels here at 4.1934 mph as recurrent variance widens).\n"
            "- **Input Tensor**: Past 12 timesteps (60 minutes) at 5-minute sampling intervals predicting 12 future steps."
        )

    if any(k in msg for k in ["sensor", "metr-la", "dataset", "network", "loop", "caltrans"]):
        return (
            "**METR-LA Sensor Network Specification:**\n\n"
            "- **Coverage**: 207 inductive loop sensors embedded across Los Angeles County freeways.\n"
            "- **Cadence**: Aggregated every 5 minutes (288 observations per sensor per day).\n"
            "- **Regions**: Grouped into 4 quadrants:\n"
            "  - Region A (North-East): 48 sensors\n"
            "  - Region B (South-East): 57 sensors\n"
            "  - Region C (Central-West): 58 sensors\n"
            "  - Region D (North-West): 44 sensors\n"
            "- **Adjacency**: Formed via road network distance thresholding with Gaussian kernel weighting."
        )

    if any(k in msg for k in ["decision", "counterfactual", "need score", "blind spot", "active"]):
        return (
            "**TrafficPulse-X Decision Intelligence:**\n\n"
            "- **Need-Score Engine**: Computes information entropy, drift magnitude, and spatial uncertainty to prioritize which sensors require active high-bandwidth telemetry.\n"
            "- **Budget Constraints**: Dynamically allocates transmission slots (e.g., 20% or 50% sensing quota) while minimizing network-wide forecast degradation.\n"
            "- **Counterfactuals**: Evaluates the expected uncertainty reduction if a specific blind-spot or degraded sensor is queried versus left unmonitored."
        )

    # General fallback
    return (
        f"**TrafficPulse-X Assistant Response:**\n\n"
        f"Regarding your query: *\"{user_message}\"*\n\n"
        "TrafficPulse-X is a production-ready spatio-temporal traffic intelligence platform integrating:\n"
        "1. **Graph+LSTM Traffic Forecasting** across 207 METR-LA sensors with calibrated uncertainty.\n"
        "2. **Privacy-Preserving Federated Learning** across 4 regional clients with verified convergence at Round 8.\n"
        "3. **Indian Smart-Mobility Case Studies** connecting Ranchi, Tumakuru, and Visakhapatnam ATCS/ICCC infrastructure to edge federated learning.\n"
        "4. **Active Decision Intelligence** with uncertainty-driven sensor need scoring.\n\n"
        "*Note: Server is currently operating using the built-in TrafficPulse-X Knowledge Engine. To enable real-time Gemini LLM responses for arbitrary general questions, set `GEMINI_API_KEY` in your environment or `.env` file.*"
    )


def generate_chat_reply(request: ChatRequest) -> ChatResponse:
    """Processes chat request via Gemini API if key is available, or falls back to local knowledge base."""
    raw_message = (request.message or "").strip()
    if not raw_message:
        return ChatResponse(
            reply="Please enter a question about TrafficPulse-X models, federated learning, or traffic intelligence.",
            source="local_knowledge_base",
            model="trafficpulse-knowledge-v1"
        )

    # Enforce safe message length limit (1000 chars)
    clean_message = raw_message[:1000]

    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        reply_text = _query_local_knowledge_base(clean_message)
        return ChatResponse(
            reply=reply_text,
            source="local_knowledge_base",
            model="trafficpulse-knowledge-v1"
        )

    # Attempt Gemini API call
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

        contents = []
        # Include history if available (limit to last 4 turns)
        if request.history:
            for item in request.history[-4:]:
                role = "user" if item.role == "user" else "model"
                safe_text = (item.content or "")[:1000]
                contents.append({
                    "role": role,
                    "parts": [{"text": safe_text}]
                })

        contents.append({
            "role": "user",
            "parts": [{"text": clean_message}]
        })

        payload = {
            "system_instruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 800
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=12) as response:
            result_data = json.loads(response.read().decode("utf-8"))
            candidates = result_data.get("candidates", [])
            if candidates:
                first_cand = candidates[0]
                content_parts = first_cand.get("content", {}).get("parts", [])
                if content_parts:
                    reply_text = content_parts[0].get("text", "")
                    return ChatResponse(
                        reply=reply_text,
                        source="gemini",
                        model="gemini-1.5-flash"
                    )

        # If candidates empty, fallback
        reply_text = _query_local_knowledge_base(request.message)
        return ChatResponse(
            reply=reply_text,
            source="local_knowledge_base",
            model="trafficpulse-knowledge-v1"
        )

    except Exception as e:
        logger.warning(f"Gemini API request failed or timed out: {e}. Falling back to domain knowledge base.")
        reply_text = _query_local_knowledge_base(request.message)
        return ChatResponse(
            reply=reply_text,
            source="local_knowledge_base",
            model="trafficpulse-knowledge-v1"
        )
