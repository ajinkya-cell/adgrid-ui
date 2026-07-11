"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BackgroundMode } from "@/lib/presentation/store";

const baseTransition = { duration: 0.24, ease: [0.25, 1, 0.5, 1] };

export function PresentationBackground({ mode, canvasColor }: { mode: BackgroundMode; canvasColor: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      key={mode + canvasColor}
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: canvasColor }}
      initial={reducedMotion ? false : { opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={baseTransition}
    >
      {mode === "noise" && <div className="absolute inset-0 opacity-[0.055] [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_256_256%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22noise%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.85%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />}
      {mode === "grid" && (
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:40px_40px]" />
      )}
      {mode === "dotGrid" && (
        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(255,255,255,0.13)_1px,transparent_1px)] [background-size:24px_24px]" />
      )}
      {mode === "gradient" && (
        <motion.div
          className="absolute -inset-40 opacity-35 blur-3xl [background:linear-gradient(120deg,#111_15%,#2a261f_42%,#0f1417_70%,#111_100%)]"
          animate={reducedMotion ? undefined : { x: ["-3%", "3%", "-3%"], y: ["-2%", "2%", "-2%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      )}
      {mode === "aurora" && (
        <>
          <motion.div
            className="absolute left-[12%] top-[18%] h-[34rem] w-[34rem] rounded-full bg-stone-500/10 blur-3xl"
            animate={reducedMotion ? undefined : { x: [0, 42, 0], y: [0, -24, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute right-[10%] bottom-[12%] h-[30rem] w-[30rem] rounded-full bg-zinc-200/8 blur-3xl"
            animate={reducedMotion ? undefined : { x: [0, -36, 0], y: [0, 28, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0,rgba(0,0,0,0.28)_52%,rgba(0,0,0,0.58)_100%)]" />
    </motion.div>
  );
}

