/**
 * Renders public/score.wav from src/timeline.ts: a 120 BPM track whose
 * cuts, word hits and drop all sit on the film's own timeline.
 *
 *   0–3     drone swell, a ping for the logo, a click per word
 *   3–39    four-on-the-floor kick, offbeat hats, eighth-note bass, pad chords;
 *           claps join for the components; a whoosh + tick on every cut
 *   38–39   riser into the outro
 *   39–45   a hit, clicks on the words, then the last chord rings out
 *
 * Run: node --no-warnings scripts/make-score.mts
 */
import { writeFileSync } from "node:fs";
import { BEAT, COUNTDOWN_END, COUNTDOWN_TICKS, CUTS, DURATION_S, INTRO_END, INTRO_START, OUTRO_START } from "../src/timeline.ts";

const SR = 48000;
const LEN = Math.round(DURATION_S * SR);
const L = new Float32Array(LEN);
const R = new Float32Array(LEN);
const verbL = new Float32Array(LEN);
const verbR = new Float32Array(LEN);

const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(i: number, v: number, pan = 0, verb = 0) {
  if (i < 0 || i >= LEN) return;
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  L[i] += v * gl;
  R[i] += v * gr;
  verbL[i] += v * gl * verb;
  verbR[i] += v * gr * verb;
}

function kick(t: number, gain = 0.9) {
  const s0 = Math.round(t * SR);
  let ph = 0;
  for (let i = 0; i < 0.45 * SR; i++) {
    const tt = i / SR;
    const f = 48 + 110 * Math.exp(-tt / 0.03);
    ph += (2 * Math.PI * f) / SR;
    add(s0 + i, Math.sin(ph) * gain * Math.exp(-tt / 0.16) * (tt < 0.002 ? tt / 0.002 : 1));
  }
}

function noiseHit(t: number, { dur = 0.05, gain = 0.15, hp = 0.85, pan = 0, verb = 0.1, tau = 0.02 } = {}) {
  const s0 = Math.round(t * SR);
  let prev = 0;
  let lp = 0;
  for (let i = 0; i < dur * SR; i++) {
    const n = rnd();
    const h = n - prev * hp; // crude high-pass
    prev = n;
    lp += (h - lp) * 0.6;
    add(s0 + i, lp * gain * Math.exp(-(i / SR) / tau), pan, verb);
  }
}

function clap(t: number, gain = 0.22) {
  for (const o of [0, 0.011, 0.022]) noiseHit(t + o, { dur: 0.18, gain: gain * (o === 0.022 ? 1 : 0.6), hp: 0.5, verb: 0.35, tau: o === 0.022 ? 0.06 : 0.008 });
}

function tone(t: number, midi: number, { dur = 0.4, gain = 0.2, type = "sine", pan = 0, verb = 0.2, attack = 0.004, tau = 0.15, cutoff = 1 } = {}) {
  const s0 = Math.round(t * SR);
  const f = hz(midi);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < dur * SR; i++) {
    const tt = i / SR;
    ph += (2 * Math.PI * f) / SR;
    const p = (ph / (2 * Math.PI)) % 1;
    const osc = type === "sine" ? Math.sin(ph) : type === "saw" ? 2 * p - 1 : type === "tri" ? 1 - 4 * Math.abs(p - 0.5) : p < 0.5 ? 1 : -1;
    lp += (osc - lp) * cutoff;
    const env = Math.min(1, tt / attack) * Math.exp(-tt / tau);
    add(s0 + i, lp * gain * env, pan, verb);
  }
}

/** Soft pad: detuned saws through a one-pole filter, slow in, slow out. */
function pad(t: number, notes: number[], dur: number, gain = 0.045) {
  const s0 = Math.round(t * SR);
  const n = Math.round(dur * SR);
  notes.forEach((m, j) => {
    for (const det of [-0.08, 0.08]) {
      const f = hz(m + det);
      let ph = Math.random();
      let lp = 0;
      const pan = (j / Math.max(1, notes.length - 1)) * 1.2 - 0.6 + det * 2;
      for (let i = 0; i < n; i++) {
        ph += f / SR;
        const osc = 2 * (ph % 1) - 1;
        lp += (osc - lp) * 0.035;
        const tt = i / SR;
        const env = Math.min(1, tt / 0.35) * Math.min(1, (dur - tt) / 0.4);
        add(s0 + i, lp * gain * env, pan, 0.5);
      }
    }
  });
}

