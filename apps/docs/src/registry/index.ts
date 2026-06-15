export type ComponentCategory =
  | "animated"
  | "primitives"
  | "charts"
  | "widgets";

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
];