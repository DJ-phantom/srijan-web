export interface TelemetryRecord {
  id?: number;
  device_id: string;
  timestamp: string;
  scenario: string;
  temperature: number;
  vibration: number;
  current: number;
  speed: number;
  alignment: number;
  load: number;
  created_at?: string;
}

export function parseTelemetryTimestamp(recordOrTs: TelemetryRecord | string | undefined | null): Date | null {
  if (!recordOrTs) return null;
  const rawStr = typeof recordOrTs === "string" ? recordOrTs : recordOrTs.timestamp || (recordOrTs as any).created_at;
  if (!rawStr || typeof rawStr !== "string") return null;

  let normalized = rawStr.trim();

  // Normalize +00 / +0000 / +00:00 to Z
  if (normalized.endsWith("+00") || normalized.endsWith("+0000") || normalized.endsWith("+00:00")) {
    normalized = normalized.replace(/\+00(:?00)?$/, "Z");
  } else if (/\+\d{2}$/.test(normalized)) {
    normalized = normalized + ":00";
  } else if (/\+\d{4}$/.test(normalized)) {
    normalized = normalized.slice(0, -2) + ":" + normalized.slice(-2);
  }

  // If normalized string has NO timezone specification (no 'Z', no '+', no '-'), treat as UTC by appending 'Z'
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(normalized)) {
    normalized = normalized + "Z";
  }

  const date = new Date(normalized);
  if (isNaN(date.getTime())) {
    const rawDate = new Date(rawStr);
    return isNaN(rawDate.getTime()) ? null : rawDate;
  }
  return date;
}

export function formatTelemetryTime(recordOrTs: TelemetryRecord | string | undefined | null): string {
  const date = parseTelemetryTimestamp(recordOrTs);
  if (!date) return "--:--:--";
  return date.toLocaleTimeString();
}

export interface AlertRecord {
  id: number;
  device_id: string;
  metric: string;
  severity: "CRITICAL" | "WARNING" | "ATTENTION" | "INFO";
  title: string;
  message: string;
  value: number;
  unit: string;
  started_at: string;
  last_seen_at: string;
  resolved_at?: string | null;
  is_active: boolean;
}

export interface RiskContributor {
  metric: string;
  risk: number;
  severity: string;
  value: number;
  unit: string;
  message: string;
}

export interface ConditionSubsystem {
  risk_index: number;
  level: "NORMAL" | "ATTENTION" | "WARNING" | "CRITICAL" | "WATCH" | "ELEVATED" | "HIGH";
  message: string;
  contributors: RiskContributor[];
}

export interface ConditionSummary {
  device_id: string;
  timestamp: string;
  overall: ConditionSubsystem;
  splice: ConditionSubsystem;
}

export interface DeviationItem {
  metric: string;
  value: number;
  mean: number;
  std: number;
  deviation: number;
  unit: string;
}

export interface AnomalyAssessment {
  device_id?: string;
  timestamp?: string;
  status: "NORMAL_PATTERN" | "ANOMALOUS_PATTERN" | "STABLE_NORMAL" | "ANOMALY_SPIKE" | "NO_DATA" | string;
  anomaly_index: number;
  is_anomaly: boolean;
  top_deviations: DeviationItem[];
  available?: boolean;
  stable_anomaly?: boolean;
  decision_score?: number;
  recent_anomaly_count?: number;
  window_size?: number;
  model_type?: string;
  training_sample_count?: number;
}

export interface DecisionEvidence {
  source: "RULE" | "CONDITION" | "ANOMALY";
  severity: "CRITICAL" | "WARNING" | "ATTENTION";
  title: string;
  detail: string;
}

export interface DecisionAction {
  priority: "PRIORITY" | "RECOMMENDED" | "ROUTINE";
  action: string;
}

export interface DecisionSummary {
  device_id: string;
  timestamp: string;
  level: "CRITICAL" | "WARNING" | "ATTENTION" | "NORMAL";
  headline: string;
  evidence_agreement: "HIGH" | "MODERATE" | "LOW";
  active_alert_count: number;
  condition_level: string;
  splice_level: string;
  ml_status: string;
  evidence: DecisionEvidence[];
  suggested_actions: DecisionAction[];
}

export interface SystemSubsystemStatus {
  name: string;
  status: "OPERATIONAL" | "DEGRADED" | "STANDBY" | "OFFLINE";
  details: string;
}

export interface SystemStatusSummary {
  device_id: string;
  timestamp: string;
  mode: string;
  cadence: string;
  subsystems: SystemSubsystemStatus[];
}

export interface HealthInfo {
  status: string;
  mqtt_connected: boolean;
  mqtt_required: boolean;
  database_connected: boolean;
  cloud_demo: boolean;
  data_source: string;
  data_source_mode: string;
  device_id: string;
  telemetry_topic: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      // Cache-control for live telemetry polling
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`API request failed: ${endpoint} HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    // Graceful error handling if FastAPI backend is offline
    return null;
  }
}

export const api = {
  getLatestTelemetry: () => fetchJson<TelemetryRecord>("/api/telemetry/latest"),
  getTelemetryHistory: (limit: number = 20) => fetchJson<TelemetryRecord[]>(`/api/telemetry/history?limit=${limit}`),
  getTelemetryCount: () => fetchJson<{ count: number }>("/api/telemetry/count"),
  getActiveAlerts: () => fetchJson<AlertRecord[]>("/api/alerts/active"),
  getAlertHistory: (limit: number = 50) => fetchJson<AlertRecord[]>(`/api/alerts/history?limit=${limit}`),
  getAlertCount: () => fetchJson<{ active: number; total: number }>("/api/alerts/count"),
  getConditionSummary: () => fetchJson<ConditionSummary>("/api/condition/summary"),
  getAnomalyStatus: () => fetchJson<AnomalyAssessment>("/api/anomaly/status"),
  getDecisionSummary: () => fetchJson<DecisionSummary>("/api/decision-support/summary"),
  getHealth: () => fetchJson<HealthInfo>("/health"),
};
