"use client";

import { motion } from "framer-motion";

export function DockButton({
  icon,
  label,
  shortcut,
  onClick,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shortcut ? `${label}, shortcut ${shortcut}` : label}
      className={`group relative grid h-8 w-8 place-items-center rounded-lg text-white/58 transition-colors duration-150 hover:bg-white/10 hover:text-white active:scale-[0.97] ${
        variant === "danger" ? "hover:text-red-200" : ""
      }`}
    >
      {icon}
      <motion.span
        className="pointer-events-none absolute right-0 top-10 hidden whitespace-nowrap rounded-md border border-white/10 bg-neutral-950/95 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 shadow-2xl backdrop-blur-xl group-hover:block"
        initial={{ opacity: 0, y: -4, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", duration: 0.18, bounce: 0 }}
      >
        {label}
        {shortcut && <span className="ml-2 text-white/30">{shortcut}</span>}
      </motion.span>
    </button>
  );
}

