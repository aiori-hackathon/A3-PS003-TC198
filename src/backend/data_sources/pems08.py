"""
PeMS08 Data Adapter for TrafficPulse-X.
Authoritative data source adapter for Caltrans District 8 (San Bernardino) traffic flow benchmark.

Exposes:
- timestamp (ISO-8601)
- sensor_id (e.g. PEMS08_014)
- flow_volume (vehicles / 5min)
- speed (mph)
- occupancy (ratio in [0.0, 1.0])

Strictly preserves METR-LA isolation. Does NOT alter METR-LA pipelines or scalers.
"""

import os
import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd


# PeMS08 Base Timestamp: 2016-07-01 00:00:00 UTC
PEMS08_START_DATETIME = datetime(2016, 7, 1, 0, 0, 0, tzinfo=timezone.utc)
PEMS08_INTERVAL_MINUTES = 5
TOTAL_TIMESTEPS = 17856
NUM_SENSORS = 170

# Channel indices in pems08.npz
CH_FLOW = 0       # vehicles / 5 minutes
CH_OCCUPANCY = 1  # loop detector occupancy ratio [0.0, 1.0]
CH_SPEED = 2      # vehicle velocity in mph


class PeMS08DataSource:
    """
    Data source adapter for PeMS08 flow, occupancy, and speed telemetry.
    """

    def __init__(
        self,
        raw_dir: str = "data/raw/pems08",
        processed_dir: str = "data/processed/pems08"
    ):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        self.npz_path = os.path.join(raw_dir, "pems08.npz")
        self.dist_path = os.path.join(raw_dir, "distance.csv")

        self._data: Optional[np.ndarray] = None
        self._adj_matrix: Optional[np.ndarray] = None
        self._sensor_ids: List[str] = [f"PEMS08_{i:03d}" for i in range(NUM_SENSORS)]
        self._load_data()

    def _load_data(self) -> None:
        """Loads numpy archive and builds adjacency if present."""
        if os.path.exists(self.npz_path):
            archive = np.load(self.npz_path)
            self._data = archive["data"]  # Shape: (17856, 170, 3)
        else:
            self._data = None

    @property
    def is_available(self) -> bool:
        return self._data is not None and self._data.shape == (TOTAL_TIMESTEPS, NUM_SENSORS, 3)

    def get_sensor_ids(self) -> List[str]:
        return list(self._sensor_ids)

    def parse_sensor_index(self, sensor_id: str) -> Optional[int]:
        """Parses sensor string ID (e.g. 'PEMS08_014' or '14') to numeric 0..169 index."""
        if not sensor_id:
            return None
        sid_str = str(sensor_id).strip()
        if sid_str.startswith("PEMS08_"):
            try:
                idx = int(sid_str.replace("PEMS08_", ""))
                if 0 <= idx < NUM_SENSORS:
                    return idx
            except ValueError:
                return None
        try:
            idx = int(sid_str)
            if 0 <= idx < NUM_SENSORS:
                return idx
        except ValueError:
            return None
        return None

    def get_timestamp_for_step(self, time_index: int) -> str:
        """Derives ISO-8601 UTC timestamp for given time index."""
        idx = max(0, min(TOTAL_TIMESTEPS - 1, time_index))
        dt = PEMS08_START_DATETIME + timedelta(minutes=idx * PEMS08_INTERVAL_MINUTES)
        return dt.isoformat()

    def get_snapshot(self, time_index: int = 0) -> Dict[str, Any]:
        """
        Returns complete multi-sensor telemetry snapshot for a given time index.
        """
        if not self.is_available or self._data is None:
            return {
                "available": False,
                "dataset": "PeMS08",
                "message": "PeMS08 dataset file not found in data/raw/pems08"
            }

        t_idx = max(0, min(TOTAL_TIMESTEPS - 1, int(time_index)))
        ts_str = self.get_timestamp_for_step(t_idx)

        # Slice time_index across all 170 sensors
        step_data = self._data[t_idx]  # Shape: (170, 3)

        sensors_list: List[Dict[str, Any]] = []
        for i in range(NUM_SENSORS):
            flow_val = float(step_data[i, CH_FLOW])
            occ_val = float(step_data[i, CH_OCCUPANCY])
            spd_val = float(step_data[i, CH_SPEED])

            sensors_list.append({
                "sensorId": self._sensor_ids[i],
                "numericId": i,
                "flow_volume": round(flow_val, 2),
                "flowUnit": "veh/5min",
                "occupancy": round(occ_val, 4),
                "speed": round(spd_val, 2),
                "speedUnit": "mph"
            })

        mean_flow = float(np.mean(step_data[:, CH_FLOW]))
        mean_speed = float(np.mean(step_data[:, CH_SPEED]))
        mean_occ = float(np.mean(step_data[:, CH_OCCUPANCY]))

        return {
            "available": True,
            "dataset": "PeMS08",
            "timeIndex": t_idx,
            "timestamp": ts_str,
            "totalSensors": NUM_SENSORS,
            "metric": "flow_volume",
            "unit": "veh/5min",
            "summary": {
                "averageFlow": round(mean_flow, 2),
                "averageSpeed": round(mean_speed, 2),
                "averageOccupancy": round(mean_occ, 4)
            },
            "sensors": sensors_list
        }

    def get_sensor_time_series(
        self,
        sensor_id: str,
        start_step: int = 0,
        end_step: int = 12
    ) -> List[Dict[str, Any]]:
        """
        Returns telemetry time series for a single sensor between start_step and end_step (inclusive).
        """
        if not self.is_available or self._data is None:
            return []

        s_idx = self.parse_sensor_index(sensor_id)
        if s_idx is None:
            return []

        start = max(0, min(TOTAL_TIMESTEPS - 1, start_step))
        end = max(start, min(TOTAL_TIMESTEPS - 1, end_step))

        series: List[Dict[str, Any]] = []
        for t in range(start, end + 1):
            ts = self.get_timestamp_for_step(t)
            flow_v = float(self._data[t, s_idx, CH_FLOW])
            occ_v = float(self._data[t, s_idx, CH_OCCUPANCY])
            spd_v = float(self._data[t, s_idx, CH_SPEED])
            series.append({
                "step": t,
                "timestamp": ts,
                "sensorId": self._sensor_ids[s_idx],
                "flow_volume": round(flow_v, 2),
                "flowUnit": "veh/5min",
                "occupancy": round(occ_v, 4),
                "speed": round(spd_v, 2),
                "speedUnit": "mph"
            })
        return series

    def get_graph_adjacency(self) -> np.ndarray:
        """
        Returns the normalized symmetric adjacency matrix (170 x 170).
        Computes from distance.csv via thresholded Gaussian kernel if not pre-computed.
        """
        if self._adj_matrix is not None:
            return self._adj_matrix

        adj_raw = np.zeros((NUM_SENSORS, NUM_SENSORS), dtype=np.float32)
        if os.path.exists(self.dist_path):
            df = pd.read_csv(self.dist_path)
            sigma = float(df["cost"].std()) if len(df) > 0 and float(df["cost"].std()) > 0 else 300.0
            for _, row in df.iterrows():
                u = int(row["from"])
                v = int(row["to"])
                cost = float(row["cost"])
                if u < NUM_SENSORS and v < NUM_SENSORS:
                    w = np.exp(- (cost / sigma) ** 2)
                    adj_raw[u, v] = w
                    adj_raw[v, u] = w

        # Symmetrize and add self-loops
        a_hat = adj_raw + np.eye(NUM_SENSORS, dtype=np.float32)
        d_hat = np.sum(a_hat, axis=1)
        d_inv_sqrt = np.zeros_like(d_hat, dtype=np.float32)
        nonzero_mask = d_hat > 0
        d_inv_sqrt[nonzero_mask] = np.power(d_hat[nonzero_mask], -0.5)
        d_mat = np.diag(d_inv_sqrt)
        self._adj_matrix = (d_mat @ a_hat @ d_mat).astype(np.float32)
        return self._adj_matrix

    def get_metadata(self) -> Dict[str, Any]:
        """Returns comprehensive dataset metadata and statistics."""
        return {
            "datasetName": "PeMS08",
            "domain": "Freeway Traffic Flow Volume",
            "source": "Caltrans PeMS District 8 (San Bernardino)",
            "benchmarkOrigin": "AAAI 2019 ASTGCN (Guo et al.) / PyTorch Spatiotemporal (TSL)",
            "sensorCount": NUM_SENSORS,
            "totalTimesteps": TOTAL_TIMESTEPS,
            "timeResolution": "5 minutes",
            "temporalCoverage": "2016-07-01 to 2016-08-31 (62 days)",
            "channels": [
                {"name": "flow", "unit": "veh/5min", "description": "Traffic flow volume"},
                {"name": "occupancy", "unit": "ratio [0,1]", "description": "Loop detector occupancy"},
                {"name": "speed", "unit": "mph", "description": "Average vehicle speed"}
            ],
            "primaryTarget": "flow",
            "primaryUnit": "veh/5min",
            "available": self.is_available
        }


# Singleton instance
_adapter_instance: Optional[PeMS08DataSource] = None


def get_pems08_adapter() -> PeMS08DataSource:
    global _adapter_instance
    if _adapter_instance is None:
        _adapter_instance = PeMS08DataSource()
    return _adapter_instance
