import { ArrowUpRight } from "lucide-react";
import { samples, site } from "@/content";

export function Samples() {
  return (
    <section id="samples" aria-labelledby="samples-title" className="bg-paper-2">
      <div className="container-page py-20 md:py-28">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <h2 id="samples-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            Watch an hour of every business type.
          </h2>
          <p className="m-0 max-w-lg self-end text-ink-2">
            Raw first-person video from our library. The folder opens in Google Drive.
          </p>
        </div>

        {samples.length > 0 ? (
          <ul className="m-0 mt-14 list-none border-t border-rule-2 p-0">
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
                  <span className="col-start-2 row-span-2 row-start-1 inline-flex items-center gap-2 text-[0.9375rem] text-ink-2 transition-colors duration-150 group-hover:text-ink sm:col-start-3 sm:row-span-1">
                    <span className="hidden sm:inline">Open in Drive</span>
                    <ArrowUpRight aria-hidden className="h-5 w-5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                    <span className="sr-only">(opens Google Drive in a new tab)</span>
                  </span>
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
      </div>
    </section>
  );
}
