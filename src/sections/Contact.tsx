import { contact, credits, nav, site } from "@/content";
import { Wordmark } from "./Header";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-rule">
      <div className="container-page py-24 md:py-32">
        <h2 id="contact-title" className="m-0 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)]">
          {contact.title}
        </h2>
        <p className="mb-0 mt-6 max-w-lg text-[1.125rem] text-ink-2">{contact.sentence}</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a className="btn btn-primary" href={`mailto:${site.email}?subject=Capture%20project`}>
            Email {site.email}
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-rule bg-paper-2">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <Wordmark />
          <p className="mb-0 mt-4 max-w-sm text-[0.9375rem] text-ink-2">
            Egocentric video, recorded, annotated and narrated by our own crew.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="m-0 grid list-none grid-cols-2 gap-x-10 gap-y-3 p-0 text-[0.9375rem]">
            {nav.map((item) => (
              <li key={item.href}>
                <a className="link text-ink-2 no-underline hover:text-ink" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a className="link text-ink-2 no-underline hover:text-ink" href="#contact">
                Contact
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col gap-2 border-t border-rule pt-6 text-[0.8125rem] text-muted md:col-span-2 md:flex-row md:justify-between">
          <span>
            © {year} {site.name}
          </span>
          <span>
            <a className="link text-muted" href={credits.frame.href} target="_blank" rel="noopener noreferrer">
              {credits.frame.text}
            </a>
            ,{" "}
            <a className="link text-muted" href={credits.frame.licenseHref} target="_blank" rel="noopener noreferrer">
              {credits.frame.license}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
