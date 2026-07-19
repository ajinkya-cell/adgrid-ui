"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import { motion, useMotionValue, useSpring, animate, useTransform } from "framer-motion";

import { cn } from "../../../lib/utils";
import { calculateCylinderRadius } from "../utils/math";
import { playClickSound, getAudioContext } from "../utils/audio";
import { DEFAULT_SPRING_CONFIG } from "../utils/physics";

import type {
  WheelPickerProps,
  WheelPickerImperativeHandle,
  ScrollToOptions,
} from "../types";
import { SelectionOverlay } from "./SelectionOverlay";
import { Cylinder } from "./Cylinder";

export const WheelPicker = forwardRef<WheelPickerImperativeHandle, WheelPickerProps>(
  (
    {
      items = [],
      value,
      defaultValue,
      onChange,
      variant = "glass",
      loop = false,
      sound = true,
      disabled = false,
      itemHeight = 32,
      visibleItems = 3,
      perspective = 1000,
      spring,
      className,
      showSelectionIndicator = true,
      selectionIndicatorClassName,
      renderItem,
      onScrollEnd,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const totalItems = items.length;

    // 3D tilt coordinates (only active for void variant)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const tiltX = useSpring(useTransform(mouseY, (yVal) => {
      if (variant !== "void" || !containerRef.current) return 0;
      const height = containerRef.current.offsetHeight || 200;
      return -((yVal / height) - 0.5) * 15; // Max 7.5 degrees tilt
    }), { stiffness: 120, damping: 20 });

    const tiltY = useSpring(useTransform(mouseX, (xVal) => {
      if (variant !== "void" || !containerRef.current) return 0;
      const width = containerRef.current.offsetWidth || 256;
      return ((xVal / width) - 0.5) * 15; // Max 7.5 degrees tilt
    }), { stiffness: 120, damping: 20 });

    const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (variant !== "void" || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const isControlled = value !== undefined;
    const [localValue, setLocalValue] = useState(() => {
      const initial = isControlled ? value : (defaultValue || items[0]?.value || "");
      return initial;
    });

    const activeValue = isControlled ? value : localValue;

    const initialIndex = items.findIndex((item) => item.value === activeValue);
    const startIndex = initialIndex !== -1 ? initialIndex : 0;

    const y = useMotionValue(startIndex);
    const smoothY = useSpring(y, {
      stiffness: spring?.stiffness ?? DEFAULT_SPRING_CONFIG.stiffness,
      damping: spring?.damping ?? DEFAULT_SPRING_CONFIG.damping,
      mass: spring?.mass ?? DEFAULT_SPRING_CONFIG.mass,
    });

    const lastIndexRef = useRef(startIndex);
    const isDraggingRef = useRef(false);
    const startClientYRef = useRef(0);
    const startYOffsetRef = useRef(0);
    const lastDragTimeRef = useRef(0);
    const lastDragYRef = useRef(0);
    const dragVelocityRef = useRef(0);
    const hoveredIndexRef = useRef<number | null>(null);
    const isAnimatingRef = useRef(false);
    const lastSoundTimeRef = useRef(0);

    const cylinderRadius = useMemo(
      () => calculateCylinderRadius(itemHeight, 18),
      [itemHeight]
    );

    const wheelHeight = itemHeight * visibleItems;

    const scrollToIndex = useCallback(
      (index: number, options?: ScrollToOptions) => {
        if (disabled) return;

        let target = index;
        const springConfig = options?.spring || {
          stiffness: spring?.stiffness ?? DEFAULT_SPRING_CONFIG.stiffness,
          damping: spring?.damping ?? DEFAULT_SPRING_CONFIG.damping,
          mass: spring?.mass ?? DEFAULT_SPRING_CONFIG.mass,
        };

        if (loop && totalItems > 0) {
          const currentY = y.get();
          const baseTarget = ((index % totalItems) + totalItems) % totalItems;
          const closestCycle = Math.round(currentY / totalItems) * totalItems;
          const candidateTarget = closestCycle + baseTarget;
          const candidates = [candidateTarget - totalItems, candidateTarget, candidateTarget + totalItems];
          candidates.sort((a, b) => Math.abs(a - currentY) - Math.abs(b - currentY));
          target = candidates[0];
        } else {
          target = Math.max(0, Math.min(totalItems - 1, target));
        }

        isAnimatingRef.current = true;
        animate(y, target, {
          type: "spring",
          ...springConfig,
          onComplete: () => {
            isAnimatingRef.current = false;
            if (loop && totalItems > 0) {
              const wrapped = ((Math.round(target) % totalItems) + totalItems) % totalItems;
              y.set(wrapped);
            }
          },
        });
      },
      [y, disabled, loop, totalItems, spring]
    );

    const scrollToValue = useCallback(
      (valueToFind: string, options?: ScrollToOptions) => {
        const targetIdx = items.findIndex((item) => item.value === valueToFind);
        if (targetIdx !== -1) {
          scrollToIndex(targetIdx, options);
        }
      },
      [items, scrollToIndex]
    );

    useEffect(() => {
      if (isControlled && value !== undefined) {
        const targetIdx = items.findIndex((item) => item.value === value);
        if (targetIdx !== -1 && targetIdx !== lastIndexRef.current) {
          lastIndexRef.current = targetIdx;
          scrollToIndex(targetIdx);
        }
      }
    }, [value, items, isControlled, scrollToIndex]);

    useEffect(() => {
      const unsubscribe = smoothY.on("change", (latest) => {
        const rounded = Math.round(latest);
        let activeIdx = rounded;

        if (loop) {
          activeIdx = ((rounded % totalItems) + totalItems) % totalItems;
        } else {
          activeIdx = Math.max(0, Math.min(totalItems - 1, rounded));
        }

        if (activeIdx !== lastIndexRef.current) {
          const now = Date.now();
          const shouldPlaySound = sound && !disabled && !isDraggingRef.current && now - lastSoundTimeRef.current > 45;

          if (shouldPlaySound) {
            lastSoundTimeRef.current = now;
            try {
              const ctx = getAudioContext();
              if (ctx) {
                playClickSound();
              }
            } catch (e) {}
          }

          lastIndexRef.current = activeIdx;

          if (!isControlled) {
            setLocalValue(items[activeIdx]?.value || "");
          }

          if (onChange) {
            onChange(items[activeIdx]?.value || "");
          }

          if (onScrollEnd && !isAnimatingRef.current && !isDraggingRef.current) {
            onScrollEnd(items[activeIdx]?.value || "");
          }
        }
      });

      return unsubscribe;
    }, [smoothY, totalItems, loop, sound, disabled, items, onChange, isControlled, onScrollEnd]);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        isDraggingRef.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        startClientYRef.current = e.clientY;
        startYOffsetRef.current = y.get();
        lastDragTimeRef.current = Date.now();
        lastDragYRef.current = e.clientY;
        dragVelocityRef.current = 0;
      },
      [disabled, y]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;
        const deltaY = e.clientY - startClientYRef.current;
        const now = Date.now();
        const dt = now - lastDragTimeRef.current;

        if (dt > 0) {
          const dy = e.clientY - lastDragYRef.current;
          dragVelocityRef.current = dy / dt;
        }

        lastDragTimeRef.current = now;
        lastDragYRef.current = e.clientY;

        let nextOffset = startYOffsetRef.current - deltaY / itemHeight;

        if (!loop) {
          if (nextOffset < 0) {
            nextOffset = nextOffset * 0.35;
          } else if (nextOffset > totalItems - 1) {
            nextOffset = totalItems - 1 + (nextOffset - (totalItems - 1)) * 0.35;
          }
        }

        y.set(nextOffset);
      },
      [y, itemHeight, loop, totalItems]
    );

    const handlePointerUp = useCallback(() => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const currentVal = y.get();
      const momentumTarget = currentVal - dragVelocityRef.current * 8.5;
      let snapTarget = Math.round(momentumTarget);

      if (!loop) {
        snapTarget = Math.max(0, Math.min(totalItems - 1, snapTarget));
      }

      animate(y, snapTarget, {
        type: "spring",
        stiffness: spring?.stiffness ?? DEFAULT_SPRING_CONFIG.stiffness,
        damping: spring?.damping ?? DEFAULT_SPRING_CONFIG.damping,
        mass: spring?.mass ?? DEFAULT_SPRING_CONFIG.mass,
        onComplete: () => {
          if (loop && totalItems > 0) {
            const wrapped = ((snapTarget % totalItems) + totalItems) % totalItems;
            y.set(wrapped);
          }
        }
      });
    }, [y, loop, totalItems, spring]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        let nextIdx = lastIndexRef.current;

        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            nextIdx -= 1;
            break;
          case "ArrowDown":
            e.preventDefault();
            nextIdx += 1;
            break;
          case "PageUp":
            e.preventDefault();
            nextIdx -= visibleItems;
            break;
          case "PageDown":
            e.preventDefault();
            nextIdx += visibleItems;
            break;
          case "Home":
            e.preventDefault();
            nextIdx = 0;
            break;
          case "End":
            e.preventDefault();
            nextIdx = totalItems - 1;
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (onChange) {
              onChange(items[lastIndexRef.current]?.value || "");
            }
            return;
          case "Escape":
            e.preventDefault();
            containerRef.current?.blur();
            return;
          default:
            return;
        }

        scrollToIndex(nextIdx);
      },
      [disabled, visibleItems, totalItems, scrollToIndex, items, onChange]
    );

    const lastWheelTimeRef = useRef(0);
    const handleWheel = useCallback(
      (e: React.WheelEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTimeRef.current < 120) return;
        lastWheelTimeRef.current = now;

        const direction = Math.sign(e.deltaY);
        scrollToIndex(lastIndexRef.current + direction);
      },
      [disabled, scrollToIndex]
    );

    const next = useCallback(() => {
      if (disabled) return;
      scrollToIndex(lastIndexRef.current + 1);
    }, [disabled, scrollToIndex]);

    const previous = useCallback(() => {
      if (disabled) return;
      scrollToIndex(lastIndexRef.current - 1);
    }, [disabled, scrollToIndex]);

    useImperativeHandle(ref, () => ({
      next,
      previous,
      scrollTo: scrollToValue,
      scrollToIndex,
      getCurrentIndex: () => lastIndexRef.current,
      getCurrentValue: () => items[lastIndexRef.current]?.value || "",
    }));

    return (
      <motion.div
        ref={containerRef}
        onMouseMove={handleContainerMouseMove}
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden outline-none select-none",
          variant === "glass" &&
            "bg-neutral-950/70 border border-neutral-900/60 rounded-3xl backdrop-blur-xl shadow-2xl",
          variant === "minimal" && "bg-transparent",
          variant === "void" &&
            "rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 backdrop-blur-2xl",
          disabled && "opacity-40 cursor-not-allowed pointer-events-none",
          className
        )}
        style={{
          height: `${wheelHeight}px`,
          backgroundColor: variant === "void" ? "#171717" : undefined,
          boxShadow: variant === "void" ? "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)" : undefined,
          rotateX: variant === "void" ? tiltX : undefined,
          rotateY: variant === "void" ? tiltY : undefined,
          transformStyle: variant === "void" ? "preserve-3d" : undefined,
          perspective: variant === "void" ? 1000 : undefined,
        }}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="listbox"
        aria-label="Wheel Picker Selection"
        aria-activedescendant={`wheel-item-${lastIndexRef.current}`}
      >
        <div
          className="relative w-full h-full flex items-center justify-center overflow-visible"
          style={{
            perspective: `${perspective}px`,
            transformStyle: "preserve-3d",
          }}
        >
          <SelectionOverlay
            variant={variant}
            itemHeight={itemHeight}
            visibleItems={visibleItems}
            className={selectionIndicatorClassName}
            showIndicator={showSelectionIndicator}
          />

          <div className={cn(
            "absolute inset-x-0 top-0 h-10 pointer-events-none z-10",
            variant === "void" ? "bg-gradient-to-b from-[#171717]/95 to-transparent" : "bg-gradient-to-b from-neutral-950/90 to-transparent"
          )} />
          <div className={cn(
            "absolute inset-x-0 bottom-0 h-10 pointer-events-none z-10",
            variant === "void" ? "bg-gradient-to-t from-[#171717]/95 to-transparent" : "bg-gradient-to-t from-neutral-950/90 to-transparent"
          )} />

          <Cylinder
            items={items}
            y={y}
            itemHeight={itemHeight}
            loop={loop}
            cylinderRadius={cylinderRadius}
            activeIndex={lastIndexRef.current}
            hoveredIndex={hoveredIndexRef.current}
            disabled={disabled}
            variant={variant}
            onItemClick={(index) => {
              if (!disabled) {
                scrollToIndex(index);
              }
            }}
            renderItem={renderItem}
          />
        </div>
      </motion.div>
    );
  }
);

WheelPicker.displayName = "WheelPicker";