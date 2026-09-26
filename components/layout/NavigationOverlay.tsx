"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BrandLogo from "@/components/ui/BrandLogo";
import MenuTrigger from "@/components/ui/MenuTrigger";
import Container from "@/components/layout/Container";
import { useLenis } from "@/hooks/useLenis";
import { gsap } from "@/lib/gsap";

interface NavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlide?: (slideIndex: number) => void;
}

const navItems = [
  { id: "01", title: "INTRO", href: "#main-hero-carousel", slideIndex: 0 },
  { id: "02", title: "THE PROBLEM", href: "#main-hero-carousel", slideIndex: 1 },
  { id: "03", title: "MONITORING", href: "#main-hero-carousel", slideIndex: 2 },
  { id: "04", title: "INTELLIGENCE", href: "#main-hero-carousel", slideIndex: 3 },
  { id: "05", title: "ALERTS & RESPONSE", href: "#main-hero-carousel", slideIndex: 4 },
  { id: "06", title: "OPERATOR DISPLAY", href: "#main-hero-carousel", slideIndex: 5 },
  { id: "07", title: "DIGITAL TWIN", href: "#digital-twin-preview", slideIndex: null, isSpecial: true },
  { id: "08", title: "CONTROL CENTER", href: "#control-center-preview", slideIndex: null, isSpecial: true },
  { id: "09", title: "ABOUT SRIJAN", href: "#about", slideIndex: null },
];

