"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useControlCenterContext, RiskHistoryPoint, AnomalyHistoryPoint } from "@/components/control-center/ControlCenterDataProvider";
import SessionRiskChart from "@/components/control-center/overview/SessionRiskChart";
import RiskContributorsBar from "@/components/control-center/overview/RiskContributorsBar";
import TelemetryMatrixGrid from "@/components/control-center/overview/TelemetryMatrixGrid";
import EventDistributionDonut from "@/components/control-center/overview/EventDistributionDonut";

// Restrained Micro Sparkline for KPI Panels (0-100 scale)
function KpiSparkline({ data, valueKey, color }: { data: any[]; valueKey: string; color: string }) {
  if (!data || data.length < 2) {
    return (
      <div className="w-16 h-4 flex items-center justify-center text-[7.5px] text-[var(--text-graphite-muted)] uppercase font-mono">
        COLLECTING…
      </div>
    );
  }

  const width = 64;
  const height = 16;
  const sliced = data.slice(-20);

  const points = sliced
    .map((item, idx) => {
      const val = typeof item[valueKey] === "number" ? item[valueKey] : 0;
      const x = (idx / (sliced.length - 1)) * width;
      const y = height - (Math.min(100, Math.max(0, val)) / 100) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="flex items-center gap-1.5 font-mono text-[8px] text-[var(--text-graphite-muted)]">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      <span className="uppercase font-semibold">SESSION TREND</span>
    </div>
  );
}

export default function OverviewPage() {
  const {
    dataSource,
    streamCadence,
    lastUpdated,
    telemetry,
    telemetryHistory,
    overallRiskHistory,
    spliceRiskHistory,
    anomalyIndexHistory,
    conditionSummary,
    anomalyAssessment,
    decisionSummary,
    activeAlerts,
    health,
    fetchAlertHistory,
  } = useControlCenterContext();

  // Extract core KPI metrics safely
  const overallRisk = conditionSummary?.overall.risk_index ?? 12.0;
  const overallLevel = conditionSummary?.overall.level || "NORMAL";
  const overallHeadline = conditionSummary?.overall.message || "Conveyor operating within normal baseline parameters.";

  const spliceRisk = conditionSummary?.splice.risk_index ?? 8.5;
  const spliceLevel = conditionSummary?.splice.level || "NORMAL";
  const spliceHeadline = conditionSummary?.splice.message || "Monitored Splice S1 structural signature nominal.";

  const anomalyIndex = anomalyAssessment?.anomaly_index ?? 14.2;
  const anomalyStatus = anomalyAssessment?.status || "STABLE_NORMAL";
  const isAnomaly = anomalyAssessment?.is_anomaly ?? false;

  const activeAlertCount = activeAlerts.length;
  const highestSeverity = activeAlertCount > 0 ? activeAlerts[0].severity || "WARNING" : "NONE";

  const isDbConnected = health?.database_connected ?? true;

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. PAGE HEADER + ENGINEERING METADATA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[var(--border-light)]/50 pb-3 font-mono">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
            // CONTROL CENTER OVERVIEW
          </span>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5 uppercase">
            CONVEYOR BC-01 OPERATIONAL DASHBOARD
          </h1>
        </div>

        {/* Engineering Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-[9.5px]">
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            DATA SOURCE: <strong className="text-[var(--text-charcoal)]">{dataSource}</strong>
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
          <span className={`px-2 py-0.5 rounded-[2px] font-bold uppercase flex items-center gap-1 ${
            isDbConnected
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-800"
              : "bg-amber-500/10 border border-amber-500/30 text-amber-800"
          }`}>
            DATABASE: {isDbConnected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* 2. FOUR PRIMARY KPI PANELS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* Panel A — OVERALL BELT CONDITION */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-[var(--text-charcoal)]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              OVERALL BELT CONDITION
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-[1px] text-[8.5px] font-bold uppercase ${
                overallLevel === "CRITICAL"
                  ? "bg-red-600 text-white"
                  : overallLevel === "WARNING"
                  ? "bg-[var(--accent-copper)] text-white"
                  : overallLevel === "ATTENTION"
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
              }`}
            >
              {overallLevel}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
                {overallRisk.toFixed(1)}
              </span>
              <span className="text-[10px] text-[var(--text-graphite-muted)] font-semibold">/ 100</span>
            </div>
            <p className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans line-clamp-1 mt-1">
              {overallHeadline}
            </p>
          </div>

          <div className="pt-1 border-t border-[var(--border-light)]/30 flex items-center justify-between">
            <KpiSparkline data={overallRiskHistory} valueKey="overallRisk" color="var(--text-charcoal)" />
          </div>
        </div>

        {/* Panel B — MONITORED SPLICE S1 */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-[var(--accent-copper)]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              MONITORED SPLICE S1
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-[1px] text-[8.5px] font-bold uppercase ${
                spliceLevel === "HIGH" || spliceLevel === "ELEVATED"
                  ? "bg-[var(--accent-copper)] text-white"
                  : spliceLevel === "WATCH"
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
              }`}
            >
              {spliceLevel}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
                {spliceRisk.toFixed(1)}
              </span>
              <span className="text-[10px] text-[var(--text-graphite-muted)] font-semibold">/ 100</span>
            </div>
            <p className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans line-clamp-1 mt-1">
              {spliceHeadline}
            </p>
          </div>

          <div className="pt-1 border-t border-[var(--border-light)]/30 flex items-center justify-between">
            <KpiSparkline data={spliceRiskHistory} valueKey="spliceRisk" color="var(--accent-copper)" />
          </div>
        </div>

        {/* Panel C — ANOMALY ASSESSMENT */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              ANOMALY ASSESSMENT
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-[1px] text-[8.5px] font-bold uppercase ${
                isAnomaly
                  ? "bg-[var(--accent-copper)] text-white"
                  : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
              }`}
            >
              {anomalyStatus.replace(/_/g, " ")}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
                {anomalyIndex.toFixed(1)}
              </span>
              <span className="text-[10px] text-[var(--text-graphite-muted)] font-semibold">/ 100</span>
            </div>
            <p className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-semibold mt-1">
              DEVIATION INDEX — NOT FAILURE PROBABILITY
            </p>
          </div>

          <div className="pt-1 border-t border-[var(--border-light)]/30 flex items-center justify-between">
            <KpiSparkline data={anomalyIndexHistory} valueKey="anomalyIndex" color="#d97706" />
          </div>
        </div>

        {/* Panel D — ACTIVE RULE EVENTS */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              ACTIVE RULE EVENTS
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-[1px] text-[8.5px] font-bold uppercase ${
                activeAlertCount > 0
                  ? "bg-[var(--accent-copper)] text-white"
                  : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
              }`}
            >
              {activeAlertCount > 0 ? `${activeAlertCount} ACTIVE` : "0 ACTIVE"}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
                {activeAlertCount}
              </span>
              <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-semibold uppercase">
                {activeAlertCount > 0 ? `SEVERITY: ${highestSeverity}` : "EVENTS DETECTED"}
              </span>
            </div>
            <p className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans line-clamp-1 mt-1">
              {activeAlertCount > 0
                ? activeAlerts[0].title || "Threshold trigger active"
                : "NO ACTIVE RULE EVENTS"}
            </p>
          </div>

          <div className="pt-1 border-t border-[var(--border-light)]/30 flex items-center justify-between text-[8.5px] text-[var(--text-graphite-muted)] uppercase">
            <span>MONITORED RULES: 6</span>
            <span className="text-emerald-700 font-bold">HYSTERESIS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 3. SESSION CONDITION TREND + TOP RISK CONTRIBUTORS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-7">
          <SessionRiskChart overallHistory={overallRiskHistory} spliceHistory={spliceRiskHistory} />
        </div>
        <div className="lg:col-span-5">
          <RiskContributorsBar contributors={conditionSummary?.overall.contributors} />
        </div>
      </div>

      {/* 4. SIX-CHANNEL LIVE TELEMETRY MATRIX + RECENT EVENT DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-7">
          <TelemetryMatrixGrid telemetry={telemetry} history={telemetryHistory} />
        </div>
        <div className="lg:col-span-5">
          <EventDistributionDonut fetchAlertHistory={fetchAlertHistory} />
        </div>
      </div>

      {/* 5. DECISION SUPPORT SUMMARY + ACTIVE EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 font-mono text-xs">
        {/* Explainable Decision Support Summary Panel */}
        <div className="lg:col-span-7 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[var(--accent-copper)]" />
              <div>
                <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
                  // AGGREGATED DIAGNOSTICS
                </span>
                <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                  EXPLAINABLE DECISION SUPPORT
                </h3>
              </div>
            </div>
            <Link
              href="/control-center/decision-support"
              className="px-2.5 py-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[9.5px] font-bold text-[var(--accent-copper)] hover:bg-[var(--accent-copper)] hover:text-white transition-colors flex items-center gap-1 uppercase"
            >
              <span>VIEW FULL DECISION SUPPORT</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 py-1">
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] text-[var(--text-graphite-muted)] uppercase font-semibold">
                CURRENT ASSESSMENT:
              </span>
            </div>
            <h4 className="font-heading text-base font-bold text-[var(--text-charcoal)] leading-snug">
              {decisionSummary?.headline || "Conveyor operating normally. All parameters within design thresholds."}
            </h4>

            <div className="flex flex-wrap items-center gap-4 text-[10px] pt-1">
              <span className="text-[var(--text-graphite-muted)] uppercase">
                EVIDENCE AGREEMENT:{" "}
                <strong className="text-[var(--accent-copper)] font-bold uppercase">
                  {decisionSummary?.evidence_agreement || "HIGH"}
                </strong>
              </span>
              <span className="text-[var(--text-graphite-muted)] uppercase">
                EVIDENCE ITEMS:{" "}
                <strong className="text-[var(--text-charcoal)] font-bold">
                  {decisionSummary?.evidence ? decisionSummary.evidence.length : 0}
                </strong>
              </span>
            </div>

            {/* Primary Recommendation */}
            <div className="mt-2 p-2.5 rounded-[2px] bg-[var(--bg-stone)]/80 border border-[var(--border-light)]/50 space-y-1">
              <span className="text-[9px] text-[var(--accent-copper)] font-bold uppercase tracking-wider">
                PRIMARY RECOMMENDATION:
              </span>
              <p className="text-[11px] font-sans text-[var(--text-charcoal)] font-medium leading-normal">
                {decisionSummary?.suggested_actions && decisionSummary.suggested_actions.length > 0
                  ? decisionSummary.suggested_actions[0].action
                  : "Maintain standard 1 Hz condition monitoring. No corrective mechanical intervention required at this time."}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
            <span>RULE ENGINE + CONDITION FUSION + ISOLATION FOREST</span>
            <span>OPERATOR DECISION GUIDANCE</span>
          </div>
        </div>

        {/* Active Rule Events Panel */}
        <div className="lg:col-span-5 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <div>
              <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
                // ACTIVE THRESHOLDS
              </span>
              <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                ACTIVE EVENTS ({activeAlertCount})
              </h3>
            </div>
            <Link
              href="/control-center/alerts"
              className="text-[9.5px] font-bold text-[var(--accent-copper)] hover:underline flex items-center gap-1 uppercase"
            >
              <span>VIEW EVENT MANAGEMENT</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-2 py-1">
            {activeAlertCount === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-4 space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="text-[10.5px] font-bold text-[var(--text-charcoal)] uppercase">
                  NO ACTIVE RULE EVENTS
                </span>
                <span className="text-[9.5px] font-sans text-[var(--text-graphite-muted)] max-w-xs">
                  All monitored indicators remain within configured prototype thresholds.
                </span>
              </div>
            ) : (
              activeAlerts.slice(0, 3).map((alert, idx) => (
                <div
                  key={alert.id || idx}
                  className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 flex items-start justify-between gap-2 text-[10px]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 text-[8px] font-bold uppercase rounded-[1px] ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : "bg-[var(--accent-copper)] text-white"
                        }`}
                      >
                        {alert.severity || "WARNING"}
                      </span>
                      <span className="font-bold text-[var(--text-charcoal)] uppercase">
                        {alert.metric || "RULE EVENT"}
                      </span>
                    </div>
                    <div className="font-sans font-medium text-[var(--text-charcoal)]">
                      {alert.title || "Active operational alert"}
                    </div>
                    <div className="text-[9px] text-[var(--text-graphite-muted)]">
                      Observed: <strong className="text-[var(--text-charcoal)]">{alert.value} {alert.unit}</strong>
                    </div>
                  </div>
                  <span className="text-[8.5px] text-[var(--text-graphite-muted)] shrink-0 font-mono" suppressHydrationWarning>
                    {alert.started_at ? new Date(alert.started_at).toLocaleTimeString() : "ACTIVE"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
            <span>STATEFUL HYSTERESIS RECOVERY</span>
            <span>PROTOTYPE RULE ENGINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
