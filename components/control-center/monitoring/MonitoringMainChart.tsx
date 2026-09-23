"use client";

import React, { useState } from "react";
import { TelemetryRecord, AlertRecord, formatTelemetryTime } from "@/lib/api";
import { CANONICAL_CHANNEL_CONFIGS, ChannelRuleConfig } from "@/lib/controlCenterConfig";

export type ChannelMeta = ChannelRuleConfig;

export const CHANNEL_CONFIGS: ChannelMeta[] = Object.values(CANONICAL_CHANNEL_CONFIGS);

interface MonitoringMainChartProps {
  primaryChannel: ChannelMeta;
  secondaryChannel?: ChannelMeta | null;
  data: TelemetryRecord[];
  alerts?: AlertRecord[];
  isPaused: boolean;
  windowLabel: string;
  sourceLabel: string;
}

export default function MonitoringMainChart({
  primaryChannel,
  secondaryChannel,
  data,
  alerts = [],
  isPaused,
  windowLabel,
  sourceLabel,
}: MonitoringMainChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="w-full h-[340px] p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col items-center justify-center text-center font-mono text-xs">
        <div className="w-3 h-3 rounded-full bg-[var(--accent-copper)] animate-ping mb-2" />
        <span className="font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
          ACCUMULATING TELEMETRY SIGNAL…
        </span>
        <span className="text-[10px] text-[var(--text-graphite-muted)] max-w-xs font-sans mt-1">
          Collecting live readings for {primaryChannel.name}. Chart trajectory updates automatically.
        </span>
      </div>
    );
  }

  // Calculate Primary Y Range (Include thresholds & padding)
  const primaryValues = data.map((d) => (typeof d[primaryChannel.key] === "number" ? (d[primaryChannel.key] as number) : 0));
  let pMin = Math.min(...primaryValues, primaryChannel.target);
  let pMax = Math.max(...primaryValues, primaryChannel.target);

  if (primaryChannel.type === "high") {
    pMax = Math.max(pMax, primaryChannel.crit * 1.05);
    pMin = Math.min(pMin, 0);
  } else if (primaryChannel.type === "low") {
    pMax = Math.max(pMax, 2.5);
    pMin = Math.min(pMin, primaryChannel.crit * 0.8);
  } else if (primaryChannel.type === "abs_high") {
    pMax = Math.max(pMax, primaryChannel.crit + 2);
    pMin = Math.min(pMin, -primaryChannel.crit - 2);
  }

  // Padding
  const pRange = pMax - pMin === 0 ? 1 : pMax - pMin;
  const pMinPlot = pMin - pRange * 0.05;
  const pMaxPlot = pMax + pRange * 0.05;
  const pRangePlot = pMaxPlot - pMinPlot;

  // Secondary Y Range (if dual comparison active)
  let secValues: number[] = [];
  let sMinPlot = 0;
  let sRangePlot = 1;
  if (secondaryChannel) {
    secValues = data.map((d) => (typeof d[secondaryChannel.key] === "number" ? (d[secondaryChannel.key] as number) : 0));
    let sMin = Math.min(...secValues, secondaryChannel.target);
    let sMax = Math.max(...secValues, secondaryChannel.target);
    if (secondaryChannel.type === "high") sMax = Math.max(sMax, secondaryChannel.crit * 1.05);
    const sRange = sMax - sMin === 0 ? 1 : sMax - sMin;
    sMinPlot = sMin - sRange * 0.05;
    sRangePlot = sMax + sRange * 0.05 - sMinPlot;
  }

  // Dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 25, right: secondaryChannel ? 45 : 20, bottom: 30, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const count = data.length;

  // Primary Points
  const primaryPoints = data.map((d, idx) => {
    const val = typeof d[primaryChannel.key] === "number" ? (d[primaryChannel.key] as number) : 0;
    const x = padding.left + (idx / (count - 1)) * chartW;
    const y = padding.top + chartH - ((val - pMinPlot) / pRangePlot) * chartH;
    return { x, y, val, ts: d.timestamp };
  });

  const polylinePrimary = primaryPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Secondary Points
  let polylineSecondary = "";
  let secondaryPoints: { x: number; y: number; val: number }[] = [];
  if (secondaryChannel) {
    secondaryPoints = data.map((d, idx) => {
      const val = typeof d[secondaryChannel.key] === "number" ? (d[secondaryChannel.key] as number) : 0;
      const x = padding.left + (idx / (count - 1)) * chartW;
      const y = padding.top + chartH - ((val - sMinPlot) / sRangePlot) * chartH;
      return { x, y, val };
    });
    polylineSecondary = secondaryPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }

  // Threshold Y Helper
  const getY = (val: number) => padding.top + chartH - ((val - pMinPlot) / pRangePlot) * chartH;

  const targetY = getY(primaryChannel.target);
  const warnY = getY(primaryChannel.warn);
  const critY = getY(primaryChannel.crit);
  const negWarnY = primaryChannel.type === "abs_high" ? getY(-primaryChannel.warn) : null;
  const negCritY = primaryChannel.type === "abs_high" ? getY(-primaryChannel.crit) : null;

  const hoveredPoint = hoverIdx !== null && primaryPoints[hoverIdx] ? primaryPoints[hoverIdx] : null;

  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between font-mono text-xs relative">
      {/* Chart Top Header Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--border-light)]/40 pb-2 mb-2 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // REAL-TIME SIGNAL TRAJECTORY
            </span>
            {isPaused && (
              <span className="px-1.5 py-0.2 rounded-[1px] bg-amber-500/20 text-amber-900 border border-amber-500/40 text-[8.5px] font-bold uppercase animate-pulse">
                PAUSED
              </span>
            )}
          </div>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            {primaryChannel.name} ({primaryChannel.unit})
            {secondaryChannel ? ` vs ${secondaryChannel.name} (${secondaryChannel.unit})` : ""}
          </h3>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-3 text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[var(--text-charcoal)]" />
            <span className="font-bold text-[var(--text-charcoal)] uppercase">{primaryChannel.shortName}</span>
          </div>

          {secondaryChannel && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[var(--accent-copper)]" />
              <span className="font-bold text-[var(--accent-copper)] uppercase">{secondaryChannel.shortName}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2.5 h-[1px] bg-emerald-600 stroke-dasharray-[2_2]" />
            <span className="text-[var(--text-graphite-muted)] uppercase">TARGET</span>
          </div>

          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2.5 h-[1px] bg-amber-600 stroke-dasharray-[2_2]" />
            <span className="text-amber-800 uppercase">WARN</span>
          </div>

          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2.5 h-[1px] bg-red-600 stroke-dasharray-[2_2]" />
            <span className="text-red-800 uppercase">CRIT</span>
          </div>

          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] font-semibold uppercase">
            {sourceLabel} [{windowLabel}]
          </span>
        </div>
      </div>

      {/* SVG Main Visualization Canvas */}
      <div className="relative w-full h-[240px] my-auto overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Gridlines & Primary Y-Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartH * ratio;
            const val = pMaxPlot - ratio * pRangePlot;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border-light)"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-graphite-muted)"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {val.toFixed(primaryChannel.decimals)}
                </text>
              </g>
            );
          })}

          {/* Secondary Y-Axis Labels if dual channel */}
          {secondaryChannel &&
            [0, 0.5, 1].map((ratio) => {
              const y = padding.top + chartH * ratio;
              const val = sMinPlot + (1 - ratio) * sRangePlot;
              return (
                <text
                  key={`sec-${ratio}`}
                  x={width - padding.right + 6}
                  y={y + 3}
                  textAnchor="start"
                  fill="var(--accent-copper)"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {val.toFixed(secondaryChannel.decimals)}
                </text>
              );
            })}

          {/* Canonical Threshold Lines (Target, Warning, Critical) */}
          {/* 1. Target Line (Green/Slate Dashed) */}
          {targetY >= padding.top && targetY <= padding.top + chartH && (
            <line
              x1={padding.left}
              y1={targetY}
              x2={width - padding.right}
              y2={targetY}
              stroke="#059669"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              strokeOpacity="0.7"
            />
          )}

          {/* 2. Warning Threshold Line (Amber Dashed) */}
          {warnY >= padding.top && warnY <= padding.top + chartH && (
            <line
              x1={padding.left}
              y1={warnY}
              x2={width - padding.right}
              y2={warnY}
              stroke="#d97706"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.85"
            />
          )}

          {/* 3. Critical Threshold Line (Red Dashed) */}
          {critY >= padding.top && critY <= padding.top + chartH && (
            <line
              x1={padding.left}
              y1={critY}
              x2={width - padding.right}
              y2={critY}
              stroke="#dc2626"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.9"
            />
          )}

          {/* Symmetric Negative Bands for Alignment */}
          {negWarnY !== null && negWarnY >= padding.top && negWarnY <= padding.top + chartH && (
            <line
              x1={padding.left}
              y1={negWarnY}
              x2={width - padding.right}
              y2={negWarnY}
              stroke="#d97706"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.85"
            />
          )}
          {negCritY !== null && negCritY >= padding.top && negCritY <= padding.top + chartH && (
            <line
              x1={padding.left}
              y1={negCritY}
              x2={width - padding.right}
              y2={negCritY}
              stroke="#dc2626"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.9"
            />
          )}

          {/* Secondary Channel Trajectory Line (Copper) */}
          {secondaryChannel && (
            <polyline
              fill="none"
              stroke="var(--accent-copper)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineSecondary}
            />
          )}

          {/* Primary Channel Trajectory Line (Dark Charcoal) */}
          <polyline
            fill="none"
            stroke="var(--text-charcoal)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePrimary}
          />

          {/* Hover Crosshair Columns */}
          {primaryPoints.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - chartW / (count * 2)}
              y={padding.top}
              width={chartW / count}
              height={chartH}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIdx(idx)}
            />
          ))}

          {/* Hover Indicator Lines & Dots */}
          {hoveredPoint && (
            <g className="pointer-events-none">
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={padding.top + chartH}
                stroke="var(--text-charcoal)"
                strokeOpacity="0.5"
                strokeDasharray="2 2"
              />
              <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="4" fill="var(--text-charcoal)" />
              {secondaryChannel && secondaryPoints[hoverIdx!] && (
                <circle
                  cx={hoveredPoint.x}
                  cy={secondaryPoints[hoverIdx!].y}
                  r="4"
                  fill="var(--accent-copper)"
                />
              )}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute top-2 z-20 px-2.5 py-1.5 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-mono text-[9.5px] space-y-0.5 shadow-md pointer-events-none"
            style={{
              left: `${Math.min(80, Math.max(10, (hoveredPoint.x / width) * 100))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="opacity-70 border-b border-white/20 pb-0.5">
              TIME: {formatTelemetryTime(hoveredPoint.ts)}
            </div>
            <div className="flex items-center justify-between gap-3 font-bold">
              <span>{primaryChannel.shortName}:</span>
              <span className="text-white">
                {hoveredPoint.val.toFixed(primaryChannel.decimals)} {primaryChannel.unit}
              </span>
            </div>
            {secondaryChannel && secondaryPoints[hoverIdx!] && (
              <div className="flex items-center justify-between gap-3 text-[var(--accent-copper)] font-bold">
                <span>{secondaryChannel.shortName}:</span>
                <span>
                  {secondaryPoints[hoverIdx!].val.toFixed(secondaryChannel.decimals)} {secondaryChannel.unit}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Timestamp Bounds */}
      <div className="pt-2 border-t border-[var(--border-light)]/40 flex items-center justify-between text-[8.5px] text-[var(--text-graphite-muted)] uppercase">
        <span>START: {formatTelemetryTime(data[0].timestamp)}</span>
        <span>WINDOW LENGTH: {count} SAMPLES</span>
        <span>END: {formatTelemetryTime(data[data.length - 1].timestamp)}</span>
      </div>
    </div>
  );
}
