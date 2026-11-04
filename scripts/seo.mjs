// Generates SEO and machine-readable files from src/content.ts, so they never drift from the page:
//   JSON-LD (Organization, WebSite, Service, FAQPage), sitemap.xml, llms.txt, llms-full.txt
const SITE = "https://sankhyadata.com";

export function jsonLd(c) {
  const org = `${SITE}/#org`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: c.site.name,
        url: `${SITE}/`,
        email: c.site.email,
        logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png`, width: 512, height: 512 },
        description: c.site.description,
        contactPoint: { "@type": "ContactPoint", contactType: "sales", email: c.site.email, availableLanguage: "en" },
      },
      { "@type": "WebSite", "@id": `${SITE}/#website`, url: `${SITE}/`, name: c.site.name, inLanguage: "en-GB", publisher: { "@id": org } },
      {
        "@type": "Service",
        "@id": `${SITE}/#service`,
        name: "Egocentric video data acquisition",
        serviceType: "Egocentric (first-person) video data acquisition, annotation and narration for physical AI",
        provider: { "@id": org },
        description: c.hero.sentence,
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE}/#questions`,
        mainEntity: c.questions.items.map((i) => ({
          "@type": "Question",
          name: i.q,
          acceptedAnswer: { "@type": "Answer", text: i.a },
        })),
      },
    ],
  };
}

export function sitemap(date) {
  const urls = [`${SITE}/`, `${SITE}/privacy/`];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${date}</lastmod></url>`).join("\n")}
</urlset>
`;
}

export function llms(c) {
  return `# ${c.site.name}

> ${c.site.name} executes egocentric (first-person) video data-acquisition programmes for physical AI: wearable capture rigs, trained recorders, and in-house IT, annotation, narration and quality-control teams. Engagements are invoiced solely on approved hours.

Key facts:
- ${c.experience.figure} ${c.experience.unit} ${c.experience.caption}
- Recorded on site across some seventy operational environments.
- Capture rigs: ${c.rigs.items.map((r) => r.name).join("; ")}. ${c.rigs.shared}
- Layers produced: scene descriptions, temporally aligned subtitles and voice-over, to the client's guidelines.
- Quality control: AI-generated quality score on every submission; QC reviewers adjudicate low scores and audit one approval in ten.
- Delivery: numbered batches with a manifest (duration, size, MD5 checksum per file) and a verification script, through an authenticated client portal.

## Website
- [Home](${SITE}/): overview of the capture capability
- [Methodology](${SITE}/#methodology): the seven stages from scoping to delivery
- [Capture rigs](${SITE}/#rigs): rig specifications
- [Deliverables](${SITE}/#deliverables): what each delivery batch contains
- [Invoicing](${SITE}/#invoicing): invoicing on approved hours
- [Representative samples](${SITE}/#samples): approximately one hour from each of 69 operational environments
- [Questions](${SITE}/#questions): answers to questions asked before commissioning
- [Full text](${SITE}/llms-full.txt): the complete site content in plain text

## Contact
- [Email ${c.site.email}](mailto:${c.site.email}): capture programme enquiries

## Optional
- [Privacy notice](${SITE}/privacy/)
- [Security contact](${SITE}/.well-known/security.txt)
`;
}

export function llmsFull(c) {
  const lines = [];
  const h = (t) => lines.push("", `## ${t}`, "");
  lines.push(`# ${c.site.name}`, "", `> ${c.hero.title}`, "", c.hero.sentence);
  h("Experience");
  lines.push(c.experience.title, "", `${c.experience.figure} ${c.experience.unit} ${c.experience.caption} ${c.experience.source}`, "");
  for (const g of c.experience.sectors) lines.push(`- ${g.sector}: ${g.types.join(", ")}`);
  h("Methodology");
  lines.push(c.methodology.title, "");
  c.methodology.steps.forEach((s, i) => lines.push(`${i + 1}. ${s.role}: ${s.text}`));
  h("In-house IT");
  lines.push(c.itTeam.title, "", c.itTeam.sentence, "");
  for (const i of c.itTeam.items) lines.push(`- ${i.title}: ${i.text}`);
  h("Capture rigs");
  lines.push(c.rigs.title, "");
  for (const r of c.rigs.items) lines.push(`- ${r.name} (mount: ${r.mount}; vantage: ${r.vantage}): ${r.notes}`);
  lines.push("", c.rigs.shared);
  h("Deliverables");
  lines.push(c.deliverables.title, "", c.deliverables.sentence, "");
  for (const r of c.deliverables.rows) lines.push(`- ${r.term}: ${r.detail}`);
  h("Invoicing");
  lines.push(c.billing.title, "", c.billing.sentence, "");
  for (const s of c.billing.states) lines.push(`- ${s}: ${c.billing.notes[s]}`);
  h("Assurance");
  lines.push(c.assurance.title, "");
  for (const i of c.assurance.items) lines.push(`- ${i.title}: ${i.text}`);
  h("Representative samples");
  lines.push(c.samplesSection.title, "", c.samplesSection.sentence, "");
  for (const s of c.samples) lines.push(`- [${s.title}](${s.href}): ${s.text}`);
  h("Questions");
  for (const i of c.questions.items) lines.push(`### ${i.q}`, "", i.a, "");
  h("Contact");
  lines.push(c.contact.title, "", c.contact.sentence, "", `Email: ${c.site.email}`);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}
