import { itTeam } from "@/content";

export function ITTeam() {
  return (
    <section id="it" aria-labelledby="it-title" className="bg-paper-2">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 id="it-title" className="m-0 text-[clamp(2rem,4vw,3.25rem)]">
            {itTeam.title}
          </h2>
          <p className="mb-0 mt-5 max-w-lg text-ink-2">{itTeam.sentence}</p>
        </div>
        <dl className="m-0 mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {itTeam.items.map((item) => (
            <div key={item.title} className="bg-paper-2 p-6 sm:p-7">
              <dt className="text-[1.1875rem] font-[420] tracking-[-0.015em] text-ink">{item.title}</dt>
              <dd className="m-0 mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{item.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
