"use client";

import { useState } from "react";
import { Tv, Layers, Info } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";
import { CONTROL_CENTER_DISPLAY_LABELS } from "@/lib/controlCenterConfig";

export default function LocalDisplayPage() {
  const { telemetry, activeAlerts, conditionSummary, decisionSummary, dataMode } = useControlCenterData();
  const [previewMode, setPreviewMode] = useState<"LIVE" | "ALERT_FORMAT_PREVIEW">("LIVE");

  // Centralized state mapping matching rest of Control Center
  const rawLevel = decisionSummary?.level || conditionSummary?.overall.level || "NORMAL";
  const sysLevelMap: Record<string, string> = {
    NORMAL: "NORM",
    ATTENTION: "ATTN",
    WARNING: "WARN",
    CRITICAL: "CRIT",
  };
  const sysStr = sysLevelMap[rawLevel] || "NORM";

  // Format 20-character strings matching HD44780 2004 character LCD specs
  const spdVal = telemetry.speed.toFixed(2);
  const alignVal = (telemetry.alignment >= 0 ? "+" : "") + telemetry.alignment.toFixed(1);
  const tmpVal = telemetry.temperature.toFixed(1);
  const vibVal = telemetry.vibration.toFixed(2);
  const alertCountStr = String(activeAlerts.length);

  const liveLine1 = `BC-01 | SYS:${sysStr}`.padEnd(20, " ").slice(0, 20);
  const liveLine2 = `SPD:${spdVal}m/s ALN:${alignVal}`.padEnd(20, " ").slice(0, 20);
  const liveLine3 = `TMP:${tmpVal}C VIB:${vibVal}g`.padEnd(20, " ").slice(0, 20);
  const liveLine4 = `ALERTS:${alertCountStr} ACTIVE`.padEnd(20, " ").slice(0, 20);

  // Non-active UI format preview strings for UI demonstration
  const previewLine1 = "BC-01 | SYS:CRIT    ";
  const previewLine2 = "SPD:0.00m/s ALN:+3.2";
  const previewLine3 = "TMP:82.4C VIB:0.89g";
  const previewLine4 = "ALERTS:2 ACTIVE    ";

  const displayLine1 = previewMode === "LIVE" ? liveLine1 : previewLine1;
  const displayLine2 = previewMode === "LIVE" ? liveLine2 : previewLine2;
  const displayLine3 = previewMode === "LIVE" ? liveLine3 : previewLine3;
  const displayLine4 = previewMode === "LIVE" ? liveLine4 : previewLine4;

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Top Header & Hardware Status Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // LOCAL DISPLAY
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            EDGE OPERATOR DISPLAY
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono">
            A compact 20×4 conveyor-side display for essential condition and alert information.
          </div>
        </div>

        {/* Current Hardware Status Strip */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 font-semibold text-amber-950 uppercase">
            PHYSICAL LCD: <strong>NOT CONNECTED</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 font-semibold text-emerald-950 uppercase">
            WEB REPRESENTATION: <strong>ACTIVE</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            DATA SOURCE: <strong>{CONTROL_CENTER_DISPLAY_LABELS.dataSource}</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)]">
            TARGET DEVICE: <span className="text-[var(--text-charcoal)]">ESP32-01</span>
          </div>
        </div>
      </div>

      {/* 1. PRIMARY LCD VISUAL CENTERPIECE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <Tv className="w-4 h-4" />
            <span>// 20×4 CHARACTER LCD HARDWARE EMULATION</span>
          </span>

          {/* Display Mode Preview Toggle */}
          <div className="flex items-center gap-1 bg-[var(--bg-stone)] p-0.5 rounded-[2px] border border-[var(--border-light)]/40 text-[9px]">
            <button
              onClick={() => setPreviewMode("LIVE")}
              className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-colors ${
                previewMode === "LIVE" ? "bg-white text-[var(--text-charcoal)] shadow-2xs" : "text-[var(--text-graphite-muted)]"
              }`}
            >
              LIVE BACKEND
            </button>
            <button
              onClick={() => setPreviewMode("ALERT_FORMAT_PREVIEW")}
              className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-colors ${
                previewMode === "ALERT_FORMAT_PREVIEW" ? "bg-white text-[var(--text-charcoal)] shadow-2xs" : "text-[var(--text-graphite-muted)]"
              }`}
            >
              FORMAT PREVIEW
            </button>
          </div>
        </div>

        {/* Industrial Dark Green 20x4 LCD Character Display */}
        <div className="max-w-md mx-auto p-4 md:p-5 rounded-[4px] bg-[#071207] border-4 border-[#122612] shadow-xl space-y-2 select-none font-mono">
          <div className="flex items-center justify-between text-[8.5px] text-emerald-700/80 tracking-wider">
            <span>ESP32-WROOM-32 // I2C (0x27)</span>
            <span>HD44780 2004 MATRIX</span>
          </div>

          {/* 4-Line Monospace Dot Matrix Characters with Green Backlight Glow */}
          <div className="p-3.5 rounded-[2px] bg-[#051105] border border-[#143214] text-emerald-400 font-mono text-base md:text-lg tracking-[0.18em] leading-relaxed shadow-[0_0_20px_rgba(52,211,153,0.12)_inset]">
            <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">{displayLine1}</div>
            <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">{displayLine2}</div>
            <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">{displayLine3}</div>
            <div className="drop-shadow-[0_0_5px_rgba(52,211,153,0.4)] whitespace-pre">{displayLine4}</div>
          </div>

          <div className="flex items-center justify-between text-[8px] text-neutral-500 font-mono">
            <span>BAUD: 115200</span>
            <span>
              {previewMode === "LIVE" ? "MODE: LIVE RECEPTION" : "MODE: FORMAT PREVIEW (NON-ACTIVE DEMO)"}
            </span>
          </div>
        </div>

        {previewMode === "ALERT_FORMAT_PREVIEW" && (
          <div className="text-[9.5px] text-amber-900 bg-amber-500/10 border border-amber-500/30 p-2 rounded-[2px] text-center font-mono">
            DISPLAY FORMAT PREVIEW ONLY — Demonstrates LCD 20×4 layout under critical alert conditions.
          </div>
        )}
      </div>

      {/* 2. SECONDARY: LOCAL VS REMOTE ARCHITECTURE & PURPOSE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Architecture Flow Comparison (col-span-8) */}
        <div className="lg:col-span-8 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)]/40 pb-1.5">
            <Layers className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              LOCAL VS REMOTE DATA ARCHITECTURE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
            {/* Path 1: Current Software Demo */}
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1.5">
              <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">
                CURRENT PROTOTYPE DATA PATH (CLOUD DEMO)
              </div>
              <div className="flex flex-col gap-1 text-[9px] text-[var(--text-charcoal)] font-semibold">
                <div>CLOUD SYNTHETIC TELEMETRY</div>
                <div className="text-[var(--text-graphite-muted)] text-[8px]">↓ 1 Hz stream loop</div>
                <div>FASTAPI BACKEND</div>
                <div className="text-[var(--text-graphite-muted)] text-[8px]">↓ REST / JSON endpoint</div>
                <div>SRIJAN CONTROL CENTER</div>
                <div className="text-[var(--text-graphite-muted)] text-[8px]">↓ Client React formatter</div>
                <div className="text-[var(--accent-copper)]">WEB 20×4 LCD REPRESENTATION</div>
              </div>
            </div>

            {/* Path 2: Target Field Deployment */}
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1.5">
              <div className="text-[9px] font-bold text-[var(--text-charcoal)] uppercase">
                TARGET FIELD DEPLOYMENT (PLANNED HARDWARE)
              </div>
              <div className="flex flex-col gap-1 text-[9px] text-[var(--text-charcoal)] font-semibold">
                <div>PHYSICAL SENSOR HARDWARE</div>
                <div className="text-[var(--text-graphite-muted)] text-[8px]">↓ GPIO / I2C bus</div>
                <div>ESP32 EDGE NODE</div>
                <div className="text-[var(--text-graphite-muted)] text-[8px]">├─ LOCAL: 20×4 HD44780 LCD</div>
                <div className="text-[var(--text-graphite-muted)] text-[8px]">└─ REMOTE: MQTT Broker → FastAPI</div>
                <div className="text-[var(--accent-copper)]">CONTROL CENTER DASHBOARD</div>
              </div>
            </div>
          </div>
        </div>

        {/* Local Purpose & Feature Scope (col-span-4) */}
        <div className="lg:col-span-4 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)]/40 pb-1.5">
            <Info className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              LOCAL PURPOSE
            </span>
          </div>

          <p className="font-sans text-[11px] text-[var(--text-charcoal)] leading-relaxed">
            Provides immediate conveyor-side visibility of essential operating condition and alert information without requiring the full web interface.
          </p>

          <div className="pt-1 border-t border-[var(--border-light)]/30 text-[9.5px] space-y-1 font-mono">
            <div className="font-bold text-[var(--text-graphite-muted)] uppercase">DISPLAYED AT CONVEYOR:</div>
            <div className="text-[var(--text-charcoal)]">
              • System Condition (SYS)
              <br />
              • Belt Speed &amp; Alignment
              <br />
              • Motor Temp &amp; Vibration
              <br />• Active Rule Alert Count
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
