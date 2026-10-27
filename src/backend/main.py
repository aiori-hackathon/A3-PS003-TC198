# TrafficPulse-X FastAPI Backend Server (Real-Data-Only METR-LA Benchmark Architecture)

import os
import sys
from pathlib import Path

# Deterministic root discovery for src/-centered layout
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SRC_ROOT = PROJECT_ROOT / "src"
for p in [str(PROJECT_ROOT), str(SRC_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from backend.data_source import DataSourceManager
from backend.prediction import get_prediction_service
from backend.federated import get_federated_service
from backend.prediction.schemas import (
    PredictionStatusResponse,
    ForecastResponse,
    PredictionMetricsResponse,
    PredictionModelsResponse
)
from backend.federated.schemas import (
    FederatedStatusResponse,
    ClientPartitionInfo,
    FederatedRoundsResponse,
    FederatedMetricsResponse,
    FederatedCommunicationResponse
)
from backend.datasets.metr_la import (
    inspect_metr_la_dataset,
    get_real_sensor_canonical,
    get_metr_la_snapshot,
    get_metr_la_ml_ready_status
)
from backend.communication_intelligence.service import get_comm_intel_service
from backend.assistant import ChatRequest, ChatResponse, generate_chat_reply
from backend.experiments.router import (
    get_experiment_status,
    get_distribution_comparison,
    get_seed_summary,
    get_convergence_trajectories,
    get_iid_partitions,
)
from backend.privacy.router import (
    get_privacy_status,
    get_privacy_results,
    get_secure_aggregation_simulation,
)
from backend.experiments.flow_router import (
    get_flow_status,
    get_flow_metadata,
    get_flow_results,
    get_flow_sensors,
    get_flow_forecast,
)
from backend.experiments.network_accounting import (
    get_network_accounting_status,
    get_network_accounting_report,
)
from backend.data_sources.streaming_adapter import (
    get_streaming_manager,
)

from backend.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Central Backend Data Source Manager Instance (Single Source of Truth)
data_source_mgr = DataSourceManager()
pred_service = get_prediction_service()
fl_service = get_federated_service()
comm_intel_service = get_comm_intel_service()


class HeartbeatPayload(BaseModel):
    speed: float | None = None



@app.get("/api/health")
def health_check():
    return data_source_mgr.get_health()


@app.get("/api/dashboard")
def get_dashboard_summary(time_index: int = 0):
    return data_source_mgr.get_dashboard_summary(time_index=time_index)


@app.get("/api/sensors")
def get_all_sensors(time_index: int = 0):
    return data_source_mgr.get_sensors(time_index=time_index)


@app.get("/api/sensors/{sensor_id}")
def get_sensor_by_id(sensor_id: str, time_index: int = 0):
    res = data_source_mgr.get_sensor_by_id(sensor_id=sensor_id, time_index=time_index)
    if not res:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found in METR-LA benchmark dataset")
    return res


@app.get("/api/decision/sensors/{sensor_id}/need-score")
def get_sensor_need_score(sensor_id: str):
    res = data_source_mgr.get_decision_need_score(sensor_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found")
    return res


@app.get("/api/decision/counterfactual/{sensor_id}")
def get_sensor_counterfactual(sensor_id: str):
    res = data_source_mgr.get_counterfactual(sensor_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found")
    return res


@app.get("/api/decision/blind-spots")
def get_blind_spots():
    return data_source_mgr.get_blind_spots()


@app.get("/api/decision/evidence/{sensor_id}")
def get_evidence_chain(sensor_id: str):
    return data_source_mgr.get_evidence_chain(sensor_id)


@app.get("/api/decision/query-candidates")
def get_query_candidates():
    return data_source_mgr.get_query_candidates()


@app.get("/api/decision/certificate/{region_id}")
def get_coverage_certificate(region_id: str = "REGION_A", replay_time: str = "18:42"):
    return data_source_mgr.get_coverage_certificate(region_id=region_id, replay_time=replay_time)


@app.get("/api/decision/jury/{sensor_id}")
def get_sensor_jury(sensor_id: str):
    res = data_source_mgr.get_sensor_jury(sensor_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found")
    return res


@app.get("/api/decision/physics-gate/{sensor_id}")
def get_physics_gate(sensor_id: str):
    res = data_source_mgr.get_physics_gate(sensor_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found")
    return res


@app.get("/api/decision/minimum-evidence/{region_id}")
def get_minimum_evidence_set(region_id: str = "REGION_A"):
    return data_source_mgr.get_minimum_evidence_set(region_id=region_id)


@app.get("/api/network")
def get_network_topology():
    return data_source_mgr.get_network_topology()


@app.get("/api/network/spatial-consistency")
def check_spatial_speed_consistency(from_id: str = "773869", to_id: str = "767541"):
    return data_source_mgr.get_spatial_speed_consistency(from_id, to_id)


@app.get("/api/network/conservation")
def legacy_spatial_consistency_alias(from_id: str = "773869", to_id: str = "767541"):
    """Alias for backwards compatibility with spatial speed consistency evaluation."""
    return data_source_mgr.get_spatial_speed_consistency(from_id, to_id)


@app.get("/api/events")
def get_events():
    return data_source_mgr.state_mgr.recent_decisions if data_source_mgr.state_mgr.recent_decisions else [
        {
            "id": "DEC-01",
            "time": "18:42:00",
            "sensor": "773869",
            "decision": "QUERY",
            "benefit": "48.0%",
            "reason": "Core arterial chokepoint influence"
        }
    ]


@app.post("/api/query/{sensor_id}")
def execute_sensor_query(sensor_id: str):
    return data_source_mgr.record_query(sensor_id)


@app.post("/api/sensors/{sensor_id}/heartbeat")
def receive_sensor_heartbeat(sensor_id: str, payload: HeartbeatPayload):
    return data_source_mgr.record_heartbeat(sensor_id, payload.model_dump(exclude_unset=True))


@app.get("/api/datasets/status")
def get_datasets_status():
    return data_source_mgr.get_datasets_status()


@app.get("/api/datasets/metr-la/summary")
def get_metr_la_dataset_summary():
    return inspect_metr_la_dataset()


@app.get("/api/datasets/metr-la/features")
def get_metr_la_feature_matrix():
    feat_path = "data/processed/metr-la/feature_support.json"
    if os.path.exists(feat_path):
        import json
        with open(feat_path, "r", encoding="utf-8") as f:
            return json.load(f)
    inspector = data_source_mgr.inspector
    return inspector.generate_feature_support_matrix(os.path.exists("data/raw/metr-la/metr-la.h5"))


@app.get("/api/datasets/metr-la/sensors/{sensor_id}")
def get_real_metr_la_sensor(sensor_id: str, time_index: int = 0):
    record = get_real_sensor_canonical(sensor_id, time_index=time_index)
    if not record:
        raise HTTPException(status_code=404, detail=f"Sensor ID '{sensor_id}' not found in METR-LA benchmark dataset")
    return record


@app.get("/api/datasets/metr-la/regions")
def get_metr_la_regions():
    reg_path = "data/processed/metr-la/regions.json"
    if os.path.exists(reg_path):
        import json
        with open(reg_path, "r", encoding="utf-8") as f:
            return json.load(f)
    inspector = data_source_mgr.inspector
    regions, _ = inspector.generate_regions_and_representatives()
    return regions


@app.get("/api/datasets/metr-la/regions/{region_id}")
def get_metr_la_region_detail(region_id: str):
    r_code = region_id.upper()
    if not r_code.startswith("REGION_"):
        r_code = f"REGION_{r_code}"

    regions = get_metr_la_regions()
    if r_code not in regions:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found. Valid regions: REGION_A, REGION_B, REGION_C, REGION_D")
    return regions[r_code]


@app.get("/api/datasets/metr-la/regions/{region_id}/representatives")
def get_metr_la_region_representatives(region_id: str):
    r_code = region_id.upper()
    if not r_code.startswith("REGION_"):
        r_code = f"REGION_{r_code}"

    rep_path = "data/processed/metr-la/representative_sensors.json"
    if os.path.exists(rep_path):
        import json
        with open(rep_path, "r", encoding="utf-8") as f:
            all_reps = json.load(f)
            if r_code in all_reps:
                return all_reps[r_code]

    raise HTTPException(status_code=404, detail=f"Representatives for region '{region_id}' not found.")


@app.get("/api/datasets/metr-la/representatives")
def get_all_metr_la_representatives():
    rep_path = "data/processed/metr-la/representative_sensors.json"
    if os.path.exists(rep_path):
        import json
        with open(rep_path, "r", encoding="utf-8") as f:
            return json.load(f)
    inspector = data_source_mgr.inspector
    _, reps = inspector.generate_regions_and_representatives()
    return reps


@app.get("/api/datasets/metr-la/snapshot")
def get_real_metr_la_snapshot(
    time_index: int = 0,
    region_id: str | None = None,
    representatives_only: bool = True
):
    try:
        return get_metr_la_snapshot(
            time_index=time_index,
            region_id=region_id,
            representatives_only=representatives_only
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load snapshot: {str(e)}")


@app.get("/api/datasets/metr-la/ml-ready/status")
def get_metr_la_ml_ready_dataset_status():
    return get_metr_la_ml_ready_status()


# =============================================================================
# Stage 6.7 Prediction Intelligence API Endpoints
# =============================================================================

@app.get("/api/prediction/status", response_model=PredictionStatusResponse)
def get_prediction_status():
    """Returns Prediction Intelligence status and model checkpoint readiness."""
    return pred_service.get_status()


@app.get("/api/prediction/forecast", response_model=ForecastResponse)
def get_prediction_forecast(
    time_index: int = 12,
    sensor_id: str | None = None,
    region_id: str | None = None
):
    """
    Returns real spatio-temporal predictions (+5, +15, +30, +60 min) generated by
    the frozen Graph+LSTM model over METR-LA historical replay.
    """
    if not pred_service.model_loaded:
        raise HTTPException(
            status_code=503,
            detail="MODEL_NOT_READY: Spatio-temporal Graph+LSTM model checkpoint is not ready."
        )

    try:
        return pred_service.forecast(
            time_index=time_index,
            sensor_id=sensor_id,
            region_id=region_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except KeyError as ke:
        raise HTTPException(status_code=404, detail=str(ke).strip("'"))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/api/prediction/metrics", response_model=PredictionMetricsResponse)
def get_prediction_metrics():
    """Returns frozen Stage 6.6 overall, horizon-wise, and region-wise metrics."""
    try:
        return pred_service.get_prediction_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prediction metrics: {str(e)}")


@app.get("/api/prediction/models", response_model=PredictionModelsResponse)
def get_prediction_models():
    """Returns 7-model comparative benchmark table from authoritative Stage 6.6 summary."""
    try:
        return pred_service.get_prediction_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load prediction models table: {str(e)}")


# =============================================================================
# Stage 8.3 Federated Learning Read-Only API Endpoints
# =============================================================================

@app.get("/api/federated/status", response_model=FederatedStatusResponse)
def get_federated_status():
    """Returns overall Federated Learning status and checkpoint readiness."""
    try:
        return fl_service.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load federated status: {str(e)}")


@app.get("/api/federated/clients", response_model=List[ClientPartitionInfo])
def get_federated_clients():
    """Returns 4 regional FL client partitions and FedAvg aggregation weights."""
    try:
        return fl_service.get_clients()
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load federated clients: {str(e)}")


@app.get("/api/federated/rounds", response_model=FederatedRoundsResponse)
def get_federated_rounds():
    """Returns compact validation MAE history across all training rounds."""
    try:
        return fl_service.get_rounds()
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load federated rounds: {str(e)}")


@app.get("/api/federated/metrics", response_model=FederatedMetricsResponse)
def get_federated_metrics():
    """Returns final FL test metrics and comparison against centralized baseline."""
    try:
        return fl_service.get_metrics()
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load federated metrics: {str(e)}")


@app.get("/api/federated/communication", response_model=FederatedCommunicationResponse)
def get_federated_communication():
    """Returns Stage 8.2 full-participation baseline communication payload accounting."""
    try:
        return fl_service.get_communication()
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load federated communication: {str(e)}")


# -------------------------------------------------------------
# Phase 9.1 Communication Intelligence Foundation Endpoints
# -------------------------------------------------------------

@app.get("/api/communication/phase9/status")
def get_phase9_status():
    """Returns Phase 9 communication intelligence status and baseline specs."""
    try:
        return comm_intel_service.get_phase9_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load Phase 9 status: {str(e)}")


@app.get("/api/communication/phase9/client-values")
def get_phase9_client_values():
    """Returns derived client communication utility scores and information debts."""
    try:
        return comm_intel_service.get_client_values()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load client values: {str(e)}")


@app.get("/api/communication/phase9/select")
def evaluate_phase9_selection(budget: str = "3/4"):
    """Simulates client participation selection under specified budget constraint."""
    try:
        return comm_intel_service.evaluate_budget(budget_str=budget)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate budget: {str(e)}")


# -------------------------------------------------------------
# Phase 9.2 Controlled Selective FL Experiment Endpoints
# -------------------------------------------------------------

@app.get("/api/communication/phase9/experiments")
def get_phase9_experiments():
    """Returns synthesized summary of all Phase 9.2 selective FL experiment policies."""
    try:
        return comm_intel_service.get_experiments_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load experiment summary: {str(e)}")


@app.get("/api/communication/phase9/experiments/{policy}")
def get_phase9_policy_details(policy: str):
    """Returns detailed evaluation artifact for a specific selective policy."""
    try:
        return comm_intel_service.get_policy_details(policy)
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load policy details: {str(e)}")


@app.get("/api/communication/phase9/tradeoff")
def get_phase9_tradeoff():
    """Returns Pareto-relevant communication-vs-accuracy trade-off analysis."""
    try:
        return comm_intel_service.get_tradeoff()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load tradeoff analysis: {str(e)}")


@app.get("/api/communication/phase9/rounds/{policy}")
def get_phase9_rounds_history(policy: str):
    """Returns round-by-round selection history, CCV values, and information debts."""
    try:
        return comm_intel_service.get_rounds_history(policy)
    except FileNotFoundError as fe:
        raise HTTPException(status_code=404, detail=str(fe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load rounds history: {str(e)}")


@app.post("/api/assistant/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest):
    """Processes AI assistant queries using server-side Gemini integration or domain fallback."""
    return generate_chat_reply(req)


# ============================================================================
# EXPERIMENT EXTENSION ENDPOINTS (Read-Only 3-Seed Reproducibility & IID Comparison)
# ============================================================================

@app.get("/api/experiments/status")
def api_get_experiment_status():
    """Returns availability status of 3-seed extension experiments."""
    return get_experiment_status()


@app.get("/api/experiments/distribution-comparison")
def api_get_distribution_comparison():
    """Returns statistical comparison between Non-IID and IID client distributions."""
    return get_distribution_comparison()


@app.get("/api/experiments/seed-summary")
def api_get_seed_summary():
    """Returns granular per-seed evaluation results across all 3 seeds."""
    return get_seed_summary()


@app.get("/api/experiments/convergence")
def api_get_convergence():
    """Returns round-by-round validation trajectory means and error bands."""
    return get_convergence_trajectories()


@app.get("/api/experiments/iid-partitions")
def api_get_iid_partitions():
    """Returns IID client partition details and sensor membership."""
    return get_iid_partitions()


# ============================================================================
# DIFFERENTIAL PRIVACY & SECURE AGGREGATION EXPERIMENT ENDPOINTS
# ============================================================================

@app.get("/api/experiments/privacy/status")
def api_get_privacy_status():
    """Returns availability status of the differential privacy experiment."""
    return get_privacy_status()


@app.get("/api/experiments/privacy/results")
def api_get_privacy_results():
    """Returns comparative evaluation between Standard FedAvg and DP-FedAvg."""
    return get_privacy_results()


@app.get("/api/experiments/privacy/secure-aggregation")
def api_get_secure_aggregation_simulation():
    """Returns verified Secure Aggregation simulation results and protocol overhead."""
    return get_secure_aggregation_simulation()


# ============================================================================
# PEMS08 TRAFFIC FLOW EXPERIMENTAL EXTENSION ENDPOINTS
# ============================================================================

@app.get("/api/experiments/flow/status")
def api_get_flow_status():
    """Returns flow extension availability, sensor count, and evaluation status."""
    return get_flow_status()


@app.get("/api/experiments/flow/metadata")
def api_get_flow_metadata():
    """Returns official PeMS08 metadata, channels, splits, and provenance."""
    return get_flow_metadata()


@app.get("/api/experiments/flow/results")
def api_get_flow_results():
    """Returns empirical evaluation results on PeMS08 test set."""
    return get_flow_results()


@app.get("/api/experiments/flow/sensors")
def api_get_flow_sensors():
    """Returns representative and all 170 sensors for PeMS08."""
    return get_flow_sensors()


@app.get("/api/experiments/flow/forecast")
def api_get_flow_forecast(step: int = 100, sensorId: str = "PEMS08_009"):
    """Inference endpoint: generates multi-horizon traffic flow predictions for a selected PeMS08 sensor."""
    return get_flow_forecast(step=step, sensorId=sensorId)


# ============================================================================
# CONTROLLED NETWORK ACCOUNTING ENDPOINTS
# ============================================================================

@app.get("/api/experiments/network-accounting/status")
def api_get_network_accounting_status():
    """Returns availability and accounting view modes for network byte measurement."""
    return get_network_accounting_status()


@app.get("/api/experiments/network-accounting")
def api_get_network_accounting_report():
    """Returns local transport benchmark report (Controlled Network Transfer Bytes)."""
    return get_network_accounting_report()


# ============================================================================
# STREAMING ADAPTER ENDPOINTS (HISTORICAL REPLAY DEFAULT + OPTIONAL LIVE ADAPTER)
# ============================================================================

class ProviderSwitchPayload(BaseModel):
    provider: str


@app.get("/api/streaming/status")
def api_get_streaming_status():
    """Returns status of registered streaming providers and active data source."""
    return get_streaming_manager().get_status_summary()


@app.get("/api/streaming/config")
def api_get_streaming_config():
    """Returns streaming configurations and limits (no secrets exposed)."""
    mgr = get_streaming_manager()
    summary = mgr.get_status_summary()
    return {
        "activeProvider": summary["activeProvider"],
        "defaultProvider": summary["defaultProvider"],
        "notice": "Historical Replay remains the baseline. External live stream is an optional experiment requiring server-side API credentials."
    }


@app.post("/api/streaming/provider")
def api_set_streaming_provider(payload: ProviderSwitchPayload):
    """Switches active streaming provider. Refuses switch if external provider is unconfigured."""
    res = get_streaming_manager().set_active_provider(payload.provider)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res)
    return res


@app.get("/api/streaming/snapshot")
def api_get_streaming_snapshot(time_index: int = 0, region_id: str = "ALL", provider: Optional[str] = None):
    """
    Returns snapshot from requested or active provider.
    Never silently falls back to fabricated data if external stream fails.
    """
    mgr = get_streaming_manager()
    p_id = provider or mgr.active_provider_id
    prov = mgr.get_provider(p_id)
    if not prov:
        raise HTTPException(status_code=400, detail=f"Unknown streaming provider '{p_id}'. Must be 'historical' or 'external_live'.")
    if not prov.is_available():
        raise HTTPException(
            status_code=503,
            detail="Live source unavailable: External streaming experiment is not configured. Historical Replay remains available."
        )
    try:
        return prov.get_snapshot(time_index=time_index, region_id=region_id)
    except Exception as err:
        raise HTTPException(status_code=503, detail=f"Live source unavailable: {str(err)}")
