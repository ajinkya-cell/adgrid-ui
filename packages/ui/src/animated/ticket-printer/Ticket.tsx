"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { barcode, buildTime, firstLine, ticketDate, ticketNumber } from "./format";
import type { Deploy } from "./types";

// One ticket off the roll: thermal paper, printed in black (red for a failed build), rubber-stamped
// once it's out. Sized by its parent; all type is in cqw of the printer, so it scales with it.
//
// The perforation is cut, not drawn: half-holes along the top and bottom edges and a notch at each
// corner, so a ticket and the one above it share a row of round holes, and the bottom of the strip
// ends in a torn edge.

const HOLE = "0.42cqw";
const PITCH = "1.9cqw";
const NOTCH = "1.4cqw";
const cut = (at: string, size = HOLE) => `radial-gradient(circle at ${at}, #0000 ${size}, #000 calc(${size} + 0.5px))`;
const MASK = [
  `${cut("50% 0")} 0 0 / ${PITCH} 100% repeat-x`,
  `${cut("50% 100%")} 0 0 / ${PITCH} 100% repeat-x`,
  `${cut("0 0", NOTCH)}`,
  `${cut("100% 0", NOTCH)}`,
  `${cut("0 100%", NOTCH)}`,
  `${cut("100% 100%", NOTCH)}`,
].join(", ");

const PAPER: CSSProperties = {
  mask: MASK,
  WebkitMask: MASK,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
  background:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.3 0 0 0 0 0.22 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E\"), linear-gradient(180deg, #f4f0e7, #ebe5d8)",
};

// Stamp ink doesn't take evenly: a noise mask knocks small gaps out of it.
const INK_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 0 0 0 2.5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const INK = { ready: "#1d1b18", building: "#1d1b18", error: "#b42a1f", canceled: "#77726a" } as const;
const STAMP = {
  ready: { word: "OK", sub: "DEPLOYED", color: "#1c8a4a", size: "6.6cqw" },
  building: { word: "OK", sub: "DEPLOYED", color: "#1c8a4a", size: "6.6cqw" },
  error: { word: "FAILED", sub: "BUILD ERROR", color: "#c8281c", size: "4.6cqw" },
  canceled: { word: "VOID", sub: "CANCELED", color: "#6f6a62", size: "5.2cqw" },
} as const;

// Kept in a .tsx file on purpose: the docs Tailwind pass only scans .tsx for class names.
const SMALL = "text-[2.05cqw] leading-none tracking-[0.1em]";
const RULE = "h-0 border-t-[0.28cqw] border-dashed border-current opacity-40";

export interface TicketProps {
  deploy: Deploy;
  /** False until the printer stamps it; flips to true with a thunk. */
  stamped: boolean;
  /** An earlier deploy (focusing its link feeds the history out). */
  history?: boolean;
  /** Links take pointer clicks only while true. */
  interactive?: boolean;
  still?: boolean;
}

export function Ticket({ deploy, stamped, history = false, interactive = true, still = false }: TicketProps) {
  const ink = INK[deploy.status];
  const stamp = STAMP[deploy.status];
  const { day, clock } = ticketDate(deploy.date);
  const message = firstLine(deploy.message) ?? "Manual deploy";
  const sha = deploy.sha?.slice(0, 7);
  const took = buildTime(deploy.duration);
  const where = [deploy.target, deploy.branch].filter(Boolean).join("  ·  ");
  const label = [`${stamp.sub.toLowerCase()}`, message, deploy.project, day && clock ? `${day} ${clock}` : null].filter(Boolean).join(" · ");

  return (
    <div className="absolute inset-0">
      {/* Shadow on whatever is behind the paper. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[3%] bottom-[-3%] top-[6%] rounded-[2cqw] bg-black/45 blur-[1.6cqw]" />

      <div
        aria-hidden
        className="absolute inset-0 flex flex-col justify-between px-[4.6cqw] pb-[3.3cqw] pt-[3.4cqw] font-mono"
        style={{ ...PAPER, color: ink, textShadow: "0 0 0.4px currentColor" }}
      >
        <div className="flex items-baseline justify-between gap-[3cqw]">
          <span className="min-w-0 truncate text-[3.15cqw] font-bold uppercase leading-none tracking-[0.05em]">{deploy.project ?? "Deploy"}</span>
          <span className={`${SMALL} shrink-0 opacity-75`}>No.{ticketNumber(deploy)}</span>
        </div>
        <span className={`${SMALL} truncate uppercase opacity-70`}>{where || " "}</span>
        <div className={RULE} />
        <span className={`${SMALL} uppercase`}>
          <span className="opacity-60">Commit </span>
          <span className="font-bold">{sha ?? "-------"}</span>
        </span>
        <span className="truncate pr-[14cqw] text-[2.85cqw] font-semibold leading-[1.1]">{message}</span>
        <div className={RULE} />
        <div className={`${SMALL} flex items-center justify-between uppercase`}>
          <span>
            {day ?? "--"} <span className="opacity-50">·</span> {clock ?? "--:--"}
          </span>
          {took && <span className="opacity-75">Build {took}</span>}
        </div>
        <div className="flex h-[3.2cqw] items-stretch gap-[0.32cqw] opacity-85">
          {barcode(deploy.id).map((w, i) => (
            <span key={i} className="bg-current" style={{ width: `${w * 0.22}cqw` }} />
          ))}
        </div>

        <motion.div
          className="absolute right-[4.4cqw] top-[15.5cqw] rounded-[1.3cqw] border-[0.5cqw] border-current p-[0.45cqw] text-center mix-blend-multiply"
          style={{ color: stamp.color, maskImage: INK_MASK, WebkitMaskImage: INK_MASK, textShadow: "none" }}
          initial={false}
          animate={stamped ? { opacity: 0.86, scale: 1, rotate: -11 } : { opacity: 0, scale: 1.7, rotate: -4 }}
          transition={still || !stamped ? { duration: 0 } : { type: "spring", stiffness: 900, damping: 30, mass: 0.6 }}
        >
          <div className="rounded-[0.8cqw] border-[0.22cqw] border-current px-[1.7cqw] pb-[0.7cqw] pt-[0.9cqw]">
            <div className="font-sans font-black leading-none tracking-[0.03em]" style={{ fontSize: stamp.size }}>
              {stamp.word}
            </div>
            <div className="mt-[0.5cqw] font-sans text-[1.35cqw] font-bold leading-none tracking-[0.22em]">{stamp.sub}</div>
          </div>
        </motion.div>
      </div>

      {deploy.url && (
        <a
          href={deploy.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          data-tp-history={history ? "" : undefined}
          className="absolute inset-0 rounded-[1.4cqw] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-white/50"
          style={{ pointerEvents: !history || interactive ? "auto" : "none" }}
        />
      )}
    </div>
  );
}
