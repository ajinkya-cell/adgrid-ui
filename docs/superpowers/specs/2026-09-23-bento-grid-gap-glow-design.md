# Bento Grid Gap Glow Design

## Goal

Replace the card-by-card hover drop shadows in `BentoGrid` with a soft pointer-reactive light that appears in the negative space between cards. The glow should read as if it comes from the gutters around the hovered card.

## Design

The grid owns one glow layer positioned behind its cards. When the pointer moves over a card, the grid tracks the pointer position relative to the grid and uses it as the center of a soft radial light. Cards remain above the glow and retain their existing surfaces, so the light is visible through the gaps and not painted over card content. Fade the glow out when the pointer leaves the grid.

Remove hover drop shadows from the beveled, radiant, and edge-light variants so the shared gap glow becomes the hover response. Preserve the existing card fills, borders, bevel details, radiant interior spotlight, edge treatment, hover icon behavior, layout, and public props.

## Interaction and accessibility

- Keep the glow layer non-interactive so it does not intercept pointer input.
- Honor reduced-motion preferences by disabling or shortening the glow transition.
- Keep the grid usable on touch devices; the glow is a pointer-hover enhancement and must not affect layout or content.

## Scope

Modify `packages/ui/src/animated/BentoGrid.tsx`. No new dependency, public API, layout change, or unrelated documentation update is needed. The published registry copy should be refreshed if the repository's existing component workflow requires it.

## Review criteria

- Hovering any card reveals a soft light through nearby gaps, with its position following the pointer.
- The glow fades when leaving the grid.
- Hovering cards no longer produces the current drop-shadow emphasis.
- Existing card content, variants, and responsive layout remain intact.
- Reduced-motion preferences are respected.
