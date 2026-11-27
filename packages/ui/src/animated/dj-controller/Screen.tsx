"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import type { Controls, Runtime } from "./useDeckClock";
import { alpha, well } from "./material";
import { bandGains, WF_RATE, type Peaks } from "./waveform";
import { HOT_CUE_COLORS, type DeckTrack } from "./types";

// The centre display. Both decks' zoomed waveforms meet in the middle with one shared playhead
// column, so beats can be matched by eye; the overview of each whole track sits on the outside.
// Everything that moves is drawn on canvas or written into text nodes from one frame loop, so the
// screen never re-renders while the music plays.

const W = 380; // design px, inside the screen's padding
const ZOOM_H = 46;
const OVER_H = 14;
const ZOOM_SECONDS = 8;
const PLAY_X = Math.round(W * 0.4);
const BLUE = "#3d7bff";
const AMBER = "#f2a33a";
const WHITE = "#ececec";

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** The overview envelope: one loudness value per pixel column, computed once per track. */
function overview(peaks: Peaks): Float32Array {
  const out = new Float32Array(W);
  const per = peaks.length / W;
  for (let x = 0; x < W; x++) {
    let max = 0;
    const end = Math.min(peaks.length, Math.floor((x + 1) * per));
    for (let i = Math.floor(x * per); i < end; i++) {
      const v = peaks.low[i]! * 0.55 + peaks.mid[i]! * 0.35 + peaks.high[i]! * 0.2;
      if (v > max) max = v;
    }
    out[x] = Math.min(1, max);
  }
  return out;
}

