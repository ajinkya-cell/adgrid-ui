import { useRef, useState } from "react";
import { useMotionValue, useSpring, useAnimationFrame, PanInfo } from "framer-motion";

interface UseRotationParams {
  angularSpacing: number;
  radius: number;
  rotationAxis: "x" | "y" | "z";
  rotationDirection: "clockwise" | "counter-clockwise";
  rotationSpeed: number; // degrees per second
  initialRotation: number; // degrees
  autoRotate: boolean;
  pauseOnHover: boolean;
  snap: boolean;
}

export function useRotation({
  angularSpacing,
  radius,
  rotationAxis,
  rotationDirection,
  rotationSpeed,
  initialRotation,
  autoRotate,
  pauseOnHover,
  snap,
}: UseRotationParams) {
  const initialAngleRad = (initialRotation * Math.PI) / 180;
  const targetAngle = useMotionValue(initialAngleRad);
  
  // Spring configuration for physically heavy and smooth feeling
  const currentAngle = useSpring(targetAngle, {
    stiffness: 90,
    damping: 20,
    mass: 1.2,
    restDelta: 0.0001,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoRotate);
  const isHoveredRef = useRef(false);

  const speedDirection = rotationDirection === "clockwise" ? 1 : -1;
  const speedRadPerSec = (rotationSpeed * Math.PI) / 180;

  // Auto-rotation loop
  useAnimationFrame((_, delta) => {
    if (!isPlaying) return;
    if (pauseOnHover && isHoveredRef.current) return;
    if (isDragging) return;

    const deltaSec = delta / 1000;
    const currentVal = targetAngle.get();
    targetAngle.set(currentVal + speedRadPerSec * speedDirection * deltaSec);
  });

  // Snap calculation helper
  const getSnappedAngle = (angle: number) => {
    if (angularSpacing === 0) return 0;
    const rawIndex = -angle / angularSpacing;
    const snappedIndex = Math.round(rawIndex);
    return -snappedIndex * angularSpacing;
  };

  // Drag handlers
  const dragStartRef = useRef(0);
  const handleDragStart = () => {
    setIsDragging(true);
    dragStartRef.current = targetAngle.get();
  };

  const handleDrag = (info: PanInfo) => {
    let deltaPx = 0;
    if (rotationAxis === "y") {
      deltaPx = info.offset.x;
    } else if (rotationAxis === "x") {
      deltaPx = -info.offset.y;
    } else {
      deltaPx = info.offset.x; // default fallback for Z-axis
    }
    
    // Map screen displacement to angular displacement
    const deltaAngle = deltaPx / radius;
    targetAngle.set(dragStartRef.current + deltaAngle);
  };

  const handleDragEnd = (info: PanInfo) => {
    setIsDragging(false);

    let velocityPx = 0;
    if (rotationAxis === "y") {
      velocityPx = info.velocity.x;
    } else if (rotationAxis === "x") {
      velocityPx = -info.velocity.y;
    } else {
      velocityPx = info.velocity.x;
    }
    
    const angularVelocity = velocityPx / radius;

    // Projected angle after inertia/momentum decays
    const decayFactor = 0.18; // Seconds of momentum slide
    const projectedAngle = targetAngle.get() + angularVelocity * decayFactor;

    if (snap) {
      const snappedAngle = getSnappedAngle(projectedAngle);
      targetAngle.set(snappedAngle);
    } else {
      targetAngle.set(projectedAngle);
    }
  };

  return {
    targetAngle,
    currentAngle,
    isDragging,
    isPlaying,
    setIsPlaying,
    isHoveredRef,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    getSnappedAngle,
  };
}
