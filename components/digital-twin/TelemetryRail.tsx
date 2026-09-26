"use client";

import React from "react";
import { DigitalTwinZoneId } from "./types";
import { getSignalStatus } from "./zoneConfig";
import { TelemetryRecord } from "@/lib/api";

interface TelemetryRailProps {
  telemetry: TelemetryRecord;
  selectedZoneId: DigitalTwinZoneId;
  onSelectZone: (zoneId: DigitalTwinZoneId) => void;
}

interface TelemetryCellConfig {
  key: keyof TelemetryRecord;
  label: string;
  associatedZoneId: DigitalTwinZoneId;
}

const RAIL_CELLS: TelemetryCellConfig[] = [
  { key: "temperature", label: "TEMP", associatedZoneId: "ZONE_A" },
  { key: "vibration", label: "VIB", associatedZoneId: "ZONE_A" },
  { key: "current", label: "CURRENT", associatedZoneId: "ZONE_A" },
  { key: "speed", label: "SPEED", associatedZoneId: "ZONE_B" },
  { key: "alignment", label: "ALIGN", associatedZoneId: "ZONE_D" },
  { key: "load", label: "LOAD", associatedZoneId: "ZONE_E" },
];

export default function TelemetryRail({ telemetry, selectedZoneId, onSelectZone }: TelemetryRailProps) {
  return (
    <div className="w-full bg-white rounded-[2px] border border-[var(--border-light)]/70 p-2 font-mono text-xs shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {RAIL_CELLS.map((cell) => {
          const val = Number(telemetry[cell.key] ?? 0);
          const sigInfo = getSignalStatus(cell.key, val);
          const isSelected = selectedZoneId === cell.associatedZoneId;

          const getDotColor = (status: string) => {
            switch (status) {
              case "CRITICAL":
                return "bg-red-500 animate-pulse";
              case "WARNING":
                return "bg-amber-500";
              case "ATTENTION":
                return "bg-amber-400";
              default:
                return "bg-emerald-500";
            }
          };

          return (
            <button
              key={cell.label}
              onClick={() => onSelectZone(cell.associatedZoneId)}
              className={`p-2 rounded-[1px] border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-[var(--bg-stone)]/50 border-[var(--border-light)]/50 text-[var(--text-charcoal)] hover:bg-white hover:border-[var(--accent-copper)]"
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className={isSelected ? "text-[var(--accent-copper)]" : "text-[var(--text-graphite-muted)]"}>
                  {cell.label}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(sigInfo.status)}`} />
              </div>

              <div className="font-bold text-xs pt-0.5 group-hover:text-[var(--accent-copper)] transition-colors">
                {sigInfo.formattedValue}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
