/**
 * Lenis smooth wheel scrolling, only where it helps: a mouse or trackpad (fine pointer),
 * motion allowed. It loads when the browser is idle, so it never competes with first paint.
 * Touch devices keep their native scrolling and never download it.
 */
export function startSmoothScroll() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce || !finePointer) return;
  const start = () =>
    import("lenis").then(({ default: Lenis }) => {
      new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -72 }, allowNestedScroll: true });
    });
  if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 2500 });
  else setTimeout(start, 1500);
}
