# Turntable Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A new `<TurntableCard tracks={…} user="…" />` for void-ui: a dark card that shows the last-played track over a machined turntable deck. On hover, the header gives way to a "Before that" list of earlier plays, the deck slides right and dims, the tonearm swings onto the record and the record spins up. Every part of the motion is continuous and can be reversed at any point.

**Architecture:** A single spring motion value, `open` (0→1), drives every layer through `useTransform`. Header, footer, list rows, deck slide/dim and tonearm angle are all pure functions of `open`. Leaving mid-hover therefore retraces the same path and never snaps, and there are no competing CSS transitions. Record rotation is separate: a pure physics step (`stepSpin`) moves angular velocity toward a target rpm with exponential ease, so the platter spins up and coasts down like a real one. The angle accumulates in a motion value and is never reset or modulo-snapped. The rAF loop runs only while the record is moving. The lighting (sheen, spindle) is a static layer above the rotating grooves and label, so the light stays put while the vinyl turns under it.

**Tech Stack:** React 18+, framer-motion ≥11 (existing peer dep), Tailwind v4, TypeScript. No new dependencies; no icon library.

**Spec:** The user's request on 2026-11-22 and two reference screenshots:
- **Rest (image 1):** eyebrow "LAST PLAYED", one-line title truncated with "…", footer `SJK__MUSIC · 5 H AGO`. A turntable deck (plinth, platter with dotted strobe rim, record whose label is the album art, tonearm with counterweight and headshell, small LED, buttons, pitch fader) bleeds off the card's right and bottom edges.
- **Hover (image 2):** header and footer are gone. The eyebrow becomes "BEFORE THAT" over 3 rows (40px thumb, title, "Artist · 5 h ago"). The deck has slid further right and is dimmed into the background, and the record rotates.
- "Do it very smoothly." "Zero slop, very clean, tasteful."
- This is a *new* component. The existing `NowPlayingCard` stays untouched.

## Global Constraints

