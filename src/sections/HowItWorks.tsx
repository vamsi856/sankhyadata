import { methodology } from "@/content";
import { Island } from "@/islands";

export function HowItWorks() {
  return (
    <section id="methodology" aria-labelledby="how-title" className="border-t border-rule">
      <div className="container-page grid gap-x-12 gap-y-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* On phones this wrapper dissolves (display: contents) so the pipeline can pin
            against the whole section; from lg it is the sticky left column. */}
        <div className="contents lg:sticky lg:top-24 lg:block lg:self-start">
          <h2 id="how-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            {methodology.title}
          </h2>
          <div className="pipeline-pin gl-scene sticky top-16 z-10 bg-paper pb-3 pt-2 lg:static lg:mt-10 lg:bg-transparent lg:p-0">
            <Island name="pipeline" />
          </div>
        </div>
        <ol className="m-0 list-none border-t border-rule p-0">
          {methodology.steps.map((step, i) => (
            <li
              key={step.role}
              className="draw-rule step relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-rule py-7 sm:grid-cols-[3rem_minmax(0,12.5rem)_minmax(0,1fr)] sm:gap-x-6"
            >
              <span className="step-num num pt-1 text-[0.9375rem] text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="m-0 text-[1.5rem] leading-tight">{step.role}</h3>
              <p className="col-start-2 m-0 mt-2 text-ink-2 sm:col-start-3 sm:mt-0.5">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
