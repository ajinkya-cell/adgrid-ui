# Design Spec: StoryTimeline Premium Editorial Polish

This specification outlines the enhancements to transform the `StoryTimeline` component into a high-end, minimal premium editorial showcase (Approach A: Asymmetrical Split Layout with Horizontal Focus).

## 1. Aesthetic Concept & Grid Architecture

- **Visual Tone**: Inspired by contemporary architecture magazines and high-end fashion editorial prints (monochrome, high-contrast, generous whitespace, thin separators).
- **Layout Structure**:
  - **Left Rail (`md:sticky md:w-56 md:top-24`)**: Contains the protocol metadata and sticky timeline navigation controls.
  - **Right Content Column**: Clean, scrollable column offset to the right. Entries have large vertical whitespace gaps (`space-y-40`) to create a breathing, luxurious aesthetic.

## 2. Dynamic Separators (Monochrome Dividers)

- Each section in the right column is bounded by a thin, full-width horizontal divider.
- **Divider Components**:
  - **Base Line**: A subtle, low-opacity horizontal line (`h-[1px] bg-neutral-900 w-full`).
  - **Active Fill Line**: A nested line (`h-[1px] bg-white absolute top-0 left-0`) that scales dynamically from `0%` to `100%` width when the timeline section enters the active scroll-focus viewport (`animate={{ width: isActive ? "100%" : "0%" }}`).
  - **Line Metadata**: Monospaced tags (e.g. `[01 // INI_SEQUENCE]`) positioned directly on top of the separator line in a small font.

## 3. High-Contrast Bold Display Typography

- **Font Pairing**:
  - **Years & Titles**: `font-syncopate` (heavy display sans-serif) with generous letter-spacing (`tracking-[0.2em]`).
  - **Descriptions**: `font-plus-jakarta` (modern geometric sans-serif) with line height `leading-relaxed` for maximum readability.
  - **Metadata & Indicators**: `font-share-mono` for technical timestamps and telemetry status tags.
- **Active Year Transition**:
  - The outline display year in the background (`text-[6rem] md:text-[8rem]`) transitions from an outline-only state (`text-transparent webkit-text-stroke-[1px] webkit-text-stroke-white/10`) to solid white/light grey (`webkit-text-stroke-white/20` and filled) when active.
  - Alternatively, the active year smoothly fills with color or increases opacity using framer-motion transitions.

## 4. Velocity-Based Image Crop-Zoom

- **Image Wrapper**: A thin-bordered, high-contrast container (`border border-neutral-900 bg-neutral-950 aspect-[21/9] overflow-hidden rounded`).
- **Interactive Transform**:
  - The image inside the frame scales and translates slightly based on scroll position/velocity.
  - When the section is active, the image is grayscale-free (`grayscale-0`) and scaled slightly (`scale-[1.05]`).
  - When inactive, the image falls back to grayscale (`grayscale`) with a muted opacity (`opacity-30`) and default scale.

## 5. Navigation Rail Interactions

- The left-side vertical line progress fills smoothly based on scroll progress.
- Dots expand into small concentric rings (active state has a outer ring border).
- Hovering over years on the left rail expands the navigation labels with a micro-fade transition.
