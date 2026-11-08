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
      // The reading line: mid-screen on desktop; below the pinned strip on phones.
      // A step counts once it reaches the upper third (desktop), so the pipeline starts at 01
      // when the section arrives, even on short laptop screens.
      const line = window.innerHeight * (window.innerWidth >= 1024 ? 0.34 : 0.62);
      const tops = steps.map((s) => s.getBoundingClientRect().top);
      let v = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] > line) break;
        const next = tops[i + 1] ?? tops[i] + steps[i].offsetHeight;
        v = i + Math.min(1, (line - tops[i]) / Math.max(1, next - tops[i])) * (i < tops.length - 1 ? 1 : 0);
      }
      stage = still ? Math.round(v) : v;
      const now = Math.min(steps.length - 1, Math.round(v));
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
