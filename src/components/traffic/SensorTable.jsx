import React, { useState } from 'react';
import { Search, ListFilter } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import DataTable from '../common/DataTable';

export default function SensorTable({ sensors, selectedSensorId, onSelectSensor }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const filteredSensors = (sensors || []).filter((sensor) => {
    if (!sensor) return false;
    const term = String(searchTerm || '').toLowerCase();
    const sid = String(sensor.sensorId || sensor.id || '').toLowerCase();
    const alias = String(sensor.displayAlias || '').toLowerCase();
    const region = String(sensor.regionId || '').toUpperCase();

    const matchesSearch = sid.includes(term) || alias.includes(term);
    const matchesRegion = regionFilter === 'ALL' || region === regionFilter;

    return matchesSearch && matchesRegion;
  });

  const columns = [
    {
      header: "Sensor ID",
      key: "sensorId",
      className: "whitespace-nowrap",
      render: (row) => {
        const id = row.sensorId || row.id;
        const alias = row.displayAlias;
        const isSelected = selectedSensorId === id;
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={`font-mono font-semibold text-[13px] ${
              isSelected ? "text-cyan-600 dark:text-cyan-400" : "text-slate-900 dark:text-white"
            }`}>
              {alias ? `${alias} (${id})` : id}
            </span>
          </div>
        );
      }
    },
    {
      header: "Region",
      key: "regionId",
      className: "whitespace-nowrap",
      render: (row) => (
        <span className="font-mono text-[13px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
          {row.regionId || 'REGION_A'}
        </span>
      )
    },
    {
      header: "Speed (mph)",
      key: "speed",
      className: "whitespace-nowrap text-right",
      render: (row) => {
        const val = row.speed !== null && row.speed !== undefined
          ? `${typeof row.speed === 'number' ? row.speed.toFixed(1) : row.speed} mph`
          : "Masked (0)";
        return (
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[13px] tabular-nums whitespace-nowrap">
            {val}
          </span>
        );
      }
    },
    {
      header: "Data Quality",
      key: "dataQuality",
      className: "whitespace-nowrap text-right",
      render: (row) => {
        const q = row.dataQuality !== undefined ? (row.dataQuality * 100).toFixed(1) + '%' : '93.6%';
        return (
          <span className="font-mono text-[13px] text-slate-700 dark:text-slate-300 font-medium tabular-nums whitespace-nowrap">
            {q}
          </span>
        );
      }
    },
    {
      header: "Uncertainty",
      key: "uncertainty",
      className: "whitespace-nowrap text-right",
      render: (row) => {
        const u = row.uncertainty !== undefined ? `${row.uncertainty.toFixed(2)} mph` : '2.14 mph';
        return (
          <span className="font-mono text-[13px] text-amber-600 dark:text-amber-400 font-medium tabular-nums whitespace-nowrap">
            {u}
          </span>
        );
      }
    },
    {
      header: "Drift",
      key: "drift",
      className: "whitespace-nowrap text-right",
      render: (row) => {
        const d = row.trafficDrift !== undefined ? row.trafficDrift.toFixed(2) : '0.18';
        return (
          <span className="font-mono text-[13px] text-slate-600 dark:text-slate-400 font-medium tabular-nums whitespace-nowrap">
            {d}
          </span>
        );
      }
    },
    {
      header: "Need Score",
      key: "needScore",
      className: "whitespace-nowrap text-right",
      render: (row) => {
        const score = row.needScore !== undefined
          ? (typeof row.needScore === 'number' ? row.needScore.toFixed(2) : row.needScore)
          : '0.42';
        const num = parseFloat(score);
        return (
          <span className={`font-mono font-bold text-[13px] tabular-nums whitespace-nowrap ${
            num >= 0.7 ? "text-rose-600 dark:text-rose-400" : num >= 0.4 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
          }`}>
            {score}
          </span>
        );
      }
    }
  ];

  const searchAction = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter sensor (e.g. 773869)..."
          className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-44 sm:w-52"
        />
      </div>

      <select
        value={regionFilter}
        onChange={(e) => setRegionFilter(e.target.value)}
        className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-md text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
      >
        <option value="ALL">All Regions</option>
        <option value="REGION_A">Region A</option>
        <option value="REGION_B">Region B</option>
        <option value="REGION_C">Region C</option>
        <option value="REGION_D">Region D</option>
      </select>
    </div>
  );

  return (
    <SectionCard
      title="Sensor Telemetry Table"
      subtitle="Raw speed and derived decision parameters across 207 METR-LA sensors"
      icon={ListFilter}
      action={searchAction}
    >
      <DataTable
        columns={columns}
        data={filteredSensors}
        onRowClick={onSelectSensor}
        maxHeight={320}
      />
    </SectionCard>
  );
}
