"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  Video, 
  Layers,
  Search,
  ArrowRight
} from 'lucide-react';

const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ─── 1. TYPES & INTERFACES ───
export type CardType = 'strategy' | 'platform' | 'stats' | 'system';

export interface CardData {
  id: string;
  tag: string;
  title: string;
  description: string;
  type: CardType;
  floatDuration?: number;
  floatAmplitudeY?: number;
  floatAmplitudeRotate?: number;
}

export interface PremiumHeroProps {
  title?: string;
  subtitle?: string;
  cards?: CardData[];
  ctaText?: string;
  onSearchSubmit?: (query: string) => void;
}

// ─── 2. UTILS ───
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── 3. HOOKS & CONTEXT ───

// Mouse Parallax Hook
function useMouseParallax(springConfig = { stiffness: 180, damping: 18, mass: 0.8 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      x.set(0);
      y.set(0);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const normalizedX = (event.clientX - width / 2) / (width / 2);
      const normalizedY = (event.clientY - height / 2) / (height / 2);

      x.set(normalizedX);
      y.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [x, y]);

  return { x: springX, y: springY };
}

// Mouse Parallax Context
interface MouseParallaxContextType {
  x: ReturnType<typeof useMouseParallax>['x'];
  y: ReturnType<typeof useMouseParallax>['y'];
}

const MouseParallaxContext = createContext<MouseParallaxContextType | null>(null);

const MouseParallaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mouse = useMouseParallax();
  return (
    <MouseParallaxContext.Provider value={mouse}>
      <div className="relative w-full h-full">
        {children}
      </div>
    </MouseParallaxContext.Provider>
  );
};

function useMouseParallaxContext() {
  const context = useContext(MouseParallaxContext);
  if (!context) {
    throw new Error('useMouseParallaxContext must be used within a MouseParallaxProvider');
  }
  return context;
}

// GPU Sine Wave Float Hook
function useFloating(
  ref: React.RefObject<HTMLElement | null>,
  { duration = 6.0, amplitudeY = 10, amplitudeRotate = 2 } = {}
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      element.style.setProperty("--float-y", "0px");
      element.style.setProperty("--float-r", "0deg");
      return;
    }

    let animationFrameId: number;
    const randomOffset = Math.random() * 10000;
    const startTime = performance.now() + randomOffset;

    const updatePosition = (timestamp: number) => {
      const elapsedSeconds = (timestamp - startTime) / 1000;
      const frequency = (2 * Math.PI) / duration;

      const yOffset = Math.sin(elapsedSeconds * frequency) * amplitudeY;
      const rotateOffset = Math.cos(elapsedSeconds * frequency) * amplitudeRotate;

      element.style.setProperty("--float-y", `${yOffset.toFixed(3)}px`);
      element.style.setProperty("--float-r", `${rotateOffset.toFixed(3)}deg`);

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [ref, duration, amplitudeY, amplitudeRotate]);
}

// ─── 4. SUBCOMPONENTS ───

