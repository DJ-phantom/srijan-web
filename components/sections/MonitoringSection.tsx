"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

const monitoringChannels = [
  {
    id: "01",
    title: "TEMPERATURE",
    description: "Observe thermal behaviour around monitored components.",
    icon: "M12 2v10m0 0a4 4 0 100 8 4 4 0 000-8z", // Thermometer
  },
  {
    id: "02",
    title: "VIBRATION",
    description: "Track changes in mechanical vibration and operating behaviour.",
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // Vibration
  },
  {
    id: "03",
    title: "ALIGNMENT",
    description: "Monitor lateral belt position and developing tracking drift.",
    icon: "M4 8h16M4 16h16M8 4v16M16 4v16", // Alignment
  },
  {
    id: "04",
    title: "MOTOR CURRENT",
    description: "Observe electrical load variation during conveyor operation.",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2", // Pulse wave / current
  },
  {
    id: "05",
    title: "BELT SPEED",
    description: "Track belt movement and operating speed.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", // Tachometer / speed
  },
  {
    id: "06",
    title: "LOAD",
    description: "Monitor conveyor loading / force conditions using the prototype sensing layer.",
    icon: "M3 6h18M6 12h12M9 18h6", // Force / load lines
  },
];

export default function MonitoringSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const imageParallaxRef = useRef<HTMLDivElement>(null);
  const channelsIndexRef = useRef<HTMLDivElement>(null);
  const resolutionRef = useRef<HTMLDivElement>(null);

  // Default active channel is 02 / VIBRATION (index 1)
  const [activeChannelIndex, setActiveChannelIndex] = useState<number>(1);

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

      // 2. Headline mask reveal
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

      // 3. Supporting copy & status reveal
      if (copyRef.current) {
        tl.fromTo(
          [copyRef.current, statusRef.current],
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
          "-=0.4"
        );
      }

      // 4. Primary Monitoring reference image reveals from right
      if (photoContainerRef.current) {
        tl.fromTo(
          photoContainerRef.current,
          { opacity: 0, x: 25 },
          { opacity: 1, x: 0, duration: 1.0, ease: "power2.out" },
          "-=0.6"
        );
      }

      // 5. Six-channel index reveals with stagger
      if (channelsIndexRef.current) {
        const items = channelsIndexRef.current.querySelectorAll(".channel-item");
        tl.fromTo(
          items,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 },
          "-=0.4"
        );
      }

      // 6. Resolution summary reveal
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

      // Restrained image parallax effect
      if (imageParallaxRef.current) {
        gsap.to(imageParallaxRef.current, {
          yPercent: 5,
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
      id="monitoring"
      ref={sectionRef}
      className="relative w-full min-h-[95vh] lg:min-h-[105vh] py-16 md:py-20 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden select-none"
    >
      {/* Low-Contrast Background Technical Line Geometry */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] select-none">
        <svg className="w-full h-full" width="100%" height="100%">
          <pattern
            id="industrial-grid-monitoring"
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
          <rect width="100%" height="100%" fill="url(#industrial-grid-monitoring)" />
        </svg>
      </div>

      <Container className="relative z-10 w-full">
        {/* Section Index Header / Label */}
        <div
          ref={labelRef}
          className="mb-8 md:mb-10 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3"
        >
          <span className="text-[var(--accent-copper)]">03</span>
          <span className="opacity-40">/</span>
          <span>MONITORING</span>
        </div>

        {/* Compact Desktop Composition (Left ~36% / Right ~64%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (4 Cols / ~36% Width): Section Identity & Supporting Copy */}
          <div className="lg:col-span-4 flex flex-col items-start space-y-5">
            <h2
              ref={headlineRef}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.0] text-[var(--text-charcoal)]"
            >
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform">
                  See the Conveyor
                </span>
              </div>
              <div className="overflow-hidden py-0.5">
                <span className="line-reveal-inner block will-change-transform text-[var(--accent-copper)]">
                  as It Operates.
                </span>
              </div>
            </h2>

            {/* Approved Supporting Statement */}
            <div ref={copyRef} className="space-y-3 font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed max-w-md">
              <p>
                Multiple operating signals provide a continuous view of conveyor condition.
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-graphite-muted)]/90 font-light leading-relaxed">
                The monitoring layer brings temperature, vibration, alignment, motor current, belt speed and load signals together so changes in operating behaviour can be observed in context.
              </p>
            </div>

            {/* Micro System Status Tag */}
            <div
              ref={statusRef}
              className="pt-2 font-mono text-[11px] tracking-wider text-[var(--text-graphite-muted)] uppercase flex flex-col gap-1 border-l-2 border-[var(--accent-copper)] pl-3"
            >
              <div className="flex items-center gap-2 text-[var(--text-charcoal)] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
                <span>BELT CONVEYOR 01 / BC-01</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-graphite-muted)]">
                <span>6 MONITORED SIGNAL CHANNELS</span>
                <span className="opacity-30">//</span>
                <span className="text-[var(--accent-copper)] font-semibold">PROTOTYPE MONITORING</span>
              </div>
            </div>
          </div>

          {/* Right Column (8 Cols / ~64% Width): Primary Reference Image & Technical Sensor Strip */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* Primary Monitoring Reference Image */}
            <div
              ref={photoContainerRef}
              className="relative w-full h-[340px] sm:h-[400px] lg:h-[440px] rounded-[2px] overflow-hidden group shadow-sm"
            >
              {/* Parallax Container */}
              <div ref={imageParallaxRef} className="absolute -top-[8%] -bottom-[8%] inset-x-0 w-full h-[116%]">
                <Image
                  src="/images/monitoring_section_ref_img.png"
                  alt="Monitoring Section Primary Reference Artwork - Industrial Conveyor Sensing"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  className="object-cover object-center filter brightness-[0.97] contrast-[1.05] transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>

              {/* Reduced Subtle Edge Dissolve Masks to Preserve Industrial Details */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-stone)]/25 via-transparent to-[var(--bg-stone)]/15 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-stone)]/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Technical Six-Channel Instrumentation Strip */}
            <div ref={channelsIndexRef} className="w-full pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-y border-[var(--border-light)]/40 py-2">
                {monitoringChannels.map((channel, index) => {
                  const isActive = activeChannelIndex === index;

                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannelIndex(index)}
                      onMouseEnter={() => setActiveChannelIndex(index)}
                      className={`channel-item relative flex flex-col items-start px-3 py-1.5 border-r border-[var(--border-light)]/40 last:border-r-0 font-mono transition-colors duration-200 cursor-pointer text-left ${
                        isActive
                          ? "text-[var(--text-charcoal)]"
                          : "text-[var(--text-graphite-muted)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <span className={`text-[10px] font-bold ${isActive ? "text-[var(--accent-copper)]" : "text-[var(--accent-copper)]/70"}`}>
                        {channel.id}
                      </span>
                      <span className={`text-[11px] font-semibold tracking-tight uppercase leading-tight ${isActive ? "text-[var(--accent-copper)] font-bold" : ""}`}>
                        {channel.title}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-[var(--accent-copper)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Channel Detail & Secondary Planned Vision Indicator */}
              <div className="mt-3 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                {/* Active Channel Micro Description */}
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
                  <span className="font-semibold text-[var(--accent-copper)] uppercase">
                    {monitoringChannels[activeChannelIndex].id} / {monitoringChannels[activeChannelIndex].title}
                  </span>
                  <span className="hidden sm:inline-block opacity-30">//</span>
                  <span className="hidden sm:inline-block font-sans text-xs text-[var(--text-graphite-muted)] font-light">
                    {monitoringChannels[activeChannelIndex].description}
                  </span>
                </div>

                {/* Secondary Planned Vision Badge */}
                <div className="text-[10px] tracking-wider text-[var(--text-graphite-muted)]/80 uppercase flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="opacity-50">NEXT /</span>
                  <span className="text-[var(--text-charcoal)]/80 font-medium">VISION INSPECTION →</span>
                </div>
              </div>

              {/* Mobile Active Channel Description Fallback */}
              <p className="sm:hidden mt-2 font-sans text-xs text-[var(--text-graphite-muted)] font-light leading-relaxed">
                {monitoringChannels[activeChannelIndex].description}
              </p>
            </div>
          </div>
        </div>

        {/* Narrative Resolution Bridge at End of Section */}
        <div
          ref={resolutionRef}
          className="mt-12 md:mt-16 pt-6 border-t border-[var(--border-light)]/40 flex flex-col items-center text-center space-y-2"
        >
          <div className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--text-charcoal)] uppercase">
            <span className="text-[var(--accent-copper)]">SIX SIGNALS.</span> ONE CONDITION VIEW.
          </div>

          <p className="font-mono text-[10px] sm:text-[11px] tracking-wider text-[var(--text-graphite-muted)] uppercase max-w-xl leading-relaxed">
            Monitoring shows what is changing. Assessment helps determine what deserves attention.
          </p>
        </div>
      </Container>
    </section>
  );
}

