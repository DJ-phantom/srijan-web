"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

const failureSignals = [
  {
    id: "01",
    title: "EXCESS VIBRATION",
    subtitle: "Early indication of abnormal mechanical behaviour or developing component degradation.",
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // Vibration path
    isSplice: false,
  },
  {
    id: "02",
    title: "BELT MISALIGNMENT",
    subtitle: "Lateral belt drift can indicate tracking problems and accelerate edge wear.",
    icon: "M4 8h16M4 16h16M8 4v16M16 4v16", // Alignment grid
    isSplice: false,
  },
  {
    id: "03",
    title: "SPLICE DEGRADATION",
    subtitle: "Changes in vibration and alignment can reveal abnormal behaviour around a monitored joint.",
    icon: "M8 7h8M8 12h8M8 17h8", // Splice indicator
    isSplice: true,
  },
  {
    id: "04",
    title: "ABNORMAL TEMPERATURE",
    subtitle: "Rising temperature may indicate friction, overload, or mechanical stress.",
    icon: "M12 2v10m0 0a4 4 0 100 8 4 4 0 000-8z", // Thermometer
    isSplice: false,
  },
  {
    id: "05",
    title: "MOTOR LOAD VARIATION",
    subtitle: "Changes in current and load can indicate increased resistance or abnormal operating conditions.",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2", // Pulse wave
    isSplice: false,
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const secondaryHeadlineRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const signalsListRef = useRef<HTMLDivElement>(null);
  const photoCropRef = useRef<HTMLDivElement>(null);
  const imageParallaxRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
      });

      // 1. Label reveal
      if (labelRef.current) {
        tl.fromTo(
          labelRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6 }
        );
      }

      // 2. Primary headline reveal
      if (headlineRef.current) {
        const lines = headlineRef.current.querySelectorAll(".line-reveal-inner");
        if (lines.length > 0) {
          tl.fromTo(
            lines,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.85, stagger: 0.08, ease: "power4.out" },
            "-=0.3"
          );
        }
      }

      // 3. Emphasized line reveal
      if (secondaryHeadlineRef.current) {
        const line = secondaryHeadlineRef.current.querySelector(".line-reveal-inner");
        if (line) {
          tl.fromTo(
            line,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.9, ease: "power4.out" },
            "-=0.3"
          );
        }
      }

      // 4. Supporting text reveal
      if (copyRef.current) {
        tl.fromTo(
          copyRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        );
      }

      // 5. Signals list reveal
      if (signalsListRef.current) {
        const signalItems = signalsListRef.current.querySelectorAll(".signal-item");
        tl.fromTo(
          signalItems,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.06 },
          "-=0.5"
        );
      }

      // 6. Splice image enters slowly from right
      if (photoCropRef.current) {
        tl.fromTo(
          photoCropRef.current,
          { opacity: 0, x: 25 },
          { opacity: 1, x: 0, duration: 1.0, ease: "power2.out" },
          "-=0.7"
        );
      }

      // 7. Technical annotation badge appears last
      if (badgeRef.current) {
        tl.fromTo(
          badgeRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );
      }

      // Subtle parallax on the splice reference image
      if (imageParallaxRef.current) {
        gsap.to(imageParallaxRef.current, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, sectionRef);

  return (
    <section
      id="problem-section"
      ref={sectionRef}
      className="relative w-full min-h-[85vh] lg:min-h-[92vh] py-16 md:py-24 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden select-none"
    >
      <Container className="w-full">
        {/* Section Index Header / Label */}
        <div
          ref={labelRef}
          className="mb-8 md:mb-12 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3"
        >
          <span className="text-[var(--accent-copper)]">01</span>
          <span className="opacity-40">/</span>
          <span>THE PROBLEM</span>
        </div>

        {/* Editorial Asymmetric Grid: LEFT ~40% (5 Cols) / CENTER ~33% (4 Cols) / RIGHT ~27% (3 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (5 Cols / ~40% Width): Problem Statement */}
          <div className="lg:col-span-5 flex flex-col items-start space-y-5">
            <h2
              ref={headlineRef}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-[var(--text-charcoal)]"
            >
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform">
                  Failures Rarely
                </span>
              </div>
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform text-[var(--text-charcoal)]">
                  Happen Without
                </span>
              </div>
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform text-[var(--text-charcoal)]">
                  Warning.
                </span>
              </div>
            </h2>

            {/* Secondary Emphasized Statement */}
            <div
              ref={secondaryHeadlineRef}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-[var(--accent-copper)]"
            >
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform">
                  They Begin as Signals.
                </span>
              </div>
            </div>

            {/* Supporting Copy */}
            <div
              ref={copyRef}
              className="space-y-3 pt-1 font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed max-w-md"
            >
              <p>
                Temperature rises. Vibration patterns change. Alignment drifts. Motor load increases. Splice-related vibration and alignment patterns begin to deviate.
              </p>
              <p className="text-[var(--text-charcoal)] font-medium pt-0.5">
                Individually, these changes may appear minor. Together, they can reveal the early stages of belt, splice, or drive-system degradation.
              </p>
            </div>
          </div>

          {/* Center Column (4 Cols / ~33% Width): Condition Signals with Refined Legibility */}
          <div className="lg:col-span-4 relative flex flex-col pl-4 sm:pl-6 border-l border-[var(--border-light)]/40">
            {/* Subtle Vertical Copper Path Line */}
            <div className="absolute left-0 top-2 bottom-2 w-[1.5px] bg-[var(--accent-copper)]/30 pointer-events-none" />

            <div ref={signalsListRef} className="flex flex-col">
              {failureSignals.map((signal, index) => {
                const isHovered = hoveredIndex === index;
                const isSplice = signal.isSplice;

                return (
                  <div
                    key={signal.id}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`signal-item relative flex items-start gap-3.5 py-3.5 border-b border-[var(--border-light)]/35 last:border-b-0 transition-all duration-300 ease-out cursor-default group ${
                      isSplice ? "bg-[var(--accent-copper)]/[0.04] -mx-3 px-3 rounded-[2px]" : ""
                    }`}
                  >
                    {/* Signal Node Marker */}
                    <div
                      className={`absolute -left-[21px] sm:-left-[29px] top-4.5 w-2 h-2 rounded-full transition-all duration-300 ${
                        isSplice
                          ? "bg-[var(--accent-copper)] border border-[var(--accent-copper)] scale-125 shadow-[0_0_8px_rgba(200,90,50,0.5)]"
                          : isHovered
                          ? "bg-[var(--accent-copper)] border border-[var(--accent-copper)] scale-110"
                          : "bg-[var(--bg-stone)] border border-[var(--accent-copper)]/50"
                      }`}
                    />

                    {/* Engineering Line Icon */}
                    <div className="mt-1 text-[var(--accent-copper)] flex-shrink-0 opacity-85 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={signal.icon} />
                      </svg>
                    </div>

                    {/* Content & Micro Details */}
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-[var(--accent-copper)]">
                            {signal.id}
                          </span>
                          <span
                            className={`font-sans text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-200 ${
                              isSplice
                                ? "text-[var(--accent-copper)] font-bold"
                                : isHovered
                                ? "text-[var(--accent-copper)]"
                                : "text-[var(--text-charcoal)]"
                            }`}
                          >
                            {signal.title}
                          </span>
                        </div>

                        {/* Subtle Copper Leader Line visually pointing towards the right splice image */}
                        {isSplice && (
                          <span className="hidden sm:inline-block w-8 h-[1px] bg-gradient-to-r from-[var(--accent-copper)]/70 to-transparent" />
                        )}
                      </div>

                      <p className="font-sans text-xs sm:text-[13px] text-[var(--text-graphite-muted)] font-light leading-relaxed">
                        {signal.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (3 Cols / ~27% Width): Strong Clear Mechanical Splice Image */}
          <div
            ref={photoCropRef}
            className="hidden lg:block lg:col-span-3 relative h-[440px] md:h-[480px] rounded-[2px] overflow-hidden group"
          >
            {/* Parallax Container */}
            <div ref={imageParallaxRef} className="absolute -top-[10%] -bottom-[10%] inset-x-0 w-full h-[120%]">
              <Image
                src="/images/splice_ref_img_1.png"
                alt="Conveyor mechanical joint splice detailed photographic crop"
                fill
                sizes="30vw"
                priority
                className="object-cover object-[25%_50%] filter brightness-[0.97] contrast-[1.05] transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Subtle Edge Dissolve Masks (Soft Canvas Blend) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-stone)]/90 via-transparent to-[var(--bg-stone)]/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-stone)]/30 via-transparent to-transparent pointer-events-none" />
            
            {/* Simplified Minimal Technical Annotation */}
            <div
              ref={badgeRef}
              className="absolute bottom-4 left-4 font-mono text-[10px] sm:text-[11px] tracking-widest text-[var(--text-charcoal)] uppercase font-medium flex items-center gap-2 drop-shadow-xs pointer-events-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
              <span>BELT + SPLICE HEALTH</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

