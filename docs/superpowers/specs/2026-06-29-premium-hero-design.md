# Premium Interactive Hero Section Design Spec

This specification details the architecture, component hierarchy, animations, styling, and implementation steps for building the premium interactive Hero Section component.

## Overview
We are building a highly customized, interactive Hero Section featuring a "handdrawn notebook meets premium tech (Apple/Linear/Notion)" aesthetic. It features a pure white paper-like background, handwritten fonts and background notes, floating cards with independent sine-wave loops, mouse-movement driven 3D parallax tilt, and interactive components like navbar, search bar with a typewriter animation, CTA button with spring mechanics, and responsive layouts.

- **Target Route**: `/hero-demo`
- **Location of Code**: `apps/docs/src/components/hero/`
- **Design Tokens**: Pure white background, subtle gradients, handdrawn highlights, pastel card themes.

---

## 1. Typography & Notebook Aesthetic
* **Font Selection**:
  * We will use Google's `Architects Daughter` font for the primary heading to get the clean notebook/whiteboard marker look. We can import it via Next.js `next/font/google` as a CSS variable:
    ```typescript
    import { Architects_Daughter } from "next/font/google";
    const architectsDaughter = Architects_Daughter({
      weight: "400",
      subsets: ["latin"],
      variable: "--font-handwritten",
    });
    ```
  * Body font: Inter (default CSS variable `--font-body`).
* **Background Grid & Layout**:
  * Radial gradient background centered on the viewport for a soft spotlight.
  * Barely visible handwriting text ("built for speed", "fully managed") in light gray (`#e5e7eb` at 10% opacity) floating behind cards, slightly rotated (e.g. `-4°` or `6°`).

---

## 2. Animation Specs & Spring Physics
We will use Framer Motion (`framer-motion`) to implement spring-driven animations.
* **Spring Parameters**:
  * `stiffness: 180`
  * `damping: 18`
  * `mass: 0.8`

### Unified Stagger Sequence:
1. **Navbar**: Fades and slides down from `translateY: -30px` (Delay: `0s`).
2. **Background Notes**: Fade in softly from `opacity: 0` to `0.1` (Delay: `0.2s`).
3. **Floating Cards**: Scale up from `0.8` with soft fade-in (Staggered delay: `0.3s + index * 0.15s`).
4. **Hero Heading**: Splits words into spans, each animating from `translateY: 20px`, `opacity: 0` to normal (Delay: `0.5s + wordIndex * 0.08s`).
5. **Search Input**: Scales from `0.95` and fades in (Delay: `0.9s`).
6. **CTA Button**: Scales from `0.9` and fades in (Delay: `1.1s`).

---

## 3. Interactive Mechanics

### A. Floating sine-wave motion (`useFloating.ts`)
* Card floating uses a custom hook running a `requestAnimationFrame` loop, generating smooth sinusoidal offsets:
  $$Y_{\text{offset}} = \sin(t \cdot \text{speed}) \cdot \text{amp}$$
  $$\text{Rotate}_{\text{offset}} = \sin(t \cdot \text{speed}_{\text{rot}}) \cdot \text{amp}_{\text{rot}}$$
* Offsets are written directly to DOM elements via refs to avoid React state updates triggering full re-renders:
  * **Card 1**: $\text{translateY: } \pm 8\text{px}$, $\text{rotate: } \pm 2^\circ$, duration: $7.0s$
  * **Card 2**: $\text{translateY: } \pm 12\text{px}$, $\text{rotate: } \pm 1^\circ$, duration: $5.5s$
  * **Card 3**: $\text{translateY: } \pm 10\text{px}$, $\text{rotate: } \pm 3^\circ$, duration: $6.8s$
  * **Card 4**: $\text{translateY: } \pm 9\text{px}$, $\text{rotate: } \pm 2^\circ$, duration: $8.0s$

### B. Mouse Parallax and Tilt (`useMouseParallax.ts`)
* A container mouse movement listener translates coordinates relative to center:
  * Cards rotate in 3D (pitch & yaw) up to $5^\circ$ and translate up to $10\text{px}$ toward/away from cursor.
  * Heading, Search Bar, and Background Glows shift up to $6\text{px}$ in opposite directions.
* Using Framer Motion's `useMotionValue` and `useSpring` to guarantee smooth lagging follow-through.

### C. Typewriter Search Placeholder
* We will loop through 3-4 SaaS-related growth goals (e.g. `"Scale my personal brand to 1M..."`, `"Launch my SaaS to $10k MRR..."`, `"Grow newsletter to 50k subscribers..."`).
* Focus states: Search bar expands width slightly, shadow depth grows, border glows with light indigo/gray.

### D. CTA Button & Card Micro-Interactions
* **CTA Button**: Hover lifts button and slides the arrow right; clicking uses dynamic spring scale compression (e.g. `scale: 0.95`).
* **Card 1 (Wave)**: CSS/SVG animation moving a wave path horizontally on an infinite loop.
* **Card 2 (Social Icons)**: Bouncy hover animations using Framer Motion springs on social platform logos.
* **Card 3 (Stats CountUp)**: IntersectionObserver triggers a count-up to `+412%` using `useTransform` and `animate`.
* **Card 4 (Studio Shimmer)**: A linear gradient mask sliding across the card background every 3.5 seconds.

---

## 4. Component Structure
The source files will match the following layout under `apps/docs/src/components/hero/`:
1. `types.ts`: Props and data schemas.
2. `useMouseParallax.ts` / `useFloating.ts`: Hooks for interactivity.
3. `MouseParallax.tsx`: Context wrapper for tracking mouse coordinates.
4. `Navbar.tsx`: Header navigation with sliding dot indicator.
5. `BackgroundNotes.tsx`: Rotation-offset background text.
6. `SearchBar.tsx`: Search bar with typing loops.
7. `CTAButton.tsx`: Rounded CTA with sliding arrow.
8. `AnimatedCounter.tsx`: Stat counter.
9. `FloatingCard.tsx`: Individual card wrapper and internal components.
10. `FloatingCards.tsx`: Staggered floating cards container.
11. `Hero.tsx`: Main component exposing the `<Hero />` entry.

---

## 5. Verification Plan
* **Visual Review**: Open `/hero-demo` in multiple viewports.
* **Performance Check**: 60 FPS scrolling and tilting, no layout shifts, memory leak checks for timers.
* **Accessibility**: Full tab navigation, screen reader ARIA labels, `prefers-reduced-motion` compliance.
