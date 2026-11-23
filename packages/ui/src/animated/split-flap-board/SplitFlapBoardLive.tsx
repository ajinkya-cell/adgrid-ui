"use client";

import { useEffect, useMemo, useState } from "react";
import { SplitFlapBoard, type SplitFlapBoardProps } from "./SplitFlapBoard";
import { sampleCommits } from "./SplitFlapBoardDemo";
import type { Commit } from "./types";

// The board wired to your GitHub: polls an endpoint returning { user, commits } (newest first).
// The docs ship one at /api/recent-commits, backed by GitHub's commit search.
//
// It stays blank until the first answer, then flips your commits in. It always renders the same
// <SplitFlapBoard>, so a new commit arriving turns just the cells that changed.

export interface CommitFeed {
  user: string | null;
  commits: Commit[];
}

export interface SplitFlapBoardLiveProps extends Omit<SplitFlapBoardProps, "commits"> {
  /** URL returning `{ user, commits }`. */
  endpoint?: string;
  /** How often to check for new commits, in ms. Polling pauses while the tab is hidden. */
  refreshInterval?: number;
  /** Shown when the endpoint fails or has nothing. Defaults to sample commits. */
  fallback?: Commit[];
}

export function SplitFlapBoardLive({ endpoint = "/api/recent-commits", refreshInterval = 60_000, fallback, history = 3, user, ...props }: SplitFlapBoardLiveProps) {
  const [feed, setFeed] = useState<CommitFeed | "failed" | null>(null);
  const samples = useMemo(() => fallback ?? sampleCommits(), [fallback]);

  useEffect(() => {
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const url = new URL(endpoint, window.location.href);
        url.searchParams.set("limit", String(history + 1));
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        const data = response.ok ? await response.json() : null;
        if (Array.isArray(data?.commits) && data.commits.length) setFeed({ user: data.user ?? null, commits: data.commits });
        else setFeed((f) => (f && f !== "failed" ? f : "failed"));
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        // Offline: keep what we have, or fall back if we never had anything.
        setFeed((f) => f ?? "failed");
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

  const live = feed && feed !== "failed" ? feed : null;
  return (
    <SplitFlapBoard
      commits={live?.commits ?? (feed === "failed" ? samples : [])}
      pending={feed === null}
      user={user ?? live?.user ?? (feed === "failed" ? "octocat" : undefined)}
      history={history}
      {...props}
    />
  );
}
