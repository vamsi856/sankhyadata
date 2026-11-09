import { billing } from "@/content";
import { Island } from "@/islands";

export function Billing() {
  return (
    <section id="invoicing" aria-labelledby="billing-title" className="band-ink">
      <div className="container-page py-20 md:py-28">
        {/* Heading beside the approval line on wide screens, the four states right below, so
            the whole argument reads in about one screen. */}
        <div className="grid items-center gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 id="billing-title" className="m-0 text-[clamp(2.2rem,5vw,4rem)] lg:text-[clamp(2.25rem,3.6vw,3.5rem)]">
              {billing.title}
            </h2>
            <p className="mb-0 mt-6 max-w-xl text-[1.125rem] text-ink-2">{billing.sentence}</p>
          </div>
          <Island name="billing" className="gl-scene" />
        </div>
        <div className="mt-10 max-w-4xl">
          <Island name="track" />
        </div>
      </div>
    </section>
  );
}
