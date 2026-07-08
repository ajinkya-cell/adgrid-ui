"use client";

import { useMemo } from "react";
import type { WheelItem as WheelItemType } from "../types";
import type { MotionValue } from "framer-motion";
import { WheelItem } from "./WheelItem";

interface CylinderProps {
  items: WheelItemType[];
  y: MotionValue<number>;
  itemHeight: number;
  loop: boolean;
  cylinderRadius: number;
  activeIndex: number;
  hoveredIndex: number | null;
  disabled?: boolean;
  variant?: "glass" | "minimal" | "void";
  onItemClick?: (index: number) => void;
  renderItem?: (item: WheelItemType, isActive: boolean, index: number) => React.ReactNode;
}

export function Cylinder({
  items,
  y,
  itemHeight,
  loop,
  cylinderRadius,
  activeIndex,
  hoveredIndex,
  disabled = false,
  variant = "glass",
  onItemClick,
  renderItem,
}: CylinderProps) {
  const totalItems = items.length;

  const wheelItems = useMemo(() => {
    return items.map((item, index) => ({
      item,
      index,
      isActive: index === activeIndex,
      isHovered: index === hoveredIndex && index !== activeIndex,
    }));
  }, [items, activeIndex, hoveredIndex]);

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{
        height: `${itemHeight}px`,
        transformStyle: "preserve-3d",
      }}
      role="list"
      aria-label="Wheel picker options"
    >
      {wheelItems.map(({ item, index, isActive, isHovered }) => (
        <WheelItem
          key={`${item.value}-${index}`}
          item={item}
          index={index}
          totalItems={totalItems}
          y={y}
          itemHeight={itemHeight}
          loop={loop}
          cylinderRadius={cylinderRadius}
          isActive={isActive}
          isHovered={isHovered}
          disabled={disabled || item.disabled}
          variant={variant}
          onClick={() => !disabled && !item.disabled && onItemClick?.(index)}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}