function whoosh(tEnd: number, len = 0.35, gain = 0.07) {
  const s0 = Math.round((tEnd - len) * SR);
  let lp = 0;
  for (let i = 0; i < len * SR; i++) {
    const k = i / (len * SR);
    lp += (rnd() - lp) * (0.02 + 0.5 * k * k);
    add(s0 + i, lp * gain * k * k, Math.sin(k * 3) * 0.5, 0.3);
  }
}

// ── Arrangement ──────────────────────────────────────────────────────────

const BAR = BEAT * 4;
// Am  F  C  G  (roots, and pad voicings)
const PROG = [
  { root: 33, chord: [57, 60, 64, 69] },
  { root: 29, chord: [57, 60, 65, 69] },
  { root: 36, chord: [55, 60, 64, 67] },
  { root: 31, chord: [55, 59, 62, 67] },
];

// countdown: a tick per digit, climbing, over a low drone
pad(0, [45, 52], COUNTDOWN_END + 0.2, 0.035);
COUNTDOWN_TICKS.forEach((at, i) => {
  const last = i === COUNTDOWN_TICKS.length - 1;
  noiseHit(at, { dur: 0.03, gain: 0.3, hp: 0.97, tau: 0.004, verb: 0.15 });
  tone(at, last ? 81 : 69 + i * 2, { dur: last ? 1.2 : 0.4, gain: last ? 0.14 : 0.09 + i * 0.01, type: "tri", tau: last ? 0.5 : 0.12, verb: 0.45 });
});
whoosh(INTRO_START, 0.45, 0.08);

// intro: a hit for the logo, a click per word
kick(INTRO_START, 1);
pad(INTRO_START, [45, 52, 57], INTRO_END - INTRO_START + 0.3, 0.05);
tone(INTRO_START, 81, { dur: 1.6, gain: 0.12, tau: 0.6, verb: 0.6 });
tone(INTRO_START, 88, { dur: 1.2, gain: 0.05, tau: 0.4, verb: 0.6 });
for (const w of [0.85, 1.1, 1.35, 1.6, 1.85]) noiseHit(INTRO_START + w, { dur: 0.03, gain: 0.25, hp: 0.95, tau: 0.004, verb: 0.15 });
tone(INTRO_START + 1.85, 69, { dur: 0.5, gain: 0.1, type: "tri", tau: 0.2 });
whoosh(INTRO_END, 0.5, 0.09);

// the groove
const DROP_OFF = OUTRO_START + 3.5; // kicks stop as the command types
for (let t = INTRO_END; t < DROP_OFF - 1e-6; t += BEAT) {
  const inRiser = t >= OUTRO_START - 1 && t < OUTRO_START;
  kick(t, inRiser ? 0.6 : 0.85);
  if (t >= INTRO_END + BAR && !inRiser) noiseHit(t + BEAT / 2, { dur: 0.05, gain: 0.11, pan: 0.3, tau: 0.012 });
  if (t >= 17.5 && t < OUTRO_START - 1) {
    const beatInBar = Math.round((t - INTRO_END) / BEAT) % 4;
    if (beatInBar === 1 || beatInBar === 3) clap(t);
    noiseHit(t + BEAT / 4, { dur: 0.03, gain: 0.05, pan: -0.4, tau: 0.008 });
    noiseHit(t + (3 * BEAT) / 4, { dur: 0.03, gain: 0.05, pan: -0.4, tau: 0.008 });
  }
}

for (let bar = 0; INTRO_END + bar * BAR < DROP_OFF; bar++) {
  const t0 = INTRO_END + bar * BAR;
  const p = PROG[bar % 4];
  pad(t0, p.chord, Math.min(BAR + 0.15, DROP_OFF + 1 - t0), t0 >= OUTRO_START ? 0.06 : 0.04);
  for (let e = 0; e < 8; e++) {
    const t = t0 + e * (BEAT / 2);
    if (t >= DROP_OFF || (t >= OUTRO_START - 1 && t < OUTRO_START)) continue;
    tone(t, p.root + (e % 4 === 3 ? 12 : 0), { dur: 0.24, gain: 0.2, type: "saw", cutoff: 0.08, tau: 0.09, verb: 0.05 });
  }
  // a plucked arpeggio from the components onward
  if (t0 >= 17.5 && t0 < OUTRO_START - 1) {
    p.chord.forEach((m, k) => tone(t0 + k * (BEAT / 2) + BEAT * 2, m + 12, { dur: 0.5, gain: 0.05, type: "tri", tau: 0.18, verb: 0.5, pan: k % 2 ? 0.4 : -0.4 }));
  }
}

