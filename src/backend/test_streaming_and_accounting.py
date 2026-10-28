"""
Tests for Network Accounting & Live-Ready Streaming Adapter (TrafficPulse-X).
Validates:
1. Historical replay remains 100% unchanged as the strict default.
2. Network byte measurement harness, artifact structure, and wording safeguards.
3. Streaming adapter contract, provider switching, missing API key handling.
4. Resilience safeguards: rate limiting, timeout handling, strict schema validation,
   and zero silent fallback to fabricated data.
"""

import os
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import httpx
from pydantic import ValidationError

from backend.main import app
from backend.data_sources.streaming_adapter import (
    TrafficDataProvider,
    HistoricalReplayProvider,
    ExternalLiveProvider,
    StreamingManager,
    ExternalSensorReading,
    ExternalStreamSnapshotPayload,
    get_streaming_manager
)
from backend.experiments.network_accounting import (
    get_network_accounting_status,
    get_network_accounting_report
)

client = TestClient(app)


# ============================================================================
# 1. HISTORICAL REPLAY INTEGRITY TESTS
# ============================================================================

def test_historical_replay_unchanged_as_default():
    """Verifies historical replay remains 100% untouched and default."""
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["mode"] == "HISTORICAL_REPLAY"
    assert health_data["datasetName"] == "METR-LA"
    assert health_data["sensorsTotalReal"] == 207

    # Verify baseline sensor snapshot returns 207 sensors
    snap_res = client.get("/api/sensors?time_index=0")
    assert snap_res.status_code == 200
    sensors = snap_res.json()
    assert len(sensors) == 207
    assert all(s["mode"] == "HISTORICAL_REPLAY" for s in sensors)


def test_historical_provider_class():
    """Tests HistoricalReplayProvider class adheres to TrafficDataProvider contract."""
    prov = HistoricalReplayProvider()
    assert isinstance(prov, TrafficDataProvider)
    assert prov.get_provider_id() == "historical"
    assert prov.get_mode() == "HISTORICAL_REPLAY"
    assert prov.is_available() is True

    status = prov.get_status()
    assert status["available"] is True
    assert status["isDefault"] is True
    assert status["sensorCount"] == 207

    snap = prov.get_snapshot(time_index=0)
    assert snap["provider"] == "historical"
    assert snap["sensorCount"] == 207
    assert len(snap["sensors"]) == 207


# ============================================================================
# 2. CONTROLLED NETWORK-BYTE ACCOUNTING TESTS
# ============================================================================

