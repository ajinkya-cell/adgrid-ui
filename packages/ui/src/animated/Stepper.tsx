"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export interface StepItem {
  /** Title of the milestone step */
  title: string;
  /** Detailed description subtext */
  description?: string;
  /** Optional custom icon */
  icon?: React.ReactNode;
}

export interface StepperProps {
  /** Array of step items */
  steps?: StepItem[];
  /** Controlled active step index (0-indexed) */
  currentStep?: number;
  /** Initial step index if uncontrolled */
  defaultStep?: number;
  /** Callback fired when active step changes */
  onStepChange?: (stepIndex: number) => void;
  /** Additional custom class names */
  className?: string;
}

const defaultSteps: StepItem[] = [
  { title: "Initialize Vault", description: "Authenticate hardware encryption keys and verify identity parameters." },
  { title: "Circuit Sync", description: "Establish high-speed neural bus connection and negotiate secure handshake protocols." },
  { title: "Deploy Payload", description: "Compile and execute quantum core sequence across all distributed edge clusters." },
  { title: "System Ready", description: "All security nodes synchronized and operational. System ready for access." },
];

export function Stepper({
  steps = defaultSteps,
  currentStep: controlledStep,
  defaultStep = 0,
  onStepChange,
  className,
}: StepperProps) {
  const [uncontrolledStep, setUncontrolledStep] = useState(defaultStep);
  const isControlled = controlledStep !== undefined;
  const activeStep = isControlled ? controlledStep : uncontrolledStep;

  const handleStepClick = (index: number) => {
    if (!isControlled) {
      setUncontrolledStep(index);
    }
    onStepChange?.(index);
  };

  const activeItem = steps[activeStep] || steps[0];

  return (
    <div className={cn("w-full max-w-xl mx-auto flex flex-col gap-8 select-none font-['DM_Sans',sans-serif]", className)}>
      {/* DM Sans font loader */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      {/* Top Stepper Checkpoint Nodes Row with Dashed Connecting Lines */}
      <div className="relative flex items-center justify-between w-full px-2">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Circular Node Checkpoint */}
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                style={{
                  backgroundColor: isActive ? "#171717" : "#050505",
                  boxShadow: isActive
                    ? "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.25), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.12), 0 4px 12px rgba(0, 0, 0, 0.6)"
                    : "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.5)",
                }}
                className={cn(
                  "relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer z-10 group active:scale-95",
                  isActive
                    ? "border-white/40 text-white font-bold"
                    : "border-white/10 text-neutral-500 hover:border-white/25 hover:text-neutral-300 font-medium"
                )}
              >
                {/* Active step glowing indicator ring */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/40 pointer-events-none"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                )}

                {/* Node Number or Custom Icon */}
                <span className="text-xs font-mono font-bold">
                  {step.icon || index + 1}
                </span>
              </button>

              {/* Dashed Connecting Line between 1 -> 2 -> 3 -> 4 */}
              {!isLast && (
                <div className="flex-1 h-0 border-t-2 border-dashed border-white/20 mx-2 self-center shrink" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Downwards Active Step Details Card - Absolute In-Place Fade (Zero Jitter/Shift) */}
      <div
        style={{
          backgroundColor: "#121214",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 6px 20px rgba(0, 0, 0, 0.6)",
        }}
        className="relative w-full h-[104px] min-h-[104px] rounded-2xl border border-white/10 p-5 font-['DM_Sans',sans-serif] flex flex-col justify-center overflow-hidden"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={activeStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeInOut" }}
            className="absolute inset-x-5 flex flex-col justify-center gap-1"
          >
            <h4 className="text-base font-bold text-white tracking-wide">
              {activeItem.title}
            </h4>

            {activeItem.description && (
              <p className="text-xs text-neutral-400 font-['DM_Sans',sans-serif] leading-relaxed line-clamp-2">
                {activeItem.description}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export const Timeline = Stepper;
