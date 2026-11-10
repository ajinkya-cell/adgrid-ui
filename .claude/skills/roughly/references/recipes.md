# Recipes

Every recipe here is rendered in `assets/qa-gallery.tsx` and was checked on screenshots at 1440px and 390px
on dark and light pages. Copy the closest one, then change the words, the ink, and the sizes for your font
size (sizing.md). The values in comments show how the clearance was computed so you can redo it.

```tsx
import { Roughly } from "@/components/ui/roughly/Roughly"; // adjust to where the files landed

const INK = "#FCD34D";   // dark page; light page: "#2563EB"            (color.md)
const BAD = "#F87171";   // dark; light: "#DC2626"
const GOOD = "#4ADE80";  // dark; light: "#15803D"
const MARKER = "#4338CA"; // dark highlighter (white text); light: "#FDE68A" (dark text)
```

## R1 — Hero: underline the claim + arrow with label at the CTA

```tsx
<h1 className="text-[40px] sm:text-[64px] font-semibold leading-[1.1] sm:leading-[1.05] tracking-tight">
  Ship your landing page{" "}
  {/* 64px → stroke 4. nowrap: a phrase split over two lines reads as two marks */}
  <Roughly.Underline color={INK} strokeWidth={4} animationDelay={400} className="whitespace-nowrap">
    this weekend
  </Roughly.Underline>
</h1>

{/* bottom-right, size 1.2, label 24px → needs ~120px below and ~140px right of the button */}
<div className="mt-10 inline-block pb-[120px] pr-[140px]">
  <Roughly.Arrow
    color={INK}
    strokeWidth={2.5}
    size={1.2}
    placement="bottom-right"
    label="free, no card"
    labelFontSize={24}
    animationDelay={900}
  >
    <a href="/signup" className="inline-block rounded-full px-6 py-3 font-medium">Start building</a>
  </Roughly.Arrow>
</div>
```
If the CTA area can't spare that space, drop the arrow rather than letting it overlap.

## R2 — Price change: strike the old price, circle the new one

```tsx
<div className="flex items-baseline gap-3 text-[40px] font-semibold">
  <del className="text-2xl no-underline opacity-60">
    <span className="sr-only">Was </span>
    <Roughly.Strike color={BAD} strokeWidth={2}>$29</Roughly.Strike>
  </del>
  {/* 40px → padding 14/6, stroke 3; mx = 14 + 3 (strike + circle are one idea, so 8–16px apart is fine) */}
  <ins className="mx-[17px] no-underline">
    <span className="sr-only">now </span>
    <Roughly.Circle color={INK} strokeWidth={3} paddingX={14} paddingY={6} animationDelay={500}>
      $9
    </Roughly.Circle>
  </ins>
  <span className="text-sm font-normal opacity-60">/mo</span>
</div>
```

## R3 — Feature checklist

```tsx
const rows: Array<[string, boolean]> = [
  ["Unlimited projects", true],
  ["Custom domains", true],
  ["Priority support", true],
  ["Per-seat pricing", false],
];

<ul className="grid gap-4">
  {rows.map(([label, ok], i) => (
    <Roughly.Check key={label} as="li" mark={ok ? "check" : "cross"} color={ok ? GOOD : BAD} animationDelay={i * 150}>
      {label}
      {!ok && <span className="sr-only"> (not included)</span>}
    </Roughly.Check>
  ))}
</ul>
```
Interactive checklist: pass `checked={done}` and it draws / erases as the state changes.

## R4 — Comparison: cross off the rejected, check the chosen

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
  <div className="rounded-xl border p-5">
    <div className="mb-3 text-sm opacity-60">The old way</div>
    <div className="grid gap-3">
      {["Hand-written CSS", "Weeks of QA"].map((item, i) => (
        // nowrap: an X across two lines is unreadable
        <span key={item} className="inline-block whitespace-nowrap">
          <del className="no-underline">
            <Roughly.Cross color={BAD} strokeWidth={1.5} padding={4} animationDelay={i * 200}>{item}</Roughly.Cross>
          </del>
        </span>
      ))}
    </div>
  </div>
  <div className="rounded-xl border p-5">
    <div className="mb-3 text-sm opacity-60">With us</div>
    <ul className="grid gap-3">
      {["Drop-in sections", "Ships today"].map((item, i) => (
        <Roughly.Check key={item} as="li" color={GOOD} animationDelay={400 + i * 150}>{item}</Roughly.Check>
      ))}
    </ul>
  </div>
</div>
```
Inside a `<table>`: put the mark inside a `<span>` in the cell, never on the `<td>` itself.

## R5 — Testimonial: highlight the sentence that matters

```tsx
{/* isolate: the marker is drawn behind the text and must not slip behind the page background */}
<blockquote className="isolate text-xl leading-relaxed">
  “We tried three builders before this one.{" "}
  <mark className="bg-transparent text-inherit">
    <Roughly.Highlight color={MARKER} padding={[2, 4]}>We shipped our new site in two days.</Roughly.Highlight>
  </mark>{" "}
  The team still talks about it.”
</blockquote>
```

## R6 — Docs: bracket a group of lines

```tsx
<Roughly.Bracket color={BAD} strokeWidth={2} side="left" bracketPadding={14} className="max-w-md">
  <p className="font-medium">Before you migrate</p>
  <p>Back up the database.</p>
  <p>Pause scheduled jobs.</p>
  <p>Expect ~2 minutes of downtime.</p>
