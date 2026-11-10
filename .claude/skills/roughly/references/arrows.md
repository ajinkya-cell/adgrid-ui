# Arrows

An arrow is the only mark that *moves the eye*, so it is the one most often drawn wrong: the head skims along
the button instead of pointing into it, the arc is a loop, the tail sits on top of a headline, the label is
in the body font. Work through the four decisions below in order and check each one on the screenshot.

## What you can set

| Decision | Props | Default | Rule of thumb |
|---|---|---|---|
| **Where the tail comes from** | `placement` | `top-right` | The side of the target that is genuinely empty |
| **How long / how close** | `size` (or exact `distance`, `offset`) | 1 → 65px long, 8px gap | Scale with the target (sizing.md › Arrow geometry) |
| **How it curves** | `bend`, `variant` | auto, `curved` | **Leave `bend` unset**; it is chosen per placement |
| **The head** | `arrowhead` | `open` | `filled` for small arrows (`size < 0.8`) or thin ink |
| **The pen** | `strokeWidth`, `iterations`, `roughness`, `seed` | 2, 1, 1, auto | 1 pass; different `seed` per arrow on a page |
| **The label** | `label`, `labelFont`, `labelFontSize`, `labelFontWeight` | –, `caveat`, per font, 400 | 1–4 words, 18–34px |
| **Where the label sits** | `labelPlacement`, `labelDistance`, `labelRotate`, `labelOffsetX/Y`, `labelColor` | `auto`, 8, 0, 0, ink | Beyond the tail, in empty space; rotate ±2–5° at most |
| **When** | `animationDelay`, `animationDuration` | 0, 800 | Last mark in the section (composition.md) |

Where the tip lands: corner placements aim at 85% (`*-right`) or 15% (`*-left`) of the target's width,
`top`/`bottom` at the centre, `left`/`right` at mid-height. The tail is `D = 65 × size` px away from the tip.

## 1. Placement: where is the empty space?

`placement` names where the **tail** sits relative to the target. Look at the screenshot and pick the side
with the most empty room (no text, no other mark, not the viewport edge):

```
   top-left        top        top-right
        ↘           ↓           ↙
  left  →     [  target  ]     ←  right
        ↗           ↑           ↖
 bottom-left     bottom     bottom-right
```

- Corners (`top-right`, `bottom-right`, …) are the default choice: diagonal arrows read as hand-drawn and
  leave the label beside the target, not on top of it.
- `left` / `right` for inputs and inline words with a margin beside them.
- `top` / `bottom` for nav items, tabs, or centred targets with room above/below.
- Never let the tail or label start on top of text. If no side is empty, reserve space (sizing.md) or drop
  the arrow.

## 2. Bend: leave it unset

The arc's bend decides **where the head points**. The curve leaves the tail and arrives at the tip rotated
`atan(3 × bend)` away from the straight tail→tip line. Turned one way, the head points *into* the target's
edge; turned the other way, it lies flat along the edge or points away from it, which looks broken even
though the tip is in the right place.

When `bend` is omitted, the component picks the sign and depth that land the head **head-on (within ~15°)**
for that placement:

| `placement` | auto `bend` | Head arrives | Arc bows |
|---|---|---|---|
| `top-right` | **+0.32** | straight down into the top edge | up and over, like a hump |
| `top-left` | **−0.32** | straight down into the top edge | up and over (mirror) |
| `bottom-right` | **−0.32** | straight up into the bottom edge | down and under |
| `bottom-left` | **+0.32** | straight up into the bottom edge | down and under (mirror) |
| `top` | +0.2 | down | gentle |
| `bottom` | −0.2 | up | gentle |
| `left` | +0.2 | rightward into the left edge | gentle, rising |
| `right` | −0.2 | leftward into the right edge | gentle, rising |

On very wide targets (> 400px: a hero heading, a full-width screenshot) the corner tail sits far from the
tip and the auto bend lands 15–25° off. Deepen it to ±0.4 (same sign), or use `size` 1.4+.

`variant="s-curve"` arrives on the other side of its chord, so its auto sign is flipped; it is handled for
you. `variant="straight"` ignores `bend`.

**If you need a different depth**, keep the auto sign and change only the size:

| Look | Corner placements | Side placements | Arc depth (sagitta ≈ 0.75 × bend × length) |
|---|---|---|---|
| Subtle, almost straight | ±0.2 | ±0.1 | ~15% / ~8% of the length |
| **Natural hand-drawn (auto)** | **±0.32** | **±0.2** | **~24% / ~15%** |
| Expressive swoop | ±0.4–0.5 | ±0.3 | ~30–38% |
| Too much: a loop, head overshoots | > ±0.5 | > ±0.35 | — |

What the wrong sign does (target 120px wide, `size={1}`), measured as how far the head is off "pointing
straight in":

