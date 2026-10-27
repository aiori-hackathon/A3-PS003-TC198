"""
Data sources package for TrafficPulse-X.
Houses specialized data adapters for external traffic benchmarks and streaming providers.
"""

from backend.data_sources.pems08 import PeMS08DataSource, get_pems08_adapter
from backend.data_sources.streaming_adapter import (
    TrafficDataProvider,
    HistoricalReplayProvider,
    ExternalLiveProvider,
    StreamingManager,
    get_streaming_manager
)

__all__ = [
    "PeMS08DataSource",
    "get_pems08_adapter",
    "TrafficDataProvider",
    "HistoricalReplayProvider",
    "ExternalLiveProvider",
    "StreamingManager",
    "get_streaming_manager"
]
