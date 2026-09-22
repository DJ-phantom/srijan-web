"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

const conveyorZones = [
  { id: "ZONE A", name: "DRIVE HEAD", status: "NORMAL", tag: "MAIN DRIVE ASSEMBLY" },
  { id: "ZONE B", name: "BELT SECTION A", status: "NORMAL", tag: "TROUGHING IDLERS" },
  { id: "ZONE C", name: "MONITORED SPLICE S1", status: "ATTENTION", tag: "MECHANICAL JOINT" },
  { id: "ZONE D", name: "BELT SECTION B / TAIL", status: "NORMAL", tag: "TAIL PULLEY & TENSION" },
];

const sensorIndex = [
  { code: "T-01", label: "TEMP", isPlanned: false },
  { code: "V-02", label: "VIBRATION", isPlanned: false },
  { code: "M-01", label: "CURRENT", isPlanned: false },
  { code: "S-01", label: "SPEED", isPlanned: false },
  { code: "A-01", label: "ALIGNMENT", isPlanned: false },
  { code: "L-01", label: "LOAD", isPlanned: false },
  { code: "C-01", label: "VISION", isPlanned: true },
];

export default function DigitalBeltSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const resolutionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Entrance animation for left column text elements
    if (leftColRef.current) {
      gsap.fromTo(
        leftColRef.current.children,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Entrance animation for right visual schematic
    if (rightColRef.current) {
      gsap.fromTo(
        rightColRef.current,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Bottom resolution reveal
    if (resolutionRef.current) {
      gsap.fromTo(
        resolutionRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: resolutionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, sectionRef);

  return (
    <section
      id="digital-belt"
      ref={sectionRef}
      className="relative w-full min-h-[75vh] lg:min-h-[85vh] py-14 md:py-20 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-between overflow-hidden"
    >
      {/* Background Architectural Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none">
        <svg className="w-full h-full" width="100%" height="100%">
          <defs>
            <pattern
              id="digital-belt-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#digital-belt-grid)" />
        </svg>
      </div>

      <Container className="relative z-10 w-full flex-grow flex flex-col justify-between">
        {/* Desktop 2-Column Grid: Left (38%) / Right (62%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 lg:mb-16">
          {/* LEFT COLUMN: Section Label, Headline, Copy, Sensor Index, CTA */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col justify-start space-y-6">
            {/* Section Label */}
            <div className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3">
              <span className="text-[var(--accent-copper)]">05</span>
              <span className="opacity-40">/</span>
              <span>DIGITAL BELT</span>
            </div>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.02] text-[var(--text-charcoal)]">
              One System. <br />
              <span className="text-[var(--accent-copper)]">One Living View.</span>
            </h2>

            {/* Supporting Intro Copy */}
            <p className="font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed">
              The Digital Belt connects condition data with monitored conveyor components, giving operators one visual view of system health and spatial context.
            </p>

            {/* Homepage Sensor Index */}
            <div className="pt-2 border-t border-[var(--border-light)]/40 flex flex-col gap-2 font-mono text-xs">
              <div className="text-[10px] font-semibold text-[var(--text-graphite-muted)] uppercase tracking-widest mb-1">
                // MONITORED SENSOR CHANNELS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sensorIndex.map((sensor) => (
                  <div
                    key={sensor.code}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-[1px] bg-white/50 border border-[var(--border-light)]/60 text-[11px]"
                  >
                    <span className="font-bold text-[var(--accent-copper)]">{sensor.code}</span>
                    <span className="text-[var(--text-charcoal)]">{sensor.label}</span>
                    {sensor.isPlanned && (
                      <span className="text-[9px] px-1 bg-[var(--text-graphite-muted)]/15 text-[var(--text-graphite-muted)] rounded-[1px] ml-auto uppercase font-sans font-medium">
                        PLANNED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Homepage CTA Link */}
            <div className="pt-4">
              <Link
                href="/digital-belt"
                className="group inline-flex items-center gap-2.5 font-mono text-xs md:text-sm font-semibold tracking-wider text-[var(--accent-copper)] hover:text-[var(--text-charcoal)] transition-colors duration-200"
              >
                <span>EXPLORE DIGITAL BELT</span>
                <span className="text-base transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Lightweight Technical Schematic & Zone Preview */}
          <div ref={rightColRef} className="lg:col-span-7 flex flex-col space-y-4">
            {/* Main Visual Frame — Image + Overlay Zone Markers */}
            <div className="relative w-full rounded-[2px] overflow-hidden border border-[var(--border-light)]/60 bg-[var(--bg-stone-surface)] shadow-sm">
              <div className="relative w-full aspect-[16/9.5] overflow-hidden">
                <Image
                  src="/images/ref_img_8.png"
                  alt="Digital Belt Conveyor Spatial Architecture"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center brightness-[0.92] contrast-[1.05]"
                />
                {/* Gradient Dissolve Mask */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-stone)]/40 via-transparent to-transparent pointer-events-none" />

                {/* Zone Annotation Overlay Nodes */}
                {/* ZONE A */}
                <div className="absolute top-[18%] left-[12%] flex items-center gap-2 font-mono text-[10px] bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-[1px] border border-white/10 text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-[var(--accent-copper)]">ZONE A</span>
                  <span className="opacity-80">// DRIVE HEAD</span>
                </div>

                {/* ZONE B */}
                <div className="absolute top-[42%] left-[32%] flex items-center gap-2 font-mono text-[10px] bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-[1px] border border-white/10 text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-[var(--accent-copper)]">ZONE B</span>
                  <span className="opacity-80">// BELT SECTION A</span>
                </div>

                {/* ZONE C — MONITORED SPLICE S1 (Highlight Node) */}
                <div className="absolute top-[35%] right-[28%] flex items-center gap-2 font-mono text-[10px] bg-black/85 backdrop-blur-xs px-3 py-1.5 rounded-[1px] border border-[var(--accent-copper)] text-white shadow-lg">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
                  <span className="font-bold text-[var(--accent-copper)]">ZONE C</span>
                  <span className="font-semibold text-white">// MONITORED SPLICE S1</span>
                </div>

                {/* ZONE D */}
                <div className="absolute bottom-[22%] right-[10%] flex items-center gap-2 font-mono text-[10px] bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-[1px] border border-white/10 text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-[var(--accent-copper)]">ZONE D</span>
                  <span className="opacity-80">// BELT SECTION B / TAIL</span>
                </div>
              </div>
            </div>

            {/* 4 Conveyor Zone Strip */}
            <div className="w-full pt-3 border-t border-[var(--border-light)]/40 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {conveyorZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-2.5 rounded-[1px] border transition-colors ${
                    zone.status === "ATTENTION"
                      ? "bg-white/80 border-[var(--accent-copper)]/60 text-[var(--text-charcoal)]"
                      : "bg-white/40 border-[var(--border-light)]/60 text-[var(--text-graphite-muted)]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-[var(--accent-copper)]">
                    <span>{zone.id}</span>
                    <span className="text-[9px] opacity-70">{zone.status}</span>
                  </div>
                  <div className="font-semibold text-[11px] text-[var(--text-charcoal)] mt-0.5 truncate">
                    {zone.name}
                  </div>
                  <div className="text-[9px] opacity-60 truncate mt-0.5">{zone.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Homepage Footer Message */}
        <div
          ref={resolutionRef}
          className="mt-12 pt-8 border-t border-[var(--border-light)]/40 flex flex-col items-center text-center space-y-2"
        >
          <div className="font-heading text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[var(--text-charcoal)] uppercase max-w-3xl leading-snug">
            KNOW WHAT IS HAPPENING<span className="text-[var(--accent-copper)]">.</span> <br />
            KNOW <span className="text-[var(--accent-copper)]">WHERE</span> TO LOOK NEXT<span className="text-[var(--accent-copper)]">.</span>
          </div>

          <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase pt-2">
            NEXT &nbsp;//&nbsp; 06 ALERTS &amp; RESPONSE — FROM DETECTION TO ACTION.
          </p>
        </div>
      </Container>
    </section>
  );
}
