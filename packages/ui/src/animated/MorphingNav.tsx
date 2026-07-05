"use client";

import React, { useState, useRef, useEffect } from "react";
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
    icon: <Box className="w-4 h-4 text-neutral-400" />,
    description: "Enterprise system architecture and developer platforms.",
    items: [
      { name: "Core Engine", desc: "High-performance processing logic", icon: <Zap className="w-4 h-4 text-white" /> },
      { name: "Dev Suite", desc: "Precision tooling workspace", icon: <Code2 className="w-4 h-4 text-white" /> },
      { name: "API Portal", desc: "Encrypted secure network nodes", icon: <Layers className="w-4 h-4 text-white" /> },
      { name: "Templates", desc: "Pre-milled code layouts", icon: <Box className="w-4 h-4 text-white" /> },
    ],
  },
  {
    label: "Solutions",
    icon: <Layers className="w-4 h-4 text-neutral-400" />,
    description: "Optimized network configurations tailored to scale.",
    items: [
      { name: "Enterprise", desc: "Redundant grid computing", icon: <Box className="w-4 h-4 text-white" /> },
      { name: "Startups", desc: "Elastic burst-capacity nodes", icon: <Zap className="w-4 h-4 text-white" /> },
      { name: "Agencies", desc: "Multi-tenant workspace control", icon: <Code2 className="w-4 h-4 text-white" /> },
    ],
  },
  {
    label: "Resources",
    icon: <Code2 className="w-4 h-4 text-neutral-400" />,
    description: "Deep documentation, guides, and engineering notes.",
    items: [
      { name: "Docs", desc: "Comprehensive registry manual", icon: <Layers className="w-4 h-4 text-white" /> },
      { name: "Tech Blog", desc: "Anisotropic rendering insights", icon: <Zap className="w-4 h-4 text-white" /> },
      { name: "Chassis Repo", desc: "Open-source styling primitives", icon: <Box className="w-4 h-4 text-white" /> },
    ],
  },
];

