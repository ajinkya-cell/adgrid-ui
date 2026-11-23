"use client";

import { useEffect, useState } from "react";
import { TicketPrinter, type TicketPrinterProps } from "./TicketPrinter";
import { useSimulatedDeploys } from "./TicketPrinterDemo";
import type { Deploy, DeploySource } from "./types";

// The printer wired to your deploys: polls an endpoint returning { source, project, deploys }
// (newest first). The docs ship one at /api/recent-deploys, backed by Vercel or GitHub Actions.
//
// The slot stays empty until the first answer, then prints your latest. It always renders the same
// <TicketPrinter>, so a deploy that lands while the page is open prints live.

export interface DeployFeed {
  source: DeploySource | null;
  project: string | null;
  deploys: Deploy[];
}

export interface TicketPrinterLiveProps extends Omit<TicketPrinterProps, "deploys"> {
  /** URL returning `{ source, project, deploys }`. */
  endpoint?: string;
  /** How often to check for new deploys, in ms. Polling pauses while the tab is hidden. */
  refreshInterval?: number;
  /** Shown when the endpoint fails or has nothing. Defaults to sample deploys. */
  fallback?: Deploy[];
  /** With no live data, keep printing sample deploys on a loop (for demos). */
  simulate?: boolean;
}

export function TicketPrinterLive({ endpoint = "/api/recent-deploys", refreshInterval = 30_000, fallback, simulate = false, history = 3, source, project, ...props }: TicketPrinterLiveProps) {
  const [feed, setFeed] = useState<DeployFeed | "failed" | null>(null);
  const samples = useSimulatedDeploys(simulate && feed === "failed");

  useEffect(() => {
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const url = new URL(endpoint, window.location.href);
        url.searchParams.set("limit", String(history + 2));
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        const data = response.ok ? await response.json() : null;
        if (Array.isArray(data?.deploys) && data.deploys.length) setFeed({ source: data.source ?? null, project: data.project ?? null, deploys: data.deploys });
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
    <TicketPrinter
      deploys={live?.deploys ?? (feed === "failed" ? fallback ?? samples : [])}
      pending={feed === null}
      source={source ?? live?.source ?? undefined}
      project={project ?? live?.project ?? undefined}
      history={history}
      {...props}
    />
  );
}
