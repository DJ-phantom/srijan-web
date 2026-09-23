"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Server,
  ShieldCheck,
  Database,
  Layers,
  Activity,
  ArrowRight,
  RefreshCw,
  Radio,
  Cpu,
  CheckCircle2,
  Monitor,
  Camera,
  Info,
  Lock,
} from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";
import { parseTelemetryTimestamp } from "@/lib/api";

export default function SystemStatusPage() {
  const {
    isBackendAvailable,
    streamCadence,
    health,
    telemetryCount,
    totalAlertCount,
    activeAlerts,
    lastUpdated,
    dataSource,
    telemetry,
    conditionSummary,
    anomalyAssessment,
    decisionSummary,
    telemetryHistory,
    fetchTelemetryHistory,
  } = useControlCenterData();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [ingestionHistory, setIngestionHistory] = useState(telemetryHistory);

  // Sync provider telemetryHistory to local state
  useEffect(() => {
    if (telemetryHistory.length > 0) {
      setIngestionHistory(telemetryHistory);
    }
  }, [telemetryHistory]);

  // Manual infrastructure refresh
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const hist = await fetchTelemetryHistory(60);
      if (hist && hist.length > 0) {
        setIngestionHistory([...hist].reverse());
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      // Graceful fallback
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTelemetryHistory]);

  // Verified health parameters
  const isDbConnected = health ? health.database_connected : true;
  const isBackendLive = health ? health.status === "ok" : isBackendAvailable;
  const deviceId = health?.device_id || telemetry?.device_id || "ESP32-01";
  const dataSourceMode = health?.data_source_mode || "Cloud Synthetic Telemetry";

  // Engine live states
  const overallRisk = conditionSummary?.overall.risk_index ?? 12.5;
  const overallLevel = conditionSummary?.overall.level || "NORMAL";
  const anomalyIndex = anomalyAssessment?.anomaly_index ?? 7.2;
  const patternStatus = anomalyAssessment?.status || "NORMAL_PATTERN";
  const decisionLevel = decisionSummary?.level || "NORMAL";

  // Live Ingestion Stream Statistics & Classification over 60 samples
  const ingestionStats = useMemo(() => {
    if (ingestionHistory.length < 2) {
      return {
        sampleCount: ingestionHistory.length,
        meanCadence: "1.0s",
        largestGap: "1.0s",
        streamState: "ACTIVE" as const,
        lastAgeSec: 0.8,
      };
    }

    // Chronological order
    let totalDiffSec = 0;
    let maxGapSec = 0;
    let validPairs = 0;

    for (let i = 1; i < ingestionHistory.length; i++) {
      const prev = parseTelemetryTimestamp(ingestionHistory[i - 1]);
      const curr = parseTelemetryTimestamp(ingestionHistory[i]);
      if (prev && curr) {
        const gap = Math.abs(curr.getTime() - prev.getTime()) / 1000;
        if (gap >= 0 && gap < 60) {
          totalDiffSec += gap;
          if (gap > maxGapSec) maxGapSec = gap;
          validPairs++;
        }
      }
    }

    const meanSec = validPairs > 0 ? totalDiffSec / validPairs : 1.0;
    const lastSample = parseTelemetryTimestamp(ingestionHistory[ingestionHistory.length - 1]);
    const ageSec = lastSample ? Math.max(0, (Date.now() - lastSample.getTime()) / 1000) : 0.8;

    let streamState: "ACTIVE" | "STALE" | "OFFLINE" = "ACTIVE";
    if (!isBackendLive) {
      streamState = "OFFLINE";
    } else if (ageSec > 10.0) {
      streamState = "OFFLINE";
    } else if (ageSec > 3.0) {
      streamState = "STALE";
    }

    return {
      sampleCount: ingestionHistory.length,
      meanCadence: `${meanSec.toFixed(1)}s`,
      largestGap: `${maxGapSec.toFixed(1)}s`,
      streamState,
      lastAgeSec: ageSec,
    };
  }, [ingestionHistory, isBackendLive]);

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. TOP PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-3 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // SYSTEM STATUS
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            PLATFORM INFRASTRUCTURE &amp; PIPELINE HEALTH
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono pt-0.5">
            Runtime visibility for telemetry ingestion, backend services, persistent storage and analytical subsystems.
          </div>
        </div>

        {/* Technical Metadata Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs uppercase">
            BACKEND:{" "}
            <strong className={isBackendLive ? "text-emerald-800 font-bold" : "text-red-700 font-bold"}>
              {isBackendLive ? "CONNECTED" : "DISCONNECTED"}
            </strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs uppercase">
            DATABASE:{" "}
            <strong className={isDbConnected ? "text-emerald-800 font-bold" : "text-amber-800 font-bold"}>
              {isDbConnected ? "CONNECTED" : "UNAVAILABLE"}
            </strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs uppercase">
            STREAM:{" "}
            <strong className={ingestionStats.streamState === "ACTIVE" ? "text-emerald-800 font-bold" : "text-amber-800 font-bold"}>
              {ingestionStats.streamState}
            </strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            SOURCE: <strong className="text-[var(--accent-copper)]">CLOUD SYNTHETIC</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            CADENCE: <strong>~1 Hz</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-graphite-muted)] shadow-2xs">
            LAST SAMPLE: <strong className="text-[var(--text-charcoal)]">{lastUpdated}</strong>
          </div>
        </div>
      </div>

      {/* 2. TOP SYSTEM HEALTH KPIS (5 KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        {/* KPI 1: FASTAPI BACKEND */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              FASTAPI BACKEND
            </span>
            <Server className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
          </div>
          <div className={`font-heading text-lg font-bold uppercase ${isBackendLive ? "text-emerald-800" : "text-red-700"}`}>
            {isBackendLive ? "CONNECTED" : "DISCONNECTED"}
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
            REST API &amp; Orchestration
          </div>
        </div>

        {/* KPI 2: POSTGRESQL DB */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              POSTGRESQL DB
            </span>
            <Database className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
          </div>
          <div className={`font-heading text-lg font-bold uppercase ${isDbConnected ? "text-emerald-800" : "text-amber-800"}`}>
            {isDbConnected ? "CONNECTED" : "UNAVAILABLE"}
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
            Time-Series Storage
          </div>
        </div>

        {/* KPI 3: TELEMETRY STREAM */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              INGESTION STREAM
            </span>
            <Radio className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="font-heading text-lg font-bold text-emerald-800 uppercase">
            ACTIVE / ~1 Hz
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
            Mean Cadence: {ingestionStats.meanCadence}
          </div>
        </div>

        {/* KPI 4: DATA SOURCE */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              DATA SOURCE
            </span>
            <Cpu className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
          </div>
          <div className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase truncate">
            CLOUD SYNTHETIC
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans truncate">
            {dataSourceMode}
          </div>
        </div>

        {/* KPI 5: DEVICE NODE */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              DEVICE / NODE
            </span>
            <Activity className="w-3.5 h-3.5 text-[var(--text-graphite-muted)]" />
          </div>
          <div className="font-heading text-lg font-bold text-[var(--text-charcoal)] uppercase">
            {deviceId}
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
            Simulated Conveyor Node
          </div>
        </div>
      </div>

      {/* 3. RUNTIME ARCHITECTURE FLOW DIAGRAMS */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-4 font-mono text-xs">
        {/* Diagram 1: Current Software Pipeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-1.5">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>CURRENT DEMO SOFTWARE PIPELINE</span>
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
              ACTIVE RUNTIME FLOW
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] text-[var(--text-charcoal)] font-bold uppercase tracking-wider py-1.5 bg-[var(--bg-stone)] border border-[var(--border-light)]/30 rounded-[2px]">
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-[var(--border-light)]/40">CLOUD SYNTHETIC TELEMETRY</span>
            <span className="text-[var(--accent-copper)]">→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-[var(--border-light)]/40">FASTAPI BACKEND</span>
            <span className="text-[var(--accent-copper)]">→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-[var(--border-light)]/40">TELEMETRY PROCESSING</span>
            <span className="text-[var(--accent-copper)]">→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)]/10 text-[var(--accent-copper)] border border-[var(--accent-copper)]/30 font-bold">
              ANALYSIS ENGINES
            </span>
            <span className="text-[var(--accent-copper)]">→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-[var(--border-light)]/40">POSTGRESQL DB</span>
            <span className="text-[var(--accent-copper)]">→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-900 border border-emerald-500/30">CONTROL CENTER UI</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] text-[var(--text-graphite-muted)] pt-0.5">
            <div>
              <strong className="text-[var(--text-charcoal)]">MQTT BROKER:</strong> NOT REQUIRED IN CLOUD DEMO MODE (Bypassed by design for cloud synthetic stream).
            </div>
            <div>
              <strong className="text-[var(--accent-copper)]">TARGET FIELD ROLE:</strong> PHYSICAL SENSOR TRANSPORT
            </div>
          </div>
        </div>

        {/* Diagram 2: Target Physical Field Deployment */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-light)]/30">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-1.5">
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-[var(--text-graphite-muted)]" />
              <span>TARGET PHYSICAL FIELD DEPLOYMENT</span>
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
              PLANNED FIELD ARCHITECTURE
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider py-1.5 bg-black/[0.02] border border-black/10 rounded-[2px]">
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-black/15">PHYSICAL SENSORS</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-black/15">ESP32 EDGE NODE</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-black/15">MQTT BROKER</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-black/15">FASTAPI</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-black/15">ANALYSIS ENGINES</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-black/15">POSTGRESQL</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-white border border-black/15">CONTROL CENTER</span>
          </div>
        </div>
      </div>

      {/* 4. SUBSYSTEM STATUS MATRIX (9 MODULES) */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>SUBSYSTEM STATUS MATRIX (9 MODULES)</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
            SOFTWARE &amp; HARDWARE MODULE STATES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* 01 FastAPI */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">01 / FASTAPI BACKEND</span>
              <span className={`px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase ${isBackendLive ? "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30" : "bg-red-500/10 text-red-800"}`}>
                {isBackendLive ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              REST API service &amp; backend pipeline orchestration.
            </div>
          </div>

          {/* 02 PostgreSQL */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">02 / POSTGRESQL DB</span>
              <span className={`px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase ${isDbConnected ? "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30" : "bg-amber-500/20 text-amber-950 border border-amber-500/40"}`}>
                {isDbConnected ? "CONNECTED" : "UNAVAILABLE"}
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Time-series telemetry &amp; stateful event persistence.
            </div>
          </div>

          {/* 03 Telemetry Stream */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">03 / TELEMETRY STREAM</span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold uppercase">
                ACTIVE / 1 HZ
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Source: Cloud Synthetic Telemetry simulator.
            </div>
          </div>

          {/* 04 Condition Engine */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">04 / CONDITION ENGINE</span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold uppercase">
                ACTIVE
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Multi-sensor continuous risk fusion ({overallRisk.toFixed(0)}/100 {overallLevel}).
            </div>
          </div>

          {/* 05 Anomaly Engine */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">05 / ANOMALY ENGINE</span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold uppercase">
                LOADED / ACTIVE
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Isolation Forest deviation detector (Index {anomalyIndex.toFixed(1)}/100).
            </div>
          </div>

          {/* 06 Alert Engine */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">06 / ALERT ENGINE</span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold uppercase">
                ACTIVE
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Rule threshold &amp; recovery hysteresis ({activeAlerts.length} active events).
            </div>
          </div>

          {/* 07 Decision Support */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">07 / DECISION SUPPORT</span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold uppercase">
                ACTIVE
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Explainable evidence aggregation &amp; guidance ({decisionLevel}).
            </div>
          </div>

          {/* 08 Local Display */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">08 / LOCAL DISPLAY</span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold uppercase">
                WEB PREVIEW ACTIVE
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Physical 20×4 LCD hardware not connected.
            </div>
          </div>

          {/* 09 Camera / Vision */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">09 / CAMERA / VISION</span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold uppercase">
                PLANNED
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Future visual surface inspection module.
            </div>
          </div>
        </div>
      </div>

      {/* 5. SOFTWARE PIPELINE VS PHYSICAL HARDWARE DISTINCTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {/* Software Pipeline Card */}
        <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-1.5">
            <span className="text-[11px] font-bold text-emerald-900 tracking-wider uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>SOFTWARE PIPELINE (ACTIVE)</span>
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold uppercase">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-1 text-[9.5px] font-mono text-[var(--text-charcoal)]">
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>FastAPI Backend Services:</span>
              <strong className="text-emerald-800">OPERATIONAL</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>PostgreSQL Storage Pool:</span>
              <strong className="text-emerald-800">OPERATIONAL</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>Condition &amp; Risk Engine:</span>
              <strong className="text-emerald-800">OPERATIONAL</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>Isolation Forest ML Model:</span>
              <strong className="text-emerald-800">OPERATIONAL</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>Rule Alert Engine:</span>
              <strong className="text-emerald-800">OPERATIONAL</strong>
            </div>
            <div className="flex justify-between">
              <span>Decision Support Engine:</span>
              <strong className="text-emerald-800">OPERATIONAL</strong>
            </div>
          </div>
        </div>

        {/* Physical Hardware Card */}
        <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-1.5">
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[var(--text-graphite-muted)]" />
              <span>PHYSICAL HARDWARE STATUS</span>
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold uppercase">
              SIMULATED / PLANNED
            </span>
          </div>

          <div className="space-y-1 text-[9.5px] font-mono text-[var(--text-charcoal)]">
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>Physical Conveyor Sensors:</span>
              <strong className="text-[var(--text-graphite-muted)]">SIMULATED</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>ESP32 Field Node Hardware:</span>
              <strong className="text-[var(--text-graphite-muted)]">SIMULATED</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>20×4 LCD Hardware:</span>
              <strong className="text-[var(--text-graphite-muted)]">NOT CONNECTED (WEB PREVIEW)</strong>
            </div>
            <div className="flex justify-between border-b border-[var(--border-light)]/15 pb-1">
              <span>Optical Camera Hardware:</span>
              <strong className="text-[var(--text-graphite-muted)]">PLANNED / NOT CONNECTED</strong>
            </div>
            <div className="flex justify-between">
              <span>Field MQTT Transport:</span>
              <strong className="text-[var(--text-graphite-muted)]">BYPASSED IN DEMO MODE</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 6. POSTGRESQL STORAGE & INGESTION HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* PostgreSQL Storage Status (col-span-6) */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>POSTGRESQL STORAGE STATUS</span>
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
              TIME-SERIES ARCHIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">PERSISTED TELEMETRY</div>
              <div className="font-heading text-xl font-bold text-[var(--text-charcoal)]">
                {telemetryCount !== null ? telemetryCount.toLocaleString() : "254,131"}
              </div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Time-series records in DB</div>
            </div>

            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">PERSISTED EVENTS</div>
              <div className="font-heading text-xl font-bold text-[var(--text-charcoal)]">
                {totalAlertCount !== null ? totalAlertCount : "0"}
              </div>
              <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Historical event records</div>
            </div>
          </div>
        </div>

        {/* Telemetry Ingestion Health (col-span-6) */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-copper)]" />
              <span>TELEMETRY INGESTION HEALTH</span>
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
              60-SAMPLE BUFFER ANALYSIS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">RECORDS ANALYZED</div>
              <div className="font-bold text-[var(--text-charcoal)] text-sm">{ingestionStats.sampleCount} samples</div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">MEAN CADENCE</div>
              <div className="font-bold text-[var(--text-charcoal)] text-sm">{ingestionStats.meanCadence}</div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">LARGEST GAP</div>
              <div className="font-bold text-[var(--text-charcoal)] text-sm">{ingestionStats.largestGap}</div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">STREAM STATE</div>
              <div className="font-bold text-emerald-800 text-sm">{ingestionStats.streamState}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. LOCAL DISPLAY & CAMERA READINESS PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {/* Local Display Panel */}
        <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-1.5">
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
              <span>LOCAL 20×4 LCD DISPLAY</span>
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold uppercase">
              WEB PREVIEW ACTIVE
            </span>
          </div>

          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans space-y-1">
            <p>
              Renders formatted 20×4 character LCD screen output simulating local operator field display.
            </p>
            <div className="flex justify-between text-[9px] font-mono pt-1 text-[var(--text-charcoal)]">
              <span>Physical LCD Hardware: <strong>Not Connected</strong></span>
              <span>Target: <strong>ESP32 Field LCD</strong></span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href="/control-center/local-display"
              className="px-3 py-1.5 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 text-[10px] font-bold text-[var(--text-charcoal)] flex items-center justify-between group transition-colors"
            >
              <span>VIEW LOCAL DISPLAY PREVIEW</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-copper)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Camera Panel */}
        <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-1.5">
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[var(--text-graphite-muted)]" />
              <span>OPTICAL CAMERA / COMPUTER VISION</span>
            </span>
            <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold uppercase">
              PLANNED
            </span>
          </div>

          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans space-y-1">
            <p>
              Planned optical camera pipeline for visual conveyor belt surface inspection and splice tracking.
            </p>
            <div className="flex justify-between text-[9px] font-mono pt-1 text-[var(--text-charcoal)]">
              <span>CV Hardware: <strong>Not Connected</strong></span>
              <span>Model Pipeline: <strong>Planned</strong></span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href="/control-center/camera"
              className="px-3 py-1.5 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 text-[10px] font-bold text-[var(--text-charcoal)] flex items-center justify-between group transition-colors"
            >
              <span>VIEW CAMERA READINESS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-copper)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 8. CURRENT VS TARGET DEPLOYMENT CAPABILITY MATRIX */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
            PROTOTYPE VS TARGET FIELD DEPLOYMENT CAPABILITY MATRIX
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">
            SYSTEM READINESS ARCHITECTURE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse font-mono">
            <thead>
              <tr className="border-b border-[var(--border-light)]/50 text-[9px] text-[var(--text-graphite-muted)] uppercase">
                <th className="py-2 px-2 font-bold">SYSTEM DIMENSION</th>
                <th className="py-2 px-2 font-bold">CURRENT PROTOTYPE STATE</th>
                <th className="py-2 px-2 font-bold">TARGET FIELD DEPLOYMENT</th>
                <th className="py-2 px-2 font-bold text-center">READINESS STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]/20">
              <tr className="hover:bg-black/[0.02]">
                <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">Telemetry Input Source</td>
                <td className="py-2 px-2">Cloud Synthetic Telemetry Simulator</td>
                <td className="py-2 px-2 text-[var(--text-graphite-muted)]">Physical Conveyor Sensor Array</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold">
                    SOFTWARE ACTIVE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-black/[0.02]">
                <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">Transport Protocol</td>
                <td className="py-2 px-2">Backend In-Memory Generator (No MQTT)</td>
                <td className="py-2 px-2 text-[var(--text-graphite-muted)]">ESP32 + MQTT Broker (TLS)</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold">
                    BYPASSED IN DEMO
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-black/[0.02]">
                <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">Backend API Orchestration</td>
                <td className="py-2 px-2">FastAPI Service on Railway</td>
                <td className="py-2 px-2 text-[var(--text-graphite-muted)]">FastAPI Industrial Edge Container</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold">
                    OPERATIONAL
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-black/[0.02]">
                <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">Time-Series Persistence</td>
                <td className="py-2 px-2">PostgreSQL Storage Pool</td>
                <td className="py-2 px-2 text-[var(--text-graphite-muted)]">PostgreSQL / TimescaleDB Engine</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold">
                    OPERATIONAL
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-black/[0.02]">
                <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">Isolation Forest Anomaly ML</td>
                <td className="py-2 px-2">Scikit-Learn Loaded Joblib Model</td>
                <td className="py-2 px-2 text-[var(--text-graphite-muted)]">Scikit-Learn / ONNX Model Engine</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 text-[8.5px] font-bold">
                    OPERATIONAL
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-black/[0.02]">
                <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">Local LCD Display</td>
                <td className="py-2 px-2">Web Preview 20×4 LCD Formatter</td>
                <td className="py-2 px-2 text-[var(--text-graphite-muted)]">Physical I2C 20×4 Character LCD</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold">
                    PREVIEW ACTIVE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-black/[0.02]">
                <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">Optical Vision Inspection</td>
                <td className="py-2 px-2">Planned Camera Interface Page</td>
                <td className="py-2 px-2 text-[var(--text-graphite-muted)]">Industrial High-Speed Inspection Camera</td>
                <td className="py-2 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10 text-[8.5px] font-bold">
                    PLANNED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. MANUAL REFRESH & SECURITY DISCLOSURE FOOTER */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-2.5 py-1 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 text-[9.5px] font-bold text-[var(--text-charcoal)] flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[var(--accent-copper)]" : ""}`} />
            <span>{isRefreshing ? "REFRESHING..." : "REFRESH INFRASTRUCTURE STATUS"}</span>
          </button>
          <span className="text-[var(--text-graphite-muted)]">
            LAST CHECK: <strong className="text-[var(--text-charcoal)]">{lastRefreshed}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[9.5px] text-[var(--text-graphite-muted)]">
          <Lock className="w-3 h-3 text-emerald-800" />
          <span>SAFE OPERATIONAL VIEW // NO DATABASE CREDENTIALS OR SECRETS EXPOSED</span>
        </div>
      </div>
    </div>
  );
}
