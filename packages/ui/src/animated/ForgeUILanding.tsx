import { BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { VoidButton } from './VoidButton';

export interface ForgeUILandingProps {
  /**
   * Optional custom URL to redirect when clicking the main Forge UI link button
   * @default "https://forgeui.in"
   */
  forgeUiUrl?: string;
  
  /**
   * Callback fired when clicking the 'Documentation' button
   */
  onDocumentation?: () => void;
  
  /**
   * Optional additional CSS classes to customize layout wrapper
   */
  className?: string;
}

export function ForgeUILanding({
  forgeUiUrl = "https://forgeui.in",
  onDocumentation,
  className,
}: ForgeUILandingProps) {
  return (
    <div className={cn("relative min-h-screen w-full bg-black text-white overflow-hidden flex flex-col items-center justify-center font-sans", className)}>
      
      {/* Self-contained Styles for Aceternity-style Spotlight Beam Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spotlight {
          0% {
            opacity: 0;
            transform: translate(-72%, -62%) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -40%) scale(1);
          }
        }
        .animate-spotlight {
          animation: spotlight 2s ease 0.75s 1 forwards;
        }
      `}} />

      {/* -------------------------------------------------------------
          1. VOLUMETRIC SPOTLIGHT LIGHT BEAM (OFFICIAL FORGEUI DESIGN)
          ------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg 
          className="pointer-events-none absolute -left-5 -top-48 z-[1] h-[169%] w-[138%] animate-spotlight opacity-0 md:-left-5 md:-top-[120px] lg:-left-5 lg:-top-40 xl:-left-5 xl:-top-60" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 3787 2842" 
          fill="none"
        >
          <g filter="url(#filter-spotlight-beam)">
            <ellipse 
              cx="1924.71" 
              cy="273.501" 
              rx="1924.71" 
              ry="273.501" 
              transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)" 
              fill="white" 
              fillOpacity="0.21"
            />
          </g>
          <defs>
            <filter 
              id="filter-spotlight-beam" 
              x="0.860352" 
              y="0.838989" 
              width="3785.16" 
              height="2840.26" 
              filterUnits="userSpaceOnUse" 
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* -------------------------------------------------------------
          2. MAIN HERO CONTENT
          ------------------------------------------------------------- */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        
        {/* GRADIENT HEADING (ANIMATED) */}
        <motion.h1 
          initial={{ filter: "blur(10px)", opacity: 0, y: 10 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-neutral-200 to-neutral-600 bg-clip-text text-transparent pb-2 font-sans"
        >
          Build Beautiful UI Faster
        </motion.h1>

        {/* Subtitle (ANIMATED) */}
        <motion.p 
          initial={{ filter: "blur(10px)", opacity: 0, y: 10 }}
          animate={{ filter: "blur(0px)", opacity: 0.7, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="mt-6 text-gray-400 text-base md:text-lg max-w-2xl leading-relaxed font-normal font-sans"
        >
          Forge UI is one of the best UI libraries out there. Be sure to check it out here.
        </motion.p>

        {/* Call to Action Buttons (ANIMATED) */}
        <motion.div 
          initial={{ filter: "blur(5px)", opacity: 0, y: 5 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 group"
        >
          <a 
            href={forgeUiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 h-9 rounded-lg bg-neutral-200 text-black font-semibold text-sm hover:bg-white transition-all shadow-sm cursor-pointer no-underline flex items-center justify-center font-sans"
          >
            Go to Forge UI
          </a>

          <VoidButton 
            variant="neon-edge"
            onClick={onDocumentation}
            className="w-auto px-5 h-9 rounded-lg font-sans text-sm tracking-normal capitalize flex items-center justify-center gap-2 border-neutral-800 text-gray-300 hover:text-white"
          >
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 transition-all duration-200 ease-in-out group-hover:translate-x-1" />
          </VoidButton>
        </motion.div>
      </main>
    </div>
  );
}
