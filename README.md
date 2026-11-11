# SankhyaData website

The public site for **SankhyaData**: first-person (egocentric) video of real work for
physical AI. We supply the devices, recorders, annotators, narrators and IT support, and
bill on approved hours.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Edit the content

All text and links are in [`src/content.ts`](src/content.ts).

- **Sample data:** set the Google Drive folder to *Anyone with the link can view*, then add it
  to `samples` in `src/content.ts`. Until a link is added, the Samples section shows an
  "Ask for access" email link.
- **Hero photo:** `public/media/frame-*` is a credited Creative Commons stand-in. Replace it
  with a frame from your own footage (keep the same file names; AVIF + WebP + JPEG), then
  remove the credit in `src/content.ts`.

## Deploy (GitHub Pages)

Every push to `main` runs
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which builds the
site, adds `CNAME` (`sankhyadata.com`) and `.nojekyll`, and force-pushes the built files as a
single commit to the `gh-pages` branch of the public output-only repo
[`vamsi856/sankhyadata-live`](https://github.com/vamsi856/sankhyadata-live). GitHub Pages serves
that branch at **https://sankhyadata.com**, so this source repo can stay private on a free plan.

GitHub Pages cannot set response headers, so `scripts/prerender.mjs` puts the content security
policy and referrer policy in each page as `<meta>` tags. Pages sends no HSTS for custom
domains, so **Enforce HTTPS** (its HTTP-to-HTTPS redirect) must stay on. Pages serves `404.html`
for missing paths with status 404 and caches every file for 10 minutes.

The samples viewer runs on the portal server and is linked directly at
`samples.egocentric.duckdns.org`.

### Moving from Hetzner (one time)

[`scripts/move-to-pages.sh`](scripts/move-to-pages.sh) does the GitHub side with the GitHub CLI.
Run it on your own computer, signed in as `vamsi856` (`gh auth login`):

1. `bash scripts/move-to-pages.sh setup` creates the public repo `vamsi856/sankhyadata-live`,
   a deploy key with write access to that repo only (its private half goes straight into the
   secret `LIVE_DEPLOY_KEY` here; no copy is kept), runs the first publish, turns on GitHub
   Pages from `gh-pages`, pauses while you verify `sankhyadata.com` on your account
   (github.com/settings/pages, a TXT record at Hostinger; keep it for good), sets the custom
   domain and prints the DNS changes.
2. At Hostinger, in one sitting: replace (never add beside) the apex `A` `5.161.223.5` and
   `AAAA` `2a01:4ff:f0:860d::1` with `A` `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153` and `AAAA` `2606:50c0:8000::153` to
   `2606:50c0:8003::153`; make `www` a `CNAME` to `vamsi856.github.io`; delete the `portal` and
   `samples` records (the Hetzner IP will go to someone else); keep MX, SPF, DKIM, CAA and the
   GitHub TXT.
3. `bash scripts/move-to-pages.sh finish` checks that the domain resolves to GitHub Pages only,
   waits for the certificate (re-run it until it is issued), turns on Enforce HTTPS, switches
   off the old redirect-only Pages site here and makes this repo private.
4. On the portal server, stop trusting forwarded client addresses from `5.161.223.5` /
   `2a01:4ff:f0:860d::1` and drop its `portal.sankhyadata.com` / `samples.sankhyadata.com`
   host entries.
5. About 48 hours later, delete the Hetzner server `sankhyadata-web` with its firewall and
   primary IPs (project `sankhyadata`) and revoke that project's API tokens. Do not touch the
   portal server (`178.105.159.139`), a separate machine.

## How it is built (and why it is fast)

- **Vite + Preact** (React API through `preact/compat`) + **Tailwind CSS 4**.
- **Motion** (the Framer Motion API, `motion/react`) through `LazyMotion`; its animation
  features load as a separate chunk after first paint.
- **Lenis** smooth scrolling, loaded at idle and only on devices with a mouse or trackpad.
- The page is **prerendered to static HTML** at build time with the CSS inlined
  (`scripts/prerender.mjs`). Only two interactive "islands" hydrate: the capture frame and
  the billing track (`src/islands.tsx`).
- Self-hosted Geologica font (29 KB) and AVIF/WebP images; no third-party requests.

Local Lighthouse (simulated slow 4G, throttled CPU): **100 / 100 / 100 / 100** on mobile
and desktop. Main JavaScript about 25 KB gzipped.

## Design system and skills

Design direction: Hallmark's *Vantage* theme (instrument-quiet, hairline corner ticks,
Geologica), re-grounded on a daylight ground; the chartreuse signal is used only for what
annotators mark. One orchestrated motion moment, plus motion that answers the visitor.

Design skills for Claude Code are in `.claude/skills/` (installed after a security review;
see [`CLAUDE.md`](CLAUDE.md) for how they rank and what was removed):

| Skill | Source | Use |
| --- | --- | --- |
| frontend-design | anthropics/skills | Anthropic's design guidance |
| hallmark | Nutlope/hallmark | Anti-generic design rules, themes, `sloplint` |
| impeccable | pbakaus/impeccable | Craft and critique references (no engine) |
| design-taste-frontend | Leonxlnx/taste-skill | Art-direction references |
| ui-ux-pro-max | nextlevelbuilder/ui-ux-pro-max-skill | Searchable style, palette and font data |
| watermelon-ui | WatermelonCorp/watermelon-platform | Component catalog guidance |

Component registries (`components.json`): `@watermelon` (Watermelon UI) and `@kokonutui`
(Kokonut UI), e.g. `npx shadcn@latest add @watermelon/<slug>`. Installed from Watermelon:
`marquee`, `scroll-fade`, `text-gradient`.

Before committing UI changes:

```bash
node .claude/skills/hallmark/scripts/sloplint.mjs src index.html --genre modern-minimal
```

## Credits

- Geologica font: SIL Open Font License (`public/fonts/OFL.txt`).
- Example frame: *Pottery workshop at Odisha Crafts Museum*, by Kritzolina,
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via Wikimedia Commons.
