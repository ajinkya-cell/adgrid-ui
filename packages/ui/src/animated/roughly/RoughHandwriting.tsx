"use client";

import React, {
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import type { Font, Path } from "opentype.js";
import {
  loadHandwritingFont,
  type HandwritingFont,
} from "./handwriting-fonts";

export type { HandwritingFont };

export interface RoughHandwritingProps {
  children?: React.ReactNode;
  /** Handwriting font: 'reenie-beanie' | 'caveat' | 'kalam' (default: 'reenie-beanie') */
  font?: HandwritingFont;
  /** Optional custom URL to a .ttf file to parse with opentype.js */
  fontUrl?: string;
  /** Ink stroke and fill color (default: '#6366F1') */
  color?: string;
  /** Stroke thickness in pixels (default: 1.5) */
  strokeWidth?: number;
  /** Whether the drawing stroke animates into view (default: true) */
  animate?: boolean;
  /** Total animation duration in ms for display mode (default: 1200) */
  animationDuration?: number;
  /** Delay before animation starts in ms (default: 0) */
  animationDelay?: number;
  /** Font size in px used for glyph path generation (default: 40) */
  fontSize?: number;
  /** Maximum number of words allowed (default: 6) */
  maxWords?: number;
  /** Maximum number of characters allowed (default: 50) */
  maxLength?: number;
  /** Enable interactive live-typing mode (default: false) */
  editable?: boolean;
  /** Controlled value in editable mode */
  value?: string;
  /** Default value in editable mode */
  defaultValue?: string;
  /** Placeholder displayed when text is empty in editable mode */
  placeholder?: string;
  /** Callback fired when text changes in editable mode */
  onChange?: (text: string) => void;
  /** Additional CSS class for the container */
  className?: string;
  /** Additional CSS class for the text */
  textClassName?: string;
}


function extractStringFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractStringFromChildren).join("");
  if (React.isValidElement(children) && children.props && (children.props as { children?: React.ReactNode }).children) {
    return extractStringFromChildren((children.props as { children?: React.ReactNode }).children);
  }
  return "";
}

function truncateToWordsAndLength(text: string, maxWords: number, maxLength: number): string {
  if (!text) return "";
  let trimmed = text.slice(0, maxLength);
  const words = trimmed.trim().split(/\s+/);
  if (words.length > maxWords) {
    // Reconstruct up to maxWords
    const regex = new RegExp(`^(\\S+\\s+){${maxWords - 1}}\\S+`);
    const match = trimmed.match(regex);
    if (match) {
      trimmed = match[0];
    } else {
      trimmed = words.slice(0, maxWords).join(" ");
    }
  }
  return trimmed;
}

function glyphPathToSvgPath(gp: Path, decimalPlaces = 2): string {
  const factor = 10 ** decimalPlaces;
  const round = (val: number): string => {
    if (!Number.isFinite(val)) return "0";
    return String(Math.round(val * factor) / factor);
  };

  let d = "";
  for (let i = 0; i < gp.commands.length; i++) {
    const cmd = gp.commands[i];
    if (cmd.type === "M") {
      d += `M${round(cmd.x)} ${round(cmd.y)}`;
    } else if (cmd.type === "L") {
      d += `L${round(cmd.x)} ${round(cmd.y)}`;
    } else if (cmd.type === "C") {
      d += `C${round(cmd.x1)} ${round(cmd.y1)} ${round(cmd.x2)} ${round(cmd.y2)} ${round(cmd.x)} ${round(cmd.y)}`;
    } else if (cmd.type === "Q") {
      d += `Q${round(cmd.x1)} ${round(cmd.y1)} ${round(cmd.x)} ${round(cmd.y)}`;
    } else if (cmd.type === "Z") {
      d += "Z";
    }
  }
  return d;
}

interface PathItem {
  id: string;
  d: string;
  char: string;
  isSpace: boolean;
  index: number;
}

const fontCssClassMap: Record<HandwritingFont, string> = {
  "reenie-beanie": "font-reenie-beanie",
  caveat: "font-caveat",
  kalam: "font-kalam",
};

