#!/usr/bin/env node
/**
 * Flags code that's off the adgrid-ui system: stray colours, glows, glass, gradient text, kickers,
 * side stripes, in-component font loading, arbitrary shadows. No dependencies.
 *
 *   node lint.mjs [paths…] [--json] [--errors-only]
 *
 * Run it on the target project before a revamp (to size the job) and after (to prove it's done).
 * Exit code 1 when any error is found. A finding can be silenced on its line with `void-lint-ignore`
 * plus a reason, e.g.  // void-lint-ignore: brand logo colour
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const json = args.includes("--json");
const errorsOnly = args.includes("--errors-only");
const roots = args.filter((a) => !a.startsWith("--"));
if (!roots.length) roots.push(".");

const EXTS = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs", ".css", ".scss", ".sass", ".less", ".html", ".vue", ".svelte", ".astro", ".mdx"]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".nuxt", ".svelte-kit", ".turbo", ".vercel", "dist", "build", "out", "coverage", "public", "vendor"]);
const COMPONENT_EXTS = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro"]);

// Every hex the system uses. Anything else is off-palette.
const PALETTE = new Set(
  [
    "#050505", "#1b1b1d", "#151516", "#1f1f21", "#18181a", "#0c0c0d", "#070707", "#171717", "#151515",
    "#f5f5f5", "#d9d9d9", "#a3a3a3", "#737373", "#525252", "#0a0a0a",
    "#000", "#000000", "#fff", "#ffffff",
  ].map((h) => h.toLowerCase())
);

// The §2 shadows, normalised, so an arbitrary shadow that *is* a token isn't flagged.
const norm = (s) => s.replace(/_/g, " ").replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").replace(/\(\s*/g, "(").replace(/\s*\)/g, ")").trim().toLowerCase();
const SHADOW_TOKENS = [
  "inset 0 1.5px 0 0 rgba(255,255,255,0.08),inset 0 -1px 0 0 rgba(0,0,0,0.5),0 14px 30px -10px rgba(0,0,0,0.5),0 1px 4px -1px rgba(0,0,0,0.35)",
  "inset 0 1.5px 0 0 rgba(255,255,255,0.12),inset 0 -1px 0 0 rgba(0,0,0,0.6),0 20px 40px -12px rgba(0,0,0,0.7),0 2px 8px -2px rgba(0,0,0,0.5)",
  "inset 0 3px 8px rgba(0,0,0,0.75),inset 0 1px 0 rgba(255,255,255,0.02)",
  "inset 0 1.5px 0 0 rgba(255,255,255,0.08),inset 0 -1.5px 0 0 rgba(0,0,0,0.45),0 40px 100px -20px rgba(0,0,0,0.9),0 8px 24px -6px rgba(0,0,0,0.7)",
  "inset 0 1.5px 3px rgba(0,0,0,0.85),0 1px 0 rgba(255,255,255,0.05)",
  "inset 0 1px 0 rgba(255,255,255,0.9),inset 0 -1px 0 rgba(0,0,0,0.18),0 1px 2px rgba(0,0,0,0.6),0 4px 10px -2px rgba(0,0,0,0.5)",
].map(norm);

const hexes = (line) =>
  [...line.matchAll(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g)].map((m) => m[0].toLowerCase()).filter((h) => !PALETTE.has(h.slice(0, 7)));
// A grey: all three channels within 8 of each other.
function isNeutral(hex) {
  let h = hex.slice(1);
  if (h.length <= 4) h = [...h.slice(0, 3)].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return Math.max(r, g, b) - Math.min(r, g, b) <= 8;
}

const HUES = "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

