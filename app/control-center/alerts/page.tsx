"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Layers, ArrowRight, Filter, Search } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";
import { AlertRecord } from "@/lib/api";

export default function AlertsPage() {
  const { activeAlerts, alertHistory, alertCounts, dataMode } = useControlCenterData();

  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "WARNING" | "CRITICAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);

  const highestSeverity = activeAlerts.some((a) => a.severity === "CRITICAL")
    ? "CRITICAL"
    : activeAlerts.some((a) => a.severity === "WARNING")
    ? "WARNING"
    : "NONE";

  // Filtered history list over fetched data
  const filteredHistory = alertHistory.filter((item) => {
    if (filterStatus === "ACTIVE" && !item.is_active) return false;
    if (filterStatus === "RESOLVED" && item.is_active) return false;
    if (filterSeverity !== "ALL" && item.severity !== filterSeverity) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMetric = item.metric.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      return matchTitle || matchMetric || matchMsg;
    }
    return true;
  });

  const activeDetail = selectedAlert || activeAlerts[0] || alertHistory[0] || null;

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Top Header & Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // ALERTS &amp; EVENTS
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            CONDITION EVENT MANAGEMENT
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono">
            Rule-based conveyor events with severity, evidence context and persisted event history.
          </div>
        </div>

        {/* Top Summary Strip */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            ACTIVE EVENTS: <strong className="text-[var(--accent-copper)]">{alertCounts.active}</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            HISTORICAL EVENTS: <strong>{alertCounts.total}</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            HIGHEST SEVERITY:{" "}
            <strong
              className={
                highestSeverity === "CRITICAL"
                  ? "text-red-600"
                  : highestSeverity === "WARNING"
                  ? "text-[var(--accent-copper)]"
                  : "text-emerald-800"
              }
            >
              {highestSeverity}
            </strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)]">
            ENGINE: <span className="text-[var(--text-charcoal)]">RULE MONITORING</span>
          </div>
        </div>
      </div>

      {/* 1. PRIMARY AREA: Active Events Grid / Empty State */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>// ACTIVE EVENTS ({activeAlerts.length})</span>
          </span>
          {dataMode === "FRONTEND_FALLBACK" && (
            <span className="text-[9px] font-bold text-amber-900 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-[2px]">
              OFFLINE DEMO DATA
            </span>
          )}
        </div>

        {activeAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeAlerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => setSelectedAlert(alt)}
                className={`p-3 rounded-[2px] border cursor-pointer transition-all space-y-2 ${
                  activeDetail?.id === alt.id
                    ? "bg-white border-[var(--accent-copper)] shadow-xs"
                    : "bg-[var(--bg-stone)] border-[var(--border-light)]/40 hover:border-[var(--accent-copper)]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-charcoal)] uppercase text-[11px]">
                    #{alt.id} {alt.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase ${
                      alt.severity === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : "bg-[var(--accent-copper)] text-white"
                    }`}
                  >
                    {alt.severity}
                  </span>
                </div>

                <div className="text-[11px] text-[var(--text-charcoal)] font-sans">
                  {alt.message}
                </div>

                <div className="flex items-center justify-between text-[9px] text-[var(--text-graphite-muted)] border-t border-[var(--border-light)]/30 pt-1.5">
                  <div>
                    VALUE: <strong className="text-[var(--text-charcoal)]">{alt.value} {alt.unit}</strong>
                  </div>
                  <div>STARTED: {new Date(alt.started_at).toLocaleTimeString()}</div>
                  <div className="font-bold text-[var(--accent-copper)]">STATE: ACTIVE</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1 text-center font-mono">
            <div className="text-[11px] font-bold text-[var(--text-charcoal)] uppercase">
              NO ACTIVE RULE EVENTS
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] font-sans">
              All monitored channels currently remain within configured prototype thresholds.
            </div>
          </div>
        )}
      </div>

      {/* Selected Event Detail Inspection Area (Desktop) */}
      {activeDetail && (
        <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              {activeDetail.is_active && !activeDetail.resolved_at
                ? `SELECTED ACTIVE EVENT // #${activeDetail.id}`
                : `SELECTED HISTORICAL EVENT // #${activeDetail.id}`}
            </span>
            <span className="text-[9px] text-[var(--accent-copper)] font-bold uppercase">
              METRIC: {activeDetail.metric}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div>
              <span className="text-[var(--text-graphite-muted)] block">EVENT TITLE</span>
              <strong className="text-[var(--text-charcoal)]">{activeDetail.title}</strong>
            </div>
            <div>
              <span className="text-[var(--text-graphite-muted)] block">OBSERVED VALUE</span>
              <strong className="text-[var(--text-charcoal)]">{activeDetail.value} {activeDetail.unit}</strong>
            </div>
            <div>
              <span className="text-[var(--text-graphite-muted)] block">SEVERITY / STATE</span>
              <strong className={activeDetail.severity === "CRITICAL" ? "text-red-600" : "text-[var(--accent-copper)]"}>
                {activeDetail.severity} ({activeDetail.is_active ? "ACTIVE" : "RESOLVED"})
              </strong>
            </div>
            <div>
              <span className="text-[var(--text-graphite-muted)] block">TIMESTAMPS</span>
              <strong>Start: {new Date(activeDetail.started_at).toLocaleTimeString()}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECONDARY AREA: Historical Event Log */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-copper)]" />
              <span>// HISTORICAL EVENT LOG ({filteredHistory.length})</span>
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-mono">
              PROTOTYPE EVENT ARCHIVE / HISTORICAL TEST RUNS
            </span>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-[var(--text-graphite-muted)] absolute left-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event..."
                className="pl-6 pr-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[10px] focus:outline-hidden w-28 md:w-36"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-1 bg-[var(--bg-stone)] p-0.5 rounded-[2px] border border-[var(--border-light)]/40">
              <Filter className="w-3 h-3 text-[var(--text-graphite-muted)] ml-1" />
              {(["ALL", "ACTIVE", "RESOLVED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-1.5 py-0.5 rounded-[1px] font-bold uppercase transition-colors ${
                    filterStatus === st ? "bg-white text-[var(--text-charcoal)] shadow-2xs" : "text-[var(--text-graphite-muted)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Filter Severity */}
            <div className="flex items-center gap-1 bg-[var(--bg-stone)] p-0.5 rounded-[2px] border border-[var(--border-light)]/40">
              {(["ALL", "WARNING", "CRITICAL"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-1.5 py-0.5 rounded-[1px] font-bold uppercase transition-colors ${
                    filterSeverity === sev ? "bg-white text-[var(--text-charcoal)] shadow-2xs" : "text-[var(--text-graphite-muted)]"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Historical Table */}
        <div className="overflow-x-auto">
          {filteredHistory.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-light)]/40 text-[9px] text-[var(--text-graphite-muted)] uppercase">
                  <th className="py-2 px-2.5">ID</th>
                  <th className="py-2 px-2.5">STATUS</th>
                  <th className="py-2 px-2.5">SEVERITY</th>
                  <th className="py-2 px-2.5">METRIC</th>
                  <th className="py-2 px-2.5">EVENT</th>
                  <th className="py-2 px-2.5">VALUE</th>
                  <th className="py-2 px-2.5">STARTED</th>
                  <th className="py-2 px-2.5">RESOLVED AT / LAST SEEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]/20 text-[10.5px]">
                {filteredHistory.map((alt) => (
                  <tr
                    key={alt.id}
                    onClick={() => setSelectedAlert(alt)}
                    className={`cursor-pointer transition-colors ${
                      selectedAlert?.id === alt.id ? "bg-black/5 font-bold" : "hover:bg-black/5"
                    }`}
                  >
                    <td className="py-2 px-2.5 text-[var(--text-graphite-muted)]">#{alt.id}</td>
                    <td className="py-2 px-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase ${
                          alt.is_active
                            ? "bg-[var(--accent-copper)] text-white"
                            : "bg-black/5 text-[var(--text-graphite-muted)] border border-black/10"
                        }`}
                      >
                        {alt.is_active ? "ACTIVE" : "RESOLVED"}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-[2px] text-[8.5px] font-bold ${
                          alt.severity === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : "bg-[var(--accent-copper)] text-white"
                        }`}
                      >
                        {alt.severity}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-bold uppercase">{alt.metric}</td>
                    <td className="py-2 px-2.5 max-w-xs truncate">{alt.title}</td>
                    <td className="py-2 px-2.5 font-medium">
                      {alt.value} {alt.unit}
                    </td>
                    <td className="py-2 px-2.5 text-[10px] text-[var(--text-graphite-muted)]">
                      {new Date(alt.started_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-2.5 text-[10px] text-[var(--text-graphite-muted)]">
                      {alt.resolved_at
                        ? `RESOLVED ${new Date(alt.resolved_at).toLocaleTimeString()}`
                        : "ACTIVE RECORD"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-[10px] text-[var(--text-graphite-muted)] font-mono">
              {alertHistory.length === 0 ? "EVENT HISTORY UNAVAILABLE" : "NO EVENTS MATCHING CURRENT FILTER"}
            </div>
          )}
        </div>
      </div>

      {/* 3. TERTIARY: Rule Engine Logic & Recovery Hysteresis Explanation */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
          <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-copper)]" />
            <span>CURRENT ENGINE CONFIGURATION // DEBOUNCE &amp; RECOVERY HYSTERESIS RULES</span>
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[9px] text-[var(--text-charcoal)] font-bold uppercase tracking-wider py-1 border-b border-[var(--border-light)]/20">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">RULE EVALUATION</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">DEBOUNCE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)] text-white">ACTIVE EVENT</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">RECOVERY</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10">RESOLVED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
            <div className="font-bold text-[var(--accent-copper)] uppercase flex justify-between">
              <span>WARNING EVENT</span>
              <span>3 / 3 TO ACTIVATE</span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Requires 3 consecutive abnormal readings before activation to eliminate noise spikes.
            </div>
          </div>

          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
            <div className="font-bold text-red-600 uppercase flex justify-between">
              <span>CRITICAL EVENT</span>
              <span>IMMEDIATE</span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Escalates immediately upon breaching severe safety thresholds.
            </div>
          </div>

          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
            <div className="font-bold text-emerald-800 uppercase flex justify-between">
              <span>RECOVERY HYSTERESIS</span>
              <span>3 / 3 NORMAL TO RESOLVE</span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Requires 3 consecutive NORMAL readings before event resolution.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Database Context & Decision Support Linkage */}
      <div className="p-3 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[10px]">
          <div>
            <span className="text-[var(--text-graphite-muted)] uppercase">EVENT STORAGE: </span>
            <strong className="text-[var(--accent-copper)] uppercase">POSTGRESQL</strong>
          </div>
          <div>
            <span className="text-[var(--text-graphite-muted)] uppercase">HISTORY: </span>
            <strong className="text-[var(--text-charcoal)] uppercase">PERSISTED</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[var(--text-graphite-muted)] uppercase">RULE EVENTS ARE ONE EVIDENCE SOURCE →</span>
          <Link
            href="/control-center/decision-support"
            className="font-bold text-[var(--accent-copper)] hover:underline flex items-center gap-1"
          >
            <span>VIEW DECISION SUPPORT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
