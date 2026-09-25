import { registry } from "../src/registry";
import fs from "fs";
import path from "path";

const UI_SRC = path.resolve(__dirname, "../../../packages/ui/src");

console.log(`Auditing all ${registry.length} registry components for missing dependencies or broken imports...\n`);

let issuesFound = 0;

for (const entry of registry) {
  const declaredDeps = new Set(entry.dependencies || []);
  const sourceFiles = entry.files;

  const externalImports = new Set<string>();
  const missingFiles: string[] = [];

  for (const relFile of sourceFiles) {
    const absPath = path.join(UI_SRC, relFile);
    if (!fs.existsSync(absPath)) {
      missingFiles.push(relFile);
      continue;
    }
    const content = fs.readFileSync(absPath, "utf-8");

    // Match import ... from 'package' or import 'package'
    const importRegex = /(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
      let specifier = match[1];

      // Ignore relative imports and path aliases
      if (specifier.startsWith(".") || specifier.startsWith("@/")) continue;
      if (specifier.startsWith("node:")) continue;

      // Extract top-level package name or scoped package
      let pkg: string;
      if (specifier.startsWith("@")) {
        const parts = specifier.split("/");
        pkg = parts.slice(0, 2).join("/");
      } else {
        pkg = specifier.split("/")[0];
      }

      // Ignore standard React runtime
      if (pkg === "react" || pkg === "react-dom" || pkg === "next") continue;
      // Ignore clsx & tailwind-merge used in lib/utils
      if (pkg === "clsx" || pkg === "tailwind-merge") continue;

      externalImports.add(pkg);
    }
  }

  const missingDeps: string[] = [];
  for (const dep of externalImports) {
    if (!declaredDeps.has(dep)) {
      missingDeps.push(dep);
    }
  }

  if (missingFiles.length > 0 || missingDeps.length > 0) {
    issuesFound++;
    console.log(`⚠️  ${entry.slug} (${entry.name}):`);
    if (missingFiles.length > 0) {
      console.log(`    - MISSING SOURCE FILES: ${missingFiles.join(", ")}`);
    }
    if (missingDeps.length > 0) {
      console.log(`    - UNDECLARED DEPENDENCIES: ${missingDeps.join(", ")}`);
    }
  }
}

if (issuesFound === 0) {
  console.log(`✓ All ${registry.length} components have 100% complete dependencies and valid source files!`);
} else {
  console.log(`\nFound ${issuesFound} component(s) with missing dependency metadata.`);
}
