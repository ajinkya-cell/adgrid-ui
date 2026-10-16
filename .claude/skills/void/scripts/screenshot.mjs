#!/usr/bin/env node
/**
 * Screenshots a page at desktop and mobile widths with the Chrome or Edge already on the machine.
 * No dependencies.
 *
 *   node screenshot.mjs <url> [--out dir] [--name before] [--widths 1440,390] [--height 900] [--wait 6000]
 *
 * Writes <out>/<name>-<width>.png and prints the paths. Read every one of them: a revamp isn't
 * done until it has been looked at. Set CHROME_PATH if no browser is found.
 *
 * Notes from use:
 * - The first hit on a dev server can come back blank while the route compiles. The script fetches
 *   the URL once first; if a shot is still blank, run it again.
 * - Mount animations may be caught midway. Raise --wait, or judge the resting state from a second shot.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const argv = process.argv.slice(2);
const url = argv.find((a) => !a.startsWith("--") && !isFlagValue(a));
function isFlagValue(a) {
  const i = argv.indexOf(a);
  return i > 0 && argv[i - 1].startsWith("--") && !["--full"].includes(argv[i - 1]);
}
function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

if (!url) {
  console.error("usage: node screenshot.mjs <url> [--out dir] [--name shot] [--widths 1440,390] [--height 900] [--wait 6000]");
  process.exit(2);
}

const out = path.resolve(flag("out", "revamp/screenshots"));
const name = flag("name", "shot");
const widths = flag("widths", "1440,390").split(",").map(Number);
const height = Number(flag("height", "900"));
const wait = Number(flag("wait", "6000"));

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = {
    win32: [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
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

const browser = findBrowser();
if (!browser) {
  console.error("No Chrome, Chromium, Edge or Brave found. Set CHROME_PATH to one.");
  process.exit(2);
}

// Warm the route so a dev server has compiled it before the browser loads it.
try {
  await fetch(url, { signal: AbortSignal.timeout(120_000) });
} catch {}

fs.mkdirSync(out, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "void-shot-"));
for (const w of widths) {
  const file = path.join(out, `${name}-${w}.png`);
  try {
    execFileSync(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${profile}`,
        "--force-device-scale-factor=1",
        `--window-size=${w},${height}`,
        `--virtual-time-budget=${wait}`,
        `--screenshot=${file}`,
        url,
      ],
      { stdio: "ignore", timeout: wait + 90_000 }
    );
  } catch {}
  console.log(fs.existsSync(file) ? file : `FAILED ${w}px — no file written`);
}
fs.rmSync(profile, { recursive: true, force: true });
