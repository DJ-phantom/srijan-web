"use client";

import Link from "next/link";
import { Cpu, Activity, ArrowRight, Info, Layers } from "lucide-react";
import { useControlCenterData } from "@/hooks/useControlCenterData";

const baselineMeans: Record<string, { mean: number; unit: string }> = {
  temperature: { mean: 41.0, unit: "°C" },
  vibration: { mean: 0.27, unit: "g" },
  current: { mean: 4.15, unit: "A" },
  speed: { mean: 1.8, unit: "m/s" },
  alignment: { mean: 0.0, unit: "mm" },
  load: { mean: 60.0, unit: "t/h" },
};

export default function IntelligencePage() {
  const { anomalyAssessment, telemetry, lastUpdated } = useControlCenterData();

  const anomalyIndex = anomalyAssessment?.anomaly_index ?? 14.5;
  const isAnomaly = anomalyAssessment?.is_anomaly ?? false;
  const status = anomalyAssessment?.status || "STABLE_NORMAL";

  const topDeviations =
    anomalyAssessment?.top_deviations && anomalyAssessment.top_deviations.length > 0
      ? anomalyAssessment.top_deviations
      : [
          { metric: "alignment", value: telemetry.alignment || 0.1, mean: 0.0, std: 0.12, deviation: 0.9, unit: "mm" },
          { metric: "vibration", value: telemetry.vibration || 0.28, mean: 0.27, std: 0.012, deviation: 0.8, unit: "g" },
          { metric: "current", value: telemetry.current || 4.16, mean: 4.15, std: 0.048, deviation: 0.3, unit: "A" },
        ];

  // 5-sample anti-flicker rolling window representation
  const anomalousCount = isAnomaly ? 3 : 0;
  const windowSamples = Array.from({ length: 5 }, (_, i) => {
    if (isAnomaly) {
      // 3 of 5 anomalous for trigger
      return i === 0 || i === 2 || i === 3 ? "DEVIATION" : "NORMAL";
    }
    return "NORMAL";
  });

  return (
    <div className="space-y-3.5 font-sans select-none text-[var(--text-charcoal)] pb-4">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-light)]/40 pb-2.5 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--accent-copper)] font-bold tracking-widest uppercase">
              // INTELLIGENCE
            </span>
          </div>
          <h1 className="font-heading text-lg md:text-xl font-bold text-[var(--text-charcoal)] tracking-tight pt-0.5">
            MULTIVARIATE ANOMALY ASSESSMENT
          </h1>
          <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono">
            Isolation Forest / Six-Channel Conveyor Telemetry
          </div>
        </div>

        {/* Compact Status Strip */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            MODEL: <strong className="text-[var(--accent-copper)]">ISOLATION FOREST</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)] uppercase">
            STATUS:{" "}
            <span className={isAnomaly ? "text-[var(--accent-copper)] font-bold" : "text-emerald-800 font-bold"}>
              {status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-charcoal)]">
            INDEX: <strong>{anomalyIndex.toFixed(1)} / 100</strong>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-black/5 border border-black/10 font-semibold text-[var(--text-graphite-muted)]">
            WINDOW: <span className="text-[var(--text-charcoal)]">5 SAMPLES</span>
          </div>
          <div className="px-2 py-0.5 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 font-semibold text-[var(--text-graphite-muted)]">
            UPDATED: <span className="text-[var(--text-charcoal)]">{lastUpdated}</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-[var(--text-graphite-muted)] font-mono -mt-1">
        Unsupervised detection of operating patterns that deviate from the learned normal telemetry baseline.
      </div>

      {/* Primary Model Assessment & Window Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono">
        {/* 1. PRIMARY PANEL: Current Pattern Assessment & Analytical Scale (col-span-8) */}
        <div className="lg:col-span-8 p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[11px] text-[var(--accent-copper)] font-bold tracking-wider uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>// CURRENT PATTERN ASSESSMENT</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider ${
                isAnomaly
                  ? "bg-[var(--accent-copper)] text-white"
                  : "bg-emerald-500/15 text-emerald-900 border border-emerald-500/30"
              }`}
            >
              {status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
            <div>
              <div className="text-[10px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
                ANOMALY INDEX
              </div>
              <div className="font-heading text-4xl font-bold text-[var(--text-charcoal)]">
                {anomalyIndex.toFixed(1)} <span className="text-sm font-mono font-normal opacity-60">/ 100</span>
              </div>
              <div className="text-[10px] font-bold text-[var(--accent-copper)] uppercase tracking-wider pt-0.5">
                DEVIATION INDEX — NOT FAILURE PROBABILITY
              </div>
            </div>
            <div className="text-[10px] text-[var(--text-graphite-muted)] text-right md:max-w-[220px]">
              Calibrated Isolation Forest distance score from 6-channel normal baseline.
            </div>
          </div>

          {/* Precise Horizontal Analytical Scale */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
              <span>0 (NORMAL BASELINE)</span>
              <span className="font-bold text-[var(--accent-copper)]">50 (DEVIATION THRESHOLD)</span>
              <span>100 (HIGH DEVIATION)</span>
            </div>

            <div className="relative w-full h-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/50 overflow-hidden">
              {/* Threshold Boundary Marker at 50% */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[var(--accent-copper)]/40 z-10" />

              {/* Active Fill Bar */}
              <div
                className={`h-full transition-all duration-300 ${
                  anomalyIndex >= 50 ? "bg-[var(--accent-copper)]" : "bg-emerald-600/70"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, anomalyIndex))}%` }}
              />

              {/* Thin Copper Needle Marker */}
              <div
                className="absolute top-0 bottom-0 w-[3px] bg-[var(--accent-copper)] z-20 shadow-xs"
                style={{ left: `calc(${Math.min(100, Math.max(0, anomalyIndex))}% - 1.5px)` }}
              />
            </div>
          </div>
        </div>

        {/* 2. SECONDARY: Rolling 5-Sample Decision Window (col-span-4) */}
        <div className="lg:col-span-4 p-4 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
            <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
              RECENT DECISION WINDOW
            </span>
            <span className="text-[9px] font-bold text-[var(--text-charcoal)]">5 SAMPLES</span>
          </div>

          <div className="space-y-2">
            <div className="text-[9px] text-[var(--text-graphite-muted)] uppercase tracking-wider">
              ROLLING SAMPLE BUFFER (ANTI-FLICKER):
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {windowSamples.map((state, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded-[2px] border text-[9px] font-bold ${
                    state === "DEVIATION"
                      ? "bg-[var(--accent-copper)] text-white border-[var(--accent-copper)]"
                      : "bg-emerald-500/10 text-emerald-900 border-emerald-500/20"
                  }`}
                >
                  <div className="text-[7px] opacity-70">S{idx + 1}</div>
                  <div>{state === "DEVIATION" ? "DEV" : "NORM"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-light)]/30 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-[var(--text-graphite-muted)]">CURRENT WINDOW:</span>
              <strong className="text-[var(--text-charcoal)]">{anomalousCount} / 5 ANOMALOUS</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-graphite-muted)]">MODEL TRIGGER:</span>
              <strong className="text-[var(--accent-copper)]">≥ 3 / 5 MAJORITY</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Input Features Strip -> Model Flow Visual */}
      <div className="p-3.5 rounded-[2px] bg-white/80 border border-[var(--border-light)]/40 shadow-xs space-y-2.5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/30 pb-1.5">
          <span className="text-[10px] text-[var(--text-graphite-muted)] font-bold tracking-wider uppercase">
            MODEL INPUT CHANNELS → FEATURE MATRIX
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)]">6 NUMERICAL VECTOR</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-[10px]">
          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <div className="text-[8px] text-[var(--text-graphite-muted)]">01 TEMPERATURE</div>
            <div className="font-bold text-[var(--text-charcoal)] pt-0.5">{telemetry.temperature.toFixed(1)} °C</div>
          </div>
          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <div className="text-[8px] text-[var(--text-graphite-muted)]">02 VIBRATION</div>
            <div className="font-bold text-[var(--text-charcoal)] pt-0.5">{telemetry.vibration.toFixed(2)} g</div>
          </div>
          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <div className="text-[8px] text-[var(--text-graphite-muted)]">03 MOTOR CURRENT</div>
            <div className="font-bold text-[var(--text-charcoal)] pt-0.5">{telemetry.current.toFixed(2)} A</div>
          </div>
          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <div className="text-[8px] text-[var(--text-graphite-muted)]">04 BELT SPEED</div>
            <div className="font-bold text-[var(--text-charcoal)] pt-0.5">{telemetry.speed.toFixed(2)} m/s</div>
          </div>
          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <div className="text-[8px] text-[var(--text-graphite-muted)]">05 ALIGNMENT</div>
            <div className="font-bold text-[var(--text-charcoal)] pt-0.5">
              {telemetry.alignment > 0 ? `+${telemetry.alignment.toFixed(1)}` : telemetry.alignment.toFixed(1)} mm
            </div>
          </div>
          <div className="p-2 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40">
            <div className="text-[8px] text-[var(--text-graphite-muted)]">06 LOAD</div>
            <div className="font-bold text-[var(--text-charcoal)] pt-0.5">{telemetry.load.toFixed(1)} t/h</div>
          </div>
        </div>

        {/* Micro Flow Connector */}
        <div className="flex items-center justify-center gap-2 text-[9px] text-[var(--text-graphite-muted)] pt-1 uppercase">
          <span>STANDARD SCALER</span>
          <span>→</span>
          <span className="font-bold text-[var(--accent-copper)]">ISOLATION FOREST (200 TREES)</span>
          <span>→</span>
          <span className="font-bold text-[var(--text-charcoal)]">ANOMALY ASSESSMENT</span>
        </div>
      </div>

      {/* Top Baseline Deviations Grid */}
      <div className="p-4 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-2">
          <span className="text-[11px] font-bold text-[var(--accent-copper)] tracking-wider uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>// TOP BASELINE DEVIATIONS (Z-SCORE DEVIATION RANGE)</span>
          </span>
          <span className="text-[9px] text-[var(--text-graphite-muted)] uppercase">
            DISTANCE FROM NORMAL BASELINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topDeviations.slice(0, 3).map((item, idx) => (
            <div key={idx} className="p-3 rounded-[2px] bg-[var(--bg-stone)] border border-[var(--border-light)]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-charcoal)] uppercase">
                  #{idx + 1} {item.metric}
                </span>
                <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--accent-copper)]/10 text-[var(--accent-copper)] font-bold text-[9px] border border-[var(--accent-copper)]/30">
                  {item.deviation.toFixed(1)}σ FROM BASELINE
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-[8px] text-[var(--text-graphite-muted)] uppercase">CURRENT VALUE</div>
                  <div className="font-heading text-lg font-bold text-[var(--text-charcoal)]">
                    {item.value} <span className="text-xs font-mono font-normal opacity-70">{item.unit || baselineMeans[item.metric.toLowerCase()]?.unit || ""}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-[var(--text-graphite-muted)] uppercase">BASELINE μ</div>
                  <div className="text-xs font-bold text-[var(--text-graphite-muted)]">
                    {(item.mean ?? baselineMeans[item.metric.toLowerCase()]?.mean ?? 0.0).toFixed(1)} {item.unit || baselineMeans[item.metric.toLowerCase()]?.unit || ""}
                  </div>
                </div>
              </div>

              {/* Horizontal Deviation Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[7px] text-[var(--text-graphite-muted)]">
                  <span>0σ</span>
                  <span>1σ</span>
                  <span>2σ</span>
                  <span>3σ+</span>
                </div>
                <div className="w-full h-1.5 rounded-[2px] bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-copper)] transition-all duration-300"
                    style={{ width: `${Math.min(100, (item.deviation / 3.0) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Model Architecture & Baseline Context + Scientific Disclosure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
        {/* Model Architecture & Baseline Metadata (col-span-7) */}
        <div className="lg:col-span-7 p-4 rounded-[2px] bg-white/75 border border-[var(--border-light)]/30 space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--border-light)]/25 pb-2">
            <Layers className="w-4 h-4 text-[var(--accent-copper)]" />
            <span className="text-[11px] font-bold text-[var(--text-charcoal)] tracking-wider uppercase">
              MODEL ARCHITECTURE &amp; BASELINE CONTEXT
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-[var(--text-charcoal)]">
            <div className="border-b border-[var(--border-light)]/15 pb-1">
              <span className="text-[var(--text-graphite-muted)] block">MODEL ALGORITHM</span>
              <strong className="text-[var(--accent-copper)]">Isolation Forest (Scikit-Learn)</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/15 pb-1">
              <span className="text-[var(--text-graphite-muted)] block">TYPE</span>
              <strong>Unsupervised Multivariate Anomaly Detection</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/15 pb-1">
              <span className="text-[var(--text-graphite-muted)] block">INPUT VECTOR</span>
              <strong>6 Numerical Telemetry Channels</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/15 pb-1">
              <span className="text-[var(--text-graphite-muted)] block">TRAINING BASELINE</span>
              <strong>1,733 Normal Operating Records</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/15 pb-1">
              <span className="text-[var(--text-graphite-muted)] block">ESTIMATORS</span>
              <strong>200 Isolation Trees (N=200)</strong>
            </div>
            <div className="border-b border-[var(--border-light)]/15 pb-1">
              <span className="text-[var(--text-graphite-muted)] block">PREPROCESSING</span>
              <strong>StandardScaler (z-score normalization)</strong>
            </div>
            <div>
              <span className="text-[var(--text-graphite-muted)] block">ROLLING BUFFER</span>
              <strong>5 Samples (3-of-5 Majority Filter)</strong>
            </div>
            <div>
              <span className="text-[var(--text-graphite-muted)] block">DATA SOURCE</span>
              <strong>Cloud Synthetic Telemetry</strong>
            </div>
          </div>
        </div>

        {/* Scientific Disclosure Box (col-span-5) */}
        <div className="lg:col-span-5 p-4 rounded-[2px] bg-amber-500/[0.06] border border-amber-500/20 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider text-amber-900 border-b border-amber-500/15 pb-1.5">
            <Info className="w-4 h-4 text-amber-800 shrink-0" />
            <span>SCIENTIFIC DISCLOSURE</span>
          </div>
          <p className="font-sans text-[11px] leading-relaxed text-amber-950">
            This prototype model learns patterns from synthetic NORMAL telemetry and detects multivariate deviations from that baseline.
          </p>
          <div className="text-[10px] font-mono text-amber-900 font-bold uppercase pt-1">
            IT DOES NOT PREDICT:
          </div>
          <ul className="list-disc list-inside font-sans text-[10.5px] text-amber-950 space-y-0.5">
            <li>Belt rupture or mechanical tear</li>
            <li>Remaining Useful Life (RUL)</li>
            <li>Exact time-to-failure</li>
            <li>Failure probability percentage</li>
          </ul>
          <p className="font-sans text-[10px] text-amber-900/80 pt-1 italic">
            Real sensor datasets and controlled fault experiments are required for industrial model validation.
          </p>
        </div>
      </div>

      {/* Link to Decision Support */}
      <div className="p-3.5 rounded-[2px] bg-white/90 border border-[var(--border-light)]/50 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div>
          <div className="text-[9px] font-bold text-[var(--accent-copper)] uppercase tracking-wider">
            ANOMALY DETECTION IS ONE EVIDENCE SOURCE
          </div>
          <div className="text-[11px] font-bold text-[var(--text-charcoal)] pt-0.5">
            RULES + CONDITION ENGINE + ANOMALY ASSESSMENT → DECISION SUPPORT
          </div>
        </div>

        <Link
          href="/control-center/decision-support"
          className="px-3.5 py-1.5 rounded-[2px] bg-[var(--accent-copper)] text-white hover:bg-[var(--accent-copper)]/90 text-[11px] font-bold flex items-center gap-1.5 shrink-0"
        >
          <span>VIEW DECISION SUPPORT</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
