# Pixel Grid Design

## Goal

Add a reusable `PixelGrid` component for displaying and editing pixel-art grids. The component supports a read-only display mode and an editable mode in the same API.

## Scope

- Use Tailwind classes for styling.
- Use Framer Motion for motion.
- Ship as part of `@adgrid-ui/ui`.
- Add registry metadata so the component can be installed through the existing registry.
- Add a present-section preview with editable sample artwork.

## Component API

`PixelGrid` accepts an optional controlled `value`, an optional `defaultValue`, `rows`, `columns`, a palette, `editable`, and `onChange`. Cells store palette ids or `null` for empty cells. The default palette is monochrome so the component works for black-and-white pixel art without setup.

## Editing

Editable mode includes paint, erase, fill, selection, brush size, clear, undo, redo, and palette selection. Pointer dragging paints continuously. Right-click temporarily erases. Selection mode draws a rectangular selection and allows clearing the selected area.

## Rendering

V1 uses a DOM grid because direct cell interaction and library previews are the priority. The data model stays renderer-agnostic so a canvas renderer can be added later for very large grids.

## Motion

Motion is restrained. Framer Motion is used for toolbar/state feedback and small cell activation changes. High-frequency painting avoids heavy animation. Reduced-motion users receive instant state changes.

## Testing

Validate TypeScript build and docs registry generation. The presentation route should resolve from the registry and render the editable preview through the manual renderer case.
