import { ReactNode } from "react";

export interface Card {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  background?: string;
  href?: string;
  content?: ReactNode;
  badge?: string;
  icon?: ReactNode;
}

export interface CardsTwoProps {
  cards: Card[];
  radius?: number; // default: 500
  gap?: number; // default: 20 (px spacing between cards)
  cardWidth?: number; // default: 300
  cardHeight?: number; // default: 400
  
  // Rotation system
  rotationAxis?: "x" | "y" | "z"; // default: "y"
  rotationDirection?: "clockwise" | "counter-clockwise"; // default: "counter-clockwise"
  rotationSpeed?: number; // auto-rotate speed in degrees per second. default: 5
  initialRotation?: number; // default: 0
  rotationOffset?: number; // default: 0
  
  // Interactions
  autoRotate?: boolean; // default: false
  pauseOnHover?: boolean; // default: true
  draggable?: boolean; // default: true
  scrollRotate?: boolean; // default: false
  snap?: boolean; // default: true
  
  // 3D parameters
  perspective?: number; // default: 1200
  depth?: number; // default: 0
  height?: number; // height override (useful for vertical rotation)
  visibleArc?: number; // visible arc in degrees (e.g. 180, 270, 360). default: 360
  cameraDistance?: number; // camera offset along Z axis. default: 0
  cameraFov?: number; // default: 60
  
  // Focusing & styling
  activeScale?: number; // default: 1.1
  activeOpacity?: number; // default: 1.0
  activeBrightness?: number; // default: 1.0
  
  sideScale?: number; // default: 0.8
  sideOpacity?: number; // default: 0.6
  sideBrightness?: number; // default: 0.7
  
  backScale?: number; // default: 0.6
  backOpacity?: number; // default: 0.2
  backBrightness?: number; // default: 0.4
  hideBackCards?: boolean; // default: false
  shadowIntensity?: number; // default: 0.5
  depthBlur?: boolean; // default: false
  blurStrength?: number; // default: 8
  reflection?: boolean; // default: false
  
  // Ring perspective tilts
  ringTiltX?: number; // default: 15 (isometric tilted ring)
  ringTiltY?: number; // default: 0
  
  // Individual Card tilts
  faceCamera?: boolean; // default: false
  tiltX?: number; // default: 0
  tiltY?: number; // default: 0
  tiltZ?: number; // default: 0
  
  // Callbacks
  getCardTransform?: (
    index: number,
    progress: number
  ) => {
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
    opacity?: number;
    blur?: number;
    brightness?: number;
    translateX?: number;
    translateY?: number;
    translateZ?: number;
  };
  renderCard?: (card: Card, isActive: boolean) => ReactNode;
  background?: "solid" | "gradient" | "transparent" | "noise" | "grid"; // default: "transparent"
  className?: string;
}

export interface CardsTwoRef {
  next: () => void;
  previous: () => void;
  rotateTo: (index: number) => void;
  rotateBy: (angleDegrees: number) => void;
  reset: () => void;
  pause: () => void;
  play: () => void;
  getActiveIndex: () => number;
}
