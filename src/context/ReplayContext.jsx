import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fetchHealth, fetchStreamingStatus, setStreamingProvider } from '../services/api';

const ReplayContext = createContext(null);

const MAX_STEPS = 34272; // METR-LA length (2012-03-01 to 2012-06-27 at 5-min intervals)
const BASE_TIMESTAMP = new Date('2012-03-01T00:00:00Z').getTime();

export function ReplayProvider({ children }) {
  const [timeIndex, setTimeIndex] = useState(0);
  const [selectedSensorId, setSelectedSensorId] = useState('767620');
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeedState] = useState(1); // Default 1x (Normal)

  const setReplaySpeed = useCallback((val) => {
    const num = Number(val);
    if ([0.5, 1, 2].includes(num)) {
      setReplaySpeedState(num);
    } else {
      setReplaySpeedState(1);
    }
  }, []);
  const [backendStatus, setBackendStatus] = useState('CONNECTED'); // CONNECTED or UNAVAILABLE
  const [dataSourceMode, setDataSourceModeState] = useState('historical'); // 'historical' (DEFAULT) or 'external_live'
  const [streamingStatus, setStreamingStatus] = useState(null);
  const [liveSourceNotice, setLiveSourceNotice] = useState(null);
  const timerRef = useRef(null);

  // Derive timestamp from timeIndex
  const currentTimestampMs = BASE_TIMESTAMP + timeIndex * 5 * 60 * 1000;
  const currentDate = new Date(currentTimestampMs);
  const timestampStr = currentDate.toISOString().replace('T', ' ').substring(0, 19);

  // Derive time semantics cleanly during render without cascading state updates
  const timeSemantics = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(currentTimestampMs);
    const hour = d.getUTCHours();
    const minute = d.getUTCMinutes();
    let tod = 'Night';
    if (hour >= 6 && hour < 12) tod = 'Morning';
    else if (hour >= 12 && hour < 17) tod = 'Afternoon';
    else if (hour >= 17 && hour < 21) tod = 'Evening';

    return {
      dayName: days[d.getUTCDay()],
      timeOfDay: tod,
      hour,
      minute
    };
  }, [currentTimestampMs]);

  // Periodic health & streaming check
  const checkHealth = useCallback(async () => {
    try {
      await fetchHealth();
      setBackendStatus('CONNECTED');
    } catch {
      setBackendStatus('UNAVAILABLE');
    }

    try {
      const s = await fetchStreamingStatus();
      setStreamingStatus(s);
    } catch {
      // streaming status fallback
    }
  }, []);

  const switchDataSource = useCallback(async (providerId) => {
    setLiveSourceNotice(null);
    if (providerId === 'historical') {
      try {
        await setStreamingProvider('historical');
      } catch {
        // ignore
      }
      setDataSourceModeState('historical');
      return { success: true };
    }

    if (providerId === 'external_live') {
      const isConfigured = streamingStatus?.providers?.external_live?.configured;
      if (!isConfigured) {
        setLiveSourceNotice('Live source unavailable: External streaming experiment is not configured. Server-side LIVE_TRAFFIC_API_KEY is required. Historical Replay remains the baseline.');
        setDataSourceModeState('historical');
        return { success: false, reason: 'unconfigured' };
      }
      try {
        await setStreamingProvider('external_live');
        setDataSourceModeState('external_live');
        return { success: true };
      } catch (err) {
        setLiveSourceNotice(`Live source unavailable: ${err.message || 'Connection failed'}. Historical Replay remains the active baseline.`);
        setDataSourceModeState('historical');
        return { success: false, reason: 'error' };
      }
    }
  }, [streamingStatus]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Auto-play timer loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(100, 1000 / replaySpeed);
      timerRef.current = setInterval(() => {
        setTimeIndex((prev) => {
          if (prev >= MAX_STEPS - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, replaySpeed]);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setTimeIndex((prev) => Math.min(MAX_STEPS - 1, prev + 1));
  }, []);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setTimeIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const jumpToStep = useCallback((step) => {
    setIsPlaying(false);
    setTimeIndex(Math.max(0, Math.min(MAX_STEPS - 1, step)));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <ReplayContext.Provider
      value={{
        timeIndex,
        setTimeIndex,
        selectedSensorId,
        setSelectedSensorId,
        maxTimeSteps: MAX_STEPS,
        timestampStr,
        timeSemantics,
        isPlaying,
        replaySpeed,
        setReplaySpeed,
        backendStatus,
        dataSourceMode,
        switchDataSource,
        streamingStatus,
        liveSourceNotice,
        clearLiveNotice: () => setLiveSourceNotice(null),
        togglePlay,
        stepForward,
        stepBackward,
        jumpToStep
      }}
    >
      {children}
    </ReplayContext.Provider>
  );
}

export function useReplay() {
  const context = useContext(ReplayContext);
  if (!context) {
    throw new Error('useReplay must be used within a ReplayProvider');
  }
  return context;
}
