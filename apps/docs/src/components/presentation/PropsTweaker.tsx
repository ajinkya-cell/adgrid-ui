"use client";

import { useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { PropDefinition, RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";

// ── Helpers for Casing ──────────────────────────────────────────
function formatPropLabel(name: string) {
  if (!name) return "";
  if (name.toLowerCase() === "showfps") return "Show FPS";
  
  const words = name
    .replace(/([A-Z]+)/g, " $1")
    .trim()
    .split(/[\s_-]+/);
    
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatOptionLabel(val: string) {
  if (!val) return "";
  return val
    .replace(/([A-Z]+)/g, " $1")
    .trim()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ── Toggle control ──────────────────────────────────────────────
function PropToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full p-0.5 transition-colors duration-200 focus-visible:outline-none cursor-pointer ${checked ? "bg-white" : "bg-white/12"}`}
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
      <span className="w-12 text-right font-sans text-[11.5px] font-medium tabular-nums text-white/55">{value}</span>
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
      className="w-full rounded-lg border border-white/5 bg-[#050505] px-2.5 py-2 font-sans text-[12px] text-white/80 placeholder-white/25 outline-none transition-colors focus:border-white/20 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)]"
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
            className={`rounded-lg border px-2.5 py-1.5 font-sans text-[11px] transition-colors cursor-pointer ${
              value === opt
                ? "border-white/35 bg-white text-black shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                : "border-white/5 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
            }`}
          >
            {formatOptionLabel(opt)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg border px-2.5 py-1.5 font-sans text-[11px] transition-colors cursor-pointer ${
            value === opt
              ? "border-white/35 bg-white text-black shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
              : "border-white/5 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
          }`}
        >
          {formatOptionLabel(opt)}
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
      <span className="font-sans text-[11px] text-white/45">{value}</span>
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
    <div className="bg-[#090909] border border-white/[0.04] rounded-xl p-3.5 space-y-2.5 transition-all hover:border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-[12px] font-semibold text-white/85">{formatPropLabel(def.name)}</span>
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
  const dragControls = useDragControls();
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
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragControls={dragControls}
      dragListener={false}
      className="tweaker-font-inter fixed bottom-4 left-4 z-50 w-[min(320px,calc(100vw-2rem))] rounded-2xl border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 backdrop-blur-2xl select-none"
      style={{
        backgroundColor: "#171717",
        boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px rgba(0,0,0,0.6)"
      }}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .tweaker-font-inter, .tweaker-font-inter * {
          font-family: var(--font-inter), sans-serif !important;
        }
      `}} />
      {/* Header */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center gap-2 px-3.5 py-3 cursor-grab active:cursor-grabbing border-b border-white/[0.06]"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-white/40 pointer-events-none" strokeWidth={2.5} />
        <span className="flex-1 text-[12.5px] font-bold text-white/80 pointer-events-none">Component Properties</span>
        <button
          type="button"
          onClick={handleReset}
          title="Reset to defaults"
          className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/8 hover:text-white/70 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/8 hover:text-white/70 cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
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
            <div className="max-h-[60vh] space-y-3.5 overflow-y-auto px-3.5 pb-3.5 pt-3.5 present-scroll">
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
