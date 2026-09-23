"use client";

import { useState } from "react";
import StoryCarousel from "@/components/experience/StoryCarousel";
import ControlCenterPreviewSection from "@/components/sections/ControlCenterPreviewSection";
import ClosingSection from "@/components/sections/ClosingSection";
import NavigationOverlay from "@/components/layout/NavigationOverlay";

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-[var(--bg-stone)] selection:bg-[var(--accent-copper)] selection:text-white">
      {/* 1. FULL-VIEWPORT STORY CAROUSEL (6 SLIDES) */}
      <StoryCarousel
        activeSlide={activeSlide}
        onSlideChange={setActiveSlide}
        isMenuOpen={isNavOpen}
        onToggleMenu={() => setIsNavOpen((prev) => !prev)}
      />

      {/* 2. CONTROL CENTER PREVIEW */}
      <ControlCenterPreviewSection />

      {/* 3. ABOUT / SRIJAN CLOSING */}
      <ClosingSection />

      {/* FULLSCREEN SITE NAVIGATION OVERLAY */}
      <NavigationOverlay
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSelectSlide={(slideIndex) => setActiveSlide(slideIndex)}
      />
    </main>
  );
}
