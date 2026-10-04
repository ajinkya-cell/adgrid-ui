import { useEffect, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import type { RegistryEntry } from "@/registry";

interface SidebarItemProps {
  entry: RegistryEntry;
  active: boolean;
  itemNumber?: string;
  isFocused: boolean;
  onNavigate?: () => void;
  onSelect?: (entry: RegistryEntry) => void;
  onHoverChange: (entry: RegistryEntry | null, rect: DOMRect | null) => void;
}

function SidebarItemComponent({
  entry,
  active,
  isFocused,
  onNavigate,
  onSelect,
  onHoverChange,
}: SidebarItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (onSelect) onSelect(entry);
    else onNavigate?.();
  };

  const handleMouseEnter = () => {
    setHovered(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // 160ms delay prevents overlay churn during quick cursor passes
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        onHoverChange(entry, containerRef.current.getBoundingClientRect());
      }
    }, 160);
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

  const isNew = ["scroll-progress", "lumina-wave"].includes(entry.slug);
  const isHighlighted = hovered || isFocused;

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-active={active}
      className={`relative group flex items-center h-[30px] pl-[62px] pr-6 cursor-pointer select-none transition-colors duration-150 outline-none ${
        isFocused ? "bg-white/[0.03]" : ""
      }`}
      role="menuitem"
      tabIndex={0}
      aria-current={active ? "page" : undefined}
    >
      {/* Continuous ticks scale using SVG crispEdges: left-anchored vector lines growing rightwards */}
      <svg
        className="absolute left-5 top-0 bottom-0 w-[36px] h-[30px] pointer-events-none z-10"
        shapeRendering="crispEdges"
      >
        {[...Array(6)].map((_, i) => {
          const isTargetTick = i === 2; // Center indicator tick
          let targetWidth = 16; // Consistent baseline tick length
          let targetColor = "rgba(255, 255, 255, 0.12)";
          let filter = "none";

          if (isTargetTick) {
            if (isHighlighted) {
              // Highlighted / Hovered: single tick extends and turns pure white
              targetWidth = 30;
              targetColor = "rgba(255, 255, 255, 1)";
              filter = "drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))";
            } else if (active) {
              // Selected / Active: single tick extends and turns lavender
              targetWidth = 28;
              targetColor = "rgba(167, 139, 250, 1)";
              filter = "drop-shadow(0 0 5px rgba(167, 139, 250, 0.7))";
            }
          } else {
            // Other 5 ticks remain consistent in size, subtly illuminating on active/hover
            if (isHighlighted) {
              targetColor = "rgba(255, 255, 255, 0.22)";
            } else if (active) {
              targetColor = "rgba(255, 255, 255, 0.16)";
            }
          }

          // Exactly 5.0px between every tick across the entire list (30px / 6 = 5.0px)
          const y = i * 5 + 2.5;
          return (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={targetWidth}
              y2={y}
              stroke={targetColor}
              strokeWidth="1.25"
              style={{
                filter,
                transition: "x2 0.25s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.2s ease-out, filter 0.2s ease-out",
              }}
            />
          );
        })}
      </svg>

      <div className="flex items-center gap-3 min-w-0">
        {/* Component Title with Inter font, Tasteful Bounce, Rightward Slide & Pure White Illumination */}
        <motion.span
          className="font-inter text-[13.5px] font-normal tracking-[-0.01em] truncate origin-left inline-block"
          animate={
            isHighlighted
              ? {
                  scale: 1.04,
                  x: 8,
                  color: "#ffffff",
                  textShadow: "0 0 12px rgba(255, 255, 255, 0.25)",
                }
              : active
              ? {
                  scale: 1,
                  x: 0,
                  color: "#a78bfa",
                  textShadow: "0 0 0px rgba(255, 255, 255, 0)",
                }
              : {
                  scale: 1,
                  x: 0,
                  color: "rgba(255, 255, 255, 0.45)",
                  textShadow: "0 0 0px rgba(255, 255, 255, 0)",
                }
          }
          transition={
            isHighlighted
              ? {
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  mass: 0.7,
                }
              : {
                  type: "spring",
                  stiffness: 280,
                  damping: 24,
                  mass: 0.9,
                }
          }
        >
          {entry.name}
        </motion.span>

        {/* New Badge */}
        {isNew && (
          <span
            className="px-1.5 py-0.5 rounded-[4px] border border-violet-500/20 bg-violet-950/20 font-mono text-[8px] uppercase tracking-wider text-violet-400 shrink-0 select-none scale-90 animate-pulse"
          >
            New
          </span>
        )}
      </div>
    </div>
  );
}

export const SidebarItem = memo(SidebarItemComponent);
