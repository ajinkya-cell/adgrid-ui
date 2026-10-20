"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { SegmentedControl } from "../primitives/SegmentedControl";

// Two variants share one API and one data pipeline:
// - "glow" (default): the original neon heatmap with colour presets, ambient glows and emoji stats.
// - "machined": the design-system heatmap. The grid is cut into a recessed tray, empty days are
//   sockets, and activity is light rather than hue: each level is a brighter surface until the
//   busiest days become the popout. Stats sit in a tray, the year picker is a SegmentedControl,
//   and nothing glows or sets its own font. `preset` is ignored; `customColors` still applies.

export type GithubHeatmapVariant = "glow" | "machined";

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
  /** "glow" (default) is the original; "machined" follows the design system. */
  variant?: GithubHeatmapVariant;
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

function isContributionLevel(level: unknown): level is ContributionDay["level"] {
  return typeof level === "number" && Number.isInteger(level) && level >= 0 && level <= 4;
}

// "YYYY-MM-DD" parsed as a local date. `new Date("YYYY-MM-DD")` is UTC midnight, which lands on
// the previous day (and sometimes the previous month) west of Greenwich.
function parseDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getContributionLevel(count: number): ContributionDay["level"] {
  if (count > 12) return 4;
  if (count > 7) return 3;
  if (count > 3) return 2;
  return count > 0 ? 1 : 0;
}

