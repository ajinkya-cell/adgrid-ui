# Implement 1: Interactive Props Editor for AdGrid UI Components

## Goal
Add interactive, live-editable props controls to every component's sandbox preview — let users tweak props on the website and see components update in real-time, like shadcn/ui or Storybook controls.

---

## Architecture

```
[slug]/page.tsx (server)
  └── defines prop schemas as JSON-serializable arrays
  └── ComponentTabs (client)
       └── LivePreview (client)
            ├── SandpackProvider  (wraps everything)
            │   ├── PropsEditor   (uses useSandpack().updateFile)
            │   ├── SandpackLayout
            │   │   ├── SandpackPreview
            │   │   └── SandpackCodeEditor (optional)
            │   └── 
            └── appCode generated dynamically from prop values
```

### Key Insight
`PropsEditor` lives inside `SandpackProvider` but **outside** `SandpackLayout`. This gives it access to `useSandpack().sandpack.updateFile('/App.tsx', newAppCode)` to trigger re-compilation without resetting the sandbox.

---

## Phase 1: Core Infrastructure (3 files)

### 1. Create `apps/docs/src/components/site/PropsEditor.tsx`

#### `PropDefinition` type
```typescript
export interface PropDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "select" | "color";
  label: string;
  defaultValue: unknown;
  required?: boolean;
  placeholder?: string;                        // string only
  min?: number; max?: number; step?: number;   // number only
  options?: { label: string; value: string }[]; // select only
}
```

#### Controls mapping

| Prop Type  | Control                     | Value Serialization in JSX   |
|------------|-----------------------------|------------------------------|
| `string`   | `<input type="text">`       | `prop="value"`               |
| `number`   | `<input type="range">` + numeric display | `prop={42}`     |
| `boolean`  | `<input type="checkbox">`   | `prop={true}` / `prop={false}` |
| `select`   | `<select>`                  | `prop="value"`               |
| `color`    | `<input type="color">`      | `prop="#ff0000"`             |

#### Props
```typescript
interface PropsEditorProps {
  propDefs: PropDefinition[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}
```

#### Styling
- Dark panel matching the site: `bg-surface-charcoal border border-border-hairline`
- Compact grid layout: 2-column on wider screens, 1-column on narrow
- Range sliders: thin track, small thumb, monospace value label
- Color inputs: styled with border, swatch indicator
- Labels: `text-xs font-mono uppercase tracking-wider text-text-muted`
- Header: `"⚙ Props"` with same styling as sandbox tab bar

### 2. Modify `apps/docs/src/components/site/LivePreview.tsx`

#### New prop
```typescript
editableProps?: PropDefinition[];
```

#### State
```typescript
const [propValues, setPropValues] = useState<Record<string, unknown>>(() =>
  Object.fromEntries((editableProps ?? []).map((p) => [p.name, p.defaultValue]))
);
```

#### Dynamic appCode generation (`generateDefaultAppCode`)
Builds a JSX string with current prop values:
```
import { COMPONENT_NAME } from "./COMPONENT_NAME";

export default function App() {
  return (
    <div style={containerStyle}>
      <COMPONENT_NAME prop1={value1} prop2="string2" prop3={true} />
    </div>
  );
}
```
- Strings → `prop="value"` (HTML-attribute style)
- Numbers → `prop={42}`
- Booleans → `prop={true}` / `prop={false}`
- Never render `undefined` props; always render `null`-safe

**Skip prop serialization for `className`** — it's internal.

#### `appCode` precedence
1. If `editableProps` is provided and has values → use generated appCode
2. Else if `appCode` prop is provided → use it (custom per-component overrides)
3. Else → use the current `defaultAppCode`

