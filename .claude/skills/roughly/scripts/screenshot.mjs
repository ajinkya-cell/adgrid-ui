#!/usr/bin/env node
/**
 * Full-page screenshots of a URL at real desktop and mobile widths, using the Chrome / Edge / Brave /
 * Chromium already on the machine. No npm dependencies (Node 22+ for the built-in WebSocket).
 *
 *   node screenshot.mjs <url> [--out dir] [--name shot] [--widths 1440,390] [--wait 2500] [--animated]
 *                             [--selector "#pricing"] [--click "#tab-annual"] [--segments] [--max-height 8000]
 *
 * Writes <out>/<name>-<width>.png and prints the paths. READ every image it prints: annotations are not
 * done until they have been looked at.
 *
 * - Widths are true CSS viewport widths (390 really is 390; mobile widths get touch/mobile emulation).
 *   Plain `chrome --headless --window-size` can't go below ~500px, so this drives the browser over the
 *   DevTools protocol instead.
 * - By default the page is told the visitor prefers reduced motion, so every Roughly mark renders in its
 *   final, fully drawn state. Pass --animated to watch the real animation (marks may be caught mid-draw).
 * - The whole page is scrolled through once before capture so scroll-triggered marks draw.
 * - --selector shows one element: scrolled to the centre of a normal viewport shot when it fits (most
 *   faithful), otherwise cropped from the full page with 160px around it for arrows and sticky notes.
 * - --segments writes one viewport-sized shot per screen (<name>-<width>-01.png, -02 …). Use it when marks
 *   you know exist are missing from the full-page shot: some pages relayout during full-page capture.
 * - --click clicks an element (a tab, toggle, accordion) before capture, for marks that only show after
 *   an interaction. Comma-separate several selectors to click them in order.
 * - If a mark is missing, run again with a longer --wait; first loads on a dev server compile slowly.
 */

import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const argv = process.argv.slice(2);
const BOOL = new Set(["--animated", "--segments"]);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const url = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--") && !BOOL.has(argv[i - 1])));
if (!url) {
  console.error('usage: node screenshot.mjs <url> [--out dir] [--name shot] [--widths 1440,390] [--wait 2500] [--animated] [--selector "#id"]');
  process.exit(2);
}
const out = path.resolve(flag("out", "roughly-shots"));
const name = flag("name", "shot");
const widths = flag("widths", "1440,390").split(",").map(Number);
const wait = Number(flag("wait", "2500"));
const maxHeight = Number(flag("max-height", "8000"));
const selector = flag("selector", null);
const animated = argv.includes("--animated");
const segments = argv.includes("--segments");
const clicks = (flag("click", "") || "").split(",").map((x) => x.trim()).filter(Boolean);

if (typeof WebSocket === "undefined") {
  console.error("This script needs Node 22+ (built-in WebSocket). Run `node --version` and upgrade.");
  process.exit(2);
}

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = {
    win32: [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
      `${process.env.LOCALAPPDATA}/BraveSoftware/Brave-Browser/Application/brave.exe`,
    ],
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    ],
  }[process.platform] ?? [];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  for (const bin of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "brave-browser"]) {
    try {
      const p = execFileSync("which", [bin], { encoding: "utf8" }).trim();
      if (p) return p;
    } catch {}
  }
  return null;
}

const browserPath = findBrowser();
if (!browserPath) {
  console.error("No Chrome, Chromium, Edge or Brave found. Set CHROME_PATH to one.");
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const debug = (msg) => {
  if (process.env.ROUGHLY_DEBUG) console.error(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
};
// Never hang an agent: hard stop after 2.5 minutes per width.
const watchdog = setTimeout(() => {
  console.error("screenshot failed: timed out. Is the URL reachable? Run with ROUGHLY_DEBUG=1 to see where it stops.");
  process.exit(1);
}, 150_000 * widths.length + 60_000);
watchdog.unref();

// Warm the route so a dev server has compiled it before the browser loads it.
try {
  await fetch(url, { signal: AbortSignal.timeout(120_000) });
} catch {}

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "roughly-shot-"));
const proc = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

