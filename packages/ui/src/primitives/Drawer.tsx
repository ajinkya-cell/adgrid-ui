"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";

// A panel that slides in from the side, on the same native <dialog> as Modal: focus trap, Escape,
// top layer, inert page and focus return come from the browser. It floats 8px off the screen edge
// so the bevel, the prismatic edge and the long drop shadow all read, the same as every other
// raised surface.

const EXIT_MS = 180;
const PRISMATIC =
  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)";

export type DrawerSide = "left" | "right";
export type DrawerSize = "sm" | "md" | "lg";

const WIDTH = { sm: "max-w-[320px]", md: "max-w-[380px]", lg: "max-w-[480px]" };

/** The raised panel material, for showing drawer content inline (e.g. a docked sidebar). */
export const DRAWER_PANEL_CLASS = cn(
  "relative flex flex-col overflow-hidden rounded-3xl text-neutral-100",
  "border border-white/[0.08] border-t-white/[0.16] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
  "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_40px_100px_-20px_rgba(0,0,0,0.9),0_8px_24px_-6px_rgba(0,0,0,0.7)]"
);

/** The round close socket shared with Modal. */
export function CloseSocket({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      className={cn(
        "grid size-8 shrink-0 cursor-pointer place-items-center rounded-full",
        "border border-white/[0.08] bg-[#0d0d0e] text-neutral-500",
        "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.06)]",
        "transition-colors duration-150 hover:border-white/[0.14] hover:text-neutral-100",
        "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
        className
      )}
    >
      <svg viewBox="0 0 12 12" width="11" height="11" fill="none" aria-hidden="true">
        <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}

const DrawerContext = createContext<{ close: () => void } | null>(null);

/** Closes the surrounding Drawer. Returns a no-op outside one. */
export function useDrawerClose() {
  return useContext(DrawerContext)?.close ?? (() => {});
}

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the drawer when clicked. */
  trigger?: ReactElement;
  side?: DrawerSide;
  /** Panel width: 320, 380 or 480px. */
  size?: DrawerSize;
  /** Heading. Without one, the children own the whole panel and `aria-label` names it. */
  title?: ReactNode;
  description?: ReactNode;
  "aria-label"?: string;
  /** Actions in the footer tray. */
  footer?: ReactNode;
  /** Backdrop click and the close socket. Escape always closes. */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  side = "left",
  size = "md",
  title,
  description,
  "aria-label": ariaLabel,
  footer,
  dismissible = true,
  className,
  children,
}: DrawerProps) {
  const [own, setOwn] = useState(defaultOpen);
  const open = openProp ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOwn(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );
  const close = useCallback(() => setOpen(false), [setOpen]);

  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<"open" | "closed">("closed");
  const pressedBackdrop = useRef(false);
  const closeRef = useRef(close);
  closeRef.current = close;
  const labelId = useId();
  const descId = useId();

  // Same lifecycle as Modal: showModal, then slide in; slide out, then close.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      }
      const frame = requestAnimationFrame(() => setState("open"));
      return () => cancelAnimationFrame(frame);
    }
    setState("closed");
    if (!dialog.open) return;
    const timer = window.setTimeout(() => dialog.close(), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      closeRef.current();
    };
    const onClose = () => {
      if (open) closeRef.current();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, [open]);

  const triggerElement = isValidElement<{ onClick?: (event: MouseEvent) => void }>(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        onClick: (event: MouseEvent) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) setOpen(true);
        },
      })
    : null;

  const left = side === "left";

  return (
    <>
      {triggerElement}
      <dialog
        ref={ref}
        aria-modal="true"
        aria-labelledby={title ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        aria-label={title ? undefined : ariaLabel}
        data-state={state}
        data-side={side}
        onPointerDown={(event) => {
          pressedBackdrop.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (dismissible && pressedBackdrop.current && event.target === event.currentTarget) close();
          pressedBackdrop.current = false;
        }}
        className={cn(
          "group/drawer my-2 h-[calc(100dvh-16px)] max-h-none w-[calc(100vw-16px)] max-w-none overflow-visible border-0 bg-transparent p-0 text-neutral-100 outline-none",
          left ? "mr-auto ml-2" : "mr-2 ml-auto",
          WIDTH[size],
          "backdrop:bg-black/60 backdrop:opacity-0 backdrop:backdrop-blur-[3px]",
          "backdrop:transition-opacity backdrop:duration-[180ms]",
          "data-[state=open]:backdrop:opacity-100 data-[state=open]:backdrop:duration-[260ms]"
        )}
      >
        <DrawerContext.Provider value={{ close }}>
          <div
            className={cn(
              DRAWER_PANEL_CLASS,
              "h-full w-full",
              // Exit (default): quick and accelerating, back past the edge. Entrance: slower and settling.
              left ? "-translate-x-[calc(100%+16px)]" : "translate-x-[calc(100%+16px)]",
              "transition-[translate] duration-[180ms] ease-[cubic-bezier(0.4,0,1,1)]",
              "group-data-[state=open]/drawer:translate-x-0",
              "group-data-[state=open]/drawer:duration-[260ms] group-data-[state=open]/drawer:ease-[cubic-bezier(0.32,0.72,0,1)]",
              // Reduced motion: no slide, just the backdrop fade and an opacity change.
              "motion-reduce:translate-x-0 motion-reduce:opacity-0 motion-reduce:transition-opacity",
              "motion-reduce:group-data-[state=open]/drawer:opacity-100",
              className
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1.5px]"
              style={{ background: PRISMATIC }}
            />

            {(title || description) && (
              <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6">
                <div className="flex min-w-0 flex-col gap-1.5">
                  {title && (
                    <h2 id={labelId} className="text-base font-semibold tracking-[-0.02em] text-neutral-50">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descId} className="text-sm leading-relaxed text-neutral-400">
                      {description}
                    </p>
                  )}
                </div>
                {dismissible && <CloseSocket onClick={close} className="-mt-1 -mr-1" />}
              </div>
            )}

            {title || description ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-6 text-sm leading-relaxed text-neutral-400">
                {children}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            )}

            {footer && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-black/60 bg-black/25 px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {footer}
              </div>
            )}
          </div>
        </DrawerContext.Provider>
      </dialog>
    </>
  );
}
