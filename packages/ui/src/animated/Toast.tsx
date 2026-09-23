"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

export interface ToastProps {
  title: string;
  description: string;
  onDismiss: () => void;
  /** Distance behind the front toast in the presentation stack. */
  stackDepth?: number;
  /** Whether the stack is expanded by pointer hover or keyboard focus. */
  isExpanded?: boolean;
  className?: string;
}

export function Toast({
  title,
  description,
  onDismiss,
  stackDepth = 0,
  isExpanded = false,
  className,
}: ToastProps) {
  const shouldReduceMotion = useReducedMotion();
  const isStacked = stackDepth > 0;
  const isBehindInCollapsedStack = isStacked && !isExpanded;
  const stackOpacity = isExpanded ? 1 : Math.max(0.72, 1 - stackDepth * 0.12);
  const stackTransform = isExpanded
    ? `translate3d(0, ${-stackDepth * 136}px, 0)`
    : `translate3d(0, ${-stackDepth * 20}px, ${-stackDepth * 16}px) scale(${1 - stackDepth * 0.045}) rotateX(${stackDepth * 2}deg)`;

  return (
    <div
      style={{
        zIndex: 10 - stackDepth,
        pointerEvents: isBehindInCollapsedStack ? "none" : "auto",
        transform: stackTransform,
        transformOrigin: "100% 100%",
        transformStyle: "preserve-3d",
        transition: shouldReduceMotion
          ? "none"
          : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease",
        opacity: stackOpacity,
      }}
      className="absolute inset-x-0 bottom-0"
    >
      <motion.div
        role={isStacked ? undefined : "status"}
        aria-live={isStacked ? undefined : "polite"}
        aria-atomic={isStacked ? undefined : "true"}
        aria-hidden={isBehindInCollapsedStack || undefined}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 26, filter: "blur(4px)" }
        }
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, filter: "blur(0px)" }
        }
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 16, filter: "blur(3px)" }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.14 }
            : { type: "spring", duration: 0.38, bounce: 0 }
        }
        style={{
          transformStyle: "preserve-3d",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1.5px 0 0 rgba(0,0,0,0.45), 0 24px 56px -22px rgba(0,0,0,0.92), 0 4px 12px -5px rgba(0,0,0,0.78)",
        }}
        className={cn(
          "relative w-full overflow-hidden my-2 rounded-3xl border border-white/[0.08] border-t-white/20 bg-[#171717] text-left",
          className
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[1.5px] rounded-t-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
          }}
        />

        <div className="flex items-start  p-2 sm:p-6">
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-white sm:text-base">
              {title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-400 sm:text-sm">
              {description}
            </p>
          </div>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={onDismiss}
            disabled={isBehindInCollapsedStack}
            tabIndex={isBehindInCollapsedStack ? -1 : undefined}
            className="group/close inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-red-200/20 bg-[#bd3438] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(80,0,0,0.28),0_3px_8px_rgba(0,0,0,0.38)] transition-[background-color,transform,box-shadow] duration-150 hover:bg-[#d34044] active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717] motion-reduce:transition-none motion-reduce:transform-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="size-[17px]"
            >
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
