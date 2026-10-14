"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";

// Modal (a window of content) and Dialog (a decision) share one shell built on the native
// <dialog> element: showModal() gives the focus trap, Escape, the top layer, an inert page and
// focus return for free. The shell only adds the material and the enter/exit motion.

const EXIT_MS = 180;
const PRISMATIC =
  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 75%, transparent 100%)";

const DialogContext = createContext<{ close: () => void } | null>(null);

function useOpenState(open: boolean | undefined, defaultOpen: boolean, onOpenChange?: (open: boolean) => void) {
  const [own, setOwn] = useState(defaultOpen);
  const isOpen = open ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setOwn(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  return [isOpen, setOpen] as const;
}

function withTrigger(trigger: ReactElement | undefined, isOpen: boolean, open: () => void) {
  if (!isValidElement<{ onClick?: (event: MouseEvent) => void }>(trigger)) return null;
  return cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    onClick: (event: MouseEvent) => {
      trigger.props.onClick?.(event);
      if (!event.defaultPrevented) open();
    },
  });
}

// ─── Shell ──────────────────────────────────────────────────────────────────

interface ShellProps {
  open: boolean;
  /** Escape, a backdrop click or the close socket. */
  onDismiss: () => void;
  /** Whether a backdrop click closes it. Escape always asks to close. */
  dismissOnBackdrop: boolean;
  role: "dialog" | "alertdialog";
  labelId?: string;
  descId?: string;
  ariaLabel?: string;
  panelClassName: string;
  children: ReactNode;
}

function Shell({
  open,
  onDismiss,
  dismissOnBackdrop,
  role,
  labelId,
  descId,
  ariaLabel,
  panelClassName,
  children,
}: ShellProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<"open" | "closed">("closed");
  const pressedBackdrop = useRef(false);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  // Open: showModal, then flip to "open" a frame later so the entrance transitions.
  // Close: flip to "closed", let the exit play, then close the element.
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

  // Hold the page still while open.
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
    // Escape: keep the element open so the exit can animate, and let the owner decide.
    const onCancel = (event: Event) => {
      event.preventDefault();
      dismissRef.current();
    };
    // Browsers may still force-close on a repeated Escape; keep state in step.
    const onClose = () => {
      if (open) dismissRef.current();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role === "alertdialog" ? "alertdialog" : undefined}
      aria-modal="true"
      aria-labelledby={labelId}
      aria-describedby={descId}
      aria-label={ariaLabel}
      data-state={state}
      // The panel fills the element, so a click whose target is the element itself landed on the backdrop.
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (dismissOnBackdrop && pressedBackdrop.current && event.target === event.currentTarget) onDismiss();
        pressedBackdrop.current = false;
      }}
      className={cn(
        "group/dialog m-auto max-h-none max-w-none overflow-visible border-0 bg-transparent p-0 text-neutral-100 outline-none",
        "backdrop:bg-black/60 backdrop:opacity-0 backdrop:backdrop-blur-[3px]",
        "backdrop:transition-opacity backdrop:duration-[180ms]",
        "data-[state=open]:backdrop:opacity-100 data-[state=open]:backdrop:duration-[260ms]"
      )}
    >
      <DialogContext.Provider value={{ close: onDismiss }}>
        <div
          className={cn(
            "relative flex max-h-[calc(100dvh-48px)] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl",
            "border border-white/[0.08] border-t-white/[0.16] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
            "shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_40px_100px_-20px_rgba(0,0,0,0.9),0_8px_24px_-6px_rgba(0,0,0,0.7)]",
            // Exit (default): quick and accelerating. Entrance: slower and settling.
            "translate-y-2 scale-[0.98] opacity-0 blur-[4px]",
            "transition-[opacity,translate,scale,filter] duration-[180ms] ease-[cubic-bezier(0.4,0,1,1)]",
            "group-data-[state=open]/dialog:translate-y-0 group-data-[state=open]/dialog:scale-100",
            "group-data-[state=open]/dialog:opacity-100 group-data-[state=open]/dialog:blur-[0px]",
            "group-data-[state=open]/dialog:duration-[260ms] group-data-[state=open]/dialog:ease-[cubic-bezier(0.32,0.72,0,1)]",
            "motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-[0px]",
            panelClassName
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1.5px]"
            style={{ background: PRISMATIC }}
          />
          {children}
        </div>
      </DialogContext.Provider>
    </dialog>
  );
}

