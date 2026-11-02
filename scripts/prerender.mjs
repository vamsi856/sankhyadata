// Inject the server-rendered app into dist/index.html so the page paints
// with full content before any JavaScript runs.
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const serverEntry = path.join(root, "dist-server", "entry-server.js");

const { render } = await import(pathToFileURL(serverEntry).href);
const html = render();
const indexPath = path.join(dist, "index.html");
const template = await readFile(indexPath, "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error("root placeholder not found");
await writeFile(indexPath, template.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
await rm(path.join(root, "dist-server"), { recursive: true, force: true });
console.log(`prerendered ${Math.round(html.length / 1024)} KB of HTML into dist/index.html`);
