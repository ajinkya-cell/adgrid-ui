/** A track loaded on one deck. Nothing is decoded: the waveform is generated from these numbers. */
export interface DeckTrack {
  title: string;
  artist: string;
  /** Tempo at 0% pitch. */
  bpm: number;
  /** Length in seconds. */
  duration: number;
  /** Seeds the generated waveform; defaults to a hash of the title. */
  seed?: number;
}

export type PadMode = "hot-cue" | "beat-loop" | "slip-loop" | "beat-jump";

export const PAD_MODES: { id: PadMode; label: string; color: string }[] = [
  { id: "hot-cue", label: "Hot Cue", color: "#f2f2f2" },
  { id: "beat-loop", label: "Beat Loop", color: "#f08c3a" },
  { id: "slip-loop", label: "Slip Loop", color: "#3f7bf0" },
  { id: "beat-jump", label: "Beat Jump", color: "#e5484d" },
];

/** Hot cue colours, one per pad, after the hardware's RGB pads. */
export const HOT_CUE_COLORS = ["#e5484d", "#2ec4d6", "#c5e14b", "#9b6cf0", "#f08c3a", "#3f7bf0", "#e0c341", "#3fb37f"];

/** Loop lengths in beats for Beat Loop and Slip Loop, pad 1 to 8. */
export const LOOP_BEATS = [0.25, 0.5, 1, 2, 4, 8, 16, 32];

/** Beat Jump distances: top row jumps back, bottom row forward. */
export const JUMP_BEATS = [-16, -8, -4, -1, 1, 4, 8, 16];

export interface Loop {
  start: number;
  /** Seconds. */
  length: number;
  /** Which pad started it, so that pad stays lit; null for loops set with IN/OUT. */
  pad: number | null;
}

export interface Channel {
  /** 0 to 1, unity at 0.5. */
  trim: number;
  /** −1 (kill) to 1, flat at 0. */
  hi: number;
  mid: number;
  low: number;
  /** −1 low-pass … 0 off … 1 high-pass. */
  color: number;
  /** 0 to 1. */
  fader: number;
  /** Headphone cue. */
  cue: boolean;
}

export const DEFAULT_CHANNEL: Channel = { trim: 0.5, hi: 0, mid: 0, low: 0, color: 0, fader: 0.8, cue: false };
