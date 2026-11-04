// All copy and links for the site live here, so they can be edited without touching layout.
// Register: formal and technical, at the owner's request. The site presents SankhyaData's
// capability to run capture programmes; it never offers data for sale. Every statement must
// be supported by the owner's own records (see CLAUDE.md).

export const site = {
  name: "SankhyaData",
  email: "hello@sankhyadata.com",
  url: "https://sankhyadata.com/",
  description:
    "Egocentric video acquisition for physical AI: capture rigs, trained recorders and in-house annotation, narration, QC and IT teams. Invoiced on approved hours.",
};

export const nav = [
  { label: "Methodology", href: "#methodology" },
  { label: "Deliverables", href: "#deliverables" },
  { label: "Invoicing", href: "#invoicing" },
  { label: "Samples", href: "#samples" },
  { label: "Questions", href: "#questions" },
];

export const headerCta = { label: "Make an enquiry", href: "#contact" };

export const hero = {
  title: "Egocentric video data acquisition, executed end to end.",
  sentence:
    "For physical-AI programmes, we deploy wearable capture rigs and trained recorders on site, supported by in-house IT, annotation, narration and quality-control teams. Engagements are invoiced solely on approved hours.",
  primary: { label: "View representative samples", href: "#samples" },
  secondary: { label: "Discuss a capture programme", href: "#contact" },
  frame: {
    alt: "Hands shaping clay on a potter’s wheel (illustrative stand-in image, not SankhyaData footage).",
    narration: "Pressing in with both thumbs to narrow the neck.",
    caption: "Illustrative stand-in image, not SankhyaData footage; annotation and narration shown schematically.",
  },
};

export const experience = {
  title: "On-site capture across some seventy operational environments.",
  figure: "50,000+",
  unit: "hours",
  caption: "of egocentric footage handled by our teams, recorded on site during day-to-day operations.",
  source: "Figures from our own records.",
  listLabel: "Examples from some seventy operational environments, by sector",
  sectors: [
    { sector: "Repair and servicing", types: ["Appliance repair", "Bicycle repair", "Car detailing", "Car repair"] },
    { sector: "Food production", types: ["Bread bakery", "Cake shop"] },
    { sector: "Manufacturing", types: ["Building materials manufacturing", "Metal fabrication"] },
    { sector: "Agriculture", types: ["Agricultural farm"] },
  ],
};

export const methodology = {
  title: "One accountable team, from scoping to delivery.",
  steps: [
    {
      role: "Scoping",
      text: "We translate your task taxonomy, target operational environments and required hours into a scoped capture plan.",
    },
    {
      role: "Instrumentation",
      text: "Capture rigs are provisioned by our in-house IT team before deployment, then fitted to each recorder and task.",
    },
    {
      role: "Acquisition",
      text: "Trained recorders capture first-person footage of real work in situ, across the operational environments the client specifies.",
    },
    {
      role: "Annotation",
      text: "Our annotators author scene descriptions and temporally aligned subtitles in strict conformance with the client’s guidelines.",
    },
    {
      role: "Narration",
      text: "Our narrators voice the scene descriptions and subtitles on active noise-cancelling (ANC) headphones, following a microphone and ambient-noise check.",
    },
    {
      role: "Quality control",
      text: "Each submission receives an AI-generated quality score; our quality-control (QC) reviewers adjudicate low-scoring items and audit one approval in ten.",
    },
    {
      role: "Delivery",
      text: "Approved hours are released in numbered batches through the authenticated client portal, each with a checksum manifest and a verification script.",
    },
  ],
};

export const itTeam = {
  title: "An in-house IT function underpins every engagement.",
  sentence: "Our own IT engineers provision every device, prepare each capture site and support recorders in the field.",
  items: [
    { title: "Device provisioning", text: "Every rig is configured, updated and charged by our IT staff before deployment." },
    { title: "Site readiness", text: "Each capture site is prepared and checked by our IT staff before recording begins." },
    { title: "Client portal", text: "Authenticated access to review queues and delivery batches." },
    { title: "Field support", text: "Technical assistance for recorders throughout each engagement, on site or remotely." },
  ],
};

