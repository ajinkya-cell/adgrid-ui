"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { Popover } from "./Popover";
import { TextField } from "./TextField";

// Pick a colour. The field is a well with the colour sitting in a round socket; clicking it opens
// the picker on the Popover panel. Inside: a shade area cut into the panel, recessed hue and
// opacity tracks, a hex field, the screen eyedropper where the browser has one, and preset chips.
// Thumbs are rings filled with the colour they control; grabbing one lifts it a touch, letting go
// settles it. The preset matching the value is marked by a ring that glides between chips.
//
// Colour is kept as HSV internally, so a hue survives a trip through grey or black.

// ─── Colour helpers ─────────────────────────────────────────────────────────

export interface Hsva {
  /** 0–360 */
  h: number;
  /** 0–100 */
  s: number;
  /** 0–100 */
  v: number;
  /** 0–1 */
  a: number;
}

const clamp = (n: number, min = 0, max = 1) => Math.min(Math.max(n, min), max);

function hsvToRgb(h: number, s: number, v: number) {
  const S = s / 100;
  const V = v / 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => V - V * S * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  return [f(5), f(3), f(1)].map((c) => Math.round(c * 255)) as [number, number, number];
}

function rgbToHsv(r: number, g: number, b: number) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const d = max - Math.min(R, G, B);
  let h = 0;
  if (d) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? (d / max) * 100 : 0, v: max * 100 };
}

/** "#4F7CFF", "4f7cff", "#47f", "#4F7CFF80" → HSVA, or null if it isn't a hex colour. */
export function hexToHsva(input: string): Hsva | null {
  let hex = input.trim().replace(/^#/, "");
  if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null;
  if (hex.length <= 4) hex = hex.split("").map((c) => c + c).join("");
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  const { h, s, v } = rgbToHsv(n(0), n(2), n(4));
  return { h, s, v, a: hex.length === 8 ? Math.round((n(6) / 255) * 100) / 100 : 1 };
}

/** HSVA → "#RRGGBB", or "#RRGGBBAA" when it's translucent (or `withAlpha` is set). */
export function hsvaToHex({ h, s, v, a }: Hsva, withAlpha = a < 1) {
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  const [r, g, b] = hsvToRgb(h, s, v);
  return `#${hex(r)}${hex(g)}${hex(b)}${withAlpha ? hex(Math.round(clamp(a) * 255)) : ""}`.toUpperCase();
}

// ─── Component ──────────────────────────────────────────────────────────────

export type ColorPickerSize = "sm" | "md" | "lg";

export interface ColorPickerProps {
  /** Hex: "#RRGGBB", or "#RRGGBBAA" when translucent. */
  value?: string;
  defaultValue?: string;
  /** Every change while dragging or typing. */
  onValueChange?: (hex: string) => void;
  /** When a change is finished: pointer up, Enter, a preset or the eyedropper. Good for saving. */
  onValueCommit?: (hex: string) => void;
  /** Offer an opacity slider. Default true. */
  alpha?: boolean;
  /** Colours offered as one-click chips. Leave it out (or pass []) for no presets row at all. */
  presets?: string[];
  /** Just the picker, always visible, without the field and popover. */
  inline?: boolean;
  /** Field height: 32, 40 or 48px. Default "md". */
  size?: ColorPickerSize;
  disabled?: boolean;
  invalid?: boolean;
  /** Submits the hex with a form. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}

const FIELD_SIZES = {
  sm: "h-8 rounded-lg pl-1.5 pr-1.5 text-[13px] gap-2",
  md: "h-10 rounded-xl pl-2 pr-2 text-sm gap-2.5",
  lg: "h-12 rounded-xl pl-2.5 pr-2.5 text-[15px] gap-3",
} as const;
const CHIP_SIZES = { sm: "size-5", md: "size-6", lg: "size-7" } as const;

const CHECKER = "repeating-conic-gradient(#3a3a3c 0% 25%, #232325 0% 50%) 50% / 8px 8px";
const HUES = "linear-gradient(90deg, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)";
const SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;
const WELL_EDGE = "shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.35)]";

/** Pointer drag on an element, mapped to 0–1 on each axis. */
function useDrag(onMove: (x: number, y: number) => void, onEnd: () => void) {
  const [dragging, setDragging] = useState(false);
  const move = (event: PointerEvent<HTMLElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    onMove(clamp((event.clientX - r.left) / r.width), clamp((event.clientY - r.top) / r.height));
  };
  return {
    dragging,
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Synthetic pointers can't always be captured; the drag still works.
        }
        setDragging(true);
        move(event);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (dragging) move(event);
      },
      onPointerUp: () => {
        if (!dragging) return;
        setDragging(false);
        onEnd();
      },
      onPointerCancel: () => setDragging(false),
    },
  };
}

