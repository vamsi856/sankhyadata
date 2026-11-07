import { useEffect, useRef, useState } from "react";
import { billing } from "@/content";
import { prefersStill, whenNear } from "@/lib/when-near";

/**
 * 3D approval line above the billing track: only approved hours reach the batch. The
 * labels are pinned to the scene by the engine, so they appear once it runs; the track
 * below carries the same four states as text for everyone.
 */
export function ApprovalLine() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLSpanElement[]>([]);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let stop: (() => void) | null = null;
    let px = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") px = (e.clientX / innerWidth) * 2 - 1;
    };
    addEventListener("pointermove", move, { passive: true });
    const off = whenNear(el, () => import("@/lib/approval-gl"), ({ start }) => {
      setOn(true);
      requestAnimationFrame(() => {
        stop = start(el, { labels: labels.current, pointer: () => px, still: prefersStill() });
        if (!stop) setOn(false);
      });
    });
    return () => {
      off();
      stop?.();
      removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div aria-hidden className="approval relative">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      {on &&
        billing.states.map((s, i) => (
          <span
            key={s}
            ref={(n) => {
              if (n) labels.current[i] = n;
            }}
            className={`absolute left-0 top-0 whitespace-nowrap text-[0.8125rem] ${i === 2 ? "text-label" : "text-ink-2"}`}
          >
            {s}
          </span>
        ))}
    </div>
  );
}
