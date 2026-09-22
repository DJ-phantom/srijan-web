"use client";

import Link from "next/link";
import { Camera, Info, CheckCircle2, Layers, ArrowRight } from "lucide-react";

export default function CameraPage() {
  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Header & Status Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // CAMERA READINESS
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            VISUAL INSPECTION MODULE
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono">
            Prepared architecture for future conveyor, splice and visible surface-condition inspection.
          </div>
        </div>

        {/* Top Status Summary */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            HARDWARE: <span className="text-[var(--text-graphite-muted)] font-bold">NOT CONNECTED</span>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            STREAM: <span className="text-[var(--text-graphite-muted)] font-bold">INACTIVE</span>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            CV ENGINE: <span className="text-[var(--text-graphite-muted)] font-bold">NOT ENABLED</span>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)] uppercase">
            STATE: <span className="text-[var(--accent-copper)] font-bold">PLANNED</span>
          </div>
        </div>
      </div>

      {/* Primary Camera Viewport Area */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>// OVERHEAD INSPECTION VIEWPORT [PLANNED]</span>
          </span>
          <span className="text-[9.5px] text-[var(--text-graphite-muted)] uppercase">
            STATUS: STANDBY
          </span>
        </div>

        {/* Empty Technical Viewport Box */}
        <div className="relative w-full h-52 md:h-60 rounded-[2px] border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-stone)] flex flex-col items-center justify-center p-6 text-center space-y-2 select-none">
          <div className="w-12 h-12 rounded-full bg-white/80 border border-[var(--border-light)]/60 flex items-center justify-center text-[var(--text-graphite-muted)]">
            <Camera className="w-6 h-6 stroke-1" />
          </div>
          <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
            CAMERA NOT CONNECTED
          </div>
          <div className="text-[11px] text-[var(--text-graphite-muted)] max-w-md font-sans leading-relaxed">
            No inspection stream is available in the current prototype build.
          </div>
          <div className="text-[9.5px] font-bold text-[var(--accent-copper)] uppercase tracking-wider font-mono pt-1">
            NUMERICAL TELEMETRY MONITORING REMAINS ACTIVE
          </div>
        </div>
      </div>

      {/* Current vs Planned Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        {/* Current Prototype Capability */}
        <div className="p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] font-bold text-emerald-900 tracking-wider uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>CURRENT PROTOTYPE CAPABILITY</span>
            </span>
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-500/10 px-1.5 py-0.5 rounded-[2px]">ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[var(--text-charcoal)] font-sans">
            <div className="flex items-center gap-1.5"><span className="text-emerald-700 font-bold">✓</span> Temperature Telemetry</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-700 font-bold">✓</span> Vibration Telemetry</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-700 font-bold">✓</span> Motor Current Telemetry</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-700 font-bold">✓</span> Belt Speed Telemetry</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-700 font-bold">✓</span> Alignment Telemetry</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-700 font-bold">✓</span> Load Telemetry</div>
          </div>
          <div className="text-[9.5px] font-mono text-[var(--text-graphite-muted)] border-t border-[var(--border-light)]/20 pt-1.5">
            Camera Module: <strong className="text-[var(--text-charcoal)]">NOT CONNECTED</strong>
          </div>
        </div>

        {/* Planned Vision Module */}
        <div className="p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
            <span className="text-[10px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accent-copper)]" />
              <span>PLANNED VISION MODULE</span>
            </span>
            <span className="text-[9px] font-bold text-[var(--accent-copper)] bg-[var(--accent-copper)]/10 px-1.5 py-0.5 rounded-[2px]">PLANNED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-[var(--text-graphite-muted)] font-sans">
            <div className="flex items-center gap-1.5"><span className="text-[var(--accent-copper)] font-bold">○</span> Belt surface inspection</div>
            <div className="flex items-center gap-1.5"><span className="text-[var(--accent-copper)] font-bold">○</span> Splice visual inspection</div>
            <div className="flex items-center gap-1.5"><span className="text-[var(--accent-copper)] font-bold">○</span> Edge wear / visible damage</div>
            <div className="flex items-center gap-1.5"><span className="text-[var(--accent-copper)] font-bold">○</span> Foreign-object detection</div>
            <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2"><span className="text-[var(--accent-copper)] font-bold">○</span> Image-assisted event evidence</div>
          </div>
        </div>
      </div>

      {/* Planned Camera Pipeline Flow */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
          <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
            PLANNED CAMERA PIPELINE
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">FUTURE ARCHITECTURE</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] text-[var(--text-charcoal)] font-bold uppercase tracking-wider py-1">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">INSPECTION CAMERA</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">FRAME CAPTURE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">IMAGE PREPROCESSING</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">CV / DETECTION MODEL</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">SPLICE &amp; SURFACE ANALYSIS</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)] text-white">CONTROL CENTER EVENT</span>
        </div>
      </div>

      {/* Future Inspection Targets & System Role */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Inspection Targets (col-span-8) */}
        <div className="lg:col-span-8 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-3">
          <div className="text-[10px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider border-b border-[var(--border-light)]/30 pb-1.5">
            FUTURE INSPECTION TARGETS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="font-bold text-[var(--accent-copper)] uppercase">01 / BELT SURFACE</div>
              <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
                Visible tears, cuts or material anomalies across top cover.
              </div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="font-bold text-[var(--accent-copper)] uppercase">02 / SPLICE REGION</div>
              <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
                Visual condition inspection around monitored splice S1 joint.
              </div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="font-bold text-[var(--accent-copper)] uppercase">03 / EDGE CONDITION</div>
              <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
                Possible visible edge wear or fraying damage along belt borders.
              </div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 space-y-0.5">
              <div className="font-bold text-[var(--accent-copper)] uppercase">04 / FOREIGN OBJECTS</div>
              <div className="text-[9px] text-[var(--text-graphite-muted)] font-sans">
                Future detection of tramp material or debris on belt.
              </div>
            </div>
          </div>
        </div>

        {/* Role of Camera & Splice S1 Connection (col-span-4) */}
        <div className="lg:col-span-4 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5">
          <div className="text-[10px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider border-b border-[var(--border-light)]/30 pb-1.5">
            SYSTEM ROLE &amp; SPLICE TARGET
          </div>

          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/30 text-[9px] font-mono text-[var(--text-charcoal)] font-bold text-center">
            NUMERICAL TELEMETRY + VISUAL EVIDENCE → RICHER CONDITION CONTEXT
          </div>

          <div className="text-[10px] text-[var(--text-charcoal)] space-y-1">
            <div className="font-bold text-[var(--accent-copper)] uppercase text-[9px]">
              PLANNED VISUAL TARGET: MONITORED SPLICE S1
            </div>
            <p className="font-sans text-[10px] text-[var(--text-graphite-muted)] leading-relaxed">
              Provides visual evidence around the joint region to complement vibration, alignment and condition data. Camera complements numerical telemetry; it does not replace sensors.
            </p>
          </div>
        </div>
      </div>

      {/* Current Build Disclosure */}
      <div className="p-3 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-charcoal)]">
          <Info className="w-3.5 h-3.5 text-[var(--accent-copper)] shrink-0" />
          <span>
            <strong>CURRENT BUILD:</strong> Camera hardware and computer vision processing are not active in this prototype stage. The Control Center architecture is prepared for future integration.
          </span>
        </div>

        <Link
          href="/control-center/decision-support"
          className="font-bold text-[var(--accent-copper)] hover:underline text-[10px] shrink-0 flex items-center gap-1"
        >
          <span>VIEW DECISION SUPPORT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
