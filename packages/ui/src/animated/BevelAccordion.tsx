"use client";

import React, { useState, useRef, useEffect } from "react";
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
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

export function BevelAccordion({
  items,
  className,
  allowMultiple = false,
  defaultExpanded = [],
}: BevelAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpanded);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
      );
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const isCurrentlyOpen = expandedIds.includes(id);

    if (isCurrentlyOpen) {
      // Smoothly close the open item
      setExpandedIds([]);
    } else if (expandedIds.length > 0) {
      // First close the currently open item, then open the new one after collapse finishes
      setExpandedIds([]);
      timeoutRef.current = setTimeout(() => {
        setExpandedIds([id]);
      }, 240);
    } else {
      // Open immediately if nothing is currently open
      setExpandedIds([id]);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3.5 w-full", className)}>
      {items.map((item) => {
        const isOpen = expandedIds.includes(item.id);

        return (
          <motion.div
            key={item.id}
            layout="position"
            className={cn(
              "relative flex flex-col overflow-hidden text-left select-none rounded-2xl",
              "border-t border-white/[0.22] border-x border-white/[0.02] border-b border-white/10 backdrop-blur-2xl transition-all duration-200"
            )}
            style={{
              backgroundColor: "#171717",
              boxShadow:
                "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45)",
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
                  <div
                    className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg border border-white/5 bg-[#070707] text-neutral-400"
                    style={{
                      boxShadow: "inset 0 1.5px 3.5px rgba(0, 0, 0, 0.85)",
                    }}
                  >
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
                  transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
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
                  transition={{
                    height: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
                    opacity: { duration: 0.18, ease: "linear" },
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-4 text-sm text-neutral-400 leading-relaxed border-t border-white/[0.06]">
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