- Location: `packages/ui/src/animated/turntable-card/` (folder pattern like `number-ticker/`). Every `.tsx` starts with `"use client";`.
- Registry slug `turntable-card`, name "Turntable Card", category `animated`, presentation group `cards` (placed right after `now-playing-card`), marked NEW in `SidebarItem.tsx`.
- Material follows `.claude/skills/void/references/design.md`. Card face `#151515`, plinth `#1c1c1c`→`#141414` top-lit gradient, wells `#090909`, record `#0b0b0b`. Borders are `rgba(255,255,255,0.06)`, top bevel `inset 0 1px 0 rgba(255,255,255,0.07)`. Text `#e5e5e5` / `#aaaaaa` / `#888888`. Font is inherited (Inter in docs). No Google-font `@import`.
- Design size: card `560 × 360`, radius `28px`, padding `28px`. Below 560px wide the card scales its content via `container-type: inline-size` (deck width `68cqw`, clamped), never by reflowing into a column.
- Type: eyebrow `13px / 500 / uppercase / tracking 0.08em / #888`. Title `24px / 600 / leading 1.2 / #e5e5e5`, single line, ellipsis. Footer meta `11px / 600 / uppercase / tracking 0.12em / #aaa`. Row title `15px / 600 / #e5e5e5`. Row sub `12.5px / 400 / #888`.
- Motion constants (exported from `motion.ts` so they're tuned in one place):
  - `OPEN_SPRING = { stiffness: 170, damping: 26, mass: 1 }` (critically damped feel, no overshoot, ≈450 ms).
  - `RPM = 33.333`, `SPIN_UP_TAU = 0.35` s, `SPIN_DOWN_TAU = 0.7` s, `STOP_EPSILON = 0.5` deg/s.
  - Deck at open: `x = +30%` of deck width, `scale 0.96`, `brightness 0.55`.
  - Tonearm: `REST_ANGLE = 0deg`, `PLAY_ANGLE = 21deg`.
- Animate only `transform`, `opacity` and `filter`. Never `width`/`height`/`left`. `will-change: transform` only on the record and the deck.
- `useReducedMotion()`: no spin, and `open` swaps without the spring through a 150 ms opacity crossfade. The deck neither moves nor dims.
- Code style matches `number-ticker/`: a header comment explaining the technique, JSDoc on every prop, `cn` from `../../lib/utils`, `forwardRef` on the root.
- No test runner in this repo. Pure logic is verified by a throwaway `*.check.mjs` script run with `node --experimental-strip-types` (or `npx tsx`), as the number-ticker plan does. UI is verified with screenshots against the two reference images.
- Edit in the main checkout (the user's dev server must show changes). Never in a worktree.
- Don't commit unless the user asks. "Commit" steps below mean "stage and propose a message".

## Review Focus

1. **Hover flicker / reversal mid-motion:** moving the pointer in and out quickly must retrace from the current `open` value and the current spin velocity. No jumps, no restart, no angle reset. → Task 3 check "jitter hover".
2. **Short history (0, 1 or 2 earlier tracks):** with 0 earlier tracks, hover still spins the deck but the header stays and no empty "Before that" heading appears. With 1–2, the rows render without gaps. With 0 tracks total, the card shows the "Nothing played yet" state with a blank label and never throws. → Task 1 assertions on `splitTracks` + Task 3 check.
3. **Long / emoji / non-Latin titles** ("Aashiqui 2 ❤️ Movie All Songs | Shraddha…", Devanagari): single-line ellipsis that never pushes the deck or wraps. → Task 3 check with the screenshot's titles.
4. **Missing / invalid / future `playedAt`:** the "· time" segment is omitted, not shown as "NaN" or "in -3 h". → Task 1 assertions on `formatAgo`.
5. **Touch and keyboard:** with no hover on touch, the first tap opens and a tap outside closes. Rows are only clickable while open. Tab into the card opens it (`focus-within`), Escape closes it. → Task 3 checks.

---

### Task 1: Types, time formatting, spin physics, track split

**Files:**
- Create: `packages/ui/src/animated/turntable-card/types.ts`
- Create: `packages/ui/src/animated/turntable-card/time.ts`
- Create: `packages/ui/src/animated/turntable-card/motion.ts`
- Test: `packages/ui/src/animated/turntable-card/logic.check.mjs` (throwaway, deleted in Task 4)

**Interfaces:**
- Produces:
  ```ts
  // types.ts
  export interface Track {
    title: string;
    artist: string;
    /** Album art URL; used for the record label and history thumbnails. */
    image?: string;
    url?: string;
    /** ISO string, epoch ms, or Date. null/undefined = unknown. */
    playedAt?: string | number | Date | null;
    /** True while the track is playing right now (Last.fm `@attr.nowplaying`). */
    nowPlaying?: boolean;
  }
  export function splitTracks(tracks: Track[], history: number): { current: Track | null; earlier: Track[] };

  // time.ts
  export function formatAgo(playedAt: Track["playedAt"], now?: number): string | null;
  //   <60 s → "just now"; <60 min → "12 min ago"; <24 h → "5 h ago"; <7 d → "3 d ago";
  //   else → short date "12 Nov". Invalid, missing or future (> now + 60 s) → null.

  // motion.ts
  export const OPEN_SPRING, RPM, SPIN_UP_TAU, SPIN_DOWN_TAU, STOP_EPSILON,
               DECK_OPEN_X, DECK_OPEN_SCALE, DECK_OPEN_BRIGHTNESS, REST_ANGLE, PLAY_ANGLE;
  export interface SpinState { angle: number; velocity: number } // deg, deg/s
  export function stepSpin(s: SpinState, dt: number, active: boolean, rpm?: number): SpinState;
  //   target = active ? rpm*6 : 0;  tau = target > s.velocity ? SPIN_UP_TAU : SPIN_DOWN_TAU
  //   velocity' = target + (s.velocity - target) * Math.exp(-dt / tau)
  //   |velocity'| < STOP_EPSILON && !active → 0;  angle' = s.angle + velocity' * dt  (no modulo)
  //   dt is clamped to [0, 0.05] so a backgrounded tab can't leap.
  ```

- [ ] **Step 1: Write the failing check script**

  ```js
  import assert from "node:assert/strict";
  import { formatAgo } from "./time.ts";
  import { stepSpin, RPM } from "./motion.ts";
  import { splitTracks } from "./types.ts";
  const now = Date.parse("2026-11-22T12:00:00Z"), h = 3600e3;
  assert.equal(formatAgo(now - 5 * h, now), "5 h ago");
  assert.equal(formatAgo(new Date(now - 12 * 60e3).toISOString(), now), "12 min ago");
  assert.equal(formatAgo(now - 10e3, now), "just now");
  assert.equal(formatAgo(now - 3 * 24 * h, now), "3 d ago");
  assert.equal(formatAgo("garbage", now), null);
  assert.equal(formatAgo(null, now), null);
  assert.equal(formatAgo(now + 10 * 60e3, now), null);
  let s = { angle: 0, velocity: 0 };
  for (let i = 0; i < 120; i++) s = stepSpin(s, 1 / 60, true);       // 2 s
  assert.ok(Math.abs(s.velocity - RPM * 6) < 1, "reaches 33⅓ rpm");
  const a = s.angle;
  for (let i = 0; i < 600; i++) s = stepSpin(s, 1 / 60, false);      // 10 s coast
  assert.equal(s.velocity, 0);
  assert.ok(s.angle > a, "coasts forward, never snaps back");
  assert.ok(stepSpin({ angle: 5, velocity: 0 }, 1, true).velocity <= RPM * 6, "never overshoots target");
  assert.equal(stepSpin({ angle: 0, velocity: 100 }, 10, true).angle, stepSpin({ angle: 0, velocity: 100 }, 0.05, true).angle); // dt clamp
  const t = (n) => Array.from({ length: n }, (_, i) => ({ title: `t${i}`, artist: "a" }));
  assert.deepEqual(splitTracks([], 3), { current: null, earlier: [] });
  assert.equal(splitTracks(t(1), 3).earlier.length, 0);
  assert.equal(splitTracks(t(10), 3).earlier.length, 3);
  assert.equal(splitTracks(t(10), 3).current.title, "t0");
  console.log("logic ok");
  ```

- [ ] **Step 2: Run it to make sure it fails**
  Run: `node --experimental-strip-types packages/ui/src/animated/turntable-card/logic.check.mjs`
  Expected: FAIL, module not found `./time.ts`.

- [ ] **Step 3: Implement `types.ts`, `time.ts` and `motion.ts` with the signatures and constants above.**

- [ ] **Step 4: Run the check again.** Expected: `logic ok`.

- [ ] **Step 5: Stage** `types.ts time.ts motion.ts`. Proposed message: `feat(turntable-card): track types, relative time and spin physics`.

---

### Task 2: The deck: plinth, platter, record, tonearm

**Files:**
- Create: `packages/ui/src/animated/turntable-card/useRecordSpin.ts`
- Create: `packages/ui/src/animated/turntable-card/Record.tsx`
- Create: `packages/ui/src/animated/turntable-card/Tonearm.tsx`
- Create: `packages/ui/src/animated/turntable-card/Deck.tsx`
- Modify: `apps/docs/src/components/presentation/PresentationRenderer.tsx` (temporary `case "turntable-card"` rendering `<Deck>` alone at 1×, replaced in Task 4)

**Interfaces:**
- Consumes: `stepSpin`, `SpinState`, motion constants (Task 1).
- Produces:
  ```ts
  export function useRecordSpin(active: boolean, opts?: { rpm?: number; disabled?: boolean }): MotionValue<number>;
  //   rAF loop starts when active flips true; stops itself once velocity hits 0 while inactive.
  //   disabled (reduced motion) → constant 0, no loop.  Cleans up on unmount.
  export function Record(props: { image?: string; alt: string; angle: MotionValue<number> }): JSX.Element;
  export function Tonearm(props: { angle: MotionValue<number> /* deg, from useTransform(open) */ }): JSX.Element;
  export function Deck(props: { image?: string; alt: string; spinning: boolean; armAngle: MotionValue<number>; reducedMotion: boolean; className?: string }): JSX.Element;
  ```

Construction, top to bottom. All sizes are relative to the deck box (`380 × 290` at design size; children are % based so the deck scales as one piece):

- **Plinth:** radius 18px. Background `linear-gradient(180deg,#1f1f1f,#141414)`, border `rgba(255,255,255,0.06)`, top bevel `inset 0 1px 0 rgba(255,255,255,0.07)`, drop `0 30px 60px -20px rgba(0,0,0,0.8)`. A debossed inner panel inset 8px (radius 12px, `inset 0 1px 2px rgba(0,0,0,0.6)` + bottom-lip highlight). Two hinge slots on the top edge (36×4px wells at 30% and 62%). One 5px LED well at top-left: dim at rest, soft white glow `0 0 6px rgba(255,255,255,0.5)` while spinning, faded via `opacity` on `open`. Bottom-left: a round start button (22px, raised) and a 34×10 rpm pill. Right edge: pitch fader (a 6px-wide well track, 40% height, with a 18×8 raised cap).
- **Platter:** diameter 78% of deck height, centred at (40%, 52%). Rim of strobe dots via `repeating-conic-gradient(rgba(255,255,255,0.35) 0 1.2deg, transparent 1.2deg 6deg)`, masked to a 5px ring (`mask: radial-gradient`). The rim rotates with the record (it's part of the platter).
- **Record (rotating group, `rotate: angle`):** diameter 92% of platter. Base `#0b0b0b`. Grooves are `repeating-radial-gradient(circle, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px)` between 44% and 96% radius, plus one 2px blank "track gap" ring at 70%. Label is 42% of the diameter: album `<img>` with `object-cover`, `draggable={false}`, `decoding="async"`. On `onError`, fall back to a `#222` disc with a fine ring. Inner shadow ring `inset 0 0 0 1px rgba(0,0,0,0.6)`.
- **Static light layer (does NOT rotate):** two soft opposing specular wedges, `conic-gradient(from 30deg, transparent 0 8%, rgba(255,255,255,0.10) 14%, transparent 22% 58%, rgba(255,255,255,0.06) 64%, transparent 72%)` with `mix-blend-mode: screen`, clipped to the record. A metallic 8px spindle on top (`radial-gradient(#d4d4d4,#6b6b6b)`). This is what makes the spin read as real vinyl under fixed light.
- **Tonearm:** SVG in deck coordinates, rotating about the pivot centre (`transform-origin` = pivot). Pivot base is a 46px raised disc with a 30px inner well ring at (88%, 22%). The counterweight is a 20×16 brushed rectangle behind the pivot (`linear-gradient(90deg,#9a9a9a,#e5e5e5,#8a8a8a)`). The arm is a 3px rod in `#cfcfcf` with a darker underside stroke, running straight down and then angled 18° inward for the last 25%. The headshell is a 14×22 rounded rect rotated −20°, carrying a tiny cartridge with a 2px `#6ea8ff` accent (the blue fleck in the reference). The arm rest is a small post at (90%, 78%). The arm casts a blurred shadow copy (offset 4px, `opacity 0.35`, `blur 3px`) that rotates with it, so it reads as lifted above the record.

- [ ] **Step 1: Implement `useRecordSpin`.** A `useMotionValue(0)` plus a manual `requestAnimationFrame` loop that holds `SpinState` in a ref, calls `stepSpin(state, dt, activeRef.current)`, writes `angle.set(state.angle)`, and stops when `velocity === 0 && !active`. `active` is read through a ref so toggling never restarts the loop or resets the angle.
- [ ] **Step 2: Implement `Record`, `Tonearm` and `Deck`** to the construction above. `Deck` calls `useRecordSpin(spinning, { disabled: reducedMotion })`.
- [ ] **Step 3: Add the temporary presentation case** rendering `<Deck spinning={toggle} …/>` with a button that flips `toggle`. Open `/present/animated/turntable-card` in the running dev server.
- [ ] **Step 4: Visual check (screenshot at 1× and 2×).** At rest, the deck matches the image 1 proportions: platter centred-left, arm parked beside the record, strobe dots crisp. Toggle on: the record and rim spin up over ≈1 s while the sheen stays fixed. Toggle off: it coasts to a stop in ≈2–3 s and stays at that angle. Toggle five times quickly: no stutter, no jump. DevTools Performance: 0 rAF callbacks once stopped, and no layout or paint per frame while spinning (composited transform only).
- [ ] **Step 5: Stage.** Proposed message: `feat(turntable-card): machined deck with inertial record spin`.

---

### Task 3: The card shell and hover choreography

**Files:**
- Create: `packages/ui/src/animated/turntable-card/TurntableCard.tsx`
- Create: `packages/ui/src/animated/turntable-card/HistoryList.tsx`
- Create: `packages/ui/src/animated/turntable-card/index.ts`

**Interfaces:**
- Consumes: `Deck` (Task 2); `Track`, `splitTracks`, `formatAgo`, `OPEN_SPRING`, deck/arm constants (Task 1).
- Produces:
  ```ts
  export interface TurntableCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    /** Newest first. tracks[0] is shown; the next `history` go in "Before that". */
    tracks: Track[];
    /** Shown in the footer, e.g. "sjk__music". Rendered uppercase. */
    user?: string;
    /** Earlier plays to reveal on hover. Default 3, max 5. */
    history?: number;
    /** Labels, for localisation. Defaults: "Last played", "Now playing", "Before that", "Nothing played yet". */
    labels?: Partial<{ last: string; now: string; before: string; empty: string }>;
    /** Force the open state (for docs/demos). Uncontrolled when undefined. */
    open?: boolean;
  }
  export const TurntableCard: React.ForwardRefExoticComponent<TurntableCardProps & React.RefAttributes<HTMLElement>>;
  // index.ts re-exports TurntableCard, TurntableCardProps, Track, formatAgo (Task 4 adds TurntableCardDemo)
  ```

Choreography. `open` is `useSpring(target, OPEN_SPRING)`, and every value below is `useTransform(open, [range], [values])` with clamping:

| Layer | `open` range | Values |
|---|---|---|
| Header (eyebrow + title) | 0 → 0.45 | opacity 1→0, y 0→−8px, blur 0→4px |
| Footer meta | 0 → 0.35 | opacity 1→0, y 0→6px |
| "Before that" eyebrow | 0.30 → 0.65 | opacity 0→1, y 8→0 |
| Row *i* (i = 0..n−1) | 0.38+0.08i → 0.78+0.08i | opacity 0→1, y 10→0, blur 4→0 |
| Deck | 0 → 1 | x 0→`DECK_OPEN_X`, scale 1→0.96, `brightness(1→0.55)` |
| Tonearm | 0.05 → 0.75 | angle `REST_ANGLE`→`PLAY_ANGLE` |

The spin target is `isOpen || current?.nowPlaying`. A now-playing track spins at rest with the arm on the record: the arm transform's input range becomes `[−1, 0]` → `PLAY_ANGLE` held. At rest the eyebrow reads "Now playing" with a 6px LED dot that breathes (opacity 0.5↔1, 2.4 s, ease-in-out).

Because the rows are staggered by range rather than by timers, closing plays the exact reverse (last row out first, header back last), and a half-finished hover reverses from wherever it is.

Structure and behaviour:
- Root `<article>`: `position: relative; overflow: hidden; container-type: inline-size`, card material from Global Constraints, plus a fine diagonal texture `repeating-linear-gradient(135deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 4px)` (the hatch visible in the references).
- Layer order: deck (z-0, `absolute right-[-28px] bottom-[-28px]`, bleeding off both edges like the reference) → a left-to-right scrim `linear-gradient(90deg, #151515 0%, #151515cc 45%, transparent 75%)` whose opacity follows `open` 0→1 so the list stays legible over the dimmed deck → text (z-10).
- Header: eyebrow, then title as `<a href={current.url}>` (single-line ellipsis, `max-width: 100%`, sitting above the deck top edge as in image 1). Footer: `{user} · {formatAgo}` pinned bottom-left. Omit the dot and the time when `formatAgo` returns null.
- `HistoryList`: `<ol>` positioned in the same box as the header (top-left, `max-width: 62%`). Each row is an `<a>` with a 40px thumb (radius 6, `#222` fallback on error), title and `artist · ago`, each truncated. Hover on a row: background `rgba(255,255,255,0.04)`, 150 ms. While `open < 0.5`, the list has `pointer-events: none` and `aria-hidden`.
- Open triggers: `pointerenter`/`pointerleave` with `pointerType === "mouse"`. `focusin` / `focusout` (respect `relatedTarget` inside the card). `Escape` closes. Touch: `pointerdown` with `pointerType !== "mouse"` toggles, and a document `pointerdown` outside the card closes. A controlled `open` prop overrides all of these.
- Edge states: `current === null` → eyebrow `labels.empty`, no title, blank label disc, deck idle (hover still spins). `earlier.length === 0` → header and footer never fade; only the deck, arm and spin respond.
- Reduced motion: replace `useSpring` with a 150 ms opacity tween on a single crossfade between "rest" and "open" panes. The deck stays still and doesn't spin.
- Accessibility: root `aria-label="{labels.last}: {title} by {artist}"`. The album art `alt` is `""` on the label (decorative) and the title text on the thumbnails. Visible focus ring on links: `outline: 2px solid rgba(255,255,255,0.35); outline-offset: 2px`.

- [ ] **Step 1: Implement `TurntableCard`, `HistoryList` and `index.ts`** to the table and rules above.
- [ ] **Step 2: Point the presentation case at `<TurntableCard>`** with the screenshot's data: "Aashiqui 2 ❤️ Movie All Songs | Shraddha Kapoor, Aditya Roy Kapur", "Zaroori Tha" (Rahat Fateh Ali Khan), "Tera Mera Rishta - New Version (From …)" (Mithoon, Pritam, Mustafa Zahid, Sayeed Quadri), "Choosin' Texas" (Ella Langley), all 5 h ago, user `sjk__music`.
- [ ] **Step 3: Visual check against references.** Screenshot at rest next to image 1 and with `open` forced true next to image 2. Title and second row truncate with an ellipsis, the ❤️ renders inline, and the deck bleeds off the right and bottom. **Jitter hover:** sweep in and out across the edge for 3 s and record it. There must be no frame where any layer jumps, and the record never reverses direction or resets. **Short history:** `tracks` of length 0, 1, 2 and 3 all look intentional. **Keyboard:** Tab opens the card and moves through the title and rows, and Escape closes it. **Touch:** DevTools device mode, tap opens, tap outside closes, rows unclickable while closed. **Reduced motion:** emulate `prefers-reduced-motion` and get a crossfade only. **Narrow:** at 360px width the card scales and nothing overlaps.
- [ ] **Step 4: Performance check.** Record 5 s of hover in and out in DevTools. There should be no long tasks, no layout per frame, and a steady 60 fps (120 on a high-refresh display). If the text `filter: blur` costs paint time, cap it to the header only.
- [ ] **Step 5: Stage.** Proposed message: `feat(turntable-card): card shell with spring-driven hover choreography`.

---

### Task 4: Live data, demo and docs wiring

**Files:**
- Create: `packages/ui/src/animated/turntable-card/TurntableCardDemo.tsx` (static sample data from Task 3 Step 2; Unsplash concert/album photos at `?w=300&q=80`)
- Modify: `packages/ui/src/animated/turntable-card/index.ts` (add `TurntableCardDemo` export)
- Create: `apps/docs/src/app/api/recent-tracks/route.ts`
- Modify: `packages/ui/src/index.ts` (export `TurntableCard`, `TurntableCardProps`, `Track as TurntableTrack`. `Track` is aliased so it doesn't collide with existing exports)
- Modify: `apps/docs/src/registry/index.ts` (new entry after `now-playing-card`)
- Modify: `apps/docs/src/components/presentation/presentation-registry.ts` (add slug after `now-playing-card` in the `cards` group)
- Modify: `apps/docs/src/components/presentation/PresentationRenderer.tsx` (dynamic import + `case "turntable-card"` → live wrapper below)
- Modify: `apps/docs/src/components/presentation/PreviewOverlay.tsx` (lazy import + case rendering `TurntableCardDemo`)
- Modify: `apps/docs/src/components/presentation/SidebarItem.tsx` (add to `NEW`)
- Modify: `apps/docs/src/app/gallery/showcase.ts` (tile `{ slug: "turntable-card", size: "wide", fit: "scale", hint: { label: "hover me", placement: "bottom-right", at: { x: 70, y: 70 }, bend: -0.4 } }`, placed so the bento still closes whole rows)
- Delete: `logic.check.mjs`

**Interfaces:**
- Consumes: `TurntableCard`, `Track` (Task 3).
- Produces: `GET /api/recent-tracks?limit=4` → `{ user: string | null; tracks: Track[] }`. Last.fm `user.getrecenttracks` with `limit` clamped to 1..6, over **https**. `playedAt = Number(track.date.uts) * 1000`, `nowPlaying` from `@attr.nowplaying`, image = `extralarge` → `large` → undefined. Last.fm's grey placeholder star hash (`2a96cbd8b46e442fc41c2b86b821562f`) maps to undefined so the card shows its own fallback. Cache `s-maxage=15, stale-while-revalidate=30`. Missing env or a failure gives `{ user: null, tracks: [] }` with `s-maxage=10`.
- The presentation case uses a small client wrapper in `PresentationRenderer.tsx`. It fetches `/api/recent-tracks`, renders `TurntableCardDemo` until the data arrives, and keeps the demo if `tracks` is empty, so the docs never show an empty card.

Registry entry:
```ts
{
  name: "Turntable Card",
  slug: "turntable-card",
  category: "animated",
  description: "Your last-played track on a machined turntable. Hover and the deck slides aside, the tonearm swings in and the record spins up with real inertia, while earlier plays rise into view.",
  dependencies: ["framer-motion"],
  packagePath: "animated/turntable-card/TurntableCard.tsx",
  files: [/* every .ts/.tsx in the folder except the demo */],
  propDefs: [
    { name: "tracks", type: "Track[]", description: "Newest first; the first is shown, the next go in Before that", required: true },
    { name: "user", type: "string", description: "Username in the footer", required: false },
    { name: "history", type: "number", default: 3, description: "Earlier plays revealed on hover", required: false, min: 0, max: 5, step: 1 },
    { name: "open", type: "boolean", description: "Force the hover state", required: false },
  ],
}
```

- [ ] **Step 1: Implement the route; check it.** Run: `curl -s localhost:3000/api/recent-tracks?limit=4`. Expected: `{ user, tracks: [4 items] }` with numeric `playedAt`, or `{ user: null, tracks: [] }` without env vars.
- [ ] **Step 2: Add the demo, the exports and all the docs wiring listed above.** Delete `logic.check.mjs`.
- [ ] **Step 3: Build.** Run `pnpm --filter @adgrid-ui/ui typecheck` and `pnpm build:registry` (if the registry write hits the OneDrive lock, pause sync and rerun). Expected: no errors, and `apps/docs/public/r/turntable-card.json` exists with all files.
- [ ] **Step 4: Check in the app.** `/gallery`: the tile renders, the hint arrow points at the deck, hover works inside the scaled well and the bento has no holes. `/present/animated/turntable-card`: live data or demo, and the props tweaker changes `history` and `open`. The sidebar shows NEW.
- [ ] **Step 5: Stage.** Proposed message: `feat(turntable-card): live Last.fm feed, registry and gallery tile`.
- [ ] **Step 6: Ask the user** whether to run `node .claude/scripts/void-skill-update.mjs --apply` so the void skill catalog picks up `turntable-card`. Do not run it without a yes.
