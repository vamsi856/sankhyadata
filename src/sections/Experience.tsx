import { experience } from "@/content";
import { Island } from "@/islands";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="border-t border-rule">
      <div className="container-page py-20 md:py-28">
        <div className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 id="experience-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
              {experience.title}
            </h2>
            <Island name="hours" />
          </div>
          <div className="ticks rounded-[var(--radius-card)] p-7 sm:p-10">
            <p className="m-0 flex flex-wrap items-baseline gap-x-3">
              <Island name="figure" inline />
              <span className="text-[clamp(1.5rem,3vw,2.25rem)] font-[300] tracking-[-0.02em] text-muted">
                {experience.unit}
              </span>
            </p>
            <p className="mb-0 mt-5 max-w-md text-[1.0625rem] text-ink-2">{experience.caption}</p>
            <div className="mt-8 border-t border-rule pt-6">
              <p className="m-0 flex flex-wrap items-baseline gap-x-2.5">
                <span className="num text-[clamp(1.75rem,3vw,2.5rem)] font-[340] tracking-[-0.03em] text-ink">
                  {experience.capacity.figure}
                </span>
                <span className="text-[1.125rem] font-[300] tracking-[-0.015em] text-muted">{experience.capacity.unit}</span>
              </p>
              <p className="mb-0 mt-2 max-w-md text-[1.0625rem] text-ink-2">{experience.capacity.caption}</p>
            </div>
            <p className="mb-0 mt-6 text-[0.8125rem] text-muted">{experience.source}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="container-page py-10">
          <p id="environments-label" className="m-0 text-[0.875rem] text-muted">
            {experience.listLabel}
          </p>
          <dl aria-labelledby="environments-label" className="m-0 mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {experience.sectors.map((group) => (
              <div key={group.sector}>
                <dt className="text-[0.875rem] font-[420] text-ink">{group.sector}</dt>
                <dd className="m-0 mt-2">
                  <ul className="m-0 list-none p-0">
                    {group.types.map((type) => (
                      <li key={type} className="text-[1.125rem] font-[300] leading-relaxed tracking-[-0.015em] text-ink-2">
                        {type}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
