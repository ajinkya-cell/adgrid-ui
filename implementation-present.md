# Presentation Mode — Implementation Plan

## 1. Route & Entry Point

**File:** `apps/docs/src/app/present/[category]/[slug]/page.tsx`

```typescript
// Server component — reads registry, reads source code, renders PresentationLayout
// Same pattern as existing ComponentPage but stripped to essentials
```

- Same `generateStaticParams` pattern as component pages (iterate registry)
- Reads `entry.packagePath`, reads source via `fs.readFileSync`
- Passes `entry`, `rawCode`, `additionalFiles`, `editableProps` to client `PresentationLayout`

**Navbar integration:** The root layout in `app/layout.tsx` wraps children in a `LayoutGroup` from Framer Motion so shared layout animations bridge route changes. Conditionally hide the `<Navbar />` when on `/present/*` routes.

**`presentationStrategy` field** added to `RegistryEntry` in `apps/docs/src/registry/index.ts`:

```typescript
export type DisplayStrategy = "center" | "fullscreen" | "cover" | "fit" | "auto";

export interface RegistryEntry {
  // ... existing
  presentationStrategy?: DisplayStrategy;
}
```

Default resolution in the renderer:
- `buttons` → `center`
- `backgrounds` → `fullscreen`
- `animated` with Hero/PremiumHero → `cover`
- everything else → `center`

---

## 2. Present Button on Component Pages

**File:** `apps/docs/src/components/site/ComponentTabs.tsx` (line ~73, above the tab content)

Add a `Link` button in the tab bar area:

```tsx
<Link
  href={`/present/${entry.category}/${entry.slug}`}
  className="ml-auto px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest
             border border-white/10 hover:border-white/30 rounded-md
             transition-colors text-white/60 hover:text-white"
>
  Present
</Link>
```

The live preview `<div>` in `LivePreview.tsx` gets `layoutId={`component-preview-${slug}`}` so Framer Motion can animate it into the presentation canvas.

---

## 3. Presentation Store (Extend Existing)

**File:** `apps/docs/src/lib/presentation/store.ts`

The store already exists with Zustand + persist. Add:

- `componentProps: Record<string, unknown>` — persisted prop values per component
- `historyIndex: number` — for proper forward/back navigation through history stack
- Update `navigateToComponent` to manage history stack properly (truncate forward history on new navigation)
- Add `setComponentProp` action

No need to change the existing structure — just extend the `PresentationState` interface.

---

## 4. PresentationProvider

**File:** `apps/docs/src/components/presentation/PresentationProvider.tsx`

```tsx
"use client";
// Wraps children in Framer Motion LayoutGroup
// Provides presentation context
// Initializes keyboard shortcuts
// Handles mouse activity tracking
```

- Renders `LayoutGroup` for shared layout animations
- Renders `MouseActivityProvider`
- Sets up the global keyboard shortcut listener via `useKeyboardShortcuts`
- Conditionally renders command palette and settings panel at this level (portal to body)

---

## 5. PresentationLayout

**File:** `apps/docs/src/components/presentation/PresentationLayout.tsx`

The main shell component. Receives `entry`, `rawCode`, `additionalFiles`, `editableProps`.

Structure:

```tsx
<div className="fixed inset-0 bg-[#111] overflow-hidden">
  <PresentationBackground mode={settings.backgroundMode} />
  <PresentationCanvas strategy={entry.presentationStrategy ?? 'auto'}>
    <PresentationRenderer
      entry={entry}
      rawCode={rawCode}
      additionalFiles={additionalFiles}
      editableProps={editableProps}
    />
  </PresentationCanvas>
  <FloatingDock />
  <PresentationSidebar />
  <CommandPalette />
  <KeyboardShortcutsDisplay />
  {settings.showFPS && <FPSMonitor />}
  {settings.showSafeArea && <SafeAreaOverlay />}
</div>
```

The outer `div` has `layoutId={`component-preview-${slug}`}` for shared layout animation from the docs page.

On mount: fade in background from `#000` to `#111` using Framer Motion `animate`.

---

