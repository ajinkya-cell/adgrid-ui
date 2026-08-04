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

import {
  ReactOriginal,
  NextjsOriginal,
  TypescriptOriginal,
  TailwindcssOriginal,
  NodejsOriginal,
  DockerOriginal,
  PythonOriginal,
  PostgresqlOriginal,
  RedisOriginal,
  GraphqlPlain,
  GithubOriginal,
} from "devicons-react";

// ─── Vibrant Official Colorful Brand & Framework SVG Icons ───
function BentoBrandIcon({ icon }: { icon: BentoIconType }) {
  switch (icon) {
    case "nextjs":
      return <NextjsOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
    case "github":
      return <GithubOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />;
    case "react":
      return <ReactOriginal size={24} className="transition-transform duration-700 ease-out group-hover:rotate-180" />;
    case "typescript":
      return <TypescriptOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
    case "tailwind":
      return <TailwindcssOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
    case "redis":
      return <RedisOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
    case "postgres":
      return <PostgresqlOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
    case "graphql":
      return <GraphqlPlain size={24} className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45" />;
    case "nodejs":
      return <NodejsOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
    case "python":
      return <PythonOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
    case "docker":
    default:
      return <DockerOriginal size={24} className="transition-transform duration-300 group-hover:scale-110" />;
  }
}