export default function NavigationOverlay({
  isOpen,
  onClose,
  onSelectSlide,
}: NavigationOverlayProps) {
  const lenis = useLenis();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  // Keyboard accessibility: ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle mounting, Lenis scroll locking, and GSAP transition timeline
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Lock Lenis smooth scrolling & native body scroll
      lenis?.stop();
      document.body.style.overflow = "hidden";

      // Scale hero section underneath for depth
      const heroEl = document.getElementById("main-hero-carousel") || document.getElementById("main-hero-section");
      if (heroEl) {
        gsap.to(heroEl, {
          scale: 0.97,
          borderRadius: "12px",
          duration: 0.8,
          ease: "power3.inOut",
        });
      }
    } else {
      // Unlock scroll
      lenis?.start();
      document.body.style.overflow = "";

      // Restore hero scale
      const heroEl = document.getElementById("main-hero-carousel") || document.getElementById("main-hero-section");
      if (heroEl) {
        gsap.to(heroEl, {
          scale: 1,
          borderRadius: "0px",
          duration: 0.7,
          ease: "power3.inOut",
        });
      }
    }
  }, [isOpen, lenis]);

  // Execute GSAP entrance animation once DOM node is rendered
  useEffect(() => {
    if (isOpen && shouldRender && overlayRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Expand warm stone panel from top
        tl.fromTo(
          overlayRef.current,
          { yPercent: -100 },
          { yPercent: 0, duration: 0.75, ease: "power3.inOut" }
        );

        // 2. Reveal menu item lines with stagger mask
        if (itemsContainerRef.current) {
          const lineElements =
            itemsContainerRef.current.querySelectorAll(".nav-line-inner");
          tl.fromTo(
            lineElements,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.85, stagger: 0.04, ease: "power4.out" },
            "-=0.4"
          );
        }

        // 3. Fade in right side editorial metadata
        if (rightPanelRef.current) {
          tl.fromTo(
            rightPanelRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.7 },
            "-=0.6"
          );
        }
      }, overlayRef);

      return () => ctx.revert();
    }
  }, [isOpen, shouldRender]);

  // Handle clean exit animation before unmounting render or navigating
  const handleClose = (href?: string, slideIndex?: number | null) => {
    if (slideIndex !== undefined && slideIndex !== null && onSelectSlide) {
      onSelectSlide(slideIndex);
    }

    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          setShouldRender(false);
          onClose();
          if (href) {
            if (href.startsWith("#")) {
              setTimeout(() => {
                const target = document.querySelector(href);
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }, 100);
            } else {
              window.location.href = href;
            }
          }
        },
      });
    } else {
      setShouldRender(false);
      onClose();
      if (href && !href.startsWith("#")) {
        window.location.href = href;
      }
    }
  };

  if (!isOpen && !shouldRender) return null;

  return (
    <div
      id="fullscreen-navigation"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full Screen Site Navigation"
      className="fixed inset-0 z-50 w-full h-full min-h-screen bg-[var(--bg-stone)] text-[var(--text-charcoal)] flex flex-col justify-between overflow-y-auto selection:bg-[var(--accent-copper)] selection:text-white"
    >
      {/* Top Header Bar inside Full-Screen Navigation */}
      <header className="w-full py-5 md:py-7 border-b border-[var(--border-light)]/30">
        <Container className="flex items-center justify-between">
          <BrandLogo />
          <MenuTrigger isOpen={true} onToggle={() => handleClose()} />
        </Container>
      </header>

      {/* Main Full-Screen Navigation Body */}
      <div ref={contentRef} className="my-auto py-6 md:py-10 w-full">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Refined Architectural Navigation Items (7 Cols) */}
          <div
            ref={itemsContainerRef}
            className="lg:col-span-7 flex flex-col gap-1"
          >
            {navItems.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const isOtherHovered =
                hoveredIndex !== null && hoveredIndex !== index;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden border-b border-[var(--border-light)]/25 last:border-b-0"
                >
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleClose(item.href, item.slideIndex);
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`nav-line-inner group flex items-center justify-between py-1.5 sm:py-2 transition-all duration-300 ease-out will-change-transform ${
                      isOtherHovered ? "opacity-60" : "opacity-100"
                    } ${isHovered ? "translate-x-2.5 text-[var(--text-charcoal)]" : ""}`}
                  >
                    <div className="flex items-baseline gap-3 sm:gap-5">
                      <span
                        className={`font-mono text-xs font-medium tracking-wider transition-colors duration-200 ${
                          isHovered
                            ? "text-[var(--accent-copper)]"
                            : "text-[var(--accent-copper)]/70"
                        }`}
                      >
                        {item.id}
                      </span>
                      <span className="font-heading text-base sm:text-lg lg:text-[1.35rem] xl:text-[1.55rem] font-medium tracking-tight text-[var(--text-charcoal)] transition-colors duration-200 group-hover:text-[var(--accent-copper)]">
                        {item.title}
                      </span>
                    </div>

                    <span
                      className={`font-mono text-xs font-semibold text-[var(--accent-copper)] transition-transform duration-300 ${
                        isHovered ? "translate-x-1.5 opacity-100" : "opacity-40"
                      }`}
                    >
                      →
                    </span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Right Column: Architectural Info & Soft Image Blend (5 Cols) */}
          <div
            ref={rightPanelRef}
            className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pl-10 lg:border-l border-[var(--border-light)]/30 font-mono text-xs text-[var(--text-graphite-muted)]"
          >
            {/* Identity & Philosophy */}
            <div className="space-y-3">
              <div className="text-[var(--text-charcoal)] font-semibold tracking-widest uppercase">
                SRIJAN
              </div>
              <div className="text-[11px] tracking-wider uppercase opacity-80 leading-relaxed">
                INDUSTRIAL CONVEYOR INTELLIGENCE
              </div>
              <div className="h-[1px] w-12 bg-[var(--border-light)] my-3" />
              <div className="text-xs font-semibold tracking-widest text-[var(--text-charcoal)] uppercase">
                MONITOR <span className="opacity-30">/</span> PREDICT{" "}
                <span className="opacity-30">/</span> ACT
              </div>
            </div>

            {/* Faded Cropped Conveyor Image Softly Dissolving into Stone Background */}
            <div className="relative w-full h-36 rounded-[2px] overflow-hidden border border-[var(--border-light)]/40 bg-[var(--bg-stone-surface)]">
              <Image
                src="/images/golden_hour_ore_conveyer_minescape.png"
                alt="Conveyor Atmosphere Preview"
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-center opacity-85 filter brightness-[0.95] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-stone)] via-[var(--bg-stone)]/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 text-[10px] tracking-widest uppercase text-[var(--text-charcoal)] font-semibold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)]" />
                <span>SRIJAN PLATFORM // SIH 2026</span>
              </div>
            </div>

            {/* Event & Deployment Metadata */}
            <div className="space-y-1.5 border-t border-[var(--border-light)]/30 pt-4">
              <div className="flex items-center justify-between">
                <span className="opacity-60 uppercase text-[10px]">EVENT</span>
                <span className="font-medium text-[var(--text-charcoal)]">
                  SIH 2026
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-60 uppercase text-[10px]">REGION</span>
                <span className="font-medium text-[var(--text-charcoal)]">
                  INDIA OPERATIONS
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Navigation Footer */}
      <footer className="w-full py-5 border-t border-[var(--border-light)]/30">
        <Container className="flex items-center justify-between font-mono text-[11px] text-[var(--text-graphite-muted)]">
          <div>SRIJAN CONVEYOR INTELLIGENCE</div>
          <div className="hidden sm:block">PRESS [ESC] TO CLOSE</div>
        </Container>
      </footer>
    </div>
  );
}
