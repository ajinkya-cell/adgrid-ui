"use client";

import React, { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type SpringOptions } from "framer-motion";
import { cn } from "../lib/utils";
import { DETENT_CLICK } from "../lib/click-voices";

// A wheel of values on a 3D drum, picked by dragging, flicking, scrolling, tapping or the keys.
//
// Items sit on a cylinder 20° apart; the one facing you sits in a recessed slot (a well behind the
// text, so it never tints it) and is the value. Drag follows the finger 1:1 with a rubber band at
// the ends; a flick carries on by its speed and settles on an item with a spring; the wheel and
// trackpad move it continuously and it settles when you stop; tapping an item brings it to the
// slot. Each detent can tick. Text colour and fade follow the drum's position directly, so it
// never re-renders mid-spin and nothing blurs.
//
// The mouse wheel turns the drum rather than stepping it: each notch adds a row to a target the
// drum glides towards on a spring, so quick notches build up speed and it rotates through
// smoothly. A trackpad drives the same target continuously. With `loop`, rows fade out before
// they reach the back of the drum, so nothing is ever seen jumping from one end to the other;
// a list too short to hide that seam scrolls without looping.

let lastPlayTime = 0;
let audioCtx: AudioContext | null = null;

function playClickSound(volume = 0.03) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastPlayTime < 35) return; // Don't stack ticks on a fast spin
  lastPlayTime = now;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") void audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = DETENT_CLICK.type;
    osc.frequency.setValueAtTime(DETENT_CLICK.from, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(DETENT_CLICK.to, audioCtx.currentTime + DETENT_CLICK.sweep);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + DETENT_CLICK.decay);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.007);
  } catch {
    // Audio is a nicety; never let it break the picker.
  }
}

export type WheelPickerProps = {
  items: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** "raised" sits on its own card; "minimal" has no surface. "glass" is the old name for "raised". */
  variant?: "raised" | "minimal" | "glass";
  /** Wrap around from the last item to the first. */
  loop?: boolean;
  /** Tick on every detent. */
  sound?: boolean;
  disabled?: boolean;
  /** Height of one row in px. Default 40. */
  itemHeight?: number;
  /** Rows in view; odd numbers keep the slot centred. Default 5. */
  visibleItems?: number;
  /** 3D perspective in px. Default 1000. */
  perspective?: number;
  spring?: SpringOptions;
  className?: string;
  /** Names the picker for screen readers. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /**
   * Drive the wheel from outside as a fractional item index (2.5 = halfway between items 2 and
   * 3), e.g. from a video timeline. Overrides the internal spring and makes no sound.
   */
  position?: number;
};

export interface WheelPickerRef {
  next: () => void;
  previous: () => void;
  scrollTo: (value: string) => void;
}

const STEP_DEG = 20;
const STEP_RAD = (STEP_DEG * Math.PI) / 180;
// Just under critically damped: the drum lands on a row with the faintest settle, like a detent.
const DEFAULT_SPRING: SpringOptions = { stiffness: 240, damping: 26, mass: 0.8 };
/** The glide a wheel or trackpad drives: quick to follow, no overshoot. */
const GLIDE: SpringOptions = { stiffness: 320, damping: 36, mass: 0.7 };
/** How far a flick carries: px/ms of release speed × this, in px. */
const FLICK_PX_PER_VELOCITY = 240;
/** A release this long after the last move is a placement, not a flick. */
const FLICK_STALE_MS = 80;
/** Trackpad pixels per row. */
const TRACKPAD_PX_PER_ROW = 50;
/** A wheel event this big (or in lines/pages) is a mouse notch: exactly one row. */
const NOTCH_PX = 50;
const TAP_SLOP = 4;

