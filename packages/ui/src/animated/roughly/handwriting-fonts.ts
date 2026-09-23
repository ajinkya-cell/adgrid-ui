"use client";

import type { Font } from "opentype.js";

export type HandwritingFont = "reenie-beanie" | "caveat" | "kalam";

export const LOCAL_FONT_PATHS: Record<HandwritingFont, string> = {
  "reenie-beanie": "/fonts/ReenieBeanie-Regular.ttf",
  caveat: "/fonts/Caveat-Regular.ttf",
  kalam: "/fonts/Kalam-Regular.ttf",
};

export const CDN_FONT_URLS: Record<HandwritingFont, string> = {
  "reenie-beanie":
    "https://raw.githubusercontent.com/google/fonts/main/ofl/reeniebeanie/ReenieBeanie.ttf",
  caveat:
    "https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/Caveat%5Bwght%5D.ttf",
  kalam:
    "https://raw.githubusercontent.com/google/fonts/main/ofl/kalam/Kalam-Regular.ttf",
};

const fontCache = new Map<string, Font>();
const pendingLoads = new Map<string, Promise<Font>>();

/**
 * Loads and parses an opentype Font from a local path or fallback CDN URL.
 * Uses an in-memory cache to ensure each font is downloaded and parsed only once.
 */
export async function loadHandwritingFont(
  font: HandwritingFont = "reenie-beanie",
  customUrl?: string
): Promise<Font> {
  const primaryUrl = customUrl || LOCAL_FONT_PATHS[font] || LOCAL_FONT_PATHS["reenie-beanie"];
  const fallbackUrl = customUrl ? undefined : CDN_FONT_URLS[font];

  const cacheKey = customUrl || font;
  const cached = fontCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const existingPending = pendingLoads.get(cacheKey);
  if (existingPending) {
    return existingPending;
  }

  const loadPromise = (async () => {
    const opentypeModule = await import("opentype.js");
    const opentype = opentypeModule.default || opentypeModule;

    const fetchArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch font at ${url} (${res.status} ${res.statusText})`);
      }
      return res.arrayBuffer();
    };

    let buffer: ArrayBuffer;
    try {
      buffer = await fetchArrayBuffer(primaryUrl);
    } catch (err) {
      if (fallbackUrl) {
        buffer = await fetchArrayBuffer(fallbackUrl);
      } else {
        throw err;
      }
    }

    const parsedFont = opentype.parse(buffer);
    fontCache.set(cacheKey, parsedFont);
    pendingLoads.delete(cacheKey);
    return parsedFont;
  })();

  pendingLoads.set(cacheKey, loadPromise);
  return loadPromise;
}
