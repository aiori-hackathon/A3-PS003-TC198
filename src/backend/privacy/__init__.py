"""
Backend Privacy Module for TrafficPulse-X.
Exposes endpoints for formal Differential Privacy experiment results,
Opacus privacy accountant metrics (epsilon, delta), and Secure Aggregation simulation.
"""

from .router import (
    get_privacy_status,
    get_privacy_results,
    get_secure_aggregation_simulation
)

__all__ = [
    "get_privacy_status",
    "get_privacy_results",
    "get_secure_aggregation_simulation"
]
