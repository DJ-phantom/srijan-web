import { DigitalTwinZoneId, ZoneConfig, SensorHotspotConfig, SignalSeverity, SignalStatusInfo } from "./types";
import { CANONICAL_CHANNEL_CONFIGS } from "@/lib/controlCenterConfig";
import { TelemetryRecord } from "@/lib/api";

export const PHYSICAL_ZONES: ZoneConfig[] = [
  {
    id: "ZONE_A",
    code: "ZONE A",
    name: "DRIVE HEAD",
    subtitle: "Drive Assembly & Pulley Housing",
    description: "Houses the primary electric drive motor, speed reducer, gearbox, and drive pulley bearing assemblies.",
    locationLabel: "Head Section (0m - 12m)",
    primaryMetrics: ["temperature", "vibration", "current"],
    eventMetricKeys: ["temperature", "current", "vibration"],
    hotspotCodes: ["T-01", "V-01", "M-01"],
    svgPath: "M 35 40 L 220 40 L 220 220 L 35 220 Z",
    centerPoint: { x: 125, y: 130 },
  },
  {
    id: "ZONE_B",
    code: "ZONE B",
    name: "BELT SECTION A",
    subtitle: "Carrying Strand (Head to Splice)",
    description: "Upper carrying belt section supported by troughing idlers, conveying bulk material toward head discharge.",
    locationLabel: "Carrying Strand (12m - 45m)",
    primaryMetrics: ["speed"],
    eventMetricKeys: ["speed"],
    hotspotCodes: ["S-01"],
    svgPath: "M 220 40 L 440 40 L 440 220 L 220 220 Z",
    centerPoint: { x: 330, y: 130 },
  },
  {
    id: "ZONE_C",
    code: "ZONE C",
    name: "MONITORED SPLICE S1",
    subtitle: "Vulcanized Joint S1 Inspection Zone",
    description: "High-priority monitored conveyor belt vulcanized joint undergoing continuous acoustic and optical vibration tracking.",
    locationLabel: "Splice Region S1 (45m - 55m)",
    primaryMetrics: ["vibration"],
    eventMetricKeys: ["splice"],
    hotspotCodes: ["V-01"],
    svgPath: "M 440 40 L 590 40 L 590 220 L 440 220 Z",
    centerPoint: { x: 515, y: 130 },
  },
  {
    id: "ZONE_D",
    code: "ZONE D",
    name: "BELT SECTION B / TRACKING",
    subtitle: "Return Strand & Tracking Idlers",
    description: "Lower return belt strand instrumented with self-aligning tracking idlers to detect lateral belt drift.",
    locationLabel: "Tracking Region (55m - 88m)",
    primaryMetrics: ["alignment", "speed"],
    eventMetricKeys: ["alignment"],
    hotspotCodes: ["A-01", "S-01"],
    svgPath: "M 590 40 L 810 40 L 810 220 L 590 220 Z",
    centerPoint: { x: 700, y: 130 },
  },
  {
    id: "ZONE_E",
    code: "ZONE E",
    name: "TAIL / LOADING",
    subtitle: "Tail Pulley & Loading Chute",
    description: "Tail pulley assembly and impact chute area where raw material is received onto the conveyor belt.",
    locationLabel: "Tail Section (88m - 100m)",
    primaryMetrics: ["load"],
    eventMetricKeys: ["load"],
    hotspotCodes: ["L-01"],
    svgPath: "M 810 40 L 965 40 L 965 220 L 810 220 Z",
    centerPoint: { x: 887, y: 130 },
  },
];

export const SENSOR_HOTSPOTS: SensorHotspotConfig[] = [
  {
    code: "T-01",
    name: "DRIVE TEMPERATURE",
    metric: "temperature",
    unit: "°C",
    primaryZoneId: "ZONE_A",
    x: 10,
    y: 28,
  },
  {
    code: "V-01",
    name: "BEARING VIBRATION",
    metric: "vibration",
    unit: "g",
    primaryZoneId: "ZONE_A",
    x: 18,
    y: 68,
  },
  {
    code: "M-01",
    name: "MOTOR CURRENT",
    metric: "current",
    unit: "A",
    primaryZoneId: "ZONE_A",
    x: 8,
    y: 80,
  },
  {
    code: "S-01",
    name: "TACHOMETER SPEED",
    metric: "speed",
    unit: "m/s",
    primaryZoneId: "ZONE_B",
    x: 34,
    y: 28,
  },
  {
    code: "A-01",
    name: "BELT ALIGNMENT",
    metric: "alignment",
    unit: "mm",
    primaryZoneId: "ZONE_D",
    x: 72,
    y: 72,
  },
  {
    code: "L-01",
    name: "WEIGH SCALE LOAD",
    metric: "load",
    unit: "%",
    primaryZoneId: "ZONE_E",
    x: 90,
    y: 28,
  },
];