let exitCode = 0;
try {
  // The browser writes its debugging port to DevToolsActivePort in the profile.
  const portFile = path.join(profile, "DevToolsActivePort");
  let port;
  for (let i = 0; i < 150 && !port; i++) {
    if (fs.existsSync(portFile)) port = fs.readFileSync(portFile, "utf8").split("\n")[0].trim();
    if (!port) await sleep(100);
  }
  if (!port) throw new Error("browser did not start (no DevToolsActivePort)");

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let nextId = 1;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(typeof ev.data === "string" ? ev.data : ev.data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const id = nextId++;
      debug(`→ ${method}`);
      const timer = setTimeout(() => {
        pending.delete(id);
        rej(new Error(`${method} timed out after 45s`));
      }, 45_000);
      pending.set(id, {
        res: (v) => (clearTimeout(timer), res(v)),
        rej: (e) => (clearTimeout(timer), rej(e)),
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
  const waitForLoad = () =>
    new Promise((res) => {
      const t = setTimeout(res, 60_000);
      listeners.push((m) => {
        if (m.method === "Page.loadEventFired") {
          clearTimeout(t);
          res();
        }
      });
    });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: animated ? "no-preference" : "reduce" }],
  });

  fs.mkdirSync(out, { recursive: true });
  for (const w of widths) {
    const mobile = w < 768;
    const viewportH = mobile ? 844 : 900;
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: viewportH, deviceScaleFactor: 1, mobile });
    await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
    const loaded = waitForLoad();
    await send("Page.navigate", { url });
    await loaded;
    await evaluate("document.fonts ? document.fonts.ready.then(() => true) : true");

    // Scroll through the page so IntersectionObserver-triggered marks draw, then back to the top.
    await evaluate(`(async () => {
      const h = Math.min(document.documentElement.scrollHeight, ${maxHeight});
      for (let y = 0; y < h; y += ${viewportH} / 2) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
      window.scrollTo(0, 0);
      return true;
    })()`);
    await sleep(wait);

    for (const sel of clicks) {
      const ok = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(sel)});
        if (!el) return false;
        el.scrollIntoView({ block: "center" });
        el.click();
        return true;
      })()`);
      if (!ok) throw new Error(`--click selector not found: ${sel}`);
      await sleep(Math.max(800, wait / 2));
    }

    // Capture strategy:
    //  - selector that fits in the viewport → scroll it to the centre and take a plain viewport shot
    //  - --segments → one plain viewport shot per screen of the page
    //  - otherwise → one full-page (beyond-viewport) shot
    // Plain viewport shots are the most faithful: some pages relayout/remount during a beyond-viewport capture.
    let mode = segments ? "segments" : "full";
    let clip;
    if (selector) {
      const rect = await evaluate(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
      })()`);
      if (!rect) throw new Error(`selector not found: ${selector}`);
      const pad = 160;
      if (rect.h <= viewportH - 40) {
        mode = "viewport";
        await evaluate(`(() => { window.scrollTo(0, Math.max(0, ${rect.y + rect.h / 2} - innerHeight / 2)); return true; })()`);
        await sleep(Math.min(1500, Math.max(700, wait / 2)));
      } else {
        mode = "clip";
        const x = Math.max(0, rect.x - pad);
        const y = Math.max(0, rect.y - pad);
        clip = { x, y, width: Math.min(w - x, rect.w + pad * 2), height: rect.h + pad * 2, scale: 1 };
      }
    } else if (mode === "full") {
      const fullH = await evaluate("Math.ceil(document.documentElement.scrollHeight)");
      clip = { x: 0, y: 0, width: w, height: Math.min(fullH, maxHeight), scale: 1 };
    }

    const overflow = await evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth");
    // Name the elements that stick out past the viewport (and aren't inside a scroll/clip container).
    const offenders =
      overflow > 0
        ? await evaluate(`(() => {
            const out = [];
            for (const el of document.querySelectorAll("body *")) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.right <= innerWidth + 1) continue;
              let p = el, clipped = false;
              while ((p = p.parentElement)) {
                if (getComputedStyle(p).overflowX !== "visible") { clipped = true; break; }
              }
              if (clipped) continue;
              const cls = String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || "").slice(0, 60);
              const text = (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 30);
              // Where it lives: nearest ancestor with an id, else the nearest section's heading
              const host = el.parentElement && el.parentElement.closest("[id]");
              const sec = el.closest("section, article, main > div");
              const hd = sec && sec.querySelector("h1, h2, h3");
              const where = host ? " in #" + host.id : hd ? ' in section "' + hd.textContent.trim().slice(0, 30) + '"' : "";
              out.push("    " + el.tagName.toLowerCase() + (cls ? "." + cls.split(" ").join(".") : "") + " (right edge " + Math.round(r.right) + "px)" + (text ? ' "' + text + '"' : "") + where);
              if (out.length >= 6) break;
            }
            return out.join(" ¶ ");
          })()`)
        : "";
    // Don't let an error page pass as a screenshot of the annotated page.
    const pageError = await evaluate(`(() => {
      const body = (document.body && document.body.innerText) || "";
      const hits = [/Unhandled Runtime Error/, /Application error: a (client|server)-side exception/, /Element type is invalid/, /Hydration failed/, /Internal Server Error/, /This page could not be found/];
      for (const re of hits) { const m = body.match(re); if (m) return m[0]; }
      if (document.querySelector("vite-error-overlay")) return "Vite error overlay";
      const portal = document.querySelector("nextjs-portal");
      const txt = portal && portal.shadowRoot ? portal.shadowRoot.textContent || "" : "";
      const m = txt.match(/(Runtime Error|Unhandled Runtime Error|Build Error|Console Error)[^\\n]{0,120}/);
      return m ? "Next.js overlay: " + m[0].replace(/\\s+/g, " ").slice(0, 140) : "";
    })()`);
    if (pageError) console.log(`  ✖ ${w}px: the page shows an error (${pageError}). Fix it before judging annotations.`);

    if (mode === "viewport") {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      const file = path.join(out, `${name}-${w}.png`);
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      console.log(file);
    } else if (mode === "segments") {
      const fullH = Math.min(await evaluate("Math.ceil(document.documentElement.scrollHeight)"), maxHeight);
      const n = Math.max(1, Math.ceil(fullH / viewportH));
      for (let i = 0; i < n; i++) {
        await evaluate(`(() => { window.scrollTo(0, ${i * viewportH}); return true; })()`);
        await sleep(700);
        const shot = await send("Page.captureScreenshot", { format: "png" });
        const file = path.join(out, `${name}-${w}-${String(i + 1).padStart(2, "0")}.png`);
        fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
        console.log(file);
      }
    } else {
      // A beyond-viewport capture relayouts the page; take a throwaway one first, let it settle, then the real one.
      await send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: true });
      await sleep(Math.min(1500, Math.max(600, wait / 2)));
      const shot = await send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: true });
      const file = path.join(out, `${name}-${w}.png`);
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      console.log(file);
    }
    if (overflow > 0) {
      console.log(`  ⚠ ${w}px: page is ${overflow}px wider than the viewport (horizontal overflow). Sticking out:`);
      if (typeof offenders === "string" && offenders) console.log(offenders.split(" ¶ ").join("\n"));
      console.log("    (svg paths / absolute spans are usually an arrow, sticky or circle: change placement or reserve space; composition.md › Mobile)");
    }
  }
  ws.close();
} catch (err) {
  console.error(`screenshot failed: ${err.message}`);
  exitCode = 1;
} finally {
  proc.kill();
  await sleep(300);
  try {
    fs.rmSync(profile, { recursive: true, force: true });
  } catch {}
}
process.exit(exitCode);
