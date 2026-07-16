"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface ButtonAlphaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shape?: "pill" | "full" | "square";
  theme?: "charcoal" | "danger" | "tactical";
  children?: React.ReactNode;
}

export function ButtonAlpha({
  className,
  shape = "pill",
  theme = "charcoal",
  children,
  ...props
}: ButtonAlphaProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Inject Geist Pixel Google Font on mount (only once)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const fontId = "google-font-geistpixel";
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Geist+Pixel&display=swap";
        document.head.appendChild(link);
      }
    }
  }, []);

  // Stiff spring-like behavior for realistic physical microswitch resistance
  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 24,
  };

  // Border radius map
  const roundedClasses = {
    pill: "rounded-lg",      // 8px equivalent
    full: "rounded-full",    // Full pill shape
    square: "rounded-none",  // Sharp edges
  };

  const roundedClass = roundedClasses[shape];

  // Theme-specific color parameters
  const themeStyles = {
    charcoal: {
      bgColor: "#171717",
      textColor: "text-neutral-300",
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
      borderSides: "1px solid rgba(255, 255, 255, 0.02)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      shadowNormal: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4)",
      shadowHover: "inset 0 1.8px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.35)",
      shadowTap: "inset 0 0.5px 0 0 rgba(255, 255, 255, 0.03), inset 0 -3.5px 0 0 rgba(0, 0, 0, 0.6)",
    },
    danger: {
      bgColor: "#261313",
      textColor: "text-red-400",
      borderTop: "1px solid rgba(239, 68, 68, 0.3)",
      borderSides: "1px solid rgba(239, 68, 68, 0.05)",
      borderBottom: "1px solid rgba(239, 68, 68, 0.15)",
      shadowNormal: "inset 0 1.5px 0 0 rgba(239, 68, 68, 0.15), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.5)",
      shadowHover: "inset 0 1.8px 0 0 rgba(239, 68, 68, 0.2), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45)",
      shadowTap: "inset 0 0.5px 0 0 rgba(239, 68, 68, 0.05), inset 0 -3.5px 0 0 rgba(0, 0, 0, 0.7)",
    },
    tactical: {
      bgColor: "#121e16",
      textColor: "text-green-400",
      borderTop: "1px solid rgba(34, 197, 94, 0.3)",
      borderSides: "1px solid rgba(34, 197, 94, 0.05)",
      borderBottom: "1px solid rgba(34, 197, 94, 0.15)",
      shadowNormal: "inset 0 1.5px 0 0 rgba(34, 197, 94, 0.15), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.5)",
      shadowHover: "inset 0 1.8px 0 0 rgba(34, 197, 94, 0.2), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45)",
      shadowTap: "inset 0 0.5px 0 0 rgba(34, 197, 94, 0.05), inset 0 -3.5px 0 0 rgba(0, 0, 0, 0.7)",
    },
  };

  const styleConfig = themeStyles[theme];

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{
        y: 4,
        scale: 0.96,
      }}
      transition={springTransition}
      className={cn(
        "relative w-48 h-12 font-medium cursor-pointer select-none overflow-hidden outline-none transition-shadow duration-300",
        roundedClass,
        className
      )}
      style={{
        backgroundColor: styleConfig.bgColor,
        boxShadow: isHovered
          ? "0 35px 90px rgba(0, 0, 0, 0.7)"
          : "0 30px 80px rgba(0, 0, 0, 0.6)",
      }}
      {...(props as any)}
    >
      {/* Bevel Border Ring (Skeuomorphic Light Leaks along the border paths) */}
      <div
        className={cn("absolute inset-0 pointer-events-none", roundedClass)}
        style={{
          borderTop: styleConfig.borderTop,
          borderLeft: styleConfig.borderSides,
          borderRight: styleConfig.borderSides,
          borderBottom: styleConfig.borderBottom,
        }}
      />

      {/* Matte Charcoal Face Overlay with reactive inset gloss/occlusion highlights */}
      <motion.div
        className={cn("absolute pointer-events-none",
          shape === "pill" && "inset-[1px] rounded-[7px]",
          shape === "full" && "inset-[1px] rounded-full",
          shape === "square" && "inset-[1px] rounded-none"
        )}
        style={{
          backgroundColor: styleConfig.bgColor,
        }}
        animate={{
          boxShadow: isHovered ? styleConfig.shadowHover : styleConfig.shadowNormal,
        }}
        whileTap={{
          boxShadow: styleConfig.shadowTap,
        }}
        transition={springTransition}
      />

      {/* Embedded Typographic Label (in Geist Pixel from Google Fonts) */}
      <span
        className={cn(
          "relative z-10 flex items-center justify-center h-full tracking-[0.12em] text-[13px] uppercase pointer-events-none select-none",
          styleConfig.textColor
        )}
        style={{
          fontFamily: '"Geist Pixel", monospace',
        }}
      >
        {children || "ACTIVATE"}
      </span>
    </motion.button>
  );
}
