"use client";

export interface SensorData {
  code: string;
  name: string;
  zone: string;
  location: string;
  description: string;
  isPlanned?: boolean;
}

interface SensorDetailCardProps {
  sensor: SensorData;
}

export default function SensorDetailCard({ sensor }: SensorDetailCardProps) {
  return (
    <div className="w-full p-4 md:p-5 rounded-[2px] bg-white/70 border border-[var(--border-light)]/70 shadow-xs flex flex-col space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-[var(--border-light)]/40 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-[1px] bg-[var(--accent-copper)] text-white text-xs font-bold tracking-wider">
            {sensor.code}
          </span>
          <div>
            <h4 className="font-heading text-sm sm:text-base font-bold text-[var(--text-charcoal)]">
              {sensor.name}
            </h4>
            <div className="text-[10px] text-[var(--text-graphite-muted)] tracking-wider uppercase">
              {sensor.zone} &nbsp;//&nbsp; {sensor.location}
            </div>
          </div>
        </div>

        {sensor.isPlanned ? (
          <span className="px-2 py-0.5 rounded-[1px] bg-[var(--text-graphite-muted)]/15 text-[var(--text-graphite-muted)] text-[10px] font-semibold tracking-wider uppercase">
            PLANNED
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ACTIVE CHANNEL</span>
          </div>
        )}
      </div>

      <p className="font-sans text-xs sm:text-sm font-light text-[var(--text-graphite-muted)] leading-relaxed">
        {sensor.description}
      </p>

      {/* Sensor Metadata Bar */}
      <div className="pt-2 flex flex-wrap items-center gap-4 text-[10px] text-[var(--text-graphite-muted)] border-t border-[var(--border-light)]/30">
        <div><span className="opacity-60">ASSOCIATED COMPONENT:</span> <span className="text-[var(--text-charcoal)] font-semibold">{sensor.location}</span></div>
        <div><span className="opacity-60">CONTEXT LOGIC:</span> <span className="text-[var(--text-charcoal)] font-semibold">CONDITION RULES</span></div>
      </div>
    </div>
  );
}
