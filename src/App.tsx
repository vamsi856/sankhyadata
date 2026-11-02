import { MotionProvider, Reveal, useSmoothScroll } from "@/lib/motion";

// Work in progress: the full page is being rebuilt section by section.
export default function App() {
  useSmoothScroll();
  return (
    <MotionProvider>
      <main className="mx-auto max-w-3xl p-10">
        <Reveal>
          <h1 className="text-4xl font-semibold tracking-tight">SankhyaData</h1>
        </Reveal>
      </main>
    </MotionProvider>
  );
}