## 6. PresentationCanvas

**File:** `apps/docs/src/components/presentation/PresentationCanvas.tsx`

```tsx
"use client";

interface Props {
  strategy: DisplayStrategy;
  children: React.ReactNode;
}
```

Renders a container div that applies the display strategy:

| Strategy | CSS |
|---|---|
| `center` | `flex items-center justify-center`, child max 90vw/90vh |
| `fullscreen` | `absolute inset-0` |
| `cover` | `absolute inset-0`, child with `object-fit: cover` behavior |
| `fit` | `flex items-center justify-center`, child with `max-w-full max-h-full` |
| `auto` | Resolves to one of the above based on category heuristic |

Uses `motion.div` with `initial={{ opacity: 0, scale: 0.95 }}` `animate={{ opacity: 1, scale: 1 }}` with a spring transition.

---

## 7. PresentationRenderer

**File:** `apps/docs/src/components/presentation/PresentationRenderer.tsx`

Dynamically loads and renders the component from the registry.

```tsx
"use client";

const Component = dynamic(
  () => import(`../../../../packages/ui/src/${entry.packagePath}`),
  { loading: () => <div className="..." /> }
);

// Or use a registry-based import map for Next.js compatibility
```

Since Next.js doesn't support fully dynamic import paths with variables, create an import map:

```typescript
const COMPONENT_MAP: Record<string, () => Promise<any>> = {
  "animated/VoidButton": () => import("@adgrid-ui/ui/src/animated/VoidButton"),
  "animated/DotMatrix": () => import("@adgrid-ui/ui/src/animated/DotMatrix"),
  // ... one entry per registry component
};
```

This avoids bundling everything while still being tree-shakeable and compatible with Next.js.

**Alternate approach:** Use `React.lazy` with a registry-driven map. Either way, only one component mounts at a time.

The renderer passes through props from `editableProps` defaults, or custom props from the store if the user has customized them.

---

## 8. FloatingDock

**File:** `apps/docs/src/components/presentation/FloatingDock.tsx`

```tsx
"use client";

// Fixed top-right, z-50
// Uses useDockVisibility hook for auto-hide after 3s inactivity
// motion.div with animate={{ opacity, y, filter }}
```

Buttons:
| Icon | Label | Action | Shortcut |
|---|---|---|---|
| `Maximize2` | Fullscreen | `document.documentElement.requestFullscreen()` | `F` |
| `ExternalLink` | Open in New Tab | `window.open(currentUrl)` | — |
| `FileCode` | View Source | opens raw code in sidebar bottom panel | — |
| `Copy` | Copy Name | copies component name to clipboard | `C` |
| `ClipboardCopy` | Copy Import | copies `import { X } from "@adgrid-ui/ui"` | `I` |
| `Settings` | Settings | toggles settings panel | `S` |
| `PanelRightOpen` | Navigator | toggles sidebar | `CMD+B` |
| `X` | Exit | navigates back to component page | `ESC` |

---

## 9. DockButton

**File:** `apps/docs/src/components/presentation/DockButton.tsx`

Shared button component for dock items:

```tsx
interface DockButtonProps {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: "default" | "danger";
}
```

Renders a small rounded button (`w-8 h-8`) with tooltip on hover. Tooltip is a positioned span that fades in with `scale` + `opacity` animation. On mobile, tooltips become `aria-label` only.

---

## 10. PresentationSidebar

**File:** `apps/docs/src/components/presentation/PresentationSidebar.tsx`

`fixed right-0 top-0 h-full w-[360px] z-40`. Slides in with spring animation (`x: 360 → 0`). Background: `bg-neutral-950/90 backdrop-blur-xl rounded-l-2xl border-l border-white/5`.

Content:
- Search input at top (`SidebarSearch`)
- Scrollable category list
  - Each category is a `SidebarCategory` (collapsible section)
  - Each component is a `SidebarItem` (name + description + favorite + recent)
- Favorite filter toggle at top

Closes on `CMD+B` or by clicking the backdrop (a `motion.div` behind the sidebar at `z-30`, `inset-0`, `bg-black/20`, `onClick` closes).

