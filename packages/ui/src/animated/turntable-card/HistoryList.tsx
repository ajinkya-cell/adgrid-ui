"use client";

import { useState } from "react";
import { motion, type MotionValue } from "framer-motion";
import { formatAgo } from "./time";
import type { Track } from "./types";
import { useReveal } from "./reveal";

// The "Before that" list. Rows arrive one after another as `open` grows, each over its own
// overlapping slice of the range, so the stagger is positional rather than timed and runs in
// reverse when the card closes.

// Kept in a .tsx file on purpose: the docs Tailwind pass only scans .tsx for class names.
export const EYEBROW =
  "text-[clamp(11px,2.3cqw,13px)] font-medium uppercase leading-none tracking-[0.08em] text-[#888]";
/** Room on the left of each eyebrow for the Spotify mark. */
export const EYEBROW_INDENT = "pl-[calc(clamp(13px,2.7cqw,15px)+clamp(6px,1.45cqw,8px))]";

const SPOTIFY_PATH =
  "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z";

/** The Spotify mark at the card's top-left: muted grey at rest, Spotify green with a soft glow while a song plays. */
export function SpotifyMark({ live }: { live: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="absolute left-0 top-[-0.13em] z-10 size-[clamp(13px,2.7cqw,15px)] transition-[color,filter] duration-700 ease-out"
      style={{ color: live ? "#1DB954" : "#5f5f5f", filter: live ? "drop-shadow(0 0 5px rgba(29,185,84,0.55))" : "none" }}
    >
      <path fill="currentColor" d={SPOTIFY_PATH} />
    </svg>
  );
}

const ROW_START = 0.38;
const ROW_STEP = 0.08;
const ROW_SPAN = 0.4;

export function HistoryList({
  open,
  tracks,
  heading,
  interactive,
  still,
}: {
  open: MotionValue<number>;
  tracks: Track[];
  heading: string;
  /** False while mostly closed: rows can't be clicked. */
  interactive: boolean;
  still: boolean;
}) {
  const head = useReveal(open, { range: [0.3, 0.65], y: 8, still });

  return (
    // Rows stay in the tab order while closed: tabbing onto one is what opens the card for keyboard
    // users (see TurntableCard onFocus). Pointer clicks only land once it is mostly open.
    <div data-tt-history className="absolute inset-x-0 top-0 max-w-[49%]" style={{ pointerEvents: interactive ? "auto" : "none" }}>
      <motion.p style={head} className={`${EYEBROW} ${EYEBROW_INDENT}`}>
        {heading}
      </motion.p>
      <ol className="mt-[clamp(8px,2.2cqw,12px)] flex flex-col gap-[clamp(2px,0.7cqw,4px)]">
        {tracks.map((track, i) => (
          <HistoryRow key={`${i}-${track.title}`} track={track} open={open} index={i} still={still} />
        ))}
      </ol>
    </div>
  );
}

function HistoryRow({ track, open, index, still }: { track: Track; open: MotionValue<number>; index: number; still: boolean }) {
  const start = ROW_START + ROW_STEP * index;
  const style = useReveal(open, { range: [start, Math.min(1, start + ROW_SPAN)], y: 10, blur: 4, still });
  const ago = formatAgo(track.playedAt);
  const [failed, setFailed] = useState<string | null>(null);
  const showArt = track.image && failed !== track.image;

  const body = (
    <>
      <span className="relative size-[clamp(28px,6.4cqw,36px)] shrink-0 overflow-hidden rounded-[6px] bg-[#222] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_6px_rgba(0,0,0,0.5)]">
        {showArt && (
          <img
            src={track.image}
            alt=""
            draggable={false}
            decoding="async"
            loading="lazy"
            onError={() => setFailed(track.image ?? null)}
            className="h-full w-full object-cover"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[clamp(11.5px,2.4cqw,13.5px)] font-semibold leading-[1.3] text-[#e5e5e5]">{track.title}</span>
        <span className="flex whitespace-nowrap text-[clamp(10px,2.05cqw,11.5px)] leading-[1.35] text-[#888]">
          <span className="min-w-0 truncate">{track.artist}</span>
          {ago && (
            <span className="shrink-0 pl-[0.35em]" suppressHydrationWarning>
              · {ago}
            </span>
          )}
        </span>
      </span>
    </>
  );

  const row =
    "-mx-2 flex items-center gap-[clamp(9px,2.15cqw,12px)] rounded-[10px] px-2 py-[clamp(3px,0.9cqw,5px)] outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white/35";

  return (
    <motion.li style={style}>
      {track.url ? (
        <a href={track.url} target="_blank" rel="noopener noreferrer" className={`${row} hover:bg-white/[0.04]`}>
          {body}
        </a>
      ) : (
        <div className={row}>{body}</div>
      )}
    </motion.li>
  );
}
