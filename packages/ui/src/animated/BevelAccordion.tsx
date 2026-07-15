"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface BevelAccordionProps {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean; // Expand multiple items simultaneously
  glowColor?: "blue" | "white" | "none"; // Shadow glow colors
  shadowStyle?: string; // Custom box shadow override
  defaultExpanded?: string[]; // IDs of initially expanded items
}

export function BevelAccordion({
  items,
  className,
  allowMultiple = false,
  glowColor = "blue",
  shadowStyle,
  defaultExpanded = [],
}: BevelAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
      );
    } else {
      setExpandedIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  // Determine shadow strings based on glowColor selection
  const resolveActiveShadow = () => {
    if (shadowStyle) return shadowStyle;
    if (glowColor === "blue") {
      return "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 50px rgba(8, 112, 184, 0.7)";
    }
    if (glowColor === "white") {
      return "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 50px rgba(255, 255, 255, 0.65)";
    }
    return "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)";
  };

  const normalShadow = "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)";

  return (
    <div className={cn("flex flex-col gap-3.5 w-full", className)}>
      {items.map((item) => {
        const isOpen = expandedIds.includes(item.id);

        return (
          <motion.div
            key={item.id}
            layout="position"
            animate={{
              y: isOpen ? -3 : 0,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className={cn(
              "relative flex flex-col overflow-hidden text-left select-none transition-colors duration-250 rounded-2xl",
              "border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 backdrop-blur-2xl"
            )}
            style={{
              backgroundColor: "#171717",
              boxShadow: isOpen ? resolveActiveShadow() : normalShadow,
            }}
          >
            {/* Header Trigger */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="flex items-center justify-between w-full p-5 text-left cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 border-none bg-transparent"
            >
              <div className="flex items-center gap-4 min-w-0">
                {item.icon && (
                  <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border border-white/5 bg-[#070707] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)] text-neutral-400">
                    {item.icon}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h4 className="text-sm font-semibold tracking-wide text-neutral-100 truncate">
                    {item.title}
                  </h4>
                  {item.description && (
                    <span className="text-xs font-medium text-neutral-500 truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Rotating Arrow */}
              <div className="text-neutral-400 hover:text-neutral-200 transition-colors p-1">
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </motion.svg>
              </div>
            </button>

            {/* Dynamic Content Panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed border-t border-white/[0.04] pt-4 mt-0.5">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
