# MoonPull — pull-the-moon cord switch

A hand-drawn crescent moon hangs from the top of a scene on a strand of blue yarn, swaying gently. You grab it and pull it down. The yarn stretches and thins, and the further you pull, the harder it resists. A warm golden glow grows around the moon as you get close to the trigger point. At the trigger point the cord "clicks" like a lamp pull: the moon lets go, springs back up, wobbles, and the component fires `onPull`. In the original portfolio, that drops a full-screen About page over the home scene, and pulling again closes it.

Other details:

- A quick tap, with no real drag, gives the moon a little downward tug, hinting that it can be pulled.
- A small italic "pull me" fades in beside the moon after 2.8s and disappears once it has been pulled.
- Enter or Space on the focused moon fires `onPull` too, so it is fully keyboard-usable.
- With reduced motion on, the sway is switched off and the spring settles quickly instead of bouncing.

> **For the implementing Claude:** reproduce this exactly. Copy the CSS and component as written; the numbers in it (spring constants, rubber-band curve, strand colours, glow) were tuned by eye, and changing them changes the feel. Make changes only through the props or the constants listed under [Tuning](#tuning).

## Requirements

- React 18+ and **Tailwind CSS v4** (uses v4 syntax: `group-[.is-armed]/moon:`, `group-data-[open=true]/moon:`, `z-2`, `size-full`, `@theme` tokens).
- `next/image` for the moon picture. Outside Next.js, see [Without Next.js](#without-nextjs).
- A moon image: a **transparent PNG**, roughly square. The original is a yellow crayon crescent, 265×257 px, with the crescent filling about 45% of the canvas. The string ties onto the image at `ATTACH` (45% across, 28% down), which is the top tip of that crescent. If your art differs, move `ATTACH` (see [Tuning](#tuning)).
- No other dependencies. All physics is hand-written in one `requestAnimationFrame` loop.

## 1. Add the hint animation to your global CSS

In the stylesheet that has `@import "tailwindcss";`:

```css
@theme inline {
  /* Fades the "pull me" hint in after 2.8s and leaves it there. */
  --animate-moon-hint: moon-hint 1.2s ease 2.8s forwards;
}

@keyframes moon-hint {
  to {
    opacity: 0.85;
  }
}
```

This gives you the `animate-moon-hint` class.

## 2. Add the component

`MoonPull.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

// Where the string ties onto the moon image, as a fraction of the image box (top of the crescent).
const ATTACH = { x: 0.45, y: 0.28 };
// Resting string length as a fraction of the stage height.
const REST = 0.13;
// How far (fraction of viewport height) the moon must be pulled down to fire `onPull`.
const THRESHOLD = 0.1;

// Yarn strands, drawn back to front: [stroke, width, dasharray, opacity]
const STRANDS: [string, number, string | undefined, number][] = [
  ["#b9c9ee", 5, "0.6 2.4", 0.55], // fuzz
  ["#a3b8e8", 3.4, undefined, 1], // body
  ["#8aa2db", 1.4, "6 3 2 4", 0.9], // twist shadow
  ["#e1e9f9", 1.1, "2 5 1 7 3 4", 0.9], // highlight fibres
];

export type MoonPullProps = {
  // Whether the thing the moon opens is open; only changes the label and stops the hint.
  open: boolean;
  // Fired once each time the moon is pulled past the threshold (or pressed with Enter / Space).
  onPull: () => void;
  // The moon image: a transparent PNG with the crescent's top at ATTACH.
  src?: string;
  imageWidth?: number;
  imageHeight?: number;
  // Left edge and width of the moon box, as a percentage of the stage width.
  left?: number;
  width?: number;
  // Accessible names for the two states.
  openLabel?: string;
  closedLabel?: string;
  // Small italic text that fades in beside the moon until it's first pulled. Empty hides it.
  hint?: string;
};

// A moon hanging on a strand of yarn from the top of its stage. Drag it down and the string
// stretches (resisting more the further it goes); past the threshold it "clicks", springs back and
// fires `onPull`. A tap gives it a little tug, and at rest it sways gently.
export default function MoonPull({
  open,
  onPull,
  src = "/moon.png",
  imageWidth = 265,
  imageHeight = 257,
  left = 5,
  width = 6,
  openLabel = "Pull the moon to close",
  closedLabel = "Pull the moon to open",
  hint = "pull me",
}: MoonPullProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLButtonElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const onPullRef = useRef(onPull);
  // A unique filter id per moon, so two on one page don't share (or break) each other's filter.
  const filterId = `yarn-${useId().replace(/[^\w-]/g, "")}`;

  useEffect(() => {
    onPullRef.current = onPull;
  }, [onPull]);

  useEffect(() => {
    const root = rootRef.current;
    const moon = moonRef.current;
    if (!root || !moon) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let restLen = 0;
    let moonW = 0;
    let moonH = 0;
    const measure = () => {
      const stageH = root.parentElement?.clientHeight ?? window.innerHeight;
      restLen = stageH * REST;
      moonW = moon.offsetWidth;
      moonH = moon.offsetHeight;
      moon.style.top = `${restLen - moonH * ATTACH.y}px`;
      root.style.setProperty("--rest", `${restLen}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root.parentElement ?? root);

    // Moon offset from rest, its velocity, and drag state.
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let drag: { id: number; sx: number; sy: number; moved: number } | null = null;
    const dragTarget = { x: 0, y: 0 };
    let armed = false;
    let frame = 0;
    const t0 = performance.now();

    const draw = (t: number) => {
      const sway = reduced || drag ? 0 : Math.sin((t - t0) / 650) * Math.max(4, restLen * 0.05);

      if (drag) {
        pos.x += (dragTarget.x - pos.x) * 0.35;
        pos.y += (dragTarget.y - pos.y) * 0.35;
        vel.x = vel.y = 0;
      } else {
        const k = reduced ? 0.2 : 0.07;
        const damp = reduced ? 0.6 : 0.86;
        vel.x = (vel.x + (sway - pos.x) * k) * damp;
        vel.y = (vel.y + (0 - pos.y) * k) * damp;
        pos.x += vel.x;
        pos.y += vel.y;
      }

      const ax = moonW * ATTACH.x;
      const ex = ax + pos.x;
      const ey = restLen + pos.y;
      // Control point lags behind the moon so the string bends as it swings.
      const cx = ax + pos.x * 0.35 - vel.x * 3;
      const cy = ey * 0.55;
      const len = Math.hypot(ex - ax, ey);
      const thin = Math.min(1, Math.max(0.55, restLen / Math.max(len, 1)));
      const d = `M ${ax} -2 Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)} q 3 4 -1 6 q -4 1 -3 -3`;
      pathRefs.current.forEach((p, i) => {
        if (!p) return;
        p.setAttribute("d", d);
        p.style.strokeWidth = String(STRANDS[i][1] * thin);
      });

      const rot = Math.max(-14, Math.min(14, -pos.x * 0.35 + vel.x * 0.8));
      moon.style.transform = `translate(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;

      const tension = Math.max(0, Math.min(1, pos.y / (window.innerHeight * THRESHOLD)));
      root.style.setProperty("--tension", tension.toFixed(3));
      const nowArmed = !!drag && tension >= 1;
      if (nowArmed !== armed) {
        armed = nowArmed;
        root.classList.toggle("is-armed", armed);
      }
      if (armed && drag) {
        // The cord "clicks" the moment it is pulled far enough: let go and fire.
        release();
        vel.y = -14;
        onPullRef.current();
      }

      const still =
        !drag &&
        sway === 0 &&
        Math.abs(pos.x) + Math.abs(pos.y) + Math.abs(vel.x) + Math.abs(vel.y) < 0.02;
      frame = still ? 0 : requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const release = () => {
      if (drag && moon.hasPointerCapture(drag.id)) moon.releasePointerCapture(drag.id);
      drag = null;
      armed = false;
      root.classList.remove("is-dragging", "is-armed");
    };
    kick();

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      moon.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: 0 };
      dragTarget.x = dragTarget.y = 0;
      root.classList.add("is-dragging", "has-pulled");
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      // Rubber-band: the string resists more the further it stretches.
      const max = window.innerHeight * 0.45;
      const down = Math.max(0, dy * 0.75);
      dragTarget.y = dy < 0 ? dy * 0.15 : max * (1 - Math.exp(-down / max));
      dragTarget.x = Math.max(-40, Math.min(40, dx * 0.25));
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const tapped = drag.moved < 5;
      release();
      if (tapped) {
        vel.y = 16; // a little tug to hint it can be pulled
      }
      kick();
    };

    moon.addEventListener("pointerdown", onDown);
    moon.addEventListener("pointermove", onMove);
    moon.addEventListener("pointerup", onUp);
    moon.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      moon.removeEventListener("pointerdown", onDown);
      moon.removeEventListener("pointermove", onMove);
      moon.removeEventListener("pointerup", onUp);
      moon.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      // Drag state (is-dragging / is-armed / has-pulled) is toggled on this class list from the
      // animation loop, so `open` lives in a data attribute where React can't overwrite them.
      className="group/moon [--tension:0]"
      data-open={open}
      // Geometry is inline so a stale stylesheet can never leave a giant, detached moon.
      style={{
        position: "absolute",
        top: 0,
        left: `${left}%`,
        width: `${width}%`,
        height: "100%",
      }}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-2 size-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            x="-300"
            y="-50"
            width="600"
            height="3000"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="2.6" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {STRANDS.map(([stroke, width, dash, opacity], i) => (
            <path
              key={i}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              stroke={stroke}
              strokeWidth={width}
              strokeDasharray={dash}
              opacity={opacity}
            />
          ))}
        </g>
      </svg>

      <button
        ref={moonRef}
        type="button"
        className="pointer-events-auto cursor-grab touch-none rounded-full border-0 bg-transparent p-0 transition-[filter] duration-300 will-change-transform [filter:drop-shadow(0_0_calc(var(--tension)*16px)_rgb(242_192_74/calc(var(--tension)*0.75)))] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#a3b8e8] focus-visible:outline-dashed group-[.is-armed]/moon:[filter:drop-shadow(0_0_18px_rgb(242_192_74/0.95))_brightness(1.08)] group-[.is-dragging]/moon:cursor-grabbing"
        aria-label={open ? openLabel : closedLabel}
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          transformOrigin: `${ATTACH.x * 100}% ${ATTACH.y * 100}%`,
        }}
        onClick={(e) => {
          // Pointer pulls are handled above; this is the keyboard path (Enter / Space).
          if (e.detail === 0) onPull();
        }}
      >
        <Image
          src={src}
          alt=""
          width={imageWidth}
          height={imageHeight}
          loading="eager"
          draggable={false}
          className="block h-auto w-full select-none"
        />
      </button>

      {hint && (
        <span
          className="pointer-events-none absolute top-[calc(var(--rest,0px)_+_0.2vw)] left-[70%] animate-moon-hint text-[clamp(9px,0.7vw,12px)] tracking-[0.08em] whitespace-nowrap text-[#8aa2db] italic opacity-0 transition-opacity duration-400 group-[.has-pulled]/moon:animate-none group-data-[open=true]/moon:animate-none"
          aria-hidden="true"
        >
          {hint}
        </span>
      )}
    </div>
  );
}
```

## 3. Put it on a stage

**The layout contract:** `MoonPull` renders `position: absolute; top: 0; height: 100%`, so its **parent must be a positioned box**, the "stage". The string hangs from the stage's top edge, and its resting length is 13% of the stage's height. `left` and `width` are percentages of the stage's width. The moon box is narrow (6% by default), so the moon scales with the stage.

The overlay holding the moon should be `pointer-events-none`. The moon button turns pointer events back on for itself, so the rest of the scene under the overlay stays clickable.

### Minimal example: open and close a panel

```tsx
"use client";

import { useState } from "react";
import MoonPull from "./MoonPull";

export default function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden">
      {/* The stage: a 16:9 box that fits the window. The moon is laid out against it. */}
      <div className="relative aspect-video w-[min(100vw,calc(100svh*16/9))]">
        {/* ...your scene artwork here... */}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white">
          <p>About me</p>
        </div>
      )}

      {/* The moon floats above both the scene and the panel. Fixed while the panel is open, so it
          stays reachable; absolute otherwise, so it scrolls away with the scene. */}
      <div
        className={`pointer-events-none ${open ? "fixed" : "absolute"} inset-x-0 top-0 z-60 grid h-svh place-items-center`}
      >
        <div className="relative aspect-video w-[min(100vw,calc(100svh*16/9))]">
          <MoonPull
            open={open}
            onPull={() => setOpen((o) => !o)}
            closedLabel="Pull the moon to open About me"
            openLabel="Pull the moon to go back home"
          />
        </div>
      </div>
    </div>
  );
}
```

### How the original portfolio wired it (optional extras)

- **The panel glides down from the top** like a film title curtain, instead of popping in. It slides in with `translate: 0 -100%` → `0 0` over 1.1s on `cubic-bezier(0.76, 0, 0.24, 1)`, and its content trails 35% behind for a reveal. Meanwhile the scene behind scales to 96%, dims to 60% opacity and blurs 2px.
- **The URL follows it.** Opening pushes `#about` onto history, and closing calls `history.back()` if we pushed it (otherwise `replaceState`). Listening to `popstate` and `hashchange` keeps `open` in sync, so the browser back button closes the panel and `/#about` links open it.
- **The page behind is locked** while the panel is open: set `document.documentElement.style.overflow = "hidden"` and clear it on close.
- **Parallax:** the moon's stage got a small mouse-parallax offset of `5px` depth. This is optional and not needed for the moon to work.

## How it works (base knowledge)

**One animation loop, no React re-renders.** All motion happens in a `requestAnimationFrame` loop inside a single `useEffect`. The loop writes straight to the DOM: the moon's `transform`, each SVG path's `d` and `stroke-width`, and a `--tension` CSS variable. React renders the markup once and never re-renders during a drag. The loop **stops itself** when the moon is still and not swaying, and `kick()` restarts it on the next interaction. Under reduced motion there is no sway, so the loop is idle almost all the time.

**Spring physics.** `pos` is the moon's offset from its rest point, and `vel` is its velocity. When the moon is not being dragged, each frame does `vel = (vel + (target − pos) · k) · damp; pos += vel`, a damped spring with k = 0.07 and damp = 0.86. That is what gives the bouncy settle after release. The x target is a slow sine wave (`sin(t/650)`), which is the idle sway.

**Dragging.** On `pointerdown` the moon takes **pointer capture**, so the drag keeps working even when the pointer leaves the small button. Each `pointermove` sets a *target*, and the loop eases toward it (`pos += (target − pos) · 0.35`), which smooths out jittery input.

- **Downward drag** uses a rubber-band curve: `max · (1 − e^(−down/max))`, with `max` = 45% of the viewport height. Stretch feels linear at first and then stiffens toward a hard limit.
- **Upward drag** only moves the moon at 15% of the pointer's speed.
- **Sideways drag** moves the moon at 25% of the pointer's speed, clamped to ±40px.

**The click.** `tension = pos.y / (10% of viewport height)`, clamped to 0..1. It drives the glow through CSS. The `drop-shadow` radius and alpha are both `calc(var(--tension) * …)`. When tension reaches 1 *during* a drag, the component adds `.is-armed` for the fully lit glow. In the same frame it releases the pointer, gives the moon an upward kick (`vel.y = −14`) and calls `onPull`. So it fires the moment the threshold is crossed, not on pointer-up, which is what makes it feel like a lamp cord.

**Tap vs. pull.** If the pointer moved less than 5px between down and up, the gesture is a tap. A tap fires nothing; it sets `vel.y = 16`, a little tug that shows the moon can be pulled.

**Keyboard.** A real `<button>` handles focus, Enter and Space. `onClick` runs only when `e.detail === 0`, which is true for keyboard activation and false for mouse or touch clicks, so a pointer pull doesn't fire twice.

**The string** is one path, shared by four stacked strands (fuzz, body, twist shadow, highlight). Different colours and dash patterns make the strands read as twisted yarn.

- **Curve:** a quadratic Bézier from the stage top (`y = −2`, just above the edge so no gap shows) to the attach point. The control point lags behind the moon (`pos.x · 0.35 − vel.x · 3`), so the string bows as the moon swings.
- **Knot:** two small relative `q` curves at the end draw a little knot.
- **Thinning:** stroke widths are multiplied by `restLen / currentLength` (min 0.55), so the yarn thins as it stretches.
- **Texture:** an SVG `feTurbulence` + `feDisplacementMap` filter roughens the edges into fibre. The filter region is huge and in user-space units, so a long stretched string never gets clipped.

**The moon's rotation** is `−pos.x · 0.35 + vel.x · 0.8`, clamped to ±14°, around the attach point (`transform-origin` = `ATTACH`). It tilts away from the swing and over-rotates with speed, like a weight on a cord.

**Why the classes aren't in React state:** `is-dragging`, `is-armed` and `has-pulled` are toggled on the root's `classList` straight from the loop, because that runs at 60fps and must not re-render. If `open` were a React-managed class on the same element, every re-render would wipe those classes. So `open` goes in `data-open` instead, and Tailwind reads both: `group-[.is-armed]/moon:` and `group-data-[open=true]/moon:`.

**Sizing.** A `ResizeObserver` on the stage re-measures the rest length and re-positions the moon (`top = restLen − moonHeight · ATTACH.y`), so the moon stays hung correctly at any window size.

**The hint** starts at `opacity: 0` and fades to 0.85 after 2.8s. It stops for good once `.has-pulled` is set (on the first pointerdown) or while `open` is true.

## Tuning

| What | Where | Default |
| --- | --- | --- |
| Moon position / size | `left`, `width` props (% of stage width) | `5`, `6` |
| Moon art | `src`, `imageWidth`, `imageHeight` props | `/moon.png`, 265×257 |
| Where the string ties on | `ATTACH` (fractions of the image box) | `{ x: 0.45, y: 0.28 }` |
| Resting string length | `REST` (fraction of stage height) | `0.13` |
| How far to pull | `THRESHOLD` (fraction of viewport height) | `0.1` |
| Bounciness | `k` / `damp` in `draw` | `0.07` / `0.86` |
| Sway amplitude / speed | `restLen * 0.05` (min 4px) / `650` ms divisor | |
| Yarn colours | `STRANDS` | soft periwinkle blues |
| Glow colour | `rgb(242 192 74)` in the button class (golden yellow) | |
| Hint colour / text | `text-[#8aa2db]` / `hint` prop | `pull me` |

When changing the moon art, open the image and find the pixel where a string would naturally tie on. Divide its x and y by the image's width and height, and that is `ATTACH`.

## Gotchas

- **The parent must be positioned and have a height.** If the stage has no height, the string has zero length.
- **Keep `touch-none` on the button**, or phones scroll the page instead of pulling the moon.
- **Keep `"use client"`.** The component uses effects and pointer events.
- **The overlay must not swallow clicks.** Put `pointer-events-none` on the wrappers. The button has `pointer-events-auto`.
- **Z-order:** the moon overlay must sit above whatever `onPull` opens, so the moon can be pulled again to close it.
- `onPull` can change on every render; it's read through a ref, so the loop always calls the latest one without restarting.

## Without Next.js

Replace the `next/image` import and the `<Image>` element with:

```tsx
<img
  src={src}
  alt=""
  width={imageWidth}
  height={imageHeight}
  draggable={false}
  className="block h-auto w-full select-none"
/>
```

Drop the `"use client"` line too if your framework doesn't use React Server Components (it's harmless either way).
