"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePresentationStore } from "@/lib/presentation/store";

export function SidebarTrigger() {
  const sidebarOpen = usePresentationStore((state) => state.sidebarOpen);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!hovered || sidebarOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const rad = Math.atan2(dy, dx);
      const deg = rad * (180 / Math.PI);
      // Offset by 90 deg so the needle starts pointing up
      setAngle(deg + 90);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hovered, sidebarOpen]);

  return (
    <motion.button
      ref={buttonRef}
      onClick={toggleSidebar}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setAngle(0);
      }}
      className={`fixed left-6 top-6 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer shadow-[0_10px_35px_rgba(0,0,0,0.6)] ${
        sidebarOpen 
          ? "border-cyan-500/40 bg-cyan-950/20 text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]" 
          : "border-white/10 bg-neutral-950/80 text-white/50 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95"
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      aria-label={sidebarOpen ? "Close navigator" : "Open navigator"}
      type="button"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        {/* Spinning Outer Compass Ticks */}
        <motion.svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          className="absolute opacity-30"
          animate={{ rotate: sidebarOpen ? -360 : 360 }}
          transition={{
            repeat: Infinity,
            duration: sidebarOpen ? 5 : 12,
            ease: "linear",
          }}
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 15" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 8" />
        </motion.svg>

        {/* Cursor-Pointing Inner Needle */}
        <motion.svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={sidebarOpen ? "text-cyan-400" : "text-white/80"}
          style={{ transformOrigin: "center" }}
          animate={{ rotate: sidebarOpen ? 45 : angle }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 15,
          }}
        >
          {/* Compass Needle Shape */}
          <path d="M12 2L15 9H9L12 2Z" fill="currentColor" />
          <path d="M12 22L9 15H15L12 22Z" fill="currentColor" className="opacity-35" />
          <circle cx="12" cy="12" r="1.5" className="fill-black" />
        </motion.svg>
      </div>
    </motion.button>
  );
}
