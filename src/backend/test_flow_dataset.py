"""
Unit and Integration Tests for PeMS08 Traffic Flow Dataset Extension.
Verifies data adapter, preprocessing isolation, model evaluation, and API endpoints.
"""

import os
import json
import numpy as np
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.data_sources.pems08 import (
    get_pems08_adapter,
    NUM_SENSORS,
    TOTAL_TIMESTEPS,
    CH_FLOW,
    CH_OCCUPANCY,
    CH_SPEED
)


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def adapter():
    return get_pems08_adapter()


# ============================================================================
# 1. RAW DATASET AND PROVENANCE TESTS
# ============================================================================

def test_pems08_raw_files_exist():
    assert os.path.exists("data/raw/pems08/pems08.npz"), "pems08.npz must exist in data/raw/pems08"
    assert os.path.exists("data/raw/pems08/distance.csv"), "distance.csv must exist in data/raw/pems08"
    assert os.path.exists("data/raw/pems08/DATASET_INFO.md"), "DATASET_INFO.md must document provenance"


def test_pems08_dataset_info_contains_required_fields():
    with open("data/raw/pems08/DATASET_INFO.md", "r", encoding="utf-8") as f:
        content = f.read()

    assert "PeMS08" in content
    assert "Caltrans" in content
    assert "veh/5min" in content
    assert "SHA-256" in content
    assert "170" in content
    assert "17,856" in content


# ============================================================================
# 2. DATA ADAPTER TESTS
# ============================================================================

def test_pems08_adapter_availability_and_shapes(adapter):
    assert adapter.is_available is True
    assert len(adapter.get_sensor_ids()) == NUM_SENSORS
    assert adapter._data.shape == (TOTAL_TIMESTEPS, NUM_SENSORS, 3)


def test_pems08_sensor_id_parsing(adapter):
    assert adapter.parse_sensor_index("PEMS08_000") == 0
    assert adapter.parse_sensor_index("PEMS08_009") == 9
    assert adapter.parse_sensor_index("PEMS08_169") == 169
    assert adapter.parse_sensor_index("9") == 9
    assert adapter.parse_sensor_index("invalid") is None
    assert adapter.parse_sensor_index("PEMS08_999") is None


def test_pems08_snapshot_values(adapter):
    snap = adapter.get_snapshot(time_index=100)
    assert snap["available"] is True
    assert snap["dataset"] == "PeMS08"
    assert snap["totalSensors"] == NUM_SENSORS
    assert snap["metric"] == "flow_volume"
    assert snap["unit"] == "veh/5min"
    assert len(snap["sensors"]) == NUM_SENSORS

    first = snap["sensors"][0]
    assert "flow_volume" in first
    assert "occupancy" in first
    assert "speed" in first
    assert first["flowUnit"] == "veh/5min"
    assert first["speedUnit"] == "mph"
    assert first["flow_volume"] >= 0.0
    assert 0.0 <= first["occupancy"] <= 1.0


def test_pems08_time_series(adapter):
    series = adapter.get_sensor_time_series("PEMS08_009", start_step=10, end_step=14)
    assert len(series) == 5
    for item in series:
        assert item["sensorId"] == "PEMS08_009"
        assert item["flowUnit"] == "veh/5min"
        assert item["flow_volume"] >= 0.0


def test_pems08_graph_adjacency_properties(adapter):
    adj = adapter.get_graph_adjacency()
    assert adj.shape == (NUM_SENSORS, NUM_SENSORS)
    assert np.all(adj >= 0.0)
    # Check symmetry
    assert np.allclose(adj, adj.T, atol=1e-5)
    # Diagonal should be positive (self-loops)
    assert np.all(np.diag(adj) > 0.0)


# ============================================================================
# 3. PREPROCESSING AND ISOLATION TESTS
# ============================================================================

