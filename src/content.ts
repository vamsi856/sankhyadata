// All copy and links for the site live here, so they can be edited without touching layout.
// Register: formal and technical, at the owner's request. The site presents SankhyaData's
// capability to run capture programmes; it never offers data for sale. Every statement must
// be supported by the owner's own records (see CLAUDE.md).

export const site = {
  name: "SankhyaData",
  email: "contact@sankhyadata.com",
  url: "https://sankhyadata.com/",
  description:
    "Egocentric video acquisition for physical AI: capture rigs, trained recorders and in-house annotation, narration, QC and IT teams. Invoiced on approved hours.",
};

/** The phone menu button's accessible name. */
export const menuLabel = "Sections";

export const nav = [
  { label: "Methodology", href: "#methodology" },
  { label: "Deliverables", href: "#deliverables" },
  { label: "Invoicing", href: "#invoicing" },
  { label: "Samples", href: "#samples" },
  { label: "Questions", href: "#questions" },
];

export const headerCta = { label: "Make an enquiry", href: "#contact" };

/** Islands import these small pieces directly, so the rest of the copy stays out of the browser bundle. */
export const heroFrame = {
  alt: "Hands shaping clay on a potter’s wheel (illustrative stand-in image, not SankhyaData footage).",
  narration: "Pressing in with both thumbs to narrow the neck.",
  caption: "Illustrative stand-in image, not SankhyaData footage; annotation, narration and recorder HUD shown schematically.",
  hud: { rec: "REC", spec: "1080p · 30 fps · HEVC" },
};

export const hero = {
  title: "Egocentric video data acquisition, executed end to end.",
  sentence:
    "For physical-AI programmes, we deploy trained recorders on site with wearable capture rigs, our own or yours. They capture day-to-day work or perform the tasks you specify, supported by in-house IT, annotation, narration and quality-control teams. Engagements are invoiced solely on approved hours.",
  primary: { label: "View representative samples", href: "#samples" },
  secondary: { label: "Discuss a capture programme", href: "#contact" },
  frame: heroFrame,
};

export const hoursUnitLabel = "One point · ten hours";
export const hoursCaption =
  "Schematic: each point stands for ten hours of the 50,000 handled.";

export const experience = {
  title: "On-site capture across some seventy operational environments.",
  figure: "50,000+",
  unit: "hours",
  caption: "of egocentric footage handled by our teams, recorded on site during day-to-day operations.",
  capacity: {
    figure: "2,000",
    unit: "approved hours a week",
    caption: "deliverable through our field contributor network.",
  },
  source: "Figures from our own records.",
  listLabel: "Examples from some seventy operational environments, by sector",
  sectors: [
    { sector: "Repair and servicing", types: ["Appliance repair", "Bicycle repair", "Car detailing", "Car repair"] },
    { sector: "Food production", types: ["Bread bakery", "Cake shop"] },
    { sector: "Manufacturing", types: ["Building materials manufacturing", "Metal fabrication"] },
    { sector: "Agriculture", types: ["Agricultural farm"] },
  ],
};

export const perspective = {
  title: "Every hour is a path through a real place.",
  sentence:
    "A recorder moves through the capture site, and the camera records what the recorder sees. Scroll, and the view passes from the site into the recorder’s own eyes.",
  caption: "Schematic: a recorder’s head trajectory and camera field of view in a workshop, drawn as a point cloud.",
  cue: "Scroll",
};

export const stepRoles = ["Scoping", "Instrumentation", "Acquisition", "Annotation", "Narration", "Quality control", "Delivery"];

export const methodology = {
  title: "One accountable team, from scoping to delivery.",
  steps: [
    {
      role: stepRoles[0],
      text: "We translate your task taxonomy, target operational environments and required hours into a scoped capture plan.",
    },
    {
      role: stepRoles[1],
      text: "Capture rigs, our own or client-supplied, are provisioned by our in-house IT team before deployment, then fitted to each recorder and task.",
    },
    {
      role: stepRoles[2],
      text: "Trained recorders capture first-person footage of real work in situ, or perform the tasks the client scripts, across the operational environments the client specifies.",
    },
    {
      role: stepRoles[3],
      text: "Our annotators author scene descriptions and temporally aligned subtitles in strict conformance with the client’s guidelines.",
    },
    {
      role: stepRoles[4],
      text: "Our narrators record the scene descriptions and subtitles wearing active noise-cancelling headphones, after a microphone and ambient-noise check.",
    },
    {
      role: stepRoles[5],
      text: "Each submission receives an AI-generated quality score; our quality-control (QC) reviewers adjudicate low-scoring items and audit one approval in ten.",
    },
    {
      role: stepRoles[6],
      text: "Approved hours are released in numbered batches through the authenticated client portal, each with a checksum manifest and a verification script.",
    },
  ],
};

