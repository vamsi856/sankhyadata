import { useEffect, useRef } from "react";
import { liveGL, prefersStill } from "@/lib/when-near";

/** The SankhyaData mark condensing out of a point cloud beside the enquiry (WebGL, lazy). */
export function ClosingMark() {
  const canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const pt: [number, number] = [0, 0];
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pt[0] = (e.clientX / innerWidth) * 2 - 1;
      pt[1] = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    const live = liveGL(el, () => import("@/lib/mark-gl"), ({ start }, c) =>
      start(c, { pointer: () => pt, still: prefersStill() }),
    );
    return () => {
      live.stop();
      removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <div aria-hidden className="mark-3d relative">
      <div ref={canvas} className="absolute inset-0" />
    </div>
  );
}
