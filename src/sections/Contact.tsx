import { contact, credits, footer, nav, site } from "@/content";
import { Wordmark } from "./Header";

const mailto = `mailto:${site.email}?subject=${encodeURIComponent(contact.subject)}&body=${encodeURIComponent(
  contact.brief.join("\n\n") + "\n",
)}`;

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-rule">
      <div className="container-page py-24 md:py-32">
        <h2 id="contact-title" className="m-0 max-w-3xl text-[clamp(2.4rem,6vw,4.75rem)]">
          {contact.title}
        </h2>
        <p className="mb-0 mt-6 max-w-xl text-[1.125rem] text-ink-2">{contact.sentence}</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a className="btn btn-primary" href={mailto} data-magnet>
            {contact.button} {site.email}
          </a>
          <span className="text-[0.875rem] text-muted">The email opens with the brief’s fields already listed.</span>
        </div>
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
          <p className="mb-0 mt-4 max-w-sm text-[0.9375rem] text-ink-2">{footer.tagline}</p>
          <p className="mb-0 mt-3 max-w-sm text-[0.8125rem] text-muted">{footer.note}</p>
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
