# TrafficPulse-X Empirical Experiments & Benchmarks

This document records the methodology, numerical outcomes, and verification artifacts for all scientific experiments conducted in TrafficPulse-X. Every reported figure is read directly from immutable disk artifacts.

---

## Experiment 1: Centralized Multi-Model Benchmark (METR-LA Speed)

**Dataset**: METR-LA (207 sensors, 5-minute sampling cadence).  
**Evaluation**: 6,832 test sliding-window samples (81,984 observations) across 4 horizons (+5m, +15m, +30m, +60m).

| Rank | Model Architecture | Test MAE (mph) | Test RMSE (mph) | Test MAPE (%) | Inductive Bias |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 7 | Last Value Baseline | 5.3421 | 9.8742 | 14.82% | Persistence heuristic |
| 6 | Historical Average | 4.8912 | 9.1245 | 13.56% | Temporal periodicity |
| 5 | Linear Regression | 4.4120 | 8.4312 | 12.18% | Linear autoregression |
| 4 | Temporal GRU | 3.9876 | 7.7654 | 10.95% | Recurrent temporal gating |
| 3 | Temporal LSTM | 3.8421 | 7.5412 | 10.62% | Long-range memory cell |
| 2 | Spatial GCN | 3.7124 | 7.3412 | 10.28% | Spectral graph convolution |
| **1** | **Spatial Graph+LSTM (Ours)** | **3.4378** | **6.8873** | **9.57%** | **Spatio-temporal joint embedding** |

**Artifact**: `data/processed/metr-la/models/spatiotemporal/graph_lstm_best.pt` (SHA-256: `702cb2bb9406aa36ec25639121377bf939acdb1906370997ccd792f70cf1f384`)

---

## Experiment 2: Federated Learning Baseline (4 Geographic Clients)

**Clients**: 4 Non-IID geographic sectors (Region A: 48 sensors, Region B: 57 sensors, Region C: 58 sensors, Region D: 44 sensors).  
**Aggregation Protocol**: Federated Averaging (`FedAvg`), weighted by valid regional sample count $n_i$.  
**Rounds Evaluated**: 13 global communication rounds.

| Metric | Centralized Upper Bound | FedAvg Decentralized | Delta ($\Delta$) |
| :--- | :---: | :---: | :---: |
| **Test MAE** | 3.4378 mph | **3.5322 mph** | +0.0944 mph (+2.75%) |
| **Test RMSE** | 6.8873 mph | **7.0956 mph** | +0.2083 mph (+3.02%) |
| **Test MAPE** | 9.57% | **9.99%** | +0.42% |
| **Best Round** | Epoch 12 | **Round 8** (Val MAE: 3.1536 mph) | — |
| **Model Parameters** | 26,596 | 26,596 | Identical parameter size |

**Artifact**: `data/processed/metr-la/federated/checkpoints/global_best.pt` (SHA-256: `24710dae0fe0554ca8111ad21e05de03b69a282f0b8d8868a1433ba6fd9c2930`)

---

## Experiment 3: CCV-Directed Selective Communication Policies

**Methodology**: Client Contribution Value ($\text{CCV}_k = 1.0 \cdot s_k + 0.5 \cdot d_k + 0.15 \cdot \tau_k$) prioritizes high-entropy, sensor-dense regional clusters under strict round budgets.  
**Accounting Metric**: Serialized Application Payload (110,271 B per transfer).

| Policy Tier | Active Clients / Round | Total Transfers (13 Rds) | Application Payload | Payload Reduction | Test MAE (mph) | Efficiency Classification |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **4/4 (Full)** | 4 | 104 | 11,468,184 B (11.47 MB) | Baseline (0.0%) | 3.5322 | Baseline Reference |
| **3/4** | 3 | 78 | 8,601,138 B (8.60 MB) | 25.0% | 3.5684 | Moderate Economy |
| **2/4** | 2 | 52 | **5,734,092 B (5.73 MB)** | **50.0%** | **3.5912** | **Pareto-Optimal Trade-off** |
| **1/4** | 1 | 26 | 2,867,046 B (2.87 MB) | 75.0% | 3.7420 | Extreme Constrained |

---

## Experiment 4: Controlled Network-Byte Measurement (Local Test)

**Environment**: Local loopback TCP stream (127.0.0.1:8000), simulated FL client-server communication over HTTP/1.1 wire interception.  
**Purpose**: Quantify protocol framing and HTTP header overhead on top of the serialized application payload.  
*Disclaimer: Measured in a controlled local test; physical cellular carrier transmission overhead is not modeled.*

