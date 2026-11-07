import type { ComponentType } from "react";
import { CaptureFrame } from "@/components/CaptureFrame";
import { BillingTrack } from "@/components/BillingTrack";
import { ApprovalLine } from "@/components/ApprovalLine";
import { CountUp } from "@/components/CountUp";
import { SiteCloud } from "@/components/SiteCloud";
import { RigView } from "@/components/RigView";
import { Pipeline } from "@/components/Pipeline";
import { MotionProvider } from "@/lib/motion";

/**
 * Islands: the only parts of the page that ship JavaScript. Everything else is static
 * HTML from the prerender, so the browser hydrates two small trees instead of the page.
 */
export const islands = {
  frame: CaptureFrame,
  billing: () => (
    <>
      <ApprovalLine />
      <div className="mt-10 max-w-4xl">
        <BillingTrack />
      </div>
    </>
  ),
  figure: CountUp,
  cloud: SiteCloud,
  rig: RigView,
  pipeline: Pipeline,
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

export function Island({ name, inline = false, className }: { name: IslandName; inline?: boolean; className?: string }) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag data-island={name} className={className}>
      <IslandContent name={name} />
    </Tag>
  );
}
