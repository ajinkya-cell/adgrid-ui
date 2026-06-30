import { ReactNode } from "react";

export interface ExpandItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  description?: string;
  badge?: string;
  accent?: string; // e.g., custom hex, rgb, or styling class
}

export type ExpandVariant = "modern" | "minimal";
export type ExpandAnimationType = "spring" | "smooth";

export interface ExpandOnHoverProps {
  items: ExpandItem[];
  variant?: ExpandVariant;
  expandHeight?: number;
  collapsedHeight?: number;
  animation?: ExpandAnimationType;
  
  // Controlled & Uncontrolled states
  expandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  defaultExpanded?: string | null;
  
  // Visuals and spacing
  gap?: number; // spacing in px
  borderRadius?: number; // border radius in px
  
  // Behaviors
  allowMultiple?: boolean; // if true, behaves like dynamic accordion
  hoverDelay?: number; // delay in ms before triggering expand
  clickToExpand?: boolean; // if true, ignore hovers and only expand on click/tap
  autoCollapseOnLeave?: boolean; // collapse all when cursor leaves component
  
  // Custom Render Prop
  renderItem?: (item: ExpandItem, isExpanded: boolean) => ReactNode;
  
  // Class overrides
  className?: string;
  cardClassName?: string;
}

export interface ExpandOnHoverRef {
  expand: (index: number) => void;
  collapse: () => void;
  next: () => void;
  prev: () => void;
}
