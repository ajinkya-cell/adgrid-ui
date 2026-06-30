import type { SpringOptions } from "framer-motion";
import type { CylinderTransform } from "./utils/math";

export type { CylinderTransform };

export interface WheelPickerProps {
  items: WheelItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: "glass" | "minimal";
  loop?: boolean;
  sound?: boolean;
  disabled?: boolean;
  itemHeight?: number;
  visibleItems?: number;
  perspective?: number;
  duration?: number;
  spring?: SpringOptions;
  className?: string;
  itemHeightVariable?: number[];
  showSelectionIndicator?: boolean;
  selectionIndicatorClassName?: string;
  itemClassName?: string;
  renderItem?: (item: WheelItem, isActive: boolean, index: number) => React.ReactNode;
  onScrollEnd?: (value: string) => void;
  scrollToValue?: string;
  ref?: React.Ref<WheelPickerImperativeHandle>;
}

export interface WheelItem {
  value: string;
  label?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface WheelPickerImperativeHandle {
  next: () => void;
  previous: () => void;
  scrollTo: (value: string, options?: ScrollToOptions) => void;
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
  getCurrentIndex: () => number;
  getCurrentValue: () => string;
}

export interface ScrollToOptions {
  duration?: number;
  spring?: SpringOptions;
}

export interface UseWheelReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  items: WheelItem[];
  currentIndex: number;
  targetIndex: number;
  smoothIndex: number;
  isDragging: boolean;
  isAnimating: boolean;
  dragStartOffset: number;
  setIsDragging: (value: boolean) => void;
  setDragStartOffset: (value: number) => void;
  navigateTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  scrollToValue: (value: string, options?: ScrollToOptions) => void;
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
  getCurrentIndex: () => number;
  getCurrentValue: () => string;
  setCurrentIndex: (index: number) => void;
}

export interface UseMomentumReturn {
  velocity: number;
  startMomentum: (initialVelocity: number) => void;
  stopMomentum: () => void;
  isDecelerating: boolean;
}

export interface UseSnapReturn {
  snapToNearest: (currentIndex: number, velocity?: number) => number;
  isSnapping: boolean;
}

export interface UseAudioReturn {
  playClick: (volume?: number) => void;
  playHover: (volume?: number) => void;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
}

export interface UseInfiniteLoopReturn {
  adjustIndex: (index: number) => number;
  getLoopIndices: (currentIndex: number, visibleCount: number) => number[];
  totalItems: number;
}

export interface UseCylinderTransformReturn {
  getTransform: (index: number, centerIndex: number, smoothIndex: number) => CylinderTransform;
}

export interface WheelPickerContextValue {
  variant: "glass" | "minimal";
  itemHeight: number;
  visibleItems: number;
  perspective: number;
  loop: boolean;
  sound: boolean;
  disabled: boolean;
  currentIndex: number;
  smoothIndex: number;
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}