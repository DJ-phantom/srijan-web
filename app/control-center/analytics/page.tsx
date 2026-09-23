"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Sliders,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";
import { useControlCenterContext } from "@/components/control-center/ControlCenterDataProvider";
import { TelemetryRecord, AlertRecord, parseTelemetryTimestamp, formatTelemetryTime } from "@/lib/api";
import { CHANNEL_CONFIGS, ChannelMeta } from "@/components/control-center/monitoring/MonitoringMainChart";
import MultiSensorTrendChart from "@/components/control-center/analytics/MultiSensorTrendChart";
import CorrelationMatrixView from "@/components/control-center/analytics/CorrelationMatrixView";
import ValueDistributionHistogram from "@/components/control-center/analytics/ValueDistributionHistogram";

// Calculate 95th Percentile
function calculateP95(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil(0.95 * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Calculate Median
function calculateMedian(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function AnalyticsPage() {
  const {
    telemetryCount,
    totalAlertCount,
    dataSource,
    lastUpdated,
    fetchTelemetryHistory,
    fetchAlertHistory,
    telemetry: liveTelemetry,
  } = useControlCenterContext();

  // Selected Historical Sample Limit: 60 | 300 | 500 (Max supported by backend)
  const [sampleLimit, setSampleLimit] = useState<number>(500);

  // Historical Telemetry Dataset state
  const [historyRecords, setHistoryRecords] = useState<TelemetryRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [retrievedAt, setRetrievedAt] = useState<string>("--:--:--");

  // Historical Alerts state
  const [alertRecords, setAlertRecords] = useState<AlertRecord[]>([]);

  // Trend Chart Controls
  const [chartMode, setChartMode] = useState<"RAW" | "NORMALIZED">("NORMALIZED");
  const [selectedKeys, setSelectedKeys] = useState<(keyof TelemetryRecord)[]>([
    "temperature",
    "vibration",
    "current",
  ]);

  // Histogram Selected Channel
  const [histChannelKey, setHistChannelKey] = useState<keyof TelemetryRecord>("vibration");

  // Telemetry Table Controls
  const [tableSearch, setTableSearch] = useState<string>("");
  const [sortField, setSortField] = useState<keyof TelemetryRecord>("timestamp");
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default newest first
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load Historical Dataset (ONCE on mount or when limit / refresh changes)
  const loadDataset = useCallback(
    async (limit: number) => {
      setIsLoadingHistory(true);
      const [tHist, aHist] = await Promise.all([
        fetchTelemetryHistory(limit),
        fetchAlertHistory(100),
      ]);

      if (tHist && tHist.length > 0) {
        // DB returns newest-first, reverse to chronological for trend/stats analysis
        setHistoryRecords([...tHist].reverse());
      } else {
        setHistoryRecords([]);
      }

      setAlertRecords(aHist || []);
      setRetrievedAt(new Date().toLocaleTimeString());
      setIsLoadingHistory(false);
    },
    [fetchTelemetryHistory, fetchAlertHistory]
  );

  useEffect(() => {
    loadDataset(sampleLimit);
  }, [sampleLimit, loadDataset]);

  // Derived Time Span
  const observedTimeSpan = useMemo(() => {
    if (!historyRecords || historyRecords.length < 2) return "--:--";

    let firstDate: Date | null = null;
    let lastDate: Date | null = null;

    for (let i = 0; i < historyRecords.length; i++) {
      const d = parseTelemetryTimestamp(historyRecords[i]);
      if (d) {
        if (!firstDate) firstDate = d;
        lastDate = d;
      }
    }

    if (!firstDate || !lastDate) return "--:--";

    const diffSec = Math.max(0, Math.round((lastDate.getTime() - firstDate.getTime()) / 1000));
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;

    const minStr = mins < 10 ? `0${mins}` : `${mins}`;
    const secStr = secs < 10 ? `0${secs}` : `${secs}`;

    if (hrs > 0) {
      const hrStr = hrs < 10 ? `0${hrs}` : `${hrs}`;
      return `${hrStr}:${minStr}:${secStr}`;
    }

    return `${minStr}:${secStr}`;
  }, [historyRecords]);

  // Window Statistics Table Calculation (Memoized over loaded history)
  const windowStats = useMemo(() => {
    if (!historyRecords || historyRecords.length === 0) return [];

    return CHANNEL_CONFIGS.map((cfg) => {
      const vals = historyRecords.map((r) => (typeof r[cfg.key] === "number" ? (r[cfg.key] as number) : 0));
      const currentVal =
        typeof liveTelemetry[cfg.key] === "number" ? (liveTelemetry[cfg.key] as number) : vals[vals.length - 1];

      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const median = calculateMedian(vals);
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
      const stdDev = Math.sqrt(variance);
      const range = max - min;
      const p95 = calculateP95(vals);

      return {
        config: cfg,
        currentVal,
        min,
        max,
        mean,
        median,
        stdDev,
        range,
        p95,
      };
    });
  }, [historyRecords, liveTelemetry]);

  // Data Stream Quality & Integrity Metrics (Memoized)
  const dataQuality = useMemo(() => {
    if (!historyRecords || historyRecords.length < 2) {
      return { count: 0, meanCadence: 0, maxGap: 0, duplicates: 0, invalidCount: 0 };
    }

    let maxGap = 0;
    let gapSum = 0;
    let validGapCount = 0;
    let duplicates = 0;
    let invalidCount = 0;
    const tsSet = new Set<string>();

    let prevDate: Date | null = null;

    for (let i = 0; i < historyRecords.length; i++) {
      const rawTs = historyRecords[i].timestamp;
      const d = parseTelemetryTimestamp(historyRecords[i]);

      if (!d) {
        invalidCount++;
        continue;
      }

      if (tsSet.has(rawTs)) {
        duplicates++;
      } else {
        tsSet.add(rawTs);
      }

      if (prevDate) {
        const diffSec = (d.getTime() - prevDate.getTime()) / 1000;
        if (diffSec >= 0) {
          if (diffSec > maxGap) maxGap = diffSec;
          gapSum += diffSec;
          validGapCount++;
        }
      }
      prevDate = d;
    }

    const meanCadence = validGapCount > 0 ? gapSum / validGapCount : 0;
    return {
      count: historyRecords.length,
      meanCadence,
      maxGap,
      duplicates,
      invalidCount,
    };
  }, [historyRecords]);

  // Table Filtering, Sorting, & Pagination (Memoized)
  const filteredRecords = useMemo(() => {
    if (!historyRecords) return [];
    let list = [...historyRecords];

    // Filter search
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.timestamp.toLowerCase().includes(q) ||
          r.device_id.toLowerCase().includes(q) ||
          r.scenario.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });

    return list;
  }, [historyRecords, tableSearch, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  // Handle CSV Export
  const exportCsv = (exportList: TelemetryRecord[], filename: string) => {
    if (!exportList || exportList.length === 0) return;

    const headers = [
      "timestamp",
      "device_id",
      "scenario",
      "temperature_C",
      "vibration_g",
      "current_A",
      "speed_ms",
      "alignment_mm",
      "load_pct",
    ];

    const rows = exportList.map((r) => [
      r.timestamp,
      r.device_id,
      r.scenario,
      r.temperature,
      r.vibration,
      r.current,
      r.speed,
      r.alignment,
      r.load,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle channel key for trend chart
  const toggleKeySelection = (key: keyof TelemetryRecord) => {
    if (chartMode === "RAW") {
      setSelectedKeys([key]);
    } else {
      if (selectedKeys.includes(key)) {
        if (selectedKeys.length > 1) {
          setSelectedKeys(selectedKeys.filter((k) => k !== key));
        }
      } else {
        if (selectedKeys.length < 3) {
          setSelectedKeys([...selectedKeys, key]);
        }
      }
    }
  };

  // Channel for Histogram Config
  const selectedHistConfig = CHANNEL_CONFIGS.find((c) => c.key === histChannelKey) || CHANNEL_CONFIGS[1];

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. PAGE HEADER + ENGINEERING METADATA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[var(--border-light)]/50 pb-3 font-mono">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
            // ANALYTICS
          </span>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5 uppercase">
            TELEMETRY ANALYTICS & HISTORICAL TRENDS
          </h1>
          <p className="text-[11px] font-sans text-[var(--text-graphite-muted)]">
            Historical telemetry analysis, descriptive statistics and multi-sensor comparison from persisted PostgreSQL records.
          </p>
        </div>

        {/* Technical Metadata Line */}
        <div className="flex flex-wrap items-center gap-2 text-[9.5px]">
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            DATABASE: <strong className="text-[var(--text-charcoal)]">POSTGRESQL</strong>
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            SOURCE: <strong className="text-[var(--text-charcoal)]">{dataSource}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            WINDOW: <strong className="text-[var(--accent-copper)]">{historyRecords.length} SAMPLES</strong>
          </span>
          <span className="px-2 py-0.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] font-semibold uppercase">
            RETRIEVED: <strong className="text-[var(--text-charcoal)]">{retrievedAt}</strong>
          </span>
        </div>
      </div>

      {/* 2. TOP ANALYTICS SUMMARY (4 KPIs) + WINDOW CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* KPI A — STORED TELEMETRY */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-[var(--text-charcoal)]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              STORED TELEMETRY
            </span>
            <Database className="w-3.5 h-3.5 opacity-60" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
              {telemetryCount !== null ? telemetryCount.toLocaleString() : "--"}
            </div>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] pt-1 uppercase">
              Total persisted DB records
            </div>
          </div>
        </div>

        {/* KPI B — RETRIEVED ANALYSIS WINDOW */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-[var(--accent-copper)]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              RETRIEVED WINDOW
            </span>
            <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
              {historyRecords.length} SAMPLES
            </div>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] pt-1 uppercase">
              PostgreSQL historical query
            </div>
          </div>
        </div>

        {/* KPI C — OBSERVED TIME SPAN */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-amber-600">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              OBSERVED TIME SPAN
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase">~1 HZ</span>
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
              {observedTimeSpan}
            </div>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] pt-1 uppercase">
              First $\to$ last sample timestamp
            </div>
          </div>
        </div>

        {/* KPI D — EVENT HISTORY */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-2 border-l-2 border-l-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider">
              EVENT HISTORY
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-[1px] text-[8.5px] font-bold uppercase ${
                (totalAlertCount || 0) > 0
                  ? "bg-[var(--accent-copper)] text-white"
                  : "bg-emerald-100/80 text-emerald-900 border border-emerald-200"
              }`}
            >
              {totalAlertCount || 0} EVENTS
            </span>
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)] leading-none">
              {totalAlertCount !== null ? totalAlertCount : 0}
            </div>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] pt-1 uppercase">
              {totalAlertCount === 0 ? "0 Persisted Rule Alerts" : "Total rule triggers"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ANALYSIS WINDOW CONTROLS & CHANNEL SELECTOR STRIP */}
      <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {/* Sample Window Selection */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase mr-1">
            ANALYSIS WINDOW:
          </span>
          <button
            onClick={() => setSampleLimit(60)}
            className={`px-3 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
              sampleLimit === 60
                ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
            }`}
          >
            60 SAMPLES (~1 MIN)
          </button>
          <button
            onClick={() => setSampleLimit(300)}
            className={`px-3 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
              sampleLimit === 300
                ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
            }`}
          >
            300 SAMPLES (~5 MIN)
          </button>
          <button
            onClick={() => setSampleLimit(500)}
            className={`px-3 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
              sampleLimit === 500
                ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
            }`}
          >
            500 SAMPLES MAX (~8 MIN MAX)
          </button>

          <button
            onClick={() => loadDataset(sampleLimit)}
            disabled={isLoadingHistory}
            className="px-2.5 py-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--accent-copper)] font-bold hover:bg-[var(--accent-copper)] hover:text-white transition-colors flex items-center gap-1 uppercase cursor-pointer ml-2"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingHistory ? "animate-spin" : ""}`} />
            <span>REFRESH</span>
          </button>
        </div>

        {/* Chart Mode Toggle */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase">MODE:</span>
          <button
            onClick={() => {
              setChartMode("RAW");
              setSelectedKeys(["vibration"]);
            }}
            className={`px-2.5 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
              chartMode === "RAW"
                ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
            }`}
          >
            RAW SINGLE-CHANNEL
          </button>
          <button
            onClick={() => {
              setChartMode("NORMALIZED");
              setSelectedKeys(["temperature", "vibration", "current"]);
            }}
            className={`px-2.5 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
              chartMode === "NORMALIZED"
                ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] hover:bg-white"
            }`}
          >
            NORMALIZED MULTI-CHANNEL (z-score σ)
          </button>
        </div>
      </div>

      {/* 4. PRIMARY MULTI-SENSOR TREND + CHANNEL CHECKBOX SELECTION */}
      <div className="space-y-2">
        {/* Channel Selection Checkboxes */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-mono text-[10px]">
          <span className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase mr-1">
            SELECT CHANNELS {chartMode === "NORMALIZED" ? "(MAX 3):" : "(SINGLE):"}
          </span>
          {CHANNEL_CONFIGS.map((c) => {
            const isChecked = selectedKeys.includes(c.key);
            return (
              <button
                key={c.id}
                onClick={() => toggleKeySelection(c.key)}
                className={`px-2 py-0.5 rounded-[2px] border font-bold uppercase transition-all cursor-pointer ${
                  isChecked
                    ? "bg-[var(--text-charcoal)] text-white border-[var(--text-charcoal)]"
                    : "bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-graphite-muted)] hover:text-[var(--text-charcoal)]"
                }`}
              >
                {c.shortName}
              </button>
            );
          })}
        </div>

        {/* MultiSensorTrendChart */}
        <MultiSensorTrendChart
          data={historyRecords}
          mode={chartMode}
          selectedChannelKeys={selectedKeys}
          windowLabel={`POSTGRESQL HISTORY [${historyRecords.length} SAMPLES]` }
        />
      </div>

      {/* 5. WINDOW STATISTICS TABLE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <div>
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // DESCRIPTIVE STATISTICS
            </span>
            <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
              WINDOW STATISTICS TABLE ({historyRecords.length} LOADED RECORDS)
            </h3>
          </div>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase font-semibold">
            FRONTEND CALCULATIONS OVER POSTGRESQL WINDOW
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse select-none">
            <thead>
              <tr className="border-b border-[var(--border-light)]/60 text-[8.5px] text-[var(--text-graphite-muted)] uppercase">
                <th className="py-2 px-2.5">CHANNEL</th>
                <th className="py-2 px-2.5">UNIT</th>
                <th className="py-2 px-2.5 text-right">CURRENT</th>
                <th className="py-2 px-2.5 text-right">MIN</th>
                <th className="py-2 px-2.5 text-right">MEAN (μ)</th>
                <th className="py-2 px-2.5 text-right">MEDIAN</th>
                <th className="py-2 px-2.5 text-right">MAX</th>
                <th className="py-2 px-2.5 text-right">STD DEV (σ)</th>
                <th className="py-2 px-2.5 text-right">RANGE (Δ)</th>
                <th className="py-2 px-2.5 text-right">P95</th>
              </tr>
            </thead>
            <tbody>
              {windowStats.map((row) => (
                <tr
                  key={row.config.id}
                  onClick={() => setHistChannelKey(row.config.key)}
                  className="border-b border-[var(--border-light)]/30 hover:bg-[var(--bg-stone)]/50 transition-colors cursor-pointer"
                >
                  <td className="py-2 px-2.5 font-bold text-[var(--text-charcoal)] uppercase">
                    {row.config.shortName}
                  </td>
                  <td className="py-2 px-2.5 text-[var(--text-graphite-muted)] font-semibold">
                    {row.config.unit}
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold text-[var(--accent-copper)]">
                    {row.currentVal.toFixed(row.config.decimals)}
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    {row.min.toFixed(row.config.decimals)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold text-[var(--text-charcoal)]">
                    {row.mean.toFixed(row.config.decimals)}
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    {row.median.toFixed(row.config.decimals)}
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    {row.max.toFixed(row.config.decimals)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-semibold text-[var(--text-charcoal)]">
                    {row.stdDev.toFixed(row.config.decimals + 1)}
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    {row.range.toFixed(row.config.decimals)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-semibold text-slate-800">
                    {row.p95.toFixed(row.config.decimals)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. 2-COLUMN ANALYTICAL GRID: CORRELATION MATRIX (50%) + VALUE DISTRIBUTION (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-6">
          <CorrelationMatrixView
            data={historyRecords}
            onSelectPair={(k1, k2) => {
              setChartMode("NORMALIZED");
              setSelectedKeys([k1, k2]);
            }}
          />
        </div>

        <div className="lg:col-span-6 space-y-2 font-mono">
          {/* Channel selector for histogram */}
          <div className="flex items-center justify-between p-2 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 text-[9.5px]">
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase">
              SELECT DISTRIBUTION CHANNEL:
            </span>
            <select
              value={histChannelKey}
              onChange={(e) => setHistChannelKey(e.target.value as keyof TelemetryRecord)}
              className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] font-bold uppercase text-[9.5px] cursor-pointer"
            >
              {CHANNEL_CONFIGS.map((c) => (
                <option key={c.id} value={c.key}>
                  {c.shortName}
                </option>
              ))}
            </select>
          </div>

          <ValueDistributionHistogram data={historyRecords} channel={selectedHistConfig} />
        </div>
      </div>

      {/* 7. DATA QUALITY & EVENT ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 font-mono text-xs">
        {/* Data Stream Quality Panel */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <div>
              <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
                // TELEMETRY INTEGRITY
              </span>
              <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                DATA QUALITY / WINDOW INTEGRITY
              </h3>
            </div>
            <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-semibold">
              STREAM HEALTH ANALYSIS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">RECORD COUNT</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {dataQuality.count}
              </div>
              <span className="text-[8px] text-[var(--text-graphite-muted)]">SAMPLES</span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">MEAN CADENCE</span>
              <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                {dataQuality.meanCadence.toFixed(2)}s
              </div>
              <span className="text-[8px] text-[var(--text-graphite-muted)]">TARGET: 1.00s</span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">LARGEST GAP</span>
              <div
                className={`font-heading text-lg font-bold ${
                  dataQuality.maxGap > 2.0 ? "text-[var(--accent-copper)]" : "text-[var(--text-charcoal)]"
                }`}
              >
                {dataQuality.maxGap.toFixed(2)}s
              </div>
              <span className="text-[8px] text-[var(--text-graphite-muted)]">
                {dataQuality.maxGap > 2.0 ? "GAP DETECTED" : "NOMINAL"}
              </span>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-0.5">
              <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-bold">DUPLICATES</span>
              <div className="font-heading text-lg font-bold text-emerald-800">
                {dataQuality.duplicates}
              </div>
              <span className="text-[8px] text-[var(--text-graphite-muted)]">TIMESTAMP MATCHES</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
            <span>TIMESTAMP TIMING AUDIT</span>
            <span>DATA-STREAM INTEGRITY CONTEXT</span>
          </div>
        </div>

        {/* Event Analytics Panel */}
        <div className="lg:col-span-6 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <div>
              <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
                // HISTORICAL EVENTS
              </span>
              <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
                PERSISTED EVENT HISTORY ({alertRecords.length})
              </h3>
            </div>
            <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-semibold">
              POSTGRESQL AUDIT LOG
            </span>
          </div>

          {alertRecords.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-[10.5px] font-bold text-[var(--text-charcoal)] uppercase">
                NO PERSISTED RULE EVENTS IN CURRENT DATABASE
              </span>
              <span className="text-[9.5px] font-sans text-[var(--text-graphite-muted)] max-w-sm">
                Current monitored conditions have not generated persisted warning or critical rule alerts in the PostgreSQL log.
              </span>
            </div>
          ) : (
            <div className="space-y-1.5 text-[10px]">
              {alertRecords.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[var(--text-charcoal)] uppercase">{a.title}</span>
                    <div className="text-[8.5px] text-[var(--text-graphite-muted)]">
                      {a.metric} — {a.value} {a.unit}
                    </div>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-[1px] bg-[var(--accent-copper)] text-white text-[8px] font-bold uppercase">
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
            <span>RULE ALERTS ENGINE PERSISTENCE</span>
            <span>SEVERITY AUDIT LOG</span>
          </div>
        </div>
      </div>

      {/* 8. POSTGRESQL TELEMETRY RECORDS DATA TABLE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs space-y-3 font-mono text-xs">
        {/* Table Top Controls & Search & CSV Export Buttons */}
        <div className="flex flex-wrap items-center justify-between border-b border-[var(--border-light)]/40 pb-3 gap-3">
          <div>
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // POSTGRESQL RECORD AUDIT
            </span>
            <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
              POSTGRESQL TELEMETRY RECORDS ({filteredRecords.length} ROWS)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-2 text-[var(--text-graphite-muted)]" />
              <input
                type="text"
                placeholder="SEARCH TIMESTAMP / ID…"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-7 pr-3 py-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] placeholder:text-[var(--text-graphite-muted)] font-mono text-[9.5px] outline-none focus:border-[var(--accent-copper)] w-48"
              />
            </div>

            {/* Rows Per Page Selector */}
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] font-bold uppercase text-[9.5px] cursor-pointer"
            >
              <option value={25}>25 ROWS</option>
              <option value={50}>50 ROWS</option>
              <option value={100}>100 ROWS</option>
            </select>

            {/* Export CSV Buttons */}
            <button
              onClick={() => exportCsv(historyRecords, `srijan_bc01_telemetry_${sampleLimit}_${Date.now()}.csv`)}
              className="px-2.5 py-1 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-bold hover:bg-[var(--accent-copper)] hover:text-white transition-colors flex items-center gap-1 uppercase cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>EXPORT WINDOW CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse select-none">
            <thead>
              <tr className="border-b border-[var(--border-light)]/60 text-[8.5px] text-[var(--text-graphite-muted)] uppercase sticky top-0 bg-white">
                <th
                  onClick={() => {
                    setSortField("timestamp");
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 cursor-pointer hover:text-[var(--text-charcoal)]"
                >
                  <div className="flex items-center gap-1">
                    <span>TIMESTAMP</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th className="py-2 px-2.5">DEVICE ID</th>
                <th className="py-2 px-2.5">SCENARIO</th>
                <th
                  onClick={() => {
                    setSortField("temperature");
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 text-right cursor-pointer hover:text-[var(--text-charcoal)]"
                >
                  TEMP (°C)
                </th>
                <th
                  onClick={() => {
                    setSortField("vibration");
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 text-right cursor-pointer hover:text-[var(--text-charcoal)]"
                >
                  VIB (g)
                </th>
                <th
                  onClick={() => {
                    setSortField("current");
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 text-right cursor-pointer hover:text-[var(--text-charcoal)]"
                >
                  CURR (A)
                </th>
                <th
                  onClick={() => {
                    setSortField("speed");
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 text-right cursor-pointer hover:text-[var(--text-charcoal)]"
                >
                  SPEED (m/s)
                </th>
                <th
                  onClick={() => {
                    setSortField("alignment");
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 text-right cursor-pointer hover:text-[var(--text-charcoal)]"
                >
                  ALIGN (mm)
                </th>
                <th
                  onClick={() => {
                    setSortField("load");
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 text-right cursor-pointer hover:text-[var(--text-charcoal)]"
                >
                  LOAD (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-[var(--text-graphite-muted)] uppercase">
                    NO MATCHING TELEMETRY RECORDS FOUND
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row, idx) => (
                  <tr key={idx} className="border-b border-[var(--border-light)]/30 hover:bg-[var(--bg-stone)]/50 transition-colors">
                    <td className="py-1.5 px-2.5 font-mono text-[9.5px]" suppressHydrationWarning>
                      {formatTelemetryTime(row.timestamp)}
                    </td>
                    <td className="py-1.5 px-2.5 text-[var(--text-graphite-muted)] font-semibold">{row.device_id}</td>
                    <td className="py-1.5 px-2.5 text-[var(--text-graphite-muted)]">{row.scenario}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">{row.temperature.toFixed(1)}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">{row.vibration.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">{row.current.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">{row.speed.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">
                      {row.alignment > 0 ? `+${row.alignment.toFixed(1)}` : row.alignment.toFixed(1)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-semibold">{row.load.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Controls */}
        <div className="pt-2 border-t border-[var(--border-light)]/40 flex items-center justify-between text-[9.5px]">
          <span className="text-[var(--text-graphite-muted)] uppercase">
            SHOWING {paginatedRecords.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} TO{" "}
            {Math.min(currentPage * rowsPerPage, filteredRecords.length)} OF {filteredRecords.length} RECORDS
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] disabled:opacity-40 font-bold uppercase cursor-pointer"
            >
              PREV
            </button>
            <span className="font-bold text-[var(--text-charcoal)]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/60 text-[var(--text-charcoal)] disabled:opacity-40 font-bold uppercase cursor-pointer"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
