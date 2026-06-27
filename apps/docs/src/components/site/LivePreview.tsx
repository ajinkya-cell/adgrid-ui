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

  if (componentName === "ImageStack") {
    extraVariables = `
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
`;
    extraProps = "\n        cards={cards}";
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

  return `import { ${componentName} } from "./${componentName}";

export default function App() {${extraVariables}
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "2rem",
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
import { ${componentName} } from "./${componentName}";

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
        [`/${componentName}.tsx`]: code,
        "/styles.css": `
body {
  margin: 0;
  padding: 0;
  background: #0a0a0a;
  color: #fff;
  font-family: monospace;
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
      <SandpackLayout>
        {showCode && (
          <SandpackCodeEditor 
            showTabs 
            showLineNumbers 
            style={{ height: componentName === "MetallicForm" ? 780 : isWide ? 600 : 480 }} 
          />
        )}
        <SandpackPreview 
          style={{ height: componentName === "MetallicForm" ? 780 : isWide ? 600 : 480 }} 
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