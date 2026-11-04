import { questions } from "@/content";

/** FAQ built on native <details>, so it needs no JavaScript and works with the keyboard. */
export function Questions() {
  return (
    <section id="questions" aria-labelledby="questions-title" className="border-t border-rule">
      <div className="container-page grid gap-x-12 gap-y-10 py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <h2 id="questions-title" className="m-0 max-w-md text-[clamp(2rem,4vw,3.25rem)]">
          {questions.title}
        </h2>
        <div className="border-t border-rule">
          {questions.items.map((item) => (
            <details key={item.q} className="faq group border-b border-rule">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-[4px] py-5 text-[1.125rem] font-[400] tracking-[-0.01em] text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="mt-1.5 h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-out group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </summary>
              <p className="mb-0 mt-0 max-w-2xl pb-6 text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
