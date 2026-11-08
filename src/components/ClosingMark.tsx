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
    // Pointer over the mark parts its points; a press sends a ripple through it.
    const local = { x: 0, y: 0, inside: false, press: 0 };
    const at = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      local.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      local.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const over = (e: PointerEvent) => ((local.inside = true), at(e));
    const leave = () => (local.inside = false);
    const press = (e: PointerEvent) => (at(e), local.press++);
    el.addEventListener("pointermove", over);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", press);
    const live = liveGL(el, () => import("@/lib/mark-gl"), ({ start }, c) =>
      start(c, { pointer: () => pt, local, still: prefersStill() }),
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
