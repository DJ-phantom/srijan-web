"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import Container from "@/components/layout/Container";
import Header from "@/components/layout/Header";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

interface StoryCarouselProps {
  activeSlide: number;
  onSlideChange: (index: number) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

const TOTAL_SLIDES = 6;

const slidesData = [
  {
    id: 0,
    numberLabel: "01",
    sectionTag: "INTRO",
    eyebrow: "01 / INTRO",
    headlineLine1: "Detect Change.",
    headlineLine2: "Understand Risk.",
    headlineLine3: "Act Before Downtime.",
    copy: "Conveyor condition monitoring and anomaly detection designed to turn machine signals into early warnings, spatial clarity, and operator decision support.",
    bgImage: "/images/golden_hour_ore_conveyer_minescape.png",
    alt: "Golden hour iron-ore conveyor mining infrastructure",
    primaryCtaText: "EXPLORE PLATFORM →",
    secondaryCtaText: "WATCH SYSTEM DEMO",
  },
  {
    id: 1,
    numberLabel: "02",
    sectionTag: "THE PROBLEM",
    eyebrow: "02 / THE PROBLEM",
    headlineLine1: "Failures Rarely Happen",
    headlineLine2: "Without Warning.",
    headlineLine3: "They Begin as Signals.",
    copy: "Temperature rises. Vibration patterns change. Alignment drifts. Motor load increases. Splice-related vibration and alignment patterns begin to deviate.",
    bgImage: "/images/splice_ref_img_1.png",
    alt: "Conveyor mechanical joint splice detailed photographic crop",
    primaryCtaText: "SEE MONITORING →",
    secondaryCtaText: null,
  },
  {
    id: 2,
    numberLabel: "03",
    sectionTag: "MONITORING",
    eyebrow: "03 / MONITORING",
    headlineLine1: "See the Conveyor",
    headlineLine2: "as It Operates.",
    headlineLine3: "",
    copy: "Multiple operating signals provide a continuous view of conveyor condition across 6 monitored signal channels.",
    bgImage: "/images/monitoring_section_ref_img.png",
    alt: "Industrial Conveyor Multi-Sensor Sensing Infrastructure",
    primaryCtaText: "SEE INTELLIGENCE →",
    secondaryCtaText: null,
  },
  {
    id: 3,
    numberLabel: "04",
    sectionTag: "INTELLIGENCE",
    eyebrow: "04 / INTELLIGENCE",
    headlineLine1: "From Raw Signals",
    headlineLine2: "",
    headlineLine3: "to Condition Insight.",
    copy: "The platform compares multi-sensor behaviour, condition rules and anomaly patterns to identify operating changes that deserve attention.",
    bgImage: "/images/intelligence_clean_ref.png",
    alt: "Condition Intelligence environment and multi-sensor assessment visual",
    primaryCtaText: "SEE ALERTS →",
    secondaryCtaText: null,
  },
  {
    id: 4,
    numberLabel: "05",
    sectionTag: "ALERTS & RESPONSE",
    eyebrow: "05 / ALERTS & RESPONSE",
    headlineLine1: "From Detection",
    headlineLine2: "",
    headlineLine3: "to Action.",
    copy: "When abnormal behaviour appears, the platform brings together condition evidence, severity and monitored component context so operators can quickly understand what needs attention.",
    bgImage: "/images/alerts_clean_ref.png",
    alt: "Industrial Conveyor Belt Tracking and Alert Response Infrastructure",
    primaryCtaText: "EXPLORE DIGITAL BELT →",
    secondaryCtaText: null,
  },
  {
    id: 5,
    numberLabel: "06",
    sectionTag: "DIGITAL BELT",
    eyebrow: "06 / DIGITAL BELT",
    headlineLine1: "One System.",
    headlineLine2: "",
    headlineLine3: "One Living View.",
    copy: "The Digital Belt connects condition data with monitored conveyor components, giving operators one spatial view of system health and context.",
    bgImage: "/images/ref_img_8.png",
    alt: "Digital Belt Spatial Conveyor Architecture",
    primaryCtaText: "EXPLORE DIGITAL BELT →",
    secondaryCtaText: null,
  },
];

const problemSignals = [
  { id: "01", title: "EXCESS VIBRATION", desc: "Mechanical behaviour deviation", isSplice: false },
  { id: "02", title: "BELT MISALIGNMENT", desc: "Lateral tracking drift", isSplice: false },
  { id: "03", title: "SPLICE DEGRADATION", desc: "Monitored joint behaviour", isSplice: true },
  { id: "04", title: "ABNORMAL TEMPERATURE", desc: "Thermal / friction increase", isSplice: false },
  { id: "05", title: "MOTOR LOAD VARIATION", desc: "Operating resistance shift", isSplice: false },
];

const monitoringChannels = [
  { id: "01", title: "TEMPERATURE", unit: "°C", isFocus: false },
  { id: "02", title: "VIBRATION", unit: "g", isFocus: true },
  { id: "03", title: "MOTOR CURRENT", unit: "A", isFocus: false },
  { id: "04", title: "BELT SPEED", unit: "m/s", isFocus: false },
  { id: "05", title: "ALIGNMENT", unit: "mm", isFocus: false },
  { id: "06", title: "LOAD", unit: "t/h", isFocus: false },
];

const intelligenceSteps = [
  { step: "01", title: "TELEMETRY", desc: "Incoming six-channel values", isHighlight: false },
  { step: "02", title: "CONTEXT", desc: "Rules & baseline", isHighlight: false },
  { step: "03", title: "DETECT", desc: "Pattern deviation", isHighlight: true },
  { step: "04", title: "ASSESS", desc: "Condition evidence", isHighlight: true },
  { step: "05", title: "SURFACE", desc: "Operator presentation", isHighlight: false },
];

function IntelligenceAnalysisPanel({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const path = containerRef.current.querySelector<SVGPathElement>(".signal-path");
    const marker = containerRef.current.querySelector<SVGGElement>(".deviation-marker");
    const label = containerRef.current.querySelector<SVGGElement>(".deviation-label");
    const highlightArea = containerRef.current.querySelector<SVGPathElement>(".deviation-area");

    if (!path) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.6,
        defaults: { ease: "power2.inOut" },
      });

