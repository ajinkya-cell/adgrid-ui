"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CTAButtonProps {
  text?: string;
  onClick?: () => void;
}

export const CTAButton: React.FC<CTAButtonProps> = ({ text = "Start Your Engine", onClick }) => {
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
        transition={{
          delay: 1.1,
          type: "spring",
          stiffness: 180,
          damping: 18,
          mass: 0.8
        }}
        className="flex items-center gap-4 bg-neutral-900 text-white hover:bg-black px-8 py-4 rounded-full font-body text-sm font-semibold tracking-tight shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.22)] transition-all duration-300 cursor-pointer select-none group outline-none focus-visible:ring-4 focus-visible:ring-neutral-400"
      >
        <span>{text}</span>
        
        {/* Circle arrow container */}
        <div className="relative w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-white/20">
          <motion.div
            variants={{
              hover: { 
                x: [0, 24, -24, 0],
                transition: { 
                  times: [0, 0.35, 0.36, 1], 
                  duration: 0.45, 
                  ease: "easeInOut" 
                } 
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

export default CTAButton;
