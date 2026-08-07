import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandItem, ExpandVariant, ExpandAnimationType } from "../../types";
import { Preview } from "./Preview";
import { CardContent } from "./CardContent";
import { cn } from "../../../../lib/utils";

interface ExpandCardProps {
  item: ExpandItem;
  index: number;
  activeIndex: number | null;
  isExpanded: boolean;
  expandHeight: number;
  collapsedHeight: number;
  variant: ExpandVariant;
  animation: ExpandAnimationType;
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
  item,
  index,
  activeIndex,
  isExpanded,
  expandHeight,
  collapsedHeight,
  variant,
  borderRadius,
  onHoverStart,
  onHoverEnd,
  onClick,
  onKeyDown,
  renderItem,
  cardClassName,
}: ExpandCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  let scale = 1;
  let opacity = 1;

  if (activeIndex !== null) {
    if (activeIndex === index) {
      scale = 1;
      opacity = 1;
    } else {
      scale = 0.985;
      opacity = 0.75;
    }
  }

  const isModern = variant === "modern";
  const variantClasses = isModern
    ? cn(
        "bg-neutral-900/60 border border-white/10 backdrop-blur-md shadow-lg transition-colors duration-200 hover:border-white/20",
        isExpanded && "border-white/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]"
      )
    : "bg-neutral-950 border border-neutral-800 shadow-none";

  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={`panel-${item.id}`}
      id={`card-${index}`}
      layout
      transition={{
        layout: { type: "spring", stiffness: 380, damping: 32, mass: 0.6 },
        scale: { duration: 0.15 },
        opacity: { duration: 0.15 },
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
        "relative w-full overflow-hidden cursor-pointer select-none outline-none rounded-[inherit]",
        "focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950",
        variantClasses,
        cardClassName
      )}
    >
      {renderItem ? (
        renderItem(item, isExpanded)
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {!isExpanded ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="w-full h-[60px] flex items-center"
            >
              <Preview item={item} index={index} />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative w-full h-full overflow-hidden"
            >
              <CardContent item={item} index={index} borderRadius={borderRadius} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
