import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { codeToHtml } from "shiki";
import { registry } from "@/registry";
import { ComponentTabs } from "@/components/site/ComponentTabs";
import { Sidebar } from "@/components/site/Sidebar";
import { PropsTable } from "@/components/site/PropsTable";
import { Footer } from "@/components/site/Footer";
import {
  ComponentPageProvider,
  ComponentPageMain,
  ComponentPageSidebar,
  WideViewToggle,
} from "@/components/site/ComponentPageLayout";
import type { PropDefinition } from "@/components/site/PropsEditor";

const PROP_SCHEMAS: Record<string, PropDefinition[]> = {
  "image-reveal": [
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
  ],
  "living-text": [
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
  ],

  "lumina-wave": [
    { name: "speed", type: "number", label: "Speed", defaultValue: 1.0, min: 0.1, max: 5.0, step: 0.1 },
    { name: "intensity", type: "number", label: "Intensity", defaultValue: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    { name: "colorPrimary", type: "color", label: "Primary Color", defaultValue: "#2563eb" },
    { name: "colorSecondary", type: "color", label: "Secondary Color", defaultValue: "#6610f2" },
    { name: "mouseReactivity", type: "number", label: "Mouse Reactivity", defaultValue: 0.5, min: 0.0, max: 2.0, step: 0.1 },
    { name: "quality", type: "select", label: "Quality", defaultValue: "medium", options: [
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ]},
  ],
  "void-button": [
    { name: "children", type: "string", label: "Label", defaultValue: "THE VOID" },
    { name: "variant", type: "select", label: "Variant", defaultValue: "ambient", options: [
      { label: "Ambient Silver", value: "ambient" },
      { label: "Classic Gold", value: "classic-gold" },
      { label: "Neon Edge", value: "neon-edge" },
      { label: "Metallic Sheen", value: "metallic-sheen" },
      { label: "Glassmorphic", value: "glassmorphic" },
      { label: "Cyber Laser", value: "cyber-laser" },
    ]}
  ],
  "brushed-titanium-button": [
    { name: "children", type: "string", label: "Label", defaultValue: "TITANIUM" }
  ],
  "liquid-gold-button": [
    { name: "children", type: "string", label: "Label", defaultValue: "LIQUID GOLD" }
  ],
  "guilloche-button": [
    { name: "children", type: "string", label: "Label", defaultValue: "GUILLOCHÉ" }
  ],
  "image-parallax": [
    { name: "src", type: "string", label: "Image URL", defaultValue: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80", required: true },
    { name: "alt", type: "string", label: "Alt Text", defaultValue: "Aerial mountain landscape", required: true },
    { name: "height", type: "number", label: "Height", defaultValue: 320, min: 100, max: 800, step: 10 },
    { name: "depth", type: "number", label: "Depth", defaultValue: 40, min: 5, max: 150, step: 5 },
    { name: "overlayColor", type: "color", label: "Overlay Color", defaultValue: "#000000" },
    { name: "caption", type: "string", label: "Caption", defaultValue: "Above the Clouds" },
    { name: "subcaption", type: "string", label: "Subcaption", defaultValue: "Aerial landscape · Swiss Alps" },
    { name: "mode", type: "select", label: "Mode", defaultValue: "mouse", options: [
      { label: "Mouse", value: "mouse" },
      { label: "Scroll", value: "scroll" },
    ]},
  ],
  "anisotropic-knob": [
    { name: "variant", type: "select", label: "Variant", defaultValue: "slider", options: [
      { label: "Slider (Bounded)", value: "slider" },
      { label: "Infinite (Unbounded)", value: "infinite" },
    ]},
    { name: "size", type: "number", label: "Size (Diameter)", defaultValue: 112, min: 64, max: 200, step: 8 },
    { name: "label", type: "string", label: "Descriptor Label", defaultValue: "DECIBELS" },
  ],
  "coverflow-carousel": [],
  "dot-matrix": [
    { name: "animation", type: "select", label: "Animation Mode", defaultValue: "wave", options: [
      { label: "Diagonal Wave", value: "wave" },
      { label: "Random Twinkle", value: "random" },
      { label: "Perlin Simplex Noise", value: "noise" },
      { label: "Breathing Pulse", value: "pulse" },
      { label: "Meteor Sparkles", value: "sparkle" },
      { label: "Center Ripple Wave", value: "ripple" },
      { label: "Retro Snake Game", value: "snake" },
      { label: "Digital Matrix Rain", value: "rain" },
      { label: "Centered Static Text", value: "text" },
      { label: "Scrolling Marquee Text", value: "scroll-text" },
      { label: "Real-Time Digital Clock", value: "clock" },
      { label: "Equalizer Simulation", value: "equalizer" },
      { label: "Live Audio Analyzer", value: "audio" },
    ]},
    { name: "rows", type: "number", label: "Grid Rows", defaultValue: 12, min: 6, max: 24, step: 1 },
    { name: "columns", type: "number", label: "Grid Columns", defaultValue: 40, min: 12, max: 60, step: 1 },
    { name: "dotSize", type: "number", label: "Dot Size (px)", defaultValue: 16, min: 6, max: 30, step: 1 },
    { name: "gap", type: "number", label: "Dot Gap (px)", defaultValue: 6, min: 2, max: 15, step: 1 },
    { name: "color", type: "color", label: "LED Active Color", defaultValue: "#e2f5fd" },
    { name: "inactiveColor", type: "color", label: "LED Inactive Color", defaultValue: "#1e1e24" },
    { name: "text", type: "string", label: "Display Text", defaultValue: "KINETIC" },
    { name: "speed", type: "number", label: "Animation Speed", defaultValue: 1.0, min: 0.1, max: 5.0, step: 0.1 },
    { name: "glow", type: "boolean", label: "LED Ambient Glow", defaultValue: true },
    { name: "blur", type: "number", label: "Glow Blur (px)", defaultValue: 12, min: 0, max: 30, step: 1 },
  ],
  "scroll-progress": [
    { name: "ticks", type: "number", label: "Ticks", defaultValue: 42, min: 10, max: 100, step: 1 },
    { name: "color", type: "color", label: "Color", defaultValue: "#a855f7" },
    { name: "glow", type: "boolean", label: "Neon Glow", defaultValue: true },
    { name: "height", type: "number", label: "Thickness (px)", defaultValue: 44, min: 20, max: 100, step: 2 },
    { name: "width", type: "number", label: "Height (px)", defaultValue: 320, min: 100, max: 600, step: 10 },
    { name: "variant", type: "select", label: "Variant", defaultValue: "default", options: [
      { label: "Default", value: "default" },
      { label: "Inverted", value: "inverted" },
      { label: "Prominent", value: "prominent" },
    ] },
  ],
  "now-playing-card": [],
  "text-shuffle": [
    { name: "variant", type: "select", label: "Animation Variant", defaultValue: "wave", options: [
      { label: "Wave", value: "wave" },
      { label: "Glitch", value: "glitch" },
      { label: "Elastic", value: "elastic" },
      { label: "Flip In", value: "flipIn" },
      { label: "Blur Reveal", value: "blurReveal" },
    ]},
    { name: "duration", type: "number", label: "Cycle Duration (ms)", defaultValue: 2200, min: 1000, max: 5000, step: 100 },
    { name: "transition", type: "number", label: "Transition Speed (ms)", defaultValue: 700, min: 200, max: 2000, step: 100 },
    { name: "fontSize", type: "string", label: "Font Size", defaultValue: "2.5rem" },
    { name: "fontWeight", type: "number", label: "Font Weight", defaultValue: 700, min: 100, max: 900, step: 100 },
    { name: "loop", type: "boolean", label: "Loop Animation", defaultValue: true },
    { name: "pauseOnHover", type: "boolean", label: "Pause On Hover", defaultValue: false },
  ],
  "wheel-picker": [
    { name: "variant", type: "select", label: "Variant", defaultValue: "glass", options: [
      { label: "Glassmorphism", value: "glass" },
      { label: "Minimalist", value: "minimal" },
      { label: "Time Selector", value: "time-selector" },
    ] },
    { name: "loop", type: "boolean", label: "Infinite Loop", defaultValue: true },
    { name: "sound", type: "boolean", label: "Tick Sound", defaultValue: true },
    { name: "itemHeight", type: "number", label: "Item Height (px)", defaultValue: 50, min: 30, max: 80, step: 2 },
    { name: "visibleItems", type: "number", label: "Visible Count", defaultValue: 5, min: 3, max: 9, step: 2 },
  ],
  "expand-on-hover": [
    { name: "variant", type: "select", label: "Variant", defaultValue: "modern", options: [
      { label: "Modern (Glass + Shadow)", value: "modern" },
      { label: "Minimal (Flat + Border)", value: "minimal" },
    ] },
    { name: "animation", type: "select", label: "Animation Physics", defaultValue: "spring", options: [
      { label: "Spring Physics", value: "spring" },
      { label: "Smooth Ease", value: "smooth" },
    ] },
    { name: "expandHeight", type: "number", label: "Expanded Height (px)", defaultValue: 420, min: 250, max: 600, step: 10 },
    { name: "collapsedHeight", type: "number", label: "Collapsed Height (px)", defaultValue: 52, min: 30, max: 100, step: 2 },
    { name: "gap", type: "number", label: "Card Gap (px)", defaultValue: 12, min: 4, max: 32, step: 2 },
    { name: "borderRadius", type: "number", label: "Border Radius (px)", defaultValue: 24, min: 0, max: 48, step: 2 },
    { name: "hoverDelay", type: "number", label: "Hover Delay (ms)", defaultValue: 50, min: 0, max: 500, step: 10 },
    { name: "clickToExpand", type: "boolean", label: "Click to Expand", defaultValue: false },
    { name: "autoCollapseOnLeave", type: "boolean", label: "Auto Collapse On Leave", defaultValue: true },
  ],
};

// extract props from TSDoc comments in source
function extractProps(code: string) {
  const props: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
    required: boolean;
  }> = [];
  const regex = /\/\*\*\s*(.*?)\s*\*\/\s*\n\s+(\w+)\??\s*:\s*([^;]+);/gs;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const [, description, name, type] = match;
    props.push({
      name,
      type: type.trim(),
      description: description.trim(),
      required: !match[0].includes("?"),
    });
  }
  return props;
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const entry = registry.find(
    (c) => c.slug === slug && c.category === category
  );
  if (!entry) notFound();

  const srcDir = path.join(process.cwd(), "../../packages/ui/src");

  const rawCode = fs.readFileSync(
    path.join(srcDir, entry.packagePath),
    "utf-8"
  );

  const utilsPath = path.join(srcDir, "lib/utils.ts");
  const utilsCode = fs.existsSync(utilsPath)
    ? fs.readFileSync(utilsPath, "utf-8")
    : null;

  const additionalFiles: Record<string, string> = {};
  if (utilsCode && rawCode.includes("../lib/utils")) {
    additionalFiles["/lib/utils.ts"] = utilsCode;
  }

  // Load nested component dependencies for MetallicForm
  if (entry.slug === "metallic-form") {
    const chromeInputPath = path.join(srcDir, "animated/ChromeInput.tsx");
    const chromeSelectPath = path.join(srcDir, "animated/ChromeSelect.tsx");
    const brushedTitaniumButtonPath = path.join(srcDir, "animated/BrushedTitaniumButton.tsx");

    if (fs.existsSync(chromeInputPath)) {
      additionalFiles["/ChromeInput.tsx"] = fs.readFileSync(chromeInputPath, "utf-8");
    }
    if (fs.existsSync(chromeSelectPath)) {
      additionalFiles["/ChromeSelect.tsx"] = fs.readFileSync(chromeSelectPath, "utf-8");
    }
    if (fs.existsSync(brushedTitaniumButtonPath)) {
      additionalFiles["/BrushedTitaniumButton.tsx"] = fs.readFileSync(brushedTitaniumButtonPath, "utf-8");
    }
  }

  // Load nested component dependencies for CoverflowCarousel
  if (entry.slug === "coverflow-carousel") {
    const coverflowDir = path.join(srcDir, "animated/coverflow");
    const files = ["types.ts", "utils.ts", "useCoverflow.ts", "CoverflowCard.tsx"];
    files.forEach((file) => {
      const filePath = path.join(coverflowDir, file);
      if (fs.existsSync(filePath)) {
        additionalFiles[`/${file}`] = fs.readFileSync(filePath, "utf-8");
      }
    });
  }

  // Load nested component dependencies for ScrollProgress
  if (entry.slug === "scroll-progress") {
    const scrollProgressDir = path.join(srcDir, "animated/scrollprogress");
    const files = ["types.ts", "utils.ts", "useScrollProgress.ts", "Tick.tsx"];
    files.forEach((file) => {
      const filePath = path.join(scrollProgressDir, file);
      if (fs.existsSync(filePath)) {
        additionalFiles[`/${file}`] = fs.readFileSync(filePath, "utf-8");
      }
    });
  }

  // Load nested component dependencies for ExpandOnHover
  if (entry.slug === "expand-on-hover") {
    const expandDir = path.join(srcDir, "animated/expand-on-hover");
    const files = [
      { localPath: "types.ts", sandboxPath: "/types.ts" },
      { localPath: "hooks/useExpand.ts", sandboxPath: "/hooks/useExpand.ts" },
      { localPath: "components/expand-on-hover/Preview.tsx", sandboxPath: "/components/expand-on-hover/Preview.tsx" },
      { localPath: "components/expand-on-hover/CardContent.tsx", sandboxPath: "/components/expand-on-hover/CardContent.tsx" },
      { localPath: "components/expand-on-hover/ExpandCard.tsx", sandboxPath: "/components/expand-on-hover/ExpandCard.tsx" },
      { localPath: "components/expand-on-hover/ExpandOnHover.tsx", sandboxPath: "/components/expand-on-hover/ExpandOnHover.tsx" }
    ];
    files.forEach(({ localPath, sandboxPath }) => {
      const filePath = path.join(expandDir, localPath);
      if (fs.existsSync(filePath)) {
        additionalFiles[sandboxPath] = fs.readFileSync(filePath, "utf-8");
      }
    });
  }

  // Load nested component dependencies for TextShuffle
  if (entry.slug === "text-shuffle") {
    const shuffleDir = path.join(srcDir, "animated/text-shuffle");
    const files = [
      { localPath: "types.ts",                          sandboxPath: "/types.ts" },
      { localPath: "AnimatedWord.tsx",                  sandboxPath: "/AnimatedWord.tsx" },
      { localPath: "hooks/useShuffleVariants.ts",       sandboxPath: "/hooks/useShuffleVariants.ts" },
      { localPath: "hooks/useShuffleCycle.ts",          sandboxPath: "/hooks/useShuffleCycle.ts" },
      { localPath: "utils/splitCharacters.ts",          sandboxPath: "/utils/splitCharacters.ts" },
      { localPath: "utils/timing.ts",                   sandboxPath: "/utils/timing.ts" },
    ];
    files.forEach(({ localPath, sandboxPath }) => {
      const filePath = path.join(shuffleDir, localPath);
      if (fs.existsSync(filePath)) {
        additionalFiles[sandboxPath] = fs.readFileSync(filePath, "utf-8");
      }
    });
  }

  // Load nested component dependencies for WheelPicker
  if (entry.slug === "wheel-picker") {
    const rwpDir = path.join(srcDir, "animated/react-wheel-picker");
    const files = [
      { localPath: "index.ts",                                sandboxPath: "/react-wheel-picker/index.ts" },
      { localPath: "types.ts",                                sandboxPath: "/react-wheel-picker/types.ts" },
      { localPath: "components/WheelPicker.tsx",              sandboxPath: "/react-wheel-picker/components/WheelPicker.tsx" },
      { localPath: "components/Cylinder.tsx",                 sandboxPath: "/react-wheel-picker/components/Cylinder.tsx" },
      { localPath: "components/WheelItem.tsx",                sandboxPath: "/react-wheel-picker/components/WheelItem.tsx" },
      { localPath: "components/SelectionOverlay.tsx",         sandboxPath: "/react-wheel-picker/components/SelectionOverlay.tsx" },
      { localPath: "hooks/useCylinderTransform.ts",           sandboxPath: "/react-wheel-picker/hooks/useCylinderTransform.ts" },
      { localPath: "hooks/useInfiniteLoop.ts",                sandboxPath: "/react-wheel-picker/hooks/useInfiniteLoop.ts" },
      { localPath: "hooks/useAudio.ts",                       sandboxPath: "/react-wheel-picker/hooks/useAudio.ts" },
      { localPath: "hooks/useWheel.ts",                       sandboxPath: "/react-wheel-picker/hooks/useWheel.ts" },
      { localPath: "hooks/useMomentum.ts",                    sandboxPath: "/react-wheel-picker/hooks/useMomentum.ts" },
      { localPath: "hooks/useSnap.ts",                        sandboxPath: "/react-wheel-picker/hooks/useSnap.ts" },
      { localPath: "utils/physics.ts",                        sandboxPath: "/react-wheel-picker/utils/physics.ts" },
      { localPath: "utils/audio.ts",                          sandboxPath: "/react-wheel-picker/utils/audio.ts" },
      { localPath: "utils/math.ts",                           sandboxPath: "/react-wheel-picker/utils/math.ts" },
    ];
    files.forEach(({ localPath, sandboxPath }) => {
      const filePath = path.join(rwpDir, localPath);
      if (fs.existsSync(filePath)) {
        additionalFiles[sandboxPath] = fs.readFileSync(filePath, "utf-8");
      }
    });
  }

  // Load nested component dependencies for DotMatrix
  if (entry.slug === "dot-matrix") {
    const matrixDir = path.join(srcDir, "matrix");
    const files = [
      { localPath: "Dot.tsx",                        sandboxPath: "/matrix/Dot.tsx" },
      { localPath: "types.ts",                       sandboxPath: "/matrix/types.ts" },
      { localPath: "animations/plugins.ts",          sandboxPath: "/matrix/animations/plugins.ts" },
      { localPath: "animations/index.ts",            sandboxPath: "/matrix/animations/index.ts" },
      { localPath: "hooks/useMouseInfluence.ts",     sandboxPath: "/matrix/hooks/useMouseInfluence.ts" },
      { localPath: "hooks/useRAF.ts",                sandboxPath: "/matrix/hooks/useRAF.ts" },
      { localPath: "utils/distance.ts",              sandboxPath: "/matrix/utils/distance.ts" },
      { localPath: "utils/noise.ts",                 sandboxPath: "/matrix/utils/noise.ts" },
      { localPath: "utils/bitmap.ts",                sandboxPath: "/matrix/utils/bitmap.ts" },
      { localPath: "DotMatrix.tsx",                  sandboxPath: "/matrix/DotMatrix.tsx" },
    ];
    files.forEach(({ localPath, sandboxPath }) => {
      const filePath = path.join(matrixDir, localPath);
      if (fs.existsSync(filePath)) {
        additionalFiles[sandboxPath] = fs.readFileSync(filePath, "utf-8");
      }
    });
  }

  const editableProps = PROP_SCHEMAS[entry.slug];
  let appCode: string | undefined;
  const componentName = entry.name.replace(/\s/g, "");
  
  if (entry.slug === "metallic-form") {
    appCode = `
import { MetallicForm } from "./MetallicForm";

export default function App() {
  const fields = [
    { name: "name", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
    { name: "email", label: "Email Address", type: "email", required: true, placeholder: "john@example.com" },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: [
        { value: "engineering", label: "Engineering" },
        { value: "design", label: "Design" },
        { value: "ops", label: "Operations" }
      ]
    },
    { name: "message", label: "Message", type: "textarea", placeholder: "Tell us about your project..." }
  ];

  const handleSubmit = (data: any) => {
    console.log("Form Submitted:", data);
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
    }}>
      <MetallicForm
        title="Metallic Intake"
        subtitle="Secure encrypted telemetry transmission portal"
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="TRANSMIT DATA"
      />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "anisotropic-knob") {
    appCode = `
import { AnisotropicKnob } from "./AnisotropicKnob";
import { useState } from "react";

export default function App() {
  const [vol, setVol] = useState(40);
  const [freq, setFreq] = useState(0);

  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      gap: "2rem",
      color: "#fff"
    }}>
      {/* Decorative Bezel Chassis */}
      <div style={{
        background: "linear-gradient(135deg, #0a0a0d 0%, #121215 100%)",
        border: "1px solid #1a1a1f",
        padding: "3rem",
        borderRadius: "1rem",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.8)",
        display: "flex",
        gap: "4rem",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap"
      }}>
        {/* Bounded Knob */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <AnisotropicKnob
            variant="slider"
            min={0}
            max={100}
            value={vol}
            onChange={setVol}
            step={1}
            label="MASTER VOLUME"
          />
          <div style={{ marginTop: "1rem", opacity: 0.4, fontSize: "9px", fontFamily: "monospace" }}>
            RANGE: 0 - 100 Snaps
          </div>
        </div>

        {/* Vertical Divider */}
        <div style={{ width: "1px", height: "120px", background: "rgba(255,255,255,0.06)" }} className="hidden md:block" />

        {/* Infinite Knob */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <AnisotropicKnob
            variant="infinite"
            value={freq}
            onChange={setFreq}
            step={5}
            label="TUNING FREQ"
          />
          <div style={{ marginTop: "1rem", opacity: 0.4, fontSize: "9px", fontFamily: "monospace" }}>
            REVOLUTIONS: UNBOUNDED
          </div>
        </div>
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "mechanical-timer") {
    appCode = `
import { MechanicalTimer } from "./MechanicalTimer";

export default function App() {
  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      color: "#fff"
    }}>
      <MechanicalTimer />
    </div>
  );
}
`.trim();

  } else if (entry.slug === "slingshot-chassis") {
    appCode = `
import { SlingshotChassis } from "./SlingshotChassis";

export default function App() {
  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      color: "#fff"
    }}>
      <SlingshotChassis />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "laser-vault-password") {
    appCode = `
import { LaserVaultPassword } from "./LaserVaultPassword";

export default function App() {
  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      color: "#fff"
    }}>
      <LaserVaultPassword />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "gravity-card-stack") {
    appCode = `
import { GravityCardStack } from "./GravityCardStack";

export default function App() {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", textTransform: "uppercase" }}>Physics Playground</h1>
        <p style={{ color: "#888", fontSize: "14px", marginTop: "0.5rem" }}>Scroll down to activate rigid-body gravity drops</p>
      </div>
      <GravityCardStack />
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#444", fontSize: "12px", fontFamily: "monospace" }}>END OF CANVAS TIMELINE</p>
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "morphing-nav") {
    appCode = `
import { MorphingNav } from "./MorphingNav";

export default function App() {
  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <MorphingNav />
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "coverflow-carousel") {
    appCode = `
import React from "react";
import { CoverflowCarousel } from "./CoverflowCarousel";

export default function App() {
  return (
    <div className="flex w-full items-center justify-center p-8 bg-[#030305] min-h-[600px]">
      <CoverflowCarousel />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "breathing-grid") {
    appCode = `
import { BreathingGrid } from "./BreathingGrid";

export default function App() {
  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      <BreathingGrid />
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "0.5rem",
      }}>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.4,
        }}>
          Watch the grid breathe
        </span>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "9px",
          letterSpacing: "0.1em",
          opacity: 0.15,
        }}>
          8s sweep — left to right
        </span>
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "floating-embers") {
    appCode = `
import { FloatingEmbers } from "./FloatingEmbers";

export default function App() {
  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      <FloatingEmbers />
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "0.5rem",
      }}>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.4,
        }}>
          Floating embers
        </span>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "9px",
          letterSpacing: "0.1em",
          opacity: 0.15,
        }}>
          Cursor and scroll gently influence the drift
        </span>
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "spotlight-grid") {
    appCode = `
import { SpotlightGrid } from "./SpotlightGrid";

export default function App() {
  return (
    <SpotlightGrid>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "0.5rem",
      }}>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.4,
        }}>
          Move your cursor
        </span>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "9px",
          letterSpacing: "0.1em",
          opacity: 0.15,
        }}>
          Indigo + sky blue dual spotlight
        </span>
      </div>
    </SpotlightGrid>
  );
}
`.trim();
  } else if (entry.slug === "pixel-melt") {
    appCode = `
