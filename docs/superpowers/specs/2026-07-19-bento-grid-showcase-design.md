### Design: Interactive Bento Grid Showcase (`/lab`)

The page will feature a dynamic, asymmetrical grid layout using Tailwind CSS. Each grid item will be a "control card" with a distinct, interactive VOID/UI component. The overall aesthetic will be a "declassified military terminal" or "spaceship HUD dashboard."

#### **1. Page Structure and Layout**

*   **Route:** `apps/docs/src/app/lab/page.tsx`
*   **Root Element:** A `<main>` element with a dark background and overall page padding.
*   **Grid Container:** A `div` with `display: grid` and `grid-template-columns: repeat(12, minmax(0, 1fr))` (Tailwind's `grid-cols-12`) to allow for flexible, asymmetrical card spanning.
*   **Gap:** Consistent `gap-6` (24px) between grid items.
*   **Responsiveness:** The grid will adapt for mobile. On smaller screens, cards will stack into a single column or adjust to a simpler 2-column layout.

#### **2. Control Card Structure (for each component)**

Each interactive component will be housed within a `div` element acting as a "control card."

*   **Outer Card Styling:**
    *   `border border-border-hairline`: A subtle hairline border.
    *   `bg-surface-charcoal/40 backdrop-blur-md`: A translucent charcoal background with a slight blur for depth.
    *   `p-6`: Ample internal padding.
    *   `rounded-lg shadow-2xl`: Slightly rounded corners with a deep shadow.
    *   `relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card`: This existing styling from the homepage Bento cards will be reused to give a consistent "spotlight" and "border-glow" effect on hover.
    *   **HUD Corner Accents:** Replicate the small corner `div` elements with `border-t-2`, `border-l-2`, etc., to enhance the hardware aesthetic.
*   **Internal Layout:**
    *   **Header:** `div` at the top with a monospaced label (e.g., `<span className="font-mono text-[9px] font-bold text-white tracking-widest uppercase">SYS_UNIT_01 // ANISOTROPIC_DIAL</span>`) and potentially a status indicator.
    *   **Component Display Area:** A central `div` where the actual React component will be rendered. This area should allow the component to breathe and be interactive. We will ensure appropriate scaling or containment if the component is designed for fullscreen.
    *   **Component Description:** A `div` below the component with a `h3` for the component name and a `p` for a brief description, similar to the existing homepage.
    *   **Footer/Stats:** A `div` at the bottom with technical-looking stats or parameters, also monospaced.
*   **Interactivity:**
    *   Each component will be mounted and fully interactive within its card.
    *   For components like `DotMatrix` or `AnisotropicKnob`, we'll include minimal, local controls (e.g., an `input` for text, a `range` slider for values) directly within its card to demonstrate its interactive props.

#### **3. Component Selection and Grid Arrangement**

We will select 12-15 diverse and highly interactive components from our `animated` and `buttons` categories, along with a few key `backgrounds` that can be visually contained.

Here’s a proposed grid arrangement, prioritizing visual impact and interaction, using Tailwind's `md:col-span-X` for responsiveness:

| Component            | Category  | Grid Span (md:col-span-X) | Notes                                                  |
| :------------------- | :-------- | :------------------------ | :----------------------------------------------------- |
| `DotMatrix`          | Animated  | `md:col-span-7`           | Large, interactive text input.                         |
| `AnisotropicKnob`    | Animated  | `md:col-span-5`           | Tactile dial with a custom label.                      |
| `MorphingNav`        | Animated  | `md:col-span-4`           | Interactive SVG morphing menu.                         |
| `ScrollPathProcess`  | Animated  | `md:col-span-8`           | Dynamic scroll-driven path (will be fixed for display). |
| `ExpandOnHover`      | Animated  | `md:col-span-6`           | Image gallery with interactive expansion.              |
| `TextShuffle`        | Animated  | `md:col-span-6`           | Text scrambling effect with word input.                |
| `LivingText`         | Animated  | `md:col-span-7`           | Cursor-reactive text animation.                        |
| `LaserVaultPassword` | Animated  | `md:col-span-5`           | Interactive password input.                            |
| `GravityCardStack`   | Animated  | `md:col-span-6`           | Physics-based card stack (fixed display).              |
| `MetallicForm`       | Animated  | `md:col-span-6`           | Multi-input form with metallic styling.                |
| `WeaponWheel`        | Animated  | `md:col-span-4`           | Interactive radial selection menu.                     |
| `LuxuryButtons`      | Buttons   | `md:col-span-8`           | A grid of `VoidButton`, `BrushedTitaniumButton`, `LiquidGoldButton`, `GuillocheButton`. |
| `SpotlightGrid`      | Background | `md:col-span-12`          | Full-width background as a subtle separator.           |

This selection ensures a mix of inputs, displays, and animated effects to create a truly "live" feeling. We'll use the existing `handleMouseMove` logic for the spotlight effect on each card.
