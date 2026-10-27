import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  Map,
  TrendingUp,
  Cpu,
  Radio,
  Network,
  Bell,
  Menu,
  X,
  Database
} from 'lucide-react';
import { useReplay } from '../../context/ReplayContext';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { path: '/overview', label: 'Overview', icon: Activity },
  { path: '/network', label: 'Traffic Network', icon: Map },
  { path: '/predictions', label: 'Predictions', icon: TrendingUp },
  { path: '/decision', label: 'Decision Intelligence', icon: Cpu },
  { path: '/federated', label: 'Federated Learning', icon: Network },
  { path: '/communication', label: 'Communication', icon: Radio },
  { path: '/alerts', label: 'Alerts', icon: Bell }
];

export default function TopNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { backendStatus } = useReplay();
  const location = useLocation();

  // Close mobile navigation drawer and scroll to top whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.scrollTop = 0;
  };

  const isItemActive = (itemPath) => {
    const current = (location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
    if (itemPath === '/overview') {
      return current === '/' || current === '/overview';
    }
    if (itemPath === '/predictions') {
      return (
        current === '/predictions' ||
        current === '/prediction' ||
        current === '/forecast' ||
        current === '/forecasts'
      );
    }
    if (itemPath === '/network') {
      return (
        current === '/network' ||
        current === '/traffic-network' ||
        current === '/traffic'
      );
    }
    if (itemPath === '/decision') {
      return current === '/decision' || current === '/decisions';
    }
    if (itemPath === '/federated') {
      return current === '/federated' || current === '/federated-learning';
    }
    if (itemPath === '/alerts') {
      return current === '/alerts' || current === '/alert';
    }
    return current === itemPath;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#06111D] border-b border-slate-200 dark:border-[#17364E] transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <NavLink to="/overview" onClick={handleNavClick} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-[#06111D] rounded-[7px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-[#F5F8FC]">
                    TrafficPulse<span className="text-blue-500">-X</span>
                  </span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 font-bold leading-none">
                    v1.0
                  </span>
                </div>
                <span className="hidden 2xl:block text-[11.5px] text-slate-500 dark:text-[#8295A8] tracking-normal -mt-0.5 font-medium leading-tight">
                  Evidence-on-Demand Traffic Intelligence
                </span>
              </div>
            </NavLink>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <div className="hidden xl:flex items-center gap-0.5 2xl:gap-1 bg-slate-100/80 dark:bg-[#081827]/90 p-0.5 2xl:p-1 rounded-xl border border-slate-200/80 dark:border-[#17364E]/80 shrink">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-1 2xl:gap-1.5 px-2 2xl:px-3 py-1 2xl:py-1.5 rounded-lg text-xs 2xl:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap leading-normal ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40'
                      : 'text-slate-600 dark:text-[#B8C7D8] hover:text-slate-900 dark:hover:text-[#F5F8FC] hover:bg-slate-200/60 dark:hover:bg-[#102941]/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-[#8295A8]'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Controls: Backend Status, Theme Toggle, Mobile Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dataset Pill (visible only on wide screens) */}
            <div className="hidden 2xl:flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-slate-700 dark:text-[#B8C7D8] whitespace-nowrap shrink-0">
              <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Metro Traffic Grid</span>
            </div>

            {/* Backend Connectivity Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                backendStatus === 'CONNECTED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline">{backendStatus}</span>
            </div>

            <ThemeToggle />

            {/* Mobile / Tablet Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 dark:text-[#B8C7D8] hover:bg-slate-100 dark:hover:bg-[#0B2033] border border-transparent dark:border-[#17364E]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-[#17364E] py-3 space-y-1 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pb-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#B8C7D8] hover:bg-slate-100 dark:hover:bg-[#0B2033]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
