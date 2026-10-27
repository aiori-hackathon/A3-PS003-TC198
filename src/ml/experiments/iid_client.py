"""
IID Federated Client Implementation.
Uses identical architecture (SpatialGraphLSTM), loss function (Masked MAE),
optimizer (Adam, lr=0.001), and batching (64) as the non-IID regional client.
"""

import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from typing import Dict, Any, List, Optional

from ml.spatiotemporal.model import SpatialGraphLSTM
from ml.experiments.iid_partition import get_iid_subgraph, get_iid_client_data_slice, load_iid_partitions
from ml.federated.aggregation import validate_model_parameters


def set_seed(seed: int = 42):
    torch.manual_seed(seed)
    np.random.seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


class IIDFederatedClient:
    """
    Simulated FL Client bound to an IID uniform-random partition of METR-LA sensors.
    """

    def __init__(
        self,
        client_id: str,
        raw_dir: str = "data/raw/metr-la",
        processed_dir: str = "data/processed/metr-la",
        device: Optional[torch.device] = None,
        seed: int = 42
    ):
        self.client_id = client_id
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.seed = seed

        # Load partition info
        meta = load_iid_partitions()
        partitions = meta["partitions"]
        if client_id not in partitions:
            raise KeyError(f"Invalid client_id '{client_id}'")
        self.partition_info = partitions[client_id]

        self.sensor_count = self.partition_info["sensorCount"]
        self.global_indices = self.partition_info["globalIndices"]
        self.sensor_ids = self.partition_info["sensorIds"]
        self.train_valid_targets = self.partition_info["trainValidTargets"]

        # Scaler
        with open(os.path.join(processed_dir, "scaler.json"), "r", encoding="utf-8") as f:
            sc = json.load(f)
            self.mean = float(sc.get("mean", 58.584258))
            self.std = float(sc.get("std", 12.822883))

        # Induced regional subgraph
        _, a_norm_sub, _, _ = get_iid_subgraph(client_id, raw_dir=raw_dir)
        self.a_norm_tensor = torch.tensor(a_norm_sub, dtype=torch.float32, device=self.device)

        # Data Slices
        self.train_x, self.train_y, self.train_x_mask, self.train_y_mask = get_iid_client_data_slice(
            client_id, split="train", processed_dir=processed_dir
        )
        self.val_x, self.val_y, self.val_x_mask, self.val_y_mask = get_iid_client_data_slice(
            client_id, split="val", processed_dir=processed_dir
        )

        # Model instance
        set_seed(seed)
        self.model = SpatialGraphLSTM(
            in_features=2,
            spatial_dim=32,
            hidden_dim=64,
            output_horizons=4,
            seq_len=12,
            use_residual=True
        ).to(self.device)

        self.downloaded_state_dict: Optional[Dict[str, torch.Tensor]] = None
        self.serialized_payload_bytes = 106384

    def download_global_model(self, global_state_dict: Dict[str, torch.Tensor]):
        if not validate_model_parameters(global_state_dict):
            raise ValueError(f"IID Client {self.client_id} received non-finite global weights.")
        self.downloaded_state_dict = {k: v.clone().cpu() for k, v in global_state_dict.items()}
        self.model.load_state_dict(global_state_dict)

    def train_local_epoch(
        self,
        batch_size: int = 64,
        lr: float = 0.001,
        local_seed: int = 42,
        max_batches: Optional[int] = None
    ) -> float:
        set_seed(local_seed)
        self.model.train()
        optimizer = optim.Adam(self.model.parameters(), lr=lr)

        num_samples = self.train_x.shape[0]
        indices = np.arange(num_samples)
        np.random.shuffle(indices)

        effective_batches = num_samples // batch_size
        if max_batches is not None:
            effective_batches = min(effective_batches, max_batches)

        total_loss = 0.0
        batches_run = 0

        for b in range(effective_batches):
            b_idx = indices[b * batch_size: (b + 1) * batch_size]
            bx = self.train_x[b_idx]
            by = self.train_y[b_idx]
            bx_mask = self.train_x_mask[b_idx]
            by_mask = self.train_y_mask[b_idx]

            bx_input = np.concatenate([bx, bx_mask], axis=-1)
            bx_tensor = torch.tensor(bx_input, dtype=torch.float32, device=self.device)
            by_tensor = torch.tensor(by, dtype=torch.float32, device=self.device)
            by_mask_tensor = torch.tensor(by_mask, dtype=torch.float32, device=self.device)

            optimizer.zero_grad()
            out_norm = self.model(bx_tensor, self.a_norm_tensor)
            out_denorm = out_norm * self.std + self.mean
            out_denorm = torch.clamp(out_denorm, 0.0, 100.0)

            valid_mask = (by_mask_tensor > 0.0) & (by_tensor > 0.0)
            if valid_mask.sum() > 0:
                loss = torch.abs(out_denorm - by_tensor)[valid_mask].mean()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 5.0)
                optimizer.step()

                total_loss += loss.item()
                batches_run += 1

        return float(round(total_loss / max(1, batches_run), 4))

    def get_upload_payload(self) -> Dict[str, torch.Tensor]:
        return {k: v.clone().cpu() for k, v in self.model.state_dict().items()}

    def upload_model_update(
        self,
        current_round: int = 1,
        local_train_mae: float = 0.0
    ) -> Dict[str, Any]:
        curr_state = {k: v.clone().cpu() for k, v in self.model.state_dict().items()}
        return {
            "clientId": self.client_id,
            "round": current_round,
            "localTrainMAE": local_train_mae,
            "validTrainTargets": self.train_valid_targets,
            "downloadPayloadBytes": self.serialized_payload_bytes,
            "uploadPayloadBytes": self.serialized_payload_bytes,
            "classification": "SERIALIZED_APPLICATION_PAYLOAD_BYTES",
            "stateDict": curr_state
        }
