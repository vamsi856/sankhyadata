import type { CSSProperties } from "react";
import { deliverables } from "@/content";

export function Deliverables() {
  return (
    <section id="deliverables" aria-labelledby="deliverables-title" className="bg-paper-2">
      <div className="container-page grid gap-x-12 gap-y-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="deliverables-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            {deliverables.title}
          </h2>
          <p className="mb-0 mt-5 max-w-sm text-ink-2">{deliverables.sentence}</p>
          {/* The batch as a flow, Video through Verification. A light travels down it and
              lights each step in turn; pointing at or tapping a row lights its step. CSS only. */}
          <ol aria-hidden className="flow m-0 mt-10 list-none p-0">
            {deliverables.rows.map((row, i) => (
              <li key={row.term} className="flow-node" style={{ "--i": i } as CSSProperties}>
                <span className="flow-num num">{String(i + 1).padStart(2, "0")}</span>
                {row.term}
              </li>
            ))}
          </ol>
        </div>
        <dl className="m-0 border-t border-rule-2">
          {deliverables.rows.map((row) => (
            <div
              key={row.term}
              className="draw-rule relative grid gap-x-8 gap-y-1 border-b border-rule-2 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
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
