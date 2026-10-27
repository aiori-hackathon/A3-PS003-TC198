import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';

export default function PerRegionCommunicationTable({
  activeStrategy = 'FIFTY'
}) {
  // Strategy-dependent participation rounds
  const participationRounds = {
    FULL: { A: 13, B: 13, C: 13, D: 13, label: '13 / 13 (100%)' },
    SEVENTY_FIVE: { A: 7, B: 13, C: 13, D: 6, label: 'Selective' },
    FIFTY: { A: 6, B: 7, C: 7, D: 6, label: 'Balanced' },
    TWENTY_FIVE: { A: 3, B: 4, C: 4, D: 2, label: 'Constrained' }
  }[activeStrategy] || { A: 6, B: 7, C: 7, D: 6, label: 'Balanced' };

  const regions = [
    {
      id: 'REGION_A',
      name: 'Region A',
      subname: 'North-East Freeway Arterials',
      colorDot: 'bg-blue-500',
      sensors: 48,
      share: '23.2%',
      weight: '0.2291',
      activeRounds: participationRounds.A,
      totalRounds: 13,
      payloadPerActiveRound: 220542, // 110,271 UL + 110,271 DL
      infoDebt: '0 rnds',
      starvationStatus: 'Active & Fair'
    },
    {
      id: 'REGION_B',
      name: 'Region B',
      subname: 'South-East Freeways (I-5, CA-60)',
      colorDot: 'bg-orange-500',
      sensors: 57,
      share: '27.5%',
      weight: '0.2771',
      activeRounds: participationRounds.B,
      totalRounds: 13,
      payloadPerActiveRound: 220542,
      infoDebt: '0 rnds',
      starvationStatus: 'Active & Fair'
    },
    {
      id: 'REGION_C',
      name: 'Region C',
      subname: 'Central-West Freeways (US-101, I-110)',
      colorDot: 'bg-purple-500',
      sensors: 58,
      share: '28.0%',
      weight: '0.2795',
      activeRounds: participationRounds.C,
      totalRounds: 13,
      payloadPerActiveRound: 220542,
      infoDebt: '0 rnds',
      starvationStatus: 'Active & Fair'
    },
    {
      id: 'REGION_D',
      name: 'Region D',
      subname: 'North-West Corridor (I-405)',
      colorDot: 'bg-emerald-500',
      sensors: 44,
      share: '21.3%',
      weight: '0.2144',
      activeRounds: participationRounds.D,
      totalRounds: 13,
      payloadPerActiveRound: 220542,
      infoDebt: '0 rnds',
      starvationStatus: 'Active & Fair'
    }
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs dark:shadow-md p-5 transition-colors justify-between min-h-[350px]">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F8FC] leading-none">
                Per-Region Communication
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8295A8] mt-1 font-medium">
                Operational participation and model exchange across 4 regional partitions
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0B2033] text-slate-600 dark:text-[#8295A8] border border-slate-200 dark:border-[#17364E]">
            207 METR-LA SENSORS
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-[#17364E]/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-[#04101A] text-slate-600 dark:text-[#7F96AA] uppercase text-[10px] border-b border-slate-200 dark:border-[#17364E]">
            <tr>
              <th className="py-2.5 px-3">Region</th>
              <th className="py-2.5 px-3 text-center">Sensors</th>
              <th className="py-2.5 px-3 text-center">Participation</th>
              <th className="py-2.5 px-3 text-right">Model Payload / Rnd</th>
              <th className="py-2.5 px-3 text-right">Cumulative Exchange</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60 bg-white dark:bg-[#06111D]">
            {regions.map((reg) => {
              const cumulativeExchange = reg.activeRounds * reg.payloadPerActiveRound;
              const formattedCumulative = (cumulativeExchange / 1000000).toFixed(2) + " MB";

              return (
                <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-[#0B2033]/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${reg.colorDot} shrink-0`} />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {reg.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#7F96AA] truncate max-w-[130px]">
                          {reg.subname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-700 dark:text-[#BCD0E2]">
                    <span className="font-bold">{reg.sensors}</span>
                    <span className="text-[10px] text-slate-400 block">({reg.share})</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-white">
                    {reg.activeRounds} / {reg.totalRounds} <span className="text-[10px] text-slate-400 font-normal">rnds</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-[#BCD0E2]">
                    220.5 KB
                    <span className="text-[9px] text-slate-400 block font-normal">(UL+DL)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-cyan-700 dark:text-cyan-400">
                    {formattedCumulative}
                    <span className="text-[9px] text-slate-400 block font-normal">({cumulativeExchange.toLocaleString('en-US')} B)</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Fair Schedule</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Callout */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        <span>Information Debt: 0 rnds maximum skip</span>
        <span>Guaranteed starvation-free (&lambda; = 0.15)</span>
      </div>

    </div>
  );
}
