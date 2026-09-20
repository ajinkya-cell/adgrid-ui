# Roughly Hero Full-Screen Desktop Experience Design

## 1. Overview
The `/roughly` page hero section will be transformed into an immersive full-screen desktop experience (`min-h-screen`), featuring the custom hand-drawn preview illustration (`/previews/roughly.png`) as its backdrop. The interactive playground and subsequent sections will be placed below the fold, visible only when the user scrolls down. The "Standalone Extension Suite" pill badge will be removed.

---

## 2. Visual & Structural Architecture

### 2.1 Full-Bleed Hero Scene vs. Bounded Content Container
Previously, the hero section was nested inside the single `max-w-7xl` container:
```tsx
<main className="min-h-screen bg-[#09090b] text-neutral-300 pt-24 sm:pt-32 pb-24 px-4 sm:px-8 flex justify-center">
  <div className="w-full max-w-7xl space-y-16 sm:space-y-20">
    <section> {/* Hero */} </section>
    <section> {/* Interactive Playground */} </section>
    ...
  </div>
</main>
```

Under the new design, the layout is partitioned into two distinct visual tiers:
1. **Tier 1: Full-Screen Hero Scene (`<section className="relative w-full min-h-screen ...">`)**
   - Spans 100% viewport width and at least 100% viewport height (`min-h-screen`).
   - Uses `flex flex-col items-center justify-center` to center the hero typography vertically on desktop screens.
   - Padded at the top (`pt-20 sm:pt-24`) to give clearance for the fixed floating navbar.
   - Padded at the bottom (`pb-16`) to reserve space for the scroll hint indicator.
2. **Tier 2: Main Content Container (`<div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 ...">`)**
   - Houses Section 2 (Interactive Playground), Section 3 (Editorial Typography Demonstration), and Section 4 (API Reference).
   - Starts directly below the hero section fold (`100vh`).

---

## 3. Background Art Integration (`/previews/roughly.png`)

### 3.1 Asset Characteristics
- Location: `apps/docs/public/previews/roughly.png` (~1.35 MB, 1920x1080 16:9 illustration).
- Content: Organic chalk/vector drawings (circles, arrows, brackets, boxes, crosses) framing the outer borders, with an open dark void in the center.

### 3.2 Layering & Contrast Stack
To ensure maximum contrast for the central text, install command, and smooth transition to the rest of the page:
1. **Base Image Layer**:
   ```tsx
   <Image
     src="/previews/roughly.png"
     alt="Roughly Hand-drawn Vector Annotations"
     fill
     priority
     sizes="100vw"
     className="object-cover object-center opacity-75 scale-100 select-none pointer-events-none"
   />
   ```
2. **Vignette & Readability Gradient**:
   - `bg-radial-gradient from-transparent via-[#09090b]/40 to-[#09090b]/80`: Darkens the center slightly behind the title while preserving the clarity of the perimeter illustrations.
3. **Bottom Edge Dissolve**:
   - `bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent`: Height `h-32 sm:h-48`, dissolves the image seamlessly into the `#09090b` page background before the user enters the Interactive Playground.
4. **Top Edge Dissolve**:
   - `bg-gradient-to-b from-[#09090b]/80 to-transparent`: Height `h-20 sm:h-28` to maintain contrast behind the floating navbar.

---

## 4. Content Cleanup & Refinements

### 4.1 Remove "Standalone Extension Suite"
- Remove `<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-400">...<span>Standalone Extension Suite</span></div>`.
- Remove unused `Sparkles` icon import.

### 4.2 Hero Typography & Actions
- **Heading**: Large hand-drawn circled "Roughly" (`text-5xl sm:text-7xl font-bold tracking-tight text-white`).
- **Subtitle**: `text-base sm:text-lg text-neutral-300 max-w-2xl text-center leading-relaxed`.
- **Install Command**: `pnpm add @adgrid-ui/ui` with copy button, styled with backdrop blur (`bg-black/60 backdrop-blur-md border-white/10`).

### 4.3 Scroll Indicator
- Positioned `absolute bottom-8 left-1/2 -translate-x-1/2`.
- Text: `text-[11px] font-mono uppercase tracking-widest text-neutral-400/80` ("Scroll to explore").
- Icon: Animated bouncing `ChevronDown` (`lucide-react`) inviting discovery.

---

## 5. Verification Plan
1. **Desktop Viewport Test**: Verify Hero covers 100vh with no playground peeking above the fold.
2. **Scroll Transition Test**: Verify scrolling down smoothly reveals the 3-column Interactive Studio Playground without visual glitches.
3. **Visual Contrast Test**: Verify all text on hero is crisp and legible over the background image.
4. **Build Test**: Run `pnpm turbo build --filter docs` to confirm zero TypeScript, Turbopack, or asset compilation issues.
