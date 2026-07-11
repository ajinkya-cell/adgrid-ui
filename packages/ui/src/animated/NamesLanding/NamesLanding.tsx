"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { generateLayout, type PositionedName } from "./layoutEngine";
import { BackgroundLayer } from "./BackgroundLayer";
import { NameItem } from "./NameItem";

export interface NamesLandingProps {
  names: string[];
  variant?: "constellation" | "grid" | "helical";
  title?: string;
  subtitle?: string;
  background?: "solid" | "noise" | "paper" | "grid" | "gradient" | "texture";
  density?: number; // 1 (Sparse), 2 (Balanced), 3 (Dense)
  spacing?: number; // Spacing scaling multiplier (default: 1.0)
  fontFamily?: "sans" | "mono" | "grotesk" | "serif" | "suisse";
  fontWeight?: number;
  fontScale?: number; // Overall text size scaling factor
  rotation?: number; // Maximum rotation angle (ignored here as layoutEngine handles standard random rotation ranges)
  animationSpeed?: number;
  hoverScale?: number;
  hoverBrightness?: number;
  mouseParallax?: boolean;
  depth?: number; // Number of visual depth layers (default: 3)
  noise?: boolean;
  grid?: boolean;
  showSearch?: boolean;
  highlightedNames?: string[];
  colorMode?: "light" | "dark";
  className?: string;
  renderName?: (
    name: string,
    index: number,
    state: { isHovered: boolean; isHighlighted: boolean; isMatched: boolean }
  ) => React.ReactNode;
}

