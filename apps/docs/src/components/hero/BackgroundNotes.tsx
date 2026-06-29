"use client";

import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { useMouseParallaxContext } from './MouseParallax';

export const BackgroundNotes: React.FC = () => {
  const mouse = useMouseParallaxContext();

  // Subtle opposite motion for parallax depth (layer feels farther away)
  const xLeft = useTransform(mouse.x, [-1, 1], [15, -15]);
  const yLeft = useTransform(mouse.y, [-1, 1], [15, -15]);

  const xRightBottom = useTransform(mouse.x, [-1, 1], [-12, 12]);
  const yRightBottom = useTransform(mouse.y, [-1, 1], [-12, 12]);

  const xRightTop = useTransform(mouse.x, [-1, 1], [8, -8]);
  const yRightTop = useTransform(mouse.y, [-1, 1], [8, -8]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Note 1: Top Left / Middle Left Area */}
      <motion.div
        style={{ x: xLeft, y: yLeft }}
        initial={{ opacity: 0, rotate: -8, scale: 0.95 }}
        animate={{ opacity: 0.1, rotate: -6, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.2, type: "spring", stiffness: 100 }}
        className="absolute top-[28%] left-[8%] md:left-[14%] font-handwritten text-lg md:text-xl lg:text-2xl text-neutral-400 select-none"
      >
        built for speed ✨
      </motion.div>

      {/* Note 2: Bottom Right / Middle Right Area */}
      <motion.div
        style={{ x: xRightBottom, y: yRightBottom }}
        initial={{ opacity: 0, rotate: 6, scale: 0.95 }}
        animate={{ opacity: 0.08, rotate: 4, scale: 1 }}
        transition={{ delay: 0.35, duration: 1.2, type: "spring", stiffness: 100 }}
        className="absolute bottom-[22%] right-[10%] md:right-[15%] font-handwritten text-lg md:text-2xl text-neutral-400 select-none"
      >
        fully managed ⚡
      </motion.div>

      {/* Note 3: Top Right Area */}
      <motion.div
        style={{ x: xRightTop, y: yRightTop }}
        initial={{ opacity: 0, rotate: -4, scale: 0.95 }}
        animate={{ opacity: 0.08, rotate: -2, scale: 1 }}
        transition={{ delay: 0.45, duration: 1.2, type: "spring", stiffness: 100 }}
        className="absolute top-[26%] right-[12%] md:right-[20%] font-handwritten text-sm md:text-base lg:text-lg text-neutral-400 select-none"
      >
        // zero friction
      </motion.div>
    </div>
  );
};

export default BackgroundNotes;
