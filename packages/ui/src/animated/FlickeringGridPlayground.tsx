"use client";

import React, { useState } from "react";
import { cn } from "../lib/utils";
import { FlickeringGrid } from "./FlickeringGrid";

export interface FlickeringGridPlaygroundProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultPreset?: string;
}

interface Preset {
  name: string;
  squareSize: number;
  gridGap: number;
  flickerChance: number;
  color: string;
  maxOpacity: number;
  description: string;
}

const PRESETS: Record<string, Preset> = {
  matrix: {
    name: "Matrix Stream",
    squareSize: 2,
    gridGap: 3,
    flickerChance: 0.6,
    color: "#10B981",
    maxOpacity: 0.45,
    description: "Deep green cascade grid mimicking scrolling computer terminals.",
  },
  cyberpunk: {
    name: "Neon Cyberpunk",
    squareSize: 3,
    gridGap: 5,
    flickerChance: 0.45,
    color: "#d946ef",
    maxOpacity: 0.5,
    description: "Highly active neon magenta cells creating a high-tech glowing noise.",
  },
  github: {
    name: "Commit History",
    squareSize: 10,
    gridGap: 3,
    flickerChance: 0.12,
    color: "#22c55e",
    maxOpacity: 0.8,
    description: "Standard green contribution tiles flickering in slow patterns.",
  },
  stardust: {
    name: "Gold Stardust",
    squareSize: 2,
    gridGap: 2,
    flickerChance: 0.35,
    color: "#fbbf24",
    maxOpacity: 0.65,
    description: "Ultra-dense Amber particles sparkling like cosmic nebula stars.",
  },
  onyx: {
    name: "Stealth Onyx",
    squareSize: 5,
    gridGap: 8,
    flickerChance: 0.08,
    color: "#3f3f46",
    maxOpacity: 0.18,
    description: "Extremely subtle dark gray blocks breathing slowly in the shadow.",
  },
  alert: {
    name: "Red Alert",
    squareSize: 6,
    gridGap: 6,
    flickerChance: 0.8,
    color: "#ef4444",
    maxOpacity: 0.7,
    description: "Violent emergency warning status indicator with high flicker rates.",
  },
};

const SWATCHES = [
  { label: "Emerald", hex: "#10B981" },
  { label: "Magenta", hex: "#d946ef" },
  { label: "Cyan", hex: "#06b6d4" },
  { label: "Amber", hex: "#fbbf24" },
  { label: "Crimson", hex: "#ef4444" },
  { label: "Zinc", hex: "#52525b" },
  { label: "White", hex: "#ffffff" },
];

