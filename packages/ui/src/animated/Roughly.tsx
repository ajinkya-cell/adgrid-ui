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
  type ArrowLabelFont,
} from "./roughly/RoughArrow";
import {
  RoughHandwriting,
  type HandwritingFont,
  type RoughHandwritingProps,
} from "./roughly/RoughHandwriting";

export type RoughlyType =
  | "underline"
  | "circle"
  | "strike-through"
  | "cross-off"
  | "bracket"
  | "box"
  | "highlight"
  | "arrow"
  | "handwriting";

export type { BracketSide, BracketStyle } from "./roughly/RoughBracket";
export type { BoxVariant } from "./roughly/RoughBox";
export type { ArrowPlacement, ArrowVariant, ArrowheadStyle, ArrowLabelFont };
export type { HandwritingFont, RoughHandwritingProps };

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
  /** Arrow curve variant ('curved' | 'straight' | 's-curve') */
  arrowVariant?: ArrowVariant;
  /** Arrowhead style ('open' | 'filled') */
  arrowhead?: ArrowheadStyle;
  /** Callout label for arrow */
  arrowLabel?: React.ReactNode;
  /** Callout label font family ('caveat' | 'reenie-beanie' | 'kalam') */
  arrowLabelFont?: ArrowLabelFont;
  /** Font size in pixels for arrow callout text */
  arrowLabelFontSize?: number;
  /** Font thickness (weight, e.g. 300 to 650) for arrow callout text */
  arrowLabelFontWeight?: number;
  /** Optional custom horizontal offset in pixels for arrow callout text */
  arrowLabelOffsetX?: number;
  /** Optional custom vertical offset in pixels for arrow callout text */
  arrowLabelOffsetY?: number;
  /** Arc curvature intensity factor for curved arrows (default: 0.38) */
  arrowCurvature?: number;
  /** Handwriting font family: 'reenie-beanie' | 'caveat' | 'kalam' (default: "reenie-beanie") */
  font?: HandwritingFont;
  /** Optional custom URL to .ttf font file for handwriting */
  fontUrl?: string;
  /** Enable interactive live-typing handwriting input mode (default: false) */
  editable?: boolean;
  /** Value for handwriting in controlled mode */
  value?: string;
  /** Default value for handwriting in uncontrolled mode */
  defaultValue?: string;
  /** Placeholder for handwriting in editable mode */
  placeholder?: string;
  /** Change callback for handwriting in editable mode */
  onChange?: (text: string) => void;
  /** Font size in px for handwriting glyph rendering (default: 40) */
  fontSize?: number;
  /** Maximum words allowed for handwriting (default: 6) */
  maxWords?: number;
  /** Maximum characters allowed for handwriting (default: 50) */
  maxLength?: number;
  /** Custom wrapper class */
  className?: string;
  /** Custom text class */
  textClassName?: string;
}

// Default colors matching dark-first Void UI palette
const DEFAULT_COLORS: Record<RoughlyType, string> = {
  underline: "#6366F1", // Indigo
  circle: "#EC4899", // Rose / Pink
  "strike-through": "#EF4444", // Crimson Red
  "cross-off": "#EF4444", // Crimson Red
  bracket: "#10B981", // Emerald Green
  box: "#10B981", // Emerald Green
  highlight: "#4338CA", // Deep Royal Indigo
  arrow: "#F59E0B", // Cyber Amber
  handwriting: "#6366F1", // Indigo
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
  arrowhead,
  arrowLabel,
  arrowLabelFont,
  arrowLabelFontSize,
  arrowLabelFontWeight,
  arrowLabelOffsetX,
  arrowLabelOffsetY,
  arrowCurvature,
  font,
  fontUrl,
  editable,
  value,
  defaultValue,
  placeholder,
  onChange,
  fontSize,
  maxWords,
  maxLength,
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
        arrowhead={arrowhead}
        label={arrowLabel}
        labelFont={arrowLabelFont}
        labelFontSize={arrowLabelFontSize}
        labelFontWeight={arrowLabelFontWeight}
        labelOffsetX={arrowLabelOffsetX}
        labelOffsetY={arrowLabelOffsetY}
        curvature={arrowCurvature}
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

  if (type === "handwriting") {
    return (
      <RoughHandwriting
        font={font}
        fontUrl={fontUrl}
        color={color || DEFAULT_COLORS.handwriting}
        strokeWidth={strokeWidth}
        animate={animate}
        animationDuration={animationDuration}
        fontSize={fontSize}
        maxWords={maxWords}
        maxLength={maxLength}
        editable={editable}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        className={className}
        textClassName={textClassName}
      >
        {children}
      </RoughHandwriting>
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

Roughly.Handwriting = function RoughlyHandwriting(
  props: React.ComponentProps<typeof RoughHandwriting>
) {
  return <RoughHandwriting {...props} />;
};
