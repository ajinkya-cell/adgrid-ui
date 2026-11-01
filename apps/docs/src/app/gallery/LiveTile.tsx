"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { PreviewCard } from "@ui/primitives/PreviewCard";
import { RoughArrow } from "@ui/animated/roughly/RoughArrow";
import { RoughBracket } from "@ui/animated/roughly/RoughBracket";
import { PresentationRenderer } from "@/components/presentation/PresentationRenderer";
import { FitToFrame } from "@/components/site/FitToFrame";
import type { ResolvedTile, ShowcaseHint, ShowcaseSize } from "./showcase";

// Spans kick in from `sm` (tall/lg) and `lg` (full); on phones every card is one column wide.
const SIZE_SPANS: Record<ShowcaseSize, string> = {
  sm: "",
  wide: "sm:col-span-2",
  tall: "row-span-2",
  lg: "sm:col-span-2 row-span-2",
  full: "sm:col-span-2 lg:col-span-3",
};

const HINT_INK = "#a3a3a3"; // void-lint-ignore: pencil grey for the hand-drawn hints

/** A small hand-drawn arrow pointing at a spot in the well, with a note at its tail. */
function Hint({ hint }: { hint: ShowcaseHint }) {
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: `${hint.at.x}%`, top: `${hint.at.y}%` }}
    >
      <RoughArrow
        placement={hint.placement}
        size={0.75}
        bend={hint.bend ?? 0.4}
        color={HINT_INK}
        strokeWidth={1.6}
        label={hint.label}
        labelFont="caveat"
        labelFontSize={22}
        animationDelay={500}
      >
        <span className="block size-1" />
      </RoughArrow>
    </div>
  );
}

/** A curly bracket hugging the card's right edge, with a handwritten note in the page margin. */
function MarginNote({ note, href }: { note: string; href: string }) {
  return (
    // Only where the margin is wide enough to hold it.
    <div className="absolute inset-y-6 left-full ml-3 hidden min-[1400px]:block">
      <RoughBracket side="left" color={HINT_INK} strokeWidth={1.6} bracketPadding={12} animationDelay={400} className="h-full" textClassName="flex h-full items-center">
        <Link
          href={href}
          className="block w-[120px] font-caveat text-[22px] leading-[1.05] text-neutral-400 transition-colors hover:text-neutral-200"
        >
          {note}
        </Link>
      </RoughBracket>
    </div>
  );
}

function TileBody({ tile }: { tile: ResolvedTile }) {
  const demo = <PresentationRenderer entry={tile.entry} liveProps={tile.props ?? {}} hideIntro mode="gallery" />;
  switch (tile.fit ?? "scale") {
    case "fill":
      // The transform makes this the containing block for `position: fixed` canvases, so a
      // full-screen background stays inside its well.
      return <div className="absolute inset-0 overflow-hidden [transform:translateZ(0)]">{demo}</div>;
    case "scroll":
      return (
        <div className="absolute inset-0 flex justify-center overflow-y-auto overscroll-contain py-6 [scrollbar-width:thin]">
          {demo}
        </div>
      );
    case "native":
      return <div className="flex h-full w-full items-center justify-center overflow-hidden">{demo}</div>;
    default:
      return <FitToFrame>{demo}</FitToFrame>;
  }
}

/**
 * A gallery card that renders its component live, so hovers, clicks and drags all reach it.
 * Scaled and canvas tiles unmount when far off screen to keep WebGL contexts bounded; the big
 * interactive ones stay mounted once seen, so a chat or a written page survives a scroll away.
 */
export function LiveTile({ tile, index, children }: { tile: ResolvedTile; index: number; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const keepAlive = tile.fit === "native" || tile.fit === "scroll";
  const near = useInView(ref, { margin: "200px 0px", once: keepAlive });
  const shown = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const rows = tile.size === "full" ? tile.rows ?? 2 : undefined;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.35, delay: (index % 3) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      className={`relative h-full ${SIZE_SPANS[tile.size]}`}
      style={rows ? { gridRow: `span ${rows} / span ${rows}` } : undefined}
    >
      <PreviewCard title={tile.entry.name} padded={false} lift={false} showArrow={false} className="font-poppins">
        {near && (children ?? <TileBody tile={tile} />)}
        {near && tile.hint && <Hint hint={tile.hint} />}
      </PreviewCard>
      {tile.note && <MarginNote note={tile.note} href={`/present/${tile.entry.category}/${tile.entry.slug}`} />}
      {/* Only the title row links out, so the well stays fully interactive. */}
      <Link
        href={`/present/${tile.entry.category}/${tile.entry.slug}`}
        className="group/open absolute inset-x-0 bottom-0 flex h-12 items-center justify-end rounded-b-[30px] px-6 font-poppins text-xs text-white/35 transition-colors hover:text-white/80"
        aria-label={`Open ${tile.entry.name}`}
      >
        Open
        <span className="ml-1 transition-transform group-hover/open:translate-x-0.5">↗</span>
      </Link>
    </motion.div>
  );
}
