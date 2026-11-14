/**
 * The SankhyaData mark, "counted field of view": dots in columns of 1, 2 and 3 opening from
 * the wearer's eye, on a 24-unit grid. The outer dots sit on rays from the eye, so the set
 * reads as a view cone, and the dots grow with distance. Shared by the header logo and the
 * Contact section's point cloud; public/brand/sankhyadata-mark.svg is the same drawing.
 */
export const markDots: readonly { x: number; y: number; r: number; col: 1 | 2 | 3 }[] = [
  { x: 3.75, y: 12, r: 2.05, col: 1 },
  { x: 11.25, y: 8.071, r: 2.4, col: 2 },
  { x: 11.25, y: 15.929, r: 2.4, col: 2 },
  { x: 19.5, y: 3.75, r: 2.8, col: 3 },
  { x: 19.5, y: 12, r: 2.8, col: 3 },
  { x: 19.5, y: 20.25, r: 2.8, col: 3 },
];
