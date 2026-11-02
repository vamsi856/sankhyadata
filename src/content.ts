// All copy and links for the site live here, so they can be edited without touching layout.

export const site = {
  name: "SankhyaData",
  email: "hello@sankhyadata.com",
  description:
    "SankhyaData records egocentric (first-person) video for physical AI. We supply the devices, recorders, annotators, narrators and IT support, and bill on approved hours.",
};

export const nav = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Rigs", href: "#rigs" },
  { label: "Billing", href: "#billing" },
  { label: "Samples", href: "#samples" },
];

export const hero = {
  title: "Egocentric data from real hands at work.",
  sentence: "We bring the devices and the crew. You pay for approved hours.",
  primary: { label: "See sample data", href: "#samples" },
  secondary: { label: "Talk to us", href: "#contact" },
  frame: {
    alt: "First-person view looking down at two hands shaping clay on a spinning potter's wheel.",
    timecode: "00:41:12",
    narration: "Pressing in with both thumbs to narrow the neck.",
  },
};

export const steps = [
  {
    role: "Devices",
    text: "We ship the capture kit set up and charged: head-mounted iPhones and cap cameras.",
  },
  {
    role: "Recorders",
    text: "Trained recorders wear the rigs and film the tasks you list, where they really happen.",
  },
  {
    role: "Annotators",
    text: "Annotators label every clip against your schema: actions, hands, objects, steps.",
  },
  {
    role: "Narrators",
    text: "Narrators add a spoken account of what is happening and why.",
  },
  {
    role: "Review",
    text: "Each hour is checked against your spec. Only approved hours are delivered.",
  },
];

export const itTeam = {
  title: "Our own IT team keeps the field running.",
  sentence: "Recorders record. Everything around them is handled in-house.",
  items: [
    { title: "Device setup", text: "Provisioning, updates, charging and spares for every rig." },
    { title: "Environment", text: "Network, power and storage at each site before the first take." },
    { title: "Uploads", text: "Secure transfer from device to storage, checked end to end." },
    { title: "Support", text: "A person to call when something stops working, on site or remote." },
  ],
};

export const rigs = [
  {
    name: "Head-mounted iPhone",
    text: "Eye-level video from a phone strapped at the forehead, with its motion sensors.",
  },
  {
    name: "Cap camera",
    text: "A camera on the brim of a cap. Light enough for long sessions, natural head movement.",
  },
];

export const billing = {
  title: "You are billed for approved hours.",
  sentence:
    "Every recorded hour is reviewed against your specification. Hours that pass are counted and delivered.",
  states: ["Recorded", "Reviewed", "Approved", "Delivered"],
};

/** Google Drive folders with sample recordings. Filled from the team's shared links. */
export const samples: { title: string; text: string; href: string }[] = [];

export const contact = {
  title: "Tell us what to record.",
  sentence: "Send your task list and the hours you need. We reply with a capture plan.",
};

export const credits = {
  frame: {
    text: "Example frame: Pottery workshop at Odisha Crafts Museum, by Kritzolina",
    license: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Pottery_workshop_at_Odisha_Crafts_Museum_02.jpg",
    licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
};
