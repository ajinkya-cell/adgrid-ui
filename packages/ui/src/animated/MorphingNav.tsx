"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Code2,
  Layers,
  Box,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  description: string;
  items?: { name: string; desc: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: "Products",
    icon: <Box className="w-5 h-5" />,
    description: "Our suite of tools",
    items: [
      { name: "AI Platform", desc: "Machine learning infrastructure", icon: <Zap className="w-4 h-4" /> },
      { name: "DevTools", desc: "Developer productivity suite", icon: <Code2 className="w-4 h-4" /> },
      { name: "APIs", desc: "REST & GraphQL endpoints", icon: <Layers className="w-4 h-4" /> },
      { name: "Templates", desc: "Pre-built solutions", icon: <Box className="w-4 h-4" /> },
    ],
  },
  {
    label: "Solutions",
    icon: <Layers className="w-5 h-5" />,
    description: "Industry specific",
    items: [
      { name: "Enterprise", desc: "Scale with confidence", icon: <Box className="w-4 h-4" /> },
      { name: "Startups", desc: "Grow fast, stay lean", icon: <Zap className="w-4 h-4" /> },
      { name: "Agencies", desc: "Deliver faster", icon: <Code2 className="w-4 h-4" /> },
    ],
  },
  {
    label: "Resources",
    icon: <Code2 className="w-5 h-5" />,
    description: "Learn and grow",
    items: [
      { name: "Documentation", desc: "Comprehensive guides", icon: <Layers className="w-4 h-4" /> },
      { name: "Blog", desc: "Latest insights", icon: <Zap className="w-4 h-4" /> },
      { name: "Community", desc: "Join the conversation", icon: <Box className="w-4 h-4" /> },
    ],
  },
];

export function MorphingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [morphPath, setMorphPath] = useState("M0,0 L100,0 L100,100 L0,100 Z");
  const navRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const closedPath = "M30,5 Q55,5 80,5 L400,5 Q425,5 425,30 L425,50 Q425,75 400,75 L30,75 Q5,75 5,50 L5,30 Q5,5 30,5 Z";
  const openPath = "M30,5 Q55,5 80,5 L400,5 Q425,5 425,30 L425,320 Q425,345 400,345 L30,345 Q5,345 5,320 L5,30 Q5,5 30,5 Z";

  useEffect(() => {
    if (isOpen && activeItem) {
      setMorphPath(openPath);
    } else {
      setMorphPath(closedPath);
    }
  }, [isOpen, activeItem]);

  const handleItemClick = (label: string) => {
    if (activeItem === label) {
      setActiveItem(null);
      setIsOpen(false);
    } else {
      setActiveItem(label);
      setIsOpen(true);
    }
  };

  return (
    <div className="w-full relative min-h-[480px] p-6">
      <nav
        ref={navRef}
        className="absolute top-6 left-6 right-6 z-50"
      >
        <div className="relative max-w-xl mx-auto rounded-2xl backdrop-blur-md">
          {/* Background morph shape */}
          <svg
            ref={svgRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            viewBox="0 0 430 350"
            preserveAspectRatio="none"
            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
          >
            <motion.path
              d={morphPath}
              fill="rgba(8, 8, 8, 0.85)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              animate={{ d: morphPath }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            />
          </svg>

          {/* Nav content */}
          <div className="relative flex items-center justify-between p-4 sm:p-5 z-10">
            <motion.div
              className="text-sm sm:text-base md:text-lg font-black tracking-widest text-white font-display uppercase"
              whileHover={{ scale: 1.05 }}
            >
              VOID
            </motion.div>

            <div className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleItemClick(item.label)}
                  className={`relative px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-mono tracking-wider uppercase transition-colors ${
                    activeItem === item.label
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {activeItem === item.label && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}

              <motion.button
                className="ml-1 sm:ml-3 px-3 py-1.5 sm:px-5 sm:py-2 bg-white text-black font-mono uppercase text-[10px] sm:text-xs font-bold rounded-lg tracking-wider hover:bg-white/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start
              </motion.button>
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isOpen && activeItem && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 sm:p-6 z-10"
              >
                {navItems
                  .find((i) => i.label === activeItem)
                  ?.items?.map((subItem, index) => (
                    <motion.a
                      key={subItem.name}
                      href="#"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                        {subItem.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-xs mb-0.5 flex items-center gap-1 uppercase tracking-wider font-mono">
                          {subItem.name}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="text-white/50 text-[10px] leading-snug">{subItem.desc}</p>
                      </div>
                    </motion.a>
                  ))}

                <div className="col-span-1 sm:col-span-2 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-white/40 text-[10px] font-mono uppercase">
                      {navItems.find((i) => i.label === activeItem)?.description}
                    </p>
                    <button className="text-[10px] text-white/60 hover:text-white flex items-center gap-0.5 transition-colors font-mono uppercase tracking-wider">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs z-40 rounded-xl"
            onClick={() => {
              setIsOpen(false);
              setActiveItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