      // Reset initial states
      gsap.set(marker, { opacity: 0, scale: 0, transformOrigin: "270px 8px" });
      gsap.set(label, { opacity: 0, y: 4 });
      if (highlightArea) gsap.set(highlightArea, { opacity: 0 });

      // Phase 1: Signal enters normal band & progresses
      tl.fromTo(
        path,
        { strokeDashoffset: 450 },
        { strokeDashoffset: 0, duration: 2.2, ease: "sine.inOut" }
      )
        // Phase 2 & 3: Highlight area & copper marker pulse at deviation peak
        .to(highlightArea, { opacity: 0.3, duration: 0.4 }, "-=0.7")
        .to(marker, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, "-=0.4")
        // Phase 4: Label DEVIATION DETECTED appears
        .to(label, { opacity: 1, y: 0, duration: 0.35 }, "-=0.15");
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white/75 backdrop-blur-xs rounded-[2px] border border-[var(--border-light)]/80 p-2.5 overflow-hidden shadow-2xs"
    >
      <div className="flex items-center justify-between mb-1.5 font-mono text-[9.5px] text-[var(--text-graphite-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-0.5 bg-[var(--text-charcoal)]/40" />
          <span>EXPECTED OPERATING ENVELOPE</span>
        </span>
        <span className="flex items-center gap-1.5 text-[var(--accent-copper)] font-semibold">
          <span className="w-2 h-0.5 bg-[var(--accent-copper)]" />
          <span>OBSERVED SIGNAL BEHAVIOUR</span>
        </span>
      </div>

      <div className="relative w-full h-[64px]">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 440 60"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Shaded Expected Operating Envelope */}
          <rect
            x="0"
            y="18"
            width="440"
            height="24"
            fill="var(--text-charcoal)"
            fillOpacity="0.04"
            rx="1"
          />
          {/* Upper Envelope Boundary Line */}
          <line
            x1="0"
            y1="18"
            x2="440"
            y2="18"
            stroke="var(--text-charcoal)"
            strokeOpacity="0.2"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          {/* Center Baseline */}
          <line
            x1="0"
            y1="30"
            x2="440"
            y2="30"
            stroke="var(--text-charcoal)"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          {/* Lower Envelope Boundary Line */}
          <line
            x1="0"
            y1="42"
            x2="440"
            y2="42"
            stroke="var(--text-charcoal)"
            strokeOpacity="0.2"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Deviation Highlight Region under peak */}
          <path
            className="deviation-area"
            d="M 220 18 Q 270 4, 320 18 Z"
            fill="var(--accent-copper)"
            fillOpacity="0.25"
          />

          {/* Signal Path with strokeDasharray for smooth entry */}
          <path
            className="signal-path"
            d="M 0 30 C 60 27, 120 33, 180 30 C 210 28, 235 14, 270 8 C 305 3, 330 28, 370 30 L 440 30"
            stroke="var(--accent-copper)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="450"
            strokeDashoffset="0"
          />

          {/* Copper Marker at Deviation Peak (270, 8) */}
          <g className="deviation-marker">
            <circle cx="270" cy="8" r="3.5" fill="var(--accent-copper)" />
            <circle cx="270" cy="8" r="7" stroke="var(--accent-copper)" strokeWidth="1" opacity="0.6" />
            <line x1="270" y1="12" x2="270" y2="30" stroke="var(--accent-copper)" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          {/* Label Callout */}
          <g className="deviation-label">
            <rect
              x="280"
              y="1"
              width="135"
              height="18"
              rx="2"
              fill="var(--bg-stone)"
              stroke="var(--accent-copper)"
              strokeWidth="1"
            />
            <text
              x="286"
              y="13"
              fill="var(--accent-copper)"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              DEVIATION DETECTED
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

const alertWorkflowSteps = [
  { step: "01", title: "ACKNOWLEDGE", desc: "Review alert, severity and supporting telemetry." },
  { step: "02", title: "INSPECT", desc: "Inspect the indicated component and verify the observed condition." },
  { step: "03", title: "ACT", desc: "Perform recommended inspection or corrective action." },
  { step: "04", title: "VERIFY", desc: "Confirm telemetry recovery and resolve event." },
];

