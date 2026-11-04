// Post-build: inject the server-rendered pages into static HTML and inline the CSS, so the
// first response paints the full page with no render-blocking requests.
//   dist/index.html          the site (islands hydrate)
//   dist/privacy/index.html  the privacy notice (no JavaScript)
//   dist/404.html            the not-found page (no JavaScript; served by Caddy)
import { readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");

const { render, renderPrivacy, renderNotFound } = await import(
  pathToFileURL(path.join(root, "dist-server", "entry-server.js")).href
);

let template = await readFile(indexPath, "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error("root placeholder not found");

// Inline the stylesheet. Its url(../x) references are relative to /assets, so rebase them.
const linkRe = /<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/;
const match = template.match(linkRe);
if (!match) throw new Error("stylesheet link not found");
const cssPath = path.join(dist, match[1]);
const css = await readFile(cssPath, "utf8");
await rm(cssPath);

// 1. Home page.
const appHtml = render();
await writeFile(
  indexPath,
  template
    .replace(match[0], () => `<style>${css.replaceAll("url(../", "url(./")}</style>`)
    .replace('<div id="root"></div>', () => `<div id="root">${appHtml}</div>`),
);

// Secondary pages: same head and styles, no scripts, preloads, social tags or structured data,
// and absolute asset paths (they live below the root or are served for any missing path).
function secondary(html, { title, description, canonical, robots }) {
  let out = template
    .replace(match[0], () => `<style>${css.replaceAll("url(../", "url(/")}</style>`)
    .replace(/<script type="module"[^>]*><\/script>/g, "")
    .replace(/<link rel="modulepreload"[^>]*>/g, "")
    .replace(/<link rel="preload"[^>]*>/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace(/\s*<meta (property="og:|name="twitter:)[^>]*>/g, "")
    .replace(/href="\.\/(fonts|favicon|apple-touch|site\.webmanifest)/g, 'href="/$1')
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${description}"`)
    .replace('<div id="root"></div>', () => `<div id="root">${html}</div>`);
  out = canonical
    ? out.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`)
    : out.replace(/\s*<link rel="canonical"[^>]*>/, "");
  if (robots) out = out.replace("</title>", `</title>\n    <meta name="robots" content="${robots}" />`);
  return out;
}

// 2. Privacy notice.
await mkdir(path.join(dist, "privacy"), { recursive: true });
await writeFile(
  path.join(dist, "privacy", "index.html"),
  secondary(renderPrivacy(), {
    title: "Privacy notice | SankhyaData",
    description:
      "How the SankhyaData website handles information: no cookies, analytics or tracking, no access logs, and email used solely to respond to enquiries.",
    canonical: "https://sankhyadata.com/privacy/",
  }),
);

// 3. Not-found page.
await writeFile(
  path.join(dist, "404.html"),
  secondary(renderNotFound(), {
    title: "Page not found | SankhyaData",
    description: "The requested page does not exist on sankhyadata.com.",
    canonical: null,
    robots: "noindex",
  }),
);

await rm(path.join(root, "dist-server"), { recursive: true, force: true });
console.log(`prerendered home (${Math.round(appHtml.length / 1024)} KB), privacy notice and 404; inlined ${Math.round(css.length / 1024)} KB of CSS`);
