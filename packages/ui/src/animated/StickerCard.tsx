"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import {
  IconBrandNextjs,
  IconBrandRust,
  IconBrandDocker,
  IconBrandTailwind,
  IconBrandGolang,
  IconDatabase,
  IconBrandSvelte,
  IconBrandReact,
  IconBrandTypescript,
  IconBrandGithub,
} from "@tabler/icons-react";

export interface StickerCardProps {
  className?: string;
  numStickers?: number;
}

interface Sticker {
  id: number;
  icon: React.ReactNode;
  targetX: number;
  targetY: number;
  rotate: number;
}

const stickerData: Sticker[] = [
  { id: 1, icon: <IconBrandNextjs className="w-8 h-8 text-white/90" />, targetX: -260, targetY: -160, rotate: -20 },
  { id: 2, icon: <IconBrandRust className="w-8 h-8 text-white/90" />, targetX: 280, targetY: -140, rotate: 18 },
  { id: 3, icon: <IconBrandDocker className="w-8 h-8 text-white/90" />, targetX: -280, targetY: 100, rotate: -15 },
  { id: 4, icon: <IconBrandTailwind className="w-8 h-8 text-white/90" />, targetX: 260, targetY: 140, rotate: 25 },
  // Go sticker adjusted upwards: targetY changed from -200 to -260
  { id: 5, icon: <IconBrandGolang className="w-8 h-8 text-white/90" />, targetX: -90, targetY: -260, rotate: 10 },
  { id: 6, icon: <IconDatabase className="w-8 h-8 text-white/90" />, targetX: 110, targetY: 200, rotate: -22 },
  { id: 7, icon: <IconBrandSvelte className="w-8 h-8 text-white/90" />, targetX: -180, targetY: 200, rotate: 15 },
  { id: 8, icon: <IconBrandReact className="w-8 h-8 text-white/90" />, targetX: -80, targetY: 230, rotate: -10 },
  { id: 9, icon: <IconBrandTypescript className="w-8 h-8 text-white/90" />, targetX: 80, targetY: -220, rotate: 12 },
  { id: 10, icon: <IconBrandGithub className="w-8 h-8 text-white/90" />, targetX: 200, targetY: -240, rotate: -18 },
];

export default function StickerCard({ className, numStickers = 7 }: StickerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Clamp the number of stickers between 5 and 10
  const clampedNum = Math.min(10, Math.max(5, numStickers));
  const activeStickers = stickerData.slice(0, clampedNum);

  return (
    <div className="relative flex items-center justify-center min-h-[600px] w-full overflow-visible">
      {/* --- STICKERS LAYER (Behind the card) --- */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <AnimatePresence>
          {activeStickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              className="absolute p-4 rounded-xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-2xl z-0"
              style={{
                backgroundColor: "#171717",
                boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0,0,0,0.55)",
              }}
              initial={{ x: 0, y: 0, scale: 0.2, rotate: 0, opacity: 0 }}
              animate={
                isHovered
                  ? {
                      x: sticker.targetX,
                      y: sticker.targetY,
                      scale: 1.1,
                      rotate: sticker.rotate,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 120,
                        damping: 12,
                        mass: 0.8,
                      },
                    }
                  : {
                      x: 0,
                      y: 0,
                      scale: 0.2,
                      rotate: 0,
                      opacity: 0,
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                      },
                    }
              }
              whileHover={{
                scale: 1.25,
                rotate: sticker.rotate + 10,
                zIndex: 50,
                transition: { duration: 0.2 },
              }}
            >
              {sticker.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- THE MAIN CARD (Styled exactly like SimpleCard) --- */}
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex flex-col overflow-hidden rounded-2xl text-left focus:outline-none cursor-pointer bg-[#151515] z-10",
          className
        )}
        style={{
          width: 260,
          height: 320,
          boxShadow:
            "0 2px 0 0 rgba(255,255,255,0.06) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 32px 64px -12px rgba(0,0,0,0.7), 0 4px 24px -4px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow: "0 40px 80px -12px rgba(0,0,0,0.85), 0 8px 32px -4px rgba(0,0,0,0.6)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Prismatic top-border highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
          }}
        />

        {/* Image — padded inside card */}
        <div className="relative h-[195px] w-full shrink-0 px-3 pt-3">
          <div className="relative h-full w-full overflow-hidden rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=520&h=380&fit=crop&auto=format"
              alt="Hover Me"
              className="h-full w-full object-cover"
              draggable={false}
              style={{ filter: "grayscale(1) contrast(1.08) brightness(0.78)" }}
            />
            {/* Fade into solid card body */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, #151515 100%)",
              }}
            />
          </div>
        </div>

        {/* Card body — content pinned to bottom */}
        <div className="relative flex flex-1 flex-col justify-end bg-[#151515] px-4 pb-4 pt-2">
          <div className="relative z-10">
            <h2
              className="text-[35px] leading-tight tracking-tight pb-2"
              style={{ fontFamily: '"Instrument Serif", serif', color: "rgba(255,255,255,0.92)" }}
            >
              Hover Me
            </h2>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
