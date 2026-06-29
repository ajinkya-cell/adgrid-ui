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
  "image-stack": [
    { name: "width", type: "number", label: "Width", defaultValue: 240, min: 100, max: 500, step: 10 },
    { name: "height", type: "number", label: "Height", defaultValue: 320, min: 100, max: 600, step: 10 },
    { name: "dismissThreshold", type: "number", label: "Dismiss Threshold", defaultValue: 100, min: 30, max: 300, step: 10 },
  ],
  "anisotropic-knob": [
    { name: "variant", type: "select", label: "Variant", defaultValue: "slider", options: [
      { label: "Slider (Bounded)", value: "slider" },
      { label: "Infinite (Unbounded)", value: "infinite" },
    ]},
    { name: "size", type: "number", label: "Size (Diameter)", defaultValue: 112, min: 64, max: 200, step: 8 },
    { name: "label", type: "string", label: "Descriptor Label", defaultValue: "DECIBELS" },
  ],
  "animated-beam": [
    { name: "beamColor", type: "color", label: "Beam Color Start", defaultValue: "#38bdf8" },
    { name: "beamColorEnd", type: "color", label: "Beam Color End", defaultValue: "rgba(56,189,248,0)" },
    { name: "beamWidth", type: "number", label: "Beam Width", defaultValue: 2, min: 1, max: 10, step: 0.5 },
    { name: "duration", type: "number", label: "Duration (sec)", defaultValue: 2.5, min: 0.5, max: 10, step: 0.1 },
    { name: "delay", type: "number", label: "Delay (sec)", defaultValue: 0, min: 0, max: 5, step: 0.1 },
    { name: "pathColor", type: "color", label: "Path Color", defaultValue: "rgba(255, 255, 255, 0.05)" },
    { name: "pathWidth", type: "number", label: "Path Width", defaultValue: 1.5, min: 0.5, max: 5, step: 0.5 },
    { name: "glow", type: "boolean", label: "Enable Glow", defaultValue: true },
    { name: "bidirectional", type: "boolean", label: "Bidirectional Flow", defaultValue: false },
  ],
  "design-variant-feed": [
    { name: "defaultPrompt", type: "string", label: "Default Prompt", defaultValue: "Glassmorphic dashboard" },
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
    { name: "color", type: "color", label: "LED Active Color", defaultValue: "#38bdf8" },
    { name: "inactiveColor", type: "color", label: "LED Inactive Color", defaultValue: "#1e1e24" },
    { name: "text", type: "string", label: "Display Text", defaultValue: "KINETIC" },
    { name: "speed", type: "number", label: "Animation Speed", defaultValue: 1.0, min: 0.1, max: 5.0, step: 0.1 },
    { name: "glow", type: "boolean", label: "LED Ambient Glow", defaultValue: true },
    { name: "blur", type: "number", label: "Glow Blur (px)", defaultValue: 12, min: 0, max: 30, step: 1 },
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
  } else if (entry.slug === "liquid-mercury-pad") {
    appCode = `
import { LiquidMercuryPad } from "./LiquidMercuryPad";

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
      <LiquidMercuryPad />
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
  } else if (entry.slug === "story-timeline") {
    appCode = `
import { StoryTimeline } from "./StoryTimeline";

export default function App() {
  return (
    <div style={{ background: "#050505", minHeight: "100vh" }}>
      <StoryTimeline />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "animated-beam") {
    appCode = `
import React, { forwardRef, useRef } from "react";
import { AnimatedBeam } from "./AnimatedBeam";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-20 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-[#0c0c0e] p-2.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-colors hover:border-neutral-700",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function App() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);
  const div5Ref = useRef(null);
  const div6Ref = useRef(null);
  const div7Ref = useRef(null);

  return (
    <div
      className="relative flex h-[360px] w-full items-center justify-center overflow-hidden bg-[#050505] p-10 border border-neutral-900 rounded-xl"
      ref={containerRef}
    >
      <div className="flex h-full w-full max-h-[220px] max-w-lg flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref} id="node-drive">
            <Icons.googleDrive />
          </Circle>
          <Circle ref={div5Ref} id="node-docs">
            <Icons.googleDocs />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref} id="node-notion">
            <Icons.notion />
          </Circle>
          <Circle ref={div4Ref} id="node-openai">
            <Icons.openai />
          </Circle>
          <Circle ref={div6Ref} id="node-zapier">
            <Icons.zapier />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref} id="node-whatsapp">
            <Icons.whatsapp />
          </Circle>
          <Circle ref={div7Ref} id="node-messenger">
            <Icons.messenger />
          </Circle>
        </div>
      </div>

      {/* Dynamic connection beams with glows and bidirectional flows */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        beamColor="#06b6d4"
        beamColorEnd="rgba(6,182,212,0)"
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        beamColor="#ec4899"
        beamColorEnd="rgba(236,72,153,0)"
        duration={2.5}
        bidirectional
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        beamColor="#f59e0b"
        beamColorEnd="rgba(245,158,11,0)"
        duration={3.5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        dashArray="3 3"
        pathColor="rgba(255,255,255,0.08)"
        beamColor="#ffffff"
        beamColorEnd="rgba(255,255,255,0)"
        duration={2.8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        beamColor="#10b981"
        beamColorEnd="rgba(16,185,129,0)"
        duration={2.2}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        bidirectional
        beamColor="#8b5cf6"
        beamColorEnd="rgba(139,92,246,0)"
        duration={3.2}
      />
    </div>
  );
}

const Icons = {
  notion: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
        fill="#ffffff"
      />
      <path
        d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
        fill="#000000"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  ),
  openai: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="#ffffff"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  ),
  googleDrive: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 87.3 78"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      <path
        d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
        fill="#00ac47"
      />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path
        d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
        fill="#00832d"
      />
      <path
        d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
        fill="#2684fc"
      />
      <path
        d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  ),
  whatsapp: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 175.216 175.552"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="b-wa"
          x1="85.915"
          x2="86.535"
          y1="32.567"
          y2="137.092"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
      </defs>
      <path
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        fill="#ffffff"
      />
      <path
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        fill="url(#b-wa)"
      />
      <path
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        fill="#ffffff"
        fillRule="evenodd"
      />
    </svg>
  ),
  googleDocs: () => (
    <svg
      width="20"
      height="24"
      viewBox="0 0 47 65"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M29.375,0 L4.40625,0 C1.9828125,0 0,1.99431818 0,4.43181818 L0,60.5681818 C0,63.0056818 1.9828125,65 4.40625,65 L42.59375,65 C45.0171875,65 47,63.0056818 47,60.5681818 L47,17.7272727 L29.375,0 Z"
        fill="#4285F4"
      />
      <polygon
        fill="rgba(26,35,126,0.2)"
        points="30.6638281 16.4309659 47 32.8582386 47 17.7272727"
      />
      <path
        d="M11.75,47.2727273 L35.25,47.2727273 L35.25,44.3181818 L11.75,44.3181818 L11.75,47.2727273 Z M11.75,53.1818182 L29.375,53.1818182 L29.375,50.2272727 L11.75,50.2272727 L11.75,53.1818182 Z M11.75,32.5 L11.75,35.4545455 L35.25,35.4545455 L35.25,32.5 L11.75,32.5 Z M11.75,41.3636364 L35.25,41.3636364 L35.25,38.4090909 L11.75,38.4090909 L11.75,41.3636364 Z"
        fill="#F1F1F1"
      />
      <path
        d="M2.9375,2.95454545 L2.9375,16.25 C2.9375,18.6985795 4.90929688,20.6818182 7.34375,20.6818182 L20.5625,20.6818182 L2.9375,2.95454545 Z"
        transform="translate(26.437500, -2.954545)"
        fill="#A1C2FA"
      />
    </svg>
  ),
  zapier: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 244 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M57.1877 45.2253L57.1534 45.1166L78.809 25.2914V15.7391H44.0663V25.2914H64.8181L64.8524 25.3829L43.4084 45.2253V54.7775H79.1579V45.2253H57.1877Z"
        fill="#ffffff"
      />
      <path d="M39.0441 45.2253H0V54.789H39.0441V45.2253Z" fill="#FF4F00" />
    </svg>
  ),
  messenger: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <radialGradient
        id="8O3wK6b5ASW2Wn6hRCB5xa_YFbzdUk7Q3F8_gr1"
        cx="11.087"
        cy="7.022"
        r="47.612"
        gradientTransform="matrix(1 0 0 -1 0 50)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#1292ff"></stop>
        <stop offset=".079" stopColor="#2982ff"></stop>
        <stop offset=".23" stopColor="#4e69ff"></stop>
        <stop offset=".351" stopColor="#6559ff"></stop>
        <stop offset=".428" stopColor="#6d53ff"></stop>
        <stop offset=".754" stopColor="#df47aa"></stop>
        <stop offset=".946" stopColor="#ff6257"></stop>
      </radialGradient>
      <path
        fill="url(#8O3wK6b5ASW2Wn6hRCB5xa_YFbzdUk7Q3F8_gr1)"
        d="M44,23.5C44,34.27,35.05,43,24,43c-1.651,0-3.25-0.194-4.784-0.564	c-0.465-0.112-0.951-0.069-1.379,0.145L13.46,44.77C12.33,45.335,11,44.513,11,43.249v-4.025c0-0.575-0.257-1.111-0.681-1.499	C6.425,34.165,4,29.11,4,23.5C4,12.73,12.95,4,24,4S44,12.73,44,23.5z"
      />
      <path
        fill="#ffffff"
        d="M34.394,18.501l-5.7,4.22c-0.61,0.46-1.44,0.46-2.04,0.01L22.68,19.74	c-1.68-1.25-4.06-0.82-5.19,0.94l-1.21,1.89l-4.11,6.68c-0.6,0.94,0.55,2.01,1.44,1.34l5.7-4.22c0.61-0.46,1.44-0.46,2.04-0.01	l3.974,2.991c1.68,1.25,4.06,0.82,5.19-0.94l1.21-1.89l4.11-6.68C36.434,18.901,35.284,17.831,34.394,18.501z"
      />
    </svg>
  ),
};
`.trim();
  } else if (entry.slug === "design-variant-feed") {
    appCode = `
import React from "react";
import { DesignVariantFeed } from "./DesignVariantFeed";

export default function App() {
  return (
    <div className="flex w-full items-center justify-center p-6 bg-[#030303] min-h-[700px]">
      <DesignVariantFeed defaultPrompt="Glassmorphic dashboard" />
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
  }

  const props = extractProps(rawCode);

  const npmInstall = `npx void-ui add ${entry.slug}`;
  const importCode = `import { ${componentName} } from "@adgrid-ui/ui";`;

  const [tsxHtml, bashHtml] = await Promise.all([
    codeToHtml(rawCode, { lang: "tsx", theme: "github-dark-dimmed" }),
    codeToHtml(npmInstall, { lang: "bash", theme: "github-dark-dimmed" }),
  ]);

  const isDefaultWide = entry.slug === "story-timeline" || entry.slug === "pixel-melt" || entry.slug === "breathing-grid" || entry.slug === "floating-embers" || entry.slug === "spotlight-grid" || entry.slug === "lumina-wave" || entry.slug === "animated-beam" || entry.slug === "coverflow-carousel";

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

              {/* Custom Usage & Variants Guide for AnimatedBeam */}
              {entry.slug === "animated-beam" && (
                <section className="mt-16 border-t border-border-hairline pt-12 text-neutral-300 font-body">
                  <div className="flex items-center gap-3 mb-6 select-none">
                    <span className="material-symbols-outlined text-white text-[18px]">menu_book</span>
                    <h2 className="font-display text-lg font-bold uppercase tracking-tight text-white">Usage & Variants</h2>
                  </div>
                  
                  <div className="space-y-8 leading-relaxed">
                    <div>
                      <h3 className="text-white font-mono text-sm font-bold uppercase mb-2">1. ID-Based Binding (No Refs Boilerplate)</h3>
                      <p className="text-text-muted text-sm mb-4">
                        Bind connections directly using element ID strings. Perfect for dynamic maps, grids, or layouts where parent/child React reference passing is difficult.
                      </p>
                      <pre className="p-4 bg-surface-charcoal border border-border-hairline rounded font-mono text-xs text-neutral-100 overflow-x-auto">
{`// Parent Container
<div ref={containerRef} className="relative">
  <div id="source-node">Origin</div>
  <div id="target-node">Destination</div>

  <AnimatedBeam
    containerRef={containerRef}
    fromId="source-node"
    toId="target-node"
    beamColor="#38bdf8"
    duration={3}
  />
</div>`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-white font-mono text-sm font-bold uppercase mb-2">2. Ref-Based Binding (Standard)</h3>
                      <p className="text-text-muted text-sm mb-4">
                        Pass standard React \`RefObject\` elements to connect two distinct components directly.
                      </p>
                      <pre className="p-4 bg-surface-charcoal border border-border-hairline rounded font-mono text-xs text-neutral-100 overflow-x-auto">
{`const originRef = useRef(null);
const targetRef = useRef(null);

return (
  <div ref={containerRef} className="relative">
    <div ref={originRef}>Origin</div>
    <div ref={targetRef}>Destination</div>

    <AnimatedBeam
      containerRef={containerRef}
      fromRef={originRef}
      toRef={targetRef}
      beamColor="#ec4899"
    />
  </div>
);`}
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-white font-mono text-sm font-bold uppercase mb-2">3. Bidirectional Flow</h3>
                      <p className="text-text-muted text-sm mb-4">
                        Animate laser pulses flowing in both directions simultaneously along the curve. Great for depicting bidirectional data transfers, web socket streams, or message queues.
                      </p>
                      <pre className="p-4 bg-surface-charcoal border border-border-hairline rounded font-mono text-xs text-neutral-100 overflow-x-auto">
{`<AnimatedBeam
  containerRef={containerRef}
  fromId="server-node"
  toId="db-node"
  bidirectional
  beamColor="#10b981"
  duration={2.5}
/>`}
                      </pre>
                    </div>
                  </div>
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
  color="#38bdf8"
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