export function getSignalStatus(metric: keyof TelemetryRecord, value: number): SignalStatusInfo {
  const cfg = CANONICAL_CHANNEL_CONFIGS[metric as string];
  if (!cfg) {
    return {
      metric: String(metric),
      value,
      formattedValue: String(value),
      status: "NORMAL",
      warnLimit: "N/A",
      critLimit: "N/A",
      description: "Sensor signal",
    };
  }

  let status: SignalSeverity = "NORMAL";

  if (cfg.type === "abs_high") {
    const absVal = Math.abs(value);
    if (absVal >= cfg.crit) status = "CRITICAL";
    else if (absVal >= cfg.warn) status = "WARNING";
  } else if (cfg.type === "low") {
    if (value <= cfg.crit) status = "CRITICAL";
    else if (value <= cfg.warn) status = "WARNING";
  } else {
    if (value >= cfg.crit) status = "CRITICAL";
    else if (value >= cfg.warn) status = "WARNING";
  }

  let formattedValue = `${value.toFixed(cfg.decimals)} ${cfg.unit}`;
  if (metric === "alignment") {
    formattedValue = value > 0 ? `+${value.toFixed(1)} mm` : `${value.toFixed(1)} mm`;
  }

  return {
    metric: cfg.name,
    value,
    formattedValue,
    status,
    warnLimit: cfg.warnStr,
    critLimit: cfg.critStr,
    description: cfg.description,
  };
}

export function getOverallZoneStatus(
  zoneId: DigitalTwinZoneId,
  telemetry: TelemetryRecord | null,
  activeAlertMetricKeys: string[],
  spliceLevel?: string | null
): SignalSeverity {
  if (!telemetry) return "NORMAL";

  const zone = PHYSICAL_ZONES.find((z) => z.id === zoneId);
  if (!zone) return "NORMAL";

  // SPECIAL TREATMENT FOR ZONE C (MONITORED SPLICE S1)
  if (zoneId === "ZONE_C") {
    let spliceStatus: SignalSeverity = "NORMAL";

    if (spliceLevel) {
      const lvl = spliceLevel.toUpperCase();
      if (lvl === "CRITICAL" || lvl === "HIGH") spliceStatus = "CRITICAL";
      else if (lvl === "WARNING" || lvl === "ELEVATED") spliceStatus = "WARNING";
      else if (lvl === "ATTENTION" || lvl === "WATCH") spliceStatus = "ATTENTION";
    }

    const hasEventInZone = zone.eventMetricKeys.some((k) => activeAlertMetricKeys.includes(k));
    if (hasEventInZone && spliceStatus === "NORMAL") {
      spliceStatus = "WARNING";
    }

    return spliceStatus;
  }

  // FOR ZONES A, B, D, E:
  const hasEventInZone = zone.eventMetricKeys.some((k) => activeAlertMetricKeys.includes(k));

  let highestSignalStatus: SignalSeverity = "NORMAL";
  for (const m of zone.primaryMetrics) {
    const val = Number(telemetry[m] ?? 0);
    const sigInfo = getSignalStatus(m, val);
    if (sigInfo.status === "CRITICAL") highestSignalStatus = "CRITICAL";
    else if (sigInfo.status === "WARNING" && highestSignalStatus !== "CRITICAL") highestSignalStatus = "WARNING";
    else if (sigInfo.status === "ATTENTION" && highestSignalStatus === "NORMAL") highestSignalStatus = "ATTENTION";
  }

  if (hasEventInZone && (highestSignalStatus === "NORMAL" || highestSignalStatus === "ATTENTION")) {
    return "WARNING";
  }

  return highestSignalStatus;
}
