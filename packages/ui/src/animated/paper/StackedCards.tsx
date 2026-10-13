"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import PaperTile, { EASE_SOFT, type PaperImage } from "./PaperTile";

const SIZES = "(min-width: 1152px) 250px, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw";

// Each sheet's lean (deg) and nudge (px) in the pile, cycled through in order. Fixed rather than
// random so the pile looks the same on every load and the server and client agree.
const PILE = [
  { r: -7, x: -10, y: 6 },
  { r: 5, x: 12, y: -4 },
  { r: -3, x: -4, y: -10 },
  { r: 8, x: 8, y: 8 },
  { r: -9, x: -14, y: -2 },
  { r: 3, x: 4, y: 12 },
  { r: 6, x: 14, y: 2 },
  { r: -5, x: -8, y: -8 },
];

// `pile`: height of the stacked section; `full`: height of the spread-out collage; `moves`: how far
// each sheet travels from its place in the collage to the middle of the pile.
type Layout = { pile: number; full: number; moves: { dx: number; dy: number }[] };

export interface StackedCardsProps {
  images: PaperImage[];
  /** The image that lies straight on top of the pile. Defaults to the first. */
  topSrc?: string;
  /** Caption under the closed pile. Empty hides it. */
  hint?: string;
  spreadLabel?: string;
  gatherLabel?: string;
  /** Gap (ms) between one sheet setting off and the next, as they deal out or gather back. */
  stagger?: number;
  /** Time (ms) each sheet takes to travel, and the section to resize. */
  duration?: number;
  /** How much the leans grow while the pile is hovered or focused. */
  fan?: number;
  /** Caption, focus ring and gather-arrow colour. */
  inkColor?: string;
  /** Gather button background. */
  surfaceColor?: string;
  className?: string;
}

