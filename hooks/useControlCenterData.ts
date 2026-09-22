"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  api,
  TelemetryRecord,
  AlertRecord,
  ConditionSummary,
  AnomalyAssessment,
  DecisionSummary,
  SystemStatusSummary,
} from "@/lib/api";

export type ControlCenterDataMode = "BACKEND_CONNECTED" | "FRONTEND_FALLBACK" | "BACKEND_ERROR";

export interface ControlCenterDataState {
  dataMode: ControlCenterDataMode;
  isConnected: boolean;
  isBackendAvailable: boolean;
  lastUpdated: string;
  dataSource: "CLOUD_SYNTHETIC_TELEMETRY" | "DEMO_MOCK";
  softwarePipeline: "CONNECTED" | "DISCONNECTED";
  streamCadence: string;
  telemetry: TelemetryRecord;
  telemetryHistory: TelemetryRecord[];
  activeAlerts: AlertRecord[];
  alertHistory: AlertRecord[];
  alertCounts: { active: number; total: number };
  conditionSummary: ConditionSummary | null;
  anomalyAssessment: AnomalyAssessment | null;
  decisionSummary: DecisionSummary | null;
  systemStatus: SystemStatusSummary;
}

const fallbackTelemetry: TelemetryRecord = {
  device_id: "BC-01",
  timestamp: new Date().toISOString(),
  scenario: "NORMAL",
  temperature: 41.0,
  vibration: 0.27,
  current: 4.15,
  speed: 1.8,
  alignment: 0.0,
  load: 60.0,
};

export function useControlCenterData(pollIntervalMs: number = 1000) {
  const historyRef = useRef<TelemetryRecord[]>([]);

  const [data, setData] = useState<ControlCenterDataState>({
    dataMode: "FRONTEND_FALLBACK",
    isConnected: false,
    isBackendAvailable: false,
    lastUpdated: new Date().toLocaleTimeString(),
    dataSource: "DEMO_MOCK",
    softwarePipeline: "DISCONNECTED",
    streamCadence: "1 HZ",
    telemetry: fallbackTelemetry,
    telemetryHistory: [],
    activeAlerts: [],
    alertHistory: [],
    alertCounts: { active: 3, total: 12 },
    conditionSummary: null,
    anomalyAssessment: null,
    decisionSummary: null,
    systemStatus: {
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
    },
  });

  const fetchAllData = useCallback(async () => {
    try {
      const [
        latestTelemetry,
        telemetryHistory,
        activeAlerts,
        alertHistory,
        alertCounts,
        conditionSummary,
        anomalyAssessment,
        decisionSummary,
      ] = await Promise.all([
        api.getLatestTelemetry(),
        api.getTelemetryHistory(20),
        api.getActiveAlerts(),
        api.getAlertHistory(50),
        api.getAlertCount(),
        api.getConditionSummary(),
        api.getAnomalyStatus(),
        api.getDecisionSummary(),
      ]);

      const isBackendLive = latestTelemetry !== null;

      if (isBackendLive && latestTelemetry) {
        // Accumulate rolling client-side history window (up to 60 samples)
        const currentBuf = historyRef.current;
        const lastTimestamp = currentBuf.length > 0 ? currentBuf[currentBuf.length - 1].timestamp : null;

        if (latestTelemetry.timestamp !== lastTimestamp) {
          const updatedBuf = [...currentBuf, latestTelemetry].slice(-60);
          historyRef.current = updatedBuf;
        }

        // Use DB history if available and non-empty, otherwise use rolling buffer
        const effectiveHistory =
          telemetryHistory && telemetryHistory.length > 0
            ? telemetryHistory
            : [...historyRef.current].reverse();

        setData({
          dataMode: "BACKEND_CONNECTED",
          isConnected: true,
          isBackendAvailable: true,
          lastUpdated: new Date().toLocaleTimeString(),
          dataSource: "CLOUD_SYNTHETIC_TELEMETRY",
          softwarePipeline: "CONNECTED",
          streamCadence: "1 HZ",
          telemetry: latestTelemetry,
          telemetryHistory: effectiveHistory,
          activeAlerts: activeAlerts || [],
          alertHistory: alertHistory || [],
          alertCounts: alertCounts || { active: 0, total: 0 },
          conditionSummary,
          anomalyAssessment,
          decisionSummary,
          systemStatus: {
            device_id: latestTelemetry.device_id || "ESP32-01",
            timestamp: latestTelemetry.timestamp,
            mode: "CLOUD SYNTHETIC TELEMETRY",
            cadence: "1 HZ",
            subsystems: [
              { name: "FastAPI Backend", status: "OPERATIONAL", details: "Active at http://127.0.0.1:8000" },
              { name: "PostgreSQL Storage", status: "OPERATIONAL", details: "Connected via psycopg2 pool" },
              { name: "Synthetic Generator", status: "OPERATIONAL", details: "Running 1 Hz telemetry loop" },
              { name: "Condition Engine", status: "OPERATIONAL", details: "Active continuous risk fusion" },
              { name: "Isolation Forest ML", status: "OPERATIONAL", details: "Loaded conveyor_anomaly_model.joblib" },
              { name: "Decision Support Engine", status: "OPERATIONAL", details: "Active diagnostic evidence engine" },
              { name: "Rule Alert Engine", status: "OPERATIONAL", details: "Active stateful hysteresis" },
              { name: "Local LCD Feed", status: "OPERATIONAL", details: "Active 20x4 LCD formatter" },
              { name: "Optical Camera CV", status: "STANDBY", details: "Planned / Not Connected" },
            ],
          },
        });
      } else {
        // Fallback gracefully when backend service is offline
        setData((prev) => ({
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
      setData((prev) => ({
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

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchAllData, pollIntervalMs]);

  return data;
}
