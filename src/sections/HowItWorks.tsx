import { steps } from "@/content";

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="border-t border-rule">
      <div className="container-page grid gap-x-12 gap-y-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="how-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
            One crew, from device to delivery.
          </h2>
          <p className="mb-0 mt-5 max-w-sm text-ink-2">
            Every role in the capture is ours, so nothing gets lost between vendors.
          </p>
        </div>
        <ol className="m-0 list-none border-t border-rule p-0">
          {steps.map((step, i) => (
            <li
              key={step.role}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-rule py-7 sm:grid-cols-[3rem_minmax(0,11rem)_minmax(0,1fr)] sm:gap-x-6"
            >
              <span className="num pt-1 text-[0.9375rem] text-muted">{i + 1}</span>
              <h3 className="m-0 text-[1.5rem] leading-tight">{step.role}</h3>
              <p className="col-start-2 m-0 mt-2 text-ink-2 sm:col-start-3 sm:mt-0.5">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
