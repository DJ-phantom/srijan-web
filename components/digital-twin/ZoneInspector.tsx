"use client";

import React from "react";
import Link from "next/link";
import { DigitalTwinZoneId, SignalSeverity } from "./types";
import { PHYSICAL_ZONES, getSignalStatus, getOverallZoneStatus } from "./zoneConfig";
import { ControlCenterDataState } from "@/hooks/useControlCenterData";
import { formatTelemetryTime } from "@/lib/api";

interface ZoneInspectorProps {
  selectedZoneId: DigitalTwinZoneId;
  dataState: ControlCenterDataState;
}

export default function ZoneInspector({ selectedZoneId, dataState }: ZoneInspectorProps) {
  const { telemetry, conditionSummary, anomalyAssessment, activeAlerts } = dataState;

  const zone = PHYSICAL_ZONES.find((z) => z.id === selectedZoneId) || PHYSICAL_ZONES[2]; // Default ZONE_C

  // Map active alerts to metric keys
  const activeMetricKeys = activeAlerts.map((a) => a.metric?.toLowerCase() || "");
  const zoneStatus = getOverallZoneStatus(selectedZoneId, telemetry, activeMetricKeys, conditionSummary?.splice.level);

  // Find active alert mapped to this zone
  const activeZoneAlert = activeAlerts.find((a) => {
    const code = a.metric?.toLowerCase() || "";
    return zone.eventMetricKeys.includes(code);
  });

  const getStatusBadge = (status: SignalSeverity) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-700 border-red-500/40 font-bold";
      case "WARNING":
        return "bg-amber-500/10 text-amber-800 border-amber-500/40 font-bold";
      case "ATTENTION":
        return "bg-amber-500/10 text-amber-700 border-amber-500/40 font-bold";
      default:
        return "bg-emerald-500/10 text-emerald-800 border-emerald-500/40 font-bold";
    }
  };

  return (
    <div className="w-full bg-white rounded-[2px] border border-[var(--border-light)]/70 p-4 md:p-5 flex flex-col space-y-4 font-mono text-xs shadow-xs">
      {/* 1. Zone Identity & Status Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-light)]/40 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent-copper)] tracking-wider">
            <span>{zone.code}</span>
            <span className="opacity-40">//</span>
            <span>{zone.locationLabel}</span>
          </div>
          <h2 className="text-base font-bold text-[var(--text-charcoal)] font-heading">
            {zone.name}
          </h2>
          <p className="text-[10px] text-[var(--text-graphite-muted)] leading-relaxed font-sans font-light">
            {zone.subtitle}
          </p>
        </div>

        <span className={`inline-block px-2 py-0.5 rounded-[1px] border text-[10px] ${getStatusBadge(zoneStatus)}`}>
          {zoneStatus}
        </span>
      </div>

      {/* 2. Splice S1 Special Treatment (If ZONE C selected) */}
      {selectedZoneId === "ZONE_C" && (
        <div className="bg-amber-500/5 border-l-2 border-l-[var(--accent-copper)] border border-amber-500/20 p-3 space-y-2 rounded-[1px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--accent-copper)] text-[10px] tracking-wider uppercase">
              ★ MONITORED SPLICE S1
            </span>
            <span className="text-[9px] text-amber-900 font-bold bg-amber-500/20 px-1 py-0.5 rounded-[1px]">
              VULCANIZED JOINT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-[9px] text-[var(--text-graphite-muted)] block font-semibold">SPLICE RISK</span>
              <span className="font-bold text-base text-[var(--text-charcoal)]">
                {conditionSummary?.splice.risk_index.toFixed(1) || "11.5"}{" "}
                <span className="text-[9px] text-slate-500 font-normal">/ 100</span>
              </span>
            </div>

            <div>
              <span className="text-[9px] text-[var(--text-graphite-muted)] block font-semibold">CONDITION</span>
              <span className="font-bold text-emerald-700">
                {conditionSummary?.splice.level || "NORMAL"}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[var(--text-graphite-muted)] font-sans font-light pt-1 border-t border-amber-500/20">
            {conditionSummary?.splice.message || "Splice joint S1 operating within nominal fatigue limits."}
          </div>
        </div>
      )}

      {/* 3. Zone Live Sensor Signals */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-[var(--accent-copper)] tracking-wider uppercase">
          // ZONE SENSOR SIGNALS
        </div>
        <div className="space-y-1.5">
          {zone.primaryMetrics.map((metric) => {
            const val = Number(telemetry[metric] ?? 0);
            const sigInfo = getSignalStatus(metric, val);

            return (
              <div
                key={String(metric)}
                className="py-2 px-2.5 rounded-[1px] bg-[var(--bg-stone)]/50 border border-[var(--border-light)]/40 flex items-center justify-between text-[11px]"
              >
                <div>
                  <div className="font-bold text-[var(--text-charcoal)] uppercase text-[10px]">
                    {sigInfo.metric}
                  </div>
                  <div className="text-[8px] text-[var(--text-graphite-muted)]">
                    LIMIT: {sigInfo.warnLimit}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[var(--text-charcoal)] text-sm">
                    {sigInfo.formattedValue}
                  </div>
                  <span className={`inline-block text-[8px] font-bold px-1 rounded-[1px] ${
                    sigInfo.status === "CRITICAL"
                      ? "text-red-700 bg-red-100"
                      : sigInfo.status === "WARNING"
                      ? "text-amber-800 bg-amber-100"
                      : "text-emerald-700"
                  }`}>
                    {sigInfo.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Rule Engine Active Event Status */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-[var(--accent-copper)] tracking-wider uppercase">
          // RULE ENGINE EVENT STATUS
        </div>

        {activeZoneAlert ? (
          <div className="p-3 bg-red-50 border border-red-300 rounded-[1px] space-y-2 text-[11px]">
            <div className="flex items-center justify-between border-b border-red-200 pb-1">
              <span className="font-bold text-red-800 uppercase flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                ACTIVE EVENT
              </span>
              <span className="font-bold text-[9px] text-red-700 uppercase bg-red-100 px-1 py-0.5 rounded-[1px]">
                {activeZoneAlert.severity || "CRITICAL"}
              </span>
            </div>

            <div className="space-y-0.5 text-red-950 font-sans text-xs font-medium">
              <div>{activeZoneAlert.title || "RULE THRESHOLD BREACH"}</div>
              <div className="text-[10px] text-red-800 font-mono font-normal">
                {activeZoneAlert.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 border-t border-red-200 font-mono text-red-900">
              <div>
                <span className="opacity-75 block text-[8px]">OBSERVED VALUE</span>
                <span className="font-bold">{activeZoneAlert.value} {activeZoneAlert.unit}</span>
              </div>
              <div>
                <span className="opacity-75 block text-[8px]">STARTED TIME</span>
                <span className="font-bold">{formatTelemetryTime(activeZoneAlert.started_at)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/50 rounded-[1px] text-center text-[var(--text-graphite-muted)] text-[10px]">
            NO ACTIVE RULE EVENT IN THIS ZONE
          </div>
        )}
      </div>

      {/* 5. System Intelligence Context */}
      <div className="pt-2 border-t border-[var(--border-light)]/40 space-y-1.5">
        <div className="text-[10px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
          SYSTEM INTELLIGENCE CONTEXT
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] bg-[var(--bg-stone)]/40 p-2 rounded-[1px] border border-[var(--border-light)]/40">
          <div>
            <span className="text-[8px] text-[var(--text-graphite-muted)] block font-semibold">ISOLATION FOREST</span>
            <span className="font-bold text-[var(--text-charcoal)]">
              {anomalyAssessment?.status || "NORMAL_PATTERN"}
            </span>
          </div>

          <div>
            <span className="text-[8px] text-[var(--text-graphite-muted)] block font-semibold">ANOMALY INDEX</span>
            <span className="font-bold text-[var(--text-charcoal)]">
              {anomalyAssessment?.anomaly_index.toFixed(1) || "7.8"} / 100
            </span>
          </div>
        </div>
      </div>

      {/* 6. Deep Analysis Control Center Links */}
      <div className="space-y-1.5 pt-2 border-t border-[var(--border-light)]/40">
        <Link
          href="/control-center/monitoring"
          className="w-full py-1.5 px-2.5 rounded-[1px] bg-white border border-[var(--border-light)] hover:border-[var(--accent-copper)] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] font-semibold transition-colors flex items-center justify-between text-[10px]"
        >
          <span>OPEN LIVE MONITORING</span>
          <span>→</span>
        </Link>

        <Link
          href="/control-center/intelligence"
          className="w-full py-1.5 px-2.5 rounded-[1px] bg-white border border-[var(--border-light)] hover:border-[var(--accent-copper)] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] font-semibold transition-colors flex items-center justify-between text-[10px]"
        >
          <span>VIEW INTELLIGENCE</span>
          <span>→</span>
        </Link>

        <Link
          href="/control-center/decision-support"
          className="w-full py-1.5 px-2.5 rounded-[1px] bg-white border border-[var(--border-light)] hover:border-[var(--accent-copper)] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] font-semibold transition-colors flex items-center justify-between text-[10px]"
        >
          <span>VIEW DECISION SUPPORT</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
