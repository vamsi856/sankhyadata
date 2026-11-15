import { rigs } from "@/content";
import { Island } from "@/islands";

/**
 * Rig specifications as one block per rig, beside the 3D viewer. On desktop the section pins
 * while scrolling steps through the rigs in turn; tapping or focusing a rig fits it at once.
 */
export function Rigs() {
  const [cRig, cMount, cVantage, cNotes] = rigs.columns;
  return (
    <section id="rigs" aria-labelledby="rigs-title" className="border-t border-rule">
      {/* Desktop: the section pins (sticky stage inside a taller track) and scrolling steps
          through the rigs one at a time; the active rig shows its details, the others their
          names. Phones keep the scene pinned under the header with the rigs scrolling beneath. */}
      <div className="pin-track">
        <div className="pin-stage">
          <div className="container-page py-20 md:py-28 pin-inner">
            <div className="rig-grid">
              <h2 id="rigs-title" className="rig-head m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
                {rigs.title}
              </h2>
              <div className="rig-scene gl-scene">
                <Island name="rig" />
              </div>
              <div className="rig-list border-t border-rule">
                {rigs.items.map((r, i) => (
                  <dl key={r.name} data-rig={i} data-active={i === 0 ? "true" : "false"} tabIndex={0} className="rig-row m-0 border-b border-rule py-6">
                    <dt className="sr-only">{cRig}</dt>
                    <dd className="m-0 text-[1.25rem] font-[420] tracking-[-0.015em] text-ink">{r.name}</dd>
                    <div className="pin-more mt-3 grid grid-cols-[6rem_minmax(0,1fr)] gap-y-1.5 text-[0.9375rem]">
                      <dt className="text-muted">{cMount}</dt>
                      <dd className="m-0 text-ink-2">{r.mount}</dd>
                      <dt className="text-muted">{cVantage}</dt>
                      <dd className="m-0 text-ink">{r.vantage}</dd>
                      <dt className="text-muted">{cNotes}</dt>
                      <dd className="m-0 text-ink-2">{r.notes}</dd>
                    </div>
                  </dl>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page pb-20 md:pb-28">
        <p className="m-0 max-w-2xl text-[0.9375rem] text-muted">{rigs.shared}</p>

        <p className="mb-0 mt-16 text-[0.875rem] text-muted">{rigs.optionsLabel}</p>
        <ul className="m-0 mt-4 grid list-none gap-4 p-0 md:grid-cols-2">
          {rigs.options.map((o) => (
            <li key={o.title} className="ticks rounded-[var(--radius-card)] p-7 sm:p-9">
              <h3 className="m-0 text-[1.375rem] font-[420] tracking-[-0.015em] text-ink">{o.title}</h3>
              <p className="mb-0 mt-3 max-w-xl text-ink-2">{o.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
