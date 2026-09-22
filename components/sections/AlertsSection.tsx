"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

// Structured Demo Telemetry values for future backend integration
const demoTelemetry = {
  observedAlignment: "+3.8 mm",
  alignmentThreshold: "2.5 mm",
  component: "BELT SECTION B / TRACKING",
  eventTitle: "BELT MISALIGNMENT TREND",
  conditionObserved:
    "Alignment telemetry indicates lateral belt drift beyond the configured prototype threshold.",
  recommendedAction:
    "Inspect belt tracking and idler alignment; verify the alignment sensor before corrective adjustment.",
};

const workflowSteps = [
  {
    step: "01",
    label: "ACKNOWLEDGE",
    desc: "Review alert, severity and supporting telemetry.",
  },
  {
    step: "02",
    label: "INSPECT",
    desc: "Inspect the indicated component and verify the observed condition.",
  },
  {
    step: "03",
    label: "ACT",
    desc: "Perform the recommended inspection or corrective action.",
  },
  {
    step: "04",
    label: "VERIFY",
    desc: "Confirm telemetry recovery and resolve the event.",
  },
];

export default function AlertsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  const eventPanelRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [animPhase, setAnimPhase] = useState<number>(1);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setAnimPhase(7);
      setActiveWorkflowStep(4);
    }
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // 1. Entrance reveal for Left Column
    if (leftColRef.current) {
      gsap.fromTo(
        leftColRef.current.children,
        { opacity: 0, y: 20 },
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

    // 2. Primary Reference Image reveal
    if (imageColRef.current) {
      gsap.fromTo(
        imageColRef.current,
        { opacity: 0, x: 24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // 3. Compact Event Scroll Sequence (0 - 100% over ~70-85vh of section scroll)
    if (eventPanelRef.current && !isReducedMotion) {
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          end: "bottom 25%",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.2) {
              setAnimPhase(1); // 0-20%: Operational Event Monitor tag
              setActiveWorkflowStep(1);
            } else if (p < 0.4) {
              setAnimPhase(2); // 20-40%: Belt Section B / Tracking active marker
              setActiveWorkflowStep(1);
            } else if (p < 0.55) {
              setAnimPhase(3); // 40-55%: Misalignment trend + Warning severity
              setActiveWorkflowStep(1);
            } else if (p < 0.7) {
              setAnimPhase(4); // 55-70%: Condition observed
              setActiveWorkflowStep(2);
            } else if (p < 0.82) {
              setAnimPhase(5); // 70-82%: Evidence values (Observed/Threshold)
              setActiveWorkflowStep(2);
            } else if (p < 0.92) {
              setAnimPhase(6); // 82-92%: Recommended action
              setActiveWorkflowStep(3);
            } else {
              setAnimPhase(7); // 92-100%: Workflow resolves
              setActiveWorkflowStep(4);
            }
          },
        },
      });
    }

    // 4. Bottom Statement reveal
    if (bottomRef.current) {
      gsap.fromTo(
        bottomRef.current,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: bottomRef.current,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, sectionRef);

  return (
    <section
      id="alerts"
      ref={sectionRef}
      className="relative w-full min-h-[85vh] lg:min-h-[92vh] py-16 md:py-20 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-between overflow-hidden"
    >
      {/* Background Technical Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] select-none">
        <svg className="w-full h-full" width="100%" height="100%">
          <defs>
            <pattern id="alerts-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#alerts-grid)" />
        </svg>
      </div>

      <Container className="relative z-10 w-full flex-grow flex flex-col justify-between">
        {/* Main Desktop 2-Column Grid: Left (~35%) / Right (~65%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-6">
          {/* LEFT COLUMN: Section Label, Headline, Intro Copy, Operational Event Monitor Tag */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col justify-start space-y-5">
            {/* Section Label */}
            <div className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3">
              <span className="text-[var(--accent-copper)]">06</span>
              <span className="opacity-40">/</span>
              <span>ALERTS &amp; RESPONSE</span>
            </div>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.02] text-[var(--text-charcoal)]">
              From Detection <br />
              to <span className="text-[var(--accent-copper)]">Action.</span>
            </h2>

            {/* Intro Copy (Exact wording) */}
            <p className="font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed">
              When abnormal behaviour appears, the platform brings together condition evidence, severity and monitored component context so operators can quickly understand what needs attention.
            </p>

            {/* Primary Event Monitor Label */}
            <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[2px] bg-white/60 border border-[var(--border-light)]/80 shadow-2xs font-mono text-[11px] tracking-wider text-[var(--text-charcoal)] w-max transition-opacity duration-300 ${
              isReducedMotion || animPhase >= 1 ? "opacity-100" : "opacity-40"
            }`}>
              <span className="h-2 w-2 rounded-full bg-[var(--accent-copper)] animate-pulse" />
              <span className="font-semibold text-[var(--accent-copper)]">OPERATIONAL EVENT MONITOR</span>
              <span className="text-[var(--text-graphite-muted)]">// SIMULATED DEMO EVENT</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Primary Reference Image + Dense Compact Event Panel */}
          <div ref={imageColRef} className="lg:col-span-7 flex flex-col space-y-4">
            {/* Primary Reference Image Frame (Cropped so conveyor & event marker dominate, baked HUD panel secondary) */}
            <div className="relative w-full rounded-[2px] overflow-hidden border border-[var(--border-light)]/60 bg-[var(--bg-stone-surface)] shadow-sm">
              <div className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] overflow-hidden">
                <Image
                  src="/images/alert_section_ref_img.png"
                  alt="Conveyor Misalignment Alert and Tracking Condition Assessment"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-[20%_center] scale-[1.04] brightness-[0.96] contrast-[1.02]"
                />
                {/* Dissolve Edge Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[var(--bg-stone)]/30 via-transparent to-transparent" />

                {/* Component Marker Tag overlay on highlighted belt area */}
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-[1px] bg-black/75 backdrop-blur-xs font-mono text-[10px] tracking-wider text-white border border-white/10 transition-opacity duration-300 ${
                  isReducedMotion || animPhase >= 2 ? "opacity-100" : "opacity-0"
                }`}>
                  <span className="text-[var(--accent-copper)] font-bold">BELT SECTION B // TRACKING</span>
                  <span className="ml-2 font-semibold text-emerald-400">[ACTIVE EVENT]</span>
                </div>
              </div>
            </div>

            {/* Dense, Professional Operational Event Panel (Height ~280–350px, No Blank Spaces) */}
            <div
              ref={eventPanelRef}
              className="w-full p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)] shadow-xs flex flex-col space-y-3 font-mono text-xs"
            >
              {/* TOP ROW: Main Event Title + Warning Severity Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5">
                <div>
                  <div className="text-[9.5px] font-semibold text-[var(--accent-copper)] tracking-widest uppercase">
                    MAIN EVENT
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-[var(--text-charcoal)]">
                    {demoTelemetry.eventTitle}
                  </h3>
                </div>

                {/* Severity Badge */}
                <div className={`px-2.5 py-0.5 rounded-[1px] bg-[var(--accent-copper)]/15 text-[var(--accent-copper)] font-bold text-[10.5px] border border-[var(--accent-copper)]/40 tracking-wider shrink-0 transition-opacity duration-300 ${
                  isReducedMotion || animPhase >= 3 ? "opacity-100" : "opacity-0"
                }`}>
                  WARNING // ATTENTION REQUIRED
                </div>
              </div>

              {/* MIDDLE SECTION: Component & Condition (Left 7 cols) | Evidence Values (Right 5 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start py-1">
                {/* Left 7 Cols: Monitored Component & Condition Observed */}
                <div className="sm:col-span-7 flex flex-col space-y-2">
                  <div>
                    <span className="text-[9.5px] text-[var(--text-graphite-muted)] uppercase tracking-wider block">
                      MONITORED COMPONENT
                    </span>
                    <span className="font-semibold text-[var(--text-charcoal)] text-[11px]">
                      {demoTelemetry.component}
                    </span>
                  </div>

                  <div className={`transition-opacity duration-300 ${
                    isReducedMotion || animPhase >= 4 ? "opacity-100" : "opacity-30"
                  }`}>
                    <span className="text-[9.5px] text-[var(--text-graphite-muted)] uppercase tracking-wider block">
                      CONDITION OBSERVED
                    </span>
                    <p className="font-sans text-xs font-light text-[var(--text-charcoal)] leading-relaxed">
                      {demoTelemetry.conditionObserved}
                    </p>
                  </div>
                </div>

                {/* Right 5 Cols: Structured Evidence Block */}
                <div className={`sm:col-span-5 flex flex-col space-y-2 sm:border-l border-[var(--border-light)]/40 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-light)]/30 transition-opacity duration-300 ${
                  isReducedMotion || animPhase >= 5 ? "opacity-100" : "opacity-30"
                }`}>
                  <span className="text-[9.5px] font-bold text-[var(--accent-copper)] uppercase tracking-wider">
                    EVIDENCE
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[var(--bg-stone)]/60 p-1.5 rounded-[1px] border border-[var(--border-light)]/50">
                      <span className="text-[9px] text-[var(--text-graphite-muted)] block uppercase">OBSERVED</span>
                      <span className="font-bold text-[var(--accent-copper)] text-xs">{demoTelemetry.observedAlignment}</span>
                    </div>

                    <div className="bg-[var(--bg-stone)]/60 p-1.5 rounded-[1px] border border-[var(--border-light)]/50">
                      <span className="text-[9px] text-[var(--text-graphite-muted)] block uppercase">THRESHOLD</span>
                      <span className="font-semibold text-[var(--text-charcoal)] text-xs">{demoTelemetry.alignmentThreshold}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: Full Width Recommended Action */}
              <div className={`pt-2 border-t border-[var(--border-light)]/40 space-y-1 transition-opacity duration-300 ${
                isReducedMotion || animPhase >= 6 ? "opacity-100" : "opacity-30"
              }`}>
                <div className="text-[9.5px] font-bold text-[var(--accent-copper)] uppercase tracking-wider">
                  RECOMMENDED ACTION
                </div>
                <div className="pl-2.5 border-l-2 border-[var(--accent-copper)]">
                  <p className="font-sans text-xs font-medium text-[var(--text-charcoal)] leading-snug">
                    {demoTelemetry.recommendedAction}
                  </p>
                </div>
              </div>
            </div>

            {/* Operator Workflow Pathway — Moved directly below event panel with connecting line */}
            <div
              ref={workflowRef}
              className="w-full pt-3 flex flex-col space-y-2 font-mono"
            >
              <div className="flex items-center justify-between text-[9.5px] font-semibold text-[var(--text-graphite-muted)] tracking-widest uppercase">
                <span>// OPERATOR ACTION WORKFLOW</span>
                <span>RESPONSE CYCLE</span>
              </div>

              {/* Thin Connecting Line & 4 Stages */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 sm:divide-x divide-[var(--border-light)]/40 border-t border-[var(--border-light)]/40 pt-2">
                {workflowSteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isActive = isReducedMotion || activeWorkflowStep >= stepNum;

                  return (
                    <div
                      key={step.step}
                      className={`workflow-step flex flex-col space-y-1 sm:px-3 first:pl-0 last:pr-0 transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          isActive ? "bg-[var(--accent-copper)]" : "bg-[var(--text-graphite-muted)]/40"
                        }`} />
                        <span className="font-bold text-[var(--accent-copper)]">[{step.step}]</span>
                        <span className="font-bold text-[var(--text-charcoal)] text-[10.5px] tracking-wider uppercase">
                          {step.label}
                        </span>
                      </div>
                      <p className="font-sans text-[10.5px] font-light text-[var(--text-graphite-muted)] leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Statement & Next Transition (Tight Margins) */}
        <div
          ref={bottomRef}
          className="mt-6 pt-6 border-t border-[var(--border-light)]/40 flex flex-col items-center text-center space-y-2"
        >
          <div className="font-heading text-base sm:text-lg font-bold tracking-tight text-[var(--text-charcoal)] uppercase max-w-3xl leading-snug">
            <span className="text-[var(--accent-copper)]">DETECT THE CHANGE.</span> UNDERSTAND THE EVIDENCE. ACT WITH CONTEXT.
          </div>

          <p className="font-sans text-xs font-light text-[var(--text-graphite-muted)] max-w-xl">
            Clear alerts are more useful when operators can see why attention is required.
          </p>

          <div className="font-mono text-[10.5px] tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase pt-1">
            NEXT &nbsp;//&nbsp; CONTROL CENTER — EVERYTHING COMES TOGETHER HERE.
          </div>
        </div>
      </Container>
    </section>
  );
}
