"use client";

import React, { useState } from "react";
import { RiskHistoryPoint } from "@/components/control-center/ControlCenterDataProvider";

interface SessionRiskChartProps {
  overallHistory: RiskHistoryPoint[];
  spliceHistory: RiskHistoryPoint[];
}

export default function SessionRiskChart({ overallHistory }: SessionRiskChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // If fewer than 4 samples, show accumulating state
  if (!overallHistory || overallHistory.length < 4) {
    return (
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between h-[270px] font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <div>
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // SESSION CONDITION TREND
            </span>
            <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
              OVERALL vs SPLICE S1 RISK INDEX (60S WINDOW)
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[9px] text-[var(--text-graphite-muted)] font-semibold uppercase">
            SESSION LIVE HISTORY
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1.5 py-8">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-copper)] animate-ping" />
          <span className="text-[11px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
            ACCUMULATING SESSION TREND…
          </span>
          <span className="text-[10px] text-[var(--text-graphite-muted)] max-w-xs font-sans">
            Collecting 1 Hz live condition telemetry. Trend line populates continuously as 60-second window fills.
          </span>
        </div>
      </div>
    );
  }

  const width = 560;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 25, left: 35 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const count = overallHistory.length;

  const pointsOverall = overallHistory.map((item, idx) => {
    const x = padding.left + (idx / (count - 1)) * chartW;
    const y = padding.top + chartH - (Math.min(100, Math.max(0, item.overallRisk)) / 100) * chartH;
    return { x, y, val: item.overallRisk, ts: item.timestamp, spliceVal: item.spliceRisk };
  });

  const pointsSplice = overallHistory.map((item, idx) => {
    const x = padding.left + (idx / (count - 1)) * chartW;
    const y = padding.top + chartH - (Math.min(100, Math.max(0, item.spliceRisk)) / 100) * chartH;
    return { x, y, val: item.spliceRisk };
  });

  const polylineOverall = pointsOverall.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const polylineSplice = pointsSplice.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const latestPoint = pointsOverall[pointsOverall.length - 1];
  const hovered = hoverIndex !== null && pointsOverall[hoverIndex] ? pointsOverall[hoverIndex] : null;

  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between h-[270px] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
            // SESSION CONDITION TREND
          </span>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            OVERALL vs SPLICE S1 RISK INDEX (60S WINDOW)
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[9.5px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[var(--text-charcoal)]" />
            <span className="font-bold text-[var(--text-charcoal)] uppercase">OVERALL RISK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[var(--accent-copper)]" />
            <span className="font-bold text-[var(--accent-copper)] uppercase">SPLICE S1</span>
          </div>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] font-semibold uppercase">
            SESSION LIVE HISTORY
          </span>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full h-[180px] my-auto overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Y-Axis Gridlines & Labels (0, 25, 50, 75, 100) */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + chartH - (val / 100) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border-light)"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? undefined : "2 2"}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-graphite-muted)"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Overall Risk Line (Dark Charcoal) */}
          <polyline
            fill="none"
            stroke="var(--text-charcoal)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineOverall}
          />

          {/* Splice S1 Risk Line (Copper Accent) */}
          <polyline
            fill="none"
            stroke="var(--accent-copper)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineSplice}
          />

          {/* Interactive Mouse Hover Tracking Columns */}
          {pointsOverall.map((pt, idx) => (
            <rect
              key={idx}
              x={pt.x - chartW / (count * 2)}
              y={padding.top}
              width={chartW / count}
              height={chartH}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIndex(idx)}
            />
          ))}

          {/* Hover Indicator Crosshair */}
          {hovered && (
            <g className="pointer-events-none">
              <line
                x1={hovered.x}
                y1={padding.top}
                x2={hovered.x}
                y2={padding.top + chartH}
                stroke="var(--text-charcoal)"
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              <circle cx={hovered.x} cy={hovered.y} r="3.5" fill="var(--text-charcoal)" />
              <circle
                cx={hovered.x}
                cy={pointsSplice[hoverIndex!].y}
                r="3.5"
                fill="var(--accent-copper)"
              />
            </g>
          )}

          {/* Latest Data Point Dots */}
          {!hovered && latestPoint && (
            <g className="pointer-events-none">
              <circle cx={latestPoint.x} cy={latestPoint.y} r="3.5" fill="var(--text-charcoal)" />
              <circle
                cx={pointsSplice[pointsSplice.length - 1].x}
                cy={pointsSplice[pointsSplice.length - 1].y}
                r="3.5"
                fill="var(--accent-copper)"
              />
            </g>
          )}
        </svg>

        {/* Hover Floating Tooltip */}
        {hovered && (
          <div
            className="absolute top-2 z-20 px-2.5 py-1.5 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-mono text-[9px] space-y-0.5 shadow-md pointer-events-none"
            style={{
              left: `${Math.min(80, Math.max(10, (hovered.x / width) * 100))}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="opacity-70 border-b border-white/20 pb-0.5">
              TIME: {new Date(hovered.ts).toLocaleTimeString()}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>OVERALL RISK:</span>
              <span className="font-bold text-white">{hovered.val.toFixed(1)} / 100</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[var(--accent-copper)] font-bold">
              <span>SPLICE S1 RISK:</span>
              <span>{hovered.spliceVal.toFixed(1)} / 100</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
