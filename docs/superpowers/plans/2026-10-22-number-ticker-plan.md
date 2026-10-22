# Number Ticker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An immersive `<NumberTicker value={n} />` for void-ui. Whenever `value` changes, each digit rolls like an odometer on a spring, with vertical motion blur scaled to its speed, direction-aware travel, places that morph in and out, and a brief up/down glow.

**Architecture:** A pure `toParts()` turns the rounded value into keyed parts (digits keyed by place-from-right, plus separators and sign) using `Intl.NumberFormat.formatToParts`. Each digit place is a `DigitColumn` that drives one spring motion value, `position = floor(|value| / 10^place)`. The column draws a wrapping 0–9 strip from `position mod 10`, so a rising value always rolls up and a falling one rolls down, even across 9→0. Column velocity feeds a per-column SVG `feGaussianBlur stdDeviation="0 y"`, which gives true vertical motion blur. A `LayoutGroup` + `AnimatePresence` handles places appearing and disappearing (999 → 1,000).

**Tech Stack:** React 18+, framer-motion ≥11 (already a peer dep), Tailwind v4, TypeScript. No new dependencies.

**Spec:** User answers, 2026-10-22:
- Trigger: the `value` prop changes.
- Motion: per-digit odometer roll.
- Immersive: spring physics with overshoot, direction-aware, width morphing, and a glow/color flash.
- Format: thousands separators, prefix/suffix, integers only.

## Global Constraints

- Component lives in `packages/ui/src/animated/number-ticker/` (folder pattern like `text-shuffle/`); every `.tsx` file starts with `"use client";`.
- Integers only: non-integer `value` is `Math.round`ed; no decimal props.
- Separators via `Intl.NumberFormat(locale, { maximumFractionDigits: 0, useGrouping: true })`; default `locale = "en-US"`.
- Digits render with `font-variant-numeric: tabular-nums`; the component inherits font family, size and color from its parent.
- Defaults: `spring = { stiffness: 140, damping: 18, mass: 1 }` (visible overshoot), `stagger = 0.035` s per place (rightmost place first), `blur = 8` (max px), `flash = true`, `upColor = "#4ade80"`, `downColor = "#f87171"`, `animateOnMount = true` (rolls from 0).
- Max spin per column: one revolution (10 cells). Larger deltas jump the motion value to `target − sign·10` before animating.
- `useReducedMotion()` → no roll, blur or flash; digits swap instantly.
- Exports added to `packages/ui/src/index.ts`; registry slug `number-ticker`, category `animated`, presentation group `text`.
- Code style matches `HatchedText.tsx`: a header comment explaining the technique, JSDoc on every prop, `cn` from `../../lib/utils`, `forwardRef`.

## Review Focus

1. **Rapid successive changes** (value changes again mid-roll): columns must retarget from their *current* position without restarting or snapping. Task 2 visual check "spam +1".
2. **Huge jumps** (0 → 1,000,000): low places spin at most one revolution and high places settle in order; nothing spins for seconds. Task 2 check "×1000".
3. **Place-count changes with separators** (999 → 1,000 → 999): the new place and its comma grow in from width 0, and siblings slide on layout without jumping. Task 3 check.
4. **Negative and sign-flipping values** (−5 → 5, −1,234): the minus sign is a part that fades in and out; columns roll on magnitude. Task 1 assertions + Task 3 check.
5. **Non-finite input** (`NaN`, `Infinity`): render the last finite value (or 0 at first) without throwing. Task 1 assertion.

---

### Task 1: `toParts` formatter

**Files:**
- Create: `packages/ui/src/animated/number-ticker/format.ts`
- Test: `packages/ui/src/animated/number-ticker/format.check.mjs` (throwaway assertion script; there is no test runner in this repo)

**Interfaces:**
- Produces:
  ```ts
  export type TickerPart =
    | { kind: "digit"; key: string; digit: number; place: number }   // key = `d${place}`
    | { kind: "group"; key: string; char: string }                   // key = `g${placeOfDigitToItsRight}`
    | { kind: "sign"; key: "sign"; char: string };
  export function toParts(value: number, locale?: string): TickerPart[];
  export function sanitize(value: number, fallback: number): number; // finite → Math.round(value), else fallback
  ```

- [ ] **Step 1: Write the failing check script** (plain Node `assert`, importing the compiled logic via a copy-free approach: the script imports `./format.ts` under `node --experimental-strip-types`, which needs Node ≥22.6; fall back to `npx tsx format.check.mjs`)

  ```js
  import assert from "node:assert/strict";
  import { toParts, sanitize } from "./format.ts";
  const keys = (v, l) => toParts(v, l).map((p) => p.key);
  assert.deepEqual(keys(1234), ["d3", "g2", "d2", "d1", "d0"]);
  assert.deepEqual(toParts(1234).filter((p) => p.kind === "digit").map((p) => p.digit), [1, 2, 3, 4]);
  assert.deepEqual(keys(-5), ["sign", "d0"]);
  assert.deepEqual(keys(0), ["d0"]);
  assert.deepEqual(keys(1234.6), ["d3", "g2", "d2", "d1", "d0"]); // rounds to 1235
  assert.equal(toParts(1234.6).at(-1).digit, 5);
  assert.deepEqual(keys(1234567, "de-DE"), ["d6","g5","d5","d4","d3","g2","d2","d1","d0"]);
  assert.equal(toParts(1234, "de-DE")[1].char, ".");
  assert.equal(sanitize(NaN, 7), 7);
  assert.equal(sanitize(Infinity, 7), 7);
  assert.equal(sanitize(2.5, 0), 3);
  console.log("format ok");
  ```

