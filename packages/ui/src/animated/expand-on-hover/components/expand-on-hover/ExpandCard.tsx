import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandItem, ExpandVariant, ExpandAnimationType } from "../../types";
import { Preview } from "./Preview";
import { CardContent } from "./CardContent";
import { cn } from "../../../../lib/utils";

interface ExpandCardProps {
  id?: string;
  item: ExpandItem;
  index: number;
  activeIndex: number | null;
  isExpanded: boolean;
  expandHeight: number;
  collapsedHeight: number;
  variant: ExpandVariant;
  animation?: ExpandAnimationType;
  borderRadius: number;
  clickToExpand: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  renderItem?: (item: ExpandItem, isExpanded: boolean) => React.ReactNode;
  cardClassName?: string;
}

export function ExpandCard({
  id,
  item,
  index,
  activeIndex,
  isExpanded,
  expandHeight,
  collapsedHeight,
  variant,
  animation = "spring",
  borderRadius,
  onHoverStart,
  onHoverEnd,
  onClick,
  onKeyDown,
  renderItem,
  cardClassName,
}: ExpandCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Unified physics transitions
  const transitionConfig =
    animation === "smooth"
      ? {
          type: "tween" as const,
          ease: [0.25, 1, 0.5, 1], // easeOutQuart
          duration: 0.52,
        }
      : {
          type: "spring" as const,
          stiffness: 220,
          damping: 28,
          mass: 0.8,
        };

  let scale = 1;
  let opacity = 1;

  if (activeIndex !== null) {
    if (activeIndex === index) {
      scale = 1;
      opacity = 1;
    } else {
      scale = 0.99;
      opacity = 0.65;
    }
  }

  const isModern = variant === "modern";
  const variantClasses = isModern
    ? cn(
        "bg-neutral-900/70 border border-white/[0.08] backdrop-blur-md shadow-lg transition-colors duration-300 hover:border-white/20",
        isExpanded && "border-white/25 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85)]"
      )
    : "bg-neutral-950 border border-neutral-800 shadow-none";

  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={`panel-${item.id}`}
      id={id || `card-${index}`}
      layout
      transition={{
        layout: transitionConfig,
        scale: transitionConfig,
        opacity: transitionConfig,
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      onKeyDown={onKeyDown}
      animate={{
        scale,
        opacity,
      }}
      style={{
        height: isExpanded ? expandHeight : collapsedHeight,
        borderRadius: `${borderRadius}px`,
      }}
      className={cn(
        "relative w-full overflow-hidden cursor-pointer select-none outline-none group",
        "focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950",
        variantClasses,
        cardClassName
      )}
    >
      {/* Background Anime/Hero Poster Image (Always in DOM to eliminate paint stutter) */}
      <motion.div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-[inherit]"
        animate={{
          scale: isExpanded ? 1.04 : 1.0,
          opacity: isExpanded ? 0.85 : 0.16,
        }}
        transition={transitionConfig}
      >
        <img
          src={item.image}
          alt={item.title}
          loading="eager"
          className="w-full h-full object-cover rounded-[inherit] filter contrast-105"
        />
        {/* Soft Dark Vignette & Gradient Overlays */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500 rounded-[inherit]",
            isExpanded
              ? "bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/25"
              : "bg-neutral-950/70"
          )}
        />
      </motion.div>

      {/* Render Custom Item if provided */}
      {renderItem ? (
        renderItem(item, isExpanded)
      ) : (
        <>
          {/* Top Bar Preview (Always present at top of card) */}
          <div
            style={{ height: `${collapsedHeight}px` }}
            className="w-full flex items-center relative z-20"
          >
            <Preview item={item} index={index} isExpanded={isExpanded} />
          </div>

          {/* Expanded Content View (Smoothly fades in over the lower portion of the card) */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 6,
                  transition: { duration: 0.14, ease: "easeOut" },
                }}
                transition={{
                  duration: 0.28,
                  ease: [0.25, 1, 0.5, 1],
                  delay: 0.08,
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <CardContent item={item} index={index} borderRadius={borderRadius} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
