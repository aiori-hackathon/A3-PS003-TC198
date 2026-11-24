import React, { useRef, useEffect } from 'react';
import { Map as MapIcon, Search, X, Check } from 'lucide-react';
import sensorLocationNames from '../../data/sensor_location_names.json';

/**
 * TrafficNetworkHeader Component
 * Operations title banner with integrated fast autocomplete sensor search input.
 * Searches across sensor ID, region, and authentic Caltrans PeMS corridor names.
 */
export default function TrafficNetworkHeader({
  searchQuery,
  setSearchQuery,
  searchOpen,
  setSearchOpen,
  searchResults,
  selectedSensor,
  onSelectSensor
}) {
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchOpen]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] p-4 lg:p-5 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Left: Brand Title & Replay Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-600 dark:text-cyan-400 border border-blue-500/20 shrink-0">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-[#F5F8FC] tracking-tight">
                Traffic Network
              </h1>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#CBDDF0] mt-0.5 font-medium">
              Metropolitan Freeway Corridor &bull; 207 Connected Sensors
            </p>
          </div>
        </div>

        {/* Right: Real Sensor Search Input */}
        <div className="relative w-full sm:w-80 lg:w-96" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#8295A8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sensor (e.g. 773869), corridor, region..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-slate-50 dark:bg-[#0B2033] border border-slate-200 dark:border-[#17364E] text-xs text-slate-900 dark:text-[#F5F8FC] placeholder-slate-400 dark:placeholder-[#647C92] focus:outline-hidden focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                type="button"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute right-0 mt-1.5 w-full bg-white dark:bg-[#071727] border border-slate-200 dark:border-[#17364E] rounded-xl shadow-2xl p-1 z-50 divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map(s => {
                const sid = String(s.sensorId || s.id);
                const locName = sensorLocationNames[sid]?.locationName || s.locationName || '';
                const isCur = String(selectedSensor?.sensorId || selectedSensor?.id) === sid;
                return (
                  <button
                    key={`search-${sid}`}
                    onClick={() => {
                      onSelectSensor(s);
                      setSearchOpen(false);
                    }}
                    className="w-full p-2 text-left text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-[#0B2033] flex items-center justify-between transition-colors cursor-pointer"
                    type="button"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">{sid}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#8295A8] shrink-0 font-mono">{s.regionId}</span>
                      {locName && (
                        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold truncate hidden sm:inline">
                          • {locName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {s.speed !== null && s.speed !== undefined ? `${Number(s.speed).toFixed(1)} mph` : '--'}
                      </span>
                      {isCur && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
