"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

// A pixel-art cat knight for the gallery page, drawn entirely in code (no images).
// It wanders along the top edge of the card it sits on, turns to face the cursor, idles
// (bob, blink, the odd sword trick), and attacks when clicked:
//   1 click -> slash · 2 quick clicks -> double slash · 3+ -> jump-spin attack.
// Every pose is a whole-pixel transform (90° sword turns, 1px bobs), so it stays crisp.

type Key = "o" | "b" | "w" | "p" | "e" | "g" | "s" | "h" | "f";
type Cell = { x: number; y: number; k: Key };

// Palette. Black-and-white tuxedo cat, steel sword, one warm yellow accent.
const COLORS: Record<Key, string> = {
  o: "#141414", // outline
  b: "#3a3a40", // fur
  w: "#f3efe4", // muzzle and chest
  p: "#e9a3ad", // inner ears and nose
  e: "#f5d36b", // eyes
  g: "#f2c14e", // sword guard, sparkle core
  s: "#cfd4dc", // blade
  h: "#ffffff", // blade shine
  f: "#ffffff", // effects
};

// The cat, 18×17, facing right. o outline · b fur · w white · p pink · e eye · k pupil.
const CAT_ROWS = [
  "...o.........o....",
  "...oo.......oo....",
  "...opo.....opo....",
  "...obbooooobbo....",
  "...obbbbbbbbbo....",
  "...obekbbbekbo....",
  "...obekbbbekbo....",
  "...obbbwpwbbbo....",
  "...obbwwwwwbbo....",
  "o..obbbwwwbbbooo..",
  "o..obbwwwwwbbbbo..",
  "oo.obbwwwwwbbooo..",
  ".oobbbbwwwbbbo....",
  "...obbbbbbbbbo....",
  "...obbooooobbo....",
  "...obbo...obbo....",
  "...oooo...oooo....",
];
const BLINK_ROWS: Record<number, string> = {
  5: "...obbbbbbbbbo....",
  6: "...oboobbboobo....",
};

const W = 32; // sprite box, in pixels
const H = 30;
const CAT_X = 2;
const CAT_Y = 9;
const PAW = { x: CAT_X + 14, y: CAT_Y + 10 }; // the cell the sword is held at
const PIVOT = { x: PAW.x + 0.5, y: PAW.y + 0.5 };
const SPIN_CENTER = { x: 16, y: 19 };

function parseRows(rows: string[], ox: number, oy: number): Cell[] {
  const cells: Cell[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      const k: Key = ch === "k" ? "o" : (ch as Key);
      cells.push({ x: ox + x, y: oy + y, k });
    });
  });
  return cells;
}

