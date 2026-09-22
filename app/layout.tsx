import type { Metadata, Viewport } from "next";
import { spaceGrotesk, plusJakartaSans, jetbrainsMono } from "@/lib/fonts";
import SmoothScroll from "@/components/layout/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "SRIJAN — Industrial Conveyor Intelligence Platform",
  description:
    "Next-generation digital belt & predictive intelligence platform for heavy industrial and iron-ore conveyance systems.",
  keywords: [
    "Industrial AI",
    "Conveyor Intelligence",
    "Predictive Maintenance",
    "Digital Belt",
    "Iron Ore Mining",
  ],
};

export const viewport: Viewport = {
  themeColor: "#F4F3EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--bg-stone)] text-[var(--text-charcoal)]"
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
