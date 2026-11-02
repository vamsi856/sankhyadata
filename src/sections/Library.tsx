import { library } from "@/content";
import { Marquee } from "@/components/ui/marquee";

export function Library() {
  return (
    <section id="library" aria-labelledby="library-title" className="border-t border-rule">
      <div className="container-page py-20 md:py-28">
        <div className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <h2 id="library-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            {library.title}
          </h2>
          <div className="ticks rounded-[var(--radius-card)] p-7 sm:p-10">
            <p className="m-0 flex flex-wrap items-baseline gap-x-3">
              <span className="num text-[clamp(4.25rem,11vw,8.5rem)] font-[200] leading-[0.9] tracking-[-0.045em] text-ink">
                {library.figure}
              </span>
              <span className="text-[clamp(1.5rem,3vw,2.25rem)] font-[300] tracking-[-0.02em] text-muted">
                {library.unit}
              </span>
            </p>
            <p className="mb-0 mt-5 max-w-md text-[1.0625rem] text-ink-2">{library.caption}</p>
          </div>
        </div>

        <dl className="m-0 mt-14 grid gap-y-6 border-t border-rule pt-8 sm:grid-cols-3 sm:gap-x-10">
          {library.specs.map((spec) => (
            <div key={spec.term}>
              <dt className="text-[0.875rem] text-muted">{spec.term}</dt>
              <dd className="m-0 mt-1.5 text-[1.0625rem] text-ink">{spec.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        className="border-t border-rule py-7 [mask-image:linear-gradient(90deg,transparent,var(--ink)_8%,var(--ink)_92%,transparent)]"
        aria-label="Examples of business types in the library"
        role="region"
      >
        <Marquee speed="slow" pauseOnHover repeat={2} style={{ ["--gap" as string]: "3.5rem" }}>
          {library.types.map((type) => (
            <span key={type} className="whitespace-nowrap text-[clamp(1.25rem,2.2vw,1.75rem)] font-[300] tracking-[-0.02em] text-ink-2">
              {type}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
