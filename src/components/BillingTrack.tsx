import { billing } from "@/content";
import { m, EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const APPROVED = 2;
const SEG = 0.45; // seconds per segment

/**
 * Recorded → Reviewed → Approved → Delivered. Horizontal from `sm` up, a vertical timeline
 * on phones. Each segment fills in turn once the track scrolls into view; Motion animates
 * one CSS variable (--p) so the same animation drives scaleX or scaleY per breakpoint.
 */
export function BillingTrack() {
  const n = billing.states.length;
  return (
    <m.ol
      className="relative m-0 grid list-none p-0 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
      style={{ ["--n" as string]: n }}
      initial="idle"
      whileInView="run"
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
    >
      {billing.states.map((state, i) => {
        const approved = i === APPROVED;
        const note = billing.notes[state];
        const segment =
          "absolute left-[6px] top-[13px] bottom-0 w-px sm:left-[13px] sm:top-[6px] sm:bottom-auto sm:h-px sm:w-[calc(100%-13px)]";
        return (
          <li key={state} className="relative pb-9 pl-9 last:pb-0 sm:pb-0 sm:pl-0 sm:pr-3 sm:pt-9">
            {i < n - 1 && (
              <>
                <span aria-hidden className={cn(segment, "bg-line")} />
                <m.span
                  aria-hidden
                  className={cn(
                    segment,
                    "origin-top bg-ink [transform:scaleY(var(--p))] sm:origin-left sm:[transform:scaleX(var(--p))]",
                  )}
                  variants={{
                    idle: { "--p": 0 },
                    run: { "--p": 1, transition: { delay: i * SEG, duration: SEG, ease: "linear" } },
                  }}
                />
              </>
            )}
            <m.span
              aria-hidden
              className={cn(
                "absolute left-0 top-[0.3rem] h-[13px] w-[13px] rounded-full border sm:top-0",
                approved ? "border-label" : "border-ink",
              )}
              variants={{
                idle: { backgroundColor: "var(--paper)", scale: 1 },
                run: {
                  backgroundColor: approved ? "var(--label)" : "var(--ink)",
                  scale: approved ? [1, 1.35, 1] : 1,
                  transition: { delay: i * SEG, duration: approved ? 0.5 : 0.2, ease: EASE_OUT },
                },
              }}
            />
            <span className={cn("block text-[1.125rem] text-ink sm:text-[1.25rem]", approved && "font-[440]")}>
              {state}
            </span>
            {note && <span className="mt-1 block max-w-[15rem] text-[0.875rem] leading-snug text-muted">{note}</span>}
          </li>
        );
      })}
    </m.ol>
  );
}
