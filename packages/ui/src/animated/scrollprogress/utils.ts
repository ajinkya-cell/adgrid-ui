/**
 * Generates an array of numbers from 0 to n-1.
 * Helper for generating ticks.
 */
export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * Clamp a number between min and max bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
