import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { GROTESK, INTER, MONO } from "./fonts";
import { BEAT, CHAPTERS, COUNTDOWN_END, COUNTDOWN_TICKS, FPS, INTRO_END, INTRO_START, OUTRO_START, SHOTS, type Clip, type Shot } from "./timeline";

import inspectCursor from "../public/clips/inspect.cursor.json";
import asciiCursor from "../public/clips/ascii.cursor.json";
import topoCursor from "../public/clips/topo.cursor.json";
import hatchCursor from "../public/clips/hatch.cursor.json";
import bookCursor from "../public/clips/book.cursor.json";
import chatCursor from "../public/clips/chat.cursor.json";
import aiInputCursor from "../public/clips/ai-input.cursor.json";
import aiSuggestCursor from "../public/clips/ai-suggest.cursor.json";
import aiMarkdownCursor from "../public/clips/ai-markdown.cursor.json";
import aiActionsCursor from "../public/clips/ai-actions.cursor.json";
import roughlyCursor from "../public/clips/roughly.cursor.json";

type CursorLog = { points: { t: number; x: number; y: number; d: number }[] };
const CURSORS: Record<string, CursorLog> = {
  inspect: inspectCursor,
  ascii: asciiCursor,
  topo: topoCursor,
  hatch: hatchCursor,
  book: bookCursor,
  chat: chatCursor,
  "ai-input": aiInputCursor,
  "ai-suggest": aiSuggestCursor,
  "ai-markdown": aiMarkdownCursor,
  "ai-actions": aiActionsCursor,
  roughly: roughlyCursor,
};

const W = 1920;
const H = 1080;
const GOLD = "#c9a84c";
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (t: number, a: number, b: number, e = ease) => e(clamp01((t - a) / (b - a)));
/** In over [a, a+fin], out over [b-fout, b]. */
const window01 = (t: number, a: number, b: number, fin = 0.25, fout = 0.25) => Math.min(ramp(t, a, a + fin, out), 1 - ramp(t, b - fout, b));

// ── Cursor, replayed from the recorder's log ─────────────────────────────

function cursorAt(log: CursorLog, t: number) {
  const p = log.points;
  if (t <= p[0].t) return p[0];
  for (let i = 1; i < p.length; i++) {
    if (p[i].t >= t) {
      const a = p[i - 1];
      const b = p[i];
      const k = (t - a.t) / Math.max(1e-6, b.t - a.t);
      return { t, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, d: a.d };
    }
  }
  return p[p.length - 1];
}

const Cursor: React.FC<{ x: number; y: number; pressed: number; size?: number }> = ({ x, y, pressed, size = 34 }) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 17 22"
    style={{
      position: "absolute",
      left: x - 2,
      top: y - 2,
      transform: `scale(${1 - 0.14 * pressed})`,
      transformOrigin: "2px 2px",
      filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))",
    }}
  >
    <path d="M1 1 L1 17 L5 13.2 L8 20 L11 18.7 L8.1 12 L13.5 12 Z" fill="#fff" stroke="#111" strokeWidth={1.1} strokeLinejoin="round" />
  </svg>
);

// ── Machined surfaces ────────────────────────────────────────────────────

const chip: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(28,28,30,0.92) 0%, rgba(17,17,18,0.92) 100%)",
  borderTop: "1px solid rgba(255,255,255,0.16)",
  borderLeft: "1px solid rgba(255,255,255,0.04)",
  borderRight: "1px solid rgba(255,255,255,0.04)",
  borderBottom: "1px solid rgba(0,0,0,0.7)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 48px -12px rgba(0,0,0,0.85), 0 8px 16px rgba(0,0,0,0.5)",
  backdropFilter: "blur(14px)",
};

const well: React.CSSProperties = {
  background: "#090909",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "inset 0 3px 10px rgba(0,0,0,0.9), inset 0 1px 2px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.06)",
  overflow: "hidden",
  position: "absolute",
};

