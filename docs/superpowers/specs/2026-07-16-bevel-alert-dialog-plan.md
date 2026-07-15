# Implementation Plan: 3D Beveled skeuomorphic Alert Dialog

This document outlines the step-by-step technical plan to implement **BevelAlertDialog** — a skeuomorphic 3D beveled alert dialog component in `@adgrid-ui/ui` using React, TypeScript, Framer Motion, and Tailwind CSS.

---

## Phase 1: Create the React Component (1 file)

### 1. Create `packages/ui/src/animated/BevelAlertDialog.tsx`
This file will contain:
*   `BevelAlertDialogProps` definition.
*   The backdrop/overlay (`framer-motion`'s `AnimatePresence` and `motion.div`).
*   The outer console chassis structure using absolute and relative styling, border glare highlights, and inset shadows.
*   The inner recessed obsidian details tray (`#090909`).
*   The status LED indicator on the top-left (flashing red for `danger`, solid blue/white for `info`).
*   The action buttons (a sunken void black well for `Cancel`, and a raised white/red pill button for `Confirm`).
*   Backdrop shake animation on invalid clicks.

---

## Phase 2: Package Export (1 file)

### 2. Modify `packages/ui/src/index.ts`
Export the new component and its props:
```typescript
export { BevelAlertDialog } from "./animated/BevelAlertDialog";
export type { BevelAlertDialogProps } from "./animated/BevelAlertDialog";
```

---

## Phase 3: Register in Docs App (3 files)

### 3. Register in `apps/docs/src/registry/index.ts`
Add a metadata entry for `BevelAlertDialog` under the `animated` or `dialogs` category:
```typescript
  {
    name: "Bevel Alert Dialog",
    slug: "bevel-alert-dialog",
    category: "animated",
    description: "A tactile 3D beveled alert dialog panel matching the machined console aesthetic, featuring physical drop shadows, recessed wells, action buttons, and status LED alerts.",
    dependencies: ["framer-motion"],
    packagePath: "animated/BevelAlertDialog.tsx",
    files: ["animated/BevelAlertDialog.tsx"],
    presentationStrategy: "fullscreen",
    propDefs: [
      { name: "variant", type: "select", default: "info", description: "Visual and LED alert state theme", options: ["info", "danger"], required: false },
      { name: "title", type: "string", default: "SYSTEM OVERLOAD ALERT", description: "Main headline text", required: false },
      { name: "description", type: "string", default: "A thermal surge has been detected in core reactor block 4. Continued operation risks coolant seal degradation. De-authorize reactor block immediately?", description: "Explanation detail text", required: false },
      { name: "confirmLabel", type: "string", default: "DE-AUTHORIZE", description: "Primary action button label", required: false },
      { name: "cancelLabel", type: "string", default: "IGNORE", description: "Secondary action button label", required: false }
    ]
  }
```

### 4. Wire up in `apps/docs/src/components/presentation/PresentationRenderer.tsx`
Add a case for `"bevel-alert-dialog"`:
*   Implement a local React wrapper component with a stateful button trigger (e.g. "TRIGGER DIALOG") to open the modal.
*   Pass the reactive `liveProps` down to `BevelAlertDialog`.
*   Handle `onConfirm` and `onClose` callbacks, showcasing a loading spinner or notification indicator.

### 5. Wire up in `apps/docs/src/components/presentation/PreviewOverlay.tsx`
Register the lazy import for `BevelAlertDialog` so that page transitions import it on demand:
```typescript
  BevelAlertDialog: React.lazy(() => import("@adgrid-ui/ui").then(m => ({ default: m.BevelAlertDialog }))),
```
And add its preview overlay element.

---

## Phase 4: Test & Verify
*   Verify TypeScript compiling in `packages/ui` and `apps/docs`.
*   Ensure smooth 60fps animations for entry, exit, button clicks, and LED pulses.
