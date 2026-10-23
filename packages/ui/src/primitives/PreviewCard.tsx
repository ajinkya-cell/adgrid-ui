"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

export interface PreviewCardProps {
  /** Name shown under the preview well */
  title?: string;
  /** What sits in the well: a component, image, canvas or video */
  children?: ReactNode;
  /** Makes the whole card a link */
  href?: string;
  /** Element or link component to render as, e.g. Next's `Link` (defaults to `a` with `href`, else `div`) */
  as?: ElementType;
  /** Keep the preview off the well edges. Turn off for canvases, video and iframes that fill the well */
  padded?: boolean;
  /** Optional badge pinned to the top-right corner of the well */
  badge?: ReactNode;
  /** Show an arrow next to the title on hover */
  showArrow?: boolean;
  /** Lift the card on hover */
  lift?: boolean;
  /** Corner radius of the outer frame in px; the well follows concentrically */
  radius?: number;
  /** Gap between frame and well in px */
  inset?: number;
  /** Colour of the outer frame */
  frameColor?: string;
  /** Colour of the preview well */
  wellColor?: string;
  /** Colour of the preview well on hover */
  wellHoverColor?: string;
  /** Title colour */
  titleColor?: string;
  /** Optional container class name override */
  className?: string;
  /** Optional class names for the well */
  wellClassName?: string;
  [key: string]: unknown;
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// A framed card: a dark outer frame holding a raised, lighter well for the preview, with the name underneath.
export function PreviewCard({
  title = "Image reveal",
  children,
  href,
  as,
  padded = true,
  badge,
  showArrow = true,
  lift = true,
  radius = 30,
  inset = 14,
  frameColor = "#141414",
  wellColor = "#1c1c1c",
  wellHoverColor = "#202020",
  titleColor = "#f5f5f5",
  className = "",
  wellClassName = "",
  ...rest
}: PreviewCardProps) {
  const Root: ElementType = as ?? (href ? "a" : "div");
  const wellRadius = Math.max(radius - inset, 4);

  const vars = {
    "--pc-frame": frameColor,
    "--pc-well": wellColor,
    "--pc-well-hover": wellHoverColor,
    "--pc-title": titleColor,
  } as CSSProperties;

  return (
    <Root
      href={href}
      {...rest}
      className={`group relative flex h-full w-full flex-col bg-[var(--pc-frame)] text-left no-underline outline-none transition-transform duration-300 ease-out focus-visible:ring-2 focus-visible:ring-white/60 ${
        lift ? "hover:-translate-y-1" : ""
      } ${className}`}
      style={{
        ...vars,
        padding: inset,
        borderRadius: radius,
        border: "1px solid rgba(255,255,255,0.05)",
        borderTopColor: "rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 12px 32px rgba(0,0,0,0.45)",
      }}
    >
      <div
        className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--pc-well)] transition-colors duration-300 group-hover:bg-[var(--pc-well-hover)] ${
          padded ? "p-5" : ""
        } ${wellClassName}`}
        style={{
          borderRadius: wellRadius,
          border: "1px solid rgba(255,255,255,0.04)",
          borderTopColor: "rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 2px 6px rgba(0,0,0,0.35)",
        }}
      >
        {children}
        {badge && <div className="absolute right-3 top-3 z-10">{badge}</div>}
      </div>

      {title && (
        <div className="flex items-center justify-between gap-2 px-1.5 pt-3 pb-0.5">
          <h3 className="truncate text-[15px] font-medium tracking-wide text-[var(--pc-title)] opacity-90 transition-opacity group-hover:opacity-100">
            {title}
          </h3>
          {showArrow && (
            <span className="shrink-0 text-[var(--pc-title)] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60">
              <ArrowIcon />
            </span>
          )}
        </div>
      )}
    </Root>
  );
}