const NewTag: React.FC = () => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 15,
      fontWeight: 500,
      letterSpacing: 2,
      color: "#0a0a0a",
      background: "linear-gradient(180deg, #f2f2f2, #cfcfcf)",
      borderRadius: 999,
      padding: "4px 11px 3px",
      boxShadow: "inset 0 1px 0 #fff, 0 2px 6px rgba(0,0,0,0.5)",
    }}
  >
    NEW
  </span>
);

const SmallChip: React.FC<{ text: string; opacity: number; right?: boolean }> = ({ text, opacity, right }) => (
  <div style={{ ...chip, position: "absolute", ...(right ? { right: 18 } : { left: 18 }), top: 18, borderRadius: 999, padding: "9px 18px", fontFamily: INTER, fontWeight: 600, fontSize: 22, letterSpacing: -0.4, color: "#fff", opacity }}>
    {text}
  </div>
);

// ── The label for each shot ──────────────────────────────────────────────

const Label: React.FC<{ shot: Shot; t: number }> = ({ shot, t }) => {
  const len = shot.end - shot.start;
  const delay = CHAPTERS.some((c) => c.at === shot.start) ? 1.3 : 0.18;
  const vis = window01(t, delay, len, 0.45, 0.22);
  if (vis <= 0 || shot.layout !== "single") return null;
  const group = shot.group ? SHOTS.filter((s) => s.group === shot.group) : [];
  const n = group.indexOf(shot) + 1;
  const index = SHOTS.indexOf(shot) + 1;

  const current = [...shot.lines].reverse().find((l) => t >= l.at) ?? shot.lines[0];
  const lineIn = shot.lines.length > 1 ? ramp(t, current.at, current.at + 0.3, out) : 1;
  const bottomCentre = shot.layout !== "single";

  return (
    <div
      style={{
        position: "absolute",
        ...(bottomCentre ? { left: "50%", bottom: 34, transform: `translateX(-50%) translateY(${(1 - vis) * 30}px)` } : { left: 72, bottom: 72, transform: `translateX(${(1 - vis) * -40}px)` }),
        ...chip,
        borderRadius: 26,
        padding: "20px 30px 22px 24px",
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity: vis,
        filter: `blur(${(1 - vis) * 6}px)`,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: 60, height: 60, borderRadius: 17, ...well, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 23, color: "#e5e5e5" }}>
        {String(index).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: INTER, fontWeight: 600, fontSize: 36, letterSpacing: -1.1, color: "#fff" }}>{shot.title}</span>
          <NewTag />
          {group.length > 1 && <span style={{ fontFamily: MONO, fontSize: 16, color: "#666" }}>{n}/{group.length}</span>}
        </div>
        <span style={{ fontFamily: INTER, fontSize: 21, color: "#a3a3a3", letterSpacing: -0.2, opacity: lineIn, transform: `translateY(${(1 - lineIn) * 8}px)`, display: "block" }}>
          {current.text}
        </span>
      </div>
    </div>
  );
};

// ── A recorded clip inside a box ─────────────────────────────────────────

const ClipView: React.FC<{ clip: Clip; t: number; bw: number; bh: number; push?: number; punch?: number; cursorSize?: number }> = ({ clip, t, bw, bh, push = 1, punch = 1, cursorSize = 34 }) => {
  const sw = clip.w ?? W;
  const sh = clip.h ?? H;
  const base = Math.max(bw / sw, bh / sh);
  const s = base * (clip.zoom ?? 1) * push * punch;
  const cx = clip.cx ?? sw / 2;
  const cy = clip.cy ?? sh / 2;
  const src = clip.srcStart + t * clip.rate;
  const log = clip.cursor === false ? undefined : CURSORS[clip.clip];
  const c = log ? cursorAt(log, src) : undefined;

  return (
    <AbsoluteFill style={{ width: bw, height: bh, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: sw, height: sh, transformOrigin: "0 0", transform: `translate(${bw / 2}px, ${bh / 2}px) scale(${s}) translate(${-cx}px, ${-cy}px)` }}>
        <OffthreadVideo src={staticFile(`clips/${clip.clip}.mp4`)} trimBefore={Math.round(clip.srcStart * FPS)} playbackRate={clip.rate} muted style={{ width: sw, height: sh }} />
      </div>
      {c && <Cursor x={(c.x - cx) * s + bw / 2} y={(c.y - cy) * s + bh / 2} pressed={c.d} size={cursorSize} />}
    </AbsoluteFill>
  );
};

