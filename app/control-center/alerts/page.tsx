"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  PieChart,
} from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";
import { AlertRecord, parseTelemetryTimestamp } from "@/lib/api";

// Project component context mapping based on telemetry channels
const channelComponentMap: Record<string, string> = {
  temperature: "DRIVE HEAD / MOTOR BEARING",
  vibration: "DRIVE HEAD / MAIN PULLEY",
  current: "DRIVE HEAD / MOTOR DRIVE",
  speed: "BELT SECTION A / MAIN DRIVE",
  alignment: "BELT SECTION B / TRACKING ZONE",
  load: "TAIL / LOADING CHUTE",
};

import { CANONICAL_CHANNEL_CONFIGS } from "@/lib/controlCenterConfig";

// Canonical rule thresholds (matching Monitoring V2 & backend config)
const ruleThresholds: Record<
  string,
  { name: string; warning: string; critical: string; type: string; unit: string; warningNum: number }
> = {
  temperature: {
    name: CANONICAL_CHANNEL_CONFIGS.temperature.name,
    warning: CANONICAL_CHANNEL_CONFIGS.temperature.warnStr,
    critical: CANONICAL_CHANNEL_CONFIGS.temperature.critStr,
    type: CANONICAL_CHANNEL_CONFIGS.temperature.type.toUpperCase(),
    unit: CANONICAL_CHANNEL_CONFIGS.temperature.unit,
    warningNum: CANONICAL_CHANNEL_CONFIGS.temperature.warn,
  },
  vibration: {
    name: CANONICAL_CHANNEL_CONFIGS.vibration.name,
    warning: CANONICAL_CHANNEL_CONFIGS.vibration.warnStr,
    critical: CANONICAL_CHANNEL_CONFIGS.vibration.critStr,
    type: CANONICAL_CHANNEL_CONFIGS.vibration.type.toUpperCase(),
    unit: CANONICAL_CHANNEL_CONFIGS.vibration.unit,
    warningNum: CANONICAL_CHANNEL_CONFIGS.vibration.warn,
  },
  current: {
    name: CANONICAL_CHANNEL_CONFIGS.current.name,
    warning: CANONICAL_CHANNEL_CONFIGS.current.warnStr,
    critical: CANONICAL_CHANNEL_CONFIGS.current.critStr,
    type: CANONICAL_CHANNEL_CONFIGS.current.type.toUpperCase(),
    unit: CANONICAL_CHANNEL_CONFIGS.current.unit,
    warningNum: CANONICAL_CHANNEL_CONFIGS.current.warn,
  },
  speed: {
    name: CANONICAL_CHANNEL_CONFIGS.speed.name,
    warning: CANONICAL_CHANNEL_CONFIGS.speed.warnStr,
    critical: CANONICAL_CHANNEL_CONFIGS.speed.critStr,
    type: CANONICAL_CHANNEL_CONFIGS.speed.type.toUpperCase(),
    unit: CANONICAL_CHANNEL_CONFIGS.speed.unit,
    warningNum: CANONICAL_CHANNEL_CONFIGS.speed.warn,
  },
  alignment: {
    name: CANONICAL_CHANNEL_CONFIGS.alignment.name,
    warning: CANONICAL_CHANNEL_CONFIGS.alignment.warnStr,
    critical: CANONICAL_CHANNEL_CONFIGS.alignment.critStr,
    type: CANONICAL_CHANNEL_CONFIGS.alignment.type.toUpperCase(),
    unit: CANONICAL_CHANNEL_CONFIGS.alignment.unit,
    warningNum: CANONICAL_CHANNEL_CONFIGS.alignment.warn,
  },
  load: {
    name: CANONICAL_CHANNEL_CONFIGS.load.name,
    warning: CANONICAL_CHANNEL_CONFIGS.load.warnStr,
    critical: CANONICAL_CHANNEL_CONFIGS.load.critStr,
    type: CANONICAL_CHANNEL_CONFIGS.load.type.toUpperCase(),
    unit: CANONICAL_CHANNEL_CONFIGS.load.unit,
    warningNum: CANONICAL_CHANNEL_CONFIGS.load.warn,
  },
};

