// One flap cell's mechanics, in degrees and seconds. Pure, so it can be stepped and reasoned about
// without a DOM.
//
// θ is how far the current flap has fallen: 0 standing up, 180 lying on the one below. A motor
// releases each flap with a small push and gravity does the rest, so it starts slow and slaps
// down fast. While the drum still has characters to turn through, the next flap is released the
// moment one lands. On the last one, the flap bounces off the stop and rings down to rest.

/** Seconds per flap at nominal speed. */
export const FLIP_TIME = 0.042;
/** Share of the 180° the motor's push covers; the rest is gravity. */
const PUSH_SHARE = 0.55;
const OMEGA0 = (180 / FLIP_TIME) * PUSH_SHARE;
const GRAVITY = (2 * 180 * (1 - PUSH_SHARE)) / FLIP_TIME ** 2;
/** How much speed a landing flap keeps as it bounces off the stop. */
const RESTITUTION = 0.32;
/** Below this rebound speed (°/s) the flap just stays down. */
const SETTLE_OMEGA = 320;

export type Phase = "idle" | "flip" | "bounce";

export interface Flap {
  /** Character index showing (or, mid-flip, the one falling away). */
  cur: number;
  target: number;
  theta: number;
  omega: number;
  phase: Phase;
  /** Seconds to wait before starting; gives the ripple across the board. */
  delay: number;
  /** Speed multiplier for this cell's mechanism, near 1, so cells drift apart a little. */
  rate: number;
}

/** What happened this step, so the renderer knows which faces need new characters. */
export const FlapEvent = {
  None: 0,
  /** A flap was released: cur → cur + 1 is now in motion. */
  Start: 1,
  /** A flap landed and the cell rests on `cur`. */
  Land: 2,
  /** A flap landed and the next was released straight away. */
  LandStart: 3,
} as const;
export type FlapEvent = (typeof FlapEvent)[keyof typeof FlapEvent];

export const createFlap = (cur: number, rate = 1): Flap => ({ cur, target: cur, theta: 180, omega: 0, phase: "idle", delay: 0, rate });

export function stepFlap(f: Flap, dt: number, size: number): FlapEvent {
  const g = GRAVITY * f.rate * f.rate;

  if (f.phase === "idle") {
    if (f.cur === f.target) return FlapEvent.None;
    if (f.delay > 0) {
      f.delay -= dt;
      if (f.delay > 0) return FlapEvent.None;
    }
    f.phase = "flip";
    f.theta = 0;
    f.omega = OMEGA0 * f.rate;
    return FlapEvent.Start;
  }

  f.omega += g * dt;
  f.theta += f.omega * dt;
  if (f.theta < 180) return FlapEvent.None;

  if (f.phase === "flip") {
    f.cur = (f.cur + 1) % size;
    if (f.cur !== f.target) {
      f.theta = 0;
      f.omega = OMEGA0 * f.rate;
      return FlapEvent.LandStart;
    }
    f.theta = 180;
    f.omega = -f.omega * RESTITUTION;
    f.phase = "bounce";
    return FlapEvent.Land;
  }

  // Bouncing: back on the stop.
  f.theta = 180;
  const rebound = Math.abs(f.omega) * RESTITUTION;
  if (rebound < SETTLE_OMEGA) {
    f.omega = 0;
    f.phase = "idle";
  } else f.omega = -rebound;
  return FlapEvent.None;
}
