"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CHARSET, charIndex } from "./charset";
import { createFlap, FlapEvent, stepFlap, type Flap } from "./flap";

// The board: rows of flap cells and the engine that turns them.
//
// Every cell is four faces: the static top and bottom halves, and the flap itself, whose front is
// the top half of the character falling away and whose back is the bottom half of the next one.
// The engine runs one rAF loop for the whole board, only while some flap is moving, and writes
// transforms and characters straight to the DOM. React renders the cells once and never again,
// however many flaps turn.
//
// Light comes from above: the falling flap darkens as it tips toward you, its back catches the
// light as it passes horizontal, and it throws a shadow on the half below it as it comes down.

const SIZE = CHARSET.length;

/** Ripple: each cell starts a little after the one to its left, and each row after the one above. */
const COLUMN_DELAY = 0.016;
const ROW_DELAY = 0.06;
const JITTER_DELAY = 0.03;

/** Repeatable 0–1 noise per cell, so the board settles the same way on every visit. */
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Kept in a .tsx file on purpose: the docs Tailwind pass only scans .tsx for class names.
const HALF = "pointer-events-none absolute inset-x-0 h-[calc(50%-0.5px)] overflow-hidden";
const TOP = `${HALF} top-0 rounded-t-[0.5cqw] bg-[linear-gradient(180deg,#2b2b2b,#232323)] shadow-[inset_0_1px_0_rgba(255,255,255,0.075)]`;
// The lip of the flap above shades the first third of every lower half.
const BOTTOM = `${HALF} bottom-0 rounded-b-[0.5cqw] bg-[linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0)_38%),linear-gradient(180deg,#1f1f1f,#1a1a1a)]`;
const GLYPH = "absolute inset-x-0 flex h-[200%] items-center justify-center leading-none";
const OVERLAY = "absolute inset-0 opacity-0";
const HIDDEN_BACK: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

export interface FlapRowLink {
  href: string;
  label: string;
}

export interface FlapBoardProps {
  /** One string per row, each `columns` characters long. Changing a character turns that cell to it. */
  lines: string[];
  columns: number;
  /** Leading columns drawn in the accent colour, with a gap after them (the age column). */
  accent?: number;
  /** A link per row, laid over it; rows with history: true open the card when focused. */
  links?: (FlapRowLink | null)[];
  /** Index of the first row that counts as history (for focus handling in the card). */
  historyFrom?: number;
  /** Rows from `historyFrom` on take pointer clicks only while true. */
  interactive?: boolean;
  /** Reduced motion: characters change in place. */
  still?: boolean;
}

interface Faces {
  topText: HTMLElement;
  bottomText: HTMLElement;
  back: HTMLElement;
  backText: HTMLElement;
  glint: HTMLElement;
  front: HTMLElement;
  frontText: HTMLElement;
  shade: HTMLElement;
  cast: HTMLElement;
}

