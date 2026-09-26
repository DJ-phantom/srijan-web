"use client";

import React, { useState } from "react";
import { DigitalTwinZoneId, SignalSeverity } from "./types";
import { PHYSICAL_ZONES, SENSOR_HOTSPOTS, getSignalStatus, getOverallZoneStatus } from "./zoneConfig";
import { TelemetryRecord, AlertRecord, ConditionSummary } from "@/lib/api";

interface ConveyorSpatialModelProps {
  selectedZoneId: DigitalTwinZoneId;
  onSelectZone: (zoneId: DigitalTwinZoneId) => void;
  telemetry: TelemetryRecord;
  activeAlerts: AlertRecord[];
  conditionSummary: ConditionSummary | null;
  isConnected: boolean;
}

export default function ConveyorSpatialModel({
  selectedZoneId,
  onSelectZone,
  telemetry,
  activeAlerts,
  conditionSummary,
  isConnected,
}: ConveyorSpatialModelProps) {
  const [activeTooltipCode, setActiveTooltipCode] = useState<string | null>(null);

  // Map active alerts to metric keys
  const activeMetricKeys = activeAlerts.map((a) => a.metric?.toLowerCase() || "");

  const getZoneSeverity = (zoneId: DigitalTwinZoneId): SignalSeverity => {
    return getOverallZoneStatus(zoneId, telemetry, activeMetricKeys, conditionSummary?.splice.level);
  };

  const getSeverityColors = (severity: SignalSeverity, isSelected: boolean) => {
    switch (severity) {
      case "CRITICAL":
        return {
          stroke: "#ef4444",
          wash: isSelected ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.03)",
          badge: "bg-red-600 text-white border-red-700",
          ring: "#ef4444",
          text: "#fca5a5",
        };
      case "WARNING":
        return {
          stroke: "#d97706",
          wash: isSelected ? "rgba(217, 119, 6, 0.12)" : "rgba(217, 119, 6, 0.03)",
          badge: "bg-amber-600 text-white border-amber-700",
          ring: "#d97706",
          text: "#fde68a",
        };
      case "ATTENTION":
        return {
          stroke: "#f59e0b",
          wash: isSelected ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.02)",
          badge: "bg-amber-500 text-white border-amber-600",
          ring: "#f59e0b",
          text: "#fef08a",
        };
      default:
        return {
          stroke: isSelected ? "#ea580c" : "#475569",
          wash: isSelected ? "rgba(234, 88, 12, 0.08)" : "transparent",
          badge: "bg-emerald-600 text-white border-emerald-700",
          ring: "#10b981",
          text: "#6ee7b7",
        };
    }
  };

  const alignmentVal = Number(telemetry.alignment ?? 0);
  const isAlignmentAbnormal = Math.abs(alignmentVal) >= 3.0;

  return (
    <div className="w-full bg-[#0b1329] rounded-[2px] border border-slate-800 p-4 md:p-5 flex flex-col space-y-3.5 shadow-md font-mono text-xs select-none">
      {/* Canvas Top Bar: Asset Identity & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5 text-slate-200">
          <span className="font-bold text-[var(--accent-copper)] tracking-wider">BC-01 // LIVE SPATIAL TWIN</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">CONVEYOR CONDITION MODEL</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>NORMAL</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>ATTENTION</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>WARNING</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>CRITICAL</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 pl-2 border-l border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="font-bold text-red-400">● ACTIVE EVENT</span>
          </div>
        </div>
      </div>

      {/* SVG Conveyor Schematic Canvas */}
      <div className="relative w-full aspect-[1000/340] bg-slate-950/90 rounded-[2px] border border-slate-800/90 overflow-hidden">
        {/* CSS Animation for Belt Motion */}
        <style jsx>{`
          @keyframes beltFlow {
            0% {
              stroke-dashoffset: 24;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
          .belt-running {
            animation: beltFlow 0.8s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .belt-running {
              animation: none;
            }
          }
        `}</style>

        {/* Technical Coordinate Field Background Grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="twinGrid2" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#475569" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#twinGrid2)" />
        </svg>

        {/* Top Overlay: Asset Metadata Box */}
        <div className="absolute top-3 left-4 z-20 bg-slate-900/90 backdrop-blur-xs border border-slate-800 p-2.5 rounded-[2px] text-[10px] space-y-1 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-[var(--accent-copper)]">
            <span>CONVEYOR BC-01 ASSET</span>
            <span className="text-slate-600">//</span>
            <span className="text-slate-400 font-normal">100m SYSTEM</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] text-slate-400">
            <div>
              CONDITION:{" "}
              <span className="font-bold text-slate-200">{conditionSummary?.overall.level || "NORMAL"}</span>
            </div>
            <div>
              RISK:{" "}
              <span className="font-bold text-slate-200">{conditionSummary?.overall.risk_index.toFixed(1) || "13.6"}</span>
            </div>
            <div>
              SCENARIO:{" "}
              <span className="font-bold text-[var(--accent-copper)]">{telemetry.scenario || "NORMAL"}</span>
            </div>
          </div>
        </div>

        {/* Material Flow Direction Label (Top Right) */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 text-[10px] font-bold text-amber-500/90 bg-slate-900/80 px-2.5 py-1 rounded-[1px] border border-amber-500/30">
          <span>MATERIAL FLOW</span>
          <span className="text-sm">→</span>
        </div>

        {/* Main Conveyor SVG Geometry */}
        <svg
          className="w-full h-full relative z-10"
          viewBox="0 0 1000 340"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle Zone Contour Washes (No hard box divisions) */}
          {PHYSICAL_ZONES.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const severity = getZoneSeverity(zone.id);
            const colors = getSeverityColors(severity, isSelected);
            const startX = Number(zone.svgPath ? zone.svgPath.split(" ")[1] : 0);
            const endX = Number(zone.svgPath ? zone.svgPath.split(" ")[4] : 150);

            return (
              <g key={`wash-${zone.id}`} onClick={() => onSelectZone(zone.id)} className="cursor-pointer">
                {/* Zone Wash Area */}
                <rect
                  x={startX}
                  y="20"
                  width={endX - startX}
                  height="260"
                  fill={colors.wash}
                  className="transition-all duration-200"
                />
                {/* Subtle Boundary Vertical Marker Line */}
                <line x1={endX} y1="30" x2={endX} y2="270" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

                {/* Selected Zone Top Accent Line */}
                {isSelected && (
                  <line x1={startX + 5} y1="22" x2={endX - 5} y2="22" stroke="#ea580c" strokeWidth="3" />
                )}
              </g>
            );
          })}

          {/* Conveyor Structural Steel Support Framework */}
          {/* Main Horizontal I-Beam Structural Truss */}
          <rect x="70" y="210" width="860" height="12" fill="#1e293b" stroke="#334155" strokeWidth="1" rx="1" />
          <line x1="70" y1="216" x2="930" y2="216" stroke="#475569" strokeWidth="2" />

          {/* Truss Diagonal Bracing */}
          {[120, 240, 360, 480, 600, 720, 840].map((bx, i) => (
            <g key={`truss-${i}`}>
              <line x1={bx} y1="210" x2={bx + 60} y2="222" stroke="#334155" strokeWidth="1.5" />
              <line x1={bx + 60} y1="210" x2={bx} y2="222" stroke="#334155" strokeWidth="1.5" />
            </g>
          ))}

          {/* Ground Vertical Support Pillars */}
          {[110, 330, 515, 700, 880].map((px, i) => (
            <g key={`pillar-${i}`}>
              <rect x={px - 4} y="222" width="8" height="50" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <polygon points={`${px - 10},272 ${px + 10},272 ${px + 6},222 ${px - 6},222`} fill="#0f172a" />
            </g>
          ))}

          {/* Head Section: Electric Drive Motor & Gearbox Assembly (Zone A) */}
          <g>
            <rect x="50" y="170" width="55" height="42" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" rx="2" />
            <rect x="55" y="175" width="20" height="32" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            <text x="77" y="195" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">MOTOR</text>
            {/* Drive Coupling Shaft */}
            <line x1="105" y1="190" x2="130" y2="155" stroke="#f97316" strokeWidth="3" />
          </g>

          {/* Head Drive Pulley (Zone A) */}
          <g>
            <circle cx="130" cy="155" r="34" fill="#1e293b" stroke="#ea580c" strokeWidth="3.5" />
            <circle cx="130" cy="155" r="22" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <circle cx="130" cy="155" r="10" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Drive Pulley Rotation Indication Line */}
            {isConnected && (
              <line x1="130" y1="133" x2="130" y2="177" stroke="#ea580c" strokeWidth="2" opacity="0.6" />
            )}
          </g>

          {/* Tail Pulley (Zone E) */}
          <g>
            <circle cx="870" cy="155" r="30" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
            <circle cx="870" cy="155" r="18" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <circle cx="870" cy="155" r="8" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
          </g>

          {/* Bottom Return Belt Strand */}
          <line x1="130" y1="189" x2="870" y2="185" stroke="#64748b" strokeWidth="5" strokeDasharray="10 4" />

          {/* Top Carrying Belt Strand (With Live Motion Dash) */}
          <line x1="130" y1="121" x2="870" y2="125" stroke="#0f172a" strokeWidth="10" />
          <line x1="130" y1="121" x2="870" y2="125" stroke="#e2e8f0" strokeWidth="6" />
          {/* Animated Belt Flow Markers */}
          <line
            x1="130"
            y1="121"
            x2="870"
            y2="125"
            stroke="#ea580c"
            strokeWidth="6"
            strokeDasharray="8 16"
            className={isConnected ? "belt-running" : ""}
          />

          {/* Troughing Idler Sets along Carrying Strand */}
          {[190, 250, 310, 370, 430, 490, 550, 610, 670, 730, 790, 830].map((cx, idx) => (
            <g key={`idler-${idx}`}>
              {/* Troughing idler roller bracket */}
              <polygon points={`${cx - 8},132 ${cx + 8},132 ${cx + 6},142 ${cx - 6},142`} fill="#334155" />
              <circle cx={cx} cy="129" r="4.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              {/* Vertical Stanchion Line */}
              <line x1={cx} y1="142" x2={cx} y2="210" stroke="#1e293b" strokeWidth="1" />
            </g>
          ))}

          {/* Monitored Splice Joint S1 Seam (Zone C) */}
          <g onClick={() => onSelectZone("ZONE_C")} className="cursor-pointer group">
            {/* Seam Bracket Highlight */}
            <line
              x1="515"
              y1="113"
              x2="515"
              y2="133"
              stroke={selectedZoneId === "ZONE_C" ? "#ea580c" : "#f59e0b"}
              strokeWidth={selectedZoneId === "ZONE_C" ? "5" : "3"}
              className="animate-pulse"
            />
            <line x1="510" y1="113" x2="520" y2="133" stroke="#f59e0b" strokeWidth="2" />
            <rect x="475" y="93" width="80" height="16" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" rx="2" />
            <text x="515" y="104" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">
              SPLICE S1 SEAM
            </text>
          </g>

          {/* Lateral Tracking Indicator (Zone D) */}
          <g transform="translate(680, 160)">
            <rect x="0" y="0" width="85" height="32" fill="#0f172a" stroke={isAlignmentAbnormal ? "#d97706" : "#475569"} strokeWidth="1" rx="2" />
            <text x="42" y="11" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">
              TRACKING CENTERLINE
            </text>
            {/* Reference Centerline */}
            <line x1="15" y1="21" x2="70" y2="21" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* Observed Offset Marker */}
            <circle
              cx={42 + Math.max(-25, Math.min(25, alignmentVal * 4))}
              cy="21"
              r="3.5"
              fill={isAlignmentAbnormal ? "#d97706" : "#10b981"}
            />
            <text x="42" y="29" textAnchor="middle" fill={isAlignmentAbnormal ? "#fde68a" : "#6ee7b7"} fontSize="7" fontWeight="bold">
              {alignmentVal > 0 ? `+${alignmentVal.toFixed(1)}mm` : `${alignmentVal.toFixed(1)}mm`}
            </text>
          </g>

          {/* Material Loading Hopper / Chute Assembly (Zone E) */}
          <g>
            <polygon points="845,50 895,50 878,112 862,112" fill="#1e293b" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="855" y="40" width="30" height="10" fill="#334155" stroke="#64748b" strokeWidth="1" />
            <text x="870" y="47" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="bold">CHUTE</text>
          </g>

          {/* Active Rule Event Localized Annotations */}
          {activeAlerts.map((alert) => {
            const code = alert.metric?.toLowerCase() || "";
            const matchedZone = PHYSICAL_ZONES.find((z) => z.eventMetricKeys.includes(code));
            if (!matchedZone) return null;

            const cx = matchedZone.centerPoint.x;
            return (
              <g key={`alert-callout-${alert.id}`} className="animate-bounce">
                {/* Leader line from conveyor to event tag */}
                <line x1={cx} y1="125" x2={cx} y2="60" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                <rect x={cx - 50} y="40" width="100" height="20" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" rx="2" />
                <text x={cx} y="53" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                  ● ACTIVE {alert.metric?.toUpperCase()} EVENT
                </text>
              </g>
            );
          })}

          {/* Sensor Hotspot Markers */}
          {SENSOR_HOTSPOTS.map((hotspot) => {
            const val = Number(telemetry[hotspot.metric] ?? 0);
            const sigInfo = getSignalStatus(hotspot.metric, val);
            const colors = getSeverityColors(sigInfo.status, false);
            const isHovered = activeTooltipCode === hotspot.code;
            const isZoneSelected = selectedZoneId === hotspot.primaryZoneId;

            const cx = (hotspot.x / 100) * 920 + 40;
            const cy = (hotspot.y / 100) * 240 + 30;

            return (
              <g
                key={hotspot.code}
                onMouseEnter={() => setActiveTooltipCode(hotspot.code)}
                onMouseLeave={() => setActiveTooltipCode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectZone(hotspot.primaryZoneId);
                }}
                className="cursor-pointer z-30 transition-transform duration-150 hover:scale-110"
              >
                {/* Leader Stem Line */}
                <line x1={cx} y1={cy} x2={cx} y2={cy + 14} stroke={colors.ring} strokeWidth="1.5" />
                <circle cx={cx} cy={cy + 14} r="3" fill={colors.ring} />

                {/* Hotspot Badge Anchor Box */}
                <rect
                  x={cx - 24}
                  y={cy - 12}
                  width="48"
                  height="18"
                  fill="#0f172a"
                  stroke={isZoneSelected ? "#ea580c" : colors.ring}
                  strokeWidth={isZoneSelected ? "2" : "1.5"}
                  rx="2"
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {hotspot.code}
                </text>

                {/* Hotspot Tooltip */}
                {isHovered && (
                  <g className="z-40">
                    <rect
                      x={cx - 65}
                      y={cy - 54}
                      width="130"
                      height="38"
                      fill="#1e293b"
                      stroke="#ea580c"
                      strokeWidth="1.5"
                      rx="2"
                    />
                    <text x={cx} y={cy - 40} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
                      {hotspot.name}
                    </text>
                    <text x={cx} y={cy - 26} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      {sigInfo.formattedValue} &nbsp;({sigInfo.status})
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Bottom Coordinate Tick Bar (0m - 100m) */}
          <g transform="translate(40, 290)">
            <line x1="0" y1="0" x2="920" y2="0" stroke="#334155" strokeWidth="1" />
            {[0, 20, 40, 60, 80, 100].map((m) => {
              const tx = (m / 100) * 920;
              return (
                <g key={`tick-${m}`}>
                  <line x1={tx} y1="0" x2={tx} y2="6" stroke="#475569" strokeWidth="1" />
                  <text x={tx} y="16" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
                    {m}m
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Asset Physical Locator Navigation Rail */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {PHYSICAL_ZONES.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          const hasEvent = zone.eventMetricKeys.some((k) => activeMetricKeys.includes(k));

          return (
            <button
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`p-2 rounded-[2px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-800 border-[var(--accent-copper)] text-white shadow-sm"
                  : "bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-[9px] w-full font-bold">
                <span className={isSelected ? "text-[var(--accent-copper)]" : "text-slate-500"}>
                  {zone.code}
                </span>
                {hasEvent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <div className="font-bold text-[10px] tracking-wider uppercase mt-1 truncate">
                {zone.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
