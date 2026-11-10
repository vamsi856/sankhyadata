import { useEffect, useRef } from "react";
import { liveGL, prefersStill } from "@/lib/when-near";

/**
 * Canvas host for the point-cloud capture site. The WebGL code is its own chunk, fetched
 * only when the section is within a screen of the viewport, so it never touches first
 * paint or the main bundle. Without WebGL the section's text simply stands alone.
 */
export function SiteCloud() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const track = canvas?.closest("section");
    if (!canvas || !track) return;
    const still = prefersStill();
    const pointer: [number, number] = [0, 0];
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer[0] = (e.clientX / window.innerWidth) * 2 - 1;
      pointer[1] = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const progress = () => {
      const r = track.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? -r.top / span : 0;
    };
    const live = liveGL(canvas, () => import("@/lib/sitecloud-gl"), ({ start }, c) =>
      start(c, { progress, pointer: () => pointer, still }),
    );
    // The band's scroll cue reads this to fill its line and fade out at the end.
    const mark = () => track.style.setProperty("--pp", String(Math.min(1, Math.max(0, progress()))));
    mark();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", mark, { passive: true });
    return () => {
      live.stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", mark);
    };
  }, []);

  return <div ref={ref} aria-hidden className="absolute inset-0" />;
}
