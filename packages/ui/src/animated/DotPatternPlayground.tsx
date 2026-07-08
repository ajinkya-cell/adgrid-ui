"use client";

import React, { useState } from "react";
import { cn } from "../lib/utils";
import { DotPattern } from "./DotPattern";

export interface DotPatternPlaygroundProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultPreset?: string;
}

interface Preset {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  cr: number;
  color: string;
  opacity: number;
  spotlight: boolean;
  description: string;
}

const PRESETS: Record<string, Preset> = {
  default: {
    name: "Subtle Grid",
    width: 16,
    height: 16,
    x: 0,
    y: 0,
    cr: 1.2,
    color: "#ffffff",
    opacity: 0.15,
    spotlight: false,
    description: "Standard clean background dots, perfect for modern sleek interfaces.",
  },
  dense: {
    name: "Micro Mesh",
    width: 8,
    height: 8,
    x: 0,
    y: 0,
    cr: 0.8,
    color: "#10B981",
    opacity: 0.22,
    spotlight: false,
    description: "Tight emerald weave generating a raw hardware canvas grid texture.",
  },
  constellation: {
    name: "Space Sparse",
    width: 32,
    height: 32,
    x: 0,
    y: 0,
    cr: 1.6,
    color: "#3b82f6",
    opacity: 0.35,
    spotlight: true,
    description: "Wide cobalt constellation grid mapping dots that follow your cursor.",
  },
  slanted: {
    name: "Off-Axis Offset",
    width: 20,
    height: 20,
    x: 10,
    y: 10,
    cr: 1.2,
    color: "#fbbf24",
    opacity: 0.28,
    spotlight: true,
    description: "Amber particles shifted off-grid, dynamic under spotlight reveal.",
  },
};

const SWATCHES = [
  { label: "White", hex: "#ffffff" },
  { label: "Emerald", hex: "#10B981" },
  { label: "Cyan", hex: "#06b6d4" },
  { label: "Blue", hex: "#3b82f6" },
  { label: "Amber", hex: "#fbbf24" },
  { label: "Magenta", hex: "#d946ef" },
  { label: "Crimson", hex: "#ef4444" },
];

