"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Copy, Check, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

export interface MoonLandingProps {
  /**
   * Optional badge label
   * @default "Upcoming"
   */
  badgeLabel?: string;
  /**
   * Optional badge subtext
   * @default "Nextnode is launching soon!"
   */
  badgeSubText?: string;
  /**
   * Optional badge URL target
   * @default "#"
   */
  badgeHref?: string;
  /**
   * Main heading first line
   * @default "Code that feels designed."
   */
  headingText?: string;
  /**
   * Main heading second line (italicized)
   * @default "Engineering that actually ships."
   */
  headingLine2?: string;
  /**
   * The prefix intro text
   * @default "Hello, I'm"
   */
  introPrefix?: string;
  /**
   * Name displayed in the profile pill
   * @default "Aayush Bharti"
   */
  commanderName?: string;
  /**
   * Suffix description after the avatar
   * @default "a Full Stack Developer"
   */
  introSuffix?: string;
  /**
   * URL for the avatar image
   * @default a placeholder avatar
   */
  avatarUrl?: string;
  /**
   * Text for the primary CTA button
   * @default "Let's Connect"
   */
  primaryBtnText?: string;
  /**
   * Target URL for the primary CTA button
   * @default "#connect"
   */
  primaryBtnHref?: string;
  /**
   * Email or secondary text to copy
   * @default "hello@aayushbharti.in"
   */
  secondaryText?: string;
  /**
   * Optional custom class for outer container
   */
  className?: string;
}

