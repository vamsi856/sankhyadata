import { clsx, type ClassValue } from "clsx";

// Class names here never conflict, so plain clsx is enough (tailwind-merge would add ~8 KB gzipped).
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
