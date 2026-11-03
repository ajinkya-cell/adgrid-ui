#!/usr/bin/env node
/**
 * Lists the void-ui components from the live registry, so the skill sees components newer than its
 * catalog snapshot.
 *
 *   node registry.mjs            all live components
 *   node registry.mjs <word>     filter by slug, title or description
 *   node registry.mjs --new      only those missing from references/catalog.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REGISTRY = "https://www.voidui.in/r";
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const onlyNew = args.includes("--new");
const query = args.filter((a) => !a.startsWith("--")).join(" ").toLowerCase();

let items;
try {
  const res = await fetch(`${REGISTRY}/registry.json`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  items = (await res.json()).items ?? [];
} catch (err) {
  console.error(`Live registry unreachable (${err.message}). Use references/catalog.md instead.`);
  process.exit(1);
}

const catalog = fs.readFileSync(path.join(here, "../references/catalog.md"), "utf8");
const known = new Set([...catalog.matchAll(/\/r\/([a-z0-9-]+)\.json/g)].map((m) => m[1]));

const rows = items
  .filter((i) => !onlyNew || !known.has(i.name))
  .filter((i) => !query || `${i.name} ${i.title ?? ""} ${i.description ?? ""}`.toLowerCase().includes(query));

for (const i of rows) {
  const desc = (i.description ?? "").split(/(?<=\.)\s/)[0].slice(0, 140);
  const tag = known.has(i.name) ? "" : "  [new: not in catalog]";
  console.log(`${i.name}  ·  ${i.title ?? ""}${tag}\n    ${desc}`);
}
console.log(`\n${rows.length} of ${items.length} live components. Install: npx shadcn@latest add ${REGISTRY}/<slug>.json`);
