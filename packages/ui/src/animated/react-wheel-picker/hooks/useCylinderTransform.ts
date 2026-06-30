"use client";

import { useMemo, useCallback } from "react";
import type { MotionValue } from "framer-motion";

import type { UseCylinderTransformReturn, CylinderTransform } from "../types";
import { getCircularDistance, calculateCylinderTransform, DEFAULT_CYLINDER_CONFIG } from "../utils/math";

interface CylinderConfig {
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

export function useCylinderTransform(
  itemHeight: number,
  visibleItems: number,
  loop: boolean,
  customConfig?: Partial<CylinderConfig>
): UseCylinderTransformReturn {
  const cylinderRadius = itemHeight / 0.342;

  const config: CylinderConfig = useMemo(
    () => ({
      itemHeight,
      cylinderRadius,
      visibleItems,
      ...DEFAULT_CYLINDER_CONFIG,
      ...customConfig,
    }),
    [itemHeight, cylinderRadius, visibleItems, customConfig]
  );

  const getTransform = useCallback(
    (index: number, _centerIndex: number, smoothIndex: number): CylinderTransform => {
      const distance = getCircularDistance(index, smoothIndex, 1000, loop);
      return calculateCylinderTransform(distance, config);
    },
    [config, loop]
  );

  return { getTransform };
}

export function useItemTransform(
  index: number,
  smoothIndex: MotionValue<number>,
  config: CylinderConfig,
  loop: boolean
): {
  translateY: ReturnType<typeof import("framer-motion").useTransform>;
  rotateX: ReturnType<typeof import("framer-motion").useTransform>;
  scale: ReturnType<typeof import("framer-motion").useTransform>;
  opacity: ReturnType<typeof import("framer-motion").useTransform>;
  blur: ReturnType<typeof import("framer-motion").useTransform>;
  zIndex: ReturnType<typeof import("framer-motion").useTransform>;
} {
  const { useTransform } = require("framer-motion");

  const d = useTransform(smoothIndex, (latestY: number) => {
    let diff = index - latestY;
    if (loop) {
      const half = 1000 / 2;
      diff = ((diff + half) % 1000 + 1000) % 1000 - half;
    }
    return diff;
  });

  const translateY = useTransform(d, (diff: number) => diff * config.itemHeight);
  const rotateX = useTransform(d, (diff: number) => {
    const normalized = Math.min(Math.abs(diff) / (config.visibleItems / 2), 1);
    return -diff * config.maxRotateX * normalized;
  });
  const scale = useTransform(d, (diff: number) => {
    const normalized = Math.min(Math.abs(diff) / (config.visibleItems / 2), 1);
    return 1 - normalized * (1 - config.minScale);
  });
  const opacity = useTransform(d, (diff: number) => {
    const normalized = Math.min(Math.abs(diff) / (config.visibleItems / 2), 1);
    return config.maxOpacity - normalized * (config.maxOpacity - config.minOpacity);
  });
  const blur = useTransform(d, (diff: number) => {
    const normalized = Math.min(Math.abs(diff) / (config.visibleItems / 2), 1);
    return config.maxBlur * normalized;
  });
  const zIndex = useTransform(d, (diff: number) => {
    return Math.floor(config.visibleItems * 2 - Math.abs(diff));
  });

  return { translateY, rotateX, scale, opacity, blur, zIndex };
}