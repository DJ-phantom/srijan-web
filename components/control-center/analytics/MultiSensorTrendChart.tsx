"use client";

import React, { useState } from "react";
import { TelemetryRecord, formatTelemetryTime } from "@/lib/api";
import { CHANNEL_CONFIGS, ChannelMeta } from "@/components/control-center/monitoring/MonitoringMainChart";

interface MultiSensorTrendChartProps {
  data: TelemetryRecord[];
  mode: "RAW" | "NORMALIZED";
  selectedChannelKeys: (keyof TelemetryRecord)[];
  windowLabel: string;
}

export default function MultiSensorTrendChart({
  data,
  mode,
  selectedChannelKeys,
  windowLabel,
}: MultiSensorTrendChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="w-full h-[320px] p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex items-center justify-center font-mono text-xs text-[var(--text-graphite-muted)] uppercase">
        NO HISTORICAL TELEMETRY LOADED
      </div>
    );
  }

  // Active channel configs (max 3)
  const activeConfigs: ChannelMeta[] = selectedChannelKeys
    .slice(0, 3)
    .map((key) => CHANNEL_CONFIGS.find((c) => c.key === key))
    .filter((c): c is ChannelMeta => c !== undefined);

  if (activeConfigs.length === 0) {
    return (
      <div className="w-full h-[320px] p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex items-center justify-center font-mono text-xs text-[var(--text-graphite-muted)] uppercase">
        SELECT AT LEAST ONE SENSOR CHANNEL TO VIEW TREND
      </div>
    );
  }

  // Visual Colors for series (charcoal, copper, slate/muted)
  const seriesColors = ["var(--text-charcoal)", "var(--accent-copper)", "#2563eb"];

  // Dimensions
  const width = 820;
  const height = 300;
  const padding = { top: 25, right: 25, bottom: 35, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const count = data.length;

  // Process Series Data Points according to Mode
  const seriesData = activeConfigs.map((cfg, sIdx) => {
    const rawVals = data.map((d) => (typeof d[cfg.key] === "number" ? (d[cfg.key] as number) : 0));

    if (mode === "NORMALIZED") {
      // Calculate mean and stdDev over window
      const mean = rawVals.reduce((a, b) => a + b, 0) / rawVals.length;
      const variance = rawVals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rawVals.length;
      const stdDev = Math.sqrt(variance) || 1;

      // Z-scores
      const zScores = rawVals.map((v) => (v - mean) / stdDev);
      const points = zScores.map((z, idx) => {
        const x = padding.left + (idx / (count - 1)) * chartW;
        // Clamp z-score view between -3.5 and +3.5
        const clampedZ = Math.min(3.5, Math.max(-3.5, z));
        const y = padding.top + chartH / 2 - (clampedZ / 3.5) * (chartH / 2);
        return { x, y, val: z, rawVal: rawVals[idx], ts: data[idx].timestamp };
      });

      return {
        config: cfg,
        color: seriesColors[sIdx % seriesColors.length],
        points,
        polyline: points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
      };
    } else {
      // RAW Single Channel View
      let min = Math.min(...rawVals);
      let max = Math.max(...rawVals);
      const range = max - min === 0 ? 1 : max - min;
      const minPlot = min - range * 0.05;
      const maxPlot = max + range * 0.05;
      const rangePlot = maxPlot - minPlot;

      const points = rawVals.map((v, idx) => {
        const x = padding.left + (idx / (count - 1)) * chartW;
        const y = padding.top + chartH - ((v - minPlot) / rangePlot) * chartH;
        return { x, y, val: v, rawVal: v, ts: data[idx].timestamp };
      });

      return {
        config: cfg,
        color: seriesColors[sIdx % seriesColors.length],
        points,
        polyline: points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
        minPlot,
        maxPlot,
      };
    }
  });

  const startTimeStr = formatTelemetryTime(data[0]);
  const endTimeStr = formatTelemetryTime(data[data.length - 1]);

  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between font-mono text-xs">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--border-light)]/40 pb-2 mb-2 gap-2">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
            // HISTORICAL TREND TRAJECTORY
          </span>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            {mode === "NORMALIZED"
              ? "NORMALIZED WINDOW DEVIATION (z-score σ)"
              : `${activeConfigs[0].name} RAW TELEMETRY`}
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[9.5px]">
          {seriesData.map((s) => (
            <div key={s.config.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 rounded-[1px]" style={{ backgroundColor: s.color }} />
              <span className="font-bold text-[var(--text-charcoal)] uppercase">
                {s.config.shortName} {mode === "RAW" ? `(${s.config.unit})` : ""}
              </span>
            </div>
          ))}
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] font-semibold uppercase">
            {windowLabel}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[240px] my-auto overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Y-Axis Gridlines & Labels */}
          {mode === "NORMALIZED"
            ? [-3, -2, -1, 0, 1, 2, 3].map((z) => {
                const y = padding.top + chartH / 2 - (z / 3.5) * (chartH / 2);
                return (
                  <g key={z}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={z === 0 ? "var(--text-charcoal)" : "var(--border-light)"}
                      strokeOpacity={z === 0 ? "0.6" : "0.35"}
                      strokeWidth={z === 0 ? "1.2" : "1"}
                      strokeDasharray={z === 0 ? undefined : "2 2"}
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      fill="var(--text-graphite-muted)"
                      fontSize="8.5"
                      fontFamily="monospace"
                    >
                      {z > 0 ? `+${z}σ` : `${z}σ`}
                    </text>
                  </g>
                );
              })
            : [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + chartH * ratio;
                const minP = seriesData[0].minPlot || 0;
                const maxP = seriesData[0].maxPlot || 1;
                const val = maxP - ratio * (maxP - minP);
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
                      {val.toFixed(activeConfigs[0].decimals)}
                    </text>
                  </g>
                );
              })}

          {/* Render Series Polylines */}
          {seriesData.map((s) => (
            <polyline
              key={s.config.id}
              fill="none"
              stroke={s.color}
              strokeWidth={mode === "NORMALIZED" ? "2" : "2.2"}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={s.polyline}
            />
          ))}

          {/* Interactive Mouse Hover Columns */}
          {seriesData[0].points.map((pt, idx) => (
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

          {/* Hover Crosshair */}
          {hoverIdx !== null && (
            <g className="pointer-events-none">
              <line
                x1={seriesData[0].points[hoverIdx].x}
                y1={padding.top}
                x2={seriesData[0].points[hoverIdx].x}
                y2={padding.top + chartH}
                stroke="var(--text-charcoal)"
                strokeOpacity="0.5"
                strokeDasharray="2 2"
              />
              {seriesData.map((s) => (
                <circle
                  key={s.config.id}
                  cx={s.points[hoverIdx].x}
                  cy={s.points[hoverIdx].y}
                  r="3.5"
                  fill={s.color}
                />
              ))}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Box */}
        {hoverIdx !== null && (
          <div
            className="absolute top-2 z-20 px-2.5 py-1.5 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-mono text-[9.5px] space-y-0.5 shadow-md pointer-events-none"
            style={{
              left: `${Math.min(80, Math.max(10, (seriesData[0].points[hoverIdx].x / width) * 100))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="opacity-70 border-b border-white/20 pb-0.5" suppressHydrationWarning>
              TIME: {formatTelemetryTime(data[hoverIdx].timestamp)}
            </div>
            {seriesData.map((s) => (
              <div key={s.config.id} className="flex items-center justify-between gap-3 font-bold" style={{ color: s.color === "var(--text-charcoal)" ? "#ffffff" : s.color }}>
                <span>{s.config.shortName}:</span>
                <span>
                  {s.points[hoverIdx].rawVal.toFixed(s.config.decimals)} {s.config.unit}
                  {mode === "NORMALIZED" ? ` (${s.points[hoverIdx].val > 0 ? "+" : ""}${s.points[hoverIdx].val.toFixed(2)}σ)` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp Bounds */}
      <div className="pt-2 border-t border-[var(--border-light)]/40 flex items-center justify-between text-[8.5px] text-[var(--text-graphite-muted)] uppercase" suppressHydrationWarning>
        <span>START: {startTimeStr}</span>
        <span>POSTGRESQL RECORD COUNT: {count}</span>
        <span>END: {endTimeStr}</span>
      </div>
    </div>
  );
}