// Safe duration formatting helper
function formatDuration(startStr: string, endStr?: string | null): string {
  const start = parseTelemetryTimestamp(startStr);
  if (!start) return "--";

  const end = endStr ? parseTelemetryTimestamp(endStr) || new Date() : new Date();
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

export default function AlertsPage() {
  const { activeAlerts, alertHistory, alertCounts, fetchAlertHistory, telemetryHistory } =
    useControlCenterData();

  // Local state for fetched history & manual refresh
  const [localHistory, setLocalHistory] = useState<AlertRecord[]>(alertHistory);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Filter & Search states
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");
  const [filterSeverity, setFilterSeverity] = useState<"ALL" | "INFO" | "ATTENTION" | "WARNING" | "CRITICAL">("ALL");
  const [filterMetric, setFilterMetric] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(25);

  // Selected Alert for granular inspection
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);

  // Sync alertHistory prop into local state
  useEffect(() => {
    if (alertHistory.length > 0) {
      setLocalHistory(alertHistory);
    }
  }, [alertHistory]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fetched = await fetchAlertHistory(100);
      if (fetched) {
        setLocalHistory(fetched);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      // Graceful fallback
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAlertHistory]);

  // Combined dataset (Active alerts + persisted history)
  const combinedHistory = useMemo(() => {
    const map = new Map<number, AlertRecord>();
    activeAlerts.forEach((a) => map.set(a.id, a));
    localHistory.forEach((a) => {
      if (!map.has(a.id)) map.set(a.id, a);
    });
    return Array.from(map.values());
  }, [activeAlerts, localHistory]);

  // Highest Current Severity
  const highestSeverity = activeAlerts.some((a) => a.severity === "CRITICAL")
    ? "CRITICAL"
    : activeAlerts.some((a) => a.severity === "WARNING")
    ? "WARNING"
    : activeAlerts.some((a) => a.severity === "ATTENTION")
    ? "ATTENTION"
    : activeAlerts.some((a) => a.severity === "INFO")
    ? "INFO"
    : "NONE";

  // Filtered event history list
  const filteredEvents = useMemo(() => {
    return combinedHistory.filter((item) => {
      if (filterStatus === "ACTIVE" && !item.is_active) return false;
      if (filterStatus === "RESOLVED" && item.is_active) return false;

      if (filterSeverity !== "ALL" && item.severity !== filterSeverity) return false;
      if (filterMetric !== "ALL" && item.metric.toLowerCase() !== filterMetric.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = String(item.id).includes(q);
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMetric = item.metric.toLowerCase().includes(q);
        const matchMsg = item.message.toLowerCase().includes(q);
        return matchId || matchTitle || matchMetric || matchMsg;
      }
      return true;
    });
  }, [combinedHistory, filterStatus, filterSeverity, filterMetric, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredEvents.slice(startIdx, startIdx + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterSeverity, filterMetric, searchQuery, pageSize]);

  // Active detail selection default: selected -> active 0 -> history 0
  const activeDetail = selectedAlert || activeAlerts[0] || combinedHistory[0] || null;

  // Selected event evidence calculations
  const evidenceCalc = useMemo(() => {
    if (!activeDetail) return null;
    const metricKey = activeDetail.metric.toLowerCase();
    const config = ruleThresholds[metricKey];
    const obsVal = activeDetail.value;

    let excessText = "--";
    let limitText = config ? config.warning : "Configured Limit";

    if (config) {
      if (config.type === "UPPER LIMIT") {
        const diff = obsVal - config.warningNum;
        excessText = diff >= 0 ? `+${diff.toFixed(2)} ${config.unit}` : `${diff.toFixed(2)} ${config.unit}`;
      } else if (config.type === "LOWER LIMIT") {
        const diff = config.warningNum - obsVal;
        excessText = diff >= 0 ? `-${diff.toFixed(2)} ${config.unit} (DEFICIT)` : `+${Math.abs(diff).toFixed(2)} ${config.unit}`;
      } else if (config.type === "ABSOLUTE DEVIATION") {
        const absVal = Math.abs(obsVal);
        const diff = absVal - config.warningNum;
        excessText = diff >= 0 ? `+${diff.toFixed(2)} ${config.unit}` : `${diff.toFixed(2)} ${config.unit}`;
      }
    }

    return {
      metricName: config ? config.name : activeDetail.metric.toUpperCase(),
      observed: `${obsVal} ${activeDetail.unit || config?.unit || ""}`,
      ruleLimit: limitText,
      excess: excessText,
      status: activeDetail.severity,
      component: channelComponentMap[metricKey] || "CONVEYOR STRUCTURE",
    };
  }, [activeDetail]);

  // Persistent Analytics metrics derived from real data
  const hasHistoryData = combinedHistory.length > 0;

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { CRITICAL: 0, WARNING: 0, ATTENTION: 0, INFO: 0 };
    combinedHistory.forEach((item) => {
      if (counts[item.severity] !== undefined) counts[item.severity]++;
    });
    return counts;
  }, [combinedHistory]);

  const metricCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    combinedHistory.forEach((item) => {
      const key = item.metric.toUpperCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [combinedHistory]);

  // Duration statistics for resolved events
  const durationStats = useMemo(() => {
    const resolvedDurations: number[] = [];
    combinedHistory.forEach((item) => {
      if (item.resolved_at && item.started_at) {
        const start = parseTelemetryTimestamp(item.started_at);
        const end = parseTelemetryTimestamp(item.resolved_at);
        if (start && end) {
          const sec = (end.getTime() - start.getTime()) / 1000;
          if (sec >= 0) resolvedDurations.push(sec);
        }
      }
    });

    if (resolvedDurations.length === 0) return null;
    const minSec = Math.min(...resolvedDurations);
    const maxSec = Math.max(...resolvedDurations);
    const avgSec = resolvedDurations.reduce((a, b) => a + b, 0) / resolvedDurations.length;

    return {
      count: resolvedDurations.length,
      min: `${Math.round(minSec)}s`,
      max: `${Math.round(maxSec)}s`,
      avg: `${Math.round(avgSec)}s`,
    };
  }, [combinedHistory]);

  const mostRecentEvent = combinedHistory.length > 0 ? combinedHistory[0] : null;

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. TOP PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-3 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // ALERTS &amp; EVENTS
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            CONDITION EVENT MANAGEMENT
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono pt-0.5">
            Rule-based conveyor event monitoring with severity, threshold evidence, recovery state and persisted event history.
          </div>
        </div>

        {/* Technical Metadata Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            ACTIVE EVENTS: <strong className="text-[var(--accent-copper)]">{alertCounts.active}</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            PERSISTED EVENTS: <strong>{alertCounts.total}</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs uppercase">
            HIGHEST SEVERITY:{" "}
            <span
              className={
                highestSeverity === "CRITICAL"
                  ? "text-red-700 font-bold"
                  : highestSeverity === "WARNING"
                  ? "text-[var(--accent-copper)] font-bold"
                  : highestSeverity === "ATTENTION"
                  ? "text-amber-800 font-bold"
                  : "text-emerald-800 font-bold"
              }
            >
              {highestSeverity}
            </span>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-graphite-muted)] shadow-2xs">
            ENGINE: <strong className="text-[var(--text-charcoal)]">RULE MONITORING</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-graphite-muted)] shadow-2xs">
            DATABASE: <strong className="text-[var(--text-charcoal)]">POSTGRESQL</strong>
          </div>
        </div>
      </div>

      {/* 2. TOP OPERATIONAL SUMMARY (4 KPIS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* KPI 1: ACTIVE EVENTS */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              ACTIVE EVENTS
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
          </div>
          <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
            {alertCounts.active}
          </div>
          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans">
            {alertCounts.active === 0 ? "All limits within bounds" : `${alertCounts.active} active threshold breach(es)`}
          </div>
        </div>

        {/* KPI 2: PERSISTED EVENTS */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              PERSISTED EVENTS
            </span>
            <Clock className="w-3.5 h-3.5 text-[var(--text-graphite-muted)]" />
          </div>
          <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
            {alertCounts.total}
          </div>
          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans">
            Total recorded in PostgreSQL archive
          </div>
        </div>

        {/* KPI 3: HIGHEST SEVERITY */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              HIGHEST SEVERITY
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div
            className={`font-heading text-xl font-bold uppercase ${
              highestSeverity === "CRITICAL"
                ? "text-red-700"
                : highestSeverity === "WARNING"
                ? "text-[var(--accent-copper)]"
                : "text-emerald-800"
            }`}
          >
            {highestSeverity}
          </div>
          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans">
            Current active alert severity peak
          </div>
        </div>

        {/* KPI 4: MOST RECENT EVENT */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              MOST RECENT EVENT
            </span>
            <Activity className="w-3.5 h-3.5 text-[var(--text-graphite-muted)]" />
          </div>
          {mostRecentEvent ? (
            <div>
              <div className="font-bold text-[var(--text-charcoal)] truncate text-[11px]">
                {mostRecentEvent.metric.toUpperCase()} — #{mostRecentEvent.id}
              </div>
              <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-mono">
                {new Date(mostRecentEvent.started_at).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold text-[var(--text-graphite-muted)] text-xs uppercase">
                NO PERSISTED EVENTS
              </div>
              <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans">
                Database history is empty
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ACTIVE EVENT COMMAND AREA */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>ACTIVE EVENTS ({activeAlerts.length})</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
            REAL-TIME RULE MONITORING
          </span>
        </div>

        {activeAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAlerts.slice(0, 5).map((alt) => {
              const comp = channelComponentMap[alt.metric.toLowerCase()] || "CONVEYOR STRUCTURE";
              const dur = formatDuration(alt.started_at);
              const isSel = activeDetail?.id === alt.id;

              return (
                <div
                  key={alt.id}
                  onClick={() => setSelectedAlert(alt)}
                  className={`p-3.5 rounded-[2px] border cursor-pointer transition-all space-y-2 ${
                    isSel
                      ? "bg-white border-[var(--accent-copper)] shadow-xs ring-1 ring-[var(--accent-copper)]/30"
                      : "bg-[var(--bg-stone)] border-[var(--border-light)]/40 hover:border-[var(--accent-copper)]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-charcoal)] uppercase text-[11px]">
                      #{alt.id} {alt.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase ${
                        alt.severity === "CRITICAL"
                          ? "bg-red-600 text-white"
                          : "bg-[var(--accent-copper)] text-white"
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </div>

                  <div className="text-[10.5px] text-[var(--text-charcoal)] font-sans leading-snug">
                    {alt.message}
                  </div>

                  <div className="text-[9px] text-[var(--text-graphite-muted)] font-mono border-t border-[var(--border-light)]/30 pt-1.5 space-y-0.5">
                    <div className="flex justify-between">
                      <span>OBSERVED / THRESHOLD:</span>
                      <strong className="text-[var(--text-charcoal)]">
                        {alt.value} {alt.unit}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>COMPONENT:</span>
                      <strong className="text-[var(--text-graphite-muted)]">{comp}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>ACTIVE DURATION:</span>
                      <strong className="text-[var(--accent-copper)]">{dur}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-center font-mono space-y-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 mx-auto opacity-80" />
            <div className="text-[11px] font-bold text-[var(--text-charcoal)] uppercase pt-1">
              NO ACTIVE RULE EVENTS
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] font-sans max-w-md mx-auto">
              All monitored channels remain within currently configured prototype thresholds.
            </div>
          </div>
        )}
      </div>

      {/* 4. SELECTED EVENT INSPECTION & CONDITION EVIDENCE */}
      {activeDetail && evidenceCalc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
          {/* Selected Event Details (col-span-7) */}
          <div className="lg:col-span-7 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
              <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase">
                SELECTED EVENT INSPECTION // #{activeDetail.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-[2px] text-[8.5px] font-bold uppercase ${
                  activeDetail.is_active
                    ? "bg-[var(--accent-copper)] text-white"
                    : "bg-black/10 text-[var(--text-graphite-muted)]"
                }`}
              >
                {activeDetail.is_active ? "ACTIVE" : "RESOLVED"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-[var(--text-charcoal)]">
              <div className="border-b border-[var(--border-light)]/20 pb-1">
                <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">EVENT TITLE</span>
                <strong>{activeDetail.title}</strong>
              </div>
              <div className="border-b border-[var(--border-light)]/20 pb-1">
                <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">METRIC / CHANNEL</span>
                <strong className="text-[var(--accent-copper)]">{activeDetail.metric.toUpperCase()}</strong>
              </div>
              <div className="border-b border-[var(--border-light)]/20 pb-1">
                <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">OBSERVED VALUE</span>
                <strong>
                  {activeDetail.value} {activeDetail.unit}
                </strong>
              </div>
              <div className="border-b border-[var(--border-light)]/20 pb-1">
                <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">MONITORED COMPONENT</span>
                <strong>{evidenceCalc.component}</strong>
              </div>
              <div className="border-b border-[var(--border-light)]/20 pb-1">
                <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">STARTED AT</span>
                <strong>{new Date(activeDetail.started_at).toLocaleTimeString()}</strong>
              </div>
              <div className="border-b border-[var(--border-light)]/20 pb-1">
                <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">DURATION / STATE</span>
                <strong>{formatDuration(activeDetail.started_at, activeDetail.resolved_at)}</strong>
              </div>
            </div>

            {/* Navigation Buttons to Monitoring & Decision Support */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-light)]/30">
              <Link
                href={`/control-center/monitoring?channel=${activeDetail.metric.toLowerCase()}`}
                className="px-3 py-1.5 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 text-[10px] font-bold text-[var(--text-charcoal)] flex items-center gap-1.5 transition-colors"
              >
                <span>INSPECT SIGNAL ({activeDetail.metric.toUpperCase()})</span>
                <ArrowRight className="w-3 h-3 text-[var(--accent-copper)]" />
              </Link>
              <Link
                href="/control-center/decision-support"
                className="px-3 py-1.5 rounded-[2px] bg-[var(--accent-copper)] hover:bg-[var(--accent-copper)]/90 text-[10px] font-bold text-white flex items-center gap-1.5 transition-colors"
              >
                <span>VIEW DECISION SUPPORT</span>
                <ArrowRight className="w-3 h-3 text-white" />
              </Link>
            </div>
          </div>

          {/* Condition Evidence Calculation (col-span-5) */}
          <div className="lg:col-span-5 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
              <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>CONDITION EVIDENCE</span>
              </span>
              <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">THRESHOLD DIFFERENTIAL</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
              <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
                <div className="text-[8px] text-[var(--text-graphite-muted)] uppercase">OBSERVED</div>
                <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
                  {evidenceCalc.observed}
                </div>
              </div>
              <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
                <div className="text-[8px] text-[var(--text-graphite-muted)] uppercase">RULE LIMIT</div>
                <div className="font-heading text-base font-bold text-[var(--accent-copper)] pt-0.5">
                  {evidenceCalc.ruleLimit}
                </div>
              </div>
              <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
                <div className="text-[8px] text-[var(--text-graphite-muted)] uppercase">EXCESS / DEFICIT</div>
                <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
                  {evidenceCalc.excess}
                </div>
              </div>
              <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
                <div className="text-[8px] text-[var(--text-graphite-muted)] uppercase">SEVERITY STATUS</div>
                <div className="font-heading text-base font-bold text-[var(--accent-copper)] uppercase pt-0.5">
                  {evidenceCalc.status}
                </div>
              </div>
            </div>

            <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans pt-1">
              Differential calculates exact deviation between observed telemetry sample and configured engineering rule limit.
            </div>
          </div>
        </div>
      )}

      {/* 5. OPERATOR RESPONSE WORKFLOW GUIDANCE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
            OPERATOR RESPONSE GUIDANCE WORKFLOW
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">SYSTEMATIC EVENT RESPONSE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[10px]">
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="font-bold text-[var(--accent-copper)] uppercase">01 ACKNOWLEDGE</div>
            <div className="text-[9.5px] font-sans text-[var(--text-graphite-muted)]">
              Review event severity, threshold breach evidence, and timestamp duration.
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="font-bold text-[var(--text-charcoal)] uppercase">02 INSPECT</div>
            <div className="text-[9.5px] font-sans text-[var(--text-graphite-muted)]">
              Inspect indicated monitored component zone and signal trajectory in Live Monitoring.
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="font-bold text-[var(--text-charcoal)] uppercase">03 ACT</div>
            <div className="text-[9.5px] font-sans text-[var(--text-graphite-muted)]">
              Perform appropriate operator-approved inspection or corrective alignment procedure.
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="font-bold text-emerald-800 uppercase">04 VERIFY</div>
            <div className="text-[9.5px] font-sans text-[var(--text-graphite-muted)]">
              Confirm telemetry recovery and sustained hysteresis return to normal state.
            </div>
          </div>
        </div>
      </div>

      {/* 6. EVENT ANALYTICS PANEL */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            <span>EVENT ANALYTICS</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
            POSTGRESQL ARCHIVE STATISTICS
          </span>
        </div>

        {hasHistoryData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
            {/* Severity Distribution */}
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-2">
              <div className="font-bold text-[var(--text-charcoal)] uppercase border-b border-[var(--border-light)]/30 pb-1">
                SEVERITY DISTRIBUTION
              </div>
              <div className="space-y-1.5 font-mono text-[9.5px]">
                {Object.entries(severityCounts).map(([sev, count]) => {
                  const pct = combinedHistory.length > 0 ? ((count / combinedHistory.length) * 100).toFixed(0) : 0;
                  return (
                    <div key={sev} className="flex justify-between items-center">
                      <span className="text-[var(--text-graphite-muted)]">{sev}:</span>
                      <strong className="text-[var(--text-charcoal)]">
                        {count} ({pct}%)
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events by Metric */}
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-2">
              <div className="font-bold text-[var(--text-charcoal)] uppercase border-b border-[var(--border-light)]/30 pb-1">
                RULE EVENT FREQUENCY BY METRIC
              </div>
              <div className="space-y-1.5 font-mono text-[9.5px]">
                {metricCounts.map(([metric, count]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-[var(--text-graphite-muted)]">{metric}:</span>
                    <strong className="text-[var(--text-charcoal)]">{count} events</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Duration Statistics */}
            <div className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-2">
              <div className="font-bold text-[var(--text-charcoal)] uppercase border-b border-[var(--border-light)]/30 pb-1">
                RULE EVENT ACTIVE DURATION
              </div>
              {durationStats ? (
                <div className="space-y-1.5 font-mono text-[9.5px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-graphite-muted)]">RESOLVED EVENTS:</span>
                    <strong className="text-[var(--text-charcoal)]">{durationStats.count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-graphite-muted)]">MIN DURATION:</span>
                    <strong className="text-[var(--text-charcoal)]">{durationStats.min}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-graphite-muted)]">AVG DURATION:</span>
                    <strong className="text-[var(--accent-copper)]">{durationStats.avg}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-graphite-muted)]">MAX DURATION:</span>
                    <strong className="text-[var(--text-charcoal)]">{durationStats.max}</strong>
                  </div>
                </div>
              ) : (
                <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
                  No resolved event duration data available.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-center font-mono space-y-1">
            <div className="text-[11px] font-bold text-[var(--text-charcoal)] uppercase">
              NO PERSISTED EVENT DATA YET
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] font-sans">
              Analytics breakdown will become available when rule events are generated and persisted to the PostgreSQL database.
            </div>
          </div>
        )}
      </div>

      {/* 7. HISTORICAL EVENT LOG TABLE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-copper)]" />
              <span>POSTGRESQL EVENT HISTORY ({filteredEvents.length})</span>
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)]">
              SHOWING LATEST {paginatedEvents.length} OF TOTAL {filteredEvents.length} EVENTS
            </span>
          </div>

          {/* Controls: Refresh, Search, Filters, Page Size */}
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1 rounded-[2px] bg-[var(--bg-stone)] hover:bg-black/5 border border-[var(--border-light)]/40 text-[9.5px] font-bold text-[var(--text-charcoal)] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[var(--accent-copper)]" : ""}`} />
              <span>{isRefreshing ? "REFRESHING..." : "REFRESH EVENT HISTORY"}</span>
            </button>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-[var(--text-graphite-muted)] absolute left-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event/ID..."
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
              {(["ALL", "INFO", "ATTENTION", "WARNING", "CRITICAL"] as const).map((sev) => (
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

        {/* Event History Table */}
        <div className="overflow-x-auto">
          {paginatedEvents.length > 0 ? (
            <table className="w-full text-left border-collapse font-mono text-[10px]">
              <thead>
                <tr className="border-b border-[var(--border-light)]/40 text-[9px] text-[var(--text-graphite-muted)] uppercase">
                  <th className="py-2 px-2.5 font-bold">ID</th>
                  <th className="py-2 px-2.5 font-bold">STATE</th>
                  <th className="py-2 px-2.5 font-bold">SEVERITY</th>
                  <th className="py-2 px-2.5 font-bold">METRIC</th>
                  <th className="py-2 px-2.5 font-bold">EVENT TITLE</th>
                  <th className="py-2 px-2.5 font-bold text-right">OBSERVED VALUE</th>
                  <th className="py-2 px-2.5 font-bold">STARTED AT</th>
                  <th className="py-2 px-2.5 font-bold">RESOLVED / LAST SEEN</th>
                  <th className="py-2 px-2.5 font-bold text-right">DURATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]/20">
                {paginatedEvents.map((alt) => {
                  const isSel = activeDetail?.id === alt.id;
                  const dur = formatDuration(alt.started_at, alt.resolved_at);

                  return (
                    <tr
                      key={alt.id}
                      onClick={() => setSelectedAlert(alt)}
                      className={`cursor-pointer transition-colors ${
                        isSel ? "bg-black/5 font-bold" : "hover:bg-black/5"
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
                              : alt.severity === "WARNING"
                              ? "bg-[var(--accent-copper)] text-white"
                              : "bg-amber-500/20 text-amber-950 border border-amber-500/40"
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-bold uppercase">{alt.metric}</td>
                      <td className="py-2 px-2.5 max-w-xs truncate">{alt.title}</td>
                      <td className="py-2 px-2.5 text-right font-bold text-[var(--text-charcoal)]">
                        {alt.value} {alt.unit}
                      </td>
                      <td className="py-2 px-2.5 text-[9.5px] text-[var(--text-graphite-muted)]">
                        {new Date(alt.started_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-2.5 text-[9.5px] text-[var(--text-graphite-muted)]">
                        {alt.resolved_at
                          ? new Date(alt.resolved_at).toLocaleTimeString()
                          : "ACTIVE RECORD"}
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-[var(--text-charcoal)]">
                        {dur}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-[10px] text-[var(--text-graphite-muted)] font-mono">
              {combinedHistory.length === 0
                ? "NO PERSISTED RULE EVENTS IN CURRENT DATABASE"
                : "NO PERSISTED EVENTS MATCHING CURRENT FILTER"}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {filteredEvents.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[var(--border-light)]/30 text-[10px]">
            <div className="text-[var(--text-graphite-muted)]">
              LAST HISTORY REFRESH: <strong className="text-[var(--text-charcoal)]">{lastRefreshed}</strong>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[var(--text-graphite-muted)]">ROWS PER PAGE:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value) as 25 | 50 | 100)}
                  className="px-1.5 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[10px] focus:outline-hidden"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-[var(--text-charcoal)] px-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. DEBOUNCE & RECOVERY HYSTERESIS ENGINE PANEL */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-copper)]" />
            <span>EVENT ENGINE LOGIC // DEBOUNCE &amp; RECOVERY HYSTERESIS</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
            STATEFUL HYSTERESIS EVALUATION
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] text-[var(--text-charcoal)] font-bold uppercase tracking-wider py-1 border-b border-[var(--border-light)]/20">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">RULE EVALUATION</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">DEBOUNCE (3 SAMPLES)</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)] text-white">ACTIVE EVENT</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">RECOVERY HYSTERESIS</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-black/5 text-[var(--text-graphite-muted)] border border-black/10">RESOLVED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="font-bold text-[var(--accent-copper)] uppercase flex justify-between">
              <span>WARNING EVENT</span>
              <span>3 / 3 ABNORMAL READINGS</span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Requires 3 consecutive abnormal readings before event activation to prevent noise flicker.
            </div>
          </div>

          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="font-bold text-red-600 uppercase flex justify-between">
              <span>CRITICAL EVENT</span>
              <span>IMMEDIATE ACTIVATION</span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Breaches severe safety thresholds and activates immediately without delay.
            </div>
          </div>

          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="font-bold text-emerald-800 uppercase flex justify-between">
              <span>RECOVERY HYSTERESIS</span>
              <span>3 / 3 NORMAL READINGS</span>
            </div>
            <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
              Requires 3 consecutive NORMAL readings before event is formally resolved.
            </div>
          </div>
        </div>

        <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans pt-0.5">
          Debounce reduces transient event activation caused by isolated noisy readings. Recovery hysteresis requires sustained return to normal before closing an event.
        </div>
      </div>

      {/* 9. CANONICAL RULE THRESHOLD REFERENCE TABLE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
            CANONICAL RULE THRESHOLD REFERENCE
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">
            CONFIGURED ENGINE LIMITS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-light)]/50 text-[9px] text-[var(--text-graphite-muted)] uppercase">
                <th className="py-2 px-2 font-bold">TELEMETRY CHANNEL</th>
                <th className="py-2 px-2 font-bold">MONITORED COMPONENT</th>
                <th className="py-2 px-2 font-bold text-center">WARNING THRESHOLD</th>
                <th className="py-2 px-2 font-bold text-center">CRITICAL THRESHOLD</th>
                <th className="py-2 px-2 font-bold text-right">RULE TYPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]/20">
              {Object.entries(ruleThresholds).map(([key, item]) => (
                <tr key={key} className="hover:bg-black/[0.02]">
                  <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">{item.name.toUpperCase()}</td>
                  <td className="py-2 px-2 text-[9px] text-[var(--text-graphite-muted)]">
                    {channelComponentMap[key] || "CONVEYOR STRUCTURE"}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-[var(--accent-copper)]">
                    {item.warning}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-red-600">
                    {item.critical}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-[9px] text-[var(--text-graphite-muted)]">
                    {item.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10. BOTTOM DATA SOURCE & DECISION SUPPORT HANDOFF */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[10px]">
          <div>
            <span className="text-[var(--text-graphite-muted)] uppercase">EVENT STORAGE: </span>
            <strong className="text-[var(--accent-copper)] uppercase">POSTGRESQL ARCHIVE</strong>
          </div>
          <div>
            <span className="text-[var(--text-graphite-muted)] uppercase">ENGINE: </span>
            <strong className="text-[var(--text-charcoal)] uppercase">RULE MONITORING</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[var(--text-graphite-muted)] uppercase">RULE EVENTS ARE ONE EVIDENCE SOURCE →</span>
          <Link
            href="/control-center/decision-support"
            className="px-3 py-1.5 rounded-[2px] bg-[var(--accent-copper)] hover:bg-[var(--accent-copper)]/90 text-white font-bold text-[10.5px] flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>VIEW DECISION SUPPORT</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
