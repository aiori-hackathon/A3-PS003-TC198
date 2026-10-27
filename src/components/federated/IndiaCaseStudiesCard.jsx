import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Cpu,
  ArrowRight,
  Info,
  CheckCircle2,
  Camera,
  Activity
} from 'lucide-react';

const INDIA_CASE_STUDIES = [
  {
    id: 'ranchi',
    city: 'Ranchi',
    state: 'Jharkhand',
    title: 'Ranchi — Adaptive Traffic Control at City Scale',
    headlineStat: '81',
    statLabel: 'Adaptive signal locations',
    source: 'MoHUA Smart Cities Mission (Jharkhand Urban Infrastructure Development)',
    sourceUrl: 'https://smartcities.gov.in',
    realWorldContext: {
      scope: 'Customized signal coordination system deployed at 81 key locations.',
      technologies: [
        'Adaptive Traffic Control System (ATCS)',
        'Real-time traffic-condition based signal timing',
        'AI-based Automatic Number Plate Recognition (ANPR)',
        'Red Light Violation Detection (RLVD)',
        'Speed Violation Detection',
        'City traffic monitoring via City Operations Centre'
      ]
    },
    flowSteps: [
      { step: 'Traffic Sensors / Cameras', icon: Camera },
      { step: 'Junction Control', icon: Activity },
      { step: 'City Traffic System', icon: Building2 }
    ],
    challenge: 'Distributed junction-level traffic sensing across high-density urban corridors.',
    existingApproach: 'Adaptive signal coordination calculated from real-time traffic conditions.',
    flRelevance: 'Each regional traffic domain could conceptually act as a federated client, allowing locally learned traffic patterns to contribute to a global model without sending every raw observation centrally.',
    relevanceDisclaimer: 'Federated-learning relevance — architectural mapping, not a claim about the Ranchi deployment.'
  },
  {
    id: 'tumakuru',
    city: 'Tumakuru',
    state: 'Karnataka',
    title: 'Tumakuru — Intelligent Traffic Management & Adaptive Signals',
    headlineStat: '33+',
    statLabel: 'Monitored smart junctions',
    source: 'MoHUA Smart Cities Mission (Tumakuru Smart City Limited)',
    sourceUrl: 'https://smartcities.gov.in',
    realWorldContext: {
      scope: 'Intelligent Traffic Management System across ring roads & feeder junctions.',
      technologies: [
        'Surveillance cameras & in-road sensor loops',
        'Real-time traffic-condition detection',
        'Adaptive Traffic Control System (ATCS)',
        'Dynamic signal timing adjustment according to real-time queues',
        'Integrated Command and Control Centre (ICCC) based traffic management'
      ]
    },
    flowSteps: [
      { step: 'Cameras + Sensors', icon: Camera },
      { step: 'Local Junction Intelligence', icon: Cpu },
      { step: 'Traffic Control / Command Centre', icon: Building2 }
    ],
    flConceptSteps: [
      'Region A', 'Region B', 'Region C', 'Region D'
    ],
    challenge: 'Traffic congestion, road-safety and multi-jurisdiction traffic-management challenges.',
    existingApproach: 'Sensor/camera based traffic monitoring and adaptive traffic signalling coordinated through ICCC.',
    flRelevance: 'Multiple junctions or geographic zones create a naturally distributed learning environment. Local edge nodes train localized models while periodic federated aggregation builds a shared model without pooling citizen trip traces.',
    relevanceDisclaimer: 'Federated-learning relevance — conceptual mapping, not a claim that Tumakuru currently uses federated learning.'
  },
  {
    id: 'vizag',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    title: 'Visakhapatnam — Distributed Traffic Monitoring Infrastructure',
    headlineStat: '10',
    statLabel: 'Major junctions • 65 lanes',
    source: 'MoHUA Smart Cities Mission (Greater Visakhapatnam Smart City Corporation)',
    sourceUrl: 'https://smartcities.gov.in',
    realWorldContext: {
      scope: 'Junction-level smart traffic enforcement & monitoring network.',
      technologies: [
        'Red Light Violation Detection (RLVD) at 10 major junctions',
        '65 monitored traffic lanes',
        'More than 100 RLVD / ANPR camera sensors',
        'Centralized Command and Communication Centre',
        'Automated traffic-violation analytics & actuation'
      ]
    },
    flowSteps: [
      { step: 'Distributed Cameras', icon: Camera },
      { step: 'Traffic Junctions', icon: Activity },
      { step: 'Command & Communication Centre', icon: Building2 }
    ],
    challenge: 'Multi-lane arterial bottlenecks and tidal commute surges along coastal corridors.',
    existingApproach: 'Distributed optical sensors and automated violation analytics streaming to Command & Communication Centre.',
    flRelevance: 'A distributed deployment of many traffic sensing points creates a realistic architecture where separate geographic clients could train local traffic models and share only useful model updates.',
    relevanceDisclaimer: 'Federated-learning relevance — conceptual mapping, not a claim that Visakhapatnam deployed TrafficPulse-X or FL.'
  }
];