export function FlapBoard({ lines, columns, accent = 0, links, historyFrom = 1, interactive = true, still = false }: FlapBoardProps) {
  const board = useRef<HTMLDivElement | null>(null);
  const engine = useRef<ReturnType<typeof createEngine> | null>(null);
  const rows = lines.length;

  useEffect(() => {
    const root = board.current;
    if (!root) return;
    const faces = [...root.querySelectorAll<HTMLElement>("[data-flap]")].map(readFaces);
    engine.current = createEngine(faces, columns);
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
  }, [rows, columns]);

  const text = lines.join("\n");
  useEffect(() => {
    engine.current?.set(text.split("\n"), still);
  }, [text, still, rows, columns]);

  const template = accent > 0 ? `repeat(${accent}, 1fr) 0.5fr repeat(${columns - accent}, 1fr)` : `repeat(${columns}, 1fr)`;

  return (
    <div className="relative rounded-[2.6cqw] bg-[#0b0b0b] p-[2.1cqw] shadow-[inset_0_0.4cqw_1cqw_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.06)]">
      <div ref={board} aria-hidden className="flex flex-col gap-y-[1.05cqw]">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="grid gap-x-[0.42cqw]" style={{ gridTemplateColumns: template }}>
            {Array.from({ length: columns }, (_, c) => (
              <Cell key={c} accent={c < accent} style={accent > 0 && c === accent ? { gridColumnStart: accent + 2 } : undefined} />
            ))}
          </div>
        ))}
      </div>

      {/* Links sit over their rows, outside the aria-hidden flaps. */}
      {links && (
        <div className="pointer-events-none absolute inset-[2.1cqw] flex flex-col gap-y-[1.05cqw]">
          {Array.from({ length: rows }, (_, r) => {
            const link = links[r];
            const history = r >= historyFrom;
            return (
              <div key={r} className="relative flex-1">
                {link && (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    data-sf-history={history ? "" : undefined}
                    className="absolute -inset-[0.5cqw] rounded-[0.9cqw] outline-none transition-colors duration-150 hover:bg-white/[0.025] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-white/35"
                    style={{ pointerEvents: !history || interactive ? "auto" : "none" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Light from above, over the whole face of the board. */}
      <div className="pointer-events-none absolute inset-0 rounded-[2.6cqw] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0)_45%)]" />
    </div>
  );
}

function Cell({ accent, style }: { accent: boolean; style?: CSSProperties }) {
  return (
    <span
      data-flap
      className="relative block aspect-[7/10] rounded-[0.5cqw] bg-[#070707] text-[2.95cqw] font-semibold shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.6)] [perspective:32cqw]"
      style={{ color: accent ? "#efb54a" : "#ece8de", ...style }}
    >
      <span className={TOP}>
        <span className={`${GLYPH} top-0`} />
      </span>
      <span className={BOTTOM}>
        <span className={`${GLYPH} bottom-0`} />
        <span className={`${OVERLAY} bg-[linear-gradient(180deg,rgba(0,0,0,0.9),rgba(0,0,0,0.3))]`} />
      </span>
      <span className={`${BOTTOM} origin-top`} style={{ ...HIDDEN_BACK, transform: "rotateX(0deg)" }}>
        <span className={`${GLYPH} bottom-0`} />
        <span className={`${OVERLAY} bg-white`} />
      </span>
      <span className={`${TOP} origin-bottom`} style={HIDDEN_BACK}>
        <span className={`${GLYPH} top-0`} />
        <span className={`${OVERLAY} bg-black`} />
      </span>
      {/* Hinge pins, either side of the split. */}
      <span className="pointer-events-none absolute left-0 top-1/2 h-[14%] w-[8%] -translate-y-1/2 rounded-r-[1px] bg-[#0c0c0c] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
      <span className="pointer-events-none absolute right-0 top-1/2 h-[14%] w-[8%] -translate-y-1/2 rounded-l-[1px] bg-[#0c0c0c] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
    </span>
  );
}

function readFaces(cell: HTMLElement): Faces {
  const [top, bottom, back, front] = [...cell.children] as HTMLElement[];
  return {
    topText: top.children[0] as HTMLElement,
    bottomText: bottom.children[0] as HTMLElement,
    cast: bottom.children[1] as HTMLElement,
    back,
    backText: back.children[0] as HTMLElement,
    glint: back.children[1] as HTMLElement,
    front,
    frontText: front.children[0] as HTMLElement,
    shade: front.children[1] as HTMLElement,
  };
}

function createEngine(faces: Faces[], columns: number) {
  const flaps: Flap[] = faces.map((_, i) => createFlap(0, 0.93 + 0.14 * noise(i)));
  let raf = 0;
  let last = 0;

  const glyph = (i: number) => CHARSET[i] === " " ? "" : CHARSET[i];
  const write = (el: HTMLElement, i: number) => {
    const ch = glyph(i);
    if (el.textContent !== ch) el.textContent = ch;
  };

  // A flap was released: the falling front still shows the old top half; the half it uncovers and
  // the back that will land both show the next character.
  const release = (cell: Faces, cur: number) => {
    const next = (cur + 1) % SIZE;
    write(cell.topText, next);
    write(cell.backText, next);
    write(cell.frontText, cur);
    write(cell.bottomText, cur);
  };
  // Landed for good: every face agrees, so the rebound shows the same character underneath.
  const rest = (cell: Faces, cur: number) => {
    write(cell.bottomText, cur);
    write(cell.frontText, cur);
  };

  const paint = (cell: Faces, f: Flap) => {
    const falling = f.phase === "flip";
    const rad = (f.theta * Math.PI) / 180;
    cell.front.style.transform = `rotateX(${falling ? -f.theta : 0}deg)`;
    cell.back.style.transform = `rotateX(${180 - f.theta}deg)`;
    cell.shade.style.opacity = falling && f.theta < 90 ? ((f.theta / 90) * 0.6).toFixed(3) : "0";
    cell.glint.style.opacity = f.theta > 90 && f.phase !== "idle" ? (Math.sin(rad) * 0.16).toFixed(3) : "0";
    cell.cast.style.opacity = f.phase !== "idle" ? (Math.sin(rad) * 0.55).toFixed(3) : "0";
  };

  const tick = (now: number) => {
    const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
    last = now;
    let moving = false;
    for (let i = 0; i < flaps.length; i++) {
      const f = flaps[i];
      if (f.phase === "idle" && f.cur === f.target) continue;
      moving = true;
      const event = stepFlap(f, dt, SIZE);
      if (event === FlapEvent.Start || event === FlapEvent.LandStart) release(faces[i], f.cur);
      else if (event === FlapEvent.Land) rest(faces[i], f.cur);
      paint(faces[i], f);
    }
    if (moving) raf = requestAnimationFrame(tick);
    else {
      raf = 0;
      last = 0;
    }
  };

  return {
    set(lines: string[], still: boolean) {
      flaps.forEach((f, i) => {
        const r = Math.floor(i / columns);
        const c = i % columns;
        const target = charIndex(lines[r]?.[c] ?? " ");
        if (still) {
          Object.assign(f, { cur: target, target, theta: 180, omega: 0, phase: "idle", delay: 0 });
          const cell = faces[i];
          [cell.topText, cell.bottomText, cell.backText, cell.frontText].forEach((el) => write(el, target));
          paint(cell, f);
          return;
        }
        if (f.target === target) return;
        f.target = target;
        // A flap already turning just carries on to the new character; a resting one joins the ripple.
        if (f.phase === "idle") f.delay = c * COLUMN_DELAY + r * ROW_DELAY + noise(i + 101) * JITTER_DELAY;
      });
      if (!still && !raf) raf = requestAnimationFrame(tick);
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