export const DotPatternPlayground: React.FC<DotPatternPlaygroundProps> = ({
  className,
  defaultPreset = "default",
  ...props
}) => {
  const initialPreset = PRESETS[defaultPreset] || PRESETS.default!;
  const [preset, setPreset] = useState<string>(defaultPreset);
  const [width, setWidth] = useState<number>(initialPreset.width);
  const [height, setHeight] = useState<number>(initialPreset.height);
  const [x, setX] = useState<number>(initialPreset.x);
  const [y, setY] = useState<number>(initialPreset.y);
  const [cr, setCr] = useState<number>(initialPreset.cr);
  const [color, setColor] = useState<string>(initialPreset.color);
  const [opacity, setOpacity] = useState<number>(initialPreset.opacity);
  const [spotlight, setSpotlight] = useState<boolean>(initialPreset.spotlight);
  const [spotlightRadius, setSpotlightRadius] = useState<number>(200);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const applyPreset = (key: string) => {
    const config = PRESETS[key];
    if (!config) return;
    setPreset(key);
    setWidth(config.width);
    setHeight(config.height);
    setX(config.x);
    setY(config.y);
    setCr(config.cr);
    setColor(config.color);
    setOpacity(config.opacity);
    setSpotlight(config.spotlight);
  };

  const cellWidth = width;
  const sampleWidth = 1200;
  const sampleHeight = 1200;
  const colsCount = Math.ceil(sampleWidth / cellWidth);
  const rowsCount = Math.ceil(sampleHeight / cellWidth);
  const totalDots = colsCount * rowsCount;

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-between bg-[#070708] select-none overflow-hidden p-8 md:p-16",
        className
      )}
      {...props}
    >
      {styleTag}

      {/* SVG Background Layer */}
      <DotPattern
        width={width}
        height={height}
        x={x}
        y={y}
        cr={cr}
        className="absolute inset-0 z-0 transition-all duration-75"
        style={{
          fill: color,
          opacity: opacity,
          ...(spotlight
            ? {
                maskImage: `radial-gradient(circle ${spotlightRadius}px at ${mousePos.x}px ${mousePos.y}px, black 25%, transparent 100%)`,
                WebkitMaskImage: `radial-gradient(circle ${spotlightRadius}px at ${mousePos.x}px ${mousePos.y}px, black 25%, transparent 100%)`,
              }
            : {}),
        }}
      />

      {/* Ambient Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.92) 100%)" }} />

      {/* Left Column: Visual description & Telemetry log */}
      <div className="relative z-10 flex flex-col justify-between w-full lg:max-w-sm space-y-6 mb-8 lg:mb-0">
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-[#a78bfa] tracking-[0.25em] uppercase font-bold">
            GRID SPECTROMETER
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">
            Dot Pattern
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-xs font-sans">
            SVG-based procedural grid pattern featuring offset offsets, dynamic radii, custom colors, and interactive spotlight masking.
          </p>
        </div>

        {/* Telemetry panel (styled exactly like the PropsTweaker Card with bevel highlights) */}
        <div
          className="p-5 rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 backdrop-blur-2xl font-mono text-[11px] text-[#8e8e93] space-y-2.5"
          style={{
            backgroundColor: "#171717",
            boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
          }}
        >
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">RENDER METHOD:</span>
            <span className="text-white font-bold">SVG DEF PATTERN</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">DOT COLOR:</span>
            <span className="text-white uppercase font-bold" style={{ color }}>{color}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">PATTERN DIM:</span>
            <span className="text-white">{width}px × {height}px</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">DOT SIZE (R):</span>
            <span className="text-white">{cr}px</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">EST DENSITY:</span>
            <span className="text-white tabular-nums">{totalDots.toLocaleString()} DOTS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">SPOTLIGHT RADIUS:</span>
            <span className={cn("font-bold text-white")}>
              {spotlight ? `${spotlightRadius}px` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Controller dashboard (styled with PropsTweaker 3D bevel box-shadow & border) */}
      <div
        className="relative z-10 w-full lg:max-w-md p-6 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 rounded-2xl backdrop-blur-2xl flex flex-col gap-6"
        style={{
          backgroundColor: "#171717",
          boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
        }}
      >
        {/* Preset Selector */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase font-bold">
            Grid Presets
          </span>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={cn(
                  "py-2 px-1 text-[10px] font-mono rounded border transition-all text-center leading-none",
                  preset === key
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "bg-white/[0.03] text-neutral-300 border-white/[0.05] hover:bg-white/[0.08]"
                )}
              >
                {PRESETS[key]!.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom description of the preset */}
        <div className="text-[11px] text-neutral-400 italic bg-white/[0.02] p-3 rounded-lg border border-white/[0.06] leading-relaxed font-sans">
          {PRESETS[preset]?.description}
        </div>

        {/* Color swatch selector */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase font-bold">
            Grid Swatches
          </span>
          <div className="flex flex-wrap gap-2.5">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                onClick={() => {
                  setPreset("custom");
                  setColor(swatch.hex);
                }}
                className={cn(
                  "w-7 h-7 rounded-full border transition-transform hover:scale-110 active:scale-95 flex items-center justify-center",
                  color.toLowerCase() === swatch.hex.toLowerCase()
                    ? "border-white scale-105"
                    : "border-transparent"
                )}
                style={{ backgroundColor: swatch.hex }}
                title={swatch.label}
              >
                {color.toLowerCase() === swatch.hex.toLowerCase() && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black/60 mix-blend-difference" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders grid */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase font-bold">
            Manual Tuning
          </span>

          <div className="grid grid-cols-2 gap-4">
            {/* Pattern Width */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300 leading-none">
                <span>Pattern Width</span>
                <span className="font-mono text-neutral-400">{width}px</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                step={2}
                value={width}
                onChange={(e) => {
                  setPreset("custom");
                  const val = Number(e.target.value);
                  setWidth(val);
                }}
                className="w-full custom-slider accent-white"
              />
            </div>

            {/* Pattern Height */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300 leading-none">
                <span>Pattern Height</span>
                <span className="font-mono text-neutral-400">{height}px</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                step={2}
                value={height}
                onChange={(e) => {
                  setPreset("custom");
                  const val = Number(e.target.value);
                  setHeight(val);
                }}
                className="w-full custom-slider accent-white"
              />
            </div>

            {/* X Offset */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300 leading-none">
                <span>X Offset</span>
                <span className="font-mono text-neutral-400">{x}px</span>
              </div>
              <input
                type="range"
                min={-32}
                max={32}
                step={1}
                value={x}
                onChange={(e) => {
                  setPreset("custom");
                  setX(Number(e.target.value));
                }}
                className="w-full custom-slider accent-white"
              />
            </div>

            {/* Y Offset */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300 leading-none">
                <span>Y Offset</span>
                <span className="font-mono text-neutral-400">{y}px</span>
              </div>
              <input
                type="range"
                min={-32}
                max={32}
                step={1}
                value={y}
                onChange={(e) => {
                  setPreset("custom");
                  setY(Number(e.target.value));
                }}
                className="w-full custom-slider accent-white"
              />
            </div>

            {/* Dot Radius CR */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300 leading-none">
                <span>Dot Radius (R)</span>
                <span className="font-mono text-neutral-400">{cr}px</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={12.0}
                step={0.1}
                value={cr}
                onChange={(e) => {
                  setPreset("custom");
                  setCr(Number(e.target.value));
                }}
                className="w-full custom-slider accent-white"
              />
            </div>

            {/* Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300 leading-none">
                <span>Opacity</span>
                <span className="font-mono text-neutral-400">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.0}
                step={0.05}
                value={opacity}
                onChange={(e) => {
                  setPreset("custom");
                  setOpacity(Number(e.target.value));
                }}
                className="w-full custom-slider accent-white"
              />
            </div>
          </div>

          {/* Spotlight reveal section */}
          <div className="space-y-3.5 border-t border-white/[0.06] pt-4 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300">Spotlight Reveal Tracking</span>
              <button
                onClick={() => {
                  setPreset("custom");
                  setSpotlight(!spotlight);
                }}
                className={cn(
                  "px-3 py-1 text-[10px] font-mono border rounded transition-all leading-none",
                  spotlight
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/35 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    : "bg-white/[0.02] text-neutral-500 border-white/5"
                )}
              >
                {spotlight ? "SPOTLIGHT: ON" : "SPOTLIGHT: OFF"}
              </button>
            </div>

            {spotlight && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-neutral-300 leading-none">
                  <span>Spotlight Radius</span>
                  <span className="font-mono text-neutral-400">{spotlightRadius}px</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={450}
                  step={10}
                  value={spotlightRadius}
                  onChange={(e) => {
                    setSpotlightRadius(Number(e.target.value));
                  }}
                  className="w-full custom-slider accent-white"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const styleTag = (
  <style dangerouslySetInnerHTML={{ __html: `
    .custom-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.08);
      outline: none;
      transition: background 0.15s;
    }
    .custom-slider:hover {
      background: rgba(255,255,255,0.15);
    }
    .custom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
      transition: transform 0.1s;
    }
    .custom-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
  `}} />
);

DotPatternPlayground.displayName = "DotPatternPlayground";
