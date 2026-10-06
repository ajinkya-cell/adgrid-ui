# Void UI — 3D Beveled Design System Specification & Prompting Guide (`design-system.md`)

> **Version**: 1.0.0  
> **Aesthetic Archetype**: Dark-First · Machined Enclosure · Tactile Skeuomorphism · Micro-Beveled 3D Depth  
> **Core Palette**: Deep Obsidian (`#050505`), Recessed Well (`#090909`), Beveled Panel (`#151515`), Raised Chassis (`#171717`), Popout Active (`#FFFFFF`)  
> **Typography**: Sans for reading (`Inter` / `Geist` / `Poppins`), Monospace for data/code (`JetBrains Mono` / `Geist Mono`)

This document is the **definitive specification** for creating components in Void UI's physical, micro-beveled dark-mode aesthetic. It synthesizes the architectures of the **Floating Navbar** (`nav.md`), **3D Props Table** (`prop.md`), and **Code Studio Terminal** (`code.md`).

**How to use this file:**
- **For Developers**: Use the mathematical CSS formulas and production blueprints to build matching components (Table of Contents, Footers, Cards, Modals, Forms).
- **For AI Coding Agents**: Feed Section 6 ("The Agent Instruction Protocol") into any AI assistant's context. The agent will have all necessary constraints, tokens, and rules to generate perfectly styled components on demand.

---

