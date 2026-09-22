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
  device_id: string;
  timestamp: string;
  status: "STABLE_NORMAL" | "ANOMALOUS_PATTERN" | "UNSTABLE_NORMAL" | "ANOMALY_SPIKE" | "NO_DATA" | string;
  anomaly_index: number;
  is_anomaly: boolean;
  top_deviations: DeviationItem[];
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
  getHealth: () => fetchJson<{ status: string; timestamp: string; version: string }>("/health"),
};
