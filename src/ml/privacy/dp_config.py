"""
Differential Privacy Configuration Dataclass for TrafficPulse-X.
Exposes formal DP hyperparameters: max_grad_norm, noise_multiplier, delta,
and optional secure aggregation simulation flag.
"""

from dataclasses import dataclass, asdict
from typing import Dict, Any


@dataclass
class DPConfig:
    """
    Formal Differential Privacy Hyperparameter Specification.

    Attributes:
        enabled: Whether differential privacy is enabled during local training.
        max_grad_norm: Global clipping threshold C for client gradient vectors.
        noise_multiplier: Ratio sigma of Gaussian noise standard deviation to clipping norm.
        delta: Target delta parameter for (epsilon, delta)-DP accounting (strictly < 1 / N).
        secure_aggregation: Whether to simulate zero-sum pairwise additive masking.
    """
    enabled: bool = True
    max_grad_norm: float = 1.0
    noise_multiplier: float = 0.5
    delta: float = 1e-5
    secure_aggregation: bool = False

    def validate(self) -> None:
        """Validates configuration parameters."""
        if self.enabled:
            if self.max_grad_norm <= 0:
                raise ValueError(f"max_grad_norm must be positive, got {self.max_grad_norm}")
            if self.noise_multiplier < 0:
                raise ValueError(f"noise_multiplier cannot be negative, got {self.noise_multiplier}")
            if not (0 < self.delta < 1):
                raise ValueError(f"delta must be in (0, 1), got {self.delta}")

    def to_dict(self) -> Dict[str, Any]:
        """Converts config to dictionary representation."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DPConfig":
        """Instantiates DPConfig from dictionary."""
        cfg = cls(
            enabled=bool(data.get("enabled", True)),
            max_grad_norm=float(data.get("max_grad_norm", 1.0)),
            noise_multiplier=float(data.get("noise_multiplier", 0.5)),
            delta=float(data.get("delta", 1e-5)),
            secure_aggregation=bool(data.get("secure_aggregation", False))
        )
        cfg.validate()
        return cfg
