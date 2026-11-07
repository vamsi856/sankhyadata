import { useEffect, useRef } from "react";
import { prefersStill, whenNear } from "@/lib/when-near";

/**
 * Canvas host for the point-cloud capture site. The WebGL code is its own chunk, fetched
 * only when the section is within a screen of the viewport, so it never touches first
 * paint or the main bundle. Without WebGL the section's text simply stands alone.
 */
export function SiteCloud() {
  const ref = useRef<HTMLCanvasElement>(null);

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
    let stop: (() => void) | null = null;
    const off = whenNear(canvas, () => import("@/lib/sitecloud-gl"), ({ start }) => {
      stop = start(canvas, { progress, pointer: () => pointer, still });
      if (stop) canvas.dataset.on = "";
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      off();
      stop?.();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="sitecloud absolute inset-0 h-full w-full" />;
}
