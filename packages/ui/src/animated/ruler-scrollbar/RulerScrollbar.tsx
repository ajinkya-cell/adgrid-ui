"use client";

import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "../../lib/utils";

export interface RulerScrollbarProps {
  /** Number of ticks on the ruler. */
  ticks?: number;
  /** Tick colour at the current scroll position. */
  activeColor?: string;
  /** Resting tick colour. */
  mutedColor?: string;
  /** Max height of the ruler in px (also capped at 60vh). */
  length?: number;
  /** Width of the highlight around the current position, as a fraction of the ruler. */
  spread?: number;
  /** Extra width a tick gains at the current position (0.35 = +35%). */
  expand?: number;
  /** Click or drag the ruler to scrub the page. */
  interactive?: boolean;
  /** Hide the browser's own scrollbar while the ruler is mounted. */
  hideNativeScrollbar?: boolean;
  className?: string;
}

/** Soft follow: the highlight glides after the page instead of snapping to it. */
const FOLLOW_SPRING = { stiffness: 90, damping: 22, mass: 0.6, restDelta: 0.0001 };
/** Hit area padding, so the thin ticks are easy to grab. */
const PAD_Y = 12;

/** Ruler rhythm: a long tick every 10, a medium one every 5. */
function tickLength(index: number): number {
  if (index % 10 === 0) return 22;
  if (index % 5 === 0) return 16;
  return 11;
}

interface RulerTickProps {
  index: number;
  total: number;
  progress: MotionValue<number>;
  activeColor: string;
  mutedColor: string;
  spread: number;
  expand: number;
}

function RulerTick({ index, total, progress, activeColor, mutedColor, spread, expand }: RulerTickProps) {
  const position = total > 1 ? index / (total - 1) : 0;
  // Bell curve: 1 at the current position, fading out a few ticks either side.
  const influence = useTransform(progress, (p) => Math.exp(-(((p - position) / spread) ** 2)));
  const scaleX = useTransform(influence, (i) => 1 + expand * i);
  const backgroundColor = useTransform(influence, [0, 1], [mutedColor, activeColor]);

  return (
    <motion.span
      className="block h-[1.5px] shrink-0 origin-right rounded-full"
      style={{ width: tickLength(index), scaleX, backgroundColor }}
    />
  );
}

export function RulerScrollbar({
  ticks = 56,
  activeColor = "#e7e5df",
  mutedColor = "rgba(255,255,255,0.18)",
  length = 420,
  spread = 0.06,
  expand = 0.35,
  interactive = true,
  hideNativeScrollbar = false,
  className,
}: Readonly<RulerScrollbarProps>) {
  const [mounted, setMounted] = useState(false);
  const rulerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, FOLLOW_SPRING);
  const progress = reduceMotion ? scrollYProgress : smooth;

  useEffect(() => setMounted(true), []);

  function scrubTo(clientY: number) {
    const ruler = rulerRef.current;
    if (!ruler) return;
    const rect = ruler.getBoundingClientRect();
    const usable = rect.height - PAD_Y * 2;
    const p = Math.min(1, Math.max(0, (clientY - rect.top - PAD_Y) / usable));
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) window.scrollTo(0, p * maxScroll);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!interactive) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    scrubTo(event.clientY);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) scrubTo(event.clientY);
  }

  if (!mounted) return null;

  return createPortal(
    <>
      {hideNativeScrollbar ? (
        <style>{`html{scrollbar-width:none}html::-webkit-scrollbar{display:none}`}</style>
      ) : null}
      {/* Outer: placement + entrance. Inner: hover fade + scrubbing. Kept apart
          so framer's inline transform/opacity don't override the classes. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn("fixed right-5 top-1/2 z-[9999]", className)}
        style={{ y: "-50%" }}
      >
        <div
          ref={rulerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className={cn(
            "flex select-none flex-col items-end justify-between pl-3",
            "opacity-85 transition-opacity duration-300 hover:opacity-100",
            interactive ? "cursor-grab touch-none active:cursor-grabbing" : "pointer-events-none"
          )}
          style={{ height: `min(${length}px, 60vh)`, paddingTop: PAD_Y, paddingBottom: PAD_Y }}
        >
          {Array.from({ length: ticks }, (_, i) => (
            <RulerTick
              key={i}
              index={i}
              total={ticks}
              progress={progress}
              activeColor={activeColor}
              mutedColor={mutedColor}
              spread={spread}
              expand={expand}
            />
          ))}
        </div>
      </motion.div>
    </>,
    document.body
  );
}

export default RulerScrollbar;
