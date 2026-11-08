import type { CSSProperties } from "react";
import { deliverables } from "@/content";

/**
 * What a batch contains, as one flowchart: each component a node on a central spine,
 * Video through Verification, ending at release through the client portal. A light runs
 * down the spine and lights each node as it passes (CSS only; still for reduced motion).
 */
export function Deliverables() {
  return (
    <section id="deliverables" aria-labelledby="deliverables-title" className="bg-paper-2">
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="deliverables-title" className="m-0 text-[clamp(2rem,4vw,3.25rem)]">
            {deliverables.title}
          </h2>
          <p className="mx-auto mb-0 mt-5 max-w-md text-ink-2">{deliverables.sentence}</p>
        </div>
        <ol className="flowx m-0 mt-16 list-none p-0">
          {deliverables.rows.map((row, i) => (
            <li key={row.term} className="flowx-node" style={{ "--i": i } as CSSProperties}>
              <span aria-hidden className="flowx-dot num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flowx-card">
                <h3 className="m-0 text-[1.375rem] font-[420] leading-tight tracking-[-0.015em] text-ink">{row.term}</h3>
                <p className="num mb-0 mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{row.detail}</p>
              </div>
            </li>
          ))}
          <li className="flowx-end">
            <span className="flowx-end-pill">{deliverables.end}</span>
          </li>
        </ol>
      </div>
    </section>
  );
}
