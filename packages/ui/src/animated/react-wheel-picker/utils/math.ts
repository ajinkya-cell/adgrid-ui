export interface CylinderTransform {
  translateY: number;
  rotateX: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
}

export interface CylinderConfig {
  itemHeight: number;
  cylinderRadius: number;
  visibleItems: number;
  maxRotateX: number;
  maxScale: number;
  minScale: number;
  maxOpacity: number;
  minOpacity: number;
  maxBlur: number;
}

export const DEFAULT_CYLINDER_CONFIG: Omit<CylinderConfig, "itemHeight" | "cylinderRadius" | "visibleItems"> = {
  maxRotateX: 35,
  maxScale: 1,
  minScale: 0.85,
  maxOpacity: 1,
  minOpacity: 0.25,
  maxBlur: 2,
};

export function calculateCylinderRadius(itemHeight: number, stepDegrees: number = 18): number {
  const stepRadians = (stepDegrees * Math.PI) / 180;
  return itemHeight / (2 * Math.sin(stepRadians / 2));
}

export function getCircularDistance(
  index: number,
  currentPosition: number,
  totalItems: number,
  loop: boolean
): number {
  let diff = index - currentPosition;
  if (loop) {
    const half = totalItems / 2;
    diff = ((diff + half) % totalItems + totalItems) % totalItems - half;
  }
  return diff;
}

export function calculateCylinderTransform(
  distance: number,
  config: CylinderConfig
): CylinderTransform {
  const absDistance = Math.abs(distance);
  const maxVisibleDistance = (config.visibleItems - 1) / 2;
  const normalizedDistance = Math.min(absDistance / maxVisibleDistance, 1);

  const direction = distance >= 0 ? 1 : -1;

  const rotateX = direction * config.maxRotateX * normalizedDistance;
  const scale = lerp(config.maxScale, config.minScale, normalizedDistance);
  const opacity = lerp(config.maxOpacity, config.minOpacity, normalizedDistance);
  const blur = config.maxBlur * normalizedDistance;
  const translateY = distance * config.itemHeight;

  const zIndex = Math.floor(config.visibleItems * 2 - absDistance);

  return {
    translateY,
    rotateX,
    scale,
    opacity,
    blur,
    zIndex,
  };
}

export function getItemTransform(
  index: number,
  scrollPosition: number,
  config: CylinderConfig,
  loop: boolean
): CylinderTransform {
  const distance = getCircularDistance(index, scrollPosition, 100, loop);
  return calculateCylinderTransform(distance, config);
}

export function getItemStyle(
  transform: CylinderTransform,
  itemHeight: number
): React.CSSProperties {
  return {
    transform: `translateY(${transform.translateY}px) rotateX(${transform.rotateX}deg) scale(${transform.scale})`,
    opacity: transform.opacity,
    filter: `blur(${transform.blur}px)`,
    zIndex: transform.zIndex,
    transformStyle: "preserve-3d" as const,
    willChange: "transform, opacity, filter",
    backfaceVisibility: "hidden" as const,
    height: `${itemHeight}px`,
    lineHeight: `${itemHeight}px`,
  };
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getSelectionIndicatorPosition(
  visibleItems: number,
  itemHeight: number
): number {
  return (visibleItems - 1) * itemHeight / 2;
}

export function getViewportHeight(visibleItems: number, itemHeight: number): number {
  return visibleItems * itemHeight;
}