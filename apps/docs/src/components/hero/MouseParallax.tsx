"use client";

import React, { createContext, useContext } from 'react';
import { MotionValue } from 'framer-motion';
import { useMouseParallax } from './useMouseParallax';

interface MouseParallaxContextType {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const MouseParallaxContext = createContext<MouseParallaxContextType | null>(null);

export const MouseParallaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mouse = useMouseParallax();

  return (
    <MouseParallaxContext.Provider value={mouse}>
      <div className="relative w-full h-full">
        {children}
      </div>
    </MouseParallaxContext.Provider>
  );
};

export const useMouseParallaxContext = () => {
  const context = useContext(MouseParallaxContext);
  if (!context) {
    throw new Error('useMouseParallaxContext must be used within a MouseParallaxProvider');
  }
  return context;
};
export default MouseParallaxProvider;
