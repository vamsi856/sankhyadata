import { nav, site } from "@/content";

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5 text-[1.0625rem] font-[460] tracking-[-0.02em] [font-variation-settings:'SHRP'_100]">
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.2" fill="var(--label)" stroke="var(--label-ink)" strokeWidth="1" />
      </svg>
      {site.name}
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/85 backdrop-blur-md [backdrop-filter:saturate(140%)_blur(12px)]">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <a href="#top" className="rounded-[4px] text-ink no-underline" aria-label={`${site.name}, back to top`}>
          <Wordmark />
        </a>
        <nav aria-label="Sections" className="hidden md:block">
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
        <a href="#contact" className="btn btn-primary min-h-10 px-4 text-[0.9375rem]">
          Talk to us
        </a>
      </div>
    </header>
  );
}
