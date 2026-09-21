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

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

export type BevelAccordionProps = AccordionProps;

export function Accordion({
  items,
  className,
  allowMultiple = false,
  defaultExpanded = [],
}: AccordionProps) {
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
              "group relative flex flex-col overflow-hidden text-left select-none rounded-2xl",
              "border border-white/[0.08] bg-[#151516] transition-all duration-200",
              "hover:border-white/[0.13] hover:bg-[#18181a]"
            )}
            style={{
              boxShadow: isOpen
                ? "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 0 rgba(0, 0, 0, 0.6), 0 20px 40px -12px rgba(0, 0, 0, 0.7), 0 2px 8px -2px rgba(0, 0, 0, 0.5)"
                : "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.5), 0 14px 30px -10px rgba(0, 0, 0, 0.5), 0 1px 4px -1px rgba(0, 0, 0, 0.35)",
            }}
          >
            {/* Prismatic Top-Border Highlight */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.12) 80%, transparent 100%)",
              }}
            />

            {/* Header Trigger */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="flex items-center justify-between w-full px-5 py-4 text-left cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0e] border-none bg-transparent"
            >
              <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                <h4 className="text-[14.5px] font-medium tracking-tight text-neutral-100 group-hover:text-white transition-colors truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <span className="text-[12.5px] font-normal text-neutral-500 group-hover:text-neutral-400 transition-colors truncate">
                    {item.description}
                  </span>
                )}
              </div>

              {/* Machined Debossed Chevron Socket */}
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-[#0d0d0e] border border-white/[0.08] transition-all duration-300",
                  isOpen
                    ? "border-white/[0.18] text-white"
                    : "text-neutral-400 group-hover:text-neutral-200 group-hover:border-white/[0.14]"
                )}
                style={{
                  boxShadow:
                    "inset 0 1.5px 3px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.06)",
                }}
              >
                <motion.svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
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
                  <div className="px-4 pb-4 pt-0.5">
                    <div
                      className="rounded-xl p-4 text-[13.5px] leading-relaxed text-neutral-400 border border-white/[0.05] bg-[#0c0c0d]/90"
                      style={{
                        boxShadow:
                          "inset 0 2px 4px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.03)",
                      }}
                    >
                      {item.content}
                    </div>
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

export const BevelAccordion = Accordion;
