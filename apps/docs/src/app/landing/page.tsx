"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Check } from "lucide-react";

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  const email = "hello@aayushbharti.in";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white flex flex-col justify-between items-center overflow-hidden font-sans">
      {/* Force dark overrides for this page */}
      <style dangerouslySetInnerHTML={{ __html: `
        header { display: none !important; }
        body > div.pt-16 { padding-top: 0px !important; }
        html, body { background-color: #030303 !important; }
      `}} />

      {/* ================= BACKGROUND AURORA & ARC ================= */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end overflow-hidden">
        
        {/* Northern Lights / Aurora Glow Layer */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Animated Purple/Indigo Glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 0.9, 1],
              x: [-40, 30, -20, -40],
              y: [20, -30, 10, 20],
              opacity: [0.4, 0.7, 0.5, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-[500px] h-[350px] sm:w-[800px] sm:h-[500px] bg-gradient-to-r from-purple-900/60 via-indigo-800/50 to-blue-900/40 rounded-full blur-[100px] -bottom-10 -left-20"
          />

          {/* Animated Cyan/Teal Glow */}
          <motion.div
            animate={{
              scale: [1.1, 0.9, 1.25, 1.1],
              x: [30, -40, 20, 30],
              y: [-20, 30, -10, -20],
              opacity: [0.3, 0.6, 0.4, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-[450px] h-[300px] sm:w-[700px] sm:h-[450px] bg-gradient-to-r from-cyan-600/40 via-sky-800/50 to-indigo-900/50 rounded-full blur-[90px] -bottom-10 -right-20"
          />

          {/* Center Subtle Magenta Shimmer */}
          <motion.div
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [0.95, 1.1, 0.95],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-[600px] h-[300px] bg-violet-600/30 rounded-full blur-[120px] bottom-10"
          />
        </div>

        {/* Planet Arc Outer Shadow Mask */}
        <div className="absolute bottom-0 w-[160%] sm:w-[140%] md:w-[120%] h-[300px] sm:h-[400px] rounded-t-[100%] bg-gradient-to-b from-transparent via-[#050508]/80 to-[#050508] pointer-events-none" />

        {/* Glowing Horizon Arc Line */}
        <div className="relative w-[180%] sm:w-[150%] md:w-[130%] h-[200px] sm:h-[300px] rounded-t-[100%] bg-[#08090E] border-t border-white/40 shadow-[0_-15px_60px_rgba(255,255,255,0.25)] flex justify-center">
          {/* Inner Light Arc Gradient Accent */}
          <div className="absolute top-0 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent blur-[1px]" />
          <div className="absolute -top-1 w-1/2 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[2px]" />
        </div>
      </div>

      {/* ================= CONTENT HERO ================= */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32 text-center flex flex-col items-center justify-center my-auto">
        
        {/* Top Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm text-gray-300 hover:border-white/20 transition-all cursor-pointer mb-8"
        >
          <span className="bg-blue-600 text-white font-semibold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-sm">
            Upcoming
          </span>
          <span className="flex items-center gap-1 font-medium text-gray-200">
            Nextnode is launching soon!
            <span className="text-gray-400">&gt;</span>
          </span>
        </motion.div>

        {/* Main Headlines */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl tracking-tight font-serif text-gray-100 max-w-4xl leading-[1.15]"
        >
          Code that feels designed. <br />
          <span className="italic font-normal text-gray-200">
            Engineering that actually ships.
          </span>
        </motion.h1>

        {/* Profile / Intro Line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-2.5 text-lg sm:text-2xl text-gray-300 font-light"
        >
          <span>Hello, I&apos;m Aayush Bharti</span>
          {/* Avatar Thumbnail */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-white/20 shadow-inner bg-gray-800">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Aayush Bharti"
              className="w-full h-full object-cover"
            />
          </div>
          <span>a Full Stack Developer</span>
        </motion.div>

        {/* Call To Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          {/* Primary Action Button */}
          <a
            href="#connect"
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-white/15 text-sm font-medium text-white shadow-lg backdrop-blur-xl hover:border-white/30 hover:bg-slate-800 transition-all duration-200"
          >
            <span>Let&apos;s Connect</span>
            <span className="p-1 rounded-full bg-white text-black transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* Copy Email Button */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-transparent text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
            <span className="font-mono text-xs sm:text-sm">{email}</span>
          </button>
        </motion.div>

      </div>
    </main>
  );
}