export const rigs = {
  title: "Four capture rigs, each fitted to the recorder and the task.",
  columns: ["Rig", "Mount", "Vantage", "Notes"],
  items: [
    {
      name: "Head-mounted iPhone",
      mount: "Head mount",
      vantage: "Eye level",
      notes: "Records along the recorder’s line of sight.",
    },
    {
      name: "Cap-mounted mobile",
      mount: "Brim of a cap",
      vantage: "Brow level",
      notes: "Records from just above the recorder’s eyeline.",
    },
    {
      name: "Pocket-held mobile",
      mount: "Shirt pocket, lens exposed",
      vantage: "Chest level",
      notes: "Records a torso-level view of the work.",
    },
    {
      name: "Human rig",
      mount: "Wearable rig",
      vantage: "Per task",
      notes: "Our preferred configuration, deployed wherever the task permits.",
    },
  ],
  shared: "All rigs record 1080p at 30 fps, encoded in HEVC (H.265), and are provisioned by our in-house IT team.",
};

export const deliverables = {
  title: "What each delivery batch contains.",
  sentence: "Batches are numbered and released through the authenticated client portal.",
  rows: [
    { term: "Video", detail: "First-person footage, 1080p at 30 fps, HEVC (H.265)" },
    { term: "Scene descriptions", detail: "Authored by our annotators in strict conformance with the client’s guidelines" },
    { term: "Subtitles", detail: "Temporally aligned to the footage" },
    { term: "Voice-over", detail: "Recorded by our narrators for every scene" },
    { term: "Organisation", detail: "By operational environment, capture site and date" },
    { term: "Manifest", detail: "Duration, size and MD5 checksum for every file" },
    { term: "Verification", detail: "A verification script supplied with every batch" },
  ],
};

export const billing = {
  title: "Invoicing is contingent on approved hours.",
  sentence:
    "Each recorded hour is reviewed against the agreed specification. Only approved hours are counted, invoiced and delivered.",
  states: ["Recorded", "Reviewed", "Approved", "Delivered"],
  notes: {
    Recorded: "Captured on site",
    Reviewed: "AI quality score, then QC adjudication",
    Approved: "Counted and invoiced",
    Delivered: "In numbered batches with a checksum manifest",
  } as Record<string, string>,
};

export const assurance = {
  title: "Footage is held in confidence and delivered with verifiable integrity.",
  items: [
    {
      title: "Confidential handling",
      text: "Client footage is handled as confidential material; clients access it only through authenticated portal accounts.",
    },
    {
      title: "Verifiable delivery",
      text: "Every batch ships with a manifest recording each file’s duration, size and MD5 checksum, together with a verification script.",
    },
    {
      title: "Durable custody",
      text: "Stored footage is protected by verified nightly backups.",
    },
    {
      title: "Audit trail",
      text: "The handling of client footage is documented in tamper-evident audit records.",
    },
  ],
};

export const samplesSection = {
  title: "One representative hour from each operational environment.",
  sentence: "Review our capture standard before commissioning: raw first-person recordings, shared through a Google Drive folder.",
  next: { label: "Then send us your brief", href: "#contact" },
};

/**
 * Google Drive folders with sample recordings, shown as rows in the Samples section.
 * Each folder must be set to "Anyone with the link can view".
 */
export const samples: { title: string; text: string; href: string }[] = [
  {
    title: "Sample folder",
    text: "163 recordings, approximately 66 hours, spanning 69 operational environments.",
    href: "https://drive.google.com/drive/folders/1rkpSmdg9qPHSHGtRoVYuPVcDalpMD1Js",
  },
];

