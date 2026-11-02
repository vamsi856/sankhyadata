import "./index.css";
import { createRoot, hydrateRoot } from "react-dom/client";
import { IslandContent, islands, type IslandName } from "./islands";
import { startSmoothScroll } from "./lib/smooth-scroll";

const root = document.getElementById("root")!;

if (root.hasChildNodes()) {
  // Production: the page is prerendered HTML. Hydrate only the interactive islands.
  document.querySelectorAll<HTMLElement>("[data-island]").forEach((el) => {
    const name = el.dataset.island as IslandName;
    if (name in islands) hydrateRoot(el, <IslandContent name={name} />);
  });
} else if (import.meta.env.DEV) {
  // Development: no prerender, so render the whole page.
  import("./App").then(({ default: App }) => createRoot(root).render(<App />));
}

startSmoothScroll();
