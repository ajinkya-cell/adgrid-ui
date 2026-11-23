import type { Track } from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "just now", "12 min ago", "5 h ago", "3 d ago", then a short date ("23 Oct").
 * Returns null for anything it can't stand behind (missing, unparseable or in the future), so the
 * caller drops the time instead of printing "NaN" or "in -3 h".
 */
export function formatAgo(playedAt: Track["playedAt"], now: number = Date.now()): string | null {
  if (playedAt == null) return null;
  const t = playedAt instanceof Date ? playedAt.getTime() : typeof playedAt === "number" ? playedAt : Date.parse(playedAt);
  if (!Number.isFinite(t)) return null;
  const elapsed = now - t;
  if (elapsed < -MINUTE) return null; // clock skew up to a minute reads as "just now"
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} h ago`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)} d ago`;
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
