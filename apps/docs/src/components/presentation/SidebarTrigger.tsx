"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";
import { VoidButton } from "@adgrid-ui/ui";
import { usePresentationStore } from "@/lib/presentation/store";

export function SidebarTrigger() {
  const sidebarOpen = usePresentationStore((state) => state.sidebarOpen);
  const sidebarTab = usePresentationStore((state) => state.sidebarTab);
  const toggleSidebar = usePresentationStore((state) => state.toggleSidebar);
  const setSidebarTab = usePresentationStore((state) => state.setSidebarTab);
  const openSidebarTab = usePresentationStore((state) => state.openSidebarTab);

  const [hovered, setHovered] = useState(false);
  const [needleAngle, setNeedleAngle] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isCodeActive = sidebarOpen && sidebarTab === "code";
  const [animKey, setAnimKey] = useState(0);

  const lastTriggerRef = useRef(0);
  const triggerIconAnimation = useCallback(() => {
    const now = Date.now();
    if (now - lastTriggerRef.current < 200) return;
    lastTriggerRef.current = now;
    setAnimKey((k) => k + 1);
  }, []);

  // Trigger animation whenever Code Studio is opened OR closed
  const prevCodeActiveRef = useRef(isCodeActive);
  useEffect(() => {
    if (prevCodeActiveRef.current !== isCodeActive) {
      triggerIconAnimation();
    }
    prevCodeActiveRef.current = isCodeActive;
  }, [isCodeActive, triggerIconAnimation]);

  // Global mouse tracking across the presentation screen to orient the magnetic needle
  useEffect(() => {
    if (sidebarOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const rad = Math.atan2(dy, dx);
      const deg = rad * (180 / Math.PI);

      // Needle dark tip points North (0 deg) initially.
      // Offset by 90 deg so dark pointer turns directly towards the cursor.
      const targetDeg = deg + 90;

      // Shortest angle unwrapping to prevent 360-degree flip artifacts
      setNeedleAngle((prev) => {
        let diff = (targetDeg - prev) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return prev + diff;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [sidebarOpen]);

  // Subtle 3D perspective tilt on hover over the compass button
  const handleButtonMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxTilt = 9; // subtle, tasteful degree limit
    setTilt({
      x: -(y / (rect.height / 2)) * maxTilt,
      y: (x / (rect.width / 2)) * maxTilt,
    });
  }, []);

  const handleButtonMouseLeave = useCallback(() => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  // Compass button click -> Navigator tab
  const handleCompassClick = () => {
    if (!sidebarOpen) {
      openSidebarTab("navigator");
    } else {
      if (sidebarTab !== "navigator") {
        setSidebarTab("navigator");
      } else {
        toggleSidebar();
      }
    }
  };

  // White circular Code button click -> Toggle between Code panel and Navigator
  const handleCodeClick = () => {
    triggerIconAnimation();
    if (!sidebarOpen) {
      openSidebarTab("code");
    } else {
      if (sidebarTab !== "code") {
        setSidebarTab("code");
      } else {
        setSidebarTab("navigator");
      }
    }
  };

  // Target angle: when code panel is open, point East (90 deg) towards the code panel
  const activeAngle = isCodeActive ? 90 : (sidebarOpen ? 45 : needleAngle);

  return (
    <div className="fixed left-6 top-6 z-50 select-none flex items-center gap-3">
      {/* 1. Skeuomorphic Compass Button */}
      <motion.button
        ref={buttonRef}
        onClick={handleCompassClick}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleButtonMouseMove}
        onMouseLeave={handleButtonMouseLeave}
        className="relative flex h-12 w-12 items-center justify-center rounded-full cursor-pointer group"
        style={{
          perspective: 800,
          backgroundColor: "#0a0a0a",
          boxShadow: sidebarOpen && sidebarTab === "navigator"
            ? "0 0 24px rgba(139,92,246,0.35), 0 10px 25px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15)"
            : hovered
            ? "0 0 16px rgba(139,92,246,0.25), 0 8px 20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.12)"
            : "0 8px 20px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.93 }}
        aria-label={sidebarOpen && sidebarTab === "navigator" ? "Close navigator" : "Open navigator"}
        type="button"
      >
        {/* Ambient Magnetic Wave Ring */}
        <motion.div
          className="absolute -inset-1.5 rounded-full pointer-events-none"
          transition={{
            repeat: Infinity,
            duration: sidebarOpen ? 2.5 : 4,
            ease: "easeInOut",
          }}
        />

        {/* 3D Tilt Wrapper for the Dial and Needle */}
        <motion.div
          className="relative flex h-full w-full items-center justify-center rounded-full overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            rotateX: tilt.x,
            rotateY: tilt.y,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 24,
          }}
        >
          {/* Skeuomorphic Base Dial Plate */}
          <Image
            src="/previews/base3.png"
            alt="Compass base"
            width={48}
            height={48}
            priority
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
          />

          {/* 3D Floating Needle with Spring Magnetic Tilt */}
          <motion.div
            className="absolute flex items-center justify-center -translate-y-[1px] pointer-events-none select-none"
            style={{
              width: "24px",
              height: "36px",
              transformStyle: "preserve-3d",
              transformOrigin: "49% 51.7%",
              filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.7))",
            }}
            animate={{
              rotate: activeAngle,
              z: 6,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 14,
              mass: 0.5,
            }}
          >
            <Image
              src="/previews/needle2.png"
              alt="Compass needle"
              width={24}
              height={36}
              priority
              draggable={false}
              className="h-full w-full object-contain pointer-events-none select-none"
            />
          </motion.div>
        </motion.div>
      </motion.button>

      {/* 2. VoidButton Pill: "Visit Code" with Code2 icon (Right to the Compass, only visible when sidebar is open) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative flex items-center justify-center"
          >
            

            <VoidButton
              variant="default"
              style="pill"
              onClick={handleCodeClick}
              className={`h-11 px-5 rounded-full flex items-center gap-2.5 cursor-pointer select-none transition-all ${
                isCodeActive
                  ? "border-violet-500/50 text-white shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                  : ""
              }`}
              type="button"
              aria-label={isCodeActive ? "Close Code Studio" : "Visit Code Studio"}
            >
              <span className="font-poppins text-xs font-semibold tracking-wide">
                Visit Code
              </span>
              <Code2
                key={animKey}
                className={`h-4 w-4 stroke-[2.2] pointer-events-none shrink-0 ${
                  animKey > 0 ? "animate-code-slash" : ""
                }`}
              />
            </VoidButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
