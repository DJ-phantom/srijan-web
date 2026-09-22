"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import BrandLogo from "@/components/ui/BrandLogo";
import DigitalBeltViewport, {
  digitalBeltZones,
} from "@/components/ui/DigitalBeltViewport";
import SensorDetailCard, {
  SensorData,
} from "@/components/ui/SensorDetailCard";

const sensorsList: SensorData[] = [
  {
    code: "T-01",
    name: "TEMPERATURE SENSOR",
    zone: "ZONE A",
    location: "DRIVE HEAD",
    description:
      "Monitors thermal behaviour around the drive assembly and pulley region.",
    isPlanned: false,
  },
  {
    code: "V-02",
    name: "VIBRATION SENSOR",
    zone: "ZONE A",
    location: "BEARING HOUSING",
    description:
      "Monitors mechanical vibration signatures for early bearing and drive anomaly detection.",
    isPlanned: false,
  },
  {
    code: "M-01",
    name: "MOTOR CURRENT",
    zone: "ZONE A",
    location: "MOTOR CONTROLLER",
    description:
      "Tracks electrical current draw to evaluate motor load and mechanical resistance.",
    isPlanned: false,
  },
  {
    code: "S-01",
    name: "BELT SPEED SENSOR",
    zone: "ZONE B",
    location: "TACHOMETER IDLER",
    description:
      "Measures rotational speed and checks for belt slip against drive command.",
    isPlanned: false,
  },
  {
    code: "A-01",
    name: "ALIGNMENT SENSOR",
    zone: "ZONE B",
    location: "BELT EDGE STRAND",
    description:
      "Monitors lateral tracking drift along primary conveyor strand.",
    isPlanned: false,
  },
  {
    code: "L-01",
    name: "LOAD & TENSION",
    zone: "ZONE D",
    location: "GRAVITY TAKE-UP",
    description:
      "Estimates belt tension and gravity weight distribution under material loading.",
    isPlanned: false,
  },
  {
    code: "C-01",
    name: "VISION INSPECTION",
    zone: "ZONE C",
    location: "MONITORED SPLICE S1",
    description:
      "Planned optical surface inspection for wear tracking and joint integrity assessment.",
    isPlanned: true,
  },
];

export default function DigitalBeltPage() {
  const [selectedZoneId, setSelectedZoneId] = useState<string>("ZONE C");
  const [selectedSensorCode, setSelectedSensorCode] = useState<string>("T-01");

  const activeSensor =
    sensorsList.find((s) => s.code === selectedSensorCode) || sensorsList[0];

  return (
    <div className="min-h-screen bg-[var(--bg-stone)] text-[var(--text-charcoal)] flex flex-col justify-between selection:bg-[var(--accent-copper)] selection:text-white">
      {/* Top Navigation Header */}
      <header className="w-full py-5 md:py-6 border-b border-[var(--border-light)]/40 bg-[var(--bg-stone)]/90 backdrop-blur-xs sticky top-0 z-40">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden sm:inline-block font-mono text-xs text-[var(--border-light)]">
              |
            </span>
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
              <span className="font-semibold text-[var(--accent-copper)]">05</span>
              <span className="text-[var(--text-charcoal)] font-bold tracking-wider uppercase">
                DIGITAL BELT
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="group font-mono text-xs font-semibold tracking-wider text-[var(--text-graphite-muted)] hover:text-[var(--accent-copper)] transition-colors flex items-center gap-2"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            <span>BACK TO EXPERIENCE</span>
          </Link>
        </Container>
      </header>

      {/* Main Digital Belt Page Content */}
      <main className="flex-grow py-10 md:py-16">
        <Container className="flex flex-col space-y-10">
          {/* Page Identity & Header */}
          <div className="flex flex-col space-y-3 max-w-3xl">
            <div className="font-mono text-xs font-semibold tracking-[0.2em] text-[var(--accent-copper)] uppercase flex items-center gap-2">
              <span>DIGITAL BELT ENVIRONMENT</span>
              <span className="opacity-40">//</span>
              <span>CONVEYOR BC-01 MODEL</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-charcoal)]">
              CONVEYOR BC-01 <br />
              <span className="text-[var(--accent-copper)]">DIGITAL BELT MODEL</span>
            </h1>

            <p className="font-sans text-sm sm:text-base font-light text-[var(--text-graphite-muted)] leading-relaxed pt-1">
              The Digital Belt connects condition data with monitored conveyor components, giving operators one visual view of system health and spatial context.
            </p>
          </div>

          {/* Reserved Model Viewport Component */}
          <DigitalBeltViewport
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
          />

          {/* Side / Lower Section: Zones, Sensor Index, Selected Sensor Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 Cols: Zone Inspector & Sensor Channel Index */}
            <div className="lg:col-span-6 flex flex-col space-y-6 font-mono">
              {/* Zones Selector Grid */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[var(--accent-copper)] tracking-wider uppercase">
                  // CONVEYOR SPATIAL ZONES
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {digitalBeltZones.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    return (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`p-3 rounded-[2px] border text-left flex flex-col space-y-1 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)] border-[var(--text-charcoal)] shadow-sm"
                            : "bg-white/60 border-[var(--border-light)]/80 text-[var(--text-charcoal)] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={isSelected ? "text-[var(--accent-copper)] font-bold" : "text-[var(--accent-copper)]"}>
                            {zone.id}
                          </span>
                          <span className="opacity-70 text-[9px]">{zone.status}</span>
                        </div>
                        <div className="font-bold text-[11px] tracking-wider uppercase">
                          {zone.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sensor Channel Index */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-light)]/40">
                <div className="text-xs font-semibold text-[var(--accent-copper)] tracking-wider uppercase">
                  // MONITORED SENSOR CHANNELS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {sensorsList.map((sensor) => {
                    const isSelected = selectedSensorCode === sensor.code;
                    return (
                      <button
                        key={sensor.code}
                        onClick={() => {
                          setSelectedSensorCode(sensor.code);
                          setSelectedZoneId(sensor.zone);
                        }}
                        className={`p-2.5 rounded-[1px] border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)] font-semibold shadow-xs"
                            : "bg-white/50 border-[var(--border-light)]/70 text-[var(--text-charcoal)] hover:bg-white"
                        }`}
                      >
                        <span>{sensor.code}</span>
                        <span className="text-[10px] opacity-80">{sensor.location.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Reusable Selected Sensor Detail UI */}
            <div className="lg:col-span-6 flex flex-col space-y-3 font-mono">
              <div className="text-xs font-semibold text-[var(--accent-copper)] tracking-wider uppercase">
                // SELECTED SENSOR CHANNEL DETAIL
              </div>
              <SensorDetailCard sensor={activeSensor} />
            </div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-[var(--border-light)]/40 font-mono text-xs text-[var(--text-graphite-muted)]">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>SRIJAN CONVEYOR INTELLIGENCE &nbsp;//&nbsp; DIGITAL BELT ROUTE</div>
          <Link
            href="/"
            className="text-[var(--accent-copper)] font-semibold hover:underline"
          >
            RETURN TO LANDING PAGE →
          </Link>
        </Container>
      </footer>
    </div>
  );
}
