import Container from "@/components/layout/Container";

export default function HeroSpacer() {
  return (
    <section className="w-full py-32 bg-[var(--bg-stone)] border-t border-[var(--border-light)] text-[var(--text-graphite-muted)] font-mono text-xs">
      <Container className="flex flex-col items-center justify-center text-center gap-4 py-16">
        <div className="h-8 w-[1px] bg-[var(--border-light)] mb-4" />
        <span className="tracking-widest uppercase text-[var(--text-charcoal)] font-semibold">
          SYSTEM PREVIEW // HERO SCROLL TEST AREA
        </span>
        <p className="max-w-md font-sans text-sm text-[var(--text-graphite-muted)] font-light leading-relaxed">
          This minimal section confirms Lenis smooth scroll and GSAP ScrollTrigger parallax integration across viewports.
        </p>
      </Container>
    </section>
  );
}
