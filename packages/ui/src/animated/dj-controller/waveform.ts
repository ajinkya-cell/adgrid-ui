import type { DeckTrack } from "./types";

// A believable three-band waveform made from a track's tempo and a seed, so the screen, the meters
// and the EQ all agree without decoding any audio. Kicks land on the beat, claps on 2 and 4, hats on
// the off-beats, and the track moves through intro / build / drop / breakdown in 16-bar sections.

/** Waveform slices per second. */
export const WF_RATE = 60;

export interface Peaks {
  low: Float32Array;
  mid: Float32Array;
  high: Float32Array;
  /** Slices. */
  length: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Section energy per 16 bars: [kick, mid, high]. The last entry repeats until the outro.
const SECTIONS: [number, number, number][] = [
  [0.75, 0.25, 0.45], // intro: drums
  [0.85, 0.55, 0.6], // build
  [1, 0.9, 0.85], // drop
  [0.15, 0.7, 0.5], // breakdown
  [1, 1, 0.9], // drop 2
  [0.8, 0.45, 0.55], // outro
];

export function makePeaks(track: DeckTrack): Peaks {
  const length = Math.max(1, Math.ceil(track.duration * WF_RATE));
  const rand = mulberry32(track.seed ?? hash(track.title + track.artist));
  const low = new Float32Array(length);
  const mid = new Float32Array(length);
  const high = new Float32Array(length);
  const beatSec = 60 / track.bpm;
  const sectionBeats = 64;
  const totalSections = Math.max(1, Math.ceil(track.duration / beatSec / sectionBeats));
  // A slow wobble in the mids, so phrases don't look copy-pasted.
  const phase = rand() * Math.PI * 2;
  let midNoise = 0;
  let highNoise = 0;

  for (let i = 0; i < length; i++) {
    const t = i / WF_RATE;
    const beats = t / beatSec;
    const beatPhase = beats % 1;
    const beatInBar = Math.floor(beats) % 4;
    const sectionIndex = Math.floor(beats / sectionBeats);
    const isLast = sectionIndex >= totalSections - 1;
    const energy = isLast ? SECTIONS[5]! : SECTIONS[Math.min(sectionIndex, 4)]!;
    const [kickE, midE, highE] = energy;
    const fade = Math.min(1, t / 1.5, (track.duration - t) / 3);

    const kick = Math.exp(-beatPhase * 9) * kickE;
    const clap = beatInBar % 2 === 1 ? Math.exp(-beatPhase * 14) * 0.55 * midE : 0;
    const hatPhase = (beatPhase + 0.5) % 1;
    const hat = Math.exp(-hatPhase * 22) * 0.7 * highE;

    midNoise += (rand() - midNoise) * 0.08;
    highNoise += (rand() - highNoise) * 0.35;
    const swell = 0.75 + 0.25 * Math.sin(t * 0.21 + phase);

    // The bass ducks under each kick and swells back before the next (sidechain), so the low band
    // reads as solid blocks rather than thin spikes.
    const bass = midE * 0.5 * Math.min(1, beatPhase * 3.5);

    low[i] = Math.max(0, Math.min(1, (Math.max(kick, bass) * 0.95 + 0.08 + rand() * 0.05) * fade));
    mid[i] = Math.max(0, Math.min(1, (midE * (0.42 + midNoise * 0.35) * swell + clap) * fade));
    high[i] = Math.max(0, Math.min(1, (highE * (0.16 + highNoise * 0.3) + hat) * fade));
  }
  return { low, mid, high, length };
}

/** Index of the slice at `t` seconds, or −1 outside the track. */
export function sliceAt(peaks: Peaks, t: number): number {
  const i = Math.floor(t * WF_RATE);
  return i < 0 || i >= peaks.length ? -1 : i;
}

/** Per-band gains from a mixer channel: EQ (−1 kill … 0 flat … 1 boost) and the colour filter. */
export function bandGains(ch: { hi: number; mid: number; low: number; color: number }) {
  const eq = (v: number) => (v < 0 ? 1 + v : 1 + v * 0.4);
  const lp = ch.color < 0 ? -ch.color : 0; // low-pass removes highs, then mids
  const hp = ch.color > 0 ? ch.color : 0; // high-pass removes lows, then mids
  return {
    low: eq(ch.low) * (1 - hp),
    mid: eq(ch.mid) * (1 - Math.max(lp, hp) * 0.6),
    high: eq(ch.hi) * (1 - lp),
  };
}

/** Loudness of one slice after the EQ, about 0 to 1. */
export function loudness(peaks: Peaks, i: number, g: { low: number; mid: number; high: number }): number {
  if (i < 0) return 0;
  return Math.min(1.2, peaks.low[i]! * 0.6 * g.low + peaks.mid[i]! * 0.5 * g.mid + peaks.high[i]! * 0.25 * g.high);
}
