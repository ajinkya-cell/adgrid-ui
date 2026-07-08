"use client";
import { useState, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { PropsEditor, type PropDefinition } from "./PropsEditor";

const COMPONENT_HEIGHTS: Record<string, number> = {
  InfiniteScroll: 640,
  MetallicForm: 780,
  MechanicalTimer: 640,
  LaserVaultPassword: 640,
  FlickeringGridPlayground: 650,
  DotPatternPlayground: 650,
  ImageReveal: 600,
  ExpandOnHover: 580,
  GravityCardStack: 640,
  CoverflowCarousel: 680,
  PremiumHero: 680,
  ScrollProgress: 520,
  NowPlayingCard: 500,
  WheelPicker: 520,
  AnisotropicKnob: 500,
  LivingText: 500,
  SpotlightText: 520,
  SpotlightGrid: 500,
  LuminaWave: 500,
  BreathingGrid: 500,
  FloatingEmbers: 500,
  PixelMelt: 500,
  ImageParallax: 500,
  TextShuffle: 520,
  DotMatrix: 480,
};

interface LivePreviewProps {
  code: string;
  componentName: string;
  dependencies?: string[];
  additionalFiles?: Record<string, string>;
  appCode?: string;
  showCode?: boolean;
  isWide?: boolean;
  editableProps?: PropDefinition[];
}

function SandpackFileSyncer({ appCode }: { appCode: string }) {
  const { sandpack } = useSandpack();
  const prevRef = useRef(appCode);

  useEffect(() => {
    if (appCode !== prevRef.current) {
      prevRef.current = appCode;
      sandpack.updateFile("/App.tsx", appCode);
    }
  }, [appCode, sandpack]);

  return null;
}

function generateAppCode(
  componentName: string,
  propDefs: PropDefinition[],
  values: Record<string, unknown>
): string {
  let extraProps = "";
  let extraVariables = "";

  if (componentName === "ScrollProgress") {
    const propsStr = propDefs
      .filter((def) => {
        const val = values[def.name] ?? def.defaultValue;
        return val !== undefined;
      })
      .map((def) => {
        const val = values[def.name] ?? def.defaultValue;
        if (def.type === "number" || def.type === "boolean") {
          return `\n      ${def.name}={${val}}`;
        }
        return `\n      ${def.name}="${String(val).replace(/"/g, '&quot;')}"`;
      })
      .join("");

    return `import React from "react";
import ScrollProgress from "./ScrollProgress";

export default function App() {
  return (
    <div style={{
      background: "#050505",
      color: "#fff",
      fontFamily: "sans-serif",
      padding: "2rem",
      minHeight: "250vh",
      width: "100%",
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "4rem 0" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Scroll Progress Demo</h1>
        <p style={{ color: "#a0a0a0", lineHeight: "1.6", marginBottom: "2rem" }}>
          Scroll down the page to see the custom scrollbar overlay on the right respond in real-time. Use the controls below to customize it.
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
      <ScrollProgress${propsStr}
      />
    </div>
  );
}`;
  }



  if (componentName === "CoverflowCarousel") {
    return `import React from "react";
import { CoverflowCarousel } from "./CoverflowCarousel";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#030305",
      width: "100%",
      padding: "2rem",
    }}>
      <CoverflowCarousel />
    </div>
  );
}`;
  }

  if (componentName === "WheelPicker") {
    if (values.variant === "time-selector") {
      return `import React, { useState } from "react";
import { WheelPicker } from "./WheelPicker";

export default function App() {
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("30");
  const [period, setPeriod] = useState("AM");

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#050505",
      width: "100%",
      gap: "2rem"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.2em" }}>
          Selected Time
        </span>
        <span style={{ fontSize: "28px", color: "#fff", fontWeight: "bold" }}>
          {hour}:{minute} {period}
        </span>
      </div>

      <div style={{
        display: "flex",
        gap: "12px",
        background: "rgba(10, 10, 10, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        padding: "16px 24px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        width: "320px",
        justifyContent: "center",
        alignItems: "center",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
      }}>
        <div style={{ width: "70px" }}>
          <WheelPicker
            items={hours}
            value={hour}
            onChange={setHour}
            variant="minimal"
            loop
            sound
            visibleItems={5}
            itemHeight={44}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", color: "rgba(255, 255, 255, 0.5)", fontSize: "20px", fontWeight: "bold" }}>:</div>
        <div style={{ width: "70px" }}>
          <WheelPicker
            items={minutes}
            value={minute}
            onChange={setMinute}
            variant="minimal"
            loop
            sound
            visibleItems={5}
            itemHeight={44}
          />
        </div>
        <div style={{ width: "70px", marginLeft: "8px" }}>
          <WheelPicker
            items={periods}
            value={period}
            onChange={setPeriod}
            variant="minimal"
            sound
            visibleItems={5}
            itemHeight={44}
          />
        </div>
      </div>
    </div>
  );
}`;
    }

    const propsStr = propDefs
      .filter((def) => {
        const val = values[def.name] ?? def.defaultValue;
        return val !== undefined;
      })
      .map((def) => {
        const val = values[def.name] ?? def.defaultValue;
        if (def.type === "number" || def.type === "boolean") {
          return "\n        " + def.name + "={" + val + "}";
        }
        return "\n        " + def.name + '="' + String(val).replace(/"/g, '&quot;') + '"';
      })
      .join("");

    return `import React, { useState } from "react";
import { WheelPicker } from "./WheelPicker";

export default function App() {
  const [val, setVal] = useState("Next.js");
  const frameworks = ["React", "Vue", "Angular", "Next.js", "Svelte", "Solid", "Qwik", "Nuxt", "Remix"];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#050505",
      width: "100%",
      gap: "2rem"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.2em", fontFamily: "monospace" }}>
          Selected Target
        </span>
        <span style={{ fontSize: "28px", color: "#fff", fontWeight: "bold", fontFamily: "sans-serif" }}>
          {val}
        </span>
      </div>

      <div style={{ width: "220px" }}>
        <WheelPicker
          items={frameworks}
          value={val}
          onChange={setVal}${propsStr}
        />
      </div>
    </div>
  );
}`;
  }

  if (componentName === "ExpandOnHover") {
    const propsStr = propDefs
      .filter((def) => {
        const val = values[def.name] ?? def.defaultValue;
        return val !== undefined;
      })
      .map((def) => {
        const val = values[def.name] ?? def.defaultValue;
        if (def.type === "number" || def.type === "boolean") {
          return `\n        ${def.name}={${val}}`;
        }
        return `\n        ${def.name}="${String(val).replace(/"/g, '&quot;')}"`;
      })
      .join("");

    return `import React from "react";
import { ExpandOnHover } from "./ExpandOnHover";

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
          items={projects}${propsStr}
        />
      </div>
    </div>
  );
}`;
  }

  if (componentName === "TextShuffle") {
    const propsStr = propDefs
      .filter((def) => {
        const val = values[def.name] ?? def.defaultValue;
        return val !== undefined;
      })
      .map((def) => {
        const val = values[def.name] ?? def.defaultValue;
        if (def.type === "number" || def.type === "boolean") {
          return `\n        ${def.name}={${val}}`;
        }
        return `\n        ${def.name}="${String(val).replace(/"/g, '&quot;')}"`;
      })
      .join("");

    return `import React from "react";
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
        words={["Like THIS?", "Connect", "with Me"]}${propsStr}
      />
    </div>
  );
}`;
  }





  const propsStr = propDefs
    .filter((def) => {
      const val = values[def.name] ?? def.defaultValue;
      return val !== undefined;
    })
    .map((def) => {
      const val = values[def.name] ?? def.defaultValue;
      if (def.type === "number" || def.type === "boolean") {
        return `\n        ${def.name}={${val}}`;
      }
      // string, color, select -> string attributes
      return `\n        ${def.name}="${String(val).replace(/"/g, '&quot;')}"`;
    })
    .join("") + extraProps;

  const containerBg = componentName === "PremiumHero" ? "#ffffff" : "#0a0a0a";
  const containerPadding = componentName === "PremiumHero" ? "0" : "2rem";

  return `import { ${componentName} } from "./${componentName}";

export default function App() {${extraVariables}
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "${containerBg}",
      padding: "${containerPadding}",
      width: "100%",
    }}>
      <${componentName}${propsStr}
      />
    </div>
  );
}`.trim();
}

export function LivePreview({
  code,
  componentName,
  dependencies = [],
  additionalFiles = {},
  appCode,
  showCode = false,
  isWide = false,
  editableProps = [],
}: LivePreviewProps) {
  const hasEditableProps = editableProps && editableProps.length > 0;

  const [propValues, setPropValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(editableProps.map((p) => [p.name, p.defaultValue]))
  );

  const defaultAppCode = `
import ${componentName === "ScrollProgress" ? componentName : `{ ${componentName} }`} from "./${componentName}";

export default function App() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
    }}>
      <${componentName}>${componentName}</${componentName}>
    </div>
  );
}
`.trim();

  const appCodeValue = hasEditableProps
    ? generateAppCode(componentName, editableProps, propValues)
    : (appCode ?? defaultAppCode);

  const finalAppCode = appCodeValue.includes("./styles.css")
    ? appCodeValue
    : `import "./styles.css";\n${appCodeValue}`;

  const depVersions = Object.fromEntries(
    dependencies.map((d) => [d, "latest"])
  );

  return (
    <SandpackProvider
      template="react-ts"
      theme="dark"
      files={{
        "/App.tsx": finalAppCode,
        ...(componentName === "ExpandOnHover"
          ? {
              "/components/expand-on-hover/ExpandOnHover.tsx": code,
              "/ExpandOnHover.tsx": 'export { ExpandOnHover } from "./components/expand-on-hover/ExpandOnHover";',
            }
          : { [`/${componentName}.tsx`]: code }),
        "/styles.css": `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@200..700&family=Outfit:wght@200..700&family=Inter:wght@400;500;600;700&display=swap');
body {
  margin: 0;
  padding: 0;
  background: ${componentName === "PremiumHero" ? "#ffffff" : "#0a0a0a"};
  color: ${componentName === "PremiumHero" ? "#171717" : "#fff"};
}
* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
/* Custom scrollbar for technical aesthetic */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #262626;
  border-radius: 0px;
}
::-webkit-scrollbar-thumb:hover {
  background: #ffffff;
}
* {
  scrollbar-width: thin;
  scrollbar-color: #262626 transparent;
}
*::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}
*::-webkit-scrollbar-thumb {
  background: #262626;
}
*::-webkit-scrollbar-thumb:hover {
  background: #ffffff;
}
        `.trim(),
        "node_modules/next/image.tsx": `
import React from "react";

export default function MockImage({ src, alt, fill, width, height, className, style, ...props }: any) {
  const imgStyle: React.CSSProperties = fill
    ? {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: "cover",
        ...style,
      }
    : {
        width: width ? \`\${width}px\` : undefined,
        height: height ? \`\${height}px\` : undefined,
        ...style,
      };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={imgStyle}
      {...props}
    />
  );
}
        `.trim(),
        "node_modules/next/font/google.js": `
export function Geist_Mono() { return { className: "font-mono" }; }
export function Outfit() { return { className: "font-sans" }; }
export function Instrument_Serif() { return { className: "font-serif" }; }
        `.trim(),
        "node_modules/next/font/google/index.js": `
export function Geist_Mono() { return { className: "font-mono" }; }
export function Outfit() { return { className: "font-sans" }; }
export function Instrument_Serif() { return { className: "font-serif" }; }
        `.trim(),
        ...additionalFiles,
      }}
      customSetup={{
        dependencies: {
          "framer-motion": "latest",
          "clsx": "latest",
          "tailwind-merge": "latest",
          "next": "latest",
          ...depVersions,
        },
      }}
      options={{ externalResources: ["https://cdn.tailwindcss.com"] }}
    >
      {hasEditableProps && <SandpackFileSyncer appCode={finalAppCode} />}
      <SandpackLayout style={{ height: COMPONENT_HEIGHTS[componentName] ?? (isWide ? 600 : 480) }}>
        {showCode && (
          <SandpackCodeEditor 
            showTabs 
            showLineNumbers 
            style={{ height: "100%" }} 
          />
        )}
        <SandpackPreview 
          style={{ height: "100%" }} 
          showOpenInCodeSandbox={false} 
        />
      </SandpackLayout>
      {hasEditableProps && (
        <PropsEditor
          title={componentName}
          propDefs={editableProps}
          values={propValues}
          onChange={(name, value) => {
            setPropValues((prev) => ({ ...prev, [name]: value }));
          }}
        />
      )}
    </SandpackProvider>
  );
}