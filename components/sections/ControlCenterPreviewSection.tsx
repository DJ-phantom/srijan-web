"use client";

import { useRef } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

export default function ControlCenterPreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const previewWindowRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Reveal section label & headline
      gsap.fromTo(
        [labelRef.current, titleRef.current, descriptionRef.current],
        { opacity: 0, y: 16 },
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

      // 2. Teaser Window Reveal
      if (previewWindowRef.current) {
        gsap.fromTo(
          previewWindowRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: previewWindowRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. CTA Reveal
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 90%",
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
      id="control-center-preview"
      ref={sectionRef}
      className="relative w-full min-h-[65vh] lg:min-h-[75vh] py-12 md:py-16 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden"
    >
      <Container className="relative z-10 w-full max-w-5xl">
        {/* Section Header Block */}
        <div className="flex flex-col items-start max-w-2xl mb-8">
          <div
            ref={labelRef}
            className="mb-3 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3"
          >
            <span className="text-[var(--accent-copper)]">08</span>
            <span className="opacity-40">/</span>
            <span>CONTROL CENTER</span>
          </div>

          <h2
            ref={titleRef}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[0.98] text-[var(--text-charcoal)] mb-3"
          >
            Everything <br />
            <span className="text-[var(--accent-copper)]">Comes Together Here.</span>
          </h2>

          <p
            ref={descriptionRef}
            className="font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed"
          >
            A unified operational view brings conveyor condition, location, alerts and system context together so operators can understand what deserves attention.
          </p>
        </div>

        {/* Compressed Premium Teaser Preview Window */}
        <div
          ref={previewWindowRef}
          className="relative w-full rounded-[2px] bg-white/75 backdrop-blur-xs border border-[var(--border-light)] shadow-xs p-4 sm:p-6 font-mono text-xs space-y-4"
        >
          {/* Teaser Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-light)]/40">
            <div className="flex items-center gap-2.5">
              <span className="font-heading text-base font-bold text-[var(--text-charcoal)]">
                SRIJAN<span className="text-[var(--accent-copper)]">.</span>
              </span>
              <span className="text-[10.5px] font-semibold text-[var(--text-graphite-muted)] uppercase tracking-wider">
                // SIMULATED CONTROL CENTER PREVIEW
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[var(--text-charcoal)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold uppercase">BC-01 DEMO TELEMETRY</span>
            </div>
          </div>

          {/* 4 Teaser Cards: Overall Belt Condition, Monitored Splice S1, Anomaly Assessment, Active Rule Events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* OVERALL BELT CONDITION */}
            <div className="p-3 bg-[var(--bg-stone)]/50 rounded-[1px] border border-[var(--border-light)]/60 flex flex-col justify-between space-y-1">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase tracking-wider">
                OVERALL BELT CONDITION
              </span>
              <span className="font-heading text-base font-bold text-emerald-600">
                RISK INDEX: 08 / 100
              </span>
              <span className="text-[10px] text-[var(--text-graphite-muted)]">
                LOW RISK // STABLE
              </span>
            </div>

            {/* MONITORED SPLICE S1 */}
            <div className="p-3 bg-[var(--bg-stone)]/50 rounded-[1px] border border-[var(--border-light)]/60 flex flex-col justify-between space-y-1">
              <span className="text-[9.5px] font-bold text-[var(--accent-copper)] uppercase tracking-wider">
                MONITORED SPLICE S1
              </span>
              <span className="font-heading text-base font-bold text-[var(--text-charcoal)]">
                RISK INDEX: 12 / 100
              </span>
              <span className="text-[10px] text-[var(--text-graphite-muted)]">
                JOINT S1 // VIBRATION STABLE
              </span>
            </div>

            {/* ANOMALY ASSESSMENT */}
            <div className="p-3 bg-[var(--bg-stone)]/50 rounded-[1px] border border-[var(--border-light)]/60 flex flex-col justify-between space-y-1">
              <span className="text-[9.5px] font-bold text-[var(--text-graphite-muted)] uppercase tracking-wider">
                ANOMALY ASSESSMENT
              </span>
              <span className="font-heading text-base font-bold text-[var(--text-charcoal)]">
                ANOMALY INDEX: 04.5 / 100
              </span>
              <span className="text-[10px] text-[var(--text-graphite-muted)]">
                EXPECTED OPERATING BAND
              </span>
            </div>

            {/* ACTIVE RULE EVENTS */}
            <div className="p-3 bg-white border border-[var(--accent-copper)]/60 rounded-[1px] flex flex-col justify-between space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-bold text-[var(--accent-copper)] uppercase tracking-wider">
                  ACTIVE RULE EVENTS
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)]" />
              </div>
              <span className="font-heading text-sm font-bold text-[var(--accent-copper)] truncate">
                1 ACTIVE RULE EVENT
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-charcoal)]">
                BELT MISALIGNMENT TREND
              </span>
            </div>
          </div>

          {/* Compact 6-Channel Telemetry Strip */}
          <div className="pt-2 border-t border-[var(--border-light)]/30 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10.5px] text-[var(--text-graphite-muted)]">
            <span className="text-[9.5px] font-semibold uppercase tracking-widest text-[var(--text-charcoal)]">
              SIMULATED TELEMETRY STRIP:
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>01 TEMP: <strong className="text-[var(--text-charcoal)]">41.0°C</strong></span>
              <span>/</span>
              <span>02 VIB: <strong className="text-[var(--text-charcoal)]">0.27 mm/s</strong></span>
              <span>/</span>
              <span>03 CURR: <strong className="text-[var(--text-charcoal)]">4.15A</strong></span>
              <span>/</span>
              <span>04 SPEED: <strong className="text-[var(--text-charcoal)]">1.8 m/s</strong></span>
              <span>/</span>
              <span>05 ALIGN: <strong className="text-[var(--accent-copper)]">+3.8 mm</strong></span>
              <span>/</span>
              <span>06 LOAD: <strong className="text-[var(--text-charcoal)]">60%</strong></span>
            </div>
          </div>
        </div>

        {/* CTA Link to /control-center Route */}
        <div
          ref={ctaRef}
          className="mt-8 flex flex-col items-center text-center space-y-2"
        >
          <Link
            href="/control-center"
            className="group relative inline-flex items-center gap-3 py-3.5 px-8 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-heading text-sm sm:text-base font-bold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
          >
            <span>ENTER CONTROL CENTER</span>
            <span className="font-mono transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
          <div className="font-mono text-[10.5px] text-[var(--text-graphite-muted)] uppercase tracking-widest">
            LAUNCH OPERATIONAL SOFTWARE ENVIRONMENT
          </div>
        </div>
      </Container>
    </section>
  );
}
