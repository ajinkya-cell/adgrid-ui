"use client";

import React, { useState } from "react";
import { motion, useAnimation, AnimatePresence, TargetAndTransition } from "framer-motion";
import {
  IconLoader2,
  IconAtom2,
  IconHexagon,
  IconSunFilled,
  IconMoonFilled,
  IconCircleDashedX,
  IconCircleCheckFilled,
  IconBolt,
  IconDna2,
  IconSend,
  IconFolder,
  IconFolderOpen,
  IconCloudDownload,
  IconCheck,
  IconFingerprint,
  IconShield,
  IconShieldCheck,
  IconBell,
  IconEye,
  IconEyeClosed,
  IconRefresh,
  IconSearch,
  IconHeart,
  IconHammer,
} from "@tabler/icons-react";
import { AnimatedIconCard } from "./LoaderCard";

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC CLICK ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

const tripleSpinAnimation: TargetAndTransition = {
  rotate: [0, 360, 720, 1080],
  transition: { duration: 0.85, ease: [0.18, 0, 0.6, 1], times: [0, 0.28, 0.62, 1] },
};

const nuclearCollapseAnimation: TargetAndTransition = {
  scale: [1, 1.15, 0.08, 1.6, 0.82, 1.08, 1],
  rotate: [0, -45, -180, -360],
  transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.1, 0.3, 0.55, 0.75, 0.9, 1] },
};

const facetSnapAnimation: TargetAndTransition = {
  rotate: [0, 60, 120, 180, 240, 300, 360],
  transition: { duration: 0.72, ease: [0.08, 0.82, 0.17, 1], times: [0, 0.14, 0.29, 0.45, 0.61, 0.78, 1] },
};

const helixFlipAnimation: TargetAndTransition = {
  rotateY: [0, 90, 180, 270, 360],
  skewX: [0, 14, 0, -14, 0],
  transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1], times: [0, 0.22, 0.5, 0.78, 1] },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CARD SHELL
// ─────────────────────────────────────────────────────────────────────────────

const CARD_CLASS =
  "flex items-center justify-center bg-[#0a0a0a] border border-white/[0.07] rounded-xl cursor-pointer";

interface CardBaseProps {
  cardSize?: number;
  iconSize?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// BESPOKE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── InfinityPathCard ─────────────────────────────────────────────────────────
// Starts fully drawn. Click → stroke retracts to nothing → redraws.
function InfinityPathCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start({ pathLength: 0, transition: { duration: 0.9, ease: [0.4, 0, 0.8, 1] } });
    await controls.start({ pathLength: 1, transition: { duration: 1.0, ease: [0.2, 0, 0.2, 1] } });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <motion.path
          d="M9.828 9.172a4 4 0 1 0 0 5.656a10 10 0 0 0 2.172 -2.828a10 10 0 0 1 2.172 -2.828a4 4 0 1 1 0 5.656a10 10 0 0 1 -2.172 -2.828a10 10 0 0 0 -2.172 -2.828"
          animate={controls} initial={{ pathLength: 1 }}
        />
      </svg>
    </div>
  );
}

// ── SpiralPathCard ────────────────────────────────────────────────────────────
// Starts fully drawn. Click → unwinds to nothing → recoils back out.
function SpiralPathCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start({ pathLength: 0, transition: { duration: 0.95, ease: [0.4, 0, 0.8, 1] } });
    await controls.start({ pathLength: 1, transition: { duration: 1.05, ease: [0.2, 0, 0.2, 1] } });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <motion.path
          d="M10 12.057a1.9 1.9 0 0 0 .614 .743c1.06 .713 2.472 .112 3.043 -.919c.839 -1.513 -.022 -3.368 -1.525 -4.08c-2 -.95 -4.371 .154 -5.24 2.086c-1.095 2.432 .29 5.248 2.71 6.246c2.931 1.208 6.283 -.418 7.438 -3.255c1.36 -3.343 -.557 -7.134 -3.896 -8.41c-3.855 -1.474 -8.2 .68 -9.636 4.422c-1.63 4.253 .823 9.024 5.082 10.576c4.778 1.74 10.118 -.941 11.833 -5.59a9.354 9.354 0 0 0 .577 -2.813"
          animate={controls} initial={{ pathLength: 1 }}
        />
      </svg>
    </div>
  );
}

