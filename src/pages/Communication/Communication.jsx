import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useReplay } from '../../context/ReplayContext';
import {
  fetchFederatedCommunication,
  fetchPhase9Selection,
  fetchPhase9ClientValues,
  fetchPhase9Experiments,
  fetchPhase9Tradeoff,
  fetchPhase9Rounds,
  fetchNetworkAccountingStatus,
  fetchNetworkAccountingReport
} from '../../services/api';
import CommunicationHeroFlow from '../../components/communication/CommunicationHeroFlow';
import CommunicationSummaryKPIs from '../../components/communication/CommunicationSummaryKPIs';
import CommunicationBreakdownDonut from '../../components/communication/CommunicationBreakdownDonut';
import SavingsVsPredictionQualityChart from '../../components/communication/SavingsVsPredictionQualityChart';
import ParticipationStrategyComparison from '../../components/communication/ParticipationStrategyComparison';
import PerRegionCommunicationTable from '../../components/communication/PerRegionCommunicationTable';
import RecentCommunicationEvents from '../../components/communication/RecentCommunicationEvents';
import CommunicationTechnicalDetails from '../../components/communication/CommunicationTechnicalDetails';

const STRATEGIES_MAP = {
  FULL: {
    id: 'FULL',
    policyKey: 'POLICY_CONTROLLED_4_OF_4',
    budgetKey: '4/4',
    name: 'Full Participation',
    shortName: 'Full (4/4)',
    clientsPerRound: 4,
    totalBytes: 11468184,
    reductionPercent: 0.0,
    testMAE: 3.6473,
    isBestTradeoff: false
  },
  SEVENTY_FIVE: {
    id: 'SEVENTY_FIVE',
    policyKey: 'POLICY_CCV_3_OF_4',
    budgetKey: '3/4',
    name: '75% Participation',
    shortName: '75% (3/4)',
    clientsPerRound: 3,
    totalBytes: 8601138,
    reductionPercent: 25.0,
    testMAE: 3.6530,
    isBestTradeoff: false
  },
  FIFTY: {
    id: 'FIFTY',
    policyKey: 'POLICY_CCV_2_OF_4',
    budgetKey: '2/4',
    name: '50% Participation',
    shortName: '50% (2/4)',
    clientsPerRound: 2,
    totalBytes: 5734092,
    reductionPercent: 50.0,
    testMAE: 3.6448,
    isBestTradeoff: true
  },
  TWENTY_FIVE: {
    id: 'TWENTY_FIVE',
    policyKey: 'POLICY_CCV_1_OF_4',
    budgetKey: '1/4',
    name: '25% Participation',
    shortName: '25% (1/4)',
    clientsPerRound: 1,
    totalBytes: 2867046,
    reductionPercent: 75.0,
    testMAE: 3.6699,
    isBestTradeoff: false
  }
};