- [ ] **Step 2: Run it to make sure it fails**
  Run: `node --experimental-strip-types packages/ui/src/animated/number-ticker/format.check.mjs`
  Expected: FAIL with a module-not-found error for `./format.ts`

- [ ] **Step 3: Implement `toParts` and `sanitize` in `format.ts`**
  Walk `formatToParts` right-to-left, counting `integer` digits to assign `place`. Each `group` takes the place of the digit to its right. `minusSign` becomes the `sign` part. Ignore every other part type.

- [ ] **Step 4: Run it to make sure it passes**
  Expected: prints `format ok`

- [ ] **Step 5: Delete `format.check.mjs` and commit** `format.ts` only. The script needs a Node flag, so it shouldn't ship in the package.
  ```bash
  git add packages/ui/src/animated/number-ticker/format.ts
  git commit -m "feat(number-ticker): place-keyed number formatter"
  ```

### Task 2: `DigitColumn`: spring odometer with motion blur and flash

**Files:**
- Create: `packages/ui/src/animated/number-ticker/DigitColumn.tsx`

**Interfaces:**
- Consumes: nothing from Task 1 (it receives plain numbers).
- Produces:
  ```ts
  export interface DigitColumnProps {
    /** floor(|value| / 10^place) — the column's continuous target. */
    target: number;
    /** -1 | 0 | 1 — direction of the last value change, for the flash color. */
    direction: -1 | 0 | 1;
    delay: number;               // seconds (place * stagger)
    spring: { stiffness: number; damping: number; mass: number };
    blur: number;                // max px
    flash: boolean;
    upColor: string;
    downColor: string;
    reduced: boolean;            // from useReducedMotion
    initial: number;             // starting position on mount (0 or target)
  }
  export function DigitColumn(props: DigitColumnProps): JSX.Element;
  ```

- [ ] **Step 1: Build the column**
  - Window is `1ch` wide and `1lh` tall (fallback `1.2em`), with `overflow: clip`. A vertical `mask-image` fades the top and bottom 18% so cells enter and leave softly.
  - `pos = useMotionValue(initial)`. When `target` changes, `animate(pos, target, { type: "spring", ...spring, delay })`. Framer retargets from the live value and keeps velocity, which covers Review Focus #1.
  - Before animating, if `|target − pos.get()| > 10`, call `pos.jump(target − sign·10)`. This is the one-revolution cap.
  - Render 10 cells, one per digit `i`. Cell y-offset in cells = `((i − pos) mod 10 + 15) mod 10 − 5`, wrapped into [−5, 5). Derive it with `useTransform` so nothing re-renders during the roll. Higher digits sit below, so increasing `pos` moves the strip up.
  - Blur: `useVelocity(pos)` gives cells/s. Map it to `y = min(blur, |v| * 0.12)` px, and on change write it straight to an `<feGaussianBlur stdDeviation={`0 ${y}`}>` in a zero-size inline `<svg>` with a `useId()`-based filter id (SSR-safe). Apply `filter: url(#id)` only while `y > 0.05` so idle text stays crisp.
  - Flash: when `target` changes and `flash && direction !== 0`, set the color to `direction > 0 ? upColor : downColor` with `text-shadow: 0 0 12px <color>`. Then animate back to `currentColor` and no shadow over 600 ms, starting when the spring settles (`delay + 0.35s`).
  - `reduced`: `pos.jump(target)`, with no filter or flash.
  - Mark the column `aria-hidden`.

- [ ] **Step 2: Typecheck**
  Run: `pnpm --filter void-ui typecheck`
  Expected: no errors

- [ ] **Step 3: Commit**
  ```bash
  git add packages/ui/src/animated/number-ticker/DigitColumn.tsx
  git commit -m "feat(number-ticker): spring digit column with vertical motion blur"
  ```
  (Visual checks for this task run in Task 3, once the column can be seen in a page.)

### Task 3: `NumberTicker` + playground + exports + docs registration

**Files:**
- Create: `packages/ui/src/animated/number-ticker/NumberTicker.tsx`
- Create: `packages/ui/src/animated/number-ticker/NumberTickerPlayground.tsx`
- Create: `packages/ui/src/animated/number-ticker/index.ts`
- Modify: `packages/ui/src/index.ts`. Add exports next to the `HatchedText` block.
- Modify: `apps/docs/src/registry/index.ts`. Add an entry after "Inspect Text".
- Modify: `apps/docs/src/components/presentation/PresentationRenderer.tsx`. Add an import plus `case "number-ticker": return <NumberTickerPlayground {...liveProps} />;`
- Modify: `apps/docs/src/components/presentation/presentation-registry.ts`. Prepend `"number-ticker"` to the `text` group slugs.
- Regenerate: `apps/docs/public/r/number-ticker.json`, `apps/docs/public/r/registry.json` via `pnpm build:registry`