// ── SunMoonCard ───────────────────────────────────────────────────────────────
// Toggle: sun ↔ moon. AnimatePresence mode="wait" sequences exit before enter.
function SunMoonCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [isMoon, setIsMoon] = useState(false);
  return (
    <div onClick={() => setIsMoon((v) => !v)} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <AnimatePresence mode="wait">
          {!isMoon ? (
            <motion.div key="sun" className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.6, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 45 }} transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}>
              <IconSunFilled size={iconSize} color="white" />
            </motion.div>
          ) : (
            <motion.div key="moon" className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.6, rotate: 45 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: -45 }} transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}>
              <IconMoonFilled size={iconSize} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── CircleStateCard ───────────────────────────────────────────────────────────
// Toggle: dashed-X ↔ filled-check. Check enters with spring bounce.
function CircleStateCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div onClick={() => setIsChecked((v) => !v)} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <AnimatePresence mode="wait">
          {!isChecked ? (
            <motion.div key="x" className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.75, rotate: -15 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.65, rotate: 20 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
              <IconCircleDashedX size={iconSize} stroke={2} color="white" />
            </motion.div>
          ) : (
            <motion.div key="check" className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.65, rotate: -20 }}
              transition={{ opacity: { duration: 0.25, ease: "easeOut" }, scale: { type: "spring", stiffness: 380, damping: 22 } }}>
              <IconCircleCheckFilled size={iconSize} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── BoltFillCard ──────────────────────────────────────────────────────────────
// Gray bolt → white fills upward from bottom → drains back.
function BoltFillCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start({ height: "100%", transition: { duration: 0.72, ease: [0.4, 0, 0.2, 1] } });
    await new Promise<void>((r) => setTimeout(r, 380));
    await controls.start({ height: "0%", transition: { duration: 0.5, ease: [0.6, 0, 0.8, 0] } });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <IconBolt size={iconSize} stroke={2} color="#3f3f46" />
        <motion.div className="absolute bottom-0 left-0 w-full overflow-hidden"
          animate={controls} initial={{ height: "0%" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0 }}>
            <IconBolt size={iconSize} stroke={2} color="white" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── ScanCubeCard ──────────────────────────────────────────────────────────────
// Two stacked motion.divs (div transforms are reliable; SVG motion.g transforms
// are inconsistent cross-browser). Brackets scale, cube rotates — simultaneously.
function ScanCubeCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const cubeControls = useAnimation();
  const scanControls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    // Phase 1: brackets expand + cube rotates at the same time
    await Promise.all([
      cubeControls.start({ rotate: 360, transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] } }),
      scanControls.start({ scale: 1.45, transition: { duration: 0.5,  ease: [0.4, 0, 0.2, 1] } }),
    ]);

    // Phase 2: both return simultaneously
    await Promise.all([
      cubeControls.start({ rotate: 0, transition: { duration: 0.5,  ease: [0.2, 0, 0.4, 1] } }),
      scanControls.start({ scale: 1,   transition: { duration: 0.45, ease: [0.2, 0, 0.4, 1] } }),
    ]);

    setFiring(false);
  };

  const svgProps = {
    width: iconSize, height: iconSize, viewBox: "0 0 24 24",
    fill: "none", stroke: "white", strokeWidth: 2,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>

        {/* Corner scan brackets — scale from centre via CSS on the wrapping div */}
        <motion.div className="absolute inset-0" animate={scanControls}
          style={{ transformOrigin: "center" }}>
          <svg {...svgProps}>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 7v-2a2 2 0 0 1 2 -2h2" />
            <path d="M3 17v2a2 2 0 0 0 2 2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M17 21h2a2 2 0 0 0 2 -2v-2" />
          </svg>
        </motion.div>

        {/* Cube body — rotates from centre via CSS on the wrapping div */}
        <motion.div className="absolute inset-0" animate={cubeControls}
          style={{ transformOrigin: "center" }}>
          <svg {...svgProps}>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M8.504 9.426l3 -1.714a1 1 0 0 1 .992 0l3 1.714a1 1 0 0 1 .504 .868v3.411a1 1 0 0 1 -.504 .868l-3 1.715a1 1 0 0 1 -.992 0l-3 -1.715a1 1 0 0 1 -.504 -.868v-3.41a1 1 0 0 1 .504 -.869" />
            <path d="M15.75 9.964l-3.75 2.036" />
            <path d="M12 12l-3.75 -2.036" />
            <path d="M12 12v4.071" />
          </svg>
        </motion.div>

      </div>
    </div>
  );
}