def test_network_accounting_status():
    """Tests network accounting status endpoint and view options."""
    res = client.get("/api/experiments/network-accounting/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "AVAILABLE"
    assert data["artifactExists"] is True
    assert data["authoritativeMetric"] == "Serialized Application Payload"
    assert "APPLICATION_PAYLOAD" in data["allowedViews"]
    assert "MEASURED_NETWORK_BYTES" in data["allowedViews"]
    assert "Controlled Network Transfer Bytes — Local Test" in data["wording"]


def test_network_accounting_report_and_wording():
    """Tests network accounting measurements, reduction calculations, and strict wording."""
    res = client.get("/api/experiments/network-accounting")
    assert res.status_code == 200
    report = res.json()
    assert report["status"] == "AVAILABLE"
    assert report["authoritativeMetric"] == "Serialized Application Payload"

    # Wording check: Never claim cellular or city network bandwidth
    report_str = str(report).lower()
    assert "real cellular bandwidth" not in report_str
    assert "city network bandwidth" not in report_str

    policies = report["policies"]
    assert "4/4" in policies
    assert "3/4" in policies
    assert "2/4" in policies
    assert "1/4" in policies

    # 4/4 Baseline
    p4 = policies["4/4"]
    assert p4["applicationPayloadBytes"] == 11468184
    assert p4["measuredNetworkBytes"] > 11468184  # Includes wire headers + framing
    assert p4["measuredReductionPercent"] == 0.0

    # 2/4 Selective CCV
    p2 = policies["2/4"]
    assert p2["applicationPayloadBytes"] == 5734092
    assert p2["measuredReductionPercent"] == 50.0

    # 1/4 Constrained
    p1 = policies["1/4"]
    assert p1["applicationPayloadBytes"] == 2867046
    assert p1["measuredReductionPercent"] == 75.0


# ============================================================================
# 3. STREAMING ADAPTER CONTRACT & PROVIDER SWITCHING TESTS
# ============================================================================

def test_streaming_status_endpoint():
    """Tests /api/streaming/status endpoint and default state."""
    res = client.get("/api/streaming/status")
    assert res.status_code == 200
    data = res.json()
    assert data["activeProvider"] == "historical"
    assert data["defaultProvider"] == "historical"
    assert data["providers"]["historical"]["available"] is True
    assert data["providers"]["external_live"]["configured"] is False
    assert data["providers"]["external_live"]["status"] == "UNCONFIGURED"
    assert "Unavailable / Not Configured" in data["providers"]["external_live"]["label"]


def test_streaming_config_endpoint_no_secrets():
    """Verifies configuration endpoint exposes limits without leaking secrets."""
    res = client.get("/api/streaming/config")
    assert res.status_code == 200
    data = res.json()
    assert "activeProvider" in data
    assert "defaultProvider" in data
    assert "apiKey" not in str(data)
    assert "secret" not in str(data)


def test_provider_switching_to_unconfigured_fails_gracefully():
    """Tests switching to unconfigured external live provider fails without breaking state."""
    res = client.post("/api/streaming/provider", json={"provider": "external_live"})
    assert res.status_code == 400
    err = res.json()
    assert "Unavailable / Not Configured" in str(err)

    # Active provider must remain historical
    status = client.get("/api/streaming/status").json()
    assert status["activeProvider"] == "historical"


def test_provider_switching_to_historical_succeeds():
    """Tests explicitly setting active provider to historical succeeds."""
    res = client.post("/api/streaming/provider", json={"provider": "historical"})
    assert res.status_code == 200
    assert res.json()["activeProvider"] == "historical"


# ============================================================================
# 4. RESILIENCE: MISSING KEY, RATE LIMIT, TIMEOUT, SCHEMA VALIDATION
# ============================================================================

def test_missing_api_key_blocks_live_provider():
    """Ensures ExternalLiveProvider is disabled when API key is missing."""
    with patch.dict(os.environ, {}, clear=True):
        provider = ExternalLiveProvider()
        assert provider.is_configured() is False
        assert provider.is_available() is False
        status = provider.get_status()
        assert status["status"] == "UNCONFIGURED"
        assert "Unavailable / Not Configured" in status["label"]

        # Snapshot call must raise ValueError, NEVER fake data
        with pytest.raises(ValueError, match="Live source unavailable"):
            provider.get_snapshot()


def test_rate_limit_handling():
    """Tests rate limiter triggers error when request limit is exceeded."""
    provider = ExternalLiveProvider(rate_limit_per_minute=2)
    # Mock configured credentials
    provider.is_configured = lambda: True

    # First 2 checks pass
    provider._check_rate_limit()
    provider._check_rate_limit()

    # 3rd check triggers rate limit exceeded
    with pytest.raises(RuntimeError, match="Rate limit exceeded"):
        provider._check_rate_limit()


def test_timeout_handling():
    """Tests upstream timeout raises TimeoutError gracefully without crash."""
    provider = ExternalLiveProvider(request_timeout_seconds=0.1)
    provider.is_configured = lambda: True

    with patch("httpx.Client.get", side_effect=httpx.TimeoutException("Connection timed out")):
        with pytest.raises(TimeoutError, match="timed out"):
            provider.fetch_live_stream_data()


def test_invalid_payload_schema_rejection():
    """Verifies strict Pydantic validation rejects malformed sensor data."""
    # 1. Missing required 'speed' field
    with pytest.raises(ValidationError):
        ExternalSensorReading(
            sensorId="sensor_1",
            latitude=34.05,
            longitude=-118.25,
            timestamp="2026-10-13T12:00:00Z"
        )

    # 2. Invalid latitude (> 90.0)
    with pytest.raises(ValidationError):
        ExternalSensorReading(
            sensorId="sensor_1",
            speed=45.2,
            latitude=95.0,
            longitude=-118.25,
            timestamp="2026-10-13T12:00:00Z"
        )

    # 3. Non-numeric speed
    with pytest.raises(ValidationError):
        ExternalSensorReading(
            sensorId="sensor_1",
            speed="very_fast",
            latitude=34.05,
            longitude=-118.25,
            timestamp="2026-10-13T12:00:00Z"
        )


def test_resilience_and_no_fake_data_fallback():
    """Verifies live provider failure never returns fabricated data."""
    provider = ExternalLiveProvider()
    provider.is_configured = lambda: True

    # Simulate upstream 500 error
    mock_resp = MagicMock()
    mock_resp.status_code = 502
    with patch("httpx.Client.get", return_value=mock_resp):
        with pytest.raises(RuntimeError, match="HTTP 502"):
            provider.fetch_live_stream_data()


def test_streaming_snapshot_endpoint():
    """Tests GET /api/streaming/snapshot behavior for both providers."""
    # Default historical snapshot succeeds with 207 sensors
    res_hist = client.get("/api/streaming/snapshot?time_index=0")
    assert res_hist.status_code == 200
    snap = res_hist.json()
    assert snap["provider"] == "historical"
    assert snap["mode"] == "HISTORICAL_REPLAY"
    assert len(snap["sensors"]) == 207

    # Explicit request for unconfigured external stream returns HTTP 503
    res_ext = client.get("/api/streaming/snapshot?provider=external_live")
    assert res_ext.status_code == 503
    assert "Live source unavailable" in res_ext.json()["detail"]
