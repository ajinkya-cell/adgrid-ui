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
        placeholder="Search components..."
        className="h-11 w-full rounded-xl border border-white/[0.05] bg-[#050505] px-3 font-mono text-[11px] text-white outline-none transition-all placeholder:text-white/20 shadow-[inset_0_2.5px_5px_rgba(0,0,0,0.85)] focus:border-white/15 focus:shadow-[inset_0_2.5px_5px_rgba(0,0,0,0.95),0_0_10px_rgba(167, 139, 250, 0.03)]"
      />
    </label>
  );
}