The generated appCode **replaces** any provided `appCode` when `editableProps` is active. The custom appCodes in `[slug]/page.tsx` (like ImageReveal's with hardcoded Unsplash URL) will be overridden — the prop schema must include the default URL values.

#### SandpackFileSyncer
A tiny internal component that lives inside `SandpackProvider`:
```typescript
function SandpackFileSyncer({ appCode }: { appCode: string }) {
  const { sandpack } = useSandpack();
  const prevRef = useRef(appCode);
  
  useEffect(() => {
    if (appCode !== prevRef.current) {
      prevRef.current = appCode;
      sandpack.updateFile('/App.tsx', appCode);
    }
  }, [appCode, sandpack]);
  
  return null;
}
```
This ensures Sandpack re-compiles when props change without a full sandbox reset.

#### Layout change
Currently `LivePreview` renders:
```
<SandpackProvider>
  <SandpackLayout>
    {showCode && <SandpackCodeEditor />}
    <SandpackPreview />
  </SandpackLayout>
</SandpackProvider>
```

New layout when `editableProps` is present:
```
<SandpackProvider>
  <SandpackFileSyncer />
  <SandpackLayout>
    {showCode && <SandpackCodeEditor />}
    <SandpackPreview />
  </SandpackLayout>
  <PropsEditorPanel title={componentName} />
</SandpackProvider>
```

When `editableProps` is empty or undefined, render as before (no editor panel).

### 3. Modify `apps/docs/src/components/site/ComponentTabs.tsx`

#### New prop
```typescript
editableProps?: PropDefinition[];
```

#### Pass-through
Pass `editableProps` directly to both Preview and Code tab `LivePreview` instances.

---

## Phase 2: Component Prop Schemas (3 components)

Modify `apps/docs/src/app/components/[category]/[slug]/page.tsx` to define and pass prop schemas.

### ImageReveal (`slug: "image-reveal"`)
```typescript
const imageRevealProps: PropDefinition[] = [
  { name: "src", type: "string", label: "Image URL", defaultValue: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", required: true },
  { name: "alt", type: "string", label: "Alt Text", defaultValue: "Mountain landscape", required: true },
  { name: "width", type: "number", label: "Width", defaultValue: 360, min: 100, max: 800, step: 10 },
  { name: "height", type: "number", label: "Height", defaultValue: 480, min: 100, max: 800, step: 10 },
  { name: "stripeAngle", type: "number", label: "Stripe Angle", defaultValue: -55, min: -90, max: 90, step: 1 },
  { name: "stripeWidth", type: "number", label: "Stripe Width", defaultValue: 20, min: 5, max: 100, step: 1 },
  { name: "stripeColor", type: "color", label: "Stripe Color", defaultValue: "#0f172a" },
  { name: "stripeBg", type: "color", label: "Stripe Background", defaultValue: "#1e293b" },
  { name: "trigger", type: "select", label: "Trigger", defaultValue: "hover", options: [
    { label: "Hover", value: "hover" },
    { label: "Click", value: "click" },
  ]},
];
```

**Remove the custom `appCode`** for ImageReveal when `editableProps` is active — the generated appCode replaces it.

### LivingText (`slug: "living-text"`)
```typescript
const livingTextProps: PropDefinition[] = [
  { name: "text", type: "string", label: "Text", defaultValue: "LIVING TEXT" },
  { name: "radius", type: "number", label: "Radius", defaultValue: 150, min: 50, max: 400, step: 10 },
  { name: "strength", type: "number", label: "Strength", defaultValue: 40, min: 5, max: 120, step: 5 },
  { name: "mode", type: "select", label: "Mode", defaultValue: "repel", options: [
    { label: "Repel", value: "repel" },
    { label: "Magnetize", value: "magnetize" },
    { label: "Stretch", value: "stretch" },
    { label: "Rotate", value: "rotate" },
    { label: "Ripple", value: "ripple" },
    { label: "All", value: "all" },
  ]},
  { name: "liquify", type: "boolean", label: "Liquify", defaultValue: true },
];
```

### ScanlineDrift (`slug: "scanline-drift"`)
```typescript
const scanlineDriftProps: PropDefinition[] = [
  { name: "variant", type: "select", label: "Variant", defaultValue: "afterglow", options: [
    { label: "Afterglow", value: "afterglow" },
    { label: "Aurora", value: "aurora" },
    { label: "Shimmer", value: "shimmer" },
  ]},
];
```

**Remove the custom `appCode`** for ScanlineDrift — the old inline variant buttons are replaced by the PropsEditor dropdown.

---

## Phase 3: Expand to Remaining Components

After validating the Phase 2 implementation works, add prop schemas for all other components.

### Button Components
All four buttons share the same pattern — they only have `children` as an editable string:

```typescript
{ name: "children", type: "string", label: "Label", defaultValue: "THE VOID" }
```

| Button | Default Value |
|---|---|
| `void-button` | "THE VOID" |
| `brushed-titanium-button` | "TITANIUM" |
| `liquid-gold-button` | "LIQUID GOLD" |
| `guilloche-button` | "GUILLOCHÉ" |

### ImageParallax (`slug: "image-parallax"`)
```typescript
const imageParallaxProps: PropDefinition[] = [
  { name: "src", type: "string", label: "Image URL", defaultValue: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80", required: true },
  { name: "alt", type: "string", label: "Alt Text", defaultValue: "Aerial mountain landscape", required: true },
  { name: "height", type: "number", label: "Height", defaultValue: 320, min: 100, max: 800, step: 10 },
  { name: "depth", type: "number", label: "Depth", defaultValue: 40, min: 5, max: 150, step: 5 },
  { name: "overlayColor", type: "color", label: "Overlay Color", defaultValue: "rgba(0,0,0,0.07)" },
  // Note: overlayColor is a CSS rgba() not a hex, so color input may not work perfectly.
  // Option: keep as string input, or convert to hex preset.
  { name: "caption", type: "string", label: "Caption", defaultValue: "Above the Clouds" },
  { name: "subcaption", type: "string", label: "Subcaption", defaultValue: "Aerial landscape · Swiss Alps" },
  { name: "mode", type: "select", label: "Mode", defaultValue: "mouse", options: [
    { label: "Mouse", value: "mouse" },
    { label: "Scroll", value: "scroll" },
  ]},
];
```
**Skip `width`** — it's always "100%" and doesn't need editing.

### ImageStack (`slug: "image-stack"`)
Only editable numeric props. The `cards` array is complex — keep it hardcoded.

```typescript
const imageStackProps: PropDefinition[] = [
  { name: "width", type: "number", label: "Width", defaultValue: 240, min: 100, max: 500, step: 10 },
  { name: "height", type: "number", label: "Height", defaultValue: 320, min: 100, max: 600, step: 10 },
  { name: "dismissThreshold", type: "number", label: "Dismiss Threshold", defaultValue: 100, min: 30, max: 300, step: 10 },
];
```

### Components with NO editable props
These render without the PropsEditor panel:

| Component | Reason |
|---|---|
| `pixel-melt` | Canvas background, no props |
| `breathing-grid` | Canvas background, no props |
| `floating-embers` | Canvas background, no props |
| `gravity-card-stack` | No props (hardcoded data) |
| `morphing-nav` | No props (hardcoded data) |
| `story-timeline` | No props (hardcoded data) |

---

## Serialization Logic (`generateAppCode`)

The function that converts current prop values into a JSX string:

```typescript
function generateAppCode(
  componentName: string,
  propDefs: PropDefinition[],
  values: Record<string, unknown>,
  userAppCode?: string,
  customImports?: string,
): string {
  const propsStr = propDefs
    .filter((def) => {
      const val = values[def.name];
      // Skip if value is undefined or equals default (cleaner look)
      return val !== undefined;
    })
    .map((def) => {
      const val = values[def.name];
      if (def.type === "number" || def.type === "boolean") {
        return `\n        ${def.name}={${val}}`;
      }
      // string, color, select → string attributes
      return `\n        ${def.name}="${String(val).replace(/"/g, '&quot;')}"`;
    })
    .join("");

  return `import { ${componentName} } from "./${componentName}";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem",
    }}>
      <${componentName}${propsStr}
      />
    </div>
  );
}`;
}
```

### Edge cases
- **Empty string value** → renders `prop=""` (valid)
- **0 as number** → renders `prop={0}` (valid)
- **`false` boolean** → renders `prop={false}` (valid, doesn't skip)
- **Special characters in strings** → HTML-entity-escape double quotes
- **Component has no editable props** → render normal wrapper (no PropsEditor)
- **All props at defaults** → still render all props explicitly (consistency)

---

## PropsEditor Panel Layout

```
┌──────────────────────────────────────────────────┐
│ ⚙ Props  —  componentName                       │  <- header row
├──────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌──────────────┐               │
│ │ Label       │  │ Label        │               │
│ │ [control]   │  │ [control]    │               │
│ ├─────────────┤  ├──────────────┤               │
│ │ Label       │  │ Label        │               │
│ │ [control]   │  │ [control]    │               │
│ └─────────────┘  └──────────────┘               │
└──────────────────────────────────────────────────┘
```

- 2-column grid (`grid-cols-2`) above `md` breakpoint, 1-column below
- Each cell: label (top, small) + control (bottom)
- Compact spacing: `gap-3 p-4`
- Header: `flex items-center gap-2 px-4 py-2.5 border-b border-border-hairline bg-surface-charcoal`
- Toggle collapse button in header (optional V2 enhancement)

---

## Control Components (internal to PropsEditor)

### StringControl
```tsx
<input
  type="text"
  value={value as string}
  onChange={(e) => onChange(e.target.value)}
  className="w-full bg-black/40 border border-border-hairline px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 transition-colors"
  placeholder={def.placeholder}
