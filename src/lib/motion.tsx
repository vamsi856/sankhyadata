import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { LazyMotion, MotionConfig, domAnimation, m, type HTMLMotionProps } from "motion/react";

/**
 * Motion (formerly Framer Motion) is loaded through LazyMotion + `m` components with
 * the `domAnimation` feature set only (animations, variants, hover/tap, in-view).
 * That keeps the motion runtime ~15 KB instead of the full ~34 KB bundle.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
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
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      anchors: { offset: -72 },
      allowNestedScroll: true,
    });
    return () => lenis.destroy();
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