export const fieldLegend = ["IT hub", "Capture site", "IT at work"];
export const fieldCaption = "Schematic: sites and timings are illustrative.";

export const itTitles = ["Device provisioning", "Site readiness", "Client portal", "Immediate field support"];

export const itTeam = {
  title: "An in-house IT function underpins every engagement.",
  legend: fieldLegend,
  fieldCaption,
  sentence: "Our own IT engineers provision every device, prepare each capture site and stand by to assist field officers and recorders the moment an issue arises.",
  items: [
    { title: itTitles[0], text: "Every rig is configured, updated and charged by our IT staff before deployment." },
    { title: itTitles[1], text: "Each capture site is prepared and checked by our IT staff before recording begins." },
    { title: itTitles[2], text: "Authenticated access to review queues and delivery batches." },
    { title: itTitles[3], text: "Our IT team is on call to field officers throughout every capture session, resolving device and recording issues at once, on site or remotely." },
  ],
};

export const rigBrief = [
  { name: "Head-mounted iPhone", vantage: "Eye level" },
  { name: "Cap camera, power bank", vantage: "Brow level" },
  { name: "Cap camera, phone in pocket", vantage: "Brow level" },
  { name: "Human rig", vantage: "Per task" },
];
export const rigInsetLabel = "Rig camera";
export const rigViewerCaption = "Schematic: where each rig sits and what its camera sees. Scroll through the rigs, or select one, to fit it.";

export const rigs = {
  title: "Four capture rigs, each fitted to the recorder and the task.",
  columns: ["Rig", "Mount", "Vantage", "Notes"],
  viewerCaption: rigViewerCaption,
  items: [
    {
      name: rigBrief[0].name,
      mount: "Head mount",
      vantage: rigBrief[0].vantage,
      notes: "Records along the recorder’s line of sight.",
    },
    {
      name: rigBrief[1].name,
      mount: "Camera on the cap, powered by a power bank",
      vantage: rigBrief[1].vantage,
      notes: "Records from just above the recorder’s eyeline.",
    },
    {
      name: rigBrief[2].name,
      mount: "Camera on the cap, USB-C to the phone",
      vantage: rigBrief[2].vantage,
      notes: "The cap camera connects by USB-C to a smartphone in the recorder’s pocket, which records through the capture app.",
    },
    {
      name: rigBrief[3].name,
      mount: "Wearable rig",
      vantage: rigBrief[3].vantage,
      notes: "Our preferred configuration, deployed wherever the task permits.",
    },
  ],
  optionsLabel: "Two further arrangements, available on request",
  options: [
    {
      title: "Client-supplied devices",
      text: "Where a programme specifies its own capture hardware, such as smart glasses or a proprietary head rig, we take custody of the client’s devices. Our IT team provisions and maintains them for the duration of the engagement, and our recorders capture with them under the same methodology and quality control. Our teams have worked with established capture and recording platforms.",
    },
    {
      title: "Directed tasks",
      text: "Beyond footage of day-to-day work, our recorders perform the specific tasks a client scripts, in the environments it specifies, so that every approved hour falls within the task taxonomy.",
    },
  ],
  shared: "Our rigs record 1080p at 30 fps, encoded in HEVC (H.265), and are provisioned by our in-house IT team.",
};

export const deliverableTerms = ["Video", "Scene descriptions", "Subtitles", "Voice-over", "Organisation", "Manifest", "Verification"];