// ── One shot, in its layout ──────────────────────────────────────────────

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const t = useCurrentFrame() / FPS;
  const len = shot.end - shot.start;
  const enter = ramp(t, 0, 0.18, out);
  const push = 1 + 0.03 * (t / len);
  const punch = 1 + 0.05 * (1 - ramp(t, 0, 0.35, out));

  let body: React.ReactNode;
  if (shot.layout === "single") {
    body = <ClipView clip={shot.clips[0]} t={t} bw={W} bh={H} push={push} punch={punch} />;
  } else if (shot.layout === "grid") {
    const bw = 820;
    const bh = 446;
    const gap = 30;
    const x0 = (W - 2 * bw - gap) / 2;
    const y0 = (H - 2 * bh - gap) / 2;
    body = shot.clips.map((clip, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const pop = ramp(t, 0.08 * i, 0.08 * i + 0.4, out);
      return (
        <div key={clip.clip} style={{ ...well, left: x0 + col * (bw + gap), top: y0 + row * (bh + gap), width: bw, height: bh, borderRadius: 26, opacity: pop, transform: `scale(${0.96 + 0.04 * pop})` }}>
          <ClipView clip={clip} t={t} bw={bw} bh={bh} cursorSize={26} />
          {clip.label && <SmallChip right text={clip.label} opacity={ramp(t, 0.3 + 0.08 * i, 0.7 + 0.08 * i, out)} />}
        </div>
      );
    });
  } else {
    const bw = 560;
    const bh = 900;
    const gap = 40;
    const x0 = (W - 3 * bw - 2 * gap) / 2;
    const y0 = 24;
    body = shot.clips.map((clip, i) => {
      const pop = ramp(t, 0.1 * i, 0.1 * i + 0.45, out);
      return (
        <div key={clip.clip} style={{ ...well, left: x0 + i * (bw + gap), top: y0, width: bw, height: bh, borderRadius: 30, opacity: pop, transform: `translateY(${(1 - pop) * 40}px)` }}>
          <ClipView clip={clip} t={t} bw={bw} bh={bh} />
          {clip.label && <SmallChip text={clip.label} opacity={ramp(t, 0.4 + 0.1 * i, 0.8 + 0.1 * i, out)} />}
        </div>
      );
    });
  }

  return (
    <AbsoluteFill style={{ background: "#050505", opacity: enter }}>
      <AbsoluteFill style={{ filter: `blur(${(1 - enter) * 10}px)` }}>{body}</AbsoluteFill>
      <Label shot={shot} t={t} />
    </AbsoluteFill>
  );
};

// ── Chapter card ─────────────────────────────────────────────────────────

const Chapter: React.FC<{ kicker: string; title: string; hold: number }> = ({ kicker, title, hold }) => {
  const t = useCurrentFrame() / FPS;
  const vis = window01(t, 0, hold, 0.2, 0.32);
  const dim = window01(t, 0, hold + 0.1, 0.05, 0.45);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#050505", opacity: 0.8 * dim }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 22, opacity: vis, filter: `blur(${(1 - vis) * 12}px)`, transform: `scale(${0.96 + 0.04 * vis + 0.02 * (t / hold)})` }}>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: GOLD, textTransform: "uppercase" }}>{kicker}</div>
        <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 148, letterSpacing: -6, color: "#fff", lineHeight: 1 }}>{title}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Words that land on the beat ──────────────────────────────────────────

