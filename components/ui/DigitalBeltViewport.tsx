"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * FUTURE 3D ARCHITECTURE & PERFORMANCE PRINCIPLES
 * -----------------------------------------------------------------------------
 * Render Pipeline Boundary:
 *   DigitalBeltPage -> DigitalBeltViewport -> Future3DRenderer (Lazy Loaded)
 *
 * Core Performance Rules for Future 3D Pass:
 * 1. Dynamic Lazy Loading: Import 3D canvas dynamically via `next/dynamic` with `ssr: false`.
 * 2. Demand-Based Rendering: Use `frameloop="demand"` to avoid continuous 60fps rendering loops when idle.
 * 3. Asset Optimization: Compress GLTF models using Draco/Meshopt and use KTX2/WebP textures.
 * 4. Polycount Budget: Keep geometry under tight vertex limits for industrial client hardware.
 * 5. Device Pixel Ratio Limit: Cap DPR at `Math.min(window.devicePixelRatio, 1.5)` to prevent 4K rendering lag.
 * 6. Static Fallback: Provide instantaneous 2D SVG/Image fallback for low-power mobile/legacy devices.
 * 7. Motion Accessibility: Respect `prefers-reduced-motion` settings automatically.
 * 8. Defer Asset Loading: Never load 3D bundles or assets on the main landing homepage.
 */

export interface ZoneData {
  id: string;
  name: string;
  status: string;
  description: string;
}

export const digitalBeltZones: ZoneData[] = [
  {
    id: "ZONE A",
    name: "DRIVE HEAD",
    status: "NORMAL",
    description: "Primary drive assembly, electric motor, drive pulley and gear reducer region.",
  },
  {
    id: "ZONE B",
    name: "BELT SECTION A",
    status: "NORMAL",
    description: "Troughing idlers, impact bed and primary loading zone strand.",
  },
  {
    id: "ZONE C",
    name: "MONITORED SPLICE S1",
    status: "ATTENTION",
    description: "Mechanical splice joint under active vibration and tracking monitoring.",
  },
  {
    id: "ZONE D",
    name: "BELT SECTION B / TAIL",
    status: "NORMAL",
    description: "Return strand, tail pulley assembly and gravity take-up tensioner region.",
  },
];

interface DigitalBeltViewportProps {
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
}

