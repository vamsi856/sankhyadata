/**
 * Runs `load` once `el` comes within a screen of the viewport, then hands the result to
 * `ready` (unless cleaned up first). Shared by the islands so each stays tiny.
 */
export function whenNear<T>(el: Element, load: () => Promise<T>, ready: (mod: T) => void) {
  let dead = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      load().then((mod) => !dead && ready(mod));
    },
    { rootMargin: "100% 0px" },
  );
  io.observe(el);
  return () => {
    dead = true;
    io.disconnect();
  };
}

export const prefersStill = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Engine = (() => void) | { stop: () => void; poke?: () => void } | null;

/**
 * A WebGL scene that only holds a context while it is near the viewport. Browsers cap live
 * WebGL contexts per page and silently drop the oldest, which would leave earlier scenes
 * blank; so when the host scrolls well away, its engine stops, its context is released and
 * its canvas removed, and a fresh canvas starts when it comes back. `begin` receives each
 * new canvas; `poke` forwards to the engine that is running, if any.
 */
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
    ([entry]) => {
      near = entry.isIntersecting;
      if (!near) return down();
      if (mod) return up();
      load().then((m) => {
        mod = m;
        up();
      });
    },
    { rootMargin: "120% 0px" },
  );
  io.observe(host);
  return {
    poke: () => (engine && typeof engine === "object" ? engine.poke?.() : undefined),
    stop: () => {
      dead = true;
      io.disconnect();
      down();
    },
  };
}
