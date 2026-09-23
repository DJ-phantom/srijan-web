import type { Metadata } from "next";
import ControlHeader from "@/components/control-center/ControlHeader";
import ControlSidebar from "@/components/control-center/ControlSidebar";
import ControlCenterDataProvider from "@/components/control-center/ControlCenterDataProvider";

export const metadata: Metadata = {
  title: "SRIJAN Control Center — Scientific Operational Interface",
  description:
    "Unified industrial conveyor control center powered by SIH26008 scientific telemetry, Isolation Forest anomaly engine, condition fusion, and decision support.",
};

export default function ControlCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ControlCenterDataProvider>
      <div className="min-h-screen bg-[var(--bg-stone)] text-[var(--text-charcoal)] flex flex-col selection:bg-[var(--accent-copper)] selection:text-white font-sans">
        {/* Top Header Navigation */}
        <ControlHeader />

        {/* Main Workspace Frame */}
        <div className="flex-1 flex flex-col lg:flex-row w-full">
          {/* Left Operational Sidebar */}
          <ControlSidebar />

          {/* Primary Page Workspace */}
          <main className="flex-1 p-4 md:p-5 overflow-y-auto max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ControlCenterDataProvider>
  );
}
