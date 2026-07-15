# Design Specification: 3D Beveled skeuomorphic Alert Dialog

This specification defines the architecture, design tokens, HTML/CSS layout, and React interfaces for building the tactile, 3D-beveled and debossed (sunken) "Machined Console" Alert Dialog component.

---

## 1. Overview & Visual Aesthetic

The Alert Dialog mimics a physical device console (e.g., an alarm panel or machined instrument deck) crafted from a dark, high-matte charcoal polymer/metal. It implements four distinct physical elevation levels to construct a deep, high-friction skeuomorphic UI:

1. **Outer Chassis (Raised Console, Elevation 1)**: Elevated panel floating above the workspace with a high-contrast top-bevel highlight and deep drop-shadow occlusion.
2. **Inner Details Tray (Sunken Tray, Elevation 2)**: An obsidian well cut directly into the chassis where the alert content resides, shadowed at the top to convey recess depth.
3. **Control Slots (Sub-Wells, Elevation 3)**: Pushed-in rectangular sockets housing the actions and unselected button faces.
4. **Active Control Pills (Elevated Button, Elevation 4)**: Elevated solid white (or alarm red) button cap that casts its own drop-shadow, depressing down when clicked.

---

## 2. Elevation Specifications & CSS Rules

### A. Outer Chassis (Raised Deck)
*   **Base Color**: Solid `#171717` (Dark Charcoal Matte)
*   **Backdrop Filter**: `backdrop-blur-2xl` (for glass blend over overlay)
*   **Border Styling**:
    *   *Top*: `border-top: 1px solid rgba(255, 255, 255, 0.20)` (simulates overhead glare catch)
    *   *Sides*: `border-left: 1px solid rgba(255, 255, 255, 0.02); border-right: 1px solid rgba(255, 255, 255, 0.02)`
    *   *Bottom*: `border-bottom: 1px solid rgba(255, 255, 255, 0.10)`
*   **Box Shadow**:
    ```css
    box-shadow: 
      inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08),  /* Top inner glare lip */
      inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40),         /* Bottom shadow lip */
      0 30px 80px rgba(0, 0, 0, 0.60);                /* Deep ambient shadow */
    ```

### B. Recessed Details Tray (Sunken Body)
*   **Base Color**: `#090909` (Obsidian Well)
*   **Border Styling**: `border: 1px solid rgba(255, 255, 255, 0.04)`
*   **Box Shadow**:
    ```css
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.80),   /* Inner shadow of cutout edge */
      0 1px 0 rgba(255, 255, 255, 0.05);     /* Beveled bottom outer reflection */
    ```

### C. Secondary Action (Sunken Sub-Well Button)
*   **Base Color**: `#050505` (Deep Void Black)
*   **Border Styling**: `border: 1px solid rgba(255, 255, 255, 0.05)`
*   **Box Shadow**:
    ```css
    box-shadow: inset 0 1.5px 3px rgba(0, 0, 0, 0.60);
    ```
*   **Hover State**: Border shifts to `rgba(255, 255, 255, 0.15)` with micro-brightening of text.

### D. Primary/Confirm Action (Elevated Button Pill)
*   **Standard Theme**:
    *   *Base Color*: `#FFFFFF` (Solid White), Text: `#000000`
    *   *Border*: `border: 1px solid rgba(255, 255, 255, 0.35)`
    *   *Shadow*: `0 2px 4px rgba(0, 0, 0, 0.20)`
*   **Destructive/Danger Theme**:
    *   *Base Color*: `#EF4444` (Alarm Red), Text: `#FFFFFF`
    *   *Border*: `border: 1px solid rgba(255, 255, 255, 0.25)`
    *   *Shadow*: `0 2px 4px rgba(239, 68, 68, 0.25)`
*   **Press/Tap Action**: Scale down slightly (to `0.96`), translate `y` by `1.5px`, and reduce drop-shadow to simulate mechanical button travel.

---

## 3. Status LED Indicators

To enhance the machine aesthetic, a physical circular status LED is located at the top-left of the console.
*   **Info/Muted State**: Static cool blue/white LED.
    *   *Style*: `bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]`
*   **Danger/Destructive State**: Pulsing bright warning red LED.
    *   *Style*: `bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.95)]`

---

## 4. Component Interface & React API

We will create a component named `BevelAlertDialog` in the file `packages/ui/src/animated/BevelAlertDialog.tsx`.

```typescript
export interface BevelAlertDialogProps {
  /** Controls visibility of the dialog */
  isOpen: boolean;
  /** Fired when dialog is closed (clicking backdrop or Cancel button) */
  onClose: () => void;
  /** Callback fired when the primary action button is clicked */
  onConfirm: () => void | Promise<void>;
  /** Main title text displayed in the header */
  title: string;
  /** Body message displayed in the sunken details tray */
  description: string;
  /** Style preset determining visual tone & primary button layout */
  variant?: "info" | "danger";
  /** Optional custom text for the confirm button. Defaults to "Confirm" or "Delete" depending on variant */
  confirmLabel?: string;
  /** Optional custom text for the cancel button. Defaults to "Cancel" */
  cancelLabel?: string;
  /** Shows a physical loading state (amber flashing indicator) during async confirmation */
  loading?: boolean;
}
```

---

## 5. Overlay & Dialog Transition Architecture

*   **Modal Overlay**: Fills viewport with `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md`.
*   **Framer Motion Transitions**:
    *   *Overlay*: Fades in (`opacity: [0, 1]`) and out.
    *   *Console Dialog*: Enters from center scaling up with spring physics:
        ```typescript
        initial={{ scale: 0.90, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 350, damping: 24 }}
        ```
    *   *Backdrop Click Physics*: If the user clicks the overlay instead of closing, a spring shake/wiggle animates the chassis on the X axis to indicate modal focus.

---

## 6. Self-Review & Integrity
*   No placeholder code or `TODO` annotations.
*   Compatible with Next.js App Router (uses `"use client"` directives where necessary).
*   Uses `cn` utility for clean Tailwind class merging.
