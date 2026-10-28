"""
Unit and Contract Verification Tests for TrafficPulse-X Experiment Extension.
Verifies IID client partitions, baseline immutability, and experiment API contracts.
"""

import os
import json
import hashlib
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from backend.main import app
from ml.experiments.iid_partition import load_iid_partitions, get_iid_partition_checksum

client = TestClient(app)

EXPECTED_GRAPH_LSTM_HASH = "702cb2bb9406aa36ec25639121377bf939acdb1906370997ccd792f70cf1f384"
EXPECTED_GLOBAL_BEST_HASH = "24710dae0fe0554ca8111ad21e05de03b69a282f0b8d8868a1433ba6fd9c2930"
EXPECTED_REGIONS_HASH = "ad064c643b6eb30cf9f7ef57cce71391ac4d94f7e41529dfcf4f0b1cd46e4ff2"
EXPECTED_IID_CHECKSUM = "38006863079cd7b4cd08174059cff3c28c45ba7c6d9afe9b3c9e10182d81e2c3"


def get_file_sha256(path: str) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def test_1_frozen_baselines_strictly_unmodified():
    """Verify authoritative baseline checkpoints and regions are unchanged."""
    graph_lstm_path = "data/processed/metr-la/models/spatiotemporal/graph_lstm_best.pt"
    global_best_path = "data/processed/metr-la/federated/checkpoints/global_best.pt"
    regions_path = "data/processed/metr-la/regions.json"

    assert os.path.exists(graph_lstm_path)
    assert os.path.exists(global_best_path)
    assert os.path.exists(regions_path)

    assert get_file_sha256(graph_lstm_path) == EXPECTED_GRAPH_LSTM_HASH
    assert get_file_sha256(global_best_path) == EXPECTED_GLOBAL_BEST_HASH

    with open(regions_path, "r", encoding="utf-8") as f:
        reg_data = json.load(f)
    reg_ck = hashlib.sha256(json.dumps(reg_data, sort_keys=True).encode("utf-8")).hexdigest()
    assert reg_ck == EXPECTED_REGIONS_HASH


def test_2_iid_partitions_artifact_properties():
    """Verify IID client partition structure, sensor count, and lack of overlap."""
    meta = load_iid_partitions()
    assert meta["numClients"] == 4
    assert meta["totalSensors"] == 207
    assert meta["generationSeed"] == 42
    assert meta["sensorCounts"] == [52, 52, 52, 51]

    partitions = meta["partitions"]
    assert len(partitions) == 4

    all_indices = []
    for cname, info in partitions.items():
        assert info["sensorCount"] in [51, 52]
        assert len(info["globalIndices"]) == info["sensorCount"]
        assert len(info["sensorIds"]) == info["sensorCount"]
        assert info["fedAvgWeight"] > 0.24 and info["fedAvgWeight"] < 0.26
        all_indices.extend(info["globalIndices"])

    # Union must equal 207 sensors exactly
    assert len(all_indices) == 207
    assert set(all_indices) == set(range(207))

    # Checksum match
    assert get_iid_partition_checksum() == EXPECTED_IID_CHECKSUM


def test_3_experiment_status_endpoint():
    """Verify /api/experiments/status responds HTTP 200 with recognized status."""
    res = client.get("/api/experiments/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert data["status"] in ["PENDING", "COMPLETED"]


def test_4_experiment_distribution_comparison_endpoint():
    """Verify /api/experiments/distribution-comparison endpoint response."""
    res = client.get("/api/experiments/distribution-comparison")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    if data["status"] == "COMPLETED":
        assert "statisticalSummary" in data
        assert "nonIID" in data["statisticalSummary"]
        assert "iid" in data["statisticalSummary"]


def test_5_experiment_seed_summary_endpoint():
    """Verify /api/experiments/seed-summary endpoint response."""
    res = client.get("/api/experiments/seed-summary")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data


def test_6_experiment_convergence_endpoint():
    """Verify /api/experiments/convergence endpoint response."""
    res = client.get("/api/experiments/convergence")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data


def test_7_experiment_iid_partitions_endpoint():
    """Verify /api/experiments/iid-partitions endpoint returns partition metadata."""
    res = client.get("/api/experiments/iid-partitions")
    assert res.status_code == 200
    data = res.json()
    assert data["numClients"] == 4
    assert data["totalSensors"] == 207
