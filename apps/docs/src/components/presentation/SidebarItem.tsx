import { useEffect, useRef, useSyncExternalStore, memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { RegistryEntry } from "@/registry";

// The navigator list hangs off a ruler: every 30px row carries six evenly spaced ticks (5px
// pitch), one of them level with the name, so the ticks run unbroken down each group. Each
// group's ruler starts on its first component's name tick and ends on its last one's; group
// headings stand clear of it. Every plain tick is identical.
//
// When the pointer (or keyboard) reaches a row, its name tick stretches out and turns white and
// the label springs right, overshooting a touch before it settles. Leaving, it eases back on a
// calmer spring, so moving down the list leaves a soft trail of rows settling behind the pointer.
// The component being presented keeps its tick extended and its label shifted.

// Entering: a soft spring with a visible bounce. Leaving: no bounce, so the trail reads smooth.
const ENTER = { type: "spring", stiffness: 260, damping: 14, mass: 0.6 } as const;
const LEAVE = { type: "spring", stiffness: 220, damping: 26, mass: 0.7 } as const;
// The name tick (row centre, 15px) and the five around it, on a 5px grid. The first row of a
// group drops the ones above its name, the last row the ones below.
const ABOVE = [0, 5, 10];
const NAME_TICK = 15;
const BELOW = [20, 25];
const ROW = 30;
const TICK = 14;
// The lit name tick: same left edge as every tick, reaching to ~10px short of the shifted label.
const LIT_LENGTH = 34;
const SHIFT = 10;

// Only the latest few, so the dot still means something.
const NEW = new Set(["hatched-text", "inspect-text", "chat-sidebar", "markdown", "code-block", "message-actions", "prompt-suggestions", "conversation", "message", "prompt-input", "streaming-text", "typing-indicator", "chat-faq", "polaroid-stack", "folder-reveal", "activity-card", "ruler-nav", "charts", "gauge", "chalkboard-404", "otp-input", "polaroid-develop", "color-picker", "pagination", "menubar"]);

// A line width in whole device pixels. A 1px line at 125% scaling is 1.25 device pixels, which crispEdges
// rounds to 1 or 2 depending on where it lands, so every few ticks came out thick. Drawing each
// line exactly one device pixel tall keeps them identical at any scaling.
function subscribeToPixelRatio(onChange: () => void) {
  let query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  const listen = () => {
    onChange();
    query.removeEventListener("change", listen);
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener("change", listen);
  };
  query.addEventListener("change", listen);
  return () => query.removeEventListener("change", listen);
}
function useHairline() {
  // Whole device pixels, as close to 1 CSS px as fits: 1 at 100–150%, 2 at 200%, and so on.
  return useSyncExternalStore(
    subscribeToPixelRatio,
    () => Math.max(1, Math.floor(window.devicePixelRatio)) / window.devicePixelRatio,
    () => 1
  );
}

/**
 * A row's ruler ticks, drawn as SVG lines with crispEdges. A 1px box at a fractional position
 * blurs across two screen pixels and looks fainter than its neighbours; crispEdges snaps every
 * line to exactly one device pixel wherever the row lands and at any zoom, so all ticks match.
 */
function RowTicks({ first, last }: { first: boolean; last: boolean }) {
  const ticks = [...(first ? [] : ABOVE), NAME_TICK, ...(last ? [] : BELOW)];
  const hairline = useHairline();
  return (
    <svg
      aria-hidden="true"
      width={TICK}
      height={ROW}
      shapeRendering="crispEdges"
      className="pointer-events-none absolute top-0 left-6 overflow-visible"
    >
      {ticks.map((y) => (
        <line key={y} x1={0} x2={TICK} y1={y} y2={y} strokeWidth={hairline} style={{ stroke: "var(--tick)" }} />
      ))}
    </svg>
  );
}

interface SidebarItemProps {
  entry: RegistryEntry;
  active: boolean;
  isFocused: boolean;
  onNavigate?: () => void;
  onSelect?: (entry: RegistryEntry) => void;
  onHoverChange: (entry: RegistryEntry | null, rect: DOMRect | null) => void;
  /** This row's position in the list. */
  index?: number;
  /** Called with `index` on pointer enter, so the keyboard highlight follows the pointer. */
  onPoint?: (index: number) => void;
  /** First or last row of its group: the ruler starts or ends on this row's name tick. */
  first?: boolean;
  last?: boolean;
}

function SidebarItemComponent({
  entry,
  active,
  isFocused,
  onNavigate,
  onSelect,
  onHoverChange,
  index = -1,
  onPoint,
  first = false,
  last = false,
}: SidebarItemProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Only the pointer/keyboard stretches a tick; the current component shows through its label.
  // Selected or hovered: the name tick extends and the label shifts.
  const lit = active || isFocused;
  const hairline = useHairline();
  const transition = reduceMotion ? { duration: 0 } : lit ? ENTER : LEAVE;

  const handleClick = () => {
    if (onSelect) onSelect(entry);
    else onNavigate?.();
  };

  const handleMouseEnter = () => {
    onPoint?.(index);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // 160ms delay prevents overlay churn during quick cursor passes
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        onHoverChange(entry, containerRef.current.getBoundingClientRect());
      }
    }, 160);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onHoverChange(null, null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-active={active || undefined}
      data-focused={isFocused || undefined}
      className="relative flex h-[30px] cursor-pointer items-center pr-6 pl-[58px] outline-none select-none"
      role="menuitem"
      tabIndex={-1}
      aria-current={active ? "page" : undefined}
    >
      <RowTicks first={first} last={last} />
      {/* The name tick lit: a white line over the resting one, pinned at the same left edge and
          growing only to the right. Its end point animates (not a scale), so it stays crisp. */}
      <svg
        aria-hidden="true"
        width={LIT_LENGTH}
        height={ROW}
        shapeRendering="crispEdges"
        className="pointer-events-none absolute top-0 left-6 overflow-visible"
      >
        <motion.line
          x1={0}
          y1={NAME_TICK}
          y2={NAME_TICK}
          strokeWidth={hairline}
          stroke="#fafafa"
          initial={false}
          animate={{ x2: lit ? LIT_LENGTH : TICK, opacity: lit ? 1 : 0 }}
          // Length bounces; brightness just eases, so it never flickers through the overshoot.
          transition={{ ...transition, opacity: { duration: reduceMotion ? 0 : lit ? 0.12 : 0.28, ease: "easeOut" } }}
        />
      </svg>

      <motion.span
        initial={false}
        animate={{ x: lit ? SHIFT : 0 }}
        transition={transition}
        className={`flex min-w-0 items-center gap-2 font-inter text-[14px] tracking-[-0.01em] transition-colors duration-200 ${
          lit || active ? "text-neutral-50" : "text-neutral-400"
        } ${active ? "font-medium" : ""}`}
      >
        <span className="truncate">{entry.name}</span>
        {NEW.has(entry.slug) && <span aria-label="New" className="size-[5px] shrink-0 rounded-full bg-neutral-300" />}
      </motion.span>
    </div>
  );
}

export const SidebarItem = memo(SidebarItemComponent);

/** A group heading: stands clear of the ruler, the label a step brighter and larger. */
export function SidebarGroupHeader({ label, count, first }: { label: string; count: number; first?: boolean }) {
  return (
    <div
      role="presentation"
      className={`relative flex h-[40px] items-center gap-3 pr-6 pl-[58px] select-none ${first ? "" : "mt-[10px]"}`}
    >
      <span className="font-inter text-[15px] font-medium tracking-[-0.015em] text-neutral-100">{label}</span>
      <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.07),transparent)]" />
      <span className="font-inter text-xs text-neutral-600 tabular-nums">{count}</span>
    </div>
  );
}
