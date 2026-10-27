"""
API Contract and Response Schema Verification Tests for TrafficPulse-X.
Verifies OpenAPI compliance, Pydantic response models, and real endpoint schemas.
"""

from typing import List
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.prediction.schemas import PredictionStatusResponse
from backend.federated.schemas import FederatedStatusResponse, ClientPartitionInfo

client = TestClient(app)


def test_openapi_specification_contract():
    """Verify that OpenAPI documentation contains typed schema definitions."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()
    schemas = spec.get("components", {}).get("schemas", {})

    # Verify Prediction schemas
    assert "PredictionStatusResponse" in schemas
    assert "ForecastResponse" in schemas
    assert "PredictionMetricsResponse" in schemas
    assert "PredictionModelsResponse" in schemas

    # Verify Federated schemas
    assert "FederatedStatusResponse" in schemas
    assert "ClientPartitionInfo" in schemas
    assert "FederatedRoundsResponse" in schemas


def test_prediction_status_contract():
    """Verify GET /api/prediction/status response matches PredictionStatusResponse schema."""
    response = client.get("/api/prediction/status")
    assert response.status_code == 200
    data = response.json()
    validated = PredictionStatusResponse(**data)
    assert validated.modelName == "Graph+LSTM"
    assert validated.device in ["cuda", "cpu"]


def test_federated_status_contract():
    """Verify GET /api/federated/status response matches FederatedStatusResponse schema."""
    response = client.get("/api/federated/status")
    assert response.status_code == 200
    data = response.json()
    validated = FederatedStatusResponse(**data)
    assert validated.phase == "8"
    assert validated.stage == "8.3"
    assert validated.clientCount == 4


def test_federated_clients_contract():
    """Verify GET /api/federated/clients response matches List[ClientPartitionInfo] schema."""
    response = client.get("/api/federated/clients")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4
    for item in data:
        validated = ClientPartitionInfo(**item)
        assert validated.sensorCount > 0
        assert validated.aggregationWeight > 0.0
