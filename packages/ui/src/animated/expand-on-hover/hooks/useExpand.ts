import { useState, useRef, useCallback } from "react";
import { ExpandItem } from "../types";

interface UseExpandProps {
  items: ExpandItem[];
  expandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  defaultExpanded?: string | null;
  hoverDelay?: number;
  clickToExpand?: boolean;
}

export function useExpand({
  items,
  expandedId: controlledId,
  onExpandedChange,
  defaultExpanded = null,
  hoverDelay = 50,
  clickToExpand = false,
}: UseExpandProps) {
  // Uncontrolled fallback state
  const [localExpandedId, setLocalExpandedId] = useState<string | null>(defaultExpanded);
  
  // Controlled vs Uncontrolled determination
  const isControlled = controlledId !== undefined;
  const activeId = isControlled ? controlledId : localExpandedId;

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setExpanded = useCallback(
    (id: string | null) => {
      if (isControlled) {
        onExpandedChange?.(id);
      } else {
        setLocalExpandedId(id);
      }
    },
    [isControlled, onExpandedChange]
  );

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleHoverStart = useCallback(
    (id: string) => {
      if (clickToExpand) return;
      clearHoverTimeout();
      
      if (hoverDelay > 0) {
        hoverTimeoutRef.current = setTimeout(() => {
          setExpanded(id);
        }, hoverDelay);
      } else {
        setExpanded(id);
      }
    },
    [clickToExpand, hoverDelay, setExpanded, clearHoverTimeout]
  );

  const handleHoverEnd = useCallback(() => {
    if (clickToExpand) return;
    clearHoverTimeout();
  }, [clickToExpand, clearHoverTimeout]);

  const handleCardClick = useCallback(
    (id: string) => {
      // Click/Tap toggle: if already expanded, collapse it; otherwise expand it.
      if (activeId === id) {
        setExpanded(null);
      } else {
        setExpanded(id);
      }
    },
    [activeId, setExpanded]
  );

  return {
    activeId,
    setExpanded,
    handleHoverStart,
    handleHoverEnd,
    handleCardClick,
    clearHoverTimeout,
  };
}