export default function Communication() {
  const { timestampStr } = useReplay();
  const [commData, setCommData] = useState(null);
  const [error, setError] = useState(null);

  // Interactive Active Strategy (Defaults to 50% Participation - Best Observed Balanced Trade-off)
  const [activeStrategy, setActiveStrategy] = useState('FIFTY');

  const [phase9Selection, setPhase9Selection] = useState(null);
  const [clientValues, setClientValues] = useState([]);
  const [phase9Experiments, setPhase9Experiments] = useState(null);
  const [_phase9Tradeoff, setPhase9Tradeoff] = useState(null);
  const [activeHistoryPolicy, setActiveHistoryPolicy] = useState('POLICY_CCV_2_OF_4');
  const [roundsHistory, setRoundsHistory] = useState([]);

  // Accounting View State: 'APPLICATION_PAYLOAD' (Default Authoritative) vs 'MEASURED_NETWORK_BYTES'
  const [accountingView, setAccountingView] = useState('APPLICATION_PAYLOAD');
  const [accountingStatus, setAccountingStatus] = useState(null);
  const [accountingReport, setAccountingReport] = useState(null);

  const isMeasuredMode = accountingView === 'MEASURED_NETWORK_BYTES' && Boolean(accountingReport?.policies);

  const activeStrategyObj = useMemo(() => {
    const base = STRATEGIES_MAP[activeStrategy] || STRATEGIES_MAP.FIFTY;
    if (isMeasuredMode && accountingReport?.policies?.[base.budgetKey]) {
      const pol = accountingReport.policies[base.budgetKey];
      return {
        ...base,
        totalBytes: pol.measuredNetworkBytes,
        reductionPercent: pol.measuredReductionPercent,
        isMeasured: true
      };
    }
    return {
      ...base,
      isMeasured: false
    };
  }, [activeStrategy, isMeasuredMode, accountingReport]);

  const effectiveBaselineTotalBytes = useMemo(() => {
    if (isMeasuredMode && accountingReport?.policies?.['4/4']) {
      return accountingReport.policies['4/4'].measuredNetworkBytes;
    }
    return 11468184;
  }, [isMeasuredMode, accountingReport]);

  // Load baseline communication stats and experimental trade-offs cleanly
  useEffect(() => {
    let isMounted = true;
    fetchFederatedCommunication()
      .then((res) => { if (isMounted) setCommData(res); })
      .catch((err) => { if (isMounted) setError(err.message || 'Failed to connect to backend communication service.'); });

    fetchPhase9Experiments()
      .then((res) => { if (isMounted) setPhase9Experiments(res); })
      .catch(() => {});
    fetchPhase9Tradeoff()
      .then((res) => { if (isMounted) setPhase9Tradeoff(res); })
      .catch(() => {});
    fetchPhase9ClientValues()
      .then((res) => { if (isMounted) setClientValues(res); })
      .catch(() => {});
    fetchNetworkAccountingStatus()
      .then((res) => { if (isMounted) setAccountingStatus(res); })
      .catch(() => {});
    fetchNetworkAccountingReport()
      .then((res) => { if (isMounted) setAccountingReport(res); })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Update selection budget when active strategy changes
  useEffect(() => {
    fetchPhase9Selection(activeStrategyObj.budgetKey)
      .then(setPhase9Selection)
      .catch(() => {});
  }, [activeStrategyObj.budgetKey]);

  // Load rounds history for selected technical policy
  useEffect(() => {
    if (activeHistoryPolicy) {
      fetchPhase9Rounds(activeHistoryPolicy)
        .then(setRoundsHistory)
        .catch(() => {});
    }
  }, [activeHistoryPolicy]);

  return (
    <div className="space-y-6 pb-12">

      {/* ==================================================================== */}
      {/* 1. CINEMATIC HEADER STRIP                                            */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-5 lg:p-6 shadow-xs dark:shadow-md transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-[#F5F8FC] tracking-tight">
                Communication Intelligence
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B8C7D8] font-medium max-w-2xl">
              Adaptive sensor querying and selective federated weight synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Secondary Experimental Toggle: Accounting View */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0E2438] border border-slate-200 dark:border-[#17364E] text-xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-[#8295A8] uppercase tracking-wider px-2">
                Accounting View:
              </span>
              <button
                type="button"
                onClick={() => setAccountingView('APPLICATION_PAYLOAD')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  accountingView === 'APPLICATION_PAYLOAD'
                    ? 'bg-white dark:bg-[#071727] text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-cyan-500/30 font-bold'
                    : 'text-slate-600 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Application Payload
              </button>
              <button
                type="button"
                disabled={!accountingStatus?.artifactExists}
                onClick={() => setAccountingView('MEASURED_NETWORK_BYTES')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  !accountingStatus?.artifactExists
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : accountingView === 'MEASURED_NETWORK_BYTES'
                    ? 'bg-white dark:bg-[#071727] text-purple-700 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-purple-500/30 font-bold'
                    : 'text-slate-600 dark:text-[#BACCDA] hover:text-slate-900 dark:hover:text-white'
                }`}
                title={
                  accountingStatus?.artifactExists
                    ? "Controlled Network Transfer Bytes measured on localhost (127.0.0.1) TCP sockets"
                    : "Benchmark artifact not available"
                }
              >
                <span>Measured Network Bytes</span>
                {accountingStatus?.artifactExists && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono font-bold border border-purple-500/20">
                    Local Test
                  </span>
                )}
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-blue-500/10 text-blue-700 dark:text-cyan-400 border border-blue-500/30">
              <Clock className="w-3.5 h-3.5" />
              Replay: {timestampStr ? timestampStr.substring(0, 16) : 'Active'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Selective Optimization Active
            </span>
          </div>
        </div>
      </div>

      {/* Measured Network Bytes Notice Banner */}
      {isMeasuredMode && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold">Controlled Network Transfer Bytes — Local Test Active:</span>{' '}
              <span className="text-purple-700 dark:text-purple-300">
                Measures total TCP stream wire bytes (HTTP request lines, headers, payload bodies, and connection framing) between simulated FL clients and server on 127.0.0.1 (+0.298% transport overhead).
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-purple-700 dark:text-purple-300 shrink-0 bg-white/70 dark:bg-purple-950/70 px-2.5 py-1 rounded-lg border border-purple-500/30">
            Baseline: {(effectiveBaselineTotalBytes / 1000000).toFixed(2)} MB • {activeStrategyObj.shortName}: {(activeStrategyObj.totalBytes / 1000000).toFixed(2)} MB (-{activeStrategyObj.reductionPercent}%)
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold">Communication Service Notice:</span> {error}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* A. Baseline Communication Accounting & Architecture Hero Flow        */}
      {/* ==================================================================== */}
      <CommunicationHeroFlow
        activeStrategy={activeStrategy}
        onSelectStrategy={setActiveStrategy}
        baselineTotalBytes={effectiveBaselineTotalBytes}
        selectedTotalBytes={activeStrategyObj.totalBytes}
        reductionPercent={activeStrategyObj.reductionPercent}
        selectedStrategyName={activeStrategyObj.name}
        isBestTradeoff={activeStrategyObj.isBestTradeoff}
      />

      {/* ==================================================================== */}
      {/* B. COMPACT PAYLOAD KPI ROW (EXACTLY 4 COMPACT CARDS)                 */}
      {/* ==================================================================== */}
      <CommunicationSummaryKPIs />

      {/* ==================================================================== */}
      {/* C. CORE ANALYTICS ROW (BREAKDOWN DONUT + ACCURACY TRADE-OFF)          */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <CommunicationBreakdownDonut
          totalBytes={activeStrategyObj.totalBytes}
          strategyName={activeStrategyObj.name}
        />
        <SavingsVsPredictionQualityChart
          activeStrategy={activeStrategy}
          onSelectStrategy={setActiveStrategy}
        />
      </div>

      {/* ==================================================================== */}
      {/* D. PARTICIPATION STRATEGY COMPARISON                                 */}
      {/* ==================================================================== */}
      <ParticipationStrategyComparison
        activeStrategy={activeStrategy}
        onSelectStrategy={setActiveStrategy}
      />

      {/* ==================================================================== */}
      {/* E. REGIONAL COMMUNICATION + RECENT EVENTS                            */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col min-h-[350px]">
          <PerRegionCommunicationTable
            activeStrategy={activeStrategy}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col min-h-[350px]">
          <RecentCommunicationEvents />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* F. COLLAPSIBLE TECHNICAL DETAILS & RESEARCH AUDITS                   */}
      {/* ==================================================================== */}
      <CommunicationTechnicalDetails
        clientValues={clientValues}
        phase9Selection={phase9Selection}
        roundsHistory={roundsHistory}
        activeHistoryPolicy={activeHistoryPolicy}
        onSelectHistoryPolicy={setActiveHistoryPolicy}
        commData={commData}
        phase9Experiments={phase9Experiments}
      />

    </div>
  );
}
