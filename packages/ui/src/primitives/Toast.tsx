"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "../lib/utils";
import { Spinner } from "./Spinner";

// Toasts: mount one <Toaster /> near the root, then call `toast("Saved")` from anywhere.
//
// Each toast is a small raised card. Status is a 6px dot before the title (a spinner while
// loading); an optional action sits on the right; the close button shows on hover or focus. The
// newest toast sits in front with up to two more peeking behind it; hover or focus the stack and
// it fans out into a list, and every timer pauses until you leave. Swipe a toast sideways to
// dismiss it. Alt+T moves focus to the stack. Under reduced motion, only opacity animates.

// ─── Store ──────────────────────────────────────────────────────────────────

export type ToastType = "default" | "success" | "error" | "warning" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Pass an existing id to update that toast in place (e.g. loading → success). */
  id?: string | number;
  description?: ReactNode;
  action?: ToastAction;
  /** Milliseconds before it leaves. Infinity keeps it. Loading toasts never time out. */
  duration?: number;
  /** Show the close button and allow swiping. Default true. */
  dismissible?: boolean;
  /** Called when the toast is dismissed by the user or its timer. */
  onDismiss?: () => void;
}

export interface ToastData extends Omit<ToastOptions, "id"> {
  id: string | number;
  type: ToastType;
  title: ReactNode;
  /** Bumps whenever the toast is updated, restarting its timer. */
  version: number;
}

