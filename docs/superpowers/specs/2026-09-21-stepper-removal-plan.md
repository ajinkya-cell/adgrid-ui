# Implementation Plan: Stepper Deduplication & Timeline Consolidation

**Date:** 2026-09-21  
**Spec Reference:** `docs/superpowers/specs/2026-09-21-stepper-removal-design.md`

---

## Task 1: Refactor Component in `packages/ui`
- Move `packages/ui/src/animated/Stepper.tsx` to `packages/ui/src/animated/Timeline.tsx`.
- In `packages/ui/src/animated/Timeline.tsx`:
  - Rename interface `StepperProps` to `TimelineProps`.
  - Export type `TimelineItem = StepItem;`.
  - Rename component `export function Stepper(...)` to `export function Timeline(...)`.
  - Remove `export const Timeline = Stepper;`.

---

## Task 2: Update Package Exports in `packages/ui`
- File: `packages/ui/src/index.ts`
- Implementation:
  - Replace `export { Stepper, Timeline } from "./animated/Stepper";` with `export { Timeline } from "./animated/Timeline";`.
  - Replace `export type { StepperProps, StepItem } from "./animated/Stepper";` with `export type { TimelineProps, StepItem, TimelineItem } from "./animated/Timeline";`.

---

## Task 3: Update Registry in `apps/docs`
- File: `apps/docs/src/registry/index.ts`
- Implementation:
  - Remove the registry entry with `slug: "stepper"`.
  - Update the registry entry with `slug: "timeline"` so `packagePath: "animated/Timeline.tsx"` and `files: ["animated/Timeline.tsx"]`.

---

## Task 4: Update PresentationRenderer in `apps/docs`
- File: `apps/docs/src/components/presentation/PresentationRenderer.tsx`
- Implementation:
  - Update imports from `@adgrid-ui/ui`: replace `Stepper` with `Timeline`.
  - Remove `case "stepper":`.
  - Rename `StepperDemo()` to `TimelineDemo()`, rendering `<Timeline />`.
  - Update `case "timeline": return <TimelineDemo />;`.

---

## Task 5: Verification & Build
- Verify no remaining references to `Stepper` in active source code.
- Run `pnpm run build` to verify type safety and static page builds across the monorepo.
