/** One play, newest first in any list. Shaped after Last.fm's `user.getrecenttracks`. */
export interface Track {
  title: string;
  artist: string;
  /** Album art URL; used for the record label and the history thumbnails. */
  image?: string;
  /** Where the title links to (Spotify, Last.fm…). */
  url?: string;
  /** When it was played: ISO string, epoch ms or Date. Unknown → null/undefined. */
  playedAt?: string | number | Date | null;
  /** True while the track is playing right now (Last.fm `@attr.nowplaying`). */
  nowPlaying?: boolean;
}

/** The card never shows more than this many earlier plays. */
export const MAX_HISTORY = 5;

/** Splits a newest-first list into the track on the deck and the earlier plays shown on hover. */
export function splitTracks(tracks: Track[], history: number): { current: Track | null; earlier: Track[] } {
  const count = Math.max(0, Math.min(MAX_HISTORY, Math.floor(history)));
  return { current: tracks[0] ?? null, earlier: tracks.slice(1, 1 + count) };
}
