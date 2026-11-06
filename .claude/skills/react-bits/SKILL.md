---
name: react-bits
description: Catalog of animated React components from React Bits (reactbits.dev): text effects, animations, components and backgrounds, installable through the shadcn registry. Use when the user asks for React Bits by name, or wants a specific animated effect (split or blur text, count-up, magnet, spotlight, scroll reveal) and a source-backed starting point would help. (Narrowed in this repo so it does not fire on every UI task.)
---

# React Bits

React Bits (https://reactbits.dev, MIT + Commons Clause) publishes some 218 animated components.
Each comes in four variants: `JS-CSS`, `JS-TW`, `TS-CSS`, `TS-TW`. This repo uses `TS-TW`.

## Finding a component

- The full index: `curl -s https://reactbits.dev/r/registry.json` (names end in `-TS-TW`).
- One component's source and dependencies:
  `curl -s https://reactbits.dev/r/<Name>-TS-TW.json` (read `dependencies` and `files[].content`).
- Groups: text animations (SplitText, BlurText, CountUp, ShinyText, ScrollReveal, DecryptedText),
  animations (AnimatedContent, FadeContent, Magnet, GlareHover, StarBorder, ClickSpark),
  components (SpotlightCard, TiltedCard, Dock, Stepper, Masonry) and backgrounds
  (Aurora, Silk, Threads, DotGrid; most are WebGL).

## Installing

`npx shadcn@latest add @react-bits/<Name>-TS-TW` (registry set in `components.json`).
Read the source before adding it. Then adapt it; never ship it as fetched.

## Project rules (SankhyaData)

These override the catalog. CLAUDE.md's budgets and motion policy win every time.

- **Budget:** main JS stays under 30 KB gzipped. Background, WebGL and three.js components
  (ogl, three, @react-three/*, gsap) are out: they break the budget and Lighthouse 98+.
- **Motion:** `transform` and `opacity` only. Reject components that animate `background`,
  `filter`, `box-shadow`, layout or `color` per frame (SpotlightCard, GlareHover and most
  cursor effects do).
- **Motion library:** the site loads Motion through `LazyMotion` + `m`. Replace any
  `motion.*` element with `m.*`, and import from `@/lib/motion`, not `motion/react`, so
  features stay in the lazy chunk. Drop `'use client'`.
- **Islands:** the page is prerendered; anything interactive becomes an island in
  `src/islands.tsx`, and its server render must already show the final content (no
  `opacity: 0` at rest: sloplint FAIL 62).
- **Reduced motion:** every adapted component must render its static end state under
  `prefers-reduced-motion: reduce`.
- **Tokens:** swap hard-coded colours and radii for the tokens in `src/index.css`.
- Run `node .claude/skills/hallmark/scripts/sloplint.mjs src index.html --genre modern-minimal`
  after adapting one.
