"""
FastAPI Pydantic Response Schemas for Federated Learning API Contracts.
Accurately mirrors Stage 8.2 / 8.3 Federated Learning service dictionaries.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class FederatedStatusResponse(BaseModel):
    phase: str = "8"
    stage: str = "8.3"
    trainingComplete: bool
    selectedRound: Optional[int] = None
    bestValidationMAE: Optional[float] = None
    finalTestMAE: Optional[float] = None
    clientCount: int = 4
    participationMode: str = "FULL_PARTICIPATION_FEDAVG_SIMULATION"
    checkpointReady: bool
    checkpointPath: str


class ClientPartitionInfo(BaseModel):
    clientId: str
    regionId: str
    regionName: str
    sensorCount: int
    aggregationWeight: float
    trainValidTargets: Optional[int] = None
    valValidTargets: Optional[int] = None
    testValidTargets: Optional[int] = None
    sensors: Optional[List[str]] = None


class FederatedRoundsResponse(BaseModel):
    round0Baseline: Optional[Dict[str, Any]] = None
    bestRound: int = 8
    bestValidationMAE: float = 3.1536
    roundsHistory: List[Dict[str, Any]]


class FederatedMetricsResponse(BaseModel):
    overall: Dict[str, Any]
    byHorizon: Dict[str, Any]
    centralizedReferenceComparison: Optional[Dict[str, Any]] = None


class FederatedCommunicationResponse(BaseModel):
    rawDownloadBytes: int
    rawUploadBytes: int
    rawTotalBytes: int
    serializedDownloadBytes: int
    serializedUploadBytes: int
    serializedTotalBytes: int
    rawBytesPerModel: int
    serializedBytesPerModel: int
    downloadsPerRound: int = 4
    uploadsPerRound: int = 4
    roundsCompleted: int
    classification: str = "SERIALIZED_APPLICATION_PAYLOAD_BYTES"
    payloadNotice: str
