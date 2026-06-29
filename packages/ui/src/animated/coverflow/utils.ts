/**
 * Helper to interpolate a value along a defined set of checkpoints
 */
export function interpolate(value: number, input: number[], output: number[]): number {
  if (value <= input[0]) return output[0];
  if (value >= input[input.length - 1]) return output[output.length - 1];
  for (let i = 0; i < input.length - 1; i++) {
    if (value >= input[i] && value <= input[i + 1]) {
      const ratio = (value - input[i]) / (input[i + 1] - input[i]);
      return output[i] + ratio * (output[i + 1] - output[i]);
    }
  }
  return output[0];
}

/**
 * Calculates the shortest modular distance between card index i and current scroll position C
 */
export function getCircularDistance(i: number, C: number, N: number, loop: boolean): number {
  const diff = i - C;
  if (!loop) return diff;
  const modDiff = ((diff % N) + N) % N;
  if (modDiff > N / 2) {
    return modDiff - N;
  }
  return modDiff;
}

export type CardTransformState = {
  rotateY: number;
  translateX: number;
  translateZ: number;
  scale: number;
  opacity: number;
  zIndex: number;
  overlayOpacity: number;
};

/**
 * Solves the exact 3D coordinates based on modular distance d
 */
export function getCardTransforms(d: number): CardTransformState {
  const absD = Math.abs(d);
  const sign = Math.sign(d);

  // Data point mappings matching the specification checklist exactly
  const dPoints = [0, 1, 2, 3, 4];
  const rotYPoints = [0, 45, 65, 75, 80];
  const scalePoints = [1.0, 0.9, 0.8, 0.7, 0.5];
  const transXPoints = [0, 140, 260, 380, 480];
  const transZPoints = [100, -50, -180, -320, -450];
  const opacityPoints = [1.0, 0.9, 0.6, 0.25, 0.0];
  const overlayOpacityPoints = [0.0, 0.35, 0.65, 0.85, 1.0];

  const rotateY = -sign * interpolate(absD, dPoints, rotYPoints);
  const scale = interpolate(absD, dPoints, scalePoints);
  const translateX = sign * interpolate(absD, dPoints, transXPoints);
  const translateZ = interpolate(absD, dPoints, transZPoints);
  const opacity = interpolate(absD, dPoints, opacityPoints);
  const overlayOpacity = interpolate(absD, dPoints, overlayOpacityPoints);
  
  // Z-index layout layering mapping
  const zIndex = Math.round(100 - absD * 10);

  return {
    rotateY,
    translateX,
    translateZ,
    scale,
    opacity,
    zIndex,
    overlayOpacity,
  };
}
