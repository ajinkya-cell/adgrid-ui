/**
 * One timeline read by both the film (src/Film.tsx) and the score
 * (scripts/make-score.mts), so every cut lands on a beat.
 * Plain TypeScript with no imports so Node can load it directly.
 *
 * 120 BPM, 54 s:
 *   0–3.5      the Number Ticker counts down 5 → 0
 *   3.5–5.5    logo, "fresh out of the void"
 *   5.5–8.5    Inspect Text
 *   8.5–17.5   three living backgrounds
 *   17.5–24.5  Book: open it, write in it, turn the page, it remembers
 *   24.5–33.5  AI kit: the chat, then four pieces at once
 *   33.5–39.5  three scrollbars side by side
 *   39.5–48.5  Roughly: annotate any website
 *   48.5–54    outro
 */

export const FPS = 30;
export const BPM = 120;
export const BEAT = 60 / BPM;
export const DURATION_S = 54;
export const DURATION = DURATION_S * FPS;

export const COUNTDOWN_END = 3.5;
/** Film seconds at which each countdown digit (5 … 0) rolls in. */
export const COUNTDOWN_TICKS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
export const INTRO_START = COUNTDOWN_END;
export const INTRO_END = 5.5;
export const OUTRO_START = 48.5;

export interface Clip {
  clip: string;
  /** Source seconds the clip starts at, and how fast it plays. */
  srcStart: number;
  rate: number;
  /** Zoom about (cx, cy) in source px. */
  zoom?: number;
  cx?: number;
  cy?: number;
  /** Source frame size, if not 1920×1080. */
  w?: number;
  h?: number;
  cursor?: boolean;
  label?: string;
}

export type ShotLayout = "single" | "grid" | "columns";

export interface Shot {
  id: string;
  layout: ShotLayout;
  clips: Clip[];
  title: string;
  /** One-line hook; may change through the shot (seconds from the shot's start). */
  lines: { at: number; text: string }[];
  start: number;
  end: number;
  /** Count it in the "n/m" of its group. */
  group?: string;
}

const one = (c: Clip): Clip[] => [c];

export const SHOTS: Shot[] = [
  {
    id: "inspect", layout: "single", title: "Inspect Text", start: 5.5, end: 8.5,
    lines: [{ at: 0, text: "Hover any word to measure it, like a design tool" }],
    clips: one({ clip: "inspect", srcStart: 0.5, rate: 2.3, zoom: 1.35, cx: 960, cy: 560 }),
  },

  {
    id: "ascii", layout: "single", group: "backgrounds", title: "ASCII Field", start: 8.5, end: 11.5,
    lines: [{ at: 0, text: "A living field of glyphs that bends around your cursor" }],
    clips: one({ clip: "ascii", srcStart: 1.0, rate: 2 }),
  },
  {
    id: "topo", layout: "single", group: "backgrounds", title: "Topographic Map", start: 11.5, end: 14.5,
    lines: [{ at: 0, text: "Rest your cursor and a hill rises" }],
    clips: one({ clip: "topo", srcStart: 0.5, rate: 2.5 }),
  },
  {
    id: "hatch", layout: "single", group: "backgrounds", title: "Hand-drawn Hatching", start: 14.5, end: 17.5,
    lines: [{ at: 0, text: "Four layers of ink that wobble off the paper" }],
    clips: one({ clip: "hatch", srcStart: 0.5, rate: 3 }),
  },

  {
    id: "book", layout: "single", title: "Book", start: 17.5, end: 24.5,
    lines: [
      { at: 0, text: "Open the cover…" },
      { at: 1.3, text: "…write on the page, in your own hand…" },
      { at: 4.0, text: "…turn it by the edge, and it remembers." },
    ],
    clips: one({ clip: "book", srcStart: 0.4, rate: 2.5, zoom: 1.1, cx: 960, cy: 575 }),
  },

  {
    id: "chat", layout: "single", group: "ai", title: "AI Chat", start: 24.5, end: 27.5,
    lines: [{ at: 0, text: "Sidebar, thread and replies that stream in" }],
    clips: one({ clip: "chat", srcStart: 0.8, rate: 2.2, zoom: 1.5, cx: 960, cy: 540 }),
  },
  {
    id: "ai-grid", layout: "grid", group: "ai", title: "The AI kit", start: 27.5, end: 33.5,
    lines: [{ at: 0, text: "Prompt input, suggestions, streaming markdown, message actions" }],
    clips: [
      { clip: "ai-input", srcStart: 0.4, rate: 1, zoom: 1.62, cx: 960, cy: 520, label: "Prompt Input" },
      { clip: "ai-suggest", srcStart: 0.4, rate: 1.1, zoom: 1.75, cx: 960, cy: 480, label: "Prompt Suggestions" },
      { clip: "ai-markdown", srcStart: 0.3, rate: 0.95, zoom: 1.5, cx: 950, cy: 545, label: "Streaming Markdown" },
      { clip: "ai-actions", srcStart: 0.4, rate: 1.5, zoom: 2.2, cx: 950, cy: 545, label: "Message Actions" },
    ],
  },

  {
    id: "scroll", layout: "columns", title: "Three ways to scroll", start: 33.5, end: 39.5,
    lines: [{ at: 0, text: "Scroll Progress · Scroll Water · Ruler Scrollbar" }],
    clips: [
      { clip: "scroll-progress", srcStart: 0.3, rate: 1.28, w: 640, h: 1080, cy: 575, label: "Scroll Progress" },
      { clip: "scroll-water", srcStart: 0.3, rate: 1.28, w: 640, h: 1080, cy: 575, label: "Scroll Water" },
      { clip: "scroll-ruler", srcStart: 0.3, rate: 1.28, w: 640, h: 1080, cy: 575, label: "Ruler Scrollbar" },
    ],
  },

  {
    id: "roughly", layout: "single", title: "Roughly", start: 39.5, end: 48.5,
    lines: [{ at: 0, text: "Hand-drawn annotations for any website: one skill, one command" }],
    clips: one({ clip: "roughly", srcStart: 0.6, rate: 2.35, zoom: 1.12, cx: 960, cy: 530 }),
  },
];

/** Every cut, for the score's hits. */
export const CUTS: number[] = [INTRO_END, ...SHOTS.map((s) => s.end)];

/** Section chapters: the big word that flashes as each group begins. */
export const CHAPTERS: { at: number; kicker: string; title: string }[] = [
  { at: 8.5, kicker: "New", title: "Living backgrounds" },
  { at: 24.5, kicker: "New", title: "The AI kit" },
  { at: 33.5, kicker: "New", title: "Scrollbars" },
  { at: 39.5, kicker: "Annotate any website", title: "Roughly" },
];
