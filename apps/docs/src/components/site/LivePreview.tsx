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
}

export function LivePreview({ code, componentName, dependencies = [], additionalFiles = {}, appCode }: LivePreviewProps) {
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

  const depVersions = Object.fromEntries(
    dependencies.map((d) => [d, "latest"])
  );

  return (
    <SandpackProvider
      template="react-ts"
      theme="dark"
      files={{
        "/App.tsx": appCodeValue,
        [`/${componentName}.tsx`]: code,
        ...additionalFiles,
      }}
      customSetup={{
        dependencies: {
          "framer-motion": "latest",
          "clsx": "latest",
          "tailwind-merge": "latest",
          ...depVersions,
        },
      }}
      options={{ externalResources: ["https://cdn.tailwindcss.com"] }}
    >
      <SandpackLayout>
        <SandpackCodeEditor showTabs showLineNumbers style={{ height: 380 }} />
        <SandpackPreview style={{ height: 380 }} showOpenInCodeSandbox={false} />
      </SandpackLayout>
    </SandpackProvider>
  );
}