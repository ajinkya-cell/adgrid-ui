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
    name: "Image Reveal",
    slug: "image-reveal",
    category: "animated",
    description: "An image reveal effect using diagonal stripes masking and sliding clip-paths.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ImageReveal.tsx",
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
    name: "Coverflow Carousel",
    slug: "coverflow-carousel",
    category: "animated",
    description: "A hardware-accelerated 3D coverflow carousel with continuous modular perspective transforms and comprehensive gesture tracking.",
    dependencies: ["framer-motion"],
    packagePath: "animated/coverflow/CoverflowCarousel.tsx",
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
    name: "Spotlight Grid",
    slug: "spotlight-grid",
    category: "backgrounds",
    description: "A dark grid with decorative tech icons and a dual-layer mouse-following spotlight effect using screen and color-dodge blend modes.",
    dependencies: [],
    packagePath: "backgrounds/SpotlightGrid.tsx",
  },
  {
    name: "Lumina Wave",
    slug: "lumina-wave",
    category: "backgrounds",
    description: "An atmospheric WebGL background rendering undulating wave patterns resembling an aurora, featuring interactive mouse-bending and color personalization.",
    dependencies: [],
    packagePath: "backgrounds/LuminaWave.tsx",
  },
  {
    name: "Chrome Input",
    slug: "chrome-input",
    category: "primitives",
    description: "Deep obsidian input with dynamic border glowing highlights and cursor-responsive spotlight tracking.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ChromeInput.tsx",
  },
  {
    name: "Chrome Select",
    slug: "chrome-select",
    category: "primitives",
    description: "Deep obsidian dropdown selector with custom arrow overlays and focus glow animations.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ChromeSelect.tsx",
  },
  {
    name: "Metallic Form",
    slug: "metallic-form",
    category: "animated",
    description: "A machined-metal obsidian form container with sequential entry animations, validation overlays, and typing state signals.",
    dependencies: ["framer-motion"],
    packagePath: "animated/MetallicForm.tsx",
  },
  {
    name: "Anisotropic Knob",
    slug: "anisotropic-knob",
    category: "primitives",
    description: "Machined metal rotary dial knob component with dynamic rotating anisotropic highlights, snapper increments, and accessibility controls.",
    dependencies: ["framer-motion"],
    packagePath: "animated/AnisotropicKnob.tsx",
  },
  {
    name: "Mechanical Timer",
    slug: "mechanical-timer",
    category: "widgets",
    description: "Machined metal tactile timer/stopwatch component with dragging physical dials, mechanical cogwheel meshes, Web Audio click synthesis ticks, and glowing segment MM:SS.CC timer displays.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/MechanicalTimer.tsx",
  },

  {
    name: "Slingshot Chassis",
    slug: "slingshot-chassis",
    category: "animated",
    description: "Elastic-drag container with real-time SVG edge deformation, spring release oscillation solvers, Web Audio snap synthesis, and reveal drawers.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/SlingshotChassis.tsx",
  },
  {
    name: "Laser Vault Password",
    slug: "laser-vault-password",
    category: "widgets",
    description: "Passcode vault keypad with laser-etch cooling characters, dynamic cursor sweeps, tactile clicks, container rattles, and friction-metal creak alarms.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/LaserVaultPassword.tsx",
  },
  {
    name: "Premium Hero",
    slug: "premium-hero",
    category: "animated",
    description: "Interactive Hero Section featuring floating 3D cards, typewriter search, spring CTA, and paper-notebook grid aesthetics.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/PremiumHero.tsx",
  },
  {
    name: "Dot Matrix",
    slug: "dot-matrix",
    category: "animated",
    description: "Highly optimized, programmable LED dot matrix display supporting Perlin noise, typewriter bitmaps, Web Audio integration, interactive cursor repelling, and custom plugin architectures.",
    dependencies: ["framer-motion"],
    packagePath: "animated/DotMatrix.tsx",
  },
  {
    name: "Scroll Progress",
    slug: "scroll-progress",
    category: "animated",
    description: "A vertical dynamic scrollbar overlay with interactive tick mark animations, dragging controls, and velocity-based stretching/glow.",
    dependencies: ["framer-motion"],
    packagePath: "animated/scrollprogress/ScrollProgress.tsx",
  },
  {
    name: "Now Playing Card",
    slug: "now-playing-card",
    category: "animated",
    description: "A Spotify-style vinyl player card powered by Last.fm API that dynamically retrieves real-time listening history with vinyl spin animations.",
    dependencies: ["react-icons"],
    packagePath: "animated/NowPlayingCard.tsx",
  },
  {
    name: "Wheel Picker",
    slug: "wheel-picker",
    category: "animated",
    description: "Premium physical-feeling 3D wheel picker with momentum dragging, spring snapping, and mechanical Web Audio crown clicks.",
    dependencies: ["framer-motion"],
    packagePath: "animated/WheelPicker.tsx",
  },
  {
    name: "Expand On Hover",
    slug: "expand-on-hover",
    category: "animated",
    description: "A stack of compact preview cards that smoothly expand into immersive content panels on hover, featuring physical parting animations and 3D pointer tracking.",
    dependencies: ["framer-motion"],
    packagePath: "animated/expand-on-hover/components/expand-on-hover/ExpandOnHover.tsx",
  },
];