// Animated Counter
const AnimatedCounter: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({
  value,
  duration = 2.0,
  prefix = "",
  suffix = ""
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    let activeAnimation: { stop: () => void } | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          activeAnimation = animate(0, value, {
            duration,
            ease: "easeOut",
            onUpdate: (latest) => {
              setDisplayValue(Math.round(latest));
            }
          });
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
      if (activeAnimation) {
        activeAnimation.stop();
      }
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

// Navbar
const Navbar: React.FC = () => {
  const [activeLink, setActiveLink] = useState('Engine');
  const links = ['Engine', 'Showcase', 'Growth OS', 'Pricing'];

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.8 }}
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between w-full max-w-[1400px] mx-auto px-6 py-6 bg-transparent"
    >
      <div className="flex items-center gap-2 select-none">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-black overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <span className="font-mono text-white text-sm font-black">▲</span>
        </div>
        <span className="font-body font-bold text-base tracking-tight text-black">
          adgrid.
        </span>
      </div>

      <div className="flex items-center gap-6 md:gap-8 bg-white/40 backdrop-blur-md border border-black/[0.03] shadow-[0_2px_12px_rgba(0,0,0,0.02)] px-6 py-2 rounded-full">
        {links.map((link) => {
          const isActive = activeLink === link;
          return (
            <button
              key={link}
              onClick={() => setActiveLink(link)}
              className="relative py-1 text-xs md:text-sm font-medium tracking-tight cursor-pointer transition-all duration-200 hover:-translate-y-0.5 outline-none select-none text-gray-500 hover:text-black focus-visible:ring-2 focus-visible:ring-black/20 rounded-lg px-2 font-body"
            >
              <span className={`transition-opacity duration-200 ${isActive ? 'text-black font-semibold' : 'text-gray-500'}`}>
                {link}
              </span>
              {isActive && (
                <motion.span
                  layoutId="activeDot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="hidden sm:block">
        <button className="px-5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-semibold tracking-tight shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer">
          Launch App
        </button>
      </div>
    </motion.nav>
  );
};

// Background Notes
const BackgroundNotes: React.FC = () => {
  const mouse = useMouseParallaxContext();

  const xLeft = useTransform(mouse.x, [-1, 1], [15, -15]);
  const yLeft = useTransform(mouse.y, [-1, 1], [15, -15]);

  const xRightBottom = useTransform(mouse.x, [-1, 1], [-12, 12]);
  const yRightBottom = useTransform(mouse.y, [-1, 1], [-12, 12]);

  const xRightTop = useTransform(mouse.x, [-1, 1], [8, -8]);
  const yRightTop = useTransform(mouse.y, [-1, 1], [8, -8]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <motion.div
        style={{ x: xLeft, y: yLeft }}
        initial={{ opacity: 0, rotate: -8, scale: 0.95 }}
        animate={{ opacity: 0.1, rotate: -6, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.2, type: "spring", stiffness: 100 }}
        className="absolute top-[28%] left-[8%] md:left-[14%] font-body text-lg md:text-xl lg:text-2xl text-neutral-400 select-none"
      >
        built for speed ✨
      </motion.div>

      <motion.div
        style={{ x: xRightBottom, y: yRightBottom }}
        initial={{ opacity: 0, rotate: 6, scale: 0.95 }}
        animate={{ opacity: 0.08, rotate: 4, scale: 1 }}
        transition={{ delay: 0.35, duration: 1.2, type: "spring", stiffness: 100 }}
        className="absolute bottom-[22%] right-[10%] md:right-[15%] font-body text-lg md:text-2xl text-neutral-400 select-none"
      >
        fully managed ⚡
      </motion.div>

      <motion.div
        style={{ x: xRightTop, y: yRightTop }}
        initial={{ opacity: 0, rotate: -4, scale: 0.95 }}
        animate={{ opacity: 0.08, rotate: -2, scale: 1 }}
        transition={{ delay: 0.45, duration: 1.2, type: "spring", stiffness: 100 }}
        className="absolute top-[26%] right-[12%] md:right-[20%] font-body text-sm md:text-base lg:text-lg text-neutral-400 select-none"
      >
        // zero friction
      </motion.div>
    </div>
  );
};

// SearchBar
const GOALS = [
  "Scale my personal brand to 1M...",
  "Launch my SaaS to $10k MRR...",
  "Grow newsletter to 50k subscribers...",
  "Rank #1 on Product Hunt..."
];

const SearchBar: React.FC<{ onSubmit?: (query: string) => void }> = ({ onSubmit }) => {
  const mouse = useMouseParallaxContext();
  
  const [goalIndex, setGoalIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  const rotateX = useTransform(mouse.y, [-1, 1], [2, -2]);
  const rotateY = useTransform(mouse.x, [-1, 1], [-2, 2]);
  const x = useTransform(mouse.x, [-1, 1], [-4, 4]);
  const y = useTransform(mouse.y, [-1, 1], [-4, 4]);

  useEffect(() => {
    if (isFocused) {
      setPlaceholderText("");
      return;
    }

    const currentGoal = GOALS[goalIndex];
    const typingSpeed = isDeleting ? 25 : 55;
    let timer: NodeJS.Timeout;

    if (!isDeleting && placeholderText === currentGoal) {
      timer = setTimeout(() => setIsDeleting(true), 2800);
    } else if (isDeleting && placeholderText === "") {
      setIsDeleting(false);
      setGoalIndex((prev) => (prev + 1) % GOALS.length);
    } else {
      timer = setTimeout(() => {
        setPlaceholderText(
          isDeleting
            ? currentGoal.substring(0, placeholderText.length - 1)
            : currentGoal.substring(0, placeholderText.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, goalIndex, isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(query);
    }
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, x, y, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.9, type: "spring", stiffness: 180, damping: 18, mass: 0.8 }}
      className="relative w-full max-w-md md:max-w-lg mx-auto z-30 px-4"
    >
      <div
        className={cn(
          "w-full flex items-center gap-3 bg-neutral-50/90 backdrop-blur-md border rounded-full px-6 py-4 transition-all duration-500 ease-out select-none",
          isFocused 
            ? 'border-neutral-400 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.01)] scale-[1.02]' 
            : 'border-neutral-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.01)] hover:border-neutral-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.04)]'
        )}
      >
        <Search className={cn("w-5 h-5 transition-colors duration-300", isFocused ? 'text-black' : 'text-neutral-400')} />
        
        <div className="relative flex-1 flex items-center">
          {!isFocused && query === "" && (
            <div className="absolute left-0 text-neutral-400 text-sm md:text-base font-normal pointer-events-none select-none flex items-center font-body">
              <span>{placeholderText}</span>
              <span className="w-[1.5px] h-4 bg-neutral-400 ml-[1px] animate-pulse" />
            </div>
          )}
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-neutral-900 placeholder-transparent text-sm md:text-base font-medium py-0.5 focus:ring-0 font-body"
            aria-label="What's your growth goal?"
          />
        </div>
      </div>
    </motion.div>
  );
};

// CTA Button
const CTAButton: React.FC<{ text?: string; onClick?: () => void }> = ({ text = "Start Your Engine", onClick }) => {
  return (
    <div className="flex justify-center z-30 relative">
      <motion.button
        onClick={onClick}
        whileHover="hover"
        whileTap="press"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        variants={{
          hover: { 
            scale: 1.03, 
            y: -2,
            transition: { type: "spring", stiffness: 350, damping: 15 }
          },
          press: { 
            scale: 0.96, 
            y: 0,
            transition: { type: "spring", stiffness: 500, damping: 10 }
          }
        }}
        transition={{ delay: 1.1, type: "spring", stiffness: 180, damping: 18, mass: 0.8 }}
        className="flex items-center gap-4 bg-neutral-900 text-white hover:bg-black px-8 py-4 rounded-full font-body text-sm font-semibold tracking-tight shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.22)] transition-all duration-300 cursor-pointer select-none group outline-none focus-visible:ring-4 focus-visible:ring-neutral-400"
      >
        <span>{text}</span>
        
        <div className="relative w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-white/20">
          <motion.div
            variants={{
              hover: { 
                x: [0, 24, -24, 0],
                transition: { times: [0, 0.35, 0.36, 1], duration: 0.45, ease: "easeInOut" } 
              }
            }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
};

// FloatingCard
const FloatingCard: React.FC<{ card: CardData; index: number }> = ({ card, index }) => {
  const mouse = useMouseParallaxContext();
  const cardRef = useRef<HTMLDivElement>(null);

  const duration = card.floatDuration ?? (index === 0 ? 7.0 : index === 1 ? 5.5 : index === 2 ? 6.8 : 8.0);
  const amplitudeY = card.floatAmplitudeY ?? (index === 0 ? 8 : index === 1 ? 12 : index === 2 ? 10 : 9);
  const amplitudeRotate = card.floatAmplitudeRotate ?? (index === 0 ? 2 : index === 1 ? 1 : index === 2 ? 3 : 2);

  useFloating(cardRef, { duration, amplitudeY, amplitudeRotate });

  const rotateX = useTransform(mouse.y, [-1, 1], [3.5, -3.5]);
  const rotateY = useTransform(mouse.x, [-1, 1], [-3.5, 3.5]);
  const cardX = useTransform(mouse.x, [-1, 1], [-8, 8]);
  const cardY = useTransform(mouse.y, [-1, 1], [-8, 8]);

  const getTheme = () => {
    switch (card.type) {
      case 'strategy':
        return {
          bg: 'bg-sky-50/70 border-sky-100/60 shadow-[0_20px_50px_rgba(186,230,253,0.25),0_1px_3px_rgba(14,165,233,0.02)]',
          tagText: 'text-sky-600 bg-sky-100/60',
          title: 'text-sky-950',
          icon: <Video className="w-4 h-4 text-sky-500" />
        };
      case 'platform':
        return {
          bg: 'bg-emerald-50/70 border-emerald-100/60 shadow-[0_20px_50px_rgba(167,243,208,0.25),0_1px_3px_rgba(16,185,129,0.02)]',
          tagText: 'text-emerald-600 bg-emerald-100/60',
          title: 'text-emerald-950',
          icon: <Layers className="w-4 h-4 text-emerald-500" />
        };
      case 'stats':
        return {
          bg: 'bg-orange-50/70 border-orange-100/60 shadow-[0_20px_50px_rgba(254,215,170,0.25),0_1px_3px_rgba(249,115,22,0.02)]',
          tagText: 'text-orange-600 bg-orange-100/60',
          title: 'text-orange-950',
          icon: <TrendingUp className="w-4 h-4 text-orange-500" />
        };
      case 'system':
      default:
        return {
          bg: 'bg-purple-50/70 border-purple-100/60 shadow-[0_20px_50px_rgba(233,213,252,0.25),0_1px_3px_rgba(168,85,247,0.02)]',
          tagText: 'text-purple-600 bg-purple-100/60',
          title: 'text-purple-950',
          icon: <Sparkles className="w-4 h-4 text-purple-500" />
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div
      style={{ x: cardX, y: cardY, rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.15, type: "spring", stiffness: 180, damping: 18, mass: 0.8 }}
      className="w-[280px] md:w-[310px] select-none"
    >
      <div
        ref={cardRef}
        style={{
          transform: "translate3d(0, var(--float-y, 0px), 0) rotate(var(--float-r, 0deg))",
          transformStyle: "preserve-3d"
        }}
        className={cn(
          "relative overflow-hidden rounded-[32px] border p-6 backdrop-blur-[12px] flex flex-col justify-between min-h-[220px] transition-colors duration-500 ease-out will-change-transform",
          theme.bg
        )}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes waveMove {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes shimmerMove {
            0% { transform: translate3d(-100%, 0, 0); }
            100% { transform: translate3d(150%, 0, 0); }
          }
          .animate-wave-flow {
            animation: waveMove 18s linear infinite;
          }
          .animate-studio-shimmer {
            animation: shimmerMove 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}} />

        <div className="flex items-center justify-between mb-4">
          <span className={cn("px-3 py-1 text-[10px] font-bold tracking-wider rounded-full font-body", theme.tagText)}>
            {card.tag}
          </span>
          {theme.icon}
        </div>

        <div className="flex-1 flex flex-col justify-start mb-6">
          <h3 className={cn("font-body text-lg font-bold mb-1 tracking-tight", theme.title)}>
            {card.title}
          </h3>
          <p className="text-xs md:text-sm text-neutral-600 leading-relaxed tracking-tight font-medium font-body">
            {card.description}
          </p>
        </div>

        <div className="relative mt-auto w-full pt-2 flex items-center justify-center">
          {card.type === 'strategy' && (
            <div className="absolute -bottom-6 -left-6 -right-6 h-12 overflow-hidden pointer-events-none rounded-b-[32px]">
              <div className="flex w-[200%] h-full opacity-30 animate-wave-flow">
                <svg viewBox="0 0 1200 120" className="w-1/2 h-full fill-sky-400 preserve-aspect-ratio" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z"></path>
                </svg>
                <svg viewBox="0 0 1200 120" className="w-1/2 h-full fill-sky-400 preserve-aspect-ratio" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z"></path>
                </svg>
              </div>
            </div>
          )}

          {card.type === 'platform' && (
            <div className="flex items-center justify-around w-full px-2 gap-4 pb-1">
              {[
                { icon: <YoutubeIcon className="w-5 h-5 text-red-500" />, name: 'YouTube' },
                { icon: <InstagramIcon className="w-5 h-5 text-pink-500" />, name: 'Instagram' },
                { icon: <TwitterIcon className="w-5 h-5 text-sky-500" />, name: 'Twitter' },
                { icon: <MessageSquare className="w-5 h-5 text-neutral-800" />, name: 'TikTok' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.18, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                  className="p-2 rounded-xl bg-white/60 border border-emerald-100/50 shadow-sm flex items-center justify-center cursor-pointer"
                  aria-label={item.name}
                >
                  {item.icon}
                </motion.div>
              ))}
            </div>
          )}

          {card.type === 'stats' && (
            <div className="flex items-center justify-between w-full border-t border-orange-100/60 pt-4 mt-2">
              <span className="font-body text-3xl font-black text-orange-600 tracking-tight">
                <AnimatedCounter value={412} prefix="+" suffix="%" />
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider font-body">
                  Viral
                </span>
              </div>
            </div>
          )}

          {card.type === 'system' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 opacity-80 animate-studio-shimmer" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// FloatingCards wrapper
const FloatingCards: React.FC<{ cards: CardData[] }> = ({ cards }) => {
  if (!cards || cards.length < 4) return null;

  const desktopPositionClasses = [
    "lg:top-[22%] lg:left-[2%] xl:left-[6%]",
    "lg:bottom-[15%] lg:left-[4%] xl:left-[8%]",
    "lg:top-[22%] lg:right-[2%] xl:right-[6%]",
    "lg:bottom-[15%] lg:right-[4%] xl:right-[8%]"
  ];

  return (
    <>
      <div className="flex lg:hidden flex-col md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-6 items-center gap-6 mt-16 px-4 w-full max-w-2xl mx-auto z-20 relative">
        {cards.map((card, index) => (
          <div key={card.id} className="relative pointer-events-auto">
            <FloatingCard card={card} index={index} />
          </div>
        ))}
      </div>

      <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-20">
        {cards.map((card, index) => {
          const positionClass = desktopPositionClasses[index] || "";
          return (
            <div key={card.id} className={cn("absolute pointer-events-auto", positionClass)}>
              <FloatingCard card={card} index={index} />
            </div>
          );
        })}
      </div>
    </>
  );
};

// ─── 5. MAIN ORCHESTRATOR ───
const DEFAULT_CARDS: CardData[] = [
  {
    id: "strategy-card",
    tag: "STRATEGY",
    title: "Short-Form Mastery",
    description: "Retention-first editing for TikTok & Reels.",
    type: "strategy"
  },
  {
    id: "platform-card",
    tag: "PLATFORM",
    title: "Multi-Channel",
    description: "One video. Four platforms. Zero friction.",
    type: "platform"
  },
  {
    id: "stats-card",
    tag: "LIVE STATS",
    title: "Performance",
    description: "Audience growth analytics compiled daily.",
    type: "stats"
  },
  {
    id: "system-card",
    tag: "SYSTEM",
    title: "Growth Studio",
    description: "End-to-end production for high-output creators.",
    type: "system"
  }
];

const PremiumHeroContent: React.FC<Required<Omit<PremiumHeroProps, 'onSearchSubmit'>> & { onSearchSubmit?: (query: string) => void }> = ({
  title,
  subtitle,
  cards,
  ctaText,
  onSearchSubmit
}) => {
  const mouse = useMouseParallaxContext();

  const headingX = useTransform(mouse.x, [-1, 1], [-5, 5]);
  const headingY = useTransform(mouse.y, [-1, 1], [-5, 5]);

  const glow1X = useTransform(mouse.x, [-1, 1], [-30, 30]);
  const glow1Y = useTransform(mouse.y, [-1, 1], [-30, 30]);

  const glow2X = useTransform(mouse.x, [-1, 1], [25, -25]);
  const glow2Y = useTransform(mouse.y, [-1, 1], [25, -25]);

  const words = title.split(" ");
  const line1Words = words.slice(0, 2);
  const line2Words = words.slice(2);

  const wordEntryVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (customIndex: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + customIndex * 0.08,
        type: "spring",
        stiffness: 180,
        damping: 18,
        mass: 0.8
      }
    })
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-x-hidden bg-white select-none">
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #ffffff 0%, #ffffff 100%),
            linear-gradient(to right, rgba(0, 0, 0, 0.01) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.01) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px"
        }}
      >
        <motion.div
          style={{ x: glow1X, y: glow1Y }}
          className="absolute top-[25%] left-[20%] w-[350px] h-[350px] rounded-full bg-sky-100/50 blur-[100px] will-change-transform"
        />
        <motion.div
          style={{ x: glow2X, y: glow2Y }}
          className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-purple-100/50 blur-[120px] will-change-transform"
        />
        <div className="absolute top-[40%] right-[35%] w-[250px] h-[250px] rounded-full bg-orange-50/50 blur-[80px]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes headingFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-heading-float {
          animation: headingFloat 8s ease-in-out infinite;
        }
      `}} />

      <Navbar />
      <BackgroundNotes />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-24 flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 180, damping: 18 }}
          className="font-body text-xs md:text-sm text-neutral-400 mb-4 tracking-wider rotate-[-1deg] select-none"
        >
          {subtitle}
        </motion.div>

        <motion.div
          style={{ x: headingX, y: headingY }}
          className="animate-heading-float mb-10 w-full select-none"
        >
          <h1 className="font-handwritten text-[clamp(2.5rem,8vw,5.5rem)] font-normal leading-[1.05] tracking-wide text-neutral-900 flex flex-col items-center">
            <span className="flex flex-wrap justify-center gap-x-4">
              {line1Words.map((word, idx) => (
                <motion.span
                  key={`w1-${idx}`}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={wordEntryVariants}
                  className="inline-block cursor-default"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="flex flex-wrap justify-center gap-x-4 mt-2">
              {line2Words.map((word, idx) => (
                <motion.span
                  key={`w2-${idx}`}
                  custom={line1Words.length + idx}
                  initial="hidden"
                  animate="visible"
                  variants={wordEntryVariants}
                  className="inline-block cursor-default text-black"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>
        </motion.div>

        <SearchBar onSubmit={onSearchSubmit} />

        <div className="mt-10">
          <CTAButton text={ctaText} />
        </div>
      </div>

      <FloatingCards cards={cards} />
    </div>
  );
};

export const PremiumHero: React.FC<PremiumHeroProps> = ({
  title = "What's your growth goal?",
  subtitle = "built for speed",
  cards = DEFAULT_CARDS,
  ctaText = "Start Your Engine",
  onSearchSubmit
}) => {
  return (
    <MouseParallaxProvider>
      <PremiumHeroContent
        title={title}
        subtitle={subtitle}
        cards={cards}
        ctaText={ctaText}
        onSearchSubmit={onSearchSubmit}
      />
    </MouseParallaxProvider>
  );
};

export default PremiumHero;
