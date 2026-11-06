import type { ComponentType } from "react";
import { CaptureFrame } from "@/components/CaptureFrame";
import { BillingTrack } from "@/components/BillingTrack";
import { CountUp } from "@/components/CountUp";
import { MotionProvider } from "@/lib/motion";

/**
 * Islands: the only parts of the page that ship JavaScript. Everything else is static
 * HTML from the prerender, so the browser hydrates two small trees instead of the page.
 */
export const islands = {
  frame: CaptureFrame,
  billing: BillingTrack,
  figure: CountUp,
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

export function Island({ name, inline = false }: { name: IslandName; inline?: boolean }) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag data-island={name}>
      <IslandContent name={name} />
    </Tag>
  );
}
