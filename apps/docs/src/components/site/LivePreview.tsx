"use client";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
} from "@codesandbox/sandpack-react";

interface LivePreviewProps {
  code: string;
  componentName: string;
  dependencies?: string[];
  additionalFiles?: Record<string, string>;
  appCode?: string;
  showCode?: boolean;
  isWide?: boolean;
}

export function LivePreview({ code, componentName, dependencies = [], additionalFiles = {}, appCode, showCode = false, isWide = false }: LivePreviewProps) {
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

  const appCodeValue = appCode ?? defaultAppCode;
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
      <SandpackLayout>
        {showCode && (
          <SandpackCodeEditor showTabs showLineNumbers style={{ height: isWide ? 600 : 480 }} />
        )}
        <SandpackPreview style={{ height: isWide ? 600 : 480 }} showOpenInCodeSandbox={false} />
      </SandpackLayout>
    </SandpackProvider>
  );
}