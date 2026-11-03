#!/usr/bin/env node
/**
 * Keeps the void skill in step with the library, on the user's say-so.
 *
 *   node .claude/scripts/void-skill-update.mjs            report what's out of date (changes nothing)
 *   node .claude/scripts/void-skill-update.mjs --apply    sync references/ and copy the skill to ~/.claude/skills/void
 *   node .claude/scripts/void-skill-update.mjs --hook     used by the Claude Code hooks in .claude/settings.json:
 *                                                         reminds (once per change, per session), never updates
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SKILL = path.join(REPO, ".claude/skills/void");
const GLOBAL = path.join(os.homedir(), ".claude/skills/void");
const REGISTRY = path.join(REPO, "apps/docs/src/registry/index.ts");

const slugsIn = (file, re) => (fs.existsSync(file) ? new Set([...fs.readFileSync(file, "utf8").matchAll(re)].map((m) => m[1])) : new Set());

function status() {
  const registry = slugsIn(REGISTRY, /slug:\s*"([a-z0-9-]+)"/g);
  // every catalog entry carries an install line ending in /r/<slug>.json
  const known = slugsIn(path.join(SKILL, "references/catalog.md"), /\/r\/([a-z0-9-]+)\.json/g);
  const missing = [...registry].filter((s) => !known.has(s));
  const removed = [...known].filter((s) => s !== "<slug>" && !registry.has(s));

  const localCat = path.join(SKILL, "references/catalog.md");
  const globalCat = path.join(GLOBAL, "references/catalog.md");
  const globalState = !fs.existsSync(GLOBAL) ? "missing" : !fs.existsSync(globalCat) || fs.readFileSync(globalCat, "utf8") !== fs.readFileSync(localCat, "utf8") || fs.readFileSync(path.join(GLOBAL, "SKILL.md"), "utf8") !== fs.readFileSync(path.join(SKILL, "SKILL.md"), "utf8") ? "stale" : "current";
  return { missing, removed, globalState };
}

function describe({ missing, removed, globalState }) {
  const parts = [];
  if (missing.length) parts.push(`${missing.length} new component(s) not in the void skill yet: ${missing.join(", ")}`);
  if (removed.length) parts.push(`${removed.length} catalog entr(ies) no longer in the registry: ${removed.join(", ")}`);
  if (globalState === "missing") parts.push("the skill isn't installed globally (~/.claude/skills/void), so other projects can't use it");
  else if (globalState === "stale") parts.push("the global copy in ~/.claude/skills/void is behind this repo's copy");
  return parts;
}

function apply() {
  console.log("Syncing references/ from the repo…");
  execFileSync(process.execPath, ["--no-warnings", "--experimental-strip-types", path.join(SKILL, "scripts/sync.ts"), REPO], { stdio: "inherit", cwd: REPO });
  console.log(`Copying the skill to ${GLOBAL}…`);
  fs.rmSync(GLOBAL, { recursive: true, force: true });
  fs.cpSync(SKILL, GLOBAL, { recursive: true });
  const s = status();
  console.log(describe(s).length ? `Still out of date: ${describe(s).join("; ")}` : "void skill is up to date, here and globally.");
}

async function hook() {
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return; // not called by a hook: stay quiet
  }
  const event = input.hook_event_name;
  if (event !== "SessionStart" && event !== "PostToolUse") return;
  if (event === "PostToolUse") {
    const file = String(input.tool_input?.file_path ?? "").replace(/\\/g, "/");
    if (!file.endsWith("apps/docs/src/registry/index.ts")) return;
  }

  const s = status();
  const parts = describe(s);
  if (!parts.length) return;

  // Remind once per distinct change per session, so declining doesn't bring it back on every edit.
  const sig = JSON.stringify([s.missing, s.removed, s.globalState]);
  const mark = path.join(os.tmpdir(), `void-skill-reminded-${input.session_id ?? "nosession"}.json`);
  if (fs.existsSync(mark) && fs.readFileSync(mark, "utf8") === sig) return;
  fs.writeFileSync(mark, sig);

  const summary = `void skill is out of date: ${parts.join("; ")}.`;
  const context =
    `${summary} Ask the user whether to update the void skill now (in one short question, at a natural point, ` +
    `not mid-task). Do NOT update it unless they approve. If they approve, run: ` +
    `node .claude/scripts/void-skill-update.mjs --apply  — then report the result. If they decline, drop it.`;
  process.stdout.write(
    JSON.stringify({
      systemMessage: `${summary} Claude will ask before updating.`,
      hookSpecificOutput: { hookEventName: event, additionalContext: context },
    }),
  );
}

const arg = process.argv[2];
if (arg === "--apply") apply();
else if (arg === "--hook") await hook();
else {
  const parts = describe(status());
  console.log(parts.length ? `void skill is out of date:\n- ${parts.join("\n- ")}\n\nRun with --apply to update.` : "void skill is up to date, here and globally.");
}