export function RoughHandwriting({
  children,
  font = "reenie-beanie",
  fontUrl,
  color = "#6366F1",
  strokeWidth = 1.5,
  animate = true,
  animationDuration = 1200,
  animationDelay = 0,
  fontSize = 40,
  maxWords = 6,
  maxLength = 50,
  editable = false,
  value,
  defaultValue,
  placeholder = "Write here...",
  onChange,
  className = "",
  textClassName = "",
}: RoughHandwritingProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceId = useId().replace(/:/g, "");

  // Text state for controlled or uncontrolled usage
  const initialText =
    value !== undefined
      ? value
      : defaultValue !== undefined
      ? defaultValue
      : extractStringFromChildren(children);

  const [text, setText] = useState<string>(() =>
    truncateToWordsAndLength(initialText, maxWords, maxLength)
  );
  const [isFocused, setIsFocused] = useState(false);
  const [loadedFont, setLoadedFont] = useState<Font | null>(null);
  const [inView, setInView] = useState(!animate);

  // Synchronize controlled value
  useEffect(() => {
    if (value !== undefined) {
      setText(truncateToWordsAndLength(value, maxWords, maxLength));
    }
  }, [value, maxWords, maxLength]);

  // Synchronize children change when not in editable mode
  useEffect(() => {
    if (!editable && value === undefined) {
      const extracted = extractStringFromChildren(children);
      setText(truncateToWordsAndLength(extracted, maxWords, maxLength));
    }
  }, [children, editable, value, maxWords, maxLength]);

  // Viewport intersection observer to start animation when in view
  useEffect(() => {
    if (!animate) {
      setInView(true);
      return;
    }
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  // Load the opentype font
  useEffect(() => {
    let active = true;
    loadHandwritingFont(font, fontUrl)
      .then((parsed) => {
        if (active) {
          setLoadedFont(parsed);
        }
      })
      .catch((err) => {
        console.warn("RoughHandwriting: Failed to load font outline, falling back to CSS font:", err);
      });

    return () => {
      active = false;
    };
  }, [font, fontUrl]);

  // Compute SVG paths and bounding box from current text
  const displayText = text || (editable ? placeholder : "");
  const isShowingPlaceholder = !text && editable;

  const { pathItems, viewBox, svgWidth, svgHeight } = React.useMemo(() => {
    if (!loadedFont || !displayText) {
      return {
        pathItems: [] as PathItem[],
        viewBox: "0 0 100 40",
        svgWidth: 100,
        svgHeight: 40,
      };
    }

    const baseline = fontSize * 0.85;
    const items: PathItem[] = [];

    try {
      const glyphPaths = loadedFont.getPaths(displayText, 0, baseline, fontSize);
      const overallPath = loadedFont.getPath(displayText, 0, baseline, fontSize);
      const bb = overallPath.getBoundingBox();
      const bounds = glyphPaths.reduce(
        (current, glyphPath) => {
          const glyphBounds = glyphPath.getBoundingBox();
          return {
            x1: Math.min(current.x1, glyphBounds.x1),
            y1: Math.min(current.y1, glyphBounds.y1),
            x2: Math.max(current.x2, glyphBounds.x2),
            y2: Math.max(current.y2, glyphBounds.y2),
          };
        },
        { x1: bb.x1, y1: bb.y1, x2: bb.x2, y2: bb.y2 }
      );

      glyphPaths.forEach((gp, idx) => {
        const char = displayText[idx] || "";
        const isSpace = char === " ";
        const pathData = glyphPathToSvgPath(gp, 2);
        items.push({
          id: `${instanceId}-${idx}-${char}`,
          d: pathData,
          char,
          isSpace,
          index: idx,
        });
      });

      // Keep the viewBox clear of the painted stroke as well as the glyph
      // outlines. Large stroke widths can extend past the font's path bounds.
      const strokePadding = Math.max(2, strokeWidth / 2 + 1);
      const paddingX = 6 + strokePadding;
      const paddingY = 8 + strokePadding;
      const minX = bounds.x1 - paddingX;
      const minY = bounds.y1 - paddingY;
      const width = Math.max(20, bounds.x2 - bounds.x1 + paddingX * 2);
      const height = Math.max(20, bounds.y2 - bounds.y1 + paddingY * 2);

      return {
        pathItems: items,
        viewBox: `${minX} ${minY} ${width} ${height}`,
        svgWidth: width,
        svgHeight: height,
      };
    } catch {
      return {
        pathItems: [] as PathItem[],
        viewBox: "0 0 100 40",
        svgWidth: 100,
        svgHeight: 40,
      };
    }
  }, [loadedFont, displayText, fontSize, strokeWidth, instanceId, editable, placeholder]);

  // Input change handler for editable mode
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const incoming = e.target.value;
      const truncated = truncateToWordsAndLength(incoming, maxWords, maxLength);
      setText(truncated);
      onChange?.(truncated);
    },
    [maxWords, maxLength, onChange]
  );

  const activeColor = isShowingPlaceholder ? "rgba(156, 163, 175, 0.45)" : color;

  // Render fallback if font not loaded yet
  const fontClass = fontCssClassMap[font] || "font-reenie-beanie";

  return (
    <span
      ref={containerRef}
      onClick={() => {
        if (editable && inputRef.current) {
          inputRef.current.focus();
        }
      }}
      className={`relative inline-flex items-center align-middle ${
        editable ? "cursor-text select-none group" : ""
      } ${className}`}
      style={{ minHeight: `${Math.round(fontSize * 1.35)}px` }}
    >
      {/* Hidden input field for capturing keystrokes in editable mode */}
      {editable && (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="sr-only"
          aria-label="Handwriting input"
        />
      )}

      {/* Fallback text shown while font is parsing or in SSR */}
      {!loadedFont ? (
        <span
          className={`relative inline-block ${fontClass} transition-opacity ${
            inView ? "opacity-100" : "opacity-0"
          } ${textClassName}`}
          style={{
            color: activeColor,
            fontSize: `${fontSize}px`,
            lineHeight: `${Math.round(fontSize * 1.35)}px`,
          }}
        >
          {displayText}
        </span>
      ) : (
        <span className="relative inline-flex items-center">
          <svg
            viewBox={viewBox}
            style={{
              width: `${svgWidth}px`,
              height: `${svgHeight}px`,
            }}
            className="block overflow-visible select-none pointer-events-none"
            fill="none"
          >
            <g>
              {pathItems.map((item) => {
                if (item.isSpace || !item.d) {
                  return null;
                }

                // Calculate stagger timing
                const totalNonSpace = Math.max(1, pathItems.filter((p) => !p.isSpace).length);
                const charDuration = Math.max(0.12, (animationDuration / 1000) / totalNonSpace);
                const charDelay =
                  animationDelay / 1000 + item.index * (charDuration * 0.75);

                return (
                  <motion.path
                    key={item.id}
                    d={item.d}
                    stroke={activeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={activeColor}
                    fillRule="nonzero"
                    initial={
                      animate
                        ? { pathLength: 0, strokeOpacity: 0, fillOpacity: 0 }
                        : { pathLength: 1, strokeOpacity: 1, fillOpacity: 1 }
                    }
                    animate={
                      inView
                        ? { pathLength: 1, strokeOpacity: 1, fillOpacity: 1 }
                        : { pathLength: 0, strokeOpacity: 0, fillOpacity: 0 }
                    }
                    transition={{
                      pathLength: {
                        duration: charDuration,
                        delay: charDelay,
                        ease: [0.25, 0.1, 0.25, 1],
                      },
                      strokeOpacity: {
                        // Snap visible exactly when this character's stroke begins — no pre-render dot
                        duration: 0,
                        delay: charDelay,
                      },
                      fillOpacity: {
                        duration: charDuration * 0.4,
                        delay: charDelay + charDuration * 0.7,
                        ease: "easeOut",
                      },
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Interactive typing indicator / blinking cursor in editable mode */}
          {editable && isFocused && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
              className="inline-block ml-1 w-0.5 h-6 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
        </span>
      )}
    </span>
  );
}
