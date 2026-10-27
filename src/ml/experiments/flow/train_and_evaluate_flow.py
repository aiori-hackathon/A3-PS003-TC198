"""
Flow Forecasting Model Training and Evaluation Pipeline.
Reuses the SpatialGraphLSTM architecture (Spatial GCN + LSTM) for PeMS08 traffic flow forecasting.
Evaluates multi-horizon forecasts (+5m, +15m, +30m, +60m) on the PeMS08 test set.
Computes empirical MAE, RMSE, and MAPE in real physical units (vehicles / 5min).

Strict Isolation:
- Model checkpoint saved to: data/processed/pems08/models/flow_spatial_graph_lstm_best.pt
- Never alters METR-LA checkpoints or models.
"""

import os
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from ml.spatiotemporal.model import SpatialGraphLSTM


class PeMS08FlowDataset(Dataset):
    """
    Sliding window dataset for PeMS08 multi-horizon flow forecasting.
    Input: [12, 170, 2] (flow_norm, time_of_day)
    Target: [4, 170, 1] (+5m, +15m, +30m, +60m flow in veh/5min)
    """
    def __init__(
        self,
        data_flow: np.ndarray,
        mean: float,
        std: float,
        start_idx: int,
        end_idx: int,
        seq_len: int = 12,
        horizon_offsets: Tuple[int, ...] = (1, 3, 6, 12),  # +5m, +15m, +30m, +60m
        stride: int = 2
    ):
        self.data_flow = data_flow
        self.mean = mean
        self.std = std
        self.seq_len = seq_len
        self.horizon_offsets = horizon_offsets
        max_horizon = max(horizon_offsets)

        # Valid start indices
        valid_starts = []
        for t in range(start_idx, end_idx - max_horizon - seq_len + 1, stride):
            valid_starts.append(t)
        self.indices = valid_starts

    def __len__(self) -> int:
        return len(self.indices)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        t = self.indices[idx]
        # Input window: [12, 170]
        raw_x = self.data_flow[t:t + self.seq_len]  # Shape: (12, 170)
        norm_x = (raw_x - self.mean) / self.std

        # Time of day feature: 288 5-min intervals per day
        tod = np.array([(t + step) % 288 / 288.0 for step in range(self.seq_len)], dtype=np.float32)
        # Broadcast tod to (12, 170, 1)
        tod_feature = np.repeat(tod[:, np.newaxis, np.newaxis], raw_x.shape[1], axis=1)

        x_stacked = np.stack([norm_x, tod_feature[:, :, 0]], axis=-1)  # (12, 170, 2)

        # Targets at horizon offsets: [4, 170, 1]
        raw_y = []
        for offset in self.horizon_offsets:
            target_t = t + self.seq_len - 1 + offset
            raw_y.append(self.data_flow[target_t])
        raw_y = np.stack(raw_y, axis=0)[:, :, np.newaxis]  # (4, 170, 1)
        norm_y = (raw_y - self.mean) / self.std

        return (
            torch.tensor(x_stacked, dtype=torch.float32),
            torch.tensor(norm_y, dtype=torch.float32)
        )


