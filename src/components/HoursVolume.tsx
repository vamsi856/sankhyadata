import { useEffect, useRef, useState } from "react";
import { experience, hoursCaption, hoursUnitLabel } from "@/content";
import { liveGL, prefersStill } from "@/lib/when-near";

// Index 1 (the weekly slab) is no longer drawn; its label slot stays empty.
const labels = [`${experience.figure} ${experience.unit}`, "", hoursUnitLabel];

/** The two experience figures as a 3D volume of points, ten hours each (WebGL, lazy). */
export function HoursVolume() {
  const canvas = useRef<HTMLDivElement>(null);
  const tags = useRef<HTMLSpanElement[]>([]);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let px = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") px = (e.clientX / innerWidth) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    // Pointing at the volume (or tapping it) opens it into its ten-hour units.
    const hover = { on: false };
    el.onpointerenter = (e) => e.pointerType === "mouse" && (hover.on = true);
    el.onpointerleave = (e) => e.pointerType === "mouse" && (hover.on = false);
    el.onpointerdown = (e) => e.pointerType !== "mouse" && (hover.on = !hover.on);
    const live = liveGL(el, () => import("@/lib/hours-gl"), ({ start }, c) => {
      setOn(true);
      return start(c, { labels: tags.current, pointer: () => px, hover, still: prefersStill() });
    });
    return () => {
      live.stop();
      removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <figure className="m-0 mt-8">
      <div aria-hidden className="hours relative">
        <div ref={canvas} className="absolute inset-0" />
        {on &&
          labels.map((l, i) => (
            <span
              key={l}
              ref={(n) => {
                if (n) tags.current[i] = n;
              }}
              className={`num absolute left-0 top-0 whitespace-nowrap text-[0.8125rem] ${i ? "font-[440] text-ink" : "text-ink-2"}`}
            >
              {l}
            </span>
          ))}
      </div>
      <figcaption className="mt-3 max-w-sm text-[0.8125rem] text-muted">{hoursCaption}</figcaption>
    </figure>
  );
}
