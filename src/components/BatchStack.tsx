import { useEffect, useRef, useState } from "react";
import { batchCaption, deliverableTerms } from "@/content";
import { prefersStill, whenNear } from "@/lib/when-near";

/** The delivery batch in 3D; hovering a deliverable row lifts its layer (WebGL, lazy chunk). */
export function BatchStack() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cur, setCur] = useState(-1);
  const curRef = useRef(-1);
  useEffect(() => {
    const el = canvas.current;
    const rows = [...(el?.closest("section")?.querySelectorAll<HTMLElement>("dl > div") ?? [])];
    if (!el) return;
    let engine: { poke: () => void; stop: () => void } | null = null;
    let px = 0;
    const set = (i: number) => {
      curRef.current = i;
      setCur(i);
      engine?.poke();
    };
    const off: (() => void)[] = [];
    rows.forEach((row, i) => {
      const on = () => set(i);
      const out = () => set(-1);
      row.addEventListener("pointerenter", on);
      row.addEventListener("pointerleave", out);
      off.push(() => (row.removeEventListener("pointerenter", on), row.removeEventListener("pointerleave", out)));
    });
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") px = (e.clientX / innerWidth) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    const offNear = whenNear(el, () => import("@/lib/batch-gl"), ({ start }) => {
      engine = start(el, { current: () => curRef.current, pointer: () => px, still: prefersStill() });
    });
    return () => {
      offNear();
      off.forEach((f) => f());
      engine?.stop();
      removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <figure className="m-0 mt-10">
      <div aria-hidden className="batch relative">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        {cur >= 0 && (
          <p className="absolute left-0 top-0 m-0 text-[0.875rem] font-[420] text-ink">{deliverableTerms[cur]}</p>
        )}
      </div>
      <figcaption className="mt-3 max-w-sm text-[0.8125rem] text-muted">{batchCaption}</figcaption>
    </figure>
  );
}
