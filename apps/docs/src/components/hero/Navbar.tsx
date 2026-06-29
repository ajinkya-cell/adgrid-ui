"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LINKS = ['Engine', 'Showcase', 'Growth OS', 'Pricing'];

export const Navbar: React.FC = () => {
  const [activeLink, setActiveLink] = useState('Engine');

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.8 }}
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between w-full max-w-[1400px] mx-auto px-6 py-6 bg-transparent"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-black overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <span className="font-mono text-white text-sm font-black">▲</span>
        </div>
        <span className="font-display font-bold text-base tracking-tight text-black">
          adgrid.
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6 md:gap-8 bg-white/40 backdrop-blur-md border border-black/[0.03] shadow-[0_2px_12px_rgba(0,0,0,0.02)] px-6 py-2 rounded-full">
        {LINKS.map((link) => {
          const isActive = activeLink === link;
          return (
            <button
              key={link}
              onClick={() => setActiveLink(link)}
              className="relative py-1 text-xs md:text-sm font-medium tracking-tight cursor-pointer transition-all duration-200 hover:-translate-y-0.5 outline-none select-none text-gray-500 hover:text-black focus-visible:ring-2 focus-visible:ring-black/20 rounded-lg px-2"
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

      {/* Right button for visual balance */}
      <div className="hidden sm:block">
        <button className="px-5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-semibold tracking-tight shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer">
          Launch App
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