// ── SendCard ──────────────────────────────────────────────────────────────────
// Click: icon flies to top-right and disappears (clipped by overflow-hidden),
// reappears from bottom-left, glides back to centre.
function SendCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    // Phase 1: fly out to top-right — clipped by overflow-hidden on the card
    await controls.start({
      x: 58, y: -58, opacity: 1, rotate: 12,
      transition: { duration: 0.36, ease: [0.4, 0, 1, 1] },
    });

    // Teleport instantly to bottom-left
    controls.set({ x: -58, y: 58, rotate: -12 });

    // Phase 2: fly back in to centre
    await controls.start({
      x: 0, y: 0, opacity: 1, rotate: 0,
      transition: { duration: 0.44, ease: [0, 0, 0.2, 1] },
    });

    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={`${CARD_CLASS} overflow-hidden`}
      style={{ width: cardSize, height: cardSize }}>
      <motion.div animate={controls} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}>
        <IconSend size={iconSize} stroke={2} color="white" />
      </motion.div>
    </div>
  );
}

// ── FolderCard ────────────────────────────────────────────────────────────────
// Toggle: closed ↔ open via a 3-D rotateY flip with perspective + spring.
// Closed exits by rotating away to the right; open flips in from the left,
// giving a genuine "opening a physical folder" feel.
function FolderCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      onClick={() => setIsOpen((v) => !v)}
      className={CARD_CLASS}
      style={{ width: cardSize, height: cardSize, perspective: 500 }}
    >
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="closed"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotateY: -80, scale: 0.75 }}
              animate={{ opacity: 1, rotateY: 0,   scale: 1    }}
              exit={{    opacity: 0, rotateY:  80,  scale: 0.75 }}
              transition={{
                rotateY: { type: "spring", stiffness: 280, damping: 22 },
                scale:   { type: "spring", stiffness: 280, damping: 22 },
                opacity: { duration: 0.18 },
              }}
            >
              <IconFolder size={iconSize} stroke={2} color="white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotateY:  80, scale: 0.75 }}
              animate={{ opacity: 1, rotateY: 0,   scale: 1    }}
              exit={{    opacity: 0, rotateY: -80,  scale: 0.75 }}
              transition={{
                rotateY: { type: "spring", stiffness: 280, damping: 22 },
                scale:   { type: "spring", stiffness: 280, damping: 22 },
                opacity: { duration: 0.18 },
              }}
            >
              <IconFolderOpen size={iconSize} stroke={2} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── ListCheckCard ─────────────────────────────────────────────────────────────
// Click: bullet dots fade out while three checkmarks draw in one by one
// with a smooth staggered pathLength animation (0 → 1 per check).
// Click again: checks retract in reverse stagger, dots return.
//
// SVG structure mirrors icon-list-check.svg exactly.
// Dots group & checks group each have their own animation controls.
// Stagger is handled via variants + staggerChildren on the checks group.

const CHECK_HIDDEN = { pathLength: 0, opacity: 0 };
const CHECK_VISIBLE = { pathLength: 1, opacity: 1 };

