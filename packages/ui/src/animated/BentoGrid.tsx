"use client";

import React, { useState } from "react";
import { cn } from "../lib/utils";

export type BentoIconType =
  | "nextjs"
  | "github"
  | "express"
  | "react"
  | "typescript"
  | "tailwind"
  | "redis"
  | "postgres"
  | "graphql"
  | "nodejs"
  | "python"
  | "docker";

export type BentoGridVariant = "beveled" | "radiant";

export interface BentoGridItemProps {
  title: string;
  description: string;
  className?: string;
  icon?: BentoIconType;
  variant?: BentoGridVariant;
  iconBg?: string;
  children?: React.ReactNode;
}

export interface BentoGridProps {
  children: React.ReactNode;
  variant?: BentoGridVariant;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-3.5 w-full max-w-7xl mx-auto p-3", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({
  title,
  description,
  className,
  icon = "nextjs",
  variant = "beveled",
  iconBg,
  children,
}: BentoGridItemProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // ─── Variant 2: Radiant Cursor Edge Glow (Minimal, Edge Beam, Spotlight) ───
  if (variant === "radiant") {
    return (
      <div
        onMouseMove={handleMouseMove}
        className={cn(
          "group relative overflow-hidden rounded-xl bg-[#0d0d0d] p-5 flex flex-col justify-between select-none border border-white/10",
          "transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.95)]",
          className
        )}
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        {/* Dynamic Edge Radiance Overlay - Light Beam Tracks Cursor on Card Border */}
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.75), transparent 100%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />

        {/* Interior Cursor Spotlight Aura */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.08), transparent 80%)`,
          }}
        />

        {/* Top Header: Inset Socket & Brand Icon */}
        <div className="flex items-center justify-between mb-5 z-10">
          <div
            className={cn(
              "relative flex items-center justify-center w-11 h-11 rounded-lg bg-[#141414] border border-white/10 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:border-purple-400/40",
              iconBg
            )}
          >
            <BentoBrandIcon icon={icon} />
          </div>
        </div>

        {/* Optional Custom Preview Slot */}
        {children && <div className="mb-4 z-10">{children}</div>}

        {/* Minimal Copy Section in DM Sans */}
        <div className="z-10">
          <h3
            className="text-lg font-bold text-white mb-1.5 tracking-tight transition-colors duration-200 group-hover:text-purple-200"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            {title}
          </h3>
          <p
            className="text-xs text-neutral-400 leading-relaxed font-normal"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            {description}
          </p>
        </div>
      </div>
    );
  }

  // ─── Variant 1: 3D Skeuomorphic Bevel ───
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-[#161616] p-5 flex flex-col justify-between select-none",
        "transition-all duration-300 hover:-translate-y-1",
        "border-t border-t-white/20 border-x border-x-white/5 border-b border-b-black/80",
        "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_4px_6px_-1px_rgba(0,0,0,0.8),0_15px_35px_rgba(0,0,0,0.65)]",
        "hover:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.22),0_20px_45px_rgba(0,0,0,0.85)]",
        className
      )}
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      {/* Top Header: Inset Socket Well & Colorful Brand Icon (No Dot) */}
      <div className="flex items-center justify-between mb-5 z-10">
        <div
          className={cn(
            "relative flex items-center justify-center w-11 h-11 rounded-lg bg-[#080808] border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:scale-105",
            iconBg
          )}
        >
          <BentoBrandIcon icon={icon} />
        </div>
      </div>

      {/* Optional Custom Preview Slot */}
      {children && <div className="mb-4 z-10">{children}</div>}

      {/* Minimal Copy Section: Title & Description explicitly in DM Sans */}
      <div className="z-10">
        <h3
          className="text-lg font-bold text-white mb-1.5 tracking-tight transition-colors duration-200 group-hover:text-white"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          {title}
        </h3>
        <p
          className="text-xs text-neutral-400 leading-relaxed font-normal"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          {description}
        </p>
      </div>

      {/* Subtle Outer Bevel Glow on Hover */}
      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/15 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

// ─── Vibrant Official Colorful Brand & Framework SVG Icons ───
function BentoBrandIcon({ icon }: { icon: BentoIconType }) {
  switch (icon) {
    case "nextjs":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 128 128"
          fill="none"
        >
          <circle cx="64" cy="64" r="64" fill="#000000" />
          <circle cx="64" cy="64" r="60" stroke="url(#nextjs-border)" strokeWidth="4" />
          <path
            d="M84.5 94.5L46.2 44.5H38v39h7.5V53.8l32.5 42.4h6.5z"
            fill="url(#nextjs-gradient)"
          />
          <path d="M78 44.5h7.5v39H78z" fill="#ffffff" />
          <defs>
            <linearGradient id="nextjs-gradient" x1="50" y1="44.5" x2="84.5" y2="94.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="nextjs-border" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "github":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
          viewBox="0 0 24 24"
          fill="#F0F6FC"
        >
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );

    case "express":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect width="24" height="24" rx="6" fill="#1C1C1C" />
          <path d="M4 14.5c.3.9 1.4 1.5 2.5 1.5 1.5 0 2.5-.8 2.5-2 0-2.2-3.8-1.5-3.8-3.7 0-1 1-1.8 2.3-1.8 1.2 0 2.2.6 2.5 1.5M10.5 8.8h7m-7 3.3h5.5m-5.5 3.4h7" stroke="#F7DF1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "react":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-700 ease-out group-hover:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
        >
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill="#61DAFB" />
        </svg>
      );

    case "typescript":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <path d="M11.5 11.5H7.5v1.8h1.1v5.2h1.8v-5.2h1.1v-1.8zm4.8 1.8c-.8 0-1.3.4-1.3.9 0 1.2 2.4.7 2.4 2.6 0 1.2-1 1.9-2.3 1.9-1.2 0-2.1-.6-2.4-1.6l1.3-.6c.2.6.6.9 1.1.9.5 0 .8-.3.8-.7 0-1.2-2.4-.7-2.4-2.6 0-1.2 1-1.9 2.2-1.9 1 0 1.8.4 2.1 1.3l-1.5.8z" fill="#FFFFFF" />
        </svg>
      );

    case "tailwind":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M12 6c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6 1 2.4 1.7C13.8 12 15.3 13.5 19 13.5c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-1-2.4-1.7C17 7.5 15.5 6 12 6zM6 13.5c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6 1 2.4 1.7C7.8 19.5 9.3 21 13 21c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-1-2.4-1.7-1.4-1.3-2.9-2.8-6.4-2.8z" fill="#38BDF8" />
        </svg>
      );

    case "redis":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M12 2L2 6.5l10 4.5 10-4.5L12 2z" fill="#DC382D" />
          <path d="M2 9.5l10 4.5v8L2 17.5v-8z" fill="#B82820" />
          <path d="M22 9.5l-10 4.5v8l10-4.5v-8z" fill="#E5453A" />
          <circle cx="12" cy="6.5" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
        </svg>
      );

    case "postgres":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <ellipse cx="12" cy="6" rx="8" ry="3" fill="#336791" />
          <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" fill="#336791" />
          <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" fill="#295275" />
          <ellipse cx="12" cy="6" rx="7" ry="2.2" stroke="#4B8bbe" strokeWidth="1" />
        </svg>
      );

    case "graphql":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45"
          viewBox="0 0 24 24"
          fill="none"
        >
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="#E10098" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="12,6 17,9 17,15 12,18 7,15 7,9" fill="#E10098" fillOpacity="0.2" stroke="#E10098" strokeWidth="1" />
          <circle cx="12" cy="2" r="1.5" fill="#E10098" />
          <circle cx="21" cy="7" r="1.5" fill="#E10098" />
          <circle cx="21" cy="17" r="1.5" fill="#E10098" />
          <circle cx="12" cy="22" r="1.5" fill="#E10098" />
          <circle cx="3" cy="17" r="1.5" fill="#E10098" />
          <circle cx="3" cy="7" r="1.5" fill="#E10098" />
        </svg>
      );

    case "nodejs":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M12 2L3.5 7v10L12 22l8.5-5V7L12 2z" fill="#339933" />
          <path d="M12 4.5l6.5 3.8v7.4L12 19.5 5.5 15.7V8.3L12 4.5z" fill="#5FA04E" />
          <path d="M12 8v8M8.5 10l7 4M15.5 10l-7 4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "python":
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M11.9 2c-5.2 0-4.9 2.3-4.9 2.3v2.4h5v.7H5.1S2 7 2 12.2s2.8 5 2.8 5h1.7v-2.4c0-2.8 2.4-2.8 2.4-2.8h4.9c2.4 0 2.4-2.3 2.4-2.3V4.3S17.1 2 11.9 2zm-2.6 1.6a.9.9 0 110 1.8.9.9 0 010-1.8z" fill="#3776AB" />
          <path d="M12.1 22c5.2 0 4.9-2.3 4.9-2.3v-2.4h-5v-.7h6.9s3.1.4 3.1-4.8-2.8-5-2.8-5h-1.7v2.4c0 2.8-2.4 2.8-2.4 2.8h-4.9c-2.4 0-2.4 2.3-2.4 2.3v5.4s-.9 2.3 4.3 2.3zm2.6-1.6a.9.9 0 110-1.8.9.9 0 010 1.8z" fill="#FFD43B" />
        </svg>
      );

    case "docker":
    default:
      return (
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M2.5 13.5c0-1.1.9-2 2-2h15c1.1 0 2 .9 2 2 0 4-3.5 7.5-9.5 7.5-5.5 0-9.5-3.5-9.5-7.5z" fill="#2496ED" />
          <rect x="5" y="8" width="2.5" height="2.5" rx="0.5" fill="#2496ED" />
          <rect x="8.5" y="8" width="2.5" height="2.5" rx="0.5" fill="#2496ED" />
          <rect x="12" y="8" width="2.5" height="2.5" rx="0.5" fill="#2496ED" />
          <rect x="8.5" y="4.5" width="2.5" height="2.5" rx="0.5" fill="#2496ED" />
          <rect x="12" y="4.5" width="2.5" height="2.5" rx="0.5" fill="#2496ED" />
          <rect x="15.5" y="8" width="2.5" height="2.5" rx="0.5" fill="#2496ED" />
        </svg>
      );
  }
}
