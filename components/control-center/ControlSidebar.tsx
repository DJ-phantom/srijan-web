"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  ShieldAlert,
  Cpu,
  BarChart3,
  AlertTriangle,
  Tv,
  Camera,
  Server,
} from "lucide-react";

const navModules = [
  { href: "/control-center", label: "OVERVIEW", icon: LayoutDashboard },
  { href: "/control-center/monitoring", label: "LIVE MONITORING", icon: Radio },
  { href: "/control-center/decision-support", label: "DECISION SUPPORT", icon: ShieldAlert },
  { href: "/control-center/intelligence", label: "INTELLIGENCE / AI", icon: Cpu },
  { href: "/control-center/analytics", label: "ANALYTICS", icon: BarChart3 },
  { href: "/control-center/alerts", label: "ALERTS & EVENTS", icon: AlertTriangle },
  { href: "/control-center/local-display", label: "OPERATOR DISPLAY", icon: Tv },
  { href: "/control-center/camera", label: "CAMERA READINESS", icon: Camera },
  { href: "/control-center/system", label: "SYSTEM STATUS", icon: Server },
];

export default function ControlSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 bg-[var(--bg-stone)] border-r border-[var(--border-light)]/40 p-4 flex flex-col justify-between font-mono text-xs select-none shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-5">
        <div className="text-[10px] font-semibold text-[var(--accent-copper)] tracking-widest uppercase px-2 flex items-center justify-between">
          <span>// CONTROL MODULES</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
        </div>

        <nav className="space-y-1">
          {navModules.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/control-center"
                ? pathname === "/control-center"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[2px] text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--text-charcoal)] text-[var(--bg-stone)] shadow-xs"
                    : "text-[var(--text-graphite-muted)] hover:bg-white/60 hover:text-[var(--text-charcoal)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[var(--accent-copper)]" : "opacity-70"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="pt-4 border-t border-[var(--border-light)]/40 text-[10px] text-[var(--text-graphite-muted)] space-y-1">
        <div className="font-semibold text-[var(--text-charcoal)]">SRIJAN CONTROL CENTER</div>
        <div className="opacity-70">SCIENTIFIC PLATFORM v1.0</div>
        <div className="text-[9px] text-[var(--accent-copper)] pt-1">SIH26008 ENGINE CONNECTED</div>
      </div>
    </aside>
  );
}
