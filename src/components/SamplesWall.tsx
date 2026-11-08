import { useEffect, useRef, useState } from "react";
import { experience, samplesWallCaption } from "@/content";
import { liveGL, prefersStill } from "@/lib/when-near";

/** Tiles (of 69, row-major over three rows of 23) that carry the named examples. */
const NAMED = [2, 30, 58, 17, 44, 49, 9, 37, 65];
const names = experience.sectors.flatMap((g) => g.types);

/**
 * The representative set as a turning 3D wall, one tile per operational environment.
 * Every few seconds it turns to the next named example. WebGL is its own chunk; the
 * prerender shows the first example's name.
 */
export function SamplesWall() {
  const canvas = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  const cur = useRef(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const still = prefersStill();
    let live: { poke: () => void; stop: () => void } | null = null;
    let px = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") px = (e.clientX / innerWidth) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    // Dragging spins the wall (horizontal only; vertical swipes still scroll the page).
    const drag = { x: 0, down: false, t: 0 };
    let from = 0;
    const press = (e: PointerEvent) => {
      drag.down = true;
      from = e.clientX - drag.x;
      drag.t = performance.now();
      el.setPointerCapture(e.pointerId);
      live?.poke();
    };
    const pull = (e: PointerEvent) => {
      if (!drag.down) return;
      drag.x = e.clientX - from;
      drag.t = performance.now();
    };
    const release = () => {
      drag.down = false;
      drag.t = performance.now();
    };
    el.addEventListener("pointerdown", press);
    el.addEventListener("pointermove", pull);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    const tick = still
      ? 0
      : window.setInterval(() => {
          if (performance.now() - drag.t < 6000) return;
          cur.current = (cur.current + 1) % Math.min(NAMED.length, names.length);
          setK(cur.current);
          live?.poke();
        }, 3600);
    live = liveGL(el, () => import("@/lib/wall-gl"), ({ start }, c) =>
      start(c, { hot: () => NAMED[cur.current], pointer: () => px, drag, still }),
    );
    return () => {
      clearInterval(tick);
      live?.stop();
      removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <figure className="m-0">
      <div aria-hidden className="samples-wall relative">
        <div ref={canvas} className="wall-grab absolute inset-0" />
        <p className="absolute left-0 top-0 m-0 text-[0.875rem]">
          <span className="text-muted">Example · </span>
          <span className="font-[420] text-ink">{names[k]}</span>
        </p>
      </div>
      <figcaption className="mt-3 text-[0.8125rem] text-muted">{samplesWallCaption}</figcaption>
    </figure>
  );
}
