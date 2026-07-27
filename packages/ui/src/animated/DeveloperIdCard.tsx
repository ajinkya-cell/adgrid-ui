"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export type DeveloperIdCardPreset =
  | "obsidian-gold"
  | "monochrome-titanium"
  | "cyberpunk-neon"
  | "emerald-matrix"
  | "midnight-amethyst"
  | "custom";

export type SocialPlatform =
  | "github"
  | "x"
  | "leetcode"
  | "linkedin"
  | "website"
  | "youtube"
  | "discord"
  | "email"
  | "custom";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface DeveloperIdCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
  location?: string;
  bio?: string;
  statusBadge?: string;
  showClock?: boolean;
  timezone?: string;
  skills?: string[];
  socials?: SocialLink[];
  preset?: DeveloperIdCardPreset;
  cornerAccent?: boolean;
  className?: string;
}

interface ThemeConfig {
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentText: string;
  skillBg: string;
  skillBorder: string;
  skillText: string;
  socialBg: string;
  socialBorder: string;
  socialHover: string;
  socialGlow: string;
  ambientGlowTop: string;
  ambientGlowBottom: string;
  lineAccent: string;
}

const THEME_CONFIGS: Record<Exclude<DeveloperIdCardPreset, "custom">, ThemeConfig> = {
  "obsidian-gold": {
    cardBg: "bg-gradient-to-b from-[#16181f] via-[#0c0d10] to-[#07080a]",
    cardBorder:
      "border-t border-t-amber-400/50 border-l border-l-amber-500/30 border-r border-r-black/90 border-b border-b-black/95 shadow-[inset_0_1.5px_0_0_rgba(251,191,36,0.35),inset_0_-1.5px_0_0_rgba(0,0,0,0.8),0_30px_70px_-10px_rgba(0,0,0,0.95)]",
    badgeBg: "bg-gradient-to-b from-amber-950/80 to-neutral-950",
    badgeBorder: "border-t border-t-amber-400/40 border-b border-b-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    badgeText: "text-amber-400",
    accentText: "text-amber-400",
    skillBg: "bg-amber-950/30",
    skillBorder: "border-amber-500/25",
    skillText: "text-amber-300",
    socialBg: "bg-neutral-900/90",
    socialBorder: "border-t border-t-amber-400/30 border-b border-b-black",
    socialHover: "hover:border-amber-400 hover:text-amber-300 ring-amber-400/40",
    socialGlow: "bg-amber-400/30",
    ambientGlowTop: "bg-amber-500/20",
    ambientGlowBottom: "bg-yellow-600/15",
    lineAccent: "bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
  },
  "monochrome-titanium": {
    cardBg: "bg-gradient-to-b from-[#181b20] via-[#0e1013] to-[#070809]",
    cardBorder:
      "border-t border-t-white/40 border-l border-l-white/20 border-r border-r-black/90 border-b border-b-black/95 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.3),inset_0_-1.5px_0_0_rgba(0,0,0,0.8),0_30px_70px_-10px_rgba(0,0,0,0.95)]",
    badgeBg: "bg-gradient-to-b from-neutral-800/80 to-neutral-950",
    badgeBorder: "border-t border-t-white/30 border-b border-b-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    badgeText: "text-zinc-200",
    accentText: "text-zinc-300",
    skillBg: "bg-neutral-800/40",
    skillBorder: "border-zinc-600/30",
    skillText: "text-zinc-200",
    socialBg: "bg-neutral-900/90",
    socialBorder: "border-t border-t-white/30 border-b border-b-black",
    socialHover: "hover:border-white hover:text-white ring-white/40",
    socialGlow: "bg-white/30",
    ambientGlowTop: "bg-zinc-400/20",
    ambientGlowBottom: "bg-slate-500/15",
    lineAccent: "bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.8)]",
  },
  "cyberpunk-neon": {
    cardBg: "bg-gradient-to-b from-[#111322] via-[#090a12] to-[#04050a]",
    cardBorder:
      "border-t border-t-cyan-400/60 border-l border-l-fuchsia-500/50 border-r border-r-black/90 border-b border-b-black/95 shadow-[inset_0_1.5px_0_0_rgba(6,182,212,0.4),inset_0_-1.5px_0_0_rgba(0,0,0,0.8),0_30px_70px_-10px_rgba(0,0,0,0.95),0_0_25px_rgba(6,182,212,0.3)]",
    badgeBg: "bg-gradient-to-b from-cyan-950/80 to-neutral-950",
    badgeBorder: "border-t border-t-cyan-400/40 border-b border-b-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    badgeText: "text-cyan-400",
    accentText: "text-cyan-400",
    skillBg: "bg-fuchsia-950/30",
    skillBorder: "border-fuchsia-500/30",
    skillText: "text-fuchsia-300",
    socialBg: "bg-neutral-900/90",
    socialBorder: "border-t border-t-cyan-400/35 border-b border-b-black",
    socialHover: "hover:border-cyan-400 hover:text-cyan-300 ring-cyan-400/40",
    socialGlow: "bg-cyan-400/35",
    ambientGlowTop: "bg-cyan-500/25",
    ambientGlowBottom: "bg-fuchsia-500/25",
    lineAccent: "bg-cyan-400/90 shadow-[0_0_8px_rgba(6,182,212,0.9)]",
  },
  "emerald-matrix": {
    cardBg: "bg-gradient-to-b from-[#101c15] via-[#080d0a] to-[#040705]",
    cardBorder:
      "border-t border-t-emerald-400/50 border-l border-l-emerald-500/30 border-r border-r-black/90 border-b border-b-black/95 shadow-[inset_0_1.5px_0_0_rgba(52,211,153,0.35),inset_0_-1.5px_0_0_rgba(0,0,0,0.8),0_30px_70px_-10px_rgba(0,0,0,0.95),0_0_25px_rgba(16,185,129,0.25)]",
    badgeBg: "bg-gradient-to-b from-emerald-950/80 to-neutral-950",
    badgeBorder: "border-t border-t-emerald-400/40 border-b border-b-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    badgeText: "text-emerald-400",
    accentText: "text-emerald-400",
    skillBg: "bg-emerald-950/30",
    skillBorder: "border-emerald-500/30",
    skillText: "text-emerald-300",
    socialBg: "bg-neutral-900/90",
    socialBorder: "border-t border-t-emerald-400/30 border-b border-b-black",
    socialHover: "hover:border-emerald-400 hover:text-emerald-300 ring-emerald-400/40",
    socialGlow: "bg-emerald-400/35",
    ambientGlowTop: "bg-emerald-500/25",
    ambientGlowBottom: "bg-teal-600/20",
    lineAccent: "bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
  },
  "midnight-amethyst": {
    cardBg: "bg-gradient-to-b from-[#181326] via-[#0c0914] to-[#050409]",
    cardBorder:
      "border-t border-t-purple-400/50 border-l border-l-purple-500/30 border-r border-r-black/90 border-b border-b-black/95 shadow-[inset_0_1.5px_0_0_rgba(168,85,247,0.35),inset_0_-1.5px_0_0_rgba(0,0,0,0.8),0_30px_70px_-10px_rgba(0,0,0,0.95),0_0_25px_rgba(168,85,247,0.25)]",
    badgeBg: "bg-gradient-to-b from-purple-950/80 to-neutral-950",
    badgeBorder: "border-t border-t-purple-400/40 border-b border-b-black shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    badgeText: "text-purple-400",
    accentText: "text-purple-400",
    skillBg: "bg-purple-950/30",
    skillBorder: "border-purple-500/30",
    skillText: "text-purple-300",
    socialBg: "bg-neutral-900/90",
    socialBorder: "border-t border-t-purple-400/30 border-b border-b-black",
    socialHover: "hover:border-purple-400 hover:text-purple-300 ring-purple-400/40",
    socialGlow: "bg-purple-400/35",
    ambientGlowTop: "bg-purple-500/25",
    ambientGlowBottom: "bg-violet-600/20",
    lineAccent: "bg-purple-400/90 shadow-[0_0_8px_rgba(168,85,247,0.9)]",
  },
};