/>
```

### NumberControl
```tsx
<div className="flex items-center gap-2">
  <input
    type="range"
    min={def.min}
    max={def.max}
    step={def.step ?? 1}
    value={value as number}
    onChange={(e) => onChange(Number(e.target.value))}
    className="flex-1 accent-white/80 h-1 appearance-none bg-neutral-800 rounded-full cursor-pointer
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
      [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
  />
  <span className="text-xs font-mono text-text-muted w-8 text-right tabular-nums">
    {value as number}
  </span>
</div>
```

### BooleanControl
```tsx
<label className="flex items-center gap-2 cursor-pointer select-none">
  <input
    type="checkbox"
    checked={value as boolean}
    onChange={(e) => onChange(e.target.checked)}
    className="accent-white"
  />
  <span className="text-xs font-mono text-text-muted">{def.label}</span>
</label>
```

### SelectControl
```tsx
<select
  value={value as string}
  onChange={(e) => onChange(e.target.value)}
  className="w-full bg-black/40 border border-border-hairline px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 transition-colors cursor-pointer appearance-none"
>
  {def.options?.map((opt) => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
```

### ColorControl
```tsx
<div className="flex items-center gap-2">
  <input
    type="color"
    value={value as string}
    onChange={(e) => onChange(e.target.value)}
    className="w-8 h-8 p-0.5 bg-transparent border border-border-hairline rounded cursor-pointer"
  />
  <input
    type="text"
    value={value as string}
    onChange={(e) => onChange(e.target.value)}
    className="flex-1 bg-black/40 border border-border-hairline px-2 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 transition-colors"
  />
</div>
```

---

## File-by-File Summary

| File | Action |
|---|---|
| `apps/docs/src/components/site/PropsEditor.tsx` | **Create** — editor panel + controls |
| `apps/docs/src/components/site/LivePreview.tsx` | **Modify** — add `editableProps`, dynamic appCode, `SandpackFileSyncer` |
| `apps/docs/src/components/site/ComponentTabs.tsx` | **Modify** — pass through `editableProps` |
| `apps/docs/src/app/components/[category]/[slug]/page.tsx` | **Modify** — define prop schemas for Phase 2+3 components |

---

## Verification Checklist

After implementation, for each Phase 2 component:

- [ ] PropsEditor panel appears below the sandbox preview on the Preview tab
- [ ] PropsEditor panel appears below the sandbox preview on the Code tab
- [ ] Changing a string prop (text input) updates the component in <500ms
- [ ] Changing a number prop (slider) updates the component in <500ms
- [ ] Changing a color prop (color picker) updates the component in <500ms
- [ ] Changing a select prop (dropdown) updates the component in <500ms
- [ ] Changing a boolean prop (checkbox) updates the component in <500ms
- [ ] Component re-renders without full sandbox reset (scroll position, iframe state preserved)
- [ ] Styling matches the existing dark theme
- [ ] PropsEditor is NOT shown for components without editable props (PixelMelt, etc.)
- [ ] Generated appCode correctly serializes all prop types
- [ ] Edge case: zero values (width=0, height=0) render correctly
- [ ] Edge case: empty string values render correctly
- [ ] Props section is collapsed/hidden when no props schema provided