import { PixelMeltBackground } from "./PixelMelt";

export default function App() {
  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      <PixelMeltBackground />
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "0.5rem",
      }}>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.4,
        }}>
          Move your cursor
        </span>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "9px",
          letterSpacing: "0.1em",
          opacity: 0.15,
        }}>
          Pixel heat simulation
        </span>
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "lumina-wave") {
    appCode = `
import { LuminaWave } from "./LuminaWave";

export default function App() {
  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      <LuminaWave />
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "0.5rem",
      }}>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.4,
        }}>
          Move your cursor
        </span>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "9px",
          letterSpacing: "0.1em",
          opacity: 0.15,
        }}>
          Undulating aurora waves
        </span>
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "scroll-progress") {
    appCode = `
import ScrollProgress from "./ScrollProgress";

export default function App() {
  return (
    <div style={{
      background: "#050505",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      padding: "2rem",
      minHeight: "200vh",
      width: "100%",
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "4rem 0" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Scroll Progress Demo</h1>
        <p style={{ color: "#a0a0a0", lineHeight: "1.6", marginBottom: "2rem" }}>
          Scroll down the page to see the custom scrollbar overlay on the right respond in real-time.
        </p>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "1.25rem", color: "#a855f7", marginBottom: "0.5rem" }}>Section {i + 1}</h2>
            <p style={{ color: "#707070", lineHeight: "1.6" }}>
              This section exists to generate height and demonstrate scroll speed velocity scaling and the ambient neon glow effect. Dragging the progress bar will also scrub the viewport.
            </p>
          </div>
        ))}
      </div>
      <ScrollProgress color="#a855f7" glow={true} ticks={42} />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "now-playing-card") {
    appCode = `
import { NowPlayingCard } from "./NowPlayingCard";

export default function App() {
  const mockSong = {
    isPlaying: true,
    title: "Main Chala Jaunga",
    artist: "Fiddlecraft",
    album: "Hawai Jahaaz",
    image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/c7/65/41c765a0-5a1e-3e35-9c22-5d664da2b95e/cover.jpg/600x600bb.jpg",
    songUrl: "https://open.spotify.com/album/4vjV643d5Xg8eT1pI4R8Hw",
    playedAt: null
  };

  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      width: "100%",
    }}>
      <NowPlayingCard song={mockSong} />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "wheel-picker") {
    appCode = `
import React, { useState } from "react";
import { WheelPicker } from "./WheelPicker";

export default function App() {
  const [framework, setFramework] = useState("Next.js");
  const frameworks = ["React", "Vue", "Angular", "Next.js", "Svelte", "Solid", "Qwik", "Nuxt", "Remix"];

  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      width: "100%",
      gap: "2rem"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "monospace" }}>
          Selected Framework
        </span>
        <span style={{ fontSize: "28px", color: "#fff", fontWeight: "bold", fontFamily: "sans-serif" }}>
          {framework}
        </span>
      </div>

      <div style={{ width: "220px" }}>
        <WheelPicker
          items={frameworks}
          value={framework}
          onChange={setFramework}
          variant="glass"
          loop
          sound
        />
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "expand-on-hover") {
    appCode = `
import React from "react";
import { ExpandOnHover } from "./components/expand-on-hover/ExpandOnHover";

const projects = [
  {
    id: "taj",
    title: "The Eternal Taj",
    subtitle: "Mausoleum · Agra",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
    description: "A breathtaking monument of pure white marble reflecting the morning mist of Agra, built as an eternal testament of love.",
    badge: "Heritage",
    accent: "#E2E8F0"
  },
  {
    id: "varanasi",
    title: "Varanasi Riverfront",
    subtitle: "Ganga Aarti · Kashi",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&auto=format&fit=crop",
    description: "Centuries-old stone steps descend into the sacred Ganges under the serene glow of spiritual oil lamps and ancient chants.",
    badge: "Spiritual",
    accent: "#A3A3A3"
  },
  {
    id: "jaipur",
    title: "Jaipur Palace",
    subtitle: "Hawa Mahal · Jaipur",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
    description: "A honeycomb facade of pink-hued windows built to allow royal women to observe local street life without being seen.",
    badge: "Architecture",
    accent: "#E5E5E5"
  },
  {
    id: "humayun",
    title: "Humayun's Garden",
    subtitle: "Mughal Tomb · Delhi",
    image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&auto=format&fit=crop",
    description: "An architectural marvel standing inside lush Persian-style geometry gardens, inspiring the grand design of the Taj Mahal.",
    badge: "History",
    accent: "#D4D4D4"
  }
];

export default function App() {
  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2.5rem",
      width: "100%",
      boxSizing: "border-box"
    }}>
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <ExpandOnHover
          items={projects}
          variant="%%variant%%"
          animation="%%animation%%"
          expandHeight={%%expandHeight%%}
          collapsedHeight={%%collapsedHeight%%}
          gap={%%gap%%}
          borderRadius={%%borderRadius%%}
          hoverDelay={%%hoverDelay%%}
          clickToExpand={%%clickToExpand%%}
          autoCollapseOnLeave={%%autoCollapseOnLeave%%}
        />
      </div>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "text-shuffle") {
    appCode = `
import React from "react";
import { TextShuffle } from "./TextShuffle";

export default function App() {
  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem",
      width: "100%",
      boxSizing: "border-box",
    }}>
      <TextShuffle
        words={["Like", "This?", "Connect", "For", "More", "Such", "Projects"]}
        variant="wave"
        duration={2200}
        transition={700}
        fontSize="2.5rem"
        fontWeight={700}
        loop={true}
        pauseOnHover={false}
      />
    </div>
  );
}
`.trim();
  }

  const props = extractProps(rawCode);

  const npmInstall = `pnpm dlx shadcn@latest add @voidui/${entry.slug}`;
  const importCode = `import { ${componentName} } from "@/components/ui/${entry.slug}";`;

  const setupCommand = `pnpm dlx shadcn@latest registry add @voidui=https://void-ui.vercel.app/r/{name}.json`;

  const [tsxHtml, bashHtml, setupHtml] = await Promise.all([
    codeToHtml(rawCode, { lang: "tsx", theme: "github-dark-dimmed" }),
    codeToHtml(npmInstall, { lang: "bash", theme: "github-dark-dimmed" }),
    codeToHtml(setupCommand, { lang: "bash", theme: "github-dark-dimmed" }),
  ]);

  const isDefaultWide = entry.slug === "pixel-melt" || entry.slug === "breathing-grid" || entry.slug === "floating-embers" || entry.slug === "spotlight-grid" || entry.slug === "lumina-wave" || entry.slug === "coverflow-carousel";

  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <ComponentPageProvider defaultWide={isDefaultWide}>
          <div className="flex w-full">
            {/* Main Document Content */}
            <ComponentPageMain>
              {/* Top bar with Breadcrumbs & Toggle Button */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <nav className="flex items-center gap-2 text-text-muted font-mono text-[10px] uppercase tracking-wider select-none">
                  <Link href="/components" className="hover:text-white transition-colors">Components</Link>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-white/40">{entry.category}</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-white">{componentName}</span>
                </nav>
                
                <WideViewToggle />
              </div>

              {/* Title & Description Header */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white">
                    {componentName}
                  </h1>
                  <span className="px-2 py-0.5 border border-white text-[9px] font-mono font-bold tracking-widest uppercase text-white animate-pulse select-none">
                    Active Primitive
                  </span>
                </div>
                <p className="font-body text-text-muted text-base leading-relaxed">
                  {entry.description}
                </p>
              </div>

              {/* Component Sandbox Tabs */}
              <section className="mb-12">
                <ComponentTabs
                  rawCode={rawCode}
                  npmInstall={npmInstall}
                  importCode={importCode}
                  entry={entry}
                  additionalFiles={additionalFiles}
                  appCode={appCode}
                  tsxHtml={tsxHtml}
                  bashHtml={bashHtml}
                  setupHtml={setupHtml}
                  setupCommand={setupCommand}
                  editableProps={editableProps}
                />
              </section>

              {/* Props Table API */}
              {props.length > 0 && (
                <section className="mt-16 border-t border-border-hairline pt-12">
                  <div className="flex items-center gap-3 mb-6 select-none">
                    <span className="material-symbols-outlined text-white text-[18px]">api</span>
                    <h2 className="font-display text-lg font-bold uppercase tracking-tight text-white">Props API</h2>
                  </div>
                  <PropsTable props={props} />
                </section>
              )}



              {entry.slug === "dot-matrix" && (
                <section className="mt-16 border-t border-border-hairline pt-12 text-neutral-300 font-body">
                  <div className="flex items-center gap-3 mb-6 select-none">
                    <span className="material-symbols-outlined text-white text-[18px]">menu_book</span>
                    <h2 className="font-display text-lg font-bold uppercase tracking-tight text-white">Preset Variants</h2>
                  </div>
                  
                  <div className="space-y-8 leading-relaxed">
                    <div>
                      <h3 className="text-white font-mono text-sm font-bold uppercase mb-2">1. Retro Marquee Display</h3>
                      <p className="text-text-muted text-sm mb-4">
                        A horizontal scrolling marquee display that fits perfectly for status trackers, custom prompts, or landing page branding.
                      </p>
                      <pre className="p-4 bg-surface-charcoal border border-border-hairline rounded font-mono text-xs text-neutral-100 overflow-x-auto">
{`<DotMatrix
  animation="scroll-text"
  text="HELLO WORLD"
  color="#10b981"
  columns={44}
  rows={12}
  speed={1.2}
/>`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-white font-mono text-sm font-bold uppercase mb-2">2. Cyber Digital Clock</h3>
                      <p className="text-text-muted text-sm mb-4">
                        Render a high-accuracy, real-time digital clock (HH:MM:SS) centered inside the LED emitter board.
                      </p>
                      <pre className="p-4 bg-surface-charcoal border border-border-hairline rounded font-mono text-xs text-neutral-100 overflow-x-auto">
{`<DotMatrix
  animation="clock"
  color="#f59e0b"
  columns={40}
  rows={12}
/>`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-white font-mono text-sm font-bold uppercase mb-2">3. Simulated Audio Equalizer</h3>
                      <p className="text-text-muted text-sm mb-4">
                        Renders dynamic frequency bar columns that animate procedurally without prompting users for microphone inputs.
                      </p>
                      <pre className="p-4 bg-surface-charcoal border border-border-hairline rounded font-mono text-xs text-neutral-100 overflow-x-auto">
{`<DotMatrix
  animation="equalizer"
  color="#e2f5fd"
  columns={36}
  rows={10}
  speed={1.5}
/>`}
                      </pre>
                    </div>
                  </div>
                </section>
              )}
            </ComponentPageMain>

            {/* Table of Contents Right Sidebar */}
            <ComponentPageSidebar>
              <div className="font-mono text-[10px]">
                <div className="text-text-muted uppercase text-[8px] font-bold tracking-[0.15em] mb-4">
                  On This Page
                </div>
                <nav className="space-y-3">
                  <a className="block text-white border-l-2 border-white pl-4 -ml-[2px] font-bold" href="#">
                    Component Preview
                  </a>
                  <a className="block text-text-muted hover:text-white border-l-2 border-transparent pl-4 -ml-[2px] transition-colors" href="#">
                    Installation
                  </a>
                  <a className="block text-text-muted hover:text-white border-l-2 border-transparent pl-4 -ml-[2px] transition-colors" href="#">
                    Usage API
                  </a>
                  {props.length > 0 && (
                    <a className="block text-text-muted hover:text-white border-l-2 border-transparent pl-4 -ml-[2px] transition-colors" href="#">
                      Props Definition
                    </a>
                  )}
                </nav>

                {/* Discord support card */}
                <div className="mt-12 p-6 border border-border-hairline bg-surface-charcoal">
                  <div className="text-white font-bold mb-2 uppercase tracking-wide">Need Help?</div>
                  <p className="text-text-muted text-[11px] leading-relaxed mb-4">
                    Join our Discord server to connect with developers and core maintainers.
                  </p>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-white text-black font-bold uppercase text-[10px] tracking-widest text-center hover:bg-white/90 transition-colors"
                  >
                    Join Discord
                  </a>
                </div>
              </div>
            </ComponentPageSidebar>
          </div>
        </ComponentPageProvider>
        <Footer />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return registry.map((c) => ({ category: c.category, slug: c.slug }));
}