let toasts: ToastData[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const EMPTY: ToastData[] = [];

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function upsert(type: ToastType, title: ReactNode, options: ToastOptions = {}) {
  const { id = ++counter, ...rest } = options;
  const existing = toasts.find((item) => item.id === id);
  if (existing) {
    toasts = toasts.map((item) =>
      item.id === id ? { ...item, ...rest, type, title, version: item.version + 1 } : item
    );
  } else {
    toasts = [...toasts, { ...rest, id, type, title, version: 0 }];
  }
  emit();
  return id;
}

function dismiss(id?: string | number) {
  const leaving = id === undefined ? toasts : toasts.filter((item) => item.id === id);
  toasts = id === undefined ? [] : toasts.filter((item) => item.id !== id);
  emit();
  leaving.forEach((item) => item.onDismiss?.());
}

type PromiseMessages<T> = {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
};

/** Show a toast. Returns its id. */
export const toast = Object.assign(
  (title: ReactNode, options?: ToastOptions) => upsert("default", title, options),
  {
    success: (title: ReactNode, options?: ToastOptions) => upsert("success", title, options),
    error: (title: ReactNode, options?: ToastOptions) => upsert("error", title, options),
    warning: (title: ReactNode, options?: ToastOptions) => upsert("warning", title, options),
    loading: (title: ReactNode, options?: ToastOptions) => upsert("loading", title, options),
    /** Dismiss one toast, or all of them with no id. */
    dismiss,
    /** One toast that follows a promise: loading, then success or error. */
    promise<T>(promise: Promise<T>, messages: PromiseMessages<T>, options?: ToastOptions) {
      const id = upsert("loading", messages.loading, options);
      promise.then(
        (value) =>
          upsert("success", typeof messages.success === "function" ? (messages.success as (v: T) => ReactNode)(value) : messages.success, { ...options, id }),
        (error) =>
          upsert("error", typeof messages.error === "function" ? (messages.error as (e: unknown) => ReactNode)(error) : messages.error, { ...options, id })
      );
      return promise;
    },
  }
);

// ─── Toaster ────────────────────────────────────────────────────────────────

export type ToasterPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToasterProps {
  position?: ToasterPosition;
  /** How many toasts show at once; older ones wait behind. Default 3. */
  visibleToasts?: number;
  /** Default time on screen, in ms. Default 5000. */
  duration?: number;
  /** Always show the stack fanned out. */
  expand?: boolean;
  /** Distance from the viewport edge, in px. Default 16. */
  offset?: number;
  className?: string;
}

const GAP = 8;
const PEEK = 10;
const EASE = [0.32, 0.72, 0, 1] as const;

const DOT: Record<ToastType, string | null> = {
  default: null,
  loading: null,
  success: "bg-[rgb(126_190_152)]",
  error: "bg-[rgb(229_115_115)]",
  warning: "bg-[rgb(214_178_106)]",
};

export function Toaster({
  position = "bottom-right",
  visibleToasts = 3,
  duration = 5000,
  expand = false,
  offset = 16,
  className,
}: ToasterProps) {
  const items = useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const listRef = useRef<HTMLOListElement>(null);

  const [vertical, horizontal] = position.split("-") as ["top" | "bottom", "left" | "center" | "right"];
  const fromBottom = vertical === "bottom";
  const expanded = expand || hovered || focused;
  const paused = hovered || focused || hidden;

  useEffect(() => setMounted(true), []);

  const onHeight = useCallback(
    (id: string | number, height: number) =>
      setHeights((current) => (current[String(id)] === height ? current : { ...current, [String(id)]: height })),
    []
  );

  // Pause while the tab is in the background.
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Alt+T jumps to the stack.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyT") {
        event.preventDefault();
        listRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Once the stack empties, it isn't hovered or focused any more.
  useEffect(() => {
    if (items.length === 0) {
      setHovered(false);
      setFocused(false);
    }
  }, [items.length]);

  if (!mounted) return null;

  // Newest first: index 0 is the front toast.
  const ordered = [...items].reverse();
  const heightOf = (item: ToastData) => heights[String(item.id)] ?? 0;
  const frontHeight = ordered[0] ? heightOf(ordered[0]) : 0;
  const shown = ordered.slice(0, visibleToasts);
  const expandedHeight = shown.reduce((sum, item) => sum + heightOf(item), 0) + GAP * Math.max(shown.length - 1, 0);
  const collapsedHeight = frontHeight + PEEK * Math.max(shown.length - 1, 0);

  return createPortal(
    <section aria-label="Notifications (Alt+T)">
      <ol
        ref={listRef}
        tabIndex={-1}
        aria-live="polite"
        aria-relevant="additions text"
        data-position={position}
        data-expanded={expanded ? "" : undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
        style={{
          [vertical]: offset,
          height: items.length ? (expanded ? expandedHeight : collapsedHeight) : 0,
          ...(horizontal === "center"
            ? { left: "50%", transform: "translateX(-50%)" }
            : { [horizontal]: offset }),
        }}
        className={cn(
          "fixed z-[100] m-0 w-[min(360px,calc(100vw-32px))] list-none p-0 outline-none",
          "transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          className
        )}
      >
        <AnimatePresence initial={false}>
          {ordered.map((item, index) => {
            const before = ordered.slice(0, index).reduce((sum, other) => sum + heightOf(other), 0) + GAP * index;
            return (
              <ToastItem
                key={item.id}
                item={item}
                index={index}
                visible={index < visibleToasts}
                expanded={expanded}
                paused={paused}
                fromBottom={fromBottom}
                swipe={horizontal === "left" ? "left" : horizontal === "right" ? "right" : "both"}
                offset={expanded ? before : PEEK * index}
                frontHeight={frontHeight}
                duration={item.duration ?? duration}
                onHeight={onHeight}
              />
            );
          })}
        </AnimatePresence>
      </ol>
    </section>,
    document.body
  );
}

// ─── One toast ──────────────────────────────────────────────────────────────

interface ToastItemProps {
  item: ToastData;
  index: number;
  visible: boolean;
  expanded: boolean;
  paused: boolean;
  fromBottom: boolean;
  swipe: "left" | "right" | "both";
  offset: number;
  frontHeight: number;
  duration: number;
  onHeight: (id: string | number, height: number) => void;
}

function ToastItem({
  item,
  index,
  visible,
  expanded,
  paused,
  fromBottom,
  swipe,
  offset,
  frontHeight,
  duration,
  onHeight,
}: ToastItemProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const contentRef = useRef<HTMLDivElement>(null);
  const remaining = useRef(duration);
  const dismissible = item.dismissible ?? true;
  const behind = !expanded && index > 0;
  const direction = fromBottom ? -1 : 1;

  // The card's own height, measured from its content so a squeezed stack can't feed back into it.
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => onHeight(item.id, content.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [item.id, onHeight]);

  // An update (loading → success) restarts the clock. Declared before the timer so it runs first.
  useEffect(() => {
    remaining.current = duration;
  }, [item.version, duration]);

  useEffect(() => {
    if (paused || item.type === "loading" || !Number.isFinite(duration)) return;
    const start = Date.now();
    const timer = setTimeout(() => dismiss(item.id), Math.max(remaining.current, 0));
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - start;
    };
  }, [paused, item.type, item.id, item.version, duration]);

  // Swipe sideways to dismiss; the card fades as it travels.
  const x = useMotionValue(0);
  const swipeOpacity = useTransform(x, [-160, 0, 160], [swipe === "right" ? 1 : 0, 1, swipe === "left" ? 1 : 0]);

  const dot = DOT[item.type];

  return (
    <motion.li
      data-type={item.type}
      data-front={index === 0 ? "" : undefined}
      aria-hidden={!visible || undefined}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -direction * 16, scale: 1 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: direction * offset,
        scale: expanded || reduceMotion ? 1 : 1 - index * 0.05,
        height: behind ? frontHeight : "auto",
      }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
      transition={reduceMotion ? { duration: 0.15, y: { duration: 0 }, height: { duration: 0 } } : { duration: 0.32, ease: EASE }}
      style={{
        zIndex: 100 - index,
        transformOrigin: fromBottom ? "50% 100%" : "50% 0%",
        pointerEvents: visible ? "auto" : "none",
        [fromBottom ? "bottom" : "top"]: 0,
      }}
      className="group/toast absolute inset-x-0"
    >
      <motion.div
        role={item.type === "error" ? "alert" : undefined}
        drag={dismissible && !reduceMotion ? "x" : false}
        dragSnapToOrigin
        dragElastic={{ left: swipe === "right" ? 0.08 : 0.9, right: swipe === "left" ? 0.08 : 0.9 }}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          const distance = info.offset.x;
          const fast = Math.abs(info.velocity.x) > 500;
          const far = Math.abs(distance) > 90;
          const allowed = swipe === "both" || (swipe === "right" ? distance > 0 : distance < 0);
          if (allowed && (far || fast)) dismiss(item.id);
        }}
        style={{ x, opacity: swipeOpacity }}
        className={cn(
          "h-full overflow-hidden rounded-2xl border border-white/[0.08]",
          "bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.45),0_16px_40px_-12px_rgba(0,0,0,0.85),0_4px_12px_-4px_rgba(0,0,0,0.6)]",
          dismissible && "cursor-grab active:cursor-grabbing"
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            "flex items-start gap-3 py-3 pr-2.5 pl-3.5 transition-opacity duration-200",
            behind && "opacity-0"
          )}
        >
          {(dot || item.type === "loading") && (
            <span aria-hidden="true" className="flex h-5 shrink-0 items-center">
              {item.type === "loading" ? (
                <Spinner size="sm" label={null} className="text-neutral-300" />
              ) : (
                <span className={cn("size-1.5 rounded-full", dot)} />
              )}
            </span>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-px">
            <p className="text-sm leading-5 font-medium tracking-tight text-neutral-100">{item.title}</p>
            {item.description && <p className="text-[13px] leading-snug text-neutral-400">{item.description}</p>}
          </div>

          {item.action && (
            <button
              type="button"
              onClick={() => {
                item.action?.onClick();
                dismiss(item.id);
              }}
              className={cn(
                "inline-flex h-7 shrink-0 cursor-pointer items-center rounded-lg px-2.5 text-xs font-medium text-neutral-200 select-none",
                "border border-white/[0.08] bg-[linear-gradient(180deg,#232325_0%,#1c1c1e_100%)]",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.5)]",
                "transition-colors duration-150 hover:text-white active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]",
                "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
              )}
            >
              {item.action.label}
            </button>
          )}

          {dismissible && (
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(item.id)}
              className={cn(
                "grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-neutral-500 -my-0.5",
                "transition-[color,opacity,background-color] duration-150 hover:bg-white/[0.04] hover:text-neutral-100",
                "opacity-0 group-hover/toast:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
                "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
              )}
            >
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
                <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </motion.li>
  );
}
