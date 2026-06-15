import { registry } from "../src/registry";
import fs from "fs";
import path from "path";

const UI_SRC = path.join(__dirname, "../../../packages/ui/src");
const OUTPUT = path.join(__dirname, "../public/registry");

fs.mkdirSync(OUTPUT, { recursive: true });

const index: Record<string, object> = {};

for (const entry of registry) {
  const filePath = path.join(UI_SRC, entry.packagePath);
  const code = fs.readFileSync(filePath, "utf-8");

  const payload = { ...entry, code };
  index[entry.slug] = payload;

  // write individual JSON per component
  fs.writeFileSync(
    path.join(OUTPUT, `${entry.slug}.json`),
    JSON.stringify(payload, null, 2)
  );
}

// write master index
fs.writeFileSync(
  path.join(OUTPUT, "index.json"),
  JSON.stringify(index, null, 2)
);

console.log(`✓ Built registry: ${registry.length} components`);