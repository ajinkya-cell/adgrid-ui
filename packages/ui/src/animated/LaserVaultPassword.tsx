"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { Key, Lock, Unlock } from "lucide-react";

// Simple local class merger utility to keep the component 100% self-contained
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// Web Audio sound synthesizer for tactile safe lock feedback
const playSound = (type: "click" | "creak" | "unlock") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.008);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.008);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    } else if (type === "creak") {
      // Grinding friction creak (low-frequency friction sweep)
      const duration = 0.5;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";

      // Modulate frequency to create metal friction vibration
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + duration);

      // Low pass filter to keep it heavy and dark
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.Q.setValueAtTime(6, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.05);

      // Add a second detuned oscillator for crunch
      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(82, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(133, ctx.currentTime + duration);
      osc2.connect(filter);
      osc2.start();
      osc2.stop(ctx.currentTime + duration + 0.05);
    } else if (type === "unlock") {
      // High-end digital verification chime
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      freqs.forEach((freq, i) => {
        const timeOffset = i * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
        
        gain.gain.setValueAtTime(0.04, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.2);
      });
    }
  } catch (e) {}
};

// Inlined VoidButton component with 3D tactile clicks and layout variants
export interface VoidButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "ambient" | "neon-edge" | "metallic-sheen" | "glassmorphic" | "cyber-laser" | "classic-gold";
  activeGradientClass?: string;
  activeTextClass?: string;
}

export function VoidButton({
  className,
  children,
  variant = "ambient",
  activeGradientClass,
  activeTextClass,
  ...props
}: VoidButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const maskTemplate = useMotionTemplate`radial-gradient(circle 80px at ${springX}px ${springY}px, black 30%, transparent 100%)`;

  let baseStyleClass = "bg-[#07070a] border-neutral-900 text-white/70";
  let activeGrad = activeGradientClass || "bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800";
  let activeText = activeTextClass || "text-white font-bold";
  let defaultShadow = "inset 0 3px 8px rgba(0,0,0,0.9), inset 0 -1px 2px rgba(255,255,255,0.03), 0 2px 4px rgba(0,0,0,0.4)";
  let tappedShadow = "inset 0 8px 24px rgba(0,0,0,0.95), 0 1px 1px rgba(0,0,0,0.8)";

  if (variant === "classic-gold") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#ffe066] via-[#f39c12] to-[#ffffff]";
    activeText = activeTextClass || "text-black font-black";
  } else if (variant === "ambient") {
    activeGrad = activeGradientClass || "bg-gradient-to-r from-[#161619] via-[#2d2d35] to-[#161619]";
    activeText = activeTextClass || "text-white/95 font-semibold";
  } else if (variant === "neon-edge") {
    activeGrad = "bg-transparent";
    activeText = "text-white/95 font-bold";
  } else if (variant === "metallic-sheen") {
    activeGrad = "bg-transparent";
    activeText = "text-white font-bold";
  } else if (variant === "glassmorphic") {
    baseStyleClass = "bg-white/5 border-white/10 backdrop-blur-md text-white/80";
    activeGrad = "bg-white/15";
    activeText = "text-white font-black";
    defaultShadow = "inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.4)";
    tappedShadow = "inset 0 4px 12px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.2)";
  } else if (variant === "cyber-laser") {
    baseStyleClass = "bg-[#060608] border-neutral-900 text-neutral-400";
    activeGrad = "bg-[#0c0c10]";
    activeText = "text-[#ff5500] font-black";
  }

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{
        scale: 0.95,
        y: 2,
        boxShadow: tappedShadow,
      }}
      transition={{ type: "spring", stiffness: 450, damping: 18 }}
      className={cn(
        "relative w-full h-12 rounded-xl border font-mono text-xs uppercase tracking-widest cursor-pointer select-none overflow-hidden outline-none transition-colors duration-300 flex items-center justify-center",
        baseStyleClass,
        className
      )}
      style={{
        boxShadow: defaultShadow,
      }}
      {...(props as any)}
    >
      <span className="absolute inset-0 flex items-center justify-center font-medium transition-opacity duration-300">
        {children || "THE VOID"}
      </span>

      {variant === "metallic-sheen" && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: "conic-gradient(from 0deg at 50% 50%, #000 0%, #52525b 25%, #000 50%, #52525b 75%, #000 100%)",
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {variant === "neon-edge" && (
        <motion.div
          className="absolute inset-0 border border-white/50 rounded-xl pointer-events-none"
          style={{
            WebkitMaskImage: maskTemplate,
            maskImage: maskTemplate,
          }}
        />
      )}

      {variant === "cyber-laser" && isHovered && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#ff5500] to-transparent shadow-[0_0_8px_#ff4400]"
        />
      )}

      <motion.div
        className={cn(
          "absolute inset-0 pointer-events-none flex items-center justify-center",
          activeGrad
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          WebkitMaskImage: maskTemplate,
          maskImage: maskTemplate,
        }}
      >
        <span className={cn(activeText)}>
          {children || "THE VOID"}
        </span>
      </motion.div>
    </motion.button>
  );
}

