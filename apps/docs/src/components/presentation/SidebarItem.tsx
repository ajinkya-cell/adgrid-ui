"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";

interface SidebarItemProps {
  entry: RegistryEntry;
  active: boolean;
  itemNumber: string;
  isFocused: boolean;
  onNavigate: () => void;
  onHoverChange: (entry: RegistryEntry | null, rect: DOMRect | null) => void;
}

export function SidebarItem({
  entry,
  active,
  itemNumber,
  isFocused,
  onNavigate,
  onHoverChange,
}: SidebarItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // 80ms delay to prevent overlay flickering during quick cursor passes
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        onHoverChange(entry, containerRef.current.getBoundingClientRect());
      }
    }, 80);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onHoverChange(null, null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isNew = ["scroll-progress", "scroll-path-draw", "lumina-wave"].includes(entry.slug);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onNavigate}
      data-active={active}
      className={`relative group flex items-center h-[36px] pl-12 pr-6 cursor-pointer select-none transition-colors duration-200 outline-none ${
        isFocused ? "bg-white/[0.03]" : ""
      }`}
      role="menuitem"
      tabIndex={0}
      aria-current={active ? "page" : undefined}
    >
      {/* Continuous ticks scale using SVG crispEdges: left-anchored vector lines growing rightwards */}
      <svg
        className="absolute left-5 top-0 bottom-0 w-[24px] h-[36px] pointer-events-none z-10"
        shapeRendering="crispEdges"
      >
        {[...Array(6)].map((_, i) => {
          let targetWidth = 8; // Uniform default size
          let targetColor = "rgba(255, 255, 255, 0.16)"; // Uniform default color

          if (hovered) {
            // Hovered style: only the two center major ticks grow and turn pure white
            if (i === 2 || i === 3) {
              targetWidth = 20; 
              targetColor = "rgba(255, 255, 255, 1)";
            }
          } else if (active) {
            // Selected/Active style: lavender pyramid shape
            if (i === 2 || i === 3) targetWidth = 22;
            else if (i === 1 || i === 4) targetWidth = 14;
            else targetWidth = 8;
            targetColor = "rgba(167, 139, 250, 1)";
          }
          
          // Set line coordinate: exactly halfway through the 1px stroke height
          const y = i * 6 + 3.5;
          return (
            <motion.line
              key={i}
              x1="0"
              y1={y}
              x2={targetWidth}
              y2={y}
              stroke={targetColor}
              strokeWidth="1"
              animate={{
                x2: targetWidth,
                stroke: targetColor,
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            />
          );
        })}
      </svg>

      <div className="flex items-center gap-3.5 min-w-0">
        {/* Dimmed Number Prefix */}
        <span className={`font-mono text-[11px] tracking-wider transition-colors duration-200 ${
          active || hovered ? "text-[#a78bfa]/60" : "text-white/20"
        }`}>
          {itemNumber}
        </span>

        {/* Component Title */}
        <span className={`font-plus-jakarta text-[14px] font-normal tracking-wide transition-colors duration-200 truncate ${
          active || hovered ? "text-[#a78bfa]" : "text-white/45 group-hover:text-white/70"
        }`}>
          {entry.name}
        </span>

        {/* New Badge */}
        {isNew && (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="px-1.5 py-0.5 rounded-[4px] border border-violet-500/20 bg-violet-950/20 font-mono text-[8px] uppercase tracking-wider text-violet-400 shrink-0 select-none scale-90"
          >
            New
          </motion.span>
        )}
      </div>
    </div>
  );
}
