# Floating Beveled Navbar (`nav.md`)

This guide provides the complete source code, visual design anatomy, and adaptation recipes for the signature floating pill navbar from **Void UI**. You can drop this component directly into any Next.js, Vite, Remix, or Astro project.

---

## Table of Contents
1. [Visual Anatomy & Design Secrets](#1-visual-anatomy--design-secrets)
2. [Original Void UI Implementation](#2-original-void-ui-implementation)
3. [Universal Standalone Component (`FloatingNavbar.tsx`)](#3-universal-standalone-component-floatingnavbarttsx)
4. [CSS & Tailwind Recipes](#4-css--tailwind-recipes)
5. [How to Transform & Adapt for Other Websites](#5-how-to-transform--adapt-for-other-websites)
   - [Brand Logo Adaptation](#brand-logo-adaptation)
   - [Animated Active Indicator (Framer Motion)](#animated-active-indicator-framer-motion)
   - [Responsive Mobile Hamburger Menu](#responsive-mobile-hamburger-menu)
   - [Light Mode / Tinted Theme Variant](#light-mode--tinted-theme-variant)
6. [Step-by-Step Integration Guide](#6-step-by-step-integration-guide)

---

## 1. Visual Anatomy & Design Secrets

The Void UI navbar looks high-end and physical because of a **micro-beveled 3D lighting model** rather than simple flat blur.

```
       ┌──────────────────────────────────────────────────────────────┐  <- border-top: rgba(255,255,255,0.16)
       │ [Logo]       Gallery   Components   Roughly       [Search] [GH] │  <- inset 0 1px 0 rgba(255,255,255,0.05) (top specular)
       └──────────────────────────────────────────────────────────────┘  <- inset 0 -1px 0 rgba(0,0,0,0.35) (bottom bevel)
                                                                        <- 0 16px 40px rgba(0,0,0,0.32) (ambient drop shadow)
```

### The 4 Core Principles:
1. **Fixed Click-Through Wrapper**:
   - The outer `<header>` uses `fixed left-0 top-3 z-50 flex w-full justify-center pointer-events-none`.
   - The inner `<nav>` uses `pointer-events-auto`. This ensures clicks pass through the margins outside the navbar, but all links and buttons inside the pill remain interactive.
2. **Directional Lighting & Beveled Shadow Matrix**:
   - **Top border**: High specular catchlight (`rgba(255, 255, 255, 0.16)`).
   - **Side/Bottom borders**: Subtle boundary (`rgba(255, 255, 255, 0.08)`).
   - **Inner top catchlight**: `inset 0 1px 0 rgba(255, 255, 255, 0.05)` mimics polished glass beveling.
   - **Inner bottom shade**: `inset 0 -1px 0 rgba(0, 0, 0, 0.35)` adds depth where light can't reach.
   - **Outer blur shadow**: `0 16px 40px rgba(0, 0, 0, 0.32)` separates the pill from the background canvas.
3. **Pill Proportion**:
   - Maximum width constrained to `max-w-[40rem]` (~640px) with `h-12` (48px) and `rounded-full`.
4. **Command Palette Integration**:
   - Includes a native `Cmd+K` / `Ctrl+K` keydown listener that fires an optional search callback.

---

## 2. Original Void UI Implementation

### The Core CSS (`globals.css`)
```css
.site-bevel-panel {
  background-color: #151515;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.16);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35),
    0 16px 40px rgba(0, 0, 0, 0.32);
}
```

### Original Component (`apps/docs/src/components/site/Navbar.tsx`)
```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { usePresentationStore } from "@/lib/presentation/store";

export function Navbar() {
  const pathname = usePathname();
  const toggleCommandPalette = usePresentationStore((state) => state.toggleCommandPalette);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleCommandPalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette]);

  const links = [
    {
      label: "Gallery",
      href: "/gallery",
      isActive: pathname === "/gallery",
    },
    {
      label: "Components",
      href: "/present/buttons/void-button",
      isActive:
        pathname.startsWith("/present") ||
        pathname.startsWith("/components") ||
        pathname.startsWith("/docs"),
    },
    {
      label: "Roughly",
      href: "/roughly",
      isActive: pathname.startsWith("/roughly"),
    },
  ];

  return (
    <header className="fixed left-0 top-3 z-50 flex w-full justify-center px-2 sm:top-4 sm:px-4 pointer-events-none select-none">
      <nav className="site-bevel-panel flex h-12 w-full max-w-[40rem] items-center justify-between gap-2 rounded-full px-2 sm:px-3 pointer-events-auto font-inter">
        <Link
          href="/"
          aria-label="Void UI home"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Image
            src="/previews/void.png"
            alt="Void UI"
            width={48}
            height={48}
            preload
            className="h-10 w-10 object-contain mix-blend-screen"
          />
        </Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={link.isActive ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-1.5 py-2 text-[10px] font-medium transition-colors sm:px-2.5 sm:text-xs ${
                link.isActive
                  ? "text-white font-semibold"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleCommandPalette}
            className="flex h-9 items-center justify-center gap-2 rounded-xl px-2.5 text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            title="Open command palette"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden text-xs md:inline">Search</span>
          </button>
          <a
            href="https://github.com/ajinkya-cell/adgrid-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/75 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            title="GitHub repository"
            aria-label="GitHub repository"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.013 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}
```

---

## 3. Universal Standalone Component (`FloatingNavbar.tsx`)

This version is completely decoupled from any internal stores. It works in any Next.js 13/14/15/16 App Router, Vite React, or Remix project.

```tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Github, Menu, X } from "lucide-react";

export interface NavLinkItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

export interface FloatingNavbarProps {
  /** Logo component or image node */
  logo?: React.ReactNode;
  /** Navigation links array */
  links?: NavLinkItem[];
  /** Optional callback when user clicks Search or presses Cmd+K */
  onSearchClick?: () => void;
  /** GitHub link URL. Omit to hide GitHub icon */
  githubUrl?: string;
  /** Custom extra action buttons on the right side */
  actions?: React.ReactNode;
  /** Custom CSS class on outer header */
  className?: string;
}

const DEFAULT_LINKS: NavLinkItem[] = [
  { label: "Features", href: "/#features" },
  { label: "Components", href: "/components" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

export function FloatingNavbar({
  logo,
  links = DEFAULT_LINKS,
  onSearchClick,
  githubUrl,
  actions,
  className = "",
}: FloatingNavbarProps) {
  const pathname = usePathname?.() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    if (!onSearchClick) return;

    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onSearchClick?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearchClick]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed left-0 top-3 z-50 flex w-full justify-center px-3 sm:top-4 sm:px-4 pointer-events-none select-none ${className}`}
    >
      <div className="w-full max-w-[42rem] pointer-events-auto flex flex-col items-center">
        {/* Main Pill Navbar */}
        <nav
          className="flex h-12 w-full items-center justify-between gap-2 rounded-full px-3 sm:px-3.5 transition-all duration-200"
          style={{
            backgroundColor: "#151515",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderTopColor: "rgba(255, 255, 255, 0.16)",
            boxShadow:
              "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.35), 0 16px 40px rgba(0, 0, 0, 0.35)",
          }}
        >
          {/* Left: Brand Logo */}
          <div className="flex shrink-0 items-center">
            {logo ? (
              logo
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl px-1 py-1 text-sm font-semibold tracking-tight text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black font-bold text-xs shadow-sm">
                  V
                </div>
                <span className="hidden sm:inline font-mono text-xs tracking-wider uppercase text-neutral-300">
                  Void
                </span>
              </Link>
            )}
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden md:flex min-w-0 items-center gap-1 sm:gap-1.5">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "text-white font-semibold bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] font-mono text-white/80">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions, Search, Social, Mobile Toggle */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Search Trigger */}
            {onSearchClick && (
              <button
                type="button"
                onClick={onSearchClick}
                className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 cursor-pointer"
                title="Search (Cmd+K)"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden lg:inline text-xs">Search</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1 font-mono text-[9px] text-neutral-400">
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Custom injected actions */}
            {actions}

            {/* GitHub Button */}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Github className="h-4 w-4" />
              </a>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="flex h-8 w-8 md:hidden items-center justify-center rounded-lg text-neutral-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div
            className="mt-2 w-full overflow-hidden rounded-2xl p-2.5 md:hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2"
            style={{
              backgroundColor: "#141414",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderTopColor: "rgba(255, 255, 255, 0.14)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            <div className="flex flex-col space-y-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-neutral-300">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
```

---

## 4. CSS & Tailwind Recipes

### Option A: Pure Tailwind CSS (No extra CSS files needed)
You can apply the exact beveled design directly using Tailwind arbitrary values:

```tsx
<nav className="flex h-12 w-full max-w-[40rem] items-center justify-between gap-2 rounded-full px-3 
  bg-[#151515] 
  border border-white/[0.08] border-t-white/[0.16] 
  shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.35),0_16px_40px_rgba(0,0,0,0.32)]">
```

### Option B: Tailwind Plugin / `tailwind.config.js`
Add a custom utility class to your Tailwind configuration:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'site-bevel': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.35), 0 16px 40px rgba(0, 0, 0, 0.32)',
      },
    },
  },
}
```

---

## 5. How to Transform & Adapt for Other Websites

### Brand Logo Adaptation
If you have a custom SVG or Next.js Image logo:
```tsx
<FloatingNavbar
  logo={
    <Link href="/" className="flex items-center gap-2">
      <img src="/logo.svg" alt="Company" className="h-6 w-auto" />
      <span className="font-semibold text-xs tracking-tight text-white">Acme Inc</span>
    </Link>
  }
/>
```

### Animated Active Indicator (Framer Motion)
To give links an iOS-style sliding pill highlight when hovering or active, wrap the links with `framer-motion`:

```tsx
import { motion } from "framer-motion";

// Inside the links map:
{links.map((link) => {
  const isActive = pathname === link.href;
  return (
    <Link
      key={link.label}
      href={link.href}
      className="relative px-3 py-1.5 text-xs font-medium transition-colors"
    >
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute inset-0 rounded-lg bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <span className={isActive ? "relative z-10 text-white font-semibold" : "relative z-10 text-neutral-400 hover:text-white"}>
        {link.label}
      </span>
    </Link>
  );
})}
```

### Light Mode / Tinted Theme Variant
If your external website is light-themed or indigo-tinted, adjust the colors as follows:

```css
/* Glass / Light Theme Bevel */
.site-bevel-panel-light {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-top-color: rgba(255, 255, 255, 0.8);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05),
    0 16px 32px -8px rgba(0, 0, 0, 0.08);
}

/* Violet Tinted Obsidian (Cyberpunk / AI Aesthetic) */
.site-bevel-panel-violet {
  background-color: #12101a;
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-top-color: rgba(167, 139, 250, 0.35);
  box-shadow:
    inset 0 1px 0 rgba(196, 181, 253, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.6),
    0 20px 45px rgba(0, 0, 0, 0.65),
    0 0 30px rgba(139, 92, 246, 0.08);
}
```

---

## 6. Step-by-Step Integration Guide

### Step 1: Install Icons
If you use Lucide:
```bash
pnpm add lucide-react
# or
npm install lucide-react
```

### Step 2: Add Component to Your Project
Place the code in `components/FloatingNavbar.tsx`.

### Step 3: Mount in Root Layout (`app/layout.tsx`)
```tsx
import { FloatingNavbar } from "@/components/FloatingNavbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-white min-h-screen">
        <FloatingNavbar
          links={[
            { label: "Product", href: "/product" },
            { label: "Showcase", href: "/showcase" },
            { label: "Docs", href: "/docs" },
          ]}
          githubUrl="https://github.com/your-username/your-repo"
          onSearchClick={() => console.log("Open command palette")}
        />
        {/* Main page content - add pt-24 so content doesn't tuck under the fixed navbar */}
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
```
