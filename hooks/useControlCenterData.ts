"use client";

import { useControlCenterContext, ControlCenterDataState } from "@/components/control-center/ControlCenterDataProvider";

export type { ControlCenterDataMode, ControlCenterDataState, RiskHistoryPoint, AnomalyHistoryPoint, HealthInfo } from "@/components/control-center/ControlCenterDataProvider";

export function useControlCenterData(_pollIntervalMs?: number): ControlCenterDataState {
  return useControlCenterContext();
}