function setup(canvas: HTMLCanvasElement | null, h: number, scale: number) {
  if (!canvas) return null;
  const dpr = (typeof window !== "undefined" ? window.devicePixelRatio : 1) * scale;
  const pw = Math.round(W * dpr);
  const ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export interface ScreenProps {
  tracks: [DeckTrack, DeckTrack];
  peaks: [Peaks, Peaks];
  rt: MutableRefObject<[Runtime, Runtime]>;
  controls: MutableRefObject<Controls>;
  hotCues: [(number | null)[], (number | null)[]];
  accents: [string, string];
  /** The chassis' CSS scale, so the canvases stay sharp at any size. */
  scale: number;
}

export function Screen({ tracks, peaks, rt, controls, hotCues, accents, scale }: ScreenProps) {
  const zoom = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)] as const;
  const over = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)] as const;
  const time = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)] as const;
  const bpm = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)] as const;
  const beats = [useRef<HTMLSpanElement>(null), useRef<HTMLSpanElement>(null)] as const;
  const envelopes = useMemo(() => [overview(peaks[0]), overview(peaks[1])] as const, [peaks]);
  const live = useRef({ tracks, peaks, hotCues, accents, scale, envelopes });
  live.current = { tracks, peaks, hotCues, accents, scale, envelopes };

  useEffect(() => {
    let frame = 0;
    const shownText = ["", "", "", "", "", ""];
    const setText = (el: HTMLElement | null, slot: number, text: string) => {
      if (el && shownText[slot] !== text) {
        shownText[slot] = text;
        el.textContent = text;
      }
    };

    const draw = () => {
      const { tracks, peaks, hotCues, accents, scale, envelopes } = live.current;
      const { decks, mix } = controls.current;

      for (const d of [0, 1] as const) {
        const r = rt.current[d];
        const track = tracks[d];
        const p = peaks[d];
        const c = decks[d];
        const beatSec = 60 / track.bpm;
        const g = bandGains(mix.channels[d]);

        // --- zoomed waveform: three bands drawn over each other, low widest ---
        const z = setup(zoom[d].current, ZOOM_H, scale);
        if (z) {
          z.clearRect(0, 0, W, ZOOM_H);
          const pps = W / ZOOM_SECONDS;
          const mid = ZOOM_H / 2;
          const half = ZOOM_H / 2 - 2;

          if (c.loop) {
            const x0 = PLAY_X + (c.loop.start - r.pos) * pps;
            const x1 = x0 + c.loop.length * pps;
            z.fillStyle = c.slip ? "rgba(63,123,240,0.16)" : "rgba(240,140,58,0.16)";
            z.fillRect(x0, 0, x1 - x0, ZOOM_H);
            z.fillStyle = c.slip ? "rgba(63,123,240,0.8)" : "rgba(240,140,58,0.8)";
            z.fillRect(x0, 0, 1, ZOOM_H);
            z.fillRect(x1 - 1, 0, 1, ZOOM_H);
          }

          const bands: [Float32Array, number, string, number][] = [
            [p.low, g.low, BLUE, 1],
            [p.mid, g.mid, AMBER, 0.62],
            [p.high, g.high, WHITE, 0.34],
          ];
          for (const [band, gain, color, k] of bands) {
            z.fillStyle = color;
            for (let x = 0; x < W; x++) {
              const t = r.pos + (x - PLAY_X) / pps;
              const i = Math.floor(t * WF_RATE);
              if (i < 0 || i >= p.length) continue;
              const h = Math.min(1, band[i]! * gain) * half * k;
              if (h < 0.4) continue;
              z.globalAlpha = x < PLAY_X ? 0.55 : 1;
              z.fillRect(x, mid - h, 1, h * 2);
            }
          }
          z.globalAlpha = 1;

          // beat grid: short ticks, taller on the bar
          const first = Math.ceil((r.pos - PLAY_X / pps) / beatSec);
          const lastBeat = Math.floor((r.pos + (W - PLAY_X) / pps) / beatSec);
          for (let b = Math.max(0, first); b <= lastBeat; b++) {
            const x = Math.round(PLAY_X + (b * beatSec - r.pos) * pps);
            const bar = b % 4 === 0;
            z.fillStyle = bar ? "rgba(229,72,77,0.85)" : "rgba(255,255,255,0.35)";
            const len = bar ? 6 : 3;
            z.fillRect(x, 0, 1, len);
            z.fillRect(x, ZOOM_H - len, 1, len);
          }

          // hot cue flags
          hotCues[d].forEach((cue, i) => {
            if (cue == null) return;
            const x = PLAY_X + (cue - r.pos) * pps;
            if (x < -6 || x > W + 6) return;
            z.fillStyle = HOT_CUE_COLORS[i]!;
            z.fillRect(Math.round(x), 0, 1, ZOOM_H);
            z.beginPath();
            z.moveTo(x - 4, 0);
            z.lineTo(x + 4, 0);
            z.lineTo(x, 5);
            z.fill();
          });

          // playhead
          z.fillStyle = "#ffffff";
          z.fillRect(PLAY_X - 0.75, 0, 1.5, ZOOM_H);
        }

        // --- overview of the whole track ---
        const o = setup(over[d].current, OVER_H, scale);
        if (o) {
          o.clearRect(0, 0, W, OVER_H);
          const env = envelopes[d];
          const at = (r.pos / track.duration) * W;
          for (let x = 0; x < W; x++) {
            const h = Math.max(0.5, env[x]! * (OVER_H - 2));
            o.fillStyle = x < at ? "rgba(255,255,255,0.22)" : alpha(accents[d], 0.7);
            o.fillRect(x, OVER_H - h, 1, h);
          }
          hotCues[d].forEach((cue, i) => {
            if (cue == null) return;
            o.fillStyle = HOT_CUE_COLORS[i]!;
            o.fillRect(Math.round((cue / track.duration) * W), 0, 1.5, 4);
          });
          o.fillStyle = "#ffffff";
          o.fillRect(at - 0.75, 0, 1.5, OVER_H);
        }

        // --- readouts ---
        setText(time[d].current, d, `−${fmt(track.duration - r.pos)}`);
        setText(bpm[d].current, 2 + d, (track.bpm * (1 + c.pitch / 100)).toFixed(1));
        const beat = r.pos <= 0 ? 0 : Math.floor(r.pos / beatSec) % 4;
        const el = beats[d].current;
        if (el && shownText[4 + d] !== String(beat)) {
          shownText[4 + d] = String(beat);
          Array.from(el.children).forEach((child, i) => {
            (child as HTMLElement).style.background = i === beat ? accents[d] : "rgba(255,255,255,0.1)";
          });
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
    // The refs are stable; everything else is read through `live`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const info = (d: 0 | 1) => (
    <div className="flex h-[30px] items-center gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] font-mono text-[11px] font-semibold" style={{ background: alpha(accents[d], 0.18), color: accents[d] }}>
        {d + 1}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[11px] font-medium text-neutral-100">{tracks[d].title}</div>
        <div className="truncate text-[10px] text-neutral-500">{tracks[d].artist}</div>
      </div>
      <span ref={beats[d]} aria-hidden className="flex gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-[5px] w-[9px] rounded-[1px]" style={{ background: "rgba(255,255,255,0.1)" }} />
        ))}
      </span>
      <div className="flex w-[52px] flex-col items-end leading-tight">
        <span ref={time[d]} className="font-mono text-[12px] tabular-nums text-neutral-100" />
        <span className="text-[8px] uppercase tracking-[0.1em] text-neutral-500">Remain</span>
      </div>
      <div className="flex w-[44px] flex-col items-end leading-tight">
        <span ref={bpm[d]} className="font-mono text-[12px] tabular-nums text-neutral-100" />
        <span className="text-[8px] uppercase tracking-[0.1em] text-neutral-500">BPM</span>
      </div>
    </div>
  );

  return (
    <div className="shrink-0 rounded-2xl p-[9px]" style={{ ...well, border: "1px solid rgba(255,255,255,0.06)" }} aria-label="Deck display" role="img">
      <div className="flex flex-col gap-[5px]">
        {info(0)}
        <canvas ref={over[0]} style={{ width: W, height: OVER_H }} />
        <canvas ref={zoom[0]} style={{ width: W, height: ZOOM_H }} />
        <canvas ref={zoom[1]} style={{ width: W, height: ZOOM_H }} />
        <canvas ref={over[1]} style={{ width: W, height: OVER_H }} />
        {info(1)}
      </div>
    </div>
  );
}
