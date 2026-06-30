import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
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
  animation,
  borderRadius,
  clickToExpand,
  onHoverStart,
  onHoverEnd,
  onClick,
  onKeyDown,
  renderItem,
  cardClassName,
}: ExpandCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion Values for tilt and image parallax
  const rotateXValue = useMotionValue(0);
  const rotateYValue = useMotionValue(0);
  const imageXValue = useMotionValue(0);
  const imageYValue = useMotionValue(0);

  // Easing/Spring configurations
  const springSettings = { stiffness: 170, damping: 22, mass: 0.8 };
  const smoothSettings = { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.6 };
  const transitionConfig = animation === "spring" ? springSettings : smoothSettings;

  // React springs for lag-free cursor tracking
  const rotateX = useSpring(rotateXValue, { stiffness: 220, damping: 25 });
  const rotateY = useSpring(rotateYValue, { stiffness: 220, damping: 25 });
  const imageX = useSpring(imageXValue, { stiffness: 220, damping: 25 });
  const imageY = useSpring(imageYValue, { stiffness: 220, damping: 25 });

  // Handle cursor movement inside card to execute 3D tilt and image shift
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isExpanded || clickToExpand || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Relative coordinates (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle 3D tilt (max 3 degrees)
    rotateXValue.set(relativeY * -3);
    rotateYValue.set(relativeX * 3);

    // Subtle image parallax shift (max 8px)
    imageXValue.set(relativeX * 8);
    imageYValue.set(relativeY * 8);
  };

  const handleMouseLeave = () => {
    // Reset positions smoothly
    rotateXValue.set(0);
    rotateYValue.set(0);
    imageXValue.set(0);
    imageYValue.set(0);
    onHoverEnd();
  };

  // Sibling layout displacement (parting effect)
  let partingY = 0;
  let scale = 1;
  let opacity = 1;

  if (activeIndex !== null) {
    if (activeIndex === index) {
      partingY = 0;
      scale = 1;
      opacity = 1;
    } else {
      scale = 0.98;
      opacity = 0.65;
      // Cards above shift up (-12px), cards below shift down (+12px)
      partingY = index < activeIndex ? -12 : 12;
    }
  }

  // Variant classes
  const isModern = variant === "modern";
  const variantClasses = isModern
    ? cn(
        "bg-neutral-900/40 border border-white/10 backdrop-blur-md",
        isExpanded 
          ? "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.05)] border-white/20" 
          : "shadow-md hover:border-white/20 hover:bg-neutral-900/60"
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
      transition={transitionConfig}
      onMouseEnter={onHoverStart}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      onKeyDown={onKeyDown}
      animate={{
        y: partingY,
        scale,
        opacity,
      }}
      style={{
        height: isExpanded ? expandHeight : collapsedHeight,
        borderRadius: `${borderRadius}px`,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={cn(
        "relative w-full overflow-hidden cursor-pointer select-none outline-none transition-all duration-300",
        "focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950",
        variantClasses,
        cardClassName
      )}
    >
      {renderItem ? (
        renderItem(item, isExpanded)
      ) : (
        <div className="relative w-full h-full">
          {/* Collapsed Preview container */}
          <motion.div
            layout="position"
            animate={{ 
              opacity: isExpanded ? 0 : 1,
              pointerEvents: isExpanded ? "none" : "auto" 
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full h-full flex items-center"
          >
            <Preview item={item} index={index} />
          </motion.div>

          {/* Expanded Content Panel container */}
          <motion.div
            layout="position"
            animate={{ 
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? "auto" : "none" 
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full"
          >
            {isExpanded && (
              <CardContent 
                item={item} 
                index={index} 
                imageParallaxStyle={{ x: imageX, y: imageY }} 
              />
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
