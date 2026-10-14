"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/utils";

// Select: pick one value from a short list.
//
// The list doesn't drop from the field; it unfolds out of it. On open, the panel is placed so
// the current choice sits exactly over the field, then it opens from that single line, upward
// and downward at once, like a slot widening, while the other rows settle in from the line,
// nearest first. On choose, it folds back into the chosen row while sliding so that row lands
// exactly on the field: the list collapses into the value it leaves behind. Escape or a click
// outside folds it back into the original choice.
//
// Small companions: the up/down chevrons part by 1.5px while open; a value changed from the
// keyboard while closed rolls a few pixels in the direction it moved; press, drag to an option
// and release picks it, as native menus do. Under reduced motion it only fades.

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Options sharing a group are listed under a quiet heading. */
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Field height: 32, 40 or 48px. Default "md". */
  size?: SelectSize;
  disabled?: boolean;
  invalid?: boolean;
  /** Submits the chosen value with a form. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}

const SIZES = {
  sm: { field: "h-8 rounded-lg pl-2.5 pr-1.5 text-[13px]", row: "h-8 text-[13px]" },
  md: { field: "h-10 rounded-xl pl-3 pr-2 text-sm", row: "h-9 text-sm" },
  lg: { field: "h-12 rounded-xl pl-3.5 pr-2.5 text-[15px]", row: "h-10 text-sm" },
} as const;

const EDGE = 8;
const MAX_HEIGHT = 320;
const OPEN_MS = 300;
const CLOSE_MS = 200;
const EASE_OUT = "cubic-bezier(0.32, 0.72, 0, 1)";
const EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";
const SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

// The highlight sits on the bottom layer and every row's content above it (see the row's
// [&>:not([data-highlight])]:z-[1]). Without that, a highlight gliding downward belongs to the
// lower row, which paints over the row it's leaving and covers that row's text for a moment.
const HIGHLIGHT = cn(
  "absolute inset-0 z-0 rounded-lg border border-white/[0.07] border-t-white/[0.13]",
  "bg-[linear-gradient(180deg,#232325_0%,#1c1c1e_100%)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_0_rgba(0,0,0,0.5),0_4px_10px_-4px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.5)]"
);

/** The clip that shows only one row's band of the panel. */
const band = (panel: HTMLElement, row: HTMLElement) => {
  const top = row.offsetTop - panel.scrollTop;
  const bottom = panel.clientHeight - top - row.offsetHeight;
  return `inset(${Math.max(top, 0)}px 0px ${Math.max(bottom, 0)}px 0px round 10px)`;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    placeholder = "Select…",
    size = "md",
    disabled = false,
    invalid = false,
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
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion() ?? false;
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const openedAt = useRef(0);
  const pointerOpened = useRef(false);
  const typeahead = useRef({ text: "", timer: 0 });
  // Direction of the last keyboard change while closed: the label rolls that way.
  const [roll, setRoll] = useState<{ key: number; dir: 1 | -1 } | null>(null);
  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  const enabledIndex = (from: number, step: 1 | -1) => {
    for (let i = 1; i <= options.length; i++) {
      const next = (from + step * i + options.length * 2) % options.length;
      if (!options[next].disabled) return next;
    }
    return from;
  };

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      if (valueProp === undefined) setOwn(option.value);
      if (option.value !== value) onValueChange?.(option.value);
    },
    [options, value, valueProp, onValueChange]
  );

  // ─── Open: place the panel so the anchor row sits over the field, then unfold from it ───
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger || !open) return;

    if (!panel.matches(":popover-open")) panel.showPopover();
    const anchorIndex = selectedIndex >= 0 ? selectedIndex : Math.max(enabledIndex(-1, 1), 0);
    const row = panel.querySelector<HTMLElement>(`#${CSS.escape(optionId(anchorIndex))}`);
    const t = trigger.getBoundingClientRect();
    const vh = window.innerHeight;

    panel.style.width = `${t.width + 8}px`;
    panel.style.left = `${t.left - 4}px`;
    panel.style.maxHeight = `${Math.min(MAX_HEIGHT, vh - EDGE * 2)}px`;
    panel.scrollTop = 0;

    if (row) {
      // Line the row's label up with the field's label, horizontally and vertically.
      const rowLabel = row.querySelector<HTMLElement>("[data-label]");
      if (rowLabel && labelRef.current) {
        const dx = labelRef.current.getBoundingClientRect().left - rowLabel.getBoundingClientRect().left;
        panel.style.left = `${t.left - 4 + dx}px`;
      }
      const centre = t.top + t.height / 2;
      const rowCentre = row.offsetTop + row.offsetHeight / 2;
      const height = panel.offsetHeight;
      const scrollMax = panel.scrollHeight - panel.clientHeight;
      let scroll = 0;
      let top = centre - rowCentre;
      if (top < EDGE) {
        scroll = Math.min(scrollMax, EDGE - top);
        top = centre - (rowCentre - scroll);
      }
      if (scroll < scrollMax && top + height > vh - EDGE) {
        // Room below is short: scroll the list rather than lift the anchor off the field.
        const extra = Math.min(scrollMax - scroll, top + height - (vh - EDGE));
        scroll += extra;
        top = centre - (rowCentre - scroll);
      }
      top = Math.min(Math.max(top, EDGE), vh - EDGE - height);
      panel.scrollTop = scroll;
      panel.style.top = `${Math.max(top, EDGE)}px`;

      if (!reduceMotion) {
        panel.animate([{ clipPath: band(panel, row) }, { clipPath: "inset(0px 0px 0px 0px round 16px)" }], {
          duration: OPEN_MS,
          easing: EASE_OUT,
        });
        // The other rows settle in from the anchor line, nearest first.
        panel.querySelectorAll<HTMLElement>("[data-row]").forEach((el) => {
          const index = Number(el.dataset.row);
          if (index === anchorIndex) return;
          const distance = Math.abs(index - anchorIndex);
          const from = index < anchorIndex ? 5 : -5;
          el.animate(
            [
              { opacity: 0, transform: `translateY(${from}px)` },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 240, delay: Math.min(distance * 14, 140), easing: EASE_OUT, fill: "backwards" }
          );
        });
      } else {
        panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
      }
    } else {
      panel.style.top = `${t.bottom + EDGE}px`;
    }

    setActive(anchorIndex);
    panel.focus({ preventScroll: true });
    openedAt.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ─── Close: fold back into a row's band (the one chosen, or the original), then hide ───
  const close = useCallback(
    (toIndex: number | null, returnFocus = true) => {
      const panel = panelRef.current;
      if (!panel || closing.current) return;
      const finish = () => {
        closing.current = false;
        if (panel.matches(":popover-open")) panel.hidePopover();
        setOpen(false);
        if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
      };
      const row = toIndex !== null ? panel.querySelector<HTMLElement>(`#${CSS.escape(optionId(toIndex))}`) : null;
      if (!panel.matches(":popover-open")) return finish();
      closing.current = true;
      const animation = reduceMotion
        ? panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, fill: "forwards" })
        : row
          ? (() => {
              // The chosen row may not be the one over the field: slide the panel as it folds, so
              // the band it folds into lands exactly on the field.
              const r = row.getBoundingClientRect();
              const t = triggerRef.current?.getBoundingClientRect();
              const shift = t ? t.top + t.height / 2 - (r.top + r.height / 2) : 0;
              const clip = band(panel, row);
              return panel.animate(
                [
                  { clipPath: "inset(0px 0px 0px 0px round 16px)", transform: "translateY(0px)", opacity: 1 },
                  { clipPath: clip, transform: `translateY(${shift}px)`, opacity: 1, offset: 0.72 },
                  { clipPath: clip, transform: `translateY(${shift}px)`, opacity: 0 },
                ],
                { duration: CLOSE_MS + Math.min(Math.abs(shift) * 0.4, 80), easing: EASE_IN, fill: "forwards" }
              );
            })()
          : panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: "forwards" });
      animation.onfinish = () => {
        finish();
        animation.cancel();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduceMotion]
  );

  const choose = (index: number) => {
    // Release and click both land here for one pick; the first one wins.
    if (closing.current || options[index]?.disabled) return;
    setRoll(null);
    setActive(index);
    commit(index);
    close(index);
  };

  // A click outside, a resize or a page scroll folds it back.
  useEffect(() => {
    if (!open) return;
    const back = () => close(selectedIndex >= 0 ? selectedIndex : null, false);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      back();
    };
    const onScroll = (event: Event) => {
      if (panelRef.current?.contains(event.target as Node)) return;
      back();
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", back);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", back);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, close, selectedIndex]);

  // Keep the active row in view while moving by keyboard.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  const findByTypeahead = (key: string, from: number) => {
    const ahead = typeahead.current;
    window.clearTimeout(ahead.timer);
    ahead.text += key.toLowerCase();
    ahead.timer = window.setTimeout(() => (ahead.text = ""), 500);
    const order = [...options.keys()].map((i) => (from + 1 + i) % options.length);
    // A repeated single letter cycles through matches; a longer prefix stays put if it still matches.
    const repeated = ahead.text.split("").every((c) => c === ahead.text[0]);
    const needle = repeated ? ahead.text[0] : ahead.text;
    const start = repeated ? order : [from, ...order];
    return start.find((i) => !options[i].disabled && options[i].label.toLowerCase().startsWith(needle));
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!open) setOpen(true);
      return;
    }
    // Closed type-ahead changes the value in place, and the label rolls with it.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const match = findByTypeahead(event.key, Math.max(selectedIndex, 0));
      if (match !== undefined && match !== selectedIndex) {
        setRoll({ key: Date.now(), dir: match > selectedIndex ? 1 : -1 });
        commit(match);
      }
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => enabledIndex(i, 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => enabledIndex(i, -1));
        return;
      case "Home":
        event.preventDefault();
        setActive(enabledIndex(-1, 1));
        return;
      case "End":
        event.preventDefault();
        setActive(enabledIndex(options.length, -1));
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close(selectedIndex >= 0 ? selectedIndex : null);
        return;
      case "Tab":
        event.preventDefault();
        close(selectedIndex >= 0 ? selectedIndex : null);
        return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const match = findByTypeahead(event.key, active);
      if (match !== undefined) setActive(match);
    }
  };

  const s = SIZES[size];
  let lastGroup: string | undefined;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${id}` : undefined}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        data-state={open ? "open" : "closed"}
        data-placeholder={selected ? undefined : ""}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0 || event.pointerType !== "mouse") return;
          // Open on press so press-drag-release can pick; the click that follows is ignored.
          event.preventDefault();
          triggerRef.current?.focus({ preventScroll: true });
          pointerOpened.current = true;
          if (open) close(selectedIndex >= 0 ? selectedIndex : null);
          else setOpen(true);
        }}
        onClick={() => {
          if (pointerOpened.current) {
            pointerOpened.current = false;
            return;
          }
          if (!disabled) setOpen((current) => !current);
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "group/select relative flex w-full cursor-pointer items-center gap-2.5 border bg-[#070707] text-left select-none",
          "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
          "transition-[border-color,background-color] duration-150",
          "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1",
          invalid ? "border-[rgb(229_115_115/0.45)]" : open ? "border-white/[0.18] bg-[#050505]" : "border-white/[0.08]",
          !disabled && !invalid && "hover:border-white/[0.13]",
          disabled && "cursor-not-allowed opacity-40",
          s.field,
          className
        )}
      >
        {selected?.icon && (
          <span aria-hidden="true" className="inline-flex shrink-0 text-neutral-300 [&_svg]:size-4">
            {selected.icon}
          </span>
        )}
        <span ref={labelRef} className="relative flex h-full min-w-0 flex-1 items-center overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={roll ? `${value}-${roll.key}` : String(value)}
              initial={roll && !reduceMotion ? { y: roll.dir * 7, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              exit={roll && !reduceMotion ? { y: -roll.dir * 7, opacity: 0 } : { opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className={cn("block truncate tracking-tight", selected ? "text-neutral-100" : "text-neutral-500")}
            >
              {selected?.label ?? placeholder}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* Up/down chevrons that part by a hair while open. */}
        <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center text-neutral-500 transition-colors duration-150 group-hover/select:text-neutral-300">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" className="overflow-visible">
            <path
              d="m5 6 3-3 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
              style={{ transform: open ? "translateY(-1.5px)" : undefined }}
            />
            <path
              d="m5 10 3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
              style={{ transform: open ? "translateY(1.5px)" : undefined }}
            />
          </svg>
        </span>
      </button>
      {name && <input type="hidden" name={name} value={value ?? ""} />}

      {/* The list: Popover material on the top layer. */}
      <div
        ref={panelRef}
        id={listId}
        popover="manual"
        role="listbox"
        tabIndex={-1}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-activedescendant={open ? optionId(active) : undefined}
        onKeyDown={onListKeyDown}
        onPointerUp={(event) => {
          // Press on the field, drag here, release over an option: pick it.
          const row = (event.target as HTMLElement).closest<HTMLElement>("[data-row]");
          if (!row || performance.now() - openedAt.current < 250) return;
          choose(Number(row.dataset.row));
        }}
        className={cn(
          "fixed inset-auto m-0 overflow-y-auto overscroll-contain rounded-2xl p-1 text-neutral-100 outline-none",
          "border border-white/[0.08] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1.5px_0_0_rgba(0,0,0,0.45),0_24px_60px_-16px_rgba(0,0,0,0.9),0_6px_18px_-6px_rgba(0,0,0,0.7)]",
          "[scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]"
        )}
      >
        <LayoutGroup id={listId}>
          {options.map((option, index) => {
            const heading = option.group && option.group !== lastGroup ? option.group : null;
            lastGroup = option.group;
            const isActive = index === active;
            const isSelected = index === selectedIndex;
            return (
              <div key={option.value}>
                {heading && (
                  <div role="presentation" className="px-2.5 pt-2 pb-1 text-xs font-medium text-neutral-500 select-none">
                    {heading}
                  </div>
                )}
                <div
                  id={optionId(index)}
                  role="option"
                  data-row={index}
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  data-highlighted={isActive ? "" : undefined}
                  onPointerMove={() => {
                    if (!isActive && !option.disabled && !closing.current) setActive(index);
                  }}
                  onClick={() => choose(index)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 select-none [&>:not([data-highlight])]:z-[1]",
                    s.row,
                    option.disabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  {isActive && open && (
                    <motion.span
                      aria-hidden="true"
                      data-highlight=""
          layoutId="select-highlight"
                      transition={reduceMotion ? { duration: 0 } : SPRING}
                      className={HIGHLIGHT}
                    />
                  )}
                  {option.icon && (
                    <span
                      aria-hidden="true"
                      className={cn("relative inline-flex shrink-0 [&_svg]:size-4", isActive || isSelected ? "text-neutral-100" : "text-neutral-500")}
                    >
                      {option.icon}
                    </span>
                  )}
                  <span
                    data-label=""
                    className={cn(
                      "relative min-w-0 flex-1 truncate tracking-tight transition-colors duration-150",
                      isActive || isSelected ? "text-neutral-50" : "text-neutral-300"
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span className={cn("relative shrink-0 text-xs", isActive ? "text-neutral-400" : "text-neutral-500")}>{option.description}</span>
                  )}
                  <span aria-hidden="true" className="relative grid size-4 shrink-0 place-items-center text-neutral-100">
                    {isSelected && (
                      <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                        <path d="M2.6 6.3 4.9 8.6 9.4 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </LayoutGroup>
      </div>
    </>
  );
});
