import React from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Clock,
  Gauge
} from 'lucide-react';
import { useReplay } from '../../context/ReplayContext';

/**
 * Reusable Replay Timeline Scrubber & Playback Controls.
 * Synchronizes with ReplayContext across 34,272 METR-LA timesteps.
 */
export default function ReplayTimeline({ className = '' }) {
  const {
    timeIndex,
    maxTimeSteps,
    timestampStr,
    timeSemantics,
    isPlaying,
    replaySpeed,
    setReplaySpeed,
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStep
  } = useReplay();

  const progressPercent = Math.min(100, Math.max(0, (timeIndex / (maxTimeSteps - 1)) * 100));

  return (
    <div className={`p-4 rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-sm select-none ${className}`}>
      {/* Header Info Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                {timestampStr || '2012-03-01 00:00:00'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#0E2438] text-slate-700 dark:text-[#82C3F0] border border-slate-200 dark:border-[#1A4268]">
                {timeSemantics?.dayName || 'Thursday'} &bull; {timeSemantics?.timeOfDay || 'Midnight'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#8CA3B8] mt-0.5">
              Historical Replay &bull; Timestep {timeIndex.toLocaleString()} / {(maxTimeSteps - 1).toLocaleString()} (5-min resolution)
            </p>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 dark:bg-[#091D33] p-1 rounded-xl border border-slate-200 dark:border-[#17364E]">
          <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setReplaySpeed(spd)}
              aria-label={`Set playback speed to ${spd}x`}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                replaySpeed === spd
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#8295A8] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrubber Slider */}
      <div className="space-y-1.5 mb-3">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={maxTimeSteps - 1}
            value={timeIndex}
            onChange={(e) => jumpToStep(parseInt(e.target.value, 10))}
            aria-label="Seek historical replay timeline"
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-[#0E2438] accent-blue-600 focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-[#64748B]">
          <span>2012-03-01 (Start)</span>
          <span>{progressPercent.toFixed(1)}% Completed</span>
          <span>2012-06-27 (End)</span>
        </div>
      </div>

      {/* Playback Buttons Row */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#17364E]/60">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
            className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={stepBackward}
            aria-label="Step backward 5 minutes"
            className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0E2438] dark:hover:bg-[#15344F] text-slate-700 dark:text-[#CBDDF0] flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">-5m</span>
          </button>

          <button
            type="button"
            onClick={stepForward}
            aria-label="Step forward 5 minutes"
            className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0E2438] dark:hover:bg-[#15344F] text-slate-700 dark:text-[#CBDDF0] flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">+5m</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => jumpToStep(0)}
            aria-label="Jump to start of timeline"
            title="Reset to 2012-03-01 00:00:00"
            className="h-8 px-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E2438] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">119 Days Total Observation</span>
        </div>
      </div>
    </div>
  );
}
