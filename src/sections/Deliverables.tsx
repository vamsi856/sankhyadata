import { deliverables } from "@/content";

export function Deliverables() {
  return (
    <section id="deliverables" aria-labelledby="deliverables-title" className="bg-paper-2">
      <div className="container-page grid gap-x-12 gap-y-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 id="deliverables-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            {deliverables.title}
          </h2>
          <p className="mb-0 mt-5 max-w-sm text-ink-2">{deliverables.sentence}</p>
        </div>
        <dl className="m-0 border-t border-rule-2">
          {deliverables.rows.map((row) => (
            <div
              key={row.term}
              className="grid gap-x-8 gap-y-1 border-b border-rule-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
            >
              <dt className="text-[1.0625rem] font-[420] tracking-[-0.01em] text-ink">{row.term}</dt>
              <dd className="num m-0 font-[340] text-ink-2">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
