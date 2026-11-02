import { useState } from "react";
import { m, EASE_OUT } from "@/lib/motion";
import { hero } from "@/content";
import { cn } from "@/lib/utils";

/** Boxes and keypoints in percent of the frame, placed on the example photo. */
const boxes = [
  { id: "hands", label: "Hands, in contact", x: 38.5, y: 2, w: 28, h: 47, tagSide: "right" as const },
  { id: "clay", label: "Object: clay", x: 36.5, y: 39.5, w: 22, h: 34.5, tagSide: "left" as const },
];
const keypoints: [number, number][] = [
  [41.6, 37.8],
  [44.6, 41.2],
  [49.7, 45.3],
  [47.2, 22.8],
  [53.4, 32.6],
  [57.8, 23.7],
];

const media = (name: string) => `media/${name}`;

export function CaptureFrame() {
  const [labels, setLabels] = useState(true);
  const [narration, setNarration] = useState(true);

  return (
    <figure className="m-0">
      <div className="ticks relative isolate aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] bg-paper-3 p-px">
        <picture>
          <source
            type="image/avif"
            srcSet={`${media("frame-800.avif")} 800w, ${media("frame-1400.avif")} 1400w`}
            sizes="(min-width: 1024px) 44rem, 100vw"
          />
          <source
            type="image/webp"
            srcSet={`${media("frame-800.webp")} 800w, ${media("frame-1400.webp")} 1400w`}
            sizes="(min-width: 1024px) 44rem, 100vw"
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

        {/* Recorder layer: the device's own read-out */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-scrim px-3 py-1 text-[0.8125rem] text-on-image sm:left-4 sm:top-4">
          <span>Head-mounted iPhone</span>
          <span aria-hidden className="h-3 w-px bg-on-image/40" />
          <span className="num">{hero.frame.timecode}</span>
        </div>

        {/* Annotator layer */}
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
              className="absolute rounded-[3px] border-[1.5px] border-label"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.45 + i * 0.22 }}
              data-reveal=""
            >
              <span
                className={cn(
                  "absolute -top-px translate-y-[-100%] whitespace-nowrap rounded-t-[3px] bg-label px-2 py-0.5 text-[0.75rem] font-normal leading-5 text-label-ink",
                  b.tagSide === "right" ? "right-[-1.5px]" : "left-[-1.5px]",
                )}
              >
                {b.label}
              </span>
            </m.div>
          ))}
          {keypoints.map(([x, y], i) => (
            <m.span
              key={i}
              className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-label-ink/40 bg-label"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.0 + i * 0.06 }}
              data-reveal=""
            />
          ))}
        </m.div>

        {/* Narrator layer: a subtitle line */}
        <m.p
          className="pointer-events-none absolute inset-x-3 bottom-3 m-0 rounded-[4px] bg-scrim px-3 py-2 text-[0.9375rem] leading-snug text-on-image sm:inset-x-4 sm:bottom-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: narration ? 1 : 0, y: narration ? 0 : 6 }}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: narration ? 0 : 0 }}
          data-reveal=""
          data-layer="narration"
        >
          <span className="text-on-image/70">Narrator: </span>
          {hero.frame.narration}
        </m.p>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[0.875rem] text-muted">
        <span>Example frame with each layer we add.</span>
        <span className="flex gap-2" role="group" aria-label="Layers">
          <LayerToggle pressed={labels} onToggle={() => setLabels((v) => !v)}>
            Labels
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
        "shadow-[inset_0_0_0_1px_var(--rule-2)] transition-[box-shadow,background-color] duration-150 ease-out",
        "hover:shadow-[inset_0_0_0_1px_var(--ink)]",
        pressed && "bg-paper-2",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-2.5 w-2.5 rounded-full shadow-[inset_0_0_0_1px_var(--rule-2)] transition-colors duration-150",
          pressed ? "bg-label shadow-[inset_0_0_0_1px_var(--label-ink)]" : "bg-transparent",
        )}
      />
      {children}
    </button>
  );
}
