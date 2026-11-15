/**
 * Pinned step sections (Rigs, IT): a sticky stage (.pin-stage) inside a taller track
 * (.pin-track). While the stage is pinned, the scroll position through the track picks the
 * active item, one equal slice of the track per item. Returns null when the section is not
 * pinned (phones, short screens, no JavaScript styles), so callers fall back to their own rule.
 */
export function pinnedStep(section: Element, count: number): number | null {
  const track = section.querySelector<HTMLElement>(".pin-track");
  const stage = track?.querySelector<HTMLElement>(".pin-stage");
  if (!track || !stage || getComputedStyle(stage).position !== "sticky") return null;
  const travel = track.offsetHeight - stage.offsetHeight;
  if (travel < 40) return null;
  const top = parseFloat(getComputedStyle(stage).top) || 0;
  const p = Math.min(1, Math.max(0, (top - track.getBoundingClientRect().top) / travel));
  return Math.min(count - 1, Math.floor(p * count));
}

/** Keys that scroll the page: they let go of an item held by a click or focus, as wheel and touch do. */
export const scrollKeys = new Set(["PageDown", "PageUp", "ArrowDown", "ArrowUp", " ", "Home", "End"]);
