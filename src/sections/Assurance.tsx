import { assurance } from "@/content";

export function Assurance() {
  return (
    <section id="assurance" aria-labelledby="assurance-title">
      <div className="container-page grid gap-x-12 gap-y-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <h2 id="assurance-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
          {assurance.title}
        </h2>
        <dl className="m-0 border-t border-rule">
          {assurance.items.map((item) => (
            <div
              key={item.title}
              className="grid gap-x-8 gap-y-2 border-b border-rule py-7 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]"
            >
              <dt className="text-[1.1875rem] font-[420] tracking-[-0.015em] text-ink">{item.title}</dt>
              <dd className="m-0 text-ink-2">{item.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
