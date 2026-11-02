import { useEffect, type ReactNode } from "react";
import { LazyMotion, MotionConfig, m, type HTMLMotionProps } from "motion/react";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

/**
 * Motion (formerly Framer Motion) is loaded through LazyMotion + `m` components. The
 * `domAnimation` feature set (animations, variants, hover/tap, in-view) is fetched as its
 * own chunk after first paint, so the initial bundle only carries the tiny `m` renderer.
 */
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

/** Smooth, inertial wheel scrolling. Skipped entirely for reduced-motion users. */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lenis: { destroy(): void } | undefined;
    let cancelled = false;
    // Lenis is fetched after the page is interactive; native scrolling works until then.
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -72 }, allowNestedScroll: true });
    });
    return () => {
      cancelled = true;
      lenis?.destroy();
    };
  }, []);
}

type RevealProps = HTMLMotionProps<"div"> & { delay?: number; y?: number };

/** Fade + short rise the first time the element scrolls into view. */
export function Reveal({ delay = 0, y = 14, children, ...rest }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      data-reveal=""
      {...rest}
    >
      {children}
    </m.div>
  );
}

export { m };
