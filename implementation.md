# Implementation Plan: Sidebar Navigation with Preview Overlay

This document details the steps to build the custom edge-docked trigger, full-height numbered sidebar, and live interactive preview overlay for the presentation mode in `adgrid-ui`.

---

## Step 1: Create the Edge-Docked Trigger Button
**File:** `apps/docs/src/components/presentation/SidebarTrigger.tsx`

*   Implement a React component docked at `fixed left-0 top-1/2 -translate-y-1/2`.
*   Uses a thin vertical pill structure that expands to a circular button on hover.
*   Uses a custom SVG compass icon inside. The outer ring rotates, and the inner dial points toward the cursor coordinate.
*   Integrates with Zustand's `sidebarOpen` state via `usePresentationStore`.

---

## Step 2: Implement the Portal Preview Overlay
**File:** `apps/docs/src/components/presentation/PreviewOverlay.tsx`

*   Implement a portal-based overlay component using `@radix-ui/react-portal` (or custom React Portal).
*   Coordinates with the active hovered sidebar item's bounding box to render fixed on the screen, offset to the right of the item.
*   Lazy-loads the component dynamically using `React.lazy` and maps slugs to proper previews.
*   Includes styling matching the spec: semi-transparent card background, border, soft shadow, scale-up fade-in transition.
*   Adds a debounce delay of `80ms` to hover transitions to prevent cursor flickering.

---

## Step 3: Redesign the Sidebar & Numbered List
**File:** `apps/docs/src/components/presentation/PresentationSidebar.tsx`

*   Redesign the layout to match the Vercel/Linear aesthetic: deep obsidian black backdrop (`#070707`), full height (`100vh`), comfortable padding, and custom scrollbar styling.
*   Assign sequential 2-digit indexes to components.
*   Animate active line indicator and text coloring on hover using Framer Motion.
*   Provide a "New" badge style with breathing opacity transitions.
*   Support Keyboard Navigation: tracking currently active item index with arrow keys, and navigating with Enter.

---

## Step 4: Integrate into PresentationLayout
**File:** `apps/docs/src/components/presentation/PresentationLayout.tsx`

*   Mount the `SidebarTrigger` at the top level.
*   Ensure that clicking an item closes/collapses the sidebar via store actions and triggers page transitions.
*   Add keydown keyboard event listener inside `PresentationLayout` or `PresentationSidebar` to manage focus.

---

## Step 5: Build and Verify
*   Verify TypeScript compilation and Next.js builds.
