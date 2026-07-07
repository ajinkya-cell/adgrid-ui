"use client";

import React, { useRef, useState, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { ScrollPathContext } from "./ScrollPathContext";

export interface ScrollPathContainerProps {
  mode?: "scroll-jack" | "passive";
  sensitivity?: number; // Higher value means faster progress per scroll tick
  scrollLength?: number; // Custom pixel length to complete animation in scroll-jack mode
  children: React.ReactNode;
  className?: string;
}

export default function ScrollPathContainer({
  mode = "scroll-jack",
  sensitivity = 1,
  scrollLength,
  children,
  className = "",
}: ScrollPathContainerProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const accumulatedRef = useRef(0);
  const lockRef = useRef(true);
  const touchStartRef = useRef(0);

  // Framer motion scroll hook for passive mode
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Track framer-motion scroll progress under passive mode
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (mode === "passive") {
      setScrollProgress(latest);
    }
  });

  useEffect(() => {
    if (mode !== "scroll-jack") {
      // Clean up body overflow if changing modes
      document.body.style.overflow = "";
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Reset lock on mount/reset
    lockRef.current = true;
    accumulatedRef.current = 0;
    setScrollProgress(0);
    document.body.style.overflow = "hidden";

    const targetScrollHeight = scrollLength || window.innerHeight;

    const handleWheel = (e: WheelEvent) => {
      // If we are at the top of the page (window.scrollY === 0) and scrolling up,
      // re-lock scroll so we can reverse the drawing.
      if (!lockRef.current && window.scrollY === 0 && e.deltaY < 0) {
        lockRef.current = true;
        document.body.style.overflow = "hidden";
        accumulatedRef.current = targetScrollHeight;
      }

      if (!lockRef.current) return;

      const prev = accumulatedRef.current;
      const next = Math.max(0, Math.min(targetScrollHeight, prev + e.deltaY * sensitivity));
      accumulatedRef.current = next;
      const progress = next / targetScrollHeight;
      setScrollProgress(progress);

      // Unlock when drawing completes scrolling down
      if (next >= targetScrollHeight && e.deltaY > 0 && prev >= targetScrollHeight) {
        lockRef.current = false;
        document.body.style.overflow = "";
        return;
      }

      // Unlock when drawing goes back to zero and scrolling up
      if (next <= 0 && e.deltaY < 0 && prev <= 0) {
        lockRef.current = false;
        document.body.style.overflow = "";
        return;
      }

      if (lockRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Re-lock if scrolled back to top of the screen and dragging down (scroll up)
      if (!lockRef.current && window.scrollY === 0 && touchStartRef.current - e.touches[0].clientY < 0) {
        lockRef.current = true;
        document.body.style.overflow = "hidden";
        accumulatedRef.current = targetScrollHeight;
      }

      if (!lockRef.current) return;

      const deltaY = (touchStartRef.current - e.touches[0].clientY) * sensitivity;
      touchStartRef.current = e.touches[0].clientY;

      if (Math.abs(deltaY) < 1) return;

      const prev = accumulatedRef.current;
      const next = Math.max(0, Math.min(targetScrollHeight, prev + deltaY));
      accumulatedRef.current = next;
      const progress = next / targetScrollHeight;
      setScrollProgress(progress);

      if (next >= targetScrollHeight && deltaY > 0 && prev >= targetScrollHeight) {
        lockRef.current = false;
        document.body.style.overflow = "";
        return;
      }

      if (next <= 0 && deltaY < 0 && prev <= 0) {
        lockRef.current = false;
        document.body.style.overflow = "";
        return;
      }

      if (lockRef.current) {
        e.preventDefault();
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    // Lock scroll immediately on load
    document.body.style.overflow = "hidden";

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      document.body.style.overflow = "";
    };
  }, [mode, sensitivity, scrollLength]);

  return (
    <ScrollPathContext.Provider value={{ scrollProgress }}>
      <div
        ref={containerRef}
        className={`w-full relative ${
          mode === "scroll-jack" ? "min-h-screen flex items-center justify-center" : ""
        } ${className}`}
      >
        {children}
      </div>
    </ScrollPathContext.Provider>
  );
}
