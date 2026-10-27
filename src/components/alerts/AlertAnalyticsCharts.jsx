import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';
import SectionCard from '../common/SectionCard';
import ScientificBadge from '../common/ScientificBadge';

const TREND_DATA = [
  { time: '00:00', alerts: 2, uncertainty: 1, drift: 1 },
  { time: '00:15', alerts: 4, uncertainty: 2, drift: 1 },
  { time: '00:30', alerts: 5, uncertainty: 2, drift: 2 },
  { time: '00:45', alerts: 8, uncertainty: 3, drift: 3 },
  { time: '01:00', alerts: 10, uncertainty: 3, drift: 4 }
];

const CATEGORY_COLORS = {
  'Uncertainty': '#a855f7',      // purple
  'Drift': '#f59e0b',            // amber
  'Spatial Disagreement': '#ef4444', // red/rose
  'Coverage Gap': '#ec4899',     // pink
  'Data Quality': '#64748b',     // slate
  'Evidence Query': '#06b6d4',   // cyan
  'Kinematic Check': '#10b981'   // emerald
};

export default function AlertAnalyticsCharts({ alerts = [] }) {
  // Compute category counts from actual active alerts
  const categoryCounts = alerts.reduce((acc, curr) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#3b82f6'
  }));

  const totalEvents = alerts.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* 1. Alert Trend Over Replay (7 cols) */}
      <div className="lg:col-span-7 flex flex-col">
        <SectionCard
          title="Temporal Alert Trend"
          subtitle="Cumulative anomaly alerts across 5-minute telemetry intervals"
          icon={TrendingUp}
          action={<ScientificBadge type="DERIVED" label="TEMPORAL SEQUENCE" size="xs" />}
          className="flex-1 flex flex-col"
        >
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#8295a8"
                    fontSize={11}
                    fontFamily="Inter, sans-serif"
                    tickLine={false}
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                  />
                  <YAxis
                    stroke="#8295a8"
                    fontSize={11}
                    width={36}
                    fontFamily="Inter, sans-serif"
                    tickLine={false}
                    axisLine={{ stroke: '#334155', strokeWidth: 0.5 }}
                    domain={[0, 'dataMax + 2']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#f8fafc'
                    }}
                    labelStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    name="Derived Alerts"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#alertGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#17364E] text-[11px] font-mono text-slate-600 dark:text-[#CBDDF0]">
              <span>Monitoring Window: 00:00 – 01:00</span>
              <span>Peak Frequency: <strong className="text-slate-900 dark:text-white">10 Alerts</strong></span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* 2. Alert Type Mix (5 cols) */}
      <div className="lg:col-span-5 flex flex-col">
        <SectionCard
          title="Alert Type Mix"
          subtitle="Proportional decomposition of active derived traffic conditions"
          icon={PieIcon}
          action={<ScientificBadge type="DERIVED" label="CATEGORY MIX" size="xs" />}
          className="flex-1 flex flex-col"
        >
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-center gap-4">
              {/* Donut Chart with Centered Count */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#f8fafc'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {totalEvents}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-tight text-slate-400">
                    Events
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1 text-[11px] font-mono flex-1 min-w-[130px]">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-1 text-slate-700 dark:text-[#B8C7D8]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#17364E] text-[11px] text-slate-500 dark:text-[#8295A8] flex items-center justify-between font-mono">
              <span>Categories Active: <strong>{pieData.length}</strong></span>
              <span>Primary: <strong>Uncertainty / Drift</strong></span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
