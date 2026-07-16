"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { IconChevronLeft, IconChevronRight, IconCalendar } from "@tabler/icons-react";

export interface DatepickerProps {
  className?: string;
  glowColor?: "blue" | "white" | "none";
}

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Datepicker({ className, glowColor = "none" }: DatepickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "year">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate Year range for selection grid (12 years)
  const baseYear = Math.floor(year / 10) * 10 - 1; // start of decade-ish
  const yearsRange = Array.from({ length: 12 }, (_, i) => baseYear + i);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode("calendar");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  const navigateMonth = (direction: "prev" | "next") => {
    playClickSound(0.04);
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      if (direction === "prev") {
        nextDate.setMonth(prev.getMonth() - 1);
      } else {
        nextDate.setMonth(prev.getMonth() + 1);
      }
      return nextDate;
    });
  };

  const navigateYears = (direction: "prev" | "next") => {
    playClickSound(0.04);
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      if (direction === "prev") {
        nextDate.setFullYear(prev.getFullYear() - 12);
      } else {
        nextDate.setFullYear(prev.getFullYear() + 12);
      }
      return nextDate;
    });
  };

  const handleSelectDay = (day: number) => {
    playClickSound(0.08);
    const newSelect = new Date(year, month, day);
    setSelectedDate(newSelect);
    setIsOpen(false); // Close popover on selection
  };

  const handleSelectYear = (selectedYear: number) => {
    playClickSound(0.06);
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      nextDate.setFullYear(selectedYear);
      return nextDate;
    });
    setViewMode("calendar");
  };

  const playClickSound = (volume = 0.05) => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.005);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.006);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.007);
    } catch (e) {}
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const formatDateLabel = () => {
    if (!selectedDate) return "Datepicker";
    return selectedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      {/* ── SKEUOMORPHIC TRIGGER CARD ────────────────────────────── */}
      <button
        type="button"
        onClick={() => {
          playClickSound(0.05);
          setIsOpen((prev) => !prev);
        }}
        className="w-[280px] h-12 rounded-xl border border-white/5 px-4 flex items-center justify-between text-white/55 hover:text-white/90 hover:border-white/20 transition-all cursor-pointer focus:outline-none"
        style={{
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#000000",
          boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05)"
        }}
      >
        <span className={cn("text-xs tracking-wide", selectedDate ? "text-white font-medium" : "text-white/45")}>
          {formatDateLabel()}
        </span>
        <IconCalendar className="h-4 w-4 text-white/30" strokeWidth={2} />
      </button>

      {/* ── CALENDAR POPOVER DECK ────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", duration: 0.25, bounce: 0 }}
            className={cn(
              "absolute left-0 mt-2.5 w-[340px] rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 z-50 p-4",
              glowColor === "blue" && "shadow-[0_0_50px_rgba(59,130,246,0.15)]",
              glowColor === "white" && "shadow-[0_0_50px_rgba(255,255,255,0.08)]"
            )}
            style={{
              backgroundColor: "#171717",
              boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
            }}
          >
            {/* Header / Navigator */}
            <div className="bg-[#090909] border border-white/[0.04] rounded-xl px-3 py-2.5 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)] mb-3">
              <button
                type="button"
                onClick={() => (viewMode === "calendar" ? navigateMonth("prev") : navigateYears("prev"))}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5 text-white/55 hover:border-white/20 hover:text-white transition-colors cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] active:scale-95"
              >
                <IconChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound(0.04);
                  setViewMode((prev) => (prev === "calendar" ? "year" : "calendar"));
                }}
                className="text-[17px] tracking-tight font-medium text-white/95 hover:text-white transition-colors cursor-pointer"
                style={{ fontFamily: '"Instrument Serif", serif' }}
              >
                {viewMode === "calendar" ? `${MONTHS[month]} ${year}` : `${yearsRange[0]} - ${yearsRange[11]}`}
              </button>

              <button
                type="button"
                onClick={() => (viewMode === "calendar" ? navigateMonth("next") : navigateYears("next"))}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-1.5 text-white/55 hover:border-white/20 hover:text-white transition-colors cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] active:scale-95"
              >
                <IconChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Recessed Grid Frame */}
            <div className="bg-[#090909] border border-white/[0.04] rounded-xl p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]">
              {viewMode === "calendar" ? (
                <>
                  {/* Weekday Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                    {WEEKDAYS.map((day) => (
                      <span key={day} className="text-[10px] font-mono font-bold text-white/35">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Day Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarCells.map((day, idx) => {
                      if (day === null) {
                        return <div key={`empty-${idx}`} className="h-8 w-8" />;
                      }

                      const active = isSelected(day);
                      const current = isToday(day);

                      return (
                        <button
                          key={`day-${day}`}
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          className={cn(
                            "h-8 w-8 rounded-lg text-[11px] font-mono flex items-center justify-center transition-all cursor-pointer relative",
                            active
                              ? "bg-white text-black font-bold border border-white/35 shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                              : "border border-white/5 bg-white/[0.02] text-white/65 hover:border-white/25 hover:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                          )}
                        >
                          {day}
                          {current && !active && (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white/40" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Year Grid Selector */
                <div className="grid grid-cols-3 gap-2">
                  {yearsRange.map((yr) => {
                    const active = yr === year;
                    return (
                      <button
                        key={`year-${yr}`}
                        type="button"
                        onClick={() => handleSelectYear(yr)}
                        className={cn(
                          "py-2.5 rounded-lg text-[11px] font-mono flex items-center justify-center transition-all cursor-pointer",
                          active
                            ? "bg-white text-black font-bold border border-white/35 shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                            : "border border-white/5 bg-white/[0.02] text-white/65 hover:border-white/25 hover:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                        )}
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