// Social Icon Renderer
function renderSocialIcon(platform: SocialPlatform) {
  switch (platform) {
    case "github":
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case "x":
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "leetcode":
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226a1.374 1.374 0 0 0-.416.928c0 .352.14.695.416.958l4.088 3.916a1.374 1.374 0 0 0 .961.416c.352 0 .695-.14.958-.416l5.406-5.788a1.374 1.374 0 0 0 0-1.886L14.441.438A1.374 1.374 0 0 0 13.483 0zm-7.66 10.518a1.374 1.374 0 0 0-.961.438L.454 15.364a1.374 1.374 0 0 0 0 1.886l4.408 4.408a1.374 1.374 0 0 0 1.886 0l4.408-4.408a1.374 1.374 0 0 0 0-1.886l-4.408-4.408a1.374 1.374 0 0 0-.927-.438z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "website":
      return (
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "email":
      return (
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "discord":
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
  }
}

export function DeveloperIdCard({
  name = "Ajinkya",
  username = "ajinkya-cell",
  avatarUrl = "https://github.com/ajinkya-cell.png",
  role = "Full-Stack Engineer & UI Architect",
  location = "San Francisco, CA",
  bio = "Architecting high-performance UI systems, agentic coding workflows, and futuristic web interfaces.",
  statusBadge = "AVAILABLE FOR HIRE",
  showClock = true,
  timezone = "UTC",
  skills = ["React", "TypeScript", "Next.js", "Tailwind", "Rust", "Node.js"],
  socials = [
    { platform: "github", url: "https://github.com/ajinkya-cell", label: "GitHub" },
    { platform: "x", url: "https://x.com", label: "X / Twitter" },
    { platform: "leetcode", url: "https://leetcode.com", label: "LeetCode" },
    { platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
    { platform: "website", url: "https://adgrid.ui", label: "Website" },
  ],
  preset = "obsidian-gold",
  cornerAccent = true,
  className,
  ...props
}: DeveloperIdCardProps) {
  const [timeString, setTimeString] = useState<string>("");
  const [hoveredSocial, setHoveredSocial] = useState<number | null>(null);

  // Live Clock Effect
  useEffect(() => {
    if (!showClock) return;

    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setTimeString(timeStr);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [showClock]);

  const activeTheme =
    preset !== "custom"
      ? THEME_CONFIGS[preset] ?? THEME_CONFIGS["obsidian-gold"]
      : THEME_CONFIGS["obsidian-gold"];

  return (
    <div
      className={cn(
        "relative w-full max-w-[420px] h-[520px] rounded-2xl p-6 text-white overflow-hidden flex flex-col justify-between select-none font-['Inter',sans-serif]",
        activeTheme.cardBg,
        activeTheme.cardBorder,
        className
      )}
      {...props}
    >
      {/* Background Ambient Blur Glows */}
      <div
        className={cn(
          "pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-60 transition-colors duration-500",
          activeTheme.ambientGlowTop
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-60 transition-colors duration-500",
          activeTheme.ambientGlowBottom
        )}
      />

      {/* Signature 3D Corner Bevel Lines */}
      {cornerAccent && (
        <>
          <div className={cn("absolute -top-1 -left-1 w-4 h-[2px]", activeTheme.lineAccent)} />
          <div className={cn("absolute -top-1 -left-1 w-[2px] h-4", activeTheme.lineAccent)} />
          <div className={cn("absolute -top-1 -right-1 w-4 h-[2px]", activeTheme.lineAccent)} />
          <div className={cn("absolute -top-1 -right-1 w-[2px] h-4", activeTheme.lineAccent)} />
          <div className={cn("absolute -bottom-1 -left-1 w-4 h-[2px]", activeTheme.lineAccent)} />
          <div className={cn("absolute -bottom-1 -left-1 w-[2px] h-4", activeTheme.lineAccent)} />
          <div className={cn("absolute -bottom-1 -right-1 w-4 h-[2px]", activeTheme.lineAccent)} />
          <div className={cn("absolute -bottom-1 -right-1 w-[2px] h-4", activeTheme.lineAccent)} />
        </>
      )}

      {/* Top Bar: Live Clock & Status Badge */}
      <div className="flex items-center justify-between relative z-10 pb-2">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.8)]",
            activeTheme.badgeBg,
            activeTheme.badgeBorder,
            activeTheme.badgeText
          )}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
          <span>{statusBadge}</span>
        </div>

        {showClock && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-b from-neutral-800/90 to-neutral-950 border-t border-t-white/20 border-b border-b-black text-[11px] font-mono text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)]">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            <span>{timeString || "00:00:00 AM"}</span>
          </div>
        )}
      </div>

      {/* Main Profile Header Section */}
      <div className="flex items-center gap-4 relative z-10 py-2">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-2xl ring-2 ring-white/25 object-cover bg-neutral-800 shadow-[0_10px_25px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.2)]"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://avatars.githubusercontent.com/u/9919?v=4";
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 border border-white/20 flex items-center justify-center shadow-md">
            <svg
              className="w-3 h-3 text-emerald-400 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {name}
            </h3>
            <span className="text-[11px] font-mono text-neutral-400 shrink-0">
              @{username}
            </span>
          </div>
          <p className={cn("text-xs font-semibold truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]", activeTheme.accentText)}>
            {role}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
            <svg className="w-3 h-3 fill-current text-neutral-500" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* Bio Summary Section (Reverted to clean original design) */}
      <div className="relative z-10 py-1">
        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3 bg-neutral-900/60 p-3 rounded-xl border-t border-t-white/10 border-b border-b-black shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          "{bio}"
        </p>
      </div>

      {/* Tech Stack Skills Badges (Reverted to clean original design) */}
      {skills && skills.length > 0 && (
        <div className="relative z-10 py-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Tech Stack
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-hidden">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium border shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all hover:scale-105",
                  activeTheme.skillBg,
                  activeTheme.skillBorder,
                  activeTheme.skillText
                )}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links Footer Bar with Hyper-Polished Hover Effects & Tooltips */}
      {socials && socials.length > 0 && (
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Connect
          </div>
          <div className="flex items-center gap-2">
            {socials.map((social, idx) => {
              const isHovered = hoveredSocial === idx;
              return (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* Floating Spring Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.85 }}
                        animate={{ opacity: 1, y: -28, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="pointer-events-none absolute z-30 px-2 py-0.5 rounded-md bg-neutral-900 border border-white/20 text-[10px] font-semibold text-white shadow-xl whitespace-nowrap"
                      >
                        {social.label || social.platform}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tactile 3D Social Button */}
                  <motion.a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredSocial(idx)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    whileHover={{ scale: 1.18, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    className={cn(
                      "group relative w-9 h-9 rounded-xl flex items-center justify-center text-neutral-300 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)]",
                      activeTheme.socialBg,
                      activeTheme.socialBorder,
                      activeTheme.socialHover
                    )}
                  >
                    {/* Soft Hover Ambient Backlight */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none",
                        activeTheme.socialGlow
                      )}
                    />
                    <div className="relative z-10">
                      {renderSocialIcon(social.platform)}
                    </div>
                  </motion.a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
