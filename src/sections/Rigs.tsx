import { rigs } from "@/content";

export function Rigs() {
  return (
    <section id="rigs" aria-labelledby="rigs-title" className="border-t border-rule">
      <div className="container-page py-20 md:py-28">
        <h2 id="rigs-title" className="m-0 max-w-xl text-[clamp(2rem,4vw,3.25rem)]">
          {rigs.title}
        </h2>
        <ul className="m-0 mt-14 grid list-none gap-5 p-0 sm:grid-cols-2">
          {rigs.items.map((rig) => (
            <li key={rig.name} className="ticks flex flex-col rounded-[var(--radius-card)] p-7 sm:p-9">
              <p className="m-0 text-[0.875rem] text-muted">
                Vantage <span className="ml-2 text-ink">{rig.vantage}</span>
              </p>
              <h3 className="m-0 mt-6 text-[clamp(1.6rem,2.6vw,2.1rem)]">{rig.name}</h3>
              <p className="mb-0 mt-4 max-w-md text-ink-2">{rig.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
