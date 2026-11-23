// Every tunable number for the card's motion lives here, so the feel is adjusted in one place.

/** Drives the whole hover: no overshoot, settles in about 450 ms, reverses from wherever it is. */
export const OPEN_SPRING = { stiffness: 170, damping: 26, mass: 1 };

/** The arm lowering onto the record when a song starts on its own: slower and heavier than hover. */
export const LIVE_SPRING = { stiffness: 60, damping: 16, mass: 1.2 };

/** Platter speed in revolutions per minute. */
export const RPM = 100 / 3;
/** Seconds for the platter to close ~63% of the gap to full speed: a quick, motor-driven start. */
export const SPIN_UP_TAU = 0.35;
/** Same for slowing down; longer, so the record coasts like a heavy platter. */
export const SPIN_DOWN_TAU = 0.7;
/** Below this speed (deg/s) a coasting record is treated as stopped. */
export const STOP_EPSILON = 0.5;

/**
 * Deck at full hover: shrinks into its bottom-right corner and lifts in from the edges so the whole
 * turntable sits inside the card, beside the list. At rest the 380 × 290 deck bleeds 52px off the
 * right and 28px off the bottom; moving it back by that bleed plus the card's 28px padding, written
 * as a share of the deck's own size, holds at every card width.
 */
export const DECK_OPEN_X = `${(-(52 + 28) / 380) * 100}%`;
export const DECK_OPEN_Y = `${(-(28 + 28) / 290) * 100}%`;
export const DECK_OPEN_SCALE = 0.64;
export const DECK_OPEN_BRIGHTNESS = 0.8;

/** Tonearm angles in degrees: parked on its rest, and playing on the lead-in grooves. */
export const REST_ANGLE = 0;
export const PLAY_ANGLE = 21;

export interface SpinState {
  /** Accumulated rotation in degrees. Never wrapped, so stopping never snaps. */
  angle: number;
  /** Degrees per second. */
  velocity: number;
}

/**
 * One frame of platter physics. Velocity eases exponentially toward the target speed (frame-rate
 * independent), then the angle integrates it. `dt` is clamped so a tab coming back from the
 * background doesn't leap the record forward.
 */
export function stepSpin(s: SpinState, dt: number, active: boolean, rpm: number = RPM): SpinState {
  const step = Math.min(Math.max(dt, 0), 0.05);
  const target = active ? rpm * 6 : 0;
  const tau = target > s.velocity ? SPIN_UP_TAU : SPIN_DOWN_TAU;
  let velocity = target + (s.velocity - target) * Math.exp(-step / tau);
  if (!active && Math.abs(velocity) < STOP_EPSILON) velocity = 0;
  return { angle: s.angle + velocity * step, velocity };
}
