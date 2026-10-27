import React from 'react';

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = ""
}) {
  return (
    <div className={`bg-white dark:bg-[#081827] border border-slate-200 dark:border-[#17364E] rounded-xl p-4 sm:p-5 shadow-xs dark:shadow-md dark:shadow-black/25 flex flex-col transition-colors ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100 dark:border-[#17364E]/80">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-[16px] font-semibold text-slate-900 dark:text-[#F5F8FC] tracking-normal leading-snug">{title}</h3>
              {subtitle && <p className="text-[13px] text-slate-500 dark:text-[#B8C7D8] font-normal leading-normal mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
