"use client";

import React from "react";
import { RoughCircle } from "./roughly/RoughCircle";
import { RoughUnderline } from "./roughly/RoughUnderline";
import { RoughStrike, type StrikeVariant } from "./roughly/RoughStrike";
import { RoughCross, type CrossVariant } from "./roughly/RoughCross";
import {
  RoughBracket,
  type BracketSide,
  type BracketStyle,
} from "./roughly/RoughBracket";
import { RoughHighlight } from "./roughly/RoughHighlight";
import { RoughBox, type BoxVariant } from "./roughly/RoughBox";
import {
  RoughArrow,
  type ArrowPlacement,
  type ArrowVariant,
  type ArrowheadStyle,
} from "./roughly/RoughArrow";

export type RoughlyType =
  | "underline"
  | "circle"
  | "strike-through"
  | "cross-off"
  | "bracket"
  | "box"
  | "highlight"
  | "arrow";

export type { BracketSide, BracketStyle } from "./roughly/RoughBracket";
export type { BoxVariant } from "./roughly/RoughBox";
export type { ArrowPlacement, ArrowVariant, ArrowheadStyle };

export type UnderlineVariant = "single" | "double" | "wavy";
export type { StrikeVariant } from "./roughly/RoughStrike";
export type { CrossVariant } from "./roughly/RoughCross";

export interface RoughlyProps {
  children?: React.ReactNode;
  /** Type of annotation */
  type?: RoughlyType;
  /** Stroke / highlight color */
  color?: string;
  /** Stroke width for lines, circles, boxes, and brackets (in px) */
  strokeWidth?: number;
  /** Whether to animate the drawing stroke */
  animate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Placement side when type is 'bracket' ('left' | 'right' | 'top' | 'bottom') */
  brackets?: BracketSide;
  /** Alias for brackets prop */
  side?: BracketSide;
  /** Bracket style: 'curly' ({) or 'square' ([) */
  bracketStyle?: BracketStyle;
  /** Variant for underline ('single' | 'double' | 'wavy'), strike-through ('single' | 'double' | 'triple'), cross-off ('single' | 'double'), or box ('single' | 'double') */
  variant?: UnderlineVariant | StrikeVariant | CrossVariant | BoxVariant;
  /** Placement direction when type is 'arrow' */
  placement?: ArrowPlacement;
  /** Arrow curve variant ('curved' | 'straight' | 's-curve' | 'loop') */
  arrowVariant?: ArrowVariant;
  /** Callout label for arrow */
  arrowLabel?: React.ReactNode;
  /** Custom wrapper class */
  className?: string;
  /** Custom text class */
  textClassName?: string;
}

// Default colors matching dark-first Void UI palette
const DEFAULT_COLORS: Record<RoughlyType, string> = {
  underline: "#6366F1", // Indigo
  circle: "#EC4899", // Rose / Pink
  "strike-through": "#EF4444", // Red
  "cross-off": "#F43F5E", // Rose Red
  bracket: "#F59E0B", // Cyber Amber
  box: "#10B981", // Emerald
  highlight: "#4338CA", // Deep Royal Indigo
  arrow: "#F59E0B", // Cyber Amber
};

export function Roughly({
  children,
  type = "underline",
  color,
  strokeWidth = 2,
  animate = true,
  animationDuration = 750,
  brackets,
  side,
  bracketStyle = "curly",
  variant = "single",
  placement,
  arrowVariant,
  arrowLabel,
  className = "",
  textClassName = "",
}: RoughlyProps) {
  if (type === "circle") {
    return (
      <RoughCircle
        color={color || DEFAULT_COLORS.circle}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughCircle>
    );
  }

  if (type === "underline") {
    return (
      <RoughUnderline
        variant={variant as UnderlineVariant}
        color={color || DEFAULT_COLORS.underline}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughUnderline>
    );
  }

  if (type === "strike-through") {
    return (
      <RoughStrike
        variant={(variant as StrikeVariant) || "single"}
        color={color || DEFAULT_COLORS["strike-through"]}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughStrike>
    );
  }

  if (type === "cross-off") {
    return (
      <RoughCross
        variant={(variant as CrossVariant) || "single"}
        color={color || DEFAULT_COLORS["cross-off"]}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughCross>
    );
  }

  if (type === "bracket") {
    return (
      <RoughBracket
        side={side || brackets || "left"}
        bracketStyle={bracketStyle}
        color={color || DEFAULT_COLORS.bracket}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughBracket>
    );
  }

  if (type === "highlight") {
    return (
      <RoughHighlight
        color={color || DEFAULT_COLORS.highlight}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughHighlight>
    );
  }

  if (type === "box") {
    return (
      <RoughBox
        variant={(variant as BoxVariant) || "double"}
        color={color || DEFAULT_COLORS.box}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughBox>
    );
  }

  if (type === "arrow") {
    return (
      <RoughArrow
        placement={placement}
        variant={arrowVariant}
        label={arrowLabel}
        color={color || DEFAULT_COLORS.arrow}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughArrow>
    );
  }

  return (
    <RoughUnderline
      variant="single"
      color={color || DEFAULT_COLORS.underline}
      strokeWidth={strokeWidth}
      animate={animate}
      animationDuration={animationDuration}
      className={className}
      textClassName={textClassName}
    >
      {children}
    </RoughUnderline>
  );
}

// ── Subcomponent Semantic Shortcuts ─────────────────────────────
Roughly.Underline = function RoughlyUnderline(
  props: React.ComponentProps<typeof RoughUnderline>
) {
  return <RoughUnderline {...props} />;
};

Roughly.Circle = function RoughlyCircle(
  props: React.ComponentProps<typeof RoughCircle>
) {
  return <RoughCircle {...props} />;
};

Roughly.Strike = function RoughlyStrike(
  props: React.ComponentProps<typeof RoughStrike>
) {
  return <RoughStrike {...props} />;
};

Roughly.Cross = function RoughlyCross(
  props: React.ComponentProps<typeof RoughCross>
) {
  return <RoughCross {...props} />;
};

Roughly.Bracket = function RoughlyBracket(
  props: React.ComponentProps<typeof RoughBracket>
) {
  return <RoughBracket {...props} />;
};

Roughly.Box = function RoughlyBox(
  props: React.ComponentProps<typeof RoughBox>
) {
  return <RoughBox {...props} />;
};

Roughly.Highlight = function RoughlyHighlight(
  props: React.ComponentProps<typeof RoughHighlight>
) {
  return <RoughHighlight {...props} />;
};

Roughly.Arrow = function RoughlyArrow(
  props: React.ComponentProps<typeof RoughArrow>
) {
  return <RoughArrow {...props} />;
};


