import { notFound, site } from "@/content";
import { Wordmark } from "@/sections/Header";

/** Static 404 page, prerendered to /404.html with no JavaScript; Caddy serves it for missing paths. */
export function NotFoundPage() {
  return (
    <>
      <header className="relative border-b border-rule bg-paper">
        <div className="container-page flex h-16 items-center">
          <a href="/" className="rounded-[4px] text-ink no-underline" aria-label={`${site.name}, home`}>
            <Wordmark />
          </a>
        </div>
      </header>
      <main id="main" className="container-page grid items-center gap-x-12 gap-y-14 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className="m-0 text-[0.9375rem] text-muted">Error 404</p>
          <h1 className="m-0 mt-4 max-w-2xl text-[clamp(2.4rem,5vw,4rem)]">{notFound.title}</h1>
          <p className="mb-0 mt-5 max-w-lg text-ink-2">{notFound.sentence}</p>
          <p className="mb-0 mt-10">
            <a className="btn btn-primary" href={notFound.link.href}>
              {notFound.link.label}
            </a>
          </p>
        </div>
        {/* An empty viewfinder: nothing is in frame at this address. CSS only, no script. */}
        <div aria-hidden className="nf-frame ticks relative aspect-[3/2] overflow-hidden rounded-[var(--radius-card)]">
          <span className="nf-noise absolute inset-0" />
          <span className="nf-scan absolute inset-x-0 top-0" />
          <span className="nf-brackets absolute" />
          <span className="hud absolute left-3 top-3">
            <span className="nf-dot" />
            {notFound.frame.status}
          </span>
          <span className="hud num absolute right-3 top-3">{notFound.frame.timecode}</span>
        </div>
      </main>
    </>
  );
}
