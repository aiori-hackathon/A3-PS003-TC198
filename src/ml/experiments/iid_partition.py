"""
IID Client Partition Module for TrafficPulse-X Experiment Extension.
Generates and loads deterministic uniform-random partitions across the 207 METR-LA sensors.
Maintains identical preprocessing, chronological splits, and model architectures.
"""

import os
import json
import pickle
import hashlib
import numpy as np
from typing import Dict, Any, Tuple, List

from ml.graph.model import calculate_normalized_adjacency


IID_PARTITIONS_PATH = "data/processed/metr-la/experiments/iid_partitions/iid_partitions.json"


def load_iid_partitions(path: str = IID_PARTITIONS_PATH) -> Dict[str, Any]:
    """
    Loads IID partition metadata from JSON artifact.
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"IID partitions artifact missing: '{path}'")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_iid_subgraph(
    client_id: str,
    raw_dir: str = "data/raw/metr-la",
    path: str = IID_PARTITIONS_PATH
) -> Tuple[np.ndarray, np.ndarray, List[int], List[str]]:
    """
    Extracts induced subgraph A_client = A[S, S] and computes normalized adjacency for IID client.
    Returns (adj_sub, a_norm_sub, global_indices, sensor_ids).
    """
    meta = load_iid_partitions(path)
    partitions = meta["partitions"]
    if client_id not in partitions:
        raise KeyError(f"Invalid IID client_id '{client_id}'. Valid: {list(partitions.keys())}")

    p_info = partitions[client_id]
    g_indices = p_info["globalIndices"]
    s_ids = p_info["sensorIds"]

    adj_path = os.path.join(raw_dir, "adj_mx.pkl")
    with open(adj_path, "rb") as f:
        _, _, adj_mx = pickle.load(f, encoding="latin1")

    adj_sub = adj_mx[np.ix_(g_indices, g_indices)]
    a_norm_sub = calculate_normalized_adjacency(adj_sub, is_identity=False)

    return adj_sub, a_norm_sub, g_indices, s_ids


def get_iid_client_data_slice(
    client_id: str,
    split: str = "train",
    processed_dir: str = "data/processed/metr-la",
    path: str = IID_PARTITIONS_PATH
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Loads data slice for specified IID client and split ('train', 'val', 'test').
    Returns (x_sub, y_sub, x_mask_sub, y_mask_sub).
    """
    meta = load_iid_partitions(path)
    partitions = meta["partitions"]
    if client_id not in partitions:
        raise KeyError(f"Invalid IID client_id '{client_id}'")

    g_indices = partitions[client_id]["globalIndices"]
    npz_path = os.path.join(processed_dir, f"ml_ready/{split}.npz")
    if not os.path.exists(npz_path):
        raise FileNotFoundError(f"Split file missing: '{npz_path}'")

    data = np.load(npz_path)
    x_sub = data["x"][:, :, g_indices, :]
    y_sub = data["y"][:, :, g_indices, :]
    x_mask_sub = data["x_mask"][:, :, g_indices, :]
    y_mask_sub = data["y_mask"][:, :, g_indices, :]

    return x_sub, y_sub, x_mask_sub, y_mask_sub


def get_iid_partition_checksum(path: str = IID_PARTITIONS_PATH) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()
