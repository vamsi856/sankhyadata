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
    let stage = 0;
    let live: { poke: () => void; stop: () => void } | null = null;
    let shown = -1;
    const measure = () => {
      // The reading line sits near the top on desktop (below the pinned strip on phones). On
      // arrival the clip waits just before gate 01; each step scrolled carries it through the
      // next gate, so the visitor drives it from Scoping to Delivery.
      const line = window.innerHeight * (window.innerWidth >= 1024 ? 0.16 : 0.62);
      const tops = steps.map((s) => s.getBoundingClientRect().top);
      let v = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] > line) break;
        const next = tops[i + 1] ?? tops[i] + steps[i].offsetHeight;
        v = i + Math.min(1, (line - tops[i]) / Math.max(1, next - tops[i]));
      }
      const s = Math.min(steps.length - 1, v * 1.1 - 0.9);
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
