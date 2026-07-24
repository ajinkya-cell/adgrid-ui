# Design Specification: Rays Landing Page Component (`rays-landing`)

## Overview
The `RaysLanding` component is a high-fidelity portfolio landing page component for the `adgrid-ui` library. It replicates the aesthetic of `kanishk.sh`, featured by an overhead WebGL light source emitting dynamic light rays from top-center, paired with frosted liquid-glass navigation, role text cycling animations, and customizable content centered around the name **Ajinkya**.

## Architecture & File Structure

- **UI Component Source**: `packages/ui/src/animated/RaysLanding.tsx`
- **UI Package Exports**: `packages/ui/src/index.ts`
- **Registry Entry**: `apps/docs/src/registry/index.ts`
- **Static Registry JSON**: `apps/docs/public/r/registry.json` & `apps/docs/public/r/rays-landing.json` (generated via `pnpm build:registry`)
- **Presentation Route**: Accessible on doc site via `/present/animated/rays-landing` and `/present/rays-landing`.

## Component Specification

### 1. WebGL Light Rays Engine
A lightweight WebGL canvas renderer integrated directly into the component (using canvas 2D fallback or raw WebGL context initialization) to generate top-down light beams:
- **Shaders**: Custom fragment shader calculating ray intensity based on source anchor position (`top-center`), angular spread, length falloff, noise, and mouse interaction.
- **Interactivity**: Tracks mouse coordinates to subtly tilt ray directions when enabled.
- **Cleanup**: Properly disposes WebGL context and animation frame hooks on unmount or window resize.

### 2. Styling & Visual Effects
- **Liquid Glass Navigation**:
  - Backdrop blur (`backdrop-filter: blur(40px) saturate(180%)`), translucent borders (`border: 1px solid rgba(255, 255, 255, 0.12)`), subtle inset highlights.
  - Active item indicator pill (`liquid-glass-pill`).
  - Mobile bottom floating glass dock for responsive viewports.
- **Role Text Cycler**:
  - CSS keyframe animation cycling through array of roles with fade, blur, and vertical slide transitions.

### 3. Component Props (`RaysLandingProps`)

```typescript
export interface SocialLink {
  name: string;
  url: string;
}

export interface RaysLandingProps {
  name?: string;
  greeting?: string;
  roles?: string[];
  bio?: string;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  followMouse?: boolean;
  projectsUrl?: string;
  contactUrl?: string;
  socialLinks?: SocialLink[];
  className?: string;
}
```

### 4. Registry Integration
The registry metadata in `apps/docs/src/registry/index.ts` will include:
```typescript
{
  name: "Rays Landing",
  slug: "rays-landing",
  category: "animated",
  description: "Interactive landing page showcasing an overhead WebGL light-ray beam background, floating liquid-glass navigation, and role cycler.",
  dependencies: ["lucide-react"],
  packagePath: "animated/RaysLanding.tsx",
  files: ["animated/RaysLanding.tsx"],
  presentationStrategy: "fullscreen",
  propDefs: [ ... ]
}
```

## Verification & Testing Strategy
1. Build UI package: `pnpm --filter @adgrid-ui/ui build` or typecheck.
2. Build registry catalog: `pnpm build:registry` inside `apps/docs`.
3. Verify present route in `apps/docs`.
