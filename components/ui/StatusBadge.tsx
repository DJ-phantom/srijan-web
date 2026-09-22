interface StatusBadgeProps {
  label: string;
  sublabel?: string;
  status?: "online" | "building" | "maintenance";
}

export default function StatusBadge({
  label,
  sublabel,
  status = "building",
}: StatusBadgeProps) {
  const statusColors = {
    online: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    building: "bg-[var(--color-copper,#C85A32)] shadow-[0_0_8px_rgba(200,90,50,0.5)]",
    maintenance: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  };

  return (
    <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-[4px] border border-[var(--color-border-light)] bg-white/50 dark:bg-black/20 backdrop-blur-xs text-xs font-mono tracking-wide">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColors[status]}`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${statusColors[status]}`}
        />
      </span>
      <span className="text-[var(--color-charcoal-main)] dark:text-[var(--color-stone-bg)] font-medium">
        {label}
      </span>
      {sublabel && (
        <>
          <span className="text-[var(--color-graphite-muted)] opacity-40">|</span>
          <span className="text-[var(--color-graphite-muted)] font-normal">
            {sublabel}
          </span>
        </>
      )}
    </div>
  );
}
