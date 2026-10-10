# Stacked Card Fan

Three cards start as a deck held like a hand of cards: one in front, the two behind it tilted a few degrees outward (−4° and +5°) so only their top corners fan out past the front card. On load the back cards sit flat and hidden, then tilt out once, as if they're about to come out. As the visitor scrolls (wheel, touch, or arrow keys) **while at the top of the page**, the stack fans out: the back cards straighten while they slide out and land flat. On desktop and tablet they form a row of three; on mobile they drop into a vertical column. The page itself doesn't scroll until the fan is fully open, then scrolling carries on normally. Scrolling back up at the top folds them away again.

Taken from the homepage of my blog. This version takes any three React nodes as cards, so it works for posts, products, testimonials, pricing tiers or anything else.

---

## 1. Prompt (paste this into your UI project's assistant)

> Add a `StackedCardFan` component to this project using the code in this file, keeping the motion maths exactly as written and adapting only:
>
> 1. Put it in our components folder as `stacked-card-fan.tsx` (kebab-case file, named export). It is a client component (`"use client"`).
> 2. It has no card design of its own: it positions whatever nodes it gets in `cards`. Render our existing card component for each item (or, if we don't have one, use the `DemoCard` from the usage section, restyled with our tokens).
> 3. Use our design tokens for the heading and footer link (`text-foreground`, `border-border`, `bg-background`, our accent colour). Don't add an animation library; the motion is a hand-rolled spring on `requestAnimationFrame` plus one CSS transition for the entrance.
> 4. **Only use it once per page, as the first section.** It intercepts wheel, touch and arrow keys while `window.scrollY` is near 0, so a second instance or a placement lower on the page would fight the scroll.
> 5. Keep the reduced-motion branch: with `prefers-reduced-motion: reduce` it renders fully fanned, skips the entrance and never intercepts scrolling.
> 6. Keep the opaque `bg-background` behind each card slot. If our cards have a translucent background, the back card's text would otherwise show through the front card.
>
> After adding it, show me the page you put it on and which cards you passed.

---

## 2. How it works

**One number drives everything.** `progress` runs from 0 (stacked) to 1 (fanned). Every card's position is a pure function of `easeOutCubic(progress)`, so there's no timeline and no per-card state.

**Input → target → spring.** Input never sets `progress` directly. It nudges `target` (wheel: `deltaY × 0.0018`, clamped to 0.04–0.22 per event; touch: `deltaY × 0.0035`; ArrowDown, PageDown or Space: 0.34). A `requestAnimationFrame` loop then eases the live value toward the target by 16% of the gap each frame. That turns jittery trackpad deltas into one smooth glide, and the loop stops as soon as it settles within 0.002.

**Scroll capture rules.** Input is captured only when `scrollY ≤ 2`:
- scrolling down while the fan isn't fully open → `preventDefault`, open it further;
- scrolling up while it's open at all → `preventDefault`, close it;
- otherwise the browser scrolls normally.

If the visitor lands lower on the page (anchor link, scroll restoration), a scroll listener snaps it fully open so they never see a half-stacked fan mid-page.

**Shared top edge.** All three cards live in one box the width of a card. The front card is in normal flow and sets the box's height; the back cards are `absolute inset-x-0 top-0`. So every card starts from the same top edge, whatever the height of its content. (If each card were centred on its own, a shorter back card would sit lower and its corners would hide behind the front card.)

**The resting pose — a hand of cards.** The back cards pivot from their **bottom edge** (`transform-origin: bottom`), so a small rotation splays only their tops apart, while the bottoms stay hidden behind the front card. Asymmetric angles (−4° / +5°) read as placed by hand rather than mirrored. Because scaling from the bottom lowers the top edge, each back card is also lifted a few px so the corners stay visible.

**Depth without transparency.** Back cards are dimmed with `filter: brightness()` and stay fully opaque. Semi-transparent cards let each other show through, which looks cheap.

**Untilt before landing.** Rotation uses its own, faster curve, `easeOutCubic(min(1, progress × 1.25))`, so the cards are flat before they reach their final position and land calm.

**Entrance.** A `settled` flag flips two animation frames after mount. Until then the rest pose is multiplied by 0 (flat, hidden); after, by 1. A CSS transition (700ms, `cubic-bezier(0.22, 1, 0.36, 1)`, second card 120ms later) carries that one change. The transition is set to `none` as soon as `progress` leaves 0, so it never fights the rAF loop.

**Card geometry** (e = `easeOutCubic(progress)`, t = `easeOutCubic(min(1, progress × 1.25))`, r = `settled × (1 − e)`).

| | Front card | Left / first back card | Right / second back card |
| --- | --- | --- | --- |
| z-index | 30 | 20 | 10 |
| x (≥ 768px) | 0 | `-e × spread` | `+e × spread` |
| x (mobile) | 0 | `-e × 16` | `+e × 16` |
| y (≥ 768px) | 0 | `-9 × r` | `-16 × r` |
| y (mobile) | 0 | `-9 × r + e × 210` | `-16 × r + e × 420` |
| rotate | 0 | `-4° × settled × (1 − t)` (−3° mobile) | `+5° × settled × (1 − t)` (+3.5° mobile) |
| scale | 1 | `1 − 0.03 × r` | `1 − 0.06 × r` |
| brightness | 1 | `1 − 0.14 × r` | `1 − 0.26 × r` |
| transform-origin | — | bottom | bottom |
| pointer-events | auto | none until e ≥ 0.5 | none until e ≥ 0.5 |

`spread` is 395px at ≥ 1140px wide and 320px from 768px to 1139px. On mobile the stage's `min-height` grows from 460px to 880px with progress, so the column has room and the footer link moves down with it.

---

## 3. Code: `stacked-card-fan.tsx`

```tsx
"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export interface StackedCardFanProps {
  /** Up to three cards, front first. Missing ones repeat the first. */
  cards: readonly ReactNode[];
  /** Rendered above the stage. */
  heading?: ReactNode;
  /** Rendered below the stage, e.g. a "View all" link. */
  footer?: ReactNode;
  /** Tailwind width classes for the card box (all three cards share it). */
  cardWidthClassName?: string;
  className?: string;
}

const DESKTOP_MIN = 1140;
const TABLET_MIN = 768;
const SETTLE_EPSILON = 0.002;
const SPRING = 0.16;

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
function restPoses(isRow: boolean): { left: RestPose; right: RestPose } {
  return {
    left: { tilt: isRow ? -4 : -3, lift: 9, scale: 0.97, brightness: 0.86 },
    right: { tilt: isRow ? 5 : 3.5, lift: 16, scale: 0.94, brightness: 0.74 },
  };
}

function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export function StackedCardFan({
  cards,
  heading,
  footer,
  cardWidthClassName = "w-[310px] sm:w-[350px] md:w-[370px]",
  className = "",
}: Readonly<StackedCardFanProps>) {
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1200);
  // Back cards render flat behind the front card, then tilt out once after
  // first paint: the "about to come out" moment.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    // Two frames so the flat pose is painted before the transition starts.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setSettled(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targetRef.current = 1;
      currentRef.current = 1;
      setProgress(1);
      return;
    }

    const atTop = () => window.scrollY <= 2;
    const fullyOpen = () => targetRef.current >= 1 && currentRef.current >= 0.98;

    function animate() {
      if (frameRef.current !== null) return;
      const tick = () => {
        const diff = targetRef.current - currentRef.current;
        if (Math.abs(diff) > SETTLE_EPSILON) {
          currentRef.current += diff * SPRING;
          setProgress(currentRef.current);
          frameRef.current = requestAnimationFrame(tick);
        } else {
          currentRef.current = targetRef.current;
          setProgress(targetRef.current);
          frameRef.current = null;
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    }

    // Returns true when the input was consumed by the fan.
    function nudge(delta: number): boolean {
      if (!atTop()) return false;
      if (delta > 0 && !fullyOpen()) {
        targetRef.current = clamp01(targetRef.current + delta);
        animate();
        return true;
      }
      if (delta < 0 && targetRef.current > 0) {
        targetRef.current = clamp01(targetRef.current + delta);
        animate();
        return true;
      }
      return false;
    }

    function handleWheel(event: WheelEvent) {
      const step = Math.min(Math.max(Math.abs(event.deltaY) * 0.0018, 0.04), 0.22);
      if (nudge(Math.sign(event.deltaY) * step)) event.preventDefault();
    }

    let touchY = 0;
    function handleTouchStart(event: TouchEvent) {
      if (event.touches[0]) touchY = event.touches[0].clientY;
    }
    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;
      const deltaY = touchY - touch.clientY;
      if (nudge(deltaY * 0.0035)) {
        if (event.cancelable) event.preventDefault();
        touchY = touch.clientY;
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const active = document.activeElement;
      if (
        active &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }
      let delta = 0;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) delta = 0.34;
      if (["ArrowUp", "PageUp"].includes(event.key)) delta = -0.34;
      if (delta !== 0 && nudge(delta)) event.preventDefault();
    }

    function handleScroll() {
      // Arrived mid-page (anchor, restored scroll): show the finished fan.
      if (window.scrollY > 20 && targetRef.current < 1) {
        targetRef.current = 1;
        currentRef.current = 1;
        setProgress(1);
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
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, []);

  const front = cards[0];
  if (front === undefined) return null;
  const left = cards[1] ?? front;
  const right = cards[2] ?? front;

  const e = easeOutCubic(progress);
  // The tilt resolves a little ahead of the slide, so cards land flat.
  const t = easeOutCubic(Math.min(1, progress * 1.25));
  const isDesktop = viewportWidth >= DESKTOP_MIN;
  const isRow = viewportWidth >= TABLET_MIN;
  const spreadX = isDesktop ? 395 : isRow ? 320 : 0;
  const spreadY = isRow ? 0 : 210;
  const rest = restPoses(isRow);
  // Before the entrance settles, the back cards sit flat and hidden.
  const pose = settled ? 1 : 0;

  function backStyle(
    card: RestPose,
    x: number,
    y: number,
    zIndex: number,
    delayMs: number
  ): CSSProperties {
    const atRest = pose * (1 - e);
    const tilt = card.tilt * pose * (1 - t);
    const scale = 1 - (1 - card.scale) * atRest;
    const brightness = 1 - (1 - card.brightness) * atRest;
    return {
      transform: `translate3d(${x}px, ${y - card.lift * atRest}px, 0) rotate(${tilt}deg) scale(${scale})`,
      filter: `brightness(${brightness})`,
      // The transition only carries the entrance; once scrolling starts the
      // rAF loop drives every frame and a transition would make it lag.
      // Delay lives inside the shorthand: React warns when `transition` and
      // `transitionDelay` are mixed.
      transition:
        progress === 0
          ? `transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, filter 700ms ease-out ${delayMs}ms`
          : "none",
      zIndex,
      // The corners are too thin to hover meaningfully while stacked.
      pointerEvents: e < 0.5 ? "none" : "auto",
    };
  }

  const leftStyle = backStyle(
    rest.left,
    isRow ? -e * spreadX : -e * 16,
    e * spreadY,
    20,
    0
  );
  const rightStyle = backStyle(
    rest.right,
    isRow ? e * spreadX : e * 16,
    e * spreadY * 2,
    10,
    120
  );

  const backSlot =
    "absolute inset-x-0 top-0 origin-bottom will-change-transform motion-reduce:transition-none!";
  const backCard =
    "rounded-2xl bg-background shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1";

  return (
    <section
      className={`relative flex min-h-[calc(100dvh-5.5rem)] w-full flex-col items-center justify-between overflow-hidden px-4 pt-6 pb-12 sm:pt-8 sm:pb-16 ${className}`}
    >
      {heading ? (
        <div className="relative z-40 mb-6 select-none text-center sm:mb-8">
          {heading}
        </div>
      ) : null}

      <div
        className="relative flex w-full max-w-6xl items-center justify-center"
        style={{ minHeight: isRow ? 480 : 460 + e * 420 }}
      >
        {/* All three cards share this box's top edge, so the pose doesn't
            depend on how tall each card's content is. */}
        <div className={`relative ${cardWidthClassName}`}>
          {/* Back cards first in DOM order; z-index sets the stacking. */}
          <div className={backSlot} style={leftStyle}>
            <div className={backCard}>{left}</div>
          </div>
          <div className={backSlot} style={rightStyle}>
            <div className={backCard}>{right}</div>
          </div>
          <div className="relative will-change-transform" style={{ zIndex: 30 }}>
            <div className="rounded-2xl bg-background shadow-2xl ring-1 ring-border/50 transition-transform hover:-translate-y-1">
              {front}
            </div>
          </div>
        </div>
      </div>

      {footer ? <div className="relative z-40 mt-8 sm:mt-10">{footer}</div> : null}
    </section>
  );
}
```

---

## 4. Usage

```tsx
import Link from "next/link";

import { StackedCardFan } from "@/components/stacked-card-fan";

type Item = { title: string; excerpt: string; href: string; tag: string };

function DemoCard({ item }: Readonly<{ item: Item }>) {
  return (
    <Link
      className="grid gap-3 rounded-2xl border border-border bg-card p-5 text-card-foreground"
      href={item.href}
    >
      <span className="w-fit rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
        {item.tag}
      </span>
      <h3 className="text-balance font-medium text-lg leading-snug">{item.title}</h3>
      <p className="line-clamp-3 text-muted-foreground text-sm">{item.excerpt}</p>
    </Link>
  );
}

export default function Home({ items }: Readonly<{ items: Item[] }>) {
  return (
    <StackedCardFan
      cards={items.slice(0, 3).map((item) => <DemoCard item={item} key={item.href} />)}
      footer={
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-muted-foreground text-xs backdrop-blur-sm hover:text-foreground"
          href="/blog"
        >
          View all articles <span aria-hidden="true">→</span>
        </Link>
      }
      heading={
        <h1 className="text-balance text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          I write <em className="font-serif">blogs</em> too
        </h1>
      }
    />
  );
}
```

Pairs well with the Matrix Ripple Background behind it: put the background first inside a `relative overflow-hidden` wrapper, then this section.

---

## 5. Tuning knobs

All of the resting look lives in `restPoses()`.

| Want | Change |
| --- | --- |
| More or less fan | `tilt` (−4° / +5°; −3° / +3.5° on mobile). Past about 7° it stops reading as "held" and starts reading as "dropped". Keep the two slightly unequal. |
| Corners peeking higher | `lift` (9 / 16px). Raise it together with lowering `scale`, since a bottom-origin shrink pulls the top edge down. |
| Stronger or weaker depth | `brightness` (0.86 / 0.74) and `scale` (0.97 / 0.94). Don't swap brightness for opacity. |
| Slower or faster entrance | The 700ms and the 120ms stagger in `backStyle`. |
| Cards still tilted when they land | Raise the `1.25` in `t` so the tilt resolves earlier. |
| Fewer scroll ticks to fully open | Raise the wheel multiplier `0.0018` or the 0.04 minimum step. |
| Snappier or floatier settle | `SPRING` (0.16): higher snaps, lower glides. |
| Wider desktop row | `spreadX` 395 → e.g. 420 (keep it at least the card width plus a gap, or cards overlap). |
| Different breakpoints | `DESKTOP_MIN` / `TABLET_MIN`. |

**Caveats**
- It renders at a 1200px viewport width on the server and corrects after mount. On first paint the back cards are flat and hidden behind the front card (the entrance hasn't run yet), so a mobile visitor sees no layout jump.
- `setProgress` runs once per animation frame only while the spring is moving. That re-renders the section about 20–40 times per gesture, which is cheap for three cards. If your cards are heavy, memoise them before passing them in.
- `filter: brightness()` on the back cards creates a compositing layer each. Fine for three cards; don't reuse the pattern for dozens.