/** Adds a 1px outline around a shape, the way pixel art is inked. */
function outlined(cells: Cell[]): Cell[] {
  const filled = new Set(cells.map((c) => `${c.x},${c.y}`));
  const out: Cell[] = [];
  for (const c of cells) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${c.x + dx},${c.y + dy}`;
      if (!filled.has(key)) {
        filled.add(key);
        out.push({ x: c.x + dx, y: c.y + dy, k: "o" });
      }
    }
  }
  return [...out, ...cells];
}

const shift = (cells: Cell[], dx: number, dy: number) => cells.map((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));

// The sword, drawn around the grip at (0,0) pointing up-right; then moved onto the paw.
const SWORD: Cell[] = (() => {
  const local: Cell[] = [
    { x: 0, y: 0, k: "o" }, // grip (under the paw)
    { x: -1, y: 1, k: "g" }, // pommel
    { x: 1, y: -1, k: "g" }, // guard
    { x: 0, y: -2, k: "g" },
    { x: 2, y: 0, k: "g" },
  ];
  for (let t = 0; t <= 7; t++) local.push({ x: 2 + t, y: -2 - t, k: "s" });
  for (let t = 0; t <= 6; t++) local.push({ x: 3 + t, y: -2 - t, k: "h" });
  local.push({ x: 10, y: -10, k: "s" });
  return shift(outlined(local), PAW.x, PAW.y);
})();

// A sparkle that rides on the sword tip (it's inside the sword group, so it turns with it).
const SPARKLE: Cell[] = shift(
  [
    { x: 0, y: 0, k: "g" },
    { x: 1, y: 0, k: "f" },
    { x: -1, y: 0, k: "f" },
    { x: 0, y: 1, k: "f" },
    { x: 0, y: -1, k: "f" },
    { x: 2, y: 0, k: "f" },
    { x: -2, y: 0, k: "f" },
    { x: 0, y: 2, k: "f" },
    { x: 0, y: -2, k: "f" },
  ],
  PAW.x + 12,
  PAW.y - 12,
);

// The slash trail: a pixel arc from overhead round to the front.
const ARC: Cell[] = (() => {
  const seen = new Set<string>();
  const cells: Cell[] = [];
  for (let a = -135; a <= 40; a += 3) {
    const rad = (a * Math.PI) / 180;
    for (const [r, k] of [[12, "f"], [11, "s"]] as const) {
      const x = Math.floor(PIVOT.x + r * Math.cos(rad));
      const y = Math.floor(PIVOT.y + r * Math.sin(rad));
      const key = `${x},${y}`;
      if (!seen.has(key)) {
        seen.add(key);
        cells.push({ x, y, k });
      }
    }
  }
  return cells;
})();

const BANG: Cell[] = outlined([
  ...[0, 1, 2, 3].map((i) => ({ x: CAT_X + 15, y: CAT_Y - 8 + i, k: "g" as Key })),
  { x: CAT_X + 15, y: CAT_Y - 3, k: "g" },
]);

const DUST: Cell[] = [
  { x: CAT_X + 1, y: CAT_Y + 16, k: "s" },
  { x: CAT_X, y: CAT_Y + 15, k: "s" },
  { x: CAT_X - 1, y: CAT_Y + 16, k: "s" },
  { x: CAT_X + 15, y: CAT_Y + 16, k: "s" },
  { x: CAT_X + 16, y: CAT_Y + 15, k: "s" },
  { x: CAT_X + 17, y: CAT_Y + 16, k: "s" },
];

/** One <path> per colour: far fewer nodes than a <rect> per pixel. */
function Pixels({ cells }: { cells: Cell[] }) {
  const paths = useMemo(() => {
    const byKey = new Map<Key, string>();
    for (const c of cells) byKey.set(c.k, (byKey.get(c.k) ?? "") + `M${c.x} ${c.y}h1v1h-1z`);
    return [...byKey.entries()];
  }, [cells]);
  return (
    <>
      {paths.map(([k, d]) => (
        <path key={k} d={d} fill={COLORS[k]} />
      ))}
    </>
  );
}

type Pose = 0 | -90 | 90; // rest (up-right) · raised (up-left) · swung (down-right)
type Fx = { slash: boolean; sparkle: boolean; bang: boolean; dust: boolean };
const NO_FX: Fx = { slash: false, sparkle: false, bang: false, dust: false };

const between = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export interface PixelKnightProps {
  /** Screen px per sprite pixel. */
  scale?: number;
  className?: string;
  style?: CSSProperties;
}

export function PixelKnight({ scale = 4, className, style }: PixelKnightProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);

  const [pose, setPose] = useState<Pose>(0);
  const [blink, setBlink] = useState(false);
  const [sleepy, setSleepy] = useState(false);
  const [bob, setBob] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [x, setX] = useState(0);
  const [walkMs, setWalkMs] = useState(0);
  const [walking, setWalking] = useState(false);
  const [lift, setLift] = useState(0);
  const [liftMs, setLiftMs] = useState(0);
  const [spin, setSpin] = useState(0);
  const [fx, setFx] = useState<Fx>(NO_FX);
  const [ready, setReady] = useState(false);

  const busyRef = useRef(false);
  const walkingRef = useRef(false);
  const tokenRef = useRef(0);
  const comboRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const reducedRef = useRef(false);

  const spriteW = W * scale;
  const spriteH = H * scale;

  const wait = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        timersRef.current.push(window.setTimeout(resolve, ms));
      }),
    [],
  );

  // Stop mid-walk exactly where it is.
  const freeze = useCallback(() => {
    const mover = moverRef.current;
    if (!walkingRef.current || !mover) return;
    const m = new DOMMatrixReadOnly(getComputedStyle(mover).transform);
    setWalkMs(0);
    setX(m.m41);
    walkingRef.current = false;
    setWalking(false);
  }, []);

  const shake = useCallback(() => {
    if (reducedRef.current) return;
    shakeRef.current?.animate(
      [
        { transform: "translate(0, 0)" },
        { transform: `translate(${-scale}px, ${scale}px)` },
        { transform: `translate(${scale}px, 0)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: 180, easing: "steps(4, end)" },
    );
  }, [scale]);

  const resetPose = useCallback(() => {
    setPose(0);
    setSpin(0);
    setLift(0);
    setSleepy(false);
    setFx(NO_FX);
  }, []);

  // Runs one move. A new move cancels the old one at its next step.
  const perform = useCallback(
    async (move: (alive: () => boolean) => Promise<void>) => {
      const token = ++tokenRef.current;
      const alive = () => token === tokenRef.current;
      busyRef.current = true;
      freeze();
      try {
        await move(alive);
      } finally {
        if (alive()) {
          resetPose();
          busyRef.current = false;
        }
      }
    },
    [freeze, resetPose],
  );

  const slashSteps = useCallback(
    async (alive: () => boolean) => {
      setPose(-90);
      await wait(110);
      if (!alive()) return;
      setPose(90);
      setFx((f) => ({ ...f, slash: true }));
      shake();
      await wait(150);
      if (!alive()) return;
      setFx((f) => ({ ...f, slash: false }));
      await wait(170);
    },
    [shake, wait],
  );

  const jumpAttack = useCallback(
    async (alive: () => boolean) => {
      setBob(1); // crouch
      await wait(120);
      if (!alive()) return;
      setPose(-90);
      setLiftMs(220);
      setLift(-8 * scale);
      await wait(220);
      for (let i = 1; i <= 4 && alive(); i++) {
        setSpin(i * 90);
        await wait(70);
      }
      if (!alive()) return;
      setSpin(0);
      setLiftMs(160);
      setLift(0);
      await wait(160);
      if (!alive()) return;
      setPose(90);
      setFx({ slash: true, sparkle: false, bang: false, dust: true });
      shake();
      await wait(170);
      if (!alive()) return;
      setFx({ slash: false, sparkle: true, bang: true, dust: false });
      await wait(650);
    },
    [scale, shake, wait],
  );

  const attack = useCallback(() => {
    comboRef.current += 1;
    if (busyRef.current) return; // extra clicks during a slash upgrade the combo
    comboRef.current = 1;
    void perform(async (alive) => {
      await slashSteps(alive);
      if (!alive()) return;
      if (comboRef.current >= 3) {
        await jumpAttack(alive);
      } else if (comboRef.current === 2) {
        setPose(0);
        await slashSteps(alive);
      }
      comboRef.current = 0;
    });
  }, [jumpAttack, perform, slashSteps]);

  // Idle tricks.
  const victory = useCallback(
    (alive: () => boolean) =>
      (async () => {
        setPose(-90);
        setLiftMs(150);
        setLift(-3 * scale);
        await wait(150);
        if (!alive()) return;
        setLiftMs(150);
        setLift(0);
        setFx((f) => ({ ...f, sparkle: true }));
        await wait(1000);
      })(),
    [scale, wait],
  );

  const rest = useCallback(
    (alive: () => boolean) =>
      (async () => {
        setPose(90); // sword planted in the ground
        await wait(250);
        if (!alive()) return;
        setSleepy(true);
        await wait(1800);
      })(),
    [wait],
  );

  // Position on mount and on resize: start near the right end of the track.
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const track = trackRef.current;
    if (!track) return;
    const place = () => {
      const max = Math.max(0, track.clientWidth - spriteW);
      setWalkMs(0);
      setX((prev) => (ready ? Math.min(prev, max) : max * 0.82));
      setReady(true);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(track);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spriteW]);

  // Bob: slow while standing, quick little hops while walking.
  useEffect(() => {
    if (reducedRef.current) return;
    const id = window.setInterval(() => {
      if (busyRef.current) return;
      setBob((b) => (b ? 0 : 1));
    }, walking ? 150 : 520);
    return () => window.clearInterval(id);
  }, [walking]);

  // Blink.
  useEffect(() => {
    let t = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 120);
        loop();
      }, between(2400, 5200));
    };
    loop();
    return () => window.clearTimeout(t);
  }, []);

  // Wander along the edge, and now and then show off a trick.
  useEffect(() => {
    if (reducedRef.current) return;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        const track = trackRef.current;
        if (track && !busyRef.current && !walkingRef.current && !document.hidden) {
          if (Math.random() < 0.3) {
            void perform((alive) => pick([victory, rest, slashSteps])(alive));
          } else {
            const max = Math.max(0, track.clientWidth - spriteW);
            const mover = moverRef.current;
            const from = mover ? new DOMMatrixReadOnly(getComputedStyle(mover).transform).m41 : 0;
            const to = between(0, max);
            if (Math.abs(to - from) > 60) {
              const ms = (Math.abs(to - from) / (10 * scale)) * 1000; // 10 sprite px per second
              setFacing(to > from ? 1 : -1);
              setWalkMs(ms);
              setX(to);
              walkingRef.current = true;
              setWalking(true);
              timersRef.current.push(
                window.setTimeout(() => {
                  walkingRef.current = false;
                  setWalking(false);
                }, ms),
              );
            }
          }
        }
        loop();
      }, between(3500, 7000));
    };
    loop();
    return () => window.clearTimeout(t);
  }, [perform, rest, scale, slashSteps, spriteW, victory]);

  // Face the cursor when standing.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      if (walkingRef.current || busyRef.current) return;
      const box = moverRef.current?.getBoundingClientRect();
      if (!box) return;
      const cx = box.left + box.width / 2;
      if (Math.abs(e.clientX - cx) > 24) setFacing(e.clientX < cx ? -1 : 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(
    () => () => {
      tokenRef.current++;
      timersRef.current.forEach(window.clearTimeout);
    },
    [],
  );

  const closed = blink || sleepy;
  const cat = useMemo(
    () => parseRows(closed ? CAT_ROWS.map((r, i) => BLINK_ROWS[i] ?? r) : CAT_ROWS, CAT_X, CAT_Y),
    [closed],
  );

  // A thin light rim so the dark cat still reads on the near-black page.
  const rim = "rgba(255,255,255,0.22)";
  const r = `${scale}px`;
  const rimFilter = `drop-shadow(${r} 0 0 ${rim}) drop-shadow(-${r} 0 0 ${rim}) drop-shadow(0 ${r} 0 ${rim}) drop-shadow(0 -${r} 0 ${rim})`;

  return (
    <div
      ref={trackRef}
      aria-hidden={false}
      className={className}
      style={{ position: "relative", width: "100%", height: spriteH, pointerEvents: "none", ...style }}
    >
      <div
        ref={moverRef}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: spriteW,
          height: spriteH,
          transform: `translateX(${x}px)`,
          transition: `transform ${walkMs}ms linear`,
          opacity: ready ? 1 : 0,
        }}
      >
        <div
          style={{
            transform: `translateY(${lift}px)`,
            transition: `transform ${liftMs}ms ${lift < 0 ? "cubic-bezier(.2,.8,.3,1)" : "cubic-bezier(.6,0,.9,.4)"}`,
          }}
        >
          <div ref={shakeRef}>
            <button
              type="button"
              onClick={attack}
              aria-label="Pixel cat knight: click to attack"
              style={{
                display: "block",
                width: spriteW,
                height: spriteH,
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: "pointer",
                pointerEvents: "auto",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <svg
                viewBox={`0 0 ${W} ${H}`}
                width={spriteW}
                height={spriteH}
                shapeRendering="crispEdges"
                style={{
                  display: "block",
                  overflow: "visible",
                  transform: facing < 0 ? "scaleX(-1)" : undefined,
                  filter: rimFilter,
                }}
              >
                <g transform={`translate(0 ${bob}) rotate(${spin} ${SPIN_CENTER.x} ${SPIN_CENTER.y})`}>
                  {fx.slash && (
                    <g opacity={0.85}>
                      <Pixels cells={ARC} />
                    </g>
                  )}
                  <g transform={`rotate(${pose} ${PIVOT.x} ${PIVOT.y})`}>
                    <Pixels cells={SWORD} />
                    {fx.sparkle && <Pixels cells={SPARKLE} />}
                  </g>
                  <Pixels cells={cat} />
                  {fx.dust && <Pixels cells={DUST} />}
                </g>
                {fx.bang && <Pixels cells={BANG} />}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
