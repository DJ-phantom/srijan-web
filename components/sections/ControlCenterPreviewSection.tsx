"use client";

import { useRef } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import {
  HealthOverview,
  ConveyorMap,
  AlertList,
  ConditionSummary,
  SensorTrend,
  LocalDisplay,
} from "@/components/control-center/DashboardPanels";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Control Center Preview Window Reveal (y: 80px -> 0, scale: 0.96 -> 1)
      if (previewWindowRef.current) {
        gsap.fromTo(
          previewWindowRef.current,
          { opacity: 0, y: 80, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: previewWindowRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. CTA Reveal
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: ctaRef.current,
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
      id="control-center-preview"
      ref={sectionRef}
      className="relative w-full min-h-[85vh] lg:min-h-[95vh] py-14 md:py-20 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden"
    >
      <Container className="relative z-10 w-full">
        {/* Header Block: Section Label + Headline */}
        <div className="flex flex-col items-start max-w-3xl mb-10 md:mb-14">
          <div
            ref={labelRef}
            className="mb-4 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3"
          >
            <span className="text-[var(--accent-copper)]">07</span>
            <span className="opacity-40">/</span>
            <span>CONTROL CENTER</span>
          </div>

          <h2
            ref={titleRef}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-[var(--text-charcoal)] mb-4"
          >
            Everything <br />
            <span className="text-[var(--accent-copper)]">Comes Together Here.</span>
          </h2>

          <p
            ref={descriptionRef}
            className="font-sans text-base sm:text-lg font-light text-[var(--text-graphite-muted)] leading-relaxed"
          >
            A unified operational view brings conveyor condition, location, alerts and system context together so operators can understand what deserves attention.
          </p>
        </div>

        {/* Large Control Center React Application Preview Window */}
        <div
          ref={previewWindowRef}
          className="relative w-full rounded-[4px] bg-[var(--bg-stone)]/90 border border-[var(--border-light)]/60 shadow-md p-4 sm:p-6 lg:p-8 font-mono text-xs space-y-6"
        >
          {/* Window Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-light)]/40">
            <div className="flex items-center gap-3">
              <span className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                SRIJAN<span className="text-[var(--accent-copper)]">.</span>
              </span>
              <span className="text-[11px] font-semibold text-[var(--text-graphite-muted)] uppercase tracking-wider">
                CONTROL CENTER PREVIEW // BC-01
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)]/15 border border-[var(--accent-copper)]/40 text-[var(--accent-copper)] font-bold text-[10px] uppercase">
                SIMULATED SYSTEM VIEW
              </span>
            </div>
          </div>

          {/* Grid Layout of Simplified Dashboard Panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-6">
              <HealthOverview />
              <LocalDisplay />
            </div>

            <div className="md:col-span-8 space-y-6">
              <ConveyorMap />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AlertList />
                <SensorTrend />
              </div>
            </div>
          </div>

          {/* Full Condition Summary Bar */}
          <div className="pt-2">
            <ConditionSummary />
          </div>
        </div>

        {/* Prominent CTA Link to /control-center Route */}
        <div
          ref={ctaRef}
          className="mt-14 flex flex-col items-center text-center space-y-4"
        >
          <Link
            href="/control-center"
            className="group relative inline-flex items-center gap-4 py-4 px-10 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-heading text-lg sm:text-xl font-bold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
          >
            <span>ENTER CONTROL CENTER</span>
            <span className="font-mono transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </Link>
          <div className="font-mono text-[11px] text-[var(--text-graphite-muted)] uppercase tracking-widest">
            LAUNCH OPERATIONAL SOFTWARE ENVIRONMENT
          </div>
        </div>
      </Container>
    </section>
  );
}
