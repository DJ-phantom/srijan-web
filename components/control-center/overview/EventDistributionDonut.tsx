"use client";

import React, { useEffect, useState } from "react";
import { AlertRecord } from "@/lib/api";

interface EventDistributionDonutProps {
  fetchAlertHistory: (limit?: number) => Promise<AlertRecord[] | null>;
}

interface CategoryCount {
  label: string;
  severity: string;
  count: number;
  color: string;
  percentage: number;
}

export default function EventDistributionDonut({ fetchAlertHistory }: EventDistributionDonutProps) {
  const [alerts, setAlerts] = useState<AlertRecord[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchAlertHistory(100)
      .then((data) => {
        if (isMounted) {
          setAlerts(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchAlertHistory]);

  if (loading) {
    return (
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between h-[250px] font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <div>
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // HISTORICAL DISTRIBUTION
            </span>
            <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
              RECENT EVENT DISTRIBUTION
            </h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-[10px] text-[var(--text-graphite-muted)] uppercase animate-pulse">
          FETCHING PERSISTED EVENT HISTORY…
        </div>
      </div>
    );
  }

  if (error || !alerts) {
    return (
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between h-[250px] font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <div>
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
              // HISTORICAL DISTRIBUTION
            </span>
            <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
              RECENT EVENT DISTRIBUTION
            </h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-[10px] text-[var(--text-graphite-muted)] uppercase">
          NO PERSISTED EVENT RECORDS AVAILABLE
        </div>
      </div>
    );
  }

  const totalCount = alerts.length;

  // Group by severity
  const severityCounts: Record<string, number> = {
    CRITICAL: 0,
    WARNING: 0,
    ATTENTION: 0,
    INFO: 0,
  };

  alerts.forEach((item) => {
    const sev = (item.severity || "INFO").toUpperCase();
    if (severityCounts[sev] !== undefined) {
      severityCounts[sev]++;
    } else {
      severityCounts["INFO"]++;
    }
  });

  const categories: CategoryCount[] = [
    {
      label: "CRITICAL",
      severity: "CRITICAL",
      count: severityCounts.CRITICAL,
      color: "#dc2626", // Restrained Red
      percentage: totalCount > 0 ? (severityCounts.CRITICAL / totalCount) * 100 : 0,
    },
    {
      label: "WARNING",
      severity: "WARNING",
      count: severityCounts.WARNING,
      color: "#d97706", // Amber
      percentage: totalCount > 0 ? (severityCounts.WARNING / totalCount) * 100 : 0,
    },
    {
      label: "ATTENTION",
      severity: "ATTENTION",
      count: severityCounts.ATTENTION,
      color: "#b45309", // Copper/Brown
      percentage: totalCount > 0 ? (severityCounts.ATTENTION / totalCount) * 100 : 0,
    },
    {
      label: "INFO",
      severity: "INFO",
      count: severityCounts.INFO,
      color: "#475569", // Charcoal/Slate
      percentage: totalCount > 0 ? (severityCounts.INFO / totalCount) * 100 : 0,
    },
  ].filter((c) => c.count > 0 || totalCount === 0);

  // SVG Donut calculation
  const size = 140;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/60 shadow-xs flex flex-col justify-between font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2 mb-2">
        <div>
          <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-wider uppercase">
            // HISTORICAL DISTRIBUTION
          </span>
          <h3 className="font-heading text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-tight">
            RECENT EVENT DISTRIBUTION
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] font-semibold uppercase">
          RECENT {totalCount} PERSISTED EVENTS
        </span>
      </div>

      {totalCount === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-[var(--text-graphite-muted)] uppercase">
            0 PERSISTED EVENTS RECORDED
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] max-w-xs font-sans mt-1">
            All rule indicators remain within baseline thresholds. No persistent alerts recorded in PostgreSQL log.
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around py-2 gap-4">
          {/* SVG Donut */}
          <div className="relative w-[140px] h-[140px] shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--bg-stone)"
                strokeWidth={strokeWidth}
              />

              {categories.map((cat, idx) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -currentOffset;
                currentOffset += (cat.percentage / 100) * circumference;

                return (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Central Total Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-heading font-bold text-xl text-[var(--text-charcoal)] leading-none">
                {totalCount}
              </span>
              <span className="text-[8px] text-[var(--text-graphite-muted)] font-semibold uppercase tracking-wider mt-0.5">
                EVENTS
              </span>
            </div>
          </div>

          {/* Legend Breakdown */}
          <div className="space-y-2 w-full sm:w-auto min-w-[150px]">
            {categories.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between gap-3 text-[10px]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-[1px] shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-bold text-[var(--text-charcoal)] uppercase">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-[var(--text-charcoal)]">{cat.count}</span>
                  <span className="text-[9px] text-[var(--text-graphite-muted)]">
                    ({cat.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-[var(--border-light)]/40 text-[8.5px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
        <span>POSTGRESQL EVENT AUDIT LOG</span>
        <span>SEVERITY AGGREGATION</span>
      </div>
    </div>
  );
}
