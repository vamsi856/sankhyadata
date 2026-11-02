// Post-build: inject the server-rendered page into dist/index.html and inline the CSS,
// so the first response paints the full page with no render-blocking requests.
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");

const { render } = await import(pathToFileURL(path.join(root, "dist-server", "entry-server.js")).href);
const appHtml = render();

let html = await readFile(indexPath, "utf8");
if (!html.includes('<div id="root"></div>')) throw new Error("root placeholder not found");
html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

// Inline the stylesheet. Its url(../x) references are relative to /assets, so rebase them.
const linkRe = /<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/;
const match = html.match(linkRe);
if (!match) throw new Error("stylesheet link not found");
const cssPath = path.join(dist, match[1]);
const css = (await readFile(cssPath, "utf8")).replaceAll("url(../", "url(./");
html = html.replace(match[0], () => `<style>${css}</style>`);
await rm(cssPath);

await writeFile(indexPath, html);
await rm(path.join(root, "dist-server"), { recursive: true, force: true });
console.log(`prerendered ${Math.round(appHtml.length / 1024)} KB of HTML, inlined ${Math.round(css.length / 1024)} KB of CSS`);