const checkChildVariants = {
  hidden: { ...CHECK_HIDDEN, transition: { duration: 0.22, ease: "easeIn" } },
  visible: { ...CHECK_VISIBLE, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
};

const checkGroupVariants = {
  hidden: { transition: { staggerChildren: 0.14, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.05 } },
};

function ListCheckCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const dotsControls = useAnimation();
  const checksControls = useAnimation();
  const [isChecked, setIsChecked] = useState(false);
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    if (!isChecked) {
      // Dots fade out first, then checks draw in staggered
      await dotsControls.start({ opacity: 0, transition: { duration: 0.18 } });
      await checksControls.start("visible");
    } else {
      // Checks retract in reverse stagger, dots return after
      await checksControls.start("hidden");
      await dotsControls.start({ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } });
    }

    setIsChecked((v) => !v);
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />

        {/* Bullet dots — fade out when transitioning to checked */}
        <motion.g animate={dotsControls} initial={{ opacity: 1 }}>
          <path d="M5 6l0 .01" />
          <path d="M5 12l0 .01" />
          <path d="M5 18l0 .01" />
        </motion.g>

        {/* Checkmarks — draw in one by one via staggerChildren */}
        <motion.g
          animate={checksControls}
          initial="hidden"
          variants={checkGroupVariants}
        >
          <motion.path d="M3.5 5.5l1.5 1.5l2.5 -2.5"   variants={checkChildVariants} />
          <motion.path d="M3.5 11.5l1.5 1.5l2.5 -2.5"  variants={checkChildVariants} />
          <motion.path d="M3.5 17.5l1.5 1.5l2.5 -2.5"  variants={checkChildVariants} />
        </motion.g>

        {/* Text lines — always visible */}
        <path d="M9 6l11 0" />
        <path d="M9 12l11 0" />
        <path d="M9 18l11 0" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ── DownloadCheckCard ────────────────────────────────────────────────────────────
function DownloadCheckCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    setIsDownloaded((v) => !v);
    setTimeout(() => setFiring(false), 600);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <AnimatePresence mode="wait">
          {!isDownloaded ? (
            <motion.div
              key="download"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 15, transition: { duration: 0.25, ease: "easeIn" } }}
            >
              <IconCloudDownload size={iconSize} stroke={2} color="white" />
            </motion.div>
          ) : (
            <motion.div
              key="check"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.3, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
            >
              <IconCheck size={iconSize} stroke={2.5} color="#4ade80" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── FingerprintScanCard ──────────────────────────────────────────────────────
function FingerprintScanCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const printControls = useAnimation();
  const lineControls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    lineControls.set({ top: "0%", opacity: 1, scaleX: 1 });

    await Promise.all([
      lineControls.start({
        top: ["0%", "100%", "100%"],
        opacity: [1, 1, 0],
        scaleX: [0.2, 1, 0.2],
        transition: { duration: 0.75, ease: "easeInOut", times: [0, 0.8, 1] },
      }),
      printControls.start({
        opacity: [1, 0.3, 1, 0.5, 1],
        scale: [1, 0.96, 1.02, 0.98, 1],
        transition: { duration: 0.75, ease: "linear" },
      }),
    ]);

    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ width: iconSize, height: iconSize }}
      >
        <motion.div animate={printControls}>
          <IconFingerprint size={iconSize} stroke={1.75} color="white" />
        </motion.div>
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
          initial={{ top: "0%", opacity: 0 }}
          animate={lineControls}
        />
      </div>
    </div>
  );
}

// ── WifiPingCard ────────────────────────────────────────────────────────────────
function WifiPingCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start("ping");
    setFiring(false);
  };

  const wifiVariants = {
    initial: { pathLength: 1, opacity: 1 },
    ping: (i: number) => ({
      pathLength: [1, 0, 0, 1],
      opacity: [1, 0, 0, 1],
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        delay: i * 0.08,
      },
    }),
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg
        width={iconSize} height={iconSize} viewBox="0 0 24 24"
        fill="none" stroke="white" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <motion.path d="M12 18l.01 0"                            custom={0} variants={wifiVariants} animate={controls} initial="initial" />
        <motion.path d="M9.172 15.172a4 4 0 0 1 5.656 0"         custom={1} variants={wifiVariants} animate={controls} initial="initial" />
        <motion.path d="M6.343 12.343a8 8 0 0 1 11.314 0"        custom={2} variants={wifiVariants} animate={controls} initial="initial" />
        <motion.path d="M3.515 9.515a12 12 0 0 1 16.97 0"        custom={3} variants={wifiVariants} animate={controls} initial="initial" />
      </svg>
    </div>
  );
}

