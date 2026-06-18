"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Rocket, Sparkles, TrendingUp, Globe, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface TimelineNode {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  image: string;
  stats: { label: string; value: number; suffix?: string }[];
  status: string;
  hash: string;
}

const timelineData: TimelineNode[] = [
  {
    year: "2022",
    title: "The Beginning",
    description:
      "Started with a simple idea: make the web feel alive. Our first prototype was built in a garage with nothing but passion and coffee.",
    icon: <Rocket className="w-4 h-4" />,
    color: "#FF6B6B",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
    stats: [
      { label: "Core Team", value: 3 },
      { label: "Code Commits", value: 1200, suffix: "+" },
    ],
    status: "INIT_SEQUENCE",
    hash: "0x82FA9",
  },
  {
    year: "2023",
    title: "First Launch",
    description:
      "Released our beta to 10,000 users. The feedback was overwhelming. We knew we were onto something special.",
    icon: <Sparkles className="w-4 h-4" />,
    color: "#4ECDC4",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    stats: [
      { label: "Beta Users", value: 10000 },
      { label: "Net Revenue", value: 50000, suffix: "$" },
    ],
    status: "DEPLOYED_BETA",
    hash: "0x94B0C",
  },
  {
    year: "2024",
    title: "Rapid Growth",
    description:
      "Scaled to 100,000 users. Raised Series A. Expanded team to 25. Opened offices in SF and London.",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "#45B7D1",
    image: "https://images.unsplash.com/photo-1553729459-afe14f8b51e7?w=600&h=400&fit=crop",
    stats: [
      { label: "Active Users", value: 100000 },
      { label: "FTE Engineers", value: 25 },
    ],
    status: "SERIES_A_LOAD",
    hash: "0xE31CD",
  },
  {
    year: "2025",
    title: "Global Scale",
    description:
      "Now serving 1M+ users across 50 countries. IPO preparation underway. The journey continues.",
    icon: <Globe className="w-4 h-4" />,
    color: "#96CEB4",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
    stats: [
      { label: "Scale Reach", value: 1000000, suffix: "+" },
      { label: "Countries", value: 50 },
    ],
    status: "GLOBAL_ARRAY",
    hash: "0xF2AA9",
  },
];

// Custom spring-based count up component
function TechCounter({ value, active, suffix = "" }: { value: number; active: boolean; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const end = value;
    const duration = 1500; // ms
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const ease = progress * (2 - progress);
      const current = Math.floor(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value, active]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(0) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toString();
  };

  return (
    <span className="font-mono text-xl font-bold tracking-tight">
      {suffix === "$" ? `$${formatNumber(displayValue)}` : `${formatNumber(displayValue)}${suffix}`}
    </span>
  );
}

