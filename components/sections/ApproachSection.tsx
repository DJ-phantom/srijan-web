"use client";

import { useRef, useState } from "react";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const approachStages = [
  {
    id: "01",
    title: "SENSE",
    summary: "Capture operating signals from the conveyor and monitored components.",
    labels: ["TEMPERATURE", "VIBRATION", "ALIGNMENT", "CURRENT", "SPEED", "LOAD"],
    microSvg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h4l2-6 4 12 3-8 3 4h4" />
      </svg>
    ),
  },
  {
    id: "02",
    title: "UNDERSTAND",
    summary: "Combine and contextualize multi-sensor telemetry to understand the current operating condition.",
    labels: ["MULTI-SENSOR FUSION", "CONDITION RULES", "SMOOTHING", "FEATURES"],
    microSvg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h6l4 6h6M4 18h6l4-6M4 12h16" />
      </svg>
    ),
  },
  {
    id: "03",
    title: "ASSESS",
    summary: "Detect abnormal operating patterns and assess emerging condition risk from live telemetry.",
    labels: ["ANOMALY DETECTION", "RISK ASSESSMENT", "TREND ANALYSIS"],
    microSvg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18l6-6 4 4 8-10M17 6h4v4" />
      </svg>
    ),
  },
  {
    id: "04",
    title: "ACT",
    summary: "Translate condition evidence into prioritized alerts, recommendations and operator action.",
    labels: ["ALERT", "EVIDENCE", "SEVERITY", "ACTION"],
    microSvg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

export default function ApproachSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const transitionLineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const stagesContainerRef = useRef<HTMLDivElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);
  const resolutionRef = useRef<HTMLDivElement>(null);

  const [activeStage, setActiveStage] = useState<number>(0);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 0. Continuation line from Section 01
      if (transitionLineRef.current) {
        gsap.fromTo(
          transitionLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              end: "top 65%",
              scrub: true,
            },
          }
        );
      }

      // 1. Initial fade in of section header & left column
      gsap.fromTo(
        [labelRef.current, titleRef.current, descriptionRef.current],
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Animated Copper Path Drawing on Scroll
      if (svgPathRef.current && stagesContainerRef.current) {
        const pathLength = svgPathRef.current.getTotalLength();
        gsap.set(svgPathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(svgPathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stagesContainerRef.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: true,
          },
        });
      }

      // 3. ScrollTrigger Stage Activations
      if (stagesContainerRef.current) {
        const stageItems = stagesContainerRef.current.querySelectorAll(
          ".approach-stage-item"
        );
        stageItems.forEach((stage, idx) => {
          ScrollTrigger.create({
            trigger: stage,
            start: "top 65%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (self.isActive) {
                setActiveStage(idx);
              }
            },
          });
        });
      }

      // 4. Resolution Footer Reveal
      if (resolutionRef.current) {
        gsap.fromTo(
          resolutionRef.current,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
              trigger: resolutionRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, sectionRef);

  return (
    <section
      id="approach"
      ref={sectionRef}
      className="relative w-full min-h-[100vh] lg:min-h-[115vh] py-16 md:py-20 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden select-none"
    >
      {/* Continuation line entering from Section 01 */}
      <div
        ref={transitionLineRef}
        className="absolute left-1/2 -top-10 w-[1.5px] h-20 bg-[var(--accent-copper)] origin-top pointer-events-none -translate-x-1/2 z-10"
      />

      {/* Low-Contrast Technical Engineering Grid & System Path Linework */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] select-none">
        <svg className="w-full h-full" width="100%" height="100%">
          <pattern
            id="industrial-grid-approach"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#industrial-grid-approach)" />
        </svg>
      </div>

      <Container className="relative z-10 w-full">
        {/* Section Index Header / Label */}
        <div
          ref={labelRef}
          className="mb-8 md:mb-12 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3"
        >
          <span className="text-[var(--accent-copper)]">02</span>
          <span className="opacity-40">/</span>
          <span>OUR APPROACH</span>
        </div>

        {/* Compact Connected Desktop Layout (Left ~40% / Right ~60%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column (5 Cols / ~40%): Section Identity */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col items-start space-y-5">
            <h2
              ref={titleRef}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.0] text-[var(--text-charcoal)]"
            >
              From Signals <br />
              to Smarter <br />
              <span className="text-[var(--accent-copper)]">Decisions.</span>
            </h2>

            <p
              ref={descriptionRef}
              className="font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed max-w-md"
            >
              The platform combines real-time sensing, condition assessment and anomaly detection to turn conveyor signals into early warnings and actionable decisions.
            </p>

            {/* Dynamic Active-Stage Technical Indicator */}
            <div className="hidden lg:flex items-center gap-2 pt-1 font-mono text-[11px] tracking-widest text-[var(--text-graphite-muted)] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
              <span>STAGE {approachStages[activeStage].id} ACTIVE</span>
              <span className="opacity-30">//</span>
              <span className="text-[var(--text-charcoal)] font-semibold">
                {approachStages[activeStage].title}
              </span>
            </div>
          </div>

          {/* Right Column (7 Cols / ~60%): Compact Connected 4-Stage Process Path */}
          <div
            ref={stagesContainerRef}
            className="lg:col-span-7 relative pl-7 sm:pl-12 flex flex-col space-y-8 md:space-y-11 py-1"
          >
            {/* Muted Guide Line */}
            <div className="absolute left-3.5 sm:left-4.5 top-3 bottom-3 w-[1px] bg-[var(--border-light)]/40 pointer-events-none" />

            {/* SVG Curved Process Path */}
            <svg
              className="absolute left-3.5 sm:left-4.5 top-3 bottom-3 h-[calc(100%-1.5rem)] w-5 -translate-x-[9px] pointer-events-none overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 20 440"
            >
              <path
                d="M 10 0 V 440"
                fill="none"
                stroke="var(--border-light)"
                strokeWidth="1.2"
                opacity="0.3"
              />
              <path
                ref={svgPathRef}
                d="M 10 0 V 440"
                fill="none"
                stroke="var(--accent-copper)"
                strokeWidth="2"
              />
            </svg>

            {/* 4 Connected Process Stages */}
            {approachStages.map((stage, idx) => {
              const isActive = activeStage === idx;
              const isAdjacent = Math.abs(activeStage - idx) === 1;

              // Smooth Opacity Hierarchy: Active = 100%, Adjacent = 70%, Far = 55%
              const opacityClass = isActive
                ? "opacity-100"
                : isAdjacent
                ? "opacity-70"
                : "opacity-55";

              return (
                <div
                  key={stage.id}
                  className={`approach-stage-item relative transition-all duration-300 ease-out ${opacityClass} ${
                    isActive ? "translate-x-1 sm:translate-x-2" : ""
                  }`}
                >
                  {/* Stage Node Dot Indicator */}
                  <div
                    className={`absolute -left-[23px] sm:-left-[37px] top-1 flex items-center justify-center w-4 h-4 rounded-full bg-[var(--bg-stone)] border transition-all duration-300 ${
                      isActive
                        ? "border-[var(--accent-copper)] shadow-[0_0_10px_rgba(200,90,50,0.5)] scale-110"
                        : "border-[var(--accent-copper)]/50 bg-[var(--accent-copper)]/10"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? "bg-[var(--accent-copper)] scale-125" : "bg-[var(--accent-copper)]/60"
                      }`}
                    />
                  </div>

                  {/* Stage Header with Micro Engineering Visual Icon Positioned Directly Beside Title */}
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className={`font-mono text-xs sm:text-sm font-semibold tracking-wider transition-colors duration-200 ${
                        isActive
                          ? "text-[var(--accent-copper)]"
                          : "text-[var(--text-graphite-muted)]"
                      }`}
                    >
                      {stage.id}
                    </span>
                    <h3
                      className={`font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight transition-colors duration-200 ${
                        isActive
                          ? "text-[var(--text-charcoal)]"
                          : "text-[var(--text-charcoal)]/80"
                      }`}
                    >
                      {stage.title}
                    </h3>

                    {/* Micro-Visual Icon inline directly attached as an engineering annotation */}
                    <div
                      className={`text-[var(--accent-copper)] transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-50"
                      }`}
                    >
                      {stage.microSvg}
                    </div>
                  </div>

                  {/* Stage Summary Description */}
                  <p className="font-sans text-xs sm:text-sm font-light text-[var(--text-graphite-muted)] leading-relaxed mb-2 max-w-lg">
                    {stage.summary}
                  </p>

                  {/* Technical Micro Details Annotation */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] sm:text-[11px] tracking-wider text-[var(--text-graphite-muted)] uppercase">
                    {stage.labels.map((label, lIdx) => (
                      <span key={lIdx} className="flex items-center gap-2">
                        <span
                          className={`transition-colors duration-200 ${
                            isActive
                              ? "text-[var(--text-charcoal)] font-semibold"
                              : "opacity-75 font-normal"
                          }`}
                        >
                          {label}
                        </span>
                        {lIdx < stage.labels.length - 1 && (
                          <span className="opacity-30">/</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Resolution Bridge directly beneath process */}
        <div
          ref={resolutionRef}
          className="mt-12 md:mt-16 pt-6 border-t border-[var(--border-light)]/40 flex flex-col items-center text-center space-y-2.5"
        >
          {/* SENSE -> UNDERSTAND -> ASSESS -> ACT Progression Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-5 font-mono text-xs sm:text-sm font-semibold tracking-widest text-[var(--text-charcoal)] uppercase">
            <span className="text-[var(--accent-copper)]">SENSE</span>
            <span className="opacity-30">→</span>
            <span>UNDERSTAND</span>
            <span className="opacity-30">→</span>
            <span className="text-[var(--text-charcoal)]">ASSESS</span>
            <span className="opacity-30">→</span>
            <span className="text-[var(--accent-copper)]">ACT</span>
          </div>

          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase">
            ONE CONTINUOUS VIEW OF CONVEYOR HEALTH
          </p>

          {/* Secondary Future Roadmap Micro Line */}
          <p className="pt-1 text-[9px] sm:text-[10px] font-mono tracking-wider text-[var(--text-graphite-muted)]/75 uppercase max-w-2xl leading-relaxed">
            NEXT / VISION · FFT FEATURES · ENCODER LOCALIZATION · SUPERVISED CLASSIFICATION
          </p>
        </div>
      </Container>
    </section>
  );
}