---

## 11. SidebarSearch

**File:** `apps/docs/src/components/presentation/SidebarSearch.tsx`

Auto-focused input that filters the registry list. Searches `name`, `slug`, `category`, `description` using fuzzy matching. Keyboard navigation with arrow keys + enter to select.

---

## 12. SidebarCategory & SidebarItem

**File:** `apps/docs/src/components/presentation/SidebarCategory.tsx`
**File:** `apps/docs/src/components/presentation/SidebarItem.tsx`

`SidebarCategory`: Clickable category header with expand/collapse chevron. Shows count of visible items. `AnimatePresence` for expand/collapse of children.

`SidebarItem`: Row with component name, truncated description, favorite star button, "recent" dot indicator. Click navigates to component via `router.push` to the new present URL.

---

## 13. PresentationSettings

**File:** `apps/docs/src/components/presentation/PresentationSettings.tsx`

Slide-in panel from the right (or rendered as a sub-panel in the sidebar). Uses `motion.div` with spring animation.

Controls:
- Background mode: radio/select group (Solid / Noise / Grid / Dot Grid / Gradient / Aurora)
- Show Safe Area: toggle
- Show FPS Monitor: toggle
- Reduce Motion: toggle (sets `prefers-reduced-motion` equivalent)
- Reset to Defaults: button

Changes update the Zustand store, which persists to localStorage.

---

## 14. PresentationBackground

**File:** `apps/docs/src/components/presentation/PresentationBackground.tsx`

Renders the visual background based on `backgroundMode`:

| Mode | Implementation |
|---|---|
| `solid` | `div` with `background-color: var(--bg, #111)` |
| `noise` | CSS pseudo-element with `filter: url(#noise)` SVG filter, opacity 0.03-0.05 |
| `grid` | CSS `background-image: repeating-linear-gradient` for 1px grid lines at 32px intervals |
| `dotGrid` | CSS `background-image: radial-gradient(circle, #333 1px, transparent 1px)` at 24px intervals |
| `gradient` | `motion.div` with animated conic or linear gradient, slow rotation |
| `aurora` | 2-3 blurred `motion.div` layers with slow translate/scale animation, `mix-blend-mode: screen`, low opacity |

All modes use `motion.div` with `initial={{ opacity: 0 }}` `animate={{ opacity: 1 }}` for smooth transitions when mode changes.

The background sits at `fixed inset-0 z-0`. Content sits above at `relative z-10`.

---

## 15. CommandPalette

**File:** `apps/docs/src/components/presentation/CommandPalette.tsx`

Modal overlay triggered by `CMD+K`. Raycast-inspired:

```tsx
<div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
  <motion.div
    className="absolute inset-0 bg-black/60"
    onClick={close}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  />
  <motion.div
    className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
    initial={{ opacity: 0, scale: 0.96, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
  >
    <input autoFocus className="w-full px-4 py-3 bg-transparent border-b border-neutral-800 text-white outline-none" />
    <div className="max-h-[400px] overflow-y-auto p-2">
      {/* Grouped results */}
    </div>
  </motion.div>
</div>
```

Searchable items:
- Components (from registry)
- Categories (filter by category)
- Actions (Enter Presentation, Exit, Toggle Sidebar, Toggle Fullscreen, etc.)
- Settings (Change Background, Toggle FPS, etc.)

Each result group has a subtle header label. Results show icon + name + shortcut hint. Keyboard navigation via arrow keys + enter.

---

## 16. KeyboardShortcutsDisplay

**File:** `apps/docs/src/components/presentation/KeyboardShortcutsDisplay.tsx`

Overlay shown when pressing `?`. Lists all keyboard shortcuts in a centered modal:

```
ESC          Exit Presentation
⌘B           Toggle Sidebar
⌘K           Command Palette
← / →        Previous / Next Component
F            Fullscreen
C            Copy Component Name
I            Copy Import Statement
S            Toggle Settings
?            Toggle Shortcuts
```

Styled simply: dark semi-transparent backdrop, centered card with monospace text, grouped by section.

