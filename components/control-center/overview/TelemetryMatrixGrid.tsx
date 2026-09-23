"use client";

import React from "react";
import { TelemetryRecord } from "@/lib/api";

interface TelemetryMatrixGridProps {
  telemetry: TelemetryRecord;
  history: TelemetryRecord[];
}

interface ChannelConfig {
  key: keyof TelemetryRecord;
  id: string;
  name: string;
  unit: string;
  format: (v: number) => string;
  normalRange: [number, number];
  warnRange?: [number, number];
}

const CHANNELS: ChannelConfig[] = [
  {
    key: "temperature",
    id: "01",
    name: "TEMPERATURE",
    unit: "°C",
    format: (v) => v.toFixed(1),
    normalRange: [0, 60],
    warnRange: [60, 75],
  },
  {
    key: "vibration",
    id: "02",
    name: "VIBRATION",
    unit: "g",
    format: (v) => v.toFixed(2),
    normalRange: [0, 0.5],
    warnRange: [0.5, 0.8],
  },
  {
    key: "current",
    id: "03",
    name: "MOTOR CURRENT",
    unit: "A",
    format: (v) => v.toFixed(2),
    normalRange: [0, 8.0],
    warnRange: [8.0, 12.0],
  },
  {
    key: "speed",
    id: "04",
    name: "BELT SPEED",
    unit: "m/s",
    format: (v) => v.toFixed(2),
    normalRange: [1.2, 2.5],
    warnRange: [0.8, 3.0],
  },
  {
    key: "alignment",
    id: "05",
    name: "ALIGNMENT",
    unit: "mm",
    format: (v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)),
    normalRange: [-5.0, 5.0],
    warnRange: [-10.0, 10.0],
  },
  {
    key: "load",
    id: "06",
    name: "LOAD",
    unit: "%",
    format: (v) => v.toFixed(1),
    normalRange: [0, 85],
    warnRange: [85, 95],
  },
];

function MicroSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) {
    return (
      <div className="w-20 h-5 flex items-center justify-center text-[8px] text-[var(--text-graphite-muted)] uppercase">
        INIT...
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 80;
  const height = 20;
  const padding = 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke="var(--text-charcoal)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function TelemetryMatrixGrid({ telemetry, history }: TelemetryMatrixGridProps) {
  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2 mb-3">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
            // TELEMETRY MATRIX
          </span>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            LIVE CONDITION TELEMETRY (SIX CHANNELS)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">1 HZ STREAMING</span>
        </div>
      </div>

      {/* 3x2 Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {CHANNELS.map((ch) => {
          const rawVal = typeof telemetry[ch.key] === "number" ? (telemetry[ch.key] as number) : 0;
          const formattedVal = ch.format(rawVal);

          // Status assessment
          let isNormal = true;
          let isWarning = false;
          let isCritical = false;

          if (ch.key === "temperature") {
            if (rawVal >= 75) isCritical = true;
            else if (rawVal >= 60) isWarning = true;
          } else if (ch.key === "vibration") {
            if (rawVal >= 0.8) isCritical = true;
            else if (rawVal >= 0.5) isWarning = true;
          } else if (ch.key === "current") {
            if (rawVal >= 12.0) isCritical = true;
            else if (rawVal >= 8.0) isWarning = true;
          } else if (ch.key === "alignment") {
            if (Math.abs(rawVal) >= 10.0) isCritical = true;
            else if (Math.abs(rawVal) >= 5.0) isWarning = true;
          } else if (ch.key === "load") {
            if (rawVal >= 95) isCritical = true;
            else if (rawVal >= 85) isWarning = true;
          }

          if (isWarning || isCritical) isNormal = false;

          // Extract channel historical trend values from bounded buffer
          const channelData = history
            .map((h) => (typeof h[ch.key] === "number" ? (h[ch.key] as number) : 0))
            .filter((v) => !isNaN(v));

          return (
            <div
              key={ch.id}
              className="p-3 rounded-[2px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/50 flex flex-col justify-between space-y-2 hover:border-[var(--border-light)] transition-colors"
            >
              <div className="flex items-center justify-between text-[9.5px]">
                <span className="font-bold text-[var(--text-graphite-muted)] tracking-wider">
                  {ch.id} {ch.name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-[1px] text-[8.5px] font-bold uppercase ${
                    isCritical
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : isWarning
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {isCritical ? "CRITICAL" : isWarning ? "ATTENTION" : "NORMAL"}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-heading text-[var(--text-charcoal)]">
                    {formattedVal}
                  </span>
                  <span className="text-[10px] text-[var(--text-graphite-muted)] font-semibold">
                    {ch.unit}
                  </span>
                </div>

                <div className="pl-2">
                  <MicroSparkline data={channelData} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
