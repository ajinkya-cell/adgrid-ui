export type ComponentCategory =
  | "animated"
  | "primitives"
  | "charts"
  | "widgets"
  | "buttons"
  | "backgrounds";

export interface PropDefinition {
  name: string;
  type: string;
  default?: string;
  description: string;
  required: boolean;
}

export interface ComponentVariant {
  name: string;
  props: Record<string, unknown>;
}

export interface RegistryEntry {
  name: string;
  slug: string;
  category: ComponentCategory;
  description: string;
  dependencies: string[];
  packagePath: string;       // path inside packages/ui/src
  variants?: ComponentVariant[];
}

export const registry: RegistryEntry[] = [
  {
    name: "Magnetic Button",
    slug: "magnetic-button",
    category: "animated",
    description: "A button that magnetically follows your cursor with spring physics.",
    dependencies: ["framer-motion"],
    packagePath: "animated/MagneticButton.tsx",
    variants: [
      { name: "Default", props: { children: "Hover me", strength: 0.3 } },
      { name: "Strong pull", props: { children: "Strong pull", strength: 0.6 } },
    ],
  },
  {
    name: "Text Reveal",
    slug: "text-reveal",
    category: "animated",
    description: "Words fade in as you scroll past them.",
    dependencies: ["framer-motion"],
    packagePath: "animated/TextReveal.tsx",
  },
  {
    name: "Fade In",
    slug: "fade-in",
    category: "animated",
    description: "Viewport-triggered fade with directional slide.",
    dependencies: ["framer-motion"],
    packagePath: "animated/FadeIn.tsx",
    variants: [
      { name: "Up", props: { direction: "up" } },
      { name: "Left", props: { direction: "left" } },
      { name: "Right", props: { direction: "right" } },
    ],
  },
  {
    name: "Glitch Text",
    slug: "glitch-text",
    category: "animated",
    description: "RGB-split glitch effect on hover.",
    dependencies: [],
    packagePath: "animated/GlitchText.tsx",
  },
  {
    name: "Count Up",
    slug: "count-up",
    category: "animated",
    description: "Animated number counter triggered on scroll into view.",
    dependencies: ["framer-motion"],
    packagePath: "animated/CountUp.tsx",
  },
  {
    name: "Button",
    slug: "button",
    category: "primitives",
    description: "Core button with variant and size support.",
    dependencies: ["clsx", "tailwind-merge"],
    packagePath: "primitives/Button.tsx",
    variants: [
      { name: "Primary", props: { variant: "primary", children: "Primary" } },
      { name: "Ghost", props: { variant: "ghost", children: "Ghost" } },
      { name: "Outline", props: { variant: "outline", children: "Outline" } },
      { name: "Danger", props: { variant: "danger", children: "Delete" } },
    ],
  },
  {
    name: "Card",
    slug: "card",
    category: "primitives",
    description: "Surface card with optional hover state.",
    dependencies: ["clsx", "tailwind-merge"],
    packagePath: "primitives/Card.tsx",
  },
  {
    name: "Image Reveal",
    slug: "image-reveal",
    category: "animated",
    description: "An image reveal effect using diagonal stripes masking and sliding clip-paths.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ImageReveal.tsx",
  },
  {
    name: "Image Stack",
    slug: "image-stack",
    category: "animated",
    description: "A swipeable stack of cards with spring physics and dismiss handlers.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ImageStack.tsx",
  },
  {
    name: "Image Parallax",
    slug: "image-parallax",
    category: "animated",
    description: "A smooth mouse-move and scroll-driven parallax image perspective effect.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ImageParallax.tsx",
  },
  {
    name: "Living Text",
    slug: "living-text",
    category: "animated",
    description: "Stretches, rotates, and pushes characters dynamically based on real-time cursor proximity.",
    dependencies: ["framer-motion"],
    packagePath: "animated/LivingText.tsx",
  },
  {
    name: "Gravity Card Stack",
    slug: "gravity-card-stack",
    category: "animated",
    description: "Falling rigid body physics cards container that reacts to scroll triggers.",
    dependencies: ["matter-js", "gsap"],
    packagePath: "animated/GravityCardStack.tsx",
  },
  {
    name: "Morphing Nav",
    slug: "morphing-nav",
    category: "animated",
    description: "An interactive navigation bar with liquid morphing SVG background shapes.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/MorphingNav.tsx",
  },
  {
    name: "Story Timeline",
    slug: "story-timeline",
    category: "animated",
    description: "A scroll-animated vertical narrative timeline with counting stats and slide-in nodes.",
    dependencies: ["gsap", "lucide-react"],
    packagePath: "animated/StoryTimeline.tsx",
  },
  {
    name: "Void Button",
    slug: "void-button",
    category: "buttons",
    description: "Pure black button that reveals a luxury gold gradient under the cursor via a smooth radial mask.",
    dependencies: ["framer-motion"],
    packagePath: "animated/VoidButton.tsx",
  },
  {
    name: "Brushed Titanium Button",
    slug: "brushed-titanium-button",
    category: "buttons",
    description: "Machined titanium texture with anisotropic highlight sweeps and reactive spotlight illumination.",
    dependencies: ["framer-motion"],
    packagePath: "animated/BrushedTitaniumButton.tsx",
  },
  {
    name: "Liquid Gold Button",
    slug: "liquid-gold-button",
    category: "buttons",
    description: "Conic gradient rotating behind a frosted glass blur layer, with a 1px border that catches light only at the top.",
    dependencies: ["framer-motion"],
    packagePath: "animated/LiquidGoldButton.tsx",
  },
  {
    name: "Guilloche Button",
    slug: "guilloche-button",
    category: "buttons",
    description: "Watch dial Guilloché patterns generating Moire wave shapes under the cursor spotlight.",
    dependencies: ["framer-motion"],
    packagePath: "animated/GuillocheButton.tsx",
  },
  {
    name: "Pixel Melt",
    slug: "pixel-melt",
    category: "backgrounds",
    description: "A full-viewport pixel grid that glows and cools under cursor heat, leaving behind a slow melt trail.",
    dependencies: [],
    packagePath: "backgrounds/PixelMelt.tsx",
  },
  {
    name: "Breathing Grid",
    slug: "breathing-grid",
    category: "backgrounds",
    description: "An orthogonal grid with a slow left-to-right traveling wave, with local brightness boost near the cursor.",
    dependencies: [],
    packagePath: "backgrounds/BreathingGrid.tsx",
  },
  {
    name: "Floating Embers",
    slug: "floating-embers",
    category: "backgrounds",
    description: "Glowing ember particles that float upward with a gentle sway, reacting subtly to cursor and scroll.",
    dependencies: [],
    packagePath: "backgrounds/FloatingEmbers.tsx",
  },
  {
    name: "Scanline Drift",
    slug: "scanline-drift",
    category: "backgrounds",
    description: "A horizontal band of light that drifts across the screen, available in three moods: warm CRT afterglow, ethereal aurora, or zen shimmer.",
    dependencies: [],
    packagePath: "backgrounds/ScanlineDrift.tsx",
  },
];