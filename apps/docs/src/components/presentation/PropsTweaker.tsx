"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { PropDefinition, RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";

// ── Toggle control ──────────────────────────────────────────────
function PropToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none ${checked ? "bg-white" : "bg-white/12"}`}
    >
      <span
        className={`block h-4 w-4 rounded-full transition-transform duration-200 ${checked ? "translate-x-4 bg-black" : "translate-x-0 bg-white/45"}`}
      />
    </button>
  );
}

// ── Slider control ──────────────────────────────────────────────
function PropSlider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/12 accent-white"
      />
      <span className="w-12 text-right font-mono text-[10px] tabular-nums text-white/55">{value}</span>
    </div>
  );
}

// ── Text input control ──────────────────────────────────────────
function PropTextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[10px] text-white/80 placeholder-white/25 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.07]"
    />
  );
}

// ── Select pill group control ────────────────────────────────────
function PropSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  // Inline pills for ≤4 options, scrollable list for more
  if (options.length <= 4) {
    return (
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-lg border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
              value === opt
                ? "border-white/35 bg-white text-black"
                : "border-white/10 bg-white/[0.035] text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
            value === opt
              ? "border-white/35 bg-white text-black"
              : "border-white/10 bg-white/[0.035] text-white/55 hover:border-white/20 hover:text-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Color swatch control ─────────────────────────────────────────
function PropColor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded border border-white/20">
        <span className="absolute inset-0 rounded" style={{ background: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <span className="font-mono text-[10px] text-white/45">{value}</span>
    </div>
  );
}

// ── Single prop row ──────────────────────────────────────────────
function PropRow({
  def,
  value,
  onChange,
}: {
  def: PropDefinition;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const resolvedValue = value ?? def.default;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{def.name}</span>
        {def.type === "boolean" && (
          <PropToggle
            checked={Boolean(resolvedValue)}
            onChange={onChange}
          />
        )}
      </div>
      {def.type === "number" && (
        <PropSlider
          value={Number(resolvedValue ?? def.min ?? 0)}
          min={def.min ?? 0}
          max={def.max ?? 100}
          step={def.step ?? 1}
          onChange={onChange}
        />
      )}
      {def.type === "string" && (
        <PropTextInput value={String(resolvedValue ?? "")} onChange={onChange} />
      )}
      {def.type === "select" && (
        <PropSelect
          value={String(resolvedValue ?? def.options?.[0] ?? "")}
          options={def.options ?? []}
          onChange={onChange}
        />
      )}
      {def.type === "color" && (
        <PropColor value={String(resolvedValue ?? "#ffffff")} onChange={onChange} />
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export function PropsTweaker({ entry }: { entry: RegistryEntry }) {
  const propDefs = entry.propDefs;
  const propsTweakerOpen = usePresentationStore((s) => s.propsTweakerOpen);
  const componentProps = usePresentationStore((s) => s.componentProps);
  const setComponentProp = usePresentationStore((s) => s.setComponentProp);
  const resetComponentProps = usePresentationStore((s) => s.resetComponentProps);

  const [isExpanded, setIsExpanded] = useState(true);

  // Don't render if no propDefs
  if (!propDefs || propDefs.length === 0) return null;

  const liveProps = componentProps[entry.slug] ?? {};

  const defaults: Record<string, unknown> = {};
  for (const def of propDefs) {
    if (def.default !== undefined) defaults[def.name] = def.default;
  }

  const handleReset = () => {
    resetComponentProps(entry.slug, defaults);
  };

  if (!propsTweakerOpen) return null;

  return (
    <motion.div
      className="fixed bottom-4 left-4 z-50 w-[min(288px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-neutral-950/90 shadow-[0_20px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 py-3">
        <SlidersHorizontal className="h-3 w-3 text-white/40" strokeWidth={2.5} />
        <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Props</span>
        <button
          type="button"
          onClick={handleReset}
          title="Reset to defaults"
          className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/8 hover:text-white/70"
        >
          <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/8 hover:text-white/70"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
          ) : (
            <ChevronUp className="h-3 w-3" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="props-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-3.5 pb-3.5 scrollbar-thin">
              <div className="h-px bg-white/[0.06]" />
              {propDefs.map((def) => (
                <PropRow
                  key={def.name}
                  def={def}
                  value={liveProps[def.name]}
                  onChange={(v) => setComponentProp(entry.slug, def.name, v)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