export function GithubHeatmap({
  username = "ajinkya-cell",
  variant = "glow",
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
  const [loadError, setLoadError] = useState<string | null>(null);
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
      setLoadError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setLoadError(null);
    setContributions([]);

    async function fetchContributions() {
      try {
        const requestUrl = new URL(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`
        );
        requestUrl.searchParams.set(
          "y",
          selectedYear === "last-year" ? "last" : String(selectedYear)
        );

        const response = await fetch(requestUrl);
        if (!response.ok) {
          throw new Error(`Contribution request failed (${response.status})`);
        }

        const payload: unknown = await response.json();
        const data =
          payload &&
          typeof payload === "object" &&
          "contributions" in payload &&
          Array.isArray(payload.contributions)
            ? payload.contributions
            : [];
        if (data.length === 0) {
          throw new Error("Contribution response did not contain any days");
        }

        const formatted = data.flatMap((item): ContributionDay[] => {
          if (
            !item ||
            typeof item.date !== "string" ||
            typeof item.count !== "number" ||
            !Number.isFinite(item.count)
          ) {
            return [];
          }

          const level = isContributionLevel(item.level)
            ? item.level
            : getContributionLevel(item.count);
          return [{
            date: item.date,
            count: item.count,
            level,
          }];
        });

        if (formatted.length === 0) {
          throw new Error("Contribution response contained no valid days");
        }

        if (isMounted) setContributions(formatted);
      } catch {
        if (isMounted) {
          setContributions([]);
          setLoadError("Live GitHub contributions are currently unavailable.");
        }
      } finally {
        if (isMounted) setLoading(false);
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

    const firstDate = parseDay(sorted[0].date);
    const firstDayOfWeek = firstDate.getDay();

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: -1, level: 0 });
    }

    const headers: { monthIndex: number; name: string; colIndex: number }[] = [];
    let lastMonth = -1;

    sorted.forEach((day) => {
      const dateObj = parseDay(day.date);
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

  if (variant === "machined") {
    return (
      <MachinedHeatmap
        username={username}
        years={years}
        selectedYear={selectedYear}
        onYearChange={(yr) => {
          setSelectedYear(yr);
          setSelectedMonth(null);
        }}
        loading={loading}
        loadError={loadError}
        stats={stats}
        weeks={weeks}
        monthHeaders={monthHeaders}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        customColors={customColors}
        showStats={showStats}
        showLegend={showLegend}
        showMonthLabels={showMonthLabels}
        showDayLabels={showDayLabels}
        className={className}
        {...props}
      />
    );
  }

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
            <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              @{username}
            </h2>
            <p className="text-xs text-neutral-400">
              {loading
                ? "Loading contributions..."
                : loadError
                  ? "Contribution activity"
                  : `${stats.total.toLocaleString()} ${stats.total === 1 ? "contribution" : "contributions"} ${
                      selectedYear === "last-year" ? "in the last year" : `in ${selectedYear}`
                    }`}
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
      {showStats && !loadError && (
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
        ) : loadError ? (
          <div
            className="flex h-32 w-full items-center justify-center text-center text-sm text-neutral-400"
            role="status"
          >
            {loadError}
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

                      const dayMonth = parseDay(day.date).getMonth();
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
              {parseDay(hoveredDay.day.date).toLocaleDateString(undefined, {
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

// ─── Machined (design-system) variant ───────────────────────────────────────

type YearOption = number | "last-year";

// Empty days are sockets cut into the tray; activity is light, not hue. Each level is a brighter
// surface, and the busiest days rise into the popout.
const MACHINED_LEVELS: [string, string, string, string, string] = [
  "border border-white/[0.04] bg-[#070707] shadow-[inset_0_1px_2px_rgba(0,0,0,0.85)]",
  "border border-white/[0.05] border-t-white/[0.1] bg-white/[0.1]",
  "border border-white/[0.08] border-t-white/[0.18] bg-white/[0.24]",
  "border border-white/[0.16] border-t-white/[0.32] bg-white/[0.5]",
  "border border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.6)]",
];

const TRAY_CLASS =
  "rounded-xl border border-white/[0.06] bg-[#0c0c0d] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]";

const RAISED_CLASS = cn(
  "border border-white/[0.08] border-t-white/[0.16] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
  "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)]"
);

// Rows run Sunday → Saturday, as the weeks are built.
const DAY_ROW_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const EASE_OUT = [0.32, 0.72, 0, 1] as const;

function formatDay(date: string, options: Intl.DateTimeFormatOptions) {
  return parseDay(date).toLocaleDateString(undefined, options);
}

function MachinedHeatmap({
  username,
  years,
  selectedYear,
  onYearChange,
  loading,
  loadError,
  stats,
  weeks,
  monthHeaders,
  selectedMonth,
  onMonthChange,
  customColors,
  showStats,
  showLegend,
  showMonthLabels,
  showDayLabels,
  className,
  ...props
}: {
  username: string;
  years: YearOption[];
  selectedYear: YearOption;
  onYearChange: (year: YearOption) => void;
  loading: boolean;
  loadError: string | null;
  stats: {
    total: number;
    currentStreak: number;
    longestStreak: number;
    peakDay: { count: number; date: string };
  };
  weeks: ContributionDay[][];
  monthHeaders: { monthIndex: number; name: string; colIndex: number }[];
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;
  customColors?: [string, string, string, string, string];
  showStats: boolean;
  showLegend: boolean;
  showMonthLabels: boolean;
  showDayLabels: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const reduceMotion = useReducedMotion() ?? false;
  const trayRef = useRef<HTMLDivElement>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [hovered, setHovered] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);

  useEffect(() => setAvatarFailed(false), [username]);

  const levelClass = (level: ContributionDay["level"]) => customColors?.[level] ?? MACHINED_LEVELS[level];
  const period = selectedYear === "last-year" ? "in the last year" : `in ${selectedYear}`;
  const ready = !loading && !loadError && weeks.length > 0;

  // The label column is optional, so every grid column index is offset by it.
  const columnOffset = showDayLabels ? 2 : 1;
  const gridTemplateColumns = `${showDayLabels ? "auto " : ""}repeat(${weeks.length}, minmax(0, 1fr))`;
  // A month that starts within two weeks of the next one has no room for its label.
  const visibleMonths = monthHeaders.filter(
    (mh, i) => (monthHeaders[i + 1]?.colIndex ?? weeks.length) - mh.colIndex >= 2
  );

  const monthTotal = useMemo(() => {
    if (selectedMonth === null) return 0;
    let total = 0;
    for (const week of weeks) {
      for (const day of week) {
        if (day.count > 0 && parseDay(day.date).getMonth() === selectedMonth) total += day.count;
      }
    }
    return total;
  }, [weeks, selectedMonth]);

  // Measured against the tray rather than the viewport, so the tooltip stays put inside
  // transformed (scaled) previews as well.
  const showTooltip = (day: ContributionDay, cell: HTMLElement) => {
    const tray = trayRef.current;
    if (!tray) return;
    const trayRect = tray.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const scale = trayRect.width ? tray.offsetWidth / trayRect.width : 1;
    setHovered({
      day,
      x: (cellRect.left + cellRect.width / 2 - trayRect.left) * scale,
      y: (cellRect.top - trayRect.top) * scale,
    });
  };

  return (
    <div
      className={cn("relative w-full rounded-2xl p-5 text-neutral-100 sm:p-6", RAISED_CLASS, className)}
      {...props}
    >
      {/* Prismatic edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] rounded-t-2xl"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
        }}
      />

      {/* Header: avatar socket, handle, year picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-[#070707] p-[3px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]">
            {avatarFailed ? (
              <span className="text-sm font-medium text-neutral-400 uppercase">{username.charAt(0)}</span>
            ) : (
              <img
                src={`https://github.com/${username}.png`}
                alt=""
                className="h-full w-full rounded-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            )}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium tracking-tight text-neutral-100">@{username}</div>
            <div className="truncate text-xs text-neutral-500" aria-live="polite">
              {loading
                ? "Loading contributions…"
                : loadError
                  ? "GitHub contributions"
                  : `${stats.total.toLocaleString()} ${stats.total === 1 ? "contribution" : "contributions"} ${period}`}
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <SegmentedControl
            size="sm"
            aria-label="Contribution period"
            value={String(selectedYear)}
            onValueChange={(value) => onYearChange(value === "last-year" ? "last-year" : Number(value))}
            options={years.map((yr) => ({
              value: String(yr),
              label: yr === "last-year" ? "Past year" : String(yr),
            }))}
          />
        </div>
      </div>

      {/* Stats tray */}
      {showStats && !loadError && (
        <div className={cn("mt-5 grid grid-cols-2 gap-px overflow-hidden sm:grid-cols-4", TRAY_CLASS, "bg-white/[0.06]")}>
          {[
            { label: "Contributions", value: stats.total.toLocaleString() },
            { label: "Current streak", value: `${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}` },
            { label: "Longest streak", value: `${stats.longestStreak} ${stats.longestStreak === 1 ? "day" : "days"}` },
            {
              label: "Best day",
              value: stats.peakDay.count.toLocaleString(),
              meta: stats.peakDay.date !== "-" ? formatDay(stats.peakDay.date, { month: "short", day: "numeric" }) : undefined,
            },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 bg-[#0c0c0d] px-3.5 py-3">
              <span className="text-xs text-neutral-500">{stat.label}</span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-base font-medium tracking-tight text-neutral-100 tabular-nums">
                  {loading ? "—" : stat.value}
                </span>
                {!loading && stat.meta && <span className="text-xs text-neutral-500">{stat.meta}</span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grid tray */}
      <div ref={trayRef} className={cn("relative mt-4 p-3 sm:p-4", TRAY_CLASS)}>
        {!ready ? (
          <div role="status" className="flex h-32 items-center justify-center text-center text-sm text-neutral-500">
            {loading ? "Loading contributions…" : loadError ?? "No contributions to show."}
          </div>
        ) : (
          <motion.div
            key={String(selectedYear)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.26, ease: EASE_OUT }}
          >
            {showMonthLabels && (
              <div className="mb-1.5 grid gap-[3px]" style={{ gridTemplateColumns }}>
                {showDayLabels && <span aria-hidden="true" />}
                {visibleMonths.map((mh) => {
                  const active = selectedMonth === mh.monthIndex;
                  return (
                    <button
                      key={`${mh.monthIndex}-${mh.colIndex}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onMonthChange(active ? null : mh.monthIndex)}
                      style={{ gridColumnStart: mh.colIndex + columnOffset, gridRowStart: 1 }}
                      className={cn(
                        "-ml-1 w-max cursor-pointer rounded-md px-1 py-0.5 text-left text-[11px] leading-none transition-colors duration-150",
                        "outline-white/40 outline-offset-1 focus-visible:outline focus-visible:outline-1",
                        active ? "bg-white/[0.08] text-neutral-100" : "text-neutral-500 hover:text-neutral-300"
                      )}
                    >
                      {mh.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              role="img"
              aria-label={`${stats.total.toLocaleString()} contributions ${period}`}
              className="grid gap-[3px]"
              style={{ gridTemplateColumns, gridTemplateRows: "repeat(7, auto)", gridAutoFlow: "column" }}
              onMouseLeave={() => setHovered(null)}
            >
              {showDayLabels &&
                DAY_ROW_LABELS.map((label, i) => (
                  <span
                    key={`label-${i}`}
                    aria-hidden="true"
                    className="flex items-center pr-2 text-[10px] leading-none text-neutral-500"
                  >
                    {label}
                  </span>
                ))}
              {weeks.flatMap((week, colIdx) =>
                Array.from({ length: 7 }, (_, rowIdx) => {
                  const day = week[rowIdx];
                  if (!day || day.count === -1) {
                    return <span key={`${colIdx}-${rowIdx}`} aria-hidden="true" />;
                  }
                  const dimmed = selectedMonth !== null && parseDay(day.date).getMonth() !== selectedMonth;
                  return (
                    <span
                      key={day.date}
                      aria-hidden="true"
                      onMouseEnter={(e) => showTooltip(day, e.currentTarget)}
                      className={cn(
                        "aspect-square w-full rounded-[3px] transition-[opacity,outline-color] duration-150",
                        levelClass(day.level),
                        dimmed && "opacity-15",
                        hovered?.day.date === day.date
                          ? "outline outline-1 outline-offset-1 outline-white/60"
                          : "outline-transparent"
                      )}
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Tooltip: a small raised pill above the hovered day */}
        <AnimatePresence>
          {hovered && ready && (
            <div
              key="tooltip"
              className="pointer-events-none absolute z-20"
              style={{ left: hovered.x, top: hovered.y, transform: "translate(-50%, calc(-100% - 6px))" }}
            >
              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                transition={{ duration: 0.12, ease: EASE_OUT }}
                className={cn("rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap", RAISED_CLASS)}
              >
                <span className="font-medium text-neutral-100">
                  {hovered.day.count === 0
                    ? "No contributions"
                    : `${hovered.day.count} ${hovered.day.count === 1 ? "contribution" : "contributions"}`}
                </span>
                <span className="text-neutral-400">
                  {" on "}
                  {formatDay(hovered.day.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: month filter and legend */}
      {showLegend && ready && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex min-h-6 items-center gap-2">
            {selectedMonth !== null && (
              <>
                <span>
                  <span className="text-neutral-100 tabular-nums">{monthTotal.toLocaleString()}</span> in{" "}
                  {MONTH_NAMES[selectedMonth]}
                </span>
                <button
                  type="button"
                  onClick={() => onMonthChange(null)}
                  className="h-6 cursor-pointer rounded-lg px-2 text-neutral-400 transition-colors duration-150 outline-white/40 outline-offset-1 hover:bg-[#0c0c0d] hover:text-neutral-100 focus-visible:outline focus-visible:outline-1"
                >
                  Show all
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2" aria-hidden="true">
            <span>Less</span>
            <div className="flex gap-[3px]">
              {([0, 1, 2, 3, 4] as const).map((lvl) => (
                <span key={lvl} className={cn("h-2.5 w-2.5 rounded-[3px]", levelClass(lvl))} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
