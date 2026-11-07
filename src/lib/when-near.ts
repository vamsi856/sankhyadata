/**
 * Runs `load` once `el` comes within a screen of the viewport, then hands the result to
 * `ready` (unless cleaned up first). Shared by the WebGL islands so each stays tiny.
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
