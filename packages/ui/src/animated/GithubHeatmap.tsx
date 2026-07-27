"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { AJINKYA_CELL_REAL_DATA } from "./ajinkyaCellData";

export type GithubHeatmapPreset =
  | "emerald"
  | "obsidian"
  | "cyberpunk"
  | "indigo"
  | "custom";

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubHeatmapProps
  extends React.HTMLAttributes<HTMLDivElement> {
  username?: string;
  preset?: GithubHeatmapPreset;
  customColors?: [string, string, string, string, string];
  data?: ContributionDay[];
  years?: (number | "last-year")[]; // Available toggle options (default: ["last-year", 2026, 2025, 2024, 2023])
  defaultYear?: number | "last-year";
  showStats?: boolean;
  showLegend?: boolean;
  showMonthLabels?: boolean;
  showDayLabels?: boolean;
  className?: string;
}

interface PresetTheme {
  levels: [string, string, string, string, string];
  hoverGlow: string;
  badgeBorder: string;
  badgeText: string;
  accentGradient: string;
  ambientTop: string;
  ambientBottom: string;
}

const PRESET_THEMES: Record<Exclude<GithubHeatmapPreset, "custom">, PresetTheme> = {
  emerald: {
    levels: [
      "bg-neutral-900/90 border border-white/5",
      "bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 shadow-[0_0_4px_rgba(16,185,129,0.15)]",
      "bg-emerald-700/90 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.55)]",
      "bg-emerald-500 border border-emerald-400/80 shadow-[0_0_14px_rgba(16,185,129,0.8)]",
      "bg-emerald-400 border border-emerald-200 shadow-[0_0_20px_rgba(52,211,153,1)]",
    ],
    hoverGlow: "shadow-[0_0_24px_rgba(16,185,129,1)] border-emerald-200 scale-150 z-30 ring-2 ring-emerald-300",
    badgeBorder: "border-t border-t-emerald-400/30 border-b border-b-emerald-950 bg-gradient-to-b from-emerald-950/80 to-neutral-950 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]",
    badgeText: "text-emerald-400",
    accentGradient: "from-emerald-400 to-teal-200",
    ambientTop: "bg-emerald-500/20",
    ambientBottom: "bg-teal-500/20",
  },
  obsidian: {
    levels: [
      "bg-neutral-900/90 border border-white/5",
      "bg-zinc-800/90 border border-zinc-700/60 shadow-[0_0_4px_rgba(161,161,170,0.15)] text-zinc-300",
      "bg-zinc-600 border border-zinc-400/70 shadow-[0_0_8px_rgba(212,212,216,0.4)] text-white",
      "bg-slate-300 border border-white/90 shadow-[0_0_12px_rgba(228,228,231,0.65)] text-neutral-950",
      "bg-zinc-100 border border-white shadow-[0_0_16px_rgba(255,255,255,0.85)] text-neutral-950",
    ],
    hoverGlow: "shadow-[0_0_20px_rgba(255,255,255,0.85)] border-white scale-140 z-30 ring-2 ring-zinc-300",
    badgeBorder: "border-t border-t-white/20 border-b border-b-neutral-950 bg-gradient-to-b from-neutral-800/80 to-neutral-950 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]",
    badgeText: "text-zinc-200",
    accentGradient: "from-white to-zinc-400",
    ambientTop: "bg-zinc-500/15",
    ambientBottom: "bg-slate-400/15",
  },
  cyberpunk: {
    levels: [
      "bg-neutral-900/90 border border-white/5",
      "bg-fuchsia-950/70 border border-fuchsia-800/40 shadow-[0_0_4px_rgba(217,70,239,0.2)]",
      "bg-fuchsia-700/90 border border-fuchsia-500/60 shadow-[0_0_10px_rgba(217,70,239,0.5)]",
      "bg-cyan-500 border border-cyan-400/80 shadow-[0_0_16px_rgba(6,182,212,0.85)]",
      "bg-cyan-300 border border-white shadow-[0_0_24px_rgba(103,232,249,1)]",
    ],
    hoverGlow: "shadow-[0_0_26px_rgba(6,182,212,1)] border-cyan-200 scale-150 z-30 ring-2 ring-cyan-300",
    badgeBorder: "border-t border-t-cyan-400/30 border-b border-b-cyan-950 bg-gradient-to-b from-cyan-950/80 to-neutral-950 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]",
    badgeText: "text-cyan-400",
    accentGradient: "from-fuchsia-400 via-cyan-400 to-white",
    ambientTop: "bg-fuchsia-500/20",
    ambientBottom: "bg-cyan-500/20",
  },
  indigo: {
    levels: [
      "bg-neutral-900/90 border border-white/5",
      "bg-indigo-950/70 border border-indigo-900/40 shadow-[0_0_4px_rgba(99,102,241,0.2)]",
      "bg-indigo-700/90 border border-indigo-500/60 shadow-[0_0_10px_rgba(99,102,241,0.5)]",
      "bg-indigo-500 border border-indigo-400/80 shadow-[0_0_16px_rgba(99,102,241,0.85)]",
      "bg-violet-400 border border-indigo-200 shadow-[0_0_24px_rgba(167,139,250,1)]",
    ],
    hoverGlow: "shadow-[0_0_26px_rgba(99,102,241,1)] border-indigo-200 scale-150 z-30 ring-2 ring-violet-300",
    badgeBorder: "border-t border-t-indigo-400/30 border-b border-b-indigo-950 bg-gradient-to-b from-indigo-950/80 to-neutral-950 shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]",
    badgeText: "text-indigo-400",
    accentGradient: "from-indigo-400 to-violet-300",
    ambientTop: "bg-indigo-500/20",
    ambientBottom: "bg-violet-500/20",
  },
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", ""];

// Filter rolling 365 days ending today
function getRolling365Days(): ContributionDay[] {
  const combined = [
    ...(AJINKYA_CELL_REAL_DATA[2025] || []),
    ...(AJINKYA_CELL_REAL_DATA[2026] || []),
  ];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  const startStr = startDate.toISOString().split("T")[0];

  return combined.filter((d) => d.date >= startStr && d.date <= todayStr);
}

export function GithubHeatmap({
  username = "ajinkya-cell",
  preset = "emerald",
  customColors,
  data: customData,
  years = ["last-year", 2026, 2025, 2024, 2023],
  defaultYear = "last-year",
  showStats = false,
  showLegend = true,
  showMonthLabels = true,
  showDayLabels = true,
  className,
  ...props
}: GithubHeatmapProps) {
  const [selectedYear, setSelectedYear] = useState<number | "last-year">(defaultYear);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredDay, setHoveredDay] = useState<{
    day: ContributionDay;
    x: number;
    y: number;
  } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Fetch actual GitHub contributions or default to rolling 365 days ending today
  useEffect(() => {
    if (customData && customData.length > 0) {
      setContributions(customData);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    async function fetchContributions() {
      try {
        const queryParam = selectedYear === "last-year" ? "" : `?y=${selectedYear}&flatten=true`;
        const res = await fetch(
          `https://github-contributions-api.deno.dev/${username}${queryParam}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const formatted: ContributionDay[] = data.map((item: any) => ({
              date: item.date,
              count: item.count ?? 0,
              level:
                item.level ??
                (item.count > 12
                  ? 4
                  : item.count > 7
                  ? 3
                  : item.count > 3
                  ? 2
                  : item.count > 0
                  ? 1
                  : 0),
            }));
            setContributions(formatted);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // Fallthrough to authentic dataset
      }

      if (isMounted) {
        if (selectedYear === "last-year") {
          setContributions(getRolling365Days());
        } else if (typeof selectedYear === "number" && AJINKYA_CELL_REAL_DATA[selectedYear]) {
          setContributions(AJINKYA_CELL_REAL_DATA[selectedYear]);
        } else {
          setContributions(getRolling365Days());
        }
        setLoading(false);
      }
    }

    fetchContributions();

    return () => {
      isMounted = false;
    };
  }, [username, selectedYear, customData]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!contributions.length)
      return { total: 0, currentStreak: 0, longestStreak: 0, peakDay: { count: 0, date: "-" } };

    let total = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let peakCount = 0;
    let peakDate = "-";

    const sorted = [...contributions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const c = sorted[i].count;
      total += c;

      if (c > peakCount) {
        peakCount = c;
        peakDate = sorted[i].date;
      }

      if (c > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      total,
      currentStreak,
      longestStreak,
      peakDay: { count: peakCount, date: peakDate },
    };
  }, [contributions]);

  // Group contributions into 52-53 weeks (columns of 7 days) ending today on the far right
  const { weeks, monthHeaders } = useMemo(() => {
    if (!contributions.length) return { weeks: [], monthHeaders: [] };

    const sorted = [...contributions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const weekCols: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    const firstDate = new Date(sorted[0].date);
    const firstDayOfWeek = firstDate.getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: -1, level: 0 });
    }

    const headers: { monthIndex: number; name: string; colIndex: number }[] = [];
    let lastMonth = -1;

    sorted.forEach((day) => {
      const dateObj = new Date(day.date);
      const monthIndex = dateObj.getMonth();

      if (monthIndex !== lastMonth) {
        headers.push({
          monthIndex,
          name: MONTH_NAMES[monthIndex],
          colIndex: weekCols.length,
        });
        lastMonth = monthIndex;
      }

      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weekCols.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weekCols.push(currentWeek);
    }

    return { weeks: weekCols, monthHeaders: headers };
  }, [contributions]);

  const activeTheme =
    preset !== "custom" ? PRESET_THEMES[preset] ?? PRESET_THEMES.emerald : PRESET_THEMES.emerald;

  const getCellBgClass = (level: 0 | 1 | 2 | 3 | 4) => {
    if (customColors && customColors[level]) {
      return customColors[level];
    }
    return activeTheme.levels[level];
  };

  const selectedYearLabel =
    selectedYear === "last-year" ? "Now" : String(selectedYear);

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl bg-[#0c0d10] p-6 md:p-8 text-white border-t border-t-white/20 border-l border-l-white/10 border-r border-r-black/60 border-b border-b-black/80 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-visible font-['Inter',sans-serif]",
        className
      )}
      {...props}
    >
      {/* Dynamic Background Ambient Glows */}
      <div
        className={cn(
          "pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl opacity-50 transition-colors duration-500",
          activeTheme.ambientTop
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-50 transition-colors duration-500",
          activeTheme.ambientBottom
        )}
      />

      {/* Header & User Profile Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={`https://github.com/${username}.png`}
              alt={username}
              className="w-12 h-12 rounded-full ring-2 ring-white/20 object-cover bg-neutral-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                @{username}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full border-t border-t-white/20 border-b border-b-black/80 bg-neutral-900 text-neutral-400 font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                GitHub
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Contribution activity ({selectedYear === "last-year" ? "past 365 days ending today" : `in ${selectedYear}`})
            </p>
          </div>
        </div>

        {/* 3D Beveled Year Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#060708] p-1 rounded-xl border-t border-t-black/80 border-b border-b-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)]">
          {years.map((yr) => {
            const isSelected = selectedYear === yr;
            const label = yr === "last-year" ? "Now" : String(yr);
            return (
              <button
                key={String(yr)}
                onClick={() => {
                  setSelectedYear(yr);
                  setSelectedMonth(null);
                }}
                className={cn(
                  "px-3.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  isSelected
                    ? "bg-gradient-to-b from-neutral-700 to-neutral-800 text-white shadow-[0_3px_8px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] border-t border-t-white/30 border-b border-b-black/90 font-bold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Beveled Stats Badges Header */}
      {showStats && (
        <div className="flex items-center gap-3 pt-4 pb-2 overflow-x-auto relative z-10">
          {/* Total Contributions */}
          <div
            className={cn(
              "flex flex-col px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all",
              activeTheme.badgeBorder
            )}
          >
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              Total ({selectedYearLabel})
            </span>
            <span className={cn("text-base font-extrabold", activeTheme.badgeText)}>
              {loading ? "..." : stats.total.toLocaleString()}
            </span>
          </div>

          {/* Current Streak */}
          <div className="flex flex-col px-3.5 py-1.5 rounded-xl border-t border-t-orange-400/30 border-b border-b-orange-950 bg-gradient-to-b from-orange-950/80 to-neutral-950 text-xs whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1">
              Streak 🔥
            </span>
            <span className="text-base font-extrabold text-orange-400">
              {loading ? "..." : `${stats.currentStreak} days`}
            </span>
          </div>

          {/* Longest Streak */}
          <div className="flex flex-col px-3.5 py-1.5 rounded-xl border-t border-t-purple-400/30 border-b border-b-purple-950 bg-gradient-to-b from-purple-950/80 to-neutral-950 text-xs whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1">
              Max Streak ⚡
            </span>
            <span className="text-base font-extrabold text-purple-400">
              {loading ? "..." : `${stats.longestStreak} days`}
            </span>
          </div>

          {/* Peak Day */}
          <div className="flex flex-col px-3.5 py-1.5 rounded-xl border-t border-t-cyan-400/30 border-b border-b-cyan-950 bg-gradient-to-b from-cyan-950/80 to-neutral-950 text-xs whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1">
              Peak Day 🚀
            </span>
            <span className="text-base font-extrabold text-cyan-300">
              {loading ? "..." : `${stats.peakDay.count} commits`}
            </span>
          </div>
        </div>
      )}

      {/* Main Heatmap Matrix Container (Ending Today at Far Right, Clean Glowing Cells) */}
      <div className="pt-4 py-2 relative z-10 w-full">
        {loading ? (
          <div className="h-32 w-full flex items-center justify-center space-x-2 animate-pulse text-neutral-500 text-sm">
            <span>Loading contribution matrix...</span>
          </div>
        ) : (
          <div className="w-full flex flex-col justify-center">
            {/* Month Labels Header */}
            {showMonthLabels && (
              <div className="flex mb-1.5 text-[11px] font-medium text-neutral-400 pl-7 w-full justify-between pr-1">
                {monthHeaders.map((mh, idx) => {
                  const isSelected = selectedMonth === mh.monthIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        setSelectedMonth(isSelected ? null : mh.monthIndex)
                      }
                      className={cn(
                        "transition-colors hover:text-white px-1.5 py-0.5 rounded cursor-pointer border border-transparent",
                        isSelected
                          ? "bg-neutral-800 border-t border-t-white/20 text-white font-bold shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                          : "text-neutral-400 hover:bg-neutral-900"
                      )}
                    >
                      {mh.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Matrix Grid */}
            <div className="flex w-full items-center">
              {/* Day-of-week labels */}
              {showDayLabels && (
                <div className="flex flex-col justify-between h-[84px] text-[10px] text-neutral-500 font-medium pr-2 shrink-0">
                  {DAY_LABELS.map((dayLabel, idx) => (
                    <span key={idx} className="h-2.5 flex items-center">
                      {dayLabel}
                    </span>
                  ))}
                </div>
              )}

              {/* 52-53 Weeks Columns (Ends on Today's date on far right) */}
              <div className="flex w-full justify-between items-center gap-[2.5px]">
                {weeks.map((week, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-[2.5px] flex-1">
                    {week.map((day, rowIdx) => {
                      if (day.count === -1) {
                        return (
                          <div
                            key={rowIdx}
                            className="aspect-square w-full opacity-0 pointer-events-none"
                          />
                        );
                      }

                      const dayMonth = new Date(day.date).getMonth();
                      const isFilteredOut =
                        selectedMonth !== null && dayMonth !== selectedMonth;

                      return (
                        <motion.div
                          key={day.date}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{
                            scale: isFilteredOut ? 0.75 : 1,
                            opacity: isFilteredOut ? 0.2 : 1,
                          }}
                          transition={{
                            duration: 0.15,
                            delay: (colIdx * 7 + rowIdx) * 0.0008,
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              day,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={cn(
                            "aspect-square w-full rounded-[2.5px] transition-all cursor-pointer relative",
                            getCellBgClass(day.level),
                            hoveredDay?.day.date === day.date
                              ? activeTheme.hoverGlow
                              : ""
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating 3D Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              left: hoveredDay.x,
              top: hoveredDay.y,
              transform: "translate(-50%, -100%)",
            }}
            className="pointer-events-none z-50 px-3.5 py-2 rounded-xl bg-neutral-900 border-t border-t-white/20 border-b border-b-black text-xs text-white shadow-[0_10px_30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] whitespace-nowrap"
          >
            <div className="font-semibold text-neutral-100">
              {hoveredDay.day.count}{" "}
              {hoveredDay.day.count === 1 ? "contribution" : "contributions"}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {new Date(hoveredDay.day.date).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer & Legend */}
      {showLegend && (
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 relative z-10">
          <div className="flex items-center gap-2">
            {selectedMonth !== null && (
              <button
                onClick={() => setSelectedMonth(null)}
                className="text-[11px] px-2 py-0.5 rounded border-t border-t-white/15 border-b border-b-black bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
              >
                Clear filter ({MONTH_NAMES[selectedMonth]}) ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500 font-medium">Less</span>
            <div className="flex gap-1">
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <div
                  key={lvl}
                  className={cn("w-3 h-3 rounded-[2.5px]", getCellBgClass(lvl))}
                />
              ))}
            </div>
            <span className="text-[11px] text-neutral-500 font-medium">More</span>
          </div>
        </div>
      )}
    </div>
  );
}
