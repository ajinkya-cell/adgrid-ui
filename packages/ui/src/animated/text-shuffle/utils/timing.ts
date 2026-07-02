/* Timing and spring-physics constants for shuffle animations */

export const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 170,
  damping: 22,
  mass: 0.8,
};

export const ELASTIC_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 15,
  mass: 1.2,
};

export const SNAPPY_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

export const FLIP_TRANSITION = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

export const DEFAULT_DURATION = 2200;
export const DEFAULT_TRANSITION = 700;