export function LaserVaultPassword({ className = "" }: { className?: string }) {
  const [passcode, setPasscode] = useState<string>("");
  const [lockedState, setLockedState] = useState<"locked" | "error" | "unlocked">("locked");
  const [lasersActive, setLasersActive] = useState(false);

  // Correct validation code matching the portal telemetry node ID
  const correctCode = "2094";

  // Typing key entries
  const handleKeyPress = (val: string) => {
    if (lockedState === "unlocked") return;
    if (passcode.length >= 8) return;

    playSound("click");
    setLockedState("locked");
    setPasscode((prev) => prev + val);
  };

  const handleClear = () => {
    playSound("click");
    setPasscode("");
    setLockedState("locked");
  };

  // Submit and test lock code
  const handleSubmit = () => {
    if (passcode === correctCode) {
      playSound("unlock");
      setLockedState("unlocked");
    } else {
      playSound("creak");
      setLockedState("error");
      setLasersActive(true);
      setTimeout(() => setLasersActive(false), 800);
    }
  };

  return (
    <motion.div
      animate={lockedState === "error" ? { x: [0, -10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative w-full max-w-[340px] p-6 rounded-3xl bg-[#0a0a0d] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.03)] flex flex-col gap-6",
        className
      )}
    >
      
      {/* Absolute overlay red alert warning lasers */}
      <AnimatePresence>
        {lasersActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-3xl border border-red-500/20 pointer-events-none z-30 overflow-hidden"
          >
            {/* Linear Laser scanning beams */}
            <motion.div
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ff0000]"
            />
            <motion.div
              initial={{ top: "-30%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-0.5 bg-red-400 shadow-[0_0_8px_#ff0000]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative safe door header */}
      <div className="w-full flex items-center justify-between border-b border-neutral-900 pb-3">
        <Key className="w-4 h-4 text-neutral-400" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-500">ENTER PASSWORD</span>
          <motion.div
            key={lockedState}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {lockedState === "unlocked" ? (
              <Unlock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className={`w-4 h-4 ${lockedState === "error" ? "text-red-500" : "text-neutral-500"}`} />
            )}
          </motion.div>
        </div>
      </div>

      {/* Passcode Display Box Slot */}
      <div className="w-full bg-[#050508] border border-neutral-900 rounded-2xl p-4 flex flex-col gap-1.5 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] relative overflow-hidden">
        <span className="font-mono text-[7px] uppercase tracking-widest text-neutral-600">INPUT SECURE PASSCODE</span>
        
        {/* Laser Etch Letter Display */}
        <div className="relative h-10 flex items-center gap-2 pl-1 select-none">
          
          <AnimatePresence>
            {passcode.split("").map((char, index) => {
              return (
                <motion.span
                  key={`char-${index}`}
                  initial={{
                    color: "#ffffff",
                    textShadow: "0 0 16px #ffffff",
                    opacity: 0,
                    scale: 1.25,
                  }}
                  animate={{
                    // Cools down from white-hot to glowing orange to carbon slate grey
                    color: ["#ffffff", "#ff4400", "#4b4b54"],
                    textShadow: ["0 0 16px #ffffff", "0 0 8px #ff4400", "none"],
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1.2,
                    times: [0, 0.25, 1],
                    ease: "easeOut",
                  }}
                  className="font-mono text-2xl font-black w-4 flex items-center justify-center relative"
                >
                  {/* Morphs letter into passcode dot bullet after 500ms */}
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 0.5, duration: 0.2 }}
                    className="absolute"
                  >
                    {char}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.2 }}
                    className="absolute"
                  >
                    ●
                  </motion.span>
                </motion.span>
              );
            })}
          </AnimatePresence>

          {/* Dynamic Laser beam vertical cursor cursor */}
          <motion.div
            animate={{ left: passcode.length * 24 + 4 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="absolute top-2 bottom-2 w-0.5 bg-orange-500 shadow-[0_0_8px_#ff4400,0_0_15px_#ff4400]"
          />
        </div>
      </div>

      {/* Safe Numeric Keypad (Using refined ambient clicky buttons) */}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <VoidButton
            key={num}
            variant="ambient"
            onClick={() => handleKeyPress(num)}
            activeGradientClass="bg-gradient-to-r from-neutral-200 via-white to-neutral-200"
            activeTextClass="text-black font-black"
            className="h-12 border-neutral-900 rounded-xl text-xs font-bold"
          >
            {num}
          </VoidButton>
        ))}

        {/* Clear Button */}
        <VoidButton
          variant="ambient"
          onClick={handleClear}
          activeGradientClass="bg-gradient-to-r from-[#ffd369] via-[#f39c12] to-[#ffffff]"
          activeTextClass="text-black font-black"
          className="h-12 border-neutral-900 rounded-xl text-[10px] tracking-wider"
        >
          Clear
        </VoidButton>

        {/* Zero */}
        <VoidButton
          variant="ambient"
          onClick={() => handleKeyPress("0")}
          activeGradientClass="bg-gradient-to-r from-neutral-200 via-white to-neutral-200"
          activeTextClass="text-black font-black"
          className="h-12 border-neutral-900 rounded-xl text-xs font-bold"
        >
          0
        </VoidButton>

        {/* Submit */}
        <VoidButton
          variant="ambient"
          onClick={handleSubmit}
          disabled={passcode.length === 0}
          activeGradientClass="bg-gradient-to-r from-[#86e3ce] to-[#d6e6f2]"
          activeTextClass="text-black font-black"
          className="h-12 border-neutral-900 rounded-xl text-[10px] tracking-wider disabled:opacity-25"
        >
          <div className="flex items-center justify-center gap-1">
            {lockedState === "unlocked" ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            Enter
          </div>
        </VoidButton>
      </div>
    </motion.div>
  );
}