**Interfaces:**
- Consumes: `toParts`, `sanitize`, `TickerPart` (Task 1); `DigitColumn`, `DigitColumnProps` (Task 2).
- Produces:
  ```ts
  export interface NumberTickerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "prefix"> {
    value: number;
    locale?: string;
    prefix?: string;
    suffix?: string;
    spring?: { stiffness?: number; damping?: number; mass?: number };
    stagger?: number;
    blur?: number;
    flash?: boolean;
    upColor?: string;
    downColor?: string;
    animateOnMount?: boolean;
  }
  export const NumberTicker: ForwardRefExoticComponent<NumberTickerProps & RefAttributes<HTMLSpanElement>>;
  export interface NumberTickerPlaygroundProps extends Omit<NumberTickerProps, "value"> { start?: number }
  export function NumberTickerPlayground(props: NumberTickerPlaygroundProps): JSX.Element;
  ```

- [ ] **Step 1: Implement `NumberTicker`**
  - Keep the last finite value in a ref and pass `value` through `sanitize`. Compute `direction = sign(next − prev)`.
  - Root is an `inline-flex items-baseline tabular-nums` span. It holds an `sr-only` span with the full formatted string (prefix + number + suffix) and `aria-live="polite"`. The visual tree is `aria-hidden`.
  - Inside a `LayoutGroup`, render the prefix, then `AnimatePresence initial={false} mode="popLayout"` over `toParts(...)`, then the suffix. Every part is a `motion.span layout="position"` keyed by `part.key`, so places keep their identity when width changes.
  - Digit parts render a `DigitColumn` with `target = floor(|v| / 10^place)` and `delay = place * stagger`.
  - Group and sign parts are plain characters.
  - Enter animation for newly appearing parts: `width: 0 → "auto"`, `opacity: 0 → 1`, `filter: blur(6px) → blur(0)`. Exit reverses it. Both use the same spring.
  - Mount: `initial = animateOnMount && !reduced ? 0 : target`.
- [ ] **Step 2: Implement `NumberTickerPlayground`**
  - A large `NumberTicker` (`text-7xl`, prefix `$`) above a row of void-ui machined buttons. Reuse the existing button styling from `VoidButton.tsx` rather than inventing new styles.
  - Buttons: `+1`, `+97`, `−250`, `×1000`, `÷1000`, `Random`, `Negate`. Start value = `start ?? 1234`.
  - Pass every other prop through to the ticker.
- [ ] **Step 3: Wire exports and docs**
  - Export from `index.ts` and `packages/ui/src/index.ts`, following the `HatchedText` block style.
  - Registry entry: name "Number Ticker", `dependencies: ["framer-motion"]`, files = all four folder files, `presentationStrategy: "center"`.
  - `propDefs`:
    - `prefix` (string, "$")
    - `suffix` (string, "")
    - `stagger` (number 0.035, 0–0.15, step 0.005)
    - `blur` (number 8, 0–20, step 1)
    - `flash` (boolean true)
    - `locale` (select "en-US", options en-US/de-DE/en-IN/fr-FR)
  - Description, in the house voice: "Integers that roll like an odometer whenever the value changes. Each place spins on a spring with vertical motion blur scaled to its speed, travels up when the value rises and down when it falls, grows in or folds away as the number gains or loses places, and briefly glows green or red."
- [ ] **Step 4: Typecheck and build**
  Run: `pnpm --filter void-ui typecheck && pnpm build:registry`
  Expected: no type errors; `apps/docs/public/r/number-ticker.json` exists.
- [ ] **Step 5: Visual verification in docs** (`pnpm dev`, open the Number Ticker presentation)
  - `+1` on 1,234: only the units column rolls up, overshoots slightly and settles, with a green glow.
  - `−250`: the columns roll *down*, staggered right to left, with a red glow.
  - Spam `+1` ~10× fast: the units column keeps rolling smoothly and never snaps back. (Review Focus #1)
  - `×1000`, then `÷1000`: low places do at most one revolution. The three new places and their comma grow in from width 0, then fold away on the way back, and siblings slide with no jump. (Review Focus #2, #3)
  - `Negate` on 5: the minus sign fades and blurs in, and the digits roll on magnitude. (Review Focus #4)
  - Mid-roll, the digits show visible *vertical* streaking. Idle digits are pixel-crisp, with no lingering filter.
  - Locale `de-DE` shows `1.234`.
  - With OS reduce-motion on, digits swap instantly with no blur or glow.
  - In the console, `NaN` passed via a temporary edit renders the previous value with no error. Revert the edit afterwards. (Review Focus #5)
- [ ] **Step 6: Commit**
  ```bash
  git add packages/ui/src/animated/number-ticker packages/ui/src/index.ts apps/docs/src/registry/index.ts apps/docs/src/components/presentation apps/docs/public/r
  git commit -m "feat: number ticker, spring odometer digits with motion blur"
  ```
