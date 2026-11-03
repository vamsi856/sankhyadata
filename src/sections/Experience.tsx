import { experience } from "@/content";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="border-t border-rule">
      <div className="container-page py-20 md:py-28">
        <div className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <h2 id="experience-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            {experience.title}
          </h2>
          <div className="ticks rounded-[var(--radius-card)] p-7 sm:p-10">
            <p className="m-0 flex flex-wrap items-baseline gap-x-3">
              <span className="num text-[clamp(4.25rem,11vw,8.5rem)] font-[200] leading-[0.9] tracking-[-0.045em] text-ink">
                {experience.figure}
              </span>
              <span className="text-[clamp(1.5rem,3vw,2.25rem)] font-[300] tracking-[-0.02em] text-muted">
                {experience.unit}
              </span>
            </p>
            <p className="mb-0 mt-5 max-w-md text-[1.0625rem] text-ink-2">{experience.caption}</p>
          </div>
        </div>

        <dl className="m-0 mt-14 grid gap-y-6 border-t border-rule pt-8 sm:grid-cols-3 sm:gap-x-10">
          {experience.specs.map((spec) => (
            <div key={spec.term}>
              <dt className="text-[0.875rem] text-muted">{spec.term}</dt>
              <dd className="m-0 mt-1.5 text-[1.0625rem] text-ink">{spec.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-rule">
        <ul aria-label={experience.listLabel} className="container-page my-0 flex list-none flex-wrap gap-x-10 gap-y-2 py-8">
          {experience.types.map((type) => (
            <li key={type} className="text-[clamp(1.125rem,1.8vw,1.5rem)] font-[300] tracking-[-0.02em] text-ink-2">
              {type}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
