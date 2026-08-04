"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface NavBar1Props {
  className?: string;
  statusColor?: "emerald" | "cyan" | "rose";
}

const NAV_ITEMS = ["Dashboard", "Components", "Analytics", "Settings"];

export default function NavBar1({ className, statusColor = "emerald" }: NavBar1Props) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Inject Geist Pixel Google Font dynamically
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

    // Live clock interval (updates every 1000ms)
    setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (tab: string) => {
    playClickSound();
    setActiveTab(tab);
  };

  const playClickSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.004);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.005);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.006);
    } catch (e) {}
  };

  return (
    <div
      className={cn(
        "w-full max-w-4xl h-16 rounded-2xl border border-white/10 bg-[#151515] flex items-center justify-between px-6 select-none relative backdrop-blur-md overflow-hidden",
        className
      )}
      style={{
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.5), 0 32px 64px -12px rgba(0, 0, 0, 0.7), 0 4px 24px -4px rgba(0, 0, 0, 0.5)"
      }}
    >
      {/* Prismatic top-border highlight like SimpleCard */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.2) 75%, transparent 100%)"
        }}
      />

      {/* ── Left Side: Logo (Ajinkya in Geist Pixel) ─────────────────── */}
      <div className="flex items-center gap-2.5 z-10">
        <span
          className="text-lg font-bold tracking-tight text-white/95"
          style={{ fontFamily: '"Geist Pixel", monospace' }}
        >
          Ajinkya
        </span>
        {/* Glow LED light */}
        <div className="relative flex items-center justify-center h-4 w-4">
          <span
            className={cn(
              "absolute h-2 w-2 rounded-full",
              statusColor === "emerald" && "bg-emerald-500",
              statusColor === "cyan" && "bg-cyan-500",
              statusColor === "rose" && "bg-rose-500"
            )}
          />
          <span
            className={cn(
              "absolute h-3.5 w-3.5 rounded-full opacity-35 animate-ping",
              statusColor === "emerald" && "bg-emerald-400",
              statusColor === "cyan" && "bg-cyan-400",
              statusColor === "rose" && "bg-rose-400"
            )}
          />
        </div>
      </div>

      {/* ── Center: Clean Nav Items with Bigger Glowing Underline ── */}
      <div className="flex items-center gap-6 md:gap-8 h-full z-10">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleTabClick(item)}
              className={cn(
                "relative h-full flex items-center px-1.5 text-xs md:text-sm font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none",
                isActive ? "text-white font-semibold" : "text-white/50 hover:text-white/80"
              )}
            >
              <span>{item}</span>
              {isActive && (
                <>
                  <motion.div
                    layoutId="activeNavLine"
                    className="absolute bottom-2.5 left-0 right-0 h-[2.5px] bg-white rounded-full z-10 shadow-[0_0_12px_rgba(255,255,255,0.95),_0_0_22px_rgba(255,255,255,0.65),_0_0_34px_rgba(255,255,255,0.35)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                  <motion.div
                    layoutId="activeNavAura"
                    className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-white/25 blur-md rounded-full pointer-events-none z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Right Side: Live Clock (Geist Pixel) ───────────────────── */}
      <div 
        className="text-[14px] font-medium tracking-wide text-white/70 min-w-[70px] text-right z-10"
        style={{ fontFamily: '"Geist Pixel", monospace' }}
      >
        {time}
      </div>
    </div>
  );
}
