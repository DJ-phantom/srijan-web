import { TelemetryRecord, parseTelemetryTimestamp, formatTelemetryTime } from "@/lib/api";

export interface ChannelRuleConfig {
  id: string;
  code: string;
  key: keyof TelemetryRecord;
  name: string;
  shortName: string;
  unit: string;
  decimals: number;
  target: number;
  targetStr: string;
  warn: number;
  warnStr: string;
  crit: number;
  critStr: string;
  type: "high" | "low" | "abs_high";
  normalBandStr: string;
  description: string;
}

// Canonical Shared Rule Threshold Configuration (matching FastAPI backend rule engine)
export const CANONICAL_CHANNEL_CONFIGS: Record<string, ChannelRuleConfig> = {
  temperature: {
    id: "temperature",
    code: "01",
    key: "temperature",
    name: "DRIVE TEMPERATURE",
    shortName: "01 TEMPERATURE",
    unit: "°C",
    decimals: 1,
    target: 41.0,
    targetStr: "41.0 °C",
    warn: 44.5,
    warnStr: "≥ 44.5 °C",
    crit: 48.0,
    critStr: "≥ 48.0 °C",
    type: "high",
    normalBandStr: "< 44.5 °C",
    description: "Thermal sensor embedded near primary pulley drive bearing housing.",
  },
  vibration: {
    id: "vibration",
    code: "02",
    key: "vibration",
    name: "DRIVE VIBRATION",
    shortName: "02 VIBRATION",
    unit: "g",
    decimals: 2,
    target: 0.27,
    targetStr: "0.27 g",
    warn: 0.40,
    warnStr: "≥ 0.40 g",
    crit: 0.60,
    critStr: "≥ 0.60 g",
    type: "high",
    normalBandStr: "< 0.40 g",
    description: "Tri-axial accelerometer mounted on main drive gearbox frame.",
  },
  current: {
    id: "current",
    code: "03",
    key: "current",
    name: "MOTOR CURRENT",
    shortName: "03 MOTOR CURRENT",
    unit: "A",
    decimals: 2,
    target: 4.15,
    targetStr: "4.15 A",
    warn: 4.70,
    warnStr: "≥ 4.70 A",
    crit: 5.50,
    critStr: "≥ 5.50 A",
    type: "high",
    normalBandStr: "< 4.70 A",
    description: "Single-phase current transducer monitoring motor draw and resistance.",
  },
  speed: {
    id: "speed",
    code: "04",
    key: "speed",
    name: "BELT SPEED",
    shortName: "04 BELT SPEED",
    unit: "m/s",
    decimals: 2,
    target: 1.80,
    targetStr: "1.80 m/s",
    warn: 1.68,
    warnStr: "≤ 1.68 m/s",
    crit: 1.58,
    critStr: "≤ 1.58 m/s",
    type: "low",
    normalBandStr: "1.68 – 2.00 m/s",
    description: "Optical tachometer tracking linear conveyor belt speed.",
  },
  alignment: {
    id: "alignment",
    code: "05",
    key: "alignment",
    name: "BELT ALIGNMENT",
    shortName: "05 ALIGNMENT",
    unit: "mm",
    decimals: 1,
    target: 0.0,
    targetStr: "0.0 mm",
    warn: 3.0,
    warnStr: "≥ |3.0| mm",
    crit: 5.0,
    critStr: "≥ |5.0| mm",
    type: "abs_high",
    normalBandStr: "-3.0 to +3.0 mm",
    description: "Transverse displacement of belt centerline relative to return idlers.",
  },
  load: {
    id: "load",
    code: "06",
    key: "load",
    name: "MATERIAL LOAD",
    shortName: "06 LOAD",
    unit: "%",
    decimals: 1,
    target: 60.0,
    targetStr: "60.0 %",
    warn: 75.0,
    warnStr: "≥ 75.0 %",
    crit: 85.0,
    critStr: "≥ 85.0 %",
    type: "high",
    normalBandStr: "< 75.0 %",
    description: "Material loading percentage passing across weigh scale idler.",
  },
};

export const CANONICAL_CHANNEL_LIST = Object.values(CANONICAL_CHANNEL_CONFIGS);

export const DEBOUNCE_HYSTERESIS_CONFIG = {
  warningDebounceSamples: 3,
  criticalDebounceSamples: 1,
  recoveryHysteresisSamples: 3,
  warningText: "3 / 3 ABNORMAL READINGS TO ACTIVATE",
  criticalText: "IMMEDIATE ACTIVATION UPON SAFETY BREACH",
  recoveryText: "3 / 3 NORMAL READINGS TO RESOLVE",
};

export const CONTROL_CENTER_DISPLAY_LABELS = {
  dataSource: "CLOUD SYNTHETIC TELEMETRY",
  physicalSensors: "SIMULATED",
  camera: "PLANNED",
  mqtt: "NOT REQUIRED IN CLOUD DEMO MODE",
  database: "POSTGRESQL",
  model: "ISOLATION FOREST",
  splice: "MONITORED SPLICE S1",
};

export function formatValueByMetric(metric: string, val: number): string {
  const m = metric.toLowerCase();
  const cfg = CANONICAL_CHANNEL_CONFIGS[m];
  if (!cfg) return val.toFixed(1);

  if (m === "alignment") {
    return val > 0 ? `+${val.toFixed(1)} mm` : `${val.toFixed(1)} mm`;
  }
  return `${val.toFixed(cfg.decimals)} ${cfg.unit}`;
}

export { parseTelemetryTimestamp, formatTelemetryTime };
