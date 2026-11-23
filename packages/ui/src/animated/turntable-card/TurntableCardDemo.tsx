"use client";

import { useMemo } from "react";
import { TurntableCard, type TurntableCardProps } from "./TurntableCard";
import type { Track } from "./types";

const art = (id: string) => `https://images.unsplash.com/photo-${id}?w=300&q=80`;
const HOUR = 3_600_000;

/** Sample plays for docs and previews; times are relative to when the demo renders. */
export function sampleTracks(now: number = Date.now()): Track[] {
  return [
    {
      title: "Aashiqui 2 ❤️ Movie All Songs | Shraddha Kapoor, Aditya Roy Kapur",
      artist: "Mithoon, Ankit Tiwari, Jeet Gannguli",
      image: art("1501386761578-eac5c94b800a"),
      url: "https://open.spotify.com",
      playedAt: now - 5 * HOUR,
    },
    {
      title: "Zaroori Tha",
      artist: "Rahat Fateh Ali Khan",
      image: art("1493225457124-a3eb161ffa5f"),
      url: "https://open.spotify.com",
      playedAt: now - 5 * HOUR - 4 * 60_000,
    },
    {
      title: "Tera Mera Rishta - New Version (From \"Awarapan\")",
      artist: "Mithoon, Pritam, Mustafa Zahid, Sayeed Quadri",
      image: art("1514525253161-7a46d19cd819"),
      url: "https://open.spotify.com",
      playedAt: now - 5 * HOUR - 9 * 60_000,
    },
    {
      title: "Choosin' Texas",
      artist: "Ella Langley",
      image: art("1459749411175-04bf5292ceea"),
      url: "https://open.spotify.com",
      playedAt: now - 5 * HOUR - 13 * 60_000,
    },
  ];
}

export function TurntableCardDemo(props: Partial<TurntableCardProps>) {
  const tracks = useMemo(() => sampleTracks(), []);
  return <TurntableCard tracks={tracks} user="sjk__music" {...props} />;
}