// ── ShieldOverdriveCard ──────────────────────────────────────────────────────────
function ShieldOverdriveCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [isProtected, setIsProtected] = useState(false);
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    setIsProtected((v) => !v);
    setTimeout(() => setFiring(false), 700);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <AnimatePresence mode="wait">
          {!isProtected ? (
            <motion.div
              key="shield"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: [1, 1.2, 0.7], opacity: 0, transition: { duration: 0.3 } }}
            >
              <IconShield size={iconSize} stroke={2} color="white" />
            </motion.div>
          ) : (
            <motion.div
              key="secure"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.4, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
            >
              <IconShieldCheck size={iconSize} stroke={2} color="#60a5fa" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── BellTremoloCard ────────────────────────────────────────────────────────────────
function BellTremoloCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    await controls.start({
      rotate: [0, -18, 14, -10, 7, -3, 0],
      x: [0, -2, 2, -1.5, 1, -0.5, 0],
      transition: { duration: 0.65, ease: "easeInOut" },
    });

    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <motion.div animate={controls} style={{ transformOrigin: "top center" }}>
        <IconBell size={iconSize} stroke={2} color="white" />
      </motion.div>
    </div>
  );
}

// ── EyeApertureCard ────────────────────────────────────────────────────────────────
function EyeApertureCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    setIsOpen((v) => !v);
    setTimeout(() => setFiring(false), 450);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="open"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scaleY: 0.3 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.1, scaleX: 1.1, transition: { duration: 0.2 } }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <IconEye size={iconSize} stroke={2} color="white" />
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scaleY: 0.3, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <IconEyeClosed size={iconSize} stroke={2} color="#a1a1aa" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ── TrashDiscardCard ──────────────────────────────────────────────────────────
// Lid pops upward + rotates; bin body shakes simultaneously to "empty" contents.
// Uses two stacked motion.divs (one per SVG layer) for reliable CSS transforms.
function TrashDiscardCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const lidControls = useAnimation();
  const binControls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    await Promise.all([
      lidControls.start({
        y: [0, -6, -4, 0],
        rotate: [0, -12, 5, 0],
        transition: { duration: 0.5, ease: "easeOut" },
      }),
      binControls.start({
        x: [0, -3, 3, -2, 2, -1, 0],
        transition: { duration: 0.4, delay: 0.1 },
      }),
    ]);

    setFiring(false);
  };

  const svgBase = {
    width: iconSize, height: iconSize, viewBox: "0 0 24 24",
    fill: "none", stroke: "white", strokeWidth: 2,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <div className="relative" style={{ width: iconSize, height: iconSize }}>

        {/* Bin body — shakes horizontally */}
        <div className="absolute inset-0">
          <motion.div animate={binControls} style={{ transformOrigin: "center bottom" }}>
            <svg {...svgBase}>
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
            </svg>
          </motion.div>
        </div>

        {/* Lid + handle — pops up and rotates */}
        <div className="absolute inset-0">
          <motion.div animate={lidControls} style={{ transformOrigin: "right center" }}>
            <svg {...svgBase}>
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 7l16 0" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
          </motion.div>
        </div>

      </div>
    </div>
  );
}


// ── KineticRefreshCard ────────────────────────────────────────────────────────
// Wind-back -45° then snap through 360° with overshoot cubic-bezier.
function KineticRefreshCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start({
      rotate: [0, -45, 360],
      transition: { duration: 0.75, ease: [0.34, 1.56, 0.64, 1], times: [0, 0.15, 1] },
    });
    controls.set({ rotate: 0 });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <motion.div animate={controls} style={{ transformOrigin: "center center" }}>
        <IconRefresh size={iconSize} stroke={2} color="white" />
      </motion.div>
    </div>
  );
}

