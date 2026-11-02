import type { ComponentType } from "react";
import { CaptureFrame } from "@/components/CaptureFrame";
import { BillingTrack } from "@/components/BillingTrack";
import { MotionProvider } from "@/lib/motion";

/**
 * Islands: the only parts of the page that ship JavaScript. Everything else is static
 * HTML from the prerender, so the browser hydrates two small trees instead of the page.
 */
export const islands = {
  frame: CaptureFrame,
  billing: BillingTrack,
} satisfies Record<string, ComponentType>;

export type IslandName = keyof typeof islands;

export function IslandContent({ name }: { name: IslandName }) {
  const Component = islands[name];
  return (
    <MotionProvider>
      <Component />
    </MotionProvider>
  );
}

export function Island({ name }: { name: IslandName }) {
  return (
    <div data-island={name}>
      <IslandContent name={name} />
    </div>
  );
}
