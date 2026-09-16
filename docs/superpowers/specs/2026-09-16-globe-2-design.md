# Globe 2 (Minimal 3D WebGL Globe) Design Specification

**Date:** 2026-09-16  
**Status:** Approved  
**Target:** `packages/ui`, `apps/docs`

---

## 1. Overview

The goal is to create **Globe 2** (`Globe2`), an aesthetic, minimalist 3D WebGL globe component powered by `@react-three/fiber`, `@react-three/drei`, and `three`.

Unlike the existing 2D-canvas based `Globe` (powered by `cobe`), `Globe2` provides:
- True 3D spatial geometry with `sphereGeometry` and real-time physical lighting.
- High-end dark aesthetic: deep matte slate/obsidian sphere surface with subtle continental elevation.
- Dual-light cinematic illumination (warm key light + cool ambient back rim fill light).
- A soft atmospheric halo / glow ring that wraps the edge of the sphere against pure dark backgrounds.
- Damped user interaction via `OrbitControls` with smooth continuous idle rotation.
- Reusable, flexible layout sizing (`w-full h-full` or container-driven dimensions) with props for styling and behavior customization.

---

## 2. Architecture & Dependencies

### 2.1 Dependencies
Install the required Three.js ecosystem packages in `packages/ui` (and `apps/docs`):
- `three`: Core 3D engine.
- `@types/three`: TypeScript definitions.
- `@react-three/fiber`: React reconciler for Three.js.
- `@react-three/drei`: Helper utilities (`OrbitControls`, texture loaders).

### 2.2 Texture Strategy
- Primary asset: `apps/docs/public/earth-bump.png` providing crisp continental relief.
- Standalone fallback: An embedded procedural/data-URI texture or procedural geometry fallback within `Globe2` so the component remains 100% resilient when copied into standalone projects that lack external public assets.

---

## 3. Component Design (`packages/ui/src/animated/Globe2.tsx`)

### 3.1 Component Props Interface
```typescript
export interface Globe2Props {
  /** Globe sphere base color (hex or CSS color) */
  color?: string; // default: "#182232"
  /** Surface roughness factor (0: glossy, 1: matte) */
  roughness?: number; // default: 0.75
  /** Surface metalness factor (0: dielectric, 1: metallic) */
  metalness?: number; // default: 0.12
  /** Bump map elevation intensity */
  bumpScale?: number; // default: 0.06
  /** Atmospheric halo glow color */
  atmosphereColor?: string; // default: "#38bdf8"
  /** Whether to render the outer atmospheric glow ring */
  showAtmosphere?: boolean; // default: true
  /** URL to earth bump map texture */
  bumpMapUrl?: string; // default: "/earth-bump.png"
  /** Enable automatic idle spin */
  autoRotate?: boolean; // default: true
  /** Speed of auto rotation per frame */
  rotationSpeed?: number; // default: 0.0015
  /** Allow mouse drag orbit controls */
  interactive?: boolean; // default: true
  /** Allow scroll wheel / pinch zoom */
  enableZoom?: boolean; // default: true
  /** Minimum camera zoom distance */
  minDistance?: number; // default: 3.5
  /** Maximum camera zoom distance */
  maxDistance?: number; // default: 10
  /** Camera field of view */
  fov?: number; // default: 45
  /** Background canvas color or transparent */
  backgroundColor?: string; // default: "transparent"
  /** Container CSS class name */
  className?: string;
  /** Container CSS inline styles */
  style?: React.CSSProperties;
}
```

### 3.2 3D Scene Architecture
1. **Canvas Shell**:
   - `Canvas` with perspective camera at `[0, 0, 5.5]` and `fov: 45`.
   - `gl={{ antialias: true, alpha: true }}` for transparent integration with dark UI canvas backdrops.
2. **Atmosphere Halo**:
   - Concentric outer sphere (`args={[2.08, 64, 64]}`) with `THREE.BackSide` rendering or soft additive blending.
   - Creates a faint cyan/ice-blue glow silhouette around the perimeter of the globe.
3. **Lighting Rig**:
   - `ambientLight intensity={0.3}`
   - `directionalLight position={[5, 4, 5]} intensity={1.8} castShadow` (Key warm-neutral light)
   - `directionalLight position={[-5, -2, -4]} intensity={0.4} color="#60a5fa"` (Cool rim fill light)
4. **Interactive Controls**:
   - `<OrbitControls>` with damping enabled (`dampingFactor={0.05}`), `enablePan={false}`, and zoom clamps.

---

## 4. Integration into Registry & Showcase

### 4.1 Export from `@adgrid-ui/ui`
Add export in `packages/ui/src/index.ts`:
```typescript
export { Globe2 } from "./animated/Globe2";
export type { Globe2Props } from "./animated/Globe2";
```

### 4.2 Documentation & Registry (`apps/docs/src/registry/index.ts`)
Add `globe-2` entry:
- `name`: `"Globe 2"`
- `slug`: `"globe-2"`
- `category`: `"animated"`
- `description`: `"A minimal 3D WebGL globe powered by Three.js and React Three Fiber with realistic surface bump texture, cinematic rim lighting, atmospheric halo, and smooth orbit controls."`
- `dependencies`: `["three", "@react-three/fiber", "@react-three/drei"]`
- `packagePath`: `"animated/Globe2.tsx"`
- `presentationStrategy`: `"center"`
- `propDefs`:
  - `color` (color picker / select, default: `"#182232"`)
  - `roughness` (number slider: `0.1` to `1.0`, step `0.05`, default: `0.75`)
  - `metalness` (number slider: `0` to `1.0`, step `0.05`, default: `0.12`)
  - `bumpScale` (number slider: `0` to `0.2`, step `0.01`, default: `0.06`)
  - `rotationSpeed` (number slider: `0` to `0.01`, step `0.0005`, default: `0.0015`)
  - `autoRotate` (boolean toggle, default: `true`)
  - `showAtmosphere` (boolean toggle, default: `true`)

### 4.3 Presentation Showcase (`PresentationRenderer.tsx`)
Render `<Globe2 {...liveProps} />` inside a balanced container (`w-[420px] h-[420px] sm:w-[500px] sm:h-[500px]`).

---

## 5. Verification Plan

1. **Type & Compilation Check**:
   - Run `pnpm --filter @adgrid-ui/ui typecheck`
   - Run `pnpm --filter docs exec tsc --noEmit`
2. **Build Verification**:
   - Run `pnpm --filter @adgrid-ui/ui build`
   - Run `pnpm --filter docs build:registry`
3. **Runtime & Aesthetic Verification**:
   - Open `/present/animated/globe-2` in browser.
   - Verify smooth idle rotation and interactive drag orbit.
   - Verify atmospheric glow ring against dark background.
   - Verify tweaking props in PropsTweaker reflects in real time.
