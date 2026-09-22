"use client";

import { useRef, useState } from "react";
import Container from "@/components/layout/Container";
import DigitalTwinViewport, {
  digitalTwinHotspots,
  conveyorZones,
} from "@/components/ui/DigitalTwinViewport";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function DigitalTwinSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const viewportWrapperRef = useRef<HTMLDivElement>(null);
  const resolutionRef = useRef<HTMLDivElement>(null);

  const [activeHotspotIndex, setActiveHotspotIndex] = useState<number>(0);
  const [selectedHotspotIndex, setSelectedHotspotIndex] = useState<number | null>(null);
  const [cameraParallaxX, setCameraParallaxX] = useState<number>(0);

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

      // 2. Scroll-driven Hotspot & Camera Parallax Progression (140-160vh)
      if (viewportWrapperRef.current) {
        ScrollTrigger.create({
          trigger: viewportWrapperRef.current,
          start: "top 25%",
          end: "bottom 75%",
          scrub: 0.5,
          onUpdate: (self) => {
            const progress = self.progress;
            // Update active hotspot index as scroll advances
            const idx = Math.min(
              digitalTwinHotspots.length - 1,
              Math.floor(progress * digitalTwinHotspots.length)
            );
            setActiveHotspotIndex(idx);

            // Subtle simulated camera depth parallax shift (-15px to +15px)
            setCameraParallaxX((progress - 0.5) * 30);
          },
        });
      }

      // 3. Narrative Resolution Footer Reveal
      if (resolutionRef.current) {
        gsap.fromTo(
          resolutionRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
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
      id="digital-twin"
      ref={sectionRef}
      className="relative w-full min-h-[140vh] py-20 md:py-28 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden"
    >
      {/* Background Architectural Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] select-none">
        <svg className="w-full h-full" width="100%" height="100%">
          <pattern
            id="digital-twin-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#digital-twin-grid)" />
        </svg>
      </div>

      <Container className="relative z-10 w-full">
        {/* Header Block: Section Label + Headline */}
        <div className="flex flex-col items-start max-w-3xl mb-10 md:mb-14">
          <div
            ref={labelRef}
            className="mb-4 font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3"
          >
            <span className="text-[var(--accent-copper)]">05</span>
            <span className="opacity-40">/</span>
            <span>DIGITAL TWIN</span>
          </div>

          <h2
            ref={titleRef}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-[var(--text-charcoal)] mb-4"
          >
            One System. <br />
            <span className="text-[var(--accent-copper)]">One Living View.</span>
          </h2>

          <p
            ref={descriptionRef}
            className="font-sans text-base sm:text-lg font-light text-[var(--text-graphite-muted)] leading-relaxed"
          >
            A digital representation of the conveyor brings sensor context, equipment location and operating condition into one visual environment.
          </p>
        </div>

        {/* Central Viewport Component Wrapper */}
        <div ref={viewportWrapperRef} className="w-full">
          <DigitalTwinViewport
            activeHotspotIndex={activeHotspotIndex}
            selectedHotspotIndex={selectedHotspotIndex}
            onSelectHotspot={setSelectedHotspotIndex}
            cameraParallaxX={cameraParallaxX}
          />
        </div>

        {/* Mobile Hotspot Selector Fallback List */}
        <div className="md:hidden flex flex-col space-y-3 pt-6 border-t border-[var(--border-light)]/40">
          <div className="font-mono text-xs font-semibold tracking-widest text-[var(--accent-copper)] uppercase mb-1">
            // HOTSPOT LOCATION INDEX
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {digitalTwinHotspots.map((hotspot, idx) => (
              <button
                key={hotspot.id}
                onClick={() => setSelectedHotspotIndex(idx)}
                className={`p-2.5 rounded-[2px] border text-left flex items-center justify-between ${
                  (selectedHotspotIndex !== null ? selectedHotspotIndex : activeHotspotIndex) === idx
                    ? "bg-[var(--accent-copper)]/10 border-[var(--accent-copper)] text-[var(--text-charcoal)] font-semibold"
                    : "bg-white/60 border-[var(--border-light)] text-[var(--text-graphite-muted)]"
                }`}
              >
                <span>{hotspot.id}</span>
                <span className="text-[10px] opacity-70">{hotspot.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Narrative Resolution Footer & Lead-in to Section 06 Alerts & Response */}
        <div
          ref={resolutionRef}
          className="mt-20 md:mt-28 pt-10 border-t border-[var(--border-light)]/40 flex flex-col items-center text-center space-y-3"
        >
          <div className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--text-charcoal)] uppercase max-w-2xl leading-snug">
            KNOW WHAT IS HAPPENING<span className="text-[var(--accent-copper)]">.</span> <br />
            KNOW <span className="text-[var(--accent-copper)]">WHERE</span> IT IS HAPPENING<span className="text-[var(--accent-copper)]">.</span>
          </div>

          <p className="font-mono text-[11px] tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase pt-2">
            NEXT &nbsp;//&nbsp; 06 ALERTS &amp; RESPONSE — FROM DETECTION TO ACTION.
          </p>
        </div>
      </Container>
    </section>
  );
}
