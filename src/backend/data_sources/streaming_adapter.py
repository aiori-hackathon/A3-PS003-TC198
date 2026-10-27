"""
TrafficPulse-X — Streaming Adapter & Provider Architecture.
Implements the generic TrafficDataProvider contract:
- HistoricalReplayProvider: Default authoritative benchmark replay (METR-LA).
- ExternalLiveProvider: Optional live data adapter for external streaming experiments.

Safeguards & Invariants:
1. Historical Replay remains the strict DEFAULT.
2. Server-side API key configuration only (via environment variable: LIVE_TRAFFIC_API_KEY).
3. Built-in rate limiting, timeout handling, and strict schema validation.
4. No silent fallback to fabricated/fake traffic data on external stream failure.
5. No claims of "City-Wide Deployment" or "Production Traffic Monitoring".
   Strict label: "External Streaming Experiment" / "Live Data Adapter".
"""

import os
import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ValidationError

import httpx

from backend.datasets.metr_la import get_metr_la_snapshot

logger = logging.getLogger("trafficpulse.streaming")


# ============================================================================
# PYDANTIC SCHEMAS FOR EXTERNAL STREAM VALIDATION
# ============================================================================

class ExternalSensorReading(BaseModel):
    """Strict schema for an individual sensor reading from external stream."""
    sensorId: str = Field(..., description="Unique station or sensor identifier")
    speed: float = Field(..., ge=0.0, le=150.0, description="Observed traffic speed in mph")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 longitude")
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp")


class ExternalStreamSnapshotPayload(BaseModel):
    """Schema for a collection of external live readings."""
    timestamp: str
    source: str
    sensors: List[ExternalSensorReading]


# ============================================================================
# ABSTRACT PROVIDER CONTRACT
# ============================================================================

class TrafficDataProvider(ABC):
    """Generic contract for traffic data providers in TrafficPulse-X."""

    @abstractmethod
    def get_provider_id(self) -> str:
        """Machine identifier (e.g. 'historical', 'external_live')."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Human-readable provider title."""
        pass

    @abstractmethod
    def get_mode(self) -> str:
        """Operating mode ('HISTORICAL_REPLAY' or 'EXTERNAL_STREAM')."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if provider is currently ready to serve snapshots."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Detailed status including availability and configuration info."""
        pass

    @abstractmethod
    def get_snapshot(self, time_index: int = 0, region_id: str = "ALL") -> Dict[str, Any]:
        """Fetches traffic snapshot. Must NEVER silently fake data on error."""
        pass


# ============================================================================
# HISTORICAL REPLAY PROVIDER (DEFAULT)
# ============================================================================

class HistoricalReplayProvider(TrafficDataProvider):
    """
    Authoritative METR-LA Historical Replay Provider.
    Default provider for TrafficPulse-X.
    """

    def __init__(self, raw_dir: str = "data/raw/metr-la", processed_dir: str = "data/processed/metr-la"):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir

    def get_provider_id(self) -> str:
        return "historical"

    def get_provider_name(self) -> str:
        return "Historical Replay (METR-LA)"

    def get_mode(self) -> str:
        return "HISTORICAL_REPLAY"

    def is_available(self) -> bool:
        # Check if raw or processed METR-LA files exist
        return os.path.exists(os.path.join(self.processed_dir, "metadata.json")) or os.path.exists(self.raw_dir)

    def get_status(self) -> Dict[str, Any]:
        avail = self.is_available()
        return {
            "id": self.get_provider_id(),
            "name": self.get_provider_name(),
            "mode": self.get_mode(),
            "available": avail,
            "configured": True,
            "status": "READY" if avail else "UNAVAILABLE",
            "label": "Historical Replay (Default)",
            "sensorCount": 207,
            "isDefault": True
        }

    def get_snapshot(self, time_index: int = 0, region_id: str = "ALL") -> Dict[str, Any]:
        snap = get_metr_la_snapshot(
            time_index=time_index,
            region_id=region_id,
            raw_dir=self.raw_dir,
            processed_dir=self.processed_dir,
            representatives_only=False
        )
        return {
            "provider": self.get_provider_id(),
            "mode": self.get_mode(),
            **snap
        }


