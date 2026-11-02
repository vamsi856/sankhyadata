import { hero } from "@/content";
import { Island } from "@/islands";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="container-page pb-20 pt-12 md:pb-28 md:pt-20">
      <div className="grid items-center gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="max-w-xl">
          <h1
            id="hero-title"
            className="m-0 text-[clamp(2.6rem,6.2vw,4.75rem)]"
          >
            {hero.title}
          </h1>
          <p
            className="mb-0 mt-6 max-w-md text-[1.1875rem] leading-relaxed text-ink-2"
          >
            {hero.sentence}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={hero.primary.href} className="btn btn-primary">
              {hero.primary.label}
            </a>
            <a href={hero.secondary.href} className="btn btn-line">
              {hero.secondary.label}
            </a>
          </div>
        </div>
        {/* Not faded in: the photo paints at once, so it can be the page's largest paint. */}
        <div>
          <Island name="frame" />
        </div>
      </div>
    </section>
  );
}
