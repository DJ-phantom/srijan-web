"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Activity,
  Pause,
  Play,
  Clock,
  Sliders,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { useControlCenterContext } from "@/components/control-center/ControlCenterDataProvider";
import { TelemetryRecord } from "@/lib/api";
import MonitoringMainChart, {
  CHANNEL_CONFIGS,
  ChannelMeta,
} from "@/components/control-center/monitoring/MonitoringMainChart";

// Helper for calculating window statistics (Min, Avg, Max, StdDev, Range)
function calculateStats(values: number[]) {
  if (!values || values.length === 0) {
    return { min: 0, max: 0, avg: 0, stdDev: 0, range: 0 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = sum / values.length;

  const variance =
    values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const range = max - min;

  return { min, max, avg, stdDev, range };
}

// Micro Sparkline for Channel Selector Strip
function StripMicroSparkline({ data, valueKey }: { data: TelemetryRecord[]; valueKey: keyof TelemetryRecord }) {
  if (!data || data.length < 2) return <div className="w-12 h-3 opacity-30 bg-black/10 rounded-[1px]" />;
  const values = data.map((d) => (typeof d[valueKey] === "number" ? (d[valueKey] as number) : 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;
  const width = 48;
  const height = 12;

  const points = values
    .map((v, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80">
      <polyline
        fill="none"
        stroke="var(--text-charcoal)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function LiveMonitoringPage() {
  const {
    telemetry,
    telemetryHistory,
    lastUpdated,
    dataSource,
    streamCadence,
    fetchTelemetryHistory,
    activeAlerts,
  } = useControlCenterContext();

  // Active Selected Channel (Default: 02 VIBRATION)
  const [selectedChannelId, setSelectedChannelId] = useState<string>("vibration");

  // Secondary Comparison Channel (Optional)
  const [secondaryChannelId, setSecondaryChannelId] = useState<string | null>(null);

  // Time Window Selection: '60S' | '5M' | '8M'
  const [timeWindow, setTimeWindow] = useState<"60S" | "5M" | "8M">("60S");

  // Historical Telemetry Cache for 5M/8M windows
  const [history5m, setHistory5m] = useState<TelemetryRecord[] | null>(null);
  const [history8m, setHistory8m] = useState<TelemetryRecord[] | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Pause View State (Freezes visual updates while Provider continues polling)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const pausedDataRef = useRef<TelemetryRecord[] | null>(null);

  // Selected Channel Config
  const selectedChannel = useMemo(
    () => CHANNEL_CONFIGS.find((c) => c.id === selectedChannelId) || CHANNEL_CONFIGS[1],
    [selectedChannelId]
  );

  const secondaryChannel = useMemo(
    () => CHANNEL_CONFIGS.find((c) => c.id === secondaryChannelId) || null,
    [secondaryChannelId]
  );

  // Handle Time Window Change
  const handleWindowChange = async (win: "60S" | "5M" | "8M") => {
    setTimeWindow(win);
    if (win === "5M" && !history5m) {
      setIsLoadingHistory(true);
      const res = await fetchTelemetryHistory(300);
      if (res) setHistory5m([...res].reverse()); // DB is newest-first, reverse to chronological
      setIsLoadingHistory(false);
    } else if (win === "8M" && !history8m) {
      setIsLoadingHistory(true);
      const res = await fetchTelemetryHistory(500); // 500 max supported by FastAPI limit
      if (res) setHistory8m([...res].reverse());
      setIsLoadingHistory(false);
    }
  };

  // Determine Active Dataset for Charting
  const activeDataset: TelemetryRecord[] = useMemo(() => {
    if (isPaused && pausedDataRef.current) {
      return pausedDataRef.current;
    }
    if (timeWindow === "5M" && history5m) return history5m;
    if (timeWindow === "8M" && history8m) return history8m;
    return telemetryHistory.length > 0 ? telemetryHistory : [telemetry];
  }, [isPaused, timeWindow, history5m, history8m, telemetryHistory, telemetry]);

  // Handle Pause / Resume Toggle
  const togglePause = () => {
    if (!isPaused) {
      pausedDataRef.current = [...activeDataset];
      setIsPaused(true);
    } else {
      pausedDataRef.current = null;
      setIsPaused(false);
    }
  };

  // Current Signal Value & Rates
  const rawCurrentValue =
    typeof telemetry[selectedChannel.key] === "number"
      ? (telemetry[selectedChannel.key] as number)
      : 0;

  // Derive Tick Delta & Rate of Change
  const { tickDelta, rateOfChange, direction } = useMemo(() => {
    if (!telemetryHistory || telemetryHistory.length < 2) {
      return { tickDelta: 0, rateOfChange: 0, direction: "STABLE" };
    }
    const len = telemetryHistory.length;
    const latest = telemetryHistory[len - 1];
    const prev = telemetryHistory[len - 2];

    const val1 = typeof prev[selectedChannel.key] === "number" ? (prev[selectedChannel.key] as number) : 0;
    const val2 = typeof latest[selectedChannel.key] === "number" ? (latest[selectedChannel.key] as number) : 0;

    const delta = val2 - val1;
    let t1 = new Date(prev.timestamp).getTime();
    let t2 = new Date(latest.timestamp).getTime();
    let elapsed = (t2 - t1) / 1000;
    if (isNaN(elapsed) || elapsed <= 0) elapsed = 1.0;

    const rate = delta / elapsed;
    const dir = delta > 0.001 ? "RISING" : delta < -0.001 ? "FALLING" : "STABLE";

    return { tickDelta: delta, rateOfChange: rate, direction: dir };
  }, [telemetryHistory, selectedChannel.key]);

  // Window Statistics
  const visibleValues = useMemo(() => {
    return activeDataset.map((d) => (typeof d[selectedChannel.key] === "number" ? (d[selectedChannel.key] as number) : 0));
  }, [activeDataset, selectedChannel.key]);

  const stats = useMemo(() => calculateStats(visibleValues), [visibleValues]);

  // Current Channel Status Assessment
  const currentStatus = useMemo(() => {
    const val = rawCurrentValue;
    if (selectedChannel.type === "high") {
      if (val >= selectedChannel.crit) return "CRITICAL";
      if (val >= selectedChannel.warn) return "WARNING";
      return "NORMAL";
    } else if (selectedChannel.type === "low") {
      if (val <= selectedChannel.crit) return "CRITICAL";
      if (val <= selectedChannel.warn) return "WARNING";
      return "NORMAL";
    } else {
      // abs_high
      if (Math.abs(val) >= selectedChannel.crit) return "CRITICAL";
      if (Math.abs(val) >= selectedChannel.warn) return "WARNING";
      return "NORMAL";
    }
  }, [rawCurrentValue, selectedChannel]);

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. PAGE HEADER + ENGINEERING METADATA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[var(--border-light)]/50 pb-3 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // MONITORING
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5 uppercase">
            CONVEYOR BC-01 / SIX-CHANNEL CONDITION TELEMETRY
          </h1>
          <p className="text-[11px] font-sans text-[var(--text-graphite-muted)]">
            Live inspection of six monitored operating signals with threshold context and short-term trend analysis.
          </p>
        </div>

        {/* Engineering Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-[9.5px]">
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            SOURCE: <strong className="text-[var(--text-charcoal)]">{dataSource}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            STREAM: <strong className="text-[var(--text-charcoal)]">{streamCadence}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            LAST SAMPLE: <strong className="text-[var(--text-charcoal)]">{lastUpdated}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 font-bold uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            BACKEND: CONNECTED
          </span>
        </div>
      </div>

      {/* 2. SIX-CHANNEL SELECTOR STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono">
        {CHANNEL_CONFIGS.map((ch) => {
          const isSelected = ch.id === selectedChannelId;
          const val = typeof telemetry[ch.key] === "number" ? (telemetry[ch.key] as number) : 0;
          const formatted =
            ch.key === "alignment" && val > 0 ? `+${val.toFixed(ch.decimals)}` : val.toFixed(ch.decimals);

          // Status calculation for cell indicator dot
          let chStatus = "NORMAL";
          if (ch.type === "high") {
            if (val >= ch.crit) chStatus = "CRITICAL";
            else if (val >= ch.warn) chStatus = "WARNING";
          } else if (ch.type === "low") {
            if (val <= ch.crit) chStatus = "CRITICAL";
            else if (val <= ch.warn) chStatus = "WARNING";
          } else {
            if (Math.abs(val) >= ch.crit) chStatus = "CRITICAL";
            else if (Math.abs(val) >= ch.warn) chStatus = "WARNING";
          }

          return (
            <button
              key={ch.id}
              onClick={() => setSelectedChannelId(ch.id)}
              className={`p-2.5 rounded-[2px] text-left transition-all duration-150 flex flex-col justify-between space-y-1.5 cursor-pointer ${
                isSelected
                  ? "bg-white border-2 border-[var(--accent-copper)] shadow-xs"
                  : "bg-white/80 border border-[var(--border-light)]/60 hover:bg-white hover:border-[var(--border-light)]"
              }`}
            >
              <div className="flex items-center justify-between text-[9px]">
                <span className={`font-bold tracking-wider ${isSelected ? "text-[var(--accent-copper)]" : "text-[var(--text-graphite-muted)]"}`}>
                  {ch.shortName}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    chStatus === "CRITICAL"
                      ? "bg-red-600 animate-ping"
                      : chStatus === "WARNING"
                      ? "bg-amber-600"
                      : "bg-emerald-600"
                  }`}
                />
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-base font-bold text-[var(--text-charcoal)] leading-none">
                    {formatted}
                  </span>
                  <span className="text-[9px] text-[var(--text-graphite-muted)] font-semibold">{ch.unit}</span>
                </div>
                <StripMicroSparkline data={telemetryHistory} valueKey={ch.key} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. MIDDLE WORKSPACE: DEEP INSPECTION (30%) + MAIN CHART TRAJECTORY (70%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column (30%): Active Channel Deep Inspection & Threshold Rules */}
        <div className="lg:col-span-4 space-y-3 font-mono">
          {/* Active Channel Identity & Live Snapshot Card */}
          <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
              <div>
                <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
                  // CHANNEL INSPECTION
                </span>
                <h3 className="font-heading text-base font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                  {selectedChannel.name}
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wide ${
                  currentStatus === "CRITICAL"
                    ? "bg-red-600 text-white"
                    : currentStatus === "WARNING"
                    ? "bg-[var(--accent-copper)] text-white"
                    : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
                }`}
              >
                {currentStatus}
              </span>
            </div>

            {/* Reading Highlight */}
            <div className="flex items-baseline justify-between py-1 border-b border-[var(--border-light)]/30">
              <div>
                <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase font-semibold">
                  CURRENT READING
                </div>
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="font-heading text-3xl font-bold text-[var(--text-charcoal)] leading-none">
                    {selectedChannel.key === "alignment" && rawCurrentValue > 0
                      ? `+${rawCurrentValue.toFixed(selectedChannel.decimals)}`
                      : rawCurrentValue.toFixed(selectedChannel.decimals)}
                  </span>
                  <span className="text-xs font-bold text-[var(--accent-copper)]">{selectedChannel.unit}</span>
                </div>
              </div>

              {/* Target Baseline */}
              <div className="text-right">
                <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase font-semibold">
                  TARGET BASELINE
                </div>
                <div className="text-sm font-bold text-[var(--text-charcoal)] pt-1">
                  {selectedChannel.targetStr}
                </div>
              </div>
            </div>

            {/* Threshold Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-0.5">
              <div className="p-2 rounded-[2px] bg-[var(--bg-stone)]/80 border border-[var(--border-light)]/50 space-y-0.5">
                <span className="text-[8.5px] text-amber-800 font-bold uppercase">WARNING LIMIT</span>
                <div className="font-bold text-[var(--text-charcoal)]">{selectedChannel.warnStr}</div>
              </div>

              <div className="p-2 rounded-[2px] bg-[var(--bg-stone)]/80 border border-[var(--border-light)]/50 space-y-0.5">
                <span className="text-[8.5px] text-red-800 font-bold uppercase">CRITICAL LIMIT</span>
                <div className="font-bold text-[var(--text-charcoal)]">{selectedChannel.critStr}</div>
              </div>
            </div>

            {/* Description Micro-copy */}
            <p className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans line-clamp-2 pt-1 border-t border-[var(--border-light)]/30">
              {selectedChannel.description}
            </p>
          </div>

          {/* Scientific Threshold Rules Panel */}
          <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
                <h4 className="font-heading text-xs font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                  SCIENTIFIC THRESHOLD RULES
                </h4>
              </div>
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">ENGINEERING CONFIG</span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between p-2 rounded-[2px] bg-emerald-50/60 border border-emerald-200/60">
                <span className="font-bold text-emerald-900 uppercase">NORMAL OPERATING BAND</span>
                <span className="font-bold text-emerald-950">{selectedChannel.normalBandStr}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-[2px] bg-amber-50/60 border border-amber-200/60">
                <span className="font-bold text-amber-900 uppercase">WARNING THRESHOLD</span>
                <span className="font-bold text-amber-950">{selectedChannel.warnStr}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-[2px] bg-red-50/60 border border-red-200/60">
                <span className="font-bold text-red-900 uppercase">CRITICAL THRESHOLD</span>
                <span className="font-bold text-red-950">{selectedChannel.critStr}</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
              <span>SOURCE: Alert / monitoring rule config</span>
              <span>HYSTERESIS ENABLED</span>
            </div>
          </div>
        </div>

        {/* Right Column (70%): Main Real-Time Signal Trajectory & Controls */}
        <div className="lg:col-span-8 space-y-3 font-mono">
          {/* Main Chart Controls Strip */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs gap-3">
            {/* Time Window Buttons */}
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase mr-1">
                WINDOW:
              </span>
              <button
                onClick={() => handleWindowChange("60S")}
                className={`px-2.5 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
                  timeWindow === "60S"
                    ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                    : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
                }`}
              >
                60 SEC (SESSION)
              </button>
              <button
                onClick={() => handleWindowChange("5M")}
                className={`px-2.5 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
                  timeWindow === "5M"
                    ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                    : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
                }`}
              >
                5 MIN (300)
              </button>
              <button
                onClick={() => handleWindowChange("8M")}
                className={`px-2.5 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
                  timeWindow === "8M"
                    ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                    : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
                }`}
              >
                8 MIN MAX (500)
              </button>

              {isLoadingHistory && (
                <span className="text-[9px] text-[var(--accent-copper)] font-bold uppercase animate-pulse ml-2">
                  FETCHING HISTORY…
                </span>
              )}
            </div>

            {/* Pause / Resume & Dual Compare Options */}
            <div className="flex items-center gap-3 text-[10px]">
              {/* Dual Channel Comparison Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase">
                  COMPARE:
                </span>
                <select
                  value={secondaryChannelId || ""}
                  onChange={(e) => setSecondaryChannelId(e.target.value ? e.target.value : null)}
                  className="px-2 py-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] font-bold uppercase text-[9.5px] cursor-pointer"
                >
                  <option value="">NONE (SINGLE)</option>
                  {CHANNEL_CONFIGS.filter((c) => c.id !== selectedChannelId).map((c) => (
                    <option key={c.id} value={c.id}>
                      + {c.shortName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pause / Resume Button */}
              <button
                onClick={togglePause}
                className={`px-3 py-1 rounded-[2px] font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isPaused
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--accent-copper)] hover:bg-[var(--accent-copper)] hover:text-white"
                }`}
              >
                {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                <span>{isPaused ? "RESUME LIVE →" : "PAUSE VIEW"}</span>
              </button>
            </div>
          </div>

          {/* Main Visual SVG Chart Component */}
          <MonitoringMainChart
            primaryChannel={selectedChannel}
            secondaryChannel={secondaryChannel}
            data={activeDataset}
            alerts={activeAlerts}
            isPaused={isPaused}
            windowLabel={timeWindow === "60S" ? "60 SEC WINDOW" : timeWindow === "5M" ? "5 MIN (300 SAMPLES)" : "8 MIN (500 SAMPLES MAX)"}
            sourceLabel={timeWindow === "60S" ? "SESSION LIVE BUFFER" : "POSTGRESQL TELEMETRY HISTORY"}
          />
        </div>
      </div>

      {/* 4. BOTTOM WORKSPACE: WINDOW STATISTICS & RATE/CHANGE ANALYSIS STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 font-mono text-xs">
        {/* Statistics Calculation Panel */}
        <div className="lg:col-span-8 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-[var(--accent-copper)]" />
              <div>
                <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
                  // WINDOW STATISTICS
                </span>
                <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                  SIGNAL STATISTICAL DISTRIBUTION ({visibleValues.length} SAMPLES)
                </h3>
              </div>
            </div>
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase font-semibold">
              CALCULATED OVER VISIBLE WINDOW
            </span>
          </div>

          {/* 6 Statistical Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10px]">
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">CURRENT</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {stats.avg > 0 ? rawCurrentValue.toFixed(selectedChannel.decimals) : "--"}
              </div>
              <span className="text-[8.5px] text-[var(--text-graphite-muted)]">{selectedChannel.unit}</span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">MINIMUM</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {stats.min.toFixed(selectedChannel.decimals)}
              </div>
              <span className="text-[8.5px] text-[var(--text-graphite-muted)]">{selectedChannel.unit}</span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">AVERAGE</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {stats.avg.toFixed(selectedChannel.decimals)}
              </div>
              <span className="text-[8.5px] text-[var(--text-graphite-muted)]">{selectedChannel.unit}</span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">MAXIMUM</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {stats.max.toFixed(selectedChannel.decimals)}
              </div>
              <span className="text-[8.5px] text-[var(--text-graphite-muted)]">{selectedChannel.unit}</span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">STD DEV</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {stats.stdDev.toFixed(selectedChannel.decimals + 1)}
              </div>
              <span className="text-[8.5px] text-[var(--text-graphite-muted)]">σ ({selectedChannel.unit})</span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">RANGE (Δ)</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {stats.range.toFixed(selectedChannel.decimals)}
              </div>
              <span className="text-[8.5px] text-[var(--text-graphite-muted)]">{selectedChannel.unit}</span>
            </div>
          </div>
        </div>

        {/* Rate / Change Analysis Panel */}
        <div className="lg:col-span-4 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <div>
              <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
                // DYNAMICS
              </span>
              <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                RATE & DELTA ANALYSIS
              </h3>
            </div>
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase font-semibold">TICK-TO-TICK</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] py-1">
            {/* Tick Delta */}
            <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8px] text-[var(--text-graphite-muted)] uppercase font-bold">TICK Δ</span>
              <div className="font-bold text-[var(--text-charcoal)] text-xs">
                {tickDelta > 0 ? `+${tickDelta.toFixed(selectedChannel.decimals)}` : tickDelta.toFixed(selectedChannel.decimals)}
              </div>
              <span className="text-[8px] text-[var(--text-graphite-muted)]">{selectedChannel.unit}</span>
            </div>

            {/* Rate of Change */}
            <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8px] text-[var(--text-graphite-muted)] uppercase font-bold">RATE</span>
              <div className="font-bold text-[var(--text-charcoal)] text-xs">
                {rateOfChange > 0 ? `+${rateOfChange.toFixed(2)}` : rateOfChange.toFixed(2)}
              </div>
              <span className="text-[8px] text-[var(--text-graphite-muted)]">{selectedChannel.unit}/s</span>
            </div>

            {/* Direction Badge */}
            <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5 flex flex-col justify-between">
              <span className="text-[8px] text-[var(--text-graphite-muted)] uppercase font-bold">DIRECTION</span>
              <div className="flex items-center gap-1 font-bold text-xs text-[var(--text-charcoal)]">
                {direction === "RISING" ? (
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
                ) : direction === "FALLING" ? (
                  <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-[var(--text-graphite-muted)]" />
                )}
                <span className="text-[9.5px] uppercase">{direction}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
            <span>CALCULATED FROM LATEST 1 HZ SAMPLES</span>
            <span>NO FORECAST / NO PREDICTION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
