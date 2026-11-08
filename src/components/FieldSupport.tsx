import { useEffect, useRef, useState } from "react";
import { fieldCaption, fieldLegend, itTitles } from "@/content";
import { liveGL, prefersStill } from "@/lib/when-near";

/**
 * Schematic field-support network beside the IT section's heading (WebGL, lazy). The scene
 * acts out each IT card in turn; pointing at a card (`[data-it]`) shows that one.
 */
export function FieldSupport() {
  const canvas = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState(3);
  const cur = useRef(3);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const still = prefersStill();
    const cards = [...(el.closest("section")?.querySelectorAll<HTMLElement>("[data-it]") ?? [])];
    let live: { poke: () => void; stop: () => void } | null = null;
    let held = false;
    const show = (i: number) => {
      cur.current = i;
      setMode(i);
      cards.forEach((c, k) => (c.dataset.active = String(k === i)));
      live?.poke();
    };
    show(3);
    const off: (() => void)[] = [];
    cards.forEach((card, i) => {
      const on = () => ((held = true), show(i));
      const out = () => (held = false);
      card.addEventListener("pointerenter", on);
      card.addEventListener("pointerleave", out);
      off.push(() => (card.removeEventListener("pointerenter", on), card.removeEventListener("pointerleave", out)));
    });
    const tick = still ? 0 : window.setInterval(() => !held && show((cur.current + 1) % itTitles.length), 4500);
    let px = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") px = (e.clientX / innerWidth) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    live = liveGL(el, () => import("@/lib/field-gl"), ({ start }, c) =>
      start(c, { pointer: () => px, mode: () => cur.current, still }),
    );
    return () => {
      clearInterval(tick);
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