// ── SearchRadarCard ───────────────────────────────────────────────────────────
// Lens scales outward along its handle diagonal then snaps back.
function SearchRadarCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start({
      scale: [1, 1.25, 0.9, 1],
      x: [0, 3, -1, 0],
      y: [0, -3, 1, 0],
      transition: { duration: 0.6, ease: "easeInOut" },
    });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <motion.div animate={controls} style={{ transformOrigin: "bottom right" }}>
        <IconSearch size={iconSize} stroke={2} color="white" />
      </motion.div>
    </div>
  );
}

// ── HeartbeatCard ─────────────────────────────────────────────────────────────
// Collapse → burst → spring settle. Toggles red fill on each click.
function HeartbeatCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);
  const [active, setActive] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    setActive((v) => !v);
    await controls.start({
      scale: [1, 0.75, 1.35, 0.95, 1],
      transition: { duration: 0.55, ease: "easeInOut", times: [0, 0.2, 0.5, 0.8, 1] },
    });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <motion.div animate={controls} style={{ transformOrigin: "center center" }}>
        <IconHeart
          size={iconSize}
          stroke={2}
          color={active ? "#ef4444" : "white"}
          fill={active ? "#ef4444" : "transparent"}
          style={{ transition: "fill 0.2s ease, color 0.2s ease" }}
        />
      </motion.div>
    </div>
  );
}

// ── HammerStrikeCard ──────────────────────────────────────────────────────────
// Wind-back along handle axis then snap-strike with recoil.
function HammerStrikeCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);
    await controls.start({
      rotate: [0, -45, 15, -5, 0],
      x: [0, -2, 4, 0, 0],
      y: [0, 2, -2, 0, 0],
      transition: { duration: 0.5, times: [0, 0.3, 0.5, 0.8, 1], ease: "easeOut" },
    });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <motion.div animate={controls} style={{ transformOrigin: "bottom left" }}>
        <IconHammer size={iconSize} stroke={2} color="white" />
      </motion.div>
    </div>
  );
}

// ── PlanetaryGearCard ────────────────────────────────────────────────────────
function PlanetaryGearCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const gearControls = useAnimation();
  const centerControls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    await Promise.all([
      gearControls.start({
        rotate: [0, -30, 210, 180],
        transition: { duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }
      }),
      centerControls.start({
        scale: [1, 0.5, 1.4, 0.9, 1],
        transition: { duration: 0.75, ease: "easeInOut" }
      })
    ]);

    gearControls.set({ rotate: 0 });
    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          animate={gearControls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: "12px 12px" }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="3"
          animate={centerControls}
          initial={{ scale: 1 }}
          style={{ transformOrigin: "12px 12px" }}
        />
      </svg>
    </div>
  );
}

// ── WaveformCard ──────────────────────────────────────────────────────────────
function WaveformCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const transition1 = isPlaying
    ? { repeat: Infinity, repeatType: "mirror" as const, duration: 0.6, ease: "easeInOut" }
    : { duration: 0.3 };
  const transition2 = isPlaying
    ? { repeat: Infinity, repeatType: "mirror" as const, duration: 0.8, ease: "easeInOut" }
    : { duration: 0.3 };
  const transition3 = isPlaying
    ? { repeat: Infinity, repeatType: "mirror" as const, duration: 0.5, ease: "easeInOut" }
    : { duration: 0.3 };
  const transition4 = isPlaying
    ? { repeat: Infinity, repeatType: "mirror" as const, duration: 0.7, ease: "easeInOut" }
    : { duration: 0.3 };
  const transition5 = isPlaying
    ? { repeat: Infinity, repeatType: "mirror" as const, duration: 0.9, ease: "easeInOut" }
    : { duration: 0.3 };

  return (
    <div onClick={() => setIsPlaying(!isPlaying)} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={isPlaying ? "#10b981" : "white"}
        strokeWidth={2}
        strokeLinecap="round"
        style={{ transition: "stroke 0.3s ease" }}
      >
        <motion.line
          x1="4" y1="8" x2="4" y2="16"
          animate={{ scaleY: isPlaying ? [1, 2.2, 0.4, 1.8, 1] : 1 }}
          transition={transition1}
          style={{ transformOrigin: "4px 12px" }}
        />
        <motion.line
          x1="8" y1="5" x2="8" y2="19"
          animate={{ scaleY: isPlaying ? [1, 0.3, 2.0, 0.7, 1] : 1 }}
          transition={transition2}
          style={{ transformOrigin: "8px 12px" }}
        />
        <motion.line
          x1="12" y1="2" x2="12" y2="22"
          animate={{ scaleY: isPlaying ? [1, 2.4, 0.5, 1.8, 1] : 1 }}
          transition={transition3}
          style={{ transformOrigin: "12px 12px" }}
        />
        <motion.line
          x1="16" y1="5" x2="16" y2="19"
          animate={{ scaleY: isPlaying ? [1, 0.5, 2.2, 0.4, 1] : 1 }}
          transition={transition4}
          style={{ transformOrigin: "16px 12px" }}
        />
        <motion.line
          x1="20" y1="8" x2="20" y2="16"
          animate={{ scaleY: isPlaying ? [1, 2.0, 0.3, 1.5, 1] : 1 }}
          transition={transition5}
          style={{ transformOrigin: "20px 12px" }}
        />
      </svg>
    </div>
  );
}

