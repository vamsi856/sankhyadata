import { notFound, site } from "@/content";
import { Wordmark } from "@/sections/Header";

/** Static 404 page, prerendered to /404.html with no JavaScript; Caddy serves it for missing paths. */
export function NotFoundPage() {
  return (
    <>
      <header className="border-b border-rule bg-paper">
        <div className="container-page flex h-16 items-center">
          <a href="/" className="rounded-[4px] text-ink no-underline" aria-label={`${site.name}, home`}>
            <Wordmark />
          </a>
        </div>
      </header>
      <main id="main" className="container-page py-24 md:py-36">
        <p className="m-0 text-[0.9375rem] text-muted">Error 404</p>
        <h1 className="m-0 mt-4 max-w-2xl text-[clamp(2.4rem,5vw,4rem)]">{notFound.title}</h1>
        <p className="mb-0 mt-5 max-w-lg text-ink-2">{notFound.sentence}</p>
        <p className="mb-0 mt-10">
          <a className="btn btn-primary" href={notFound.link.href}>
            {notFound.link.label}
          </a>
        </p>
      </main>
    </>
  );
}
