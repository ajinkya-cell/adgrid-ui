export type TextShuffleVariant =
  | "scramble"
  | "wave"
  | "glitch"
  | "elastic"
  | "flipIn"
  | "blurReveal";

export type TextAlign = "left" | "center" | "right";

export interface TextShuffleProps {
  /** Array of words to cycle through */
  words: string[];
  /** Duration a word is displayed before transitioning (ms). Default: 2200 */
  duration?: number;
  /** Transition duration between words (ms). Default: 700 */
  transition?: number;
  /** Whether to loop infinitely. Default: true */
  loop?: boolean;
  /** Visual morph variant. Default: "scramble" */
  variant?: TextShuffleVariant;
  /** Font size CSS value (e.g. "2rem", "32px") */
  fontSize?: string;
  /** Font weight (100-900) */
  fontWeight?: number;
  /** Text alignment. Default: "center" */
  align?: TextAlign;
  /** Additional CSS class names */
  className?: string;
  /** Callback when the active word changes */
  onWordChange?: (index: number) => void;
  /** Pause cycling on hover. Default: false */
  pauseOnHover?: boolean;
  /** Show a blinking cursor after the text. Default: false */
  cursorBlink?: boolean;
  /** CSS gradient value for text */
  gradient?: string;
  /** Render text with an outline stroke effect. Default: false */
  outline?: boolean;
  /** Letter spacing CSS value (e.g. "0.05em") */
  letterSpacing?: string;
  /** Line height CSS value (e.g. "1.2") */
  lineHeight?: string;
  /** Transform text to uppercase. Default: false */
  uppercase?: boolean;
  /** Transform text to lowercase. Default: false */
  lowercase?: boolean;
  /** Inline styles applied to the wrapper */
  style?: React.CSSProperties;
}

export interface TextShuffleRef {
  /** Advance to the next word */
  next: () => void;
  /** Go back to the previous word */
  previous: () => void;
  /** Pause automatic cycling */
  pause: () => void;
  /** Resume automatic cycling */
  play: () => void;
  /** Jump to a specific word by index */
  goTo: (index: number) => void;
}

export interface ShuffleVariantConfig {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit: Record<string, unknown>;
  transition: Record<string, unknown>;
}
