"""
Backend Router for TrafficPulse-X Experiment Extension.
Provides read-only API endpoints for 3-seed IID vs Non-IID distribution comparison,
statistical summary, and convergence trajectories.
"""

import os
import json
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/experiments", tags=["experiments"])

EXPERIMENT_RESULTS_PATH = "data/processed/metr-la/experiments/iid_non_iid_3seed_results.json"
IID_PARTITIONS_PATH = "data/processed/metr-la/experiments/iid_partitions/iid_partitions.json"


def load_experiment_data():
    if not os.path.exists(EXPERIMENT_RESULTS_PATH):
        return None
    try:
        with open(EXPERIMENT_RESULTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


@router.get("/status")
def get_experiment_status():
    """Returns availability status of 3-seed extension experiments."""
    data = load_experiment_data()
    if data is None:
        return {
            "status": "PENDING",
            "message": "3-Seed IID/Non-IID experiment evaluation pending or in progress.",
            "available": False
        }
    return {
        "status": "COMPLETED",
        "available": True,
        "seeds": data["provenance"]["seeds"],
        "timestamp": data["provenance"]["executionTimestamp"]
    }


@router.get("/distribution-comparison")
def get_distribution_comparison():
    """
    Returns statistical comparison between Non-IID (Geographic) and IID (Uniform-Random)
    client distributions with mean ± std error bounds.
    """
    data = load_experiment_data()
    if data is None:
        return {
            "status": "PENDING",
            "available": False,
            "message": "Experiment results pending completion."
        }
    return {
        "status": "COMPLETED",
        "available": True,
        "provenance": data["provenance"],
        "centralizedReference": data["centralizedReference"],
        "statisticalSummary": data["statisticalSummary"]
    }


@router.get("/seed-summary")
def get_seed_summary():
    """Returns granular per-seed evaluation results across all 3 seeds."""
    data = load_experiment_data()
    if data is None:
        return {
            "status": "PENDING",
            "available": False,
            "message": "Per-seed runs pending completion."
        }
    return {
        "status": "COMPLETED",
        "available": True,
        "seeds": data["provenance"]["seeds"],
        "rawRuns": data["rawRuns"]
    }


@router.get("/convergence")
def get_convergence_trajectories():
    """
    Returns round-by-round validation trajectory means and standard deviations
    for both IID and Non-IID partitions across rounds 0 to 13.
    """
    data = load_experiment_data()
    if data is None:
        return {
            "status": "PENDING",
            "available": False,
            "message": "Convergence trajectories pending completion."
        }
    
    non_iid_conv = data["statisticalSummary"]["nonIID"]["convergenceTrajectory"]
    iid_conv = data["statisticalSummary"]["iid"]["convergenceTrajectory"]

    rounds_data = []
    num_rounds = len(non_iid_conv["rounds"])
    for i in range(num_rounds):
        rounds_data.append({
            "round": non_iid_conv["rounds"][i],
            "nonIIDMean": non_iid_conv["meanValidationMAE"][i],
            "nonIIDStd": non_iid_conv["stdValidationMAE"][i],
            "iidMean": iid_conv["meanValidationMAE"][i],
            "iidStd": iid_conv["stdValidationMAE"][i]
        })

    return {
        "status": "COMPLETED",
        "available": True,
        "roundsHistory": rounds_data
    }


@router.get("/iid-partitions")
def get_iid_partitions():
    """Returns IID client partition details and sensor membership."""
    if not os.path.exists(IID_PARTITIONS_PATH):
        raise HTTPException(status_code=404, detail="IID partitions not found")
    with open(IID_PARTITIONS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)