export const questions = {
  title: "Questions asked before commissioning.",
  items: [
    {
      q: "What does a capture programme include?",
      a: "Wearable capture rigs, trained recorders, and our in-house annotation, narration, quality-control and IT teams, from scoping to delivery.",
    },
    {
      q: "Which capture rigs do you deploy?",
      a: "Head-mounted iPhones, cap-mounted mobiles, pocket-held mobiles and human rigs, our preferred configuration. All record 1080p at 30 fps, encoded in HEVC (H.265).",
    },
    {
      q: "Where is footage recorded?",
      a: "On site, during day-to-day operations, across some seventy operational environments, from agricultural farms to metal fabrication.",
    },
    {
      q: "Which layers do you produce?",
      a: "Scene descriptions and temporally aligned subtitles, authored by our annotators to your guidelines, and a voice-over recorded by our narrators for every scene.",
    },
    {
      q: "How is an hour approved?",
      a: "Every submission receives an AI-generated quality score. Our QC reviewers adjudicate low-scoring items and audit one approval in ten. Only approved hours are counted, invoiced and delivered.",
    },
    {
      q: "How can we verify a delivery?",
      a: "Each numbered batch carries a manifest recording every file’s duration, size and MD5 checksum, together with a verification script that checks each file against it.",
    },
    {
      q: "Can we review footage before commissioning?",
      a: "Yes. Our representative set holds approximately one hour from each of 69 operational environments, shared through a Google Drive folder.",
    },
    {
      q: "How does an engagement begin?",
      a: "Write to hello@sankhyadata.com with your task taxonomy, target operational environments and required hours. We respond with a scoped capture plan and representative samples.",
    },
  ],
};

export const contact = {
  title: "Commission a capture programme.",
  sentence:
    "Send us your task taxonomy, target operational environments and required hours. We will respond with a scoped capture plan and representative samples.",
  button: "Write to",
  subject: "Capture programme enquiry",
  brief: [
    "Organisation:",
    "Task taxonomy:",
    "Target operational environments:",
    "Required approved hours:",
    "Preferred capture rig (head-mounted iPhone, cap-mounted mobile, pocket-held mobile, human rig):",
    "Layers required (scene descriptions, subtitles, voice-over):",
    "Annotation guidelines available (yes / no):",
  ],
};

export const footer = {
  tagline: "Egocentric data acquisition, annotation, narration and quality control, performed by our in-house teams.",
  privacy: { label: "Privacy notice", href: "privacy/" },
  security: { label: "Security contact", href: ".well-known/security.txt" },
  note: "This site sets no cookies and loads nothing from other domains.",
};

export const privacy = {
  title: "Privacy notice",
  description:
    "How the SankhyaData website handles information: no cookies, analytics or tracking, no access logs, and email used solely to respond to enquiries.",
  updated: "4 November 2026",
  sections: [
    {
      heading: "What this website collects",
      body: "This website sets no cookies and uses no analytics, advertising or tracking technologies. It loads nothing from other domains: fonts and images are served from the same server as the pages. Your IP address is processed only to deliver each page, and the web server keeps no access logs.",
    },
    {
      heading: "When you write to us",
      body: "If you contact us at hello@sankhyadata.com, we use your message and contact details solely to respond to you and to discuss the engagement you enquire about.",
    },
    {
      heading: "Hosting and email",
      body: "The website is served from a cloud server, used solely for this website, operated by Hetzner Online in Ashburn, Virginia (United States). Email to sankhyadata.com addresses is hosted by Hostinger. Links to representative recordings open Google Drive, which is governed by Google’s own privacy policy.",
    },
    {
      heading: "Your requests",
      body: "To ask what information you have sent us, or to have it deleted, write to hello@sankhyadata.com.",
    },
  ],
};

export const notFound = {
  title: "This page does not exist.",
  sentence: "The address may be mistyped, or the page may have moved.",
  link: { label: "Return to the SankhyaData home page", href: "/" },
};

export const credits = {
  frame: {
    text: "Illustrative stand-in image: “Pottery workshop at Odisha Crafts Museum” by Kritzolina, Wikimedia Commons, resized and colour-adjusted",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Pottery_workshop_at_Odisha_Crafts_Museum_02.jpg",
    licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};
