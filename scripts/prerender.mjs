// Post-build: inject the server-rendered pages into static HTML and inline the CSS, so the
// first response paints the full page with no render-blocking requests.
//   dist/index.html          the site (islands hydrate)
//   dist/privacy/index.html  the privacy notice (no JavaScript)
import { readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");

const { render, renderPrivacy } = await import(pathToFileURL(path.join(root, "dist-server", "entry-server.js")).href);

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
const home = template
  .replace(match[0], () => `<style>${css.replaceAll("url(../", "url(./")}</style>`)
  .replace('<div id="root"></div>', () => `<div id="root">${appHtml}</div>`);
await writeFile(indexPath, home);

// 2. Privacy notice: same head and styles, no scripts or hero preloads, absolute asset paths.
const privacyHtml = renderPrivacy();
let privacy = template
  .replace(match[0], () => `<style>${css.replaceAll("url(../", "url(/")}</style>`)
  .replace(/<script type="module"[^>]*><\/script>/g, "")
  .replace(/<link rel="modulepreload"[^>]*>/g, "")
  .replace(/<link rel="preload" as="image"[^>]*>/g, "")
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
  .replace(/href="\.\/(fonts|favicon)/g, 'href="/$1')
  .replace(/<title>[^<]*<\/title>/, "<title>Privacy notice | SankhyaData</title>")
  .replace(/<link rel="canonical" href="[^"]*"/, '<link rel="canonical" href="https://sankhyadata.com/privacy/"')
  .replace('<div id="root"></div>', () => `<div id="root">${privacyHtml}</div>`);
await mkdir(path.join(dist, "privacy"), { recursive: true });
await writeFile(path.join(dist, "privacy", "index.html"), privacy);

await rm(path.join(root, "dist-server"), { recursive: true, force: true });
console.log(`prerendered home (${Math.round(appHtml.length / 1024)} KB) and privacy notice; inlined ${Math.round(css.length / 1024)} KB of CSS`);
