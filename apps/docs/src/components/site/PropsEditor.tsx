"use client";
import { useState } from "react";

export interface PropDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "select" | "color";
  label: string;
  defaultValue: unknown;
  required?: boolean;
  placeholder?: string;                        // string only
  min?: number; max?: number; step?: number;   // number only
  options?: { label: string; value: string }[]; // select only
}

interface PropsEditorProps {
  title: string;
  propDefs: PropDefinition[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}

export function PropsEditor({ title, propDefs, values, onChange }: PropsEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!propDefs || propDefs.length === 0) return null;

  return (
    <div className="border border-t-0 border-border-hairline bg-surface-charcoal/30 overflow-hidden flex flex-col">
      {/* Header */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between border-b border-border-hairline bg-surface-charcoal px-4 py-3 text-[10px] font-mono uppercase tracking-wider select-none cursor-pointer hover:bg-neutral-900/60 transition-colors"
      >
        <div className="flex items-center gap-2 text-white font-bold">
          <span className="text-[12px]">⚙</span> PROPS &mdash; {title}
        </div>
        <span className="text-text-muted text-[10px] font-bold">
          {isCollapsed ? "[ SHOW ]" : "[ HIDE ]"}
        </span>
      </div>

      {/* Editor Panel Grid */}
      {!isCollapsed && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20">
          {propDefs.map((def) => {
            const value = values[def.name] ?? def.defaultValue;

            return (
              <div key={def.name} className="flex flex-col gap-2 p-3 bg-surface-charcoal border border-border-hairline rounded-sm">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    {def.label || def.name}
                    {def.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <span className="text-[9px] font-mono text-text-muted/40 font-semibold select-none">
                    {def.type}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {def.type === "string" && (
                    <input
                      type="text"
                      value={(value as string) ?? ""}
                      onChange={(e) => onChange(def.name, e.target.value)}
                      className="w-full bg-black/40 border border-border-hairline px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 focus:bg-black/60 transition-all"
                      placeholder={def.placeholder}
                    />
                  )}

                  {def.type === "number" && (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={def.min ?? 0}
                        max={def.max ?? 100}
                        step={def.step ?? 1}
                        value={(value as number) ?? (def.defaultValue as number) ?? 0}
                        onChange={(e) => onChange(def.name, Number(e.target.value))}
                        className="flex-1 accent-white h-1 appearance-none bg-neutral-800 rounded-full cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                          [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                      />
                      <span className="text-xs font-mono text-text-muted w-10 text-right tabular-nums">
                        {(value as number) ?? 0}
                      </span>
                    </div>
                  )}

                  {def.type === "boolean" && (
                    <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(def.name, e.target.checked)}
                        className="accent-white h-3.5 w-3.5 border border-border-hairline rounded bg-black/40 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-text-muted select-none hover:text-white transition-colors">
                        {(value as boolean) ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </label>
                  )}

                  {def.type === "select" && (
                    <div className="relative w-full">
                      <select
                        value={(value as string) ?? ""}
                        onChange={(e) => onChange(def.name, e.target.value)}
                        className="w-full bg-black/40 border border-border-hairline px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 cursor-pointer appearance-none focus:bg-black/60"
                      >
                        {def.options?.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-neutral-950 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                        <span className="material-symbols-outlined text-[12px]">expand_more</span>
                      </div>
                    </div>
                  )}

                  {def.type === "color" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(value as string) ?? "#000000"}
                        onChange={(e) => onChange(def.name, e.target.value)}
                        className="w-8 h-8 p-0.5 bg-transparent border border-border-hairline rounded cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={(value as string) ?? ""}
                        onChange={(e) => onChange(def.name, e.target.value)}
                        className="flex-1 bg-black/40 border border-border-hairline px-2.5 py-1.5 text-xs font-mono text-white outline-none focus:border-white/40 focus:bg-black/60 transition-all"
                        placeholder="#ffffff"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
