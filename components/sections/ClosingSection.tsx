"use client";

import { useRef } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import BrandLogo from "@/components/ui/BrandLogo";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

export default function ClosingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    gsap.fromTo(
      sectionRef.current.children,
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, sectionRef);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full min-h-[55vh] lg:min-h-[65vh] py-12 md:py-16 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-between overflow-hidden select-none"
    >
      <Container className="relative z-10 w-full flex-grow flex flex-col items-center justify-between text-center space-y-6">
        {/* Section Numbering & Identity Tag */}
        <div className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3">
          <span className="text-[var(--accent-copper)]">08</span>
          <span className="opacity-40">/</span>
          <span>ABOUT SRIJAN</span>
        </div>

        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center space-y-2">
          <BrandLogo />
          <div className="font-mono text-xs font-semibold tracking-[0.25em] text-[var(--text-graphite-muted)] uppercase">
            INDUSTRIAL CONVEYOR INTELLIGENCE
          </div>
        </div>

        {/* 4-Stage Motto */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-[var(--text-charcoal)] uppercase">
          <span className="text-[var(--accent-copper)]">MONITOR.</span>
          <span>UNDERSTAND.</span>
          <span className="text-[var(--accent-copper)]">ASSESS.</span>
          <span>ACT.</span>
        </div>

        {/* Short Project Description & Team Details */}
        <div className="max-w-xl font-sans text-xs sm:text-sm font-light text-[var(--text-graphite-muted)] leading-relaxed space-y-1.5">
          <p>
            SRIJAN is an industrial conveyor intelligence platform developed for SIH 26008. Designed to turn machine signals into early warnings, spatial clarity, and operator decision support.
          </p>
          <div className="font-mono text-[10.5px] text-[var(--text-graphite-muted)]/80 tracking-wider uppercase pt-1">
            TEAM SRIJAN &nbsp;//&nbsp; SIH 2026 &nbsp;//&nbsp; SIH26008
          </div>
        </div>

        {/* Dual Primary Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Link
            href="/control-center"
            className="group relative inline-flex items-center justify-center gap-3 px-7 py-3 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-heading text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
          >
            <span>ENTER CONTROL CENTER</span>
            <span className="font-mono transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>

          <Link
            href="/digital-belt"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] border border-[var(--border-light)] text-[var(--text-charcoal)] font-mono text-xs font-semibold tracking-wider uppercase hover:border-[var(--accent-copper)] hover:text-[var(--accent-copper)] transition-colors duration-200 cursor-pointer bg-white/40"
          >
            <span>EXPLORE DIGITAL BELT</span>
            <span>→</span>
          </Link>
        </div>

        {/* Minimal Bottom Footer */}
        <div className="pt-6 border-t border-[var(--border-light)]/30 w-full flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[var(--text-graphite-muted)] gap-2">
          <div>© 2026 SRIJAN CONVEYOR INTELLIGENCE</div>
          <div>SIH 26008 IMPLEMENTATION</div>
        </div>
      </Container>
    </section>
  );
}
