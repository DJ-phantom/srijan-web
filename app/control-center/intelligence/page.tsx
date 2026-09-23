"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, Activity, ArrowRight, Info, Layers, Sliders, ArrowUpRight, BarChart2 } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";

// Known baseline statistics for the 6 canonical telemetry channels
// Trained on N = 1,733 normal operating telemetry records
const baselineStats: Record<
  string,
  { name: string; key: keyof TelemetryValues; mean: number; std: number; unit: string }
> = {
  temperature: { name: "Temperature", key: "temperature", mean: 41.0, std: 2.5, unit: "°C" },
  vibration: { name: "Vibration", key: "vibration", mean: 0.27, std: 0.04, unit: "g" },
  current: { name: "Motor Current", key: "current", mean: 4.15, std: 0.25, unit: "A" },
  speed: { name: "Belt Speed", key: "speed", mean: 1.8, std: 0.08, unit: "m/s" },
  alignment: { name: "Alignment", key: "alignment", mean: 0.0, std: 0.25, unit: "mm" },
  load: { name: "Load", key: "load", mean: 60.0, std: 5.0, unit: "%" },
};

interface TelemetryValues {
  temperature: number;
  vibration: number;
  current: number;
  speed: number;
  alignment: number;
  load: number;
}

export default function IntelligencePage() {
  const { anomalyAssessment, anomalyIndexHistory, telemetry, lastUpdated, dataSource } =
    useControlCenterData();

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Anomaly Assessment values from real backend (or structured fallback)
  const anomalyIndex = anomalyAssessment?.anomaly_index ?? 7.2;
  const rawScore = anomalyAssessment?.decision_score ?? 0.2268;
  const isAnomaly = anomalyAssessment?.is_anomaly ?? false;
  const patternStatus = anomalyAssessment?.status || (isAnomaly ? "ANOMALOUS_PATTERN" : "NORMAL_PATTERN");
  const windowSize = anomalyAssessment?.window_size ?? 5;
  const recentAnomalyCount = anomalyAssessment?.recent_anomaly_count ?? (isAnomaly ? 3 : 0);

  // Build the 5-sample decision window representation
  const sampleWindow = Array.from({ length: windowSize }, (_, i) => {
    // If anomalous trigger active, represent recent samples reaching majority threshold
    if (recentAnomalyCount > 0) {
      return i < recentAnomalyCount ? "ANOMALOUS" : "NORMAL";
    }
    return "NORMAL";
  });

  // 6 Channel input values
  const currentTelemetry: TelemetryValues = {
    temperature: telemetry?.temperature ?? 41.2,
    vibration: telemetry?.vibration ?? 0.28,
    current: telemetry?.current ?? 4.16,
    speed: telemetry?.speed ?? 1.8,
    alignment: telemetry?.alignment ?? 0.1,
    load: telemetry?.load ?? 59.8,
  };

  // Compute z-scores for all 6 channels
  const channelDeviations = Object.entries(baselineStats).map(([key, stat]) => {
    const val = currentTelemetry[stat.key];
    const zScore = stat.std > 0 ? (val - stat.mean) / stat.std : 0;
    const absZ = Math.abs(zScore);

    let statusLabel: "LOW DEVIATION" | "MODERATE DEVIATION" | "HIGH DEVIATION" = "LOW DEVIATION";
    if (absZ >= 2.0) {
      statusLabel = "HIGH DEVIATION";
    } else if (absZ >= 1.0) {
      statusLabel = "MODERATE DEVIATION";
    }

    return {
      id: key,
      name: stat.name,
      value: val,
      mean: stat.mean,
      std: stat.std,
      unit: stat.unit,
      zScore,
      absZ,
      statusLabel,
    };
  });

  // Sort descending by absolute z-score deviation
  const sortedDeviations = [...channelDeviations].sort((a, b) => b.absZ - a.absZ);

  // Buffer length for session charts
  const historyCount = anomalyIndexHistory.length;
  const isAccumulating = historyCount < 5;

  return (
    <div className="space-y-4 font-sans select-none text-[var(--text-charcoal)] pb-6">
      {/* 1. TOP PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-3 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // INTELLIGENCE / AI
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            MULTIVARIATE ANOMALY ASSESSMENT
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono pt-0.5">
            Unsupervised six-channel pattern monitoring using Isolation Forest trained on normal conveyor baseline telemetry.
          </div>
        </div>

        {/* Technical Metadata Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            MODEL: <strong className="text-[var(--accent-copper)]">ISOLATION FOREST</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            INPUTS: <strong>6 NUMERICAL CHANNELS</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs">
            WINDOW: <strong>5 SAMPLES</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-graphite-muted)] shadow-2xs">
            SOURCE: <strong className="text-[var(--text-charcoal)]">{dataSource}</strong>
          </div>
          <div className="px-2 py-1 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 font-semibold text-[var(--text-charcoal)] shadow-2xs uppercase">
            STATUS:{" "}
            <span className={isAnomaly ? "text-[var(--accent-copper)] font-bold" : "text-emerald-800 font-bold"}>
              {patternStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP SCIENTIFIC SUMMARY (4 PRIMARY ANALYTICAL PANELS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* PANEL A: PATTERN STATUS */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              PATTERN STATUS
            </span>
            <Cpu className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
          </div>
          <div>
            <div className="pt-0.5">
              <span
                className={`inline-block px-2.5 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider ${
                  isAnomaly
                    ? "bg-[var(--accent-copper)] text-white"
                    : "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 font-bold"
                }`}
              >
                {isAnomaly ? "ANOMALOUS PATTERN" : "NORMAL PATTERN"}
              </span>
            </div>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] leading-tight pt-2 font-sans">
              Current multivariate telemetry pattern compared against learned normal baseline.
            </div>
          </div>
        </div>

        {/* PANEL B: ANOMALY INDEX */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              ANOMALY INDEX
            </span>
            <span className="text-[9px] font-bold text-[var(--accent-copper)]">0 - 100 SCALE</span>
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
              {anomalyIndex.toFixed(1)} <span className="text-xs font-mono font-normal opacity-60">/ 100</span>
            </div>
            <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase tracking-wider pt-0.5">
              DEVIATION INDEX — NOT FAILURE PROBABILITY
            </div>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] leading-tight pt-1 font-sans">
              Calibrated representation of multivariate distance/deviation from the learned normal operating baseline.
            </div>
          </div>
        </div>

        {/* PANEL C: RAW MODEL SCORE */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              RAW MODEL SCORE
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)]">SCIKIT-LEARN</span>
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[var(--text-charcoal)]">
              {rawScore >= 0 ? `+${rawScore.toFixed(4)}` : rawScore.toFixed(4)}
            </div>
            <div className="text-[9px] font-bold text-[var(--text-graphite-muted)] uppercase tracking-wider pt-0.5">
              RAW DECISION SCORE
            </div>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] leading-tight pt-1 font-sans">
              Positive values indicate normal cluster membership. Negative values indicate isolated outliers.
            </div>
          </div>
        </div>

        {/* PANEL D: RECENT DECISION WINDOW */}
        <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              RECENT DECISION WINDOW
            </span>
            <span className="text-[9px] text-[var(--text-graphite-muted)]">5 SAMPLES</span>
          </div>
          <div className="space-y-1.5">
            <div className="grid grid-cols-5 gap-1 text-center">
              {sampleWindow.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-1 rounded-[2px] border text-[8.5px] font-bold ${
                    st === "ANOMALOUS"
                      ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)]"
                      : "bg-emerald-500/10 text-emerald-900 border-emerald-500/25"
                  }`}
                >
                  <div className="text-[7px] opacity-75">S{idx + 1}</div>
                  <div>{st === "ANOMALOUS" ? "ANOM" : "NORM"}</div>
                </div>
              ))}
            </div>
            <div className="text-[9.5px] font-mono text-[var(--text-graphite-muted)] pt-0.5 space-y-0.5">
              <div className="flex justify-between">
                <span>CURRENT WINDOW:</span>
                <strong className="text-[var(--text-charcoal)]">{recentAnomalyCount} / 5 ANOMALOUS</strong>
              </div>
              <div className="flex justify-between">
                <span>MODEL TRIGGER:</span>
                <strong className="text-[var(--accent-copper)]">≥ 3 / 5 MAJORITY</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DUAL SESSION HISTORY TREND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 font-mono">
        {/* CHART 1: SESSION ANOMALY INDEX TREND */}
        <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-2">
            <div>
              <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>SESSION ANOMALY INDEX</span>
              </span>
              <div className="text-[9px] text-[var(--text-graphite-muted)]">
                SESSION LIVE HISTORY (LAST {historyCount} SAMPLES)
              </div>
            </div>
            <div className="text-[10px] font-bold text-[var(--text-charcoal)]">
              THRESHOLD: <span className="text-[var(--accent-copper)]">50.0 DEVIATION</span>
            </div>
          </div>

          <div className="relative h-44 w-full pt-1">
            {isAccumulating && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center text-[10px] font-bold text-[var(--text-graphite-muted)] uppercase tracking-wider border border-dashed border-[var(--border-light)]/60 rounded-[2px]">
                ACCUMULATING SESSION ANOMALY HISTORY... ({historyCount}/5 SAMPLES)
              </div>
            )}

            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Background Grid Lines */}
              <line x1="0" y1="15" x2="500" y2="15" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="45" x2="500" y2="45" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="500" y2="105" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="135" x2="500" y2="135" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />

              {/* Threshold Line at Y = 50.0 (Y = 75 in SVG coordinates where 0 is top, 150 is bottom) */}
              <line
                x1="0"
                y1="75"
                x2="500"
                y2="75"
                stroke="var(--accent-copper)"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.75"
              />
              <text x="495" y="70" textAnchor="end" fill="var(--accent-copper)" fontSize="8" fontWeight="bold">
                DEVIATION THRESHOLD (50.0)
              </text>

              {/* SVG Trend Path */}
              {historyCount > 1 && (
                <path
                  d={anomalyIndexHistory.reduce((acc, pt, i) => {
                    const x = (i / (Math.max(60, historyCount) - 1)) * 500;
                    // Y maps 0-100 to 140-10
                    const y = 140 - (Math.min(100, Math.max(0, pt.anomalyIndex)) / 100) * 130;
                    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, "")}
                  fill="none"
                  stroke="var(--accent-copper)"
                  strokeWidth="1.8"
                />
              )}

              {/* Data points */}
              {anomalyIndexHistory.map((pt, i) => {
                const x = (i / (Math.max(60, historyCount) - 1)) * 500;
                const y = 140 - (Math.min(100, Math.max(0, pt.anomalyIndex)) / 100) * 130;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={i === historyCount - 1 ? 3.5 : 2}
                    fill={pt.isAnomaly ? "var(--accent-copper)" : "#059669"}
                    stroke="#ffffff"
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredIdx !== null && anomalyIndexHistory[hoveredIdx] && (
              <div
                className="absolute bg-white/95 border border-[var(--border-light)] p-2 rounded-[2px] shadow-md text-[9px] font-mono z-30 pointer-events-none"
                style={{
                  left: `${(hoveredIdx / Math.max(1, historyCount - 1)) * 80 + 10}%`,
                  top: "10px",
                }}
              >
                <div>
                  TIMESTAMP: <strong>{anomalyIndexHistory[hoveredIdx].timestamp}</strong>
                </div>
                <div>
                  ANOMALY INDEX: <strong>{anomalyIndexHistory[hoveredIdx].anomalyIndex.toFixed(1)} / 100</strong>
                </div>
                <div>
                  STATE:{" "}
                  <strong className={anomalyIndexHistory[hoveredIdx].isAnomaly ? "text-[var(--accent-copper)]" : "text-emerald-800"}>
                    {anomalyIndexHistory[hoveredIdx].isAnomaly ? "ANOMALOUS PATTERN" : "NORMAL PATTERN"}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[9px] text-[var(--text-graphite-muted)] border-t border-[var(--border-light)]/30 pt-1.5">
            <span>LIVE SESSION START</span>
            <span>60-SAMPLE ROLLING BUFFER @ 1 HZ</span>
            <span>CURRENT ({lastUpdated})</span>
          </div>
        </div>

        {/* CHART 2: RAW DECISION SCORE SESSION HISTORY */}
        <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-2">
            <div>
              <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
                <span>RAW ISOLATION FOREST SCORE</span>
              </span>
              <div className="text-[9px] text-[var(--text-graphite-muted)]">
                SESSION LIVE HISTORY (SCIKIT-LEARN DECISION SCORE)
              </div>
            </div>
            <div className="text-[10px] font-bold text-[var(--text-charcoal)]">
              CURRENT SCORE: <span className="text-[var(--accent-copper)]">{rawScore >= 0 ? `+${rawScore.toFixed(4)}` : rawScore.toFixed(4)}</span>
            </div>
          </div>

          <div className="relative h-44 w-full pt-1">
            {isAccumulating && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center text-[10px] font-bold text-[var(--text-graphite-muted)] uppercase tracking-wider border border-dashed border-[var(--border-light)]/60 rounded-[2px]">
                ACCUMULATING SESSION RAW SCORE HISTORY... ({historyCount}/5 SAMPLES)
              </div>
            )}

            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="15" x2="500" y2="15" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="45" x2="500" y2="45" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="500" y2="105" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />
              <line x1="0" y1="135" x2="500" y2="135" stroke="currentColor" className="text-black/5" strokeDasharray="3 3" />

              {/* Zero Reference Baseline (Y = 75 corresponds to 0.0000) */}
              <line
                x1="0"
                y1="75"
                x2="500"
                y2="75"
                stroke="#6b7280"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.8"
              />
              <text x="495" y="70" textAnchor="end" fill="#4b5563" fontSize="8" fontWeight="bold">
                0.0000 DECISION BASELINE
              </text>

              {/* Raw Decision Score SVG Path */}
              {historyCount > 1 && (
                <path
                  d={anomalyIndexHistory.reduce((acc, pt, i) => {
                    const score = pt.decisionScore ?? 0.22;
                    const x = (i / (Math.max(60, historyCount) - 1)) * 500;
                    // Y maps score range -0.5 to +0.5 onto SVG coords 140 to 10
                    // 0.0 -> Y=75
                    const y = 75 - (score / 0.5) * 65;
                    const clampedY = Math.min(145, Math.max(5, y));
                    return i === 0 ? `M ${x} ${clampedY}` : `${acc} L ${x} ${clampedY}`;
                  }, "")}
                  fill="none"
                  stroke="#374151"
                  strokeWidth="1.8"
                />
              )}

              {/* Raw score points */}
              {anomalyIndexHistory.map((pt, i) => {
                const score = pt.decisionScore ?? 0.22;
                const x = (i / (Math.max(60, historyCount) - 1)) * 500;
                const y = 75 - (score / 0.5) * 65;
                const clampedY = Math.min(145, Math.max(5, y));
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={clampedY}
                    r={i === historyCount - 1 ? 3.5 : 2}
                    fill={score < 0 ? "var(--accent-copper)" : "#1f2937"}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between text-[9px] text-[var(--text-graphite-muted)] border-t border-[var(--border-light)]/30 pt-1.5">
            <span>NORMAL CLUSTER (&gt; 0.0)</span>
            <span>UNSUPERVISED ISOLATION SCORE</span>
            <span>ANOMALOUS ISOLATION (&lt; 0.0)</span>
          </div>
        </div>
      </div>

      {/* 4. CURRENT SIX-CHANNEL INPUT VECTOR STRIP */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
            <span>MODEL INPUT VECTOR</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
            6 NUMERICAL TELEMETRY CHANNELS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 shadow-2xs">
            <div className="text-[8.5px] font-bold text-[var(--text-graphite-muted)] uppercase">01 TEMPERATURE</div>
            <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
              {currentTelemetry.temperature.toFixed(1)} <span className="text-xs font-mono font-normal opacity-70">°C</span>
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 shadow-2xs">
            <div className="text-[8.5px] font-bold text-[var(--text-graphite-muted)] uppercase">02 VIBRATION</div>
            <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
              {currentTelemetry.vibration.toFixed(2)} <span className="text-xs font-mono font-normal opacity-70">g</span>
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 shadow-2xs">
            <div className="text-[8.5px] font-bold text-[var(--text-graphite-muted)] uppercase">03 MOTOR CURRENT</div>
            <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
              {currentTelemetry.current.toFixed(2)} <span className="text-xs font-mono font-normal opacity-70">A</span>
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 shadow-2xs">
            <div className="text-[8.5px] font-bold text-[var(--text-graphite-muted)] uppercase">04 BELT SPEED</div>
            <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
              {currentTelemetry.speed.toFixed(2)} <span className="text-xs font-mono font-normal opacity-70">m/s</span>
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 shadow-2xs">
            <div className="text-[8.5px] font-bold text-[var(--text-graphite-muted)] uppercase">05 ALIGNMENT</div>
            <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
              {currentTelemetry.alignment > 0 ? `+${currentTelemetry.alignment.toFixed(1)}` : currentTelemetry.alignment.toFixed(1)}{" "}
              <span className="text-xs font-mono font-normal opacity-70">mm</span>
            </div>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 shadow-2xs">
            <div className="text-[8.5px] font-bold text-[var(--text-graphite-muted)] uppercase">06 LOAD</div>
            <div className="font-heading text-base font-bold text-[var(--text-charcoal)] pt-0.5">
              {currentTelemetry.load.toFixed(1)} <span className="text-xs font-mono font-normal opacity-70">%</span>
            </div>
          </div>
        </div>

        {/* Pipeline Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] text-[var(--text-graphite-muted)] pt-1 uppercase border-t border-[var(--border-light)]/20">
          <span>RAW TELEMETRY</span>
          <span>→</span>
          <span className="font-bold text-[var(--text-charcoal)]">STANDARDIZATION (StandardScaler)</span>
          <span>→</span>
          <span className="font-bold text-[var(--accent-copper)]">ISOLATION FOREST</span>
          <span>→</span>
          <span className="font-bold text-[var(--text-charcoal)]">ANOMALY ASSESSMENT</span>
        </div>
      </div>

      {/* 5. BASELINE DEVIATION ANALYSIS & Z-SCORE PANEL */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-4 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5">
          <div>
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>DEVIATION FROM LEARNED NORMAL BASELINE</span>
            </span>
            <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans pt-0.5">
              Per-channel standardized distance (z-score $\sigma$) from learned normal conveyor operating baseline.
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[9px] text-[var(--text-graphite-muted)]">
            RANKED BY ABSOLUTE Z-SCORE DEVIATION
          </div>
        </div>

        {/* Horizontal Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedDeviations.map((item, idx) => (
            <div key={item.id} className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-charcoal)] uppercase">
                  #{idx + 1} {item.name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold border ${
                    item.absZ >= 2.0
                      ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)]"
                      : item.absZ >= 1.0
                      ? "bg-amber-500/10 text-amber-900 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-900 border-emerald-500/30"
                  }`}
                >
                  {item.absZ.toFixed(2)}σ FROM BASELINE
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5 text-[10px]">
                <div>
                  <span className="text-[8px] text-[var(--text-graphite-muted)] block uppercase">CURRENT VALUE</span>
                  <strong className="text-[var(--text-charcoal)]">
                    {item.value} {item.unit}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-[var(--text-graphite-muted)] block uppercase">BASELINE MEAN (μ)</span>
                  <strong className="text-[var(--text-graphite-muted)]">
                    {item.mean.toFixed(1)} {item.unit}
                  </strong>
                </div>
              </div>

              {/* Horizontal Progress Bar representing z-score range 0σ to 3σ+ */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[7px] text-[var(--text-graphite-muted)]">
                  <span>0σ</span>
                  <span>1.0σ</span>
                  <span>2.0σ</span>
                  <span>3.0σ+</span>
                </div>
                <div className="w-full h-2 rounded-[2px] bg-black/10 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.absZ >= 2.0 ? "bg-[var(--accent-copper)]" : item.absZ >= 1.0 ? "bg-amber-600" : "bg-emerald-600"
                    }`}
                    style={{ width: `${Math.min(100, (item.absZ / 3.0) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scientific Z-Score Definition Note */}
        <div className="p-3 rounded-[2px] bg-white border border-[var(--border-light)]/40 text-[10px] space-y-1">
          <div className="font-bold text-[var(--text-charcoal)] uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
            <span>STANDARDIZED Z-SCORE DEFINITION</span>
          </div>
          <div className="font-mono text-[11px] text-[var(--accent-copper)] font-bold">
            z = (x - μ) / σ
          </div>
          <div className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans">
            Where <strong>x</strong> is current telemetry channel reading, <strong>μ</strong> is baseline mean, and <strong>σ</strong> is baseline standard deviation. Higher absolute z-score means the current reading differs more from that channel&apos;s learned normal baseline.
          </div>
        </div>
      </div>

      {/* 6. CURRENT VS NORMAL BASELINE COMPARISON TABLE */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
            CURRENT VS NORMAL BASELINE
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">
            N = 1,733 TRAINING BASELINE RECORDS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-light)]/50 text-[9px] text-[var(--text-graphite-muted)] uppercase">
                <th className="py-2 px-2 font-bold">TELEMETRY CHANNEL</th>
                <th className="py-2 px-2 font-bold text-right">CURRENT VALUE</th>
                <th className="py-2 px-2 font-bold text-right">BASELINE MEAN (μ)</th>
                <th className="py-2 px-2 font-bold text-right">BASELINE STD DEV (σ)</th>
                <th className="py-2 px-2 font-bold text-right">Z-SCORE (z)</th>
                <th className="py-2 px-2 font-bold text-center">DEVIATION STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]/20">
              {channelDeviations.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02]">
                  <td className="py-2 px-2 font-bold text-[var(--text-charcoal)]">{row.name}</td>
                  <td className="py-2 px-2 text-right font-mono">
                    {row.value} {row.unit}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-[var(--text-graphite-muted)]">
                    {row.mean.toFixed(2)} {row.unit}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-[var(--text-graphite-muted)]">
                    ±{row.std.toFixed(2)} {row.unit}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-[var(--text-charcoal)]">
                    {row.zScore >= 0 ? `+${row.zScore.toFixed(2)}` : row.zScore.toFixed(2)}σ
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[2px] text-[8.5px] font-bold ${
                        row.statusLabel === "HIGH DEVIATION"
                          ? "bg-[var(--accent-copper)] text-white"
                          : row.statusLabel === "MODERATE DEVIATION"
                          ? "bg-amber-500/10 text-amber-900 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-900 border border-emerald-500/30"
                      }`}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. MODEL ARCHITECTURE & PIPELINE DIAGRAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Model Architecture Details */}
        <div className="lg:col-span-7 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)]/30 pb-2">
            <Layers className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              MODEL ARCHITECTURE &amp; BASELINE CONTEXT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-[var(--text-charcoal)]">
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">ALGORITHM</span>
              <strong className="text-[var(--accent-copper)]">Isolation Forest</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">LIBRARY</span>
              <strong>scikit-learn</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">TYPE</span>
              <strong>Unsupervised Multivariate Anomaly Detection</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">INPUT VECTOR</span>
              <strong>6 Numerical Telemetry Channels</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">ESTIMATORS</span>
              <strong>200 Isolation Trees (N=200)</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">PREPROCESSING</span>
              <strong>StandardScaler (z-score normalization)</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">TRAINING BASELINE</span>
              <strong>1,733 Normal Operating Records</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/20 pb-1">
              <span className="text-[var(--text-graphite-muted)] block text-[8.5px] uppercase">ROLLING WINDOW</span>
              <strong>5 Samples (3-of-5 Majority Filter)</strong>
            </div>
          </div>

          {/* Model Pipeline Diagram Flow */}
          <div className="pt-2">
            <div className="text-[9px] font-bold text-[var(--text-graphite-muted)] uppercase pb-1.5">
              MODEL INFERENCE PIPELINE DIAGRAM
            </div>
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 flex flex-wrap items-center justify-between gap-1 text-[8.5px] font-mono text-[var(--text-charcoal)]">
              <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)]/40 rounded-[2px]">6-CHANNEL TELEMETRY</span>
              <span className="text-[var(--text-graphite-muted)]">↓</span>
              <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)]/40 rounded-[2px]">STANDARDIZATION</span>
              <span className="text-[var(--text-graphite-muted)]">↓</span>
              <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)]/40 rounded-[2px]">ISOLATION FOREST</span>
              <span className="text-[var(--text-graphite-muted)]">↓</span>
              <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)]/40 rounded-[2px]">RAW DECISION SCORE</span>
              <span className="text-[var(--text-graphite-muted)]">↓</span>
              <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)]/40 rounded-[2px]">CALIBRATED ANOMALY INDEX</span>
              <span className="text-[var(--text-graphite-muted)]">↓</span>
              <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 rounded-[2px] font-bold">PATTERN STATUS</span>
            </div>
          </div>
        </div>

        {/* Model Training Context vs Live & Scientific Disclosure */}
        <div className="lg:col-span-5 space-y-3">
          {/* Training vs Live Context */}
          <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-2">
            <div className="text-[10px] font-bold text-[var(--text-charcoal)] uppercase border-b border-[var(--border-light)]/30 pb-1">
              TRAINING CONTEXT VS LIVE INFERENCE
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
                <span className="text-[8px] text-[var(--text-graphite-muted)] block uppercase font-bold">TRAINING BASELINE</span>
                <span className="font-semibold text-[var(--text-charcoal)]">Synthetic NORMAL conveyor telemetry (1,733 samples)</span>
              </div>
              <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
                <span className="text-[8px] text-[var(--text-graphite-muted)] block uppercase font-bold">LIVE INFERENCE</span>
                <span className="font-semibold text-[var(--text-charcoal)]">Current 6-channel telemetry vector ({lastUpdated})</span>
              </div>
            </div>
          </div>

          {/* Scientific Disclosure Box */}
          <div className="p-4 rounded-[2px] bg-amber-500/[0.06] border border-amber-500/25 text-amber-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[10.5px] uppercase tracking-wider text-amber-900 border-b border-amber-500/20 pb-1">
              <Info className="w-4 h-4 text-amber-800 shrink-0" />
              <span>SCIENTIFIC DISCLOSURE</span>
            </div>
            <p className="font-sans text-[10.5px] leading-relaxed text-amber-950">
              This prototype learns patterns from synthetic normal telemetry and identifies multivariate deviations from that baseline.
            </p>
            <div className="text-[9.5px] font-mono text-amber-900 font-bold uppercase pt-0.5">
              IT DOES NOT PREDICT:
            </div>
            <ul className="list-disc list-inside font-sans text-[10px] text-amber-950 space-y-0.5">
              <li>Belt rupture or mechanical tear</li>
              <li>Remaining useful life (RUL)</li>
              <li>Exact time-to-failure</li>
              <li>Failure probability percentage</li>
            </ul>
            <p className="font-sans text-[9.5px] text-amber-900/80 pt-0.5 italic">
              Real sensor datasets and controlled fault experiments are required for industrial model validation.
            </p>
          </div>
        </div>
      </div>

      {/* 8. ANOMALY VS RULE ENGINE DISTINCTION & DECISION SUPPORT HANDOFF */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-2">
          <span className="text-[10px] font-bold text-[var(--accent-copper)] uppercase tracking-wider">
            ANOMALY ASSESSMENT ≠ RULE ALERT
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">EVIDENCE ENGINE AGGREGATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <strong className="text-[var(--text-charcoal)] block uppercase pb-0.5">RULE ENGINE</strong>
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans">
              Checks configured single-channel engineering thresholds (e.g. Temp &gt; 65°C, Speed &lt; 0.5 m/s).
            </span>
          </div>
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <strong className="text-[var(--accent-copper)] block uppercase pb-0.5">ANOMALY ENGINE</strong>
            <span className="text-[9.5px] text-[var(--text-graphite-muted)] font-sans">
              Checks multivariate pattern deviations from learned normal baseline using unsupervised Isolation Forest.
            </span>
          </div>
        </div>

        {/* Handoff CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[var(--border-light)]/30">
          <div>
            <div className="text-[9px] font-bold text-[var(--text-graphite-muted)] uppercase tracking-wider">
              ANOMALY DETECTION IS ONE EVIDENCE SOURCE
            </div>
            <div className="text-[10.5px] font-bold text-[var(--text-charcoal)] pt-0.5">
              RULES + CONDITION ENGINE + ANOMALY ASSESSMENT → DECISION SUPPORT
            </div>
          </div>

          <Link
            href="/control-center/decision-support"
            className="px-4 py-2 rounded-[2px] bg-[var(--accent-copper)] hover:bg-[var(--accent-copper)]/90 text-white text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
          >
            <span>VIEW DECISION SUPPORT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
