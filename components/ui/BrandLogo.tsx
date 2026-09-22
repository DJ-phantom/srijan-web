"use client";

import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  showDescriptor?: boolean;
}

export default function BrandLogo({
  className = "",
  showDescriptor = true,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none ${className}`}
    >
      <span className="font-heading text-xl sm:text-2xl md:text-[1.65rem] font-bold tracking-tight text-[var(--text-charcoal)] leading-none transition-colors duration-200 group-hover:text-[var(--text-charcoal)]/90">
        SRIJAN<span className="text-[var(--accent-copper)]">.</span>
      </span>

      {showDescriptor && (
        <>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--accent-copper)] opacity-70" />
          <span className="hidden sm:inline-block font-mono text-[10px] sm:text-xs tracking-widest uppercase text-[var(--text-graphite-muted)] font-medium">
            INDUSTRIAL CONVEYOR INTELLIGENCE
          </span>
        </>
      )}
    </Link>
  );
}

