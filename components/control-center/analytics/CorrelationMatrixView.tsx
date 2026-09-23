"use client";

import React, { useState } from "react";
import { TelemetryRecord } from "@/lib/api";
import { CHANNEL_CONFIGS, ChannelMeta } from "@/components/control-center/monitoring/MonitoringMainChart";

interface CorrelationMatrixViewProps {
  data: TelemetryRecord[];
  onSelectPair?: (key1: keyof TelemetryRecord, key2: keyof TelemetryRecord) => void;
}

function calculatePearson(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  const n = x.length;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return null; // Zero variance safeguard

  const r = num / (Math.sqrt(denX) * Math.sqrt(denY));
  return Math.min(1.0, Math.max(-1.0, r));
}

export default function CorrelationMatrixView({ data, onSelectPair }: CorrelationMatrixViewProps) {
  const [hoverCell, setHoverCell] = useState<{ c1: ChannelMeta; c2: ChannelMeta; r: number | null } | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs font-mono text-xs flex items-center justify-center text-[var(--text-graphite-muted)] uppercase">
        INSUFFICIENT DATA FOR CORRELATION MATRIX
      </div>
    );
  }

  const channels = CHANNEL_CONFIGS;

  // Compute 6x6 correlation matrix
  const matrix: (number | null)[][] = channels.map((c1) => {
    const vals1 = data.map((d) => (typeof d[c1.key] === "number" ? (d[c1.key] as number) : 0));
    return channels.map((c2) => {
      const vals2 = data.map((d) => (typeof d[c2.key] === "number" ? (d[c2.key] as number) : 0));
      return calculatePearson(vals1, vals2);
    });
  });

  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between font-mono text-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
            // STATISTICAL CO-MOVEMENT
          </span>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            SENSOR CORRELATION MATRIX (6×6 PEARSON r)
          </h3>
        </div>
        <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase font-semibold">
          WINDOW: {data.length} SAMPLES
        </span>
      </div>

      {/* Matrix Grid Table */}
      <div className="overflow-x-auto py-1">
        <table className="w-full text-center text-[9.5px] border-collapse font-mono select-none">
          <thead>
            <tr>
              <th className="p-1 text-[8.5px] text-left text-[var(--text-graphite-muted)] font-bold uppercase">
                SENSOR
              </th>
              {channels.map((c) => (
                <th key={c.id} className="p-1 text-[8.5px] text-[var(--text-charcoal)] font-bold uppercase">
                  {c.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((c1, rIdx) => (
              <tr key={c1.id} className="border-t border-[var(--border-light)]/30">
                <td className="p-1 text-left font-bold text-[var(--text-graphite-muted)] text-[8.5px] uppercase whitespace-nowrap">
                  {c1.code} {c1.id.slice(0, 4).toUpperCase()}
                </td>

                {channels.map((c2, cIdx) => {
                  const r = matrix[rIdx][cIdx];
                  const isSelf = rIdx === cIdx;

                  // Diverging color styling: copper for positive, slate for negative, stone for 0/self
                  let bgStyle = "bg-[var(--bg-stone)]/50 text-[var(--text-charcoal)]";
                  if (!isSelf && r !== null) {
                    if (r > 0.4) {
                      bgStyle = "bg-amber-100/90 text-amber-950 border border-amber-300/60 font-bold";
                    } else if (r > 0.15) {
                      bgStyle = "bg-amber-50/70 text-amber-900";
                    } else if (r < -0.4) {
                      bgStyle = "bg-slate-200/80 text-slate-900 border border-slate-300/60 font-bold";
                    } else if (r < -0.15) {
                      bgStyle = "bg-slate-100/70 text-slate-800";
                    }
                  } else if (isSelf) {
                    bgStyle = "bg-white text-[var(--text-graphite-muted)] font-semibold border border-[var(--border-light)]/40";
                  }

                  return (
                    <td
                      key={c2.id}
                      onMouseEnter={() => setHoverCell({ c1, c2, r })}
                      onClick={() => !isSelf && onSelectPair && onSelectPair(c1.key, c2.key)}
                      className={`p-1.5 transition-colors ${bgStyle} ${
                        !isSelf ? "cursor-pointer hover:border-[var(--accent-copper)]" : ""
                      }`}
                    >
                      {isSelf ? "1.00" : r !== null ? (r > 0 ? `+${r.toFixed(2)}` : r.toFixed(2)) : "N/A"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Detail Box / Hover Banner */}
      <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/50 text-[9px] flex items-center justify-between">
        {hoverCell && hoverCell.c1.id !== hoverCell.c2.id ? (
          <div className="flex items-center justify-between w-full">
            <span>
              PAIR: <strong className="text-[var(--text-charcoal)]">{hoverCell.c1.shortName}</strong> ↔{" "}
              <strong className="text-[var(--text-charcoal)]">{hoverCell.c2.shortName}</strong>
            </span>
            <div className="flex items-center gap-2">
              <span>
                PEARSON r:{" "}
                <strong className="text-[var(--accent-copper)] font-bold">
                  {hoverCell.r !== null ? (hoverCell.r > 0 ? `+${hoverCell.r.toFixed(2)}` : hoverCell.r.toFixed(2)) : "N/A"}
                </strong>
              </span>
              <span className="text-[8px] text-[var(--text-graphite-muted)]">(Click to plot pair)</span>
            </div>
          </div>
        ) : (
          <span className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase">
            HOVER OVER MATRIX CELL TO INSPECT CORRELATION SCORE
          </span>
        )}
      </div>

      {/* Footer Scientific Caution */}
      <div className="pt-1 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
        <span className="font-semibold text-[var(--accent-copper)]">
          NOTE: CORRELATION DOES NOT IMPLY CAUSATION
        </span>
        <span>EXPLORATORY NUMERICAL ANALYSIS</span>
      </div>
    </div>
  );
}