// A loose pile of paper with `topSrc` on top. Clicking the pile deals every sheet out to its place
// in a masonry collage; a handle that stays in view while scrolling through the collage gathers them
// back. The collage is always laid out underneath, and the pile is just each sheet moved
// (transformed) from its own spot to the centre, so the two states always agree and the move
// between them is one transition.
export function StackedCards({
  images,
  topSrc,
  hint = "Tap to spread",
  spreadLabel = `Spread out all ${images.length} images`,
  gatherLabel = "Stack the images back into a pile",
  stagger = 25,
  duration = 700,
  fan = 1.8,
  inkColor = "#e7e5df",
  surfaceColor = "#151515",
  className,
}: StackedCardsProps) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pileButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [fanned, setFanned] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  // Off until the first layout is in place, so the sheets don't fly into the pile on load.
  const [animate, setAnimate] = useState(false);
  // True while the sheets deal out or gather back; only then are their starts staggered, so the
  // hover fan answers at once.
  const [moving, setMoving] = useState(false);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const top = Math.max(0, topSrc ? images.findIndex((image) => image.src === topSrc) : 0);
  const last = (images.length - 1) * stagger;

  // Measure where every sheet sits in the collage, again whenever the column count changes. The
  // observer reports once straight away, before the first paint.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      const items = [...list.children] as HTMLElement[];
      const pile = Math.max(...items.map((item) => item.offsetHeight)) + 72;
      const centreX = list.clientWidth / 2;
      setLayout({
        pile,
        full: list.offsetHeight + 24,
        moves: items.map((item) => ({
          dx: centreX - (item.offsetLeft + item.offsetWidth / 2),
          dy: pile / 2 - (item.offsetTop + item.offsetHeight / 2),
        })),
      });
    });
    observer.observe(list);
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(settle.current);
    };
  }, []);

  function travel() {
    setMoving(true);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => setMoving(false), last + duration);
  }

  function spread() {
    travel();
    setOpen(true);
    setFanned(false);
    requestAnimationFrame(() => backButton.current?.focus({ preventScroll: true }));
  }

  function gather() {
    travel();
    setOpen(false);
    // The section shrinks back to the pile; bring the pile into view rather than leaving the reader
    // in the empty space below it.
    const wrap = wrapRef.current;
    if (wrap) {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollTo({ top: wrap.getBoundingClientRect().top + scrollY - 160, behavior: reduce ? "auto" : "smooth" });
    }
    requestAnimationFrame(() => pileButton.current?.focus({ preventScroll: true }));
  }

  const ink = { "--ink": inkColor } as CSSProperties;

  return (
    <div ref={wrapRef} className={className} style={ink}>
      <div
        className={`relative overflow-y-clip ${layout ? "" : "h-[420px] sm:h-[500px]"} ${
          animate ? `transition-[height] ${EASE_SOFT} motion-reduce:transition-none` : ""
        }`}
        // Opening, the section grows ahead of the sheets; closing, it waits for the last one to
        // land before shrinking, so no sheet is clipped on the way.
        style={
          layout
            ? {
                height: open ? layout.full : layout.pile,
                transitionDuration: animate ? `${duration}ms` : undefined,
                transitionDelay: open ? "0ms" : `${last}ms`,
              }
            : undefined
        }
      >
        <ul
          ref={listRef}
          id={listId}
          inert={!open}
          className="relative columns-2 gap-5 px-2 sm:columns-3 sm:gap-7 lg:columns-4"
        >
          {images.map((image, i) => {
            const move = layout?.moves[i];
            const lean = PILE[i % PILE.length];
            const isTop = i === top;
            const tilt = isTop ? -1 : lean.r * (fanned ? fan : 1);
            const style: CSSProperties = {
              zIndex: isTop ? images.length + 1 : images.length - i,
              visibility: move ? undefined : "hidden",
              transform:
                open || !move
                  ? undefined
                  : `translate(${move.dx + (isTop ? 0 : lean.x)}px, ${move.dy + (isTop ? 0 : lean.y)}px) rotate(${tilt}deg)`,
              transitionDuration: animate ? `${duration}ms` : undefined,
              transitionDelay: moving ? `${open ? i * stagger : last - i * stagger}ms` : undefined,
            };
            return (
              <li
                key={image.src}
                style={style}
                className={`relative mb-5 break-inside-avoid sm:mb-7 ${
                  animate ? `transition-transform ${EASE_SOFT} motion-reduce:transition-none` : ""
                }`}
              >
                {/* Eager: the whole pile is on screen at once, even the sheets laid out below. */}
                <PaperTile image={image} index={i} sizes={SIZES} loading="eager" />
              </li>
            );
          })}
        </ul>

        {!open && (
          <button
            ref={pileButton}
            type="button"
            aria-expanded={false}
            aria-controls={listId}
            aria-label={spreadLabel}
            onClick={spread}
            onPointerEnter={() => setFanned(true)}
            onPointerLeave={() => setFanned(false)}
            onFocus={() => setFanned(true)}
            onBlur={() => setFanned(false)}
            className="absolute inset-x-0 top-0 z-50 mx-auto block h-full w-full max-w-sm cursor-pointer rounded-lg border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ink)_50%,transparent)]"
          />
        )}
      </div>

      {open ? (
        // A small "gather" arrow at the right, pinned to the bottom of the screen while the collage
        // is being scrolled through.
        <div className="pointer-events-none sticky bottom-6 z-30 mt-4 flex justify-end">
          <button
            ref={backButton}
            type="button"
            aria-expanded
            aria-controls={listId}
            aria-label={gatherLabel}
            title="Stack them back"
            onClick={gather}
            style={{
              color: inkColor,
              backgroundColor: surfaceColor,
              border: "1px solid rgba(255,255,255,0.08)",
              borderTopColor: "rgba(255,255,255,0.16)",
            }}
            className={`pointer-events-auto grid size-11 cursor-pointer place-items-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_28px_-10px_rgba(0,0,0,0.6)] transition duration-500 ${EASE_SOFT} hover:-rotate-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ink) motion-reduce:transition-none motion-reduce:hover:rotate-0`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 2.64-6.36" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      ) : (
        hint && (
          <p
            aria-hidden
            className="mt-3 text-center text-sm tracking-wide sm:text-base"
            style={{ color: inkColor, fontFamily: '"Special Elite", "Courier Prime", ui-monospace, monospace' }}
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default StackedCards;
