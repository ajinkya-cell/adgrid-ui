# Package Context: `@adgrid-ui/ui`

> **Location**: `packages/ui/`  
> **Package Name**: `@adgrid-ui/ui`  
> **Version**: `0.1.0`  
> **Role**: Core Dark-First React UI & Animation Component Library  

---

## 1. Overview & Purpose

`@adgrid-ui/ui` is a high-fidelity, dark-first UI component library built for modern React applications. It emphasizes tactile skeuomorphism, advanced motion physics (Matter.js), GPU-accelerated shader backgrounds (WebGL), interactive audio feedback (Web Audio API), smooth scrolling (Lenis + GSAP), and precision typography.

---

## 2. Package Architecture & Tooling

### Package Configuration (`package.json`)
* **Bundle Engine**: `tsup` targeting dual module formats (`dist/index.js` for CJS, `dist/index.mjs` for ESM, with `dist/index.d.ts` type declarations).
* **Styles Export**: Exposed at `@adgrid-ui/ui/styles` (`./src/styles/globals.css`).
* **Scripts**:
  * `pnpm --filter @adgrid-ui/ui build` — Compiles TypeScript via `tsup`.
  * `pnpm --filter @adgrid-ui/ui dev` — Runs `tsup --watch`.
  * `pnpm --filter @adgrid-ui/ui typecheck` — Runs `tsc --noEmit`.

### Key Dependencies
* **Animation & Physics**: `framer-motion` (>=11), `gsap` (>=3), `matter-js` (>=0.19), `lenis` (>=1.3)
* **Visuals & 3D**: `cobe` (3D interactive globe), `d3-geo`, `d3-geo-projection`, `world-atlas`, `topojson-client`
* **Icons**: `lucide-react`, `@tabler/icons-react`, `devicons-react`, `react-icons`
* **Class Utilities**: `clsx`, `tailwind-merge` (wrapped in `src/lib/utils.ts` as `cn()`)

---

## 3. Directory Layout

