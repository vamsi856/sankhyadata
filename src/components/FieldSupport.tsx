import { useEffect, useRef, useState } from "react";
import { fieldCaption, fieldLegend, itTitles } from "@/content";
import { liveGL, prefersStill } from "@/lib/when-near";

/**
 * Schematic field-support network beside the IT section's list (WebGL, lazy). Scrolling
 * through the list (items carry `data-it`) acts out each item in turn, as the rig viewer
 * does for rigs; tapping, clicking or focusing an item shows it at once and holds it while
 * it stays in view.
 */
export function FieldSupport() {
  const canvas = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState(0);
  const cur = useRef(0);
  useEffect(() => {
    const el = canvas.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    const still = prefersStill();
    const cards = [...section.querySelectorAll<HTMLElement>("[data-it]")];
    let live: { poke: () => void; stop: () => void } | null = null;
    const show = (i: number) => {
      if (i === cur.current && cards[0]?.dataset.active) return;
      cur.current = i;
      setMode(i);
      cards.forEach((c, k) => (c.dataset.active = String(k === i)));
      live?.poke();
    };
    // Scrolling drives the scene: the active item is the last to have reached the reading
    // line (mid-screen beside the sticky scene; just under the pinned scene on phones).
    const pin = el.closest(".it-scene") as HTMLElement | null;
    let hold: HTMLElement | null = null;
    const release = () => (hold = null);
    const measure = () => {
      const wide = innerWidth >= 1024;
      const top = wide ? 0 : (pin?.getBoundingClientRect().bottom ?? 0);
      const b = hold?.getBoundingClientRect();
      if (b && b.bottom > top && b.top < innerHeight) return show(Number(hold!.dataset.it));
      const line = wide ? innerHeight * 0.5 : top + 32;
      let k = 0;
      cards.forEach((c, i) => c.getBoundingClientRect().top <= line && (k = i));
      show(k);
    };
    measure();
    addEventListener("scroll", measure, { passive: true });
    addEventListener("resize", measure);
    addEventListener("wheel", release, { passive: true });
    addEventListener("touchstart", release, { passive: true });
    const off: (() => void)[] = [
      () => removeEventListener("scroll", measure),
      () => removeEventListener("resize", measure),
      () => removeEventListener("wheel", release),
      () => removeEventListener("touchstart", release),
    ];
    for (const card of cards) {
      const on = () => show(Number((hold = card).dataset.it));
      for (const t of ["focusin", "click"] as const) {
        card.addEventListener(t, on);
        off.push(() => card.removeEventListener(t, on));
      }
    }
    let px = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") px = (e.clientX / innerWidth) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    live = liveGL(el, () => import("@/lib/field-gl"), ({ start }, c) =>
      start(c, { pointer: () => px, mode: () => cur.current, still }),
    );
    return () => {
      off.forEach((f) => f());
      live?.stop();
      removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <figure className="m-0">
      <div aria-hidden className="field relative">
        <div ref={canvas} className="absolute inset-0" />
        <p className="absolute left-0 top-0 m-0 text-[0.875rem] font-[420] text-ink">{itTitles[mode]}</p>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-muted">
        {fieldLegend.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-2">
            <span aria-hidden className={`h-2 w-2 rounded-full ${i === 2 ? "bg-label" : "bg-ink"}`} />
            {l}
          </span>
        ))}
        <span>{fieldCaption}</span>
      </figcaption>
    </figure>
  );
}