export const FlickeringGridPlayground: React.FC<FlickeringGridPlaygroundProps> = ({
  className,
  defaultPreset = "matrix",
  ...props
}) => {
  const initialPreset = PRESETS[defaultPreset] || PRESETS.matrix!;
  const [preset, setPreset] = useState<string>(defaultPreset);
  const [squareSize, setSquareSize] = useState<number>(initialPreset.squareSize);
  const [gridGap, setGridGap] = useState<number>(initialPreset.gridGap);
  const [flickerChance, setFlickerChance] = useState<number>(initialPreset.flickerChance);
  const [color, setColor] = useState<string>(initialPreset.color);
  const [maxOpacity, setMaxOpacity] = useState<number>(initialPreset.maxOpacity);

  const applyPreset = (key: string) => {
    const config = PRESETS[key];
    if (!config) return;
    setPreset(key);
    setSquareSize(config.squareSize);
    setGridGap(config.gridGap);
    setFlickerChance(config.flickerChance);
    setColor(config.color);
    setMaxOpacity(config.maxOpacity);
  };

  // Compute stats for playground telemetry
  const cellWidth = squareSize + gridGap;
  const sampleWidth = 1000;
  const sampleHeight = 1000;
  const cols = Math.ceil(sampleWidth / cellWidth);
  const rows = Math.ceil(sampleHeight / cellWidth);
  const totalCells = cols * rows;

  return (
    <div
      className={cn(
        "relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-between bg-[#070708] select-none overflow-hidden p-8 md:p-16",
        className
      )}
      {...props}
    >
      {styleTag}

      {/* Background canvas layer - stretches completely edge-to-edge */}
      <FlickeringGrid
        key={`${squareSize}-${gridGap}-${color}-${maxOpacity}`}
        className="absolute inset-0 z-0 opacity-100"
        squareSize={squareSize}
        gridGap={gridGap}
        flickerChance={flickerChance}
        color={color}
        maxOpacity={maxOpacity}
      />

      {/* Ambient Vignette & Space Gradient */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-t from-black via-black/40 to-black/20" />
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.92) 100%)" }} />

      {/* Left Column: Visual description & Telemetry log */}
      <div className="relative z-10 flex flex-col justify-between w-full lg:max-w-sm space-y-6 mb-8 lg:mb-0">
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-emerald-400 tracking-[0.25em] uppercase font-bold">
            GRID SPECTROMETER
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">
            Flickering Grid
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-xs font-sans">
            Interactive canvas simulator exploring frame-rate independent particle grids, custom gaps, and randomized opacities.
          </p>
        </div>

        {/* Telemetry panel (styled exactly like the PropsTable / PropsTweaker Card with bevel highlights) */}
        <div
          className="p-5 rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 backdrop-blur-2xl font-mono text-[11px] text-[#8e8e93] space-y-2.5"
          style={{
            backgroundColor: "#171717",
            boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
          }}
        >
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">ENGINE:</span>
            <span className="text-white font-bold">HTML5 CANVAS 2D</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">COLOR SPACE:</span>
            <span className="text-white uppercase font-bold" style={{ color }}>{color}</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">CELL SCALE:</span>
            <span className="text-white">{squareSize}px (gap {gridGap}px)</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-2">
            <span className="text-neutral-500">EST DENSITY:</span>
            <span className="text-white tabular-nums">{totalCells.toLocaleString()} NODES</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">STATUS:</span>
            <span className="text-emerald-400 animate-pulse font-bold">ACTIVE // 60 FPS</span>
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
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={cn(
                  "py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center leading-none",
                  preset === key
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "bg-white/[0.03] text-neutral-300 border-white/[0.05] hover:bg-white/[0.08]"
                )}
              >
                {PRESETS[key]!.name.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Custom description of the preset */}
        <div className="text-[11px] text-neutral-400 italic bg-white/[0.02] p-3 rounded-lg border border-white/[0.06] leading-relaxed">
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

          {/* Square Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-300 leading-none">
              <span>Square Size</span>
              <span className="font-mono text-neutral-400">{squareSize}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={squareSize}
              onChange={(e) => {
                setPreset("custom");
                setSquareSize(Number(e.target.value));
              }}
              className="w-full custom-slider accent-white"
            />
          </div>

          {/* Grid Gap */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-300 leading-none">
              <span>Grid Gap</span>
              <span className="font-mono text-neutral-400">{gridGap}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={gridGap}
              onChange={(e) => {
                setPreset("custom");
                setGridGap(Number(e.target.value));
              }}
              className="w-full custom-slider accent-white"
            />
          </div>

          {/* Flicker Chance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-300 leading-none">
              <span>Flicker Chance</span>
              <span className="font-mono text-neutral-400">{Math.round(flickerChance * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={1.0}
              step={0.01}
              value={flickerChance}
              onChange={(e) => {
                setPreset("custom");
                setFlickerChance(Number(e.target.value));
              }}
              className="w-full custom-slider accent-white"
            />
          </div>

          {/* Max Opacity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-300 leading-none">
              <span>Max Opacity</span>
              <span className="font-mono text-neutral-400">{Math.round(maxOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={1.0}
              step={0.05}
              value={maxOpacity}
              onChange={(e) => {
                setPreset("custom");
                setMaxOpacity(Number(e.target.value));
              }}
              className="w-full custom-slider accent-white"
            />
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

FlickeringGridPlayground.displayName = "FlickeringGridPlayground";
