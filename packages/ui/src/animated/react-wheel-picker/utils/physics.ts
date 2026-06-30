export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface SpringState {
  position: number;
  velocity: number;
}

export const DEFAULT_SPRING_CONFIG: SpringConfig = {
  stiffness: 180,
  damping: 24,
  mass: 0.8,
};

export const MOMENTUM_SPRING_CONFIG: SpringConfig = {
  stiffness: 120,
  damping: 20,
  mass: 0.7,
};

export function calculateSpringForce(
  currentPosition: number,
  targetPosition: number,
  currentVelocity: number,
  config: SpringConfig
): number {
  const displacement = targetPosition - currentPosition;
  const springForce = -config.stiffness * displacement;
  const dampingForce = -config.damping * currentVelocity;
  return (springForce + dampingForce) / config.mass;
}

export function simulateSpringFrame(
  state: SpringState,
  target: number,
  config: SpringConfig,
  deltaTime: number
): SpringState {
  const force = calculateSpringForce(state.position, target, state.velocity, config);
  const newVelocity = state.velocity + force * deltaTime;
  const newPosition = state.position + newVelocity * deltaTime;
  return { position: newPosition, velocity: newVelocity };
}

export function calculateMomentumDecay(
  velocity: number,
  friction: number,
  deltaTime: number
): number {
  return velocity * Math.pow(friction, deltaTime * 60);
}

export function calculateStopTime(
  velocity: number,
  friction: number,
  threshold: number = 0.001
): number {
  if (velocity === 0) return 0;
  return Math.log(threshold / Math.abs(velocity)) / Math.log(friction) / 60;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function springTo(_target: number, config: SpringConfig = DEFAULT_SPRING_CONFIG) {
  return {
    type: "spring" as const,
    stiffness: config.stiffness,
    damping: config.damping,
    mass: config.mass,
  };
}

export const MOMENTUM_FRICTION = 0.95;
export const MOMENTUM_THRESHOLD = 0.001;
export const MOMENTUM_MULTIPLIER = 8.5;

export function calculateMomentumTarget(
  currentPosition: number,
  velocity: number,
  multiplier: number = MOMENTUM_MULTIPLIER
): number {
  return currentPosition - velocity * multiplier;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}