export const deliverables = {
  title: "What each delivery batch contains.",
  sentence: "Batches are numbered and released through the authenticated client portal.",
  end: "Released as a numbered batch through the client portal",
  rows: [
    { term: deliverableTerms[0], detail: "First-person footage, 1080p at 30 fps, HEVC (H.265)" },
    { term: deliverableTerms[1], detail: "Authored by our annotators in strict conformance with the client’s guidelines" },
    { term: deliverableTerms[2], detail: "Temporally aligned to the footage" },
    { term: deliverableTerms[3], detail: "Recorded by our narrators for every scene" },
    { term: deliverableTerms[4], detail: "By operational environment, capture site and date" },
    { term: deliverableTerms[5], detail: "Duration, size and MD5 checksum for every file" },
    { term: deliverableTerms[6], detail: "A verification script supplied with every batch" },
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

export const samplesWallCaption =
  "Schematic: the representative set, one tile per operational environment (69 in all). Named tiles are examples; interiors are abstract, not footage.";

export const samplesSection = {
  title: "About one representative hour from each operational environment.",
  sentence: "Review our capture standard before commissioning: raw first-person recordings with their metadata, viewable in the browser through our samples viewer.",
  open: "Open the samples viewer",
  next: { label: "Then send us your brief", href: "#contact" },
  wallCaption: samplesWallCaption,
};

/**
 * Sample recordings, shown as rows in the Samples section. The link opens the samples
 * viewer (served at samples.sankhyadata.com) and signs the visitor in to view-only access.
 */
export const samples: { title: string; text: string; href: string }[] = [
  {
    title: "Sample folder",
    text: "163 recordings, approximately 66 hours, spanning 69 operational environments.",
    href: "https://samples.sankhyadata.com/l/VmsbjbIHfe7fT6LKe_cTCkFyJBU8orNO",
  },
];

export const questions = {
  title: "Questions asked before commissioning.",
  items: [
    {
      q: "What does a capture programme include?",
      a: "Wearable capture rigs (our own or client-supplied), trained recorders performing day-to-day work or directed tasks, and our in-house annotation, narration, quality-control and IT teams, from scoping to delivery.",
    },
    {
      q: "Which capture rigs do you deploy?",
      a: "Four rigs: a head-mounted iPhone; a cap camera powered by a power bank; a cap camera connected by USB-C to a phone in the pocket, which records through the capture app; and the human rig, our preferred configuration. All record 1080p at 30 fps, encoded in HEVC (H.265).",
    },
    {
      q: "Can you capture with our own devices?",
      a: "Yes. We take custody of client-supplied devices; our IT team provisions and maintains them, and our recorders capture with them under the same methodology and quality control as our own rigs.",
    },
    {
      q: "Can you work with our recording platform?",
      a: "Yes. Our teams have experience with established capture and recording platforms, and our IT team prepares devices and recorders for the platform a programme specifies.",
    },
    {
      q: "What happens if a device fails in the field?",
      a: "Our IT team is on call to field officers throughout every capture session and resolves device and recording issues at once, on site or remotely.",
    },
    {
      q: "Can your recorders perform tasks we specify?",
      a: "Yes. In addition to recording day-to-day work, our recorders perform the tasks you script, in the operational environments you specify.",
    },
    {
      q: "What volume can you deliver?",
      a: "Through our field contributor network, we can deliver 2,000 approved hours a week. Only hours that pass quality control are counted, invoiced and delivered.",
    },
    {
      q: "In which environments is footage recorded?",
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
      a: "Yes. Our representative set holds approximately one hour from each of 69 operational environments, viewable in the browser through our samples viewer.",
    },
    {
      q: "How does an engagement begin?",
      a: "Write to contact@sankhyadata.com with your task taxonomy, target operational environments and required hours. We respond with a scoped capture plan and representative samples.",
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
    "Preferred capture rig (head-mounted iPhone, cap camera with power bank, cap camera with phone in pocket, human rig, or client-supplied devices):",
    "Capture mode (day-to-day work / directed tasks):",
    "Layers required (scene descriptions, subtitles, voice-over):",
    "Annotation guidelines available (yes / no):",
  ],
};

export const footer = {
  tagline: "Egocentric video data acquisition by trained recorders; annotation, narration, quality control and IT by our in-house teams.",
  privacy: { label: "Privacy notice", href: "privacy/" },
  security: { label: "Security contact", href: "/.well-known/security.txt" },
  note: "This site sets no cookies and loads nothing from other domains.",
  newTab: "(opens in a new tab)",
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
      body: "If you contact us at contact@sankhyadata.com, we use your message and contact details solely to respond to you and to discuss the engagement you enquire about.",
    },
    {
      heading: "Hosting and email",
      body: "The website is served from a cloud server, used solely for this website, operated by Hetzner Online in Ashburn, Virginia (United States). Email to sankhyadata.com addresses is hosted by Hostinger. The link to representative recordings opens our samples viewer at samples.sankhyadata.com, which sets a session cookie solely to grant view-only access.",
    },
    {
      heading: "Your requests",
      body: "To ask what information you have sent us, or to have it deleted, write to contact@sankhyadata.com.",
    },
  ],
};

export const notFound = {
  title: "This page does not exist.",
  sentence: "The address may be mistyped, or the page may have moved.",
  link: { label: "Return to the SankhyaData home page", href: "/" },
  frame: { status: "No signal", timecode: "--:--:--" },
};

export const credits = {
  frame: {
    text: "Illustrative stand-in image: “Pottery workshop at Odisha Crafts Museum” by Kritzolina, Wikimedia Commons, resized and colour-adjusted",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Pottery_workshop_at_Odisha_Crafts_Museum_02.jpg",
    licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};
