import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, m } from "motion/react";

/**
 * Motion (formerly Framer Motion), loaded through LazyMotion + `m` components. The
 * `domAnimation` feature set (animations, variants, in-view) is fetched as its own chunk
 * after first paint, so the islands' initial JavaScript only carries the small `m` renderer.
 */
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.7, ease: EASE_OUT }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

export { m };
