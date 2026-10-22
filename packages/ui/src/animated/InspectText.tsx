"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { hatchTile, type HatchedTextDirection } from "./HatchedText";

// Display text whose words can be inspected like a layer in a design tool. Hovering one draws
// a selection frame around it: the frame settles outward, popout handles land on its corners and a
// size chip rises underneath with the word's real measured box. While inspected, the glyphs are
// re-rendered from above as fine diagonal hatching (the HatchedText fill), so the word reads as "selected" without any hue.
// Under reduced motion the frame, handles and fill only fade.

export type InspectTextSize = "sm" | "md" | "lg";

export interface InspectWordProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: string;
  /** Controlled inspected state. */
  inspecting?: boolean;
  defaultInspecting?: boolean;
  onInspectingChange?: (inspecting: boolean) => void;
  /** Show the measured `w × h` chip under the frame. */
  showSize?: boolean;
  /** Hatch tile size in px; lines repeat every `pitch` px. Rounded to whole pixels. */
  pitch?: number;
  /** Hatch line thickness, in px. */
  lineWidth?: number;
  /** Which way the hatch leans: `right` is `/`, `left` is `\`. */
  direction?: HatchedTextDirection;
  /** Hatch line opacity (0–1). */
  intensity?: number;
}

export interface InspectTextProps extends Omit<HTMLAttributes<HTMLParagraphElement>, "children"> {
  /** The line to render. Every word is inspectable; wrap words in asterisks (`Vibrant *Design*`) to limit it to those. */
  text?: string;
  /** Display size: 32, 48 or 72px. */
  size?: InspectTextSize;
  showSize?: boolean;
  pitch?: number;
  lineWidth?: number;
  direction?: HatchedTextDirection;
  intensity?: number;
}

const EASE_OUT = [0.32, 0.72, 0, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;
const SPRING = { type: "spring", stiffness: 500, damping: 32 } as const;

const TEXT_SIZE = {
  sm: "text-[32px]",
  md: "text-[48px]",
  lg: "text-[72px]",
};

const POPOUT = cn(
  "border border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6),0_4px_10px_-2px_rgba(0,0,0,0.5)]"
);

// Handles sit centred on the frame's corners.
const CORNERS = ["-left-[3.5px] -top-[3.5px]", "-right-[3.5px] -top-[3.5px]", "-bottom-[3.5px] -right-[3.5px]", "-bottom-[3.5px] -left-[3.5px]"];

export const InspectWord = forwardRef<HTMLSpanElement, InspectWordProps>(function InspectWord(
  {
    children,
    inspecting: inspectingProp,
    defaultInspecting = false,
    onInspectingChange,
    showSize = true,
    pitch = 3,
    lineWidth = 1,
    direction = "left",
    intensity = 1,
    className,
    onPointerEnter,
    onPointerLeave,
    ...rest
  },
  ref
) {
  const reduceMotion = useReducedMotion() ?? false;
  const [inner, setInner] = useState(defaultInspecting);
  const inspecting = inspectingProp ?? inner;
  const boxRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const set = (next: boolean) => {
    if (inspectingProp === undefined) setInner(next);
    onInspectingChange?.(next);
  };

  // The chip reports the word's own box, like a design tool's selection size.
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBox({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-measure once web fonts settle, since they change the glyph box without resizing the observer's target first.
  useEffect(() => {
    document.fonts?.ready.then(() => {
      const el = boxRef.current;
      if (el) setBox({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) });
    });
  }, []);

  const tile = Math.max(2, Math.round(pitch));
  const hatch = hatchTile(tile, lineWidth, direction, intensity);
  const wipe = { duration: 0.26, ease: EASE_OUT };

  return (
    <span
      ref={ref}
      data-state={inspecting ? "inspecting" : "idle"}
      className={cn("relative inline-block cursor-default", className)}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        set(true);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        set(false);
      }}
      {...rest}
    >
      <span ref={boxRef} className="relative inline-block">
        {/* Solid glyphs. Wiped away from the top as the hatching takes over. */}
        <motion.span
          className="relative block"
          initial={false}
          animate={
            reduceMotion
              ? { opacity: inspecting ? 0 : 1 }
              : { clipPath: inspecting ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)" }
          }
          transition={wipe}
        >
          {children}
        </motion.span>
        {/* Hatched glyphs: diagonal lines over a faint body, both clipped to the letterforms. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 block select-none bg-clip-text text-transparent [-webkit-background-clip:text]" // void-lint-ignore: clips a monochrome hatch texture, not a hue gradient
          style={{
            backgroundImage: `${hatch}, linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.06))`,
            backgroundSize: `${tile}px ${tile}px, 100% 100%`,
          }}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: inspecting ? 1 : 0 }
              : { clipPath: inspecting ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)" }
          }
          transition={wipe}
        >
          {children}
        </motion.span>
      </span>

      <AnimatePresence>
        {inspecting && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-x-[0.12em] -inset-y-[0.04em] block"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_IN } }}
          >
            <span className="absolute inset-0 border border-white/50" />
            {CORNERS.map((corner, i) => (
              <motion.span
                key={corner}
                className={cn("absolute size-[7px] rounded-[1.5px]", corner, POPOUT)}
                initial={reduceMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...SPRING, delay: reduceMotion ? 0 : 0.04 + i * 0.02 }}
              />
            ))}
            {showSize && box.w > 0 && (
              <motion.span
                className={cn(
                  "absolute left-1/2 top-[calc(100%+8px)] flex h-5 -translate-x-1/2 items-center whitespace-nowrap rounded-md px-1.5",
                  "font-mono text-[11px] font-medium leading-none tracking-normal text-neutral-950 tabular-nums",
                  POPOUT
                )}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT, delay: reduceMotion ? 0 : 0.06 }}
              >
                {box.w} × {box.h}
              </motion.span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
});

export const InspectText = forwardRef<HTMLParagraphElement, InspectTextProps>(function InspectText(
  { text = "Vibrant Design", size = "md", showSize = true, pitch = 3, lineWidth = 1, direction = "left", intensity = 1, className, ...rest },
  ref
) {
  // With no asterisks every word is its own layer; with them, only the marked words are.
  const marked = /\*[^*]+\*/.test(text);
  const parts: ReactNode[] = text.split(marked ? /(\*[^*]+\*)/g : /(\S+)/g).map((part, i) => {
    const word = marked ? (part.length > 2 && part.startsWith("*") && part.endsWith("*") ? part.slice(1, -1) : null) : part.trim() ? part : null;
    return word ? (
      <InspectWord key={i} showSize={showSize} pitch={pitch} lineWidth={lineWidth} direction={direction} intensity={intensity}>
        {word}
      </InspectWord>
    ) : (
      part
    );
  });

  return (
    <p
      ref={ref}
      className={cn(
        "whitespace-pre-wrap font-semibold leading-[1.1] tracking-[-0.03em] text-neutral-100",
        TEXT_SIZE[size],
        className
      )}
      {...rest}
    >
      {parts}
    </p>
  );
});
