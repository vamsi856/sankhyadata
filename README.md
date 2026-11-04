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

## Deploy (Hetzner)

GitHub only holds the code. Every push to `main` runs
[`.github/workflows/deploy-hetzner.yml`](.github/workflows/deploy-hetzner.yml), which builds
the site and publishes it to the repo's `live` release. The dedicated Hetzner server
`sankhyadata-web` (Ashburn, US; `5.161.223.5`) checks that release every 2 minutes
([`deploy/pull.sh`](deploy/pull.sh), run by a systemd timer), verifies the checksums,
unpacks a new build into `/var/www/sankhyadata/releases/<version>` and switches
`/var/www/sankhyadata/current` to it (the last 5 are kept). Caddy serves it at
**https://sankhyadata.com** with [`deploy/sankhyadata.caddy`](deploy/sankhyadata.caddy),
installed by [`deploy/install-site.sh`](deploy/install-site.sh), which rolls back if Caddy
rejects the config so the server's other sites keep running. No server credentials are
stored in GitHub.

One-time setup on the server, as root (for example from the Hetzner Cloud web console):

```bash
curl -fsSL https://raw.githubusercontent.com/vamsi856/sankhyadata/main/deploy/setup-pull.sh | bash
```

DNS (Hostinger): `A` `@` → `5.161.223.5`; `CNAME` `www` → `sankhyadata.com`. Hetzner firewall
`sankhyadata-web`: inbound 80, 443 and ICMP only (SSH closed; use the Hetzner web console).

New dedicated server (Hetzner project `sankhyadata`): with a project API token in
`HCLOUD_TOKEN`, `python3 deploy/provision-hetzner.py` creates a firewall (80, 443, ICMP only)
and an Ubuntu 24.04 server whose first boot ([`deploy/cloud-init.yaml`](deploy/cloud-init.yaml))
installs Caddy, automatic security updates and the updater above, with no manual login. Then
point the domain's `A`/`AAAA` records at the addresses it prints.

Useful on the server: `systemctl list-timers sankhyadata-pull.timer`,
`journalctl -u sankhyadata-pull -n 50`, roll back with
`ln -sfn /var/www/sankhyadata/releases/<older> /var/www/sankhyadata/current`.

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
