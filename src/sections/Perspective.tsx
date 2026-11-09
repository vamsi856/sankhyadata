import { perspective } from "@/content";
import { Island } from "@/islands";

/**
 * A pinned, scroll-driven scene: the capture site as a point cloud, flown from an overview
 * into the recorder's own point of view (WebGL, loaded on approach). The text is static
 * HTML and reads on its own without the canvas.
 */
export function Perspective() {
  return (
    <section id="perspective" aria-labelledby="perspective-title" className="band-ink persp-track relative">
      <div className="persp-sticky sticky top-0 overflow-hidden">
        <Island name="cloud" className="gl-scene absolute inset-0" />
        <div aria-hidden className="persp-scrim pointer-events-none absolute inset-0" />
        <div className="container-page pointer-events-none relative flex h-full flex-col justify-between py-20 md:py-24">
          <div className="persp-copy max-w-xl">
            <h2 id="perspective-title" className="m-0 text-[clamp(2.2rem,5vw,4rem)]">
              {perspective.title}
            </h2>
            <p className="mb-0 mt-6 max-w-md text-[1.125rem] text-ink-2">{perspective.sentence}</p>
          </div>
          <p className="persp-note gl-scene m-0 max-w-md text-[0.8125rem] text-muted">{perspective.caption}</p>
        </div>
      </div>
    </section>
  );
}