</Roughly.Bracket>
```
Red ink because it's a warning; use INK for a neutral group ("these three steps").

## R7 — Sticky note on a screenshot (moves under it on mobile)

```tsx
const narrow = useIsNarrow(); // hook in composition.md

<div className={`inline-block max-w-full ${narrow ? "pb-[96px]" : "pr-[170px]"}`}>
  <Roughly.Sticky
    note="drag cards to reorder"
    placement={narrow ? "bottom" : "right"}
    offset={narrow ? -28 : 6}   // negative: tucked onto the image's bottom edge
    pin="tape"
    width={150}
    fontSize={20}
  >
    <img src="/screenshot.png" alt="Board view" className="w-72 max-w-full rounded-xl" />
  </Roughly.Sticky>
</div>
```

## R8 — Stat row: circle the one number

```tsx
<div className="flex flex-wrap gap-x-14 gap-y-8 text-center">
  <div><div className="text-5xl font-semibold">12k</div><div className="text-sm opacity-60">teams</div></div>
  <div>
    {/* 48px → padding 17/7, stroke 3. mx = 17+3; mb = 7 + 0.2em + 3 ≈ 20 (caption below) */}
    <div className="mx-[20px] mb-[20px] whitespace-nowrap text-5xl font-semibold leading-none">
      <Roughly.Circle color={INK} strokeWidth={3} paddingX={17} paddingY={7}>4.2×</Roughly.Circle>
    </div>
    <div className="text-sm opacity-60">faster launches</div>
  </div>
  <div><div className="text-5xl font-semibold">99.9%</div><div className="text-sm opacity-60">uptime</div></div>
</div>
```

## R9 — Changelog / docs rename: strike old, new right after

```tsx
<p>
  <del className="font-mono no-underline">
    <Roughly.Strike color={BAD} strokeWidth={1.5}>useFetcher()</Roughly.Strike>
  </del>{" "}
  → <ins className="font-mono no-underline">useQuery()</ins> in v4.
</p>
```

## R10 — Box a UI element

```tsx
<div className="flex items-center gap-2">
  <span>Plan</span>
  {/* padding [6,10] + stroke 2 → margin 12 */}
  <span className="m-[12px] inline-block">
    <Roughly.Box color={INK} strokeWidth={2} padding={[6, 10]} variant="single">
      <span className="inline-block rounded-full border px-3 py-1 text-sm">Most popular</span>
    </Roughly.Box>
  </span>
</div>
```

## R11 — Signature (drawn handwriting)

```tsx
<p className="opacity-60">Thanks for reading,</p>
<span className="sr-only">Ajinkya</span>
<span aria-hidden="true">
  <Roughly.Handwriting color={INK} font="caveat" fontSize={44} strokeWidth={1.2} animationDelay={200}>
    Ajinkya
  </Roughly.Handwriting>
</span>
```
Needs the font files (setup.md › Handwriting).

## R12 — One phrase in prose

```tsx
<p className="text-base leading-relaxed">
  With shared sections you write it{" "}
  <Roughly.Underline color={INK} strokeWidth={1.5} className="whitespace-nowrap">once</Roughly.Underline>{" "}
  and every page stays in sync.
</p>
```
Body text: stroke 1.5, no delay needed, at most one per paragraph.

## R13 — Arrow at a form input (from the empty margin on the right)

```tsx
{/* right, size 0.9, label 20px "≈ 9 chars × 0.45 × 20 = 81px" → needs 73·0.9 + 8 + 81 ≈ 155px on the right */}
<label className="grid max-w-xs gap-1.5 text-sm">
  Work email
  <span className="inline-block w-full pr-[160px]">
    {/* no bend: "right" auto-bends to −0.2 so the head points left, into the field */}
    <Roughly.Arrow color={INK} strokeWidth={2} size={0.9} placement="right" label="no spam" labelFontSize={20} className="w-full">
      <input type="email" className="w-full rounded-md border px-3 py-2" />
    </Roughly.Arrow>
  </span>
</label>
```
At 390px there is no right margin: switch to `placement="bottom-right"` with `useIsNarrow()`
(composition.md › Mobile) and reserve space below instead.

## R14 — Arrow at a detail inside a screenshot

```tsx
<figure className="relative">
  <img src="/app.png" alt="Dashboard with the revenue total in the top right" className="w-full rounded-xl" />
  {/* zero-size target on the detail; top-left so the tail sits in the image's empty top-left area */}
  <span className="pointer-events-none absolute" style={{ left: "74%", top: "22%" }}>
    <Roughly.Arrow color={INK} strokeWidth={2} size={1} placement="top-left" label="live totals" labelFontSize={22} arrowhead="filled">
      <span className="block size-1" />
    </Roughly.Arrow>
  </span>
</figure>
```
Pick the placement from the image itself: the tail and label must sit over a flat, quiet area of the
screenshot, never over its text. The figure must not be `overflow-hidden` or the tail is clipped.

## Arrow placements cheat sheet

| Target position on page | `placement` | Why |
|---|---|---|
| CTA at left of a hero, whitespace to the right/below | `bottom-right` | tail in empty space below-right |
| Element at the right edge of a card | `left` or `top-left` | tail comes from inside the empty area |
| Nav item / top bar | `bottom` or `bottom-right` | above it is the viewport edge |
| Centered element | `top-right` (default) | reads naturally left→right, top→down |
| Input in a form column | `right` | margin beside the form is usually empty |

Point the arrow so the label is in empty space. **Don't set `bend`**: each placement already gets the
bend that lands the head on the target (arrows.md › Bend). If the curve bows toward text, change the
placement or reserve more space; flipping the bend's sign turns the head sideways.
