"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Tv,
  Layers,
  Info,
  ArrowRight,
  Radio,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  VolumeX,
  Cpu,
} from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";
import { CONTROL_CENTER_DISPLAY_LABELS } from "@/lib/controlCenterConfig";

export default function LocalDisplayPage() {
  const { telemetry, activeAlerts, conditionSummary, decisionSummary } =
    useControlCenterData();
  const [previewMode, setPreviewMode] = useState<
    "LIVE" | "ALERT_FORMAT_PREVIEW"
  >("LIVE");

  // Centralized state mapping matching rest of Control Center
  const rawLevel =
    decisionSummary?.level || conditionSummary?.overall.level || "NORMAL";
  const sysLevelMap: Record<string, string> = {
    NORMAL: "NORM",
    ATTENTION: "ATTN",
    WARNING: "WARN",
    CRITICAL: "CRIT",
  };
  const sysStr = sysLevelMap[rawLevel] || "NORM";

  // Format 20-character strings matching HD44780 2004 character LCD specs
  const spdVal = telemetry.speed.toFixed(2);
  const alignVal =
    (telemetry.alignment >= 0 ? "+" : "") + telemetry.alignment.toFixed(1);
  const tmpVal = telemetry.temperature.toFixed(1);
  const vibVal = telemetry.vibration.toFixed(2);
  const alertCountStr = String(activeAlerts.length);

  // Safe line formatter enforcing 20 characters per line
  const formatLine = (text: string) => text.padEnd(20, " ").slice(0, 20);

  const liveLine1 = formatLine(`BC-01 | SYS:${sysStr}`);
  const liveLine2 = formatLine(`SPD:${spdVal}m/s ALN:${alignVal}`);
  const liveLine3 = formatLine(`TMP:${tmpVal}C VIB:${vibVal}g`);
  const liveLine4 = formatLine(`ALERTS:${alertCountStr} ACTIVE`);

  // Conceptual LCD alert format preview strings
  const previewLine1 = formatLine("BC-01 | WARNING");
  const previewLine2 = formatLine("ALIGNMENT ALERT");
  const previewLine3 = formatLine("VAL:+3.2mm LIM:2.5");
  const previewLine4 = formatLine("INSPECT TRACKING");

  // Automatic alert format switch if real active alerts exist in LIVE mode
  const hasActiveAlert = activeAlerts.length > 0;
  const isAlertDisplay =
    previewMode === "ALERT_FORMAT_PREVIEW" ||
    (previewMode === "LIVE" && hasActiveAlert);

  const displayLine1 = isAlertDisplay ? previewLine1 : liveLine1;
  const displayLine2 = isAlertDisplay ? previewLine2 : liveLine2;
  const displayLine3 = isAlertDisplay ? previewLine3 : liveLine3;
  const displayLine4 = isAlertDisplay ? previewLine4 : liveLine4;

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. PAGE HEADER & TECHNICAL METADATA STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-3 font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" />
              <span>// OPERATOR DISPLAY</span>
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight">
            LOCAL FIELD STATUS INTERFACE
          </h1>
          <p className="text-[11px] text-[var(--text-graphite-muted)] max-w-2xl font-sans">
            Essential conveyor condition and alert information presented in a
            compact local interface for operators working near the monitored
            system.
          </p>
        </div>

        {/* Technical Metadata Status Strip */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono shrink-0">
          <div className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 font-semibold text-[var(--text-charcoal)]">
            CONVEYOR: <strong className="text-[var(--accent-copper)]">BC-01</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 font-semibold text-emerald-950 uppercase">
            WEB REPRESENTATION: <strong>ACTIVE</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 font-semibold text-amber-950 uppercase">
            PHYSICAL LCD: <strong>NOT CONNECTED</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-graphite-muted)]">
            SOURCE: <span className="text-[var(--text-charcoal)]">{CONTROL_CENTER_DISPLAY_LABELS.dataSource}</span>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)]">
            TARGET NODE: <span className="text-[var(--text-charcoal)]">ESP32-01</span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY VIEWPORT CENTERPIECE: 20x4 LCD + LOCAL STATUS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Industrial 20x4 LCD Character Display */}
        <div className="lg:col-span-7 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-3 font-mono text-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Tv className="w-4 h-4" />
              <span>// 20×4 CHARACTER LCD HARDWARE REPRESENTATION</span>
            </span>

            {/* Display Mode Preview Switcher */}
            <div className="flex items-center gap-1 bg-[var(--bg-stone)] p-0.5 rounded-[2px] border border-[var(--border-light)]/40 text-[9px]">
              <button
                onClick={() => setPreviewMode("LIVE")}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-colors cursor-pointer ${
                  previewMode === "LIVE"
                    ? "bg-white text-[var(--text-charcoal)] shadow-2xs"
                    : "text-[var(--text-graphite-muted)] hover:text-[var(--text-charcoal)]"
                }`}
              >
                LIVE STATUS
              </button>
              <button
                onClick={() => setPreviewMode("ALERT_FORMAT_PREVIEW")}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-colors cursor-pointer ${
                  previewMode === "ALERT_FORMAT_PREVIEW"
                    ? "bg-white text-[var(--accent-copper)] shadow-2xs"
                    : "text-[var(--text-graphite-muted)] hover:text-[var(--text-charcoal)]"
                }`}
              >
                ALERT PREVIEW
              </button>
            </div>
          </div>

          {/* Physical Bezel & Dark Green Monospace Screen */}
          <div className="w-full max-w-md mx-auto p-4 sm:p-5 rounded-[4px] bg-[#071207] border-4 border-[#122612] shadow-xl space-y-2 select-none font-mono">
            <div className="flex items-center justify-between text-[8.5px] text-emerald-700/80 tracking-wider">
              <span>TARGET NODE // ESP32-01</span>
              <span>DISPLAY // 20×4 CHARACTER LCD</span>
            </div>

            {/* 4-Line Monospace Dot Matrix Characters with Green Backlight Glow */}
            <div className="p-3.5 sm:p-4 rounded-[2px] bg-[#051105] border border-[#143214] text-emerald-400 font-mono text-sm sm:text-base md:text-lg tracking-[0.18em] leading-relaxed shadow-[0_0_20px_rgba(52,211,153,0.12)_inset]">
              <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">
                {displayLine1}
              </div>
              <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">
                {displayLine2}
              </div>
              <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">
                {displayLine3}
              </div>
              <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">
                {displayLine4}
              </div>
            </div>

            <div className="flex items-center justify-between text-[8px] text-neutral-500 font-mono">
              <span>INTERFACE // I2C</span>
              <span>
                {previewMode === "ALERT_FORMAT_PREVIEW"
                  ? "MODE: DISPLAY FORMAT PREVIEW"
                  : hasActiveAlert
                  ? "MODE: LIVE ALERT RECEPTION"
                  : "MODE: LIVE NORMAL STATUS"}
              </span>
            </div>
          </div>

          {/* Mode Explanation Footnote */}
          {previewMode === "ALERT_FORMAT_PREVIEW" && (
            <div className="text-[9.5px] text-amber-900 bg-amber-500/10 border border-amber-500/30 p-2 rounded-[2px] text-center font-mono">
              DISPLAY FORMAT PREVIEW ONLY — Demonstrates LCD 20×4 layout under
              an active rule event condition.
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Local Status Summary */}
        <div className="lg:col-span-5 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-3 font-mono text-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>// LOCAL STATUS SUMMARY</span>
            </span>
            <span className="text-[9.5px] text-[var(--text-graphite-muted)]">
              IMMEDIATE FIELD AWARENESS
            </span>
          </div>

          {/* 6 Essential Local Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {/* System Condition */}
            <div className="p-2.5 rounded-[1px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/40 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase">
                SYSTEM CONDITION
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-[1px] text-[10.5px] font-bold uppercase ${
                    rawLevel === "NORMAL"
                      ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                      : rawLevel === "ATTENTION" || rawLevel === "WARNING"
                      ? "bg-amber-500/15 text-amber-800 border border-amber-500/30"
                      : "bg-rose-500/15 text-rose-800 border border-rose-500/30"
                  }`}
                >
                  {rawLevel}
                </span>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="p-2.5 rounded-[1px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/40 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase">
                ACTIVE ALERTS
              </span>
              <div className="mt-1 font-bold text-sm text-[var(--text-charcoal)]">
                {activeAlerts.length > 0 ? (
                  <span className="text-[var(--accent-copper)]">
                    {activeAlerts.length} ACTIVE
                  </span>
                ) : (
                  <span className="text-emerald-700">0 ACTIVE</span>
                )}
              </div>
            </div>

            {/* Belt Speed */}
            <div className="p-2.5 rounded-[1px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/40 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase">
                BELT SPEED
              </span>
              <div className="mt-1 font-bold text-sm text-[var(--text-charcoal)]">
                {spdVal} <span className="text-[10px] font-normal text-[var(--text-graphite-muted)]">m/s</span>
              </div>
            </div>

            {/* Alignment */}
            <div className="p-2.5 rounded-[1px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/40 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase">
                ALIGNMENT
              </span>
              <div className="mt-1 font-bold text-sm text-[var(--text-charcoal)]">
                {alignVal} <span className="text-[10px] font-normal text-[var(--text-graphite-muted)]">mm</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="p-2.5 rounded-[1px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/40 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase">
                TEMPERATURE
              </span>
              <div className="mt-1 font-bold text-sm text-[var(--text-charcoal)]">
                {tmpVal} <span className="text-[10px] font-normal text-[var(--text-graphite-muted)]">°C</span>
              </div>
            </div>

            {/* Vibration */}
            <div className="p-2.5 rounded-[1px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/40 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase">
                VIBRATION
              </span>
              <div className="mt-1 font-bold text-sm text-[var(--text-charcoal)]">
                {vibVal} <span className="text-[10px] font-normal text-[var(--text-graphite-muted)]">g</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-light)]/30 text-[9.5px] text-[var(--text-graphite-muted)] leading-relaxed">
            Local display surfaces machine-side telemetry for field operators. Deep historical trends, AI anomaly models, and root-cause evidence remain in the Control Center.
          </div>
        </div>
      </div>

      {/* 3. LOCAL ALERT OUTPUT BEHAVIOR */}
      <div className="p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[var(--border-light)]/40 pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              LOCAL ALERT OUTPUT BEHAVIOR
            </span>
          </div>
          <span className="text-[9.5px] text-[var(--text-graphite-muted)]">
            THREE OPERATIONAL DISPLAY STATES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* State 1: NORMAL */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)]/60 border-l-2 border-l-emerald-600 border border-[var(--border-light)]/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700 uppercase text-[10px]">
                01 / NORMAL STATE
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-[10.5px] text-[var(--text-charcoal)] space-y-1 font-sans">
              <div>
                <strong>Display:</strong> Standard 4-line telemetry parameters (`BC-01 | SYS:NORM`)
              </div>
              <div className="text-[10px] text-[var(--text-graphite-muted)]">
                <strong>Local Indication:</strong> Green status display only
              </div>
            </div>
          </div>

          {/* State 2: WARNING */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)]/60 border-l-2 border-l-[var(--accent-copper)] border border-[var(--border-light)]/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--accent-copper)] uppercase text-[10px]">
                02 / WARNING STATE
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
            </div>
            <div className="text-[10.5px] text-[var(--text-charcoal)] space-y-1 font-sans">
              <div>
                <strong>Display:</strong> Warning banner + affected signal (`BC-01 | WARNING`)
              </div>
              <div className="text-[10px] text-[var(--text-graphite-muted)]">
                <strong>Local Indication:</strong> Visual warning display format
              </div>
            </div>
          </div>

          {/* State 3: CRITICAL */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)]/60 border-l-2 border-l-rose-600 border border-[var(--border-light)]/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-700 uppercase text-[10px]">
                03 / CRITICAL STATE
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-[10.5px] text-[var(--text-charcoal)] space-y-1 font-sans">
              <div>
                <strong>Display:</strong> Critical condition + inspection context (`BC-01 | CRITICAL`)
              </div>
              <div className="text-[10px] text-[var(--text-graphite-muted)]">
                <strong>Local Indication:</strong> High-priority visual alert
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Disclosure Note regarding Buzzer */}
        <div className="pt-2 border-t border-[var(--border-light)]/30 flex items-center gap-2 text-[10px] text-[var(--text-graphite-muted)] font-mono">
          <VolumeX className="w-3.5 h-3.5 text-[var(--accent-copper)] shrink-0" />
          <span>
            <strong>BUZZER OUTPUT — PLANNED / HARDWARE INTEGRATION:</strong> Physical audio sounder/buzzer hardware is not physically connected in current web prototype environment.
          </span>
        </div>
      </div>

      {/* 4. LOCAL VS REMOTE ARCHITECTURE DIAGRAM */}
      <div className="p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              LOCAL VS REMOTE SYSTEM ARCHITECTURE
            </span>
          </div>
          <span className="text-[9.5px] text-[var(--text-graphite-muted)]">
            DEPLOYMENT PATH COMPARISON
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
          {/* Target Field Deployment Flow */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)]/70 border border-[var(--border-light)]/40 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">
                TARGET FIELD DEPLOYMENT
              </span>
              <span className="text-[8.5px] text-[var(--accent-copper)] font-bold px-1 bg-[var(--accent-copper)]/10 rounded-[1px]">
                PLANNED HARDWARE
              </span>
            </div>
            <div className="flex flex-col gap-1.5 text-[9.5px] text-[var(--text-charcoal)] font-semibold pt-1">
              <div className="p-1.5 bg-white rounded-[1px] border border-[var(--border-light)]/40 text-center">
                PHYSICAL SENSORS (TEMP, VIB, ALN, SPD, CURR)
              </div>
              <div className="text-center text-[var(--text-graphite-muted)] text-[9px]">↓ GPIO / I2C Bus</div>
              <div className="p-1.5 bg-white rounded-[1px] border border-[var(--border-light)]/40 text-center font-bold text-[var(--accent-copper)]">
                ESP32 EDGE NODE
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[8.5px]">
                <div className="p-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 rounded-[1px] text-center font-bold">
                  ↙ LOCAL 20×4 LCD DISPLAY
                </div>
                <div className="p-1 bg-white border border-[var(--border-light)]/40 rounded-[1px] text-center">
                  ↘ MQTT Broker → FASTAPI
                </div>
              </div>
              <div className="text-center text-[var(--text-graphite-muted)] text-[9px]">↓ REST / WebSockets</div>
              <div className="p-1.5 bg-white rounded-[1px] border border-[var(--border-light)]/40 text-center">
                SRIJAN CONTROL CENTER DASHBOARD
              </div>
            </div>
          </div>

          {/* Current Hosted Prototype Flow */}
          <div className="p-3 rounded-[2px] bg-[var(--bg-stone)]/70 border border-[var(--border-light)]/40 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
              <span className="font-bold text-[var(--text-charcoal)] uppercase">
                CURRENT HOSTED PROTOTYPE
              </span>
              <span className="text-[8.5px] text-emerald-700 font-bold px-1 bg-emerald-500/10 rounded-[1px]">
                WEB LIVE STREAM
              </span>
            </div>
            <div className="flex flex-col gap-1.5 text-[9.5px] text-[var(--text-charcoal)] font-semibold pt-1">
              <div className="p-1.5 bg-white rounded-[1px] border border-[var(--border-light)]/40 text-center">
                CLOUD SYNTHETIC TELEMETRY ENGINE
              </div>
              <div className="text-center text-[var(--text-graphite-muted)] text-[9px]">↓ 1 Hz Data Stream</div>
              <div className="p-1.5 bg-white rounded-[1px] border border-[var(--border-light)]/40 text-center">
                FASTAPI BACKEND SERVICE
              </div>
              <div className="text-center text-[var(--text-graphite-muted)] text-[9px]">↓ REST API Polling</div>
              <div className="p-1.5 bg-white rounded-[1px] border border-[var(--border-light)]/40 text-center">
                SRIJAN CONTROL CENTER PROVIDER
              </div>
              <div className="text-center text-[var(--text-graphite-muted)] text-[9px]">↓ Client React Formatter</div>
              <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 rounded-[1px] text-center font-bold">
                WEB 20×4 LCD REPRESENTATION (ACTIVE)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FIELD DEPLOYMENT ROLE, DATA FLOW & INFORMATION SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs">
        {/* Left (6 cols): Micro Data Flow & Why Local Visibility Matters */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-3">
          {/* Data Flow Strip */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2 border-b border-[var(--border-light)]/40 pb-1.5">
              <Radio className="w-4 h-4" />
              <span>FIELD DISPLAY DATA FLOW</span>
            </div>

            <div className="grid grid-cols-4 gap-1 py-1.5 px-2 bg-[var(--bg-stone)] border border-[var(--border-light)]/40 rounded-[2px] text-center text-[9.5px]">
              <div>
                <div className="font-bold text-[var(--accent-copper)]">SENSE</div>
                <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Signals</div>
              </div>
              <div>
                <div className="font-bold text-[var(--text-charcoal)]">ASSESS</div>
                <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Condition</div>
              </div>
              <div>
                <div className="font-bold text-[var(--text-charcoal)]">ALERT</div>
                <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Events</div>
              </div>
              <div>
                <div className="font-bold text-emerald-700">DISPLAY</div>
                <div className="text-[8.5px] text-[var(--text-graphite-muted)]">Local LCD</div>
              </div>
            </div>

            <div className="text-[9.5px] text-[var(--text-graphite-muted)] grid grid-cols-2 gap-2 pt-1 font-sans">
              <div>• <strong>SENSE:</strong> Capture operating signals</div>
              <div>• <strong>ASSESS:</strong> Evaluate condition state</div>
              <div>• <strong>ALERT:</strong> Identify configured events</div>
              <div>• <strong>DISPLAY:</strong> Surface status locally</div>
            </div>
          </div>

          {/* Why Local Visibility Matters */}
          <div className="pt-2 border-t border-[var(--border-light)]/30 space-y-2">
            <div className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              WHY LOCAL VISIBILITY MATTERS
            </div>

            <ul className="space-y-1.5 text-[10.5px] font-sans text-[var(--text-graphite-muted)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-copper)] font-bold font-mono">01.</span>
                <span>Immediate condition awareness directly near the conveyor machine.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-copper)] font-bold font-mono">02.</span>
                <span>Essential status visibility without needing access to full Control Center dashboard.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-copper)] font-bold font-mono">03.</span>
                <span>Machine-side indication of active warning/alert state for field crews.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent-copper)] font-bold font-mono">04.</span>
                <span>Seamless handoff to remote analysis through SRIJAN Control Center.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right (6 cols): Information Split Comparison */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-3">
          <div className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase border-b border-[var(--border-light)]/40 pb-1.5 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accent-copper)]" />
            <span>INFORMATION ARCHITECTURE SPLIT</span>
          </div>

          <div className="space-y-2 text-[10.5px]">
            {/* Local Display Scope */}
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
              <div className="font-bold text-[var(--accent-copper)] uppercase text-[10px]">
                LOCAL OPERATOR DISPLAY
              </div>
              <div className="font-sans text-[10px] text-[var(--text-charcoal)]">
                <strong>Purpose:</strong> Immediate machine-side condition awareness.
              </div>
              <div className="font-mono text-[9.5px] text-[var(--text-graphite-muted)]">
                <strong>Surfaces:</strong> Condition state, Speed, Alignment, Temperature, Vibration, Active alert count.
              </div>
            </div>

            {/* Remote Control Center Scope */}
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
              <div className="font-bold text-[var(--text-charcoal)] uppercase text-[10px]">
                REMOTE CONTROL CENTER
              </div>
              <div className="font-sans text-[10px] text-[var(--text-charcoal)]">
                <strong>Purpose:</strong> Detailed remote analysis, AI intelligence &amp; decision support.
              </div>
              <div className="font-mono text-[9.5px] text-[var(--text-graphite-muted)]">
                <strong>Surfaces:</strong> Multi-channel trends, Historical analytics, Isolation Forest, Anomaly index, Event logs, Camera readiness, System status.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. CONTROL CENTER HANDOFF SECTION */}
      <div className="p-4 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] shadow-sm space-y-3 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[9.5px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
            // DETAILED REMOTE ANALYSIS
          </div>
          <h3 className="font-heading text-base md:text-lg font-bold tracking-tight text-white mt-0.5">
            NEED DETAILED ANALYSIS?
          </h3>
          <p className="text-[11px] text-[var(--bg-stone)]/70 font-sans max-w-xl">
            Access full multi-channel telemetry, AI intelligence models, decision support, and complete event history in the main Control Center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/control-center"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[2px] bg-[var(--accent-copper)] text-white font-sans text-xs font-bold tracking-wider uppercase transition-all duration-200 hover:bg-[var(--accent-copper)]/90 cursor-pointer"
          >
            <span>OPEN CONTROL CENTER</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/control-center/monitoring"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[2px] border border-white/20 text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-200 hover:bg-white/10 cursor-pointer"
          >
            <span>INSPECT LIVE SIGNALS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