const Words: React.FC<{ t: number; words: { text: string; at: number; color?: string }[]; size: number; until: number }> = ({ t, words, size, until }) => (
  <div style={{ display: "flex", gap: size * 0.26, alignItems: "baseline" }}>
    {words.map((w) => {
      const v = Math.min(ramp(t, w.at, w.at + 0.22, out), 1 - ramp(t, until - 0.3, until));
      return (
        <span key={w.text + w.at} style={{ fontFamily: INTER, fontWeight: 600, fontSize: size, letterSpacing: -size * 0.04, color: w.color ?? "#fff", opacity: v, filter: `blur(${(1 - v) * 10}px)`, transform: `translateY(${(1 - v) * 24}px)`, display: "inline-block" }}>
          {w.text}
        </span>
      );
    })}
  </div>
);

const Logo: React.FC<{ size: number; opacity: number; label?: boolean }> = ({ size, opacity, label = true }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.32, opacity }}>
    <Img src={staticFile("logo.png")} style={{ width: size, height: size }} />
    {label && <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: size * 0.62, letterSpacing: -size * 0.02, color: "#fff" }}>void/ui</span>}
  </div>
);

// ── Countdown: the real Number Ticker, rolling 5 → 0 ─────────────────────

const COUNTDOWN_CLIP: Clip = { clip: "countdown", srcStart: 2.02, rate: 1.06, zoom: 2.3, cx: 960, cy: 105, cursor: false };

