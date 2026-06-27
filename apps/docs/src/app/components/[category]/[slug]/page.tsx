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

  const isDefaultWide = entry.slug === "story-timeline" || entry.slug === "pixel-melt" || entry.slug === "breathing-grid" || entry.slug === "floating-embers" || entry.slug === "spotlight-grid" || entry.slug === "lumina-wave";

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
