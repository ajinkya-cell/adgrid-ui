"use client";

import { motion } from "framer-motion";
import { useScrollPath } from "../ScrollPathContext";

export interface ScrollPathProcessProps {
  strokeWidth?: number;
  glow?: boolean;
  color?: string;
  steps?: Array<{ title: string; desc: string }>;
  className?: string;
}

const defaultSteps = [
  { title: "1. Brainstorm & Spec", desc: "Collaboratively refine ideas, architectural tradeoffs, and color themes before writing a single line." },
  { title: "2. Build & Sandbox", desc: "Construct components using Tailwind and Framer Motion. Test configurations inside our live control panels." },
  { title: "3. CLI Registry Publish", desc: "Publish components directly to the registry using simple cli commands to share across workspaces." },
];

export default function ScrollPathProcess({
  strokeWidth = 3,
  glow = true,
  color = "#a855f7", // Premium Purple
  steps = defaultSteps,
  className = "",
}: ScrollPathProcessProps) {
  const { scrollProgress } = useScrollPath();

  // SVG Coordinates corresponding to the card nodes
  const pathD = "M 200 350 C 400 580, 500 580, 720 580 C 940 580, 1040 580, 1240 350";

  // Card visibilities based on scroll progress
  const step1Active = scrollProgress >= 0.05;
  const step2Active = scrollProgress >= 0.5;
  const step3Active = scrollProgress >= 0.95;

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0, y: 15 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  return (
    <div className={`w-full relative h-[890px] flex items-center justify-center overflow-hidden ${className}`}>
      {/* SVG Path Background */}
      <svg
        width="1440"
        height="890"
        viewBox="0 0 1440 890"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <filter id="processGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
        </defs>

        {/* Gray background track */}
        <path
          d={pathD}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Glow path */}
        {glow && (
          <motion.path
            d={pathD}
            stroke={color}
            strokeWidth={strokeWidth * 3}
            fill="none"
            filter="url(#processGlow)"
            className="opacity-40"
            initial={false}
            animate={{ pathLength: scrollProgress }}
            transition={{ type: "tween", duration: 0.1, ease: "easeOut" }}
          />
        )}

        {/* Primary animated path */}
        <motion.path
          d={pathD}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          initial={false}
          animate={{ pathLength: scrollProgress }}
          transition={{ type: "tween", duration: 0.1, ease: "easeOut" }}
        />
      </svg>

      {/* Interactive Floating HTML Cards */}
      <div className="absolute inset-0 max-w-7xl mx-auto w-full h-full pointer-events-none">
        {/* Step 1 Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={step1Active ? "visible" : "hidden"}
          className="absolute pointer-events-auto bg-[#18181b]/90 border border-white/10 hover:border-purple-500/30 backdrop-blur-md p-6 rounded-2xl w-[320px] shadow-2xl transition-all duration-300"
          style={{
            left: "140px",
            top: "140px",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">Step 1</div>
          <h3 className="text-xl font-bold text-white mb-2">{steps[0]?.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{steps[0]?.desc}</p>
        </motion.div>

        {/* Step 2 Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={step2Active ? "visible" : "hidden"}
          className="absolute pointer-events-auto bg-[#18181b]/90 border border-white/10 hover:border-purple-500/30 backdrop-blur-md p-6 rounded-2xl w-[320px] shadow-2xl transition-all duration-300"
          style={{
            left: "50%",
            top: "620px",
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">Step 2</div>
          <h3 className="text-xl font-bold text-white mb-2">{steps[1]?.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{steps[1]?.desc}</p>
        </motion.div>

        {/* Step 3 Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={step3Active ? "visible" : "hidden"}
          className="absolute pointer-events-auto bg-[#18181b]/90 border border-white/10 hover:border-purple-500/30 backdrop-blur-md p-6 rounded-2xl w-[320px] shadow-2xl transition-all duration-300"
          style={{
            right: "140px",
            top: "140px",
          }}
        >
          <div className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">Step 3</div>
          <h3 className="text-xl font-bold text-white mb-2">{steps[2]?.title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{steps[2]?.desc}</p>
        </motion.div>
      </div>
    </div>
  );
}
