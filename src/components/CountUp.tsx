import { useEffect, useRef, useState } from "react";
import { experience } from "@/content";

/**
 * "50,000+" counts up the first time it scrolls into view. The prerendered HTML holds the
 * final figure, so it reads correctly without JavaScript and for reduced-motion visitors.
 * Tiny on purpose: requestAnimationFrame only, no animation library.
 */
export function CountUp() {
  const target = Number(experience.figure.replace(/[^\d]/g, ""));
  const suffix = experience.figure.replace(/[\d,]/g, "");
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: leave it
    setValue(0);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[entries.length - 1].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 3400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      // Count only once the whole figure is in view and clear of the bottom edge.
      { threshold: 1, rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <span ref={ref} data-final={experience.figure} className="num text-[clamp(4.25rem,11vw,8.5rem)] font-[200] leading-[0.9] tracking-[-0.045em] text-ink">
      <span className="fig-live" aria-hidden="true">
        {value.toLocaleString("en-GB")}
        {suffix}
      </span>
      <span className="sr-only">{experience.figure}</span>
    </span>
  );
}
