"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export interface BevelAlertDialogProps {
  /** Controls visibility of the dialog */
  isOpen: boolean;
  /** Fired when dialog is closed (clicking backdrop or Cancel button) */
  onClose: () => void;
  /** Callback fired when the primary action button is clicked */
  onConfirm: () => void | Promise<void>;
  /** Main title text displayed in the header */
  title: string;
  /** Body message displayed in the sunken details tray */
  description: string;
  /** Style preset determining visual tone & primary button layout */
  variant?: "info" | "danger";
  /** Optional custom text for the confirm button */
  confirmLabel?: string;
  /** Optional custom text for the cancel button */
  cancelLabel?: string;
  /** Shows a physical loading state (amber flashing indicator) during async confirmation */
  loading?: boolean;
  /** If true, renders the dialog container inline without backdrop/overlay */
  inline?: boolean;
}

export function BevelAlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "ALARM CONSOLE INITIALIZED",
  description = "The security deck has booted successfully. All perimeter sensor scans are active and operating within nominal parameters.",
  variant = "info",
  confirmLabel = "PROCEED",
  cancelLabel = "DISMISS",
  loading = false,
  inline = false,
}: BevelAlertDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  // Sync internal loading state with prop
  useEffect(() => {
    setIsConfirming(loading);
  }, [loading]);

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Alert Dialog confirmation failed:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Trigger physical shake animation
      setShakeCount((prev) => prev + 1);
    }
  };

  // Determine LED classes based on variant and loading state
  const getLedClass = () => {
    if (isConfirming) {
      return "bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.95)]";
    }
    if (variant === "danger") {
      return "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.95)]";
    }
    return "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]";
  };

  const cardContent = (
    <motion.div
      key="bevel-alert-dialog"
      initial={inline ? undefined : { scale: 0.92, opacity: 0, y: 15 }}
      animate={
        inline
          ? { scale: 1, opacity: 1, y: 0 }
          : {
              scale: 1,
              opacity: 1,
              y: 0,
              x: shakeCount > 0 ? [0, -6, 6, -6, 6, 0] : 0,
            }
      }
      exit={inline ? undefined : { scale: 0.94, opacity: 0, y: 10 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 24,
        x: { duration: 0.4, ease: "easeInOut" },
      }}
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40), 0 30px 80px rgba(0, 0, 0, 0.60)",
      }}
      className={cn(
        "relative w-full max-w-[420px] rounded-2xl overflow-hidden",
        "border-t border-white/20 border-x border-white/[0.02] border-b border-white/10",
        "flex flex-col gap-4 p-5",
        inline ? "mx-auto" : ""
      )}
    >
      {/* Header (Console Plate Header) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          {/* Physical LED Status Light */}
          <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-black/80 bg-neutral-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
            <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", getLedClass())} />
          </div>

          {/* Subtitle/Chassis Text */}
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-semibold select-none">
            {isConfirming
              ? "Console Processing..."
              : variant === "danger"
                ? "System Override Required"
                : "Console Notification"}
          </span>
        </div>

        {/* Minimal Machined Screws decoration */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-neutral-800 border border-black/50 shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.05)] flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-neutral-700/80 rotate-45" />
          </div>
          <div className="w-2 h-2 rounded-full bg-neutral-800 border border-black/50 shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.05)] flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-neutral-700/80 -rotate-45" />
          </div>
        </div>
      </div>

      {/* Recessed Details Tray (Sunken Well) */}
      <div
        style={{
          backgroundColor: "#090909",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.80), 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
        className="rounded-xl p-4 border border-white/[0.04]"
      >
        <h2 className="text-sm font-semibold tracking-wide text-neutral-100 mb-2 font-sans select-text">
          {title}
        </h2>
        <p className="text-xs leading-relaxed text-neutral-400 font-sans select-text font-normal">
          {description}
        </p>
      </div>

      {/* Controls Bar (Footer Well) */}
      <div className="flex items-center justify-end gap-3.5 pt-1">
        {/* Secondary Button: Cancel (Sunken Sub-Well Button) */}
        <motion.button
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          whileTap={{ scale: 0.97 }}
          style={{
            backgroundColor: "#050505",
            boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.60)",
          }}
          className={cn(
            "px-4 h-10 rounded-lg text-[10px] font-mono tracking-widest uppercase font-bold",
            "border border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-white/15 transition-colors",
            "cursor-pointer focus:outline-none focus:border-white/20 select-none disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {cancelLabel || "Cancel"}
        </motion.button>

        {/* Primary Button: Confirm (Elevated Button Pill) */}
        <motion.button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming}
          whileTap={{ scale: 0.96, y: 1.5 }}
          style={{
            backgroundColor: variant === "danger" ? "#EF4444" : "#FFFFFF",
            color: variant === "danger" ? "#FFFFFF" : "#000000",
            boxShadow:
              variant === "danger" ? "0 2px 4px rgba(239, 68, 68, 0.25)" : "0 2px 4px rgba(0, 0, 0, 0.20)",
          }}
          className={cn(
            "px-5 h-10 rounded-lg text-[10px] font-mono tracking-widest uppercase font-extrabold flex items-center justify-center gap-2",
            variant === "danger" ? "border border-red-400/40" : "border border-white/35",
            "cursor-pointer focus:outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isConfirming && (
            <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {confirmLabel || (variant === "danger" ? "Override" : "Confirm")}
        </motion.button>
      </div>
    </motion.div>
  );

  if (inline) {
    return cardContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md cursor-default select-none"
        >
          {cardContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
