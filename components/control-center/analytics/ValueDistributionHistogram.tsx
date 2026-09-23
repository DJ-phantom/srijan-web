"use client";

import React, { useMemo } from "react";
import { TelemetryRecord } from "@/lib/api";
import { ChannelMeta } from "@/components/control-center/monitoring/MonitoringMainChart";

interface ValueDistributionHistogramProps {
  data: TelemetryRecord[];
  channel: ChannelMeta;
}

export default function ValueDistributionHistogram({ data, channel }: ValueDistributionHistogramProps) {
  // Extract values
  const values = useMemo(
    () => data.map((d) => (typeof d[channel.key] === "number" ? (d[channel.key] as number) : 0)),
    [data, channel.key]
  );

  // Calculate histogram bins & stats
  const { bins, mean, median, stdDev, min, max } = useMemo(() => {
    if (!values || values.length === 0) {
      return { bins: [], mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
    }

    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const count = values.length;

    // Mean
    const sum = values.reduce((a, b) => a + b, 0);
    const meanV = sum / count;

    // Median
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianV = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // StdDev
    const variance = values.reduce((a, b) => a + Math.pow(b - meanV, 2), 0) / count;
    const stdDevV = Math.sqrt(variance);

    // Bins (10 bins)
    const binCount = 10;
    const range = maxV - minV === 0 ? 1 : maxV - minV;
    const binWidth = range / binCount;

    const bList = Array.from({ length: binCount }, (_, i) => {
      const start = minV + i * binWidth;
      const end = start + binWidth;
      return { start, end, count: 0 };
    });

    values.forEach((v) => {
      let bIdx = Math.floor((v - minV) / binWidth);
      if (bIdx >= binCount) bIdx = binCount - 1;
      if (bIdx < 0) bIdx = 0;
      bList[bIdx].count++;
    });

    return { bins: bList, mean: meanV, median: medianV, stdDev: stdDevV, min: minV, max: maxV };
  }, [values]);

  if (!values || values.length < 2) {
    return (
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs font-mono text-xs flex items-center justify-center text-[var(--text-graphite-muted)] uppercase">
        INSUFFICIENT DATA FOR HISTOGRAM
      </div>
    );
  }

  const maxBinCount = Math.max(...bins.map((b) => b.count), 1);
  const width = 360;
  const height = 140;
  const padding = { top: 15, right: 15, bottom: 25, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Mean & Median position
  const range = max - min === 0 ? 1 : max - min;
  const meanX = padding.left + ((mean - min) / range) * chartW;
  const medianX = padding.left + ((median - min) / range) * chartW;

  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between font-mono text-xs space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
            // VALUE DISTRIBUTION
          </span>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            {channel.name} FREQUENCY BINS
          </h3>
        </div>
        <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-semibold">
          {values.length} SAMPLES
        </span>
      </div>

      {/* Stats Summary Line */}
      <div className="flex items-center justify-between text-[9.5px] bg-[var(--bg-stone)]/70 p-1.5 rounded-[2px] border border-[var(--border-light)]/40">
        <span>
          MEAN: <strong className="text-[var(--text-charcoal)]">{mean.toFixed(channel.decimals)} {channel.unit}</strong>
        </span>
        <span>
          MEDIAN: <strong className="text-[var(--text-charcoal)]">{median.toFixed(channel.decimals)} {channel.unit}</strong>
        </span>
        <span>
          STD DEV: <strong className="text-[var(--text-charcoal)]">{stdDev.toFixed(channel.decimals + 1)}</strong>
        </span>
      </div>

      {/* SVG Histogram Bins */}
      <div className="relative w-full h-[140px] my-auto overflow-hidden">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Gridlines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = padding.top + chartH * (1 - ratio);
            const val = Math.round(maxBinCount * ratio);
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
                  x={padding.left - 4}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-graphite-muted)"
                  fontSize="8"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bins SVG Bars */}
          {bins.map((b, idx) => {
            const barW = chartW / bins.length - 2;
            const x = padding.left + idx * (chartW / bins.length) + 1;
            const barH = (b.count / maxBinCount) * chartH;
            const y = padding.top + chartH - barH;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill="var(--text-charcoal)"
                  fillOpacity="0.75"
                  className="hover:fill-[var(--accent-copper)] transition-colors"
                />
              </g>
            );
          })}

          {/* Mean Marker Line (Copper Dashed) */}
          {meanX >= padding.left && meanX <= width - padding.right && (
            <line
              x1={meanX}
              y1={padding.top}
              x2={meanX}
              y2={padding.top + chartH}
              stroke="var(--accent-copper)"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
          )}

          {/* Median Marker Line (Slate Dashed) */}
          {medianX >= padding.left && medianX <= width - padding.right && (
            <line
              x1={medianX}
              y1={padding.top}
              x2={medianX}
              y2={padding.top + chartH}
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}
        </svg>
      </div>

      {/* Micro Legend & Caution */}
      <div className="pt-1.5 border-t border-[var(--border-light)]/40 flex items-center justify-between text-[8.5px] text-[var(--text-graphite-muted)] uppercase">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-[var(--accent-copper)]" /> MEAN
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-blue-600" /> MEDIAN
          </span>
        </div>
        <span>OBSERVED TELEMETRY DISTRIBUTION</span>
      </div>
    </div>
  );
}
