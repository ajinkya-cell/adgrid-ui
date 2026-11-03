/**
 * Packs the agent skills in <repo>/.claude/skills/<name>/ into downloadable zips:
 *   public/skills/<name>.zip   (one top-level folder <name>/, ready to unzip into ~/.claude/skills/)
 *
 * No dependencies: a minimal ZIP writer on top of node:zlib (deflate + crc32).
 * Run from apps/docs: `npx tsx scripts/build-skill-zip.ts` (also part of `pnpm build:registry`).
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const SKILLS = ["roughly"];

const REPO = path.resolve(__dirname, "../../..");
const OUT_DIR = path.resolve(__dirname, "../public/skills");

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  const native = (zlib as unknown as { crc32?: (b: Buffer) => number }).crc32;
  if (native) return native(buf) >>> 0;
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function listFiles(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (name === "node_modules" || name === ".DS_Store") continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) out.push(...listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

function dosDateTime(d: Date) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

function zip(entries: Array<{ name: string; data: Buffer; mtime: Date }>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    const deflated = zlib.deflateRawSync(e.data, { level: 9 });
    const useDeflate = deflated.length < e.data.length;
    const body = useDeflate ? deflated : e.data;
    const crc = crc32(e.data);
    const { time, date } = dosDateTime(e.mtime);
    const method = useDeflate ? 8 : 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(e.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4); // made by: unix, v2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(e.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    const executable = e.name.endsWith(".mjs") ? 0o755 : 0o644;
    central.writeUInt32LE(((0o100000 | executable) << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);

    offset += local.length + name.length + body.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuf, end]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const skill of SKILLS) {
  const dir = path.join(REPO, ".claude/skills", skill);
  if (!fs.existsSync(path.join(dir, "SKILL.md"))) {
    console.warn(`  ⚠ skill "${skill}" not found at ${dir}`);
    continue;
  }
  const files = listFiles(dir);
  const entries = files.map((f) => {
    const full = path.join(dir, f);
    let data = fs.readFileSync(full);
    // Normalise line endings so the zip is identical on every OS.
    if (/\.(md|mjs|ts|tsx|css|json)$/.test(f)) data = Buffer.from(data.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
    return { name: `${skill}/${f}`, data, mtime: fs.statSync(full).mtime };
  });
  const out = path.join(OUT_DIR, `${skill}.zip`);
  fs.writeFileSync(out, zip(entries));
  console.log(`  skill ${skill}: ${files.length} files → public/skills/${skill}.zip (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);

  // The same skill as a shadcn registry item, so `npx|pnpm dlx|yarn dlx|bunx shadcn add <url>` installs it
  // into the project's .claude/skills/<skill>/ (target "~" = project root).
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `${skill}-skill`,
    type: "registry:item",
    title: `${skill} agent skill`,
    description: `Agent skill: teaches Claude Code and other coding agents to annotate pages with Roughly. Installs into .claude/skills/${skill}/.`,
    files: entries.map((e) => ({
      path: `skills/${e.name}`,
      type: "registry:file",
      target: `~/.claude/skills/${e.name}`,
      content: e.data.toString("utf8"),
    })),
  };
  const itemOut = path.resolve(__dirname, `../public/r/${skill}-skill.json`);
  fs.writeFileSync(itemOut, JSON.stringify(item, null, 2) + "\n");
  console.log(`  skill ${skill}: registry item → public/r/${skill}-skill.json`);
}