function AlertEventPanel({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      const eventCard = containerRef.current?.querySelector(".event-card");
      const workflowStrip = containerRef.current?.querySelector(".workflow-strip");

      if (eventCard) gsap.set(eventCard, { opacity: 0, y: 12 });
      if (workflowStrip) gsap.set(workflowStrip, { opacity: 0, y: 8 });

      if (eventCard) {
        tl.to(eventCard, { opacity: 1, y: 0, duration: 0.5 }, 0.2);
      }

      if (workflowStrip) {
        tl.to(workflowStrip, { opacity: 1, y: 0, duration: 0.4 }, 0.5);
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={containerRef} className="w-full space-y-2.5 font-sans">
      {/* Primary HTML Event Panel */}
      <div className="event-card relative p-3.5 bg-white/85 backdrop-blur-xs border-l-2 border-l-[var(--accent-copper)] border border-[var(--border-light)]/80 rounded-[2px] shadow-2xs space-y-2.5">
        {/* Top Metadata Row: Status Badge + Monitored Component */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2">
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 bg-[var(--accent-copper)]/15 border border-[var(--accent-copper)]/30 text-[var(--accent-copper)] font-bold uppercase rounded-[1px]">
              WARNING // ATTENTION REQUIRED
            </span>
            <span className="text-[var(--text-graphite-muted)] font-medium uppercase tracking-wider">
              PROTOTYPE EVENT
            </span>
          </div>

          <div className="font-mono text-[9.5px] text-[var(--text-graphite-muted)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
            <span className="font-bold text-[var(--text-charcoal)] uppercase">BELT SECTION B / TRACKING</span>
          </div>
        </div>

        {/* Event Title & Summary */}
        <div>
          <h4 className="font-mono text-xs sm:text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-wide">
            BELT MISALIGNMENT TREND
          </h4>
          <p className="text-[11px] sm:text-[11.5px] text-[var(--text-graphite-muted)] leading-relaxed mt-0.5">
            Alignment telemetry indicates lateral belt drift beyond the configured prototype threshold.
          </p>
        </div>

        {/* Compact Observed vs Threshold Evidence Box */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-[var(--bg-stone)]/50 border border-[var(--border-light)]/50 rounded-[1px] font-mono text-[10.5px]">
          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
              OBSERVED ALIGNMENT
            </span>
            <span className="text-[12px] font-bold text-[var(--accent-copper)]">
              +3.8 mm
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
              CONFIGURED THRESHOLD
            </span>
            <span className="text-[12px] font-bold text-[var(--text-charcoal)]">
              2.5 mm
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-[var(--border-light)]/40 pt-1 sm:pt-0 sm:pl-2">
            <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
              CONDITION
            </span>
            <span className="text-[10px] font-bold text-[var(--accent-copper)] uppercase">
              LATERAL DRIFT
            </span>
          </div>
        </div>

        {/* Recommended Operator Action */}
        <div className="pt-0.5 border-t border-[var(--border-light)]/30">
          <span className="font-mono text-[9px] font-bold text-[var(--accent-copper)] uppercase block">
            RECOMMENDED OPERATOR ACTION:
          </span>
          <p className="text-[10.5px] text-[var(--text-charcoal)] leading-tight mt-0.5">
            Inspect belt tracking and idler alignment; verify the alignment sensor before corrective adjustment.
          </p>
        </div>
      </div>

      {/* Operator Workflow Strip */}
      <div className="workflow-strip p-2 bg-white/60 backdrop-blur-xs border border-[var(--border-light)]/70 rounded-[2px]">
        <div className="text-[9.5px] font-mono text-[var(--text-graphite-muted)] uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
          <span>OPERATOR RESPONSE WORKFLOW</span>
          <span className="text-[var(--accent-copper)] font-bold">4-STEP ACTION</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
          {alertWorkflowSteps.map((wf) => (
            <div
              key={wf.step}
              className="group relative p-1.5 rounded-[1px] bg-white/70 border border-[var(--border-light)]/60 hover:border-[var(--accent-copper)] transition-colors cursor-help"
            >
              <div className="flex items-center gap-1">
                <span className="text-[var(--accent-copper)] font-bold">{wf.step}</span>
                <span className="font-semibold text-[var(--text-charcoal)] truncate">{wf.title}</span>
              </div>
              {/* Micro tooltip on hover */}
              <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 z-30 w-44 p-1.5 bg-[var(--text-charcoal)] text-[var(--bg-stone)] text-[9px] font-sans rounded-[2px] shadow-md pointer-events-none">
                {wf.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const spatialZones = [
  {
    id: "ZONE A",
    title: "DRIVE HEAD",
    sub: "Drive Motor & Speed",
    isFocus: false,
    sensors: ["M-01 CURRENT", "S-01 SPEED", "T-01 TEMP"],
    desc: "Motor current, drive speed, and thermal friction context.",
  },
  {
    id: "ZONE B",
    title: "BELT SECTION A",
    sub: "General Belt Segment",
    isFocus: false,
    sensors: ["A-01 ALIGNMENT", "L-01 LOAD"],
    desc: "General belt tracking and return idler behaviour.",
  },
  {
    id: "ZONE C",
    title: "MONITORED SPLICE S1",
    sub: "Monitored Joint Focus",
    isFocus: true,
    sensors: ["V-02 VIBRATION", "A-01 ALIGNMENT"],
    desc: "Joint-focused vibration + alignment behaviour monitored around the reference splice.",
  },
  {
    id: "ZONE D",
    title: "BELT SECTION B / TAIL",
    sub: "Tail Pulley & Tension",
    isFocus: false,
    sensors: ["A-01 ALIGNMENT", "S-01 SPEED"],
    desc: "Tail pulley tension, tracking drift, and loading zone context.",
  },
];

const activeSensorLegend = [
  "T-01 TEMP",
  "V-02 VIBRATION",
  "M-01 CURRENT",
  "S-01 SPEED",
  "A-01 ALIGNMENT",
  "L-01 LOAD",
];

function DigitalBeltSpatialPanel({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("ZONE C");

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      const pathLine = containerRef.current?.querySelector<SVGPathElement>(".path-line");
      const zoneNodes = containerRef.current?.querySelectorAll(".zone-node");
      const detailCard = containerRef.current?.querySelector(".selected-detail-card");

      if (pathLine) gsap.set(pathLine, { strokeDashoffset: 400 });
      if (zoneNodes) gsap.set(zoneNodes, { opacity: 0, y: 6 });
      if (detailCard) gsap.set(detailCard, { opacity: 0, y: 10 });

      // Sequence: Path line -> nodes reveal -> detail card
      if (pathLine) {
        tl.to(pathLine, { strokeDashoffset: 0, duration: 0.7, ease: "sine.inOut" }, 0.1);
      }
      if (zoneNodes) {
        tl.to(zoneNodes, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.4);
      }
      if (detailCard) {
        tl.to(detailCard, { opacity: 1, y: 0, duration: 0.45 }, 0.7);
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [active]);

  if (!active) return null;

  const currentZone =
    spatialZones.find((z) => z.id === selectedZoneId) || spatialZones[2];

  return (
    <div ref={containerRef} className="w-full space-y-2.5 font-sans">
      {/* Micro Concept Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9.5px] text-[var(--text-graphite-muted)] uppercase tracking-wider font-semibold">
        <span className="flex items-center gap-1.5">
          <span>CONDITION DATA</span>
          <span className="opacity-40">→</span>
          <span>COMPONENT CONTEXT</span>
          <span className="opacity-40">→</span>
          <span className="text-[var(--accent-copper)] font-bold">SPATIAL VIEW</span>
        </span>
        <span className="hidden sm:inline text-[9px] text-[var(--text-charcoal)] font-bold">
          CONVEYOR LINE BC-01
        </span>
      </div>

      {/* Spatial Conveyor Path Container */}
      <div className="p-2.5 bg-white/80 backdrop-blur-xs border border-[var(--border-light)]/80 rounded-[2px] shadow-2xs space-y-2.5">
        {/* Desktop / Tablet Horizontal Engineering Conveyor Line */}
        <div className="hidden sm:block relative w-full pt-1 pb-1">
          {/* Connecting Line SVG */}
          <div className="absolute top-[17px] left-[8%] right-[8%] h-[2px] pointer-events-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 2" preserveAspectRatio="none">
              <line x1="0" y1="1" x2="100" y2="1" stroke="var(--border-light)" strokeWidth="1.5" />
              <line
                className="path-line"
                x1="0"
                y1="1"
                x2="100"
                y2="1"
                stroke="var(--accent-copper)"
                strokeWidth="2"
                strokeDasharray="100"
                strokeDashoffset="0"
              />
            </svg>
          </div>

          {/* 4 Conveyor Nodes */}
          <div className="grid grid-cols-4 gap-2 relative z-10">
            {spatialZones.map((zn) => {
              const isSelected = zn.id === selectedZoneId;
              const isSplice = zn.isFocus;
              return (
                <button
                  key={zn.id}
                  onMouseEnter={() => setSelectedZoneId(zn.id)}
                  onClick={() => setSelectedZoneId(zn.id)}
                  className={`zone-node flex flex-col items-center text-center p-1.5 rounded-[2px] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border border-[var(--accent-copper)] shadow-2xs"
                      : "bg-white/40 border border-transparent hover:bg-white/70"
                  }`}
                >
                  {/* Node Dot / Ring */}
                  <div className="relative mb-1 flex items-center justify-center">
                    <div
                      className={`w-3 h-3 rounded-full transition-transform ${
                        isSplice
                          ? "bg-[var(--accent-copper)] ring-4 ring-[var(--accent-copper)]/20"
                          : isSelected
                          ? "bg-[var(--text-charcoal)] ring-2 ring-[var(--text-charcoal)]/20"
                          : "bg-[var(--text-graphite-muted)]/40"
                      }`}
                    />
                    {isSplice && (
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[var(--accent-copper)] opacity-75" />
                    )}
                  </div>

                  <span
                    className={`font-mono text-[9px] font-bold uppercase ${
                      isSplice ? "text-[var(--accent-copper)]" : "text-[var(--text-charcoal)]"
                    }`}
                  >
                    {zn.id}
                  </span>
                  <span
                    className={`font-sans text-[10px] uppercase font-semibold leading-tight mt-0.5 truncate max-w-full ${
                      isSplice ? "text-[var(--accent-copper)] font-bold" : "text-[var(--text-charcoal)]"
                    }`}
                  >
                    {zn.title}
                  </span>
                  {isSplice && (
                    <span className="mt-1 px-1 py-0.2 bg-[var(--accent-copper)]/15 text-[8px] font-mono font-bold text-[var(--accent-copper)] uppercase rounded-[1px]">
                      MONITORED
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Conveyor Path Stack */}
        <div className="block sm:hidden space-y-1.5 font-mono text-[10px]">
          {spatialZones.map((zn) => {
            const isSelected = zn.id === selectedZoneId;
            const isSplice = zn.isFocus;
            return (
              <button
                key={zn.id}
                onClick={() => setSelectedZoneId(zn.id)}
                className={`w-full flex items-center justify-between p-2 rounded-[2px] border text-left transition-colors ${
                  isSplice
                    ? "bg-[var(--accent-copper)]/[0.08] border-[var(--accent-copper)] text-[var(--text-charcoal)] font-bold"
                    : isSelected
                    ? "bg-white border-[var(--border-light)] font-semibold"
                    : "bg-white/50 border-transparent text-[var(--text-graphite-muted)]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`text-[9px] font-bold ${
                      isSplice ? "text-[var(--accent-copper)]" : "text-[var(--accent-copper)]/80"
                    }`}
                  >
                    {zn.id}
                  </span>
                  <span className="uppercase text-[10.5px] truncate">{zn.title}</span>
                </div>
                {isSplice && (
                  <span className="px-1.5 py-0.5 bg-[var(--accent-copper)]/15 text-[8px] font-bold text-[var(--accent-copper)] uppercase rounded-[1px] shrink-0">
                    MONITORED FOCUS
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sensor Context Instrumentation Legend Strip */}
        <div className="pt-1.5 border-t border-[var(--border-light)]/40 flex flex-wrap items-center justify-between gap-1 font-mono text-[9px] text-[var(--text-graphite-muted)]">
          <span className="font-semibold text-[var(--text-charcoal)] uppercase">
            ACTIVE SENSOR CHANNELS:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {activeSensorLegend.map((s) => (
              <span key={s} className="px-1.5 py-0.2 bg-[var(--bg-stone)]/70 border border-[var(--border-light)]/50 rounded-[1px]">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Component Detail Card */}
      <div className="selected-detail-card p-2.5 bg-white/70 backdrop-blur-xs border-l-2 border-l-[var(--accent-copper)] border border-[var(--border-light)]/70 rounded-[2px] font-sans">
        <div className="flex items-center justify-between font-mono text-[9.5px] text-[var(--text-graphite-muted)] uppercase mb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-[var(--accent-copper)]">SELECTED COMPONENT:</span>
            <span className="font-semibold text-[var(--text-charcoal)]">{currentZone.id}</span>
          </span>
          {currentZone.isFocus && (
            <span className="text-[9px] text-[var(--accent-copper)] font-bold">
              PRIMARY PROJECT FOCUS
            </span>
          )}
        </div>

        <h4 className="font-mono text-xs sm:text-sm font-bold text-[var(--text-charcoal)] uppercase tracking-wide">
          {currentZone.title}
        </h4>

        <p className="text-[10.5px] text-[var(--text-graphite-muted)] leading-relaxed mt-0.5">
          {currentZone.desc}
        </p>

        <div className="mt-1.5 pt-1 border-t border-[var(--border-light)]/40 flex flex-wrap items-center gap-1.5 font-mono text-[9px]">
          <span className="text-[var(--text-graphite-muted)]">MONITORED SIGNALS:</span>
          {currentZone.sensors.map((sn) => (
            <span
              key={sn}
              className="px-1.5 py-0.2 bg-[var(--accent-copper)]/10 text-[var(--accent-copper)] font-semibold rounded-[1px]"
            >
              {sn}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const digitalBeltZones = [
  { id: "ZONE A", title: "DRIVE HEAD" },
  { id: "ZONE B", title: "BELT SECTION A" },
  { id: "ZONE C", title: "MONITORED SPLICE S1" },
  { id: "ZONE D", title: "TAIL & TENSION" },
];

export default function StoryCarousel({
  activeSlide,
  onSlideChange,
  isMenuOpen,
  onToggleMenu,
}: StoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideContentRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);

  // Touch Swipe tracking refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prevSlideRef = useRef<number>(activeSlide);

  const goToSlide = useCallback(
    (index: number) => {
      const target = (index + TOTAL_SLIDES) % TOTAL_SLIDES;
      onSlideChange(target);
    },
    [onSlideChange]
  );

  const handleNext = useCallback(() => {
    goToSlide(activeSlide + 1);
  }, [activeSlide, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(activeSlide - 1);
  }, [activeSlide, goToSlide]);

  // Keyboard Navigation: ArrowLeft / ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen) return;
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isMenuOpen]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // GSAP Transition Animation on Slide Change
  useEffect(() => {
    if (!slideContentRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background crossfade & subtle zoom
      if (bgImageRef.current) {
        tl.fromTo(
          bgImageRef.current,
          { opacity: 0.4, scale: 1.05 },
          { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
          0
        );
      }

      // Slide content mask reveal & fade-up
      const lineElements = slideContentRef.current?.querySelectorAll(
        ".line-reveal-inner"
      );
      if (lineElements && lineElements.length > 0) {
        tl.fromTo(
          lineElements,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.08, ease: "power4.out" },
          0.1
        );
      }

      // Copy & Interactive widgets fade-up
      const fadeElements = slideContentRef.current?.querySelectorAll(".fade-up-item");
      if (fadeElements && fadeElements.length > 0) {
        tl.fromTo(
          fadeElements,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.06 },
          0.3
        );
      }
    }, containerRef);

    prevSlideRef.current = activeSlide;
    return () => ctx.revert();
  }, [activeSlide]);

  const currentSlideData = slidesData[activeSlide];

  // Derive preloading image URLs (current, prev, next)
  const prevIndex = (activeSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES;
  const nextIndex = (activeSlide + 1) % TOTAL_SLIDES;
  const preloadImages = [
    slidesData[activeSlide].bgImage,
    slidesData[prevIndex].bgImage,
    slidesData[nextIndex].bgImage,
  ];

  return (
    <section
      id="main-hero-carousel"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="SRIJAN Interactive Storytelling Carousel"
      className="relative w-full h-[100svh] min-h-[660px] max-h-[1100px] overflow-hidden bg-[var(--bg-stone)] flex flex-col justify-between select-none"
    >
      {/* Hidden preloader for smooth immediate slide image swaps */}
      <div className="hidden" aria-hidden="true">
        {preloadImages.map((src) => (
          <Image key={src} src={src} alt="" width={10} height={10} priority />
        ))}
      </div>

      {/* Dominant Industrial Visual Background with Readability Gradient */}
      <div
        ref={bgImageRef}
        key={`bg-${activeSlide}`}
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
      >
        <Image
          src={currentSlideData.bgImage}
          alt={currentSlideData.alt}
          fill
          priority={activeSlide === 0}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.96] contrast-[1.03]"
        />

        {/* Readability Gradients tailored for left text contrast */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-[65%] lg:w-[48%] xl:w-[42%] bg-gradient-to-r from-[var(--bg-stone)] via-[var(--bg-stone)]/80 via-50% to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--bg-stone)] via-[var(--bg-stone)]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--bg-stone)]/60 to-transparent pointer-events-none" />

        {/* Restrained HTML Monitor Labels for Slide 04 (Desktop Only) */}
        {activeSlide === 3 && (
          <div className="hidden lg:block pointer-events-none absolute right-[8%] top-[34%] z-20 space-y-10">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-[1px] bg-[var(--bg-stone)]/85 backdrop-blur-xs border border-[var(--border-light)]/70 text-[var(--text-charcoal)] font-mono text-[9px] font-bold tracking-widest uppercase shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
              <span>ANOMALY ASSESSMENT</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-[1px] bg-[var(--bg-stone)]/85 backdrop-blur-xs border border-[var(--border-light)]/70 text-[var(--text-charcoal)] font-mono text-[9px] font-bold tracking-widest uppercase shadow-2xs translate-x-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)]" />
              <span>TREND CONTEXT</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-[1px] bg-[var(--bg-stone)]/85 backdrop-blur-xs border border-[var(--border-light)]/70 text-[var(--text-charcoal)] font-mono text-[9px] font-bold tracking-widest uppercase shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)]" />
              <span>MULTI-SENSOR VIEW</span>
            </div>
          </div>
        )}

        {/* Component Marker Overlay for Slide 05 (Desktop Only) */}
        {activeSlide === 4 && (
          <div className="hidden lg:block pointer-events-none absolute right-[15%] top-[40%] z-20">
            <div className="marker-node relative flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-copper)] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--accent-copper)]" />
              </span>

              <div className="px-3 py-2 rounded-[2px] bg-[var(--bg-stone)]/92 backdrop-blur-xs border border-[var(--border-light)]/90 text-[var(--text-charcoal)] font-mono text-[9.5px] shadow-sm">
                <div className="flex items-center gap-1.5 font-bold text-[var(--accent-copper)] uppercase text-[9px]">
                  <span>MONITORED COMPONENT</span>
                  <span className="px-1 bg-[var(--accent-copper)]/15 rounded-[1px] text-[8.5px]">PROTOTYPE</span>
                </div>
                <div className="font-bold uppercase tracking-wider text-[10.5px] mt-0.5">
                  BELT SECTION B / TRACKING
                </div>
                <div className="text-[8.5px] text-[var(--text-graphite-muted)] uppercase mt-0.5">
                  ACTIVE DEMO EVENT // LATERAL DRIFT
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Header Bar Overlay at Top of Viewport */}
      <div className="relative z-30 w-full">
        <Header
          isMenuOpen={isMenuOpen}
          onToggleMenu={onToggleMenu}
          onNavigateSlide={(index) => goToSlide(index)}
        />
      </div>

      {/* Slide Main Interactive Content Area */}
      <div
        ref={slideContentRef}
        key={`content-${activeSlide}`}
        className="relative z-20 my-auto py-4 w-full"
      >
        <Container className="flex flex-col items-start max-w-4xl">
          {/* Eyebrow & Slide Counter Label */}
          <div className="fade-up-item mb-3 flex items-center gap-3 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--accent-copper)] uppercase">
            <span>{currentSlideData.eyebrow}</span>
          </div>

          {/* Headline with Mask Reveal Lines */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem] font-bold tracking-tight leading-[0.94] text-[var(--text-charcoal)] mb-5">
            {currentSlideData.headlineLine1 && (
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform">
                  {currentSlideData.headlineLine1}
                </span>
              </div>
            )}
            {currentSlideData.headlineLine2 && (
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform text-[var(--text-charcoal)]">
                  {currentSlideData.headlineLine2}
                </span>
              </div>
            )}
            {currentSlideData.headlineLine3 && (
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform text-[var(--accent-copper)]">
                  {currentSlideData.headlineLine3}
                </span>
              </div>
            )}
          </h1>

          {/* Supporting Copy */}
          <p className="fade-up-item font-sans text-base sm:text-lg md:text-xl font-light text-[var(--text-graphite-muted)] max-w-[540px] lg:max-w-[580px] leading-relaxed mb-6">
            {currentSlideData.copy}
          </p>

          {/* SLIDE-SPECIFIC STORYTELLING WIDGETS */}

          {/* Slide 01: Refined Single Technical Micro-Strip */}
          {activeSlide === 0 && (
            <div className="fade-up-item mb-6 flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
                <span className="font-semibold text-[var(--text-charcoal)]">
                  BC-01 MONITORING ACTIVE
                </span>
              </span>
              <span className="opacity-30">//</span>
              <span>SENSE</span>
              <span className="opacity-30">→</span>
              <span>UNDERSTAND</span>
              <span className="opacity-30">→</span>
              <span>ASSESS</span>
              <span className="opacity-30">→</span>
              <span className="text-[var(--accent-copper)] font-semibold">ACT</span>
            </div>
          )}

          {/* Slide 02: Compact Engineering Signal Matrix + Process Strip */}
          {activeSlide === 1 && (
            <div className="fade-up-item w-full max-w-2xl mb-6 space-y-3 font-mono text-[11px]">
              {/* Compact Engineering Instrumentation Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-1 border-y border-[var(--border-light)]/35">
                {problemSignals.map((sig) => {
                  const isSplice = sig.isSplice;
                  return (
                    <div
                      key={sig.id}
                      className={`flex items-start justify-between p-2 rounded-[1px] transition-colors ${
                        isSplice
                          ? "bg-[var(--accent-copper)]/[0.08] border-l-2 border-[var(--accent-copper)] pl-2.5"
                          : "border-l border-[var(--border-light)]/40 pl-2 bg-white/40"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold text-[10px] ${
                              isSplice ? "text-[var(--accent-copper)]" : "text-[var(--accent-copper)]/80"
                            }`}
                          >
                            {sig.id}
                          </span>
                          <span
                            className={`font-sans text-[11px] font-semibold uppercase tracking-wider ${
                              isSplice ? "text-[var(--accent-copper)] font-bold" : "text-[var(--text-charcoal)]"
                            }`}
                          >
                            {sig.title}
                          </span>
                        </div>
                        <span className="font-sans text-[10px] font-light text-[var(--text-graphite-muted)] leading-tight">
                          {sig.desc}
                        </span>
                      </div>

                      {isSplice && (
                        <span className="text-[9px] font-bold text-[var(--accent-copper)] uppercase px-1 bg-[var(--accent-copper)]/15 rounded-[1px] shrink-0 ml-1">
                          FOCUS
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Restrained Technical Process Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] font-semibold tracking-widest text-[var(--text-charcoal)] uppercase">
                <span className="text-[var(--accent-copper)] font-bold">SENSE</span>
                <span className="opacity-30">→</span>
                <span>UNDERSTAND</span>
                <span className="opacity-30">→</span>
                <span>ASSESS</span>
                <span className="opacity-30">→</span>
                <span className="text-[var(--accent-copper)] font-bold">ACT</span>
              </div>
            </div>
          )}

          {/* Slide 03: Compact Engineering 6-Channel Legend Strip */}
          {activeSlide === 2 && (
            <div className="fade-up-item w-full max-w-xl mb-6 space-y-2.5 font-mono text-[11px]">
              <div className="text-[10px] tracking-widest text-[var(--text-graphite-muted)] uppercase font-semibold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
                <span>CONVEYOR BC-01 // 6 MONITORED SIGNAL CHANNELS</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1 border-y border-[var(--border-light)]/35">
                {monitoringChannels.map((ch) => {
                  const isFocus = ch.isFocus;
                  return (
                    <div
                      key={ch.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-[1px] transition-colors ${
                        isFocus
                          ? "bg-[var(--accent-copper)]/[0.08] border-l-2 border-[var(--accent-copper)] text-[var(--text-charcoal)] font-bold"
                          : "border-l border-[var(--border-light)]/40 bg-white/40 text-[var(--text-graphite-muted)]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`text-[10px] font-bold ${
                            isFocus ? "text-[var(--accent-copper)]" : "text-[var(--accent-copper)]/75"
                          }`}
                        >
                          {ch.id}
                        </span>
                        <span
                          className={`text-[10.5px] uppercase font-semibold tracking-wider truncate ${
                            isFocus ? "text-[var(--accent-copper)] font-bold" : "text-[var(--text-charcoal)]"
                          }`}
                        >
                          {ch.title}
                        </span>
                      </div>

                      <span className="text-[9.5px] font-mono text-[var(--text-graphite-muted)] shrink-0 ml-1">
                        [{ch.unit}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Slide 04: Restrained 5-Stage Flow + Animated Signal Analysis Panel */}
          {activeSlide === 3 && (
            <div className="fade-up-item w-full max-w-xl mb-6 space-y-3">
              {/* Micro Status Line */}
              <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-graphite-muted)] uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
                  <span>CONDITION ENGINE // PROTOTYPE ANALYSIS</span>
                </span>
                <span className="hidden sm:inline text-[9px] text-[var(--accent-copper)] font-bold">
                  MULTI-SENSOR CONTEXT
                </span>
              </div>

              {/* 5-Stage Intelligence Flow Strip */}
              <div className="grid grid-cols-5 gap-1 py-1.5 px-2 bg-white/50 backdrop-blur-xs border border-[var(--border-light)]/60 rounded-[2px]">
                {intelligenceSteps.map((st, i) => (
                  <div key={st.step} className="flex items-center gap-1 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-mono text-[9.5px] font-bold ${
                          st.isHighlight
                            ? "text-[var(--accent-copper)]"
                            : "text-[var(--accent-copper)]/70"
                        }`}
                      >
                        {st.step}
                      </span>
                      <span
                        className={`font-sans text-[10px] sm:text-[10.5px] font-semibold tracking-wider uppercase truncate ${
                          st.isHighlight
                            ? "text-[var(--accent-copper)] font-bold"
                            : "text-[var(--text-charcoal)]"
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                    {i < intelligenceSteps.length - 1 && (
                      <span className="text-[10px] font-mono text-[var(--text-graphite-muted)]/40 ml-auto shrink-0">
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Lightweight Animated Signal Analysis Panel */}
              <IntelligenceAnalysisPanel active={activeSlide === 3} />
            </div>
          )}

          {/* Slide 05: Primary Event Panel & Operator Response Workflow */}
          {activeSlide === 4 && (
            <div className="fade-up-item w-full max-w-xl mb-6">
              <AlertEventPanel active={activeSlide === 4} />
            </div>
          )}

          {/* Slide 06: Spatial Conveyor Path & Component Context */}
          {activeSlide === 5 && (
            <div className="fade-up-item w-full max-w-xl mb-6">
              <DigitalBeltSpatialPanel active={activeSlide === 5} />
            </div>
          )}

          {/* Action CTAs */}
          <div className="fade-up-item flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {activeSlide === 0 && (
              <button
                onClick={() => goToSlide(1)}
                className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
              >
                <span>{currentSlideData.primaryCtaText}</span>
              </button>
            )}

            {activeSlide > 0 && activeSlide < 5 && (
              <button
                onClick={() => goToSlide(activeSlide + 1)}
                className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
              >
                <span>{currentSlideData.primaryCtaText}</span>
              </button>
            )}

            {activeSlide === 5 && (
              <Link
                href="/digital-belt"
                className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
              >
                <span>EXPLORE DIGITAL BELT →</span>
              </Link>
            )}

            {/* Secondary CTA */}
            {currentSlideData.secondaryCtaText && activeSlide === 0 && (
              <button
                onClick={() => {
                  const el = document.getElementById("control-center-preview");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[4px] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] font-sans text-xs font-medium tracking-wide transition-colors duration-200 cursor-pointer"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full border border-[var(--border-light)] group-hover:border-[var(--accent-copper)]">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
                <span>{currentSlideData.secondaryCtaText}</span>
              </button>
            )}

            {activeSlide === 5 && (
              <button
                onClick={() => {
                  const el = document.getElementById("control-center-preview");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-[var(--text-graphite-muted)] hover:text-[var(--accent-copper)] font-mono text-xs font-semibold tracking-wider uppercase transition-colors duration-200 cursor-pointer"
              >
                <span>NEXT // CONTROL CENTER</span>
                <span className="text-[var(--accent-copper)]">↓</span>
              </button>
            )}
          </div>
        </Container>
      </div>

      {/* Viewport Edge Left & Right Arrow Controls */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-xs border border-[var(--border-light)]/70 text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] hover:border-[var(--accent-copper)] hover:bg-white flex items-center justify-center transition-all duration-300 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-copper)]"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-xs border border-[var(--border-light)]/70 text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] hover:border-[var(--accent-copper)] hover:bg-white flex items-center justify-center transition-all duration-300 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-copper)]"
      >
        <ArrowRight className="w-4 h-4 stroke-[1.5]" />
      </button>

      {/* Bottom Bar Controls: Slide Counter & Copper Progress Indicators */}
      <div className="relative z-30 w-full py-5 border-t border-[var(--border-light)]/30 bg-gradient-to-t from-[var(--bg-stone)]/90 to-transparent">
        <Container className="flex items-center justify-between">
          {/* Progress Indicators (6 Restrained Indicators with Copper for Active) */}
          <div className="flex items-center gap-2">
            {slidesData.map((s, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to Slide ${idx + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                    isActive
                      ? "w-8 bg-[var(--accent-copper)]"
                      : "w-2 bg-[var(--text-charcoal)]/25 hover:bg-[var(--text-charcoal)]/50"
                  }`}
                />
              );
            })}
          </div>

          {/* JetBrains Mono Slide Counter & Keyboard Cue */}
          <div className="flex items-center gap-4 font-mono text-xs text-[var(--text-graphite-muted)] tracking-wider">
            <span className="hidden sm:inline-block text-[10px] uppercase opacity-70">
              USE ← → ARROWS
            </span>
            <div className="px-2.5 py-1 rounded-[2px] bg-white/60 border border-[var(--border-light)] text-[var(--text-charcoal)] font-bold">
              <span className="text-[var(--accent-copper)]">{currentSlideData.numberLabel}</span>
              <span className="opacity-40 mx-1">/</span>
              <span>0{TOTAL_SLIDES}</span>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
