import { contact, credits, footer, nav, site } from "@/content";
import { Wordmark } from "./Header";
import { Island } from "@/islands";

const mailto = `mailto:${site.email}?subject=${encodeURIComponent(contact.subject)}&body=${encodeURIComponent(
  contact.brief.join("\n\n") + "\n",
)}`;

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-rule">
      <div className="container-page grid grid-cols-[minmax(0,1fr)] items-center gap-x-12 gap-y-10 py-24 md:py-32 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
        <h2 id="contact-title" className="m-0 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)]">
          {contact.title}
        </h2>
        <p className="mb-0 mt-6 max-w-xl text-[1.125rem] text-ink-2">{contact.sentence}</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a className="btn btn-primary max-[359px]:whitespace-normal max-[359px]:py-3 max-[359px]:text-center max-[359px]:leading-snug max-[359px]:text-balance" href={mailto} data-magnet>
            {contact.button} {site.email}
          </a>
          <span className="text-[0.875rem] text-muted">The email opens with the brief’s fields already listed.</span>
        </div>
        </div>
        <Island name="mark" className="gl-scene" />
      </div>
    </section>
  );
}

const footerLink = "link text-ink-2 no-underline hover:text-ink";

export function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-rule bg-paper-2">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-x-16">
        <div>
          <Wordmark />
          <p className="mb-0 mt-4 max-w-md text-pretty text-[0.9375rem] text-ink-2">
            {/* Keep the hyphenated compound on one line. */}
            {footer.tagline.split(/(in-house)/).map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part))}
          </p>
          <p className="mb-0 mt-3 max-w-md text-balance text-[0.8125rem] text-muted">{footer.note}</p>
        </div>
        <nav aria-label="Footer: sections">
          <ul className="m-0 grid list-none gap-y-3 p-0 text-[0.9375rem]">
            {nav.map((item) => (
              <li key={item.href}>
                <a className={footerLink} href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Footer: company">
          <ul className="m-0 grid list-none gap-y-3 p-0 text-[0.9375rem]">
            <li>
              <a className={footerLink} href="#contact">
                Contact
              </a>
            </li>
            <li>
              <a className={footerLink} href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
            <li>
              <a className={footerLink} href={footer.privacy.href}>
                {footer.privacy.label}
              </a>
            </li>
            <li>
              <a className={footerLink} href={footer.security.href}>
                {footer.security.label}
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col gap-2 border-t border-rule pt-6 text-[0.8125rem] text-muted md:col-span-3 md:flex-row md:justify-between md:gap-8">
          <span>
            © {year} {site.name}
          </span>
          <span>
            <a className="link text-muted" href={credits.frame.href} target="_blank" rel="noopener noreferrer">
              {credits.frame.text}
              <span className="sr-only"> {footer.newTab}</span>
            </a>
            ,{" "}
            <a className="link text-muted" href={credits.frame.licenseHref} target="_blank" rel="noopener noreferrer">
              {credits.frame.license}
              <span className="sr-only"> {footer.newTab}</span>
            </a>
          </span>
        </div>
      </div>
      {/* End card: the name set large across the full column, like a closing title card, with the mark's chartreuse dot. Decorative. */}
      <div aria-hidden className="foot-mark container-page">
        <span className="foot-word">
          {site.name}
          <span className="foot-dot" />
        </span>
      </div>
    </footer>
  );
}
