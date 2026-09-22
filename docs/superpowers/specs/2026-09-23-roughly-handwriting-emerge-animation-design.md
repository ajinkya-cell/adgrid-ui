# Roughly Handwriting Emerge Animation Design

**Date:** 2026-09-23  
**Status:** Approved for specification review  
**Topic:** Add a selectable “emerge” entrance animation for Handwriting

## 1. Goal

Add a public animation mode for the Handwriting annotation that preserves the existing stroke-drawing animation and introduces a second effect where text materializes from near-zero thickness into its full glyph shape.

The new mode must be selectable in the Roughly playground and represented accurately in generated JSX snippets.

## 2. Scope

### In scope

- Add a typed Handwriting animation mode: `"draw" | "emerge"`.
- Preserve `"draw"` as the default for backward compatibility.
- Add the mode to `RoughHandwritingProps`.
- Add and forward the mode through `RoughlyProps` when `type="handwriting"`.
- Add Draw/Emerge controls to the Handwriting section of the Roughly playground.
- Implement Emerge using per-glyph vertical expansion plus an SVG mask that reveals each glyph from its edges.
- Preserve existing per-character staggering, animation duration, delay, viewport triggering, font-size behavior, editable mode, and replay behavior.
- Include the selected non-default mode in generated snippets.

### Out of scope

- No changes to non-handwriting annotation animations.
- No replacement of the existing Draw animation.
- No separate animation speed control.
- No changes to font loading or glyph path generation.
- No external animation dependency.

## 3. Public API

Define and export:

```ts
export type HandwritingAnimation = "draw" | "emerge";
```

Extend `RoughHandwritingProps`:

```ts
/** Entrance animation: 'draw' traces the glyph path; 'emerge' materializes it from near-zero thickness. */
animation?: HandwritingAnimation;
```

The component defaults to `animation = "draw"`.

Extend `RoughlyProps` with the same typed property and forward it only in the `type="handwriting"` branch. Existing consumers that omit the prop must retain the current Draw behavior.

## 4. Animation Behavior

### Draw mode

Keep the existing behavior:

- Per-glyph `pathLength` progresses from `0` to `1`.
- Stroke and fill opacity follow the current timing.
- Character staggering remains based on glyph order and `animationDuration`.

### Emerge mode

For each non-space glyph:

- Render the existing glyph path with a unique mask identifier based on the component instance ID and glyph index.
- Start the glyph at `scaleY: 0.01` and expand to `scaleY: 1`.
- Use `transformOrigin: "center"` so the glyph grows from its horizontal centerline.
- Animate the mask’s visible region from a very narrow vertical band to the full glyph bounds, creating an edge-based reveal.
- Animate opacity/fill from hidden to visible in sync with the expansion.
- Preserve the existing per-glyph stagger and duration calculations.

The SVG mask must not use globally fixed IDs, preventing collisions when multiple instances render together.

When `animate` is false, both modes render fully visible immediately. When the component is not in view, both modes remain hidden until the existing intersection observer marks them visible.

## 5. Playground UX

Inside the existing Handwriting settings panel, add an `Animation` control with two options:

- **Draw** — existing path-tracing behavior.
- **Emerge** — combined thickness expansion and edge reveal.

The control is visible only when Handwriting is selected. Selecting a mode immediately remounts/restarts the Handwriting preview so the correct initial state is visible.

The current playground default remains Draw.

## 6. Generated Snippets

The Handwriting snippet generator will include `animation="emerge"` when Emerge is selected. Draw remains implicit to keep the default snippet concise:

```tsx
<Roughly
  type="handwriting"
  fontSize={44}
  animation="emerge"
>
  Interfaces with visceral depth
</Roughly>
```

No animation prop is emitted for non-handwriting annotations.

## 7. Component Boundaries and Data Flow

1. `RoughHandwriting` owns animation rendering because it has the glyph paths, SVG bounds, and animation timing.
2. `Roughly` acts only as the public dispatcher and forwards the typed mode.
3. `RoughlyPage` owns playground selection state and generated-snippet state.
4. The preview key includes the selected mode, font, font size, and other existing replay inputs so mode switches restart cleanly.
5. Mask IDs are derived from the component’s React instance ID and glyph index.

No shared animation helper is required unless the existing Draw/Emerge branches become difficult to read; the implementation should remain local to the focused component.

## 8. Error Handling and Accessibility

- The typed union and default value prevent omitted values from changing behavior.
- The playground buttons use existing labeled controls and keyboard-accessible buttons.
- SVG masks are implementation details and do not add interactive content.
- If an SVG mask cannot render due to a browser limitation, the glyph remains structurally present and the component should not throw; however, the implementation should use standard SVG mask attributes compatible with the project’s existing browser targets.

## 9. Verification Plan

### Automated checks

- Run `pnpm --filter docs build`.
- Confirm TypeScript checks the new exported type, props, dispatcher forwarding, and playground state.
- Run the repository’s narrowest available lint check if practical.

### Manual checks

1. Select Handwriting and verify Draw remains the default.
2. Select Emerge and verify glyphs begin near zero thickness and materialize from their edges.
3. Confirm per-character staggering remains visible and smooth.
4. Switch between Draw and Emerge and verify each selection restarts the entrance animation.
5. Change font family and font size in Emerge mode; verify masks and transforms remain aligned.
6. Verify editable mode, replay, viewport entry, and `animate={false}` still work.
7. Verify the generated snippet includes `animation="emerge"` only for Emerge.
8. Switch through all non-handwriting types and confirm their controls and output are unchanged.

