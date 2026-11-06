/**
 * Magnetic buttons, adapted from React Bits' Magnet (reactbits.dev, MIT + Commons Clause):
 * an element marked `data-magnet` leans toward the pointer once it comes within `PADDING`
 * pixels, and springs back when it leaves. Plain DOM, no island: it moves the CSS
 * `translate` property only (composited, and separate from the buttons' own `transform`),
 * runs only for a fine pointer with motion allowed, and sleeps when nothing is moving.
 */
const PADDING = 56; // px around the element where the pull begins
const STRENGTH = 0.22; // share of the pointer's offset the element follows
const MAX = 8; // px, the furthest it ever moves
const STIFFNESS = 0.16; // per-frame approach toward the target

type Item = { el: HTMLElement; x: number; y: number; tx: number; ty: number };

export function startMagnets() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce || !fine) return;
  const items: Item[] = [...document.querySelectorAll<HTMLElement>("[data-magnet]")].map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0 }));
  if (!items.length) return;

  let raf = 0;
  const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));

  const frame = () => {
    raf = 0;
    let moving = false;
    for (const it of items) {
      it.x += (it.tx - it.x) * STIFFNESS;
      it.y += (it.ty - it.y) * STIFFNESS;
      if (Math.abs(it.tx - it.x) < 0.05 && Math.abs(it.ty - it.y) < 0.05) {
        it.x = it.tx;
        it.y = it.ty;
      } else moving = true;
      it.el.style.translate = it.x || it.y ? `${it.x.toFixed(2)}px ${it.y.toFixed(2)}px` : "";
    }
    if (moving) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const aim = (px: number | null, py: number | null) => {
    for (const it of items) {
      let tx = 0;
      let ty = 0;
      if (px !== null && py !== null) {
        // Measure without our own offset, so the pull does not chase itself.
        const r = it.el.getBoundingClientRect();
        const cx = r.left - it.x + r.width / 2;
        const cy = r.top - it.y + r.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        const outside = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2));
        if (outside <= PADDING) {
          tx = clamp(dx * STRENGTH);
          ty = clamp(dy * STRENGTH);
        }
      }
      if (tx !== it.tx || ty !== it.ty) {
        it.tx = tx;
        it.ty = ty;
        wake();
      }
    }
  };

  window.addEventListener("pointermove", (e) => e.pointerType !== "touch" && aim(e.clientX, e.clientY), { passive: true });
  document.documentElement.addEventListener("pointerleave", () => aim(null, null));
  window.addEventListener("blur", () => aim(null, null));
}