function Header({
  title,
  description,
  labelId,
  descId,
  inset,
}: {
  title?: ReactNode;
  description?: ReactNode;
  labelId: string;
  descId: string;
  inset?: boolean;
}) {
  if (!title && !description) return null;
  return (
    <div className={cn("flex flex-col gap-1.5 px-6 pt-6", inset && "pr-16")}>
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
  );
}

// The footer sits in a darker tray, separated by a machined cut line.
function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-black/60 bg-black/25 px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 m-auto size-4 animate-spin rounded-full border-[1.5px] border-current border-r-transparent opacity-80 [animation-duration:0.8s]"
    />
  );
}

// ─── DialogButton ───────────────────────────────────────────────────────────

export interface DialogButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary rises out of the surface; secondary is part of it; danger is secondary with a warning edge. */
  tone?: "primary" | "secondary" | "danger";
  /** Close the surrounding Modal or Dialog after the click. */
  close?: boolean;
  /** Keeps the width, swaps the label for a spinner, and blocks clicks. */
  loading?: boolean;
}

const TONES = {
  primary: cn(
    "border border-white/40 bg-[linear-gradient(180deg,#f5f5f5_0%,#d9d9d9_100%)] text-neutral-950",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.6),0_4px_10px_-2px_rgba(0,0,0,0.5)]",
    "hover:brightness-[1.04] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.22),0_1px_1px_rgba(0,0,0,0.5)]"
  ),
  secondary: cn(
    "border border-white/[0.08] border-t-white/[0.16] bg-[linear-gradient(180deg,#202022_0%,#19191b_100%)] text-neutral-200",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.6)]",
    "hover:bg-[linear-gradient(180deg,#252527_0%,#1c1c1e_100%)] hover:text-white",
    "active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.02)]"
  ),
  danger: cn(
    "border border-white/[0.08] border-t-[rgb(229_115_115/0.4)] bg-[linear-gradient(180deg,#202022_0%,#19191b_100%)] text-[rgb(229_115_115)]",
    "shadow-[inset_0_1px_0_rgba(229,115,115,0.12),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_-1px_rgba(0,0,0,0.6)]",
    "hover:bg-[linear-gradient(180deg,#252527_0%,#1c1c1e_100%)] hover:text-[rgb(240_140_140)]",
    "active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.02)]"
  ),
};

export const DialogButton = forwardRef<HTMLButtonElement, DialogButtonProps>(function DialogButton(
  { tone = "secondary", close = false, loading = false, disabled, className, children, onClick, type = "button", ...rest },
  ref
) {
  const dialog = useContext(DialogContext);
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (close && !event.defaultPrevented) dialog?.close();
      }}
      className={cn(
        "relative inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium tracking-tight select-none",
        "transition-[background,box-shadow,color,translate,scale,filter] duration-150",
        "active:translate-y-px active:scale-[0.98] motion-reduce:active:translate-y-0 motion-reduce:active:scale-100",
        "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
        "disabled:cursor-not-allowed disabled:opacity-40",
        loading && "disabled:opacity-100",
        TONES[tone],
        className
      )}
    >
      <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>{children}</span>
      {loading && <Spinner />}
    </button>
  );
});

// ─── Modal ──────────────────────────────────────────────────────────────────

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the modal when clicked, e.g. a DialogButton. */
  trigger?: ReactElement;
  title?: ReactNode;
  description?: ReactNode;
  /** Name for screen readers when there's no title. */
  "aria-label"?: string;
  /** Actions, shown in the footer tray. Give buttons `close` to dismiss on click. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Backdrop click and the close socket. Escape always closes. */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
}

const MODAL_WIDTH = { sm: "max-w-[440px]", md: "max-w-[560px]", lg: "max-w-[720px]" };