export function NamesLanding({
  names = [],
  variant = "constellation",
  title,
  subtitle,
  background = "solid",
  density = 2,
  spacing = 1.0,
  fontFamily = "sans",
  fontWeight,
  fontScale = 1.0,
  hoverScale = 1.08,
  hoverBrightness = 1.15,
  mouseParallax = true,
  showSearch = true,
  highlightedNames = [],
  colorMode = "dark",
  className = "",
  renderName
}: NamesLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [searchQuery, setSearchQuery] = useState("");

  const isDark = colorMode === "dark";

  // 1. Monitor viewport dimensions for real-time recalculation of layout positioning
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.max(800, entry.contentRect.width),
          height: Math.max(600, entry.contentRect.height)
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 2. Compute positions using the layoutEngine
  const items = useMemo(() => {
    return generateLayout(
      names,
      variant,
      dimensions.width,
      dimensions.height,
      density,
      spacing,
      fontScale,
      highlightedNames
    );
  }, [names, variant, dimensions, density, spacing, fontScale, highlightedNames]);

  // 3. Mouse Parallax Coordinate Springs
  const mouseXRaw = useMotionValue(dimensions.width / 2);
  const mouseYRaw = useMotionValue(dimensions.height / 2);

  const springConfig = { stiffness: 75, damping: 22, mass: 0.8 };
  const mouseX = useSpring(mouseXRaw, springConfig);
  const mouseY = useSpring(mouseYRaw, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseXRaw.set(x);
    mouseYRaw.set(y);
  };

  // Parallax offsets per layer:
  // Foreground (layer 0): shifts opposite to mouse for maximum parallax effect
  const fgX = useTransform(mouseX, [0, dimensions.width], [22, -22]);
  const fgY = useTransform(mouseY, [0, dimensions.height], [22, -22]);

  // Midground (layer 1): moderate shift
  const mgX = useTransform(mouseX, [0, dimensions.width], [10, -10]);
  const mgY = useTransform(mouseY, [0, dimensions.height], [10, -10]);

  // Background (layer 2): minimal shift
  const bgX = useTransform(mouseX, [0, dimensions.width], [4, -4]);
  const bgY = useTransform(mouseY, [0, dimensions.height], [4, -4]);

  // Soft cursor light follow coordinates
  const cursorLightX = useTransform(mouseX, (x) => x - 225);
  const cursorLightY = useTransform(mouseY, (y) => y - 225);

  // 4. Filtering match lists based on search input
  const searchActive = searchQuery.trim().length > 0;
  const lowercaseQuery = searchQuery.toLowerCase();

  const matchedIds = useMemo(() => {
    if (!searchActive) return new Set<string>();
    const matched = new Set<string>();
    for (const item of items) {
      if (item.name.toLowerCase().includes(lowercaseQuery)) {
        matched.add(item.id);
      }
    }
    return matched;
  }, [items, searchActive, lowercaseQuery]);

  // Group items by depth layer for rendering containment
  const layers = useMemo(() => {
    const l0: PositionedName[] = [];
    const l1: PositionedName[] = [];
    const l2: PositionedName[] = [];

    for (const item of items) {
      if (item.z === 0) l0.push(item);
      else if (item.z === 1) l1.push(item);
      else l2.push(item);
    }
    return { foreground: l0, midground: l1, background: l2 };
  }, [items]);

  // Layout-specific styling mapping
  const overlayTitleStyles = isDark ? "text-white/6" : "text-black/5";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full overflow-hidden select-none select-none z-10 flex flex-col items-center justify-between p-8 ${className}`}
    >
      {/* Background layer */}
      <BackgroundLayer type={background} colorMode={colorMode} />

      {/* Floating dynamic cursor spotlight lighting */}
      {mouseParallax && !searchActive && (
        <motion.div
          className={`absolute pointer-events-none z-[12] w-[450px] h-[450px] rounded-full blur-[110px] opacity-[0.26] ${
            isDark ? "bg-white" : "bg-neutral-500"
          }`}
          style={{
            x: cursorLightX,
            y: cursorLightY,
            willChange: "transform"
          }}
        />
      )}

      {/* Static / background exhibition details */}
      {(title || subtitle) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-5">
          {title && (
            <h1 className={`text-[8.5vw] font-black tracking-[0.08em] uppercase ${overlayTitleStyles} font-sans leading-none text-center select-none`}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`mt-4 font-mono text-xs uppercase tracking-[0.24em] ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Search Input Bar Overlay */}
      {showSearch && (
        <div className="relative w-full max-w-xs z-[60] flex flex-col items-center shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER CATALOGUE..."
            className={`w-full px-4 py-2 font-mono text-[10px] uppercase tracking-wider rounded-xl border outline-none text-center transition-all ${
              isDark 
                ? "bg-[#090909]/60 border-white/8 text-white placeholder-white/25 focus:border-white/20 focus:bg-[#090909]/85"
                : "bg-white/60 border-black/8 text-neutral-900 placeholder-black/25 focus:border-black/20 focus:bg-white/85"
            }`}
          />
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        
        {/* Layer 2: Background items */}
        <motion.div 
          className="absolute inset-0 pointer-events-none" 
          style={{ x: bgX, y: bgY, willChange: "transform" }}
        >
          {layers.background.map((item) => (
            <NameItem
              key={item.id}
              item={item}
              mouseX={mouseXRaw}
              mouseY={mouseYRaw}
              hoverScale={hoverScale}
              hoverBrightness={hoverBrightness}
              isMatched={matchedIds.has(item.id)}
              searchActive={searchActive}
              colorMode={colorMode}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              mouseParallax={mouseParallax}
              renderName={renderName}
            />
          ))}
        </motion.div>

        {/* Layer 1: Midground items */}
        <motion.div 
          className="absolute inset-0 pointer-events-none" 
          style={{ x: mgX, y: mgY, willChange: "transform" }}
        >
          {layers.midground.map((item) => (
            <NameItem
              key={item.id}
              item={item}
              mouseX={mouseXRaw}
              mouseY={mouseYRaw}
              hoverScale={hoverScale}
              hoverBrightness={hoverBrightness}
              isMatched={matchedIds.has(item.id)}
              searchActive={searchActive}
              colorMode={colorMode}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              mouseParallax={mouseParallax}
              renderName={renderName}
            />
          ))}
        </motion.div>

        {/* Layer 0: Foreground items */}
        <motion.div 
          className="absolute inset-0 pointer-events-none" 
          style={{ x: fgX, y: fgY, willChange: "transform" }}
        >
          {layers.foreground.map((item) => (
            <NameItem
              key={item.id}
              item={item}
              mouseX={mouseXRaw}
              mouseY={mouseYRaw}
              hoverScale={hoverScale}
              hoverBrightness={hoverBrightness}
              isMatched={matchedIds.has(item.id)}
              searchActive={searchActive}
              colorMode={colorMode}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              mouseParallax={mouseParallax}
              renderName={renderName}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom informational meta tags */}
      <div className="relative w-full flex items-center justify-between z-40 text-[9px] font-mono tracking-widest text-neutral-500 uppercase select-none pointer-events-none shrink-0 mt-auto pt-4">
        <div>CATALOG SIZE: {names.length} ITEMS</div>
        <div>RENDER MODE: {variant}</div>
      </div>
    </div>
  );
}
