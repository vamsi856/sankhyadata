import { billing } from "@/content";
import { m, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const APPROVED = 2;
const RUN = 1.6; // seconds for the track to fill

export function Billing() {
  const n = billing.states.length;
  return (
    <section id="billing" aria-labelledby="billing-title" className="border-t border-rule">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-3xl">
          <h2 id="billing-title" className="m-0 text-[clamp(2.2rem,5vw,4rem)]">
            {billing.title}
          </h2>
          <p className="mb-0 mt-6 max-w-xl text-[1.125rem] text-ink-2">{billing.sentence}</p>
        </div>

        <m.div
          className="mt-16 max-w-4xl"
          initial="idle"
          whileInView="run"
          viewport={{ once: true, margin: "0px 0px -25% 0px" }}
        >
          <ol className="relative m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {/* track */}
            <span aria-hidden className="absolute left-[6px] top-[6px] h-px bg-rule-2" style={{ width: `${((n - 1) / n) * 100}%` }} />
            <m.span
              aria-hidden
              className="absolute left-[6px] top-[6px] h-px origin-left bg-ink"
              style={{ width: `${((n - 1) / n) * 100}%` }}
              variants={{ idle: { scaleX: 0 }, run: { scaleX: 1, transition: { duration: RUN, ease: EASE_OUT } } }}
            />
            {billing.states.map((state, i) => {
              const approved = i === APPROVED;
              const at = (i / (n - 1)) * RUN * 0.82;
              return (
                <li key={state} className="relative pr-2 pt-8">
                  <m.span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-0 h-[13px] w-[13px] rounded-full border",
                      approved ? "border-label-ink" : "border-ink",
                    )}
                    variants={{
                      idle: { backgroundColor: "var(--paper)", scale: 1 },
                      run: {
                        backgroundColor: approved ? "var(--label)" : "var(--ink)",
                        scale: approved ? [1, 1.35, 1] : 1,
                        transition: { delay: at, duration: approved ? 0.5 : 0.2, ease: EASE_OUT },
                      },
                    }}
                  />
                  <span className={cn("block text-[1.0625rem] text-ink sm:text-[1.25rem]", approved && "font-[440]")}>
                    {state}
                  </span>
                  {approved && <span className="mt-1 block text-[0.875rem] text-muted">What you are billed for</span>}
                </li>
              );
            })}
          </ol>
        </m.div>
      </div>
    </section>
  );
}