/** A window of content: forms, settings, details. */
export function Modal({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  "aria-label": ariaLabel,
  footer,
  size = "md",
  dismissible = true,
  className,
  children,
}: ModalProps) {
  const [isOpen, setOpen] = useOpenState(open, defaultOpen, onOpenChange);
  const labelId = useId();
  const descId = useId();

  return (
    <>
      {withTrigger(trigger, isOpen, () => setOpen(true))}
      <Shell
        open={isOpen}
        onDismiss={() => setOpen(false)}
        dismissOnBackdrop={dismissible}
        role="dialog"
        labelId={title ? labelId : undefined}
        descId={description ? descId : undefined}
        ariaLabel={title ? undefined : ariaLabel}
        panelClassName={cn(MODAL_WIDTH[size], className)}
      >
        <Header title={title} description={description} labelId={labelId} descId={descId} inset={dismissible} />
        {children && (
          <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 text-sm leading-relaxed text-neutral-400", title || description ? "pt-5" : "pt-6", !footer && "pb-6")}>
            {children}
          </div>
        )}
        {footer && <Footer>{footer}</Footer>}
        {!footer && !children && <div className="pb-6" />}

        {/* The close control is a socket cut into the panel, like the Accordion's chevron holder. */}
        {dismissible && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className={cn(
              "absolute top-5 right-5 z-10 grid size-8 cursor-pointer place-items-center rounded-full",
              "border border-white/[0.08] bg-[#0d0d0e] text-neutral-500",
              "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.06)]",
              "transition-colors duration-150 hover:border-white/[0.14] hover:text-neutral-100",
              "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
            )}
          >
            <svg viewBox="0 0 12 12" width="11" height="11" fill="none" aria-hidden="true">
              <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </Shell>
    </>
  );
}

// ─── Dialog ─────────────────────────────────────────────────────────────────

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** An element that opens the dialog when clicked. */
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  /** Shown in a small socket above the title. */
  icon?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** "danger" marks the confirm action as destructive. */
  tone?: "default" | "danger";
  /** Return a promise to keep the dialog open, with a spinner, until it settles. A rejection keeps it open. */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  className?: string;
  /** Extra content between the description and the actions. */
  children?: ReactNode;
}

/** A decision the user has to make before carrying on. No backdrop dismiss; Escape cancels. */
export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  icon,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
  className,
  children,
}: DialogProps) {
  const [isOpen, setOpen] = useOpenState(open, defaultOpen, onOpenChange);
  const [pending, setPending] = useState(false);
  const labelId = useId();
  const descId = useId();

  const cancel = () => {
    if (pending) return;
    onCancel?.();
    setOpen(false);
  };

  const confirm = async () => {
    const result = onConfirm?.();
    if (!(result instanceof Promise)) {
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      await result;
      setOpen(false);
    } catch {
      // Stay open so the user can retry or cancel.
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {withTrigger(trigger, isOpen, () => setOpen(true))}
      <Shell
        open={isOpen}
        onDismiss={cancel}
        dismissOnBackdrop={false}
        role="alertdialog"
        labelId={labelId}
        descId={description ? descId : undefined}
        panelClassName={cn("max-w-[420px]", className)}
      >
        {icon && (
          <div className="px-6 pt-6">
            <span
              aria-hidden="true"
              className={cn(
                "grid size-10 place-items-center rounded-full border border-white/[0.08] bg-[#0d0d0e]",
                "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.06)]",
                tone === "danger" ? "text-[rgb(229_115_115)]" : "text-neutral-300"
              )}
            >
              {icon}
            </span>
          </div>
        )}
        <div className={cn(icon && "-mt-2")}>
          <Header title={title} description={description} labelId={labelId} descId={descId} />
        </div>
        {children && <div className="px-6 pt-4 text-sm leading-relaxed text-neutral-400">{children}</div>}
        <Footer>
          <DialogButton tone="secondary" onClick={cancel} disabled={pending} data-autofocus>
            {cancelLabel}
          </DialogButton>
          <DialogButton tone={tone === "danger" ? "danger" : "primary"} onClick={confirm} loading={pending}>
            {confirmLabel}
          </DialogButton>
        </Footer>
      </Shell>
    </>
  );
}
