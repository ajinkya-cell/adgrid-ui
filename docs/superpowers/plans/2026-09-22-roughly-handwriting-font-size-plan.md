# Implementation Plan: Roughly Handwriting Font Size Control

**Target Component**: [`apps/docs/src/app/roughly/page.tsx`](../../apps/docs/src/app/roughly/page.tsx)  
**Spec Reference**: [`docs/superpowers/specs/2026-09-22-roughly-handwriting-font-size-design.md`](../specs/2026-09-22-roughly-handwriting-font-size-design.md)

## Task 1: Add Handwriting Font Size Playground State and Snippet Wiring

- [x] Add `handwritingFontSize` state next to the existing Handwriting settings.
- [x] Initialize it to `44` so the existing preview remains visually unchanged.
- [x] In the Handwriting branch of `generateSnippet()`, always add `fontSize={handwritingFontSize}` because the playground’s default preview is `44px`, while the component’s own default is `40px`; omitting the prop would produce an inaccurate snippet.
- [x] Ensure the generated snippet reads the same state used by the live preview and does not add `fontSize` to other annotation snippets.

## Task 2: Add the Handwriting-Only Font Size Slider

- [x] Add a labeled range input inside the existing `selectedType === "handwriting"` settings panel.
- [x] Configure the input with `min={24}`, `max={96}`, `step={1}`, and `value={handwritingFontSize}`.
- [x] Update the state with a numeric value from the range input.
- [x] Display the current value with a `px` suffix.
- [x] Preserve accessible labeling and existing panel styling/spacing.
- [x] Keep the slider hidden for every non-handwriting annotation type.

## Task 3: Apply the Selected Size to the Live Preview

- [x] Replace the hard-coded `fontSize={44}` on the live `RoughHandwriting` preview with `fontSize={handwritingFontSize}`.
- [x] Leave the preview key unchanged; `RoughHandwriting` recomputes its paths from the `fontSize` prop without a remount.
- [x] Verify through the successful production build that the selected size is passed through the preview path without type errors.

## Task 4: Validate the Playground and Existing API Behavior

- [x] Run `pnpm --filter docs build` to verify the docs page and generated JSX compile successfully.
- [x] Confirm the slider bounds, default, preview binding, and snippet wiring in the source.
- [x] Confirm the generated Handwriting snippet contains the selected `fontSize` value.
- [x] Confirm non-handwriting branches do not read or emit the Handwriting size state.
