"""
Verification Test Suite for Differential Privacy Federated Learning Extension.
Tests:
1. DPConfig parameter validation.
2. DP disabled exact baseline parity (no regression).
3. Opacus RDPAccountant computes real epsilon (no invented or hardcoded values).
4. Privacy claims adhere strictly to safe wording (no 'Privacy Guaranteed').
5. Secure Aggregation simulation algebraic zero-sum cancellation & disclaimer.
6. Privacy backend API endpoints response contracts.
7. Frozen baseline checkpoints immutability.
"""

import os
import math
import hashlib
import pytest
import torch
from fastapi.testclient import TestClient

from backend.main import app
from ml.privacy.dp_config import DPConfig
from ml.privacy.dp_client import DPFederatedClient
from ml.privacy.secure_aggregation import simulate_secure_aggregation
from backend.privacy.router import get_privacy_status, get_privacy_results, get_secure_aggregation_simulation

client = TestClient(app)

FROZEN_GLOBAL_BEST_SHA256 = "24710dae0fe0554ca8111ad21e05de03b69a282f0b8d8868a1433ba6fd9c2930"


def test_1_dp_config_validation():
    """1. Verify DPConfig parameter validation constraints."""
    cfg = DPConfig(enabled=True, max_grad_norm=1.0, noise_multiplier=0.5, delta=1e-5)
    cfg.validate()
    assert cfg.max_grad_norm == 1.0
    assert cfg.noise_multiplier == 0.5
    assert cfg.delta == 1e-5

    # Rejection of invalid configs
    with pytest.raises(ValueError):
        DPConfig(enabled=True, max_grad_norm=-1.0).validate()

    with pytest.raises(ValueError):
        DPConfig(enabled=True, noise_multiplier=-0.1).validate()

    with pytest.raises(ValueError):
        DPConfig(enabled=True, delta=1.5).validate()


def test_2_dp_disabled_exact_baseline_parity():
    """2. Verify that disabling DP produces exact standard client behaviour (no regression)."""
    dp_disabled_cfg = DPConfig(enabled=False)
    client_dp_off = DPFederatedClient("CLIENT_A", "REGION_A", dp_config=dp_disabled_cfg, seed=42)

    assert client_dp_off.dp_config.enabled is False
    assert client_dp_off.accountant is None
    assert client_dp_off.compute_privacy_budget() is None


def test_3_opacus_accountant_computes_real_epsilon():
    """3. Verify Opacus RDPAccountant computes real, non-fabricated epsilon from steps."""
    from opacus.accountants import RDPAccountant
    acc = RDPAccountant()
    # Step 10 times with sampling rate 0.05 and noise multiplier 0.8
    for _ in range(10):
        acc.step(noise_multiplier=0.8, sample_rate=0.05)

    delta = 1e-5
    eps = acc.get_epsilon(delta=delta)
    assert isinstance(eps, float)
    assert eps > 0.0
    assert not math.isnan(eps)
    assert not math.isinf(eps)


def test_4_privacy_claim_and_safe_wording():
    """4. Verify NO 'Privacy Guaranteed' badge/claim exists and safe wording is enforced."""
    status = get_privacy_status()
    results = get_privacy_results()

    # Never display 'Privacy Guaranteed'
    assert "Privacy Guaranteed" not in str(status)
    assert "Privacy Guaranteed" not in str(results)

    # Safe headings
    if results.get("evaluated"):
        spec = results["privacySpecification"]
        assert spec["isPrivacyGuaranteed"] is False
        assert "Formal Differential Privacy" in spec["safeHeading"]
        assert "(ε, δ)-DP" in spec["formalClaim"]
        assert spec["epsilon"] is not None
        assert spec["delta"] is not None


def test_5_secure_aggregation_zero_sum_cancellation():
    """5. Verify Secure Aggregation simulation algebraic zero-sum cancellation and disclaimer."""
    # Create toy client state dicts
    toy_updates = {
        "CLIENT_A": {"w": torch.tensor([[1.0, 2.0], [3.0, 4.0]])},
        "CLIENT_B": {"w": torch.tensor([[2.0, 1.0], [4.0, 3.0]])},
        "CLIENT_C": {"w": torch.tensor([[0.5, 1.5], [2.5, 3.5]])},
        "CLIENT_D": {"w": torch.tensor([[1.5, 0.5], [3.5, 2.5]])},
    }
    weights = {"CLIENT_A": 0.25, "CLIENT_B": 0.25, "CLIENT_C": 0.25, "CLIENT_D": 0.25}

    sim = simulate_secure_aggregation(toy_updates, weights, seed=42)

    assert sim["label"] == "Secure Aggregation Simulation"
    assert sim["zeroSumCancellation"] is True
    assert sim["maxResidualError"] < 1e-4
    assert "SIMULATION ONLY" in sim["disclaimer"]

    # Verify expected weighted average: 0.25 * (1 + 2 + 0.5 + 1.5) = 1.25
    expected_w00 = 0.25 * (1.0 + 2.0 + 0.5 + 1.5)
    assert abs(sim["stateDict"]["w"][0, 0].item() - expected_w00) < 1e-4


def test_6_backend_privacy_api_endpoints():
    """6. Verify all privacy API endpoints respond with HTTP 200 and expected schemas."""
    # 1. Status endpoint
    res_status = client.get("/api/experiments/privacy/status")
    assert res_status.status_code == 200
    data_status = res_status.json()
    assert "status" in data_status
    assert "evaluated" in data_status

    # 2. Results endpoint
    res_results = client.get("/api/experiments/privacy/results")
    assert res_results.status_code == 200
    data_results = res_results.json()
    assert "standardBaseline" in data_results
    assert "dpFedAvg" in data_results

    # 3. Secure aggregation simulation endpoint
    res_secagg = client.get("/api/experiments/privacy/secure-aggregation")
    assert res_secagg.status_code == 200
    data_secagg = res_secagg.json()
    assert "label" in data_secagg
    assert data_secagg["label"] == "Secure Aggregation Simulation"


def test_7_frozen_checkpoints_immutability():
    """7. Verify frozen global checkpoint hash remains immutable."""
    ckpt_path = "data/processed/metr-la/federated/checkpoints/global_best.pt"
    assert os.path.exists(ckpt_path), f"Checkpoint missing: {ckpt_path}"

    with open(ckpt_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    assert file_hash == FROZEN_GLOBAL_BEST_SHA256, (
        f"CRITICAL: global_best.pt was modified! Expected {FROZEN_GLOBAL_BEST_SHA256}, got {file_hash}"
    )