# ============================================================================
# EXTERNAL LIVE PROVIDER (OPTIONAL EXPERIMENTAL EXTENSION)
# ============================================================================

class ExternalLiveProvider(TrafficDataProvider):
    """
    Live Data Adapter for External Streaming Experiments.
    Optional engineering extension.
    - Requires server-side API key: LIVE_TRAFFIC_API_KEY
    - Built-in rate limiting (token bucket / window)
    - Timeout protection
    - Strict Pydantic schema validation
    - NO silent fallback to fake data!
    """

    def __init__(
        self,
        api_key_env_var: str = "LIVE_TRAFFIC_API_KEY",
        stream_url_env_var: str = "LIVE_TRAFFIC_URL",
        rate_limit_per_minute: int = 60,
        request_timeout_seconds: float = 5.0
    ):
        self.api_key_env_var = api_key_env_var
        self.stream_url_env_var = stream_url_env_var
        self.rate_limit_per_minute = rate_limit_per_minute
        self.request_timeout_seconds = request_timeout_seconds

        # Rate limiter state
        self._window_start = time.time()
        self._request_count = 0

    @property
    def api_key(self) -> Optional[str]:
        # Server-side environment variable only (never exposed or committed)
        return os.environ.get(self.api_key_env_var) or os.environ.get("EXTERNAL_STREAM_API_KEY")

    @property
    def stream_url(self) -> Optional[str]:
        return os.environ.get(self.stream_url_env_var)

    def is_configured(self) -> bool:
        """Returns True only if valid server-side credentials and endpoint are present."""
        return bool(self.api_key and self.stream_url)

    def is_available(self) -> bool:
        """Available only if configured."""
        return self.is_configured()

    def get_provider_id(self) -> str:
        return "external_live"

    def get_provider_name(self) -> str:
        return "Live Data Adapter"

    def get_mode(self) -> str:
        return "EXTERNAL_STREAM"

    def get_status(self) -> Dict[str, Any]:
        configured = self.is_configured()
        return {
            "id": self.get_provider_id(),
            "name": self.get_provider_name(),
            "experimentTitle": "External Streaming Experiment",
            "mode": self.get_mode(),
            "available": configured,
            "configured": configured,
            "status": "READY" if configured else "UNCONFIGURED",
            "label": "Live Data Adapter" if configured else "External Stream: Unavailable / Not Configured",
            "isDefault": False,
            "rateLimitPerMinute": self.rate_limit_per_minute,
            "timeoutSeconds": self.request_timeout_seconds,
            "notice": (
                "External streaming experiment ready."
                if configured else
                "External streaming experiment requires server-side LIVE_TRAFFIC_API_KEY and LIVE_TRAFFIC_URL. Historical Replay remains the baseline."
            )
        }

    def _check_rate_limit(self):
        """Enforces rate limiting window."""
        now = time.time()
        if now - self._window_start > 60.0:
            self._window_start = now
            self._request_count = 0

        self._request_count += 1
        if self._request_count > self.rate_limit_per_minute:
            raise RuntimeError(f"Rate limit exceeded: maximum {self.rate_limit_per_minute} requests per minute reached.")

    def fetch_live_stream_data(self) -> Dict[str, Any]:
        """
        Fetches live traffic readings from upstream server.
        Handles timeout, rate limiting, and schema validation.
        """
        if not self.is_configured():
            raise ValueError("Live source unavailable: External live provider is not configured.")

        self._check_rate_limit()

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "TrafficPulse-X-LiveAdapter/1.0",
            "Accept": "application/json"
        }

        try:
            with httpx.Client(timeout=self.request_timeout_seconds) as client:
                response = client.get(self.stream_url, headers=headers)
                if response.status_code == 429:
                    raise RuntimeError("Upstream rate limit exceeded (HTTP 429).")
                if response.status_code != 200:
                    raise RuntimeError(f"Upstream live traffic stream returned HTTP {response.status_code}.")

                raw_json = response.json()
        except httpx.TimeoutException:
            raise TimeoutError(f"Upstream live traffic stream request timed out ({self.request_timeout_seconds}s).")
        except Exception as e:
            if isinstance(e, (RuntimeError, TimeoutError)):
                raise e
            raise RuntimeError(f"Live source unavailable: Network transport error: {str(e)}")

        # Strict Pydantic validation
        try:
            validated = ExternalStreamSnapshotPayload(**raw_json)
            return validated.model_dump()
        except ValidationError as val_err:
            raise ValueError(f"Invalid payload schema from live stream: {str(val_err)}")

    def get_snapshot(self, time_index: int = 0, region_id: str = "ALL") -> Dict[str, Any]:
        """
        Retrieves snapshot. If unavailable or error, raises error rather than substituting fake data.
        """
        data = self.fetch_live_stream_data()
        sensors = data.get("sensors", [])
        if region_id != "ALL":
            # Optional region filter if present
            sensors = [s for s in sensors if s.get("regionId") == region_id]

        return {
            "provider": self.get_provider_id(),
            "mode": self.get_mode(),
            "timestamp": data.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
            "sensorCount": len(sensors),
            "sensors": sensors,
            "regionId": region_id,
            "metadata": {
                "source": data.get("source", "external_stream"),
                "experimentMode": "External Streaming Experiment"
            }
        }


