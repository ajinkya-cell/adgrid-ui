"use client";

import { useState } from "react";
import {
  Roughly,
  RoughCircle,
  RoughUnderline,
  RoughStrike,
  RoughCross,
  RoughBracket,
  RoughHighlight,
  RoughBox,
  RoughArrow,
} from "@adgrid-ui/ui";
import type {
  RoughlyType,
  BracketSide,
  BracketStyle,
  UnderlineVariant,
  StrikeVariant,
  CrossVariant,
  BoxVariant,
  ArrowPlacement,
  ArrowVariant,
  ArrowheadStyle,
} from "@adgrid-ui/ui";
import { Check, Copy, RefreshCw, Sparkles, Terminal, BookOpen, Layers } from "lucide-react";

export default function RoughlyPage() {
  // Playground State
  const [text, setText] = useState("Interfaces with visceral depth");
  const [selectedType, setSelectedType] = useState<RoughlyType>("underline");
  const [selectedColor, setSelectedColor] = useState("#6366F1");
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [duration, setDuration] = useState(750);
  const [bracketSide, setBracketSide] = useState<BracketSide>("left");
  const [bracketStyle, setBracketStyle] = useState<BracketStyle>("curly");
  const [underlineVariant, setUnderlineVariant] = useState<UnderlineVariant>("single");
  const [strikeVariant, setStrikeVariant] = useState<StrikeVariant>("single");
  const [crossVariant, setCrossVariant] = useState<CrossVariant>("single");
  const [boxVariant, setBoxVariant] = useState<BoxVariant>("double");
  const [boxPaddingX, setBoxPaddingX] = useState(8);
  const [boxPaddingY, setBoxPaddingY] = useState(4);
  const [arrowPlacement, setArrowPlacement] = useState<ArrowPlacement>("top-right");
  const [arrowVariant, setArrowVariant] = useState<ArrowVariant>("curved");
  const [arrowheadStyle, setArrowheadStyle] = useState<ArrowheadStyle>("open");
  const [arrowIterations, setArrowIterations] = useState<number>(2);
  const [arrowLabel, setArrowLabel] = useState<string>("Instant deploy ⚡");
  const [arrowDistance, setArrowDistance] = useState<number>(65);
  const [arrowOffset, setArrowOffset] = useState<number>(8);
  const [arrowFlip, setArrowFlip] = useState<boolean>(false);
  const [circlePaddingX, setCirclePaddingX] = useState(22);
  const [circlePaddingY, setCirclePaddingY] = useState(10);
  const [circleIterations, setCircleIterations] = useState(2);
  const [highlightIterations, setHighlightIterations] = useState(2);
  const [canvasTheme, setCanvasTheme] = useState<"dark" | "paper" | "light">("dark");
  const [fontSize, setFontSize] = useState<"text-base" | "text-2xl" | "text-4xl" | "text-6xl">("text-2xl");
  const [fontWeight, setFontWeight] = useState<"font-normal" | "font-semibold" | "font-bold">("font-semibold");
  const [replayKey, setReplayKey] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  const typePresets: { id: RoughlyType; label: string }[] = [
    { id: "underline", label: "Underline" },
    { id: "circle", label: "Circle" },
    { id: "strike-through", label: "Strike-Through" },
    { id: "cross-off", label: "Cross-Off (X)" },
    { id: "bracket", label: "Bracket { }" },
    { id: "box", label: "Box Frame" },
    { id: "highlight", label: "Highlight" },
    { id: "arrow", label: "Arrow Callout ➔" },
  ];

  const colorPresets = [
    { name: "Indigo", hex: "#6366F1" },
    { name: "Royal", hex: "#4338CA" },
    { name: "Rose", hex: "#F43F5E" },
    { name: "Amber", hex: "#F59E0B" },
    { name: "Emerald", hex: "#10B981" },
    { name: "Violet", hex: "#8B5CF6" },
    { name: "Cyan", hex: "#06B6D4" },
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
  ];

  const triggerReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  // Generate code snippet based on active props
  const generateSnippet = () => {
    if (selectedType === "circle") {
      const propsList: string[] = [];
      if (selectedColor !== "#6366F1") propsList.push(`color="${selectedColor}"`);
      if (strokeWidth !== 2) propsList.push(`strokeWidth={${strokeWidth}}`);
      if (circlePaddingX !== 22) propsList.push(`paddingX={${circlePaddingX}}`);
      if (circlePaddingY !== 10) propsList.push(`paddingY={${circlePaddingY}}`);
      if (duration !== 750) propsList.push(`animationDuration={${duration}}`);
      if (circleIterations !== 2) propsList.push(`iterations={${circleIterations}}`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      return `<RoughCircle${propsString}>\n  ${text}\n</RoughCircle>`;
    }

    if (selectedType === "underline") {
      const propsList: string[] = [];
      if (selectedColor !== "#6366F1") propsList.push(`color="${selectedColor}"`);
      if (strokeWidth !== 2) propsList.push(`strokeWidth={${strokeWidth}}`);
      if (duration !== 750) propsList.push(`animationDuration={${duration}}`);
      if (underlineVariant !== "single") propsList.push(`variant="${underlineVariant}"`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      return `<RoughUnderline${propsString}>\n  ${text}\n</RoughUnderline>`;
    }

    if (selectedType === "strike-through") {
      const propsList: string[] = [];
      if (selectedColor !== "#EF4444") propsList.push(`color="${selectedColor}"`);
      if (strokeWidth !== 2) propsList.push(`strokeWidth={${strokeWidth}}`);
      if (duration !== 650) propsList.push(`animationDuration={${duration}}`);
      if (strikeVariant !== "single") propsList.push(`variant="${strikeVariant}"`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      return `<RoughStrike${propsString}>\n  ${text}\n</RoughStrike>`;
    }

    if (selectedType === "cross-off") {
      const propsList: string[] = [];
      if (selectedColor !== "#F43F5E") propsList.push(`color="${selectedColor}"`);
      if (strokeWidth !== 2) propsList.push(`strokeWidth={${strokeWidth}}`);
      if (duration !== 700) propsList.push(`animationDuration={${duration}}`);
      if (crossVariant !== "single") propsList.push(`variant="${crossVariant}"`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      return `<RoughCross${propsString}>\n  ${text}\n</RoughCross>`;
    }

    if (selectedType === "bracket") {
      const propsList: string[] = [];
      if (selectedColor !== "#F59E0B") propsList.push(`color="${selectedColor}"`);
      if (strokeWidth !== 2) propsList.push(`strokeWidth={${strokeWidth}}`);
      if (duration !== 750) propsList.push(`animationDuration={${duration}}`);
      if (bracketSide !== "left") propsList.push(`side="${bracketSide}"`);
      if (bracketStyle !== "curly") propsList.push(`bracketStyle="${bracketStyle}"`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      const indentedText = text
        .split("\n")
        .map((l) => `    <p>${l}</p>`)
        .join("\n");
      return `<RoughBracket${propsString}>\n  <div className="space-y-1">\n${indentedText}\n  </div>\n</RoughBracket>`;
    }

    if (selectedType === "highlight") {
      const propsList: string[] = [];
      if (selectedColor !== "#4338CA") propsList.push(`color="${selectedColor}"`);
      if (duration !== 800) propsList.push(`animationDuration={${duration}}`);
      if (highlightIterations !== 2) propsList.push(`iterations={${highlightIterations}}`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      return `<RoughHighlight${propsString}>\n  ${text}\n</RoughHighlight>`;
    }

    if (selectedType === "box") {
      const propsList: string[] = [];
      if (selectedColor !== "#10B981") propsList.push(`color="${selectedColor}"`);
      if (strokeWidth !== 2.5) propsList.push(`strokeWidth={${strokeWidth}}`);
      if (boxPaddingX !== 8) propsList.push(`paddingX={${boxPaddingX}}`);
      if (boxPaddingY !== 4) propsList.push(`paddingY={${boxPaddingY}}`);
      if (duration !== 750) propsList.push(`animationDuration={${duration}}`);
      if (boxVariant !== "double") propsList.push(`variant="${boxVariant}"`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      return `<RoughBox${propsString}>\n  ${text}\n</RoughBox>`;
    }

    if (selectedType === "arrow") {
      const propsList: string[] = [];
      if (arrowPlacement !== "top-right") propsList.push(`placement="${arrowPlacement}"`);
      if (arrowVariant !== "curved") propsList.push(`variant="${arrowVariant}"`);
      if (arrowheadStyle !== "open") propsList.push(`arrowhead="${arrowheadStyle}"`);
      if (selectedColor !== "#F59E0B") propsList.push(`color="${selectedColor}"`);
      if (strokeWidth !== 2) propsList.push(`strokeWidth={${strokeWidth}}`);
      if (arrowIterations !== 2) propsList.push(`iterations={${arrowIterations}}`);
      if (arrowDistance !== 65) propsList.push(`distance={${arrowDistance}}`);
      if (arrowOffset !== 8) propsList.push(`offset={${arrowOffset}}`);
      if (arrowFlip) propsList.push(`flipCurve={true}`);
      if (duration !== 800) propsList.push(`animationDuration={${duration}}`);
      if (arrowLabel) propsList.push(`label="${arrowLabel}"`);

      const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
      return `<RoughArrow${propsString}>\n  ${text}\n</RoughArrow>`;
    }

    const propsList: string[] = [];
    if (selectedColor !== "#6366F1") propsList.push(`color="${selectedColor}"`);
    if (strokeWidth !== 2) propsList.push(`strokeWidth={${strokeWidth}}`);

    const propsString = propsList.length > 0 ? ` ${propsList.join(" ")}` : "";
    return `<Roughly${propsString}>\n  ${text}\n</Roughly>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText("pnpm add @adgrid-ui/ui");
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-neutral-300 pt-24 sm:pt-32 pb-24 px-4 sm:px-8 flex justify-center selection:bg-white selection:text-black">
      <div className="w-full max-w-[960px] space-y-16 sm:space-y-20">
        {/* ── 1. Hero Header ───────────────────────────────────── */}
        <section className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Standalone Extension Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-sans">
            <Roughly type="circle" color="#6366F1" strokeWidth={2.5}>
              Roughly
            </Roughly>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
            Organic, hand-drawn vector annotations designed for high-friction digital typography. Wobbly underlines, pen circles, editorial strikethroughs, curly brackets, and tactile highlights.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-neutral-300">
              <Terminal className="w-3.5 h-3.5 text-neutral-500" />
              <span>pnpm add @adgrid-ui/ui</span>
            </div>
            <button
              onClick={handleCopyInstall}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-mono text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedInstall ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ── 2. Interactive Studio Playground ────────────────── */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                Interactive Playground
              </h2>
            </div>
            <button
              onClick={triggerReplay}
              className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Replay Draw</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Controls Panel */}
            <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-[#111114] border border-white/[0.08]">
              {/* Type Switcher */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                  Annotation Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {typePresets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedType(t.id);
                        if (t.id === "bracket") {
                          if (!text.includes("\n")) {
                            setText(
                              "Zero layout shift on page reloads\nSized to encompass tall ascenders\nHardware-accelerated SVG draw stroke"
                            );
                          }
                          setSelectedColor("#F59E0B");
                        } else {
                          if (text.includes("\n")) {
                            setText("Interfaces with visceral depth");
                          }
                          if (t.id === "circle") setSelectedColor("#EC4899");
                          else if (t.id === "underline") setSelectedColor("#6366F1");
                          else if (t.id === "strike-through") setSelectedColor("#EF4444");
                          else if (t.id === "cross-off") setSelectedColor("#F43F5E");
                          else if (t.id === "box") setSelectedColor("#10B981");
                          else if (t.id === "highlight") setSelectedColor("#4338CA");
                          else if (t.id === "arrow") setSelectedColor("#F59E0B");
                        }
                      }}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all text-center cursor-pointer ${
                        selectedType === t.id
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white/[0.03] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Text & Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                    Sample Text {selectedType === "bracket" && "(Multiline)"}
                  </label>
                  {selectedType === "bracket" ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setText(
                            "Dynamic multiline bracket\nSmooth single stroke animation"
                          )
                        }
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        2 Lines
                      </button>
                      <button
                        onClick={() =>
                          setText(
                            "Zero layout shift on page reloads\nSized to encompass tall ascenders\nHardware-accelerated SVG draw stroke"
                          )
                        }
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        3 Lines
                      </button>
                      <button
                        onClick={() =>
                          setText(
                            "const theme = 'void';\nconst fluid = true;\nrender(<RoughBracket />);"
                          )
                        }
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Code
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setText("Roughly")}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Short
                      </button>
                      <button
                        onClick={() => setText("Interfaces with visceral")}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Medium
                      </button>
                      <button
                        onClick={() =>
                          setText(
                            "Interfaces with visceral depth and tactile precision"
                          )
                        }
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Long
                      </button>
                    </div>
                  )}
                </div>
                {selectedType === "bracket" ? (
                  <textarea
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans transition-colors resize-y leading-relaxed"
                    placeholder="Enter multiline text..."
                  />
                ) : (
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans transition-colors"
                    placeholder="Enter text to annotate..."
                  />
                )}

                {/* Typography: Size & Boldness */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Size</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(["text-base", "text-2xl", "text-4xl", "text-6xl"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setFontSize(s)}
                          className={`py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                            fontSize === s
                              ? "bg-indigo-600/80 text-white font-semibold"
                              : "bg-white/[0.03] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {s.replace("text-", "").toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Weight</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(["font-normal", "font-semibold", "font-bold"] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setFontWeight(w)}
                          className={`py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                            fontWeight === w
                              ? "bg-indigo-600/80 text-white font-semibold"
                              : "bg-white/[0.03] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {w.replace("font-", "").slice(0, 4).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Type-Specific Options */}
              {selectedType === "circle" && (
                <div className="space-y-3.5 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                      RoughCircle Architecture
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      rough-notation engine
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-400">Horizontal Space (Left & Right Symmetric)</span>
                      <span className="text-white">{circlePaddingX}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={45}
                      step={1}
                      value={circlePaddingX}
                      onChange={(e) => setCirclePaddingX(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-neutral-500">
                      Guarantees identical sweeping curvature and breathing room on both left and right edges.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-400">Vertical Space (Top & Bottom)</span>
                      <span className="text-white">{circlePaddingY}px</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={25}
                      step={1}
                      value={circlePaddingY}
                      onChange={(e) => setCirclePaddingY(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Sketch Loops (Iterations)
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 1, label: "Single Loop (Clean)" },
                        { id: 2, label: "Double Loop (Authentic)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCircleIterations(item.id)}
                          className={`flex-1 py-1 text-xs rounded-md cursor-pointer transition-colors ${
                            circleIterations === item.id
                              ? "bg-white/20 text-white font-medium"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "underline" && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                    Underline Style
                  </label>
                  <div className="flex gap-2">
                    {(["single", "double", "wavy"] as UnderlineVariant[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setUnderlineVariant(v)}
                        className={`flex-1 py-1.5 text-xs rounded-lg capitalize cursor-pointer transition-colors ${
                          underlineVariant === v
                            ? "bg-white/20 text-white font-medium shadow-sm"
                            : "bg-white/[0.04] text-neutral-400 hover:text-white"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === "strike-through" && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                    Strike Style
                  </label>
                  <div className="flex gap-2">
                    {(["single", "double", "triple"] as StrikeVariant[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setStrikeVariant(v)}
                        className={`flex-1 py-1.5 text-xs rounded-lg capitalize cursor-pointer transition-colors ${
                          strikeVariant === v
                            ? "bg-white/20 text-white font-medium shadow-sm"
                            : "bg-white/[0.04] text-neutral-400 hover:text-white"
                        }`}
                      >
                        {v} Line
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === "cross-off" && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                    Cross Cut Style
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "single", label: "Single Cut (2 Strokes)" },
                      { id: "double", label: "Double Sketch (4 Strokes)" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCrossVariant(item.id as CrossVariant)}
                        className={`flex-1 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                          crossVariant === item.id
                            ? "bg-white/20 text-white font-medium shadow-sm"
                            : "bg-white/[0.04] text-neutral-400 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedType === "bracket" && (
                <div className="space-y-3.5 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      RoughBracket Architecture
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      Single Vector Stroke &bull; Multiline
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Bracket Style
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: "curly", label: "Curly { }" },
                        { id: "square", label: "Square [ ]" },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setBracketStyle(style.id as BracketStyle)}
                          className={`flex-1 py-1.5 text-xs rounded-lg font-mono transition-colors cursor-pointer ${
                            bracketStyle === style.id
                              ? "bg-white/20 text-white font-medium shadow-sm"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Placement Side
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {(["left", "right", "both", "top", "bottom"] as BracketSide[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setBracketSide(s)}
                          className={`py-1 text-[11px] font-mono capitalize rounded transition-colors cursor-pointer ${
                            bracketSide === s
                              ? "bg-white/20 text-white font-medium shadow-sm"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "highlight" && (
                <div className="space-y-3.5 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      RoughHighlight Architecture
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      rough.js engine &bull; double strokes
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Highlighter Stroke Passes
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 2, label: "Double Stroke (Authentic 2 Passes)" },
                        { id: 1, label: "Single Stroke (Clean 1 Pass)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setHighlightIterations(item.id)}
                          className={`flex-1 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                            highlightIterations === item.id
                              ? "bg-white/20 text-white font-medium shadow-sm"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-500 pt-0.5">
                      Double strokes sweep forward and back with rough.js roughness and bowing for realistic marker depth.
                    </p>
                  </div>
                </div>
              )}

              {selectedType === "box" && (
                <div className="space-y-3.5 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      RoughBox Architecture
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      rough.js engine &bull; hand-drawn box
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Box Frame Passes
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: "double", label: "Double Strokes (Authentic Hand-Drawn)" },
                        { id: "single", label: "Single Stroke (Clean Frame)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setBoxVariant(item.id as BoxVariant)}
                          className={`flex-1 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                            boxVariant === item.id
                              ? "bg-white/20 text-white font-medium shadow-sm"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-500 pt-0.5">
                      Double strokes draw 2 organic loops with corner overshoots and slight line curvature via rough.js.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                        <span>Padding X</span>
                        <span>{boxPaddingX}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="24"
                        step="1"
                        value={boxPaddingX}
                        onChange={(e) => setBoxPaddingX(Number(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                        <span>Padding Y</span>
                        <span>{boxPaddingY}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="16"
                        step="1"
                        value={boxPaddingY}
                        onChange={(e) => setBoxPaddingY(Number(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "arrow" && (
                <div className="space-y-3.5 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      RoughArrow Architecture
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      rough.js vector &bull; 8 placements
                    </span>
                  </div>

                  {/* Callout Label Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Callout Label (Handwritten Caveat)
                    </label>
                    <input
                      type="text"
                      value={arrowLabel}
                      onChange={(e) => setArrowLabel(e.target.value)}
                      placeholder="e.g. Look here! ⚡"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/10 text-white font-[family-name:var(--font-caveat),cursive] text-base focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Placement Grid */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Arrow Placement (8 Directions)
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {(
                        [
                          "top-left",
                          "top",
                          "top-right",
                          "right",
                          "bottom-right",
                          "bottom",
                          "bottom-left",
                          "left",
                        ] as ArrowPlacement[]
                      ).map((p) => (
                        <button
                          key={p}
                          onClick={() => setArrowPlacement(p)}
                          className={`py-1 text-[10px] font-mono capitalize rounded transition-colors cursor-pointer ${
                            arrowPlacement === p
                              ? "bg-white/20 text-white font-medium shadow-sm"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {p.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curve Variant */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Curve Trajectory
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "curved", label: "Curved Arc" },
                        { id: "loop", label: "Loop-de-Loop" },
                        { id: "s-curve", label: "S-Curve Wave" },
                        { id: "straight", label: "Straight Line" },
                      ].map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setArrowVariant(v.id as ArrowVariant)}
                          className={`py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                            arrowVariant === v.id
                              ? "bg-white/20 text-white font-medium shadow-sm"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white"
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Arrowhead & Stroke Passes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                        Arrowhead Style
                      </label>
                      <div className="flex gap-1">
                        {[
                          { id: "open", label: "Open >" },
                          { id: "filled", label: "Filled ▲" },
                          { id: "curved", label: "Curved ~" },
                        ].map((h) => (
                          <button
                            key={h.id}
                            onClick={() => setArrowheadStyle(h.id as ArrowheadStyle)}
                            className={`flex-1 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                              arrowheadStyle === h.id
                                ? "bg-white/20 text-white font-medium"
                                : "bg-white/[0.04] text-neutral-400 hover:text-white"
                            }`}
                          >
                            {h.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                        Stroke Passes
                      </label>
                      <div className="flex gap-1">
                        {[
                          { id: 2, label: "Double" },
                          { id: 1, label: "Single" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setArrowIterations(item.id)}
                            className={`flex-1 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                              arrowIterations === item.id
                                ? "bg-white/20 text-white font-medium"
                                : "bg-white/[0.04] text-neutral-400 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sliders: Distance & Offset */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                        <span>Distance</span>
                        <span>{arrowDistance}px</span>
                      </div>
                      <input
                        type="range"
                        min="35"
                        max="120"
                        step="5"
                        value={arrowDistance}
                        onChange={(e) => setArrowDistance(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                        <span>Target Offset</span>
                        <span>{arrowOffset}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="24"
                        step="1"
                        value={arrowOffset}
                        onChange={(e) => setArrowOffset(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Invert Arc Curvature</span>
                    <button
                      onClick={() => setArrowFlip((prev) => !prev)}
                      className={`px-2.5 py-1 text-[11px] rounded font-mono transition-colors cursor-pointer ${
                        arrowFlip
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-white/[0.04] text-neutral-400 hover:text-white border border-transparent"
                      }`}
                    >
                      {arrowFlip ? "Flipped" : "Normal"}
                    </button>
                  </div>
                </div>
              )}

              {/* Color Palette */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                  Color Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c.hex)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor === c.hex
                          ? "scale-110 border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                          : c.hex === "#000000"
                          ? "border-white/30 hover:border-white/60"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Sliders: Stroke Width & Duration */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>Stroke Width</span>
                    <span>{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>Duration</span>
                    <span>{duration}ms</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="1500"
                    step="50"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right: Live Preview & Code Box */}
            <div className="lg:col-span-7 space-y-4">
              {/* Surface Theme Switcher Bar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neutral-400">Surface Theme:</span>
                  <div className="flex rounded-lg bg-white/[0.05] p-0.5 border border-white/[0.08]">
                    {(["dark", "paper", "light"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setCanvasTheme(theme)}
                        className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                          canvasTheme === theme
                            ? "bg-white/20 text-white font-semibold shadow-sm"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">Live Canvas</span>
              </div>

              {/* Canvas Preview */}
              <div
                className={`relative min-h-[220px] sm:min-h-[260px] rounded-2xl border p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-2xl transition-colors duration-300 ${
                  canvasTheme === "dark"
                    ? "bg-[#09090b] border-white/10"
                    : canvasTheme === "paper"
                    ? "bg-[#f5f2eb] border-[#e4dfd5]"
                    : "bg-white border-neutral-200"
                }`}
              >
                {/* Minimal Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, ${canvasTheme === "dark" ? "#ffffff" : "#000000"} 1px, transparent 1px)`,
                    backgroundSize: `16px 16px`,
                  }}
                />

                <div
                  key={replayKey}
                  className={`relative z-10 ${fontSize} ${fontWeight} tracking-tight transition-colors duration-200 ${
                    canvasTheme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {selectedType === "circle" ? (
                    <RoughCircle
                      key={`circle-${replayKey}-${circlePaddingX}-${circlePaddingY}-${circleIterations}-${selectedColor}`}
                      color={selectedColor}
                      strokeWidth={strokeWidth}
                      paddingX={circlePaddingX}
                      paddingY={circlePaddingY}
                      animationDuration={duration}
                      iterations={circleIterations}
                      animate={true}
                    >
                      {text}
                    </RoughCircle>
                  ) : selectedType === "underline" ? (
                    <RoughUnderline
                      key={`underline-${replayKey}-${underlineVariant}-${selectedColor}`}
                      variant={underlineVariant}
                      color={selectedColor}
                      strokeWidth={strokeWidth}
                      animationDuration={duration}
                      animate={true}
                    >
                      {text}
                    </RoughUnderline>
                  ) : selectedType === "strike-through" ? (
                    <RoughStrike
                      key={`strike-${replayKey}-${strikeVariant}-${selectedColor}`}
                      variant={strikeVariant}
                      color={selectedColor}
                      strokeWidth={strokeWidth}
                      animationDuration={duration}
                      animate={true}
                    >
                      {text}
                    </RoughStrike>
                  ) : selectedType === "cross-off" ? (
                    <RoughCross
                      key={`cross-${replayKey}-${crossVariant}-${selectedColor}`}
                      variant={crossVariant}
                      color={selectedColor}
                      strokeWidth={strokeWidth}
                      animationDuration={duration}
                      animate={true}
                    >
                      {text}
                    </RoughCross>
                  ) : selectedType === "bracket" ? (
                    <RoughBracket
                      key={`bracket-${replayKey}-${bracketSide}-${bracketStyle}-${selectedColor}-${strokeWidth}`}
                      side={bracketSide}
                      bracketStyle={bracketStyle}
                      color={selectedColor}
                      strokeWidth={strokeWidth}
                      animationDuration={duration}
                      animate={true}
                    >
                      <div className="space-y-1.5 text-left">
                        {text.split("\n").map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>
                    </RoughBracket>
                  ) : selectedType === "highlight" ? (
                    <RoughHighlight
                      key={`highlight-${replayKey}-${highlightIterations}-${selectedColor}`}
                      color={selectedColor}
                      animationDuration={duration}
                      iterations={highlightIterations}
                      animate={true}
                    >
                      {text}
                    </RoughHighlight>
                  ) : selectedType === "box" ? (
                    <RoughBox
                      key={`box-${replayKey}-${boxVariant}-${boxPaddingX}-${boxPaddingY}-${selectedColor}-${strokeWidth}`}
                      variant={boxVariant}
                      paddingX={boxPaddingX}
                      paddingY={boxPaddingY}
                      color={selectedColor}
                      strokeWidth={strokeWidth}
                      animationDuration={duration}
                      animate={true}
                    >
                      {text}
                    </RoughBox>
                  ) : selectedType === "arrow" ? (
                    <div className="py-16 px-10 flex items-center justify-center">
                      <RoughArrow
                        key={`arrow-${replayKey}-${arrowPlacement}-${arrowVariant}-${arrowheadStyle}-${arrowIterations}-${arrowDistance}-${arrowOffset}-${arrowFlip}-${selectedColor}-${strokeWidth}-${arrowLabel}`}
                        placement={arrowPlacement}
                        variant={arrowVariant}
                        arrowhead={arrowheadStyle}
                        iterations={arrowIterations}
                        distance={arrowDistance}
                        offset={arrowOffset}
                        flipCurve={arrowFlip}
                        label={arrowLabel}
                        color={selectedColor}
                        strokeWidth={strokeWidth}
                        animationDuration={duration}
                        animate={true}
                      >
                        {text}
                      </RoughArrow>
                    </div>
                  ) : (
                    <Roughly
                      type={selectedType}
                      color={selectedColor}
                      strokeWidth={strokeWidth}
                      animationDuration={duration}
                      animate={true}
                    >
                      {text}
                    </Roughly>
                  )}
                </div>
              </div>

              {/* Dynamic Code Snippet */}
              <div className="rounded-xl bg-[#0d0d10] border border-white/[0.08] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[11px] font-mono text-neutral-500">React Component Snippet</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
                  <code>{generateSnippet()}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Editorial In-Context Showcase ─────────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Editorial Typography Demonstration
            </h2>
          </div>

          <div className="p-6 sm:p-10 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-6 leading-relaxed text-sm sm:text-base text-neutral-300 font-normal">
            <p>
              Void UI components are designed with{" "}
              <Roughly.Highlight color="#4338CA">
                tactile physical friction
              </Roughly.Highlight>
              , transforming sterile digital surfaces into visceral instruments. Rather than flattening user interfaces, we introduce deliberate resistance and{" "}
              <Roughly.Underline variant="wavy" color="#6366F1">
                dynamic spring dynamics
              </Roughly.Underline>
              .
            </p>

            <p>
              In traditional software development, designers often rely on{" "}
              <Roughly.Strike variant="double" color="#EF4444">
                bland grey boxes
              </Roughly.Strike>{" "}
              and lifeless borders. With Roughly, you can draw attention to{" "}
              <Roughly.Circle color="#EC4899">
                critical insights
              </Roughly.Circle>{" "}
              or mark deprecated features with an organic{" "}
              <Roughly.Cross variant="single" color="#F43F5E">
                cross out
              </Roughly.Cross>
              .
            </p>

            <div className="py-2 pl-4">
              <Roughly.Bracket side="left" bracketStyle="curly" color="#F59E0B">
                <div className="space-y-1.5 text-xs sm:text-sm text-neutral-400 pl-2">
                  <p>• Zero layout shift on page reloads</p>
                  <p>• Sized to encompass all tall ascenders and low descenders</p>
                  <p>• Scroll-triggered hardware-accelerated SVG draw animation</p>
                </div>
              </Roughly.Bracket>
            </div>

            <p>
              Every annotation is enclosed in a{" "}
              <Roughly.Box color="#10B981" variant="double">
                hand-drawn rough frame
              </Roughly.Box>{" "}
              with natural corner overshoots and fluid double stroke sketch loops.
            </p>

            <p className="pt-3">
              Direct the reader&apos;s gaze with an expressive{" "}
              <RoughArrow
                label="Direct vector pointing ✨"
                placement="top-right"
                variant="curved"
                color="#F59E0B"
                distance={55}
              >
                hand-drawn callout arrow
              </RoughArrow>{" "}
              that automatically calculates its trajectory, clearance, and entry angle directly onto the target word.
            </p>
          </div>
        </section>

        {/* ── 4. API Reference Table ───────────────────────────── */}
        <section className="space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              API Reference
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#111114]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-neutral-400">
                <tr>
                  <th className="p-3">Prop</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Default</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-neutral-300">
                <tr>
                  <td className="p-3 font-semibold text-white">type</td>
                  <td className="p-3 text-indigo-400">RoughlyType</td>
                  <td className="p-3 text-neutral-500">&quot;underline&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">
                    &quot;underline&quot; | &quot;circle&quot; | &quot;strike-through&quot; | &quot;cross-off&quot; | &quot;bracket&quot; | &quot;box&quot; | &quot;highlight&quot; | &quot;arrow&quot;
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">color</td>
                  <td className="p-3 text-indigo-400">string</td>
                  <td className="p-3 text-neutral-500">Preset by type</td>
                  <td className="p-3 font-sans text-neutral-400">Any valid CSS color string (Hex, RGB, HSL)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">strokeWidth</td>
                  <td className="p-3 text-indigo-400">number</td>
                  <td className="p-3 text-neutral-500">2</td>
                  <td className="p-3 font-sans text-neutral-400">Thickness of pen strokes in pixels</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">animate</td>
                  <td className="p-3 text-indigo-400">boolean</td>
                  <td className="p-3 text-neutral-500">true</td>
                  <td className="p-3 font-sans text-neutral-400">Triggers pen stroke drawing on scroll viewport entry</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">animationDuration</td>
                  <td className="p-3 text-indigo-400">number</td>
                  <td className="p-3 text-neutral-500">650</td>
                  <td className="p-3 font-sans text-neutral-400">Duration of drawing in milliseconds</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">side / brackets</td>
                  <td className="p-3 text-indigo-400">BracketSide</td>
                  <td className="p-3 text-neutral-500">&quot;left&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">&quot;left&quot; | &quot;right&quot; | &quot;both&quot; | &quot;top&quot; | &quot;bottom&quot; (for bracket type)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">bracketStyle</td>
                  <td className="p-3 text-indigo-400">BracketStyle</td>
                  <td className="p-3 text-neutral-500">&quot;curly&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">&quot;curly&quot; ({"{ }"}) | &quot;square&quot; ([ ])</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">variant</td>
                  <td className="p-3 text-indigo-400">string</td>
                  <td className="p-3 text-neutral-500">&quot;single&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">
                    &quot;single&quot; | &quot;double&quot; | &quot;wavy&quot; (underline) &bull; &quot;single&quot; | &quot;double&quot; | &quot;triple&quot; (strike) &bull; &quot;single&quot; | &quot;double&quot; (cross &amp; box)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">iterations</td>
                  <td className="p-3 text-indigo-400">number</td>
                  <td className="p-3 text-neutral-500">2</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Number of stroke passes (e.g. 2 for double strokes in box, arrow, highlight, and circle)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">placement</td>
                  <td className="p-3 text-indigo-400">ArrowPlacement</td>
                  <td className="p-3 text-neutral-500">&quot;top-right&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Direction from which the arrow points at the target: &quot;top-left&quot; | &quot;top&quot; | &quot;top-right&quot; | &quot;right&quot; | &quot;bottom-right&quot; | &quot;bottom&quot; | &quot;bottom-left&quot; | &quot;left&quot;
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">arrowVariant / variant</td>
                  <td className="p-3 text-indigo-400">ArrowVariant</td>
                  <td className="p-3 text-neutral-500">&quot;curved&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Curve trajectory: &quot;curved&quot; (parabolic arc) | &quot;loop&quot; (loop-de-loop) | &quot;s-curve&quot; (double wave) | &quot;straight&quot;
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">arrowhead</td>
                  <td className="p-3 text-indigo-400">ArrowheadStyle</td>
                  <td className="p-3 text-neutral-500">&quot;open&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Style of arrow tip: &quot;open&quot; (&gt;) | &quot;filled&quot; (solid triangle) | &quot;curved&quot; (flared barbs)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">label</td>
                  <td className="p-3 text-indigo-400">ReactNode</td>
                  <td className="p-3 text-neutral-500">undefined</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Handwritten callout text displayed at the tail of the arrow with cursive Caveat styling
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
