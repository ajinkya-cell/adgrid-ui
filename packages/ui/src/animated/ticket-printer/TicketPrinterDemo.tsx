"use client";

import { useEffect, useState } from "react";
import { TicketPrinter, type TicketPrinterProps } from "./TicketPrinter";
import type { Deploy } from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Sample deploys for docs and previews; times are relative to `now`. */
export function sampleDeploys(now: number = Date.now()): Deploy[] {
  const at = (ago: number) => now - ago;
  const base = { project: "adgrid-ui", target: "production", branch: "main", url: "https://vercel.com" };
  return [
    { ...base, id: "dpl_8fk2", number: 142, status: "ready", sha: "5a8b7261", message: "Spin the record while a song plays", date: at(12 * MINUTE), duration: 41_000 },
    { ...base, id: "dpl_7hq9", number: 141, status: "error", sha: "feaddc9b", message: "Add topographic map background", date: at(3 * HOUR), duration: 23_000 },
    { ...base, id: "dpl_6mz4", number: 140, status: "ready", sha: "38a068bb", message: "Fix focus ring on menubar items", date: at(26 * HOUR), duration: 52_000 },
    { ...base, id: "dpl_5tr1", number: 139, status: "ready", sha: "1cca86b0", message: "Tune the gauge needle damping", date: at(3 * 24 * HOUR), duration: 38_000 },
    { ...base, id: "dpl_4pa7", number: 138, status: "canceled", sha: "9e747412", message: "New design file", date: at(4 * 24 * HOUR), duration: 9_000 },
  ];
}

const MESSAGES = [
  "Ease the drawer spring",
  "Bump framer-motion",
  "Fix hydration warning on the docs home",
  "Add perforation to the ticket",
  "Cache the commit search for a minute",
  "Tighten type scale on mobile",
];

/**
 * Sample deploys that keep coming: every `interval` ms a new one starts building, then finishes a
 * few seconds later (every third fails), so the printer has something to print.
 */
export function useSimulatedDeploys(enabled = true, interval = 11_000) {
  const [deploys, setDeploys] = useState<Deploy[]>(() => sampleDeploys());

  useEffect(() => {
    if (!enabled) return;
    let n = 0;
    let finish: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      n += 1;
      const id = `dpl_sim${Date.now().toString(36)}`;
      const failed = n % 3 === 0;
      const sha = Math.floor(Math.random() * 0xfffffff).toString(16).padStart(7, "0");
      setDeploys((list) => [
        { id, number: (list[0]?.number ?? 142) + 1, status: "building", project: "adgrid-ui", target: "production", branch: "main", sha, message: MESSAGES[(n - 1) % MESSAGES.length], url: "https://vercel.com", date: Date.now() },
        ...list.slice(0, 5),
      ]);
      finish = setTimeout(() => {
        setDeploys((list) => list.map((d) => (d.id === id ? { ...d, status: failed ? "error" : "ready", duration: 2800 + Math.random() * 40_000 } : d)));
      }, 2800);
    };
    const id = setInterval(start, interval);
    return () => {
      clearInterval(id);
      clearTimeout(finish);
    };
  }, [enabled, interval]);

  return deploys;
}

export interface TicketPrinterDemoProps extends Partial<TicketPrinterProps> {
  /** Keep printing sample deploys on a loop. */
  simulate?: boolean;
}

export function TicketPrinterDemo({ simulate = true, ...props }: TicketPrinterDemoProps) {
  const deploys = useSimulatedDeploys(simulate);
  return <TicketPrinter deploys={deploys} {...props} />;
}
