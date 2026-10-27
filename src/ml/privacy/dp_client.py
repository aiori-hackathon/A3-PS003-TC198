"""
Differential Privacy Federated Client for TrafficPulse-X.
Implements client-side (ε, δ)-DP local training with gradient clipping,
Gaussian perturbation, and Opacus RDP privacy accounting.
"""

import os
import math
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Dict, Any, Optional

from ml.federated.client import FederatedClient, set_seed
from ml.privacy.dp_config import DPConfig

# Opacus verified privacy accountant
try:
    from opacus.accountants import RDPAccountant
    OPACUS_AVAILABLE = True
except ImportError:
    RDPAccountant = None
    OPACUS_AVAILABLE = False


class DPFederatedClient(FederatedClient):
    """
    Federated Client equipped with Client-Side Differential Privacy.
    When dp_config.enabled is True:
        Applies gradient norm clipping (max_grad_norm), calibrated Gaussian noise
        (noise_multiplier), and tracks formal privacy budget with Opacus RDPAccountant.
    When dp_config.enabled is False:
        Executes standard baseline FedAvg training without any perturbation or overhead.
    """

    def __init__(
        self,
        client_id: str,
        region_id: str,
        dp_config: Optional[DPConfig] = None,
        raw_dir: str = "data/raw/metr-la",
        processed_dir: str = "data/processed/metr-la",
        device: Optional[torch.device] = None,
        seed: int = 42
    ):
        super().__init__(
            client_id=client_id,
            region_id=region_id,
            raw_dir=raw_dir,
            processed_dir=processed_dir,
            device=device,
            seed=seed
        )
        self.dp_config = dp_config or DPConfig(enabled=False)
        self.dp_config.validate()

        self.accountant = None
        self.total_dp_steps = 0
        if self.dp_config.enabled:
            if not OPACUS_AVAILABLE:
                raise RuntimeError("Opacus is required for formal Differential Privacy accounting.")
            self.accountant = RDPAccountant()

    def train_local_epoch(
        self,
        batch_size: int = 64,
        lr: float = 0.001,
        local_seed: int = 42,
        max_batches: Optional[int] = None
    ) -> float:
        """
        Executes 1 local training epoch.
        If DP is disabled, calls the standard baseline train_local_epoch to preserve
        zero regression.
        If DP is enabled, applies gradient clipping, Gaussian noise injection,
        and privacy accountant stepping.
        """
        if not self.dp_config.enabled:
            return super().train_local_epoch(
                batch_size=batch_size,
                lr=lr,
                local_seed=local_seed,
                max_batches=max_batches
            )

        set_seed(local_seed)
        self.model.train()
        optimizer = optim.Adam(self.model.parameters(), lr=lr)

        num_samples = self.train_x.shape[0]
        indices = np.arange(num_samples)
        np.random.shuffle(indices)

        total_loss = 0.0
        total_valid = 0
        batch_count = 0

        # Subsample rate for local dataset
        sample_rate = float(batch_size) / float(max(1, num_samples))

        for i in range(0, num_samples, batch_size):
            if max_batches is not None and batch_count >= max_batches:
                break
            batch_count += 1
            batch_idx = indices[i: i + batch_size]
            current_bs = len(batch_idx)

            bx = self.train_x[batch_idx]
            bx_mask = self.train_x_mask[batch_idx]
            by = self.train_y[batch_idx]
            by_mask = self.train_y_mask[batch_idx]

            bx_input = np.concatenate([bx, bx_mask], axis=-1)
            bx_tensor = torch.tensor(bx_input, dtype=torch.float32, device=self.device)
            by_tensor = torch.tensor(by, dtype=torch.float32, device=self.device)
            by_mask_tensor = torch.tensor(by_mask, dtype=torch.float32, device=self.device)

            optimizer.zero_grad()
            out_norm = self.model(bx_tensor, self.a_norm_tensor)
            out_raw = out_norm * self.std + self.mean

            valid_mask = (by_mask_tensor > 0.0) & (by_tensor > 0.0)
            if valid_mask.sum() > 0:
                loss = torch.abs(out_raw[valid_mask] - by_tensor[valid_mask]).mean()
                loss.backward()

                # 1. Gradient Norm Clipping: Clip parameters to max_grad_norm C
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(),
                    max_norm=self.dp_config.max_grad_norm
                )

                # 2. Gaussian Perturbation: Add N(0, (sigma * C)^2 / B) to gradients
                noise_std = (self.dp_config.noise_multiplier * self.dp_config.max_grad_norm) / math.sqrt(max(1, current_bs))
                for param in self.model.parameters():
                    if param.grad is not None:
                        noise = torch.randn_like(param.grad) * noise_std
                        param.grad.add_(noise)

                optimizer.step()

                # 3. Privacy Accountant Step
                self.accountant.step(
                    noise_multiplier=self.dp_config.noise_multiplier,
                    sample_rate=sample_rate
                )
                self.total_dp_steps += 1

                total_loss += (torch.abs(out_raw[valid_mask] - by_tensor[valid_mask]).sum()).item()
                total_valid += valid_mask.sum().item()

        avg_mae = (total_loss / max(1, total_valid)) if total_valid > 0 else 0.0
        return round(float(avg_mae), 4)

    def compute_privacy_budget(self) -> Optional[Dict[str, float]]:
        """
        Computes formal (epsilon, delta) privacy budget using Opacus RDP accountant.
        Returns None if DP is disabled or no steps have been executed.
        """
        if not self.dp_config.enabled or self.accountant is None or self.total_dp_steps == 0:
            return None

        epsilon = float(self.accountant.get_epsilon(delta=self.dp_config.delta))
        return {
            "epsilon": round(epsilon, 4),
            "delta": self.dp_config.delta,
            "maxGradNorm": self.dp_config.max_grad_norm,
            "noiseMultiplier": self.dp_config.noise_multiplier,
            "totalSteps": self.total_dp_steps
        }

    def upload_model_update(
        self,
        current_round: int = 1,
        local_train_mae: float = 0.0
    ) -> Dict[str, Any]:
        """
        Constructs client update payload with optional DP metadata.
        """
        res = super().upload_model_update(
            current_round=current_round,
            local_train_mae=local_train_mae
        )
        res["dp"] = self.compute_privacy_budget() or {"enabled": False}
        return res
