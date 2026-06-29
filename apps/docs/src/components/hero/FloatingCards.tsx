"use client";

import React from 'react';
import { CardData } from './types';
import { FloatingCard } from './FloatingCard';

interface FloatingCardsProps {
  cards: CardData[];
}

export const FloatingCards: React.FC<FloatingCardsProps> = ({ cards }) => {
  if (!cards || cards.length < 4) return null;

  // Desktop absolute coordinates surrounding the centered column
  const desktopPositionClasses = [
    "lg:top-[22%] lg:left-[2%] xl:left-[6%]",      // Card 1: Top-Left (Pastel Blue)
    "lg:bottom-[15%] lg:left-[4%] xl:left-[8%]",   // Card 2: Bottom-Left (Pastel Green)
    "lg:top-[22%] lg:right-[2%] xl:right-[6%]",     // Card 3: Top-Right (Pastel Orange)
    "lg:bottom-[15%] lg:right-[4%] xl:right-[8%]"   // Card 4: Bottom-Right (Pastel Purple)
  ];

  return (
    <>
      {/* Mobile & Tablet Grid layout: Stays in normal flow under CTA */}
      <div className="flex lg:hidden flex-col md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-6 items-center gap-6 mt-16 px-4 w-full max-w-2xl mx-auto z-20 relative">
        {cards.map((card, index) => (
          <div key={card.id} className="relative pointer-events-auto">
            <FloatingCard card={card} index={index} />
          </div>
        ))}
      </div>

      {/* Desktop Absolute Layout: Placed in layout space surrounding center text */}
      <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-20">
        {cards.map((card, index) => {
          const positionClass = desktopPositionClasses[index] || "";
          return (
            <div
              key={card.id}
              className={`absolute pointer-events-auto ${positionClass}`}
            >
              <FloatingCard card={card} index={index} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FloatingCards;
