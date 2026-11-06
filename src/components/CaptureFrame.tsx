import { useEffect, useRef, useState } from "react";
import { m, EASE_OUT } from "@/lib/motion";
import { hero } from "@/content";
import { cn } from "@/lib/utils";

/**
 * Annotation boxes in percent of the frame, placed on the example photo. Tags are placed
 * so they never clip at the frame edge or hide under the narration line: the hands tag
 * inside its box, the clay tag outside to the left, over the empty wheel.
 */
const boxes = [
  { id: "hands", label: "Hands: in contact", x: 38.5, y: 3, w: 28, h: 46, tag: "inside" as const },
  { id: "clay", label: "Object: clay", x: 36.5, y: 39.5, w: 22, h: 34.5, tag: "left" as const },
];

const media = (name: string) => `media/${name}`;

export function CaptureFrame() {
  const [labels, setLabels] = useState(true);
  const [narration, setNarration] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState(false);

  // Depth: the frame leans toward a fine pointer, so the annotation and narration planes
  // separate from the photograph. Off for touch and for reduced motion; at rest it is flat.
  useEffect(() => {
    const ok = matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTilt(ok);
  }, []);
  const lean = (e: { clientX: number; clientY: number; currentTarget: HTMLElement }) => {
    const el = stage.current;
    if (!tilt || !el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
  };
  const rest = () => {
    stage.current?.style.removeProperty("--ry");
    stage.current?.style.removeProperty("--rx");
  };

  return (
    <figure className="m-0">
      <div className="depth" onPointerMove={lean} onPointerLeave={rest}>
      <div ref={stage} className="depth-stage relative aspect-[3/2]">
      <div className="ticks absolute inset-0 isolate overflow-hidden rounded-[var(--radius-card)] bg-paper-3 p-px">
        <picture>
          <source
            type="image/avif"
            srcSet={`${media("frame-560.avif")} 560w, ${media("frame-800.avif")} 800w, ${media("frame-1400.avif")} 1400w`}
            sizes="(min-width: 1024px) 44rem, calc(100vw - 2rem)"
          />
          <source
            type="image/webp"
            srcSet={`${media("frame-560.webp")} 560w, ${media("frame-800.webp")} 800w, ${media("frame-1400.webp")} 1400w`}
            sizes="(min-width: 1024px) 44rem, calc(100vw - 2rem)"
          />
          <img
            src={media("frame-1400.jpg")}
            width={1400}
            height={933}
            alt={hero.frame.alt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full rounded-[var(--radius-card)] object-cover"
          />
        </picture>

        {/* One focus sweep across the frame on first paint (CSS only). */}
        <div aria-hidden className="scan pointer-events-none absolute inset-0" />
      </div>

        {/* Annotator layer */}
        <div className="depth-plane depth-near pointer-events-none absolute inset-0">
        <m.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ opacity: labels ? 1 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          data-layer="labels"
        >
          {boxes.map((b, i) => (
            <m.div
              key={b.id}
              className="absolute rounded-[3px] border-[1.5px] border-label shadow-[0_0_0_1px_var(--label-keyline),inset_0_0_0_1px_var(--label-keyline)]"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.45 + i * 0.22 }}
              data-reveal=""
            >
              <span
                className={cn(
                  "absolute whitespace-nowrap bg-label px-2 py-0.5 text-[0.75rem] font-normal leading-5 text-label-ink",
                  b.tag === "inside"
                    ? "right-0 top-0 rounded-bl-[2px]"
                    : "right-full top-1/2 -translate-y-1/2 rounded-l-[3px]",
                )}
              >
                {b.label}
              </span>
            </m.div>
          ))}
        </m.div>
        </div>

        {/* Narrator layer: a subtitle line. Visible from first paint (it is often the
            largest text on screen); only the toggle animates it. */}
        <div className="depth-plane depth-nearer pointer-events-none absolute inset-0">
        <m.p
          className="pointer-events-none absolute inset-x-3 bottom-3 m-0 rounded-[4px] bg-scrim px-3 py-2 text-[0.9375rem] leading-snug text-on-image sm:inset-x-4 sm:bottom-4"
          initial={false}
          animate={{ opacity: narration ? 1 : 0, y: narration ? 0 : 6 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          data-layer="narration"
        >
          <span className="text-on-image/85">Narrator: </span>
          {hero.frame.narration}
        </m.p>
        </div>
      </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[0.875rem] text-muted">
        <span>{hero.frame.caption}</span>
        <span className="flex gap-2" role="group" aria-label="Annotation and narration layers">
          <LayerToggle pressed={labels} onToggle={() => setLabels((v) => !v)}>
            Annotation
          </LayerToggle>
          <LayerToggle pressed={narration} onToggle={() => setNarration((v) => !v)}>
            Narration
          </LayerToggle>
        </span>
      </figcaption>
    </figure>
  );
}

function LayerToggle({
  pressed,
  onToggle,
  children,
}: {
  pressed: boolean;
  onToggle: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-[0.875rem] text-ink",
        "shadow-[inset_0_0_0_1px_var(--line)] transition-[box-shadow,background-color] duration-150 ease-out",
        "hover:shadow-[inset_0_0_0_1px_var(--ink)]",
        pressed && "bg-paper-2",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-2.5 w-2.5 rounded-full transition-colors duration-150",
          pressed ? "bg-label shadow-[inset_0_0_0_1px_var(--label-ink)]" : "bg-transparent shadow-[inset_0_0_0_1px_var(--line)]",
        )}
      />
      {children}
    </button>
  );
}
