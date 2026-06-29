"use client";

import React, { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  Video, 
  Layers 
} from 'lucide-react';
import { CardData } from './types';
import { useFloating } from './useFloating';
import { useMouseParallaxContext } from './MouseParallax';
import AnimatedCounter from './AnimatedCounter';

const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface FloatingCardProps {
  card: CardData;
  index: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({ card, index }) => {
  const mouse = useMouseParallaxContext();
  const cardRef = useRef<HTMLDivElement>(null);

  // Set default floating properties if not customized
  const duration = card.floatDuration ?? (index === 0 ? 7.0 : index === 1 ? 5.5 : index === 2 ? 6.8 : 8.0);
  const amplitudeY = card.floatAmplitudeY ?? (index === 0 ? 8 : index === 1 ? 12 : index === 2 ? 10 : 9);
  const amplitudeRotate = card.floatAmplitudeRotate ?? (index === 0 ? 2 : index === 1 ? 1 : index === 2 ? 3 : 2);

  // Run the sine-wave float cycle on GPU via DOM updates
  useFloating(cardRef, { duration, amplitudeY, amplitudeRotate });

  // Map mouse coordinates to 3D Card Tilt & Parallax shift
  // Subtle max tilt (3.5deg) and translation (8px)
  const rotateX = useTransform(mouse.y, [-1, 1], [3.5, -3.5]);
  const rotateY = useTransform(mouse.x, [-1, 1], [-3.5, 3.5]);
  const cardX = useTransform(mouse.x, [-1, 1], [-8, 8]);
  const cardY = useTransform(mouse.y, [-1, 1], [-8, 8]);

  // Card themes: pastels and matching shadows
  const getThemeClasses = () => {
    switch (card.type) {
      case 'strategy':
        return {
          bg: 'bg-sky-50/70 border-sky-100/60 shadow-[0_20px_50px_rgba(186,230,253,0.25),0_1px_3px_rgba(14,165,233,0.02)]',
          tagText: 'text-sky-600 bg-sky-100/60',
          title: 'text-sky-950',
          icon: <Video className="w-4 h-4 text-sky-500" />
        };
      case 'platform':
        return {
          bg: 'bg-emerald-50/70 border-emerald-100/60 shadow-[0_20px_50px_rgba(167,243,208,0.25),0_1px_3px_rgba(16,185,129,0.02)]',
          tagText: 'text-emerald-600 bg-emerald-100/60',
          title: 'text-emerald-950',
          icon: <Layers className="w-4 h-4 text-emerald-500" />
        };
      case 'stats':
        return {
          bg: 'bg-orange-50/70 border-orange-100/60 shadow-[0_20px_50px_rgba(254,215,170,0.25),0_1px_3px_rgba(249,115,22,0.02)]',
          tagText: 'text-orange-600 bg-orange-100/60',
          title: 'text-orange-950',
          icon: <TrendingUp className="w-4 h-4 text-orange-500" />
        };
      case 'system':
      default:
        return {
          bg: 'bg-purple-50/70 border-purple-100/60 shadow-[0_20px_50px_rgba(233,213,252,0.25),0_1px_3px_rgba(168,85,247,0.02)]',
          tagText: 'text-purple-600 bg-purple-100/60',
          title: 'text-purple-950',
          icon: <Sparkles className="w-4 h-4 text-purple-500" />
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <motion.div
      style={{
        x: cardX,
        y: cardY,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 0.3 + index * 0.15,
        type: "spring",
        stiffness: 180,
        damping: 18,
        mass: 0.8
      }}
      className="w-[280px] md:w-[310px] select-none"
    >
      {/* Sine-floating container */}
      <div
        ref={cardRef}
        style={{
          transform: "translate3d(0, var(--float-y, 0px), 0) rotate(var(--float-r, 0deg))",
          transformStyle: "preserve-3d"
        }}
        className={`relative overflow-hidden rounded-[32px] border p-6 backdrop-blur-[12px] flex flex-col justify-between min-h-[220px] transition-colors duration-500 ease-out will-change-transform ${theme.bg}`}
      >
        {/* Custom CSS wave and shimmer styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes waveMove {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes shimmerMove {
            0% { transform: translate3d(-100%, 0, 0); }
            100% { transform: translate3d(150%, 0, 0); }
          }
          .animate-wave-flow {
            animation: waveMove 18s linear infinite;
          }
          .animate-studio-shimmer {
            animation: shimmerMove 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}} />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${theme.tagText}`}>
            {card.tag}
          </span>
          {theme.icon}
        </div>

        {/* Card Body */}
        <div className="flex-1 flex flex-col justify-start mb-6">
          <h3 className={`font-display text-lg font-bold mb-1 tracking-tight ${theme.title}`}>
            {card.title}
          </h3>
          <p className="text-xs md:text-sm text-neutral-600 leading-relaxed tracking-tight font-medium">
            {card.description}
          </p>
        </div>

        {/* Card Footer Internals based on Card Type */}
        <div className="relative mt-auto w-full pt-2 flex items-center justify-center">
          {/* Card 1: SVG wave */}
          {card.type === 'strategy' && (
            <div className="absolute -bottom-6 -left-6 -right-6 h-12 overflow-hidden pointer-events-none rounded-b-[32px]">
              <div className="flex w-[200%] h-full opacity-30 animate-wave-flow">
                <svg viewBox="0 0 1200 120" className="w-1/2 h-full fill-sky-400 preserve-aspect-ratio" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z"></path>
                </svg>
                <svg viewBox="0 0 1200 120" className="w-1/2 h-full fill-sky-400 preserve-aspect-ratio" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z"></path>
                </svg>
              </div>
            </div>
          )}

          {/* Card 2: Social Bouncing Icons */}
          {card.type === 'platform' && (
            <div className="flex items-center justify-around w-full px-2 gap-4 pb-1">
              {[
                { icon: <YoutubeIcon className="w-5 h-5 text-red-500" />, name: 'YouTube' },
                { icon: <InstagramIcon className="w-5 h-5 text-pink-500" />, name: 'Instagram' },
                { icon: <TwitterIcon className="w-5 h-5 text-sky-500" />, name: 'Twitter' },
                { icon: <MessageSquare className="w-5 h-5 text-neutral-800" />, name: 'TikTok' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ 
                    y: -6, 
                    scale: 1.18, 
                    transition: { type: "spring", stiffness: 400, damping: 10 } 
                  }}
                  className="p-2 rounded-xl bg-white/60 border border-emerald-100/50 shadow-sm flex items-center justify-center cursor-pointer"
                  aria-label={item.name}
                >
                  {item.icon}
                </motion.div>
              ))}
            </div>
          )}

          {/* Card 3: Metrics CountUp and Pulsing Badge */}
          {card.type === 'stats' && (
            <div className="flex items-center justify-between w-full border-t border-orange-100/60 pt-4 mt-2">
              <span className="font-display text-3xl font-black text-orange-600 tracking-tight">
                <AnimatedCounter value={412} prefix="+" suffix="%" />
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider">
                  Viral
                </span>
              </div>
            </div>
          )}

          {/* Card 4: Studio Shimmer */}
          {card.type === 'system' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 opacity-80 animate-studio-shimmer" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingCard;
