// Splits a number into the pieces the ticker renders. Digits are keyed by their place counted from
// the right (units are `d0`), never by their index, so when 999 becomes 1,000 the existing places
// keep their identity and only the new thousands digit and its separator mount.

export type TickerPart =
  | { kind: "digit"; key: string; digit: number; place: number }
  | { kind: "group"; key: string; char: string }
  | { kind: "sign"; key: "sign"; char: string };

/** Rounds finite values to an integer; anything else falls back (to the last good value). */
export function sanitize(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(locale: string) {
  let f = formatters.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, { maximumFractionDigits: 0, useGrouping: true });
    formatters.set(locale, f);
  }
  return f;
}

export function toParts(value: number, locale = "en-US"): TickerPart[] {
  const raw = formatter(locale).formatToParts(sanitize(value, 0));
  const out: TickerPart[] = [];
  let place = 0;
  // Walk right to left so every digit knows its place value.
  for (let i = raw.length - 1; i >= 0; i--) {
    const { type, value: text } = raw[i];
    if (type === "integer") {
      for (let j = text.length - 1; j >= 0; j--) {
        out.push({ kind: "digit", key: `d${place}`, digit: Number(text[j]), place });
        place++;
      }
    } else if (type === "group") {
      // Named after the digit to its right: the comma in 1,234 is `g2`.
      out.push({ kind: "group", key: `g${place - 1}`, char: text });
    } else if (type === "minusSign") {
      out.push({ kind: "sign", key: "sign", char: text });
    }
  }
  return out.reverse();
}