---

## 17. MouseActivityProvider

**File:** `apps/docs/src/components/presentation/MouseActivityProvider.tsx`

```tsx
"use client";

// Tracks mouse movement and sets dock visibility
// After 3000ms of no mouse movement, sets dockVisible to false
// On any mouse move, sets dockVisible to true
// Resets timer on each mouse move
```

Implementation:
```typescript
useEffect(() => {
  let timer: NodeJS.Timeout;
  const handleMove = () => {
    setDockVisible(true);
    clearTimeout(timer);
    timer = setTimeout(() => setDockVisible(false), 3000);
  };
  window.addEventListener("mousemove", handleMove);
  return () => {
    window.removeEventListener("mousemove", handleMove);
    clearTimeout(timer);
  };
}, []);
```

Dock fade animation: `opacity: dockVisible ? 1 : 0`, `y: dockVisible ? 0 : -8`, `filter: dockVisible ? "blur(0)" : "blur(4px)"`, transition with `duration: 0.4, ease: easeOut`.

---

## 18. Hooks

### usePresentation
**File:** `apps/docs/src/components/presentation/hooks/usePresentation.ts`

Convenience wrapper around the Zustand store + router:

```typescript
export function usePresentation() {
  const store = usePresentationStore();
  const router = useRouter();
  const pathname = usePathname();

  return {
    ...store,
    exit: () => {
      store.exitPresentation();
      router.push(`/components/${store.componentCategory}/${store.componentSlug}`);
    },
    navigateTo: (slug: string, category: string) => {
      store.navigateToComponent(slug, category);
      router.push(`/present/${category}/${slug}`);
    },
  };
}
```

### useDockVisibility
**File:** `apps/docs/src/components/presentation/hooks/useDockVisibility.ts`

Returns `dockVisible` boolean from the store. (The store already has `setDockVisible` — this hook is a convenience wrapper that also handles edge cases like touch devices where dock should remain visible.)

```typescript
export function useDockVisibility() {
  const dockVisible = usePresentationStore((s) => s.dockVisible);
  const setDockVisible = usePresentationStore((s) => s.setDockVisible);
  // On mount: check if touch device → keep visible
  // On unmount: cleanup timer
  return { dockVisible, setDockVisible };
}
```

### usePresentationNavigation
**File:** `apps/docs/src/components/presentation/hooks/usePresentationNavigation.ts`

```typescript
export function usePresentationNavigation(slug: string) {
  const registry_ = registry; // from @/registry
  const navigateTo = usePresentationStore((s) => s.navigateToComponent);

  const allEntries = registry_.flat();
  const currentIndex = allEntries.findIndex((e) => e.slug === slug);

  return {
    next: currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null,
    prev: currentIndex > 0 ? allEntries[currentIndex - 1] : null,
    hasNext: currentIndex < allEntries.length - 1,
    hasPrev: currentIndex > 0,
    navigateNext: () => {
      if (currentIndex < allEntries.length - 1) {
        const next = allEntries[currentIndex + 1];
        navigateTo(next.slug, next.category);
      }
    },
    navigatePrev: () => {
      if (currentIndex > 0) {
        const prev = allEntries[currentIndex - 1];
        navigateTo(prev.slug, prev.category);
      }
    },
  };
}
```

### useKeyboardShortcuts
**File:** `apps/docs/src/components/presentation/hooks/useKeyboardShortcuts.ts`

Global event listener for all registered shortcuts. Calls the appropriate store actions and router methods. Handles `event.preventDefault()` and platform detection for `CMD` vs `CTRL`.

### usePresentationSettings
**File:** `apps/docs/src/components/presentation/hooks/usePresentationSettings.ts`

Convenience hook wrapping the settings portion of the store:

```typescript
export function usePresentationSettings() {
  const settings = usePresentationStore((s) => s.settings);
  const updateSettings = usePresentationStore((s) => s.updateSettings);
  return { settings, updateSettings };
}
```

---

## 19. Navbar Hiding on Present Routes

**File:** `apps/docs/src/app/layout.tsx`

