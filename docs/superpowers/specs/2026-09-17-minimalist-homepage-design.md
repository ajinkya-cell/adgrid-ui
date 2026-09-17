# Minimalist Homepage Specification (Void UI First - benji.org Style)

**Date:** 2026-09-17  
**Status:** Approved  
**Target:** `apps/docs/src/app/page.tsx`

---

## 1. Overview & Aesthetics

The goal is to structure the Void UI landing page (`apps/docs/src/app/page.tsx`) following the editorial minimalism of [benji.org](https://benji.org/). 

Crucially, **Void UI is introduced first** as the primary project and subject of the site, followed by **the creator's introduction ("I am Ajinkya...")**, the component directory, technical stack, and personal setup/tools.

### Visual Tenets
- **Typography-First**: Refined type hierarchy with generous vertical rhythm and whitespace.
- **Pure Dark Void**: Solid `#09090b` canvas with crisp neutral text hierarchy (`text-white`, `text-neutral-300`, `text-neutral-500`).
- **Editorial Hyperlinks**: Subtle, responsive inline links with underline transitions.
- **Structured Row Lists**: Clean two-column list items with title on the left and metadata/tag on the right, matching benji.org's writing/project list format.
- **Reading Container**: Centered column clamped to `max-w-[640px]`.

---

## 2. Content Architecture

### 2.1 Header Block
- **Primary Title**: `Void UI`
- **Metadata**: `An open-source interface ecosystem for tactile, dark-mode software • Created by Ajinkya Adharkar • Updated Sep 2026`

### 2.2 Section 1: About Void UI (First Prose Block)
- **What it is**: An open-source React component ecosystem engineered for tactile friction, dark-first skeuomorphism, precision physics, WebGL shaders, and audio synthesis.
- **Why it exists**: Rejecting sterile flat digital surfaces in favor of tactile depth, weighted mechanical resistance, and sensory interfaces that feel tangible.
- **Direct Links**:
  - Direct link to [`/gallery`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/gallery) ("Explore the collection")
  - Direct link to the [GitHub repository](https://github.com/ajinkya-cell/adgrid-ui) (`adgrid-ui`)

### 2.3 Section 2: About the Creator ("About Me")
- **Heading**: `About the Creator`
- **Introduction**: Starts directly with:
  > *"I am Ajinkya, a design engineer crafting high-friction digital interfaces, physical skeuomorphism, and dark-first micro-interactions."*
- **Background & Mission**: Exploring sensory depth, weighted mechanical haptics, and physics-based interactions.
- **Contact & Profiles**:
  - [GitHub Profile](https://github.com/ajinkya-cell)
  - [Email](mailto:ajinkyaadharkar@gmail.com)

### 2.4 Section 3: Featured Components
- Clean 2-column list layout with link on left and engineering tag on right:
  1. **Bento Grid** (`/present/animated/bento-grid`) — `Skeuomorphic 3D`
  2. **Meter Gauge** (`/present/animated/meter`) — `Precision Motion`
  3. **Coverflow Carousel** (`/present/animated/coverflow-carousel`) — `3D Perspective`
  4. **Spotlight Text** (`/present/animated/spotlight-text`) — `Interactive Shader`
  5. **Void Button** (`/present/buttons/void-button`) — `Micro-haptics`
  6. **Wheel Picker** (`/present/animated/wheel-picker`) — `Web Audio Synthesis`
  7. **Image Reveal** (`/present/animated/image-reveal`) — `Scroll Depth`
  8. **Living Text** (`/present/animated/living-text`) — `Kinetic Typography`
- Header row with `View all 62 →` linking to `/gallery`.

### 2.5 Section 4: Technologies & Stack
- Two-column list mapping framework/tool to purpose:
  1. **Next.js 15+** — `App Router, SSR & Turbopack`
  2. **React 19** — `Concurrent features & Server Components`
  3. **Tailwind CSS v4** — `High-performance modern utility engine`
  4. **Framer Motion** — `Spring physics & gesture orchestrations`
  5. **Three.js & R3F** — `Hardware-accelerated 3D WebGL scenes`
  6. **TypeScript** — `Strict end-to-end interface definitions`
  7. **Web Audio API** — `Synthesized mechanical tick haptics`
  8. **Shiki & Sandpack** — `Live code studio & dual-theme syntax highlighting`

### 2.6 Section 5: What I Use (Uses)
- Two-column list mapping setup category to items:
  1. **Editor** — `Cursor & VS Code`
  2. **Design** — `Figma`
  3. **Terminal** — `Warp & PowerShell`
  4. **Hardware** — `MacBook Pro & Custom Rig`
  5. **Peripherals** — `Keychron Mechanical Keyboard & Logitech MX Master`
  6. **Typography** — `Geist, Inter & JetBrains Mono`

### 2.7 Footer
- Clean divider with:
  - Left: `Void UI • adgrid-ui`
  - Right: `Open source MIT license`

---

## 3. Implementation Details

- Target file: `apps/docs/src/app/page.tsx`
- Layout styling:
  - Container: `min-h-screen bg-[#09090b] text-neutral-300 selection:bg-white selection:text-black pt-28 sm:pt-36 pb-24 px-6 sm:px-8 flex justify-center`
  - Inner wrapper: `w-full max-w-[640px] space-y-16 sm:space-y-20`
  - Inline links: `text-white underline underline-offset-4 decoration-white/25 hover:decoration-white transition-colors`
  - Section headers: `text-xs font-mono uppercase tracking-widest text-neutral-400 border-b border-white/[0.08] pb-2`
