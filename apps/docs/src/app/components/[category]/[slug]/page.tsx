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

  let appCode: string | undefined;
  const componentName = entry.name.replace(/\s/g, "");
  
  if (entry.slug === "text-reveal") {
    appCode = `
import { TextReveal } from "./TextReveal";

export default function App() {
  return (
    <div style={{
      background: "#0a0a0a",
      minHeight: "200vh",
      padding: "10vh 2rem",
    }}>
      <p style={{ color: "#444", fontSize: "12px", fontFamily: "monospace", marginBottom: "40vh" }}>
        SCROLL DOWN TO REVEAL
      </p>
      <TextReveal text="Components built for the void. Zero bloat. High performance." />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "fade-in") {
    appCode = `
import { FadeIn } from "./FadeIn";

export default function App() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      gap: "1.5rem",
    }}>
      <FadeIn direction="up" delay={0.1}>
        <div style={{
          padding: "2rem",
          border: "1px solid #262626",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "12px"
        }}>
          FADED IN FROM BOTTOM
        </div>
      </FadeIn>
      <FadeIn direction="left" delay={0.3}>
        <div style={{
          padding: "2rem",
          border: "1px solid #262626",
          background: "#0a0a0a",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "12px"
        }}>
          FADED IN FROM RIGHT
        </div>
      </FadeIn>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "glitch-text") {
    appCode = `
import { GlitchText } from "./GlitchText";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
    }}>
      <GlitchText 
        text="VOID_PROTOCOL" 
        className="text-white text-5xl uppercase tracking-widest font-black"
      />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "count-up") {
    appCode = `
import { CountUp } from "./CountUp";

export default function App() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "monospace",
      color: "#fff"
    }}>
      <CountUp 
        to={100} 
        duration={2.5} 
        suffix="%" 
        className="text-6xl font-bold font-display"
      />
      <p style={{ color: "#555", fontSize: "11px", marginTop: "1rem" }}>
        TELEMETRY_LOAD_SEQUENCE
      </p>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "magnetic-button") {
    appCode = `
import { MagneticButton } from "./MagneticButton";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
    }}>
      <MagneticButton strength={0.4}>
        <button style={{
          padding: "1rem 2rem",
          background: "transparent",
          border: "1px solid #fff",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: "pointer"
        }}>
          Hover Pull
        </button>
      </MagneticButton>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "button") {
    appCode = `
import { Button } from "./Button";

export default function App() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      gap: "1rem"
    }}>
      <Button variant="primary">Primary Action</Button>
      <Button variant="outline">Secondary Line</Button>
      <Button variant="ghost">Ghost Command</Button>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "card") {
    appCode = `
import { Card, CardHeader, CardTitle, CardBody } from "./Card";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem"
    }}>
      <Card style={{ maxWidth: "400px", width: "100%" }}>
        <CardHeader>
          <CardTitle>SYSTEM_MANIFEST</CardTitle>
        </CardHeader>
        <CardBody style={{ color: "#888", fontSize: "13px", fontFamily: "monospace" }}>
          Core system components loaded successfully. All sensors online. Ready to deploy.
        </CardBody>
      </Card>
    </div>
  );
}
`.trim();
  } else if (entry.slug === "image-reveal") {
    appCode = `
import { ImageReveal } from "./ImageReveal";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem",
    }}>
      <ImageReveal
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"
        alt="Mountain landscape"
        width={260}
        height={340}
        stripeColor="#0a0a0a"
        stripeBg="#262626"
      />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "image-stack") {
    appCode = `
import { ImageStack } from "./ImageStack";

export default function App() {
  const cards = [
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      alt: "Mountain",
      label: "SUMMIT_MANIFEST",
    },
    {
      src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
      alt: "Stars",
      label: "CELESTIAL_OBSERVATION",
    },
    {
      src: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600&q=80",
      alt: "Forest",
      label: "TERRESTRIAL_ARRAY",
    },
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem",
    }}>
      <ImageStack cards={cards} width={240} height={320} />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "image-parallax") {
    appCode = `
import { ImageParallax } from "./ImageParallax";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem",
      width: "100%"
    }}>
      <ImageParallax
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80"
        alt="Aerial mountain landscape"
        height={320}
        caption="Above the Clouds"
        subcaption="Aerial landscape · Swiss Alps"
        mode="mouse"
      />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "living-text") {
    appCode = `
import { LivingText } from "./LivingText";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem",
      width: "100%"
    }}>
      <LivingText 
        text="LIVING TEXT"
        radius={200}
        strength={50}
        mode="all"
        liquify={true}
      />
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
  } else if (entry.slug === "void-button") {
    appCode = `
import { VoidButton } from "./VoidButton";

export default function App() {
  return (
    <div style={{ background: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <VoidButton />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "brushed-titanium-button") {
    appCode = `
import { BrushedTitaniumButton } from "./BrushedTitaniumButton";

export default function App() {
  return (
    <div style={{ background: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <BrushedTitaniumButton />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "liquid-gold-button") {
    appCode = `
import { LiquidGoldButton } from "./LiquidGoldButton";

export default function App() {
  return (
    <div style={{ background: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LiquidGoldButton />
    </div>
  );
}
`.trim();
  } else if (entry.slug === "guilloche-button") {
    appCode = `
import { GuillocheButton } from "./GuillocheButton";

export default function App() {
  return (
    <div style={{ background: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GuillocheButton />
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
  } else if (entry.slug === "scanline-drift") {
    appCode = `
import { useState } from "react";
import { ScanlineDrift } from "./ScanlineDrift";

const VARIANTS = ["afterglow", "aurora", "shimmer"] as const;
type V = (typeof VARIANTS)[number];

export default function App() {
  const [v, setV] = useState<V>("afterglow");
  return (
    <div style={{
      background: "#000",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      <ScanlineDrift variant={v} />
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "2rem",
      }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {VARIANTS.map((name) => (
            <button
              key={name}
              onClick={() => setV(name)}
              style={{
                padding: "0.5rem 1.25rem",
                border: v === name ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                background: v === name ? "rgba(255,255,255,0.08)" : "transparent",
                color: "#fff",
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                opacity: v === name ? 1 : 0.35,
              }}
            >
              {name}
            </button>
          ))}
        </div>
        <span style={{
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "8px",
          letterSpacing: "0.1em",
          opacity: 0.15,
        }}>
          Click to change mood
        </span>
      </div>
    </div>
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
  }

  const props = extractProps(rawCode);

  const npmInstall = `npx void-ui add ${entry.slug}`;
  const importCode = `import { ${componentName} } from "@adgrid-ui/ui";`;

  const [tsxHtml, bashHtml] = await Promise.all([
    codeToHtml(rawCode, { lang: "tsx", theme: "github-dark-dimmed" }),
    codeToHtml(npmInstall, { lang: "bash", theme: "github-dark-dimmed" }),
  ]);

  const isDefaultWide = entry.slug === "story-timeline" || entry.slug === "pixel-melt" || entry.slug === "breathing-grid" || entry.slug === "floating-embers" || entry.slug === "scanline-drift";

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
