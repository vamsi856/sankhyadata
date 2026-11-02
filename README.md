# SankhyaData — website

Marketing site for an **egocentric data company** that:

1. **Makes modular wearable capture devices**: *Sankhya Glass* (lightweight glasses) or *Sankhya Rig* (head-mounted rig for industrial shifts), plus *Sankhya Wrist* cameras and the *Sankhya Core* compute pack
2. **Runs managed first-person data collection** in homes, kitchens, warehouses, factories and retail
3. **Delivers training-ready datasets** for robotics, AR and embodied AI, with 3D hands, object 6DoF, actions, gaze and narration

The structure follows research-device and egocentric-data sites such as Meta's Project Aria
(Glasses → Partners/Research Kit → Datasets → Tools) and on EgoData (egodata.io): head + wrist capture, modular hardware, "book a demo" and sample-data calls to action.

> "SankhyaData", the product names, specs, datasets, papers, roles and email addresses are **placeholders**.
> Replace them with your real company details before launch.

## Pages

| File | What it covers |
|---|---|
| `index.html` | Hero with a live simulated egocentric capture HUD, pillars, device teaser, data modalities, process, privacy, research CTA |
| `devices.html` | Sankhya Glass and Sankhya Rig, annotated device diagrams, spec comparison table, SDK snippet, FAQ |
| `data.html` | Collection-to-delivery pipeline, environments (tabs), annotation types, export formats, responsible-data practices |
| `research.html` | Open datasets, open-source tools, publications, research-kit application form |
| `contact.html` | Contact form, mission, careers |

`assets/styles.css` holds all styles, with colours as `:root` tokens. `assets/main.js` handles the nav, tabs, scroll reveals, the forms and the hero animation.

## Run locally

No build step and no dependencies:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Customize

- **Company name**: find and replace `SankhyaData` and `sankhyadata.com` across `*.html`.
- **Brand colours**: edit `--accent` / `--accent-2` in `assets/styles.css`.
- **Header and footer**: these are duplicated in each page, so update all five files when you change them.
- **Forms**: they currently show a success message only. To make them send, add an `action="https://formspree.io/f/…"` (or your own API endpoint) and `method="POST"` to each `<form data-demo>`.

## Deploy

Works on any static host:

- **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / root
- **Netlify / Vercel / Cloudflare Pages**: import the repo; no build command, output directory `/`
