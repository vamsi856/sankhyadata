import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production build pre-renders the page to static HTML (see scripts/prerender.mjs),
// so we hydrate that markup instead of re-rendering it. In dev the root is empty.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
