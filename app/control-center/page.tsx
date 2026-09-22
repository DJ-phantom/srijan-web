"use client";

import Link from "next/link";
import { Activity, ShieldAlert, Radio, ArrowRight } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const sliced = data.slice(-15);
  const min = Math.min(...sliced);
  const max = Math.max(...sliced);
  const range = max - min || 1;
  const width = 48;
  const height = 14;

  const points = sliced
    .map((val, idx) => {
      const x = (idx / (sliced.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="w-[48px] h-[14px] shrink-0 opacity-75" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke="var(--accent-copper)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function OverviewPage() {
  const {
    streamCadence,
    lastUpdated,
    telemetry,
    telemetryHistory,
    conditionSummary,
    anomalyAssessment,
    decisionSummary,
    activeAlerts,
  } = useControlCenterData();

  // Calculations for UI presentation
  const overallLevel = decisionSummary?.level || conditionSummary?.overall.level || "NORMAL";
  const spliceLevel = conditionSummary?.splice.level || "NORMAL";
  const overallRisk = conditionSummary?.overall.risk_index ?? 12;
  const spliceRisk = conditionSummary?.splice.risk_index ?? 8;

  const isAnomaly = anomalyAssessment?.is_anomaly ?? false;
  const mlStatus = anomalyAssessment?.status || "STABLE_NORMAL";
  const anomalyIndex = anomalyAssessment?.anomaly_index ?? 14.5;

  // History arrays for optional micro sparklines
  const tempHist = telemetryHistory.map((t) => t.temperature);
  const vibHist = telemetryHistory.map((t) => t.vibration);
  const currHist = telemetryHistory.map((t) => t.current);
  const speedHist = telemetryHistory.map((t) => t.speed);
  const alignHist = telemetryHistory.map((t) => t.alignment);
  const loadHist = telemetryHistory.map((t) => t.load);

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // CONTROL CENTER OVERVIEW
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            CONVEYOR BC-01 OPERATIONAL OVERVIEW
          </h1>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="px-2.5 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[var(--accent-copper)]" />
            <span>CADENCE: {streamCadence}</span>
          </div>
          <div className="px-2.5 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-graphite-muted)]">
            UPDATED: <span className="text-[var(--text-charcoal)]">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Top Condition Hierarchy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 font-mono">
        {/* 1. PRIMARY PANEL: Overall Conveyor Condition (Highest visual importance) */}
        <div className="lg:col-span-4 p-4 rounded-[2px] bg-gradient-to-br from-white/95 to-white/70 border border-[var(--border-light)]/50 border-l-2 border-l-[var(--accent-copper)] shadow-xs flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // OVERALL CONVEYOR CONDITION
            </span>
            <span
              className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wide ${
                overallLevel === "CRITICAL"
                  ? "bg-red-600 text-white"
                  : overallLevel === "WARNING"
                  ? "bg-[var(--accent-copper)] text-white"
                  : overallLevel === "ATTENTION"
                  ? "bg-amber-500/20 text-amber-950 border border-amber-500/40"
                  : "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30"
              }`}
            >
              {overallLevel}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-3xl font-bold text-[var(--text-charcoal)]">
                {overallRisk.toFixed(0)}
              </span>
              <span className="text-xs font-mono text-[var(--text-graphite-muted)]">RISK INDEX / 100</span>
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] pt-1">
              Multi-sensor condition fusion
            </div>
          </div>
        </div>

        {/* 2. SECONDARY: Monitored Splice S1 */}
        <div className="lg:col-span-3 p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-semibold tracking-wider uppercase">
              MONITORED SPLICE S1
            </span>
            <span
              className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase ${
                spliceLevel === "HIGH" || spliceLevel === "ELEVATED"
                  ? "bg-[var(--accent-copper)] text-white"
                  : spliceLevel === "WATCH"
                  ? "bg-amber-500/20 text-amber-950 border border-amber-500/40"
                  : "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30"
              }`}
            >
              {spliceLevel}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
                {spliceRisk.toFixed(0)}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-graphite-muted)]">RISK INDEX / 100</span>
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] pt-0.5">
              Joint vibration + tracking condition
            </div>
          </div>
        </div>

        {/* 3. SECONDARY: Anomaly Assessment */}
        <div className="lg:col-span-3 p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[var(--text-graphite-muted)] font-semibold tracking-wider uppercase">
                ANOMALY ASSESSMENT
              </div>
              <div className="text-[8px] text-[var(--text-graphite-muted)] tracking-tight">
                ISOLATION FOREST DEVIATION
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase ${
                isAnomaly
                  ? "bg-[var(--accent-copper)] text-white"
                  : "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30"
              }`}
            >
              {mlStatus.replace(/_/g, " ")}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
                {anomalyIndex.toFixed(1)}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-graphite-muted)]">ANOMALY INDEX / 100</span>
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] pt-0.5">
              Multivariate baseline deviation
            </div>
          </div>
        </div>

        {/* 4. ALERT STATUS: Active Rule Alerts */}
        <div className="lg:col-span-2 p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-semibold tracking-wider uppercase">
              ACTIVE ALERTS
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase ${
                activeAlerts.length > 0
                  ? "bg-[var(--accent-copper)] text-white"
                  : "bg-black/5 text-[var(--text-graphite-muted)] border border-black/10"
              }`}
            >
              {activeAlerts.length > 0 ? `${activeAlerts.length} ACTIVE` : "NO ALERTS"}
            </span>
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
              {activeAlerts.length}
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] pt-0.5">
              {activeAlerts.length === 0 ? "No active threshold triggers" : "Rule threshold triggers"}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Support Diagnostic Section (Second most visually important panel) */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
        {/* Subtle Engine Logic Micro Flow */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-graphite-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-light)]/30">
          <span className="px-1.5 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-charcoal)] font-semibold">RULES</span>
          <span>+</span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-charcoal)] font-semibold">CONDITION ENGINE</span>
          <span>+</span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-charcoal)] font-semibold">ANOMALY DETECTION</span>
          <span className="text-[var(--accent-copper)] font-bold">→</span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--accent-copper)]/10 text-[var(--accent-copper)] font-bold border border-[var(--accent-copper)]/30">
            DECISION SUPPORT
          </span>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--accent-copper)] shrink-0" />
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-widest uppercase">
              // EXPLAINABLE DECISION SUPPORT
            </span>
          </div>
          <Link
            href="/control-center/decision-support"
            className="text-[10px] font-bold text-[var(--accent-copper)] hover:underline flex items-center gap-1"
          >
            <span>FULL DECISION ENGINE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Diagnostic Assessment Content */}
        <div className="space-y-1.5">
          <h2 className="font-heading text-base font-bold text-[var(--text-charcoal)] leading-snug">
            {decisionSummary?.headline || "Conveyor system operating within normal baseline parameters."}
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-graphite-muted)]">
            <span>
              EVIDENCE AGREEMENT:{" "}
              <strong className="text-[var(--accent-copper)] uppercase font-bold">
                {decisionSummary?.evidence_agreement || "HIGH"}
              </strong>
            </span>
            <span>•</span>
            <span>EVIDENCE ITEMS: {decisionSummary?.evidence.length || 0}</span>
          </div>
        </div>

        {/* Suggested Actions */}
        {decisionSummary?.suggested_actions && decisionSummary.suggested_actions.length > 0 && (
          <div className="pt-2 border-t border-[var(--border-light)]/30 space-y-1.5 font-mono text-xs">
            <div className="text-[9px] font-bold text-[var(--text-graphite-muted)] uppercase tracking-wider">
              SUGGESTED OPERATOR ACTIONS:
            </div>
            <div className="space-y-1">
              {decisionSummary.suggested_actions.map((act, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] text-[var(--text-charcoal)] font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] shrink-0" />
                  <span>{act.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live 6-Channel Telemetry Stream Grid */}
      <div className="p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2.5 font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-widest uppercase">
              // REAL-TIME TELEMETRY STREAM (6 CHANNELS)
            </span>
          </div>
          <Link
            href="/control-center/monitoring"
            className="text-[10px] font-bold text-[var(--accent-copper)] hover:underline flex items-center gap-1"
          >
            <span>LIVE MONITORING ROOM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
          {/* Channel 1: Temperature */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-semibold uppercase flex items-center justify-between">
              <span>01 TEMP</span>
              <span className="text-[9px] font-bold text-[var(--text-charcoal)]">°C</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {telemetry.temperature.toFixed(1)}
              </span>
              <Sparkline data={tempHist} />
            </div>
            <div className="text-[8px] text-[var(--text-graphite-muted)]">Target: 41.0°C</div>
          </div>

          {/* Channel 2: Vibration */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-semibold uppercase flex items-center justify-between">
              <span>02 VIB</span>
              <span className="text-[9px] font-bold text-[var(--text-charcoal)]">g</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {telemetry.vibration.toFixed(2)}
              </span>
              <Sparkline data={vibHist} />
            </div>
            <div className="text-[8px] text-[var(--text-graphite-muted)]">Target: 0.27g</div>
          </div>

          {/* Channel 3: Current */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-semibold uppercase flex items-center justify-between">
              <span>03 CURR</span>
              <span className="text-[9px] font-bold text-[var(--text-charcoal)]">A</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {telemetry.current.toFixed(2)}
              </span>
              <Sparkline data={currHist} />
            </div>
            <div className="text-[8px] text-[var(--text-graphite-muted)]">Target: 4.15A</div>
          </div>

          {/* Channel 4: Speed */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-semibold uppercase flex items-center justify-between">
              <span>04 SPEED</span>
              <span className="text-[9px] font-bold text-[var(--text-charcoal)]">m/s</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {telemetry.speed.toFixed(2)}
              </span>
              <Sparkline data={speedHist} />
            </div>
            <div className="text-[8px] text-[var(--text-graphite-muted)]">Target: 1.80m/s</div>
          </div>

          {/* Channel 5: Alignment */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-semibold uppercase flex items-center justify-between">
              <span>05 ALIGN</span>
              <span className="text-[9px] font-bold text-[var(--text-charcoal)]">mm</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {telemetry.alignment > 0 ? `+${telemetry.alignment.toFixed(1)}` : telemetry.alignment.toFixed(1)}
              </span>
              <Sparkline data={alignHist} />
            </div>
            <div className="text-[8px] text-[var(--text-graphite-muted)]">Target: 0.0mm</div>
          </div>

          {/* Channel 6: Load */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-semibold uppercase flex items-center justify-between">
              <span>06 LOAD</span>
              <span className="text-[9px] font-bold text-[var(--text-charcoal)]">t/h</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {telemetry.load.toFixed(1)}
              </span>
              <Sparkline data={loadHist} />
            </div>
            <div className="text-[8px] text-[var(--text-graphite-muted)]">Target: 60.0t/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
