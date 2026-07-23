"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

// Web Audio API Synthesizer for retro mechanical clicks
const playTickSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.008);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.008);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.008);
  } catch (e) {
    // Silently ignore audio issues
  }
};

export interface WeaponWheelSubItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tips?: string[];
  category?: string; // Sub-category
}

export interface WeaponWheelItem {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tips?: string[];
  subItems?: WeaponWheelSubItem[]; // Optional secondary slices
  stats?: {
    dx: number;          // Developer Experience (0-100)
    performance: number; // Execution Speed / Efficiency (0-100)
    reliability: number; // Type Safety / Stability (0-100)
    versatility: number; // Ecosystem / Cross-platform (0-100)
  };
}

export interface WeaponWheelProps {
  items: WeaponWheelItem[];
  activeId?: string;
  activeSubId?: string;
  onChange?: (item: WeaponWheelItem | WeaponWheelSubItem) => void;
  triggerKey?: string; // e.g. "q", "Tab"
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  inline?: boolean;    // If true, renders inline without absolute overlays and stays open
  variant?: "default" | "wheel-3" | "wheel-4"; // Visual style variant
  hideText?: boolean;  // If true, hides side/bottom info text and renders centered wheel only
}

// Convert polar angle to Cartesian coordinates
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Generates an SVG path for a hollow slice
const getSlicePath = (
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) => {
  const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const startInner = polarToCartesian(x, y, innerRadius, startAngle);
  const endInner = polarToCartesian(x, y, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
    "Z",
  ].join(" ");
};

