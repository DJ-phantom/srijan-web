import type { Metadata } from "next";
import ControlCenterDataProvider from "@/components/control-center/ControlCenterDataProvider";

export const metadata: Metadata = {
  title: "Digital Twin BC-01 — SRIJAN Live Spatial Condition Model",
  description:
    "Live spatial condition model for Conveyor BC-01 mapping telemetry, condition assessment, Isolation Forest anomaly status, and rule events to physical operating zones.",
};

export default function DigitalTwinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ControlCenterDataProvider>{children}</ControlCenterDataProvider>;
}