/** A ring filled with the colour it controls; it lifts while held. */
function Thumb({ colour, size, lifted, className, style }: { colour: string; size: number; lifted: boolean; className?: string; style?: CSSProperties }) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.span
      aria-hidden="true"
      animate={{ scale: lifted && !reduceMotion ? 1.18 : 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
      className={cn(
        "pointer-events-none absolute rounded-full border-2 border-white",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(0,0,0,0.15)]",
        className
      )}
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, background: colour, ...style }}
    />
  );
}

const keyStep = (event: KeyboardEvent) => (event.shiftKey ? 10 : 1);

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(function ColorPicker(
  {
    value,
    defaultValue = "#FFFFFF",
    onValueChange,
    onValueCommit,
    alpha = true,
    presets,
    inline = false,
    size = "md",
    disabled = false,
    invalid = false,
    name,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
  },
  ref
) {
  const [hsva, setHsva] = useState<Hsva>(() => hexToHsva(value ?? defaultValue) ?? { h: 0, s: 0, v: 100, a: 1 });
  const hsvaRef = useRef(hsva);
  hsvaRef.current = hsva;
  const toHex = useCallback((c: Hsva) => hsvaToHex(alpha ? c : { ...c, a: 1 }), [alpha]);
  const hex = toHex(hsva);
  const lastEmitted = useRef(hex);

  // An outside value change moves the picker, unless it's the value we just sent out (keeping
  // the hue when that value is a grey).
  useEffect(() => {
    if (value === undefined) return;
    const next = hexToHsva(value);
    if (!next || toHex(next) === toHex(hsvaRef.current)) return;
    setHsva(next);
  }, [value, toHex]);

  const update = useCallback(
    (next: Hsva) => {
      const c = { ...next, a: alpha ? clamp(next.a) : 1 };
      setHsva(c);
      const out = toHex(c);
      if (out !== lastEmitted.current) {
        lastEmitted.current = out;
        onValueChange?.(out);
      }
    },
    [alpha, toHex, onValueChange]
  );
  const commit = useCallback(() => onValueCommit?.(toHex(hsvaRef.current)), [onValueCommit, toHex]);

  const panel = (
    <PickerPanel hsva={hsva} hex={hex} alpha={alpha} presets={presets} update={update} commit={commit} />
  );

  if (inline) {
    return (
      <div
        role="group"
        aria-label={ariaLabel ?? "Colour picker"}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          "w-[248px] rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)] p-3",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.45),0_14px_30px_-10px_rgba(0,0,0,0.5)]",
          disabled && "pointer-events-none opacity-40",
          className
        )}
      >
        {panel}
        {name && <input type="hidden" name={name} value={hex} />}
      </div>
    );
  }

  const opaqueHex = hsvaToHex({ ...hsva, a: 1 });
  return (
    <>
      <Popover
        aria-label="Colour picker"
        className="w-[248px]"
        trigger={
          <button
            ref={ref}
            id={id}
            type="button"
            disabled={disabled}
            aria-label={ariaLabelledBy ? undefined : ariaLabel ?? `Colour, ${hex}`}
            aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${id ?? ""}`.trim() : undefined}
            aria-invalid={invalid || undefined}
            className={cn(
              "group/colour relative flex w-full cursor-pointer items-center border bg-[#070707] text-left select-none",
              "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
              "transition-[border-color,background-color] duration-150",
              "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
              "aria-expanded:border-white/[0.18] aria-expanded:bg-[#050505]",
              invalid ? "border-[rgb(229_115_115/0.45)]" : "border-white/[0.08]",
              !disabled && !invalid && "hover:border-white/[0.13]",
              disabled && "cursor-not-allowed opacity-40",
              FIELD_SIZES[size],
              className
            )}
          >
            {/* The colour in a round socket, over a checkerboard so translucency shows. */}
            <span
              aria-hidden="true"
              className={cn("relative shrink-0 overflow-hidden rounded-full border border-white/[0.1]", CHIP_SIZES[size])}
              style={{ background: CHECKER }}
            >
              <span
                className="absolute inset-0 transition-[background-color] duration-200 motion-reduce:transition-none"
                style={{ backgroundColor: hex }}
              />
              <span className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]" />
            </span>
            <span className="min-w-0 flex-1 truncate font-medium tracking-tight text-neutral-100 tabular-nums">
              {opaqueHex}
              {hsva.a < 1 && <span className="ml-1.5 font-normal text-neutral-500">{Math.round(hsva.a * 100)}%</span>}
            </span>
            <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center text-neutral-500 transition-colors duration-150 group-hover/colour:text-neutral-300">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="m5 6 3-3 3 3M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        }
      >
        {panel}
      </Popover>
      {name && <input type="hidden" name={name} value={hex} />}
    </>
  );
});

// ─── The picker itself ──────────────────────────────────────────────────────

function PickerPanel({
  hsva,
  hex,
  alpha,
  presets,
  update,
  commit,
}: {
  hsva: Hsva;
  hex: string;
  alpha: boolean;
  presets?: string[];
  update: (next: Hsva) => void;
  commit: () => void;
}) {
  const { h, s, v, a } = hsva;
  const opaque = hsvaToHex({ ...hsva, a: 1 });
  const pureHue = hsvaToHex({ h, s: 100, v: 100, a: 1 });
  const ringId = useId();

  const area = useDrag((x, y) => update({ ...hsva, s: x * 100, v: (1 - y) * 100 }), commit);
  const hue = useDrag((x) => update({ ...hsva, h: x * 360 }), commit);
  const opacity = useDrag((x) => update({ ...hsva, a: Math.round(x * 100) / 100 }), commit);

  // EyeDropper exists in Chromium browsers only; look for it after mount (SSR-safe).
  const [canPick, setCanPick] = useState(false);
  useEffect(() => setCanPick(typeof window !== "undefined" && "EyeDropper" in window), []);
  const pickFromScreen = async () => {
    try {
      const Dropper = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
      const { sRGBHex } = await new Dropper().open();
      const next = hexToHsva(sRGBHex);
      if (next) {
        update({ ...next, a: hsva.a });
        commit();
      }
    } catch {
      // Cancelled with Escape: nothing to do.
    }
  };

  // The hex field edits a draft; it applies on Enter or blur, and reverts if it isn't a colour.
  const [draft, setDraft] = useState(opaque.slice(1));
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) setDraft(opaque.slice(1));
  }, [opaque]);
  const applyDraft = () => {
    editing.current = false;
    const next = hexToHsva(draft);
    if (next) {
      update({ ...next, a: draft.replace(/^#/, "").length === 8 ? next.a : hsva.a });
      commit();
    } else setDraft(opaque.slice(1));
  };

  const [alphaDraft, setAlphaDraft] = useState(String(Math.round(a * 100)));
  const editingAlpha = useRef(false);
  useEffect(() => {
    if (!editingAlpha.current) setAlphaDraft(String(Math.round(a * 100)));
  }, [a]);
  const applyAlpha = () => {
    editingAlpha.current = false;
    const n = Number(alphaDraft.replace("%", ""));
    if (Number.isFinite(n)) {
      update({ ...hsva, a: clamp(n / 100) });
      commit();
    } else setAlphaDraft(String(Math.round(a * 100)));
  };

  const onAreaKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = keyStep(event);
    const moves: Record<string, Partial<Hsva>> = {
      ArrowLeft: { s: Math.max(s - step, 0) },
      ArrowRight: { s: Math.min(s + step, 100) },
      ArrowDown: { v: Math.max(v - step, 0) },
      ArrowUp: { v: Math.min(v + step, 100) },
      Home: { s: 0 },
      End: { s: 100 },
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    update({ ...hsva, ...moves[event.key] });
    commit();
  };
  const sliderKey = (current: number, max: number, set: (n: number) => void) => (event: KeyboardEvent<HTMLDivElement>) => {
    const step = keyStep(event) * (max === 1 ? 0.01 : 1);
    const map: Record<string, number> = {
      ArrowLeft: current - step,
      ArrowDown: current - step,
      ArrowRight: current + step,
      ArrowUp: current + step,
      Home: 0,
      End: max,
    };
    if (!(event.key in map)) return;
    event.preventDefault();
    set(Math.min(Math.max(Math.round(map[event.key] * 100) / 100, 0), max));
    commit();
  };

  const presetHsva = presets?.map((p) => ({ hex: p, c: hexToHsva(p) })).filter((p): p is { hex: string; c: Hsva } => p.c !== null);
  const currentHex = hsvaToHex(hsva, alpha && a < 1);

  return (
    <div className="flex flex-col gap-3">
      {/* Shade area: cut into the panel. */}
      <div
        role="slider"
        tabIndex={0}
        aria-roledescription="2D slider"
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(s)}
        aria-valuetext={`Saturation ${Math.round(s)}%, brightness ${Math.round(v)}%`}
        onKeyDown={onAreaKey}
        {...area.handlers}
        className={cn(
          "relative h-36 cursor-crosshair touch-none rounded-xl outline-none select-none",
          "focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181a]"
        )}
        style={{
          backgroundColor: pureHue,
          backgroundImage: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
      >
        <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 rounded-xl", WELL_EDGE)} />
        <Thumb colour={opaque} size={14} lifted={area.dragging} style={{ left: `${s}%`, top: `${100 - v}%` }} />
      </div>

      {/* Hue track. */}
      <Track
        label="Hue"
        valueNow={Math.round(h)}
        max={360}
        valueText={`${Math.round(h)} degrees`}
        onKeyDown={sliderKey(h, 360, (n) => update({ ...hsva, h: n }))}
        drag={hue}
        background={HUES}
      >
        <Thumb colour={pureHue} size={16} lifted={hue.dragging} style={{ left: `${(h / 360) * 100}%` }} />
      </Track>

      {/* Opacity track: a checkerboard under the colour fading in. */}
      {alpha && (
        <Track
          label="Opacity"
          valueNow={Math.round(a * 100)}
          max={100}
          valueText={`${Math.round(a * 100)}%`}
          onKeyDown={sliderKey(a, 1, (n) => update({ ...hsva, a: n }))}
          drag={opacity}
          background={`linear-gradient(90deg, transparent, ${opaque}), ${CHECKER}`}
        >
          <Thumb colour={hex} size={16} lifted={opacity.dragging} style={{ left: `${a * 100}%` }} />
        </Track>
      )}

      {/* Values. */}
      <div className="flex items-center gap-2">
        <TextField
          size="sm"
          aria-label="Hex colour"
          leading={<span className="text-neutral-500">#</span>}
          value={draft}
          spellCheck={false}
          autoComplete="off"
          maxLength={8}
          showCount={false}
          onChange={(event) => {
            editing.current = true;
            setDraft(event.target.value.replace(/[^0-9a-f]/gi, "").toUpperCase());
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              applyDraft();
            }
          }}
          onBlur={applyDraft}
          className="min-w-0 flex-1"
          fieldClassName="font-medium tabular-nums"
        />
        {alpha && (
          <TextField
            size="sm"
            aria-label="Opacity percent"
            inputMode="numeric"
            value={alphaDraft}
            trailing="%"
            onChange={(event) => {
              editingAlpha.current = true;
              setAlphaDraft(event.target.value.replace(/[^0-9]/g, "").slice(0, 3));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyAlpha();
              }
            }}
            onBlur={applyAlpha}
            className="w-[72px] shrink-0"
            fieldClassName="tabular-nums"
          />
        )}
        {canPick && (
          <button
            type="button"
            aria-label="Pick a colour from the screen"
            onClick={pickFromScreen}
            className={cn(
              "grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-neutral-400",
              "transition-colors duration-150 hover:bg-[#0c0c0d] hover:text-neutral-100",
              "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
            )}
          >
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
              <path d="m9.5 3.5 3 3M11 2a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2l-1.5 1.5-3-3L11 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="m9.5 5-6 6-.75 2.25L5 12.5l6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Presets: chips in sockets; a ring glides to the one in use. */}
      {presetHsva && presetHsva.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-black/50 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <LayoutGroup id={ringId}>
            {presetHsva.map(({ hex: preset, c }) => {
              const chosen = hsvaToHex(c, alpha && c.a < 1) === currentHex;
              return (
                <button
                  key={preset}
                  type="button"
                  aria-label={preset.toUpperCase()}
                  aria-pressed={chosen}
                  onClick={() => {
                    update(c);
                    commit();
                  }}
                  className="relative grid size-[22px] cursor-pointer place-items-center rounded-full outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
                >
                  {chosen && (
                    <motion.span
                      aria-hidden="true"
                      layoutId="colour-preset-ring"
                      transition={SPRING}
                      className="absolute -inset-[3px] rounded-full border border-white/70"
                    />
                  )}
                  <span aria-hidden="true" className="relative size-full overflow-hidden rounded-full border border-white/[0.1]" style={{ background: CHECKER }}>
                    <span className="absolute inset-0" style={{ backgroundColor: hsvaToHex(c) }} />
                    <span className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]" />
                  </span>
                </button>
              );
            })}
          </LayoutGroup>
        </div>
      )}
    </div>
  );
}

function Track({
  label,
  valueNow,
  max,
  valueText,
  onKeyDown,
  drag,
  background,
  children,
}: {
  label: string;
  valueNow: number;
  max: number;
  valueText: string;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  drag: ReturnType<typeof useDrag>;
  background: string;
  children: ReactNode;
}) {
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      {...drag.handlers}
      // A taller hit area than the 10px track it draws, so it's easy to grab.
      className={cn(
        "relative flex h-5 cursor-pointer touch-none items-center rounded-full outline-none select-none",
        "focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181a]"
      )}
    >
      <span aria-hidden="true" className="absolute inset-x-0 h-2.5 rounded-full" style={{ background }}>
        <span className={cn("absolute inset-0 rounded-full", WELL_EDGE)} />
      </span>
      {/* Thumbs are centred on the track's line. */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-0">{children}</span>
    </div>
  );
}
