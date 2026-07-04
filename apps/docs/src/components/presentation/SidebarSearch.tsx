"use client";

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
    <label className="block">
      <span className="sr-only">Search components</span>
      <input
        id="presentation-sidebar-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search components, categories, recent..."
        className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/25"
      />
    </label>
  );
}

