"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { useGSAP } from "@/hooks/useGSAP";
import { gsap } from "@/lib/gsap";

export default function DigitalTwinPreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Reveal section label, headline, and description
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

      // 2. Canvas Reveal
      if (previewCanvasRef.current) {
        gsap.fromTo(
          previewCanvasRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: previewCanvasRef.current,
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
      id="digital-twin-preview"
      ref={sectionRef}
      className="relative w-full min-h-[75vh] lg:min-h-[80vh] py-10 md:py-14 bg-[var(--bg-stone)] border-t border-[var(--border-light)]/40 text-[var(--text-charcoal)] flex flex-col justify-center overflow-hidden select-none"
    >
      <Container className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left ~38% (5 Cols): Editorial Identity & CTAs */}
          <div className="lg:col-span-5 flex flex-col space-y-5">
            {/* Section Numbering & Identity */}
            <div
              ref={labelRef}
              className="font-mono text-xs md:text-sm font-semibold tracking-[0.2em] text-[var(--text-graphite-muted)] uppercase flex items-center gap-3"
            >
              <span className="text-[var(--accent-copper)] font-bold">07</span>
              <span className="opacity-40">/</span>
              <span>DIGITAL TWIN</span>
            </div>

            {/* Headline */}
            <h2
              ref={titleRef}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.02] text-[var(--text-charcoal)]"
            >
              See Condition <br />
              <span className="text-[var(--accent-copper)]">in Physical Context.</span>
            </h2>

            {/* Supporting Copy */}
            <p
              ref={descriptionRef}
              className="font-sans text-xs sm:text-sm text-[var(--text-graphite-muted)] font-light leading-relaxed"
            >
              The Digital Twin maps live conveyor telemetry, condition assessment and rule events to the physical operating zones of Conveyor BC-01, giving operators spatial clarity for what is changing and where.
            </p>

            {/* Technical Disclosure Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-amber-500/10 border border-amber-500/25 text-[10px] font-mono font-bold text-amber-900 w-fit">
              <span>PROTOTYPE DIGITAL TWIN</span>
              <span className="opacity-40">//</span>
              <span className="font-normal opacity-80">CLOUD SYNTHETIC TELEMETRY</span>
            </div>

            {/* Micro Data Context Pipeline Strip */}
            <div className="pt-2 border-t border-[var(--border-light)]/40 font-mono text-[10px] text-[var(--text-graphite-muted)] space-y-2">
              <div className="font-bold text-[var(--text-charcoal)] tracking-wider uppercase text-[9px]">
                SPATIAL MAPPING PIPELINE
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-bold text-[var(--text-charcoal)]">
                <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)] rounded-[1px]">TELEMETRY</span>
                <span className="text-[var(--text-graphite-muted)]">→</span>
                <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)] rounded-[1px]">CONDITION</span>
                <span className="text-[var(--text-graphite-muted)]">→</span>
                <span className="px-1.5 py-0.5 bg-white border border-[var(--border-light)] rounded-[1px]">ZONE MAPPING</span>
                <span className="text-[var(--text-graphite-muted)]">→</span>
                <span className="px-1.5 py-0.5 bg-[var(--accent-copper)] text-white rounded-[1px]">CONTEXT</span>
              </div>
            </div>

            {/* CTA Hierarchy */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Link
                href="/digital-twin"
                className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] font-heading text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--accent-copper)] hover:shadow-md cursor-pointer"
              >
                <span>OPEN DIGITAL TWIN</span>
                <span className="font-mono transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </Link>

              <Link
                href="/control-center"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[2px] border border-[var(--border-light)] text-[var(--text-charcoal)] font-mono text-xs font-semibold tracking-wider uppercase hover:border-[var(--accent-copper)] hover:text-[var(--accent-copper)] transition-colors duration-200 cursor-pointer bg-white/50"
              >
                <span>ENTER CONTROL CENTER</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right ~62% (7 Cols): Lightweight Static Digital Twin Canvas Preview */}
          <div className="lg:col-span-7" ref={previewCanvasRef}>
            <Link href="/digital-twin" className="block group">
              <div className="relative w-full bg-[#0b1329] rounded-[2px] border border-slate-800 p-4 md:p-6 shadow-xl transition-all duration-300 group-hover:border-[var(--accent-copper)] font-mono text-xs overflow-hidden">
                {/* Visual Canvas Top Identity */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-copper)] animate-pulse" />
                    <span className="font-bold text-[var(--accent-copper)] tracking-wider">BC-01 // DIGITAL TWIN MODEL</span>
                  </div>
                  <div className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-[1px] border border-amber-500/30 font-bold">
                    LIVE EXPERIENCE AVAILABLE →
                  </div>
                </div>

                {/* SVG Conveyor Silhouette Representation */}
                <div className="relative w-full aspect-[800/300] bg-slate-950/90 rounded-[2px] border border-slate-800/80 overflow-hidden">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 300"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background Grid */}
                    <defs>
                      <pattern id="previewGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#previewGrid)" />

                    {/* Structural Support Frame */}
                    <line x1="60" y1="190" x2="740" y2="190" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
                    <line x1="100" y1="190" x2="100" y2="240" stroke="#475569" strokeWidth="3" />
                    <line x1="280" y1="190" x2="280" y2="240" stroke="#475569" strokeWidth="3" />
                    <line x1="410" y1="190" x2="410" y2="240" stroke="#475569" strokeWidth="3" />
                    <line x1="560" y1="190" x2="560" y2="240" stroke="#475569" strokeWidth="3" />
                    <line x1="700" y1="190" x2="700" y2="240" stroke="#475569" strokeWidth="3" />

                    {/* Drive Head Section (Zone A) */}
                    <rect x="40" y="150" width="45" height="38" fill="#1e293b" stroke="#f97316" strokeWidth="1.5" rx="2" />
                    <text x="62" y="173" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontWeight="bold">MOTOR</text>
                    <line x1="85" y1="170" x2="105" y2="140" stroke="#f97316" strokeWidth="2.5" />
                    <circle cx="105" cy="140" r="28" fill="#1e293b" stroke="#ea580c" strokeWidth="3" />

                    {/* Tail Section (Zone E) */}
                    <circle cx="700" cy="140" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />

                    {/* Carrying Belt Strand */}
                    <line x1="105" y1="112" x2="700" y2="116" stroke="#e2e8f0" strokeWidth="5" />

                    {/* Return Belt Strand */}
                    <line x1="105" y1="168" x2="700" y2="164" stroke="#64748b" strokeWidth="4" strokeDasharray="8 4" />

                    {/* Monitored Splice Joint S1 (Zone C) */}
                    <g onMouseEnter={() => setHoveredZone("Splice S1")} onMouseLeave={() => setHoveredZone(null)}>
                      <line x1="410" y1="106" x2="410" y2="122" stroke="#f59e0b" strokeWidth="4" className="animate-pulse" />
                      <line x1="406" y1="106" x2="414" y2="122" stroke="#f59e0b" strokeWidth="2" />
                      <rect x="360" y="85" width="100" height="15" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" rx="2" />
                      <text x="410" y="96" textAnchor="middle" fill="#f59e0b" fontSize="7.5" fontWeight="bold">
                        ★ MONITORED SPLICE S1
                      </text>
                    </g>

                    {/* Tracking Zone (Zone D) */}
                    <g onMouseEnter={() => setHoveredZone("Tracking Zone D")} onMouseLeave={() => setHoveredZone(null)}>
                      <rect x="520" y="145" width="80" height="26" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="2" />
                      <text x="560" y="156" textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="bold">
                        TRACKING ZONE D
                      </text>
                      <line x1="535" y1="163" x2="585" y2="163" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="560" cy="163" r="3" fill="#10b981" />
                    </g>

                    {/* Chute Hopper (Zone E) */}
                    <polygon points="680,45 720,45 705,100 695,100" fill="#1e293b" stroke="#ea580c" strokeWidth="1" />
                    <text x="700" y="40" textAnchor="middle" fill="#cbd5e1" fontSize="7" fontWeight="bold">CHUTE</text>

                    {/* Representative Sensor Hotspot Markers */}
                    <g>
                      {/* T-01 */}
                      <circle cx="95" cy="100" r="4" fill="#0f172a" stroke="#ea580c" strokeWidth="1.5" />
                      <rect x="75" y="80" width="40" height="14" fill="#0f172a" stroke="#ea580c" strokeWidth="1" rx="1" />
                      <text x="95" y="90" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">T-01</text>

                      {/* V-01 */}
                      <circle cx="105" cy="175" r="4" fill="#0f172a" stroke="#ea580c" strokeWidth="1.5" />
                      <rect x="85" y="185" width="40" height="14" fill="#0f172a" stroke="#ea580c" strokeWidth="1" rx="1" />
                      <text x="105" y="195" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">V-01</text>

                      {/* A-01 */}
                      <circle cx="560" cy="180" r="4" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                      <rect x="540" y="190" width="40" height="14" fill="#0f172a" stroke="#10b981" strokeWidth="1" rx="1" />
                      <text x="560" y="200" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">A-01</text>

                      {/* L-01 */}
                      <circle cx="720" cy="100" r="4" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                      <rect x="700" y="80" width="40" height="14" fill="#0f172a" stroke="#10b981" strokeWidth="1" rx="1" />
                      <text x="720" y="90" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">L-01</text>
                    </g>
                  </svg>
                </div>

                {/* Bottom Interactive Prompt */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <div>
                    {hoveredZone ? (
                      <span className="text-[var(--accent-copper)] font-bold uppercase">
                        FOCUS: {hoveredZone}
                      </span>
                    ) : (
                      <span>HOVER ZONES TO EXPLORE SPATIAL MAPPING</span>
                    )}
                  </div>
                  <div className="font-bold text-[var(--accent-copper)] group-hover:underline flex items-center gap-1">
                    <span>EXPLORE FULL INTERACTIVE TWIN</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
