"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";

// Where the string ties onto the moon image, as a fraction of the image box (top of the moon).
const ATTACH = { x: 0.45, y: 0.28 };

// Yarn strands, drawn back to front: [stroke, width, dasharray, opacity]
const STRANDS: [string, number, string | undefined, number][] = [
  ["#b9c9ee", 5, "0.6 2.4", 0.55], // fuzz
  ["#a3b8e8", 3.4, undefined, 1], // body
  ["#8aa2db", 1.4, "6 3 2 4", 0.9], // twist shadow
  ["#e1e9f9", 1.1, "2 5 1 7 3 4", 0.9], // highlight fibres
];

// Fades the "pull me" hint in after 2.8s and leaves it there, until the first pull or while open.
const STYLES = `
@keyframes vui-moon-hint { to { opacity: 0.85; } }
.vui-moon-hint { animation: vui-moon-hint 1.2s ease 2.8s forwards; }
.vui-moon.has-pulled .vui-moon-hint, .vui-moon[data-open="true"] .vui-moon-hint { animation: none; }
`;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return "242 192 74";
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export type MoonPullProps = {
  // Whether the thing the moon opens is open; only changes the label and stops the hint.
  open: boolean;
  // Fired once each time the moon is pulled past the threshold (or pressed with Enter / Space).
  onPull: () => void;
  // The moon image: a transparent PNG with the moon's top at ATTACH. Leave it out for the built-in
  // golden disc.
  src?: string;
  imageWidth?: number;
  imageHeight?: number;
  // Left edge and width of the moon box, as a percentage of the stage width.
  left?: number;
  width?: number;
  // Resting string length as a fraction of the stage height.
  restLength?: number;
  // How far (fraction of viewport height) the moon must be pulled down to fire `onPull`.
  threshold?: number;
  // Gentle idle sway (always off under reduced motion).
  sway?: boolean;
  // Colour of the glow that grows as the cord nears the click.
  glowColor?: string;
  // Accessible names for the two states.
  openLabel?: string;
  closedLabel?: string;
  // Small italic text that fades in beside the moon until it's first pulled. Empty hides it.
  hint?: string;
};

