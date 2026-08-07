"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

import {
  ReactOriginal,
  NextjsOriginal,
  TypescriptOriginal,
  TailwindcssOriginal,
  NodejsOriginal,
  GoOriginal,
  DockerOriginal,
  PythonOriginal,
  PostgresqlOriginal,
  RedisOriginal,
  GraphqlPlain,
  GithubOriginal,
  VscodeOriginal,
  SvelteOriginal,
  RustOriginal,
  MongodbOriginal,
  BashOriginal,
} from "devicons-react";

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
  icon?: any;
  description: string;
  tips?: string[];
  category?: string;
}

export interface WeaponWheelItem {
  id: string;
  name: string;
  category: string;
  icon?: any;
  description: string;
  tips?: string[];
  subItems?: WeaponWheelSubItem[];
  stats?: {
    dx: number;
    performance: number;
    reliability: number;
    versatility: number;
  };
}

export interface WeaponWheelProps {
  items: WeaponWheelItem[];
  activeId?: string;
  activeSubId?: string;
  onChange?: (item: WeaponWheelItem | WeaponWheelSubItem) => void;
  triggerKey?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  inline?: boolean;
  variant?: "default" | "beveled";
  hideText?: boolean;
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

// ─── Official devicons-react Renderer ───
export function RenderWheelIcon({ icon, size = 26 }: { icon: any; size?: number }) {
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
    return React.createElement(icon, { size });
  }

  const key = typeof icon === "string" ? icon.toLowerCase() : "";

