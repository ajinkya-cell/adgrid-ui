"use client";

import { useEffect, useMemo, useState } from "react";
import { TurntableCard, type TurntableCardProps } from "./TurntableCard";
import { sampleTracks } from "./TurntableCardDemo";
import type { Track } from "./types";

// The whole thing, wired to your listening: polls an endpoint that returns { user, tracks } (newest
// first, the playing song on top with `nowPlaying: true`). When a song starts, the record spins up
// and the arm drops onto it; when it stops, the record coasts down. The docs ship one at
// /api/recent-tracks backed by Spotify (falling back to Last.fm).
//
// It always renders the same <TurntableCard>, swapping only its data, so new plays arriving never
// remount the card: a hover in progress and the record's angle carry straight through.

export interface Feed {
  user: string | null;
  tracks: Track[];
}

export interface TurntableCardLiveProps extends Omit<TurntableCardProps, "tracks"> {
  /** URL returning `{ user, tracks }`. */
  endpoint?: string;
  /** How often to check for a new song, in ms. Polling pauses while the tab is hidden. */
  refreshInterval?: number;
  /** Shown until the first response, and whenever the endpoint has nothing. Defaults to sample plays. */
  fallback?: Track[];
}

export function TurntableCardLive({ endpoint = "/api/recent-tracks", refreshInterval = 15_000, fallback, history = 3, user, ...props }: TurntableCardLiveProps) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const samples = useMemo(() => fallback ?? sampleTracks(), [fallback]);

  useEffect(() => {
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const url = new URL(endpoint, window.location.href);
        url.searchParams.set("limit", String(Math.min(6, history + 1)));
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        const data = response.ok ? await response.json() : null;
        if (Array.isArray(data?.tracks)) setFeed({ user: data.user ?? null, tracks: data.tracks });
      } catch {
        // offline or aborted: keep showing what we have
      }
      schedule();
    };
    const schedule = () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible") timer = setTimeout(load, refreshInterval);
    };
    const onVisibility = () => (document.visibilityState === "visible" ? load() : clearTimeout(timer));

    load();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [endpoint, refreshInterval, history]);

  const live = feed?.tracks.length ? feed : null;
  return <TurntableCard tracks={live?.tracks ?? samples} user={user ?? live?.user ?? (live ? undefined : "sjk__music")} history={history} {...props} />;
}