def test_pems08_scaler_isolation():
    scaler_path = "data/processed/pems08/scaler.json"
    assert os.path.exists(scaler_path)

    with open(scaler_path, "r", encoding="utf-8") as f:
        scaler = json.load(f)

    assert scaler["dataset"] == "PeMS08"
    assert scaler["targetVariable"] == "flow"
    assert scaler["unit"] == "veh/5min"
    assert scaler["fitSplit"] == "TRAIN_ONLY"
    assert 200.0 < scaler["mean"] < 250.0
    assert 100.0 < scaler["std"] < 180.0

    # Ensure METR-LA scaler is untouched and distinct
    with open("data/processed/metr-la/scaler.json", "r", encoding="utf-8") as f:
        metr_scaler = json.load(f)

    # METR-LA speed mean is ~53.6 mph, completely distinct from PeMS08 flow ~230 veh/5min
    assert metr_scaler["mean"] < 100.0, "METR-LA scaler must remain untouched speed scaler"


def test_pems08_metadata_chronological_splits():
    meta_path = "data/processed/pems08/metadata.json"
    assert os.path.exists(meta_path)

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["datasetName"] == "PeMS08"
    assert meta["primaryMetric"] == "flow_volume"
    assert meta["splits"]["train"]["count"] == 12499
    assert meta["splits"]["val"]["count"] == 1785
    assert meta["splits"]["test"]["count"] == 3572


# ============================================================================
# 4. MODEL EVALUATION RESULT TESTS
# ============================================================================

def test_pems08_evaluation_report():
    results_path = "data/processed/pems08/flow_evaluation_results.json"
    assert os.path.exists(results_path), "Flow evaluation results file must exist"

    with open(results_path, "r", encoding="utf-8") as f:
        results = json.load(f)

    assert results["status"] == "EVALUATED"
    assert results["dataset"] == "PeMS08"
    assert results["unit"] == "veh/5min"
    assert results["overall"]["testMae"] > 0.0
    assert results["overall"]["testRmse"] > 0.0
    assert results["overall"]["testMape"] > 0.0

    # Verify all 4 horizons exist
    for h in ["+5 min", "+15 min", "+30 min", "+60 min"]:
        assert h in results["horizons"]
        assert results["horizons"][h]["mae"] > 0.0


# ============================================================================
# 5. FASTAPI ENDPOINT TESTS
# ============================================================================

def test_api_flow_status(client):
    res = client.get("/api/experiments/flow/status")
    assert res.status_code == 200
    data = res.json()
    assert data["available"] is True
    assert data["datasetName"] == "PeMS08"
    assert data["primaryMetric"] == "flow_volume"
    assert data["primaryUnit"] == "veh/5min"
    assert data["sensorCount"] == 170
    assert data["evaluationStatus"] == "EVALUATED"


def test_api_flow_metadata(client):
    res = client.get("/api/experiments/flow/metadata")
    assert res.status_code == 200
    data = res.json()
    assert data["datasetName"] == "PeMS08"
    assert "channels" in data


def test_api_flow_results(client):
    res = client.get("/api/experiments/flow/results")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "EVALUATED"
    assert "overall" in data
    assert "horizons" in data


def test_api_flow_sensors(client):
    res = client.get("/api/experiments/flow/sensors")
    assert res.status_code == 200
    data = res.json()
    assert data["totalSensors"] == 170
    assert len(data["representativeSensors"]) > 0


def test_api_flow_forecast_inference(client):
    res = client.get("/api/experiments/flow/forecast?step=100&sensorId=PEMS08_009")
    assert res.status_code == 200
    data = res.json()
    assert data["dataset"] == "PeMS08"
    assert data["metric"] == "flow_volume"
    assert data["unit"] == "veh/5min"
    assert data["sensor"]["sensorId"] == "PEMS08_009"
    assert data["sensor"]["currentFlowVeh"] > 0.0
    assert len(data["sensor"]["predictions"]) == 4

    for pred in data["sensor"]["predictions"]:
        assert "predictedFlowVeh" in pred
        assert "actualFlowVeh" in pred
        assert "absoluteErrorVeh" in pred
        assert pred["unit"] == "veh/5min"
