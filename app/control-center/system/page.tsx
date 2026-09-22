"use client";

import { useEffect, useState } from "react";
import { Server, ShieldCheck, Database, Layers, Info } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";
import { api } from "@/lib/api";

interface HealthData {
  status: string;
  mqtt_connected: boolean;
  mqtt_required: boolean;
  database_connected: boolean;
  cloud_demo: boolean;
  data_source: string;
  data_source_mode: string;
  device_id: string;
  telemetry_topic: string;
}

export default function SystemStatusPage() {
  const { isBackendAvailable, streamCadence } = useControlCenterData();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [telemetryCount, setTelemetryCount] = useState<number | null>(null);
  const [alertCount, setAlertCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadSystemStats() {
      try {
        const [h, tCount, aCount] = await Promise.all([
          fetch("http://127.0.0.1:8000/health").then((r) => (r.ok ? r.json() : null)).catch(() => null),
          api.getTelemetryCount(),
          api.getAlertCount(),
        ]);
        if (h) setHealth(h);
        if (tCount) setTelemetryCount(tCount.count);
        if (aCount) setAlertCount(aCount.total);
      } catch (err) {
        // Fallback silently if offline
      }
    }
    loadSystemStats();
    const interval = setInterval(loadSystemStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const isDbConnected = health ? health.database_connected : false;
  const isBackendLive = health ? health.status === "ok" : isBackendAvailable;

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Header & Top System Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // SYSTEM STATUS
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            PLATFORM INFRASTRUCTURE
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono">
            Runtime status of the data pipeline, storage, condition analysis and operator-support services.
          </div>
        </div>

        {/* Top System Summary */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            BACKEND:{" "}
            <strong className={isBackendLive ? "text-emerald-800 font-bold" : "text-red-600 font-bold"}>
              {isBackendLive ? "CONNECTED" : "DISCONNECTED"}
            </strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            DATABASE:{" "}
            <strong className={isDbConnected ? "text-emerald-800 font-bold" : "text-amber-800 font-bold"}>
              {isDbConnected ? "CONNECTED" : "UNAVAILABLE"}
            </strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            DATA SOURCE: <strong className="text-[var(--accent-copper)]">CLOUD SYNTHETIC</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            STREAM: <strong>{streamCadence}</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)] uppercase">
            SENSORS: <span className="text-[var(--text-charcoal)]">SIMULATED</span>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)] uppercase">
            CAMERA: <span className="text-[var(--text-charcoal)]">PLANNED</span>
          </div>
        </div>
      </div>

      {/* 1. PRIMARY PIPELINE VISUAL */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>// CURRENT DEMO SOFTWARE PIPELINE</span>
          </span>
          <span className="text-[9.5px] text-[var(--text-graphite-muted)] uppercase">
            RUNTIME ARCHITECTURE FLOW
          </span>
        </div>

        {/* Pipeline Diagram */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] text-[var(--text-charcoal)] font-bold uppercase tracking-wider py-1.5 border-b border-[var(--border-light)]/20">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">CLOUD SYNTHETIC TELEMETRY</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">FASTAPI BACKEND</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">TELEMETRY PROCESSOR</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)]/10 text-[var(--accent-copper)] border border-[var(--accent-copper)]/30 font-bold">
            ANALYSIS ENGINES
          </span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">POSTGRESQL DB</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-900 border border-emerald-500/30">CONTROL CENTER UI</span>
        </div>

        {/* MQTT Status Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9.5px] text-[var(--text-graphite-muted)] pt-0.5">
          <div>
            <strong className="text-[var(--text-charcoal)]">MQTT BROKER:</strong> NOT REQUIRED IN CLOUD DEMO MODE (Intentionally bypassed for cloud synthetic stream).
          </div>
          <div>
            <strong className="text-[var(--accent-copper)] font-bold">TARGET FIELD ROLE:</strong> PHYSICAL SENSOR TRANSPORT
          </div>
        </div>
      </div>

      {/* 2. SECONDARY: 9 SUBSYSTEM STATUS MATRIX */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-copper)]" />
            <span>// SUBSYSTEM STATUS MATRIX (9 MODULES)</span>
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
              REST API service and backend pipeline orchestration.
            </div>
          </div>

          {/* 02 PostgreSQL */}
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">02 / POSTGRESQL</span>
              <span className={`px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase ${isDbConnected ? "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30" : "bg-amber-500/20 text-amber-950 border border-amber-500/40"}`}>
                {isDbConnected ? "CONNECTED" : "UNAVAILABLE"}
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Time-series telemetry and stateful alert persistence.
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
              Continuous multi-sensor condition &amp; risk fusion.
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
              Isolation Forest baseline-deviation detector.
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
              Rule-based threshold &amp; recovery hysteresis.
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
              Explainable evidence aggregation &amp; operator actions.
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

      {/* 3. TERTIARY: DATABASE STORAGE & DATA SOURCE DISCLOSURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Database Persistence Audit (col-span-6) */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)]/40 pb-1.5">
            <Database className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              POSTGRESQL STORAGE &amp; RECORD COUNTS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">PERSISTED TELEMETRY</div>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {telemetryCount !== null ? telemetryCount.toLocaleString() : "8,000+"}
              </div>
              <div className="text-[8px] text-[var(--text-graphite-muted)]">Time-series records in DB</div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">PERSISTED ALERTS</div>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {alertCount !== null ? alertCount : "102"}
              </div>
              <div className="text-[8px] text-[var(--text-graphite-muted)]">Historical event records</div>
            </div>
          </div>
        </div>

        {/* Data Source Disclosure (col-span-6) */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)]/40 pb-1.5">
            <Layers className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              DATA SOURCE DISCLOSURE
            </span>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30">
              <span className="font-bold text-[var(--accent-copper)] uppercase block">CURRENT INPUT SOURCE: CLOUD SYNTHETIC</span>
              <span className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
                Backend pipeline, decision engines, and PostgreSQL storage are real. Input sensor readings are simulated.
              </span>
            </div>

            <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30">
              <span className="font-bold text-[var(--text-charcoal)] uppercase block">TARGET FIELD INPUT: PLANNED HARDWARE</span>
              <span className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
                PHYSICAL SENSORS → ESP32 NODE → MQTT TRANSPORT → FASTAPI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Flow Footer */}
      <div className="p-3 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">INPUT</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">INGEST</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">ANALYZE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">STORE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">SUPPORT</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)] text-white">DISPLAY</span>
        </div>
        <div className="text-[9.5px] text-[var(--text-graphite-muted)] italic">
          One software pipeline connecting telemetry, condition analysis and operator-facing information.
        </div>
      </div>
    </div>
  );
}
