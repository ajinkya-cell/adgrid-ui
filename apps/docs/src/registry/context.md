# Subsystem Context: `apps/docs/src/registry` (Component Registry & Presentation Runtime)

> **Location**: `apps/docs/src/registry/`  
> **Key Files**: `apps/docs/src/registry/index.ts`  
> **Role**: Single Source of Truth for Component Metadata, Prop Controls, and shadcn CLI Distribution  

---

## 1. Overview & Purpose

The Registry Subsystem is the architectural backbone of the Void UI / Adgrid UI ecosystem. It provides a strongly typed metadata repository for all components.

It serves three core consumers:
1. **Gallery & Site Navigation**: Feeds `/gallery` and sidebar navigation with categorized component listings, search terms, and descriptions.
2. **Interactive Presentation Engine**: Provides `propDefs` and `presentationStrategy` to power the live **Props Tweaker** inspector and fullscreen canvas layout in `/present/[category]/[slug]`.
3. **CLI & shadcn API**: Defines the dependency graph and file manifest required by `/r/[name].json` and `/r/registry.json` so `void-ui add <component>` can bundle and install source files into external codebases.

---

## 2. Core TypeScript Schemas

Defined in `apps/docs/src/registry/index.ts`:

### A. `RegistryEntry`
```typescript
export interface RegistryEntry {
  name: string;                   // Display title (e.g., "Gravity Card Stack")
  slug: string;                   // URL slug & CLI identifier (e.g., "gravity-card-stack")
  category: ComponentCategory;    // "animated" | "primitives" | "charts" | "widgets" | "buttons" | "backgrounds"
  description: string;            // Brief summary of design and behavior
  dependencies: string[];         // External npm dependencies (e.g., ["matter-js", "framer-motion"])
  packagePath: string;           // Primary entry file inside packages/ui/src/
  files: string[];               // All associated source files to bundle for CLI export
  propDefs?: PropDefinition[];    // Dynamic schema for the Props Tweaker inspector
  variants?: ComponentVariant[];  // Pre-configured prop presets
  presentationStrategy?: DisplayStrategy; // "fullscreen" | "center" | "cover" | "fit" | "auto"
}
```

### B. `PropDefinition`
Powers the real-time interactive UI controls in the Presentation Studio:
```typescript
export interface PropDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "select" | "color";
  default?: string | number | boolean;
  description: string;
  required: boolean;
  options?: string[];       // Available values when type === "select"
  min?: number;            // Lower bound when type === "number" (renders slider)
  max?: number;            // Upper bound when type === "number" (renders slider)
  step?: number;           // Step increment for number sliders
}
```

### C. `DisplayStrategy`
Instructs the presentation canvas on how to frame the component:
* **`fullscreen`**: Component occupies 100% viewport width and height (used for shader backgrounds, infinite scrollers, full landing pages).
* **`center`**: Component is centered in a container with padding (used for buttons, cards, switches, knobs).
* **`cover`**: Component stretches to fill available card bounds.
* **`fit`** / **`auto`**: Default natural sizing.

---

## 3. How the Registry Interacts with the System

```
                      ┌────────────────────────────────────────┐
                      │    apps/docs/src/registry/index.ts     │
                      │  (Master Component Metadata Catalog)   │
                      └──────────────────┬─────────────────────┘
                                         │
       ┌─────────────────────────────────┼────────────────────────────────┐
       ▼                                 ▼                                ▼
┌──────────────┐         ┌──────────────────────────────┐         ┌──────────────┐
│   /gallery   │         │ /present/[category]/[slug]   │         │ /r/[name].json│
│   Catalog    │         │ (Presentation Engine)        │         │  (CLI API)   │
└──────────────┘         └───────────────┬──────────────┘         └──────┬───────┘
                                         │                               │
                         ┌───────────────┴───────────────┐               ▼
                         ▼                               ▼         ┌─────────────┐
                  ┌──────────────┐                ┌──────────────┐ │ void-ui CLI │
                  │ PropsTweaker │                │ Presentation │ │ (Consumer   │
                  │ (Live Props) │                │   Renderer   │ │  Projects)  │
                  └──────────────┘                └──────────────┘ └─────────────┘
```

---

## 4. Best Practices for Registering New Components

When creating a new component in `packages/ui/src/`:
1. Add an entry to the `registry` array in `apps/docs/src/registry/index.ts`.
2. Provide all external dependencies in `dependencies` (e.g., `gsap`, `framer-motion`, `matter-js`).
3. Add full file list in `files` relative to `packages/ui/src/`.
4. Define meaningful `propDefs` with sensible `default`, `min`, `max`, and `options` so developers can immediately customize it in the Props Tweaker.
5. Set the appropriate `presentationStrategy` (`fullscreen` vs `center`).
6. Add the component render branch in `apps/docs/src/components/presentation/PresentationRenderer.tsx`.
