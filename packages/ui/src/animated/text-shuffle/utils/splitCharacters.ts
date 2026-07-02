/*
 * Splits a string into individual grapheme clusters using Intl.Segmenter when available.
 * Falls back to Array.from() for environments without Segmenter.
 */

/**
 * Split a string into grapheme clusters (individual user-perceived characters).
 * Handles complex scripts: Latin, Japanese, Chinese, Korean, Arabic, Hindi, emojis, and mixed scripts.
 */
export function splitCharacters(text: string): string[] {
  if (typeof text !== "string") return [];

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(segmenter.segment(text)).map((s) => s.segment);
    } catch {
      // Fallback if Segmenter is unavailable or throws
    }
  }

  return Array.from(text);
}

/**
 * Checks if a string contains right-to-left (RTL) characters.
 * Useful for applying `dir="auto"` or `dir="rtl"`.
 */
export function hasRTL(text: string): boolean {
  return /[\u0591-\u07FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    text,
  );
}
