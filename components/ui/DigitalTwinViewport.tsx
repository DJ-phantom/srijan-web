"use client";

import { useRef } from "react";

export interface HotspotData {
  id: string;
  label: string;
  title: string;
  location: string;
  zone: string;
  description: string;
  xPercent: number;
  yPercent: number;
}

export const digitalTwinHotspots: HotspotData[] = [
  {
    id: "T-01",
    label: "TEMP",
    title: "TEMPERATURE SENSOR",
    location: "DRIVE ASSEMBLY",
    zone: "ZONE A",
    description: "Monitors thermal behavior around primary drive bearings and gearbox.",
    xPercent: 14,
    yPercent: 36,
  },
  {
    id: "V-02",
    label: "VIB",
    title: "VIBRATION SENSOR",
    location: "DRIVE ASSEMBLY",
    zone: "ZONE A",
    description: "Monitors mechanical vibration signatures for early bearing anomaly detection.",
    xPercent: 24,
    yPercent: 62,
  },
  {
    id: "M-01",
    label: "CURRENT",
    title: "MOTOR CURRENT",
    location: "MOTOR CONTROLLER",
    zone: "ZONE A",
    description: "Tracks electrical current draw to evaluate motor load & resistance.",
    xPercent: 34,
    yPercent: 30,
  },
  {
    id: "S-01",
    label: "SPEED",
    title: "TACHOMETER IDLER",
    location: "MIDSPAN CONVEYOR",
    zone: "ZONE B",
    description: "Measures rotational speed and rotational belt speed correlation.",
    xPercent: 50,
    yPercent: 65,
  },
  {
    id: "A-01",
    label: "ALIGN",
    title: "ALIGNMENT SENSOR",
    location: "MIDSPAN BELT EDGE",
    zone: "ZONE B",
    description: "Monitors lateral tracking drift along primary conveyor strand.",
    xPercent: 64,
    yPercent: 28,
  },
  {
    id: "L-01",
    label: "LOAD",
    title: "LOAD / TENSION",
    location: "GRAVITY TAKE-UP",
    zone: "ZONE C",
    description: "Estimates belt tension and gravity weight distribution.",
    xPercent: 78,
    yPercent: 68,
  },
  {
    id: "C-01",
    label: "VISION",
    title: "CAMERA INSPECTION",
    location: "DISCHARGE FRAME",
    zone: "ZONE D",
    description: "High-resolution optical inspection for surface anomalies and material flow.",
    xPercent: 90,
    yPercent: 32,
  },
];

export const conveyorZones = [
  { id: "ZONE A", name: "DRIVE ASSEMBLY", startPercent: 10, endPercent: 38 },
  { id: "ZONE B", name: "MIDSPAN CONVEYOR", startPercent: 38, endPercent: 70 },
  { id: "ZONE C", name: "GRAVITY TAKE-UP", startPercent: 70, endPercent: 84 },
  { id: "ZONE D", name: "DISCHARGE CHUTE", startPercent: 84, endPercent: 95 },
];

interface DigitalTwinViewportProps {
  activeHotspotIndex: number;
  selectedHotspotIndex: number | null;
  onSelectHotspot: (index: number | null) => void;
  cameraParallaxX?: number; // Slight horizontal shift for simulated camera depth
}

/**
 * DigitalTwinViewport: Modular 2.5D Technical Conveyor Visualizer.
 *
 * FUTURE 3D REPLACEMENT POINT:
 * To replace this 2.5D SVG/CSS view with a full 3D model (Spline / React Three Fiber / Three.js),
 * swap this single component file without altering DigitalTwinSection logic or text architecture.
 */
