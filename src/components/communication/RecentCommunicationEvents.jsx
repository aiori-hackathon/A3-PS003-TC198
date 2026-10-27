import React from 'react';
import { Clock } from 'lucide-react';
import { useReplay } from '../../context/ReplayContext';

export default function RecentCommunicationEvents() {
  const { timeIndex, timestampStr } = useReplay();

  // Derive synchronized event timestamps relative to active replay window
  const baseDate = timestampStr ? new Date(timestampStr.replace(' ', 'T') + 'Z') : new Date('2012-03-01T00:00:00Z');
  const formatOffset = (minusMinutes) => {
    const d = new Date(baseDate.getTime() - minusMinutes * 60 * 1000);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  };

  const events = [
    {
      id: 'e1',
      time: formatOffset(0),
      type: 'EVIDENCE',
      title: 'Detailed Evidence Batch',
      target: 'Sensor 773869 (Region C)',
      payload: '~4.2 KB',
      reason: 'Residual uncertainty exceeded dynamic query threshold (u > 2.8)',
      dotColor: 'bg-emerald-500',
      badgeClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'e2',
      time: formatOffset(5),
      type: 'UPLOAD',
      title: 'Regional Model Upload',
      target: 'Region B (South-East)',
      payload: '110,271 B',
      reason: 'Regional client selected via CCV score ranking (0.2847 utility)',
      dotColor: 'bg-purple-500',
      badgeClass: 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      id: 'e3',
      time: formatOffset(5),
      type: 'UPLOAD',
      title: 'Regional Model Upload',
      target: 'Region C (Central-West)',
      payload: '110,271 B',
      reason: 'High arterial traffic drift prioritized for Round 13 model sync',
      dotColor: 'bg-purple-500',
      badgeClass: 'text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      id: 'e4',
      time: formatOffset(5),
      type: 'DEFERRED',
      title: 'Regional Client Deferred',
      target: 'Region A & Region D',
      payload: '0 B',
      reason: '50% budget enforcement; client transmission deferred to conserve payload',
      dotColor: 'bg-amber-500',
      badgeClass: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'e5',
      time: formatOffset(10),
      type: 'DOWNLOAD',
      title: 'Global Model Download',
      target: 'All 4 Regional Clients',
      payload: '110,271 B',
      reason: 'Aggregated FedAvg checkpoint broadcast to regional edge RSUs',
      dotColor: 'bg-blue-500',
      badgeClass: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      id: 'e6',
      time: formatOffset(20),
      type: 'HEARTBEAT',
      title: 'Compact Telemetry Polled',
      target: 'Sensor 767541 (Region C)',
      payload: '187 B',
      reason: 'Spatial speed consistency verification with neighbor node',
      dotColor: 'bg-cyan-500',
      badgeClass: 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    }
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md p-5 transition-colors justify-between min-h-[350px]">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
                Recent Communication Events
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#CBDDF0] mt-1 font-medium">
                Historical telemetry evidence queries &amp; federated exchange log
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
            Historical Stream &bull; Active
          </span>
        </div>
      </div>

      {/* Timeline Feed Container */}
      <div className="flex-1 my-2 relative space-y-2.5 overflow-y-auto min-h-0 pr-1">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-[44px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-[#17364E]/80" />

        {events.map((ev) => (
          <div key={ev.id} className="relative flex items-start gap-2.5 group text-xs">
            {/* Time */}
            <span className="w-8 pt-0.5 text-right font-mono text-[10px] text-slate-400 dark:text-[#7F96AA] shrink-0 font-medium">
              {ev.time}
            </span>

            {/* Timeline Dot Node */}
            <div className="relative z-10 pt-1 shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${ev.dotColor} ring-4 ring-white dark:ring-[#071727] block transition-transform group-hover:scale-125`} />
            </div>

            {/* Event Content Card */}
            <div className="flex-1 min-w-0 p-2.5 rounded-xl bg-slate-50 dark:bg-[#091D33]/60 border border-slate-100 dark:border-[#17364E]/60 hover:border-slate-200 dark:hover:border-[#1E4B72] transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {ev.title}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${ev.badgeClass}`}>
                    {ev.type}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-700 dark:text-[#82C3F0] shrink-0 text-[11px]">
                  {ev.payload}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1 text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {ev.target}
                </span>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-[#8CA3B8] mt-0.5 leading-tight">
                {ev.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Callout */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-[#A3B8CC] font-mono">
        <span>Telemetry Window: {timestampStr ? timestampStr.substring(0, 16) : 'Active'} &bull; METR-LA Grid</span>
        <span>High-fidelity on-demand telemetry</span>
      </div>

    </div>
  );
}
