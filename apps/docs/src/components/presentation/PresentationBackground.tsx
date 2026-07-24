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
      {mode === "moonArc" && (
        <>
          {/* Aurora Glow Blobs */}
          <motion.div
            className="absolute w-[500px] h-[350px] sm:w-[800px] sm:h-[500px] rounded-full blur-[100px] -bottom-10 -left-20"
            style={{ background: "linear-gradient(to right, rgba(76,29,149,0.6), rgba(30,27,75,0.5), rgba(30,64,175,0.4))" }}
            animate={reducedMotion ? undefined : {
              scale: [1, 1.2, 0.9, 1],
              x: [-40, 30, -20, -40],
              y: [20, -30, 10, 20],
              opacity: [0.4, 0.7, 0.5, 0.4],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[450px] h-[300px] sm:w-[700px] sm:h-[450px] rounded-full blur-[90px] -bottom-10 -right-20"
            style={{ background: "linear-gradient(to right, rgba(2,132,199,0.4), rgba(12,74,110,0.5), rgba(30,27,75,0.5))" }}
            animate={reducedMotion ? undefined : {
              scale: [1.1, 0.9, 1.25, 1.1],
              x: [30, -40, 20, 30],
              y: [-20, 30, -10, -20],
              opacity: [0.3, 0.6, 0.4, 0.3],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[600px] h-[300px] rounded-full blur-[120px] bottom-10 left-1/2 -translate-x-1/2"
            style={{ background: "rgba(124,58,237,0.3)" }}
            animate={reducedMotion ? undefined : {
              opacity: [0.2, 0.5, 0.2],
              scale: [0.95, 1.1, 0.95],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Planetary Horizon Arc */}
          <div className="absolute bottom-0 w-[140%] h-[300px] rounded-t-[100%] bg-gradient-to-b from-transparent via-[#050508]/80 to-[#050508]" />
          <div className="absolute bottom-0 w-[130%] left-1/2 -translate-x-1/2 h-[200px] rounded-t-[100%] bg-[#08090E] border-t border-white/30 shadow-[0_-15px_60px_rgba(255,255,255,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent blur-[1px]" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1/2 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px]" />
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0,rgba(0,0,0,0.28)_52%,rgba(0,0,0,0.58)_100%)]" />
    </motion.div>
  );
}

