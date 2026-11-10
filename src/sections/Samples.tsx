import { ArrowUpRight } from "lucide-react";
import { samples, samplesSection, site } from "@/content";
import { Island } from "@/islands";

export function Samples() {
  return (
    <section id="samples" aria-labelledby="samples-title" className="bg-paper-2">
      <div className="container-page py-20 md:py-28">
        {/* Heading and description beside the wall, so the wall is seen whole with its
            context on a laptop screen; the folder link follows directly below. */}
        <div className="grid items-center gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 id="samples-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
              {samplesSection.title}
            </h2>
            <p className="mb-0 mt-5 max-w-lg text-ink-2">{samplesSection.sentence}</p>
          </div>
          <Island name="wall" className="gl-scene" />
        </div>

        {samples.length > 0 ? (
          <ul className="m-0 mt-12 list-none border-t border-rule-2 p-0">
            {samples.map((s) => (
              <li key={s.href} className="border-b border-rule-2">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-6 text-ink no-underline sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto]"
                >
                  <span className="text-[1.25rem] font-[400] tracking-[-0.015em]">{s.title}</span>
                  <span className="col-start-1 row-start-2 text-[0.9375rem] text-ink-2 sm:col-start-2 sm:row-start-1">
                    {s.text}
                  </span>
                  <span className="btn btn-primary col-start-1 row-start-3 mt-3 justify-self-start group-hover:bg-ink-2 sm:col-start-3 sm:row-start-1 sm:mt-0">
                    <span>{samplesSection.open}</span>
                    <ArrowUpRight aria-hidden className="h-5 w-5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </span>
                  <span className="sr-only">(opens the samples viewer in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-0 mt-14 text-ink-2">
            Sample folders are shared on request.{" "}
            <a className="link" href={`mailto:${site.email}?subject=Sample%20data`}>
              Ask for access
            </a>
            .
          </p>
        )}
        <p className="mb-0 mt-8">
          <a className="btn btn-line" href={samplesSection.next.href}>
            {samplesSection.next.label}
          </a>
        </p>
      </div>
    </section>
  );
}
