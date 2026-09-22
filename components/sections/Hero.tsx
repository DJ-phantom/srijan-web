"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import Container from "@/components/layout/Container";
import Header from "@/components/layout/Header";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface HeroProps {
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
}

export default function Hero({ isMenuOpen = false, onToggleMenu }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const footerDetailRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const callout1Ref = useRef<HTMLDivElement>(null);
  const callout2Ref = useRef<HTMLDivElement>(null);
  const callout3Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    // 1. Image scale settlement on load
    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { scale: 1.06 },
        { scale: 1, duration: 1.8, ease: "power2.out" },
        0
      );
    }

    // 2. Header fade in
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 1.0 },
        0.2
      );
    }

    // 3. Technical annotation reveal
    if (badgeRef.current) {
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.4
      );
    }

    // 4. Eyebrow reveal
    if (eyebrowRef.current) {
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.5
      );
    }

    // 5. Sequential line mask reveal for Headline
    if (headlineRef.current) {
      const lineElements = headlineRef.current.querySelectorAll(".line-reveal-inner");
      if (lineElements.length > 0) {
        tl.fromTo(
          lineElements,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" },
          0.6
        );
      }
    }

    // 6. Supporting copy reveal
    if (descriptionRef.current) {
      tl.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9 },
        1.0
      );
    }

    // 7. Actions / CTA reveal
    if (actionsRef.current) {
      tl.fromTo(
        actionsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9 },
        1.2
      );
    }

    // 8. Callout annotations reveal over image
    tl.fromTo(
      [callout1Ref.current, callout2Ref.current, callout3Ref.current],
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.7, stagger: 0.15 },
      1.3
    );

    // 9. Footer tech detail & scroll indicator reveal
    if (footerDetailRef.current && scrollCueRef.current) {
      tl.fromTo(
        [footerDetailRef.current, scrollCueRef.current],
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        1.5
      );
    }

    // 10. ScrollTrigger Parallax Effect on Scroll Away
    const trigger = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (imageRef.current) {
          gsap.set(imageRef.current, { scale: 1 + progress * 0.05 });
        }
        if (contentRef.current) {
          gsap.set(contentRef.current, {
            y: progress * -70,
            opacity: Math.max(0, 1 - progress * 1.2),
          });
        }
        if (footerDetailRef.current) {
          gsap.set(footerDetailRef.current, { y: progress * -30 });
        }
      },
    });

    // 11. Subtle Mouse Parallax (Desktop non-touch only, max 6px shift)
    const isTouchOrReduced =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isTouchOrReduced && imageRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        const { innerWidth, innerHeight } = window;
        const xNorm = (e.clientX / innerWidth - 0.5) * 2;
        const yNorm = (e.clientY / innerHeight - 0.5) * 2;

        gsap.to(imageRef.current, {
          x: xNorm * 6,
          y: yNorm * 6,
          duration: 1.2,
          ease: "power1.out",
          overwrite: "auto",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        trigger.kill();
      };
    }

    return () => {
      trigger.kill();
    };
  }, heroRef);

  return (
    <section
      id="main-hero-section"
      ref={heroRef}
      className="relative w-full h-[100svh] min-h-[700px] max-h-[1100px] overflow-hidden bg-[var(--bg-stone)] flex flex-col justify-between transition-transform duration-700 ease-out origin-center"
    >
      {/* Golden-Hour Conveyor Background Image Container */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
      >
        <Image
          src="/images/golden_hour_ore_conveyer_minescape.png"
          alt="Golden hour iron-ore conveyor mining infrastructure"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center] lg:object-right-center filter brightness-[0.98] contrast-[1.02]"
        />

        {/* 3 Subtle Engineering Sensor Callouts Integrated Over Image */}
        <div
          ref={callout1Ref}
          className="hidden md:flex absolute top-[30%] right-[18%] lg:right-[22%] items-center gap-2 select-none z-10"
        >
          <div className="w-2.5 h-2.5 rounded-full border border-[var(--accent-copper)] flex items-center justify-center bg-white/90 shadow-sm">
            <div className="w-1 h-1 rounded-full bg-[var(--accent-copper)]" />
          </div>
          <div className="h-[1px] w-6 bg-[var(--accent-copper)]/60" />
          <div className="font-mono text-[10px] tracking-wider uppercase font-semibold text-[var(--text-charcoal)] bg-white/80 backdrop-blur-xs px-2 py-0.5 border border-[var(--border-light)] rounded-[2px]">
            BELT SPEED SENSOR // S-01
          </div>
        </div>

        <div
          ref={callout2Ref}
          className="hidden md:flex absolute top-[54%] right-[8%] lg:right-[12%] items-center gap-2 select-none z-10"
        >
          <div className="w-2.5 h-2.5 rounded-full border border-[var(--accent-copper)] flex items-center justify-center bg-white/90 shadow-sm">
            <div className="w-1 h-1 rounded-full bg-[var(--accent-copper)]" />
          </div>
          <div className="h-[1px] w-6 bg-[var(--accent-copper)]/60" />
          <div className="font-mono text-[10px] tracking-wider uppercase font-semibold text-[var(--text-charcoal)] bg-white/80 backdrop-blur-xs px-2 py-0.5 border border-[var(--border-light)] rounded-[2px]">
            TEMP NODE // T-03
          </div>
        </div>

        <div
          ref={callout3Ref}
          className="hidden lg:flex absolute top-[72%] right-[28%] items-center gap-2 select-none z-10"
        >
          <div className="w-2.5 h-2.5 rounded-full border border-[var(--accent-copper)] flex items-center justify-center bg-white/90 shadow-sm">
            <div className="w-1 h-1 rounded-full bg-[var(--accent-copper)]" />
          </div>
          <div className="h-[1px] w-6 bg-[var(--accent-copper)]/60" />
          <div className="font-mono text-[10px] tracking-wider uppercase font-semibold text-[var(--text-charcoal)] bg-white/80 backdrop-blur-xs px-2 py-0.5 border border-[var(--border-light)] rounded-[2px]">
            VIBRATION NODE // V-02
          </div>
        </div>

        {/* Tightened Warm Gradient Overlay for Left Text Readability & High Conveyor Contrast */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[50%] lg:w-[42%] xl:w-[38%] bg-gradient-to-r from-[var(--bg-stone)] via-[var(--bg-stone)]/70 via-40% to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-stone)] to-transparent pointer-events-none" />
      </div>

      {/* Header Overlay */}
      <div ref={headerRef} className="relative z-20 w-full">
        <Header isMenuOpen={isMenuOpen} onToggleMenu={onToggleMenu} />
      </div>

      {/* Hero Content Area */}
      <div
        ref={contentRef}
        className="relative z-10 my-auto py-8 w-full will-change-transform"
      >
        <Container className="flex flex-col items-start max-w-4xl">
          {/* Clarified Human-Readable BC-01 Technical Annotation */}
          <div
            ref={badgeRef}
            className="mb-5 flex flex-col items-start gap-0.5 font-mono text-xs tracking-wider text-[var(--text-charcoal)] select-none"
          >
            <span className="text-[10px] font-semibold text-[var(--text-graphite-muted)] tracking-widest uppercase opacity-80">
              BELT CONVEYOR 01
            </span>
            <div className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
              <span className="font-semibold uppercase">BC-01</span>
              <span className="text-[var(--text-graphite-muted)] font-light">/</span>
              <span className="text-[var(--text-graphite-muted)] font-normal uppercase">
                MONITORING ACTIVE
              </span>
            </div>
          </div>

          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            className="mb-3 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-[var(--accent-copper)]"
          >
            INTELLIGENCE FOR INDUSTRIAL MOTION
          </div>

          {/* Main Editorial Headline with GSAP Line Mask Reveal */}
          <h1
            ref={headlineRef}
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-bold tracking-tight leading-[0.92] text-[var(--text-charcoal)] mb-6"
          >
            <div className="overflow-hidden py-0.5">
              <span className="line-reveal-inner block will-change-transform">
                Predict Failure
              </span>
            </div>
            <div className="overflow-hidden py-0.5">
              <span className="line-reveal-inner block will-change-transform text-[var(--text-charcoal)]">
                Before It Stops
              </span>
            </div>
            <div className="overflow-hidden py-0.5">
              <span className="line-reveal-inner block will-change-transform text-[var(--accent-copper)]">
                Production.
              </span>
            </div>
          </h1>

          {/* Supporting Copy */}
          <p
            ref={descriptionRef}
            className="font-sans text-lg sm:text-xl md:text-2xl font-light text-[var(--text-graphite-muted)] max-w-xl leading-relaxed mb-8 md:mb-10"
          >
            AI-powered conveyor intelligence designed to turn machine signals into early warnings and actionable insight.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div
            ref={actionsRef}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            {/* Primary CTA */}
            <button
              onClick={() => {
                const el = document.getElementById("problem-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:py-4 rounded-[4px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-sans text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-copper)] cursor-pointer"
            >
              <span>EXPLORE PLATFORM</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>

            {/* Secondary CTA */}
            <button
              onClick={() => {
                const el = document.getElementById("control-center-preview");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 sm:py-4 rounded-[4px] text-[var(--text-charcoal)] hover:text-[var(--accent-copper)] font-sans text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full border border-[var(--border-light)] group-hover:border-[var(--accent-copper)] transition-colors">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </span>
              <span>WATCH SYSTEM DEMO</span>
            </button>
          </div>
        </Container>
      </div>

      {/* Hero Bottom Bar / Technical Detail & Scroll Indicator */}
      <div className="relative z-10 w-full py-6">
        <Container className="flex items-end justify-between border-t border-[var(--border-light)]/40 pt-4">
          {/* Subtle Technical Detail */}
          <div
            ref={footerDetailRef}
            className="font-mono text-[11px] text-[var(--text-graphite-muted)] tracking-widest uppercase flex items-center gap-2.5"
          >
            <span className="inline-block w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full" />
            <span>IRON ORE OPERATIONS &nbsp;/&nbsp; CONVEYOR INTELLIGENCE</span>
          </div>

          {/* Scroll Cue Indicator */}
          <div
            ref={scrollCueRef}
            className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-graphite-muted)] tracking-widest uppercase select-none"
          >
            <span>SCROLL TO EXPLORE</span>
            <span className="inline-block animate-bounce">↓</span>
          </div>
        </Container>
      </div>
    </section>
  );
}
