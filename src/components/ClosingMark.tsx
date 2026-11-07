import { useEffect, useRef } from "react";
import { prefersStill, whenNear } from "@/lib/when-near";

/** The SankhyaData mark condensing out of a point cloud beside the enquiry (WebGL, lazy). */
export function ClosingMark() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let stop: (() => void) | null = null;
    const pt: [number, number] = [0, 0];
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pt[0] = (e.clientX / innerWidth) * 2 - 1;
      pt[1] = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    const off = whenNear(el, () => import("@/lib/mark-gl"), ({ start }) => {
      stop = start(el, { pointer: () => pt, still: prefersStill() });
    });
    return () => {
      off();
      stop?.();
      removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <div aria-hidden className="mark-3d relative">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