  switch (key) {
    case "react":
    case "frontend":
      return <ReactOriginal size={size} />;
    case "nextjs":
    case "next":
      return <NextjsOriginal size={size} />;
    case "typescript":
    case "ts":
      return <TypescriptOriginal size={size} />;
    case "tailwind":
    case "tailwindcss":
      return <TailwindcssOriginal size={size} />;
    case "nodejs":
    case "backend":
    case "node":
      return <NodejsOriginal size={size} />;
    case "golang":
    case "go":
      return <GoOriginal size={size} />;
    case "docker":
    case "devops":
    case "deploy":
    case "container":
      return <DockerOriginal size={size} />;
    case "python":
    case "ai":
      return <PythonOriginal size={size} />;
    case "postgres":
    case "postgresql":
    case "database":
    case "store":
    case "data":
      return <PostgresqlOriginal size={size} />;
    case "redis":
    case "cache":
      return <RedisOriginal size={size} />;
    case "graphql":
      return <GraphqlPlain size={size} />;
    case "github":
    case "actions":
      return <GithubOriginal size={size} />;
    case "vscode":
      return <VscodeOriginal size={size} />;
    case "svelte":
      return <SvelteOriginal size={size} />;
    case "rust":
      return <RustOriginal size={size} />;
    case "mongodb":
      return <MongodbOriginal size={size} />;
    case "neovim":
    case "terminal":
    case "ide":
    case "tmux":
      return <BashOriginal size={size} />;
    default:
      return <ReactOriginal size={size} />;
  }
}

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

  const currentSubItems = hoveredItem?.subItems || [];

  const resolvedActiveSubId = activeSubId || (
    items.find((item) => item.subItems?.some((sub) => sub.id === activeId))
      ?.subItems?.find((sub) => sub.id === activeId)?.id
  );

  const activeSubIndex = currentSubItems.findIndex((sub) => sub.id === resolvedActiveSubId);
  const hoveredSubItem = hoveredSubIndex !== null ? currentSubItems[hoveredSubIndex] : activeSubIndex !== -1 ? currentSubItems[activeSubIndex] : null;

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

  // Play tick sound on hover index change
  useEffect(() => {
    if ((hoveredIndex !== null || hoveredSubIndex !== null) && isOpen) {
      playTickSound();
    }
  }, [hoveredIndex, hoveredSubIndex, isOpen]);

  // ─── SPACIOUS 560PX UNIFIED CANVAS GEOMETRY ───
  const isBeveled = variant === "beveled";
  const svgSize = 560;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Primary Wheel metrics
  const outerR = 190;
  const innerR = 120;
  const sliceCount = items.length;
  const sliceAngle = 360 / Math.max(sliceCount, 1);
  const angleOffset = -90 - sliceAngle / 2;

  // Secondary Outer Wheel (Nested Sub-Items Arc)
  const subOuterR = 250;
  const subInnerR = 198;
  const subCount = currentSubItems.length;

  const innerContent = (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-4 z-10 select-none",
        hideText ? "w-auto" : "w-full max-w-5xl"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Section: Side-by-Side Info Panel and Centered SVG Wheel */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 w-full">

        {/* LEFT PANEL: Selected Primary Tool Info */}
        {!hideText && (
          <div className="w-full md:w-80 h-80 flex flex-col justify-center select-none text-left">
            <AnimatePresence mode="wait">
              {hoveredItem ? (
                <motion.div
                  key={hoveredItem.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
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

        {/* CENTER: The Interactive SVG Wheel (Spacious 560px Canvas) */}
        <div
          className="relative flex items-center justify-center shrink-0 aspect-square"
          style={{ width: svgSize, height: svgSize }}
          onMouseLeave={() => {
            setHoveredIndex(null);
            setHoveredSubIndex(null);
          }}
        >
          {/* BEVELED DISK BACKGROUND (ONLY FOR BEVELED VARIANT) */}
          {isBeveled && (
            <div
              className="absolute rounded-full border-t border-white/20 border-x border-white/[0.04] border-b border-white/10 select-none pointer-events-none"
              style={{
                width: outerR * 2,
                height: outerR * 2,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#161617",
                boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 25px 60px rgba(0,0,0,0.6)"
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
                      if (!item.subItems || item.subItems.length === 0) {
                        onChange?.(item);
                        if (!inline) setOpen(false);
                        setHoveredIndex(null);
                      }
                    }}
                  >
                    <motion.path
                      d={pathD}
                      initial={{
                        fill: isBeveled ? "rgba(0, 0, 0, 0.15)" : "rgba(14, 14, 18, 0.5)",
                        stroke: isBeveled ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.3)"
                      }}
                      animate={{
                        fill: isHovered
                          ? isBeveled ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.09)"
                          : isActive
                          ? isBeveled ? "rgba(99, 102, 241, 0.12)" : "rgba(79, 70, 229, 0.14)"
                          : isBeveled ? "rgba(0, 0, 0, 0.15)" : "rgba(14, 14, 18, 0.65)",
                        stroke: isHovered
                          ? isBeveled ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.45)"
                          : isActive
                          ? isBeveled ? "rgba(99, 102, 241, 0.65)" : "rgba(99, 102, 241, 0.8)"
                          : isBeveled ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.3)",
                        strokeWidth: isHovered || isActive ? 2 : 1,
                        filter: isActive && isBeveled
                          ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.65))"
                          : isHovered && isBeveled
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

            {/* SECONDARY LEVEL NESTED ARC WHEEL (ON ACTIVE HOVER) */}
            <AnimatePresence>
              {hoveredIndex !== null && subCount > 0 && (() => {
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
                    {/* SUB-WHEEL BACKGROUND ARC FOR BEVELED */}
                    {isBeveled && (
                      <motion.path
                        d={getSlicePath(centerX, centerY, subInnerR, subOuterR, subStartAngle, subStartAngle + totalSubWidth)}
                        fill="#161617"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth={1}
                        filter="drop-shadow(0 12px 30px rgba(0,0,0,0.65))"
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
                              fill: isBeveled ? "rgba(0, 0, 0, 0.15)" : "rgba(8, 8, 12, 0.2)",
                              stroke: isBeveled ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.15)"
                            }}
                            animate={{
                              fill: isSubHovered
                                ? isBeveled ? "rgba(255, 255, 255, 0.06)" : "rgba(99, 102, 241, 0.14)"
                                : isSubActive
                                ? isBeveled ? "rgba(99, 102, 241, 0.1)" : "rgba(16, 185, 129, 0.08)"
                                : isBeveled ? "rgba(0, 0, 0, 0.15)" : "rgba(8, 8, 12, 0.45)",
                              stroke: isSubHovered
                                ? isBeveled ? "rgba(255, 255, 255, 0.35)" : "rgba(99, 102, 241, 0.65)"
                                : isSubActive
                                ? isBeveled ? "rgba(99, 102, 241, 0.6)" : "rgba(16, 185, 129, 0.5)"
                                : isBeveled ? "rgba(255, 255, 255, 0.04)" : "rgba(63, 63, 70, 0.2)",
                              strokeWidth: isSubHovered || isSubActive ? 2 : 1,
                              filter: isSubActive && isBeveled
                                ? "drop-shadow(0 0 12px rgba(99, 102, 241, 0.65))"
                                : isSubHovered && isBeveled
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

            {/* CENTER DISPLAY FOR DEFAULT VARIANT */}
            {!isBeveled ? (
              <g className="pointer-events-none">
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerR}
                  className="stroke-zinc-800 fill-zinc-950/90 transition-all duration-300"
                  style={{
                    strokeWidth: 1,
                    filter: "drop-shadow(0 0 20px rgba(0,0,0,0.8))"
                  }}
                />
                <foreignObject
                  x={centerX - innerR}
                  y={centerY - innerR}
                  width={innerR * 2}
                  height={innerR * 2}
                  className="overflow-visible"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center select-none">
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
                            className="mb-2.5 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          >
                            <RenderWheelIcon icon={displayItem.icon || displayItem.id} size={36} />
                          </motion.div>
                          <h3 className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                            {displayCategory}
                          </h3>
                          <h1 className="font-body font-black text-sm text-white tracking-wide mt-1">
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
            ) : null}
          </svg>

          {/* OVERLAY ICONS (Primary Level - devicons-react Colored Logos) */}
          <div key={`icons-${variant}`} className="absolute inset-0 pointer-events-none">
            {items.map((item, i) => {
              const iconAngle = i * sliceAngle + (sliceAngle / 2) + angleOffset;
              const isHovered = hoveredIndex === i;
              const isActive = activeId === item.id || item.subItems?.some((sub) => sub.id === activeId);

              const iconR = (innerR + outerR) / 2;
              const iconPos = polarToCartesian(centerX, centerY, iconR, iconAngle);

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
                    scale: isHovered ? 1.22 : isActive ? 1.1 : 1,
                    transform: `translate(-50%, -50%)`,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 18 }}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border transition-all duration-300 shadow-lg backdrop-blur-md flex items-center justify-center",
                      isHovered
                        ? "bg-zinc-900 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.45)] scale-105"
                        : isActive
                        ? "bg-indigo-950/40 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        : "bg-zinc-900/80 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <RenderWheelIcon icon={item.icon || item.id} size={26} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* OVERLAY ICONS (Secondary Level) */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {hoveredIndex !== null && subCount > 0 && (
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
                          scale: isSubHovered ? 1.2 : isSubActive ? 1.08 : 1,
                          transform: `translate(-50%, -50%)`,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                      >
                        <div
                          className={cn(
                            "w-9.5 h-9.5 rounded-full border transition-all duration-300 shadow-sm backdrop-blur-md flex items-center justify-center",
                            isSubHovered
                              ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                              : isSubActive
                              ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              : "bg-zinc-950/80 border-zinc-900/80 text-zinc-400 hover:border-zinc-800"
                          )}
                        >
                          <RenderWheelIcon icon={subItem.icon || subItem.id} size={20} />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CENTER DISPLAY OVERLAY FOR BEVELED VARIANT */}
          {isBeveled && (
            <div
              className="absolute rounded-full flex flex-col items-center justify-center p-5 text-center select-none backdrop-blur-2xl transition-all duration-300 pointer-events-none border-t border-white/20 border-x border-white/[0.04] border-b border-white/10"
              style={{
                width: innerR * 2,
                height: innerR * 2,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#161617",
                boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 15px 35px rgba(0,0,0,0.5)"
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
                      className="mb-2.5 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    >
                      <RenderWheelIcon icon={displayItem.icon || displayItem.id} size={36} />
                    </motion.div>
                    <h3 className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                      {displayCategory}
                    </h3>
                    <h1 className="font-body font-black text-sm text-white tracking-wide mt-1">
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
          <div className="w-full max-w-xl h-20 text-center select-none">
            <AnimatePresence mode="wait">
              {hoveredSubItem ? (
                <motion.div
                  key={hoveredSubItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1"
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
      {!isOpen && (
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl font-mono text-xs tracking-wider text-zinc-300 hover:text-white transition shadow-lg cursor-pointer"
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
