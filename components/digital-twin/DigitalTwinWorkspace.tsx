"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useControlCenterData } from "@/hooks/useControlCenterData";
import TwinStatusHeader from "./TwinStatusHeader";
import ConveyorSpatialModel from "./ConveyorSpatialModel";
import ZoneInspector from "./ZoneInspector";
import TelemetryRail from "./TelemetryRail";
import { DigitalTwinZoneId } from "./types";

export default function DigitalTwinWorkspace() {
  const dataState = useControlCenterData();
  const [selectedZoneId, setSelectedZoneId] = useState<DigitalTwinZoneId>("ZONE_C");

  return (
    <div className="min-h-screen bg-[var(--bg-stone)] text-[var(--text-charcoal)] flex flex-col justify-between selection:bg-[var(--accent-copper)] selection:text-white font-mono">
      {/* Top Header & Identity */}
      <TwinStatusHeader dataState={dataState} />

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 md:px-6 py-5 space-y-5">
        {/* Primary Desktop Layout (1366x768 target) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left / Center 8 Cols (~70-75%): 2.5D Conveyor Spatial Model */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <ConveyorSpatialModel
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              telemetry={dataState.telemetry}
              activeAlerts={dataState.activeAlerts}
              conditionSummary={dataState.conditionSummary}
              isConnected={dataState.isConnected && dataState.isBackendAvailable}
            />

            {/* Compact Live Telemetry Rail */}
            <TelemetryRail
              telemetry={dataState.telemetry}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
          </div>

          {/* Right 4 Cols (~25-30%): Selected Zone Inspector */}
          <div className="lg:col-span-4">
            <ZoneInspector
              selectedZoneId={selectedZoneId}
              dataState={dataState}
            />
          </div>
        </div>

        {/* Connection to Control Center Section */}
        <div className="bg-white rounded-[2px] border border-[var(--border-light)]/70 p-4 md:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-light)]/40 pb-2.5">
            <div>
              <div className="text-[10px] font-bold text-[var(--accent-copper)] tracking-wider uppercase">
                // SYSTEM NAVIGATION & ANALYSIS
              </div>
              <h3 className="text-base font-bold text-[var(--text-charcoal)] font-heading">
                NEED DEEPER OPERATIONAL ANALYSIS?
              </h3>
            </div>
            <p className="text-xs text-[var(--text-graphite-muted)] font-sans font-light max-w-md">
              The Digital Twin provides spatial context. Use the full Control Center for deep analytical telemetry streams, Isolation Forest feature distributions, and stateful rule engine logs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
            <Link
              href="/control-center"
              className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)] hover:border-[var(--accent-copper)] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] transition-colors flex items-center justify-between"
            >
              <span>OPEN CONTROL CENTER</span>
              <span>→</span>
            </Link>

            <Link
              href="/control-center/monitoring"
              className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)] hover:border-[var(--accent-copper)] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] transition-colors flex items-center justify-between"
            >
              <span>MONITOR LIVE SIGNALS</span>
              <span>→</span>
            </Link>

            <Link
              href="/control-center/alerts"
              className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)] hover:border-[var(--accent-copper)] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] transition-colors flex items-center justify-between"
            >
              <span>VIEW EVENT MANAGEMENT</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 5-Step Continuous Technical Architecture Rail */}
        <div className="bg-[var(--bg-stone)] border border-[var(--border-light)]/80 rounded-[2px] p-4 md:p-5 space-y-4">
          <div className="text-[10px] font-bold text-[var(--accent-copper)] tracking-wider uppercase">
            // ARCHITECTURE DISCLOSURE
          </div>
          <h3 className="text-base font-bold text-[var(--text-charcoal)] font-heading">
            HOW THE DIGITAL TWIN WORKS
          </h3>

          {/* 5-Step Continuous Technical Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 bg-white border border-[var(--border-light)] rounded-[1px] flex flex-col justify-center">
              <span className="text-[9px] text-[var(--accent-copper)] font-bold">01 STEP</span>
              <span className="font-bold text-[var(--text-charcoal)]">TELEMETRY</span>
            </div>
            <div className="p-2.5 bg-white border border-[var(--border-light)] rounded-[1px] flex flex-col justify-center">
              <span className="text-[9px] text-[var(--accent-copper)] font-bold">02 STEP</span>
              <span className="font-bold text-[var(--text-charcoal)]">CONDITION / ML</span>
            </div>
            <div className="p-2.5 bg-white border border-[var(--border-light)] rounded-[1px] flex flex-col justify-center">
              <span className="text-[9px] text-[var(--accent-copper)] font-bold">03 STEP</span>
              <span className="font-bold text-[var(--text-charcoal)]">ZONE MAPPING</span>
            </div>
            <div className="p-2.5 bg-white border border-[var(--border-light)] rounded-[1px] flex flex-col justify-center">
              <span className="text-[9px] text-[var(--accent-copper)] font-bold">04 STEP</span>
              <span className="font-bold text-[var(--text-charcoal)]">DIGITAL TWIN</span>
            </div>
            <div className="p-2.5 bg-white border border-[var(--border-light)] rounded-[1px] flex flex-col justify-center">
              <span className="text-[9px] text-[var(--accent-copper)] font-bold">05 STEP</span>
              <span className="font-bold text-[var(--text-charcoal)]">OPERATOR CONTEXT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-[var(--text-graphite-muted)] pt-2 border-t border-[var(--border-light)]/40 font-light">
            <div>
              <strong className="text-[var(--text-charcoal)] font-mono font-bold block text-[11px] mb-1">
                CURRENT PROTOTYPE DEPLOYMENT
              </strong>
              Cloud synthetic telemetry powers the live hosted digital twin at 1 Hz stream cadence. All metric thresholds match canonical backend rule engine limits.
            </div>
            <div>
              <strong className="text-[var(--text-charcoal)] font-mono font-bold block text-[11px] mb-1">
                TARGET FIELD DEPLOYMENT
              </strong>
              Physical ESP32 hardware microcontrollers and embedded sensors will feed this exact same Fast-API backend and Digital Twin pipeline upon physical deployment.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-[var(--border-light)]/60 text-xs text-[var(--text-graphite-muted)]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>SRIJAN CONVEYOR INTELLIGENCE &nbsp;//&nbsp; DIGITAL TWIN ROUTE</div>
          <Link
            href="/"
            className="text-[var(--accent-copper)] font-semibold hover:underline"
          >
            RETURN TO LANDING PAGE →
          </Link>
        </div>
      </footer>
    </div>
  );
}
