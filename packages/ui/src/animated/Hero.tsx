"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════
// SVG PIXEL ART ICONS (HAND-CODED)
// ═══════════════════════════════════════

function PixelFlower({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 2.375} viewBox="0 0 64 152" className="overflow-visible select-none">
      <rect x="28" y="96" width="8" height="56" fill="var(--color-green, #2E7D32)" />
      <rect x="20" y="56" width="24" height="16" fill="var(--color-yellow, #F5C400)" />
      <rect x="20" y="88" width="24" height="16" fill="var(--color-yellow, #F5C400)" />
      <rect x="4" y="72" width="16" height="16" fill="var(--color-yellow, #F5C400)" />
      <rect x="44" y="72" width="16" height="16" fill="var(--color-yellow, #F5C400)" />
      <rect x="20" y="72" width="24" height="16" fill="var(--color-brown, #4A2E0A)" />
    </svg>
  );
}

function PixelHeart({ size = 32, fill }: { size?: number; fill?: string }) {
  const color = fill || "var(--color-red, #E8452C)";
  return (
    <svg width={size} height={size} viewBox="0 0 7 6" className="overflow-visible select-none">
      <rect x="1" y="0" width="2" height="1" fill={color} />
      <rect x="4" y="0" width="2" height="1" fill={color} />
      <rect x="0" y="1" width="7" height="1" fill={color} />
      <rect x="0" y="2" width="7" height="1" fill={color} />
      <rect x="1" y="3" width="5" height="1" fill={color} />
      <rect x="2" y="4" width="3" height="1" fill={color} />
      <rect x="3" y="5" width="1" height="1" fill={color} />
    </svg>
  );
}

function PixelStar({ size = 32, fill }: { size?: number; fill?: string }) {
  const color = fill || "var(--color-yellow, #F5C400)";
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" className="overflow-visible select-none">
      <rect x="3" y="0" width="1" height="1" fill={color} />
      <rect x="2" y="1" width="3" height="1" fill={color} />
      <rect x="0" y="2" width="7" height="1" fill={color} />
      <rect x="1" y="3" width="5" height="1" fill={color} />
      <rect x="2" y="4" width="3" height="1" fill={color} />
      <rect x="1" y="5" width="1" height="1" fill={color} />
      <rect x="5" y="5" width="1" height="1" fill={color} />
      <rect x="0" y="6" width="1" height="1" fill={color} />
      <rect x="6" y="6" width="1" height="1" fill={color} />
    </svg>
  );
}

function PixelSkull({ size = 32, fill }: { size?: number; fill?: string }) {
  const color = fill || "#FFFFFF";
  return (
    <svg width={size} height={size} viewBox="0 0 6 6" className="overflow-visible select-none">
      <rect x="1" y="0" width="4" height="1" fill={color} />
      <rect x="0" y="1" width="6" height="1" fill={color} />
      <rect x="0" y="2" width="1" height="1" fill={color} />
      <rect x="2" y="2" width="2" height="1" fill={color} />
      <rect x="5" y="2" width="1" height="1" fill={color} />
      <rect x="0" y="3" width="6" height="1" fill={color} />
      <rect x="1" y="4" width="1" height="1" fill={color} />
      <rect x="3" y="4" width="1" height="1" fill={color} />
      <rect x="4" y="4" width="1" height="1" fill={color} />
      <rect x="1" y="5" width="4" height="1" fill={color} />
    </svg>
  );
}

function PixelCrown({ size = 32, fill }: { size?: number; fill?: string }) {
  const color = fill || "var(--color-yellow, #F5C400)";
  return (
    <svg width={size} height={size} viewBox="0 0 5 3" className="overflow-visible select-none">
      <rect x="0" y="0" width="1" height="1" fill={color} />
      <rect x="2" y="0" width="1" height="1" fill={color} />
      <rect x="4" y="0" width="1" height="1" fill={color} />
      <rect x="0" y="1" width="5" height="1" fill={color} />
      <rect x="0" y="2" width="5" height="1" fill={color} />
    </svg>
  );
}

function PixelGhost({ size = 32, fill }: { size?: number; fill?: string }) {
  const color = fill || "var(--color-green, #2E7D32)";
  return (
    <svg width={size} height={size} viewBox="0 0 5 6" className="overflow-visible select-none">
      <rect x="1" y="0" width="3" height="1" fill={color} />
      <rect x="0" y="1" width="5" height="1" fill={color} />
      <rect x="0" y="2" width="1" height="1" fill={color} />
      <rect x="2" y="2" width="1" height="1" fill={color} />
      <rect x="4" y="2" width="1" height="1" fill={color} />
      <rect x="0" y="3" width="5" height="1" fill={color} />
      <rect x="0" y="4" width="5" height="1" fill={color} />
      <rect x="0" y="5" width="1" height="1" fill={color} />
      <rect x="2" y="5" width="1" height="1" fill={color} />
      <rect x="4" y="5" width="1" height="1" fill={color} />
    </svg>
  );
}