## Table of Contents
1. [Core Design Philosophy: The Machined Enclosure](#1-core-design-philosophy-the-machined-enclosure)
2. [The 3-Tier Physical Elevation Model](#2-the-3-tier-physical-elevation-model)
3. [Mathematical Tokens & CSS Formulas](#3-mathematical-tokens--css-formulas)
   - [Directional Border Matrix](#directional-border-matrix)
   - [Dual Inset Bevel Shadow Matrix](#dual-inset-bevel-shadow-matrix)
   - [Prismatic Top-Border Flare Overlay](#prismatic-top-border-flare-overlay)
   - [The Recessed Well Formula](#the-recessed-well-formula)
   - [The Active Popout Button Formula](#the-active-popout-button-formula)
4. [Typography, Badges & Micro-Interactions](#4-typography-badges--micro-interactions)
5. [Production Blueprints for Common Components](#5-production-blueprints-for-common-components)
   - [Blueprint 1: Generic 3D Beveled Div / Container (`BeveledContainer`)](#blueprint-1-generic-3d-beveled-div--container-beveledcontainer)
   - [Blueprint 2: Table of Contents (TOC) Component (`BeveledTOC`)](#blueprint-2-table-of-contents-toc-component-beveledtoc)
   - [Blueprint 3: Machined Console Footer (`BeveledFooter`)](#blueprint-3-machined-console-footer-beveledfooter)
   - [Blueprint 4: Interactive Settings / Form Deck (`SettingsDeck`)](#blueprint-4-interactive-settings--form-deck-settingsdeck)
   - [Blueprint 5: Modal / Alert Dialog (`BeveledModal`)](#blueprint-5-modal--alert-dialog-beveledmodal)
6. [The AI Agent Instruction Protocol (System Prompt Kit)](#6-the-ai-agent-instruction-protocol-system-prompt-kit)

---

## 1. Core Design Philosophy: The Machined Enclosure

Every component in this design system is treated as a **physical object machined from dark polymer, matte titanium, or obsidian glass**.

### The 4 Physical Axioms:
1. **Light Has a Single Overhead Source**:
   - Sunlight or room light travels from directly above.
   - **Top edges** catch bright specular highlights.
   - **Bottom lips** cast ambient occlusion shadows.
   - **Side edges** receive minimal direct light and only serve as subtle defining boundaries.
2. **Never Use Flat Neutral Grays**:
   - Standard dark mode designs use flat `#1f2937` or `#333333` with uniform `1px solid #444` borders. This looks flat and lifeless.
   - We use extreme contrast: `#171717` chassis surfaces sitting above `#050505` backdrops, with razor-thin white opacity borders (`rgba(255,255,255,0.20)` down to `0.02`).
3. **Contrast Between Raised Frames and Sunken Wells**:
   - The illusion of depth is created by pairing **raised outer containers** with **sunken inner trays**. When an input sits inside an inward-beveled well, the entire container immediately pops outward toward the viewer.
4. **Active Elements Physically Pop Out**:
   - Unselected tabs or pills sit flush or sunken into the tray.
   - When selected, an active pill switches to solid `#FFFFFF` with black text and an outer drop shadow, giving the tactile impression that the button has physically raised upward.

---

## 2. The 3-Tier Physical Elevation Model

All UI elements exist on one of three distinct physical elevations:

```
  ▲  [Tier 0: Active Popout Button]   bg-white text-black shadow-[0_2px_4px_rgba(0,0,0,0.2)]
  │
  ├─ [Tier 1: Raised Chassis Frame]   bg-[#171717] or [#151515] + top specular bevel + ambient drop shadow
  │
  ├─ [Tier 2: Recessed Tray / Well]    bg-[#090909] + inset shadow (sinking down into chassis)
  │
  ▼  [Tier 3: Deep Void Cutout]       bg-[#050505] + dark inset well (text inputs, sliders)
```

| Tier | Role | Background | Border Spec | Box-Shadow Spec |
|---|---|---|---|---|
| **Tier 0** | Active / Selected Popout | `#FFFFFF` | `1px solid rgba(255,255,255,0.35)` | `0 2px 4px rgba(0,0,0,0.2)` (casts shadow onto tray) |
| **Tier 1** | Raised Chassis / Card / Nav | `#171717` or `#151515` | `border-t: white/20`, `border-x: white/0.03`, `border-b: white/10` | `inset 0 1.5px 0 0 rgba(255,255,255,0.08), inset 0 -1.5px 0 0 rgba(0,0,0,0.4), 0 20px 40px -15px rgba(0,0,0,0.7)` |
| **Tier 2** | Recessed Tray / Row Item | `#090909` | `1px solid rgba(255,255,255,0.04)` | `inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)` |
| **Tier 3** | Deep Void Well / Text Input | `#050505` | `1px solid rgba(255,255,255,0.05)` | `inset 0 1.5px 3px rgba(0,0,0,0.6)` |

---

## 3. Mathematical Tokens & CSS Formulas

### Directional Border Matrix
Never apply a uniform 1px border on all 4 sides. Always apply directional opacity to simulate overhead lighting:

```css
/* Directional Border CSS */
border-top: 1px solid rgba(255, 255, 255, 0.20);    /* Top specular catchlight */
border-left: 1px solid rgba(255, 255, 255, 0.03);   /* Subtle side definition */
border-right: 1px solid rgba(255, 255, 255, 0.03);  /* Subtle side definition */
border-bottom: 1px solid rgba(255, 255, 255, 0.10); /* Ground reflection lip */
```

**Tailwind equivalent:**
```tsx
className="border-t border-white/20 border-x border-white/[0.03] border-b border-white/10"
```

---

### Dual Inset Bevel Shadow Matrix
The bevel effect requires two opposing inset shadows inside the container:
1. **Top Inset Highlight**: `inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08)` (illuminates the inner upper rim).
2. **Bottom Inset Shadow**: `inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40)` (simulates the physical interior thickness ledge).
3. **Outer Elevation Shadow**: `0 20px 40px -15px rgba(0, 0, 0, 0.70)` (soft ambient distance shadow).

**Combined CSS Formula:**
```css
box-shadow:
  inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08),
  inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40),
  0 20px 40px -15px rgba(0, 0, 0, 0.70);
```

**Tailwind arbitrary value:**
```tsx
className="shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1.5px_0_0_rgba(0,0,0,0.4),0_20px_40px_-15px_rgba(0,0,0,0.7)]"
```

---

### Prismatic Top-Border Flare Overlay
For signature cards, hero sections, and showcase panels, place a micro-flare overlay at the very top of the container:

```tsx
<div
  className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-xl"
  style={{
    background:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
  }}
/>
```

---

### The Recessed Well Formula
Use this on inner cards, parameter rows, inputs, or table subsections that should sink downward:

```css
.recessed-well {
  background-color: #090909;
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.80),   /* Sinks interior downward */
    0 1px 0 rgba(255, 255, 255, 0.05);     /* Highlights outer lower rim */
  border-radius: 0.75rem;                  /* rounded-xl */
}
```

**Tailwind equivalent:**
```tsx
className="bg-[#090909] border border-white/[0.04] rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/[0.08] transition-all"
```

---

### The Active Popout Button Formula
When an item is active (e.g. active tab, active package manager, selected option):

```tsx
// Selected state (Popped Up)
className="border-white/35 bg-white text-black font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.2)] rounded-lg px-3 py-1 text-xs"

// Unselected state (Sunken Flush)
className="border-white/5 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] rounded-lg px-3 py-1 text-xs"
```

---

## 4. Typography, Badges & Micro-Interactions

### Font Assignments
- **Primary Body & Headings**: `font-sans` (`Inter` / `Geist` / `Poppins`). High legibility, neutral geometric forms.
- **Data, Code, Keys, Badges**: `font-mono` (`JetBrains Mono` / `Geist Mono` / `Space Grotesk`).

### Badge & Chip Styling Recipes
- **Required Tag**:
  ```tsx
  <span className="rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
    req
  </span>
  ```
- **Type / Format Tag**:
  ```tsx
  <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/70">
    string | boolean
  </span>
  ```
- **Option Value Chip**:
  ```tsx
  <span className="rounded border border-white/5 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/40">
    &quot;default&quot;
  </span>
  ```
- **Keyboard Shortcut Kbd**:
  ```tsx
  <kbd className="inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-neutral-400">
    ⌘K
  </kbd>
  ```

---

## 5. Production Blueprints for Common Components

Below are 5 complete, ready-to-copy components demonstrating how to build any UI element using this system.

---

### Blueprint 1: Generic 3D Beveled Div / Container (`BeveledContainer`)

Use this as the building block for cards, sections, preview boxes, or content wrappers:

```tsx
"use client";

import React from "react";

export interface BeveledContainerProps {
  children: React.ReactNode;
  className?: string;
  withTopFlare?: boolean;
}

export function BeveledContainer({
  children,
  className = "",
  withTopFlare = true,
}: BeveledContainerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 ${className}`}
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Optional Prismatic Top Flare */}
      {withTopFlare && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

---

### Blueprint 2: Table of Contents (TOC) Component (`BeveledTOC`)

A sticky, tactile Table of Contents rail with section indicators, depth hierarchy, and smooth hover interactions:

```tsx
"use client";

import React, { useState } from "react";
import { ListTree, ChevronRight } from "lucide-react";

export interface TOCItem {
  id: string;
  title: string;
  level?: 1 | 2 | 3;
}

export function BeveledTOC({
  items,
  activeId,
  onItemClick,
}: {
  items: TOCItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Table of contents"
      className="w-full max-w-[280px] overflow-hidden rounded-2xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 select-none font-sans"
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <ListTree className="h-3.5 w-3.5 text-white/50" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white/70">
          On This Page
        </span>
      </div>

      {/* Links List */}
      <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const indentClass =
            item.level === 3 ? "pl-7" : item.level === 2 ? "pl-5" : "pl-3";

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick?.(item.id)}
              className={`group flex w-full items-center justify-between rounded-lg pr-2.5 py-1.5 text-left text-xs transition-all cursor-pointer ${indentClass} ${
                isActive
                  ? "bg-white text-black font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-white/40"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span className="truncate">{item.title}</span>
              {isActive ? (
                <ChevronRight className="h-3 w-3 shrink-0 text-black" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

---

### Blueprint 3: Machined Console Footer (`BeveledFooter`)

A dark, physical footer with operational status dot, categorized monospace links, social icons, and tactile beveling:

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { Github, Twitter, Disc as Discord, Radio } from "lucide-react";

export function BeveledFooter() {
  const sections = [
    {
      title: "Navigation",
      links: [
        { label: "Components", href: "/components" },
        { label: "Showcase", href: "/showcase" },
        { label: "Documentation", href: "/docs" },
        { label: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Ecosystem",
      links: [
        { label: "GitHub Repository", href: "https://github.com" },
        { label: "Figma UI Kit", href: "#" },
        { label: "Community Discord", href: "#" },
        { label: "Brand Assets", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "MIT License", href: "#" },
      ],
    },
  ];

  return (
    <footer className="w-full px-4 py-12 flex justify-center font-sans">
      <div
        className="w-full max-w-6xl overflow-hidden rounded-3xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 p-8 sm:p-12"
        style={{
          backgroundColor: "#151515",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 60px -20px rgba(0, 0, 0, 0.8)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-white text-black font-bold flex items-center justify-center text-xs shadow-sm">
                V
              </div>
              <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Void UI
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Dark-first, tactile skeuomorphic components engineered for high-friction physical interfaces.
            </p>

            {/* Operational Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Links Columns */}
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-3">
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-white/40">
                {sec.title}
              </h4>
              <ul className="space-y-2">
                {sec.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[11px] text-white/40">
            © 2026 VOID UI. CRAFTED FOR THE PHYSICAL VOID.
          </span>

          <div className="flex items-center gap-2">
            {[
              { icon: Github, label: "GitHub", href: "https://github.com" },
              { icon: Twitter, label: "Twitter", href: "https://x.com" },
              { icon: Discord, label: "Discord", href: "https://discord.com" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

### Blueprint 4: Interactive Settings / Form Deck (`SettingsDeck`)

A physical control console combining raised chassis framing with sunken recessed well inputs, toggle switches, and select pills:

```tsx
"use client";

import React, { useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

export function SettingsDeck() {
  const [motionBlur, setMotionBlur] = useState(true);
  const [resolution, setResolution] = useState("1080p");
  const [intensity, setIntensity] = useState(75);

  return (
    <div
      className="w-full max-w-md overflow-hidden rounded-2xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 select-none font-sans"
      style={{
        backgroundColor: "#171717",
        boxShadow:
          "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 20px 40px -15px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-white/50" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/80">
            Render Parameters
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setMotionBlur(true);
            setResolution("1080p");
            setIntensity(75);
          }}
          className="rounded p-1 text-white/30 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="Reset defaults"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Console Body: Parameter Rows in Recessed Wells */}
      <div className="p-4 space-y-3">
        {/* Row 1: Toggle Switch */}
        <div className="bg-[#090909] border border-white/[0.04] rounded-xl p-3.5 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]">
          <div>
            <div className="text-xs font-semibold text-white/85">Motion Blur</div>
            <div className="text-[11px] text-white/40">Simulate physical shutter friction</div>
          </div>
          <button
            type="button"
            onClick={() => setMotionBlur(!motionBlur)}
            className={`relative h-5 w-9 rounded-full p-0.5 transition-colors cursor-pointer ${
              motionBlur ? "bg-white" : "bg-white/12"
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full transition-transform ${
                motionBlur ? "translate-x-4 bg-black" : "translate-x-0 bg-white/45"
              }`}
            />
          </button>
        </div>

        {/* Row 2: Select Pills */}
        <div className="bg-[#090909] border border-white/[0.04] rounded-xl p-3.5 space-y-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-xs font-semibold text-white/85">Display Resolution</div>
          <div className="flex gap-1.5">
            {["720p", "1080p", "4K"].map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setResolution(res)}
                className={`rounded-lg border px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
                  resolution === res
                    ? "border-white/35 bg-white text-black font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                    : "border-white/5 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Numeric Slider */}
        <div className="bg-[#090909] border border-white/[0.04] rounded-xl p-3.5 space-y-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white/85">Depth Intensity</span>
            <span className="font-mono text-white/50">{intensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="h-1 w-full appearance-none rounded-full bg-white/12 accent-white cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
```

---

### Blueprint 5: Modal / Alert Dialog (`BeveledModal`)

```tsx
"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

export function BeveledModal({
  isOpen,
  title = "Discard Unsaved Changes?",
  description = "This action will reset your parameter adjustments back to default factory firmware.",
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* 3D Beveled Dialog Chassis */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border-t border-white/20 border-x border-white/[0.03] border-b border-white/10 p-6 select-none font-sans"
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 35px 80px rgba(0, 0, 0, 0.85)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/30 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex gap-4 items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 pr-4">
            <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-white/55 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl border border-white/35 bg-white px-4 py-2 text-xs font-semibold text-black shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:bg-neutral-200 transition-all cursor-pointer active:scale-95"
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. The AI Agent Instruction Protocol (System Prompt Kit)

Whenever you want an AI assistant (Claude, Cursor, Copilot, GPT-4, Gemini) to generate a new component matching this design system, copy and paste the prompt block below:

```markdown
### SYSTEM DIRECTIVE: Void UI 3D Beveled Aesthetic

You are tasked with generating a component using the **Void UI 3D Beveled Design System**. Follow these strict rules and tokens without exception:

#### 1. Color Palette & Elevation Tiers
- **Void Backdrop**: `#050505` (Deepest canvas)
- **Deep Cutout Well (Inputs)**: `#050505` with `inset 0 1.5px 3px rgba(0,0,0,0.6)`
- **Recessed Tray (Inner rows)**: `#090909` with `inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)`
- **Raised Chassis (Outer container)**: `#171717` or `#151515`
- **Active Button / Popout Pill**: `#FFFFFF` solid with black text and `shadow-[0_2px_4px_rgba(0,0,0,0.2)]`

#### 2. The 3D Chassis Formula (Mandatory on all outer cards/panels)
Apply these exact properties to any container:
- Background: `#171717` (or `#151515`)
- Rounded corners: `rounded-2xl` (16px) or `rounded-xl` (12px)
- Directional Borders:
  - `border-top: 1px solid rgba(255, 255, 255, 0.20)` (top specular catchlight)
  - `border-left: 1px solid rgba(255, 255, 255, 0.03)`
  - `border-right: 1px solid rgba(255, 255, 255, 0.03)`
  - `border-bottom: 1px solid rgba(255, 255, 255, 0.10)`
- Box Shadow:
  `inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40), 0 20px 40px -15px rgba(0, 0, 0, 0.70)`

#### 3. Top Prismatic Flare Overlay (First child in container)
For elevated cards, include this absolute element:
```tsx
<div
  className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] z-20 rounded-t-xl"
  style={{
    background:
      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)",
  }}
/>
```

#### 4. Recessed Wells for Inner Controls
Any inner parameter row, input field, or nested section MUST use:
```tsx
className="bg-[#090909] border border-white/[0.04] rounded-xl p-3.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/[0.08] transition-all"
```

#### 5. Forbidden Anti-Patterns
- NEVER use flat gray `#1f2937`, `#333`, or `#374151`.
- NEVER use uniform `1px solid gray` borders around all 4 sides.
- NEVER use generic bright blue buttons; use solid `#FFFFFF` popout buttons with black text.
- NEVER omit the top catchlight (`border-top: rgba(255,255,255,0.20)`).
```
