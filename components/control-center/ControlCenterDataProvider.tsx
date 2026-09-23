"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  api,
  TelemetryRecord,
  AlertRecord,
  ConditionSummary,
  AnomalyAssessment,
  DecisionSummary,
  SystemStatusSummary,
  HealthInfo,
  parseTelemetryTimestamp,
  formatTelemetryTime,
} from "@/lib/api";

export type { HealthInfo };

export type ControlCenterDataMode = "BACKEND_CONNECTED" | "FRONTEND_FALLBACK" | "BACKEND_ERROR";

export interface RiskHistoryPoint {
  timestamp: string;
  overallRisk: number;
  spliceRisk: number;
}

export interface AnomalyHistoryPoint {
  timestamp: string;
  anomalyIndex: number;
  isAnomaly: boolean;
  decisionScore?: number;
}

export interface ControlCenterDataState {
  dataMode: ControlCenterDataMode;
  isConnected: boolean;
  isBackendAvailable: boolean;
  lastUpdated: string;
  dataSource: "CLOUD_SYNTHETIC_TELEMETRY" | "DEMO_MOCK";
  softwarePipeline: "CONNECTED" | "DISCONNECTED";
  streamCadence: string;

  // Current Operational Snapshots
  telemetry: TelemetryRecord;
  activeAlerts: AlertRecord[];
  alertHistory: AlertRecord[];
  alertCounts: { active: number; total: number };
  conditionSummary: ConditionSummary | null;
  anomalyAssessment: AnomalyAssessment | null;
  decisionSummary: DecisionSummary | null;

  // Live Session Rolling Buffers (Bounded to 60 samples @ 1 Hz)
  telemetryHistory: TelemetryRecord[];
  overallRiskHistory: RiskHistoryPoint[];
  spliceRiskHistory: RiskHistoryPoint[];
  anomalyIndexHistory: AnomalyHistoryPoint[];

  // Infrastructure / Health Status (Polled at 3000ms)
  systemStatus: SystemStatusSummary;
  health: HealthInfo | null;
  telemetryCount: number | null;
  totalAlertCount: number | null;

  // On-demand Historical Fetching Helpers
  fetchTelemetryHistory: (limit?: number) => Promise<TelemetryRecord[] | null>;
  fetchAlertHistory: (limit?: number) => Promise<AlertRecord[] | null>;
  refreshAll: () => Promise<void>;
}

const fallbackTelemetry: TelemetryRecord = {
  device_id: "BC-01",
  timestamp: "2026-09-23T12:00:00.000Z",
  scenario: "NORMAL",
  temperature: 41.0,
  vibration: 0.27,
  current: 4.15,
  speed: 1.8,
  alignment: 0.0,
  load: 60.0,
};

const initialSystemStatus: SystemStatusSummary = {
  device_id: "BC-01",
  timestamp: new Date().toISOString(),
  mode: "CLOUD SYNTHETIC TELEMETRY",
  cadence: "1 HZ",
  subsystems: [
    { name: "FastAPI Backend", status: "STANDBY", details: "Local HTTP API Service" },
    { name: "PostgreSQL Storage", status: "STANDBY", details: "Time-series database" },
    { name: "Synthetic Generator", status: "OPERATIONAL", details: "1 Hz scenario simulator" },
    { name: "Condition Engine", status: "OPERATIONAL", details: "Multi-sensor risk fusion" },
    { name: "Isolation Forest ML", status: "OPERATIONAL", details: "Scikit-Learn multivariate model" },
    { name: "Decision Support Engine", status: "OPERATIONAL", details: "Explainable diagnostic aggregator" },
    { name: "Rule Alert Engine", status: "OPERATIONAL", details: "Stateful hysteresis recovery" },
    { name: "Local LCD Feed", status: "OPERATIONAL", details: "20x4 character LCD formatter" },
    { name: "Optical Camera CV", status: "STANDBY", details: "Planned future vision pipeline" },
  ],
};

const ControlCenterContext = createContext<ControlCenterDataState | null>(null);