Wrap the `<Navbar />` in a conditional:

```typescript
// Use a client component with usePathname
function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/present")) return null;
  return <Navbar />;
}
```

This keeps the root layout structure but removes the navbar seamlessly when in presentation mode.

---

## 20. FPS Monitor

**File:** `apps/docs/src/components/presentation/FPSMonitor.tsx` (optional, shown when `showFPS` is enabled)

Small overlay in the bottom-right showing current FPS. Uses `requestAnimationFrame` to count frames over 1-second intervals. Dark pill background, monospace text.

---

## Implementation Order

### Phase 1 — Foundation (Core route + canvas)
1. Add `presentationStrategy` to `RegistryEntry` type and populate defaults
2. Create `/present/[category]/[slug]/page.tsx` route
3. Create `PresentationLayout.tsx` (basic shell)
4. Create `PresentationCanvas.tsx` with strategy support
5. Create `PresentationRenderer.tsx` with import map
6. Add "Present" button to `ComponentTabs.tsx`
7. Add `LayoutGroup` to root layout
8. Add navbar hiding on present routes

### Phase 2 — Navigation & Controls
9. Create `FloatingDock.tsx` + `DockButton.tsx`
10. Create `MouseActivityProvider.tsx` + `useDockVisibility`
11. Create `PresentationSidebar.tsx` + `SidebarSearch` + `SidebarCategory` + `SidebarItem`
12. Create `usePresentationNavigation` hook
13. Create `useKeyboardShortcuts` hook
14. Create keyboard shortcut overlay

### Phase 3 — Enhanced Experience
15. Create `PresentationBackground.tsx` with all modes
16. Create `PresentationSettings.tsx`
17. Create `CommandPalette.tsx`
18. Create `FPSMonitor.tsx` + safe area overlay
19. Extend Zustand store with remaining state
20. Add shared layout animation (`layoutId`)

### Phase 4 — Polish
21. Mobile responsiveness (dock adaptation, sidebar → bottom sheet)
22. Accessibility audit (focus trapping, ARIA labels, reduced motion)
23. Performance optimization (memoization, lazy loading)
24. Edge cases (empty registry, missing files, error boundaries)

---

## Files Created (22 files)

```
apps/docs/src/app/present/[category]/[slug]/page.tsx
apps/docs/src/components/presentation/PresentationProvider.tsx
apps/docs/src/components/presentation/PresentationLayout.tsx
apps/docs/src/components/presentation/PresentationCanvas.tsx
apps/docs/src/components/presentation/PresentationRenderer.tsx
apps/docs/src/components/presentation/FloatingDock.tsx
apps/docs/src/components/presentation/DockButton.tsx
apps/docs/src/components/presentation/PresentationSidebar.tsx
apps/docs/src/components/presentation/SidebarSearch.tsx
apps/docs/src/components/presentation/SidebarCategory.tsx
apps/docs/src/components/presentation/SidebarItem.tsx
apps/docs/src/components/presentation/PresentationSettings.tsx
apps/docs/src/components/presentation/PresentationBackground.tsx
apps/docs/src/components/presentation/CommandPalette.tsx
apps/docs/src/components/presentation/KeyboardShortcutsDisplay.tsx
apps/docs/src/components/presentation/MouseActivityProvider.tsx
apps/docs/src/components/presentation/FPSMonitor.tsx
apps/docs/src/components/presentation/hooks/usePresentation.ts
apps/docs/src/components/presentation/hooks/useDockVisibility.ts
apps/docs/src/components/presentation/hooks/usePresentationNavigation.ts
apps/docs/src/components/presentation/hooks/useKeyboardShortcuts.ts
apps/docs/src/components/presentation/hooks/usePresentationSettings.ts
```

## Files Modified (4 files)

```
apps/docs/src/registry/index.ts                    — add DisplayStrategy type + field
apps/docs/src/lib/presentation/store.ts             — extend state + actions
apps/docs/src/app/layout.tsx                        — LayoutGroup + conditional Navbar
apps/docs/src/components/site/ComponentTabs.tsx     — add Present button
```
