#!/usr/bin/env node
/**
 * Lints Roughly annotation usage against the rules in this skill. No dependencies.
 *
 *   node check.mjs <files or dirs…>        lint .tsx/.jsx/.mdx files
 *   node check.mjs --setup [project root]  check install, dependencies, fonts, Tailwind
 *   node check.mjs --json …                machine-readable output
 *
 * Exit code 1 when there are errors. Warnings are judgement calls: fix them or be able to say why not.
 * It's a heuristic (regex-based, no full JSX parser): it reads literal props; computed values are skipped.
 */
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const JSON_OUT = argv.includes("--json");
const SETUP = argv.includes("--setup");
const targets = argv.filter((a) => !a.startsWith("--"));

const IGNORE_DIRS = new Set(["node_modules", ".next", "dist", "build", ".git", ".turbo", "out", "coverage", ".vercel"]);
const findings = [];
const add = (file, line, level, rule, message, fix) => findings.push({ file, line, level, rule, message, fix });

function walk(p, exts, out = []) {
  if (!fs.existsSync(p)) return out;
  const st = fs.statSync(p);
  if (st.isFile()) {
    if (exts.some((e) => p.endsWith(e))) out.push(p);
    return out;
  }
  for (const name of fs.readdirSync(p)) {
    if (IGNORE_DIRS.has(name) || name.startsWith(".")) continue;
    walk(path.join(p, name), exts, out);
  }
  return out;
}

const rel = (f) => path.relative(process.cwd(), f) || f;