/** @type {{id:string, level:"error"|"warn", test:(line:string, ctx:{ext:string, file:string})=>string|null}[]} */
const RULES = [
  {
    id: "off-palette-hex",
    level: "error",
    test(line) {
      // Skip things that only look like hex: URL fragments, ids, CSS id selectors.
      if (/href=|url\(#|#[a-z_-]+\w*\s*\{/.test(line)) return null;
      const bad = hexes(line).filter((h) => !PALETTE.has(h) && !isNeutral(h));
      return bad.length ? `colour ${bad.join(", ")} isn't in the system. Hue is only for status: use var(--v-danger|success|warning) or a neutral.` : null;
    },
  },
  {
    id: "off-token-grey",
    level: "warn",
    test(line) {
      if (/href=|url\(#|#[a-z_-]+\w*\s*\{/.test(line)) return null;
      const bad = hexes(line).filter((h) => !PALETTE.has(h) && isNeutral(h));
      return bad.length ? `grey ${bad.join(", ")} isn't a token. Snap it to the nearest surface or text token.` : null;
    },
  },
  {
    id: "saturated-utility",
    level: "error",
    test(line) {
      const m = line.match(new RegExp(`\\b(?:bg|from|via|to|ring|shadow|fill|stroke|outline|decoration|accent|caret|divide)-(?:${HUES})-\\d{2,3}\\b`));
      return m ? `\`${m[0]}\`: colour is only for status, as text, a dot or a 40% edge. Never a fill.` : null;
    },
  },
  {
    id: "coloured-text",
    level: "warn",
    test(line) {
      const m = line.match(new RegExp(`\\b(?:text|border)-(?:${HUES})-\\d{2,3}\\b`));
      return m ? `\`${m[0]}\`: fine only if it carries status (error, success). Prefer var(--v-danger|success|warning).` : null;
    },
  },
  {
    id: "glow",
    level: "error",
    test(line) {
      if (/drop-shadow\(\s*0(px)?[\s_]+0(px)?[\s_]+\d/.test(line) || /shadow-\[0_0_\d/.test(line)) return "centred shadow reads as a glow. Nothing glows unless it's live.";
      if (/box-shadow\s*:\s*0(px)?\s+0(px)?\s+\d+px/.test(line)) return "centred box-shadow reads as a glow. Use a §2 shadow.";
      if (/text-shadow\s*:|\[text-shadow/.test(line) && !/none/.test(line)) return "text-shadow: no glowing or embossed text.";
      return null;
    },
  },
  {
    id: "idle-animation",
    level: "error",
    test(line) {
      const m = line.match(/\banimate-(pulse|ping|bounce)\b/);
      return m ? `\`${m[0]}\`: no idle motion unless the thing is live (recording, streaming).` : null;
    },
  },
  {
    id: "glassmorphism",
    level: "error",
    test(line) {
      if (/\bbackdrop-blur-(md|lg|xl|2xl|3xl)\b/.test(line)) return "frosted glass. Overlays use rgba(0,0,0,0.62) + blur(3px) at most.";
      const m = line.match(/backdrop-filter\s*:\s*blur\((\d+)px/) || line.match(/backdrop-blur-\[(\d+)px\]/);
      return m && Number(m[1]) > 3 ? `backdrop blur ${m[1]}px. Max is 3px, behind overlays only.` : null;
    },
  },
  {
    id: "gradient-text",
    level: "error",
    test(line) {
      return /\bbg-clip-text\b|background-clip\s*:\s*text/.test(line) ? "gradient text is an anti-reference. Solid text-primary." : null;
    },
  },
  {
    id: "kicker",
    level: "warn",
    test(line) {
      return /\buppercase\b/.test(line) && /\btracking-(wide|wider|widest|\[0\.[1-9])/.test(line)
        ? "tiny uppercase tracked kicker is an anti-reference. Use a plain text-tertiary line, or nothing."
        : null;
    },
  },
  {
    id: "side-stripe",
    level: "warn",
    test(line) {
      return /\bborder-l-(2|4|8|\[\d+px\])\b|border-left\s*:\s*[2-9]px solid/.test(line)
        ? "side-stripe border is an anti-reference. Status goes on the top edge at 40%, or a dot."
        : null;
    },
  },
  {
    id: "font-in-component",
    level: "error",
    test(line, { ext }) {
      if (!COMPONENT_EXTS.has(ext)) return null;
      return /fonts\.googleapis\.com|@import\s+url\(|font-family\s*:|fontFamily\s*:/.test(line)
        ? "components never load or set a font. One sans + one mono, set once at the app root."
        : null;
    },
  },
  {
    id: "off-system-shadow",
    level: "warn",
    test(line) {
      const stock = line.match(/\bshadow-(sm|md|lg|xl|2xl|inner)\b/);
      if (stock) return `\`${stock[0]}\`: stock shadow. Use shadow-raised, -raised-hover, -overlay, -well or -popout (var(--v-shadow-*)).`;
      const m = line.match(/shadow-\[([^\]]+)\]/) || line.match(/box-shadow\s*:\s*([^;}{]+)/);
      if (!m || /var\(--v-/.test(m[1]) || SHADOW_TOKENS.includes(norm(m[1]))) return null;
      // Black and white light is the system's own; anything tinted is not.
      const colours = [...m[1].matchAll(/rgba?\(([^)]+)\)|#[0-9a-fA-F]{3,8}\b/g)].map((c) => c[0].toLowerCase());
      const tinted = colours.filter((c) => !/^rgba?\(\s*(0[\s,_]+0[\s,_]+0|255[\s,_]+255[\s,_]+255)\b/.test(c) && !/^#(000|fff)/.test(c));
      return tinted.length ? `tinted shadow (${tinted.join(", ")}). Light here is white from above, shadow is black.` : null;
    },
  },
  {
    id: "long-transition",
    level: "warn",
    test(line) {
      const m = line.match(/\bduration-(\d{3,4})\b/) || line.match(/transition[^;]*?\b(\d{3,4})ms/);
      return m && Number(m[1]) > 400 ? `${m[1]}ms: controls move in ≤250ms, panels 260ms. Motion confirms, it doesn't perform.` : null;
    },
  },
];

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isFile()) {
    if (EXTS.has(path.extname(p))) yield p;
    return;
  }
  for (const name of fs.readdirSync(p)) {
    if (SKIP_DIRS.has(name) || name.startsWith(".")) continue;
    yield* walk(path.join(p, name));
  }
}

const findings = [];
for (const root of roots) {
  if (!fs.existsSync(root)) {
    console.error(`no such path: ${root}`);
    process.exit(2);
  }
  for (const file of walk(root)) {
    const text = fs.readFileSync(file, "utf8");
    if (text.includes("void-tokens")) continue; // the token file itself
    const ext = path.extname(file);
    text.split(/\r?\n/).forEach((line, i) => {
      if (line.includes("void-lint-ignore") || line.length > 2000) return;
      for (const rule of RULES) {
        if (errorsOnly && rule.level !== "error") continue;
        const msg = rule.test(line, { ext, file });
        if (msg) findings.push({ file, line: i + 1, rule: rule.id, level: rule.level, message: msg });
      }
    });
  }
}

if (json) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const byFile = new Map();
  for (const f of findings) byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);
  for (const [file, list] of byFile) {
    console.log(`\n${file}`);
    for (const f of list) console.log(`  ${String(f.line).padStart(5)}  ${f.level === "error" ? "error" : "warn "}  ${f.rule.padEnd(18)} ${f.message}`);
  }
  const errors = findings.filter((f) => f.level === "error").length;
  const counts = {};
  for (const f of findings) counts[f.rule] = (counts[f.rule] ?? 0) + 1;
  console.log(`\n${errors} error(s), ${findings.length - errors} warning(s) in ${byFile.size} file(s).`);
  if (findings.length) console.log(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([r, n]) => `  ${r}: ${n}`).join("\n"));
}
process.exit(findings.some((f) => f.level === "error") ? 1 : 0);
