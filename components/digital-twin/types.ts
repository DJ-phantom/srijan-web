import { TelemetryRecord, AlertRecord, ConditionSummary, AnomalyAssessment, DecisionSummary } from "@/lib/api";

export type DigitalTwinZoneId = "ZONE_A" | "ZONE_B" | "ZONE_C" | "ZONE_D" | "ZONE_E";

export type SignalSeverity = "NORMAL" | "ATTENTION" | "WARNING" | "CRITICAL";

export interface SensorHotspotConfig {
  code: string;
  name: string;
  metric: keyof TelemetryRecord;
  unit: string;
  primaryZoneId: DigitalTwinZoneId;
  x: number; // percentage in SVG viewport (0-100)
  y: number; // percentage in SVG viewport (0-100)
}

export interface ZoneConfig {
  id: DigitalTwinZoneId;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  locationLabel: string;
  primaryMetrics: (keyof TelemetryRecord)[];
  eventMetricKeys: string[];
  hotspotCodes: string[];
  svgPath: string; // Coordinate region for SVG overlay
  centerPoint: { x: number; y: number };
}

export interface SignalStatusInfo {
  metric: string;
  value: number;
  formattedValue: string;
  status: SignalSeverity;
  warnLimit: string;
  critLimit: string;
  description: string;
}