# ============================================================================
# STREAMING MANAGER
# ============================================================================

class StreamingManager:
    """
    Central manager for TrafficPulse-X traffic data providers.
    Historical Replay is strictly default.
    """

    def __init__(self):
        self.historical_provider = HistoricalReplayProvider()
        self.external_live_provider = ExternalLiveProvider()
        self.active_provider_id: str = "historical"  # Strictly DEFAULT

    def get_provider(self, provider_id: str) -> Optional[TrafficDataProvider]:
        if provider_id == "historical":
            return self.historical_provider
        elif provider_id == "external_live":
            return self.external_live_provider
        return None

    def get_active_provider(self) -> TrafficDataProvider:
        provider = self.get_provider(self.active_provider_id)
        if not provider:
            self.active_provider_id = "historical"
            return self.historical_provider
        return provider

    def set_active_provider(self, provider_id: str) -> Dict[str, Any]:
        """
        Switches active provider. If switching to external_live fails because unconfigured,
        retains historical replay and returns descriptive failure.
        """
        if provider_id == "historical":
            self.active_provider_id = "historical"
            return {
                "success": True,
                "activeProvider": "historical",
                "message": "Switched to Historical Replay (Default)"
            }

        if provider_id == "external_live":
            if not self.external_live_provider.is_available():
                return {
                    "success": False,
                    "activeProvider": self.active_provider_id,
                    "error": "External Stream: Unavailable / Not Configured",
                    "notice": "Server-side configuration required. Historical Replay remains the active baseline."
                }
            self.active_provider_id = "external_live"
            return {
                "success": True,
                "activeProvider": "external_live",
                "message": "Switched to External Streaming Experiment"
            }

        return {
            "success": False,
            "activeProvider": self.active_provider_id,
            "error": f"Unknown provider id: '{provider_id}'. Must be 'historical' or 'external_live'."
        }

    def get_status_summary(self) -> Dict[str, Any]:
        """Returns consolidated provider statuses and active selection."""
        return {
            "activeProvider": self.active_provider_id,
            "defaultProvider": "historical",
            "providers": {
                "historical": self.historical_provider.get_status(),
                "external_live": self.external_live_provider.get_status()
            }
        }


# Global singleton instance
_streaming_manager_instance: Optional[StreamingManager] = None


def get_streaming_manager() -> StreamingManager:
    global _streaming_manager_instance
    if _streaming_manager_instance is None:
        _streaming_manager_instance = StreamingManager()
    return _streaming_manager_instance
