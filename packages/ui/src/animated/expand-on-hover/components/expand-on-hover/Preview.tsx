
import { motion } from "framer-motion";
import { ExpandItem } from "../../types";

interface PreviewProps {
  item: ExpandItem;
  index: number;
}

export function Preview({ item }: PreviewProps) {
  return (
    <motion.div
      layout="position"
      className="flex items-center w-full h-full px-6 select-none"
    >
      {/* Title only in Inter font */}
      <span 
        className="text-sm font-semibold tracking-wide text-white/90"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {item.title}
      </span>
    </motion.div>
  );
}
