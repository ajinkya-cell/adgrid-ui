"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { DisplayStrategy } from "@/registry";

const classes: Record<Exclude<DisplayStrategy, "auto">, string> = {
  center: "flex min-h-dvh items-center justify-center p-6 md:p-12",
  fullscreen: "relative min-h-dvh overflow-hidden",
  cover: "flex min-h-dvh items-stretch justify-stretch overflow-hidden",
  fit: "flex min-h-dvh items-center justify-center p-4 md:p-8",
};

export function PresentationCanvas({
  strategy,
  children,
}: {
  strategy: Exclude<DisplayStrategy, "auto">;
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.main
      layoutId="presentation-preview"
      className={`relative z-10 w-full ${classes[strategy]}`}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.985, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", duration: 0.28, bounce: 0 }}
    >
      {children}
    </motion.main>
  );
}

