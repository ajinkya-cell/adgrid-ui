/**
 * Web Audio click recipes shared by the tactile components.
 *
 * Each voice is one oscillator whose pitch sweeps exponentially from `from`
 * to `to` over `sweep` seconds while its gain falls exponentially from `gain`
 * to silence over `decay` seconds. Keeping the numbers here (instead of inline
 * in each component) lets other tools, such as the promo soundtrack renderer,
 * reproduce the exact same sounds.
 */
export interface ClickVoice {
  type: "sine" | "triangle" | "square" | "sawtooth";
  /** Start frequency in Hz. */
  from: number;
  /** End frequency in Hz. */
  to: number;
  /** Seconds the pitch sweep takes. */
  sweep: number;
  /** Starting gain. */
  gain: number;
  /** Seconds until the gain reaches silence (0.0001). */
  decay: number;
}

/** VoidButton press. */
export const VOID_BUTTON_CLICK: ClickVoice = {
  type: "sine",
  from: 2000,
  to: 120,
  sweep: 0.008,
  gain: 0.06,
  decay: 0.008,
};

/** ButtonAlpha press. */
export const BUTTON_ALPHA_CLICK: ClickVoice = {
  type: "sine",
  from: 1200,
  to: 140,
  sweep: 0.005,
  gain: 0.025,
  decay: 0.006,
};

/** Detent tick shared by AnisotropicKnob and WheelPicker (WheelPicker plays it at its own volume). */
export const DETENT_CLICK: ClickVoice = {
  type: "sine",
  from: 2200,
  to: 140,
  sweep: 0.006,
  gain: 0.03,
  decay: 0.006,
};

/** Schedule one click voice on an AudioContext, starting now. */
export function playClickVoice(ctx: AudioContext, voice: ClickVoice, gain = voice.gain): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();

  osc.type = voice.type;
  osc.frequency.setValueAtTime(voice.from, now);
  osc.frequency.exponentialRampToValueAtTime(voice.to, now + voice.sweep);

  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + voice.decay);

  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start();
  osc.stop(now + voice.decay + 0.001);
}
