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
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, sectionRef);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-16 md:py-24 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden select-none"
    >
      <Container className="relative z-10 w-full flex flex-col items-center text-center space-y-8">
        {/* Brand Logo & Identity */}
        <div className="flex flex-col items-center space-y-3">
          <BrandLogo />
          <div className="font-mono text-xs font-semibold tracking-[0.25em] text-[var(--text-graphite-muted)] uppercase pt-1">
            INDUSTRIAL CONVEYOR INTELLIGENCE
          </div>
        </div>

        {/* 4-Stage Motto */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-mono text-sm sm:text-base font-bold tracking-[0.2em] text-[var(--text-charcoal)] uppercase">
          <span className="text-[var(--accent-copper)]">MONITOR.</span>
          <span>UNDERSTAND.</span>
          <span className="text-[var(--accent-copper)]">ASSESS.</span>
          <span>ACT.</span>
        </div>

        {/* Supporting Attribution & Identity */}
        <div className="max-w-xl font-sans text-xs sm:text-sm font-light text-[var(--text-graphite-muted)] leading-relaxed space-y-2">
          <p>
            SRIJAN is an industrial conveyor intelligence platform developed for SIH 26008. Designed to turn machine signals into early warnings, spatial clarity, and operator decision support.
          </p>
          <div className="font-mono text-[11px] text-[var(--text-graphite-muted)]/80 tracking-wider uppercase pt-1">
            TEAM SRIJAN &nbsp;//&nbsp; SIH 2026 &nbsp;//&nbsp; PROTOTYPE TELEMETRY ENVIRONMENT
          </div>
        </div>

        {/* Dual Primary Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <Link
            href="/control-center"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-heading text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
          >
            <span>ENTER CONTROL CENTER</span>
            <span className="font-mono transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>

          <Link
            href="/digital-belt"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[4px] border border-[var(--border-light)] text-[var(--text-charcoal)] font-mono text-xs font-semibold tracking-wider uppercase hover:border-[var(--accent-copper)] hover:text-[var(--accent-copper)] transition-colors duration-200 cursor-pointer bg-white/40"
          >
            <span>EXPLORE DIGITAL BELT</span>
            <span>→</span>
          </Link>
        </div>

        {/* Minimal Bottom Rule */}
        <div className="pt-8 border-t border-[var(--border-light)]/30 w-full flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[var(--text-graphite-muted)] gap-2">
          <div>© 2026 SRIJAN CONVEYOR INTELLIGENCE</div>
          <div>SIH 26008 IMPLEMENTATION</div>
        </div>
      </Container>
    </section>
  );
}