export default function DigitalTwinViewport({
  activeHotspotIndex,
  selectedHotspotIndex,
  onSelectHotspot,
  cameraParallaxX = 0,
}: DigitalTwinViewportProps) {
  const currentIdx = selectedHotspotIndex !== null ? selectedHotspotIndex : activeHotspotIndex;
  const currentHotspot = digitalTwinHotspots[currentIdx];

  return (
    <div className="relative w-full py-8 my-4 bg-white/40 backdrop-blur-xs border border-[var(--border-light)]/50 rounded-[4px] shadow-sm p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Viewport Top Bar: Asset Identity & Zone Legend */}
      <div className="w-full mb-6 pb-4 border-b border-[var(--border-light)]/40 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-copper)] animate-pulse" />
          <span className="font-semibold uppercase text-[var(--text-charcoal)]">
            ASSET BC-01 // DIGITAL TWIN MODEL
          </span>
        </div>

        {/* Conveyor Location Zones Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-graphite-muted)] uppercase">
          {conveyorZones.map((zone) => {
            const isZoneActive = currentHotspot.zone === zone.id;
            return (
              <span
                key={zone.id}
                className={`transition-colors duration-300 ${
                  isZoneActive
                    ? "text-[var(--accent-copper)] font-semibold"
                    : "opacity-60"
                }`}
              >
                {zone.id}: {zone.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* 2.5D Pseudo-Isometric Technical Canvas */}
      <div className="relative w-full h-[320px] sm:h-[380px] my-2 overflow-hidden rounded-[2px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/30 flex items-center justify-center">
        {/* Isometric 2.5D Transformed Container */}
        <div
          style={{
            transform: `perspective(1200px) rotateX(14deg) rotateY(-6deg) translateX(${cameraParallaxX}px)`,
          }}
          className="relative w-full h-full transition-transform duration-700 ease-out flex items-center justify-center"
        >
          {/* SVG 2.5D Conveyor Structural Blueprint */}
          <svg
            className="w-full h-full p-4"
            viewBox="0 0 1000 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Engineering Grid Underlay */}
            <line x1="50" y1="160" x2="950" y2="160" stroke="var(--text-charcoal)" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.15" />
            <line x1="50" y1="230" x2="950" y2="230" stroke="var(--text-charcoal)" strokeWidth="1" strokeDasharray="4 4" opacity="0.1" />

            {/* Zone Divider Dashed Lines */}
            <line x1="360" y1="60" x2="360" y2="260" stroke="var(--accent-copper)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <line x1="680" y1="60" x2="680" y2="260" stroke="var(--accent-copper)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <line x1="820" y1="60" x2="820" y2="260" stroke="var(--accent-copper)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

            {/* Zone Labels directly on blueprint */}
            <text x="70" y="80" fill="var(--text-graphite-muted)" fontSize="10" fontFamily="monospace" letterSpacing="1.5" opacity="0.6">
              ZONE A // DRIVE ASSEMBLY
            </text>
            <text x="380" y="80" fill="var(--text-graphite-muted)" fontSize="10" fontFamily="monospace" letterSpacing="1.5" opacity="0.6">
              ZONE B // MIDSPAN CONVEYOR
            </text>
            <text x="700" y="80" fill="var(--text-graphite-muted)" fontSize="10" fontFamily="monospace" letterSpacing="1.5" opacity="0.6">
              ZONE C
            </text>
            <text x="840" y="80" fill="var(--text-graphite-muted)" fontSize="10" fontFamily="monospace" letterSpacing="1.5" opacity="0.6">
              ZONE D
            </text>

            {/* Conveyor Main Truss & Belt Structure */}
            {/* Top & Bottom Strands */}
            <path
              d="M 120 120 H 880 C 915 120, 915 200, 880 200 H 120 C 85 200, 85 120, 120 120 Z"
              stroke="var(--text-charcoal)"
              strokeWidth="4.5"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M 120 120 H 880 C 915 120, 915 200, 880 200 H 120 C 85 200, 85 120, 120 120 Z"
              stroke="var(--accent-copper)"
              strokeWidth="1.5"
              strokeDasharray="14 10"
              fill="none"
              opacity="0.7"
            />

            {/* Structural Steel Truss Bracing */}
            <path d="M 140 120 L 180 200 M 180 120 L 220 200 M 220 120 L 260 200 M 260 120 L 300 200 M 300 120 L 340 200 M 340 120 L 380 200 M 380 120 L 420 200 M 420 120 L 460 200 M 460 120 L 500 200 M 500 120 L 540 200 M 540 120 L 580 200 M 580 120 L 620 200 M 620 120 L 660 200 M 660 120 L 700 200 M 700 120 L 740 200 M 740 120 L 780 200 M 780 120 L 820 200 M 820 120 L 860 200" stroke="var(--text-charcoal)" strokeWidth="1" opacity="0.25" />

            {/* Head & Tail Pulleys */}
            <circle cx="120" cy="160" r="40" stroke="var(--text-charcoal)" strokeWidth="3.5" fill="var(--bg-stone)" />
            <circle cx="120" cy="160" r="16" stroke="var(--accent-copper)" strokeWidth="2" fill="none" />

            <circle cx="880" cy="160" r="40" stroke="var(--text-charcoal)" strokeWidth="3.5" fill="var(--bg-stone)" />
            <circle cx="880" cy="160" r="16" stroke="var(--accent-copper)" strokeWidth="2" fill="none" />

            {/* Carrying Rollers */}
            {[200, 300, 400, 500, 600, 700, 800].map((cx, i) => (
              <g key={`tw-idler-${i}`}>
                <circle cx={cx} cy="120" r="11" stroke="var(--text-charcoal)" strokeWidth="1.5" fill="var(--bg-stone)" />
                <line x1={cx} y1="131" x2={cx} y2="160" stroke="var(--border-light)" strokeWidth="1" />
              </g>
            ))}

            {/* Motor Drive Enclosure (Left) */}
            <rect x="45" y="130" width="45" height="60" rx="3" stroke="var(--text-charcoal)" strokeWidth="2.5" fill="var(--bg-stone)" />
            <path d="M 55 145 H 80 M 55 155 H 80 M 55 165 H 80 M 55 175 H 80" stroke="var(--text-graphite-muted)" strokeWidth="1.5" />

            {/* Discharge Camera Frame Structure (Right) */}
            <path d="M 890 50 V 120 M 930 50 V 120 M 880 50 H 940" stroke="var(--text-charcoal)" strokeWidth="2" />
            <rect x="905" y="45" width="20" height="15" rx="1" fill="var(--accent-copper)" />
          </svg>

          {/* Render 7 Interactive Hotspots Over 2.5D Canvas */}
          {digitalTwinHotspots.map((hotspot, index) => {
            const isSelected = currentIdx === index;

            return (
              <button
                key={hotspot.id}
                onClick={() => onSelectHotspot(index)}
                onMouseEnter={() => onSelectHotspot(index)}
                onMouseLeave={() => onSelectHotspot(null)}
                aria-label={`Hotspot ${hotspot.id} ${hotspot.title}`}
                style={{
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus:outline-none z-20 transition-transform duration-300 ${
                  isSelected ? "scale-110 z-30" : "hover:scale-105"
                }`}
              >
                {/* Hotspot Target Dot */}
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                    isSelected
                      ? "bg-[var(--accent-copper)] border-[var(--accent-copper)] text-white shadow-[0_0_16px_rgba(200,90,50,0.6)]"
                      : "bg-white/90 border-[var(--text-charcoal)]/50 text-[var(--text-charcoal)] group-hover:border-[var(--accent-copper)]"
                  }`}
                >
                  <span className="font-mono text-[9px] font-bold">
                    {hotspot.id}
                  </span>
                </div>

                {/* Hotspot Label Tag */}
                <div
                  className={`mt-1 px-2 py-0.5 rounded-[2px] font-mono text-[9px] font-semibold tracking-wider uppercase transition-all duration-300 ${
                    isSelected
                      ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)] shadow-sm"
                      : "bg-white/80 text-[var(--text-graphite-muted)] border border-[var(--border-light)] group-hover:text-[var(--text-charcoal)]"
                  }`}
                >
                  {hotspot.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Hotspot Metadata Annotation Overlay Panel */}
      <div className="w-full mt-4 p-4 rounded-[2px] bg-[var(--bg-stone-surface)] border border-[var(--border-light)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)] text-white font-bold text-[11px]">
            {currentHotspot.id}
          </span>
          <div>
            <span className="font-heading text-base font-bold text-[var(--text-charcoal)]">
              {currentHotspot.title}
            </span>
            <span className="ml-2 text-[var(--text-graphite-muted)] opacity-70">
              [{currentHotspot.zone} // {currentHotspot.location}]
            </span>
          </div>
        </div>

        <p className="font-sans text-xs text-[var(--text-graphite-muted)] font-light max-w-md">
          {currentHotspot.description}
        </p>
      </div>
    </div>
  );
}
