# Stepper Deduplication & Timeline Consolidation Design Specification

**Date:** 2026-09-21  
**Status:** Approved  
**Target:** `packages/ui`, `apps/docs` (Registry, PresentationRenderer)

---

## 1. Overview

The `Stepper` and `Timeline` components in `@adgrid-ui/ui` are currently identical duplicates. Both point to the implementation in `packages/ui/src/animated/Stepper.tsx` where `Timeline` is simply aliased to `Stepper` (`export const Timeline = Stepper;`), and both are registered as duplicate items in `apps/docs/src/registry/index.ts`.

In the documentation and showcase gallery (`apps/docs/src/app/gallery/page.tsx`), `timeline` is actively featured as a curated panoramic showcase component.

The goal is to eliminate this duplication by removing `Stepper` entirely from the codebase while retaining `Timeline` as a dedicated, standalone first-class component.

---

## 2. Architecture & File Changes

### 2.1 Component Refactor (`packages/ui`)
1. **Rename File**: Move `packages/ui/src/animated/Stepper.tsx` to `packages/ui/src/animated/Timeline.tsx`.
2. **Component & Types Definition**:
   - Rename `StepperProps` to `TimelineProps`.
   - Export `StepItem` as `StepItem` (and alias `TimelineItem = StepItem` for clarity).
   - Rename component function `Stepper` to `Timeline`:
     ```typescript
     export function Timeline({
       steps = defaultSteps,
       currentStep: controlledStep,
       defaultStep = 0,
       onStepChange,
       className,
     }: TimelineProps) { ... }
     ```
   - Remove `export const Timeline = Stepper;` alias.
3. **Library Exports (`packages/ui/src/index.ts`)**:
   - Remove `Stepper` and `StepperProps` exports.
   - Update export to:
     ```typescript
     // Circuit Path Timeline Component
     export { Timeline } from "./animated/Timeline";
     export type { TimelineProps, StepItem, TimelineItem } from "./animated/Timeline";
     ```

### 2.2 Documentation & Registry Updates (`apps/docs`)
1. **Registry (`apps/docs/src/registry/index.ts`)**:
   - Delete the `stepper` entry (lines 916–925).
   - Update `timeline` entry (lines 926–935) to point to `animated/Timeline.tsx`:
     ```typescript
     packagePath: "animated/Timeline.tsx",
     files: ["animated/Timeline.tsx"],
     ```
2. **Presentation Renderer (`apps/docs/src/components/presentation/PresentationRenderer.tsx`)**:
   - Replace import `{ Stepper }` with `{ Timeline }` from `@adgrid-ui/ui`.
   - Remove `case "stepper":`.
   - Rename `StepperDemo` to `TimelineDemo` rendering `<Timeline />`.
   - In `case "timeline":`, return `<TimelineDemo />`.
3. **Gallery Route (`apps/docs/src/app/gallery/page.tsx`)**:
   - Retains `timeline` in `PRIORITY_INTERACTIVE_SLUGS` and responsive span rules; no edits required.

---

## 3. Verification Plan

1. **Static Analysis & Build Verification**:
   - Run `pnpm run build` to verify `@adgrid-ui/ui`, `void-ui`, and `docs` build without errors or type issues.
2. **Codebase Grep**:
   - Verify zero remaining references to `Stepper` or `stepper` in active TypeScript/TSX code files.
3. **Presentation & Gallery Route**:
   - Verify `/present/timeline` and `/gallery` render the `Timeline` component correctly.
