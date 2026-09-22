"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

const processSteps = [
  {
    step: "01",
    title: "TELEMETRY",
    desc: "Incoming multi-sensor operating signals.",
  },
  {
    step: "02",
    title: "CONTEXT",
    desc: "Combine current behaviour with condition rules and related signals.",
  },
  {
    step: "03",
    title: "DETECT",
    desc: "Identify patterns that deviate from expected operating behaviour.",
  },
  {
    step: "04",
    title: "ASSESS",
    desc: "Evaluate condition evidence and emerging operational risk.",
  },
  {
    step: "05",
    title: "SURFACE",
    desc: "Translate analysis into clear operator-facing information.",
  },
];

const currentCapabilities = [
  "ANOMALY DETECTION",
  "CONDITION RULES",
  "RISK ASSESSMENT",
  "TREND ANALYSIS",
  "MULTI-SENSOR CONTEXT",
  "DECISION SUPPORT",
];

export default function IntelligenceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  const processStripRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Simulation element refs
  const rawPathRef = useRef<SVGPathElement>(null);
  const envelopeRef = useRef<SVGGElement>(null);
  const deviationPathRef = useRef<SVGPathElement>(null);
  const deviationNodeRef = useRef<SVGGElement>(null);
  const phase04LabelsRef = useRef<SVGGElement>(null);
  const insightBoxRef = useRef<HTMLDivElement>(null);

  const [simPhase, setSimPhase] = useState<number>(1);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setSimPhase(5);
    }
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // 1. Entrance reveal for Left Column
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

    // 2. Main Reference Image reveal from right
    if (imageColRef.current) {
      gsap.fromTo(
        imageColRef.current,
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

    // 3. Process Strip stagger reveal
    if (processStripRef.current) {
      const stripItems = processStripRef.current.querySelectorAll(".strip-item");
      gsap.fromTo(
        stripItems,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: processStripRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // 4. Scroll-Driven Signal Transformation Simulation
    if (simulationRef.current && !isReducedMotion) {
      // Prepare stroke lengths for SVG path drawing
      if (rawPathRef.current) {
        const rawLen = rawPathRef.current.getTotalLength();
        gsap.set(rawPathRef.current, {
          strokeDasharray: rawLen,
          strokeDashoffset: rawLen,
        });
      }
      if (deviationPathRef.current) {
        const devLen = deviationPathRef.current.getTotalLength();
        gsap.set(deviationPathRef.current, {
          strokeDasharray: devLen,
          strokeDashoffset: devLen,
        });
      }

      const simTl = gsap.timeline({
        scrollTrigger: {
          trigger: simulationRef.current,
          start: "top 75%",
          end: "bottom 25%",
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.2) setSimPhase(1);
            else if (p < 0.4) setSimPhase(2);
            else if (p < 0.6) setSimPhase(3);
            else if (p < 0.8) setSimPhase(4);
            else setSimPhase(5);
          },
        },
      });

      // Phase 01: Raw Telemetry path drawing (0 - 20%)
      if (rawPathRef.current) {
        simTl.to(
          rawPathRef.current,
          { strokeDashoffset: 0, ease: "none", duration: 0.2 },
          0
        );
      }

      // Phase 02: Expected Operating Band reveal (20 - 40%)
      if (envelopeRef.current) {
        simTl.fromTo(
          envelopeRef.current,
          { opacity: 0 },
          { opacity: 1, ease: "none", duration: 0.2 },
          0.2
        );
      }

      // Phase 03: Deviation region turns copper & node reveals (40 - 60%)
      if (deviationPathRef.current) {
        simTl.to(
          deviationPathRef.current,
          { strokeDashoffset: 0, ease: "none", duration: 0.2 },
          0.4
        );
      }
      if (deviationNodeRef.current) {
        simTl.fromTo(
          deviationNodeRef.current,
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1, ease: "power2.out", duration: 0.15 },
          0.45
        );
      }

      // Phase 04: Condition Assessment engineering annotations appear (60 - 80%)
      if (phase04LabelsRef.current) {
        simTl.fromTo(
          phase04LabelsRef.current,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.2 },
          0.6
        );
      }

      // Phase 05: Operator Insight resolves (80 - 100%)
      if (insightBoxRef.current) {
        simTl.fromTo(
          insightBoxRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.2 },
          0.8
        );
      }
    }

    // 5. Bottom Statement reveal
    if (bottomRef.current) {
      gsap.fromTo(
        bottomRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: bottomRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, sectionRef);

  const getPhaseTitle = (phase: number) => {
    switch (phase) {
      case 1:
        return "PHASE 01 // RAW TELEMETRY";
      case 2:
        return "PHASE 02 // EXPECTED OPERATING BAND";
      case 3:
        return "PHASE 03 // OBSERVED DEVIATION";
      case 4:
        return "PHASE 04 // CONDITION ASSESSMENT";
      case 5:
        return "PHASE 05 // OPERATOR INSIGHT";
      default:
        return "PHASE 01 // RAW TELEMETRY";
    }
  };

  return (
    <section
      id="intelligence"
      ref={sectionRef}
      className="relative w-full min-h-[95vh] lg:min-h-[110vh] py-20 md:py-28 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-between overflow-hidden"
    >
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none">
        <svg className="w-full h-full" width="100%" height="100%">
          <defs>
            <pattern id="intel-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#intel-grid)" />
        </svg>
      </div>

      <Container className="relative z-10 w-full flex-grow flex flex-col justify-between">
        {/* Main Desktop Composition: Left (35%) / Right (65%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 lg:mb-16">
          {/* LEFT COLUMN: Section Label, Headline, Copy, Status Tag, Open Scroll Canvas Simulation */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col justify-start space-y-6">
            {/* Section Label */}
            <div className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3">
              <span className="text-[var(--accent-copper)]">04</span>
              <span className="opacity-40">/</span>
              <span>INTELLIGENCE</span>
            </div>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.02] text-[var(--text-charcoal)]">
              From Raw Signals <br />
              to <span className="text-[var(--accent-copper)]">Condition Insight.</span>
            </h2>

            {/* Supporting Copy */}
            <div className="space-y-3 font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed">
              <p>
                The platform compares multi-sensor behaviour, condition rules and anomaly patterns to identify operating changes that deserve attention.
              </p>
              <p className="text-xs sm:text-sm opacity-90">
                Instead of treating each signal independently, the intelligence layer combines telemetry context to assess abnormal behaviour and surface clearer operational evidence.
              </p>
            </div>

            {/* Analysis Status Tag */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[2px] bg-white/60 border border-[var(--border-light)]/80 shadow-2xs font-mono text-[11px] tracking-wider text-[var(--text-charcoal)] w-max">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-copper)] animate-pulse" />
              <span className="font-semibold text-[var(--accent-copper)]">CONDITION ENGINE</span>
              <span className="text-[var(--text-graphite-muted)]">// PROTOTYPE ANALYSIS</span>
            </div>

            {/* Refined Scroll Simulation — Open Technical Canvas (No Outer Boxed Card) */}
            <div
              ref={simulationRef}
              className="relative w-full mt-4 pt-4 border-t border-[var(--border-light)]/40 flex flex-col gap-3 font-mono"
            >
              {/* Simulation Header — Open Engineering Rule */}
              <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-2 text-[10px] tracking-wider">
                <span className="text-[var(--accent-copper)] font-semibold">
                  {getPhaseTitle(simPhase)}
                </span>
                <span className="text-[var(--text-graphite-muted)] opacity-70">SCROLL PROGRESSION</span>
              </div>

              {/* Open SVG Waveform Analysis Canvas */}
              <div className="relative w-full h-[150px] sm:h-[170px] bg-[var(--bg-stone)]/40 rounded-[1px] border-b border-[var(--border-light)]/30 flex items-center justify-center overflow-hidden">
                <svg
                  className="w-full h-full p-1"
                  viewBox="0 0 500 170"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Subtle Grid Lines */}
                  <line x1="0" y1="42" x2="500" y2="42" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="85" x2="500" y2="85" stroke="var(--border-light)" strokeWidth="0.8" opacity="0.5" />
                  <line x1="0" y1="128" x2="500" y2="128" stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />

                  {/* Phase 02: Expected Operating Band Envelope */}
                  <g ref={envelopeRef} className={isReducedMotion || simPhase >= 2 ? "opacity-100" : "opacity-0"}>
                    <path
                      d="M 20 52 Q 150 44, 260 56 T 480 52 L 480 118 Q 360 126, 260 114 T 20 118 Z"
                      fill="rgba(26,26,24,0.04)"
                      stroke="var(--text-graphite-muted)"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />
                    <text x="24" y="38" fill="var(--text-graphite-muted)" fontSize="8" fontFamily="monospace" letterSpacing="1">
                      EXPECTED OPERATING BAND
                    </text>
                    <text x="375" y="38" fill="var(--text-graphite-muted)" fontSize="7" fontFamily="monospace" opacity="0.65">
                      LOAD · SPEED · TEMP · TIME
                    </text>
                  </g>

                  {/* Phase 01: Raw Telemetry Graphite Waveform */}
                  <path
                    ref={rawPathRef}
                    d="M 20 85 Q 70 70, 120 85 T 220 85 T 320 85 T 420 85 T 480 85"
                    stroke="var(--text-charcoal)"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.75"
                  />

                  {/* Phase 03: Stronger Copper Anomaly Region Segment */}
                  <path
                    ref={deviationPathRef}
                    d="M 250 85 Q 290 22, 330 148 T 370 18 T 410 85"
                    stroke="var(--accent-copper)"
                    strokeWidth="2.8"
                    fill="none"
                  />

                  {/* Phase 03: Copper Anomaly Node & Leader Line */}
                  <g
                    ref={deviationNodeRef}
                    transform="translate(370, 18)"
                    className={isReducedMotion || simPhase >= 3 ? "opacity-100" : "opacity-0"}
                  >
                    <circle cx="0" cy="0" r="4" fill="var(--accent-copper)" />
                    <circle cx="0" cy="0" r="9" stroke="var(--accent-copper)" strokeWidth="1" opacity="0.6" className="animate-ping" />
                    <line x1="0" y1="0" x2="60" y2="0" stroke="var(--accent-copper)" strokeWidth="0.8" strokeDasharray="2 2" />
                    <text x="65" y="3" fill="var(--accent-copper)" fontSize="8" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">
                      OBSERVED DEVIATION
                    </text>
                  </g>

                  {/* Phase 04: Condition Assessment Engineering Annotations */}
                  <g
                    ref={phase04LabelsRef}
                    className={isReducedMotion || simPhase >= 4 ? "opacity-100" : "opacity-0"}
                  >
                    <g transform="translate(60, 140)">
                      <circle cx="0" cy="0" r="2" fill="var(--text-graphite-muted)" />
                      <text x="6" y="3" fill="var(--text-graphite-muted)" fontSize="7" fontFamily="monospace" letterSpacing="0.5">
                        ANOMALY DETECTION
                      </text>
                    </g>
                    <g transform="translate(160, 140)">
                      <circle cx="0" cy="0" r="2" fill="var(--text-graphite-muted)" />
                      <text x="6" y="3" fill="var(--text-graphite-muted)" fontSize="7" fontFamily="monospace" letterSpacing="0.5">
                        CONDITION RULES
                      </text>
                    </g>
                    <g transform="translate(260, 140)">
                      <circle cx="0" cy="0" r="2" fill="var(--text-graphite-muted)" />
                      <text x="6" y="3" fill="var(--text-graphite-muted)" fontSize="7" fontFamily="monospace" letterSpacing="0.5">
                        TREND CONTEXT
                      </text>
                    </g>
                    <g transform="translate(360, 140)">
                      <circle cx="0" cy="0" r="2" fill="var(--text-graphite-muted)" />
                      <text x="6" y="3" fill="var(--text-graphite-muted)" fontSize="7" fontFamily="monospace" letterSpacing="0.5">
                        RISK ASSESSMENT
                      </text>
                    </g>
                  </g>
                </svg>

                {/* Phase 05: Final Operator-Facing Insight Resolution */}
                <div
                  ref={insightBoxRef}
                  className={`absolute bottom-2 right-2 left-2 p-2.5 rounded-[1px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-mono text-[10px] border border-[var(--accent-copper)]/60 shadow-md transition-opacity duration-300 ${
                    isReducedMotion || simPhase >= 5 ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center justify-between text-[var(--accent-copper)] font-semibold tracking-wider uppercase mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)]" />
                      <span>VIBRATION BEHAVIOUR DEVIATION</span>
                    </span>
                    <span className="text-[9px] px-1 bg-[var(--accent-copper)]/20 rounded-[1px]">CONDITION: ATTENTION</span>
                  </div>
                  <div className="text-[9.5px] text-[var(--text-graphite-muted)] leading-tight">
                    ACTION: REVIEW MECHANICAL CONDITION &nbsp;//&nbsp; CONTEXT &amp; RULES EVALUATED
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Primary Visual Asset + Process Strip */}
          <div ref={imageColRef} className="lg:col-span-7 flex flex-col space-y-6">
            {/* Primary Reference Image Frame — Cropped to hide rightmost predictive monitor */}
            <div className="relative w-full rounded-[2px] overflow-hidden border border-[var(--border-light)]/60 bg-[var(--bg-stone-surface)] shadow-sm">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] overflow-hidden">
                <Image
                  src="/images/intelligence_section_ref_img.png"
                  alt="Industrial Conveyor Intelligence Control Room and Anomaly Assessment Analytics"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-[15%_center] scale-[1.04] brightness-[0.96] contrast-[1.02]"
                />
                {/* Subtle Right Edge Fade Mask to de-emphasize edge monitor text */}
                <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[var(--bg-stone)]/90 via-[var(--bg-stone)]/40 to-transparent pointer-events-none" />
                
                {/* Clean Corner Engineering Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[1px] bg-black/65 backdrop-blur-xs font-mono text-[10px] tracking-wider text-[var(--bg-stone)] border border-white/10">
                  <span className="text-[var(--accent-copper)] font-semibold">04 // </span>
                  <span>INTELLIGENCE CONTROL ENVIRONMENT</span>
                </div>
              </div>
            </div>

            {/* Compact 5-Step Intelligence Process Strip */}
            <div
              ref={processStripRef}
              className="w-full pt-4 border-t border-[var(--border-light)]/40 grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-0 sm:divide-x divide-[var(--border-light)]/40 font-mono"
            >
              {processSteps.map((step) => (
                <div
                  key={step.step}
                  className="strip-item flex flex-col space-y-1.5 sm:px-3 first:pl-0 last:pr-0"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-copper)]">
                    <span>{step.step}</span>
                    <span className="opacity-40">/</span>
                    <span className="text-[var(--text-charcoal)] font-bold text-[11px] tracking-wider uppercase">
                      {step.title}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] font-light text-[var(--text-graphite-muted)] leading-tight">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Capabilities Row (Clean Thin Separators, No Boxed Pills) + Planned Line */}
        <div className="w-full pt-6 border-t border-[var(--border-light)]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
          {/* Current Capabilities — Clean Mono Text with Thin '/' Separators */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[var(--text-charcoal)]">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--text-graphite-muted)] uppercase mr-1">
              CURRENT CAPABILITIES:
            </span>
            {currentCapabilities.map((cap, idx) => (
              <span key={cap} className="inline-flex items-center gap-2.5">
                <span className="tracking-wider">{cap}</span>
                {idx < currentCapabilities.length - 1 && (
                  <span className="text-[var(--text-graphite-muted)]/40 font-light">/</span>
                )}
              </span>
            ))}
          </div>

          {/* Secondary Future/Planned Line */}
          <div className="text-[10px] tracking-wider text-[var(--text-graphite-muted)] opacity-60 shrink-0">
            NEXT / VISION INSPECTION · FFT FEATURES · SUPERVISED CLASSIFICATION
          </div>
        </div>

        {/* Bottom Statement */}
        <div
          ref={bottomRef}
          className="mt-12 pt-8 border-t border-[var(--border-light)]/40 flex flex-col items-center text-center space-y-2"
        >
          <div className="font-heading text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[var(--text-charcoal)] uppercase max-w-3xl leading-snug">
            <span className="text-[var(--accent-copper)]">SIGNALS SHOW CHANGE.</span> ASSESSMENT ADDS CONTEXT.
          </div>

          <p className="font-sans text-xs sm:text-sm font-light text-[var(--text-graphite-muted)] max-w-xl">
            The goal is not simply to collect data, but to identify which changes deserve operator attention.
          </p>
        </div>
      </Container>
    </section>
  );
}


