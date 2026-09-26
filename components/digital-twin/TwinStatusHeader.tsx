"use client";

import React from "react";
import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";
import { ControlCenterDataState } from "@/hooks/useControlCenterData";

interface TwinStatusHeaderProps {
  dataState: ControlCenterDataState;
}

export default function TwinStatusHeader({ dataState }: TwinStatusHeaderProps) {
  const { isConnected, conditionSummary, activeAlerts, isBackendAvailable } = dataState;

  const systemLevel = conditionSummary?.overall.level || "NORMAL";
  const activeEventCount = activeAlerts.length;

  const getSystemLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-700 border-red-500/30";
      case "WARNING":
        return "bg-amber-500/10 text-amber-800 border-amber-500/30";
      case "ATTENTION":
        return "bg-amber-500/10 text-amber-700 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-800 border-emerald-500/30";
    }
  };

  return (
    <header className="w-full bg-[var(--bg-stone)] border-b border-[var(--border-light)]/60 pt-3.5 pb-4 font-mono text-xs">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 space-y-3">
        {/* Top Branding & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-2.5">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <span className="text-[var(--border-light)]">|</span>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold">
              <span className="text-[var(--accent-copper)] font-bold">BC-01</span>
              <span className="text-[var(--text-charcoal)] font-bold">DIGITAL TWIN</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/control-center"
              className="px-3 py-1 rounded-[2px] bg-white border border-[var(--border-light)] text-[var(--text-charcoal)] font-semibold hover:border-[var(--accent-copper)] hover:text-[var(--accent-copper)] transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <span>CONTROL CENTER</span>
              <span>→</span>
            </Link>
            <Link
              href="/"
              className="text-[var(--text-graphite-muted)] hover:text-[var(--accent-copper)] transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>← LANDING</span>
            </Link>
          </div>
        </div>

        {/* Page Identity & Headline */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[var(--accent-copper)] uppercase">
              <span>LIVE SPATIAL CONDITION MODEL</span>
              <span className="opacity-40">//</span>
              <span>CONVEYOR BC-01</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-charcoal)] font-heading leading-tight">
              DIGITAL TWIN <span className="text-[var(--accent-copper)]">BC-01</span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[var(--text-graphite-muted)] font-light leading-relaxed">
              A live spatial representation of Conveyor BC-01 that maps telemetry, condition assessment and rule events to their physical operating context.
            </p>
          </div>

          {/* Prototype Disclosure Badge */}
          <div className="self-start lg:self-center bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 rounded-[2px] text-[10px] space-y-0.5 shrink-0">
            <div className="font-bold text-amber-800 tracking-wider uppercase">
              PROTOTYPE DIGITAL TWIN
            </div>
            <div className="text-[var(--text-graphite-muted)] text-[9px]">
              PHYSICAL SENSOR HARDWARE SIMULATED
            </div>
          </div>
        </div>

        {/* Top Operational Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-white/90 p-2 rounded-[2px] border border-[var(--border-light)]/60 text-[11px]">
          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-semibold tracking-wider">CONVEYOR</span>
            <span className="font-bold text-[var(--text-charcoal)]">BC-01</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-semibold tracking-wider">SOURCE</span>
            <span className="font-bold text-[var(--text-charcoal)]">SYNTHETIC TELEMETRY</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-semibold tracking-wider">STREAM</span>
            <span className="font-bold text-[var(--text-charcoal)]">~1 HZ</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-semibold tracking-wider">SYSTEM CONDITION</span>
            <span className={`inline-block px-1.5 py-0.5 rounded-[1px] border font-bold text-[10px] w-fit ${getSystemLevelBadge(systemLevel)}`}>
              {systemLevel}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-semibold tracking-wider">ACTIVE EVENTS</span>
            <span className={`font-bold ${activeEventCount > 0 ? "text-red-600" : "text-[var(--text-charcoal)]"}`}>
              {activeEventCount} ACTIVE
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] font-semibold tracking-wider">BACKEND STATUS</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected && isBackendAvailable ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              <span className="font-bold text-[10px]">
                {isConnected && isBackendAvailable ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
