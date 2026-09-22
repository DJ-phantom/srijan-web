"use client";

import BrandLogo from "@/components/ui/BrandLogo";
import MenuTrigger from "@/components/ui/MenuTrigger";

interface HeaderProps {
  className?: string;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
}

const headerLinks = [
  { label: "PLATFORM", href: "#approach" },
  { label: "MONITORING", href: "#monitoring" },
  { label: "INTELLIGENCE", href: "#intelligence" },
  { label: "CONTROL CENTER", href: "/control-center" },
  { label: "ABOUT", href: "#about" },
];

export default function Header({
  className = "",
  isMenuOpen = false,
  onToggleMenu,
}: HeaderProps) {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`w-full py-5 md:py-7 border-b border-[var(--border-light)]/30 transition-colors duration-300 ${className}`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 flex items-center justify-between">
        {/* Brand Lockup using srijan-logo.png Emblem */}
        <BrandLogo />

        {/* Desktop Quick Nav Links + Menu Trigger */}
        <div className="flex items-center gap-6 lg:gap-8">
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-mono text-[13px] tracking-wider text-[var(--text-charcoal)]/80">
            {headerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="relative py-1 transition-colors duration-200 hover:text-[var(--accent-copper)] group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[var(--accent-copper)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Architectural Menu Trigger */}
          {onToggleMenu && (
            <MenuTrigger isOpen={isMenuOpen} onToggle={onToggleMenu} />
          )}
        </div>
      </div>
    </header>
  );
}