export default function DigitalBeltViewport({
  selectedZoneId,
  onSelectZone,
}: DigitalBeltViewportProps) {
  const [activeTab, setActiveTab] = useState<"viewport" | "schema">("viewport");

  const currentZone =
    digitalBeltZones.find((z) => z.id === selectedZoneId) || digitalBeltZones[0];

  return (
    <div className="w-full bg-white/50 backdrop-blur-xs border border-[var(--border-light)]/60 rounded-[2px] shadow-sm p-4 sm:p-6 flex flex-col space-y-4 font-mono">
      {/* Viewport Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-light)]/40 pb-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[var(--accent-copper)] animate-pulse" />
          <span className="font-semibold text-[var(--text-charcoal)]">
            CONVEYOR BC-01 // DIGITAL BELT MODEL
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-stone)] border border-[var(--border-light)]/60 rounded-[1px] text-[11px]">
          <button
            onClick={() => setActiveTab("viewport")}
            className={`px-3 py-1 rounded-[1px] font-semibold transition-colors ${
              activeTab === "viewport"
                ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                : "text-[var(--text-graphite-muted)] hover:text-[var(--text-charcoal)]"
            }`}
          >
            SPATIAL VIEW
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3 py-1 rounded-[1px] font-semibold transition-colors ${
              activeTab === "schema"
                ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)]"
                : "text-[var(--text-graphite-muted)] hover:text-[var(--text-charcoal)]"
            }`}
          >
            SCHEMATIC
          </button>
        </div>
      </div>

      {/* Main Reserved Model Viewport Canvas Frame */}
      <div className="relative w-full h-[340px] sm:h-[420px] bg-[var(--bg-stone)]/70 rounded-[1px] border border-[var(--border-light)]/40 overflow-hidden flex items-center justify-center">
        {activeTab === "viewport" ? (
          <div className="relative w-full h-full">
            <Image
              src="/images/ref_img_8.png"
              alt="Digital Belt Conveyor Spatial Viewport"
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 75vw"
              className="object-cover object-center brightness-[0.93] contrast-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-stone)]/50 via-transparent to-transparent pointer-events-none" />

            {/* Interactive Zone Hotspots */}
            <button
              onClick={() => onSelectZone("ZONE A")}
              className={`absolute top-[22%] left-[14%] px-3 py-1.5 rounded-[1px] font-mono text-[10px] font-bold flex items-center gap-2 border transition-transform ${
                selectedZoneId === "ZONE A"
                  ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)] scale-105 shadow-md"
                  : "bg-black/75 text-white border-white/20 hover:scale-105"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>ZONE A // DRIVE HEAD</span>
            </button>

            <button
              onClick={() => onSelectZone("ZONE B")}
              className={`absolute top-[44%] left-[34%] px-3 py-1.5 rounded-[1px] font-mono text-[10px] font-bold flex items-center gap-2 border transition-transform ${
                selectedZoneId === "ZONE B"
                  ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)] scale-105 shadow-md"
                  : "bg-black/75 text-white border-white/20 hover:scale-105"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>ZONE B // BELT SECTION A</span>
            </button>

            <button
              onClick={() => onSelectZone("ZONE C")}
              className={`absolute top-[38%] right-[26%] px-3.5 py-1.5 rounded-[1px] font-mono text-[10px] font-bold flex items-center gap-2 border transition-transform ${
                selectedZoneId === "ZONE C"
                  ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)] scale-105 shadow-lg"
                  : "bg-black/85 text-white border-[var(--accent-copper)] hover:scale-105"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
              <span className="text-[var(--accent-copper)] font-bold">ZONE C</span>
              <span>// MONITORED SPLICE S1</span>
            </button>

            <button
              onClick={() => onSelectZone("ZONE D")}
              className={`absolute bottom-[24%] right-[12%] px-3 py-1.5 rounded-[1px] font-mono text-[10px] font-bold flex items-center gap-2 border transition-transform ${
                selectedZoneId === "ZONE D"
                  ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)] scale-105 shadow-md"
                  : "bg-black/75 text-white border-white/20 hover:scale-105"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>ZONE D // BELT SECTION B / TAIL</span>
            </button>
          </div>
        ) : (
          /* SVG Blueprint Technical Schematic View */
          <svg
            className="w-full h-full p-4"
            viewBox="0 0 900 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="50" y1="150" x2="850" y2="150" stroke="var(--text-charcoal)" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.2" />
            <path d="M 100 110 H 800 C 830 110, 830 190, 800 190 H 100 C 70 190, 70 110, 100 110 Z" stroke="var(--text-charcoal)" strokeWidth="3" fill="none" />
            <path d="M 100 110 H 800 C 830 110, 830 190, 800 190 H 100 C 70 190, 70 110, 100 110 Z" stroke="var(--accent-copper)" strokeWidth="1.5" strokeDasharray="12 8" fill="none" opacity="0.8" />
            
            <circle cx="100" cy="150" r="35" stroke="var(--text-charcoal)" strokeWidth="3" fill="var(--bg-stone)" />
            <circle cx="800" cy="150" r="35" stroke="var(--text-charcoal)" strokeWidth="3" fill="var(--bg-stone)" />
            
            <text x="70" y="60" fill="var(--text-graphite-muted)" fontSize="10" fontFamily="monospace">ZONE A // DRIVE</text>
            <text x="320" y="60" fill="var(--text-graphite-muted)" fontSize="10" fontFamily="monospace">ZONE B // STRAND A</text>
            <text x="580" y="60" fill="var(--accent-copper)" fontSize="10" fontFamily="monospace" fontWeight="bold">ZONE C // SPLICE S1</text>
            <text x="740" y="60" fill="var(--text-graphite-muted)" fontSize="10" fontFamily="monospace">ZONE D // TAIL</text>
          </svg>
        )}
      </div>

      {/* Selected Zone Summary Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-[var(--border-light)]/40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--accent-copper)]">{currentZone.id}</span>
          <span className="font-bold text-[var(--text-charcoal)]">{currentZone.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-[1px] bg-emerald-500/15 text-emerald-700 font-semibold">
            {currentZone.status}
          </span>
        </div>
        <p className="font-sans text-xs text-[var(--text-graphite-muted)] font-light max-w-lg">
          {currentZone.description}
        </p>
      </div>
    </div>
  );
}
