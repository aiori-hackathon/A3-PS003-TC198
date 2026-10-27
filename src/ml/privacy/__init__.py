"""
Differential Privacy Federated Learning Module for TrafficPulse-X.
Provides formal (ε, δ)-DP client-side training using Opacus privacy accountant,
gradient clipping, Gaussian noise injection, and secure aggregation simulation.
"""

from .dp_config import DPConfig
from .dp_client import DPFederatedClient
from .runner import run_dp_federated_experiment
from .secure_aggregation import simulate_secure_aggregation

__all__ = [
    "DPConfig",
    "DPFederatedClient",
    "run_dp_federated_experiment",
    "simulate_secure_aggregation"
]