// cuts
for (const c of CUTS) {
  if (c >= OUTRO_START) continue;
  whoosh(c, 0.3, 0.06);
  noiseHit(c, { dur: 0.04, gain: 0.28, hp: 0.97, tau: 0.005, verb: 0.2 });
}

// riser into the outro
{
  const len = 1.0;
  const s0 = Math.round((OUTRO_START - len) * SR);
  let ph = 0;
  let lp = 0;
  for (let i = 0; i < len * SR; i++) {
    const k = i / (len * SR);
    ph += (2 * Math.PI * (220 + 660 * k * k)) / SR;
    lp += (rnd() - lp) * (0.05 + 0.6 * k);
    add(s0 + i, (Math.sin(ph) * 0.04 + lp * 0.12) * k * k, 0, 0.4);
  }
}

// outro
kick(OUTRO_START, 1);
noiseHit(OUTRO_START, { dur: 1.6, gain: 0.12, hp: 0.6, tau: 0.5, verb: 0.6 });
for (const w of [OUTRO_START, OUTRO_START + BEAT, OUTRO_START + 1.5, OUTRO_START + 2.0, OUTRO_START + 2.5]) noiseHit(w, { dur: 0.03, gain: 0.22, hp: 0.95, tau: 0.004, verb: 0.2 });
// typing ticks
for (let k = 0; k < 24; k++) noiseHit(OUTRO_START + 3.05 + k * (1.0 / 24), { dur: 0.012, gain: 0.07, hp: 0.98, tau: 0.002, pan: rnd() * 0.3, verb: 0.05 });
// last chord rings out under the logo
const END = OUTRO_START + 4.75;
whoosh(END, 0.45, 0.07);
pad(END, [45, 57, 60, 64, 69, 76], DURATION_S - END, 0.05);
tone(END, 81, { dur: DURATION_S - END, gain: 0.1, tau: 0.9, verb: 0.7 });
tone(END, 33, { dur: DURATION_S - END, gain: 0.25, tau: 0.8, verb: 0.1 });

// ── Reverb (a handful of feedback combs), mix and master ─────────────────

function comb(src: Float32Array, delays: number[], fb: number) {
  const out = new Float32Array(LEN);
  for (const dms of delays) {
    const d = Math.round((dms / 1000) * SR);
    const buf = new Float32Array(LEN);
    let lp = 0;
    for (let i = 0; i < LEN; i++) {
      const back = i >= d ? buf[i - d] : 0;
      lp += (back - lp) * 0.35;
      buf[i] = src[i] + lp * fb;
      out[i] += buf[i] / delays.length;
    }
  }
  return out;
}
const wetL = comb(verbL, [29.7, 37.1, 41.1, 43.7], 0.82);
const wetR = comb(verbR, [31.3, 35.9, 40.3, 45.1], 0.82);

let peak = 0;
for (let i = 0; i < LEN; i++) {
  L[i] += wetL[i] * 0.35;
  R[i] += wetR[i] * 0.35;
  // soft clip
  L[i] = Math.tanh(L[i] * 1.1);
  R[i] = Math.tanh(R[i] * 1.1);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const fadeOut = Math.round(0.6 * SR);

const data = Buffer.alloc(44 + LEN * 4);
data.write("RIFF", 0);
data.writeUInt32LE(36 + LEN * 4, 4);
data.write("WAVEfmt ", 8);
data.writeUInt32LE(16, 16);
data.writeUInt16LE(1, 20);
data.writeUInt16LE(2, 22);
data.writeUInt32LE(SR, 24);
data.writeUInt32LE(SR * 4, 28);
data.writeUInt16LE(4, 32);
data.writeUInt16LE(16, 34);
data.write("data", 36);
data.writeUInt32LE(LEN * 4, 40);
for (let i = 0; i < LEN; i++) {
  const f = i > LEN - fadeOut ? (LEN - i) / fadeOut : 1;
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm * f)) * 32767), 44 + i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm * f)) * 32767), 46 + i * 4);
}
writeFileSync(new URL("../public/score.wav", import.meta.url), data);
console.log(`score.wav: ${DURATION_S}s, peak normalised from ${peak.toFixed(2)}`);
