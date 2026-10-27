"""
Controlled Network Accounting Module for TrafficPulse-X.
Provides read-only access to local transport benchmark measurements:
- Authoritative Metric: "Serialized Application Payload"
- Experimental Accounting: "Controlled Network Transfer Bytes — Local Test"
- Localhost (127.0.0.1) TCP stream & HTTP wire metrics
- Strict wording safeguards (never claims cellular or city network bandwidth)
"""

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional

REPORT_PATH = Path("data/processed/metr-la/experiments/measured_network_accounting.json")


def get_network_accounting_status() -> Dict[str, Any]:
    """Returns availability and status of controlled network accounting experiment."""
    exists = REPORT_PATH.exists()
    return {
        "status": "AVAILABLE" if exists else "NOT_EVALUATED",
        "artifactExists": exists,
        "authoritativeMetric": "Serialized Application Payload",
        "experimentalMetric": "Controlled Network Transfer Bytes — Local Test",
        "wording": "Controlled Network Transfer Bytes — Local Test",
        "allowedViews": ["APPLICATION_PAYLOAD", "MEASURED_NETWORK_BYTES"],
        "disclaimer": "Measurements conducted on local loopback transport (127.0.0.1). Physical carrier radio and cell-tower backhaul are not modeled."
    }


def get_network_accounting_report() -> Dict[str, Any]:
    """Returns complete benchmark report or fallback NOT_EVALUATED state."""
    if not REPORT_PATH.exists():
        return {
            "status": "NOT_EVALUATED",
            "message": "Measured network accounting benchmark artifact not found. Run ml/experiments/transport_benchmark.py to generate.",
            "policies": {}
        }

    try:
        with open(REPORT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {
            "status": "AVAILABLE",
            **data
        }
    except Exception as err:
        return {
            "status": "ERROR",
            "message": f"Failed to load accounting artifact: {str(err)}",
            "policies": {}
        }