```
packages/ui/
├── package.json
├── tsup.config.ts
├── tsconfig.json
└── src/
    ├── index.ts                      # Main barrel export file (exports all components & types)
    ├── lib/
    │   └── utils.ts                  # cn() class merging utility
    ├── styles/
    │   └── globals.css               # Base dark mode styles & CSS variables
    ├── matrix/                       # DotMatrix programmable LED subsystem
    │   ├── DotMatrix.tsx
    │   ├── font.ts
    │   └── types.ts
    ├── backgrounds/                  # WebGL & Canvas animated backgrounds
    │   ├── BreathingBackground.tsx
    │   ├── BreathingGrid.tsx
    │   ├── FloatingEmbers.tsx
    │   ├── LuminaWave.tsx
    │   ├── MatrixRain.tsx
    │   ├── PixelMelt.tsx
    │   └── SpotlightGrid.tsx
    └── animated/                     # Main component catalog (~50+ component files)
        ├── coverflow/                # 3D Coverflow carousel
        ├── expand-on-hover/          # Multi-variant hover expansion cards
        ├── scrollpath/               # SVG path drawing scroll tracker
        ├── scrollprogress/           # Vertical scroll progress indicators
        ├── spotlight-text/           # Cursor-following radial spotlight text
        ├── text-shuffle/             # Hacker / matrix style character scrambler
        ├── AnisotropicKnob.tsx       # Metallic rotary audio dial
        ├── BentoGrid.tsx             # 3D skeuomorphic bento grid
        ├── BevelAccordion.tsx        # Beveled edge animated accordion
        ├── BevelAlertDialog.tsx      # Modal alert dialog with beveled aesthetic
        ├── BreathingScaleCard.tsx    # Card scaling with breathing pulse
        ├── BrushedTitaniumButton.tsx # Machined metal luxury button
        ├── ButtonAlpha.tsx           # Minimal glowing tactile button
        ├── Cards.tsx                 # Fanned editorial card deck
        ├── CardsTwo.tsx              # 3D orbital card carousel
        ├── ChromeInput.tsx           # Machined metallic dark input
        ├── ChromeSelect.tsx          # Machined select dropdown
        ├── CommandPalette.tsx        # Holographic command palette (Kbar style)
        ├── DashedFeatureCard.tsx     # Tech grid dashed border feature card
        ├── DashedMarquee.tsx         # Infinite scrolling dashed marquee
        ├── Datepicker.tsx            # Dark calendar date picker
        ├── DeveloperIdCard.tsx       # Cyberpunk developer badge with QR/socials
        ├── DotPattern.tsx            # SVG dot matrix pattern
        ├── DotPatternPlayground.tsx  # Dot matrix playground controls
        ├── FlickeringGrid.tsx        # Canvas flickering grid
        ├── FlickeringGridPlayground.tsx
        ├── ForgeUILanding.tsx        # Complete landing template
        ├── GithubHeatmap.tsx         # Interactive activity contribution heatmap
        ├── Globe.tsx                 # 3D interactive wireframe globe (COBE)
        ├── GravityCardStack.tsx      # Rigid-body card stack physics (Matter.js)
        ├── GuillocheButton.tsx       # Luxury watch guilloché rosette button
        ├── Hero.tsx                  # Minimalist hero section with badges & CTAs
        ├── ImageParallax.tsx         # Multi-depth mouse move parallax
        ├── ImageReveal.tsx           # Diagonal stripe reveal transition
        ├── InfiniteScroll.tsx        # GSAP + Lenis infinite smooth scroller
        ├── LaserVaultPassword.tsx    # Tactile security keypad with laser feedback
        ├── LiquidGoldButton.tsx      # Conic gradient rotating gold button
        ├── LivingText.tsx            # Cursor proximity responsive typography
        ├── LuxuryButtons.tsx         # Luxury button showcase
        ├── Marquee2.tsx              # High-performance CSS/Framer marquee
        ├── MechanicalTimer.tsx       # Web Audio ticking mechanical countdown
        ├── MetallicForm.tsx          # Brushed metal form inputs
        ├── Meter.tsx                 # Analog needle & sentiment arc meter
        ├── MoonLanding.tsx           # Celestial dark landing layout
        ├── MorphingNav.tsx           # Dynamic SVG path morphing navbar
        ├── NavBar1.tsx               # Minimal floating glass navigation bar
        ├── NamesLanding.tsx          # Constellation catalog landing
        ├── NowPlayingCard.tsx        # Last.fm vinyl disc player card
        ├── OTPInput.tsx              # Glowing segment OTP verification input
        ├── PookieForm.tsx            # Industrial stamped plate form
        ├── PremiumHero.tsx           # 3D floating cards hero section
        ├── RaysLanding.tsx           # Volumetric god-rays landing layout
        ├── Sidebar.tsx               # Collapsible dark glass sidebar
        ├── SimpleCard.tsx            # Clean dark border card
        ├── StickerCard.tsx           # Peelable metallic sticker card
        ├── Switch.tsx                # Machined mechanical rocker toggle switch
        ├── Tooltip.tsx               # Magnetic hologram hover tooltip
        ├── VoidButton.tsx            # Signature black hole luxury button
        └── WeaponWheel.tsx           # Radial weapon select wheel
```

---

## 4. Component Catalog by Category

