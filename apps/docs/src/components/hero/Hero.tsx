"use client";

import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { HeroProps, CardData } from './types';
import { MouseParallaxProvider, useMouseParallaxContext } from './MouseParallax';
import Navbar from './Navbar';
import BackgroundNotes from './BackgroundNotes';
import SearchBar from './SearchBar';
import CTAButton from './CTAButton';
import FloatingCards from './FloatingCards';

// Default card mockups to match the user request
const DEFAULT_CARDS: CardData[] = [
  {
    id: "strategy-card",
    tag: "STRATEGY",
    title: "Short-Form Mastery",
    description: "Retention-first editing for TikTok & Reels.",
    type: "strategy",
    floatDuration: 7.0,
    floatAmplitudeY: 8,
    floatAmplitudeRotate: 2
  },
  {
    id: "platform-card",
    tag: "PLATFORM",
    title: "Multi-Channel",
    description: "One video. Four platforms. Zero friction.",
    type: "platform",
    floatDuration: 5.5,
    floatAmplitudeY: 12,
    floatAmplitudeRotate: 1
  },
  {
    id: "stats-card",
    tag: "LIVE STATS",
    title: "Performance",
    description: "Audience growth analytics compiled daily.",
    type: "stats",
    floatDuration: 6.8,
    floatAmplitudeY: 10,
    floatAmplitudeRotate: 3
  },
  {
    id: "system-card",
    tag: "SYSTEM",
    title: "Growth Studio",
    description: "End-to-end production for high-output creators.",
    type: "system",
    floatDuration: 8.0,
    floatAmplitudeY: 9,
    floatAmplitudeRotate: 2
  }
];

// Inner component that can consume the MouseParallax context
const HeroContent: React.FC<Required<Omit<HeroProps, 'onSearchSubmit'>> & { onSearchSubmit?: (query: string) => void }> = ({
  title,
  subtitle,
  cards,
  ctaText,
  onSearchSubmit
}) => {
  const mouse = useMouseParallaxContext();

  // Subtle opposite parallax translation for the text column (max 5px displacement)
  const headingX = useTransform(mouse.x, [-1, 1], [-5, 5]);
  const headingY = useTransform(mouse.y, [-1, 1], [-5, 5]);

  // Floating background glows moving in response to mouse
  const glow1X = useTransform(mouse.x, [-1, 1], [-30, 30]);
  const glow1Y = useTransform(mouse.y, [-1, 1], [-30, 30]);

  const glow2X = useTransform(mouse.x, [-1, 1], [25, -25]);
  const glow2Y = useTransform(mouse.y, [-1, 1], [25, -25]);

  // Splits title into words for individual staggered entrance transitions
  const words = title.split(" ");
  // Group words into lines: "What's your" and "growth goal?"
  const line1Words = words.slice(0, 2); // "What's your"
  const line2Words = words.slice(2);    // "growth goal?"

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
      {/* ─── Paper-Notebook Background Grid & Glows ─── */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #ffffff 0%, #fafafa 100%),
            linear-gradient(to right, rgba(0, 0, 0, 0.01) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.01) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px"
        }}
      >
        {/* Soft, blurred glowing backdrops reacting to cursor coordinates */}
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

      {/* ─── CSS style for heading continuous float ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes headingFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .animate-heading-float {
          animation: headingFloat 8s ease-in-out infinite;
        }
      `}} />

      {/* Navbar Entry */}
      <Navbar />

      {/* Floating Background Handwritten Notes */}
      <BackgroundNotes />

      {/* ─── Central Content Column ─── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-24 flex flex-col justify-center items-center text-center">
        
        {/* Subtitle / Notebook small hint */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{
            delay: 0.4,
            type: "spring",
            stiffness: 180,
            damping: 18
          }}
          className="font-handwritten text-xs md:text-sm text-neutral-400 mb-4 tracking-wider rotate-[-1deg] select-none"
        >
          {subtitle}
        </motion.div>

        {/* Heading Column */}
        <motion.div
          style={{ x: headingX, y: headingY }}
          className="animate-heading-float mb-10 w-full select-none"
        >
          <h1 className="font-handwritten text-[clamp(2.5rem,8vw,5.5rem)] font-normal leading-[1.05] tracking-wide text-neutral-900 flex flex-col items-center">
            {/* Line 1 */}
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
            {/* Line 2 */}
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

        {/* Search Bar Input */}
        <SearchBar onSubmit={onSearchSubmit} />

        {/* CTA Action button wrapper */}
        <div className="mt-10">
          <CTAButton text={ctaText} />
        </div>
      </div>

      {/* Floating Feature Cards orchestrator surrounding the center content */}
      <FloatingCards cards={cards} />
    </div>
  );
};

export const Hero: React.FC<HeroProps> = ({
  title = "What's your growth goal?",
  subtitle = "built for speed",
  cards = DEFAULT_CARDS,
  ctaText = "Start Your Engine",
  onSearchSubmit
}) => {
  return (
    <MouseParallaxProvider>
      <HeroContent
        title={title}
        subtitle={subtitle}
        cards={cards}
        ctaText={ctaText}
        onSearchSubmit={onSearchSubmit}
      />
    </MouseParallaxProvider>
  );
};

export default Hero;
