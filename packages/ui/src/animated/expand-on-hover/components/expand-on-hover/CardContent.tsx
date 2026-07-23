
import { motion } from "framer-motion";
import { ExpandItem } from "../../types";

interface CardContentProps {
  item: ExpandItem;
  imageParallaxStyle?: any; // Dynamics for pointer parallax shifts
  index: number;
  borderRadius?: number;
}

export function CardContent({ item, imageParallaxStyle, index, borderRadius = 24 }: CardContentProps) {
  // Stagger variants for content reveals
  const revealContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.12,
      },
    },
  };

  const revealChild = {
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 140,
        damping: 18,
      },
    },
  };

  const clipStyle = {
    borderRadius: `${borderRadius}px`,
    clipPath: `inset(0px round ${borderRadius}px)`,
    WebkitClipPath: `inset(0px round ${borderRadius}px)`,
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[inherit] select-none" style={clipStyle}>
      {/* Background Grayscale Image */}
      <div className="absolute inset-0 w-full h-full bg-neutral-950 overflow-hidden rounded-[inherit]" style={clipStyle}>
        <motion.img
          src={item.image}
          alt={item.title}
          loading="lazy"
          style={{ ...imageParallaxStyle, ...clipStyle }}
          className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-105 rounded-[inherit]"
          initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Soft Linear Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent rounded-[inherit]" style={clipStyle} />
      </div>

      {/* Dynamic Staggered Panels */}
      <motion.div
        variants={revealContainer}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 flex flex-col justify-end p-8 text-left z-10"
      >
        <div className="space-y-4">
          {/* Header Category/Badge */}
          {item.badge && (
            <motion.div variants={revealChild}>
              <span className="inline-block px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest bg-white/10 text-white border border-white/20 backdrop-blur-md">
                {item.badge}
              </span>
            </motion.div>
          )}

          {/* Title and Subtitle Block */}
          <div className="space-y-1">
            {item.subtitle && (
              <motion.p
                variants={revealChild}
                className="text-xs font-mono font-semibold tracking-wider text-neutral-400"
              >
                {item.subtitle}
              </motion.p>
            )}
            
            <motion.h3
              variants={revealChild}
              className="font-sans text-2xl md:text-3xl font-black tracking-tight text-white"
            >
              {item.title}
            </motion.h3>
          </div>

          {/* Description Block */}
          {item.description && (
            <motion.p
              variants={revealChild}
              className="font-sans text-sm leading-relaxed text-neutral-300 max-w-md line-clamp-3"
            >
              {item.description}
            </motion.p>
          )}

          {/* Interactive Indicators */}
          <motion.div
            variants={revealChild}
            className="flex items-center gap-4 pt-2"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-white tracking-widest hover:opacity-80 transition-opacity cursor-pointer">
              <span>Explore</span>
              <svg 
                className="w-3.5 h-3.5 fill-none stroke-current stroke-2 transition-transform duration-300 group-hover:translate-x-1" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            
            <span className="text-neutral-700 font-mono text-xs">/</span>
            
            <span className="text-[9px] font-mono font-bold text-neutral-500 tracking-widest select-none">
              Index {(index + 1).toString().padStart(2, "0")}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
