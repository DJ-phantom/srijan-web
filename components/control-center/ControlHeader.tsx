"use client";

import Link from "next/link";
import { ArrowLeft, Server, Activity, ShieldAlert, Camera, Cpu } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useControlCenterData } from "@/hooks/useControlCenterData";

export default function ControlHeader() {
  const { dataMode, isConnected, isBackendAvailable, streamCadence, lastUpdated } = useControlCenterData();

  return (
    <header className="w-full bg-[var(--bg-stone)] border-b border-[var(--border-light)]/40 px-6 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs select-none sticky top-0 z-40">
      {/* Brand & Context */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 px-3 py-1.5 rounded-[2px] border border-[var(--border-light)] bg-white/60 hover:bg-[var(--accent-copper)] hover:text-white hover:border-[var(--accent-copper)] transition-all duration-200 text-[11px] font-semibold uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>PORTAL HOME</span>
        </Link>

        <div className="h-4 w-[1px] bg-[var(--border-light)] hidden sm:block" />

        <BrandLogo showDescriptor={false} />
      </div>

      {/* Technical Honesty & Data Mode Disclosure */}
      <div className="hidden xl:flex items-center gap-2.5 text-[10px]">
        {/* Data Mode Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border font-bold uppercase ${
            dataMode === "BACKEND_CONNECTED"
              ? "bg-white/90 border-[var(--border-light)] text-[var(--text-charcoal)]"
              : "bg-amber-500/20 border-amber-500/40 text-amber-900"
          }`}
        >
          <Activity className="w-3 h-3 text-[var(--accent-copper)]" />
          <span>
            DATA SOURCE:{" "}
            <strong className="text-[var(--accent-copper)]">
              {dataMode === "BACKEND_CONNECTED" ? "CLOUD SYNTHETIC TELEMETRY" : "OFFLINE DEMO DATA"}
            </strong>
          </span>
        </div>

        {/* Software Pipeline Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border font-bold uppercase ${
            isConnected
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800"
              : "bg-red-500/10 border-red-500/30 text-red-800"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-600 animate-pulse" : "bg-red-600"}`} />
          <span>SOFTWARE PIPELINE: {isConnected ? "CONNECTED" : "DISCONNECTED"}</span>
        </div>

        {/* Physical Sensor Hardware Badge (Separated from Software) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-black/5 border border-black/10 text-[var(--text-graphite-muted)] font-semibold uppercase">
          <Cpu className="w-3 h-3 opacity-60" />
          <span>PHYSICAL SENSORS: <strong className="text-[var(--text-charcoal)]">SIMULATED</strong></span>
        </div>

        {/* Camera Badge (Separated) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-black/5 border border-black/10 text-[var(--text-graphite-muted)] font-semibold uppercase">
          <Camera className="w-3 h-3 opacity-60" />
          <span>CAMERA: <strong className="text-[var(--text-charcoal)]">PLANNED</strong></span>
        </div>

        {/* Stream Cadence */}
        <div className="px-2 py-1 rounded-[2px] bg-black/5 border border-black/10 text-[var(--text-graphite-muted)] font-semibold uppercase">
          {streamCadence}
        </div>
      </div>

      {/* Backend Engine Status Pill */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[2px] border text-[11px] font-bold uppercase transition-all duration-200 ${
            dataMode === "BACKEND_CONNECTED"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-900"
              : "bg-amber-500/15 border-amber-500/40 text-amber-900"
          }`}
        >
          <Server className="w-3.5 h-3.5 opacity-80" />
          <span>
            {dataMode === "BACKEND_CONNECTED" ? "SIH26008 BACKEND ACTIVE" : "FRONTEND FALLBACK MODE"}
          </span>
        </div>
      </div>
    </header>
  );
}
