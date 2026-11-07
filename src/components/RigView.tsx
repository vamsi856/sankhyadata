import { useEffect, useRef, useState } from "react";
import { rigBrief, rigViewerCaption } from "@/content";
import { liveGL, prefersStill } from "@/lib/when-near";

/**
 * 3D rig viewer. Hovering, focusing or tapping a rig in the table (rows carry `data-rig`)
 * fits that rig to the point-cloud recorder; left alone, it cycles through the rigs.
 * WebGL lives in its own chunk, fetched when the viewer nears the viewport. The prerender
 * shows the first rig's name, so the frame is never empty of meaning.
 */
export function RigView() {
  const canvas = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const el = canvas.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    const still = prefersStill();
    const rows = [...section.querySelectorAll<HTMLElement>("[data-rig]")];
    let live: { poke: () => void; stop: () => void } | null = null;
    let touched = 0;
    const select = (i: number, byPerson: boolean) => {
      if (byPerson) touched = performance.now();
      current.current = i;
      setActive(i);
      rows.forEach((r) => (r.dataset.active = String(Number(r.dataset.rig) === i)));
      live?.poke();
    };
    select(0, false);
    const off: (() => void)[] = [];
    for (const row of rows) {
      const i = Number(row.dataset.rig);
      const on = () => select(i, true);
      for (const type of ["pointerenter", "focusin", "click"] as const) {
        row.addEventListener(type, on);
        off.push(() => row.removeEventListener(type, on));
      }
    }
    const cycle = still
      ? 0
      : window.setInterval(() => {
          if (performance.now() - touched > 9000) select((current.current + 1) % rigBrief.length, false);
        }, 3800);
    const pointer: [number, number] = [0, 0];
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer[0] = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    live = liveGL(el, () => import("@/lib/rigview-gl"), ({ start }, c) =>
      start(c, { index: () => current.current, pointer: () => pointer, still }),
    );
    return () => {
      clearInterval(cycle);
      off.forEach((f) => f());
      window.removeEventListener("pointermove", onMove);
      live?.stop();
    };
  }, []);

  const rig = rigBrief[active];
  return (
    <figure className="m-0">
      <div aria-hidden className="ticks relative aspect-[4/3] rounded-[var(--radius-card)] bg-paper-2">
        <div ref={canvas} className="absolute inset-0" />
        <p className="absolute left-4 top-3 m-0 text-[0.875rem] text-ink sm:left-5 sm:top-4">
          <span className="font-[420]">{rig.name}</span>
          <span className="text-muted"> · {rig.vantage}</span>
        </p>
      </div>
      <figcaption className="mt-3 text-[0.8125rem] text-muted">{rigViewerCaption}</figcaption>
    </figure>
  );
}