export function MoonLanding({
  badgeLabel = "Upcoming",
  badgeSubText = "Nextnode is launching soon!",
  badgeHref = "#",
  headingText = "Code that feels designed.",
  headingLine2 = "Engineering that actually ships.",
  introPrefix = "Hello, I'm",
  commanderName = "Aayush Bharti",
  introSuffix = "a Full Stack Developer",
  avatarUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z'/></svg>",
  primaryBtnText = "Let's Connect",
  primaryBtnHref = "#connect",
  secondaryText = "hello@aayushbharti.in",
  className,
}: MoonLandingProps) {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleCopy = () => {
    navigator.clipboard.writeText(secondaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap");

            .moon-font-display {
              font-family: "Playfair Display", Georgia, serif;
            }
          `,
        }}
      />

      <main
        className={cn(
          "relative min-h-screen w-full overflow-hidden text-white flex flex-col justify-between items-center",
          className
        )}
        style={{ background: "linear-gradient(180deg, #030303 0%, #050508 40%, #08080A 100%)" }}
      >

        {/* ============================================================ */}
        {/* BACKGROUND LAYER - Aurora Glow + Planetary Arc               */}
        {/* ============================================================ */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.04, 0.98, 1],
                    x: [-14, 10, -6, -14],
                    opacity: [0.44, 0.58, 0.48, 0.44],
                  }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: [0.45, 0, 0.2, 1],
            }}
            style={{
              position: "absolute",
              left: "-6%",
              bottom: "2%",
              width: "58%",
              height: "48%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at 62% 64%, rgba(73,34,151,0.52) 0%, rgba(38,25,95,0.34) 38%, rgba(9,8,18,0) 72%)",
              filter: "blur(78px)",
            }}
          />

          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 0.97, 1.05, 1],
                    x: [12, -10, 8, 12],
                    opacity: [0.38, 0.54, 0.42, 0.38],
                  }
            }
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: [0.45, 0, 0.2, 1],
            }}
            style={{
              position: "absolute",
              right: "-10%",
              bottom: "0%",
              width: "60%",
              height: "50%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at 36% 62%, rgba(8,133,170,0.5) 0%, rgba(13,91,132,0.36) 34%, rgba(31,24,90,0.18) 58%, rgba(5,7,12,0) 76%)",
              filter: "blur(76px)",
            }}
          />

          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: [0.42, 0.58, 0.42],
                    scale: [0.99, 1.035, 0.99],
                  }
            }
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: [0.45, 0, 0.2, 1],
            }}
            style={{
              position: "absolute",
              left: "20%",
              bottom: "9%",
              width: "62%",
              height: "36%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at 50% 82%, rgba(122,216,224,0.38) 0%, rgba(39,112,180,0.3) 28%, rgba(35,35,112,0.2) 54%, rgba(5,6,12,0) 76%)",
              filter: "blur(72px)",
            }}
          />

          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: [0.13, 0.21, 0.13],
                  }
            }
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: [0.45, 0, 0.2, 1],
            }}
            style={{
              position: "absolute",
              left: "8%",
              bottom: "25%",
              width: "80%",
              height: "30%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at 50% 85%, rgba(104,58,183,0.16) 0%, rgba(24,21,58,0.12) 42%, rgba(3,3,7,0) 72%)",
              filter: "blur(96px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "104px",
              width: "116%",
              height: "210px",
              transform: "translateX(-50%)",
              background:
                "radial-gradient(ellipse 39% 78% at 50% 100%, rgba(255,255,255,0.5) 0%, rgba(230,244,252,0.32) 18%, rgba(123,213,231,0.19) 36%, rgba(62,100,172,0.08) 58%, rgba(5,6,11,0) 80%)",
              filter: "blur(28px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-438px",
              width: "190vw",
              height: "560px",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              borderTop: "1px solid rgba(255,255,255,0.18)",
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(92,93,99,0.38) 0%, rgba(26,27,32,0.82) 14%, rgba(7,7,9,0.96) 34%, #020203 100%)",
              boxShadow: [
                "0 -1px 0 rgba(255,255,255,0.24)",
                "0 -18px 42px rgba(224,238,245,0.16)",
                "0 -42px 96px rgba(148,205,224,0.12)",
                "inset 0 16px 26px rgba(255,255,255,0.055)",
                "inset 0 54px 120px rgba(180,190,205,0.045)",
              ].join(", "),
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-438px",
              width: "190vw",
              height: "560px",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background: "transparent",
              borderTop: "1px solid rgba(255,255,255,0.72)",
              boxShadow: [
                "0 -1px 0 rgba(255,255,255,0.84)",
                "0 -4px 10px rgba(255,255,255,0.34)",
                "0 8px 22px rgba(255,255,255,0.12)",
                "0 18px 46px rgba(168,178,190,0.12)",
              ].join(", "),
              maskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.58) 22%, rgba(0,0,0,0.92) 36%, #000 50%, rgba(0,0,0,0.92) 64%, rgba(0,0,0,0.58) 78%, rgba(0,0,0,0.18) 90%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.58) 22%, rgba(0,0,0,0.92) 36%, #000 50%, rgba(0,0,0,0.92) 64%, rgba(0,0,0,0.58) 78%, rgba(0,0,0,0.18) 90%, transparent 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-437px",
              width: "190vw",
              height: "560px",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background: "transparent",
              borderTop: "8px solid rgba(255,255,255,0.86)",
              boxShadow: [
                "0 -2px 0 rgba(255,255,255,0.54)",
                "0 -7px 16px 2px rgba(255,255,255,0.58)",
                "0 -18px 44px 8px rgba(226,244,255,0.28)",
                "0 8px 22px rgba(255,255,255,0.18)",
                "0 20px 54px rgba(210,217,226,0.16)",
                "0 46px 120px rgba(92,104,128,0.18)",
              ].join(", "),
              filter: "blur(0.4px)",
              maskImage:
                "linear-gradient(90deg, transparent 0%, transparent 23%, rgba(0,0,0,0.1) 28%, rgba(0,0,0,0.44) 35%, rgba(0,0,0,0.82) 43%, #000 50%, rgba(0,0,0,0.82) 57%, rgba(0,0,0,0.44) 65%, rgba(0,0,0,0.1) 72%, transparent 77%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, transparent 23%, rgba(0,0,0,0.1) 28%, rgba(0,0,0,0.44) 35%, rgba(0,0,0,0.82) 43%, #000 50%, rgba(0,0,0,0.82) 57%, rgba(0,0,0,0.44) 65%, rgba(0,0,0,0.1) 72%, transparent 77%, transparent 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-437px",
              width: "190vw",
              height: "560px",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background: "transparent",
              borderTop: "2px solid rgba(255,255,255,0.98)",
              boxShadow: [
                "0 -1px 0 rgba(255,255,255,0.95)",
                "0 -3px 8px rgba(255,255,255,0.76)",
                "0 -7px 18px rgba(231,247,255,0.36)",
                "0 5px 18px rgba(255,255,255,0.16)",
              ].join(", "),
              maskImage:
                "linear-gradient(90deg, transparent 0%, transparent 24%, rgba(0,0,0,0.08) 31%, rgba(0,0,0,0.42) 39%, rgba(0,0,0,0.88) 47%, #000 50%, rgba(0,0,0,0.88) 53%, rgba(0,0,0,0.42) 61%, rgba(0,0,0,0.08) 69%, transparent 76%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, transparent 24%, rgba(0,0,0,0.08) 31%, rgba(0,0,0,0.42) 39%, rgba(0,0,0,0.88) 47%, #000 50%, rgba(0,0,0,0.88) 53%, rgba(0,0,0,0.42) 61%, rgba(0,0,0,0.08) 69%, transparent 76%, transparent 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-437px",
              width: "190vw",
              height: "560px",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background: "transparent",
              boxShadow: [
                "0 -8px 26px rgba(255,255,255,0.46)",
                "0 -18px 58px rgba(214,242,255,0.24)",
                "0 -34px 96px rgba(89,196,229,0.12)",
              ].join(", "),
              maskImage:
                "radial-gradient(ellipse 36% 18% at 50% 0%, #000 0%, rgba(0,0,0,0.9) 34%, rgba(0,0,0,0.34) 67%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 36% 18% at 50% 0%, #000 0%, rgba(0,0,0,0.9) 34%, rgba(0,0,0,0.34) 67%, transparent 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-436px",
              width: "190vw",
              height: "560px",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background: "transparent",
              boxShadow: [
                "0 8px 20px rgba(255,255,255,0.18)",
                "0 22px 58px rgba(220,225,232,0.15)",
                "0 54px 132px rgba(104,111,128,0.16)",
              ].join(", "),
              maskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.24) 15%, rgba(0,0,0,0.72) 35%, #000 50%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.24) 85%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.24) 15%, rgba(0,0,0,0.72) 35%, #000 50%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.24) 85%, transparent 100%)",
            }}
          />
        </div>

        {/* ================= CONTENT HERO ================= */}
        <div className="relative z-10 mx-auto my-auto flex max-w-5xl flex-col items-center justify-center px-6 pb-40 pt-24 text-center">

          {/* Top Announcement Badge */}
          {badgeSubText && (
            <motion.a
              href={badgeHref}
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300 backdrop-blur-md transition-all hover:border-white/20 sm:text-sm"
            >
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:text-xs">
                {badgeLabel}
              </span>
              <span className="flex items-center gap-1 font-medium text-gray-200">
                {badgeSubText}
                <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
              </span>
            </motion.a>
          )}

          {/* Main Headlines */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="moon-font-display max-w-4xl text-4xl leading-[1.15] tracking-tight text-gray-100 sm:text-6xl md:text-7xl"
          >
            {headingText}
            {headingLine2 && (
              <>
                <br />
                <span className="italic font-normal text-gray-300/90">
                  {headingLine2}
                </span>
              </>
            )}
          </motion.h1>

          {/* Profile / Intro Line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 flex items-center justify-center gap-2.5 text-lg font-light text-gray-400 sm:text-2xl"
          >
            <span>{introPrefix}</span>
            <span>{commanderName}</span>
            {/* Avatar Thumbnail */}
            <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-gray-800 shadow-inner sm:h-10 sm:w-10">
              <img
                src={avatarUrl}
                alt={commanderName}
                className="h-full w-full object-cover"
              />
            </span>
            <span>{introSuffix}</span>
          </motion.div>

          {/* Call To Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
          >
            {/* Primary Action Button — Glassmorphism */}
            {primaryBtnText && (
              <a
                href={primaryBtnHref}
                className="group relative inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition-all duration-200 hover:border-white/25 hover:bg-white/[0.1]"
              >
                <span>{primaryBtnText}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
            )}

            {/* Copy Email Button */}
            {secondaryText && (
              <button
                onClick={handleCopy}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-transparent px-5 py-3 text-sm text-gray-400 transition-colors hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-mono text-xs sm:text-sm">
                  {secondaryText}
                </span>
              </button>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
