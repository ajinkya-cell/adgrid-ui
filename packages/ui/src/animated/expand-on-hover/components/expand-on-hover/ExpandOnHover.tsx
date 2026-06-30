import React, { forwardRef, useImperativeHandle, useId } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { ExpandOnHoverProps, ExpandOnHoverRef } from "../../types";
import { useExpand } from "../../hooks/useExpand";
import { ExpandCard } from "./ExpandCard";
import { cn } from "../../../../lib/utils";

export const ExpandOnHover = forwardRef<ExpandOnHoverRef, ExpandOnHoverProps>(
  (
    {
      items,
      variant = "modern",
      expandHeight = 420,
      collapsedHeight = 52,
      animation = "spring",
      expandedId,
      onExpandedChange,
      defaultExpanded = null,
      gap = 12,
      borderRadius = 24,
      allowMultiple = false,
      hoverDelay = 50,
      clickToExpand = false,
      autoCollapseOnLeave = true,
      renderItem,
      className,
      cardClassName,
    },
    ref
  ) => {
    // Generate unique LayoutGroup ID to prevent cross-component interference
    const layoutGroupId = useId();

    const {
      activeId,
      setExpanded,
      handleHoverStart,
      handleHoverEnd,
      handleCardClick,
    } = useExpand({
      items,
      expandedId,
      onExpandedChange,
      defaultExpanded,
      hoverDelay,
      clickToExpand,
    });

    // Find the numerical index of the currently active/expanded card
    const activeIndex = items.findIndex((item) => item.id === activeId);
    const resolvedActiveIndex = activeIndex === -1 ? null : activeIndex;

    // Expose Imperative API methods via forwardRef
    useImperativeHandle(ref, () => ({
      expand: (index: number) => {
        if (index >= 0 && index < items.length) {
          setExpanded(items[index].id);
        }
      },
      collapse: () => {
        setExpanded(null);
      },
      next: () => {
        const nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % items.length;
        setExpanded(items[nextIndex].id);
      },
      prev: () => {
        const prevIndex =
          activeIndex === -1
            ? items.length - 1
            : (activeIndex - 1 + items.length) % items.length;
        setExpanded(items[prevIndex].id);
      },
    }));

    // Keyboard controls for Arrow keys + Escape + Space/Enter
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      const targetItem = items[index];
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          const nextCard = document.getElementById(`card-${layoutGroupId}-${index + 1}`);
          nextCard?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          const prevCard = document.getElementById(`card-${layoutGroupId}-${index - 1}`);
          prevCard?.focus();
          break;
        case "Escape":
          e.preventDefault();
          setExpanded(null);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleCardClick(targetItem.id);
          break;
        default:
          break;
      }
    };

    // Auto-collapse when cursor fully exits the component area
    const handleMouseLeaveContainer = () => {
      if (autoCollapseOnLeave && !clickToExpand) {
        setExpanded(null);
      }
    };

    return (
      <LayoutGroup id={layoutGroupId}>
        <motion.div
          layout
          onMouseLeave={handleMouseLeaveContainer}
          style={{ gap: `${gap}px` }}
          className={cn("flex flex-col w-full max-w-xl mx-auto", className)}
        >
          {items.map((item, index) => {
            const isExpanded = activeId === item.id;
            
            return (
              <ExpandCard
                key={item.id}
                item={item}
                index={index}
                activeIndex={resolvedActiveIndex}
                isExpanded={isExpanded}
                expandHeight={expandHeight}
                collapsedHeight={collapsedHeight}
                variant={variant}
                animation={animation}
                borderRadius={borderRadius}
                clickToExpand={clickToExpand}
                onHoverStart={() => handleHoverStart(item.id)}
                onHoverEnd={handleHoverEnd}
                onClick={() => handleCardClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                renderItem={renderItem}
                cardClassName={cardClassName}
                // Overriding ID with layoutGroupId prefix to prevent focus collision when rendering multiple lists
                {...{ id: `card-${layoutGroupId}-${index}` }}
              />
            );
          })}
        </motion.div>
      </LayoutGroup>
    );
  }
);

ExpandOnHover.displayName = "ExpandOnHover";