export const WheelPicker = forwardRef<WheelPickerRef, WheelPickerProps>(function WheelPicker(
  {
    items = [],
    value,
    defaultValue,
    onChange,
    variant = "raised",
    loop: loopProp = false,
    sound = true,
    disabled = false,
    itemHeight = 40,
    visibleItems = 5,
    perspective = 1000,
    spring,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    position,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const total = items.length;
  // Looping needs a couple of rows out of sight to hide the seam; shorter lists just scroll.
  const loop = loopProp && total >= visibleItems + 2;
  const uid = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const raised = variant !== "minimal";

  const isControlled = value !== undefined;
  const [localValue, setLocalValue] = useState(isControlled ? value : defaultValue || items[0] || "");
  const activeValue = isControlled ? value : localValue;
  const startIndex = Math.max(items.indexOf(activeValue), 0);

  // The drum's position in items (fractional while moving).
  const y = useMotionValue(startIndex);
  const lastIndexRef = useRef(startIndex);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const springConfig = reduceMotion ? { stiffness: 600, damping: 60 } : spring ?? DEFAULT_SPRING;

  const wrap = useCallback((i: number) => (total ? ((i % total) + total) % total : 0), [total]);
  const clampIndex = useCallback((i: number) => Math.max(0, Math.min(total - 1, i)), [total]);

  const settleTo = useCallback(
    (target: number) => {
      const end = loop ? target : clampIndex(target);
      animate(y, end, {
        type: "spring",
        ...springConfig,
        onComplete: () => {
          // Fold a looped drum back into range so the numbers never grow without bound.
          if (loop && total > 0) y.set(wrap(Math.round(end)));
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loop, total, clampIndex, wrap, y, springConfig.stiffness, springConfig.damping, springConfig.mass]
  );

  /** Go to item `index`, taking the short way round on a looped drum. */
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!loop || total === 0) return settleTo(clampIndex(index));
      const current = y.get();
      const base = wrap(index);
      const cycle = Math.round(current / total) * total;
      const candidates = [cycle + base - total, cycle + base, cycle + base + total];
      candidates.sort((a, b) => Math.abs(a - current) - Math.abs(b - current));
      settleTo(candidates[0]);
    },
    [loop, total, settleTo, clampIndex, wrap, y]
  );

  useImperativeHandle(ref, () => ({
    next: () => !disabled && scrollToIndex(lastIndexRef.current + 1),
    previous: () => !disabled && scrollToIndex(lastIndexRef.current - 1),
    scrollTo: (val: string) => {
      const target = items.indexOf(val);
      if (!disabled && target !== -1) scrollToIndex(target);
    },
  }));

  // An outside value change turns the drum.
  useEffect(() => {
    if (!isControlled) return;
    const target = items.indexOf(value);
    if (target !== -1 && target !== lastIndexRef.current) {
      lastIndexRef.current = target;
      setActiveIndex(target);
      scrollToIndex(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items, isControlled]);

  // Each new item reaching the slot: tick, update, report.
  useEffect(() => {
    return y.on("change", (latest) => {
      const rounded = Math.round(latest);
      const index = loop ? wrap(rounded) : clampIndex(rounded);
      if (index === lastIndexRef.current) return;
      lastIndexRef.current = index;
      setActiveIndex(index);
      if (sound && !disabled) playClickSound(0.04);
      if (!isControlled) setLocalValue(items[index]);
      onChange?.(items[index]);
    });
  }, [y, loop, wrap, clampIndex, sound, disabled, isControlled, items, onChange]);

  // ─── Drag, flick and tap ──────────────────────────────────────────────────
  const drag = useRef({ active: false, startY: 0, startOffset: 0, moved: false, samples: [] as { t: number; y: number }[] });

  const rubberBand = (offset: number) => {
    if (loop) return offset;
    if (offset < 0) return offset * 0.35;
    if (offset > total - 1) return total - 1 + (offset - (total - 1)) * 0.35;
    return offset;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    y.stop();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some synthetic or already-released pointers can't be captured; dragging still works.
    }
    drag.current = {
      active: true,
      startY: event.clientY,
      startOffset: y.get(),
      moved: false,
      samples: [{ t: performance.now(), y: event.clientY }],
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const delta = event.clientY - d.startY;
    if (Math.abs(delta) > TAP_SLOP) d.moved = true;
    const now = performance.now();
    d.samples.push({ t: now, y: event.clientY });
    // Keep only the last 100ms: release speed should reflect the end of the gesture.
    while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift();
    y.set(rubberBand(d.startOffset - delta / itemHeight));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;

    // A tap: bring the tapped row to the slot.
    if (!d.moved) {
      const rect = event.currentTarget.getBoundingClientRect();
      const rows = Math.round((event.clientY - (rect.top + rect.height / 2)) / itemHeight);
      return scrollToIndex(Math.round(y.get()) + rows);
    }

    // A flick: carry on by the release speed, then settle on a row.
    const now = performance.now();
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const stale = now - last.t > FLICK_STALE_MS;
    const velocity = stale || last.t === first.t ? 0 : (last.y - first.y) / (last.t - first.t); // px/ms
    const carry = (velocity * FLICK_PX_PER_VELOCITY) / itemHeight;
    scrollToIndex(Math.round(y.get() - carry));
  };

  // ─── Keys ─────────────────────────────────────────────────────────────────
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const current = lastIndexRef.current;
    const moves: Record<string, number> = {
      ArrowUp: current - 1,
      ArrowDown: current + 1,
      PageUp: current - visibleItems,
      PageDown: current + visibleItems,
      Home: 0,
      End: total - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    scrollToIndex(moves[event.key]);
  };

  // ─── Wheel and trackpad: glide towards a target, settle once input stops ───
  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;
    let target: number | null = null;
    let settle = 0;
    // The size of one notch on this mouse, learned from the smallest notch seen. Browsers merge
    // wheel events that arrive faster than a frame, so one event can carry several notches.
    let notchUnit = Infinity;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault(); // keep the page still while turning the drum
      const px = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * el.clientHeight : event.deltaY;
      if (px === 0) return;
      const notch = event.deltaMode !== 0 || Math.abs(px) >= NOTCH_PX;
      // A gesture starts from wherever the drum is, so a folded loop can never spin the long way.
      if (target === null) target = y.get();
      if (notch) notchUnit = Math.min(notchUnit, Math.abs(px));
      const rows = notch ? Math.max(1, Math.round(Math.abs(px) / notchUnit)) * Math.sign(px) : 0;
      target = notch ? Math.round(target) + rows : target + px / TRACKPAD_PX_PER_ROW;
      if (!loop) target = notch ? clampIndex(target) : Math.max(-0.35, Math.min(total - 1 + 0.35, target));
      animate(y, target, { type: "spring", ...(reduceMotion ? { stiffness: 600, damping: 60 } : GLIDE) });
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const end = Math.round(target ?? y.get());
        target = null;
        scrollToIndex(end);
      }, notch ? 180 : 120);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, loop, total, scrollToIndex, reduceMotion]);

  const radius = itemHeight / Math.sin(STEP_RAD); // one step on the drum = one row on screen
  const shownIndex = position === undefined ? activeIndex : loop ? wrap(Math.round(position)) : clampIndex(Math.round(position));
  const wheelHeight = itemHeight * visibleItems;
  const optionId = (index: number) => `${uid}-item-${index}`;

  return (
    <div
      ref={containerRef}
      role="listbox"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabelledBy ? undefined : ariaLabel ?? "Choose a value"}
      aria-labelledby={ariaLabelledBy}
      aria-activedescendant={optionId(shownIndex)}
      aria-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "relative w-full cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing",
        "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
        raised &&
          cn(
            "rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)]"
          ),
        disabled && "pointer-events-none cursor-not-allowed opacity-40",
        className
      )}
      style={{ height: wheelHeight }}
    >
      {/* The slot: a well behind the text, so the value sits in it rather than under a tint. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute rounded-xl border border-white/[0.06] bg-[#0c0c0d]",
          "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.04)]",
          raised ? "inset-x-1.5" : "inset-x-0"
        )}
        style={{ height: itemHeight, top: (wheelHeight - itemHeight) / 2 }}
      />

      {/* The drum. The mask fades the rows as they turn away. */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: `${perspective}px`,
          transformStyle: "preserve-3d",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
        }}
      >
        <div className="relative w-full" style={{ height: itemHeight, transformStyle: "preserve-3d" }}>
          {items.map((item, index) => (
            <WheelItem
              key={`${item}-${index}`}
              id={optionId(index)}
              item={item}
              index={index}
              total={total}
              y={y}
              itemHeight={itemHeight}
              loop={loop}
              radius={radius}
              reach={visibleItems / 2 + 0.5}
              selected={shownIndex === index}
              position={position}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

type WheelItemProps = {
  id: string;
  item: string;
  index: number;
  total: number;
  y: MotionValue<number>;
  itemHeight: number;
  loop: boolean;
  radius: number;
  /** Rows this far from the slot (or further) are fully faded. */
  reach: number;
  selected: boolean;
  position?: number;
};

// Text colour runs from #fafafa in the slot to #737373 a row away, following the drum directly.
const mix = (t: number) => {
  const c = Math.round(250 - (250 - 115) * Math.min(Math.abs(t), 1));
  return `rgb(${c} ${c} ${c})`;
};

const WheelItem = React.memo(function WheelItem({ id, item, index, total, y, itemHeight, loop, radius, reach, selected, position }: WheelItemProps) {
  const toDiff = (latest: number) => {
    if (total === 0) return 0;
    let diff = index - latest;
    if (loop) {
      const half = total / 2;
      diff = ((((diff + half) % total) + total) % total) - half;
    }
    return diff;
  };
  // Positions are rounded to 0.01px: the server prints 6 significant digits while the browser
  // keeps full precision, and the two strings must match for hydration. 0.01px is invisible.
  const round = (v: number) => Math.round(v * 100) / 100;
  const frame = (diff: number) => {
    const angle = diff * STEP_RAD;
    return {
      rotateX: round(-diff * STEP_DEG),
      y: round(radius * Math.sin(angle)),
      z: round(radius * (Math.cos(angle) - 1)),
      // Rows fade as they turn away and are gone just past the window, well before the loop's seam.
      opacity: Math.abs(diff) >= reach ? 0 : round(1 - (Math.abs(diff) / reach) * 0.8),
      visibility: (Math.abs(diff) >= reach ? "hidden" : "visible") as "hidden" | "visible",
      color: mix(diff),
    };
  };

  const d = useTransform(y, toDiff);
  const rotateX = useTransform(d, (v) => frame(v).rotateX);
  const translateY = useTransform(d, (v) => frame(v).y);
  const translateZ = useTransform(d, (v) => frame(v).z);
  const opacity = useTransform(d, (v) => frame(v).opacity);
  const color = useTransform(d, (v) => frame(v).color);
  const visibility = useTransform(d, (v) => frame(v).visibility);

  // A driven position renders as plain numbers so the frame is final on first paint.
  const style = position !== undefined ? frame(toDiff(position)) : { rotateX, y: translateY, z: translateZ, opacity, color, visibility };

  return (
    <motion.div
      id={id}
      role="option"
      aria-selected={selected}
      className="absolute inset-x-0 flex items-center justify-center text-center text-sm font-medium tracking-tight [backface-visibility:hidden] will-change-transform"
      style={{ height: itemHeight, ...style }}
    >
      <span className="max-w-[85%] truncate px-4">{item}</span>
    </motion.div>
  );
});
