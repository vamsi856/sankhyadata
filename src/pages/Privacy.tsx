import { footer, privacy, site } from "@/content";
import { Wordmark } from "@/sections/Header";

/** Static privacy notice, prerendered to /privacy/ with no JavaScript. */
export function PrivacyPage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rule bg-paper">
        <span aria-hidden className="rec-line" />
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <a href="/" className="rounded-[4px] text-ink no-underline" aria-label={`${site.name}, home`}>
            <Wordmark />
          </a>
          <a href="/" className="btn btn-line min-h-10 px-4 text-[0.9375rem]">
            Back to the site
          </a>
        </div>
      </header>
      <main id="main" className="container-page py-20 md:py-28">
        <h1 className="m-0 text-[clamp(2.4rem,5vw,4rem)]">{privacy.title}</h1>
        <p className="mb-0 mt-5 text-[0.9375rem] text-muted">Last updated {privacy.updated}</p>
        <div className="pv-sections mt-14 max-w-2xl border-t border-rule">
          {privacy.sections.map((s) => (
            <section key={s.heading} className="border-b border-rule py-8">
              <h2 className="m-0 text-[1.5rem] leading-tight">{s.heading}</h2>
              <p className="mb-0 mt-3 text-ink-2">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <footer className="border-t border-rule bg-paper-2">
        <div className="container-page py-10 text-[0.8125rem] text-muted">
          © 2026 {site.name}.{" "}
          <a className="link text-muted" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          {" · "}
          <a className="link text-muted" href={footer.security.href}>
            {footer.security.label}
          </a>
        </div>
      </footer>
    </>
  );
}
