import { useEffect, useRef, useState } from "react";
import { stepRoles } from "@/content";
import { liveGL, prefersStill } from "@/lib/when-near";

/**
 * 3D methodology pipeline. Reading position in the step list (each `li.step`) drives a
 * continuous stage value, 0 to 6, that moves the clip along the track. WebGL is its own
 * chunk, fetched when the canvas nears the viewport. The prerender shows step 01's label.
 */
export function Pipeline() {
  const canvas = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = canvas.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    const still = prefersStill();
    const steps = [...section.querySelectorAll<HTMLElement>("li.step")];
    const panel = el.closest(".pipeline") as HTMLElement;
    let stage = 0;
    let live: { poke: () => void; stop: () => void } | null = null;
    let shown = -1;
    const measure = () => {
      // Progress runs over the whole step list: the clip waits before gate 01 until the list
      // reaches the reading line, and arrives at Delivery while the panel is still pinned
      // (desktop: before the list's end meets the panel's bottom, where it starts to scroll
      // away; phones: before the list leaves the lower part of the screen).
      const wide = window.innerWidth >= 1024;
      const vh = window.innerHeight;
      const r = steps[0].parentElement!.getBoundingClientRect();
      const start = vh * (wide ? 0.16 : 0.62);
      const end = wide ? panel.getBoundingClientRect().bottom + vh * 0.12 : vh * 0.85;
      const travel = Math.max(1, start - (end - r.height));
      const t = Math.min(1, Math.max(0, (start - r.top) / travel));
      const s = r.top > start ? -0.9 : -0.5 + t * (steps.length - 0.5);
      stage = still ? Math.max(0, Math.round(s)) : s;
      const now = Math.max(0, Math.min(steps.length - 1, Math.round(s)));
      if (now !== shown) {
        shown = now;
        setActive(now);
        steps.forEach((s, i) => (s.dataset.current = String(i === now)));
      }
      live?.poke();
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    live = liveGL(el, () => import("@/lib/pipeline-gl"), ({ start }, c) => start(c, { stage: () => stage, still }));
    return () => {
      live?.stop();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div aria-hidden className="pipeline relative">
      <div ref={canvas} className="absolute inset-0" />
      <p className="num absolute left-4 top-3 m-0 text-[0.875rem] text-ink lg:left-5 lg:top-4">
        <span className="text-muted">{String(active + 1).padStart(2, "0")} · </span>
        <span className="font-[420]">{stepRoles[active]}</span>
      </p>
    </div>
  );
}