export default function IndiaCaseStudiesCard() {
  const [selectedCityId, setSelectedCityId] = useState('ranchi');

  const activeStudy = INDIA_CASE_STUDIES.find(c => c.id === selectedCityId) || INDIA_CASE_STUDIES[0];

  return (
    <div className="bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-2xl p-5 lg:p-6 shadow-xs dark:shadow-md transition-colors">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#17364E]/70">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-[#F7FAFF] tracking-tight">
              SMART-MOBILITY DEPLOYMENT CASE STUDIES
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBDDF0] mt-1 font-medium">
            Real-world municipal traffic architectures, automated incident alerts, and multi-junction telemetry systems.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-sans font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            MoHUA VERIFIED DEPLOYMENTS
          </span>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20">
            ACTIVE ANOMALY INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Municipal Traffic Context Banner */}
      <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-[#CBDDF0] leading-relaxed">
          <strong className="text-slate-900 dark:text-white block mb-0.5">
            Municipal Smart Cities Infrastructure &amp; Anomaly Detection:
          </strong>
          Documenting verified high-density municipal traffic implementations under India&apos;s Smart Cities Mission (MoHUA). These operational frameworks demonstrate how junction-level sensor telemetry feeds automated anomaly detection and adaptive signal control.
        </div>
      </div>

      {/* 3 City Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {INDIA_CASE_STUDIES.map((study) => {
          const isActive = study.id === selectedCityId;
          return (
            <button
              key={study.id}
              onClick={() => setSelectedCityId(study.id)}
              type="button"
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-50 dark:bg-[#0B2033] border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20 shadow-xs'
                  : 'bg-white dark:bg-[#071624] border-slate-200 dark:border-[#17364E] hover:border-slate-300 dark:hover:border-[#24506D]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  {study.city}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#CBDDF0]">
                  {study.state}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                  {study.headlineStat}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#CBDDF0]">
                  {study.statLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Case Study Detailed Card */}
      <div className="bg-slate-50/60 dark:bg-[#051321] border border-slate-200 dark:border-[#17364E] rounded-xl p-5 space-y-5">

        {/* Title & Provenance Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-[#17364E]">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-[#F5F8FC]">
              {activeStudy.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#CBDDF0] mt-0.5">
              Verified Source: <span className="font-medium text-slate-700 dark:text-white">{activeStudy.source}</span>
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 w-fit">
            Documented MoHUA Implementation
          </span>
        </div>

        {/* Real-World Deployment Visual Flow Diagram */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-[#7F96AA] block mb-3">
            Real-World Municipal Architecture Flow
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            {activeStudy.flowSteps.map((stepItem, idx) => {
              const StepIcon = stepItem.icon;
              return (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] flex-1">
                    <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-[#F5F8FC]">
                      {stepItem.step}
                    </span>
                  </div>
                  {idx < activeStudy.flowSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-[#60758A] hidden sm:block shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Optional FL Concept Diagram (Specific to Tumakuru) */}
        {activeStudy.id === 'tumakuru' && (
          <div className="p-4 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-3">
              TrafficPulse-X Conceptual Federated Mapping
            </span>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
                {activeStudy.flConceptSteps.map((region, idx) => (
                  <div key={idx} className="p-2 rounded bg-white dark:bg-[#081827] border border-purple-200 dark:border-purple-800/50 text-center font-bold text-slate-700 dark:text-[#BCD0E2]">
                    {region}
                  </div>
                ))}
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 hidden md:block shrink-0" />
              <div className="p-2.5 rounded bg-white dark:bg-[#081827] border border-purple-300 dark:border-purple-700 font-bold text-purple-700 dark:text-purple-300 text-center shrink-0">
                Federated Aggregation (FedAvg)
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 hidden md:block shrink-0" />
              <div className="p-2.5 rounded bg-white dark:bg-[#081827] border border-emerald-300 dark:border-emerald-700 font-bold text-emerald-700 dark:text-emerald-400 text-center shrink-0">
                Shared Traffic Forecast Model
              </div>
            </div>
          </div>
        )}

        {/* 3 Core Analytical Comparison Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

          {/* Block 1: Challenge / Problem */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">
                Challenge / Context
              </span>
              <p className="text-xs text-slate-700 dark:text-[#BCD0E2] leading-relaxed">
                {activeStudy.challenge}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#17364E] text-[10px] text-slate-400 font-mono">
              Physical Traffic Infrastructure
            </div>
          </div>

          {/* Block 2: Existing Approach */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-cyan-400 block mb-1">
                Documented Approach
              </span>
              <p className="text-xs text-slate-700 dark:text-[#BCD0E2] leading-relaxed">
                {activeStudy.existingApproach}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#17364E] text-[10px] text-slate-400 font-mono">
              Real-World Municipal Sensing
            </div>
          </div>

          {/* Block 3: Anomaly & Alert Intelligence */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#071727] border border-cyan-300 dark:border-cyan-500/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-600 dark:text-cyan-400 block mb-1">
                Anomaly &amp; Alert Intelligence
              </span>
              <p className="text-xs text-slate-700 dark:text-[#CBDDF0] leading-relaxed">
                {activeStudy.flRelevance}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-cyan-100 dark:border-cyan-500/20 text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold">
              Automated Anomaly Ingestion &amp; Incident Dispatch
            </div>
          </div>

        </div>

        {/* Operational Architecture Callout */}
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-700 dark:text-[#CBDDF0] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
          <span className="font-semibold text-cyan-900 dark:text-cyan-300">
            Operational Architecture: Junction-level sensor telemetry powers automated anomaly detection, incident alerting, and adaptive signal timing.
          </span>
        </div>

      </div>

    </div>
  );
}
