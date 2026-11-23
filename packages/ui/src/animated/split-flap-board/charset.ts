// What the flaps can show, in the order they turn past. A real board's drum only goes forward, so
// getting from one character to another means turning through everything in between; the order
// puts blank first, then the letters, so most words arrive quickly from a cleared board.
export const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-:/'!?&#+()";

const INDEX = new Map([...CHARSET].map((ch, i) => [ch, i]));

/** Position of a character on the drum; anything the drum doesn't carry becomes blank. */
export const charIndex = (ch: string) => INDEX.get(ch) ?? 0;

/** Upper-cased, accents dropped, unknown characters blanked, whitespace collapsed. */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[“”"]/g, "'")
    .replace(/[–—_]/g, "-")
    .split("")
    .map((ch) => (INDEX.has(ch) ? ch : " "))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fits text to `width` cells: padded with blanks, or cut at the last word that fits. A long first
 * word is cut mid-word rather than leaving the row nearly empty.
 */
export function fit(text: string, width: number) {
  const clean = normalize(text);
  if (clean.length <= width) return clean.padEnd(width, " ");
  const space = clean.lastIndexOf(" ", width);
  const cut = space >= width * 0.55 ? clean.slice(0, space) : clean.slice(0, width);
  // A cut line shouldn't end on a dangling comma or dash.
  return cut.replace(/[\s.,\-:/&+(]+$/, "").padEnd(width, " ");
}

const MINUTE = 60_000;

/** Three-cell age, right-aligned like a departure time: "NOW", " 5M", "12H", " 3D", " 6W", " 2Y". */
export function shortAgo(date: string | number | Date | null | undefined, now = Date.now()) {
  if (date == null) return "   ";
  const t = new Date(date).getTime();
  if (!Number.isFinite(t)) return "   ";
  const m = Math.max(0, Math.floor((now - t) / MINUTE));
  const label =
    m < 1 ? "NOW" : m < 60 ? `${m}M` : m < 1440 ? `${Math.floor(m / 60)}H` : m < 14 * 1440 ? `${Math.floor(m / 1440)}D` : m < 365 * 1440 ? `${Math.floor(m / 10080)}W` : `${Math.min(99, Math.floor(m / 525_600))}Y`;
  return label.padStart(3, " ");
}
