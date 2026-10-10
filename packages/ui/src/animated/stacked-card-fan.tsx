"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "../lib/utils";
import { SimpleCard } from "./SimpleCard";

export interface StackedCardFanProps {
  /** Up to three cards, front first. Missing ones repeat the first. */
  cards: readonly ReactNode[];
  /** Rendered above the stage. */
  heading?: ReactNode;
  /** Rendered below the stage, e.g. a "View all" link. */
  footer?: ReactNode;
  /** Gap between fanned-out cards, in px. */
  gap?: number;
  /** Optional width classes for the card box. Defaults to the front card's own width. */
  cardWidthClassName?: string;
  className?: string;
}

/** Critically damped: glides into place with no overshoot past stacked / fanned. */
const FAN_SPRING = { stiffness: 170, damping: 26, mass: 0.9, restDelta: 0.0005 };
/** The entrance tilt-out is allowed a little bounce: the "about to come out" beat. */
const ENTER_SPRING = { type: "spring", stiffness: 140, damping: 14, mass: 0.9 } as const;
/** Fan progress per px of wheel delta, and the per-event clamp. Smaller = a longer, calmer reveal. */
const WHEEL_RATE = 0.0012;
const WHEEL_MIN = 0.015;
const WHEEL_MAX = 0.1;
const TOUCH_RATE = 0.0028;
const KEY_STEP = 0.25;

interface RestPose {
  /** Degrees; negative leans left. Pivots from the card's bottom edge. */
  tilt: number;
  /** px the card is raised so its corners clear the front card. */
  lift: number;
  scale: number;
  brightness: number;
}

// Resting pose of the back cards: held like a hand of cards. Every value
// eases to neutral (0 / 1) as the cards come out.
const REST: Record<"row" | "column", { left: RestPose; right: RestPose }> = {
  row: {
    left: { tilt: -4, lift: 9, scale: 0.97, brightness: 0.86 },
    right: { tilt: 5, lift: 16, scale: 0.94, brightness: 0.74 },
  },
  column: {
    left: { tilt: -3, lift: 9, scale: 0.97, brightness: 0.86 },
    right: { tilt: 3.5, lift: 16, scale: 0.94, brightness: 0.74 },
  },
};

interface Layout {
  direction: "row" | "column";
  /** Distance from the front card's centre to a fanned card's centre. */
  spread: number;
}

const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Slide curve. */
const slide = (p: number) => easeOutCubic(clamp01(p));
/** The tilt resolves a little ahead of the slide, so cards land flat. */
const untilt = (p: number) => easeOutCubic(clamp01(p * 1.25));

function useBackCardStyle(
  progress: MotionValue<number>,
  enter: MotionValue<number>,
  pose: RestPose,
  side: -1 | 1,
  /** 1 for the nearer back card, 2 for the farther one (column layout). */
  rank: 1 | 2,
  layout: Layout
) {
  const isRow = layout.direction === "row";
  // How much of the resting pose is still applied.
  const atRest = (p: number, n: number) => n * (1 - slide(p));

  const x = useTransform(progress, (p) =>
    isRow ? side * slide(p) * layout.spread : side * slide(p) * 16
  );
  const y = useTransform([progress, enter], ([p, n]: number[]) => {
    const fanned = isRow ? 0 : slide(p) * layout.spread * rank;
    return fanned - pose.lift * atRest(p, n);
  });
  const rotate = useTransform(
    [progress, enter],
    ([p, n]: number[]) => pose.tilt * n * (1 - untilt(p))
  );
  const scale = useTransform(
    [progress, enter],
    ([p, n]: number[]) => 1 - (1 - pose.scale) * atRest(p, n)
  );
  const filter = useTransform([progress, enter], ([p, n]: number[]) => {
    const b = 1 - (1 - pose.brightness) * atRest(p, n);
    return `brightness(${b.toFixed(3)})`;
  });

  return { x, y, rotate, scale, filter };
}

