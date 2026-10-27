# TrafficPulse-X Scientific Scope, Contracts & Boundaries

This document defines the authoritative scientific scope, mathematical contracts, checksums, and operational boundaries of the TrafficPulse-X platform.

---

## 1. Operational Invariants & Scope Boundaries

1. **Historical Replay Execution**:
   - The primary execution paradigm is deterministic historical replay over the METR-LA benchmark (March 1, 2012 – June 27, 2012).
   - Telemetry sequences represent historical loop detector observations, not live production traffic monitoring.
2. **Communication Cost Attribution**:
   - Primary metric: **Serialized Application Payload** (exact bytes of PyTorch state dicts and telemetry JSON objects transferred between client and server).
   - Secondary metric: **Controlled Network Transfer Bytes — Local Test** (measured over localhost loopback sockets to quantify HTTP/TCP framing overhead).
   - No claims are made regarding physical cellular radio bandwidth savings, base-station retransmissions, or carrier network overhead.
3. **No Fabricated Fallback Data**:
   - If an external streaming provider or dataset is unavailable or unconfigured, the system returns explicit HTTP 503/400 errors or indicates "Not Configured". No synthetic or simulated fallback data is silently generated.
4. **Privacy Evaluation Boundaries**:
   - Standard FedAvg decentralized baseline does not provide formal cryptographic or differential privacy guarantees.
   - Formal differential privacy guarantees ($(\epsilon = 5.311, \delta = 10^{-5})$-DP) apply strictly to the optional Opacus experimental training add-on documented in `docs/EXPERIMENTS.md`.
5. **No Unsupported City-Wide Deployment Claims**:
   - Municipal case studies (Ranchi, Tumakuru, Visakhapatnam) serve as architectural feasibility mappings, not deployed municipal field installations.

---

## 2. Dataset Contract: METR-LA

| Parameter | Specification |
| :--- | :--- |
| **Location** | Los Angeles County Highway Network (Caltrans PeMS) |
| **Sensors** | 207 Inductive Loop Detectors |
| **Telemetry Variable** | Historical Vehicle Speed (`mph`) |
| **Matrix Dimensions** | 34,272 time steps × 207 sensors |
| **Sampling Interval** | 5 minutes (288 observations per day per detector) |
| **Temporal Range** | March 1, 2012 00:00:00 – June 27, 2012 23:55:00 UTC |
| **Chronological Splits** | Train: 70% (`[0, 23990)`), Val: 10% (`[23990, 27417)`), Test: 20% (`[27417, 34272)`) |
| **Sliding Window Samples** | Train: 23,967 \| Validation: 3,404 \| Test: 6,832 |
| **Input Sequence Length** | 12 historical steps (60 minutes) |
| **Forecast Horizons** | +5 min (step 1), +15 min (step 3), +30 min (step 6), +60 min (step 12) |
| **Z-Score Normalization** | Mean $\mu = 58.584258\text{ mph}$, Standard Deviation $\sigma = 12.822883\text{ mph}$ |

---

## 3. Spatial Graph Topology & Regional Partitions

Formulation: Symmetrically normalized adjacency matrix with self-loops:
$$\tilde{A} = A + I_{207}, \quad \tilde{D}_{ii} = \sum_j \tilde{A}_{ij}, \quad A_{norm} = \tilde{D}^{-1/2} \tilde{A} \tilde{D}^{-1/2}$$

### Geographic Regional Subgraphs (Non-IID Partition)
| Client ID | Sector | Sensor Count | Valid Target Cells ($n_i$) | FedAvg Aggregation Weight ($w_i$) |
| :--- | :--- | :--- | :--- | :--- |
| **CLIENT_A** | North-East | **48** | 4,221,681 | `0.229069` |
| **CLIENT_B** | South-East | **57** | 5,107,193 | `0.277117` |
| **CLIENT_C** | Central-West | **58** | 5,150,335 | `0.279458` |
| **CLIENT_D** | North-West | **44** | 3,950,552 | `0.214357` |
| **TOTAL** | — | **207** | **18,429,761** | **1.000000** |

---

## 4. Authoritative Checkpoint Checksums (SHA-256)

| Artifact Path | Description | Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- | :--- |
| `data/processed/metr-la/federated/checkpoints/global_best.pt` | Best FedAvg Checkpoint (Round 8) | 111,047 | `24710dae0fe0554ca8111ad21e05de03b69a282f0b8d8868a1433ba6fd9c2930` |
| `data/processed/metr-la/models/spatiotemporal/graph_lstm_best.pt` | Centralized Graph+LSTM Model | 111,119 | `702cb2bb9406aa36ec25639121377bf939acdb1906370997ccd792f70cf1f384` |
| `data/processed/pems08/models/flow_spatial_graph_lstm_best.pt` | PeMS08 Traffic Flow Model | 111,481 | `ce7f8ae11d25aeac6ccd475fa753d46c25bce9460c18793e6719518b5fb05c68` |
| `data/processed/metr-la/regions.json` | 4-Client Regional Partition | 6,530 | `3af9827ff16eea2c8469dcfd3f712e7a9074d1ab10ef61c9ee78f99e9b5463b3` |
| `data/raw/pems08/pems08.npz` | PeMS08 Raw Numpy Archive | 18,525,419 | `e1d03ce74e9fb79149e6e7c37c680214822c4a285baa2f42278cacabcd25c075` |
| `data/raw/pems08/distance.csv` | PeMS08 Physical Distance Matrix | 4,032 | `859d68e7583ed4e6016588eaaca494d3ece286dae361614c5c1833017f87eaa7` |

---

## 5. Frozen Empirical Baseline Results

### Centralized Model vs. 4-Client FedAvg (METR-LA Speed)
Evaluated across 6,832 test-set sliding windows (81,984 observations):

| Architecture | Test MAE (mph) | Test RMSE (mph) | Test MAPE (%) | Parameters | Best Epoch / Round |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Centralized Spatial Graph+LSTM** | **3.4378** | **6.8873** | **9.57%** | 26,596 | Epoch 12 |
| **FedAvg Decentralized (4 Clients)** | **3.5322** | **7.0956** | **9.99%** | 26,596 | Round 8 (Val MAE: 3.1536) |
| *Delta ($\Delta$ FedAvg vs Centralized)* | *+0.0944 (+2.75%)* | *+0.2083 (+3.02%)* | *+0.42%* | *Identical* | — |

### Application Payload Accounting
- Model update payload per transfer: **110,271 Bytes** (serialized PyTorch state dict).
- **Policy 4/4 (Full)**: 104 transfers = **11,468,184 Bytes** (11.47 MB).
- **Policy 3/4 (75% Budget)**: 78 transfers = **8,601,138 Bytes** (8.60 MB, 25.0% reduction).
- **Policy 2/4 (50% Budget, Pareto-Optimal)**: 52 transfers = **5,734,092 Bytes** (5.73 MB, 50.0% reduction).
- **Policy 1/4 (25% Budget)**: 26 transfers = **2,867,046 Bytes** (2.87 MB, 75.0% reduction).
