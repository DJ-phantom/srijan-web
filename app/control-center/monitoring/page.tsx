"use client";

import { useState, useMemo } from "react";
import {
  Radio,
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  Info,
} from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";

interface ChannelMeta {
  id: "temperature" | "vibration" | "current" | "speed" | "alignment" | "load";
  code: string;
  name: string;
  shortName: string;
  unit: string;
  decimals: number;
  target: number;
  targetStr: string;
  warn: number;
  warnStr: string;
  crit: number;
  critStr: string;
  type: "high" | "low" | "abs_high";
  description: string;
}

const CHANNELS: ChannelMeta[] = [
  {
    id: "temperature",
    code: "01",
    name: "BEARING / MOTOR TEMPERATURE",
    shortName: "TEMPERATURE",
    unit: "°C",
    decimals: 1,
    target: 41.0,
    targetStr: "41.0 °C",
    warn: 50.0,
    warnStr: "≥ 50.0 °C",
    crit: 60.0,
    critStr: "≥ 60.0 °C",
    type: "high",
    description: "Thermal dissipation across drive motor housing and primary pulley bearing assemblies.",
  },
  {
    id: "vibration",
    code: "02",
    name: "DRIVE VIBRATION",
    shortName: "VIBRATION",
    unit: "g",
    decimals: 2,
    target: 0.27,
    targetStr: "0.27 g",
    warn: 0.50,
    warnStr: "≥ 0.50 g",
    crit: 0.85,
    critStr: "≥ 0.85 g",
    type: "high",
    description: "Mechanical vibration RMS acceleration at primary drive motor and pulley coupling.",
  },
  {
    id: "current",
    code: "03",
    name: "MOTOR CURRENT",
    shortName: "MOTOR CURRENT",
    unit: "A",
    decimals: 2,
    target: 4.15,
    targetStr: "4.15 A",
    warn: 6.00,
    warnStr: "≥ 6.00 A",
    crit: 8.50,
    critStr: "≥ 8.50 A",
    type: "high",
    description: "Single-phase motor current draw indicating mechanical resistance and conveyor load.",
  },
  {
    id: "speed",
    code: "04",
    name: "BELT SPEED",
    shortName: "BELT SPEED",
    unit: "m/s",
    decimals: 2,
    target: 1.80,
    targetStr: "1.80 m/s",
    warn: 1.40,
    warnStr: "≤ 1.40 m/s",
    crit: 1.10,
    critStr: "≤ 1.10 m/s",
    type: "low",
    description: "Linear belt speed measured via drive shaft tachometer encoder sensor.",
  },
  {
    id: "alignment",
    code: "05",
    name: "LATERAL ALIGNMENT",
    shortName: "ALIGNMENT",
    unit: "mm",
    decimals: 1,
    target: 0.0,
    targetStr: "0.0 mm",
    warn: 5.0,
    warnStr: "≥ |5.0| mm",
    crit: 10.0,
    critStr: "≥ |10.0| mm",
    type: "abs_high",
    description: "Transverse displacement of belt centerline relative to return idlers.",
  },
  {
    id: "load",
    code: "06",
    name: "MATERIAL LOAD",
    shortName: "MATERIAL LOAD",
    unit: "t/h",
    decimals: 1,
    target: 60.0,
    targetStr: "60.0 t/h",
    warn: 90.0,
    warnStr: "≥ 90.0 t/h",
    crit: 110.0,
    critStr: "≥ 110.0 t/h",
    type: "high",
    description: "Gravimetric material load passing across primary weigh scale idler.",
  },
];

function evaluateStatus(val: number, meta: ChannelMeta): "NORMAL" | "WARNING" | "CRITICAL" {
  if (meta.type === "high") {
    if (val >= meta.crit) return "CRITICAL";
    if (val >= meta.warn) return "WARNING";
    return "NORMAL";
  } else if (meta.type === "low") {
    if (val <= meta.crit) return "CRITICAL";
    if (val <= meta.warn) return "WARNING";
    return "NORMAL";
  } else {
    const absVal = Math.abs(val);
    if (absVal >= meta.crit) return "CRITICAL";
    if (absVal >= meta.warn) return "WARNING";
    return "NORMAL";
  }
}