const Countdown: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const vis = Math.min(ramp(t, 0, 0.3, out), 1 - ramp(t, COUNTDOWN_END - 0.3, COUNTDOWN_END));
  const kick = COUNTDOWN_TICKS.reduce((m, at) => (t >= at ? Math.max(m, Math.exp(-(t - at) / 0.12)) : m), 0);
  const zero = ramp(t, COUNTDOWN_TICKS[COUNTDOWN_TICKS.length - 1], COUNTDOWN_END, (k) => k);
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <AbsoluteFill style={{ opacity: vis, transform: `scale(${1 + 0.025 * kick + 0.08 * zero})` }}>
        <ClipView clip={COUNTDOWN_CLIP} t={t} bw={W} bh={H} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 110, opacity: vis * ramp(t, 0.15, 0.6, out) }}>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: GOLD, textTransform: "uppercase" }}>New in void/ui</div>
        <div style={{ fontFamily: INTER, fontSize: 22, color: "#666", marginTop: 14 }}>Number Ticker, counting you in</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.12 * zero}) 0%, transparent 55%)` }} />
    </AbsoluteFill>
  );
};

// ── Intro ────────────────────────────────────────────────────────────────

const Intro: React.FC = () => {
  const t = useCurrentFrame() / FPS; // 0 at INTRO_START
  const logo = Math.min(ramp(t, 0, 0.35, out), 1 - ramp(t, 0.65, 0.85));
  const glow = Math.exp(-t / 0.5);
  const len = INTRO_END - INTRO_START;
  return (
    <AbsoluteFill style={{ background: "#050505", alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.1 * glow}) 0%, transparent 45%)` }} />
      {logo > 0 && (
        <div style={{ transform: `scale(${0.9 + 0.1 * logo})`, filter: `blur(${(1 - logo) * 10}px)` }}>
          <Logo size={130} opacity={logo} />
        </div>
      )}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Words
          t={t}
          size={132}
          until={len + 0.05}
          words={[
            { text: "Fresh", at: 0.85 },
            { text: "out", at: 0.85 + BEAT / 2 },
            { text: "of", at: 1.1 + BEAT / 2 },
            { text: "the", at: 1.35 + BEAT / 2 },
            { text: "void.", at: 1.6 + BEAT / 2, color: GOLD },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Outro ────────────────────────────────────────────────────────────────

const MOSAIC = ["roughly", "ascii", "book", "topo", "chat", "inspect", "hatch", "ai-markdown", "scroll-water"];
const CMD = "npx shadcn@latest add https://www.voidui.in/r/roughly.json";

const Outro: React.FC = () => {
  const t = useCurrentFrame() / FPS; // 0 at OUTRO_START
  const mosaic = Math.min(ramp(t, 0, 0.6), 1 - ramp(t, 4.4, 5.2));
  const cmdIn = window01(t, 2.9, 4.7, 0.3, 0.3);
  const typed = Math.floor(CMD.length * ramp(t, 3.05, 4.05, (k) => k));
  const end = ramp(t, 4.75, 5.25, out);

  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <AbsoluteFill style={{ opacity: 0.2 * mosaic, transform: `scale(${1.08 - 0.05 * (t / 6)}) rotate(-4deg)` }}>
        <div style={{ position: "absolute", left: -120, top: -80, width: W + 240, height: H + 160, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gap: 18 }}>
          {MOSAIC.map((clip, i) => (
            <div key={clip} style={{ overflow: "hidden", borderRadius: 22, background: "#0a0a0a" }}>
              <OffthreadVideo src={staticFile(`clips/${clip}.mp4`)} trimBefore={30 + i * 9} playbackRate={1.5} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.55) 70%, rgba(5,5,5,0.3) 100%)" }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, transform: `translateY(${-70 * ramp(t, 2.8, 3.2, out)}px)` }}>
        <Words t={t} size={120} until={4.75} words={[{ text: "110+", at: 0, color: GOLD }, { text: "components.", at: BEAT }]} />
        <Words t={t} size={68} until={4.75} words={[{ text: "Copy.", at: 1.5 }, { text: "Paste.", at: 2.0 }, { text: "Ship.", at: 2.5 }]} />
      </AbsoluteFill>

      {cmdIn > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 250 }}>
          <div style={{ ...well, position: "relative", borderRadius: 22, padding: "24px 34px", fontFamily: MONO, fontSize: 29, color: "#e5e5e5", opacity: cmdIn, filter: `blur(${(1 - cmdIn) * 8}px)`, minWidth: 1120 }}>
            <span style={{ color: GOLD }}>$ </span>
            {CMD.slice(0, typed)}
            <span style={{ opacity: Math.floor(t * 4) % 2 ? 0 : 1, color: "#fff" }}>▍</span>
          </div>
        </AbsoluteFill>
      )}

      {end > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34, opacity: end, filter: `blur(${(1 - end) * 10}px)` }}>
          <Logo size={140} opacity={1} />
          <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 40, letterSpacing: -0.5, color: "#a3a3a3" }}>voidui.in</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ── The film ─────────────────────────────────────────────────────────────

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const markVis = t > INTRO_END && t < OUTRO_START ? window01(t, INTRO_END + 0.6, OUTRO_START, 0.5, 0.2) : 0;

  return (
    <AbsoluteFill style={{ background: "#050505", overflow: "hidden" }}>
      <Sequence durationInFrames={Math.round(COUNTDOWN_END * FPS)}>
        <Countdown />
      </Sequence>
      <Sequence from={Math.round(INTRO_START * FPS)} durationInFrames={Math.round((INTRO_END - INTRO_START) * FPS)}>
        <Intro />
      </Sequence>

      {SHOTS.map((shot) => (
        <Sequence key={shot.id} from={Math.round(shot.start * FPS)} durationInFrames={Math.round((shot.end - shot.start) * FPS)}>
          <ShotView shot={shot} />
        </Sequence>
      ))}

      {CHAPTERS.map((c) => (
        <Sequence key={c.at} from={Math.round(c.at * FPS)} durationInFrames={Math.round(1.5 * FPS)}>
          <Chapter kicker={c.kicker} title={c.title} hold={1.05} />
        </Sequence>
      ))}

      <Sequence from={Math.round(OUTRO_START * FPS)}>
        <Outro />
      </Sequence>

      {markVis > 0 && (
        <div style={{ position: "absolute", top: 54, right: 64, ...chip, borderRadius: 999, padding: "12px 22px 12px 14px", opacity: markVis * (SHOTS.some((s) => s.layout !== "single" && t >= s.start && t < s.end) ? 0 : 1) }}>
          <Logo size={34} opacity={1} />
        </div>
      )}

      {/* lens: vignette and grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>

      <Audio src={staticFile("score.wav")} />
    </AbsoluteFill>
  );
};
