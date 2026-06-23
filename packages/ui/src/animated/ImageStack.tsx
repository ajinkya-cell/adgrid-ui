"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import Image from "next/image";

export interface StackCard {
  /** Image URL */
  src: string;
  /** Alt text */
  alt: string;
  /** Optional label shown on the top card */
  label?: string;
}

export interface ImageStackProps {
  /** Array of cards to display */
  cards: StackCard[];
  /** Card width in px (default: 260) */
  width?: number;
  /** Card height in px (default: 340) */
  height?: number;
  /** Px threshold for a swipe to count as a dismiss (default: 100) */
  dismissThreshold?: number;
  /** Called when a card is dismissed (index in original array) */
  onDismiss?: (card: StackCard, index: number) => void;
  /** Container class name */
  className?: string;
}

function StackCardItem({
  card,
  index,
  total,
  onDismiss,
  width,
  height,
  dismissThreshold,
}: {
  card: StackCard;
  index: number; // 0 = top
  total: number;
  onDismiss: () => void;
  width: number;
  height: number;
  dismissThreshold: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Back-cards rest rotation / vertical offset
  const restRot = [-6, -2.5, 1][index] ?? -8 + index * 2;
  const restTy = [0, 6, 12][index] ?? index * 6;
  const zIndex = total - index;

  // Rotate card as it's dragged (top card only)
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  // Opacity fades when flung
  const opacity = useTransform(
    x,
    [-dismissThreshold * 1.5, -dismissThreshold, 0, dismissThreshold, dismissThreshold * 1.5],
    [0, 1, 1, 1, 0]
  );

  const isTop = index === 0;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const dist = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
      if (dist > dismissThreshold) {
        const angle = Math.atan2(info.offset.y, info.offset.x);
        animate(x, Math.cos(angle) * 600, { duration: 0.35, ease: "easeIn" });
        animate(y, Math.sin(angle) * 600, { duration: 0.35, ease: "easeIn" });
        setTimeout(onDismiss, 340);
      } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
      }
    },
    [x, y, dismissThreshold, onDismiss]
  );

  return (
    <motion.div
      className="absolute rounded-2xl overflow-hidden shadow-2xl"
      style={{
        width,
        height,
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : restRot,
        opacity: isTop ? opacity : 1,
        zIndex,
        translateY: isTop ? 0 : restTy,
        cursor: isTop ? "grab" : "default",
        top: 0,
        left: 0,
        willChange: "transform",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)",
      }}
      drag={isTop}
      dragConstraints={{ left: -400, right: 400, top: -400, bottom: 400 }}
      dragElastic={0.85}
      whileDrag={{ cursor: "grabbing", scale: 1.03 }}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <Image
        src={card.src}
        alt={card.alt}
        fill
        className="object-cover pointer-events-none"
        sizes={`${width}px`}
        draggable={false}
      />

      {/* Shine overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%)",
        }}
      />

      {/* Label */}
      {card.label && isTop && (
        <motion.div
          className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {card.label}
        </motion.div>
      )}

      {/* Drag hint dots */}
      {isTop && (
        <motion.div
          className="absolute top-3 right-3 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((d) => (
            <div
              key={d}
              className="w-1 h-1 rounded-full bg-white"
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export function ImageStack({
  cards: initialCards,
  width = 260,
  height = 340,
  dismissThreshold = 100,
  onDismiss,
  className = "",
}: ImageStackProps) {
  const [deck, setDeck] = useState(initialCards);
  const dismissedRef = useRef<StackCard[]>([]);

  const handleDismiss = useCallback(() => {
    setDeck((prev) => {
      const [top, ...rest] = prev;
      dismissedRef.current.push(top);
      onDismiss?.(top, initialCards.indexOf(top));

      // Cycle dismissed card to the bottom
      return [...rest, top];
    });
  }, [initialCards, onDismiss]);

  // Render only top 3 for performance
  const visible = deck.slice(0, 3);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className="relative"
        style={{ width: width + 20, height: height + 20 }}
      >
        {/* Render back-to-front so top card receives events */}
        {[...visible].reverse().map((card, revI) => {
          const index = visible.length - 1 - revI;
          return (
            <StackCardItem
              key={card.src + index}
              card={card}
              index={index}
              total={visible.length}
              onDismiss={handleDismiss}
              width={width}
              height={height}
              dismissThreshold={dismissThreshold}
            />
          );
        })}
      </div>

      <p className="text-xs text-neutral-400 tracking-wider uppercase">
        drag top card to cycle
      </p>
    </div>
  );
}
