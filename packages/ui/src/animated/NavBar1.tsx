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
        "w-full max-w-4xl h-16 rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 flex items-center justify-between px-5 select-none relative",
        className
      )}
      style={{
        backgroundColor: "#171717",
        boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 50px rgba(0,0,0,0.55)"
      }}
    >
      {/* ── Left Side: Logo (Ajinkya in Geist Pixel) ─────────────────── */}
      <div className="flex items-center gap-2.5">
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

      {/* ── Center: Sliding Nav Tabs (Rounded-Full Pill Track) ─────── */}
      <div
        className="bg-[#090909] border border-white/[0.04] rounded-full p-1 flex gap-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleTabClick(item)}
              className="relative px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors text-white/55 hover:text-white/85 focus-visible:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute inset-0 bg-white rounded-full border border-white/35 shadow-[0_2px_4px_rgba(0,0,0,0.2)] z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={cn("relative z-10", isActive && "text-black font-semibold")}>
                {item}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Right Side: Live Clock (Geist Pixel) ───────────────────── */}
      <div 
        className="text-[14px] font-medium tracking-wide text-white/70 min-w-[70px] text-right"
        style={{ fontFamily: '"Geist Pixel", monospace' }}
      >
        {time}
      </div>
    </div>
  );
}
