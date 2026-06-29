/**
 * Calculates the standard Euclidean distance between two points (x1, y1) and (x2, y2).
 */
export function getEuclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the Chebyshev distance (maximum coordinate difference) between two points.
 * Useful for grid-based expansions.
 */
export function getChebyshevDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
}

/**
 * Calculates the Manhattan distance (L1 norm) between two points.
 */
export function getManhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}
