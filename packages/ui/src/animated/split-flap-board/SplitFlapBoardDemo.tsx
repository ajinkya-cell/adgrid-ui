"use client";

import { useMemo } from "react";
import { SplitFlapBoard, type SplitFlapBoardProps } from "./SplitFlapBoard";
import type { Commit } from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Sample commits for docs and previews; times are relative to when the demo renders. */
export function sampleCommits(now: number = Date.now()): Commit[] {
  const at = (ago: number) => now - ago;
  return [
    { message: "Spin the record while a song plays", repo: "adgrid-ui", sha: "5a8b7261", url: "https://github.com", date: at(12 * MINUTE) },
    { message: "Add topographic map background", repo: "adgrid-ui", sha: "feaddc9b", url: "https://github.com", date: at(3 * HOUR) },
    { message: "Keep shell scripts on LF line endings", repo: "craft", sha: "ffa1f9a4", url: "https://github.com", date: at(26 * HOUR) },
    { message: "Fix focus ring on menubar items", repo: "adgrid-ui", sha: "38a068bb", url: "https://github.com", date: at(3 * 24 * HOUR) },
    { message: "Initial commit", repo: "forge", sha: "77724426", url: "https://github.com", date: at(9 * 24 * HOUR) },
  ];
}

export function SplitFlapBoardDemo(props: Partial<SplitFlapBoardProps>) {
  const commits = useMemo(() => sampleCommits(), []);
  return <SplitFlapBoard commits={commits} user="octocat" {...props} />;
}
