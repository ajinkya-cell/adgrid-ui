export type ComponentCategory =
  | "animated"
  | "primitives"
  | "charts"
  | "widgets"
  | "buttons"
  | "backgrounds";

export type DisplayStrategy = "center" | "fullscreen" | "cover" | "fit" | "auto";

export interface PropDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "select" | "color";
  default?: string | number | boolean;
  description: string;
  required: boolean;
  options?: string[];       // for "select" type
  min?: number;            // for "number" type
  max?: number;            // for "number" type
  step?: number;           // for "number" type
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
  packagePath: string;       // path inside packages/ui/src (kept for backward compat)
  files: string[];           // all source files relative to packages/ui/src/ (shadcn registry)
  propDefs?: PropDefinition[]; // tweakable props for the Props Tweaker panel
  variants?: ComponentVariant[];
  presentationStrategy?: DisplayStrategy;
}

export const registry: RegistryEntry[] = [
  {
    name: "Infinite Scroll",
    slug: "infinite-scroll",
    category: "animated",
    description: "Seamless infinite fullscreen scroll with parallax image effects, powered by Lenis smooth scrolling and GSAP scrub animations.",
    dependencies: ["gsap", "lenis"],
    packagePath: "animated/InfiniteScroll.tsx",
    files: ["animated/InfiniteScroll.tsx"],
    presentationStrategy: "fullscreen",
    propDefs: [
      { name: "parallaxPercent", type: "number", default: 50, description: "Parallax vertical offset percentage", required: false, min: 0, max: 100, step: 5 },
      { name: "snapDuration", type: "number", default: 0.9, description: "Snap animation duration in seconds", required: false, min: 0.3, max: 2, step: 0.1 },
      { name: "showProgress", type: "boolean", default: true, description: "Show a minimal dot progress indicator at the bottom", required: false },
      { name: "showLabels", type: "boolean", default: true, description: "Show slide label and caption overlays", required: false },
      { name: "showScrollCue", type: "boolean", default: true, description: "Show a 'Scroll' hint on the first slide", required: false },
      { name: "overlayOpacity", type: "number", default: 0.55, description: "Dark overlay gradient opacity (0 to 1)", required: false, min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    name: "Image Reveal",
    slug: "image-reveal",
    category: "animated",
    description: "An image reveal effect using diagonal stripes masking and sliding clip-paths.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ImageReveal.tsx",
    files: ["animated/ImageReveal.tsx"],
  },
  {
    name: "Image Parallax",
    slug: "image-parallax",
    category: "animated",
    description: "A smooth mouse-move and scroll-driven parallax image perspective effect.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ImageParallax.tsx",
    files: ["animated/ImageParallax.tsx"],
  },
  {
    name: "Living Text",
    slug: "living-text",
    category: "animated",
    description: "Stretches, rotates, and pushes characters dynamically based on real-time cursor proximity.",
    dependencies: ["framer-motion"],
    packagePath: "animated/LivingText.tsx",
    files: ["animated/LivingText.tsx"],
    propDefs: [
      { name: "text", type: "string", default: "LIVING TEXT", description: "Text content to animate", required: true },
      { name: "radius", type: "number", default: 170, description: "Cursor influence radius in px", required: false, min: 50, max: 400, step: 10 },
      { name: "strength", type: "number", default: 46, description: "Movement offset strength in px", required: false, min: 5, max: 120, step: 1 },
      { name: "mode", type: "select", default: "all", description: "Proximity interaction mode", required: false, options: ["repel", "magnetize", "stretch", "rotate", "ripple", "all"] },
      { name: "liquify", type: "boolean", default: true, description: "Apply SVG turbulence liquification filter", required: false },
    ],
  },
  {
    name: "Gravity Card Stack",
    slug: "gravity-card-stack",
    category: "animated",
    description: "Falling rigid body physics cards container that reacts to scroll triggers.",
    dependencies: ["matter-js", "gsap"],
    packagePath: "animated/GravityCardStack.tsx",
    files: ["animated/GravityCardStack.tsx"],
  },
  {
    name: "Morphing Nav",
    slug: "morphing-nav",
    category: "animated",
    description: "An interactive navigation bar with liquid morphing SVG background shapes.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/MorphingNav.tsx",
    files: ["animated/MorphingNav.tsx"],
  },
  {
    name: "Coverflow Carousel",
    slug: "coverflow-carousel",
    category: "animated",
    description: "A hardware-accelerated 3D coverflow carousel with continuous modular perspective transforms and comprehensive gesture tracking.",
    dependencies: ["framer-motion"],
    packagePath: "animated/coverflow/CoverflowCarousel.tsx",
    files: [
      "animated/coverflow/CoverflowCarousel.tsx",
      "animated/coverflow/CoverflowCard.tsx",
      "animated/coverflow/types.ts",
      "animated/coverflow/utils.ts",
      "animated/coverflow/useCoverflow.ts",
    ],
  },
  {
    name: "Void Button",
    slug: "void-button",
    category: "buttons",
    description: "Pure black button that reveals a luxury gold gradient under the cursor via a smooth radial mask.",
    dependencies: ["framer-motion"],
    packagePath: "animated/VoidButton.tsx",
    files: ["animated/VoidButton.tsx"],
    propDefs: [
      { name: "variant", type: "select", default: "ambient", description: "Button style variant", required: false, options: ["ambient", "neon-edge", "metallic-sheen", "glassmorphic", "cyber-laser", "classic-gold"] },
      { name: "children", type: "string", default: "Void Button", description: "Button text label", required: false },
      { name: "disabled", type: "boolean", default: false, description: "Disable button state", required: false }
    ],
  },
  {
    name: "Brushed Titanium Button",
    slug: "brushed-titanium-button",
    category: "buttons",
    description: "Machined titanium texture with anisotropic highlight sweeps and reactive spotlight illumination.",
    dependencies: ["framer-motion"],
    packagePath: "animated/BrushedTitaniumButton.tsx",
    files: ["animated/BrushedTitaniumButton.tsx"],
    propDefs: [
      { name: "children", type: "string", default: "Titanium Button", description: "Button text label", required: false },
      { name: "disabled", type: "boolean", default: false, description: "Disable button state", required: false }
    ],
  },
  {
    name: "Liquid Gold Button",
    slug: "liquid-gold-button",
    category: "buttons",
    description: "Conic gradient rotating behind a frosted glass blur layer, with a 1px border that catches light only at the top.",
    dependencies: ["framer-motion"],
    packagePath: "animated/LiquidGoldButton.tsx",
    files: ["animated/LiquidGoldButton.tsx"],
    propDefs: [
      { name: "children", type: "string", default: "Liquid Gold", description: "Button text label", required: false }
    ],
  },
  {
    name: "Guilloche Button",
    slug: "guilloche-button",
    category: "buttons",
    description: "Watch dial Guilloché patterns generating Moire wave shapes under the cursor spotlight.",
    dependencies: ["framer-motion"],
    packagePath: "animated/GuillocheButton.tsx",
    files: ["animated/GuillocheButton.tsx"],
    propDefs: [
      { name: "children", type: "string", default: "Guilloché", description: "Button text label", required: false }
    ],
  },
  {
    name: "Pixel Melt",
    slug: "pixel-melt",
    category: "backgrounds",
    description: "A full-viewport pixel grid that glows and cools under cursor heat, leaving behind a slow melt trail.",
    dependencies: [],
    packagePath: "backgrounds/PixelMelt.tsx",
    files: ["backgrounds/PixelMelt.tsx"],
    presentationStrategy: "fullscreen",
  },
  {
    name: "Breathing Grid",
    slug: "breathing-grid",
    category: "backgrounds",
    description: "An orthogonal grid with a slow left-to-right traveling wave, with local brightness boost near the cursor.",
    dependencies: [],
    packagePath: "backgrounds/BreathingGrid.tsx",
    files: ["backgrounds/BreathingGrid.tsx"],
    presentationStrategy: "fullscreen",
  },
  {
    name: "Floating Embers",
    slug: "floating-embers",
    category: "backgrounds",
    description: "Glowing ember particles that float upward with a gentle sway, reacting subtly to cursor and scroll.",
    dependencies: [],
    packagePath: "backgrounds/FloatingEmbers.tsx",
    files: ["backgrounds/FloatingEmbers.tsx"],
    presentationStrategy: "fullscreen",
  },
  {
    name: "Spotlight Grid",
    slug: "spotlight-grid",
    category: "backgrounds",
    description: "A dark grid with decorative tech icons and a dual-layer mouse-following spotlight effect using screen and color-dodge blend modes.",
    dependencies: [],
    packagePath: "backgrounds/SpotlightGrid.tsx",
    files: ["backgrounds/SpotlightGrid.tsx"],
    presentationStrategy: "fullscreen",
  },
  {
    name: "Lumina Wave",
    slug: "lumina-wave",
    category: "backgrounds",
    description: "An atmospheric WebGL background rendering undulating wave patterns resembling an aurora, featuring interactive mouse-bending and color personalization.",
    dependencies: [],
    packagePath: "backgrounds/LuminaWave.tsx",
    files: ["backgrounds/LuminaWave.tsx"],
    presentationStrategy: "fullscreen",
  },
  {
    name: "Chrome Input",
    slug: "chrome-input",
    category: "primitives",
    description: "Deep obsidian input with dynamic border glowing highlights and cursor-responsive spotlight tracking.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ChromeInput.tsx",
    files: ["animated/ChromeInput.tsx"],
  },
  {
    name: "Chrome Select",
    slug: "chrome-select",
    category: "primitives",
    description: "Deep obsidian dropdown selector with custom arrow overlays and focus glow animations.",
    dependencies: ["framer-motion"],
    packagePath: "animated/ChromeSelect.tsx",
    files: ["animated/ChromeSelect.tsx"],
  },
  {
    name: "Metallic Form",
    slug: "metallic-form",
    category: "animated",
    description: "A machined-metal obsidian form container with sequential entry animations, validation overlays, and typing state signals.",
    dependencies: ["framer-motion"],
    packagePath: "animated/MetallicForm.tsx",
    files: ["animated/MetallicForm.tsx"],
  },
  {
    name: "Anisotropic Knob",
    slug: "anisotropic-knob",
    category: "primitives",
    description: "Machined metal rotary dial knob component with dynamic rotating anisotropic highlights, snapper increments, and accessibility controls.",
    dependencies: ["framer-motion"],
    packagePath: "animated/AnisotropicKnob.tsx",
    files: ["animated/AnisotropicKnob.tsx"],
  },
  {
    name: "Mechanical Timer",
    slug: "mechanical-timer",
    category: "widgets",
    description: "Machined metal tactile timer/stopwatch component with dragging physical dials, mechanical cogwheel meshes, Web Audio click synthesis ticks, and glowing segment MM:SS.CC timer displays.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/MechanicalTimer.tsx",
    files: ["animated/MechanicalTimer.tsx"],
  },
  {
    name: "Slingshot Chassis",
    slug: "slingshot-chassis",
    category: "animated",
    description: "Elastic-drag container with real-time SVG edge deformation, spring release oscillation solvers, Web Audio snap synthesis, and reveal drawers.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/SlingshotChassis.tsx",
    files: ["animated/SlingshotChassis.tsx"],
  },
  {
    name: "Laser Vault Password",
    slug: "laser-vault-password",
    category: "widgets",
    description: "Passcode vault keypad with laser-etch cooling characters, dynamic cursor sweeps, tactile clicks, container rattles, and friction-metal creak alarms.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/LaserVaultPassword.tsx",
    files: ["animated/LaserVaultPassword.tsx"],
  },
  {
    name: "Premium Hero",
    slug: "premium-hero",
    category: "animated",
    description: "Interactive Hero Section featuring floating 3D cards, typewriter search, spring CTA, and paper-notebook grid aesthetics.",
    dependencies: ["framer-motion", "lucide-react"],
    packagePath: "animated/PremiumHero.tsx",
    files: ["animated/PremiumHero.tsx"],
    presentationStrategy: "cover",
  },
  {
    name: "Dot Matrix",
    slug: "dot-matrix",
    category: "animated",
    description: "Highly optimized, programmable LED dot matrix display supporting Perlin noise, typewriter bitmaps, Web Audio integration, interactive cursor repelling, and custom plugin architectures.",
    dependencies: ["framer-motion"],
    packagePath: "animated/DotMatrix.tsx",
    files: [
      "matrix/DotMatrix.tsx",
      "matrix/Dot.tsx",
      "matrix/types.ts",
      "matrix/animations/plugins.ts",
      "matrix/animations/index.ts",
      "matrix/hooks/useMouseInfluence.ts",
      "matrix/hooks/useRAF.ts",
      "matrix/utils/distance.ts",
      "matrix/utils/noise.ts",
      "matrix/utils/bitmap.ts",
    ],
    propDefs: [
      { name: "animation", type: "select", default: "scroll-text", description: "Animation mode", required: false, options: ["wave", "text", "scroll-text", "clock", "equalizer", "noise", "sparkle", "ripple", "snake", "rain"] },
      { name: "text", type: "string", default: "VOID UI", description: "Text content (for text/scroll-text modes)", required: false },
      { name: "columns", type: "number", default: 44, description: "Number of dot columns", required: false, min: 10, max: 80, step: 1 },
      { name: "rows", type: "number", default: 12, description: "Number of dot rows", required: false, min: 4, max: 24, step: 1 },
      { name: "color", type: "color", default: "#e7e5df", description: "Active dot color", required: false },
      { name: "speed", type: "number", default: 1, description: "Animation speed multiplier", required: false, min: 0.1, max: 5, step: 0.1 },
      { name: "glow", type: "boolean", default: true, description: "Enable glow effect on dots", required: false },
    ],
  },
  {
    name: "Scroll Progress",
    slug: "scroll-progress",
    category: "animated",
    description: "A vertical dynamic scrollbar overlay with interactive tick mark animations, dragging controls, and velocity-based stretching/glow.",
    dependencies: ["framer-motion"],
    packagePath: "animated/scrollprogress/ScrollProgress.tsx",
    files: [
      "animated/scrollprogress/ScrollProgress.tsx",
      "animated/scrollprogress/Tick.tsx",
      "animated/scrollprogress/useScrollProgress.ts",
      "animated/scrollprogress/types.ts",
      "animated/scrollprogress/utils.ts",
    ],
    propDefs: [
      { name: "ticks", type: "number", default: 42, description: "Number of vertical tick marks", required: false, min: 10, max: 100, step: 1 },
      { name: "color", type: "color", default: "#a855f7", description: "Color of the active scroll indicator", required: false },
      { name: "glow", type: "boolean", default: true, description: "Enable glow halo around the active indicator", required: false },
      { name: "height", type: "number", default: 44, description: "Thickness (width) of the scrollbar in pixels", required: false, min: 20, max: 100, step: 2 },
      { name: "width", type: "number", default: 320, description: "Length (height) of the scrollbar in pixels", required: false, min: 150, max: 600, step: 10 },
    ],
  },
  {
    name: "Now Playing Card",
    slug: "now-playing-card",
    category: "animated",
    description: "A Spotify-style vinyl player card powered by Last.fm API that dynamically retrieves real-time listening history with vinyl spin animations.",
    dependencies: ["react-icons"],
    packagePath: "animated/NowPlayingCard.tsx",
    files: ["animated/NowPlayingCard.tsx"],
  },
  {
    name: "Wheel Picker",
    slug: "wheel-picker",
    category: "animated",
    description: "Premium physical-feeling 3D wheel picker with momentum dragging, spring snapping, and mechanical Web Audio crown clicks.",
    dependencies: ["framer-motion"],
    packagePath: "animated/WheelPicker.tsx",
    files: [
      "animated/WheelPicker.tsx",
      "animated/react-wheel-picker/index.ts",
      "animated/react-wheel-picker/types.ts",
      "animated/react-wheel-picker/components/WheelPicker.tsx",
      "animated/react-wheel-picker/components/Cylinder.tsx",
      "animated/react-wheel-picker/components/WheelItem.tsx",
      "animated/react-wheel-picker/components/SelectionOverlay.tsx",
      "animated/react-wheel-picker/hooks/useCylinderTransform.ts",
      "animated/react-wheel-picker/hooks/useInfiniteLoop.ts",
      "animated/react-wheel-picker/hooks/useAudio.ts",
      "animated/react-wheel-picker/hooks/useWheel.ts",
      "animated/react-wheel-picker/hooks/useMomentum.ts",
      "animated/react-wheel-picker/hooks/useSnap.ts",
      "animated/react-wheel-picker/utils/physics.ts",
      "animated/react-wheel-picker/utils/audio.ts",
      "animated/react-wheel-picker/utils/math.ts",
    ],
    propDefs: [
      { name: "variant", type: "select", default: "glass", description: "Visual style of the picker", required: false, options: ["glass", "minimal"] },
      { name: "loop", type: "boolean", default: false, description: "Allow infinite looping through items", required: false },
      { name: "sound", type: "boolean", default: true, description: "Play mechanical click sound on selection change", required: false },
      { name: "disabled", type: "boolean", default: false, description: "Disable interaction and pointer events", required: false },
      { name: "itemHeight", type: "number", default: 50, description: "Height of each item in pixels", required: false, min: 20, max: 100, step: 1 },
      { name: "visibleItems", type: "number", default: 5, description: "Number of visible items in the viewport", required: false, min: 3, max: 11, step: 1 },
      { name: "perspective", type: "number", default: 1000, description: "3D perspective depth in pixels", required: false, min: 200, max: 2000, step: 50 },
    ],
  },
  {
    name: "Expand On Hover",
    slug: "expand-on-hover",
    category: "animated",
    description: "A stack of compact preview cards that smoothly expand into immersive content panels on hover, featuring physical parting animations and 3D pointer tracking.",
    dependencies: ["framer-motion"],
    packagePath: "animated/expand-on-hover/components/expand-on-hover/ExpandOnHover.tsx",
    files: [
      "animated/expand-on-hover/index.ts",
      "animated/expand-on-hover/types.ts",
      "animated/expand-on-hover/hooks/useExpand.ts",
      "animated/expand-on-hover/components/expand-on-hover/ExpandOnHover.tsx",
      "animated/expand-on-hover/components/expand-on-hover/Preview.tsx",
      "animated/expand-on-hover/components/expand-on-hover/CardContent.tsx",
      "animated/expand-on-hover/components/expand-on-hover/ExpandCard.tsx",
    ],
  },
  {
    name: "Text Shuffle",
    slug: "text-shuffle",
    category: "animated",
    description: "A text animation component that shuffles characters with multiple variants including cipher, scramble, and typewriter effects.",
    dependencies: ["framer-motion"],
    packagePath: "animated/text-shuffle/TextShuffle.tsx",
    files: [
      "animated/text-shuffle/index.ts",
      "animated/text-shuffle/TextShuffle.tsx",
      "animated/text-shuffle/AnimatedWord.tsx",
      "animated/text-shuffle/types.ts",
      "animated/text-shuffle/hooks/useShuffleVariants.ts",
      "animated/text-shuffle/hooks/useShuffleCycle.ts",
      "animated/text-shuffle/utils/splitCharacters.ts",
      "animated/text-shuffle/utils/timing.ts",
    ],
    propDefs: [
      { name: "variant", type: "select", default: "blurReveal", description: "Visual morph variant", required: false, options: ["scramble", "wave", "glitch", "elastic", "flipIn", "blurReveal"] },
      { name: "duration", type: "number", default: 2200, description: "Display duration per word (ms)", required: false, min: 500, max: 8000, step: 100 },
      { name: "transition", type: "number", default: 700, description: "Transition duration between words (ms)", required: false, min: 100, max: 2000, step: 50 },
      { name: "loop", type: "boolean", default: true, description: "Loop cycling infinitely", required: false },
      { name: "pauseOnHover", type: "boolean", default: false, description: "Pause on hover", required: false },
      { name: "cursorBlink", type: "boolean", default: false, description: "Show blinking cursor", required: false },
      { name: "uppercase", type: "boolean", default: false, description: "Force uppercase", required: false },
      { name: "outline", type: "boolean", default: false, description: "Render text as outline stroke", required: false },
      { name: "fontSize", type: "string", default: "clamp(2.5rem,8vw,6rem)", description: "Font size CSS value", required: false },
    ],
  },
  {
    name: "Cards",
    slug: "cards",
    category: "animated",
    description: "A fanned deck of dark editorial cards with B&W images, prismatic top-border highlights, spring-physics animations, and an expand-on-click description reveal.",
    dependencies: ["framer-motion"],
    packagePath: "animated/Cards.tsx",
    files: ["animated/Cards.tsx"],
    presentationStrategy: "center",
  },
  {
    name: "Simple Card",
    slug: "simple-card",
    category: "animated",
    description: "A single dark editorial card with a padded B&W image, prismatic top-border highlight, Instrument Serif title pinned to the bottom, and an expand-on-click description reveal.",
    dependencies: ["framer-motion"],
    packagePath: "animated/SimpleCard.tsx",
    files: ["animated/SimpleCard.tsx"],
    presentationStrategy: "center",
  },
];
