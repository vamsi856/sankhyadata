export const prefersStill = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Engine = (() => void) | { stop: () => void; poke?: () => void } | null;

/**
 * A WebGL scene that only holds a context while it is near the viewport. Browsers cap live
 * WebGL contexts per page and silently drop the oldest, which would leave earlier scenes
 * blank; so when the host scrolls well away, its engine stops, its context is released and
 * its canvas removed, and a fresh canvas starts when it comes back. `begin` receives each
 * new canvas; `poke` forwards to the engine that is running, if any.
 */
const EVENTS = ["scroll", "wheel", "pointerdown", "keydown", "touchstart"] as const;

/**
 * Whether this browser can draw WebGL at all, checked once (on the first arm, after the
 * visitor's first input). If it cannot, html[data-nogl] is set and CSS tidies the layout:
 * scenes are hidden and their sections close up, so no empty frames are left behind.
 */
let gl: boolean | undefined;
const glOk = () => {
  if (gl === undefined) {
    try {
      const c = document.createElement("canvas").getContext("webgl");
      gl = !!c;
      c?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      gl = false;
    }
    if (!gl) document.documentElement.dataset.nogl = "";
  }
  return gl;
};

export function liveGL<M>(host: HTMLElement, load: () => Promise<M>, begin: (mod: M, canvas: HTMLCanvasElement) => Engine) {
  let mod: M | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let engine: Engine = null;
  let near = false;
  let dead = false;
  const up = () => {
    if (!mod || canvas || !near || dead) return;
    canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 h-full w-full";
    host.appendChild(canvas);
    engine = begin(mod, canvas);
  };
  const down = () => {
    if (!canvas) return;
    if (typeof engine === "function") engine();
    else engine?.stop();
    engine = null;
    canvas.getContext("webgl")?.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
    canvas = null;
  };
  const io = new IntersectionObserver(
    (entries) => {
      // Entries can arrive batched (observe() plus a crossing in the same frame, e.g. under
      // smooth scrolling): only the last one is the current state.
      near = entries[entries.length - 1].isIntersecting;
      if (!near) return down();
      if (mod) return up();
      load().then((m) => {
        mod = m;
        up();
      });
    },
    { rootMargin: "120% 0px" },
  );
  // Nothing starts during page load unless it is actually on screen: scenes further down
  // wait for the visitor's first scroll, tap or key before they arm, keeping WebGL set-up
  // (context, shader compile, geometry) off the load path.
  const arm = () => {
    for (const t of EVENTS) removeEventListener(t, arm);
    if (!dead && glOk()) io.observe(host);
  };
  const r = host.getBoundingClientRect();
  if (r.top < innerHeight && r.bottom > 0) arm();
  else for (const t of EVENTS) addEventListener(t, arm, { passive: true });
  return {
    poke: () => (engine && typeof engine === "object" ? engine.poke?.() : undefined),
    stop: () => {
      dead = true;
      arm();
      io.disconnect();
      down();
    },
  };
}
