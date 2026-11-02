// All copy and links for the site live here, so they can be edited without touching layout.
// Facts come from the team's own operations notes (library size, process, delivery format).

export const site = {
  name: "SankhyaData",
  email: "hello@sankhyadata.com",
  description:
    "SankhyaData records first-person video of real work for physical AI: 15,000+ hours across 70 business types. We supply the devices, recorders, annotators, narrators and IT support, and bill on approved hours.",
};

export const nav = [
  { label: "Library", href: "#library" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Billing", href: "#billing" },
  { label: "Samples", href: "#samples" },
];

export const hero = {
  title: "Egocentric data from real hands at work.",
  sentence: "We bring the devices and the crew. You pay for approved hours.",
  primary: { label: "See sample data", href: "#samples" },
  secondary: { label: "Talk to us", href: "#contact" },
  frame: {
    alt: "A potter's hands shaping clay on a spinning wheel (example frame, not SankhyaData footage).",
    narration: "Pressing in with both thumbs to narrow the neck.",
  },
};

export const library = {
  title: "Seventy kinds of workplace, one camera angle: the worker’s own.",
  figure: "15,000+",
  unit: "hours",
  caption: "of first-person video from 70 business types, recorded on site where the work happens.",
  specs: [
    { term: "Video", detail: "1080p at 30 fps, HEVC originals" },
    { term: "Samples", detail: "One hour for every business type" },
    { term: "Organised by", detail: "Business type, recording centre and date" },
  ],
  // Examples from the library's business types.
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

export const steps = [
  {
    role: "Devices",
    text: "We ship the capture kit, set up and charged.",
  },
  {
    role: "Recorders",
    text: "Recorders wear the rigs and film real work where it happens.",
  },
  {
    role: "Annotators",
    text: "Annotators write scene descriptions and subtitles to your guidelines.",
  },
  {
    role: "Narrators",
    text: "Narrators voice each scene in ANC headphones, after a microphone and room check.",
  },
  {
    role: "Review",
    text: "Every submission gets an AI quality score. A QC reviewer takes the low scores and spot-checks one approval in ten.",
  },
];

export const itTeam = {
  title: "Our own IT team keeps the field running.",
  sentence: "Recorders record. Everything around them is handled in-house.",
  items: [
    { title: "Devices", text: "Setup, updates, charging and spares for every rig." },
    { title: "Environment", text: "Network, power and storage ready before the first take." },
    { title: "Storage", text: "Secure uploads, with verified nightly backups." },
    { title: "Client portal", text: "Review and deliveries behind your own login." },
  ],
};

export const rigs = [
  {
    name: "Head-mounted iPhone",
    text: "Eye-level video plus the phone’s motion sensors.",
  },
  {
    name: "Cap camera",
    text: "Light enough for a full shift.",
  },
  {
    name: "Head strap",
    text: "Centred at the forehead for hands-busy work.",
  },
];

export const billing = {
  title: "You are billed for approved hours.",
  sentence:
    "Every recorded hour is reviewed against your specification. Only hours that pass are counted, billed and delivered.",
  states: ["Recorded", "Reviewed", "Approved", "Delivered"],
  notes: { Approved: "What you are billed for", Delivered: "In numbered batches with a checksum manifest" } as Record<string, string>,
};

/**
 * Google Drive folders with sample recordings, shown as rows in the Samples section.
 * Set each folder to "Anyone with the link can view" first, then add it here, e.g.
 *   { title: "One hour per business type", text: "Raw first-person video, 1080p", href: "https://drive.google.com/drive/folders/..." },
 * While this list is empty the section shows an "Ask for access" email link instead.
 */
export const samples: { title: string; text: string; href: string }[] = [
  {
    title: "One hour per business type",
    text: "163 raw first-person videos, about 66 hours across 69 business types.",
    href: "https://drive.google.com/drive/folders/1rkpSmdg9qPHSHGtRoVYuPVcDalpMD1Js",
  },
];

export const contact = {
  title: "Tell us what to record.",
  sentence: "Send your task list and the hours you need. We reply with a capture plan and samples.",
};

export const credits = {
  frame: {
    text: "Example frame: Pottery workshop at Odisha Crafts Museum, by Kritzolina",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Pottery_workshop_at_Odisha_Crafts_Museum_02.jpg",
    licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};