export function WeaponWheel({
  items,
  activeId,
  activeSubId,
  onChange,
  triggerKey = "q",
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
  inline = false,
  variant = "default",
  hideText = false,
}: WeaponWheelProps) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = inline ? true : isControlled ? controlledIsOpen : localIsOpen;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSubIndex, setHoveredSubIndex] = useState<number | null>(null);
  
  const activeIndex = items.findIndex(
    (item) => item.id === activeId || item.subItems?.some((sub) => sub.id === activeId)
  );
  const hoveredItem = hoveredIndex !== null ? items[hoveredIndex] : activeIndex !== -1 ? items[activeIndex] : null;

  // Selected sub item tracking
  const currentSubItems = hoveredItem?.subItems || [];
  
  const resolvedActiveSubId = activeSubId || (
    items.find((item) => item.subItems?.some((sub) => sub.id === activeId))
      ?.subItems?.find((sub) => sub.id === activeId)?.id
  );
  
  const activeSubIndex = currentSubItems.findIndex((sub) => sub.id === resolvedActiveSubId);
  const hoveredSubItem = hoveredSubIndex !== null ? currentSubItems[hoveredSubIndex] : activeSubIndex !== -1 ? currentSubItems[activeSubIndex] : null;

  // Center display node resolves to sub-item if hovered, else primary item
  const displayItem = hoveredSubItem || hoveredItem;
  const displayCategory = hoveredSubItem ? hoveredSubItem.category || hoveredItem?.category : hoveredItem?.category;

  const selectedName = 
    items.flatMap(item => [item, ...(item.subItems || [])]).find(x => x.id === (resolvedActiveSubId || activeId))?.name ||
    "";

  const setOpen = (open: boolean) => {
    if (inline) return;
    if (!isControlled) {
      setLocalIsOpen(open);
    }
    onOpenChange?.(open);
  };

  const hoveredIndexRef = useRef<number | null>(null);
  const hoveredSubIndexRef = useRef<number | null>(null);
  
  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
  }, [hoveredIndex]);

  useEffect(() => {
    hoveredSubIndexRef.current = hoveredSubIndex;
  }, [hoveredSubIndex]);

  // Handle window keydown/keyup events for holding hotkey (only when NOT inline)
  useEffect(() => {
    if (inline || !triggerKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if (e.key.toLowerCase() === triggerKey.toLowerCase()) {
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
        }
      }

      if (e.key === "Escape" && isOpen) {
        setOpen(false);
        setHoveredIndex(null);
        setHoveredSubIndex(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === triggerKey.toLowerCase()) {
        if (isOpen) {
          const sIdx = hoveredSubIndexRef.current;
          const idx = hoveredIndexRef.current;
          
          if (sIdx !== null && hoveredItem?.subItems?.[sIdx]) {
            onChange?.(hoveredItem.subItems[sIdx]);
          } else if (idx !== null && items[idx]) {
            onChange?.(items[idx]);
          }
          
          setOpen(false);
          setHoveredIndex(null);
          setHoveredSubIndex(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [triggerKey, isOpen, items, onChange, inline, hoveredItem]);

  // Play click sound on hover index change
  useEffect(() => {
    if ((hoveredIndex !== null || hoveredSubIndex !== null) && isOpen) {
      playTickSound();
    }
  }, [hoveredIndex, hoveredSubIndex, isOpen]);

  // Layout calculations adapt to variant sizes
  const isWheel3 = variant === "wheel-3" || variant === "wheel-4";
  const isWheel2 = variant === "wheel-3";
  const isWheel4 = variant === "wheel-4";
  
  const svgSize = isWheel3 ? 760 : 600;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Inner Wheel metrics
  const outerR = isWheel3 ? 240 : 270;
  const innerR = isWheel3 ? 155 : 175;
  const sliceCount = items.length;
  const sliceAngle = 360 / sliceCount;
  const angleOffset = -90 - sliceAngle / 2;

  // Outer Wheel (Nested Sub-Items) - Same thickness as main slices (85px wide)
  const subOuterR = 333;
  const subInnerR = 248; // Tiny 8px gap from primary outerR
  const subCount = currentSubItems.length;

  const innerContent = (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-6 z-10 select-none",
        hideText ? "w-auto min-h-0 p-2" : isWheel3 ? "w-full max-w-5xl min-h-[820px]" : "w-full max-w-4xl min-h-[680px]",
        inline && !isWheel3 && (
          isWheel4
            ? "border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 rounded-2xl backdrop-blur-2xl overflow-hidden"
            : "bg-zinc-950/20 border border-zinc-900/30 rounded-3xl shadow-2xl backdrop-blur-sm overflow-hidden"
        )
      )}
      style={inline && isWheel4 && !isWheel3 ? {
        backgroundColor: "#171717",
        boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
      } : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Section: Side-by-Side Info Panel and Centered SVG Wheel */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 w-full">
        
        {/* LEFT PANEL: Selected Primary Tool Info */}
        {!hideText && (
          <div className="w-full md:w-80 h-96 flex flex-col justify-center select-none text-left">
          <AnimatePresence mode="wait">
            {hoveredItem ? (
              <motion.div
                key={hoveredItem.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-indigo-400 font-bold">
                    {hoveredItem.category}
                  </span>
                  <h2 className="text-3xl font-black tracking-tight text-white mt-1">
                    {hoveredItem.name}
                  </h2>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed font-body">
                  {hoveredItem.description}
                </p>

                {hoveredItem.tips && hoveredItem.tips.length > 0 && (
                  <div className="pt-2">
                    <span className="font-mono text-xs uppercase text-zinc-500 tracking-wider">PRO TIP</span>
                    <ul className="mt-2 space-y-1.5">
                      {hoveredItem.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start font-body">
                          <span className="text-indigo-400 mr-2">▪</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-zinc-500 font-mono text-sm">
                HOVER SEGMENT TO SELECT
              </div>
            )}
          </AnimatePresence>
        </div>
        )}

        {/* CENTER: The Interactive SVG Wheel */}
        <div 
          className="relative flex items-center justify-center shrink-0 aspect-square"
          style={{ width: svgSize, height: svgSize }}
          onMouseLeave={() => {
            setHoveredIndex(null);
            setHoveredSubIndex(null);
          }}
        >
          {/* MAIN WHEEL BACKGROUND DISK (ONLY FOR WHEEL-4) */}
          {isWheel4 && (
            <div
              className="absolute rounded-full border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 select-none pointer-events-none"
              style={{
                width: outerR * 2,
                height: outerR * 2,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#171717",
                boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
              }}
            />
          )}

          <svg 
            key={variant}
            width={svgSize} 
            height={svgSize} 
            className="w-full h-full select-none overflow-visible outline-none focus:outline-none" 
            style={{ outline: "none" }}
          >
            {/* PRIMARY LEVEL WHEEL */}
            <g>
              {items.map((item, i) => {
                const startAngle = i * sliceAngle + angleOffset;
                const endAngle = (i + 1) * sliceAngle + angleOffset;
                const isHovered = hoveredIndex === i;
                const isActive = activeId === item.id || item.subItems?.some((sub) => sub.id === activeId);

                const pathD = getSlicePath(centerX, centerY, innerR, outerR, startAngle, endAngle);

                return (
                  <g
                    key={item.id}
                    className="cursor-pointer outline-none focus:outline-none select-none"
                    style={{ outline: "none" }}
                    onMouseEnter={() => {
                      setHoveredIndex(i);
                      setHoveredSubIndex(null);
                    }}
                    onClick={() => {
                      if (!isWheel3 || !item.subItems || item.subItems.length === 0) {
                        onChange?.(item);
                        if (!inline) setOpen(false);
                        setHoveredIndex(null);
                      }
                    }}
                  >
                    <motion.path
                      d={pathD}
                      initial={{ 
                        fill: isWheel4 ? "rgba(0, 0, 0, 0.15)" : "rgba(12, 12, 16, 0.45)", 
                        stroke: isWheel4 ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.3)" 
                      }}
                      animate={{
                        fill: isHovered
                          ? isWheel4 ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.08)"
                          : isActive
                          ? isWheel4 ? "rgba(99, 102, 241, 0.1)" : "rgba(79, 70, 229, 0.12)"
                          : isWheel4 ? "rgba(0, 0, 0, 0.15)" : "rgba(12, 12, 16, 0.65)",
                        stroke: isHovered
                          ? isWheel4 ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.4)"
                          : isActive
                          ? isWheel4 ? "rgba(99, 102, 241, 0.6)" : "rgba(99, 102, 241, 0.8)"
                          : isWheel4 ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.3)",
                        strokeWidth: isHovered || isActive ? 2 : 1,
                        filter: isActive && isWheel4
                          ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.65))"
                          : isHovered && isWheel4
                          ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))"
                          : "none",
                      }}
                      whileTap={{ scale: 0.98 }}
                      style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                      transition={{ duration: 0.15 }}
                    />
                  </g>
                );
              })}
            </g>

            {/* SECONDARY LEVEL NESTED ARC WHEEL (ONLY IN WHEEL-3 MODE ON ACTIVE HOVER) */}
            <AnimatePresence>
              {isWheel3 && hoveredIndex !== null && subCount > 0 && (() => {
                const midAngle = hoveredIndex * sliceAngle + (sliceAngle / 2) + angleOffset;
                const subSliceAngle = 18;
                const totalSubWidth = subCount * subSliceAngle;
                const subStartAngle = midAngle - (totalSubWidth / 2);

                return (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                  >
                    {/* SUB-WHEEL BACKGROUND ARC (ONLY FOR WHEEL-4) */}
                    {isWheel4 && (
                      <motion.path
                        d={getSlicePath(centerX, centerY, subInnerR, subOuterR, subStartAngle, subStartAngle + totalSubWidth)}
                        fill="#171717"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth={1}
                        filter="drop-shadow(0 15px 35px rgba(0,0,0,0.65))"
                      />
                    )}

                    {currentSubItems.map((subItem, j) => {
                      const startAngle = subStartAngle + j * subSliceAngle;
                      const endAngle = startAngle + subSliceAngle;
                      
                      const isSubHovered = hoveredSubIndex === j;
                      const isSubActive = resolvedActiveSubId === subItem.id;

                      const pathD = getSlicePath(centerX, centerY, subInnerR, subOuterR, startAngle, endAngle);

                      return (
                        <g
                          key={subItem.id}
                          className="cursor-pointer outline-none focus:outline-none select-none"
                          style={{ outline: "none" }}
                          onMouseEnter={() => setHoveredSubIndex(j)}
                          onMouseLeave={() => {
                            if (hoveredSubIndex === j) setHoveredSubIndex(null);
                          }}
                          onClick={() => {
                            onChange?.(subItem);
                            if (!inline) setOpen(false);
                            setHoveredIndex(null);
                            setHoveredSubIndex(null);
                          }}
                        >
                          <motion.path
                            d={pathD}
                            initial={{ 
                              fill: isWheel4 ? "rgba(0, 0, 0, 0.15)" : "rgba(8, 8, 12, 0.2)", 
                              stroke: isWheel4 ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.15)" 
                            }}
                            animate={{
                              fill: isSubHovered
                                ? isWheel4 ? "rgba(255, 255, 255, 0.06)" : "rgba(99, 102, 241, 0.14)"
                                : isSubActive
                                ? isWheel4 ? "rgba(99, 102, 241, 0.1)" : "rgba(16, 185, 129, 0.08)"
                                : isWheel4 ? "rgba(0, 0, 0, 0.15)" : "rgba(8, 8, 12, 0.45)",
                              stroke: isSubHovered
                                ? isWheel4 ? "rgba(255, 255, 255, 0.35)" : "rgba(99, 102, 241, 0.65)"
                                : isSubActive
                                ? isWheel4 ? "rgba(99, 102, 241, 0.6)" : "rgba(16, 185, 129, 0.5)"
                                : isWheel4 ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.2)",
                              strokeWidth: isSubHovered || isSubActive ? 2 : 1,
                              filter: isSubActive && isWheel4
                                ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.65))"
                                : isSubHovered && isWheel4
                                ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))"
                                : "none",
                            }}
                            whileTap={{ scale: 0.985 }}
                            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                            transition={{ duration: 0.15 }}
                          />
                        </g>
                      );
                    })}
                  </motion.g>
                );
              })()}
            </AnimatePresence>

            {/* CENTER AREA DISPLAY (INSIDE SVG FOR PERFECT PIXEL ALIGNMENT) */}
            {!isWheel4 ? (
              <g className="pointer-events-none">
                {/* The circular background */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerR}
                  className={cn(
                    "transition-all duration-300",
                    isWheel2
                      ? "stroke-white/20 fill-[#171717]/95"
                      : "stroke-zinc-800 fill-zinc-950/85"
                  )}
                  style={{
                    strokeWidth: 1,
                    filter: isWheel2
                      ? "drop-shadow(0 10px 30px rgba(0,0,0,0.5))"
                      : "drop-shadow(0 0 20px rgba(0,0,0,0.8))"
                  }}
                />
                
                {/* The HTML contents centered inside the circle */}
                <foreignObject
                  x={centerX - innerR}
                  y={centerY - innerR}
                  width={innerR * 2}
                  height={innerR * 2}
                  className="overflow-visible"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
                    <AnimatePresence mode="wait">
                      {displayItem ? (
                        <motion.div
                          key={displayItem.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.12 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <motion.div
                            className="text-indigo-400 mb-3 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          >
                            {React.createElement(displayItem.icon, { className: isWheel3 ? "w-11 h-11" : "w-14 h-14" })}
                          </motion.div>
                          <h3 className="font-mono text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest">
                            {displayCategory}
                          </h3>
                          <h1 className="font-body font-black text-sm md:text-base text-white tracking-wide mt-1">
                            {displayItem.name}
                          </h1>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-zinc-500 text-xs font-mono tracking-widest animate-pulse">
                            SELECT MODULE
                          </span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </foreignObject>
              </g>
            ) : (
              <g className="pointer-events-none" />
            )}

            {/* CENTER AREA PLACEHOLDER FOR PERFECT SVGS */}
            <g className="pointer-events-none" />

            {/* ACTIVE/HOVERED HIGHLIGHT GLOW OVERLAYS (FOR WHEEL-4 TO AVOID NEIGHBOR CLIPPING) */}
            {isWheel4 && (
              <g className="pointer-events-none">
                {items.map((item, i) => {
                  const startAngle = i * sliceAngle + angleOffset;
                  const endAngle = (i + 1) * sliceAngle + angleOffset;
                  const isHovered = hoveredIndex === i;
                  const isActive = activeId === item.id || item.subItems?.some((sub) => sub.id === activeId);

                  if (!isHovered && !isActive) return null;

                  const pathD = getSlicePath(centerX, centerY, innerR, outerR, startAngle, endAngle);

                  return (
                    <motion.path
                      key={`glow-primary-${item.id}`}
                      d={pathD}
                      initial={false}
                      animate={{
                        fill: isHovered 
                          ? "rgba(255, 255, 255, 0.06)" 
                          : "rgba(99, 102, 241, 0.1)",
                        stroke: isHovered 
                          ? "rgba(255, 255, 255, 0.35)" 
                          : "rgba(99, 102, 241, 0.6)",
                        strokeWidth: 2,
                        filter: isActive
                          ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.65))"
                          : "drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))",
                      }}
                      style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                      transition={{ duration: 0.15 }}
                    />
                  );
                })}
              </g>
            )}

            {isWheel4 && hoveredIndex !== null && subCount > 0 && (
              <g className="pointer-events-none">
                {currentSubItems.map((subItem, j) => {
                  const midAngle = hoveredIndex * sliceAngle + (sliceAngle / 2) + angleOffset;
                  const subSliceAngle = 18;
                  const totalSubWidth = subCount * subSliceAngle;
                  const subStartAngle = midAngle - (totalSubWidth / 2);

                  const startAngle = subStartAngle + j * subSliceAngle;
                  const endAngle = startAngle + subSliceAngle;
                  
                  const isSubHovered = hoveredSubIndex === j;
                  const isSubActive = resolvedActiveSubId === subItem.id;

                  if (!isSubHovered && !isSubActive) return null;

                  const pathD = getSlicePath(centerX, centerY, subInnerR, subOuterR, startAngle, endAngle);

                  return (
                    <motion.path
                      key={`glow-sub-${subItem.id}`}
                      d={pathD}
                      initial={false}
                      animate={{
                        fill: isSubHovered 
                          ? "rgba(255, 255, 255, 0.06)" 
                          : "rgba(99, 102, 241, 0.1)",
                        stroke: isSubHovered 
                          ? "rgba(255, 255, 255, 0.35)" 
                          : "rgba(99, 102, 241, 0.6)",
                        strokeWidth: 2,
                        filter: isSubActive
                          ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.65))"
                          : "drop-shadow(0 0 8px rgba(255, 255, 255, 0.25))",
                      }}
                      style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                      transition={{ duration: 0.15 }}
                    />
                  );
                })}
              </g>
            )}
          </svg>

          {/* Absolutely Positioned Overlay Icons (Primary) */}
          <div key={`icons-${variant}`} className="absolute inset-0 pointer-events-none">
            {items.map((item, i) => {
              const iconAngle = i * sliceAngle + (sliceAngle / 2) + angleOffset;
              const isHovered = hoveredIndex === i;
              const isActive = activeId === item.id || item.subItems?.some((sub) => sub.id === activeId);

              const iconR = (innerR + outerR) / 2;
              const iconPos = polarToCartesian(centerX, centerY, iconR, iconAngle);
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    left: iconPos.x,
                    top: iconPos.y,
                  }}
                  initial={{ scale: 1 }}
                  animate={{
                    scale: isHovered ? 1.25 : isActive ? 1.1 : 1,
                    transform: `translate(-50%, -50%)`,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 18 }}
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-full border transition-all duration-300 shadow-lg backdrop-blur-md",
                      isHovered
                        ? "bg-zinc-50 border-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.45)]"
                        : isActive
                        ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                        : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Absolutely Positioned Overlay Icons (Secondary Concentric Arc Level) */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {isWheel3 && hoveredIndex !== null && subCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0"
                >
                  {currentSubItems.map((subItem, j) => {
                    const midAngle = hoveredIndex * sliceAngle + (sliceAngle / 2) + angleOffset;
                    const subSliceAngle = 18;
                    const totalSubWidth = subCount * subSliceAngle;
                    const subStartAngle = midAngle - (totalSubWidth / 2);

                    const iconAngle = subStartAngle + j * subSliceAngle + (subSliceAngle / 2);
                    const isSubHovered = hoveredSubIndex === j;
                    const isSubActive = resolvedActiveSubId === subItem.id;

                    const iconR = (subInnerR + subOuterR) / 2;
                    const iconPos = polarToCartesian(centerX, centerY, iconR, iconAngle);
                    const Icon = subItem.icon;

                    return (
                      <motion.div
                        key={subItem.id}
                        className="absolute flex flex-col items-center justify-center"
                        style={{
                          left: iconPos.x,
                          top: iconPos.y,
                        }}
                        initial={{ scale: 0.6 }}
                        animate={{
                          scale: isSubHovered ? 1.2 : isSubActive ? 1.05 : 1,
                          transform: `translate(-50%, -50%)`,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-full border transition-all duration-300 shadow-md backdrop-blur-md",
                            isSubHovered
                              ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                              : isSubActive
                              ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              : "bg-zinc-950/70 border-zinc-900/60 text-zinc-400 hover:border-zinc-800"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CENTER AREA DISPLAY OVERLAY (ONLY FOR WHEEL-4 - HTML OVERLAY FOR PERFECT CSS BEVELS & SHADOWS) */}
          {isWheel4 && (
            <div
              className="absolute rounded-full flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-2xl transition-all duration-300 pointer-events-none border-t border-white/20 border-x border-white/[0.02] border-b border-white/10"
              style={{
                width: innerR * 2,
                height: innerR * 2,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#171717",
                boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.4), 0 10px 30px rgba(0,0,0,0.5)"
              }}
            >
              <AnimatePresence mode="wait">
                {displayItem ? (
                  <motion.div
                    key={displayItem.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <motion.div
                      className="text-indigo-400 mb-3 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    >
                      {React.createElement(displayItem.icon, { className: isWheel3 ? "w-11 h-11" : "w-14 h-14" })}
                    </motion.div>
                    <h3 className="font-mono text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest">
                      {displayCategory}
                    </h3>
                    <h1 className="font-body font-black text-sm md:text-base text-white tracking-wide mt-1">
                      {displayItem.name}
                    </h1>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-zinc-500 text-xs font-mono tracking-widest animate-pulse">
                      SELECT MODULE
                    </span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Sub-Item Details and Selection Confirmation */}
      {!hideText && (
        <div className="w-full flex flex-col items-center justify-center mt-6 gap-4">
          
          {/* SUB-ITEM INFO PANEL - Centered below columns with layout safety */}
          <div className="w-full max-w-xl h-24 text-center select-none">
            <AnimatePresence mode="wait">
              {isWheel3 && hoveredSubItem ? (
                <motion.div
                  key={hoveredSubItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                      {hoveredSubItem.category || hoveredItem?.category}
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {hoveredSubItem.name}
                    </h3>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-md mx-auto font-body">
                    {hoveredSubItem.description}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Selected Confirmation status text */}
          {selectedName && (
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900/30 px-3.5 py-1.5 border border-zinc-800/40 rounded-full select-none">
              Active Selection: <span className="text-indigo-400 font-bold">{selectedName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className={cn("relative flex items-center justify-center w-full weapon-wheel-prevent-outline", className)}>
        <style dangerouslySetInnerHTML={{ __html: `
          .weapon-wheel-prevent-outline,
          .weapon-wheel-prevent-outline *,
          .weapon-wheel-prevent-outline svg,
          .weapon-wheel-prevent-outline g,
          .weapon-wheel-prevent-outline path,
          .weapon-wheel-prevent-outline div {
            outline: none !important;
            -webkit-tap-highlight-color: transparent !important;
            user-select: none !important;
            -webkit-user-select: none !important;
          }
        `}} />
        {innerContent}
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center weapon-wheel-prevent-outline", className)}>
      <style dangerouslySetInnerHTML={{ __html: `
        .weapon-wheel-prevent-outline,
        .weapon-wheel-prevent-outline *,
        .weapon-wheel-prevent-outline svg,
        .weapon-wheel-prevent-outline g,
        .weapon-wheel-prevent-outline path,
        .weapon-wheel-prevent-outline div {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}} />
      {/* Trigger Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl font-mono text-sm tracking-wider text-zinc-300 hover:text-white transition shadow-lg cursor-pointer"
        >
          OPEN WEAPON WHEEL <kbd className="ml-2 px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-xs rounded text-zinc-400 capitalize">{triggerKey}</kbd>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-55 flex items-center justify-center bg-black/75 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            {innerContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