export default function ControlCenterDataProvider({ children }: { children: React.ReactNode }) {
  // Live Session Rolling Buffer Refs (Prevent memory growth, strictly bounded at 60)
  const telemetryBufferRef = useRef<TelemetryRecord[]>([]);
  const riskBufferRef = useRef<RiskHistoryPoint[]>([]);
  const anomalyBufferRef = useRef<AnomalyHistoryPoint[]>([]);
  const isSeededRef = useRef<boolean>(false);

  const [state, setState] = useState<ControlCenterDataState>({
    dataMode: "FRONTEND_FALLBACK",
    isConnected: false,
    isBackendAvailable: false,
    lastUpdated: "--:--:--",
    dataSource: "DEMO_MOCK",
    softwarePipeline: "DISCONNECTED",
    streamCadence: "1 HZ",
    telemetry: fallbackTelemetry,
    activeAlerts: [],
    alertHistory: [],
    alertCounts: { active: 3, total: 12 },
    conditionSummary: null,
    anomalyAssessment: null,
    decisionSummary: null,
    telemetryHistory: [],
    overallRiskHistory: [],
    spliceRiskHistory: [],
    anomalyIndexHistory: [],
    systemStatus: initialSystemStatus,
    health: null,
    telemetryCount: null,
    totalAlertCount: null,
    fetchTelemetryHistory: (limit = 50) => api.getTelemetryHistory(limit),
    fetchAlertHistory: (limit = 50) => api.getAlertHistory(limit),
    refreshAll: async () => {},
  });

  // Seed initial telemetry history buffer from DB once on mount
  useEffect(() => {
    if (isSeededRef.current) return;
    api.getTelemetryHistory(60).then((hist) => {
      if (hist && hist.length > 0) {
        // DB returns newest first, so reverse to chronological order for buffer
        const chronological = [...hist].reverse();
        telemetryBufferRef.current = chronological;
        isSeededRef.current = true;
      }
    });
  }, []);

  // 1. FAST LIVE POLLING LOOP (1000ms = 1 Hz)
  const pollLiveData = useCallback(async () => {
    try {
      const [
        latestTelemetry,
        activeAlerts,
        alertCounts,
        conditionSummary,
        anomalyAssessment,
        decisionSummary,
      ] = await Promise.all([
        api.getLatestTelemetry(),
        api.getActiveAlerts(),
        api.getAlertCount(),
        api.getConditionSummary(),
        api.getAnomalyStatus(),
        api.getDecisionSummary(),
      ]);

      const isBackendLive = latestTelemetry !== null;

      if (isBackendLive && latestTelemetry) {
        const lastTs =
          telemetryBufferRef.current.length > 0
            ? telemetryBufferRef.current[telemetryBufferRef.current.length - 1].timestamp
            : null;

        // Append to rolling buffers only if a new 1 Hz sample arrived
        if (latestTelemetry.timestamp !== lastTs) {
          // Telemetry Buffer (60 max)
          telemetryBufferRef.current = [...telemetryBufferRef.current, latestTelemetry].slice(-60);

          // Risk Buffer (60 max)
          if (conditionSummary) {
            const riskPoint: RiskHistoryPoint = {
              timestamp: latestTelemetry.timestamp,
              overallRisk: conditionSummary.overall.risk_index,
              spliceRisk: conditionSummary.splice.risk_index,
            };
            riskBufferRef.current = [...riskBufferRef.current, riskPoint].slice(-60);
          }

          // Anomaly Buffer (60 max)
          if (anomalyAssessment) {
            const anomalyPoint: AnomalyHistoryPoint = {
              timestamp: latestTelemetry.timestamp,
              anomalyIndex: anomalyAssessment.anomaly_index,
              isAnomaly: anomalyAssessment.is_anomaly,
              decisionScore: anomalyAssessment.decision_score,
            };
            anomalyBufferRef.current = [...anomalyBufferRef.current, anomalyPoint].slice(-60);
          }
        }

        setState((prev) => ({
          ...prev,
          dataMode: "BACKEND_CONNECTED",
          isConnected: true,
          isBackendAvailable: true,
          lastUpdated: formatTelemetryTime(latestTelemetry) || "--:--:--",
          dataSource: "CLOUD_SYNTHETIC_TELEMETRY",
          softwarePipeline: "CONNECTED",
          streamCadence: "1 HZ",
          telemetry: latestTelemetry,
          activeAlerts: activeAlerts || [],
          alertCounts: alertCounts || { active: 0, total: 0 },
          conditionSummary,
          anomalyAssessment,
          decisionSummary,
          telemetryHistory: [...telemetryBufferRef.current],
          overallRiskHistory: [...riskBufferRef.current],
          spliceRiskHistory: [...riskBufferRef.current],
          anomalyIndexHistory: [...anomalyBufferRef.current],
          systemStatus: {
            device_id: latestTelemetry.device_id || "ESP32-01",
            timestamp: latestTelemetry.timestamp,
            mode: "CLOUD SYNTHETIC TELEMETRY",
            cadence: "1 HZ",
            subsystems: [
              { name: "FastAPI Backend", status: "OPERATIONAL", details: "Active API Service" },
              { name: "PostgreSQL Storage", status: "OPERATIONAL", details: "Connected time-series pool" },
              { name: "Synthetic Generator", status: "OPERATIONAL", details: "Running 1 Hz telemetry loop" },
              { name: "Condition Engine", status: "OPERATIONAL", details: "Active continuous risk fusion" },
              { name: "Isolation Forest ML", status: "OPERATIONAL", details: "Loaded conveyor_anomaly_model.joblib" },
              { name: "Decision Support Engine", status: "OPERATIONAL", details: "Active diagnostic evidence engine" },
              { name: "Rule Alert Engine", status: "OPERATIONAL", details: "Active stateful hysteresis" },
              { name: "Local LCD Feed", status: "OPERATIONAL", details: "Active 20x4 LCD formatter" },
              { name: "Optical Camera CV", status: "STANDBY", details: "Planned / Not Connected" },
            ],
          },
        }));
      } else {
        setState((prev) => ({
          ...prev,
          dataMode: "FRONTEND_FALLBACK",
          isConnected: false,
          isBackendAvailable: false,
          softwarePipeline: "DISCONNECTED",
          dataSource: "DEMO_MOCK",
          lastUpdated: new Date().toLocaleTimeString(),
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        dataMode: "BACKEND_ERROR",
        isConnected: false,
        isBackendAvailable: false,
        softwarePipeline: "DISCONNECTED",
        dataSource: "DEMO_MOCK",
        lastUpdated: new Date().toLocaleTimeString(),
      }));
    }
  }, []);

  // 2. SLOWER INFRASTRUCTURE & HEALTH POLLING LOOP (3000ms = 0.33 Hz)
  const pollHealthData = useCallback(async () => {
    try {
      const [health, tCount, aCount] = await Promise.all([
        api.getHealth(),
        api.getTelemetryCount(),
        api.getAlertCount(),
      ]);

      setState((prev) => ({
        ...prev,
        health: health || prev.health,
        telemetryCount: tCount ? tCount.count : prev.telemetryCount,
        totalAlertCount: aCount ? aCount.total : prev.totalAlertCount,
      }));
    } catch (err) {
      // Graceful fallback
    }
  }, []);

  // Setup single master polling timers
  useEffect(() => {
    pollLiveData();
    pollHealthData();

    const liveInterval = setInterval(pollLiveData, 1000);
    const healthInterval = setInterval(pollHealthData, 3000);

    return () => {
      clearInterval(liveInterval);
      clearInterval(healthInterval);
    };
  }, [pollLiveData, pollHealthData]);

  return (
    <ControlCenterContext.Provider value={state}>
      {children}
    </ControlCenterContext.Provider>
  );
}

export function useControlCenterContext(): ControlCenterDataState {
  const context = useContext(ControlCenterContext);
  if (!context) {
    throw new Error(
      "useControlCenterContext must be used within a ControlCenterDataProvider"
    );
  }
  return context;
}