// 3D Parallax Image Component
function ParallaxImage({ src, alt, color }: { src: string; alt: string; color: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 20 });
  const y = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    x.set((mouseX / width) * 20); // max 20 degrees
    y.set((mouseY / height) * -20);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={alt}
      className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border border-neutral-900 cursor-crosshair group/img"
      style={{ perspective: 1000 }}
    >
      {/* Corner Brutalist Ticks */}
      <div className="absolute top-2 left-2 z-20 text-[10px] font-mono text-white/20 select-none pointer-events-none">+</div>
      <div className="absolute top-2 right-2 z-20 text-[10px] font-mono text-white/20 select-none pointer-events-none">+</div>
      <div className="absolute bottom-2 left-2 z-20 text-[10px] font-mono text-white/20 select-none pointer-events-none">+</div>
      <div className="absolute bottom-2 right-2 z-20 text-[10px] font-mono text-white/20 select-none pointer-events-none">+</div>

      <motion.div
        style={{
          rotateY: x,
          rotateX: y,
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="w-full h-full transition-shadow duration-300 group-hover/img:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
      >
        <div 
          className="absolute inset-0 transition-opacity duration-300 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent"
          style={{ mixBlendMode: "multiply" }}
        />
        <div 
          className="absolute inset-0 opacity-0 group-hover/img:opacity-15 transition-opacity duration-500"
          style={{
            backgroundColor: color,
            mixBlendMode: "color",
          }}
        />
      </motion.div>
    </div>
  );
}

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
      className="relative w-full max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row gap-12 bg-pure-black border border-border-hairline rounded-xl overflow-hidden select-none"
    >
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* LEFT COLUMN: Sticky Navigation Rail */}
      <aside className="md:sticky md:top-24 h-fit md:w-48 shrink-0 flex md:flex-col items-center md:items-start gap-6 select-none z-20">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] text-white border border-white/20 px-2 py-0.5 tracking-widest font-bold w-fit mb-2 uppercase select-none">
            LOG_PROTOCOL
          </span>
          <h2 className="font-display text-2xl font-black text-white tracking-tighter uppercase">
            OUR TIMELINE
          </h2>
        </div>

        {/* Navigation buttons */}
        <div className="relative flex md:flex-col w-full gap-4 md:gap-6 pt-4 border-t border-border-hairline md:border-t-0 md:pt-0">
          {/* Vertical progress line (desktop only) */}
          <div className="hidden md:block absolute left-3.5 top-2 bottom-2 w-[1px] bg-neutral-900">
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-[#FF6B6B] via-[#45B7D1] to-[#96CEB4]"
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
                <div className="relative z-10 w-7 h-7 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center transition-all duration-300 group-hover:border-white/40">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      isActive ? "scale-125" : "bg-neutral-800"
                    )}
                    style={{ backgroundColor: isActive ? node.color : undefined }}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="active-dot-glow"
                      className="absolute inset-0 rounded-full border opacity-50"
                      style={{ borderColor: node.color }}
                      transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    />
                  )}
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

      {/* RIGHT COLUMN: Scrolled timeline cards */}
      <div className="flex-1 space-y-24 md:py-12">
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
                  "relative p-6 bg-neutral-950/40 border transition-all duration-500 rounded-xl overflow-hidden backdrop-blur-md",
                  isActive
                    ? "border-neutral-800 shadow-[0_0_50px_rgba(255,255,255,0.02)]"
                    : "border-border-hairline/40 opacity-40 hover:opacity-70"
                )}
              >
                {/* 3D Parallax Image */}
                <div className="mb-6">
                  <ParallaxImage src={node.image} alt={node.title} color={node.color} />
                </div>

                {/* Card Title & Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-border-hairline pb-4 select-none">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                        PROTOCOL_PHASE // 0{index + 1}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: node.color }}
                      />
                    </div>
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-neutral-100">
                      {node.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col text-right font-mono text-[9px]">
                      <span className="text-neutral-500">HASH:</span>
                      <span className="text-neutral-300 font-bold">{node.hash}</span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border"
                      style={{
                        borderColor: `${node.color}25`,
                        color: node.color,
                        backgroundColor: `${node.color}10`,
                      }}
                    >
                      {node.icon}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="font-body text-xs text-text-muted leading-relaxed mb-6 select-none">
                  {node.description}
                </p>

                {/* Technical stats container */}
                <div className="grid grid-cols-2 gap-4 bg-[#050505] border border-border-hairline/80 p-4 rounded-lg select-none relative">
                  {/* Corner Brutalist Ticks for stats container */}
                  <div className="absolute -top-1 -left-1 text-[8px] font-mono text-neutral-800 pointer-events-none">+</div>
                  <div className="absolute -top-1 -right-1 text-[8px] font-mono text-neutral-800 pointer-events-none">+</div>
                  <div className="absolute -bottom-1 -left-1 text-[8px] font-mono text-neutral-800 pointer-events-none">+</div>
                  <div className="absolute -bottom-1 -right-1 text-[8px] font-mono text-neutral-800 pointer-events-none">+</div>

                  {node.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col">
                      <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest leading-none mb-1">
                        {stat.label}
                      </span>
                      <TechCounter value={stat.value} active={isActive} suffix={stat.suffix} />
                    </div>
                  ))}
                </div>

                {/* Sticky Action Hook */}
                <div className="mt-5 flex items-center justify-end text-neutral-500 hover:text-white transition-colors duration-200 cursor-pointer select-none">
                  <span className="font-mono text-[9px] uppercase tracking-widest mr-1">
                    read_full_spec
                  </span>
                  <ArrowRight className="w-3 h-3 translate-y-[0.5px] group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