function PixelCross({ size = 16, colors = ["#F5C400", "#E8452C", "#2E7D32"] }: { size?: number; colors?: string[] }) {
  const unit = size / 3;
  return (
    <svg width={size} height={size * 1.66} viewBox={`0 0 ${unit * 3} ${unit * 5}`} className="overflow-visible select-none">
      <rect x={unit} y={0} width={unit} height={unit} fill={colors[0]} />
      <rect x={0} y={unit} width={unit} height={unit} fill={colors[1]} />
      <rect x={unit} y={unit} width={unit} height={unit} fill={colors[1]} />
      <rect x={unit * 2} y={unit} width={unit} height={unit} fill={colors[1]} />
      <rect x={unit} y={unit * 2} width={unit} height={unit} fill={colors[2]} />
      <rect x={unit} y={unit * 3} width={unit} height={unit} fill={colors[2]} />
    </svg>
  );
}

// ═══════════════════════════════════════
// FONT STYLING DICTIONARIES
// ═══════════════════════════════════════

const displayFonts = {
  instrument: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap');",
    family: "'Instrument Serif', serif",
  },
  fraunces: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,100..900&display=swap');",
    family: "'Fraunces', serif",
  },
  playfair: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400..900&display=swap');",
    family: "'Playfair Display', serif",
  },
  newsreader: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@1,6..72,200..800&display=swap');",
    family: "'Newsreader', serif",
  },
  custom: {
    import: "",
    family: "inherit",
  },
};

const monoFonts = {
  dotgothic: {
    import: "@import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');",
    family: "'DotGothic16', sans-serif",
  },
  silkscreen: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap');",
    family: "'Silkscreen', monospace",
  },
  pressstart: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');",
    family: "'Press Start 2P', monospace",
  },
  vt323: {
    import: "@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');",
    family: "'VT323', monospace",
  },
  pixelify: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap');",
    family: "'Pixelify Sans', sans-serif",
  },
  jersey: {
    import: "@import url('https://fonts.googleapis.com/css2?family=Jersey+10&display=swap');",
    family: "'Jersey 10', sans-serif",
  },
};

// Seedable LCG randomizer to keep layout consistent across SSR / CSR
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface HeroProps {
  name: string;
  navLinks?: { label: string; href: string; hasDropdown?: boolean }[];
  socials?: { label: string; href: string }[];
  availability?: string;
  availabilityDate?: string;
  scrollLabel?: string;
  copyrightName?: string;
  bgColor?: string;
  accentColors?: string[];
  fontFamily?: "instrument" | "fraunces" | "playfair" | "newsreader" | "custom";
  monoFontFamily?: "dotgothic" | "silkscreen" | "pressstart" | "vt323" | "pixelify" | "jersey";
  gridOpacity?: number;
  
  // Custom refined icon configuration
  mainIcon?: React.ReactNode;
  iconVariant?: "flower" | "heart" | "star" | "skull" | "crown" | "ghost" | "none";
  iconAnimation?: "static" | "hover-bloom" | "idle-loop" | "scroll-linked" | "clickable";
  iconPosition?: "inline" | "top-right" | "bottom-right" | "top-left" | "bottom-left";
  iconSize?: number;
  iconRotation?: number;
  introduction?: string;

  // Background floating icons
  backgroundIconVariant?: "flower" | "heart" | "star" | "skull" | "crown" | "ghost" | "cross";
  backgroundIconCount?: number;
  pixelDensity?: "sparse" | "medium" | "dense";
  crossPositions?: { x: number; y: number; size: number }[];
  enableParallax?: boolean;
  animationSpeed?: "slow" | "normal" | "fast";
  hideFooter?: boolean;
  hideNav?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
}

