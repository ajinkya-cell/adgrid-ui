export interface AnimationContext {
  elements: HTMLDivElement[];
  rows: number;
  columns: number;
  time: number;
  deltaTime: number;
  color: string;
  inactiveColor: string;
  speed: number;
  text?: string;
  audioAnalyser: AnalyserNode | null;
  options: Record<string, any>;
  brightnessCache: Float32Array;
}

export interface AnimationPlugin {
  name: string;
  init?: (context: AnimationContext) => void;
  update: (context: AnimationContext) => void;
  cleanup?: (context: AnimationContext) => void;
}

export interface DotMatrixProps {
  rows?: number;
  columns?: number;
  dotSize?: number;
  gap?: number;
  borderRadius?: string;
  color?: string;
  inactiveColor?: string;
  animation?: 
    | "wave" 
    | "text" 
    | "scroll-text" 
    | "clock" 
    | "equalizer" 
    | "audio" 
    | "noise" 
    | "sparkle" 
    | "ripple"
    | "snake"
    | "rain";
  text?: string;
  speed?: number;
  fps?: number;
  loop?: boolean;
  delay?: number;
  glow?: boolean;
  blur?: number;
  noiseScale?: number;
  seed?: number;
  pattern?: number[][];
  patternB?: number[][];
  morphProgress?: number;
}
