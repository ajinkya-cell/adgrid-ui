import { useTransform, MotionValue } from "framer-motion";

interface UseCardTransformsParams {
  index: number;
  cardAngle: number;
  currentAngle: MotionValue<number>;
  radius: number;
  depth: number;
  rotationAxis: "x" | "y" | "z";
  faceCamera: boolean;
  activeScale: number;
  activeOpacity: number;
  activeBrightness: number;
  sideScale: number;
  sideOpacity: number;
  sideBrightness: number;
  backScale: number;
  backOpacity: number;
  backBrightness: number;
  hideBackCards: boolean;
  depthBlur: boolean;
  blurStrength: number;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  ringTiltX: number;
  ringTiltY: number;
  angularSpacing: number;
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
}

export function useCardTransforms({
  index,
  cardAngle,
  currentAngle,
  radius,
  depth,
  rotationAxis,
  faceCamera,
  activeScale,
  activeOpacity,
  activeBrightness,
  sideScale,
  sideOpacity,
  sideBrightness,
  backScale,
  backOpacity,
  backBrightness,
  hideBackCards,
  depthBlur,
  blurStrength,
  tiltX,
  tiltY,
  tiltZ,
  ringTiltX,
  ringTiltY,
  angularSpacing,
  getCardTransform,
}: UseCardTransformsParams) {
  return useTransform(currentAngle, (ang) => {
    // Relative angle of the card from the front (radians)
    const alpha = cardAngle + ang;

    // Normalize angle to [-PI, PI] to handle continuous wrapping
    let relativeAngle = alpha % (2 * Math.PI);
    if (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    if (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    // Progress is the number of card steps offset from the center front
    const progress = angularSpacing > 0 ? relativeAngle / angularSpacing : 0;
    const cosVal = Math.cos(relativeAngle); // 1 at front, 0 at sides, -1 at back

    // 1. Coordinates Calculation
    let x0 = 0;
    let y0 = 0;
    let z0 = radius * cosVal;

    if (rotationAxis === "y") {
      x0 = radius * Math.sin(relativeAngle);
    } else if (rotationAxis === "x") {
      y0 = radius * Math.sin(relativeAngle);
    } else if (rotationAxis === "z") {
      x0 = radius * Math.sin(relativeAngle);
      y0 = radius * Math.cos(relativeAngle);
      z0 = 0;
    }

    // Apply X-axis ring tilt (pitch)
    const cosX = Math.cos((ringTiltX * Math.PI) / 180);
    const sinX = Math.sin((ringTiltX * Math.PI) / 180);
    const x1 = x0;
    const y1 = y0 * cosX - z0 * sinX;
    const z1 = y0 * sinX + z0 * cosX;

    // Apply Y-axis ring tilt (yaw)
    const cosY = Math.cos((ringTiltY * Math.PI) / 180);
    const sinY = Math.sin((ringTiltY * Math.PI) / 180);
    const x2 = x1 * cosY + z1 * sinY;
    const y2 = y1;
    const z2 = -x1 * sinY + z1 * cosY;

    // Output translation coordinates relative to center front (Z = 0 is front)
    let x = x2;
    let y = y2;
    let z = z2 - radius - depth;

    // 2. Base rotations
    let rotX = tiltX;
    let rotY = tiltY;
    let rotZ = tiltZ;

    if (!faceCamera) {
      const angleDegrees = -(relativeAngle * 180) / Math.PI;
      if (rotationAxis === "y") {
        rotY += angleDegrees;
        rotX += ringTiltX; // Align pitch tilt with the ring
      } else if (rotationAxis === "x") {
        rotX += angleDegrees;
        rotY += ringTiltY;
      } else if (rotationAxis === "z") {
        rotZ += angleDegrees;
      }
    }

    // 3. Piecewise scale, opacity, and brightness calculations
    // frontFactor goes from 1 (front) to 0 (back)
    const frontFactor = (1 + cosVal) / 2;

    let scale = sideScale;
    let opacity = sideOpacity;
    let brightness = sideBrightness;

    if (cosVal >= 0) {
      // Front half: interpolate between side (at 0) and active (at 1)
      scale = sideScale + (activeScale - sideScale) * cosVal;
      opacity = sideOpacity + (activeOpacity - sideOpacity) * cosVal;
      brightness = sideBrightness + (activeBrightness - sideBrightness) * cosVal;
    } else {
      // Back half: interpolate between back (at -1) and side (at 0)
      // (1 + cosVal) goes from 0 (at -1) to 1 (at 0)
      const t = 1 + cosVal;
      scale = backScale + (sideScale - backScale) * t;
      opacity = backOpacity + (sideOpacity - backOpacity) * t;
      brightness = backBrightness + (sideBrightness - backBrightness) * t;
    }

    let blurVal = 0;

    // Back card visibility check
    if (cosVal < 0) {
      if (hideBackCards) {
        opacity = 0;
      }
    }

    // Depth Blur
    if (depthBlur) {
      blurVal = (1 - frontFactor) * blurStrength;
    }

    // 4. Custom developer transforms hook (override engine)
    if (getCardTransform) {
      const custom = getCardTransform(index, progress);
      if (custom.rotateX !== undefined) rotX = custom.rotateX;
      if (custom.rotateY !== undefined) rotY = custom.rotateY;
      if (custom.rotateZ !== undefined) rotZ = custom.rotateZ;
      if (custom.scale !== undefined) scale = custom.scale;
      if (custom.opacity !== undefined) opacity = custom.opacity;
      if (custom.blur !== undefined) blurVal = custom.blur;
      if (custom.brightness !== undefined) brightness = custom.brightness;
      if (custom.translateX !== undefined) x = custom.translateX;
      if (custom.translateY !== undefined) y = custom.translateY;
      if (custom.translateZ !== undefined) z = custom.translateZ;
    }

    // Dynamic Z-Index Mapping
    const zIndex = Math.round(z + 10000);

    // Build transform string
    const transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;

    const filter = [
      blurVal > 0.1 ? `blur(${blurVal.toFixed(1)}px)` : "",
      brightness !== 1 ? `brightness(${brightness.toFixed(2)})` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      transform,
      zIndex,
      opacity,
      filter: filter || "none",
    };
  });
}
