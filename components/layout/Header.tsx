"use client";

import BrandLogo from "@/components/ui/BrandLogo";
import MenuTrigger from "@/components/ui/MenuTrigger";

interface HeaderProps {
  className?: string;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  onNavigateSlide?: (slideIndex: number) => void;
}

const headerLinks = [
  { label: "PLATFORM", href: "#main-hero-carousel", slideIndex: 1 },
  { label: "MONITORING", href: "#main-hero-carousel", slideIndex: 2 },
  { label: "INTELLIGENCE", href: "#main-hero-carousel", slideIndex: 3 },
  { label: "DIGITAL TWIN", href: "#digital-twin-preview", slideIndex: null },
  { label: "OPERATOR DISPLAY", href: "#main-hero-carousel", slideIndex: 5 },
  { label: "CONTROL CENTER", href: "#control-center-preview", slideIndex: null },
  { label: "ABOUT", href: "#about", slideIndex: null },
];

export default function Header({
  className = "",
  isMenuOpen = false,
  onToggleMenu,
  onNavigateSlide,
}: HeaderProps) {
  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    slideIndex: number | null
  ) => {
    if (slideIndex !== null && onNavigateSlide) {
      e.preventDefault();
      onNavigateSlide(slideIndex);
      return;
    }
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
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 font-mono text-[12px] xl:text-[13px] tracking-wider text-[var(--text-charcoal)]/80 whitespace-nowrap">
            {headerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href, link.slideIndex)}
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
