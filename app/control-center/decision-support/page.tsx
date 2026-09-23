"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  Layers,
  Wrench,
  ArrowRight,
  Cpu,
  Sliders,
  CheckCircle2,
  Info,
  HelpCircle,
  Clock,
  Compass,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";

// Project component context mapping based on telemetry channels
const channelComponentMap: Record<string, string> = {
  temperature: "DRIVE HEAD / MOTOR BEARING",
  vibration: "DRIVE HEAD / MAIN PULLEY",
  current: "DRIVE HEAD / MOTOR DRIVE",
  speed: "BELT SECTION A / MAIN DRIVE",
  alignment: "BELT SECTION B / TRACKING ZONE",
  load: "TAIL / LOADING CHUTE",
};

// Known baseline statistics for 6 channels (matching backend model)
const baselineStats: Record<string, { mean: number; std: number; unit: string }> = {
  temperature: { mean: 41.0, std: 2.5, unit: "°C" },
  vibration: { mean: 0.27, std: 0.04, unit: "g" },
  current: { mean: 4.15, std: 0.25, unit: "A" },
  speed: { mean: 1.8, std: 0.08, unit: "m/s" },
  alignment: { mean: 0.0, std: 0.25, unit: "mm" },
  load: { mean: 60.0, std: 5.0, unit: "%" },
};

