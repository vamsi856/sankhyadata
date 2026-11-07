import { useEffect, useRef } from "react";
import { fieldCaption, fieldLegend } from "@/content";
import { prefersStill, whenNear } from "@/lib/when-near";

/** Schematic field-support network beside the IT section's heading (WebGL, lazy chunk). */
export function FieldSupport() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let stop: (() => void) | null = null;
    let px = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") px = (e.clientX / innerWidth) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    const off = whenNear(el, () => import("@/lib/field-gl"), ({ start }) => {
      stop = start(el, { pointer: () => px, still: prefersStill() });
    });
    return () => {
      off();
      stop?.();
      removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <figure className="m-0">
      <div aria-hidden className="field relative">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-muted">
        {fieldLegend.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-2">
            <span aria-hidden className={`h-2 w-2 rounded-full ${i === 2 ? "bg-label" : "bg-ink"}`} />
            {l}
          </span>
        ))}
        <span>{fieldCaption}</span>
      </figcaption>
    </figure>
  );
}
