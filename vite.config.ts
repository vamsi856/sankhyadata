import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Preact (via its React-compatible layer) renders the same React + Motion code at a
// fraction of React DOM's size. `base: "./"` keeps asset paths relative, so the build
// works on GitHub Pages (https://<user>.github.io/sankhyadata/) and on a custom domain.
export default defineConfig({
  base: "./",
  plugins: [preact({ prerender: { enabled: false } }), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // Bundle every dependency into the prerender build so they all resolve to Preact.
  ssr: { noExternal: true },
});
