"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export type SimpleCardProps = {
  title: string;
  description?: string;
  imageUrl: string;
  className?: string;
  /** Tailwind gradient classes for the card body, e.g. "from-zinc-800/90 to-zinc-900/95" */
  accent?: string;
  /** CSS color string for the prismatic top-border highlight */
  topBorderColor?: string;
};

export function SimpleCard({
  title,
  description,
  imageUrl,
  className,
  accent = "from-transparent to-transparent",
  topBorderColor = "rgba(255,255,255,0.18)",
}: SimpleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.button
      onClick={() => setExpanded((v) => !v)}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl text-left focus:outline-none cursor-pointer bg-[#151515]",
        className
      )}
      style={{
        width: 260,
        height: 320,
        boxShadow:
          "0 2px 0 0 rgba(255,255,255,0.06) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 32px 64px -12px rgba(0,0,0,0.7), 0 4px 24px -4px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Prismatic top-border highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${topBorderColor} 25%, rgba(255,255,255,0.32) 50%, ${topBorderColor} 75%, transparent 100%)`,
        }}
      />

      {/* Image — padded inside card */}
      <div className="relative h-[195px] w-full shrink-0 px-3 pt-3">
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            draggable={false}
            style={{ filter: "grayscale(1) contrast(1.08) brightness(0.78)" }}
          />
          {/* Fade into solid card body */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, #151515 100%)",
            }}
          />
        </div>
      </div>

      {/* Card body — content pinned to bottom */}
      <div
        className={cn(
          "relative flex flex-1 flex-col justify-end bg-[#151515] px-4 pb-4 pt-2",
          accent
        )}
      >

        <div className="relative z-10">
          <AnimatePresence>
            {expanded && description && (
              <motion.p
                key="desc"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden text-[12px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.48)" }}
              >
                {description}
              </motion.p>
            )}
          </AnimatePresence>

<h2
            className={cn(
              "text-[35px] leading-tight tracking-tight pb-2"
            )}
style={{ fontFamily: '"Instrument Serif", serif', color: "rgba(255,255,255,0.92)" }}
          >
            {title}
          </h2>
        </div>
      </div>
    </motion.button>
  );
}
