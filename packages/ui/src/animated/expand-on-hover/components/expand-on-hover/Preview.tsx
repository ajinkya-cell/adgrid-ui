import { motion } from "framer-motion";
import { ExpandItem } from "../../types";

interface PreviewProps {
  item: ExpandItem;
  index: number;
  isExpanded?: boolean;
}

export function Preview({ item, index, isExpanded = false }: PreviewProps) {
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <div className="flex items-center justify-between w-full h-full px-6 select-none relative z-10">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Monospace index */}
        <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
          {formattedIndex}
        </span>

        {/* Title */}
        <span className="text-sm font-semibold tracking-wide text-white/90 truncate">
          {item.title}
        </span>

        {/* Year or badge pill */}
        {(item.year || item.badge) && (
          <span className="text-[10px] font-mono tracking-wider text-neutral-400 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-full">
            {item.year || item.badge}
          </span>
        )}
      </div>

      {/* Right chevron indicator */}
      <motion.div
        animate={{ rotate: isExpanded ? 90 : 0 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        className="text-neutral-500 shrink-0 ml-2"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </motion.div>
    </div>
  );
}
