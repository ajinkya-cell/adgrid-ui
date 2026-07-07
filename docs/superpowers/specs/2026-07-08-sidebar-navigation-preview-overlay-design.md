# Design Spec: Sidebar Navigation with Preview Overlay

## 1. Overview & Architecture
This document details the design and implementation of a premium, dark-themed sidebar navigation component with an interactive live preview overlay and a custom, edge-docked trigger. It will replace or enhance the existing navigation structure inside the dynamic presentation route (`/present/[category]/[slug]`).

### Component Structure
```
[PresentationLayout]
  ├── [SidebarTrigger] (Edge-docked vertical pill -> rotating compass icon)
  ├── [Sidebar] (Full-height, numbered navigation list)
  │     └── [SidebarItem] (List entries with slide-in indicators)
  └── [PreviewOverlay] (React Portal overlay with dynamic preview cards)
```

---

## 2. Visual Design Specs

### SidebarTrigger (Edge-docked)
*   **Dimensions**: Default `4px` width, `80px` height. Hovered `48px` diameter (circle).
*   **Background**: Deep black/charcoal (`#0a0a0a`), border `1px` white/10.
*   **Aesthetics**: Cyan pulse shadow (`box-shadow: 0 0 12px rgba(56, 189, 248, 0.4)`).
*   **Icon**: Custom SVG compass/dial. Outer ticks rotate clockwise. Center needle follows cursor angle.

### Sidebar
*   **Width**: `300px` width, `100vh` height.
*   **Background**: Obsidian black (`#070707`), `backdrop-filter: blur(12px)`, opacity `0.95`.
*   **Spacing**: `32px` vertical gap between items.
*   **Typography**: Inter/SF Pro, `15px`, weight `450`, tracking `0.02em`.
*   **Active Indicator**: A 2px cyan line (`#38bdf8`) expanding from `0%` to `100%` width from the left edge under the text on hover/active.

### Preview Overlay
*   **Position**: Fixed, anchored to the right of the hovered sidebar item.
*   **Dimensions**: `340px` width, `220px` height.
*   **Background**: Semi-transparent dark card (`rgba(10,10,10,0.95)` fill, `rgba(255,255,255,0.06)` border).
*   **Shadow**: `0 20px 60px rgba(0,0,0,0.6)`.
*   **Transition**: `opacity` 0 -> 1, `scale` 0.95 -> 1, `y` +10px -> 0.

---

## 3. Interaction & Animation Specs

| Element | Property | Start | End | Duration | Easing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trigger Pill** | width | `4px` | `48px` | `250ms` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| **Active Line** | width | `0%` | `100%` | `300ms` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| **Text Color** | color | `#888888` | `#38bdf8` | `200ms` | `ease-out` |
| **Preview Card** | opacity, scale | `0`, `0.95` | `1`, `1` | `220ms` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| **Sidebar Exit** | opacity, x | `1`, `0` | `0`, `-20px` | `350ms` | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

## 4. Technical Implementation Details

### Lazy Loading & Preview Registry
*   All previews will load dynamically to prevent bundling overhead:
    ```typescript
    const LazyComponent = React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m[ComponentName] })));
    ```
*   Specialized container adapters will wrapper button, background, and form components to center and scale them inside the smaller `340x220` viewport.

### Accessibility (WAI-ARIA)
*   **Roles**: `role="navigation"`, `aria-label="Component selector"`.
*   **Focus**: Active/Hovered item receives focus on keyboard scroll.
*   **Keyboard Controls**: `ArrowUp` / `ArrowDown` to navigate, `Enter` to confirm/navigate, `Escape` to close.
