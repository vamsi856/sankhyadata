import { headerCta, menuLabel, nav, site } from "@/content";
import { markDots } from "@/lib/mark";

/**
 * The mark: dots in columns of 1, 2 and 3 opening from the wearer's eye, a field of view
 * that is also a count. With `animated`, the columns appear one after another, counting out
 * from the eye, then the name follows (CSS only, once, on first paint).
 */
export function Wordmark({ animated = false }: { animated?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[1.0625rem] font-[460] tracking-[-0.02em] [font-variation-settings:'SHRP'_100]">
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 overflow-visible">
        {markDots.map((d) => (
          <circle key={`${d.x},${d.y}`} className={animated ? `logo-dot ld-${d.col}` : undefined} cx={d.x} cy={d.y} r={d.r} fill="currentColor" />
        ))}
      </svg>
      <span className={animated ? "logo-word" : undefined}>{site.name}</span>
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      {/* The page as one recording: a line along the header's edge fills as the visitor scrolls. */}
      <span aria-hidden className="rec-line" />
      <div className="container-page flex h-16 items-center justify-between gap-6 max-[389px]:gap-3">
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
        <div className="flex items-center gap-2">
          {/* Phones and tablets: the section links open from a menu (a native popover, so it
              opens, closes on Escape or an outside tap, and reports its state without script). */}
          <button
            type="button"
            className="menu-btn btn btn-line h-10 min-h-10 w-10 px-0 lg:hidden"
            aria-label={menuLabel}
            {...{ popovertarget: "site-menu" }}
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 6h14M3 10h14M3 14h14" />
            </svg>
          </button>
          <a href={headerCta.href} className="btn btn-primary min-h-10 px-4 text-[0.9375rem] max-[389px]:px-3 max-[389px]:text-[0.875rem]">
            {headerCta.label}
          </a>
        </div>
      </div>
      <nav id="site-menu" aria-label="Sections" className="site-menu" {...{ popover: "" }}>
        <ul className="m-0 list-none p-0">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