// ───────────────────────────── setup mode ─────────────────────────────
if (SETUP) {
  const root = path.resolve(targets[0] ?? ".");
  const pkgPath = path.join(root, "package.json");
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, "utf8")) : null;
  const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
  const files = walk(root, [".tsx", ".ts", ".jsx", ".js", ".mdx", ".css", ".html"]);

  if (!pkg) add(rel(pkgPath), 0, "error", "setup/package", "No package.json here.", "Run from the project root, or pass it: check.mjs --setup path/to/app");

  const roughlyFile = files.find((f) => /[\\/]Roughly\.(tsx|jsx)$/.test(f));
  if (!roughlyFile) {
    add(rel(root), 0, "error", "setup/install", "Roughly components not found.", "npx shadcn@latest add https://www.voidui.in/r/roughly.json (references/setup.md)");
  } else {
    const dir = path.join(path.dirname(roughlyFile), "roughly");
    const needed = ["RoughUnderline", "RoughCircle", "RoughHighlight", "RoughBox", "RoughBracket", "RoughStrike", "RoughCross", "RoughCheck", "RoughArrow", "RoughSticky", "RoughHandwriting", "handwriting-fonts", "useRoughMotion"];
    const missing = needed.filter((n) => !fs.existsSync(path.join(dir, `${n}.tsx`)) && !fs.existsSync(path.join(dir, `${n}.ts`)));
    if (missing.length) add(rel(dir), 0, "error", "setup/files", `Missing component files: ${missing.join(", ")}.`, "Re-run the shadcn add command with --overwrite (an older registry version shipped without them)");
  }

  for (const d of ["framer-motion", "rough-notation", "roughjs", "opentype.js"]) {
    if (pkg && !deps[d]) add(rel(pkgPath), 0, "error", "setup/deps", `Dependency "${d}" is not installed.`, `npm i ${d}`);
  }
  if (pkg && !deps.tailwindcss && !deps["@tailwindcss/postcss"] && !deps["@tailwindcss/vite"]) {
    add(rel(pkgPath), 0, "error", "setup/tailwind", "Tailwind CSS not found; Roughly is styled with Tailwind classes.", "Install Tailwind v4 (or v3.4+) — references/setup.md");
  }

  const code = files.filter((f) => !/[\\/]roughly[\\/]/i.test(f) && !/[\\/]Roughly\.(tsx|jsx)$/.test(f));
  const all = code.map((f) => fs.readFileSync(f, "utf8")).join("\n");
  const usesKalam = /labelFont=["']kalam|font=["']kalam/.test(all);
  const usesReenie = /labelFont=["']reenie-beanie|font=["']reenie-beanie/.test(all);
  const caveatLoaded = /--font-caveat|family=Caveat|['"]Caveat['"]|Caveat\(/.test(all);
  if (!caveatLoaded) add(rel(root), 0, "warn", "setup/fonts", "Caveat isn't loaded: arrow labels and sticky notes will fall back to the page font.", "Add the Google Fonts link or next/font Caveat with variable --font-caveat (assets/fonts-next.tsx, assets/fonts.css)");
  if (usesKalam && !/family=Kalam|['"]Kalam['"]/.test(all)) add(rel(root), 0, "warn", "setup/fonts", "Kalam is used but not loaded.", "Add Kalam to the Google Fonts link");
  if (usesReenie && !/family=Reenie\+Beanie|Reenie Beanie/.test(all)) add(rel(root), 0, "warn", "setup/fonts", "Reenie Beanie is used but not loaded.", "Add Reenie+Beanie to the Google Fonts link");

  if (/<Roughly\.Handwriting|type=["']handwriting/.test(all)) {
    const pub = ["public/fonts", "static/fonts"].map((p) => path.join(root, p)).find((p) => fs.existsSync(p));
    if (!pub) add(rel(root), 0, "warn", "setup/handwriting-fonts", "Handwriting is used but public/fonts/ has no TTFs; it will fetch them from raw.githubusercontent.com (blocked by most CSPs).", "Download the TTFs into public/fonts/ (references/setup.md › Handwriting)");
  }

  report("setup");
}

// ───────────────────────────── lint mode ─────────────────────────────
const MARKS = {
  Underline: { semantic: false },
  Circle: { semantic: false },
  Highlight: { semantic: false },
  Box: { semantic: false },
  Bracket: { semantic: false },
  Arrow: { semantic: false },
  Sticky: { semantic: false },
  Handwriting: { semantic: false },
  Strike: { semantic: true },
  Cross: { semantic: true },
  Check: { semantic: true },
};
const TYPE_TO_MARK = {
  underline: "Underline", circle: "Circle", highlight: "Highlight", box: "Box", bracket: "Bracket",
  arrow: "Arrow", sticky: "Sticky", handwriting: "Handwriting", "strike-through": "Strike",
  "cross-off": "Cross", check: "Check",
};
const DIRECT = Object.fromEntries(Object.keys(MARKS).map((k) => [`Rough${k}`, k]));

function lineOf(text, idx) {
  let n = 1;
  for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

/** Read a JSX opening tag starting at `start` ('<'); returns { attrs, end, selfClosing }. */
function readTag(text, start) {
  let depth = 0;
  let quote = null;
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (depth > 0 && (c === '"' || c === "'" || c === "`")) { quote = c; continue; }
    if (depth === 0 && (c === '"' || c === "'")) { quote = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) {
      return { raw: text.slice(start, i + 1), end: i + 1, selfClosing: text[i - 1] === "/" };
    }
  }
  return null;
}

function attr(raw, name) {
  const re = new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|\\{\\s*([^}]*?)\\s*\\})`);
  const m = raw.match(re);
  if (!m) return undefined;
  if (m[1] !== undefined) return m[1];
  if (m[2] !== undefined) return m[2];
  const expr = m[3];
  const s = expr.match(/^["'`]([^"'`]*)["'`]$/);
  if (s) return s[1];
  if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
  return { expr };
}
const has = (raw, name) => new RegExp(`\\s${name}(=|\\s|/?>)`).test(raw);

function childrenText(text, from, closeTag) {
  const end = text.indexOf(closeTag, from);
  if (end < 0) return { text: "", end: from };
  const inner = text.slice(from, end);
  const plain = inner
    .replace(/<[^>]*>/g, " ")
    .replace(/\{["'`]([^"'`]*)["'`]\}/g, "$1")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { text: plain, end, hasElements: /<\w/.test(inner) };
}

const words = (s) => (s ? s.split(/\s+/).filter(Boolean).length : 0);

function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let hue = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hue *= 60;
  }
  return { h: hue, s, l };
}
const isRed = (c) => { const x = hexToHsl(c); return x && x.s > 0.45 && (x.h < 15 || x.h > 345); };
const isGreen = (c) => { const x = hexToHsl(c); return x && x.s > 0.35 && x.h > 95 && x.h < 160; };

// Same table as arrowAutoBend in RoughArrow.tsx: the bend that lands the head on the target's edge.
const AUTO_BEND = { "top-right": 0.32, "bottom-left": 0.32, "top-left": -0.32, "bottom-right": -0.32, top: 0.2, left: 0.2, bottom: -0.2, right: -0.2 };

const DEPRECATED = {
  arrowCurvature: "use arrowBend",
  curvature: "use bend (−1…1)",
  flipCurve: "use a negative bend",
  bowing: "remove it (unused)",
};

function lintFile(file) {
  const text = fs.readFileSync(file, "utf8");
  if (/[\\/]roughly[\\/]Rough\w+\.tsx$/.test(file) || /[\\/]Roughly\.tsx$/.test(file)) return; // the library itself
  const re = /<(Roughly\.(\w+)|Roughly|Rough(Underline|Circle|Highlight|Box|Bracket|Strike|Cross|Check|Arrow|Sticky|Handwriting))(?=[\s>/])/g;
  const marks = [];
  let m;
  while ((m = re.exec(text))) {
    const start = m.index;
    const tag = readTag(text, start);
    if (!tag) continue;
    const line = lineOf(text, start);
    const tagName = m[1];
    let kind;
    if (m[2]) kind = m[2];
    else if (m[3]) kind = m[3];
    else {
      const t = attr(tag.raw, "type");
      if (typeof t === "string") {
        if (!TYPE_TO_MARK[t]) {
          add(rel(file), line, "error", "type/unknown", `Unknown type "${t}".`, `Use one of: ${Object.keys(TYPE_TO_MARK).join(", ")} (e.g. "cross-off", not "crossed-off")`);
          continue;
        }
        kind = TYPE_TO_MARK[t];
      } else kind = t === undefined ? "Underline" : null;
    }
    if (!kind || !MARKS[kind]) continue;
    const kids = tag.selfClosing ? { text: "", end: tag.end } : childrenText(text, tag.end, `</${tagName}>`);
    const before = text.slice(Math.max(0, start - 300), start);
    marks.push({ kind, line, raw: tag.raw, kids, before, start, typeForm: tagName === "Roughly" });
  }

  const inks = new Map();
  let stickies = 0, arrows = 0;
  for (const mk of marks) {
    const { kind, line, raw, kids, before } = mk;
    const f = rel(file);
    const color = attr(raw, "color");
    const sw = attr(raw, "strokeWidth");
    const cls = attr(raw, "className");
    const clsStr = typeof cls === "string" ? cls : typeof cls === "object" ? cls.expr : "";
    const nWords = words(kids.text);

    for (const [p, fix] of Object.entries(DEPRECATED)) if (has(raw, p)) add(f, line, "error", "prop/deprecated", `Deprecated prop "${p}".`, fix);
    if (kind === "Bracket" && has(raw, "brackets") && !mk.typeForm) add(f, line, "warn", "prop/deprecated", `"brackets" is an alias; use "side".`, `side="left"`);

    if (color === undefined && kind !== "Sticky") {
      add(f, line, "warn", "color/missing", `${kind} has no color: each type has a different default, which gives a rainbow page.`, "Pass the page ink (color.md)");
    } else if (typeof color === "string") {
      if (/^var\(/.test(color)) add(f, line, "warn", "color/css-var", "CSS variables aren't reliable in SVG stroke/fill attributes.", "Pass a hex colour; switch by theme in JS (color.md)");
      if (!MARKS[kind].semantic && kind !== "Sticky") {
        inks.set(color.toLowerCase(), (inks.get(color.toLowerCase()) ?? 0) + 1);
        if (isRed(color) && kind !== "Bracket") add(f, line, "warn", "color/semantic", `Red ${kind}: red means removed/wrong.`, "Use the page ink for emphasis; keep red for strikes, cross-offs and cross marks");
        if (isGreen(color)) add(f, line, "warn", "color/semantic", `Green ${kind}: green means done/included.`, "Use the page ink; keep green for check marks");
      }
    } else if (typeof color === "object" && /var\(/.test(color.expr)) {
      add(f, line, "warn", "color/css-var", "CSS variables aren't reliable in SVG stroke/fill attributes.", "Pass a hex colour; switch by theme in JS (color.md)");
    }

    if (typeof sw === "number" && kind !== "Handwriting") {
      if (sw < 1 || sw > 6) add(f, line, "error", "size/stroke", `strokeWidth ${sw} is outside 1–6.`, "≈ font-size ÷ 14, clamped 1.5–4 (sizing.md)");
      else if (sw < 1.5 || sw > 4) add(f, line, "warn", "size/stroke", `strokeWidth ${sw} is outside the usual 1.5–4.`, "≈ font-size ÷ 14 (sizing.md)");
    }

    switch (kind) {
      case "Underline":
        if (nWords > 4) add(f, line, "warn", "target/too-long", `Underline on ${nWords} words.`, "Underline the 1–4 words that carry the point (choosing.md)");
        if (!/whitespace-nowrap/.test(clsStr) && nWords > 1) add(f, line, "warn", "layout/nowrap", "Multi-word underline without whitespace-nowrap: if it wraps it reads as two marks and can mis-draw after a layout shift.", 'className="whitespace-nowrap"');
        break;
      case "Circle":
        if (nWords > 3 || kids.text.length > 24) add(f, line, "warn", "target/too-long", `Circle on "${kids.text.slice(0, 40)}" (${nWords} words).`, "Circle 1–3 short words or a number; use a highlight or underline for phrases");
        if (mk.typeForm) add(f, line, "warn", "api/type-form", '<Roughly type="circle"> can\'t set paddingX/paddingY.', "Use <Roughly.Circle paddingX paddingY>");
        else if (!has(raw, "paddingX") || !has(raw, "paddingY")) add(f, line, "warn", "size/padding", "Circle without paddingX/paddingY: the defaults (22/10) are sized for display type.", "paddingX ≈ 0.35em, paddingY ≈ 0.15em of the text (sizing.md)");
        break;
      case "Highlight":
        if (nWords > 20) add(f, line, "warn", "target/too-long", `Highlight on ${nWords} words.`, "Highlight one sentence (≤ ~15 words)");
        if (!/<mark[\s>][^]*$/.test(before) || /<\/mark>[^]*$/.test(before.slice(before.lastIndexOf("<mark")))) add(f, line, "warn", "a11y/mark", "Highlight isn't inside <mark>.", '<mark className="bg-transparent text-inherit">…</mark> around it');
        break;
      case "Box":
        if (nWords > 6) add(f, line, "warn", "target/too-long", `Box around ${nWords} words of text.`, "Box UI elements or short values; bracket a block of text instead");
        break;
      case "Strike": {
        const inDel = /<del[\s>]/.test(before.slice(-160)) && !/<\/del>/.test(before.slice(before.lastIndexOf("<del")));
        if (!inDel) add(f, line, "warn", "a11y/del", "Strike-through isn't inside <del>.", "<del className=\"no-underline\">…</del> and the replacement in <ins>");
        const after = text.slice(kids.end, kids.end + 400);
        if (!/<ins[\s>]|→|->|&rarr;/.test(after)) add(f, line, "warn", "meaning/strike-alone", "Strike-through with no replacement after it.", "Show the new value right after the struck one (choosing.md › Strike-through)");
        break;
      }
      case "Cross":
        if (nWords > 6) add(f, line, "warn", "target/too-long", `Cross-off over ${nWords} words.`, "Cross off short items; an X over a paragraph is unreadable");
        break;
      case "Arrow":
        arrows++;
        if (!has(raw, "label") && !has(raw, "arrowLabel")) add(f, line, "warn", "meaning/arrow-label", "Arrow without a label.", 'Add label="…" (≤ 4 words) saying why to look');
        else {
          const lab = attr(raw, "label") ?? attr(raw, "arrowLabel");
          if (typeof lab === "string" && words(lab) > 4) add(f, line, "warn", "meaning/arrow-label", `Arrow label is ${words(lab)} words.`, "Keep labels to ≤ 4 words");
        }
        {
          // Geometry: the bend's sign decides whether the head lands on the target or skims along its edge.
          const pl = attr(raw, "placement") ?? attr(raw, "arrowPlacement") ?? "top-right";
          const variant = attr(raw, "variant") ?? attr(raw, "arrowVariant") ?? "curved";
          const bend = attr(raw, "bend") ?? attr(raw, "arrowBend");
          const auto = typeof pl === "string" && AUTO_BEND[pl] !== undefined ? AUTO_BEND[pl] * (variant === "s-curve" ? -1 : 1) : undefined;
          if (typeof bend === "number" && auto !== undefined && variant !== "straight") {
            if (bend !== 0 && Math.sign(bend) !== Math.sign(auto)) {
              add(f, line, "error", "arrow/bend-sign", `bend={${bend}} with placement="${pl}"${variant === "s-curve" ? " (s-curve)" : ""}: the head arrives along the target's edge instead of into it.`, `Remove bend (auto = ${auto}), or keep its sign: bend={${Math.sign(auto) * Math.abs(bend)}} (arrows.md › Bend)`);
            } else if (Math.abs(bend) > 0.5) {
              add(f, line, "warn", "arrow/bend-depth", `bend={${bend}} is a near-semicircle: the head overshoots and the arc reads as a loop.`, "Corners 0.2–0.4, sides 0.1–0.3 (arrows.md › Bend)");
            }
          }
          const lfs = attr(raw, "labelFontSize") ?? attr(raw, "arrowLabelFontSize");
          if (typeof lfs === "number" && lfs < 16 && (has(raw, "label") || has(raw, "arrowLabel"))) add(f, line, "warn", "size/arrow-label", `labelFontSize ${lfs}: handwriting under 16px is hard to read.`, "18–24 for buttons, 26–34 for hero targets (sizing.md)");
        }
        break;
      case "Sticky": {
        stickies++;
        const note = attr(raw, "note");
        if (typeof note === "string" && words(note) > 12) add(f, line, "warn", "target/too-long", `Sticky note has ${words(note)} words.`, "≤ 12 words");
        break;
      }
      case "Handwriting":
        if (nWords > 6 || kids.text.length > 50) add(f, line, "error", "target/too-long", "Handwriting over 6 words / 50 chars is cut off by the component.", "Shorten it");
        break;
      case "Check":
        break;
    }
  }

  const f = rel(file);

  // Next.js App Router: Roughly.X is undefined inside a Server Component.
  const usesDot = marks.some((x) => !x.typeForm && /^<Roughly\./.test(x.raw));
  const inAppDir = /[\\/]app[\\/]/.test(file) && !/[\\/]pages[\\/]/.test(file);
  const hasUseClient = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/.test(text);
  if (usesDot && inAppDir && !hasUseClient) {
    if (file.endsWith(".mdx")) {
      add(f, 1, "error", "rsc/use-client", "MDX in the App Router renders as a Server Component; Roughly.* is undefined there.", "Wrap the marks in your own client component and use that in the MDX");
    } else {
      add(f, 1, "error", "rsc/use-client", 'Roughly.* used in an App Router file without "use client": it renders as undefined and the page crashes.', 'Add "use client"; as the first line, or move the annotated section into a client component');
    }
  }

  if (inks.size > 1) add(f, 0, "warn", "color/one-ink", `${inks.size} different ink colours on non-semantic marks: ${[...inks.keys()].join(", ")}.`, "One ink per page (color.md)");
  if (stickies > 1) add(f, 0, "warn", "budget/sticky", `${stickies} sticky notes in one file.`, "Max 1 per page");
  if (arrows > 2) add(f, 0, "warn", "budget/arrows", `${arrows} arrows in one file.`, "Max 2 per page, never 2 in one viewport");
  const counted = marks.filter((x) => x.kind !== "Check").length;
  if (counted > 6) add(f, 0, "warn", "budget/marks", `${counted} marks in one file.`, "1 per section, ≤ 3 above the fold — cut the weakest (composition.md)");
  return marks.length;
}

if (!targets.length) {
  console.error("usage: node check.mjs <files or dirs…>   |   node check.mjs --setup [root]");
  process.exit(2);
}
let files = [];
for (const t of targets) files = files.concat(walk(path.resolve(t), [".tsx", ".jsx", ".mdx"]));
let total = 0;
for (const file of files) total += lintFile(file) ?? 0;
report(`lint: ${files.length} files, ${total} marks`);

function report(title) {
  const errors = findings.filter((x) => x.level === "error").length;
  const warns = findings.length - errors;
  if (JSON_OUT) {
    console.log(JSON.stringify({ title, errors, warnings: warns, findings }, null, 2));
  } else {
    for (const x of findings) {
      console.log(`${x.file}${x.line ? `:${x.line}` : ""}  ${x.level === "error" ? "ERROR" : "warn "}  ${x.rule}  ${x.message}\n    → ${x.fix}`);
    }
    console.log(`\n${title} — ${errors} error${errors === 1 ? "" : "s"}, ${warns} warning${warns === 1 ? "" : "s"}`);
  }
  process.exit(errors ? 1 : 0);
}
