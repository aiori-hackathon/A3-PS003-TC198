import React from 'react';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon
}) {
  const base = "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed tracking-normal whitespace-nowrap shrink-0 leading-none";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm shadow-blue-600/30",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-[#102438] dark:hover:bg-[#16334e] dark:text-[#F5F8FC] dark:border-[#1D4566]",
    outline: "bg-transparent border border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-semibold",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-[#0E2438] text-slate-700 dark:text-[#B8C7D8]",
    cyan: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30"
  };

  const sizes = {
    xs: "h-7 px-2.5 text-xs gap-1 font-semibold",
    sm: "h-8 px-3 text-xs gap-1.5 font-semibold",
    md: "h-9 px-4 text-sm gap-2 font-semibold",
    lg: "h-10 px-5 text-sm gap-2 font-semibold"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