export function StackedCardFan({
  cards,
  heading,
  footer,
  gap = 28,
  cardWidthClassName,
  className,
}: Readonly<StackedCardFanProps>) {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // `target` is where input wants the fan to be; `progress` springs after it.
  // Nothing here re-renders React per frame: motion values write straight to
  // the DOM.
  const target = useMotionValue(0);
  const progress = useSpring(target, FAN_SPRING);
  const enterLeft = useMotionValue(0);
  const enterRight = useMotionValue(0);

  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [stageWidth, setStageWidth] = useState(0);
  // Only flips at the halfway mark, so this re-renders twice per open/close.
  const [open, setOpen] = useState(false);
  useMotionValueEvent(progress, "change", (p) => setOpen(p >= 0.5));

  // Measure the real card and stage instead of guessing from breakpoints, so
  // any card size fans out with an even gap and falls back to a column when
  // three don't fit side by side.
  useEffect(() => {
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return;
    const observer = new ResizeObserver(() => {
      setCardSize({ width: box.offsetWidth, height: box.offsetHeight });
      setStageWidth(stage.offsetWidth);
    });
    observer.observe(box);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const fitsRow = stageWidth === 0 || cardSize.width * 3 + gap * 2 <= stageWidth;
  const layout: Layout = fitsRow
    ? { direction: "row", spread: cardSize.width + gap }
    : { direction: "column", spread: cardSize.height + gap * 0.75 };
  const rest = REST[layout.direction];

  // Entrance: back cards start flat and hidden, then tilt out once.
  useEffect(() => {
    if (reduceMotion) {
      enterLeft.jump(1);
      enterRight.jump(1);
      return;
    }
    const controls = [
      animate(enterLeft, 1, { ...ENTER_SPRING, delay: 0.18 }),
      animate(enterRight, 1, { ...ENTER_SPRING, delay: 0.3 }),
    ];
    return () => controls.forEach((c) => c.stop());
  }, [reduceMotion, enterLeft, enterRight]);

  // Reduced motion: render fully fanned and never touch input.
  useEffect(() => {
    if (!reduceMotion) return;
    target.jump(1);
    progress.jump(1);
  }, [reduceMotion, target, progress]);

  // Scroll input at the top of the page scrubs the fan open / closed. The page
  // itself only scrolls once the fan is fully open.
  useEffect(() => {
    if (reduceMotion) return;

    const atTop = () => window.scrollY <= 2;
    const fullyOpen = () => target.get() >= 1 && progress.get() >= 0.98;

    // Returns true when the input was consumed by the fan.
    function nudge(delta: number): boolean {
      if (!atTop()) return false;
      const t = target.get();
      if ((delta > 0 && !fullyOpen()) || (delta < 0 && t > 0)) {
        target.set(clamp01(t + delta));
        return true;
      }
      return false;
    }

    function handleWheel(event: WheelEvent) {
      const step = Math.min(Math.max(Math.abs(event.deltaY) * WHEEL_RATE, WHEEL_MIN), WHEEL_MAX);
      if (nudge(Math.sign(event.deltaY) * step)) event.preventDefault();
    }

    let touchY = 0;
    function handleTouchStart(event: TouchEvent) {
      if (event.touches[0]) touchY = event.touches[0].clientY;
    }
    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      if (nudge((touchY - touch.clientY) * TOUCH_RATE)) {
        if (event.cancelable) event.preventDefault();
        touchY = touch.clientY;
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) || active.isContentEditable)
      ) {
        return;
      }
      // Space on a focused button or link should press it, not deal cards.
      const onControl = !!active?.closest("button, a, [role='button']");
      let delta = 0;
      if (["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !onControl)) {
        delta = KEY_STEP;
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) delta = -KEY_STEP;
      if (delta !== 0 && nudge(delta)) event.preventDefault();
    }

    function handleScroll() {
      // Arrived mid-page (anchor, restored scroll): show the finished fan.
      if (window.scrollY > 20 && target.get() < 1) {
        target.jump(1);
        progress.jump(1);
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reduceMotion, target, progress]);

  const leftStyle = useBackCardStyle(progress, enterLeft, rest.left, -1, 1, layout);
  const rightStyle = useBackCardStyle(progress, enterRight, rest.right, 1, 2, layout);

  // The front card gives a little as the others slide out from behind it.
  const frontScale = useTransform(progress, (p) => 1 - 0.025 * Math.sin(Math.PI * slide(p)));

  // In a column the stage grows so the fanned cards (and the footer) have room.
  const stageMinHeight = useTransform(progress, (p) =>
    layout.direction === "row"
      ? cardSize.height + 80
      : cardSize.height + 80 + slide(p) * layout.spread * 2
  );

  const front = cards[0];
  if (front === undefined) return null;
  const left = cards[1] ?? front;
  const right = cards[2] ?? front;

  const backSlot = "absolute inset-x-0 top-0 origin-bottom will-change-transform";
  // Opaque backing so translucent cards never show the card behind them.
  const cardShell =
    "rounded-2xl bg-background transition-transform duration-300 ease-out hover:-translate-y-1.5";

  return (
    <section
      className={cn(
        "relative flex min-h-[calc(100dvh-5.5rem)] w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-12 sm:pt-8 sm:pb-16",
        className
      )}
    >
      {heading ? (
        <div className="relative z-40 mb-6 select-none text-center sm:mb-8">{heading}</div>
      ) : null}

      <motion.div
        ref={stageRef}
        className="relative flex w-full max-w-6xl items-start justify-center pt-10"
        style={{ minHeight: stageMinHeight }}
      >
        {/* All three cards share this box's top edge, so the pose doesn't
            depend on how tall each card's content is. */}
        <div
          ref={boxRef}
          className={cn("relative", cardWidthClassName ?? "w-fit")}
        >
          {/* Back cards first in DOM order; z-index sets the stacking. */}
          <motion.div
            className={backSlot}
            style={{ ...leftStyle, zIndex: 20 }}
            aria-hidden={!open}
            inert={!open}
          >
            <div className={cn(cardShell, !open && "pointer-events-none")}>{left}</div>
          </motion.div>
          <motion.div
            className={backSlot}
            style={{ ...rightStyle, zIndex: 10 }}
            aria-hidden={!open}
            inert={!open}
          >
            <div className={cn(cardShell, !open && "pointer-events-none")}>{right}</div>
          </motion.div>
          <motion.div
            className="relative will-change-transform"
            style={{ scale: frontScale, zIndex: 30 }}
          >
            <div className={cardShell}>{front}</div>
          </motion.div>
        </div>
      </motion.div>

      {footer ? <div className="relative z-40 mt-8 sm:mt-10">{footer}</div> : null}
    </section>
  );
}

const DEMO_ITEMS = [
  {
    title: "First Idea",
    description: "A brilliant concept that changes everything.",
    imageUrl: "https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&q=80",
  },
  {
    title: "Second Thought",
    description: "An extension of the first, adding more depth.",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
  },
  {
    title: "Final Vision",
    description: "The culmination of all our efforts combined.",
    imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&q=80",
  },
];

export function StackedCardFanDemo() {
  return (
    <StackedCardFan
      cards={DEMO_ITEMS.map((item) => (
        <SimpleCard
          key={item.title}
          title={item.title}
          description={item.description}
          imageUrl={item.imageUrl}
        />
      ))}
      heading={
        <h1 className="text-balance text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Scroll to reveal <em className="font-serif">animation</em>
        </h1>
      }
    />
  );
}
