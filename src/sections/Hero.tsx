import { Fragment } from "react";
import { hero } from "@/content";
import { Island } from "@/islands";

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="container-page pb-20 pt-12 md:pb-28 md:pt-20">
      {/* Phones: title, then the frame, then the copy, so the first screen has the picture.
          From lg: title and copy on the left, the frame on the right (as before). */}
      <div className="hero-grid">
        <div className="hero-title max-w-2xl">
          <h1
            id="hero-title"
            className="m-0 text-[clamp(2.5rem,5.2vw,4.25rem)]"
          >
            {hero.title.split(" ").map((word, i) => (
              <Fragment key={i}>
                <span className="word">
                  <span className="word-in" style={{ ["--i" as string]: i }}>
                    {word}
                  </span>
                </span>{" "}
              </Fragment>
            ))}
          </h1>
        </div>
        <div className="hero-body max-w-2xl">
          <p
            className="mb-0 mt-6 max-w-md text-[1.1875rem] leading-relaxed text-ink-2"
          >
            {hero.sentence}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={hero.primary.href} className="btn btn-primary" data-magnet>
              {hero.primary.label}
            </a>
            <a href={hero.secondary.href} className="btn btn-line" data-magnet>
              {hero.secondary.label}
            </a>
          </div>
        </div>
        {/* Not faded in: the photo paints at once, so it can be the page's largest paint. */}
        <div className="hero-frame">
          <Island name="frame" />
        </div>
      </div>
    </section>
  );
}
