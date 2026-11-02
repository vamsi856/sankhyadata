import { rigs } from "@/content";

export function Rigs() {
  return (
    <section id="rigs" aria-labelledby="rigs-title">
      <div className="container-page py-20 md:py-28">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <h2 id="rigs-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            Rigs we have run in the field.
          </h2>
          <p className="m-0 max-w-lg self-end text-ink-2">
            Each rig is fitted and tested for the task before recording starts.
          </p>
        </div>
        <ul className="m-0 mt-14 grid list-none gap-5 p-0 lg:grid-cols-3">
          {rigs.map((rig) => (
            <li key={rig.name} className="ticks rounded-[var(--radius-card)] p-7 sm:p-9">
              <h3 className="m-0 text-[clamp(1.6rem,2.6vw,2.1rem)]">{rig.name}</h3>
              <p className="mb-0 mt-4 max-w-sm text-ink-2">{rig.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
