# Choosing the mark

Pick by **what you want the reader to do**, not by what looks fun. Each mark has a meaning readers already
know from paper: an underline says "this matters", a circle says "look at this one thing", a strike says
"this is gone". Using a mark against its meaning confuses people even if they can't say why.

## Decision table

| The reader should… | Mark | Component | Target |
|---|---|---|---|
| Take away the key claim of a headline | **Underline** (single) | `Roughly.Underline` | 1–4 words, the payload of the sentence ("this weekend", not "Ship your") |
| Spot one number, price, or word among similar ones | **Circle** | `Roughly.Circle` | 1–3 short words or a number, **one line only** |
| Actually read one sentence in a block of prose | **Highlight** | `Roughly.Highlight` | One sentence or clause (≤ ~15 words). Never a paragraph |
| See a UI element / badge / button / value as an object | **Box** | `Roughly.Box` | An element with edges, or a short code/value. Not running prose |
| Treat several lines/items as one group | **Bracket** | `Roughly.Bracket` | ≥ 2 lines. Curly `{` = "these belong together"; square `[` = quoted/excerpted block |
| Know a value was replaced | **Strike-through** + the new value | `Roughly.Strike` | The old value, with the new one right after it. Never a strike on its own |
| Know an option was rejected/ruled out | **Cross-off** | `Roughly.Cross` | Short item (a word, a plan name, a card). Pair with the winner being marked |
| See yes/no per row of a list | **Check / cross mark** in the margin | `Roughly.Check` | Every row of the list gets a mark, or none does |
| Look at something they'd otherwise miss, with a reason | **Arrow + label** | `Roughly.Arrow` | A button, an input, a screenshot detail. Label ≤ 4 words |
| Get an aside / tip about an element | **Sticky note** | `Roughly.Sticky` | ≤ 12 words. Max 1 per page |
| Feel a personal touch (signature, sign-off word) | **Handwriting** | `Roughly.Handwriting` | ≤ 6 words, ≤ 50 chars (hard cap). Decorative only |

## Per-mark rules

### Underline
- Variants: `single` (default — use this), `double` (strong, ≤ 1 per page, for "this is the one"), `wavy`
  (playful/informal tone only; also implies "questionable" in editing — avoid in serious contexts).
- **Keep the target on one line**: add `className="whitespace-nowrap"` to the underline. A key phrase split across two lines reads as two separate marks, and when the line break shifts after the mark is measured (font swap, responsive type) the underline lands on the wrong line. If the phrase is too long to stay on one line on mobile, it is too long to underline.
- Never underline links or text that looks like a link (readers will click it). If the target *is* a link,
  use a highlight or circle instead.
- Never underline a whole multi-line headline. Pick the words.

### Circle
- For a single item that must pop out of a row of peers: the price among plans, the number among stats,
  the one word in a sentence.
- **One line only.** If the target can wrap at 390px, add `whitespace-nowrap` or choose another mark.
- Don't circle buttons (use a box or an arrow) or whole cards (use a box or a sticky).

### Highlight
- The marker sits *behind* the text. Text contrast against the highlighter colour must stay ≥ 4.5:1 — see
  `color.md` for safe pairs. This is the one mark that changes legibility.
- Wrap the text in `<mark>` (reset its default background) so the meaning survives without the drawing.
- Highlights are calm; they suit testimonials, docs, articles. In a hero, prefer an underline.

### Box
- Use for things that already are objects: a badge ("Most popular"), an input, a toggle, a key/value, a code
  token. It reads as "this thing here".
- `variant="single"` for small targets (< 24px tall), `double` (default) for headings or big targets.
- Not for paragraphs (multi-line boxes look like errors) — use a bracket.

### Bracket
- For 2+ lines that share one point: a group of warnings, a set of steps, a quote. Side `left` is the
  default reading position; `right` works when the left edge is aligned to a grid you don't want to break.
- `bracketStyle="curly"` (group) or `"square"` (excerpt/quote). `side="both"` only for a pulled quote.
- It renders as a `div` and pads the content itself — don't wrap inline text with it.

### Strike-through
- Always followed by the replacement (`$29 → $9`, `useFetcher() → useQuery()`), and wrapped in `<del>`, with
  the new value in `<ins>`. A strike with no replacement just looks like a mistake left on the page.
- `single` for prices and code; `double`/`triple` only for a deliberate, playful "NO".
- Red ink (it means removal).

### Cross-off
- For rejected options in a comparison: the competitor's feature, the old way, the plan you don't
  recommend. Pair it with a positive mark on the alternative (check, circle) so it's a contrast, not a
  random X.
- Keep targets short — a big X over a paragraph is unreadable. Pass `padding` so the X clears the text.

### Check (margin marks)
- `mark="check"` or `mark="cross"`, in the left margin (`side="left"`, default). Use `as="li"` inside `<ul>`.
- Consistency: every item in the list gets a mark. Crosses only for features truly not included, with
  `sr-only` text ("not included").
- `checked` can be toggled for an interactive checklist; it draws/erases.
- Stagger rows by 120–180ms so the list "ticks down".

### Arrow + label
- Points *from* empty space *to* the target. `placement` names where the arrow comes from (`top-right` =
  the tail sits above-right of the target).
- Label: 1–4 words, lowercase, conversational ("free, no card", "start here", "new"). Never a sentence.
- **Never invent a claim for a label.** Take it from the page ("14-day trial" only if the page says so). If
  the page offers nothing beyond the button text, use a neutral direction ("start here") or drop the arrow.
- No label only when the target is self-explanatory and the arrow is pure direction ("look here" is not a
  label — drop it).
- Max 1–2 arrows per page; never two arrows pointing at the same thing; never arrows crossing.
- Prefer `variant="curved"` (default) with the default bend; `straight` looks mechanical; `s-curve` for long
  hops across whitespace.

### Sticky note
- A paper note with tape or pin. It's an aside: tips, "drag to reorder", "we're hiring". Max 1 per page.
- `pin="tape"` (default) for a casual tip, `pin="pin"` for "notice board" style, `none` for minimal.
- Keep the default yellow paper unless the page's palette fights it; never more than one paper colour.

### Handwriting
- Draws real glyph outlines from a handwriting font (`caveat`, `kalam`, `reenie-beanie`). Use for a
  signature or one emotional word. Max 6 words / 50 chars.
- It's an SVG drawing, so also keep the text in the DOM for screen readers and search (the recipe shows how).

## Combinations that work

- **Price change**: strike old + circle new = one idea, one mark budget.
- **Comparison**: cross-off on the rejected column + check marks on the chosen column.
- **Hero**: underline the key words + one arrow with label at the primary CTA, drawn in that order.
- **Docs**: bracket a group of steps + a highlight on the one line people get wrong (two separate sections).

## Combinations that don't

- Two marks on the same words (circle + underline, highlight + box).
- Circle + arrow pointing at the same circle (the circle already points).
- Highlight in a hero headline and an underline in the subtitle (competing emphasis).
- Sticky + arrow + circle in the same viewport — pick one.
