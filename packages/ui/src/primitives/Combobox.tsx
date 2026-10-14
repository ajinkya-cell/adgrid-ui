"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";
import { rankMatches } from "./search";

// An input that filters a list as you type. The field is a well; the list opens on the browser's
// top layer (the native `popover` attribute), so no overflow or z-index can clip it, anchored 8px
// under the field and flipped above it when there's no room. The highlighted option is a raised
// segment that glides between rows (CommandPalette's); the chosen one carries a check. Focus never
// leaves the input.

export type ComboboxSize = "sm" | "md" | "lg";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Extra words the filter matches but doesn't show. */
  keywords?: string[];
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: ReactNode;
  /** Field height: 32, 40 or 48px. */
  size?: ComboboxSize;
  disabled?: boolean;
  invalid?: boolean;
  /** Shows a clear button while something is chosen. */
  clearable?: boolean;
  /** Submits the chosen value with a form. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

const SIZES = {
  sm: { field: "h-8 text-[13px]", lead: "pl-2.5", row: "h-8 text-[13px]", socket: "size-5 rounded-[5px] [&_svg]:size-3" },
  md: { field: "h-10 text-sm", lead: "pl-3", row: "h-9 text-sm", socket: "size-6 rounded-md [&_svg]:size-3.5" },
  lg: { field: "h-12 text-[15px]", lead: "pl-3.5", row: "h-10 text-sm", socket: "size-7 rounded-md [&_svg]:size-4" },
} as const;

const HIGHLIGHT = cn(
  "absolute inset-0 rounded-lg border border-white/[0.07] border-t-white/[0.13]",
  "bg-[linear-gradient(180deg,#1f1f21_0%,#18181a_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_6px_14px_-6px_rgba(0,0,0,0.8),0_1px_3px_rgba(0,0,0,0.5)]"
);
const SOCKET =
  "relative grid shrink-0 place-items-center border border-white/[0.06] bg-[#070707] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)] transition-colors duration-150";

const SEARCH_GLYPH = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="m10.25 10.25 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;
const GAP = 8;
const MAX_LIST = 288;

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    placeholder = "Search…",
    emptyText = "No matches",
    size = "md",
    disabled = false,
    invalid = false,
    clearable = true,
    name,
    id: idProp,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    className,
  },
  ref
) {
  const [own, setOwn] = useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : own;
  const selected = options.find((option) => option.value === value) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placement, setPlacement] = useState<"below" | "above">("below");

  const reduceMotion = useReducedMotion() ?? false;
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-listbox`;
  const optionId = (value: string) => `${id}-option-${value.replace(/[^\w-]/g, "_")}`;

  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollOnChange = useRef(false);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // While typing, the field shows the query; otherwise it shows the chosen label.
  const results = useMemo(
    () =>
      typing
        ? rankMatches(options, query, (o) => o.label, (o) => [o.label, o.description, ...(o.keywords ?? [])].join(" "))
        : options,
    [options, query, typing]
  );
  const enabled = results.filter((option) => !option.disabled);
  const active = enabled.length ? enabled[Math.min(activeIndex, enabled.length - 1)] : undefined;

  const commit = (next: string | null) => {
    if (valueProp === undefined) setOwn(next);
    if (next !== value) onValueChange?.(next);
  };

  const openList = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled]);

  const closeList = useCallback(() => {
    setOpen(false);
    setTyping(false);
    setQuery("");
  }, []);

  const choose = (option: ComboboxOption) => {
    if (option.disabled) return;
    commit(option.value);
    closeList();
  };

  // On open, start the highlight on the chosen option (or the first).
  useEffect(() => {
    if (!open) return;
    const index = selected ? enabled.findIndex((option) => option.value === selected.value) : 0;
    setActiveIndex(Math.max(index, 0));
    scrollOnChange.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (typing) setActiveIndex(0);
  }, [query, typing]);

  // Place the list on the top layer, under (or over) the field, and keep it there.
  useLayoutEffect(() => {
    const list = listRef.current;
    const field = fieldRef.current;
    if (!list || !field) return;
    if (!open) {
      if (list.matches(":popover-open")) list.hidePopover();
      return;
    }

    const place = () => {
      const rect = field.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom - GAP;
      const above = rect.top - GAP;
      const flip = below < Math.min(MAX_LIST, list.scrollHeight) && above > below;
      setPlacement(flip ? "above" : "below");
      list.style.left = `${rect.left}px`;
      list.style.width = `${rect.width}px`;
      list.style.maxHeight = `${Math.max(Math.min(MAX_LIST, flip ? above : below) - GAP, 120)}px`;
      if (flip) {
        list.style.top = "auto";
        list.style.bottom = `${window.innerHeight - rect.top + GAP}px`;
      } else {
        list.style.bottom = "auto";
        list.style.top = `${rect.bottom + GAP}px`;
      }
    };

    if (!list.matches(":popover-open")) list.showPopover();
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  // Close when the pointer goes down anywhere outside the field and the list.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (fieldRef.current?.contains(target) || listRef.current?.contains(target)) return;
      closeList();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, closeList]);

  useEffect(() => {
    if (!scrollOnChange.current || !active || !open) return;
    scrollOnChange.current = false;
    document.getElementById(optionId(active.value))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  const move = (next: number) => {
    if (!enabled.length) return;
    scrollOnChange.current = true;
    setActiveIndex((next + enabled.length) % enabled.length);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const current = Math.min(activeIndex, enabled.length - 1);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openList();
        else move(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openList();
        else move(current - 1);
        break;
      case "Home":
        if (open && !typing) {
          event.preventDefault();
          move(0);
        }
        break;
      case "End":
        if (open && !typing) {
          event.preventDefault();
          move(enabled.length - 1);
        }
        break;
      case "Enter":
        if (open && active) {
          event.preventDefault();
          choose(active);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          closeList();
        } else if (clearable && value) {
          event.preventDefault();
          commit(null);
        }
        break;
      case "Tab":
        if (open) closeList();
        break;
    }
  };

  const s = SIZES[size];

  return (
    <div
      ref={fieldRef}
      data-state={open ? "open" : "closed"}
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      className={cn(
        "group/combo relative flex w-full items-center rounded-xl border bg-[#070707] pr-1",
        "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
        "transition-[border-color,background-color] duration-150",
        invalid ? "border-[rgb(229_115_115/0.45)]" : "border-white/[0.08]",
        !disabled && !invalid && "hover:border-white/[0.13]",
        // Focus: the edge brightens and the well darkens a step. No glow.
        !invalid && "has-[input:focus-visible]:border-white/[0.18]",
        "has-[input:focus]:bg-[#050505]",
        disabled && "cursor-not-allowed opacity-40",
        className
      )}
    >
      {/* Leading glyph: the chosen option's icon, or a search glyph while empty or typing. */}
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 transition-colors duration-150 [&_svg]:size-4",
          s.lead,
          selected?.icon && !typing ? "text-neutral-300" : "text-neutral-500 group-has-[input:focus]/combo:text-neutral-400"
        )}
      >
        {selected?.icon && !typing ? selected.icon : SEARCH_GLYPH}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active ? optionId(active.value) : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        value={typing ? query : selected?.label ?? ""}
        onChange={(event) => {
          setTyping(true);
          setQuery(event.target.value);
          openList();
        }}
        onClick={openList}
        onKeyDown={onKeyDown}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500",
          "disabled:cursor-not-allowed",
          s.field,
          "pl-2.5"
        )}
      />
      {name && <input type="hidden" name={name} value={value ?? ""} />}

      {clearable && value && !disabled && (
        <button
          type="button"
          aria-label="Clear"
          tabIndex={-1}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            commit(null);
            inputRef.current?.focus();
          }}
          className={cn(
            "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-neutral-500 transition-[color,opacity] duration-150 hover:text-neutral-100",
            "opacity-0 group-hover/combo:opacity-100 group-has-[input:focus]/combo:opacity-100"
          )}
        >
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
            <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Up-down chevrons: the list opens either way. */}
      <button
        type="button"
        aria-label={open ? "Close options" : "Show options"}
        tabIndex={-1}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (open) closeList();
          else openList();
          inputRef.current?.focus();
        }}
        className={cn(
          "grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-neutral-500",
          "transition-colors duration-150 hover:text-neutral-200 disabled:cursor-not-allowed",
          open && "text-neutral-300"
        )}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <path d="m5 6 3-3 3 3M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* The list: Popover material on the top layer. */}
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        popover="manual"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-placement={placement}
        onMouseDown={(event) => event.preventDefault()}
        className={cn(
          "fixed m-0 overflow-y-auto overscroll-contain rounded-xl p-1 text-neutral-100",
          "border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_24px_60px_-16px_rgba(0,0,0,0.9),0_6px_18px_-6px_rgba(0,0,0,0.7)]",
          "[scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]",
          // Entrance from the anchor side: scale 0.97 → 1 and fade, 160ms.
          "transition-[opacity,scale] duration-[160ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-opacity",
          "starting:scale-[0.97] starting:opacity-0",
          placement === "below" ? "origin-top" : "origin-bottom"
        )}
      >
        {results.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-3 py-5 text-[13px] text-neutral-500 [&_svg]:size-3.5">
            {SEARCH_GLYPH}
            {emptyText}
          </div>
        ) : (
          <LayoutGroup id={id}>
            {results.map((option) => {
              const isActive = option === active;
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  id={optionId(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  data-highlighted={isActive ? "" : undefined}
                  onPointerMove={() => {
                    if (!isActive && !option.disabled) setActiveIndex(enabled.indexOf(option));
                  }}
                  onClick={() => choose(option)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-2.5 rounded-lg pr-2 pl-1.5 select-none",
                    s.row,
                    option.disabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  {/* The highlight: one raised segment that glides from row to row. */}
                  {isActive && (
                    <motion.span
                      aria-hidden="true"
                      layoutId="combobox-highlight"
                      transition={reduceMotion ? { duration: 0 } : SPRING}
                      className={HIGHLIGHT}
                    />
                  )}
                  {option.icon && (
                    <span
                      aria-hidden="true"
                      className={cn(SOCKET, s.socket, isActive || isSelected ? "text-neutral-100" : "text-neutral-500")}
                    >
                      {option.icon}
                    </span>
                  )}
                  <span
                    className={cn(
                      "relative min-w-0 flex-1 truncate font-medium tracking-tight transition-colors duration-150",
                      !option.icon && "pl-1",
                      isActive ? "text-neutral-50" : isSelected ? "text-neutral-100" : "text-neutral-300"
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span
                      className={cn(
                        "relative shrink-0 text-xs transition-colors duration-150",
                        isActive ? "text-neutral-400" : "text-neutral-500"
                      )}
                    >
                      {option.description}
                    </span>
                  )}
                  {/* A fixed slot, so descriptions line up whether or not the row is chosen. */}
                  <span aria-hidden="true" className="relative grid size-4 shrink-0 place-items-center text-neutral-100">
                    {isSelected && (
                      <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                        <path d="M2.6 6.3 4.9 8.6 9.4 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </div>
              );
            })}
          </LayoutGroup>
        )}
      </div>
    </div>
  );
});