// ── PaperclipSnapCard ────────────────────────────────────────────────────────
function PaperclipSnapCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const pathControls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    await pathControls.start({
      pathLength: 0,
      transition: { duration: 0.6, ease: "easeInOut" }
    });
    await pathControls.start({
      pathLength: 1,
      transition: { duration: 0.7, ease: "easeInOut" }
    });

    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <motion.div style={{ transform: "rotate(35deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M15 7l-6.5 6.5a3.5 3.5 0 0 0 5 5l6.5 -6.5a5.5 5.5 0 0 0 -7.7 -7.7l-6.5 6.5a7.5 7.5 0 0 0 10.6 10.6l6.5 -6.5"
            animate={pathControls}
            initial={{ pathLength: 1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

// ── AudioMuteCard ────────────────────────────────────────────────────────
function AudioMuteCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const [volumeLevel, setVolumeLevel] = useState(1);
  const speakerControls = useAnimation();

  const handleClick = async () => {
    const nextLevel = (volumeLevel + 1) % 4;
    setVolumeLevel(nextLevel);

    await speakerControls.start({
      scale: [1, 0.85, 1.1, 1],
      transition: { duration: 0.3, ease: "easeOut" }
    });
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={volumeLevel === 0 ? "#f43f5e" : "white"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.2s ease" }}
      >
        <motion.path
          d="M6 9H4.5a1.5 1.5 0 0 0 -1.5 1.5v3A1.5 1.5 0 0 0 4.5 15H6l4 4V5L6 9z"
          animate={speakerControls}
          style={{ transformOrigin: "8px 12px" }}
        />
        {volumeLevel === 0 && (
          <motion.path
            d="M16 9l4 4m0 -4l-4 4"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            style={{ transformOrigin: "18px 11px" }}
          />
        )}
        <motion.path
          d="M15 8a5 5 0 0 1 0 8"
          animate={{
            opacity: volumeLevel >= 1 ? 1 : 0,
            scale: volumeLevel >= 1 ? 1 : 0.6,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          style={{ transformOrigin: "12px 12px" }}
        />
        <motion.path
          d="M17.7 5a9 9 0 0 1 0 14"
          animate={{
            opacity: volumeLevel >= 2 ? 1 : 0,
            scale: volumeLevel >= 2 ? 1 : 0.6,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          style={{ transformOrigin: "12px 12px" }}
        />
        <motion.path
          d="M20.4 2a13 13 0 0 1 0 20"
          animate={{
            opacity: volumeLevel >= 3 ? 1 : 0,
            scale: volumeLevel >= 3 ? 1 : 0.6,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          style={{ transformOrigin: "12px 12px" }}
        />
      </svg>
    </div>
  );
}

// ── ScissorShearCard ────────────────────────────────────────────────────────
function ScissorShearCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const controlsA = useAnimation();
  const controlsB = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    await Promise.all([
      controlsA.start({
        rotate: [-15, 8, -15],
        transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
      }),
      controlsB.start({
        rotate: [15, -8, 15],
        transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
      })
    ]);

    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="1" fill="white" />
        <motion.g
          animate={controlsA}
          initial={{ rotate: -15 }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <circle cx="6" cy="7" r="3" />
          <path d="M8.6 8.6l10.4 10.4" />
        </motion.g>
        <motion.g
          animate={controlsB}
          initial={{ rotate: 15 }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <circle cx="6" cy="17" r="3" />
          <path d="M8.6 15.4l10.4 -10.4" />
        </motion.g>
      </svg>
    </div>
  );
}

// ── KeyTumblerCard ────────────────────────────────────────────────────────
function KeyTumblerCard({ cardSize = 88, iconSize = 28 }: CardBaseProps) {
  const keyControls = useAnimation();
  const shackleControls = useAnimation();
  const [firing, setFiring] = useState(false);

  const handleClick = async () => {
    if (firing) return;
    setFiring(true);

    await Promise.all([
      keyControls.start({
        rotate: [0, 90, 90, 0],
        transition: {
          duration: 0.9,
          times: [0, 0.3, 0.7, 1],
          ease: "easeInOut"
        }
      }),
      shackleControls.start({
        y: [0, 0, -3, -3, 0],
        rotate: [0, 0, -12, -12, 0],
        transition: {
          duration: 0.9,
          times: [0, 0.3, 0.45, 0.7, 1],
          ease: "easeInOut"
        }
      })
    ]);

    setFiring(false);
  };

  return (
    <div onClick={handleClick} className={CARD_CLASS} style={{ width: cardSize, height: cardSize }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M9 10V7a3 3 0 0 1 6 0v3"
          animate={shackleControls}
          initial={{ y: 0, rotate: 0 }}
          style={{ transformOrigin: "9px 10px" }}
        />
        <rect x="6" y="10" width="12" height="9" rx="1.5" />
        <motion.g
          animate={keyControls}
          initial={{ rotate: 0 }}
          style={{ transformOrigin: "12px 14px" }}
        >
          <circle cx="12" cy="14" r="1.5" />
          <path d="M12 15.5v2.5h1.5" />
        </motion.g>
      </svg>
    </div>
  );
}

/**
 * AnimatedIcons1
 *
 * 30 Tabler icons in monochrome black cards.
 * Each card is click-triggered — no hover state, no shadows.
 */
export const AnimatedIcons1: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#0d0d0d] flex items-center justify-center p-8">
      <div
        className="flex flex-wrap justify-center gap-3"
        style={{ maxWidth: 88 * 6 + 12 * 5 }}
      >
        {/* Row 1 */}
        <AnimatedIconCard icon={IconLoader2} animation={tripleSpinAnimation}      />
        <AnimatedIconCard icon={IconAtom2}   animation={nuclearCollapseAnimation} />
        <AnimatedIconCard icon={IconHexagon} animation={facetSnapAnimation}       />
        <SunMoonCard />
        <InfinityPathCard />
        <CircleStateCard />

        {/* Row 2 */}
        <BoltFillCard />
        <AnimatedIconCard icon={IconDna2}    animation={helixFlipAnimation}       />
        <SpiralPathCard />
        <ScanCubeCard />
        <SendCard />
        <FolderCard />

        {/* Row 3 */}
        <ListCheckCard />
        <DownloadCheckCard />
        <FingerprintScanCard />
        <WifiPingCard />
        <ShieldOverdriveCard />
        <BellTremoloCard />

        {/* Row 4 */}
        <EyeApertureCard />
        <TrashDiscardCard />
        <KineticRefreshCard />
        <SearchRadarCard />
        <HeartbeatCard />
        <HammerStrikeCard />

        {/* Row 5 */}
        <PlanetaryGearCard />
        <PaperclipSnapCard />
        <AudioMuteCard />
        <ScissorShearCard />
        <KeyTumblerCard />
        <WaveformCard />
      </div>
    </div>
  );
};
