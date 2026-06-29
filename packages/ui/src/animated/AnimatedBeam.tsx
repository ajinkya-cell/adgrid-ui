"use client";

import React, { useEffect, useState, useId, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface AnimatedBeamProps {
  /**
   * Reference to the parent element container that constraints coordinates calculations.
   */
  containerRef: React.RefObject<HTMLElement | null>;
  /**
   * Reference to the origin element where the laser beam starts.
   */
  fromRef?: React.RefObject<HTMLElement | null>;
  /**
   * Reference to the destination element where the laser beam ends.
   */
  toRef?: React.RefObject<HTMLElement | null>;
  /**
   * Alternative origin binding via query selector or data-beam-id selector string.
   */
  fromId?: string;
  /**
   * Alternative destination binding via query selector or data-beam-id selector string.
   */
  toId?: string;
  /**
   * Bezier control point vertical offset defining path curvature. Positive for downward arc, negative for upward arc.
   * @default 0
   */
  curvature?: number;
  /**
   * Vertical coordinate offset calculation adjustments applied to the ending destination.
   * @default 0
   */
  endYOffset?: number;
  /**
   * If true, reverses the laser traversal flow direction along the curved path.
   * @default false
   */
  reverse?: boolean;
  /**
   * If true, renders two counter-flowing laser pulses traversing the path in opposite directions simultaneously.
   * @default false
   */
  bidirectional?: boolean;
  /**
   * SVG background connection wire stroke outline hex color code.
   * @default "rgba(255, 255, 255, 0.05)"
   */
  pathColor?: string;
  /**
   * SVG background connection wire stroke width.
   * @default 1.5
   */
  pathWidth?: number;
  /**
   * SVG background connection wire opacity.
   * @default 1
   */
  pathOpacity?: number;
  /**
   * Glowing laser pulse color start hex code.
   * @default "#ffffff"
   */
  beamColor?: string;
  /**
   * Glowing laser pulse color end hex code.
   * @default "rgba(255, 255, 255, 0)"
   */
  beamColorEnd?: string;
  /**
   * Glowing laser pulse stroke width.
   * @default 2
   */
  beamWidth?: number;
  /**
   * Pulse traversal period duration in seconds.
   * @default 2.5
   */
  duration?: number;
  /**
   * Optional pause delay in seconds before a pulse loops.
   * @default 0
   */
  delay?: number;
  /**
   * Custom dash array pattern matching connection styles (e.g. "4 4").
   */
  dashArray?: string;
  /**
   * If true, applies a drop-shadow volumetric gaussian blur filter beneath the laser pulses.
   * @default true
   */
  glow?: boolean;
  /**
   * Custom Tailwind CSS classes applied to the svg overlay element.
   */
  className?: string;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  fromId,
  toId,
  curvature = 0,
  endYOffset = 0,
  reverse = false,
  bidirectional = false,
  pathColor = "rgba(255, 255, 255, 0.05)",
  pathWidth = 1.5,
  pathOpacity = 1,
  beamColor = "#ffffff",
  beamColorEnd = "rgba(255, 255, 255, 0)",
  beamWidth = 2,
  duration = 2.5,
  delay = 0,
  dashArray,
  glow = true,
  className,
}: AnimatedBeamProps) {
  const id = useId();
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useEffect(() => {
    const updateCoords = () => {
      const container = containerRef.current;
      if (!container) return;

      let fromEl: HTMLElement | null = null;
      let toEl: HTMLElement | null = null;

      // Ref lookup takes precedence, ID/data-beam-id lookup is the convenient fallback
      if (fromRef?.current) {
        fromEl = fromRef.current;
      } else if (fromId) {
        fromEl =
          container.querySelector(`#${fromId}`) ||
          container.querySelector(`[data-beam-id="${fromId}"]`) ||
          container.querySelector(fromId);
      }

      if (toRef?.current) {
        toEl = toRef.current;
      } else if (toId) {
        toEl =
          container.querySelector(`#${toId}`) ||
          container.querySelector(`[data-beam-id="${toId}"]`) ||
          container.querySelector(toId);
      }

      if (!fromEl || !toEl) return;

      const containerRect = container.getBoundingClientRect();
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
      const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
      const x2 = toRect.left - containerRect.left + toRect.width / 2;
      const y2 = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      setCoords({ x1, y1, x2, y2 });
    };

    updateCoords();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(updateCoords);
    resizeObserver.observe(container);

    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [containerRef, fromRef, toRef, fromId, toId, endYOffset]);

  // SVG Bezier curved path formatting
  const pathD = useMemo(() => {
    const { x1, y1, x2, y2 } = coords;
    if (curvature === 0) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    const controlX = (x1 + x2) / 2;
    const controlY = (y1 + y2) / 2 + curvature;
    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  }, [coords, curvature]);

  // Compute dynamic dash array size relative to distance to support exactly one pulse per loop
  const { beamLength, gapLength, totalPeriod } = useMemo(() => {
    const dx = coords.x2 - coords.x1;
    const dy = coords.y2 - coords.y1;
    const distance = Math.sqrt(dx * dx + dy * dy) + Math.abs(curvature);
    const pulseLength = Math.min(80, Math.max(30, distance * 0.2)); // dynamic beam size
    const gap = distance;
    const period = pulseLength + gap;
    return {
      beamLength: pulseLength,
      gapLength: gap,
      totalPeriod: period,
    };
  }, [coords, curvature]);

  return (
    <svg
      fill="none"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
    >
      <defs>
        {/* Glow volumetric filter */}
        {glow && (
          <filter id={`beam-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}

        {/* Dynamic gradient mapping along path coordinates */}
        <linearGradient
          id={`beam-grad-${id}`}
          gradientUnits="userSpaceOnUse"
          x1={coords.x1}
          y1={coords.y1}
          x2={coords.x2}
          y2={coords.y2}
        >
          <stop offset="0%" stopColor={beamColor} stopOpacity={0} />
          <stop offset="50%" stopColor={beamColor} stopOpacity={1} />
          <stop offset="100%" stopColor={beamColorEnd} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* 1. Static base connection line */}
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeDasharray={dashArray}
        strokeLinecap="round"
      />

      {/* 2. Soft underlying bloom overlay (depth highlight) */}
      {glow && totalPeriod > 0 && (
        <motion.path
          d={pathD}
          stroke={`url(#beam-grad-${id})`}
          strokeWidth={beamWidth * 2.2}
          strokeOpacity={0.12}
          strokeLinecap="round"
          strokeDasharray={`${beamLength} ${gapLength}`}
          animate={{ strokeDashoffset: reverse ? [0, totalPeriod] : [totalPeriod, 0] }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: delay,
          }}
          filter={`url(#beam-glow-${id})`}
        />
      )}

      {/* 3. Main glowing beam pulse (Single uniform path) */}
      {totalPeriod > 0 && (
        <motion.path
          d={pathD}
          stroke={`url(#beam-grad-${id})`}
          strokeWidth={beamWidth}
          strokeOpacity={0.9}
          strokeLinecap="round"
          strokeDasharray={`${beamLength} ${gapLength}`}
          animate={{ strokeDashoffset: reverse ? [0, totalPeriod] : [totalPeriod, 0] }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: delay,
          }}
          filter={glow ? `url(#beam-glow-${id})` : undefined}
        />
      )}

      {/* 4. Bidirectional beam pulse going in reverse */}
      {bidirectional && totalPeriod > 0 && (
        <motion.path
          d={pathD}
          stroke={`url(#beam-grad-${id})`}
          strokeWidth={beamWidth}
          strokeOpacity={0.9}
          strokeLinecap="round"
          strokeDasharray={`${beamLength} ${gapLength}`}
          animate={{ strokeDashoffset: reverse ? [totalPeriod, 0] : [0, totalPeriod] }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: delay,
          }}
          filter={glow ? `url(#beam-glow-${id})` : undefined}
        />
      )}
    </svg>
  );
}
