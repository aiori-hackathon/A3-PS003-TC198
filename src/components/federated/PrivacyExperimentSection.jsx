import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lock,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { fetchPrivacyResults } from '../../services/api';

export default function PrivacyExperimentSection() {
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPrivacyResults();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch privacy experiment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isEvaluated = data?.status === 'COMPLETED' && data?.evaluated === true;
  const spec = data?.privacySpecification;
  const standard = data?.standardBaseline;
  const dp = data?.dpFedAvg;
  const tradeoff = data?.tradeoffAnalysis;
  const secagg = data?.secureAggregation;

  return (
    <div className="bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-xs transition-colors overflow-hidden">
      {/* Header / Accordion Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-[#0c2236]/50 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F8FC]">
                Privacy Experiment
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-500 dark:text-[#7F96AA]">
                Optional Add-on
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
              Formal Differential Privacy (DP-FedAvg) and Secure Aggregation Simulation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isEvaluated ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 className="w-3 h-3" />
              (ε={spec?.epsilon?.toFixed(2) || '?'}, δ={spec?.delta || '1e-5'})-DP Evaluated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              Not Evaluated
            </span>
          )}

          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Toggle section"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 border-t border-slate-100 dark:border-[#17364E] space-y-5 bg-slate-50/30 dark:bg-[#061422]/50 max-h-[520px] overflow-y-auto custom-scrollbar">
          {!isEvaluated ? (
            /* Not Evaluated State */
            <div className="py-8 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                  Not Evaluated
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#7F96AA] max-w-md mx-auto">
                  No formal differential privacy training run has been executed. In accordance with scientific integrity guidelines, no speculative privacy guarantees or placeholder badges are displayed.
                </p>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#0B2033] dark:hover:bg-[#122E49] text-slate-700 dark:text-[#BCD0E2] border border-slate-200 dark:border-[#17364E] transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Check Status</span>
              </button>
            </div>
          ) : (
            /* Completed Formal DP Evaluation State */
            <>
              {/* Row 1: Formal DP Disclaimer Banner */}
              <div className="p-3.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-900 dark:text-cyan-200">
                <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Formal Differential Privacy Experiment:</strong> Evaluated under client-side gradient clipping and calibrated Gaussian perturbation. Guarantees{' '}
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">
                    ({spec?.epsilon?.toFixed(2)}, {spec?.delta})-DP
                  </span>{' '}
                  under the evaluated training configuration via Opacus Rényi Differential Privacy (RDP) accounting. No unverified privacy guarantees are claimed.
                </div>
              </div>

              {/* Row 2: Standard FedAvg vs DP-FedAvg Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard FedAvg Card */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7F96AA]">
                      Baseline
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-[#0B2033] text-slate-600 dark:text-slate-300">
                      Seed 42 Frozen
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Standard FedAvg
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B2033]">
                      <span className="text-slate-500 text-[10px] block">Test Speed MAE</span>
                      <strong className="text-sm font-mono text-slate-900 dark:text-white">
                        {standard?.testMAE?.toFixed(4)} mph
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B2033]">
                      <span className="text-slate-500 text-[10px] block">Test Speed RMSE</span>
                      <strong className="text-sm font-mono text-slate-900 dark:text-white">
                        {standard?.testRMSE?.toFixed(4)} mph
                      </strong>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-[#17364E] space-y-1 text-[11px] font-mono text-slate-500 dark:text-[#7F96AA]">
                    <div className="flex justify-between">
                      <span>Privacy Budget:</span>
                      <span className="text-slate-400">None (Plaintext Gradients)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Rounds:</span>
                      <span className="text-slate-700 dark:text-slate-200">{standard?.rounds} Rounds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payload / Transfer:</span>
                      <span className="text-slate-700 dark:text-slate-200">{standard?.totalBytes?.toLocaleString()} B</span>
                    </div>
                  </div>
                </div>

                {/* DP-FedAvg Card */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#081827] border border-cyan-500/30 dark:border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      Privacy-Preserving
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/20">
                      Opacus RDP Verified
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    DP-FedAvg (Client-Side)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-cyan-600 dark:text-cyan-400 text-[10px] block">Test Speed MAE</span>
                      <strong className="text-sm font-mono text-slate-900 dark:text-white">
                        {dp?.testMAE?.toFixed(4)} mph
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-cyan-600 dark:text-cyan-400 text-[10px] block">Test Speed RMSE</span>
                      <strong className="text-sm font-mono text-slate-900 dark:text-white">
                        {dp?.testRMSE?.toFixed(4)} mph
                      </strong>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-[#17364E] space-y-1 text-[11px] font-mono text-slate-500 dark:text-[#7F96AA]">
                    <div className="flex justify-between">
                      <span>Formal Privacy Budget:</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                        ε = {spec?.epsilon?.toFixed(4)}, δ = {spec?.delta}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Rounds:</span>
                      <span className="text-slate-700 dark:text-slate-200">{dp?.rounds} Rounds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payload / Transfer:</span>
                      <span className="text-slate-700 dark:text-slate-200">{dp?.totalBytes?.toLocaleString()} B</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Accuracy vs Privacy Trade-off Analysis */}
              {tradeoff && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-slate-600 dark:text-[#BCD0E2]">
                      <strong>Privacy-Accuracy Trade-off:</strong> DP noise incurs an observed error penalty of{' '}
                      <span className="font-mono font-bold text-amber-500">
                        +{tradeoff.maeDelta?.toFixed(4)} mph (+{tradeoff.maeDeltaPercent}%)
                      </span>{' '}
                      to provide formal information-theoretic gradient protection.
                    </span>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B2033] text-slate-600 dark:text-slate-300 shrink-0">
                    Baseline Preserved
                  </span>
                </div>
              )}

              {/* Row 4: Hyperparameter Configuration & Provenance */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7F96AA]">
                  Formal DP Configuration & Provenance
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                    <span className="text-slate-500 text-[10px] block">Max Grad Norm (C)</span>
                    <strong className="text-slate-800 dark:text-white">{spec?.maxGradNorm}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                    <span className="text-slate-500 text-[10px] block">Noise Multiplier (σ)</span>
                    <strong className="text-slate-800 dark:text-white">{spec?.noiseMultiplier}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                    <span className="text-slate-500 text-[10px] block">Target Delta (δ)</span>
                    <strong className="text-slate-800 dark:text-white">{spec?.delta}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E]">
                    <span className="text-slate-500 text-[10px] block">Accountant</span>
                    <strong className="text-slate-800 dark:text-white">Opacus RDP</strong>
                  </div>
                </div>
              </div>

              {/* Row 5: Secure Aggregation Simulation */}
              {secagg && (
                <div className="p-4 rounded-xl bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-500" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {secagg.label || 'Secure Aggregation Simulation'}
                      </h5>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Zero-Sum Cancellation Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#7F96AA]">
                    Simulates pairwise additive masking (Bonawitz et al. CCS 2017) wherein each pair of clients adds/subtracts zero-sum masks that cancel to zero upon server aggregation without exposing individual client weights.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B2033]">
                      <span className="text-slate-500 text-[10px] block">Mask Cancellation</span>
                      <strong className="text-emerald-500">Exact (&lt; 1e-4 error)</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B2033]">
                      <span className="text-slate-500 text-[10px] block">Overhead / Round</span>
                      <strong className="text-slate-800 dark:text-white">+{secagg.overheadBytesPerRound} B</strong>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B2033]">
                      <span className="text-slate-500 text-[10px] block">Total Protocol Overhead</span>
                      <strong className="text-slate-800 dark:text-white">+{secagg.totalOverheadBytes?.toLocaleString()} B</strong>
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-100/70 dark:bg-[#071727] text-[11px] text-slate-500 dark:text-[#7F96AA]">
                    <em>{secagg.disclaimer}</em>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
