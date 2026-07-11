"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePresentationStore } from "@/lib/presentation/store";

export function SidebarTrigger() {
  const sidebarOpen = usePresentationStore((state) => state.sidebarOpen);
  const sidebarTab = usePresentationStore((state) => state.sidebarTab);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const setSidebarTab = usePresentationStore((state) => state.setSidebarTab);
  const openSidebarTab = usePresentationStore((state) => state.openSidebarTab);

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

  const handleClick = () => {
    if (!sidebarOpen) {
      // Closed -> Open & show navigator
      openSidebarTab("navigator");
    } else {
      if (sidebarTab !== "navigator") {
        // Open on other tab -> switch back to component list (navigator)
        setSidebarTab("navigator");
      } else {
        // Open on navigator -> close sidebar
        toggleSidebar();
      }
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setAngle(0);
      }}
      className={`fixed left-6 top-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 cursor-pointer select-none ${
        sidebarOpen
          ? "border-violet-400/40 text-violet-300"
          : "border-white/25 text-white/55 hover:text-white/90 hover:border-white/35"
      }`}
      style={{
        backgroundColor: "#171717",
        boxShadow: sidebarOpen
          ? "inset 0 1.5px 0 0 rgba(167,139,250,0.12), inset 0 -1.5px 0 0 rgba(0,0,0,0.45), 0 0 18px rgba(139,92,246,0.2), 0 20px 50px rgba(0,0,0,0.6)"
          : "inset 0 1.5px 0 0 rgba(255,255,255,0.10), inset 0 -1.5px 0 0 rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.55)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label={sidebarOpen ? "Close navigator" : "Open navigator"}
      type="button"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        {/* Spinning Outer Compass Ticks */}
        <motion.svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          className="absolute opacity-80"
          animate={{ rotate: sidebarOpen ? -360 : 360 }}
          transition={{
            repeat: Infinity,
            duration: sidebarOpen ? 5 : 12,
            ease: "linear",
          }}
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 15" />
        </motion.svg>

        {/* Cursor-Pointing Inner Needle */}
        <motion.svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={sidebarOpen ? "text-violet-400" : "text-white/80"}
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
