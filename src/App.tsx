import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { Library } from "@/sections/Library";
import { HowItWorks } from "@/sections/HowItWorks";
import { ITTeam } from "@/sections/ITTeam";
import { Rigs } from "@/sections/Rigs";
import { Billing } from "@/sections/Billing";
import { Samples } from "@/sections/Samples";
import { Contact, Footer } from "@/sections/Contact";

/** The whole page. Prerendered to static HTML at build; only islands hydrate in the browser. */
export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Library />
        <HowItWorks />
        <ITTeam />
        <Rigs />
        <Billing />
        <Samples />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
