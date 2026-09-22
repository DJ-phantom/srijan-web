"use client";

import { useState } from "react";
import Hero from "@/components/sections/Hero";
import ProblemSection from "@/components/sections/ProblemSection";
import ApproachSection from "@/components/sections/ApproachSection";
import MonitoringSection from "@/components/sections/MonitoringSection";
import IntelligenceSection from "@/components/sections/IntelligenceSection";
import DigitalBeltSection from "@/components/sections/DigitalBeltSection";
import AlertsSection from "@/components/sections/AlertsSection";
import ControlCenterPreviewSection from "@/components/sections/ControlCenterPreviewSection";
import ClosingSection from "@/components/sections/ClosingSection";
import NavigationOverlay from "@/components/layout/NavigationOverlay";

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <main className="relative min-h-screen bg-[var(--bg-stone)] selection:bg-[var(--accent-copper)] selection:text-white">
      <Hero
        isMenuOpen={isNavOpen}
        onToggleMenu={() => setIsNavOpen((prev) => !prev)}
      />
      <ProblemSection />
      <ApproachSection />
      <MonitoringSection />
      <IntelligenceSection />
      <DigitalBeltSection />
      <AlertsSection />
      <ControlCenterPreviewSection />
      <ClosingSection />
      <NavigationOverlay
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
    </main>
  );
}