export function Hero({
  name = "stephanie",
  navLinks = [
    { label: "WORKS", href: "#", hasDropdown: true },
    { label: "LABS", href: "#" },
    { label: "ABOUT", href: "#" }
  ],
  socials = [
    { label: "IG", href: "#" },
    { label: "LI", href: "#" },
    { label: "TW", href: "#" }
  ],
  availability = "AVAILABLE FOR FREELANCE",
  availabilityDate = "JUL 2026",
  scrollLabel = "↓ SCROLL",
  copyrightName,
  bgColor = "#1E3FEB",
  accentColors = ["#F5C400", "#E8452C", "#2E7D32"],
  fontFamily = "instrument",
  monoFontFamily = "dotgothic",
  gridOpacity = 0.06,
  
  mainIcon,
  iconVariant = "flower",
  iconAnimation = "static",
  iconPosition = "inline",
  iconSize = 36,
  iconRotation = 0,
  introduction = "I build high-end interactive visual systems and graphics for digital exhibitions, museums, and products.",

  backgroundIconVariant = "cross",
  backgroundIconCount,
  pixelDensity = "medium",
  crossPositions,
  enableParallax = true,
  animationSpeed = "normal",
  hideFooter = false,
  hideNav = false
}: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [idleLoopActive, setIdleLoopActive] = useState(true);

  const { scrollY } = useScroll();

  // Mouse Parallax coordinates mapping
  const mouseXRaw = useMotionValue(0);
  const mouseYRaw = useMotionValue(0);

  const mouseX = useSpring(mouseXRaw, { stiffness: 80, damping: 20 });
  const mouseY = useSpring(mouseYRaw, { stiffness: 80, damping: 20 });

  const pxOffset = useTransform(mouseX, [-400, 400], [-12, 12]);
  const pyOffset = useTransform(mouseY, [-400, 400], [-12, 12]);

  // Handle tracking mouse coordinates relative to container center
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !enableParallax) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      mouseXRaw.set(x);
      mouseYRaw.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enableParallax, mouseXRaw, mouseYRaw]);

  // 1. Dynamic Font Injection
  const fontStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
    ${displayFonts[fontFamily].import}
    ${monoFonts[monoFontFamily].import}
    :root {
      --font-display: ${displayFonts[fontFamily].family};
      --font-mono: ${monoFonts[monoFontFamily].family};
      --color-yellow: ${accentColors[0] || "#F5C400"};
      --color-red: ${accentColors[1] || "#E8452C"};
      --color-green: ${accentColors[2] || "#2E7D32"};
    }
  `;

  // 2. Generate Floating Background Icons Position Layout
  const generatedCrosses = useMemo(() => {
    const count = backgroundIconCount !== undefined
      ? backgroundIconCount
      : (pixelDensity === "sparse" ? 5 : pixelDensity === "medium" ? 8 : 12);

    const random = seededRandom(1337); // fixed layout seed
    const coordinates: { x: number; y: number; size: number }[] = [];

    if (crossPositions && crossPositions.length > 0) {
      return crossPositions;
    }

    // Dynamically scale grid size to fit requested count cleanly
    const cols = count > 15 ? 6 : count > 10 ? 5 : 4;
    const rows = count > 15 ? 4 : count > 10 ? 3 : 3;
    const cells: { col: number; row: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Generically skip central cells where wordmark sits to maintain readability
        const isCenterCol = c >= Math.floor(cols / 2) - 1 && c <= Math.ceil(cols / 2);
        const isCenterRow = r >= Math.floor(rows / 2) - (rows % 2 === 0 ? 1 : 0) && r <= Math.floor(rows / 2);
        if (isCenterCol && isCenterRow) continue;
        
        cells.push({ col: c, row: r });
      }
    }

    // Shuffle cells deterministically
    const shuffledCells = [...cells];
    for (let i = shuffledCells.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const temp = shuffledCells[i];
      shuffledCells[i] = shuffledCells[j];
      shuffledCells[j] = temp;
    }

    // Select based on count, falling back to all available if grid is full
    const selectedCells = shuffledCells.slice(0, Math.min(count, shuffledCells.length));

    for (const cell of selectedCells) {
      const cellWidth = 90 / cols;
      const cellHeight = 70 / rows;
      
      const baseX = 5 + cell.col * cellWidth + cellWidth / 2;
      const baseY = 15 + cell.row * cellHeight + cellHeight / 2;

      // Organic offset jitter
      const jitterX = (random() - 0.5) * cellWidth * 0.55;
      const jitterY = (random() - 0.5) * cellHeight * 0.55;

      const size = Math.round(random() * 5) + 12; // 12px to 17px

      coordinates.push({
        x: Math.round(baseX + jitterX),
        y: Math.round(baseY + jitterY),
        size
      });
    }

    return coordinates;
  }, [pixelDensity, crossPositions, backgroundIconCount]);

  // 3. Click Burst Particle System
  const triggerParticleBurst = () => {
    if (iconAnimation !== "clickable") return;
    const newParticles: Particle[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count + (Math.random() - 0.5) * 15;
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x: 0,
        y: 0,
        angle: angle * (Math.PI / 180),
        speed: Math.random() * 120 + 70,
        size: Math.random() * 8 + 10
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Particle tick loop
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) => {
        return prev
          .map((p) => ({
            ...p,
            x: p.x + Math.cos(p.angle) * (p.speed * 0.03),
            y: p.y + Math.sin(p.angle) * (p.speed * 0.03),
            speed: p.speed * 0.94
          }))
          .filter((p) => p.speed > 5);
      });
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  // 4. Idle loop crossfade toggle
  useEffect(() => {
    if (iconAnimation !== "idle-loop") return;
    const interval = setInterval(() => {
      setIdleLoopActive((prev) => !prev);
    }, 4500);
    return () => clearInterval(interval);
  }, [iconAnimation]);

  // Animation Speeds Multipliers Mapping
  const animationDurations = {
    slow: 4.5,
    normal: 3.2,
    fast: 1.8
  };
  const durationMultiplier = animationDurations[animationSpeed];

  // Scroll Linked scaling
  const flowerScaleY = useTransform(scrollY, [0, 450], [0.35, 1.0]);
  const flowerPetalOpacity = useTransform(scrollY, [0, 400], [0.15, 1.0]);

  // Helper to render specified pixel icon size variations
  const getIconComponent = (variant: string, size: number) => {
    switch (variant) {
      case "flower":
        return <PixelFlower size={size} />;
      case "heart":
        return <PixelHeart size={size} />;
      case "star":
        return <PixelStar size={size} />;
      case "skull":
        return <PixelSkull size={size} />;
      case "crown":
        return <PixelCrown size={size} />;
      case "ghost":
        return <PixelGhost size={size} />;
      default:
        return <PixelCross size={size} colors={accentColors} />;
    }
  };

  // Core base icon rendering
  const renderPixelIcon = () => {
    if (mainIcon) return mainIcon;
    return getIconComponent(iconVariant, iconSize);
  };

  const getAnimatedIcon = () => {
    const defaultIcon = renderPixelIcon();
    if (!defaultIcon || iconVariant === "none") return null;

    // Apply rotation prop as baseline orientation
    const rotateBase = iconRotation;

    if (iconAnimation === "hover-bloom") {
      return (
        <motion.div
          className="relative inline-flex items-center"
          initial={{ scale: 0.1, rotate: rotateBase - 20 }}
          animate={{ scale: 1, rotate: rotateBase }}
          whileHover={{ scale: 1.25, rotate: rotateBase + 12 }}
          transition={{ type: "spring", stiffness: 140, damping: 10 }}
        >
          {defaultIcon}
        </motion.div>
      );
    }

    if (iconAnimation === "scroll-linked") {
      return (
        <motion.div 
          style={{ scaleY: flowerScaleY, opacity: flowerPetalOpacity, rotate: rotateBase }}
          className="relative inline-flex origin-bottom items-center"
        >
          {defaultIcon}
        </motion.div>
      );
    }

    if (iconAnimation === "idle-loop") {
      return (
        <motion.div
          animate={{ rotate: idleLoopActive ? rotateBase + 360 : rotateBase }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity }}
          className="relative inline-flex items-center"
        >
          {defaultIcon}
        </motion.div>
      );
    }

    if (iconAnimation === "clickable") {
      return (
        <button
          onClick={triggerParticleBurst}
          className="relative inline-flex items-center focus:outline-none cursor-pointer"
          type="button"
        >
          <motion.div whileTap={{ scale: 0.85, rotate: rotateBase - 15 }} style={{ rotate: rotateBase }}>
            {defaultIcon}
          </motion.div>

          {/* Particle Burst Overlay */}
          <div className="absolute inset-0 pointer-events-none z-50">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute"
                style={{
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: Math.max(0, p.speed / 120)
                }}
              >
                {mainIcon ? (
                  <div style={{ transform: `scale(${p.size / iconSize})` }}>{mainIcon}</div>
                ) : (
                  getIconComponent(iconVariant, p.size)
                )}
              </div>
            ))}
          </div>
        </button>
      );
    }

    return (
      <div className="inline-flex items-center" style={{ transform: `rotate(${rotateBase}deg)` }}>
        {defaultIcon}
      </div>
    );
  };

  // Map icon position modes to absolute layouts
  const positionClasses = {
    inline: "relative inline-flex items-center h-full ml-4 md:ml-6",
    "top-right": "absolute top-0 right-0 translate-x-[110%] -translate-y-[15%] z-30 pointer-events-auto",
    "bottom-right": "absolute bottom-0 right-0 translate-x-[110%] translate-y-[15%] z-30 pointer-events-auto",
    "top-left": "absolute top-0 left-0 -translate-x-[110%] -translate-y-[15%] z-30 pointer-events-auto",
    "bottom-left": "absolute bottom-0 left-0 -translate-x-[110%] translate-y-[15%] z-30 pointer-events-auto",
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between p-6 md:p-8 select-none"
      style={{
        backgroundColor: bgColor,
        color: "#FFFFFF"
      }}
    >
      {/* 1. Dynamic Font Injection */}
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />

      {/* 2. Technical repeating background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          opacity: gridOpacity,
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />

      {/* 3. Floating background icons with dynamic parallax and hover actions */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {generatedCrosses.map((c: { x: number; y: number; size: number }, i: number) => (
          <motion.div
            key={i}
            className="absolute pointer-events-auto cursor-help"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              x: enableParallax ? pxOffset : 0,
              y: enableParallax ? pyOffset : 0,
              willChange: "transform"
            }}
            animate={{
              y: [0, -6, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: durationMultiplier * (0.85 + (i % 3) * 0.15),
              delay: i * 0.25,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.3, rotate: 45 }}
          >
            {getIconComponent(backgroundIconVariant || "cross", c.size)}
          </motion.div>
        ))}
      </div>

      {/* 4. Top Navigation Bar Layout */}
      {!hideNav && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative z-40 w-full flex items-center justify-between uppercase tracking-wider text-xs md:text-sm font-mono"
          style={{ fontFamily: "var(--font-mono)" }}
        >
        <div>
          PORTFOLIO // SELECTIONS
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="group flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {link.label}
              {link.hasDropdown && (
                <span className="text-[10px] transform transition-transform group-hover:translate-y-0.5">▾</span>
              )}
            </a>
          ))}
        </div>

        {/* Desktop Socials */}
        <div className="hidden md:flex items-center gap-2">
          {socials.map((social, idx) => (
            <React.Fragment key={idx}>
              <a href={social.href} className="hover:opacity-80 transition-opacity">
                {social.label}
              </a>
              {idx < socials.length - 1 && <span className="opacity-40">·</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Hamburger toggle button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-between w-5 h-3.5 z-50 pointer-events-auto cursor-pointer"
          type="button"
        >
          <span className={`h-px w-full bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
          <span className={`h-px w-full bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`h-px w-full bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
        </button>
      </motion.nav>
      )}

      {/* Mobile Drawer menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-30 bg-[#0B0B0B]/98 text-white flex flex-col justify-center p-8 select-none uppercase font-mono"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <div className="flex flex-col gap-6 text-2xl mb-12">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[var(--color-yellow)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex gap-4 text-sm mt-auto border-t border-white/10 pt-6">
              {socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-[var(--color-yellow)]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Center giant typography wordmark display */}
      <div className="relative flex-1 flex flex-col items-center justify-center z-20 text-center py-12">
        <div className="relative inline-flex items-center justify-center max-w-[90vw]">
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 85, damping: 15 }}
            className="text-[11vw] md:text-[9.5vw] font-normal leading-none lowercase tracking-tight text-white select-none whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            {name}
          </motion.h1>

          {/* Absolute/Inline positioning element for the main icon suffix */}
          <div className={positionClasses[iconPosition]}>
            {getAnimatedIcon()}
          </div>
        </div>

        {/* Short bio/introduction text section */}
        {introduction && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ type: "spring", stiffness: 85, damping: 15, delay: 0.2 }}
            className="mt-8 max-w-sm md:max-w-md mx-auto text-sm md:text-[15px] tracking-wide leading-relaxed text-center px-6 text-white/80"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {introduction}
          </motion.p>
        )}
      </div>

      {/* 6. Monospace footer rows */}
      {!hideFooter && (
        <motion.footer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-40 w-full flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 md:gap-0 border-t border-white/10 pt-6 text-[10px] md:text-xs uppercase font-mono tracking-widest opacity-70"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-green)] animate-pulse" />
            <span>{availability}</span>
            <span className="opacity-40">//</span>
            <span>{availabilityDate}</span>
          </div>

          <div className="animate-bounce">
            {scrollLabel}
          </div>

          <div>
            © {copyrightName || name} / ALL RIGHTS RESERVED
          </div>
        </motion.footer>
      )}
    </div>
  );
}
