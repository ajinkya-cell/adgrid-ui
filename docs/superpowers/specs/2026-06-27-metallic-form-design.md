# Design Spec: Metallic Form & Premium Input Components

This document outlines the design specification for implementing a highly-polished, responsive metallic form container (`MetallicForm`) alongside its dependencies (`ChromeInput` and `ChromeSelect`) inside the `@adgrid/ui` package.

## Goal
Create a premium, luxury dark metallic form library matching the titanium theme, featuring an obsidian base, anisotropic spotlight reflections, smooth focus highlights, custom styling for selects/textareas, validation states, and immersive micro-animations.

---

## 1. Component Interfaces & APIs

### `ChromeInput`
A reusable, metallic input field supporting standard HTML input attributes with reactive spotlight effects.

```typescript
import React from "react";

export interface ChromeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}
```

### `ChromeSelect`
A customizable dropdown select menu styled to match the obsidian/metallic inputs.

```typescript
import React from "react";

export interface ChromeSelectOption {
  value: string;
  label: string;
}

export interface ChromeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: ChromeSelectOption[];
  error?: string;
  label?: string;
}
```

### `MetallicForm`
The form container that maps and coordinates inputs, validation, typing indicators, and submission states.

```typescript
import React from "react";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: string) => { valid: boolean; error?: string };
}

export interface MetallicFormProps {
  title?: string;
  subtitle?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void> | void;
  submitLabel?: string;
  className?: string;
}
```

---

## 2. Visual Style & Aesthetic Specifications

### Base Obsidian Surface
All elements share a deep, polished obsidian/brushed metal backdrop:
- **Background**: Linear gradient from `#0a0a0c` to `#151518`.
- **Texture**: Subtle linear grid repeating overlay (`linear-gradient` / `repeating-linear-gradient` with `opacity: 0.2`).
- **Bezel**: Top borders have a slightly higher light reflectivity (`rgba(255,255,255,0.12)`) than bottom borders (`rgba(0,0,0,0.4)`), giving a milled inset/beveled appearance.

### Mouse Spotlight
- Standard spotlight uses a Framer Motion spring-damped tracker mapping standard page-space cursor coordinates onto local container dimensions.
- The spotlight creates a subtle white light sweep:
  `radial-gradient(circle 120px at {x}px {y}px, rgba(255,255,255,0.06), transparent)`

### Focus States
When active or focused, input fields transition to:
- A glowing metallic border (`rgba(255,255,255,0.25)` or accent tone).
- Inset shadow revealing light refraction in the metal bezel:
  `box-shadow: 0 0 12px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255,255,255,0.1)`

---

## 3. Micro-Animations & Interactivity

1. **Typing Indicators**: Soft pulsing dot triads (opacity wave: `0.3 -> 1.0 -> 0.3` with delayed springs) next to the field labels while values change, fading out 1.5 seconds after typing ceases.
2. **Dynamic Bezel Spotlight**: In `ChromeInput` and `ChromeSelect`, the spotlight tracks the mouse position during hover, fading out smoothly on mouse leave.
3. **Success State Transition**: A beveled success message sliding up from below with a physics-driven elastic spring curve (`damping: 20`, `stiffness: 100`).
4. **Form Entry Transition**: Staggered component entry where fields slide up in sequence (`delay: index * 0.08`).

---

## 4. Accessibility & Fallbacks

- **Keyboard Navigation**: Native `<select>` options remain accessible, while custom wrappers receive proper focus ring visual outlines.
- **Form Semantics**: Proper `<form>`, `<label>`, `<input>`, and `<textarea>` elements with active `aria-invalid` and `aria-describedby` links for errors.
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, all spring physics are skipped in favor of instant transitions or opacity fades.

---

## Verification Plan

### Automated Checks
- Run TypeScript build check (`pnpm build`) to verify all types compile cleanly.
- Verify zero ESLint or formatting rule errors.

### Manual Verification
- Test cursor spotlight tracks client coordinates correctly inside container bounds.
- Confirm dropdown options are select-accessible via keyboard arrow keys.
- Confirm submission success banner triggers automatically on valid payloads.
