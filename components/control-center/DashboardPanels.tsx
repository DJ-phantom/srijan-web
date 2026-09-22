"use client";

import Image from "next/image";
import { demoControlCenterData } from "@/lib/demoControlCenterData";

export function HealthOverview() {
  const { healthPercentage, healthStatus, conveyorId, activeAlertsCount } =
    demoControlCenterData.systemStatus;

  return (
    <div className="p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-[var(--accent-copper)] font-semibold tracking-widest uppercase">
          // SYSTEM HEALTH
        </span>
        <span className="px-2 py-0.5 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] text-[9px] font-bold">
          DEMO
        </span>
      </div>

      <div className="flex items-center gap-6 my-2">
        {/* Restrained Circular Donut Indicator */}
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--border-light)"
              strokeWidth="3.5"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--accent-copper)"
              strokeWidth="3.5"
              strokeDasharray={`${healthPercentage}, 100`}
            />
          </svg>
          <span className="absolute font-heading text-xl font-bold text-[var(--text-charcoal)]">
            {healthPercentage}%
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
            CONVEYOR {conveyorId}
          </div>
          <div className="text-[11px] font-semibold text-[var(--accent-copper)]">
            {healthStatus}
          </div>
          <div className="text-[10px] text-[var(--text-graphite-muted)] uppercase">
            {activeAlertsCount} ACTIVE ALERTS DETECTED
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConveyorMap() {
  return (
    <div className="p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-[var(--accent-copper)] font-semibold tracking-widest uppercase">
          // CONVEYOR LINE MAP
        </span>
        <span className="text-[10px] text-[var(--text-graphite-muted)] uppercase">
          LINE BC-01 FLOW
        </span>
      </div>

      {/* Vector SVG Conveyor Flow Diagram */}
      <div className="relative w-full h-24 my-2 rounded-[2px] bg-[var(--bg-stone)]/60 border border-[var(--border-light)]/30 flex items-center justify-center p-2">
        <svg className="w-full h-full" viewBox="0 0 600 80" fill="none">
          <path d="M 40 40 H 560" stroke="var(--text-charcoal)" strokeWidth="2" strokeDasharray="6 6" opacity="0.3" />
          
          {/* Pulley Nodes */}
          <circle cx="50" cy="40" r="16" stroke="var(--text-charcoal)" strokeWidth="2" fill="var(--bg-stone)" />
          <circle cx="560" cy="40" r="16" stroke="var(--text-charcoal)" strokeWidth="2" fill="var(--bg-stone)" />

          {/* Zones */}
          <g transform="translate(120, 24)">
            <rect x="0" y="0" width="80" height="32" rx="2" fill="white" stroke="var(--border-light)" />
            <text x="40" y="16" fill="var(--text-charcoal)" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">ZONE A</text>
            <text x="40" y="25" fill="var(--text-graphite-muted)" fontSize="7" textAnchor="middle">DRIVE</text>
          </g>

          <g transform="translate(240, 24)">
            <rect x="0" y="0" width="100" height="32" rx="2" fill="white" stroke="var(--accent-copper)" strokeWidth="1.5" />
            <text x="50" y="16" fill="var(--accent-copper)" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">ZONE B [WARNING]</text>
            <text x="50" y="25" fill="var(--text-graphite-muted)" fontSize="7" textAnchor="middle">MIDSPAN</text>
          </g>

          <g transform="translate(380, 24)">
            <rect x="0" y="0" width="80" height="32" rx="2" fill="white" stroke="var(--border-light)" />
            <text x="40" y="16" fill="var(--text-charcoal)" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">ZONE C</text>
            <text x="40" y="25" fill="var(--text-graphite-muted)" fontSize="7" textAnchor="middle">TAKE-UP</text>
          </g>

          <g transform="translate(480, 24)">
            <rect x="0" y="0" width="60" height="32" rx="2" fill="white" stroke="var(--border-light)" />
            <text x="30" y="16" fill="var(--text-charcoal)" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">ZONE D</text>
            <text x="30" y="25" fill="var(--text-graphite-muted)" fontSize="7" textAnchor="middle">DISCHARGE</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export function AlertList() {
  const { alerts } = demoControlCenterData;

  return (
    <div className="p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[var(--accent-copper)] font-semibold tracking-widest uppercase">
          // ACTIVE ALERTS
        </span>
        <span className="text-[10px] text-[var(--text-graphite-muted)] uppercase">
          {alerts.length} EVENTS
        </span>
      </div>

      <div className="space-y-2.5 my-1">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 flex flex-col gap-1 text-[11px]"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-charcoal)]">
                [{alt.id}] {alt.title}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${
                  alt.severity === "WARNING"
                    ? "bg-[var(--accent-copper)] text-white"
                    : alt.severity === "ATTENTION"
                    ? "bg-amber-500/20 text-amber-900 border border-amber-500/40"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {alt.severity}
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)]">
              {alt.location}
            </div>
            <div className="font-sans text-[11px] text-[var(--text-charcoal)]/90 pt-0.5">
              {alt.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConditionSummary() {
  const { sensors } = demoControlCenterData;

  return (
    <div className="p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-[var(--accent-copper)] font-semibold tracking-widest uppercase">
          // LIVE CONDITION SUMMARY
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded-[2px] bg-[var(--text-charcoal)] text-[var(--bg-stone)] uppercase font-semibold">
          SIMULATED TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sensors.map((s) => (
          <div
            key={s.channel}
            className="p-3 rounded-[2px] bg-[var(--bg-stone)]/80 border border-[var(--border-light)]/30 flex flex-col justify-between space-y-1.5"
          >
            <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase flex items-center justify-between">
              <span>{s.channel}</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  s.status === "WARNING"
                    ? "bg-[var(--accent-copper)]"
                    : s.status === "ATTENTION"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
            </div>
            <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
              {s.value} <span className="font-mono text-xs font-normal opacity-70">{s.unit}</span>
            </div>
            <div className="text-[9px] font-semibold text-[var(--text-charcoal)] uppercase truncate">
              {s.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SensorTrend() {
  return (
    <div className="p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[var(--accent-copper)] font-semibold tracking-widest uppercase">
          // SENSOR TREND // LATERAL ALIGNMENT
        </span>
        <span className="text-[10px] text-[var(--text-graphite-muted)] uppercase">
          CHANNEL CH-05
        </span>
      </div>

      {/* SVG Trend Sparkline */}
      <div className="relative w-full h-28 rounded-[2px] bg-[var(--bg-stone)]/70 border border-[var(--border-light)]/30 p-2 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 500 100" fill="none">
          <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4 4" />
          {/* Baseline Graphite Line */}
          <path d="M 0 50 L 100 52 L 200 48 L 300 60 L 350 78 L 400 85 L 450 75 L 500 55" stroke="var(--text-charcoal)" strokeWidth="2" opacity="0.4" />
          {/* Copper Anomaly Segment */}
          <path d="M 300 60 L 350 78 L 400 85 L 450 75" stroke="var(--accent-copper)" strokeWidth="3" />
          <circle cx="400" cy="85" r="4" fill="var(--accent-copper)" />
        </svg>
      </div>
    </div>
  );
}

export function CameraPanel() {
  return (
    <div className="p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[var(--accent-copper)] font-semibold tracking-widest uppercase">
          // CAMERA / SYSTEM VIEW
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-gray-200 text-gray-800 font-bold uppercase">
          DEMO MEDIA
        </span>
      </div>

      <div className="relative w-full h-36 rounded-[2px] overflow-hidden border border-[var(--border-light)]/40 bg-[var(--bg-stone-surface)]">
        <Image
          src="/images/golden_hour_ore_conveyer_minescape.png"
          alt="Conveyor camera feed demo placeholder"
          fill
          sizes="(max-width: 768px) 100vw, 30vw"
          className="object-cover filter grayscale-[30%] brightness-[0.9]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 font-mono text-[9px] text-white tracking-widest uppercase font-semibold flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
          <span>CAM-01 // OVERHEAD INSPECTION FEED</span>
        </div>
      </div>
    </div>
  );
}

export function IntelligencePanel() {
  const { intelligenceNotes } = demoControlCenterData;

  return (
    <div className="p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between font-mono text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[var(--accent-copper)] font-semibold tracking-widest uppercase">
          // INTELLIGENCE &amp; MAINTENANCE
        </span>
        <span className="text-[10px] text-[var(--text-graphite-muted)] uppercase">
          ANALYSIS NOTES
        </span>
      </div>

      <div className="space-y-2.5 my-1">
        {intelligenceNotes.map((note, idx) => (
          <div key={idx} className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-[var(--accent-copper)]">
              <span>{note.category}</span>
              <span className="text-[9px] text-[var(--text-graphite-muted)] font-normal">{note.date}</span>
            </div>
            <p className="font-sans text-[11px] text-[var(--text-charcoal)] leading-snug">
              {note.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LocalDisplay() {
  const { localLcdDisplay } = demoControlCenterData;

  return (
    <div className="p-4 rounded-[2px] bg-black text-emerald-400 border border-emerald-500/40 shadow-xs font-mono text-xs space-y-1 select-none">
      <div className="flex items-center justify-between text-[9px] text-emerald-600 border-b border-emerald-900 pb-1 mb-1">
        <span>PROTOTYPE LCD DISPLAY</span>
        <span>DEMO OUTPUT</span>
      </div>
      <div>{localLcdDisplay.line1}</div>
      <div>{localLcdDisplay.line2}</div>
      <div>{localLcdDisplay.line3}</div>
    </div>
  );
}
