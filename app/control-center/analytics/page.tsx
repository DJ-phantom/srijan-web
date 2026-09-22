"use client";

import { BarChart3, History } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";

export default function AnalyticsPage() {
  const { telemetryHistory, alertCounts, dataMode } = useControlCenterData();

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Header & Top Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // ANALYTICS
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            HISTORICAL TELEMETRY ANALYTICS
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono">
            PostgreSQL time-series history and persisted telemetry trend logs.
          </div>
        </div>

        {/* Top Status Strip */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            DB ENGINE: <strong className="text-[var(--accent-copper)]">POSTGRESQL</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            RETRIEVED SAMPLES: <strong>{telemetryHistory.length}</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            PERSISTED ALERTS: <strong>{alertCounts.total}</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)]">
            CADENCE: <span className="text-[var(--text-charcoal)]">1.0 HZ</span>
          </div>
        </div>
      </div>

      {/* Database Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-1">
          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
            RETRIEVED BUFFER WINDOW
          </div>
          <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
            {telemetryHistory.length} <span className="text-xs font-mono font-normal opacity-60">SAMPLES</span>
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)]">
            Latest 20 readings ordered newest first
          </div>
        </div>

        <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-1">
          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
            POSTGRESQL ALERT RECORDS
          </div>
          <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
            {alertCounts.total} <span className="text-xs font-mono font-normal opacity-60">RECORDS</span>
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)]">
            {alertCounts.active} active alerts in database
          </div>
        </div>

        <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-1">
          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
            SAMPLING INTERVAL &amp; TABLE INDEX
          </div>
          <div className="font-heading text-lg font-bold text-[var(--accent-copper)]">
            1.0 HZ CONTINUOUS
          </div>
          <div className="text-[9px] text-[var(--text-graphite-muted)]">
            Indexed on (device_id, timestamp DESC)
          </div>
        </div>
      </div>

      {/* Telemetry History Log Table */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>// LATEST TELEMETRY RECORDS FROM POSTGRESQL</span>
          </span>
          {dataMode === "FRONTEND_FALLBACK" && (
            <span className="text-[9px] font-bold text-amber-900 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-[2px]">
              OFFLINE DEMO DATA
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {telemetryHistory.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-light)]/40 text-[9px] text-[var(--text-graphite-muted)] uppercase">
                  <th className="py-2 px-2.5">TIMESTAMP</th>
                  <th className="py-2 px-2.5">DEVICE</th>
                  <th className="py-2 px-2.5">SCENARIO</th>
                  <th className="py-2 px-2.5">TEMP (°C)</th>
                  <th className="py-2 px-2.5">VIB (g)</th>
                  <th className="py-2 px-2.5">CURR (A)</th>
                  <th className="py-2 px-2.5">SPD (m/s)</th>
                  <th className="py-2 px-2.5">ALIGN (mm)</th>
                  <th className="py-2 px-2.5">LOAD (t/h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]/20 text-[10.5px]">
                {telemetryHistory.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-black/5 transition-colors">
                    <td className="py-2 px-2.5 text-[10px] font-medium text-[var(--text-charcoal)]">
                      {new Date(rec.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-2.5 text-[var(--text-graphite-muted)]">{rec.device_id}</td>
                    <td className="py-2 px-2.5 font-bold text-[9.5px] uppercase text-[var(--accent-copper)]">
                      {rec.scenario}
                    </td>
                    <td className="py-2 px-2.5">{rec.temperature.toFixed(1)}</td>
                    <td className="py-2 px-2.5">{rec.vibration.toFixed(2)}</td>
                    <td className="py-2 px-2.5">{rec.current.toFixed(2)}</td>
                    <td className="py-2 px-2.5">{rec.speed.toFixed(2)}</td>
                    <td className="py-2 px-2.5">
                      {rec.alignment > 0 ? `+${rec.alignment.toFixed(1)}` : rec.alignment.toFixed(1)}
                    </td>
                    <td className="py-2 px-2.5">{rec.load.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-[10px] text-[var(--text-graphite-muted)] font-mono">
              TELEMETRY HISTORY LOADING OR UNAVAILABLE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
