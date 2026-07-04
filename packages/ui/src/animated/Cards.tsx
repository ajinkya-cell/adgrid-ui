"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import { cn } from "../lib/utils";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

type CardItem = {
  title: string;
  description: string;
  imageUrl: string;
  bgColor: string;       // hex color applied via inline style
  topBorderColor: string;
  config: {
    x: number;
    y: number;
    zIndex: number;
    rotate: number;
  };
};

const CARD_WIDTH = 260;
const CARD_HEIGHT = 310;
const NATURAL_SPACING = 230;

const cardsData: CardItem[] = [
  {
    title: "Working Knowledge",
    description:
      "Practical skills and insights gained through hands-on experience that drive real-world problem solving.",
    imageUrl:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=520&h=380&fit=crop&auto=format",
    bgColor: "#f97316", // orange-500
    topBorderColor: "rgba(255,255,255,0.35)",
    config: { x: 0, y: -15, zIndex: 2, rotate: -14 },
  },
  {
    title: "Practical Demonstration",
    description:
      "Interactive showcase of premium UI components built with Canvas 2D, SVG DOM, and CSS gradients.",
    imageUrl:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=520&h=380&fit=crop&auto=format",
    bgColor: "#78716c", // stone-500
    topBorderColor: "rgba(255,255,255,0.30)",
    config: { x: -30, y: 15, zIndex: 3, rotate: 9 },
  },
  {
    title: "Collaborate with AI",
    description:
      "Seamless integration patterns and workflows for AI-assisted development and design systems.",
    imageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=520&h=380&fit=crop&auto=format",
    bgColor: "#a855f7", // purple-500
    topBorderColor: "rgba(255,255,255,0.35)",
    config: { x: -60, y: -15, zIndex: 5, rotate: -6 },
  },
  {
    title: "Means and Methods",
    description:
      "Technical approaches and implementation strategies for complex interactive interfaces.",
    imageUrl:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=520&h=380&fit=crop&auto=format",
    bgColor: "#22c55e", // green-500
    topBorderColor: "rgba(255,255,255,0.32)",
    config: { x: -90, y: 15, zIndex: 6, rotate: 11 },
  },
  {
    title: "Interface-Kit",
    description:
      "Modular UI component library with reusable patterns and design system primitives.",
    imageUrl:
      "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=520&h=380&fit=crop&auto=format",
    bgColor: "#3b82f6", // blue-500
    topBorderColor: "rgba(255,255,255,0.35)",
    config: { x: -120, y: -15, zIndex: 7, rotate: -5 },
  },
];

export const Cards = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      const isOnCard = Array.from(
        containerRef.current.querySelectorAll("button")
      ).some((btn) => btn === target || btn.contains(target));
      if (!isOnCard) {
        setActiveIndex(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isAnyActive = activeIndex !== null;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-7xl min-h-[900px]"
    >
      {cardsData.map((card, index) => {
        const isActive = index === activeIndex;

        let targetX: number;
        let targetY: number;
        let targetRotate: number;
        let targetScale: number;

        const baseX =
          (index - (cardsData.length - 1) / 2) * NATURAL_SPACING;

        if (!isAnyActive) {
          targetX = baseX + card.config.x - CARD_WIDTH / 2;
          targetY = card.config.y - CARD_HEIGHT / 2;
          targetRotate = card.config.rotate;
          targetScale = 1;
        } else if (isActive) {
          targetX = -CARD_WIDTH / 2;
          targetY = -40 - CARD_HEIGHT / 2;
          targetRotate = 0;
          targetScale = 1.28;
        } else {
          const inactiveIndices = cardsData
            .map((_, i) => i)
            .filter((i) => i !== activeIndex);
          const posInRow = inactiveIndices.indexOf(index);
          const count = inactiveIndices.length;
          const rowCenterX = (posInRow - (count - 1) / 2) * 76;
          // Slight alternating tilt so they look scattered, not stacked flat
          const inactiveTilts = [-6, 4, -3, 5, -4];
          targetX = rowCenterX - CARD_WIDTH / 2;
          targetY = 160;
          targetRotate = inactiveTilts[posInRow % inactiveTilts.length]!;
          targetScale = 0.46;
        }

        return (
          <motion.div
            key={card.title}
            className="absolute left-1/2 top-1/2"
            style={{ zIndex: isActive ? 100 : card.config.zIndex }}
            initial={{
              y: 440,
              x: 0,
              scale: 0,
              filter: "blur(12px)",
              opacity: 0,
            }}
            animate={{
              y: targetY,
              x: targetX,
              rotate: targetRotate,
              scale: targetScale,
              filter: "blur(0px)",
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 26,
              mass: 0.9,
            }}
          >
            <button
              onClick={() =>
                setActiveIndex((prev) => (prev === index ? null : index))
              }
              className="relative flex flex-col overflow-hidden rounded-2xl text-left focus:outline-none cursor-pointer"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                backgroundColor: card.bgColor,
                boxShadow: "0 24px 60px -12px rgba(0,0,0,0.55), 0 8px 24px -4px rgba(0,0,0,0.35)",
                outline: "none",
              }}
            >
              {/* Image section — padded so image floats inside the card */}
              <div className="relative h-[195px] w-full shrink-0 px-3 pt-3">
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                    style={{ filter: "grayscale(1) brightness(0.85) contrast(1.05)" }}
                  />
                </div>
              </div>

              {/* Card body — transparent so solid card color shows through */}
              <div className="relative flex flex-1 flex-col justify-end px-4 pb-4 pt-2">
                {/* Inner ambient glow */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.05) 0%, transparent 55%)",
                  }}
                />

                {/* All text pinned to bottom */}
                <div className="relative z-10">
                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        key="desc"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden text-[12px] leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.48)" }}
                      >
                        {card.description}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.h2
                    layout="position"
                    className={cn(
                      "leading-none tracking-tight pb-6",
                      instrumentSerif.className
                    )}
                    animate={{
                      fontSize: isActive ? "23px" : "40px",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 26,
                      mass: 0.9,
                    }}
                    style={{ color: "rgba(255,255,255,0.95)" }}
                  >
                    {card.title}
                  </motion.h2>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};
