"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "../lib/utils";

interface TimelineNode {
  year: string;
  title: string;
  description: string;
  image: string;
  status: string;
}

const timelineData: TimelineNode[] = [
  {
    year: "2022",
    title: "The Beginning",
    description:
      "Started with a simple idea: make the web feel alive. Our first prototype was built in a garage with nothing but passion and coffee.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop",
    status: "INIT_SEQUENCE",
  },
  {
    year: "2023",
    title: "First Launch",
    description:
      "Released our beta to 10,000 users. The feedback was overwhelming. We knew we were onto something special.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    status: "DEPLOYED_BETA",
  },
  {
    year: "2024",
    title: "Rapid Growth",
    description:
      "Scaled to 100,000 users. Raised Series A. Expanded team to 25. Opened offices in SF and London.",
    image: "https://images.unsplash.com/photo-1553729459-afe14f8b51e7?w=800&h=500&fit=crop",
    status: "SERIES_A_LOAD",
  },
  {
    year: "2025",
    title: "Global Scale",
    description:
      "Now serving 1M+ users across 50 countries. IPO preparation underway. The journey continues.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop",
    status: "GLOBAL_ARRAY",
  },
];

export function StoryTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear] = useState<string>("2022");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 18,
  });

  const scaleY = useTransform(lineHeight, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -25% 0px", // Trigger when items enter center viewport area
      threshold: 0.2,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const year = entry.target.getAttribute("data-year");
          if (year) {
            setActiveYear(year);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll("[data-timeline-section]");
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  const scrollToYear = (year: string) => {
    const el = document.querySelector(`[data-year="${year}"][data-timeline-section]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 bg-transparent select-none"
    >
      {/* LEFT COLUMN: Sticky Navigation Rail */}
      <aside className="md:sticky md:top-24 h-fit md:w-48 shrink-0 flex md:flex-col items-center md:items-start gap-6 select-none z-20">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] text-white/40 tracking-widest font-bold w-fit mb-1 uppercase select-none">
            LOG_PROTOCOL
          </span>
          <h2 className="font-display text-lg font-black text-white tracking-wider uppercase">
            TIMELINE
          </h2>
        </div>

        {/* Navigation buttons */}
        <div className="relative flex md:flex-col w-full gap-4 md:gap-6 pt-4 border-t border-neutral-900 md:border-t-0 md:pt-0">
          {/* Vertical progress line (desktop only) */}
          <div className="hidden md:block absolute left-[7px] top-2 bottom-2 w-[1px] bg-neutral-900">
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="absolute inset-x-0 top-0 bottom-0 bg-white"
            />
          </div>

          {timelineData.map((node) => {
            const isActive = activeYear === node.year;
            return (
              <button
                key={node.year}
                onClick={() => scrollToYear(node.year)}
                className="relative flex items-center gap-4 group cursor-pointer focus:outline-none"
              >
                {/* Dot Indicator */}
                <div className="relative z-10 w-[15px] h-[15px] flex items-center justify-center">
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? "#ffffff" : "#262626",
                      transform: isActive ? "scale(1.2)" : "scale(1)"
                    }}
                  />
                </div>

                {/* Text labels */}
                <div className="hidden md:flex flex-col items-start text-left">
                  <span
                    className={cn(
                      "font-display text-sm font-black transition-colors duration-300",
                      isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                    )}
                  >
                    {node.year}
                  </span>
                  <span className="font-mono text-[8px] text-neutral-600 uppercase tracking-widest leading-none">
                    {node.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* RIGHT COLUMN: Scrolled timeline entries */}
      <div className="flex-1 space-y-32 md:py-12">
        {timelineData.map((node, index) => {
          const isActive = activeYear === node.year;
          return (
            <section
              key={node.year}
              data-year={node.year}
              data-timeline-section
              className="relative outline-none scroll-mt-24"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative transition-all duration-500",
                  isActive ? "opacity-100" : "opacity-20"
                )}
              >
                {/* Giant background year outline */}
                <div className="absolute -top-12 -left-4 font-display text-[7rem] md:text-[9rem] font-black text-neutral-900/10 pointer-events-none select-none select-none z-0">
                  {node.year}
                </div>

                <div className="relative z-10">
                  {/* Minimal Editorial Image */}
                  <div className="relative w-full max-w-xl aspect-[16/9] md:aspect-[21/9] rounded overflow-hidden mb-6 transition-all duration-700 border border-neutral-900 bg-neutral-950">
                    <img
                      src={node.image}
                      alt={node.title}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-700",
                        isActive ? "grayscale-0 opacity-100 scale-[1.02]" : "grayscale opacity-25 scale-100"
                      )}
                    />
                  </div>

                  {/* Header info */}
                  <div className="flex items-center gap-3 mb-2 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                    <span>0{index + 1}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-500" />
                    <span>{node.status}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-3">
                    {node.title}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl select-none">
                    {node.description}
                  </p>
                </div>
              </motion.div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