export default function DecisionSupportPage() {
  const { decisionSummary, conditionSummary, anomalyAssessment, activeAlerts, telemetry, lastUpdated, dataSource } =
    useControlCenterData();

  // Extract decision values from backend (or fallback)
  const level = decisionSummary?.level || "NORMAL";
  const headline = decisionSummary?.headline || "Conveyor system operating within normal baseline parameters.";
  const agreement = decisionSummary?.evidence_agreement || "HIGH";
  const rawEvidence = decisionSummary?.evidence || [];
  const rawActions = decisionSummary?.suggested_actions || [];

  // Extract Condition & Anomaly values
  const overallRisk = conditionSummary?.overall.risk_index ?? 12.5;
  const overallLevel = conditionSummary?.overall.level || "NORMAL";
  const spliceRisk = conditionSummary?.splice.risk_index ?? 11.0;
  const spliceLevel = conditionSummary?.splice.level || "NORMAL";
  const conditionContributors = conditionSummary?.overall.contributors || [];

  const anomalyIndex = anomalyAssessment?.anomaly_index ?? 7.2;
  const rawDecisionScore = anomalyAssessment?.decision_score ?? 0.2268;
  const patternStatus = anomalyAssessment?.status || (anomalyAssessment?.is_anomaly ? "ANOMALOUS_PATTERN" : "NORMAL_PATTERN");
  const topDeviations = anomalyAssessment?.top_deviations || [];

  // Current 6-channel values
  const currentTelemetry = {
    temperature: telemetry?.temperature ?? 41.2,
    vibration: telemetry?.vibration ?? 0.28,
    current: telemetry?.current ?? 4.16,
    speed: telemetry?.speed ?? 1.8,
    alignment: telemetry?.alignment ?? 0.1,
    load: telemetry?.load ?? 59.8,
  };

  // Build 6-channel Evidence Matrix
  const evidenceMatrix = Object.entries(baselineStats).map(([metric, stat]) => {
    const val = (currentTelemetry as any)[metric] ?? 0;
    const alert = activeAlerts.find((a) => a.metric.toLowerCase() === metric.toLowerCase());
    const ruleStatus = alert ? alert.severity : "NORMAL";

    const contrib = conditionContributors.find((c) => c.metric.toLowerCase() === metric.toLowerCase());
    const conditionContribRisk = contrib ? contrib.risk : Math.max(2, Math.round((Math.abs(val - stat.mean) / stat.std) * 5));

    const zScore = stat.std > 0 ? (val - stat.mean) / stat.std : 0;
    const absZ = Math.abs(zScore);

    let overallEval = "LOW";
    if (alert || absZ >= 2.0 || conditionContribRisk >= 30) {
      overallEval = "HIGH";
    } else if (absZ >= 1.0 || conditionContribRisk >= 15) {
      overallEval = "MODERATE";
    }

    return {
      metric: metric.toUpperCase(),
      component: channelComponentMap[metric] || "CONVEYOR STRUCTURE",
      value: val,
      unit: stat.unit,
      ruleStatus,
      conditionRisk: conditionContribRisk,
      zScore,
      absZ,
      overallEval,
    };
  });

  // Default suggested actions if backend actions array is empty
  const displayActions =
    rawActions.length > 0
      ? rawActions
      : [
          {
            priority: "ROUTINE" as const,
            action: "Continue standard continuous telemetry monitoring and routine scheduled maintenance.",
          },
        ];

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. TOP PAGE HEADER & TECHNICAL METADATA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-3 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // DECISION SUPPORT
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            EXPLAINABLE CONDITION ASSESSMENT
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono pt-0.5">
            Combined evidence from configured rule monitoring, multi-sensor condition assessment and anomaly detection translated into operator-facing guidance.
          </div>
        </div>

        {/* Technical Metadata Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs uppercase">
            ASSESSMENT:{" "}
            <span
              className={
                level === "CRITICAL"
                  ? "text-red-700 font-bold"
                  : level === "WARNING"
                  ? "text-[var(--accent-copper)] font-bold"
                  : level === "ATTENTION"
                  ? "text-amber-800 font-bold"
                  : "text-emerald-800 font-bold"
              }
            >
              {level}
            </span>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            AGREEMENT: <strong className="text-[var(--accent-copper)]">{agreement}</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            ACTIVE RULES: <strong>{activeAlerts.length}</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            RISK: <strong>{overallRisk.toFixed(0)} / 100</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            ANOMALY INDEX: <strong>{anomalyIndex.toFixed(1)} / 100</strong>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY CURRENT ASSESSMENT & EVIDENCE AGREEMENT */}
      <div className="p-4.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 border-l-4 border-l-[var(--accent-copper)] shadow-xs space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] text-[var(--accent-copper)] font-bold tracking-wider uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>CURRENT ASSESSMENT</span>
          </span>
          <span
            className={`px-3 py-0.5 rounded-[2px] text-[9.5px] font-bold uppercase tracking-wider ${
              level === "CRITICAL"
                ? "bg-red-600 text-white"
                : level === "WARNING"
                ? "bg-[var(--accent-copper)] text-white"
                : level === "ATTENTION"
                ? "bg-amber-500/20 text-amber-950 border border-amber-500/40"
                : "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30"
            }`}
          >
            {level}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
            DIAGNOSTIC HEADLINE:
          </div>
          <h2 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] leading-tight">
            {headline}
          </h2>
        </div>

        {/* Evidence Agreement Scale */}
        <div className="space-y-1.5 pt-2 border-t border-[var(--border-light)]/30">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[var(--text-graphite-muted)] uppercase font-semibold">EVIDENCE AGREEMENT:</span>
            <span className="font-bold text-[var(--accent-copper)] uppercase">CURRENT LEVEL // {agreement} AGREEMENT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--border-light)]/40 divide-y md:divide-y-0 md:divide-x divide-[var(--border-light)]/40 rounded-[2px] bg-[var(--bg-stone)] text-[9px]">
            {/* HIGH */}
            <div
              className={`p-2.5 font-mono ${
                agreement === "HIGH"
                  ? "bg-white text-[var(--text-charcoal)] font-bold border-t-2 border-t-[var(--accent-copper)]"
                  : "text-[var(--text-graphite-muted)] opacity-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px]">
                <span className={`w-2 h-2 rounded-full ${agreement === "HIGH" ? "bg-[var(--accent-copper)]" : "bg-black/20"}`} />
                <span>HIGH AGREEMENT</span>
              </div>
              <div className="pt-1 font-sans text-[9px] leading-tight">
                Multiple independent evidence sources support a consistent condition interpretation across rule, condition risk, and anomaly status.
              </div>
            </div>

            {/* MODERATE */}
            <div
              className={`p-2.5 font-mono ${
                agreement === "MODERATE"
                  ? "bg-white text-[var(--text-charcoal)] font-bold border-t-2 border-t-amber-600"
                  : "text-[var(--text-graphite-muted)] opacity-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px]">
                <span className={`w-2 h-2 rounded-full ${agreement === "MODERATE" ? "bg-amber-600" : "bg-black/20"}`} />
                <span>MODERATE AGREEMENT</span>
              </div>
              <div className="pt-1 font-sans text-[9px] leading-tight">
                Some evidence sources indicate elevated concern while others remain within normal operating thresholds. Operator review advised.
              </div>
            </div>

            {/* LOW */}
            <div
              className={`p-2.5 font-mono ${
                agreement === "LOW"
                  ? "bg-white text-[var(--text-charcoal)] font-bold border-t-2 border-t-black/60"
                  : "text-[var(--text-graphite-muted)] opacity-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px]">
                <span className={`w-2 h-2 rounded-full ${agreement === "LOW" ? "bg-black/60" : "bg-black/20"}`} />
                <span>LOW AGREEMENT</span>
              </div>
              <div className="pt-1 font-sans text-[9px] leading-tight">
                Evidence is limited or contradictory across engines. Detailed telemetry inspection recommended before action.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THREE-ENGINE EVIDENCE AGGREGATION PIPELINE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>THREE-ENGINE EVIDENCE AGGREGATION</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">INDEPENDENT EVIDENCE SOURCES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
          {/* Engine 1: Rule Engine */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1.5">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
              <span className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">01 / RULE ENGINE</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-[2px] bg-white border border-[var(--border-light)]/40 font-bold">
                DETERMINISTIC
              </span>
            </div>
            <div className="font-bold text-[var(--text-charcoal)]">Configured Limit &amp; Hysteresis</div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] space-y-0.5 pt-0.5 font-mono">
              <div className="flex justify-between">
                <span>Active Events:</span>
                <strong className={activeAlerts.length > 0 ? "text-[var(--accent-copper)]" : "text-emerald-800"}>
                  {activeAlerts.length}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Highest Severity:</span>
                <strong className="text-[var(--text-charcoal)]">
                  {activeAlerts.length > 0 ? activeAlerts[0].severity : "NONE (NORMAL)"}
                </strong>
              </div>
            </div>
          </div>

          {/* Engine 2: Condition Engine */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1.5">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
              <span className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">02 / CONDITION ENGINE</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-[2px] bg-white border border-[var(--border-light)]/40 font-bold">
                MULTI-SENSOR
              </span>
            </div>
            <div className="font-bold text-[var(--text-charcoal)]">Multi-Sensor Risk Fusion</div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] space-y-0.5 pt-0.5 font-mono">
              <div className="flex justify-between">
                <span>Overall Belt Risk:</span>
                <strong className="text-[var(--text-charcoal)]">{overallRisk.toFixed(0)} / 100 ({overallLevel})</strong>
              </div>
              <div className="flex justify-between">
                <span>Splice S1 Risk:</span>
                <strong className="text-[var(--text-charcoal)]">{spliceRisk.toFixed(0)} / 100 ({spliceLevel})</strong>
              </div>
            </div>
          </div>

          {/* Engine 3: Anomaly Engine */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1.5">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
              <span className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">03 / ANOMALY ASSESSMENT</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-[2px] bg-white border border-[var(--border-light)]/40 font-bold">
                ISOLATION FOREST
              </span>
            </div>
            <div className="font-bold text-[var(--text-charcoal)]">Multivariate Baseline Deviation</div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] space-y-0.5 pt-0.5 font-mono">
              <div className="flex justify-between">
                <span>Pattern Status:</span>
                <strong className={anomalyAssessment?.is_anomaly ? "text-[var(--accent-copper)]" : "text-emerald-800"}>
                  {patternStatus.replace(/_/g, " ")}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Anomaly Index:</span>
                <strong className="text-[var(--text-charcoal)]">{anomalyIndex.toFixed(1)} / 100</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Thin Engineering Connector Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] text-[var(--text-graphite-muted)] pt-1 uppercase border-t border-[var(--border-light)]/20">
          <span>RULE TRIGGERS</span>
          <span>+</span>
          <span>CONDITION RISK</span>
          <span>+</span>
          <span>ANOMALY DEVIATION</span>
          <span>→</span>
          <span className="font-bold text-[var(--text-charcoal)]">SYNTHESIZED EVALUATION</span>
          <span>→</span>
          <span className="font-bold text-[var(--accent-copper)]">EXPLAINABLE DECISION SUPPORT</span>
        </div>
      </div>

      {/* 4. STRUCTURED EVIDENCE LIST & RECOMMENDED ACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Left Column: Structured Evidence List (col-span-7) */}
        <div className="lg:col-span-7 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>STRUCTURED EVIDENCE ({rawEvidence.length > 0 ? rawEvidence.length : "0 ABNORMAL"})</span>
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
              RECORDED EVIDENCE ITEMS
            </span>
          </div>

          {rawEvidence.length > 0 ? (
            <div className="space-y-2">
              {rawEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[9px] font-bold text-[var(--text-charcoal)] uppercase">
                        SOURCE: {ev.source}
                      </span>
                      <span className="font-bold text-[var(--text-charcoal)] text-[11px]">
                        {ev.title}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase ${
                        ev.severity === "CRITICAL"
                          ? "bg-red-600 text-white"
                          : ev.severity === "WARNING"
                          ? "bg-[var(--accent-copper)] text-white"
                          : "bg-amber-500/20 text-amber-950 border border-amber-500/40"
                      }`}
                    >
                      {ev.severity}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[var(--text-charcoal)] opacity-90 leading-relaxed">
                    {ev.detail}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1 text-center font-mono">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 mx-auto opacity-80" />
              <div className="text-[11px] font-bold text-[var(--text-charcoal)] uppercase pt-1">
                NO ABNORMAL EVIDENCE RECORDED
              </div>
              <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans max-w-md mx-auto">
                All monitored indicators remain within current configured limits and learned normal baseline behavior.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recommended Inspection Actions (col-span-5) */}
        <div className="lg:col-span-5 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>RECOMMENDED INSPECTION ACTIONS</span>
            </span>
          </div>

          <div className="space-y-2">
            {displayActions.map((act, idx) => (
              <div
                key={idx}
                className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">
                    PRIORITY: {act.priority}
                  </span>
                  <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">
                    OPERATOR GUIDANCE
                  </span>
                </div>
                <p className="font-sans text-[11px] text-[var(--text-charcoal)] font-semibold leading-relaxed">
                  {act.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. SIX-CHANNEL EVIDENCE MATRIX TABLE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
            6-CHANNEL EVIDENCE MATRIX
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">
            CROSS-ENGINE EVIDENCE SYNTHESIS BY CHANNEL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-light)]/50 text-[9px] text-[var(--text-graphite-muted)] uppercase">
                <th className="py-2 px-2 font-bold">TELEMETRY CHANNEL</th>
                <th className="py-2 px-2 font-bold">MONITORED COMPONENT</th>
                <th className="py-2 px-2 font-bold text-right">CURRENT VALUE</th>
                <th className="py-2 px-2 font-bold text-center">RULE STATUS</th>
                <th className="py-2 px-2 font-bold text-right">CONDITION RISK</th>
                <th className="py-2 px-2 font-bold text-right">BASELINE DEVIATION</th>
                <th className="py-2 px-2 font-bold text-center">OVERALL EVIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]/20">
              {evidenceMatrix.map((row) => (
                <tr key={row.metric} className="hover:bg-black/[0.02]">
                  <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">{row.metric}</td>
                  <td className="py-2 px-2 text-[9px] text-[var(--text-graphite-muted)]">{row.component}</td>
                  <td className="py-2 px-2 text-right font-mono font-semibold">
                    {row.value} {row.unit}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[2px] text-[8.5px] font-bold ${
                        row.ruleStatus !== "NORMAL"
                          ? "bg-[var(--accent-copper)] text-white"
                          : "bg-emerald-500/10 text-emerald-900 border border-emerald-500/30"
                      }`}
                    >
                      {row.ruleStatus}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-[var(--text-charcoal)]">
                    {row.conditionRisk} / 100
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-[var(--text-charcoal)]">
                    {row.zScore >= 0 ? `+${row.zScore.toFixed(2)}` : row.zScore.toFixed(2)}σ
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[2px] text-[8.5px] font-bold ${
                        row.overallEval === "HIGH"
                          ? "bg-[var(--accent-copper)] text-white"
                          : row.overallEval === "MODERATE"
                          ? "bg-amber-500/10 text-amber-900 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-900 border border-emerald-500/30"
                      }`}
                    >
                      {row.overallEval}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. SUPPORTING EVIDENCE BREAKDOWN (Rule, Condition, Anomaly Panels) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        {/* Panel 1: Rule Evidence Visual */}
        <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
              RULE EVIDENCE
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)]">ACTIVE TRIGGERS</span>
          </div>

          {activeAlerts.length > 0 ? (
            <div className="space-y-1.5">
              {activeAlerts.map((al) => (
                <div key={al.id} className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-[var(--text-charcoal)]">{al.metric.toUpperCase()}</span>
                    <span className="text-[var(--accent-copper)]">{al.severity}</span>
                  </div>
                  <div className="text-[8.5px] text-[var(--text-graphite-muted)] font-sans">{al.message}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center bg-[var(--bg-stone)] rounded-[2px] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[10px] font-bold text-[var(--text-charcoal)]">NO ACTIVE RULE TRIGGERS</div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] font-sans">
                Configured engineering limits are currently not exceeded.
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Condition Contributors Visual */}
        <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
              CONDITION RISK CONTRIBUTORS
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)]">MULTI-SENSOR FUSION</span>
          </div>

          {conditionContributors.length > 0 ? (
            <div className="space-y-1.5">
              {conditionContributors.slice(0, 3).map((c, idx) => (
                <div key={idx} className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 flex justify-between items-center text-[9px]">
                  <div>
                    <span className="font-bold text-[var(--text-charcoal)] block uppercase">{c.metric}</span>
                    <span className="text-[8px] text-[var(--text-graphite-muted)] font-sans">{c.message}</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--accent-copper)]">{c.risk} pts</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center bg-[var(--bg-stone)] rounded-[2px] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[10px] font-bold text-[var(--text-charcoal)]">NORMAL RISK PROFILE</div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] font-sans">
                No high risk contributors identified.
              </div>
            </div>
          )}
        </div>

        {/* Panel 3: Baseline Deviations Visual */}
        <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
              BASELINE DEVIATION EVIDENCE
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)]">ISOLATION FOREST</span>
          </div>

          {topDeviations.length > 0 ? (
            <div className="space-y-1.5">
              {topDeviations.slice(0, 3).map((d, idx) => (
                <div key={idx} className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 flex justify-between items-center text-[9px]">
                  <div>
                    <span className="font-bold text-[var(--text-charcoal)] block uppercase">{d.metric}</span>
                    <span className="text-[8px] text-[var(--text-graphite-muted)]">
                      Current: {d.value} {d.unit} (μ: {d.mean})
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[var(--accent-copper)]">{d.deviation.toFixed(1)}σ</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center bg-[var(--bg-stone)] rounded-[2px] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[10px] font-bold text-[var(--text-charcoal)]">NORMAL BASELINE</div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] font-sans">
                Telemetry matches learned normal operating pattern.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. WHY THIS RECOMMENDATION? EXPLANATION PANEL */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>WHY THIS RECOMMENDATION?</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">SYNTHESIZED RATIONALE</span>
        </div>

        <div className="font-sans text-[11px] text-[var(--text-charcoal)] leading-relaxed space-y-1.5">
          <p>The current operator recommendation is synthesized from three independent evidence engines:</p>
          <ul className="list-disc list-inside space-y-1 font-mono text-[10px] text-[var(--text-charcoal)] pl-1">
            <li>
              <strong className="text-[var(--text-charcoal)]">Rule Engine:</strong>{" "}
              {activeAlerts.length > 0
                ? `${activeAlerts.length} active threshold trigger(s) detected.`
                : "No active threshold violations recorded."}
            </li>
            <li>
              <strong className="text-[var(--text-charcoal)]">Condition Engine:</strong>{" "}
              Overall Belt Risk Index is {overallRisk.toFixed(0)} / 100 ({overallLevel} condition).
            </li>
            <li>
              <strong className="text-[var(--text-charcoal)]">Anomaly Assessment:</strong>{" "}
              Multivariate Isolation Forest pattern is {patternStatus.replace(/_/g, " ")} with Anomaly Index {anomalyIndex.toFixed(1)} / 100.
            </li>
          </ul>
          <p className="pt-1 text-[10.5px] font-semibold text-[var(--text-charcoal)]">
            Conclusion: {headline}
          </p>
        </div>
      </div>

      {/* 8. SYSTEM WORKFLOW BANNER (OBSERVE -> CORRELATE -> ASSESS -> RECOMMEND) */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">01 OBSERVE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">02 CORRELATE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">03 ASSESS</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)] text-white">04 RECOMMEND</span>
        </div>
        <div className="text-[9.5px] text-[var(--text-graphite-muted)] italic font-sans">
          Multiple independent evidence sources are evaluated before surfacing operator inspection recommendations.
        </div>
      </div>

      {/* 9. DATA SOURCE & SCIENTIFIC DISCLOSURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        <div className="p-3 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 space-y-1">
          <div className="text-[9px] font-bold text-[var(--text-graphite-muted)] uppercase">DATA SOURCE DISCLOSURE</div>
          <div className="text-[10px] text-[var(--text-charcoal)] font-bold">
            CURRENT INPUT SOURCE: {dataSource}
          </div>
          <div className="text-[8.5px] text-[var(--text-graphite-muted)] font-sans">
            Physical hardware simulated. Decision Support validates software evidence fusion architecture.
          </div>
        </div>

        <div className="p-3 rounded-[2px] bg-amber-500/[0.06] border border-amber-500/20 text-amber-950 space-y-1">
          <div className="text-[9px] font-bold text-amber-900 uppercase">SCIENTIFIC DISCLOSURE</div>
          <div className="text-[9.5px] font-sans leading-tight">
            Decision Support translates multi-engine evidence into operator inspection guidance. It does not execute automated maintenance or guarantee component diagnosis.
          </div>
        </div>
      </div>

      {/* 10. CROSS-ROUTE NAVIGATION HANDOFF CTAS */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase tracking-wider">
          CROSS-WORKSPACE INSPECTION NAVIGATION
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/control-center/alerts"
            className="p-3 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="text-[10px] font-bold text-[var(--text-charcoal)]">EVENT MANAGEMENT</div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Rule alerts &amp; event history</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-copper)] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/control-center/monitoring"
            className="p-3 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="text-[10px] font-bold text-[var(--text-charcoal)]">LIVE MONITORING</div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Real-time sensor graphs</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-copper)] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/control-center/intelligence"
            className="p-3 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 flex items-center justify-between group transition-colors"
          >
            <div>
              <div className="text-[10px] font-bold text-[var(--text-charcoal)]">INTELLIGENCE ML</div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Isolation Forest model analysis</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-copper)] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