export default function MonitoringPage() {
  const {
    dataMode,
    isConnected,
    lastUpdated,
    telemetry,
    telemetryHistory,
    conditionSummary,
    activeAlerts,
  } = useControlCenterData();

  // Default active selected channel is VIBRATION (02)
  const [selectedChannelId, setSelectedChannelId] = useState<string>("vibration");

  const selectedMeta = useMemo(() => {
    return CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[1];
  }, [selectedChannelId]);

  const overallLevel = conditionSummary?.overall.level || "NORMAL";
  const overallRisk = conditionSummary?.overall.risk_index ?? 12.4;
  const spliceLevel = conditionSummary?.splice.level || "NORMAL";
  const spliceRisk = conditionSummary?.splice.risk_index ?? 8.0;

  // Selected channel telemetry data points
  const selectedVal = Number(telemetry[selectedMeta.id]) || selectedMeta.target;
  const selectedStatus = evaluateStatus(selectedVal, selectedMeta);

  // Extract time series values for graph
  const timeSeriesValues = useMemo(() => {
    if (!telemetryHistory || telemetryHistory.length === 0) {
      return [selectedVal];
    }
    return telemetryHistory.map((rec) => Number(rec[selectedMeta.id]) || selectedMeta.target);
  }, [telemetryHistory, selectedMeta.id, selectedVal]);

  // Delta comparison against previous sample
  const prevVal = timeSeriesValues.length > 1 ? timeSeriesValues[timeSeriesValues.length - 2] : selectedVal;
  const delta = selectedVal - prevVal;

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* Page Identity Header */}
      <div className="border-b border-[var(--border-light)]/40 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[var(--accent-copper)] animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--accent-copper)] tracking-widest uppercase">
            // MONITORING
          </span>
        </div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-[var(--text-charcoal)] mt-0.5">
          CONVEYOR BC-01 / SIX-CHANNEL CONDITION TELEMETRY
        </h1>
      </div>

      {/* LEVEL 1 — CURRENT SYSTEM CONDITION STRIP */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">UNIT ID</div>
            <div className="font-heading font-bold text-sm text-[var(--text-charcoal)]">CONVEYOR BC-01</div>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-light)]" />

          <div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">OVERALL RISK INDEX</div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-[var(--text-charcoal)]">
                {overallRisk.toFixed(0)} <span className="text-[10px] font-normal text-[var(--text-graphite-muted)]">/ 100</span>
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase ${
                  overallLevel === "CRITICAL"
                    ? "bg-red-600 text-white"
                    : overallLevel === "WARNING"
                    ? "bg-[var(--accent-copper)] text-white"
                    : overallLevel === "ATTENTION"
                    ? "bg-amber-500/20 text-amber-900 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-900 border border-emerald-500/30"
                }`}
              >
                {overallLevel}
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-light)] hidden sm:block" />

          <div className="hidden sm:block">
            <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">MONITORED SPLICE S1</div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-[var(--text-charcoal)]">
                {spliceRisk.toFixed(0)} <span className="text-[10px] font-normal text-[var(--text-graphite-muted)]">/ 100</span>
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase ${
                  spliceLevel === "HIGH" || spliceLevel === "ELEVATED"
                    ? "bg-[var(--accent-copper)] text-white"
                    : spliceLevel === "WATCH"
                    ? "bg-amber-500/20 text-amber-900"
                    : "bg-emerald-500/20 text-emerald-900"
                }`}
              >
                {spliceLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="text-right">
            <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase">ACTIVE EVENTS</div>
            <div className="font-bold text-[var(--accent-copper)] uppercase">
              {activeAlerts.length > 0 ? `${activeAlerts.length} RULE ALERTS` : "0 ACTIVE ALERTS"}
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border-light)]" />

          <div className="text-right">
            <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase">LAST TICK</div>
            <div className="font-bold text-[var(--text-charcoal)]">{lastUpdated}</div>
          </div>
        </div>
      </div>

      {/* LEVEL 2 — SIX LIVE SIGNALS INSTRUMENTATION GRID */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-graphite-muted)] uppercase px-1">
          <span>// INSTRUMENTATION GRID (SELECT CHANNEL FOR DEEP INSPECTION)</span>
          <span>CLICK TO SWITCH ACTIVE SIGNAL</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
          {CHANNELS.map((ch) => {
            const isSelected = selectedChannelId === ch.id;
            const val = Number(telemetry[ch.id]) || ch.target;
            const status = evaluateStatus(val, ch);

            const displayVal =
              ch.id === "alignment"
                ? val > 0
                  ? `+${val.toFixed(ch.decimals)}`
                  : val.toFixed(ch.decimals)
                : val.toFixed(ch.decimals);

            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`p-3 rounded-[2px] border text-left transition-all duration-150 cursor-pointer relative ${
                  isSelected
                    ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)] border-[var(--text-charcoal)] shadow-md ring-1 ring-[var(--accent-copper)]"
                    : "bg-white/80 text-[var(--text-charcoal)] border-[var(--border-light)]/40 hover:bg-white hover:border-[var(--accent-copper)]/50"
                }`}
              >
                {/* Header line */}
                <div className="flex items-center justify-between text-[9px] opacity-75 mb-1">
                  <span>{ch.code} // {ch.unit}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === "CRITICAL"
                        ? "bg-red-500 animate-pulse"
                        : status === "WARNING"
                        ? "bg-[var(--accent-copper)]"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>

                {/* Big numeric value */}
                <div className="font-heading text-xl font-bold tracking-tight">
                  {displayVal}
                </div>

                {/* Channel Label */}
                <div className="text-[10px] font-semibold tracking-wider uppercase pt-1 truncate opacity-90">
                  {ch.shortName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEVEL 3 — ACTIVE CHANNEL DETAIL & TREND VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
        {/* Left Column: Active Channel Metadata & Threshold Rules */}
        <div className="lg:col-span-4 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
              <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
                // ACTIVE INSPECTION CHANNEL
              </span>
              <span className="text-[10px] font-bold text-[var(--text-charcoal)] bg-black/5 px-2 py-0.5 rounded-[2px]">
                {selectedMeta.code}
              </span>
            </div>

            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {selectedMeta.name}
              </h2>
              <p className="font-sans text-[11px] text-[var(--text-graphite-muted)] leading-snug pt-1">
                {selectedMeta.description}
              </p>
            </div>

            {/* Readout Card */}
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 flex items-center justify-between">
              <div>
                <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase">CURRENT VALUE</div>
                <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
                  {selectedMeta.id === "alignment" && selectedVal > 0
                    ? `+${selectedVal.toFixed(selectedMeta.decimals)}`
                    : selectedVal.toFixed(selectedMeta.decimals)}{" "}
                  <span className="text-sm font-normal text-[var(--text-graphite-muted)]">
                    {selectedMeta.unit}
                  </span>
                </div>
              </div>

              {/* Delta Indicator */}
              <div className="text-right">
                <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase">TICK DELTA</div>
                <div className="flex items-center justify-end gap-1 font-bold text-xs">
                  {delta > 0.001 ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
                      <span className="text-[var(--accent-copper)]">+{delta.toFixed(selectedMeta.decimals)}</span>
                    </>
                  ) : delta < -0.001 ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{delta.toFixed(selectedMeta.decimals)}</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500">0.0</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Threshold Rules Breakdown */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[9px] font-semibold text-[var(--text-graphite-muted)] uppercase">
                SCIENTIFIC THRESHOLD RULES
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-950">
                  <div className="text-[8px] opacity-70 uppercase">NORMAL TARGET</div>
                  <div className="font-bold">{selectedMeta.targetStr}</div>
                </div>

                <div className="p-2 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-950">
                  <div className="text-[8px] opacity-70 uppercase">WARNING BOUND</div>
                  <div className="font-bold text-[var(--accent-copper)]">{selectedMeta.warnStr}</div>
                </div>

                <div className="p-2 rounded-[2px] bg-red-500/10 border border-red-500/30 text-red-950">
                  <div className="text-[8px] opacity-70 uppercase">CRITICAL BOUND</div>
                  <div className="font-bold text-red-600">{selectedMeta.critStr}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-[var(--text-graphite-muted)] border-t border-[var(--border-light)]/40 pt-2 uppercase tracking-wider font-mono">
            THRESHOLDS / PROTOTYPE CONDITION RULES
          </div>
        </div>

        {/* Right Column: Real-Time Trend Graph (Thin Graphite Line + Copper Active Segment) */}
        <div className="lg:col-span-8 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // REAL-TIME TREND TRAJECTORY ({timeSeriesValues.length} SAMPLES)
            </span>
            <span className="text-[10px] text-[var(--text-graphite-muted)] uppercase">
              CHANNEL: {selectedMeta.shortName} [{selectedMeta.unit}]
            </span>
          </div>

          {/* Lightweight SVG Graph */}
          <div className="relative w-full h-56 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 p-3 flex flex-col justify-between">
            <svg className="w-full h-full" viewBox="0 0 700 180" fill="none">
              {/* Grid Background Lines */}
              <line x1="0" y1="30" x2="700" y2="30" stroke="rgba(220,38,38,0.25)" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="70" x2="700" y2="70" stroke="rgba(200,109,81,0.25)" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="120" x2="700" y2="120" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />

              {/* Threshold Labels on SVG */}
              <text x="690" y="26" fill="#dc2626" fontSize="8" fontWeight="bold" textAnchor="end">CRITICAL ({selectedMeta.critStr})</text>
              <text x="690" y="66" fill="var(--accent-copper)" fontSize="8" fontWeight="bold" textAnchor="end">WARNING ({selectedMeta.warnStr})</text>
              <text x="690" y="116" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="end">TARGET ({selectedMeta.targetStr})</text>

              {/* Render Sparkline Path */}
              {timeSeriesValues.length > 0 && (() => {
                const len = timeSeriesValues.length;
                // Calculate y min/max bounds for SVG scaling
                const minVal = Math.min(...timeSeriesValues, selectedMeta.target * 0.8);
                const maxVal = Math.max(...timeSeriesValues, selectedMeta.warn * 1.1);
                const range = maxVal - minVal || 1.0;

                const points = timeSeriesValues.map((val, idx) => {
                  const x = len === 1 ? 350 : (idx / (len - 1)) * 680 + 10;
                  // Map val to y-coordinate (160 bottom, 20 top)
                  const normalized = (val - minVal) / range;
                  const y = 160 - normalized * 130;
                  return { x, y, val };
                });

                const pathString = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

                // Recent active segment (last 5 points) in copper
                const recentPoints = points.slice(-6);
                const recentPathString = recentPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
                const lastPoint = points[points.length - 1];

                return (
                  <g>
                    {/* Full trajectory line in thin graphite */}
                    <path d={pathString} stroke="var(--text-charcoal)" strokeWidth="1.75" opacity="0.65" />
                    {/* Active recent segment in copper */}
                    {recentPoints.length > 1 && (
                      <path d={recentPathString} stroke="var(--accent-copper)" strokeWidth="2.5" />
                    )}
                    {/* Current point pulsing dot */}
                    {lastPoint && (
                      <g>
                        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="var(--accent-copper)" />
                        <circle cx={lastPoint.x} cy={lastPoint.y} r="7" fill="var(--accent-copper)" opacity="0.3" className="animate-ping" />
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>

            {/* Axis Footer */}
            <div className="flex items-center justify-between text-[8px] text-[var(--text-graphite-muted)] uppercase font-mono pt-1">
              <span>OLDER SAMPLES ({timeSeriesValues.length} RECENT TICKS)</span>
              <span>LIVE FEED (1 HZ CADENCE)</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONDITION ENGINE & ACTIVE EVENTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Left: Multi-Sensor Condition Engine Context */}
        <div className="p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>// CONDITION ENGINE FUSION ASSESSMENT</span>
            </span>
            <span className="text-[9px] font-bold text-[var(--text-charcoal)]">0-100 RISK INDEX</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
              <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase">OVERALL BELT CONDITION</div>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {overallRisk.toFixed(0)} <span className="text-[9px] font-normal text-[var(--text-graphite-muted)]">/ 100</span>
              </div>
              <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">{overallLevel}</div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
              <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase">MONITORED SPLICE S1</div>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {spliceRisk.toFixed(0)} <span className="text-[9px] font-normal text-[var(--text-graphite-muted)]">/ 100</span>
              </div>
              <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">{spliceLevel}</div>
            </div>
          </div>
        </div>

        {/* Right: Active Event Context Bar */}
        <div className="p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>// ACTIVE RULE ALERTS STATUS</span>
            </span>
            <span className="text-[9px] font-bold text-[var(--text-charcoal)]">
              {activeAlerts.length} ACTIVE
            </span>
          </div>

          {activeAlerts.length > 0 ? (
            <div className="space-y-2 pt-1 font-mono text-[11px]">
              {activeAlerts.slice(0, 2).map((alt) => (
                <div
                  key={alt.id}
                  className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[var(--text-charcoal)]">
                      [{alt.metric.toUpperCase()}] {alt.title}
                    </div>
                    <div className="text-[10px] text-[var(--text-graphite-muted)] font-sans">
                      {alt.message} ({alt.value} {alt.unit})
                    </div>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase shrink-0 ${
                      alt.severity === "CRITICAL" ? "bg-red-600 text-white" : "bg-[var(--accent-copper)] text-white"
                    }`}
                  >
                    {alt.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 flex items-center justify-center gap-2 text-[11px] text-emerald-800 font-mono mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>NO ACTIVE RULE ALERTS — ALL CHANNELS WITHIN SAFE BOUNDS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
