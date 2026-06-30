import React from "react";
import { motion } from "framer-motion";
import { ExpandItem } from "../../types";

interface PreviewProps {
  item: ExpandItem;
  index: number;
}

export function Preview({ item, index }: PreviewProps) {
  return (
    <motion.div
      layout="position"
      className="flex items-center justify-between w-full h-full px-6 select-none"
    >
      <div className="flex items-center gap-4">
        {/* Index counter */}
        <span className="text-xs font-mono font-bold opacity-40 text-neutral-400">
          {(index + 1).toString().padStart(2, "0")}
        </span>
        
        {/* Title */}
        <span className="font-sans text-sm font-bold tracking-tight text-white">
          {item.title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Optional Badge */}
        {item.badge && (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-white/10 text-white/90 border border-white/10 backdrop-blur-sm">
            {item.badge}
          </span>
        )}
        
        {/* Minimal accent dot */}
        <div
          className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_var(--accent-glow)]"
          style={{ 
            backgroundColor: item.accent || "#ffffff",
            // @ts-ignore
            "--accent-glow": item.accent || "#ffffff"
          }}
        />
      </div>
    </motion.div>
  );
}
