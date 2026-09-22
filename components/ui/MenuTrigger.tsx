"use client";

interface MenuTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function MenuTrigger({
  isOpen,
  onToggle,
  className = "",
}: MenuTriggerProps) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="fullscreen-navigation"
      aria-label={isOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
      className={`group relative inline-flex items-center gap-3 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-copper)] rounded-[2px] cursor-pointer select-none text-[var(--text-charcoal)] ${className}`}
    >
      <span className="font-mono text-xs font-semibold tracking-widest uppercase transition-all duration-300 group-hover:tracking-[0.22em] text-[var(--text-charcoal)] group-hover:text-[var(--accent-copper)]">
        {isOpen ? "CLOSE" : "MENU"}
      </span>
      <div className="relative w-7 h-5 flex flex-col items-end justify-center gap-[6px]">
        <span
          className={`h-[1.5px] w-7 bg-[var(--text-charcoal)] transition-all duration-300 ease-out origin-center ${
            isOpen
              ? "translate-y-[3.75px] rotate-45"
              : "group-hover:translate-x-1"
          }`}
        />
        <span
          className={`h-[1.5px] w-7 bg-[var(--text-charcoal)] transition-all duration-300 ease-out origin-center ${
            isOpen
              ? "-translate-y-[3.75px] -rotate-45"
              : "group-hover:-translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}
