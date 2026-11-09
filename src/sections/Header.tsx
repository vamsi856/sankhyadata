import { headerCta, nav, site } from "@/content";

/**
 * The mark: a viewfinder's four corners around one chartreuse point, the colour our
 * annotators use for what they identify. With `animated`, the corners close in like a
 * focus frame locking, then the point lands (CSS only, once, on first paint).
 */
export function Wordmark({ animated = false }: { animated?: boolean }) {
  const a = (name: string) => (animated ? name : undefined);
  return (
    <span className="inline-flex items-center gap-2.5 text-[1.0625rem] font-[460] tracking-[-0.02em] [font-variation-settings:'SHRP'_100]">
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 overflow-visible" fill="none">
        <g stroke="currentColor" strokeWidth="1.6">
          <path className={a("logo-corner lc-1")} d="M3 8V3h5" />
          <path className={a("logo-corner lc-2")} d="M16 3h5v5" />
          <path className={a("logo-corner lc-3")} d="M21 16v5h-5" />
          <path className={a("logo-corner lc-4")} d="M8 21H3v-5" />
        </g>
        <circle className={a("logo-dot")} cx="12" cy="12" r="3.2" fill="var(--label)" stroke="var(--label-ink)" strokeWidth="1" />
      </svg>
      <span className={a("logo-word")}>{site.name}</span>
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      {/* The page as one recording: a line along the header's edge fills as the visitor scrolls. */}
      <span aria-hidden className="rec-line" />
      <div className="container-page flex h-16 items-center justify-between gap-6 max-[359px]:gap-3">
        <a href="#top" className="logo-link rounded-[4px] text-ink no-underline" aria-label={`${site.name}, back to top`}>
          <Wordmark animated />
        </a>
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="m-0 flex list-none gap-1 p-0">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-[0.9375rem] text-ink-2 no-underline transition-colors duration-150 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={headerCta.href} className="btn btn-primary min-h-10 px-4 text-[0.9375rem] max-[359px]:px-3 max-[359px]:text-[0.875rem]">
          {headerCta.label}
        </a>
      </div>
    </header>
  );
}
