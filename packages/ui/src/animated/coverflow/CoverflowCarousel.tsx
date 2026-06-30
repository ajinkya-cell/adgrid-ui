"use client";

import React, { useRef } from "react";
import { useCoverflow } from "./useCoverflow";
import { CoverflowCard } from "./CoverflowCard";
import { cn } from "../../lib/utils";

const items = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    title: "Desert dunes"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    title: "Urban geometry"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=600&auto=format&fit=crop",
    title: "Minimalist steps"
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
    title: "Mountain peaks"
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=600&auto=format&fit=crop",
    title: "Architectural curve"
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
    title: "Misty forest"
  }
];

export function CoverflowCarousel({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loop = true;
  
  const {
    smoothIndex,
    targetIndex,
    xVal,
    isDragging,
    dragStartOffset,
    isHovered,
    next,
    prev,
    navigateTo,
  } = useCoverflow({
    totalItems: items.length,
    initialIndex: 2,
    autoPlay: true,
    interval: 4000,
    loop: true,
  });

  // Track position state for drag math
  const startXRef = useRef(0);
  const lastWheelSnapRef = useRef(0);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  // Mouse Drag / Touch Gestures
  const handleDragStart = (clientX: number) => {
    isDragging.current = true;
    startXRef.current = clientX;
    dragStartOffset.current = xVal.get();
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    const deltaX = clientX - startXRef.current;
    
    // Card width is 260px. Dragging by 260px shifts the index by 1.0.
    const sensitivity = 260;
    const nextOffset = dragStartOffset.current - deltaX / sensitivity;
    
    if (loop) {
      xVal.set(nextOffset);
    } else {
      // Add slight friction when dragging past ends in non-loop mode
      const clampedOffset = Math.max(0, Math.min(items.length - 1, nextOffset));
      xVal.set(clampedOffset);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // Find nearest snap target
    const rawVal = xVal.get();
    let snappedIndex = Math.round(rawVal);
    
    if (!loop) {
      snappedIndex = Math.max(0, Math.min(items.length - 1, snappedIndex));
    }
    
    targetIndex.current = snappedIndex;
    xVal.set(snappedIndex);
  };

  // Mouse Wheel / Trackpad navigation (with 350ms snaps cooldown)
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaX || e.deltaY;
    if (Math.abs(delta) < 15) return;
    
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelSnapRef.current < 350) return;
    
    lastWheelSnapRef.current = now;
    const direction = Math.sign(delta);
    navigateTo(targetIndex.current + direction);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[480px] overflow-hidden flex flex-col items-center justify-center select-none bg-[#050507] border border-neutral-900 rounded-3xl p-6 outline-none",
        className
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        isHovered.current = true;
      }}
      onMouseLeave={() => {
        isHovered.current = false;
        handleDragEnd();
      }}
    >
      {/* 3D Viewport container */}
      <div
        className="relative w-full h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onTouchStart={(e) => {
          if (e.touches[0]) handleDragStart(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handleDragMove(e.touches[0].clientX);
        }}
        onTouchEnd={handleDragEnd}
        onWheel={handleWheel}
      >
        {/* Track holding all items */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, idx) => (
            <CoverflowCard
              key={item.id}
              item={item}
              index={idx}
              totalItems={items.length}
              smoothIndex={smoothIndex}
              loop={loop}
              onClick={() => {
                // If clicked, bring card to center
                if (!isDragging.current) {
                  navigateTo(idx);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
