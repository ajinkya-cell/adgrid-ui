"use client";

import { Search } from "lucide-react";

export function SidebarSearch({
  value,
  onChange,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={[
        "flex h-9 w-full items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#070707] px-3",
        "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
        "transition-[border-color,background-color] duration-150 hover:border-white/[0.13]",
        "has-[input:focus]:border-white/[0.18] has-[input:focus]:bg-[#050505]",
      ].join(" ")}
    >
      <span className="sr-only">Search components</span>
      <Search aria-hidden="true" className="size-3.5 shrink-0 text-neutral-500" />
      <input
        id="presentation-sidebar-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search components"
        autoComplete="off"
        spellCheck={false}
        className="h-full min-w-0 flex-1 bg-transparent font-inter text-[13px] tracking-tight text-neutral-100 outline-none placeholder:text-neutral-500"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange("")}
          className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-md text-neutral-500 transition-colors duration-150 hover:text-neutral-100"
        >
          <svg viewBox="0 0 12 12" width="9" height="9" fill="none" aria-hidden="true">
            <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </label>
  );
}
