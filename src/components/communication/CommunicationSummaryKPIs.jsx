import React from 'react';
import { Radio, Layers, ArrowUp, ArrowDown } from 'lucide-react';

export default function CommunicationSummaryKPIs() {
  const cards = [
    {
      id: "compact-query",
      title: "Compact Query",
      value: "187 B",
      unit: "per request",
      icon: Radio,
      variant: "cyan",
      subtext: "Serialized compact query",
      tooltip: "4 float64 fields • 32 B raw numeric telemetry",
      accentDot: "bg-cyan-500",
      iconBg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20"
    },
    {
      id: "detailed-query",
      title: "Detailed Query",
      value: "~4.2 KB",
      unit: "per batch proxy",
      icon: Layers,
      variant: "blue",
      subtext: "Detailed telemetry query proxy",
      tooltip: "12-step historical window batch (4,301 B proxy)",
      accentDot: "bg-blue-500",
      iconBg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    },
    {
      id: "fl-upload",
      title: "Federated Upload",
      value: "110,271 B",
      unit: "per client / round",
      icon: ArrowUp,
      variant: "purple",
      subtext: "Serialized model state",
      tooltip: "PyTorch state dict (26,596 FP32 parameters) • 106,384 B raw tensor",
      accentDot: "bg-purple-500",
      iconBg: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
    },
    {
      id: "fl-download",
      title: "Federated Download",
      value: "110,271 B",
      unit: "per client / round",
      icon: ArrowDown,
      variant: "emerald",
      subtext: "Serialized model state",
      tooltip: "Global aggregated state dict broadcast • 106,384 B raw tensor",
      accentDot: "bg-emerald-500",
      iconBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-2xl p-4 lg:p-5 bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] shadow-xs hover:shadow-md transition-all group relative flex flex-col justify-between"
            title={card.tooltip}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-[#8295A8] tracking-wider uppercase truncate">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.iconBg} shrink-0 transition-transform group-hover:scale-105`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <div className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-xs font-medium text-slate-600 dark:text-[#B8C7D8] truncate">
                {card.subtext}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-[#647C92] font-mono shrink-0 ml-1">
                {card.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
