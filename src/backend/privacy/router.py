"""
Backend Privacy Router for TrafficPulse-X.
Provides read-only API endpoints for Differential Privacy experiment metrics,
formal (ε, δ)-DP privacy budget, comparative accuracy trade-offs,
and verified Secure Aggregation simulation details.
"""

import os
import json
from typing import Dict, Any, Optional
from fastapi import HTTPException

DP_RESULTS_PATH = "data/processed/metr-la/experiments/dp_federated_results.json"


def load_dp_results() -> Optional[Dict[str, Any]]:
    """Loads DP federated experiment results artifact if available."""
    if not os.path.exists(DP_RESULTS_PATH):
        return None
    try:
        with open(DP_RESULTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def get_privacy_status() -> Dict[str, Any]:
    """Returns availability status of the differential privacy experiment."""
    data = load_dp_results()
    if data is None:
        return {
            "status": "NOT_EVALUATED",
            "evaluated": False,
            "message": "Not Evaluated",
            "provenance": None
        }

    return {
        "status": "COMPLETED",
        "evaluated": True,
        "heading": data.get("privacySpecification", {}).get("safeHeading", "Formal Differential Privacy Experiment"),
        "claim": data.get("privacySpecification", {}).get("formalClaim", "(ε, δ)-DP under the evaluated training configuration"),
        "epsilon": data.get("privacySpecification", {}).get("epsilon"),
        "delta": data.get("privacySpecification", {}).get("delta"),
        "timestamp": data.get("provenance", {}).get("executionTimestamp")
    }


def get_privacy_results() -> Dict[str, Any]:
    """
    Returns comparative evaluation results between Standard FedAvg and DP-FedAvg.
    If no valid DP run exists, returns status 'NOT_EVALUATED' with message 'Not Evaluated'.
    """
    data = load_dp_results()
    if data is None:
        return {
            "status": "NOT_EVALUATED",
            "evaluated": False,
            "message": "Not Evaluated",
            "safeHeading": "Formal Differential Privacy Experiment",
            "standardBaseline": {
                "framework": "Standard FedAvg (Non-IID Geographic)",
                "testMAE": 3.5322,
                "testRMSE": 7.0956,
                "epsilon": None,
                "delta": None,
                "status": "Baseline Frozen"
            },
            "dpFedAvg": {
                "framework": "DP-FedAvg",
                "testMAE": None,
                "testRMSE": None,
                "epsilon": None,
                "delta": None,
                "status": "Not Evaluated"
            }
        }

    # Strict invariant: never return 'Privacy Guaranteed'
    spec = data.get("privacySpecification", {})
    if spec.get("isPrivacyGuaranteed") is True:
        spec["isPrivacyGuaranteed"] = False

    return {
        "status": "COMPLETED",
        "evaluated": True,
        "provenance": data.get("provenance"),
        "privacySpecification": spec,
        "standardBaseline": data.get("standardBaseline"),
        "dpFedAvg": data.get("dpFedAvg"),
        "tradeoffAnalysis": data.get("tradeoffAnalysis"),
        "secureAggregation": data.get("secureAggregation")
    }


def get_secure_aggregation_simulation() -> Dict[str, Any]:
    """Returns verified Secure Aggregation simulation results and protocol overhead."""
    data = load_dp_results()
    if data is None or "secureAggregation" not in data:
        return {
            "status": "NOT_EVALUATED",
            "evaluated": False,
            "label": "Secure Aggregation Simulation",
            "message": "Not Evaluated",
            "disclaimer": "SIMULATION ONLY: Demonstrates pairwise additive mask cancellation; not a production threshold cryptography or HSM deployment."
        }

    return {
        "status": "COMPLETED",
        "evaluated": True,
        **data["secureAggregation"]
    }