// A moon hanging on a strand of yarn from the top of its stage. Drag it down and the string
// stretches (resisting more the further it goes); past the threshold it "clicks", springs back and
// fires `onPull`. A tap gives it a little tug, and at rest it sways gently.
export function MoonPull({
  open,
  onPull,
  src,
  imageWidth = 265,
  imageHeight = 257,
  left = 5,
  width = 6,
  restLength = 0.13,
  threshold = 0.1,
  sway = true,
  glowColor = "#f2c04a",
  openLabel = "Pull the moon to close",
  closedLabel = "Pull the moon to open",
  hint = "pull me",
}: MoonPullProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLButtonElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const onPullRef = useRef(onPull);
  // Tunables are read through refs, so changing them never restarts the loop.
  const tuning = useRef({ restLength, threshold, sway });
  const remeasure = useRef<() => void>(() => {});
  // A unique filter id per moon, so two on one page don't share (or break) each other's filter.
  const uid = useId().replace(/[^\w-]/g, "");
  const filterId = `yarn-${uid}`;

  useEffect(() => {
    onPullRef.current = onPull;
  }, [onPull]);

  useEffect(() => {
    tuning.current = { restLength, threshold, sway };
    remeasure.current();
  }, [restLength, threshold, sway]);

  useEffect(() => {
    const root = rootRef.current;
    const moon = moonRef.current;
    if (!root || !moon) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let restLen = 0;
    let moonW = 0;
    let moonH = 0;
    const measure = () => {
      const stageH = root.parentElement?.clientHeight ?? window.innerHeight;
      restLen = stageH * tuning.current.restLength;
      moonW = moon.offsetWidth;
      moonH = moon.offsetHeight;
      moon.style.top = `${restLen - moonH * ATTACH.y}px`;
      root.style.setProperty("--rest", `${restLen}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root.parentElement ?? root);
    ro.observe(moon);

    // Moon offset from rest, its velocity, and drag state.
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let drag: { id: number; sx: number; sy: number; moved: number } | null = null;
    const dragTarget = { x: 0, y: 0 };
    let armed = false;
    let frame = 0;
    const t0 = performance.now();

    const draw = (t: number) => {
      const sway =
        reduced || drag || !tuning.current.sway ? 0 : Math.sin((t - t0) / 650) * Math.max(4, restLen * 0.05);

      if (drag) {
        pos.x += (dragTarget.x - pos.x) * 0.35;
        pos.y += (dragTarget.y - pos.y) * 0.35;
        vel.x = vel.y = 0;
      } else {
        const k = reduced ? 0.2 : 0.07;
        const damp = reduced ? 0.6 : 0.86;
        vel.x = (vel.x + (sway - pos.x) * k) * damp;
        vel.y = (vel.y + (0 - pos.y) * k) * damp;
        pos.x += vel.x;
        pos.y += vel.y;
      }

      const ax = moonW * ATTACH.x;
      const ex = ax + pos.x;
      const ey = restLen + pos.y;
      // Control point lags behind the moon so the string bends as it swings.
      const cx = ax + pos.x * 0.35 - vel.x * 3;
      const cy = ey * 0.55;
      const len = Math.hypot(ex - ax, ey);
      const thin = Math.min(1, Math.max(0.55, restLen / Math.max(len, 1)));
      const d = `M ${ax} -2 Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)} q 3 4 -1 6 q -4 1 -3 -3`;
      pathRefs.current.forEach((p, i) => {
        if (!p) return;
        p.setAttribute("d", d);
        p.style.strokeWidth = String(STRANDS[i][1] * thin);
      });

      const rot = Math.max(-14, Math.min(14, -pos.x * 0.35 + vel.x * 0.8));
      moon.style.transform = `translate(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;

      const tension = Math.max(0, Math.min(1, pos.y / (window.innerHeight * tuning.current.threshold)));
      root.style.setProperty("--tension", tension.toFixed(3));
      const nowArmed = !!drag && tension >= 1;
      if (nowArmed !== armed) {
        armed = nowArmed;
        root.classList.toggle("is-armed", armed);
      }
      if (armed && drag) {
        // The cord "clicks" the moment it is pulled far enough: let go and fire.
        release();
        vel.y = -14;
        onPullRef.current();
      }

      const still =
        !drag &&
        sway === 0 &&
        Math.abs(pos.x) + Math.abs(pos.y) + Math.abs(vel.x) + Math.abs(vel.y) < 0.02;
      frame = still ? 0 : requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const release = () => {
      if (drag && moon.hasPointerCapture(drag.id)) moon.releasePointerCapture(drag.id);
      drag = null;
      armed = false;
      root.classList.remove("is-dragging", "is-armed");
    };
    remeasure.current = () => {
      measure();
      kick();
    };
    kick();

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      moon.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: 0 };
      dragTarget.x = dragTarget.y = 0;
      root.classList.add("is-dragging", "has-pulled");
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.sx;
      const dy = e.clientY - drag.sy;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      // Rubber-band: the string resists more the further it stretches.
      const max = window.innerHeight * 0.45;
      const down = Math.max(0, dy * 0.75);
      dragTarget.y = dy < 0 ? dy * 0.15 : max * (1 - Math.exp(-down / max));
      dragTarget.x = Math.max(-40, Math.min(40, dx * 0.25));
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const tapped = drag.moved < 5;
      release();
      if (tapped) {
        vel.y = 16; // a little tug to hint it can be pulled
      }
      kick();
    };

    moon.addEventListener("pointerdown", onDown);
    moon.addEventListener("pointermove", onMove);
    moon.addEventListener("pointerup", onUp);
    moon.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      remeasure.current = () => {};
      moon.removeEventListener("pointerdown", onDown);
      moon.removeEventListener("pointermove", onMove);
      moon.removeEventListener("pointerup", onUp);
      moon.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      // Drag state (is-dragging / is-armed / has-pulled) is toggled on this class list from the
      // animation loop, so `open` lives in a data attribute where React can't overwrite them.
      className="vui-moon group/moon [--tension:0]"
      data-open={open}
      // Geometry is inline so a stale stylesheet can never leave a giant, detached moon.
      style={
        {
          position: "absolute",
          top: 0,
          left: `${left}%`,
          width: `${width}%`,
          height: "100%",
          "--moon-glow": hexToRgb(glowColor),
        } as CSSProperties
      }
    >
      <style>{STYLES}</style>
      <svg
        className="pointer-events-none absolute inset-0 z-2 size-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            x="-300"
            y="-50"
            width="600"
            height="3000"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="2.6" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {STRANDS.map(([stroke, width, dash, opacity], i) => (
            <path
              key={i}
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              stroke={stroke}
              strokeWidth={width}
              strokeDasharray={dash}
              opacity={opacity}
            />
          ))}
        </g>
      </svg>

      <button
        ref={moonRef}
        type="button"
        className="pointer-events-auto cursor-grab touch-none rounded-full border-0 bg-transparent p-0 transition-[filter] duration-300 will-change-transform [filter:drop-shadow(0_0_calc(var(--tension)*16px)_rgb(var(--moon-glow)/calc(var(--tension)*0.75)))] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#a3b8e8] focus-visible:outline-dashed group-[.is-armed]/moon:[filter:drop-shadow(0_0_18px_rgb(var(--moon-glow)/0.95))_brightness(1.08)] group-[.is-dragging]/moon:cursor-grabbing"
        aria-label={open ? openLabel : closedLabel}
        style={{
          position: "absolute",
          left: 0,
          width: "100%",
          transformOrigin: `${ATTACH.x * 100}% ${ATTACH.y * 100}%`,
        }}
        onClick={(e) => {
          // Pointer pulls are handled above; this is the keyboard path (Enter / Space).
          if (e.detail === 0) onPull();
        }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            width={imageWidth}
            height={imageHeight}
            loading="eager"
            draggable={false}
            className="block h-auto w-full select-none"
          />
        ) : (
          <MoonArt id={`moon-${uid}`} />
        )}
      </button>

      {hint && (
        <span
          className="vui-moon-hint pointer-events-none absolute top-[calc(var(--rest,0px)_+_0.2vw)] left-[70%] text-[clamp(9px,0.7vw,12px)] tracking-[0.08em] whitespace-nowrap text-[#8aa2db] italic opacity-0 transition-opacity duration-400"
          aria-hidden="true"
        >
          {hint}
        </span>
      )}
    </div>
  );
}

// The default moon: a plain golden disc on the same 265×257 box as the original art, with its top
// exactly at ATTACH (119, 72) so the string ties on there.
const DISC = { cx: 119, cy: 157, r: 85 };

function MoonArt({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 265 257"
      aria-hidden="true"
      className="block h-auto w-full select-none"
      style={{ aspectRatio: "265 / 257", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8d877" />
          <stop offset="0.55" stopColor="#f2c04a" />
          <stop offset="1" stopColor="#e3a136" />
        </linearGradient>
      </defs>
      <circle {...DISC} fill={`url(#${id}-fill)`} />
    </svg>
  );
}

export default MoonPull;
