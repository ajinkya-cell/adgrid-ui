"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import { FG, LINE, MUTED, SUBTLE } from "../parts";

export interface SearchItem {
  id: string;
  label: string;
  group: string;
  icon: ReactNode;
  keywords?: string[];
  /** Either a link to open or an action to run. */
  url?: string;
  onSelect?: () => void;
}

/** ⌘K search: a native modal <dialog> with a filter box and a keyboard-driven list. */
export function SearchDialog({ open, onClose, items }: { open: boolean; onClose: () => void; items: SearchItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      setActive(0);
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => [item.label, item.group, ...(item.keywords ?? [])].some((v) => v.toLowerCase().includes(q)));
  }, [items, query]);

  const run = (item: SearchItem | undefined) => {
    if (!item) return;
    onClose();
    if (item.onSelect) item.onSelect();
    else if (item.url) {
      if (/^https?:\/\//.test(item.url)) window.open(item.url, "_blank", "noopener");
      else window.location.href = item.url;
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  let lastGroup = "";
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      aria-label="Search"
      className={cn(
        "m-auto mt-[12vh] w-[min(560px,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-[var(--pf-bg)] p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px]",
        LINE
      )}
    >
      <div className={cn("flex items-center gap-2 border-b px-3", LINE)}>
        <Search className={cn("size-4 shrink-0", SUBTLE)} aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => (results.length ? (i + 1) % results.length : 0));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              run(results[active]);
            }
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
          placeholder="Type to search…"
          className={cn("h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--pf-subtle)]", FG)}
        />
        <kbd className={cn("pf-mono rounded border bg-[var(--pf-panel)] px-1.5 text-[11px]", LINE, SUBTLE)}>Esc</kbd>
      </div>

      <ul id={listId} role="listbox" className="max-h-[50vh] overflow-y-auto p-1.5">
        {results.map((item, index) => {
          const header = item.group !== lastGroup;
          lastGroup = item.group;
          return (
            <li key={item.id} role="presentation">
              {header && <p className={cn("pf-mono px-2 pb-1 pt-2.5 text-[11px]", SUBTLE)}>{item.group}</p>}
              <div
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseMove={() => setActive(index)}
                onClick={() => run(item)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm [&_svg]:size-4",
                  index === active ? cn("bg-[var(--pf-panel)]", FG) : MUTED
                )}
              >
                {item.icon}
                <span className="flex-1 truncate">{item.label}</span>
                {index === active && <CornerDownLeft className={SUBTLE} aria-hidden="true" />}
              </div>
            </li>
          );
        })}
        {results.length === 0 && <li className={cn("px-2 py-8 text-center text-sm", MUTED)}>No results for “{query}”.</li>}
      </ul>
    </dialog>
  );
}