| Policy | Application Payload | Measured Network Wire Bytes | Transport Overhead Bytes | Overhead % | Transfers |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **4/4** | 11,468,184 B | 11,502,380 B | 34,196 B | +0.298% | 104 |
| **3/4** | 8,601,138 B | 8,626,785 B | 25,647 B | +0.298% | 78 |
| **2/4** | 5,734,092 B | 5,751,190 B | 17,098 B | +0.298% | 52 |
| **1/4** | 2,867,046 B | 2,875,595 B | 8,549 B | +0.298% | 26 |

**Artifact**: `data/processed/metr-la/experiments/measured_network_accounting.json`

---

## Experiment 5: 3-Seed Evaluation & IID vs. Non-IID Partition Comparison

**Seeds**: 42, 123, 2026.  
**Configurations**:
1. **Non-IID (Geographic)**: 4 spatial subgraphs (A: 48, B: 57, C: 58, D: 44 sensors).
2. **IID (Stratified Random)**: 4 uniform randomly sampled partitions (52, 52, 52, 51 sensors).

| Metric | Non-IID (Geographic) Mean $\pm$ Std | Non-IID Range [Min, Max] | IID (Stratified) Mean $\pm$ Std | IID Range [Min, Max] |
| :--- | :---: | :---: | :---: | :---: |
| **Test MAE (mph)** | **$3.6247 \pm 0.0808$** | [3.5322, 3.6817] | **$3.6642 \pm 0.0102$** | [3.6525, 3.6715] |
| **Test RMSE (mph)** | **$7.2283 \pm 0.1151$** | [7.0956, 7.3009] | **$7.3284 \pm 0.0246$** | [7.3104, 7.3564] |
| **Test MAPE (%)** | **$10.22\% \pm 0.22\%$** | [9.99%, 10.42%] | **$10.22\% \pm 0.03\%$** | [10.19%, 10.25%] |
| **Best Val MAE** | $3.2361 \pm 0.0722$ | [3.1536, 3.2926] | $3.2685 \pm 0.0076$ | [3.2612, 3.2764] |

**Key Finding**: IID client partitioning exhibits ~8× lower standard deviation across seeds ($\sigma = 0.0102$ vs $0.0808$), but non-IID geographic partitioning captures localized spatial correlations more effectively, yielding the best single model checkpoint (Seed 42: MAE 3.5322 mph).

**Artifact**: `data/processed/metr-la/experiments/iid_non_iid_3seed_results.json`

---

## Experiment 6: Formal Differential Privacy Training Add-On

**Framework**: Opacus 1.6.0 via PyTorch Rényi Differential Privacy (`RDPAccountant`).  
**Composition**: Parallel composition across disjoint regional client partitions.  
**Hyperparameters**: $\text{max\_grad\_norm} = 1.0$, $\text{noise\_multiplier} = 0.5$, $\delta = 10^{-5}$, 20 local steps per round.

| Specification | Standard FedAvg Baseline | DP-FedAvg Experimental |
| :--- | :---: | :---: |
| **Privacy Guarantee** | None (Unperturbed gradients) | **$(\epsilon = 5.311, \delta = 10^{-5})$-DP** |
| **Test MAE** | **3.5322 mph** | **3.7964 mph** ($\Delta = +0.2642\text{ mph} / +7.48\%$) |
| **Test RMSE** | **7.0956 mph** | **7.3456 mph** |
| **Test MAPE** | **9.99%** | **10.94%** |
| **Best Round** | Round 8 (Val: 3.1536) | Round 13 (Val: 3.4007) |
| **Total Transfers** | 104 (11,468,184 B) | 104 (11,468,184 B) |

**Key Finding**: Rigorous differential privacy introduces an empirical utility trade-off of $+0.2642\text{ mph}$ MAE penalty under verified $(\epsilon = 5.311, \delta = 10^{-5})$-DP privacy bounds.

**Artifact**: `data/processed/metr-la/experiments/dp_federated_results.json`

---

## Experiment 7: PeMS08 Traffic Flow Dataset Extension

**Dataset**: Caltrans District 8 (San Bernardino, 170 loop detector stations, 62 consecutive days, July–August 2016).  
**Channel**: Flow volume (`veh/5min`, range: 0.0 to 1,147.0, mean: 230.22).  
**Architecture**: SpatialGraphLSTM (170 nodes, 2 input features, 4 output horizons).

| Horizon Window | Test MAE (veh/5min) | Test RMSE (veh/5min) | Test MAPE (%) |
| :---: | :---: | :---: | :---: |
| **+5 min** | 14.96 | 22.32 | 8.85% |
| **+15 min** | 17.42 | 26.58 | 9.98% |
| **+30 min** | 20.14 | 31.01 | 11.17% |
| **+60 min** | 25.29 | 38.35 | 14.43% |
| **Overall (All Horizons)** | **19.45** | **30.15** | **11.11%** |

**Artifact**: `data/processed/pems08/flow_evaluation_results.json`
