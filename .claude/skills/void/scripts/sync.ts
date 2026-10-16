/**
 * Rebuilds this skill's references/ from the adgrid-ui (void-ui) repo, so the skill never drifts
 * from the library. Run it after adding or changing a component:
 *
 *   npx tsx .claude/skills/void/scripts/sync.ts [path/to/adgrid-ui]
 *
 * Writes:
 *   references/primitives.md  ← packages/ui/src/primitives/context.md (the rules)
 *   references/design.md      ← DESIGN.md (long-form material spec)
 *   references/product.md     ← apps/docs/PRODUCT.md (tone, anti-references)
 *   references/catalog.md     ← apps/docs/src/registry/index.ts + component sources (what exists)
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const SKILL = path.resolve(__dirname, "..");
const OUT = path.join(SKILL, "references");
const REGISTRY_URL = "https://void-ui-phi.vercel.app/r";

function findRepo(start: string): string {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "apps/docs/src/registry/index.ts"))) return dir;
    const up = path.dirname(dir);
    if (up === dir) throw new Error(`No adgrid-ui repo found from ${start}. Pass its path as the first argument.`);
    dir = up;
  }
}

// Pull every `export interface …Props {…}` and `export type … =` out of a source file.
function extractApi(source: string): string[] {
  const out: string[] = [];
  const iface = /export interface (\w+)[^{]*\{/g;
  let m: RegExpExecArray | null;
  while ((m = iface.exec(source))) {
    let depth = 0;
    let i = m.index + m[0].length - 1;
    for (; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}" && --depth === 0) break;
    }
    out.push(source.slice(m.index, i + 1));
  }
  for (const line of source.split("\n")) {
    if (/^export type \w+ =/.test(line) && line.trim().endsWith(";")) out.push(line.trim());
  }
  return out;
}

function exportedNames(source: string): string[] {
  const names = new Set<string>();
  for (const m of source.matchAll(/export (?:const|function) (\w+)/g)) names.add(m[1]);
  return [...names].filter((n) => /^[A-Z]/.test(n) || n.startsWith("use") || n === "toast");
}

function header(from: string) {
  return `<!-- Synced from ${from} by scripts/sync.ts on ${new Date().toISOString().slice(0, 10)}. Edit the source, not this copy. -->\n\n`;
}

async function main() {
  const repo = findRepo(process.argv[2] ?? process.cwd());
  fs.mkdirSync(OUT, { recursive: true });

  const copies: [string, string][] = [
    ["packages/ui/src/primitives/context.md", "primitives.md"],
    ["DESIGN.md", "design.md"],
    ["apps/docs/PRODUCT.md", "product.md"],
  ];
  for (const [from, to] of copies) {
    const src = path.join(repo, from);
    if (!fs.existsSync(src)) {
      console.warn(`  skipped ${from} (missing)`);
      continue;
    }
    fs.writeFileSync(path.join(OUT, to), header(from) + fs.readFileSync(src, "utf8"));
    console.log(`  references/${to}`);
  }

  const mod = await import(pathToFileURL(path.join(repo, "apps/docs/src/registry/index.ts")).href);
  const registry: any[] = mod.registry ?? mod.default?.registry;
  const order = ["primitives", "buttons", "widgets", "charts", "animated", "backgrounds"];
  const groups = new Map<string, any[]>();
  for (const e of registry) groups.set(e.category, [...(groups.get(e.category) ?? []), e]);

  let md = header("apps/docs/src/registry/index.ts + packages/ui/src");
  md += `# Component Catalog\n\n`;
  md += `Everything the library ships, ${registry.length} entries. **Primitives** are the system: use them for every\n`;
  md += `everyday control. Everything else is a **showpiece**: use at most one or two per page, where the page\n`;
  md += `calls for a moment (a hero, a background, a signature interaction). See SKILL.md › Showpieces.\n\n`;
  md += `Install any entry into a React + Tailwind v4 project with the shadcn CLI:\n\n`;
  md += "```bash\nnpx shadcn@latest add " + REGISTRY_URL + "/<slug>.json\n```\n\n";
  md += `Files land in \`components/ui/\` and import \`cn\` from \`@/lib/utils\`. Or use the package: \`@adgrid-ui/ui\`.\n\n`;
  md += `## Index\n\n| Slug | Name | Category |\n|---|---|---|\n`;
  for (const cat of order) for (const e of groups.get(cat) ?? []) md += `| \`${e.slug}\` | ${e.name} | ${cat} |\n`;
  md += `\n`;

  for (const cat of [...order, ...[...groups.keys()].filter((k) => !order.includes(k))]) {
    const entries = groups.get(cat);
    if (!entries?.length) continue;
    md += `---\n\n## ${cat[0].toUpperCase()}${cat.slice(1)}\n\n`;
    for (const e of entries) {
      md += `### ${e.name} — \`${e.slug}\`\n\n${e.description}\n\n`;
      md += `- Install: \`npx shadcn@latest add ${REGISTRY_URL}/${e.slug}.json\`\n`;
      if (e.dependencies?.length) md += `- Depends on: ${e.dependencies.map((d: string) => `\`${d}\``).join(", ")}\n`;
      md += `- Source: \`packages/ui/src/${e.packagePath}\`\n`;
      const file = path.join(repo, "packages/ui/src", e.packagePath);
      const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
      if (cat === "primitives" && source) {
        const names = exportedNames(source);
        if (names.length) md += `- Exports: ${names.map((n) => `\`${n}\``).join(", ")}\n`;
        const api = extractApi(source);
        if (api.length) md += `\n\`\`\`ts\n${api.join("\n\n")}\n\`\`\`\n`;
      } else if (e.propDefs?.length) {
        md += `- Props: ${e.propDefs
          .map((p: any) => `\`${p.name}\`${p.default !== undefined ? ` (${JSON.stringify(p.default)})` : ""}`)
          .join(", ")}\n`;
      }
      md += `\n`;
    }
  }
  fs.writeFileSync(path.join(OUT, "catalog.md"), md);
  console.log(`  references/catalog.md (${registry.length} components)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
