"""
TrafficPulse-X Backend Configuration & Environment Settings.
Provides typed application configuration with environment variable overrides
and deterministic root path discovery for src/-centered layout.
"""

import os
import sys
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

# Deterministic root discovery
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_ROOT = PROJECT_ROOT / "src"

for p in [str(PROJECT_ROOT), str(SRC_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)


class Settings(BaseModel):
    PROJECT_NAME: str = Field(
        default_factory=lambda: os.getenv("PROJECT_NAME", "TrafficPulse-X API")
    )
    VERSION: str = Field(
        default_factory=lambda: os.getenv("VERSION", "1.0.0")
    )
    DESCRIPTION: str = Field(
        default_factory=lambda: os.getenv(
            "DESCRIPTION",
            "Evidence-on-Demand Spatio-Temporal Traffic Prediction Backend (Real METR-LA Benchmark)"
        )
    )
    HOST: str = Field(
        default_factory=lambda: os.getenv("API_HOST", "127.0.0.1")
    )
    PORT: int = Field(
        default_factory=lambda: int(os.getenv("API_PORT", "8000"))
    )
    CORS_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv("CORS_ORIGINS", "*").split(",")
            if origin.strip()
        ]
    )
    DATA_DIR: str = Field(
        default_factory=lambda: os.getenv("DATA_DIR", "data")
    )
    METR_LA_PROCESSED_DIR: str = Field(
        default_factory=lambda: os.getenv("METR_LA_PROCESSED_DIR", "data/processed/metr-la")
    )
    METR_LA_RAW_DIR: str = Field(
        default_factory=lambda: os.getenv("METR_LA_RAW_DIR", "data/raw/metr-la")
    )
    ENVIRONMENT: str = Field(
        default_factory=lambda: os.getenv("ENVIRONMENT", "development")
    )


settings = Settings()


def get_settings() -> Settings:
    """Returns the singleton application settings instance."""
    return settings
