import { billing } from "@/content";
import { Island } from "@/islands";

export function Billing() {
  return (
    <section id="billing" aria-labelledby="billing-title" className="border-t border-rule">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-3xl">
          <h2 id="billing-title" className="m-0 text-[clamp(2.2rem,5vw,4rem)]">
            {billing.title}
          </h2>
          <p className="mb-0 mt-6 max-w-xl text-[1.125rem] text-ink-2">{billing.sentence}</p>
        </div>
        <div className="mt-16 max-w-4xl">
          <Island name="billing" />
        </div>
      </div>
    </section>
  );
}
