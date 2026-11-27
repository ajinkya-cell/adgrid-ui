"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { RPM, stepSpin } from "../turntable-card/motion";
import { bandGains, loudness, sliceAt, type Peaks } from "./waveform";
import type { Channel, Loop } from "./types";

/** Seconds of music per platter revolution at 0% pitch: the jog wheel and the track move together. */
export const SEC_PER_REV = 60 / RPM;

/** What React owns: changes when a control is touched. Read by the loop through a ref. */
export interface DeckControl {
  playing: boolean;
  /** Percent, −8 to 8. */
  pitch: number;
  duration: number;
  loop: Loop | null;
  /** A slip loop is held: the track keeps running underneath and resumes from there on release. */
  slip: boolean;
}

export interface MixControl {
  channels: [Channel, Channel];
  /** −1 deck 1 only … 1 deck 2 only. */
  crossfader: number;
  /** 0 to 1. */
  master: number;
}

export interface Controls {
  decks: [DeckControl, DeckControl];
  mix: MixControl;
}

/** What the frame loop owns: changes every frame, never re-renders anything. */
export interface Runtime {
  /** Playhead in seconds. */
  pos: number;
  angle: number;
  /** Platter speed, degrees per second. */
  velocity: number;
  scratching: boolean;
  /** Degrees the hand has turned the platter since the last frame. */
  scratchDelta: number;
  /** Where the track would be without the slip loop, while one is held. */
  shadow: number | null;
  level: number;
}

export interface DeckClock {
  rt: MutableRefObject<[Runtime, Runtime]>;
  angles: [MotionValue<number>, MotionValue<number>];
  levels: [MotionValue<number>, MotionValue<number>];
  master: [MotionValue<number>, MotionValue<number>];
}

const newRuntime = (): Runtime => ({ pos: 0, angle: 0, velocity: 0, scratching: false, scratchDelta: 0, shadow: null, level: 0 });

/** Channel volume after trim, fader and crossfader. */
export function channelGain(ch: Channel, crossfader: number, deck: 0 | 1): number {
  const xf = deck === 0 ? Math.min(1, 1 - crossfader) : Math.min(1, 1 + crossfader);
  return (0.4 + ch.trim * 1.2) * ch.fader * xf;
}

export function useDeckClock(opts: {
  controls: MutableRefObject<Controls>;
  peaks: [Peaks, Peaks];
  reducedMotion: boolean;
  /** A deck ran off the end of its track. */
  onEnd: (deck: 0 | 1) => void;
}): DeckClock {
  const rt = useRef<[Runtime, Runtime]>([newRuntime(), newRuntime()]);
  const a0 = useMotionValue(0);
  const a1 = useMotionValue(0);
  const l0 = useMotionValue(0);
  const l1 = useMotionValue(0);
  const mL = useMotionValue(0);
  const mR = useMotionValue(0);
  const live = useRef(opts);
  live.current = opts;

  useEffect(() => {
    const angles = [a0, a1];
    const levels = [l0, l1];
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      // Up to a quarter second is real time; longer gaps (a background tab) are skipped, not replayed.
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.25);
      last = now;
      const { controls, peaks, reducedMotion, onEnd } = live.current;
      const { decks, mix } = controls.current;
      let sum = 0;

      for (const d of [0, 1] as const) {
        const r = rt.current[d];
        const c = decks[d];
        let dAngle: number;
        if (r.scratching) {
          dAngle = r.scratchDelta;
          r.scratchDelta = 0;
          // Remember how fast the hand was moving, so letting go mid-flick carries on spinning.
          r.velocity = dt > 0 ? r.velocity + (dAngle / dt - r.velocity) * 0.5 : r.velocity;
          r.angle += dAngle;
        } else {
          // stepSpin clamps each step to 50 ms, so sub-step: a slow frame must not slow the music.
          let s = { angle: r.angle, velocity: r.velocity };
          for (let left = dt; left > 0; left -= 0.05) s = stepSpin(s, Math.min(left, 0.05), c.playing, RPM * (1 + c.pitch / 100));
          dAngle = s.angle - r.angle;
          r.angle = s.angle;
          r.velocity = s.velocity;
        }

        const dPos = (dAngle / 360) * SEC_PER_REV;
        r.pos += dPos;
        if (r.shadow !== null) r.shadow = Math.min(c.duration, Math.max(0, r.shadow + dPos));
        if (c.loop && dPos > 0 && r.pos >= c.loop.start + c.loop.length) {
          r.pos = c.loop.start + ((r.pos - c.loop.start) % c.loop.length);
        }
        if (r.pos < 0) r.pos = 0;
        if (r.pos >= c.duration) {
          r.pos = c.duration;
          if (c.playing && !c.loop) onEnd(d);
        }
        if (!reducedMotion) angles[d]!.set(r.angle);

        // Channel meter, pre-fader like the hardware: the waveform's loudness under the playhead,
        // through trim and EQ. The master meter then takes the faders and crossfader into account.
        const rate = dt > 0 ? Math.abs(dPos / dt) : 0;
        const ch = mix.channels[d];
        const target =
          rate > 0.05 ? loudness(peaks[d], sliceAt(peaks[d], r.pos), bandGains(ch)) * (0.4 + ch.trim * 1.2) * Math.min(1, rate) : 0;
        const k = target > r.level ? Math.min(1, dt * 45) : Math.min(1, dt * 7);
        r.level += (target - r.level) * k;
        levels[d]!.set(r.level);
        sum += r.level * channelGain({ ...ch, trim: 0.5 }, mix.crossfader, d);
      }

      const m = Math.min(1.2, sum * mix.master * 1.1);
      mL.set(m);
      mR.set(m * (0.94 + 0.06 * Math.sin(now / 90)));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [a0, a1, l0, l1, mL, mR]);

  return { rt, angles: [a0, a1], levels: [l0, l1], master: [mL, mR] };
}
