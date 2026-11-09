import { useEffect, useRef, useState } from "react";
import { rigBrief, rigInsetLabel, rigViewerCaption } from "@/content";
import { liveGL, prefersStill } from "@/lib/when-near";

/**
 * 3D rig viewer. Scrolling through the rig list (blocks carry `data-rig`) fits each rig to
 * the point-cloud recorder in turn; tapping or focusing a block fits it at once.
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
    const select = (i: number) => {
      if (i === current.current && rows[0]?.dataset.active) return;
      current.current = i;
      setActive(i);
      rows.forEach((r) => (r.dataset.active = String(Number(r.dataset.rig) === i)));
      live?.poke();
    };
    // Scrolling drives the rig: the active one is the last block to have reached the reading
    // line (mid-screen beside the sticky viewer; just under the pinned viewer on phones).
    const pin = el.closest(".rig-scene") as HTMLElement | null;
    let hold: HTMLElement | null = null;
    const release = () => (hold = null);
    const measure = () => {
      const wide = innerWidth >= 1024;
      const top = wide ? 0 : (pin?.getBoundingClientRect().bottom ?? 0);
      // A block chosen by focus or tap holds while it is in view (focusing one scrolls the
      // page, which must not hand the viewer to a neighbour); wheel or touch scrolling lets go.
      const b = hold?.getBoundingClientRect();
      if (b && b.bottom > top && b.top < innerHeight) return select(Number(hold!.dataset.rig));
      const line = wide ? innerHeight * 0.5 : top + 32;
      let k = 0;
      rows.forEach((r, i) => r.getBoundingClientRect().top <= line && (k = i));
      select(k);
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
    for (const row of rows) {
      const on = () => select(Number((hold = row).dataset.rig));
      for (const type of ["focusin", "click"] as const) {
        row.addEventListener(type, on);
        off.push(() => row.removeEventListener(type, on));
      }
    }
    const pointer: [number, number] = [0, 0];
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer[0] = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    live = liveGL(el, () => import("@/lib/rigview-gl"), ({ start }, c) =>
      start(c, { index: () => current.current, pointer: () => pointer, still }),
    );
    return () => {
      off.forEach((f) => f());
      window.removeEventListener("pointermove", onMove);
      live?.stop();
    };
  }, []);

  const rig = rigBrief[active];
  return (
    <figure className="m-0">
      <div aria-hidden className="rig-stage ticks relative aspect-[4/3] rounded-[var(--radius-card)] bg-paper-2">
        <div ref={canvas} className="absolute inset-0" />
        <div className="rig-inset pointer-events-none absolute">
          <span className="absolute left-2 top-1.5 text-[0.6875rem]">{rigInsetLabel}</span>
        </div>
        <p className="absolute left-4 top-3 m-0 text-[0.875rem] text-ink sm:left-5 sm:top-4">
          <span className="font-[420]">{rig.name}</span>
          <span className="text-muted"> · {rig.vantage}</span>
        </p>
      </div>
      <figcaption className="mt-3 text-[0.8125rem] text-muted">{rigViewerCaption}</figcaption>
    </figure>
  );
}
