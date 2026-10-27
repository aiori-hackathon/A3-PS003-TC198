import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Info,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';

export default function SelectedAlertInspector({ alert }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'evidence' | 'spatial' | 'action'

  if (!alert) {
    return (
      <SectionCard
        title="Selected Alert Context"
        subtitle="Select an event from the Attention Stream to inspect evidence rationale"
        icon={FileText}
      >
        <div className="py-12 text-center text-xs text-slate-400 dark:text-[#8295A8]">
          <Compass className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No alert selected. Click any row in the Attention &amp; Evidence Stream to inspect.</p>
        </div>
      </SectionCard>
    );
  }

  const severityBadge = (sev) => {
    if (sev === 'Critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          CRITICAL
        </span>
      );
    }
    if (sev === 'Warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
        <Info className="w-3 h-3 text-cyan-500" />
        INFO
      </span>
    );
  };

  return (
    <SectionCard
      title={`Alert Context — Sensor ${alert.sensorId}`}
      subtitle={`${alert.condition} • ${alert.regionId}`}
      icon={FileText}
      action={
        <div className="flex items-center gap-2">
          {severityBadge(alert.severity)}
          <ScientificBadge type="DERIVED" label="EVENT INSPECTOR" size="xs" />
        </div>
      }
      className="flex flex-col"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center text-xs ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#0B2033] text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#B8C7D8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center text-xs ${
              activeTab === 'evidence'
                ? 'bg-white dark:bg-[#0B2033] text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#B8C7D8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Evidence
          </button>
          <button
            onClick={() => setActiveTab('spatial')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center text-xs ${
              activeTab === 'spatial'
                ? 'bg-white dark:bg-[#0B2033] text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#B8C7D8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Spatial
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer text-center text-xs ${
              activeTab === 'action'
                ? 'bg-white dark:bg-[#0B2033] text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#B8C7D8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Action
          </button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-3 animate-fade-in text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2">
              <div className="flex justify-between items-center text-slate-600 dark:text-[#B8C7D8]">
                <span>Replay Timestamp:</span>
                <strong className="text-slate-900 dark:text-white">{alert.timestamp}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-[#B8C7D8]">
                <span>Sensor ID &amp; Region:</span>
                <strong className="text-cyan-600 dark:text-cyan-400">{alert.sensorId} ({alert.regionId})</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-[#B8C7D8]">
                <span>Condition Category:</span>
                <strong className="text-slate-900 dark:text-white">{alert.category}</strong>
              </div>
            </div>

            {/* Telemetry Snapshot Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E]">
                <span className="text-slate-500 dark:text-[#8295A8] block">Current Speed</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                  {alert.currentSpeed} <span className="text-[10px] font-normal text-slate-400">mph</span>
                </span>
                <span className="text-[10px] text-slate-500">Mean: {alert.recentMean} mph</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E]">
                <span className="text-slate-500 dark:text-[#8295A8] block">Traffic Drift</span>
                <span className={`text-sm font-bold block mt-0.5 ${
                  alert.drift > 0.35 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {alert.drift}
                </span>
                <span className="text-[10px] text-slate-500">Status: {alert.driftStatus}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E]">
                <span className="text-slate-500 dark:text-[#8295A8] block">Prediction Residual</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 block mt-0.5">
                  {alert.uncertaintyMph}
                </span>
                <span className="text-[10px] text-slate-500">Epistemic Uncertainty</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E]">
                <span className="text-slate-500 dark:text-[#8295A8] block">Need Score</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 block mt-0.5">
                  {alert.needScore}
                </span>
                <span className="text-[10px] text-slate-500">Data QC: {(alert.dataQuality * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="space-y-3 animate-fade-in text-xs">
            {/* Primary Trigger */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                Primary Trigger Rationale:
              </span>
              <p className="leading-relaxed">
                {alert.primaryTrigger}
              </p>
            </div>

            {/* Supporting Evidence List */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Supporting Signals:
              </span>
              <ul className="space-y-1.5 text-slate-700 dark:text-[#B8C7D8] text-[11px]">
                {alert.supportingEvidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] font-mono text-[11px]">
              <span className="text-slate-500 dark:text-[#8295A8]">Evidence State:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {alert.evidenceSufficiency}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: SPATIAL CONTEXT */}
        {activeTab === 'spatial' && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8295A8] font-mono">
                <span>Adjacency Topology</span>
                <span>Speed Delta: <strong className="text-rose-500 dark:text-rose-400">Δ {alert.speedDiff}</strong></span>
              </div>

              {/* Strict Grid Row */}
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 font-mono text-xs">
                  {/* Selected Sensor */}
                  <div className="flex flex-col items-start">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-400 text-rose-600 dark:text-rose-300 font-bold text-[11px]">
                      {alert.sensorId} ★
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white mt-1 text-[11px]">
                      {alert.currentSpeed} mph
                    </span>
                  </div>

                  {/* Connector */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="flex items-center w-full gap-1 text-[10px] text-slate-400">
                      <div className="h-[1px] bg-slate-300 dark:bg-slate-700 flex-1" />
                      <span className="text-[9px] uppercase font-bold text-slate-400">link</span>
                      <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                      <div className="h-[1px] bg-slate-300 dark:bg-slate-700 flex-1" />
                    </div>
                    <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
                      Corridor Edge
                    </span>
                  </div>

                  {/* Neighbor Sensor */}
                  <div className="flex flex-col items-end">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-400 text-blue-600 dark:text-blue-300 font-bold text-[11px]">
                      {alert.neighborSensor}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white mt-1 text-[11px]">
                      {alert.neighborSpeed} mph
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link to Network Map */}
            <Link
              to={`/network?sensor=${alert.sensorId}`}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <span>View on Traffic Network</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Tab 4: ACTION */}
        {activeTab === 'action' && (
          <div className="space-y-3 animate-fade-in text-xs font-mono">
            {/* Action Flow Strip */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071624] border border-slate-200 dark:border-[#17364E] space-y-2.5">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Evidence-on-Demand Execution:
              </span>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-[#B8C7D8]">Action State:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{alert.actionState}</strong>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-[#B8C7D8]">Payload Exchanged:</span>
                <strong className="text-cyan-600 dark:text-cyan-400">{alert.actionPayload}</strong>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-[#B8C7D8]">Detailed Telemetry Proxy:</span>
                <span className="text-slate-500">~4.2 KB (Raw avoided)</span>
              </div>
            </div>

            {/* Quick Link to Decision Console */}
            <Link
              to={`/decision?sensor=${alert.sensorId}`}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <span>Open in Decision Intelligence</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
