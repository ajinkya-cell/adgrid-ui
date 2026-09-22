# Roughly Handwriting Font Size Control Design

**Date:** 2026-09-22  
**Status:** Approved for specification review  
**Topic:** Expose the existing Handwriting `fontSize` prop in the Roughly playground

## 1. Goal

The Roughly playground already supports handwriting font family, stroke width, text length, and editable mode. The Handwriting preview currently uses a hard-coded `fontSize={44}`, so users cannot experiment with the rendered text size.

Add a Handwriting-only slider that controls the existing `fontSize` prop without changing the public component API or the behavior of other Roughly annotation types.

## 2. Scope

### In scope

- Add playground state for handwriting font size.
- Add a visible control in the existing Handwriting settings panel.
- Use a slider range of **24–96 px**, with a step of **1 px**.
- Preserve the current preview size by defaulting the state to **44 px**.
- Pass the selected value to the live `RoughHandwriting` preview.
- Include the selected value in the generated JSX snippet.
- Keep the API reference accurate for the existing `fontSize` prop.

### Out of scope

- No changes to `RoughHandwritingProps`.
- No changes to the `Roughly` dispatcher API.
- No shared size control for non-handwriting annotations.
- No changes to font loading, SVG path generation, animation timing, or editable-mode behavior.
- No custom numeric input; the size is selected through the slider.

## 3. User Experience

When `selectedType === "handwriting"`, the controls panel will show a `Font Size` control alongside the existing Handwriting font-family and interactive-mode controls.

The control will contain:

- An accessible label identifying the setting as Font Size.
- A range input from `24` to `96`.
- A step of `1`.
- A displayed value in pixels, such as `44 px`.

Moving the slider updates the live handwriting preview immediately. The initial value remains `44 px`, preserving the current playground appearance.

The control will not appear for underline, circle, strike-through, cross-off, bracket, highlight, box, or arrow annotations.

## 4. Data Flow and Component Boundaries

The change remains local to the Roughly playground:

1. `RoughlyPage` owns a new `handwritingFontSize` state initialized to `44`.
2. The Handwriting control updates that state from the range input.
3. The live Handwriting preview receives `fontSize={handwritingFontSize}` instead of the current hard-coded value.
4. The snippet generator reads the same state and emits `fontSize={...}` for Handwriting examples.
5. The existing `Roughly` and `RoughHandwriting` prop forwarding remains unchanged.

The state is intentionally separate from `strokeWidth`: stroke width controls the ink outline, while font size controls glyph dimensions.

## 5. Generated Snippet

For a Handwriting selection, the generated JSX must reflect the chosen font size, for example:

```tsx
<Roughly
  type="handwriting"
  font="reenie-beanie"
  fontSize={44}
  strokeWidth={2.5}
  color="#6366F1"
/>
```

The generated snippet must update when the slider changes and must not add `fontSize` to snippets for other annotation types.

## 6. Error Handling and Accessibility

- The range input uses valid numeric bounds and step values, so browser-native range validation is sufficient.
- The displayed value must remain synchronized with the input value.
- The control must have a programmatically associated label.
- Existing keyboard interaction for range inputs must remain available.
- No fallback or silent error behavior is needed because the underlying `fontSize` prop already accepts a number and has an established default.

## 7. Verification Plan

### Automated checks

- Run the smallest existing docs/package type-check or build command that covers the changed playground and UI package.
- Confirm the generated TypeScript/JSX remains valid.

### Manual checks

1. Open the Roughly playground and select Handwriting.
2. Confirm the Font Size slider starts at `44 px`.
3. Move the slider through small, middle, and large values; verify the preview resizes immediately.
4. Switch font families and editable/display modes; verify the selected size remains applied.
5. Copy or inspect the generated snippet and confirm it contains the selected `fontSize` value.
6. Switch to every non-handwriting annotation type; confirm the Handwriting size control is hidden and their snippets are unchanged.
7. Verify keyboard adjustment of the slider and readable label/value presentation.

