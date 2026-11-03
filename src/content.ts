// All copy and links for the site live here, so they can be edited without touching layout.
// Register: formal and technical, at the owner's request. The site presents SankhyaData's
// capability to run capture projects; it never offers data for sale.

export const site = {
  name: "SankhyaData",
  email: "hello@sankhyadata.com",
  description:
    "SankhyaData executes egocentric data-acquisition programmes end to end: wearable capture rigs, trained recorders, and in-house annotation, narration, quality-control and IT teams. Engagements are invoiced solely on approved hours.",
};

export const nav = [
  { label: "Experience", href: "#experience" },
  { label: "Methodology", href: "#methodology" },
  { label: "Invoicing", href: "#invoicing" },
  { label: "Samples", href: "#samples" },
];

export const hero = {
  title: "Egocentric data acquisition, executed end to end.",
  sentence:
    "We deploy wearable capture rigs and trained recorders, supported by in-house annotation, narration and quality-control teams. Engagements are invoiced solely on approved hours.",
  primary: { label: "View representative samples", href: "#samples" },
  secondary: { label: "Discuss a project", href: "#contact" },
  frame: {
    alt: "A potter's hands shaping clay on a spinning wheel (illustrative frame, not SankhyaData footage).",
    narration: "Pressing in with both thumbs to narrow the neck.",
    caption: "Illustrative frame showing each layer we produce.",
  },
};

export const experience = {
  title: "Field-proven across seventy operational environments.",
  figure: "50,000+",
  unit: "hours",
  caption: "of egocentric footage acquired and processed by our teams in authentic working conditions.",
  specs: [
    { term: "Capture format", detail: "1080p at 30 fps, HEVC (H.265)" },
    { term: "Representative samples", detail: "One hour per operational environment" },
    { term: "Data organisation", detail: "By environment, capture site and date" },
  ],
  listLabel: "Examples of operational environments captured",
  types: [
    "Agriculture farm",
    "Appliance repair",
    "Auto repair",
    "Bicycle repair",
    "Bread bakery",
    "Building materials manufacturing",
    "Cake shop",
    "Car detailing",
    "Metal fabrication",
  ],
};

export const methodology = {
  title: "One accountable team, from instrumentation to delivery.",
  steps: [
    {
      role: "Instrumentation",
      text: "Capture rigs are provisioned, configured and charged before deployment, then fitted to each recorder and task.",
    },
    {
      role: "Acquisition",
      text: "Trained recorders perform the specified tasks in situ, producing continuous first-person footage of authentic workflows.",
    },
    {
      role: "Annotation",
      text: "Our annotators author scene descriptions and temporally aligned subtitles in strict conformance with the client's guidelines.",
    },
    {
      role: "Narration",
      text: "Our narrators record a voice-over for every scene on active noise-cancelling headsets, following microphone and ambient-noise calibration.",
    },
    {
      role: "Quality control",
      text: "Each submission receives an automated quality score; our QC reviewers adjudicate low-scoring items and audit one approval in ten.",
    },
  ],
};

export const itTeam = {
  title: "An in-house IT function underpins every engagement.",
  sentence: "Devices, infrastructure and data custody are administered entirely by our own engineers.",
  items: [
    { title: "Device provisioning", text: "Configuration, software updates, charging regimes and spare inventory for every rig." },
    { title: "Site readiness", text: "Network, power and local storage commissioned before the first take." },
    { title: "Data custody", text: "Secure ingestion into managed storage, with verified nightly backups and tamper-evident audit records." },
    { title: "Client portal", text: "Authenticated access to review queues and delivery batches." },
  ],
};

export const rigs = {
  title: "Capture rigs proven in the field.",
  items: [
    {
      name: "Head-mounted iPhone",
      vantage: "Eye level",
      text: "Stable eye-level capture, complemented by the handset's inertial sensors.",
    },
    {
      name: "Cap-mounted mobile",
      vantage: "Brow level",
      text: "A smartphone affixed to the brim of a cap; unobtrusive across a full working shift.",
    },
    {
      name: "Pocket-held mobile",
      vantage: "Chest level",
      text: "A phone carried in a shirt pocket with the lens exposed, yielding a natural torso-level perspective.",
    },
    {
      name: "Human rigs",
      vantage: "Head-worn",
      text: "Purpose-built wearable rigs and our preferred configuration for steady, hands-free acquisition.",
    },
  ],
};

export const billing = {
  title: "Invoicing is contingent on approved hours.",
  sentence:
    "Each recorded hour is assessed against the agreed specification. Only conforming hours are counted, invoiced and delivered.",
  states: ["Recorded", "Reviewed", "Approved", "Delivered"],
  notes: {
    Approved: "The sole basis of invoicing",
    Delivered: "In numbered batches with a checksum manifest",
  } as Record<string, string>,
};

export const samplesSection = {
  title: "Representative recordings.",
  sentence: "A curated hour from each operational environment, illustrating our capture standard. Hosted on Google Drive.",
};

/**
 * Google Drive folders with sample recordings, shown as rows in the Samples section.
 * Each folder must be set to "Anyone with the link can view".
 */
export const samples: { title: string; text: string; href: string }[] = [
  {
    title: "Representative capture set",
    text: "163 recordings, approximately 66 hours, spanning 69 operational environments.",
    href: "https://drive.google.com/drive/folders/1rkpSmdg9qPHSHGtRoVYuPVcDalpMD1Js",
  },
];

export const contact = {
  title: "Commission a capture programme.",
  sentence:
    "Share your task taxonomy, target environments and required hours. We will respond with a scoped capture plan and representative samples.",
  button: "Write to",
};

export const footer = {
  tagline: "Egocentric data acquisition, annotation and narration, delivered by in-house teams.",
};

export const credits = {
  frame: {
    text: "Illustrative frame: Pottery workshop at Odisha Crafts Museum, by Kritzolina",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Pottery_workshop_at_Odisha_Crafts_Museum_02.jpg",
    licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};
