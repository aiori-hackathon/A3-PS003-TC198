"""
Unit tests for TrafficPulse-X backend settings and configuration module.
Verifies default configuration, singleton behavior, CORS parsing, and environment overrides.
"""

import os
import pytest
from backend.config import Settings, get_settings


def test_default_settings():
    """Verify default production configuration values."""
    s = Settings()
    assert s.HOST == "127.0.0.1"
    assert s.PORT == 8000
    assert "*" in s.CORS_ORIGINS
    assert s.DATA_DIR == "data"
    assert "TrafficPulse-X" in s.PROJECT_NAME
    assert s.VERSION == "1.0.0"


def test_settings_singleton():
    """Verify get_settings returns consistent singleton instance."""
    s1 = get_settings()
    s2 = get_settings()
    assert s1 is s2


def test_cors_origins_parsing(monkeypatch):
    """Verify comma-separated CORS_ORIGINS parsing."""
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:5173, http://127.0.0.1:5173, https://trafficpulse.local")
    s = Settings()
    assert len(s.CORS_ORIGINS) == 3
    assert "http://localhost:5173" in s.CORS_ORIGINS
    assert "http://127.0.0.1:5173" in s.CORS_ORIGINS
    assert "https://trafficpulse.local" in s.CORS_ORIGINS


def test_custom_environment_settings(monkeypatch):
    """Verify environment variable overrides."""
    monkeypatch.setenv("API_PORT", "9000")
    monkeypatch.setenv("API_HOST", "0.0.0.0")
    monkeypatch.setenv("ENVIRONMENT", "production")
    s = Settings()
    assert s.PORT == 9000
    assert s.HOST == "0.0.0.0"
    assert s.ENVIRONMENT == "production"
