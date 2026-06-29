"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { Search } from 'lucide-react';
import { useMouseParallaxContext } from './MouseParallax';

const GOALS = [
  "Scale my personal brand to 1M...",
  "Launch my SaaS to $10k MRR...",
  "Grow newsletter to 50k subscribers...",
  "Rank #1 on Product Hunt..."
];

interface SearchBarProps {
  onSubmit?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSubmit }) => {
  const mouse = useMouseParallaxContext();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [goalIndex, setGoalIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  // Map mouse movement to subtle 3D tilt & translation (max 2deg tilt, 4px displacement)
  const rotateX = useTransform(mouse.y, [-1, 1], [2, -2]);
  const rotateY = useTransform(mouse.x, [-1, 1], [-2, 2]);
  const x = useTransform(mouse.x, [-1, 1], [-4, 4]);
  const y = useTransform(mouse.y, [-1, 1], [-4, 4]);

  // Typewriter effect
  useEffect(() => {
    if (isFocused) {
      setPlaceholderText("");
      return;
    }

    const currentGoal = GOALS[goalIndex];
    const typingSpeed = isDeleting ? 25 : 55;
    let timer: NodeJS.Timeout;

    if (!isDeleting && placeholderText === currentGoal) {
      // Pause at full text
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
      ref={containerRef}
      style={{
        rotateX,
        rotateY,
        x,
        y,
        transformStyle: "preserve-3d"
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 0.9,
        type: "spring",
        stiffness: 180,
        damping: 18,
        mass: 0.8
      }}
      className="relative w-full max-w-md md:max-w-lg mx-auto z-30 px-4"
    >
      <div
        className={`w-full flex items-center gap-3 bg-neutral-50/90 backdrop-blur-md border rounded-full px-6 py-4 transition-all duration-500 ease-out select-none
          ${isFocused 
            ? 'border-neutral-400 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.01)] scale-[1.02]' 
            : 'border-neutral-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.01)] hover:border-neutral-300 hover:shadow-[0_10px_28px_rgba(0,0,0,0.04)]'
          }
        `}
      >
        <Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-black' : 'text-neutral-400'}`} />
        
        <div className="relative flex-1 flex items-center">
          {/* Custom Typing Placeholder */}
          {!isFocused && query === "" && (
            <div className="absolute left-0 text-neutral-400 text-sm md:text-base font-normal pointer-events-none select-none flex items-center">
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
            className="w-full bg-transparent border-none outline-none text-neutral-900 placeholder-transparent text-sm md:text-base font-medium py-0.5 focus:ring-0"
            aria-label="What's your growth goal?"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
