import { itTeam } from "@/content";
import { Island } from "@/islands";

/**
 * Heading, then the four IT functions as a list beside the field scene. On desktop the
 * section pins while scrolling acts out each function in turn; phones keep the scene pinned.
 */
export function ITTeam() {
  return (
    <section id="it" aria-labelledby="it-title" className="bg-paper-2">
      {/* Desktop: the section pins and scrolling steps through the four functions one at a
          time (as the Rigs section does); phones keep the scene pinned under the header. */}
      <div className="pin-track">
        <div className="pin-stage">
          <div className="it-grid container-page py-20 md:py-28 pin-inner">
            <div className="it-head">
              <h2 id="it-title" className="m-0 text-[clamp(2rem,4vw,3.25rem)]">
                {itTeam.title}
              </h2>
              <p className="mb-0 mt-5 max-w-lg text-ink-2">{itTeam.sentence}</p>
            </div>
            <div className="it-scene gl-scene">
              <Island name="field" />
            </div>
            <dl className="it-list m-0 border-t border-rule">
              {itTeam.items.map((item, i) => (
                <div key={item.title} data-it={i} data-active={i === 0 ? "true" : "false"} tabIndex={0} className="it-item border-b border-rule py-5 pl-5 pr-2">
                  <dt className="text-[1.1875rem] font-[420] tracking-[-0.015em] text-ink">{item.title}</dt>
                  <dd className="pin-more m-0 mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{item.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
