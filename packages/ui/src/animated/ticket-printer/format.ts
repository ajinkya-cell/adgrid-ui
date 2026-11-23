import type { Deploy } from "./types";

// What gets printed on a ticket, as plain strings. Pure, so it renders the same everywhere.

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MINUTE = 60_000;

const time = (date: Deploy["date"]) => {
  const t = date == null ? NaN : new Date(date).getTime();
  return Number.isFinite(t) ? t : null;
};

/** "23 NOV 26" and "14:02", in the viewer's time zone; nulls when there's no date. */
export function ticketDate(date: Deploy["date"]) {
  const t = time(date);
  if (t == null) return { day: null, clock: null };
  const d = new Date(t);
  const two = (n: number) => String(n).padStart(2, "0");
  return { day: `${two(d.getDate())} ${MONTHS[d.getMonth()]} ${two(d.getFullYear() % 100)}`, clock: `${two(d.getHours())}:${two(d.getMinutes())}` };
}

/** Build time: "41S", "2M 05S", "1H 12M". */
export function buildTime(ms: number | null | undefined) {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return null;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}S`;
  if (s < 3600) return `${Math.floor(s / 60)}M ${String(s % 60).padStart(2, "0")}S`;
  return `${Math.floor(s / 3600)}H ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}M`;
}

/** "NOW", "12M AGO", "3H AGO", "2D AGO". */
export function ago(date: Deploy["date"], now: number) {
  const t = time(date);
  if (t == null || !now) return null;
  const m = Math.max(0, Math.floor((now - t) / MINUTE));
  if (m < 1) return "NOW";
  if (m < 60) return `${m}M AGO`;
  if (m < 1440) return `${Math.floor(m / 60)}H AGO`;
  if (m < 60 * 1440) return `${Math.floor(m / 1440)}D AGO`;
  return `${Math.floor(m / 10080)}W AGO`;
}

/** Repeatable 32-bit hash. */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const ticketNumber = (d: Deploy) => String(d.number ?? hash(d.id) % 10000).padStart(4, "0");

/** Bar widths (1–3) for a little barcode that's the same for the same deploy. */
export function barcode(seed: string, count = 38) {
  let h = hash(seed) || 1;
  return Array.from({ length: count }, () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return 1 + ((h >>> 0) % 3);
  });
}

export const firstLine = (text: string | undefined) => text?.split("\n")[0].trim() || null;
