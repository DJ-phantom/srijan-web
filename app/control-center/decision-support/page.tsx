"use client";

import { ShieldAlert, Activity, Layers, Wrench } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";

export default function DecisionSupportPage() {
  const { decisionSummary, conditionSummary, anomalyAssessment, activeAlerts } = useControlCenterData();

  const level = decisionSummary?.level || "NORMAL";
  const headline = decisionSummary?.headline || "Conveyor system operating within normal baseline parameters.";
  const agreement = decisionSummary?.evidence_agreement || "HIGH";
  const evidence = decisionSummary?.evidence || [];
  const actions = decisionSummary?.suggested_actions || [];

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // DECISION SUPPORT
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            EXPLAINABLE CONDITION ASSESSMENT
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono">
            Combined evidence from deterministic rules, multi-sensor condition assessment and anomaly detection.
          </div>
        </div>
      </div>

      {/* 1. PRIMARY ASSESSMENT PANEL (Highest visual priority) */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 border-l-2 border-l-[var(--accent-copper)] shadow-xs space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] text-[var(--accent-copper)] font-bold tracking-wider uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>// CURRENT ASSESSMENT</span>
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider ${
              level === "CRITICAL"
                ? "bg-red-600 text-white"
                : level === "WARNING"
                ? "bg-[var(--accent-copper)] text-white"
                : level === "ATTENTION"
                ? "bg-amber-500/20 text-amber-950 border border-amber-500/40"
                : "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30"
            }`}
          >
            {level}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
            DIAGNOSTIC HEADLINE:
          </div>
          <h2 className="font-heading text-base font-bold text-[var(--text-charcoal)] leading-snug">
            {headline}
          </h2>
        </div>

        {/* Evidence Agreement Visual Scale */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[var(--text-graphite-muted)] uppercase font-semibold">EVIDENCE AGREEMENT:</span>
            <span className="font-bold text-[var(--accent-copper)] uppercase">CURRENT AGREEMENT // {agreement}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--border-light)]/40 divide-y md:divide-y-0 md:divide-x divide-[var(--border-light)]/40 rounded-[2px] bg-[var(--bg-stone)] text-[9px]">
            {/* HIGH */}
            <div
              className={`p-2 font-mono ${
                agreement === "HIGH"
                  ? "bg-white text-[var(--text-charcoal)] font-bold"
                  : "text-[var(--text-graphite-muted)] opacity-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agreement === "HIGH" ? "bg-[var(--accent-copper)]" : "bg-black/20"}`} />
                <span>HIGH AGREEMENT</span>
              </div>
              <div className="pt-0.5 font-normal text-[8.5px]">
                {level === "NORMAL"
                  ? "Multiple evidence sources agree on the current NORMAL condition."
                  : "Multiple evidence sources agree on elevated condition."}
              </div>
            </div>

            {/* MODERATE */}
            <div
              className={`p-2 font-mono ${
                agreement === "MODERATE"
                  ? "bg-white text-[var(--text-charcoal)] font-bold"
                  : "text-[var(--text-graphite-muted)] opacity-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agreement === "MODERATE" ? "bg-amber-600" : "bg-black/20"}`} />
                <span>MODERATE AGREEMENT</span>
              </div>
              <div className="pt-0.5 font-normal text-[8.5px]">
                Partial cross-engine agreement
              </div>
            </div>

            {/* LOW */}
            <div
              className={`p-2 font-mono ${
                agreement === "LOW"
                  ? "bg-white text-[var(--text-charcoal)] font-bold"
                  : "text-[var(--text-graphite-muted)] opacity-50"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase text-[9.5px]">
                <span className={`w-1.5 h-1.5 rounded-full ${agreement === "LOW" ? "bg-black/60" : "bg-black/20"}`} />
                <span>LOW AGREEMENT</span>
              </div>
              <div className="pt-0.5 font-normal text-[8.5px]">
                Single or limited evidence source
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE-EVIDENCE-SOURCE LOGIC (Pipeline Flow) */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
          <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
            THREE-ENGINE EVIDENCE AGGREGATION PIPELINE
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">MULTI-ENGINE SYNTHESIS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px]">
          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">01 / RULE ENGINE</div>
            <div className="text-[var(--text-charcoal)] font-bold">Threshold &amp; Event Logic</div>
            <div className="text-[8.5px] text-[var(--text-graphite-muted)]">
              Active Triggers: {activeAlerts.length}
            </div>
          </div>

          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">02 / CONDITION ENGINE</div>
            <div className="text-[var(--text-charcoal)] font-bold">Multi-Sensor Risk Fusion</div>
            <div className="text-[8.5px] text-[var(--text-graphite-muted)]">
              Risk Index: {conditionSummary?.overall.risk_index.toFixed(0) || 12}/100 ({conditionSummary?.overall.level || "NORMAL"})
            </div>
          </div>

          <div className="p-2.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1">
            <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">03 / ANOMALY ASSESSMENT</div>
            <div className="text-[var(--text-charcoal)] font-bold">Isolation Forest Deviation</div>
            <div className="text-[8.5px] text-[var(--text-graphite-muted)]">
              Anomaly Index: {anomalyAssessment?.anomaly_index.toFixed(1) || 14.5}/100
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[9px] text-[var(--text-graphite-muted)] pt-0.5 uppercase">
          <span>SYNTHESIZED EVALUATION</span>
          <span className="text-[var(--accent-copper)] font-bold">→</span>
          <span className="font-bold text-[var(--accent-copper)]">EXPLAINABLE DECISION SUPPORT</span>
        </div>
      </div>

      {/* 3. TERTIARY: CONTEXT REFERENCE STRIP (Rules, Condition & Anomaly Context) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-xs">
        {/* Rule Context */}
        <div className="p-3 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 space-y-1">
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider flex items-center justify-between">
            <span>ACTIVE RULE ALERTS</span>
            <span className="text-[var(--text-charcoal)]">{activeAlerts.length}</span>
          </div>
          <div className="text-[10px] text-[var(--text-charcoal)] font-bold">
            {activeAlerts.length === 0 ? "NO ACTIVE RULE TRIGGERS" : `${activeAlerts.length} Active Rule Thresholds`}
          </div>
          <div className="text-[8.5px] text-[var(--text-graphite-muted)]">
            {activeAlerts.length === 0 ? "All indicators within configured bounds." : `Strongest: ${activeAlerts[0]?.severity || "WARNING"}`}
          </div>
        </div>

        {/* Condition Context */}
        <div className="p-3 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 space-y-1">
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider flex items-center justify-between">
            <span>OVERALL BELT CONDITION</span>
            <span className="text-[var(--text-charcoal)]">{conditionSummary?.overall.level || "NORMAL"}</span>
          </div>
          <div className="text-[10px] text-[var(--text-charcoal)] font-bold">
            Risk Index: {conditionSummary?.overall.risk_index.toFixed(0) || 12} / 100
          </div>
          <div className="text-[8.5px] text-[var(--text-graphite-muted)]">
            Splice S1 Status: {conditionSummary?.splice.level || "NORMAL"}
          </div>
        </div>

        {/* Anomaly Context */}
        <div className="p-3 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 space-y-1">
          <div className="text-[9px] text-[var(--text-graphite-muted)] font-bold uppercase tracking-wider flex items-center justify-between">
            <span>ANOMALY ASSESSMENT</span>
            <span className="text-[var(--text-charcoal)]">{anomalyAssessment?.status.replace(/_/g, " ") || "STABLE NORMAL"}</span>
          </div>
          <div className="text-[10px] text-[var(--text-charcoal)] font-bold">
            Anomaly Index: {anomalyAssessment?.anomaly_index.toFixed(1) || 14.5} / 100
          </div>
          <div className="text-[8.5px] text-[var(--text-graphite-muted)]">
            Deviation indicator — not failure probability.
          </div>
        </div>
      </div>

      {/* 4. SECONDARY: STRUCTURED EVIDENCE & RECOMMENDED ACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Structured Evidence List (col-span-7) */}
        <div className="lg:col-span-7 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>// STRUCTURED EVIDENCE LIST ({evidence.length})</span>
            </span>
          </div>

          {evidence.length > 0 ? (
            <div className="space-y-2">
              {evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-black/5 text-[9px] font-bold text-[var(--text-charcoal)] uppercase">
                        {item.source}
                      </span>
                      <span className="font-bold text-[var(--text-charcoal)] text-[11px]">
                        {item.title}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase ${
                        item.severity === "CRITICAL"
                          ? "bg-red-600 text-white"
                          : item.severity === "WARNING"
                          ? "bg-[var(--accent-copper)] text-white"
                          : "bg-amber-500/20 text-amber-950 border border-amber-500/40"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[var(--text-charcoal)] opacity-90 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1 text-center font-mono">
              <div className="text-[11px] font-bold text-[var(--text-charcoal)] uppercase">
                NO ABNORMAL EVIDENCE RECORDED
              </div>
              <div className="text-[10px] text-[var(--text-graphite-muted)] font-sans">
                All monitored indicators remain within current prototype thresholds.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recommended Inspection Actions (col-span-5) */}
        <div className="lg:col-span-5 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>// RECOMMENDED INSPECTION ACTIONS</span>
            </span>
          </div>

          {actions.length > 0 ? (
            <div className="space-y-2">
              {actions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1"
                >
                  <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase">
                    PRIORITY: {act.priority}
                  </div>
                  <p className="font-sans text-[11.5px] text-[var(--text-charcoal)] font-medium leading-relaxed">
                    {act.action}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-1 text-center font-mono">
              <div className="text-[11px] font-bold text-[var(--text-charcoal)] uppercase">
                ROUTINE OPERATIONAL MONITORING
              </div>
              <div className="text-[10px] text-[var(--text-graphite-muted)] font-sans">
                No immediate operator inspection action required.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. DECISION FLOW BANNER (Bottom) */}
      <div className="p-3 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs font-mono text-xs flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-charcoal)] uppercase tracking-wider">
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">OBSERVE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">CORRELATE</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">ASSESS</span>
          <span className="text-[var(--accent-copper)]">→</span>
          <span className="px-2 py-0.5 rounded-[2px] bg-[var(--accent-copper)] text-white">RECOMMEND</span>
        </div>
        <div className="text-[9.5px] text-[var(--text-graphite-muted)] italic">
          Multiple independent evidence sources are combined before an operator-facing recommendation is produced.
        </div>
      </div>
    </div>
  );
}