export function MorphingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [morphPath, setMorphPath] = useState("");
  const navRef = useRef<HTMLDivElement>(null);

  // SVG Paths with identical 10-command quadratic bezier curves for perfect interpolation.
  // All paths span the full viewBox height (5 to 345) to prevent squishing or text slicing.
  const closedPath =
    "M30,5 Q215,5 400,5 Q425,5 425,170 Q425,180 425,180 Q425,345 400,345 Q215,345 30,345 Q5,345 5,180 Q5,170 5,170 Q5,5 30,5 Z";

  const productsPath =
    "M30,5 Q215,5 400,5 Q425,5 425,170 Q425,180 425,180 Q425,345 400,345 Q215,365 30,345 Q5,345 5,180 Q5,170 5,170 Q5,5 30,5 Z";

  const solutionsPath =
    "M30,5 Q215,5 400,5 Q425,5 425,170 Q425,180 425,180 Q425,345 400,345 Q215,355 30,345 Q5,345 5,180 Q5,170 5,170 Q5,5 30,5 Z";

  const resourcesPath =
    "M30,5 Q215,5 400,5 Q425,5 425,170 Q425,180 425,180 Q425,345 400,345 Q215,358 30,345 Q5,345 5,180 Q5,170 5,170 Q5,5 30,5 Z";

  useEffect(() => {
    if (!isOpen || !activeItem) {
      setMorphPath(closedPath);
      return;
    }

    if (activeItem === "Products") {
      setMorphPath(productsPath);
    } else if (activeItem === "Solutions") {
      setMorphPath(solutionsPath);
    } else {
      setMorphPath(resourcesPath);
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

  const activeIndex = navItems.findIndex((i) => i.label === activeItem);

  // Dynamic height configuration matching expanded submenu content densities
  const getNavHeight = () => {
    if (!isOpen || !activeItem) return 70;
    if (activeItem === "Products") return 330;
    return 270;
  };

  return (
    <div className="w-full relative min-h-[480px] p-6 flex flex-col justify-start items-center">
      {/* Backplate Click Handler (Full Screen Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-sm z-30 cursor-pointer"
            onClick={() => {
              setIsOpen(false);
              setActiveItem(null);
            }}
          />
        )}
      </AnimatePresence>

      <nav
        ref={navRef}
        className="w-full max-w-xl z-40 relative mt-4"
      >
        {/* Soft Ambient Glow following the active selection */}
        <AnimatePresence>
          {isOpen && activeItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.12, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="absolute -inset-20 rounded-full blur-[100px] bg-white pointer-events-none z-20"
              style={{
                left: activeIndex === 0 ? "-20%" : activeIndex === 1 ? "10%" : "40%",
                width: "60%",
                height: "80%",
              }}
            />
          )}
        </AnimatePresence>

        {/* SVG Canvas sits behind the content, OUTSIDE the overflow-hidden container so its drop shadow is not clipped */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 430 350"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Obsidian Linear Base Gradient */}
            <linearGradient id="chassis-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#121215" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#08080a" stopOpacity="0.98" />
            </linearGradient>

            {/* Molten Metal Highlight Bezel Stroke */}
            <linearGradient id="bezel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.16)" />
              <stop offset="40%" stopColor="rgba(255, 255, 255, 0.04)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.22)" />
            </linearGradient>
          </defs>

          <motion.path
            d={morphPath || closedPath}
            fill="url(#chassis-grad)"
            stroke="url(#bezel-grad)"
            strokeWidth="1.5"
            animate={{ d: morphPath || closedPath }}
            // Jelly/Spring transition makes the SVG look elastic and fluid
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 10,
              mass: 0.8,
            }}
            style={{
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.6))",
            }}
          />
        </svg>

        {/* Animated Container Height Chassis (Has overflow-hidden to mask the dropdown submenu) */}
        <motion.div
          animate={{ height: getNavHeight() }}
          transition={{
            type: "spring",
            stiffness: 110,
            damping: 14,
            mass: 0.9,
          }}
          className="relative w-full rounded-2xl overflow-hidden z-20"
        >
          {/* Navigation Bar Header (Logo & Menu buttons, fixed h-70) */}
          <div className="relative flex items-center justify-between h-[70px] px-5 z-10">
            {/* Logo */}
            <motion.div
              className="text-sm font-bold tracking-tight text-white font-body pl-2 cursor-pointer select-none"
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setIsOpen(false);
                setActiveItem(null);
              }}
            >
              Void Nav
            </motion.div>

            {/* Menu Buttons */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = activeItem === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleItemClick(item.label)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all duration-300 outline-none cursor-pointer ${
                      active ? "text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute inset-0 bg-white/[0.06] border border-white/10 rounded-lg"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}

              <motion.button
                className="ml-2 px-3.5 py-1.5 bg-white text-black font-body text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Access
              </motion.button>
            </div>
          </div>

          {/* Submenu Dropdown Panel (Absolute positioned at top-70) */}
          <AnimatePresence>
            {isOpen && activeItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[70px] left-0 right-0 grid grid-cols-1 sm:grid-cols-2 gap-2 px-6 pb-6 z-10"
              >
                {navItems
                  .find((i) => i.label === activeItem)
                  ?.items?.map((subItem, index) => (
                    <motion.a
                      key={subItem.name}
                      href="#"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 14,
                        delay: 0.03 * index,
                      }}
                      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-white group-hover:border-neutral-700 transition-all duration-300">
                        {subItem.icon}
                      </div>
                      <div>
                        <h4 className="text-neutral-200 font-semibold text-xs mb-0.5 flex items-center gap-1.5 transition-colors font-body group-hover:text-white">
                          {subItem.name}
                          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </h4>
                        <p className="text-neutral-500 text-[11px] leading-relaxed transition-colors font-body group-hover:text-neutral-400">
                          {subItem.desc}
                        </p>
                      </div>
                    </motion.a>
                  ))}

                {/* Dropdown Panel Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.15 }}
                  className="col-span-1 sm:col-span-2 mt-2 pt-4 border-t border-neutral-800/80"
                >
                  <div className="flex items-center justify-between px-2">
                    <p className="text-neutral-500 text-[11px] font-body font-normal">
                      {navItems.find((i) => i.label === activeItem)?.description}
                    </p>
                    <button className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors font-body font-medium cursor-pointer">
                      Logs <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </nav>
    </div>
  );
}
