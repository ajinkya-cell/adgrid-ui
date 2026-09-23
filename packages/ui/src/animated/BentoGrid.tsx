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

  return (
    <div
      onMouseMove={variant === "beveled" ? undefined : handleMouseMove}
      className={cn(
        "group relative z-10 flex flex-col justify-between overflow-hidden rounded-xl p-5 select-none motion-reduce:transition-none motion-reduce:transform-none",
        variant === "beveled" &&
          "bg-[#161616] transition-transform duration-300 hover:-translate-y-1 border-t border-t-white/20 border-x border-x-white/5 border-b border-b-black/80 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_4px_6px_-1px_rgba(0,0,0,0.8),0_15px_35px_rgba(0,0,0,0.65)]",
        variant === "radiant" &&
          "border border-white/10 bg-[#0d0d0d] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.85)] transition-transform duration-300 hover:-translate-y-1",
        className
      )}
      style={{ fontFamily: "var(--font-inter-loaded, Inter), Inter, sans-serif" }}
    >
      {variant === "radiant" && (
        <>
          <div
            className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            style={{
              background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.75), transparent 100%)`,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            style={{
              background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.08), transparent 80%)`,
            }}
          />
        </>
      )}

      <header className="relative z-10 mb-5 flex min-h-6 items-center">
        <BentoBrandIcon icon={icon} />
      </header>

      {/* Optional Custom Preview Slot */}
      {children && <div className="relative z-10 mb-4">{children}</div>}

      <div className="relative z-10">
        <h3
          className={cn(
            "mb-1.5 text-lg font-bold tracking-tight text-white transition-colors duration-200",
            variant === "radiant" && "group-hover:text-purple-200",
            "motion-reduce:transition-none"
          )}
        >
          {title}
        </h3>
        <p className="text-xs font-normal leading-relaxed text-neutral-400">
          {description}
        </p>
      </div>

      {variant === "beveled" && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-transparent transition-colors duration-300 group-hover:border-white/15 motion-reduce:transition-none" />
      )}
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

// Official brand and framework SVG icons.
function BentoBrandIcon({ icon }: { icon: BentoIconType }) {
  switch (icon) {
    case "nextjs":
      return <NextjsOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "github":
      return <GithubOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "react":
      return <ReactOriginal size={24} className="transition-transform duration-700 ease-out group-hover:rotate-180 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "typescript":
      return <TypescriptOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "tailwind":
      return <TailwindcssOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "redis":
      return <RedisOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "postgres":
      return <PostgresqlOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "graphql":
      return <GraphqlPlain size={24} className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-45 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "nodejs":
      return <NodejsOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "python":
      return <PythonOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
    case "docker":
    default:
      return <DockerOriginal size={24} className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" />;
  }
}
