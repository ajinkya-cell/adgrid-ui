"use client";

import { useId, useState } from "react";
import { motion, type MotionValue } from "framer-motion";

// The spinning part of the deck: platter rim (strobe dots), the record's grooves and its label.
// Everything here is radially symmetric except the label art, so the spin reads only through the
// art and the strobe dots. The light is NOT in here: the sheen and spindle sit on a static layer
// above (see Deck), so the vinyl turns under fixed light the way a real record does.

export function Record({ image, alt, angle }: { image?: string; alt: string; angle: MotionValue<number> }) {
  // Remember which URL failed, so a new track's art gets its own chance to load.
  const [failed, setFailed] = useState<string | null>(null);
  const showArt = image && failed !== image;
  const platterId = `tt-platter-${useId()}`;

  return (
    <motion.div className="absolute inset-0 rounded-full will-change-transform" style={{ rotate: angle }}>
      {/* Platter: a dark machined disc whose rim carries the strobe dots. */}
      <svg viewBox="0 0 256 256" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={platterId} cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="#1b1b1b" />
            <stop offset="96%" stopColor="#2a2a2a" />
            <stop offset="100%" stopColor="#121212" />
          </radialGradient>
        </defs>
        <circle cx="128" cy="128" r="127.5" fill={`url(#${platterId})`} stroke="rgba(255,255,255,0.07)" />
        <circle
          cx="128"
          cy="128"
          r="123.5"
          fill="none"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="0.01 4.84"
        />
      </svg>

      {/* The record: 236 of the platter's 256. */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "3.906%",
          background: [
            // a lighter lip at the very edge
            "radial-gradient(circle closest-side, transparent 97.2%, rgba(255,255,255,0.07) 98%, transparent 99.4%)",
            // the blank gap between two tracks
            "radial-gradient(circle closest-side, transparent 69.4%, rgba(0,0,0,0.85) 69.8%, rgba(0,0,0,0.85) 70.8%, transparent 71.2%)",
            // the grooves themselves
            "repeating-radial-gradient(circle closest-side, rgba(255,255,255,0) 0, rgba(255,255,255,0.032) 1.25px, rgba(255,255,255,0) 2.5px)",
            // broad soft bands, the way light catches a pressed record
            "radial-gradient(circle closest-side, rgba(255,255,255,0) 44%, rgba(255,255,255,0.025) 56%, rgba(255,255,255,0) 64%, rgba(255,255,255,0.02) 84%, rgba(255,255,255,0) 94%)",
            "#0b0b0b",
          ].join(","),
          boxShadow: "0 0 0 1px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.6)",
        }}
      >
        {/* Label: the album art, 42% of the record. */}
        <div
          className="absolute overflow-hidden rounded-full bg-[#222]"
          style={{ inset: "29%", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)" }}
        >
          {showArt ? (
            <img
              src={image}
              alt={alt}
              draggable={false}
              decoding="async"
              onError={() => setFailed(image)}
              className="h-full w-full select-none object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: "repeating-radial-gradient(circle, #262626 0 1px, #1e1e1e 1px 4px)" }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 10px rgba(0,0,0,0.45)" }} />
        </div>
      </div>
    </motion.div>
  );
}