### A. Animated & Motion Elements
1. **`GravityCardStack`**: Matter.js rigid-body 2D physics engine. Cards fall, bounce, collide, and can be dragged or thrown with inertia.
2. **`InfiniteScroll`**: Infinite smooth scroll engine integrating Lenis smooth scrolling with GSAP ticker loops.
3. **`CoverflowCarousel`**: 3D perspective carousel supporting cover flow rotation, keyboard navigation, and swipe gestures.
4. **`CardsTwo` (3D Orbit Ring)**: Rotating 3D carousel arranging cards in an interactive cylindrical orbit.
5. **`ImageReveal`**: Diagonal stripe masking animation revealing images on viewport entry or hover.
6. **`ImageParallax`**: Multi-layer depth parallax driven by mouse position and scroll velocity.
7. **`LivingText`**: Typography whose characters dynamically react, scale, and adjust font-variation settings based on cursor proximity.
8. **`SpotlightText`**: Text masked with a real-time radial spotlight glow following pointer coordinates.
9. **`TextShuffle`**: Scrambles characters into random glyphs and resolves into final text with audio-visual cyberpunk flavor.
10. **`ScrollPath*`** (`ScrollPathContainer`, `ScrollPathWaves`, `ScrollPathCircuit`, `ScrollPathProcess`): SVG paths that draw themselves synchronously as the user scrolls down the page.
11. **`WeaponWheel`**: GTA/Cyberpunk style radial selection wheel with sound cues and slice highlighting.
12. **`Globe`**: Lightweight WebGL 3D globe powered by `cobe` with auto-rotation, pinpoint markers, and drag interactions.

### B. Luxury Buttons
1. **`VoidButton`**: Signature deep-black button with gold particle reveals, hairline metallic borders, and subtle ambient shadows.
2. **`BrushedTitaniumButton`**: Anisotropic brushed metal texture with dynamic specular highlights responding to mouse movement.
3. **`LiquidGoldButton`**: Dynamic rotating conic gradient creating a molten gold border sweep.
4. **`GuillocheButton`**: Intricate geometric watch-dial guilloché engraving patterns on a luxury button surface.
5. **`ButtonAlpha`**: High-contrast minimal pill button with glass refraction and tactile depression physics.

### C. Backgrounds & Shaders
1. **`PixelMelt`**: Interactive canvas grid of glowing pixels that dissolve, melt, and react to pointer movement.
2. **`BreathingGrid` & `BreathingBackground`**: Orthogonal pulsing wave grid creating a rhythmic dark space aesthetic.
3. **`FloatingEmbers`**: High-performance canvas particle system simulating floating luminous embers in zero gravity.
4. **`SpotlightGrid`**: Dark grid with dual cursor-following spotlight shaders and ambient illumination.
5. **`LuminaWave`**: Fullscreen WebGL aurora wave simulation using custom vertex and fragment shaders.
6. **`MatrixRain`**: Classic phosphor green digital rain terminal background.

### D. Skeuomorphic & Machined Primitives
1. **`AnisotropicKnob`**: Continuous rotary dial with brushed metal texture, angular constraints, and rotation tracking.
2. **`ChromeInput` & `ChromeSelect`**: Machined metal input fields with subtle inner shadows, hairline borders, and neon glow focus states.
3. **`Switch`**: Tactile mechanical rocker switch with spring easing and audible click simulation.
4. **`OTPInput` / `LaserVaultPassword`**: Security keypad and segmented OTP code inputs with laser scanning animations.
5. **`Meter`**: Analog precision meter with needle deflection, sentiment scoring, and gradient arcs.
6. **`Tooltip`**: Magnetic holographic tooltip with proximity latching.

### E. Cards, Forms & Widgets
1. **`MechanicalTimer`**: Vintage countdown timer with spring animations and Web Audio synthetic mechanical ticking clicks.
2. **`NowPlayingCard`**: Last.fm connected widget displaying currently playing song, spinning vinyl record, and progress bar.
3. **`DeveloperIdCard`**: Cyberpunk developer identity badge featuring barcode, QR code, avatar, and social links.
4. **`GithubHeatmap`**: 52-week activity heatmap with tooltip inspections and contribution level color grading.
5. **`BentoGrid`**: Modular grid system with recessed card borders, glow accents, and responsive layout spans.

---

## 5. Development & Export Guidelines

### Adding New Components
1. Place source code in `packages/ui/src/animated/` or `packages/ui/src/backgrounds/`.
2. Ensure components use the `cn()` utility from `@adgrid-ui/ui` or `./lib/utils` for class merging.
3. Export the component and its prop TypeScript interface in `packages/ui/src/index.ts`.
4. Run `pnpm --filter @adgrid-ui/ui build` to verify type generation and bundling.