| `placement` | Right sign (auto) | Wrong sign, same depth |
|---|---|---|
| corner, e.g. `bottom-right` | −0.32 → **~2°** | +0.32 → **~90°** (lies along the bottom edge) |
| side, e.g. `right` | −0.2 → **~14°** | +0.2 → **~48°** (head points down, past the target) |

So never flip `bend` to move an arc away from text. **Move the arrow instead** (another placement, or more
reserved space). `check.mjs` reports a wrong sign as `arrow/bend-sign`.

## 3. Size and gap

| Target | `size` | `strokeWidth` | `labelFontSize` | Head |
|---|---|---|---|---|
| Inline word, icon, dot | 0.6–0.8 | 1.5 | 18–20 | `filled` reads better this small |
| Button, input, badge, card | 0.9–1.2 | 2–2.5 | 20–24 | `open` |
| Hero heading, screenshot region | 1.4–1.8 | 2.5–3 | 26–34 | `open` |

- The head length is ~16% of the arrow's length (7–24px) and never less than 3.5 × `strokeWidth`. A short,
  thick arrow gets a big head; if it looks clumsy, lower `strokeWidth` rather than `size`.
- The tip stops `8 × size` px from the target. Keep it 6–12px: closer looks like it's stabbing the
  target, further looks like it's pointing at the gap. Use `offset` for exact pixels on very small or very
  large targets.
- Use `distance` (exact length in px) only when the empty space is a fixed size, e.g. a 90px gutter.

## 4. Label

- 1–4 words, lowercase, taken from the page ("free, no card" only if the page says so). See choosing.md.
- `labelPlacement="auto"` puts it beyond the tail on the side the arrow comes from. Override it only when
  that side is crowded: `left`/`right` for a corner arrow near a column edge, `top`/`bottom` for side arrows.
- `labelDistance` 6–12. Below 4 the label touches the tail; above 16 it stops reading as the arrow's label.
- `labelRotate` −5…5 adds a hand-written tilt. Leave it 0 when there are two arrows; mixed tilts look messy.
- The label is in Caveat/Kalam/Reenie Beanie. If it renders in the body font, the fonts aren't loaded
  (setup.md › Fonts).
- `labelOffsetX/Y` are for a final nudge of a few px after reading the screenshot, not for layout.

## Pointing at a spot, not an element

To point at part of an image or screenshot, wrap a zero-size element positioned on that spot:

```tsx
<div className="relative">
  <img src="/dashboard.png" alt="Dashboard" />
  {/* the spot: 72% across, 30% down */}
  <span className="pointer-events-none absolute" style={{ left: "72%", top: "30%" }}>
    <Roughly.Arrow placement="top-left" size={0.9} color={INK} strokeWidth={2} label="live totals" labelFontSize={22}>
      <span className="block size-1" />
    </Roughly.Arrow>
  </span>
</div>
```

With a near-zero target the corner tip offsets (85% / 15% of the width) vanish, and the arrow lands on the
spot itself.

## Several arrows on one page

- At most 2 per page and never 2 in one viewport (composition.md).
- Same `size`, `strokeWidth` and ink, so they read as one hand; different `seed` so they don't look stamped.
- Never cross each other or another mark's drawn area; never two arrows at the same target.
- Mirror placements across a layout (left column `bottom-left`, right column `bottom-right`) rather than
  pointing both the same way.

## Checklist on the screenshot

For every arrow:

1. **The head points into the target**, roughly perpendicular to the edge it lands on. If it skims along
   the edge, the bend sign is wrong: remove `bend`.
2. The tip is 6–12px from the target, not touching it, not floating far off.
3. The arc bows into empty space and doesn't cross text, the target, or another mark.
4. The label is in the handwriting font, fully visible, and ≥ 8px from any other text.
5. Nothing clipped by an `overflow:hidden` ancestor; at 390px, nothing past the viewport edge (switch to a
   `bottom-*` placement or drop it on mobile: composition.md › Mobile).

## Failure → fix

| On the screenshot | Cause | Fix |
|---|---|---|
| Head lies along the target's edge / points past it | `bend` sign wrong for the placement | Delete `bend` (auto), or keep the auto sign |
| Arc is a loop or half-circle | `|bend|` > 0.5 | Corners 0.2–0.4, sides 0.1–0.3 |
| Arrow looks ruler-straight and mechanical | `variant="straight"` or `bend` ≈ 0 | Remove both (auto) |
| Huge head on a small arrow | thick `strokeWidth` on `size < 0.8` | `strokeWidth` 1.5, or `arrowhead="filled"` |
| Tip touches / overlaps the button | `offset` too small or negative | Remove `offset` (8 × size) or 8–10 |
| Tail or label sits on a headline | Wrong placement, or no reserved space | Pick the empty side; reserve space (sizing.md) |
| Label far from the tail | `labelDistance` large, or offsets used for layout | `labelDistance` 6–12, offsets 0 |
| Two arrows look identical | Same placement and no `seed` | Different `seed`, or mirrored placements |