def train_and_evaluate_flow(
    raw_dir: str = "data/raw/pems08",
    processed_dir: str = "data/processed/pems08",
    epochs: int = 5,
    batch_size: int = 32,
    learning_rate: float = 0.002
) -> Dict[str, Any]:
    print("=== Training PeMS08 Flow Forecasting Model (SpatialGraphLSTM) ===")
    os.makedirs(os.path.join(processed_dir, "models"), exist_ok=True)

    # 1. Load Data, Scaler, and Adjacency
    raw_npz = np.load(os.path.join(raw_dir, "pems08.npz"))
    flow_data = raw_npz["data"][:, :, 0]  # Shape: (17856, 170)

    with open(os.path.join(processed_dir, "scaler.json"), "r", encoding="utf-8") as f:
        scaler = json.load(f)
    mean, std = scaler["mean"], scaler["std"]

    with open(os.path.join(processed_dir, "metadata.json"), "r", encoding="utf-8") as f:
        meta = json.load(f)
    splits = meta["splits"]
    train_end = splits["train"]["end"]
    val_end = splits["val"]["end"]
    test_end = splits["test"]["end"]

    adj_norm = np.load(os.path.join(processed_dir, "adj_pems08.npy"))
    adj_tensor = torch.tensor(adj_norm, dtype=torch.float32)

    device = torch.device("cpu")  # Deterministic CPU execution

    # 2. Datasets & Loaders
    train_ds = PeMS08FlowDataset(flow_data, mean, std, 0, train_end, stride=4)
    val_ds = PeMS08FlowDataset(flow_data, mean, std, train_end, val_end, stride=4)
    test_ds = PeMS08FlowDataset(flow_data, mean, std, val_end, test_end, stride=2)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    print(f"Dataset samples: Train={len(train_ds)}, Val={len(val_ds)}, Test={len(test_ds)}")

    # 3. Model Definition
    model = SpatialGraphLSTM(
        in_features=2,
        spatial_dim=32,
        hidden_dim=64,
        output_horizons=4,
        seq_len=12,
        use_residual=True
    ).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.SmoothL1Loss()  # Huber loss on normalized flow

    best_val_loss = float("inf")
    best_checkpoint_path = os.path.join(processed_dir, "models", "flow_spatial_graph_lstm_best.pt")

    # 4. Training Loop
    t_start = time.time()
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        n_train_batches = 0

        for x_b, y_b in train_loader:
            optimizer.zero_grad()
            preds = model(x_b, adj_tensor)  # [B, 4, 170, 1]
            loss = criterion(preds, y_b)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
            optimizer.step()

            train_loss += loss.item()
            n_train_batches += 1

        avg_train_loss = train_loss / max(1, n_train_batches)

        # Validation
        model.eval()
        val_loss = 0.0
        n_val_batches = 0
        with torch.no_grad():
            for x_v, y_v in val_loader:
                preds_v = model(x_v, adj_tensor)
                v_loss = criterion(preds_v, y_v)
                val_loss += v_loss.item()
                n_val_batches += 1

        avg_val_loss = val_loss / max(1, n_val_batches)
        print(f"Epoch {epoch}/{epochs} | Train Huber: {avg_train_loss:.4f} | Val Huber: {avg_val_loss:.4f}")

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), best_checkpoint_path)

    t_train = round(time.time() - t_start, 2)
    print(f"Training completed in {t_train}s. Best Val Loss: {best_val_loss:.4f}")

    # 5. Formal Evaluation on Test Set
    print("Evaluating on PeMS08 Test Set...")
    model.load_state_dict(torch.load(best_checkpoint_path, map_location=device))
    model.eval()

    all_preds_raw = []
    all_targets_raw = []

    with torch.no_grad():
        for x_t, y_t in test_loader:
            preds_norm = model(x_t, adj_tensor)  # [B, 4, 170, 1]
            # De-normalize to physical units (veh / 5min)
            preds_raw = preds_norm.numpy() * std + mean
            targets_raw = y_t.numpy() * std + mean
            all_preds_raw.append(preds_raw)
            all_targets_raw.append(targets_raw)

    preds_arr = np.concatenate(all_preds_raw, axis=0)      # [N, 4, 170, 1]
    targets_arr = np.concatenate(all_targets_raw, axis=0)  # [N, 4, 170, 1]

    # Metrics per horizon
    horizons_info = [
        {"name": "+5 min", "minutes": 5, "idx": 0},
        {"name": "+15 min", "minutes": 15, "idx": 1},
        {"name": "+30 min", "minutes": 30, "idx": 2},
        {"name": "+60 min", "minutes": 60, "idx": 3}
    ]

    horizon_results = {}
    total_abs_err = []
    total_sq_err = []
    total_ape = []

    for h in horizons_info:
        h_idx = h["idx"]
        p_h = preds_arr[:, h_idx, :, 0]
        y_h = targets_arr[:, h_idx, :, 0]

        abs_err = np.abs(p_h - y_h)
        sq_err = (p_h - y_h) ** 2

        mae_h = float(np.mean(abs_err))
        rmse_h = float(np.sqrt(np.mean(sq_err)))

        # Mask low flows (< 5 veh/5min) for stable MAPE calculation
        valid_mask = y_h >= 5.0
        ape_h = np.abs(p_h[valid_mask] - y_h[valid_mask]) / y_h[valid_mask] * 100.0
        mape_h = float(np.mean(ape_h)) if np.count_nonzero(valid_mask) > 0 else 0.0

        horizon_results[h["name"]] = {
            "horizonMinutes": h["minutes"],
            "mae": round(mae_h, 2),
            "rmse": round(rmse_h, 2),
            "mape": round(mape_h, 2),
            "unit": "veh/5min"
        }
        total_abs_err.append(abs_err)
        total_sq_err.append(sq_err)
        total_ape.append(ape_h)

    overall_mae = float(np.mean(np.concatenate(total_abs_err)))
    overall_rmse = float(np.sqrt(np.mean(np.concatenate(total_sq_err))))
    overall_mape = float(np.mean(np.concatenate(total_ape)))

    evaluation_report = {
        "status": "EVALUATED",
        "dataset": "PeMS08",
        "modelName": "SpatialGraphLSTM (Flow Experimental)",
        "domain": "Freeway Traffic Flow Volume",
        "targetVariable": "flow",
        "unit": "veh/5min",
        "evaluationTimestamp": datetime.now(timezone.utc).isoformat(),
        "overall": {
            "testMae": round(overall_mae, 2),
            "testRmse": round(overall_rmse, 2),
            "testMape": round(overall_mape, 2),
            "unit": "veh/5min"
        },
        "horizons": horizon_results,
        "datasetContext": {
            "sensorCount": 170,
            "testSamples": len(test_ds),
            "trainMeanFlow": round(mean, 2),
            "trainStdFlow": round(std, 2)
        },
        "trainingDetails": {
            "epochs": epochs,
            "bestValLoss": round(best_val_loss, 4),
            "durationSeconds": t_train,
            "checkpointPath": best_checkpoint_path
        }
    }

    results_path = os.path.join(processed_dir, "flow_evaluation_results.json")
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(evaluation_report, f, indent=2)

    print("\n=== PeMS08 Flow Evaluation Report ===")
    print(f"Overall Test MAE:  {overall_mae:.2f} veh/5min")
    print(f"Overall Test RMSE: {overall_rmse:.2f} veh/5min")
    print(f"Overall Test MAPE: {overall_mape:.2f}%")
    for h_name, h_vals in horizon_results.items():
        print(f"  {h_name}: MAE={h_vals['mae']} veh/5min, RMSE={h_vals['rmse']}, MAPE={h_vals['mape']}%")
    print(f"Saved evaluation report to: {results_path}")

    return evaluation_report


if __name__ == "__main__":
    train_and_evaluate_flow(epochs=5, batch_size=32)
