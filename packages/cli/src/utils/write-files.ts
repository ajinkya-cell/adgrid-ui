import fs from "fs-extra";
import path from "path";

export async function writeFiles(
  files: Record<string, string>,
  outputDir: string,
  libDir: string
): Promise<string[]> {
  const written: string[] = [];

  // Calculate relative path for utils.ts
  const relativeLibPath = path
    .relative(outputDir, path.join(libDir, "utils"))
    .replace(/\\/g, "/");
  const utilsImportPath = relativeLibPath.startsWith(".")
    ? relativeLibPath
    : `./${relativeLibPath}`;

  for (const [filePath, code] of Object.entries(files)) {
    const isLib = filePath.startsWith("lib/");
    const absolutePath = isLib
      ? path.join(libDir, filePath.replace("lib/", ""))
      : path.join(outputDir, path.basename(filePath));

    let finalCode = code;
    if (!isLib && code.includes("../lib/utils")) {
      finalCode = code.replace(
        /["']\.\.\/lib\/utils["']/g,
        `"${utilsImportPath}"`
      );
    }

    await fs.ensureDir(path.dirname(absolutePath));
    await fs.writeFile(absolutePath, finalCode, "utf-8");
    written.push(absolutePath);
  }

  return written;
}
