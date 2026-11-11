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

### Moving from Hetzner (one time, in this order)

1. Create the **public**, empty repo `vamsi856/sankhyadata-live`.
2. Create a fine-grained personal access token: resource owner `vamsi856`, only the repository
   `sankhyadata-live`, permission **Contents: Read and write**, with an expiry date you note
   here: `____`. Save it in this repo as the Actions secret `LIVE_REPO_TOKEN`.
3. Run **Deploy to GitHub Pages** (Actions tab, Run workflow) so `gh-pages` exists.
4. GitHub, profile **Settings > Pages > Add a domain**: `sankhyadata.com`. Add the TXT record it
   shows (`_github-pages-challenge-vamsi856`) at Hostinger, click **Verify**, and keep that
   record for good. This stops any other GitHub account claiming the domain.
5. In `sankhyadata-live`, **Settings > Pages**: Source **Deploy from a branch**, `gh-pages`,
   `/ (root)`, Save. Check that **Custom domain** shows `sankhyadata.com` (enter it if not).
6. At Hostinger DNS, at a quiet hour, in one sitting:
   - delete `A` `@` `5.161.223.5` and `AAAA` `@` `2a01:4ff:f0:860d::1` (replace, never add beside);
   - add `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`;
   - add `AAAA` `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`,
     `2606:50c0:8003::153`;
   - change `www` to `CNAME` → `vamsi856.github.io`;
   - delete the `portal` and `samples` records (they point at the Hetzner IP, which Hetzner
     will give to someone else);
   - keep MX, the SPF TXT, the DKIM records, the GitHub TXT from step 4 and the CAA records
     (they allow `letsencrypt.org`, which GitHub uses).
7. Wait for **Settings > Pages** to show the DNS check passing and the certificate issued
   (usually under an hour; if nothing after about 15 minutes, Remove the domain and add it
   again). Then tick **Enforce HTTPS** and check that `http://sankhyadata.com/` redirects to
   `https://`.
8. Make `vamsi856/sankhyadata` private.
9. On the portal server, stop trusting forwarded client addresses from `5.161.223.5` /
   `2a01:4ff:f0:860d::1` and drop its `portal.sankhyadata.com` / `samples.sankhyadata.com` host
   entries.
10. After about 48 hours, delete the Hetzner server `sankhyadata-web` with its firewall and
    primary IPs (project `sankhyadata`), and revoke that project's API tokens. Do not touch
    the portal server (`178.105.159.139`), which is a separate machine.

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
