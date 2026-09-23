"use client";

import React from "react";
import { RiskContributor } from "@/lib/api";

interface RiskContributorsBarProps {
  contributors?: RiskContributor[];
}

export default function RiskContributorsBar({ contributors }: RiskContributorsBarProps) {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between h-[270px] font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <div>
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // CONDITION RISK ANALYSIS
            </span>
            <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
              TOP RISK CONTRIBUTORS
            </h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-[10px] text-[var(--text-graphite-muted)] uppercase">
          NO RISK CONTRIBUTORS IDENTIFIED
        </div>
      </div>
    );
  }

  // Sort descending by risk contribution
  const sorted = [...contributors].sort((a, b) => b.risk - a.risk).slice(0, 5);

  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between h-[270px] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
            // CONDITION RISK ANALYSIS
          </span>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            TOP RISK CONTRIBUTORS
          </h3>
        </div>
        <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
          CONDITION ENGINE FUSION
        </span>
      </div>

      {/* Horizontal Bar Ranking Items */}
      <div className="space-y-2.5 py-1">
        {sorted.map((item) => {
          const isHigh = item.risk >= 30;
          const isMedium = item.risk >= 15;
          const pct = Math.min(100, Math.max(4, item.risk));

          return (
            <div key={item.metric} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-charcoal)] uppercase">
                    {item.metric}
                  </span>
                  <span className="text-[9px] text-[var(--text-graphite-muted)] font-mono">
                    [{item.value > 0 ? `+${item.value}` : item.value} {item.unit}]
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className={isHigh ? "text-[var(--accent-copper)]" : "text-[var(--text-charcoal)]"}>
                    {item.risk.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-[var(--text-graphite-muted)] font-normal">/ 100</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-[1px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    isHigh
                      ? "bg-[var(--accent-copper)]"
                      : isMedium
                      ? "bg-amber-600/80"
                      : "bg-[var(--text-charcoal)]/60"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-1.5 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
        <span>RANKED BY CONDITION ENGINE WEIGHT</span>
        <span className="text-[var(--accent-copper)] font-semibold">MULTI-SENSOR ASSESSMENT</span>
      </div>
    </div>
  );
}
