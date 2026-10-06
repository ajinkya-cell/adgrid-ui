# 3D Minimal Beveled Table & Depth UI (`prop.md`)

This guide provides the complete source code, lighting anatomy, and adaptation recipes for the **smooth, beveled 3D Props Table** from Void UI's presentation section. It explains how to build tactile tables, data lists, and settings cards with subtle depth, directional lighting, and physical realism.

---

## Table of Contents
1. [Visual Anatomy of the 3D Beveled Aesthetic](#1-visual-anatomy-of-the-3d-beveled-aesthetic)
2. [Original Code from Void UI](#2-original-code-from-void-ui)
3. [Universal Standalone `BeveledPropsTable.tsx`](#3-universal-standalone-beveledpropstabletsx)
4. [How to Implement for Any Other Table](#4-how-to-implement-for-any-other-table)
   - [Variant 1: API Endpoint & Parameter Table](#variant-1-api-endpoint--parameter-table)
   - [Variant 2: Feature & Pricing Comparison Table](#variant-2-feature--pricing-comparison-table)
   - [Variant 3: Data Records / User Management Table](#variant-3-data-records--user-management-table)
5. [The "Recessed Well" Technique (Interactive Inputs & Sub-rows)](#5-the-recessed-well-technique-interactive-inputs--sub-rows)
6. [CSS Tokens & Tailwind Utility Recipes](#6-css-tokens--tailwind-utility-recipes)

---

## 1. Visual Anatomy of the 3D Beveled Aesthetic

Most dark-mode tables look flat or muddy because they use a single border color and standard flat dark backgrounds. Void UI creates a **machined, physical, tactile look** using 5 specific lighting layers:

```
    OVERHEAD LIGHT SOURCE (Ambient Specular)
                 │
                 ▼
  ┌────────────────────────────────────────────────────────┐ ◄─── border-t: 1px solid rgba(255, 255, 255, 0.20)
  │ ╭────────────────────────────────────────────────────╮ │ ◄─── inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08) (top catchlight)
  │ │  PROP      TYPE       DEFAULT    DESCRIPTION        │ │ ◄─── Header: bg-white/[0.02] border-b border-white/[0.06]
  │ ├────────────────────────────────────────────────────┤ │
  │ │  variant   "solid"    "default"  Button visual      │ │ ◄─── Row: hover:bg-white/[0.02]
  │ │  disabled  boolean    false      Disable clicks     │ │
  │ ╰────────────────────────────────────────────────────╯ │ ◄─── inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40) (bottom bevel)
  └────────────────────────────────────────────────────────┘ ◄─── border-b: 1px solid rgba(255, 255, 255, 0.10)
                 ▲
                 │
    0 20px 40px -15px rgba(0, 0, 0, 0.70) (Deep Diffuse Shadow)
```

### The 5 Layer Formula:
1. **Chassis Surface**:
   `backgroundColor: "#171717"` — a rich obsidian graphite with high contrast against both pure black (`#000000`) and elevated dark gray (`#222222`).
2. **Directional Boundary Lighting**:
   - `border-t`: `rgba(255, 255, 255, 0.20)` (top edge catches bright downward light).
   - `border-x`: `rgba(255, 255, 255, 0.03)` (sides receive virtually no direct light).
   - `border-b`: `rgba(255, 255, 255, 0.10)` (bottom receives faint upward floor reflection).
3. **Dual Inset Bevel Shadows**:
   - `inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08)` creates the sharp interior chamfer at the top.
   - `inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40)` creates the dark interior occlusion ledge at the bottom.
4. **Elevation Diffuse Dropshadow**:
   `0 20px 40px -15px rgba(0, 0, 0, 0.70)` lifts the entire container away from the backdrop.
5. **Precision Badges & Typography**:
   - Table headers: `font-mono text-[10px] uppercase tracking-wider text-white/50`.
   - Prop names: `font-mono text-xs font-medium text-white`.
   - Required pills: `rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/80 border border-white/10`.
   - Type pills: `rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/70`.
   - Option pills: `rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40 border border-white/5`.

---

## 2. Original Code from Void UI

From `apps/docs/src/components/presentation/CodeStudioGuide.tsx`:

```tsx
{entry.propDefs && entry.propDefs.length > 0 && (
  <section className="space-y-2">
    <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold">
      Props
    </h3>

    {/* 3D Beveled Chassis Container */}
    <div
      className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      <div className="overflow-x-auto present-scroll">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/50">
              <th className="px-4 py-2.5">Prop</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Default</th>
              <th className="px-4 py-2.5">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {entry.propDefs.map((prop) => (
              <tr key={prop.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-medium text-white whitespace-nowrap">
                  {prop.name}
                  {prop.required && (
                    <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/80 border border-white/10">
                      req
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/70">
                    {prop.type}
                    {prop.options ? ` (${prop.options.length})` : ""}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-white/50 whitespace-nowrap">
                  {prop.default !== undefined ? String(prop.default) : "—"}
                </td>
                <td className="px-4 py-3 text-white/70 leading-relaxed text-[11px] font-sans">
                  {prop.description}
                  {prop.options && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {prop.options.map((opt) => (
                        <span
                          key={opt}
                          className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40 border border-white/5"
                        >
                          &quot;{opt}&quot;
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
)}
```

---

## 3. Universal Standalone `BeveledPropsTable.tsx`

Here is a copy-paste ready, fully typed component you can use anywhere:

```tsx
"use client";

import React from "react";

export interface PropItem {
  name: string;
  type: string;
  default?: string | number | boolean;
  description: string;
  required?: boolean;
  options?: string[];
}

export interface BeveledPropsTableProps {
  title?: string;
  subtitle?: string;
  props: PropItem[];
  className?: string;
}

export function BeveledPropsTable({
  title = "Component Properties",
  subtitle,
  props,
  className = "",
}: BeveledPropsTableProps) {
  if (!props || props.length === 0) return null;

  return (
    <div className={`space-y-2.5 font-sans ${className}`}>
      {/* Title Header */}
      {(title || subtitle) && (
        <div className="flex flex-col">
          {title && (
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/40">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-white/50">{subtitle}</p>
          )}
        </div>
      )}

      {/* 3D Beveled Chassis */}
      <div
        className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/50">
                <th className="px-4 py-2.5 font-medium">Prop</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Default</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {props.map((item) => (
                <tr
                  key={item.name}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Name + Required Badge */}
                  <td className="px-4 py-3 font-mono text-xs font-medium text-white whitespace-nowrap">
                    <span>{item.name}</span>
                    {item.required && (
                      <span className="ml-1.5 rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
                        req
                      </span>
                    )}
                  </td>

                  {/* Type Badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/70">
                      {item.type}
                      {item.options ? ` (${item.options.length})` : ""}
                    </span>
                  </td>

                  {/* Default Value */}
                  <td className="px-4 py-3 font-mono text-[11px] text-white/50 whitespace-nowrap">
                    {item.default !== undefined ? String(item.default) : "—"}
                  </td>

                  {/* Description & Option Chips */}
                  <td className="px-4 py-3 text-white/70 leading-relaxed text-[11px]">
                    <div>{item.description}</div>
                    {item.options && item.options.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.options.map((opt) => (
                          <span
                            key={opt}
                            className="rounded border border-white/5 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40"
                          >
                            &quot;{opt}&quot;
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. How to Implement for Any Other Table

You can reuse the exact same 3D chassis for any other table by changing only the columns and headers.

### Variant 1: API Endpoint & Parameter Table

```tsx
export function ApiEndpointsTable() {
  const endpoints = [
    { method: "GET", path: "/v1/components", auth: "Bearer", desc: "List all published components" },
    { method: "POST", path: "/v1/components/publish", auth: "API Key", desc: "Publish new registry bundle" },
    { method: "DELETE", path: "/v1/components/:id", auth: "Admin", desc: "Revoke component access" },
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/50">
            <th className="px-4 py-2.5">Method</th>
            <th className="px-4 py-2.5">Endpoint</th>
            <th className="px-4 py-2.5">Auth</th>
            <th className="px-4 py-2.5">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {endpoints.map((ep) => (
            <tr key={ep.path} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  ep.method === "GET"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : ep.method === "POST"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {ep.method}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-white">{ep.path}</td>
              <td className="px-4 py-3 text-white/50 text-[11px] font-mono">{ep.auth}</td>
              <td className="px-4 py-3 text-white/70 text-xs">{ep.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### Variant 2: Feature & Pricing Comparison Table

```tsx
export function PricingFeatureTable() {
  const features = [
    { feature: "Unlimited UI Components", starter: true, pro: true, enterprise: true },
    { feature: "3D Shaders & WebGL", starter: false, pro: true, enterprise: true },
    { feature: "Sound Effects & Micro-haptics", starter: false, pro: true, enterprise: true },
    { feature: "Custom Theme Generators", starter: false, pro: false, enterprise: true },
  ];

  return (
    <div
      className="overflow-hidden rounded-xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/50">
            <th className="px-4 py-3">Feature</th>
            <th className="px-4 py-3 text-center">Starter ($0)</th>
            <th className="px-4 py-3 text-center text-white font-bold">Pro ($19/mo)</th>
            <th className="px-4 py-3 text-center">Enterprise</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {features.map((f) => (
            <tr key={f.feature} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-xs text-white/85 font-medium">{f.feature}</td>
              <td className="px-4 py-3 text-center text-xs">{f.starter ? "✓" : "—"}</td>
              <td className="px-4 py-3 text-center text-xs text-white font-semibold">{f.pro ? "✓" : "—"}</td>
              <td className="px-4 py-3 text-center text-xs text-white">{f.enterprise ? "✓" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 5. The "Recessed Well" Technique (Interactive Inputs & Sub-rows)

When creating interactive tables, forms, or settings drawers (like Void UI's `PropsTweaker`), place interactive elements inside **recessed wells**. This creates extreme depth because the row sinks inward while the table chassis floats outward.

### Recessed Well CSS Formula
```css
.recessed-well {
  background-color: #090909;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 0.75rem;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.8),  /* Deep top inner shadow */
    0 1px 0 rgba(255, 255, 255, 0.05);   /* Bottom reflection ledge */
}
```

### Recessed Settings Row Example
```tsx
<div className="bg-[#090909] border border-white/[0.04] rounded-xl p-3.5 space-y-2.5 transition-all hover:border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]">
  <div className="flex items-center justify-between">
    <span className="font-sans text-xs font-semibold text-white/85">Enable Shadows</span>
    <button className="h-5 w-9 rounded-full bg-white p-0.5">
      <span className="block h-4 w-4 rounded-full bg-black translate-x-4 transition-transform" />
    </button>
  </div>
</div>
```

---

## 6. CSS Tokens & Tailwind Utility Recipes

### Tailwind v3 Configuration
Add this preset to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        chassis: "#171717",
        well: "#090909",
      },
      boxShadow: {
        'beveled-card': 'inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'recessed-well': 'inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
}
```

### Pure CSS Class Definitions
```css
/* 3D Elevated Chassis */
.beveled-chassis {
  background-color: #171717;
  border-top: 1px solid rgba(255, 255, 255, 0.20);
  border-left: 1px solid rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08),
    inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40),
    0 20px 40px -15px rgba(0, 0, 0, 0.70);
  border-radius: 0.75rem;
}

/* Subtle Scrollbar */
.present-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.present-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 9999px;
}
.present-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.22);
  border-radius: 9999px;
}
.present-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.38);
}
```
