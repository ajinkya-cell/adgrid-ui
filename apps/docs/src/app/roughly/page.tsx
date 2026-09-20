"use client";

import { useState, useRef, useEffect } from "react";
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
  VoidButton,
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
  ArrowLabelFont,
} from "@adgrid-ui/ui";
import {
  Check,
  Copy,
  RefreshCw,
  ChevronDown,
  BookOpen,
  Layers,
  Terminal,
  Underline as UnderlineIcon,
  Circle as CircleIcon,
  Strikethrough as StrikeIcon,
  X as CrossIcon,
  Brackets as BracketIcon,
  Square as BoxIcon,
  Highlighter as HighlightIcon,
  ArrowRight as ArrowIcon,
} from "lucide-react";

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
  const [arrowLabelFont, setArrowLabelFont] = useState<ArrowLabelFont>("caveat");
  const [arrowDistance, setArrowDistance] = useState<number>(65);
  const [arrowOffset, setArrowOffset] = useState<number>(8);
  const [arrowCurvature, setArrowCurvature] = useState<number>(0.38);
  const [arrowFlip, setArrowFlip] = useState<boolean>(false);
  const [circlePaddingX, setCirclePaddingX] = useState(22);
  const [circlePaddingY, setCirclePaddingY] = useState(10);
  const [circleIterations, setCircleIterations] = useState(2);
  const [highlightIterations, setHighlightIterations] = useState(2);
  const [replayKey, setReplayKey] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const playgroundRef = useRef<HTMLElement>(null);
  const [editorialRevision, setEditorialRevision] = useState(0);

  // Monitor layout shifts in the interactive playground so the editorial showcase re-anchors
  useEffect(() => {
    const el = playgroundRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    let prevHeight = el.offsetHeight;
    const observer = new ResizeObserver(() => {
      const currentHeight = el.offsetHeight;
      if (Math.abs(currentHeight - prevHeight) > 10) {
        prevHeight = currentHeight;
        setEditorialRevision((r) => r + 1);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const typePresets: {
    id: RoughlyType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "underline", label: "Underline", icon: UnderlineIcon },
    { id: "circle", label: "Circle", icon: CircleIcon },
    { id: "strike-through", label: "Strike", icon: StrikeIcon },
    { id: "cross-off", label: "Cross", icon: CrossIcon },
    { id: "bracket", label: "Bracket", icon: BracketIcon },
    { id: "box", label: "Box", icon: BoxIcon },
    { id: "highlight", label: "Highlight", icon: HighlightIcon },
    { id: "arrow", label: "Arrow", icon: ArrowIcon },
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
      if (arrowCurvature !== 0.38) propsList.push(`curvature={${arrowCurvature}}`);
      if (arrowFlip) propsList.push(`flipCurve={true}`);
      if (arrowLabel) propsList.push(`label="${arrowLabel}"`);
      if (arrowLabelFont !== "caveat") propsList.push(`labelFont="${arrowLabelFont}"`);

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
    navigator.clipboard.writeText(
      "pnpm dlx shadcn@latest add https://void-ui.vercel.app/r/roughly.json"
    );
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const [installPm, setInstallPm] = useState<"pnpm" | "npm" | "yarn" | "bun">("pnpm");
  const [copiedGuideKey, setCopiedGuideKey] = useState<string | null>(null);

  const handleCopyGuide = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedGuideKey(key);
    setTimeout(() => setCopiedGuideKey(null), 2000);
  };

  const installCommands: Record<string, string> = {
    pnpm: "pnpm dlx shadcn@latest add https://void-ui.vercel.app/r/roughly.json",
    npm: "npx shadcn@latest add https://void-ui.vercel.app/r/roughly.json",
    yarn: "yarn dlx shadcn@latest add https://void-ui.vercel.app/r/roughly.json",
    bun: "bunx --bun shadcn@latest add https://void-ui.vercel.app/r/roughly.json",
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-neutral-300 selection:bg-white selection:text-black flex flex-col items-center">
      {/* ── 1. Hero Header (Full Desktop Screen) ─────────────── */}
      <section className="relative isolate w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 pt-16 pb-20 overflow-hidden select-none">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/previews/new-roughly.png"
            alt="Roughly Hand-drawn Vector Annotations - Drafting & Stationery Artwork"
            className="w-full h-full object-cover object-center pointer-events-none select-none"
          />
          {/* Subtle bottom fade for seamless transition into the page content */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
        </div>

        {/* Hero Content (Centered in the open void of the illustration) */}
        <div className="relative z-10 space-y-6 text-center max-w-2xl mx-auto">
          {/* Brand Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-neutral-400 bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            Void UI / Roughly
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white font-sans drop-shadow-md">
            <Roughly type="circle" color="#6366F1" strokeWidth={2.5}>
              Roughly
            </Roughly>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed drop-shadow-sm">
            Organic, hand-drawn vector annotations designed for high-friction digital typography. Wobbly underlines, pen circles, editorial strikethroughs, curly brackets, and tactile highlights.
          </p>

          {/* Hero Action Bar: Recessed Console Well + Default VoidButton */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {/* Recessed Command Capsule with Tactile Depth */}
            <div
              onClick={handleCopyInstall}
              className="relative flex items-center gap-2.5 h-11 px-6 sm:px-8 rounded-full font-mono text-xs text-neutral-200 border border-white/10 bg-[#0c0c0f]/90 backdrop-blur-xl transition-all cursor-pointer group select-all"
              style={{
                boxShadow:
                  "inset 0 1.5px 3px rgba(0, 0, 0, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.06), 0 8px 20px -2px rgba(0, 0, 0, 0.7)",
              }}
              title="Click to copy"
            >
              {/* Inner top specular micro-rim */}
              <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

              {/* Command Text */}
              <div className="flex items-center gap-1.5 tracking-tight">
                <span className="text-neutral-500 select-none">$</span>
                <span className="text-neutral-400">pnpm dlx shadcn@latest add</span>
                <span className="text-white font-medium">https://void-ui.vercel.app/r/roughly.json</span>
              </div>
            </div>

            {/* Default VoidButton (compact reduced height) */}
            <VoidButton
              variant="default"
              onClick={handleCopyInstall}
              style={{ height: "43px" }}
              className=" px-3.5 text-xs font-mono flex items-center gap-1.5 shrink-0 rounded-full cursor-pointer"
            >
              {copiedInstall ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy</span>
                </>
              )}
            </VoidButton>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400/80 pointer-events-none select-none">
          <span className="text-[11px] font-poppins tracking-widest uppercase font-medium text-neutral-400">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-neutral-400" />
        </div>
      </section>

      {/* ── Main Content (Interactive Studio Playground, Editorial, API) ── */}
      <div className="w-full max-w-7xl px-4 sm:px-8 pb-24 pt-12 space-y-16 sm:space-y-20">
        {/* ── 2. Interactive Studio Playground ────────────────── */}
        <section ref={playgroundRef} className="space-y-6">
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
            {/* 1. Left: Annotation Type Selector */}
            <div className="order-1 lg:order-none lg:col-span-3 space-y-3 p-4 rounded-2xl bg-[#111114] border border-white/[0.08]">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                  Annotation Type
                </label>
                <span className="text-[10px] font-mono text-neutral-500">8 styles</span>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/40 overflow-hidden divide-y divide-white/[0.04]">
                {typePresets.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedType === t.id;
                  return (
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
                      className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/15 text-white font-medium"
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-3.5 h-3.5 transition-colors ${
                            isSelected ? "text-indigo-400" : "text-neutral-500"
                          }`}
                        />
                        <span className="text-xs">{t.label}</span>
                      </div>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Middle: Controls Panel */}
            <div className="order-3 lg:order-none lg:col-span-4 space-y-5 p-5 rounded-2xl bg-[#111114] border border-white/[0.08]">
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

              </div>

              {/* Type-Specific Options */}
              {selectedType === "circle" && (
                <div className="space-y-3.5 p-3 rounded-xl bg-black/40 border border-white/10">

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                      <span>Horizontal Space</span>
                      <span>{circlePaddingX}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={45}
                      step={1}
                      value={circlePaddingX}
                      onChange={(e) => setCirclePaddingX(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                      <span>Vertical Space</span>
                      <span>{circlePaddingY}px</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={25}
                      step={1}
                      value={circlePaddingY}
                      onChange={(e) => setCirclePaddingY(Number(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Sketch Loops
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 1, label: "Single Loop" },
                        { id: 2, label: "Double Loop" },
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
                    Cross Style
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "single", label: "Single Cut" },
                      { id: "double", label: "Double Sketch" },
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
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Bracket Style
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: "curly", label: "Curly" },
                        { id: "square", label: "Square" },
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
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Stroke Passes
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 2, label: "Double Stroke" },
                        { id: 1, label: "Single Stroke" },
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
                  </div>
                </div>
              )}

              {selectedType === "box" && (
                <div className="space-y-3.5 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Frame Passes
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: "double", label: "Double Strokes" },
                        { id: "single", label: "Single Stroke" },
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
                  {/* Callout Label Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                        Callout Label
                      </label>
                      <span className="text-[10px] font-mono text-neutral-500">Handwritten</span>
                    </div>
                    <input
                      type="text"
                      value={arrowLabel}
                      onChange={(e) => setArrowLabel(e.target.value)}
                      placeholder="e.g. Look here! ⚡"
                      className={`w-full px-3 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-amber-400 ${
                        arrowLabelFont === "reenie-beanie"
                          ? "font-[family-name:'Reenie_Beanie',cursive] text-xl"
                          : arrowLabelFont === "cedarville-cursive"
                          ? "font-[family-name:'Cedarville_Cursive',cursive] text-base"
                          : "font-[family-name:var(--font-caveat),cursive] text-base"
                      }`}
                    />
                  </div>

                  {/* Callout Font Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Callout Font
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        {
                          id: "caveat",
                          name: "Caveat",
                          fontClass: "font-[family-name:var(--font-caveat),cursive] text-sm",
                        },
                        {
                          id: "reenie-beanie",
                          name: "Reenie Beanie",
                          fontClass: "font-[family-name:'Reenie_Beanie',cursive] text-base",
                        },
                        {
                          id: "cedarville-cursive",
                          name: "Cedarville",
                          fontClass: "font-[family-name:'Cedarville_Cursive',cursive] text-xs",
                        },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setArrowLabelFont(f.id as ArrowLabelFont)}
                          className={`py-1.5 px-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                            arrowLabelFont === f.id
                              ? "bg-white/20 text-white font-medium shadow-sm border border-white/20"
                              : "bg-white/[0.04] text-neutral-400 hover:text-white border border-transparent"
                          }`}
                        >
                          <span className={`${f.fontClass} block truncate leading-tight`}>{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Placement Grid */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Arrow Placement
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
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "curved", label: "Curved" },
                        { id: "s-curve", label: "S-Curve" },
                        { id: "straight", label: "Straight" },
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
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { id: "open", label: "Open" },
                          { id: "filled", label: "Filled" },
                        ].map((h) => (
                          <button
                            key={h.id}
                            onClick={() => setArrowheadStyle(h.id as ArrowheadStyle)}
                            className={`py-1 text-[11px] rounded transition-colors cursor-pointer text-center ${
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

                  {/* Arc Curvature Slider */}
                  {arrowVariant !== "straight" && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                        <span>Arc Curvature</span>
                        <span>{arrowCurvature}</span>
                      </div>
                      <input
                        type="range"
                        min="0.15"
                        max="0.65"
                        step="0.05"
                        value={arrowCurvature}
                        onChange={(e) => setArrowCurvature(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

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
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
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
                    className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
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
                    className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. Right: Live Preview & Code Box */}
            <div className="order-2 lg:order-none lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono text-neutral-500">Live Canvas</span>
              </div>

              {/* Canvas Preview */}
              <div className="relative min-h-[220px] sm:min-h-[260px] rounded-2xl border border-[#e4dfd5] bg-[#f5f2eb] p-8 flex flex-col items-center justify-center text-center overflow-hidden shadow-2xl transition-colors duration-300">
                {/* Minimal Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
                    backgroundSize: `16px 16px`,
                  }}
                />

                <div
                  key={replayKey}
                  className="relative z-10 text-2xl font-semibold tracking-tight text-neutral-900 transition-colors duration-200"
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
                        key={`arrow-${replayKey}-${arrowPlacement}-${arrowVariant}-${arrowheadStyle}-${arrowIterations}-${arrowDistance}-${arrowOffset}-${arrowCurvature}-${arrowFlip}-${selectedColor}-${strokeWidth}-${arrowLabel}-${arrowLabelFont}`}
                        placement={arrowPlacement}
                        variant={arrowVariant}
                        arrowhead={arrowheadStyle}
                        iterations={arrowIterations}
                        distance={arrowDistance}
                        offset={arrowOffset}
                        curvature={arrowCurvature}
                        flipCurve={arrowFlip}
                        label={arrowLabel}
                        labelFont={arrowLabelFont}
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
        <section
          key={`${selectedType}-${editorialRevision}`}
          className="space-y-6 max-w-5xl mx-auto w-full"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              Editorial Typography Demonstration
            </h2>
          </div>

          <div className="relative p-6 sm:p-10 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-6 leading-relaxed text-sm sm:text-base text-neutral-300 font-normal">
            <p className="relative">
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

            <p className="relative">
              In traditional software development, designers often rely on{" "}
              <Roughly.Strike variant="double" color="#EF4444">
                bland grey boxes
              </Roughly.Strike>{" "}
              and lifeless borders. With Roughly, you can draw attention to{" "}
              <Roughly.Circle color="#EC4899" paddingX={1} paddingY={6}>
                critical insights
              </Roughly.Circle>{" "}
              or mark deprecated features with an organic{" "}
              <Roughly.Cross variant="single" color="#F43F5E">
                cross out
              </Roughly.Cross>
              .
            </p>

            <div className="relative py-2 pl-4">
              <Roughly.Bracket side="left" bracketStyle="curly" color="#F59E0B">
                <div className="space-y-1.5 text-xs sm:text-sm text-neutral-400 pl-2">
                  <p>• Zero layout shift on page reloads</p>
                  <p>• Sized to encompass all tall ascenders and low descenders</p>
                  <p>• Scroll-triggered hardware-accelerated SVG draw animation</p>
                </div>
              </Roughly.Bracket>
            </div>

            <p className="relative">
              Every annotation is enclosed in a{" "}
              <Roughly.Box color="#10B981" variant="double">
                hand-drawn rough frame
              </Roughly.Box>{" "}
              with natural corner overshoots and fluid double stroke sketch loops.
            </p>

            <p className="relative pt-3">
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

        {/* ── 4. How to Use / Quickstart Guide ──────────────────── */}
        <section className="space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
              How to Use
            </h2>
          </div>

          <div className="space-y-6">
            {/* Step 1: Install Dependencies */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Step 01
                </span>
                <span className="text-xs font-mono text-neutral-500">CLI Distribution</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white font-sans">
                  Install via Void UI CLI
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  Add Void UI&apos;s Roughly annotations directly into your project via the shadcn CLI. This downloads the source code into <code className="text-indigo-300 font-mono text-xs">components/ui/roughly/</code> and automatically resolves all peer dependencies.
                </p>
              </div>

              {/* Package Manager Switcher & Code Box */}
              <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-1">
                    {(["pnpm", "npm", "yarn", "bun"] as const).map((pm) => (
                      <button
                        key={pm}
                        onClick={() => setInstallPm(pm)}
                        className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                          installPm === pm
                            ? "bg-white/15 text-white font-medium"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopyGuide("install", installCommands[installPm])}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedGuideKey === "install" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto select-all">
                  <span className="text-neutral-500 mr-2">$</span>
                  {installCommands[installPm]}
                </div>
              </div>
            </div>

            {/* Step 2: Import Components */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Step 02
                </span>
                <span className="text-xs font-mono text-neutral-500">Direct Source Ownership</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white font-sans">
                  Import Components
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  Import the individual annotation subcomponents from your local UI directory for optimal tree-shaking, or use the unified compound <code className="text-indigo-300 font-mono text-xs">&lt;Roughly&gt;</code> component.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[11px] font-mono text-neutral-400">Named Imports</span>
                  <button
                    onClick={() =>
                      handleCopyGuide(
                        "import",
                        `import {\n  Roughly,\n  RoughCircle,\n  RoughUnderline,\n  RoughHighlight,\n  RoughBox,\n  RoughBracket,\n  RoughStrike,\n  RoughCross,\n  RoughArrow,\n} from "@/components/ui/roughly";`
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedGuideKey === "import" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto leading-relaxed">
                  <code>{`import {
  Roughly,
  RoughCircle,
  RoughUnderline,
  RoughHighlight,
  RoughBox,
  RoughBracket,
  RoughStrike,
  RoughCross,
  RoughArrow,
} from "@/components/ui/roughly";`}</code>
                </pre>
              </div>
            </div>

            {/* Step 3: Wrap Words & Elements */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Step 03
                </span>
                <span className="text-xs font-mono text-neutral-500">Zero Layout Shift</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white font-sans">
                  Annotate Text &amp; Keywords
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  Wrap any word, phrase, or inline block. Annotations automatically measure bounding boxes and draw with organic hand-drawn roughness when scrolled into view.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[11px] font-mono text-neutral-400">Example Component</span>
                  <button
                    onClick={() =>
                      handleCopyGuide(
                        "usage",
                        `import {\n  RoughHighlight,\n  RoughCircle,\n  RoughUnderline,\n  RoughBox,\n} from "@/components/ui/roughly";\n\nexport default function ArticleHero() {\n  return (\n    <div className="space-y-4">\n      {/* Tactile Marker Highlight */}\n      <h1 className="text-3xl font-bold text-white">\n        Design with <RoughHighlight color="#4338CA">physical friction</RoughHighlight>\n      </h1>\n\n      {/* Hand-drawn Pen Circle */}\n      <p className="text-neutral-300">\n        Focus on <RoughCircle color="#6366F1">critical insights</RoughCircle> inside body copy.\n      </p>\n\n      {/* Wavy Underline */}\n      <p className="text-neutral-300">\n        Add energy with <RoughUnderline variant="wavy" color="#10B981">expressive underlines</RoughUnderline>.\n      </p>\n\n      {/* Sketch Box Frame */}\n      <p className="text-neutral-300">\n        Enclose cards in a <RoughBox color="#F59E0B" variant="double">hand-drawn frame</RoughBox>.\n      </p>\n    </div>\n  );\n}`
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedGuideKey === "usage" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto leading-relaxed">
                  <code>{`import {
  RoughHighlight,
  RoughCircle,
  RoughUnderline,
  RoughBox,
} from "@/components/ui/roughly";

export default function ArticleHero() {
  return (
    <div className="space-y-4">
      {/* Tactile Marker Highlight */}
      <h1 className="text-3xl font-bold text-white">
        Design with <RoughHighlight color="#4338CA">physical friction</RoughHighlight>
      </h1>

      {/* Hand-drawn Pen Circle */}
      <p className="text-neutral-300">
        Focus on <RoughCircle color="#6366F1">critical insights</RoughCircle> inside body copy.
      </p>

      {/* Wavy Underline */}
      <p className="text-neutral-300">
        Add energy with <RoughUnderline variant="wavy" color="#10B981">expressive underlines</RoughUnderline>.
      </p>

      {/* Sketch Box Frame */}
      <p className="text-neutral-300">
        Enclose cards in a <RoughBox color="#F59E0B" variant="double">hand-drawn frame</RoughBox>.
      </p>
    </div>
  );
}`}</code>
                </pre>
              </div>
            </div>

            {/* Step 4: Directional Callout Arrows */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Step 04
                </span>
                <span className="text-xs font-mono text-neutral-500">Directional Trajectory</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white font-sans">
                  Expressive Callout Arrows
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  Wrap any CTA button or keyword with <code className="text-indigo-300 font-mono text-xs">&lt;RoughArrow&gt;</code> to anchor an arrow with dynamic curve trajectories and handwritten callout notes.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[11px] font-mono text-neutral-400">Arrow Callout</span>
                  <button
                    onClick={() =>
                      handleCopyGuide(
                        "arrow",
                        `import { RoughArrow } from "@/components/ui/roughly";\n\nexport function CalloutDemo() {\n  return (\n    <div className="p-12 flex justify-center">\n      <RoughArrow\n        placement="top-right"\n        variant="curved"\n        arrowhead="open"\n        color="#F59E0B"\n        label="Interactive Studio ✨"\n        labelFont="caveat"\n        distance={65}\n      >\n        <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg">\n          Launch Console\n        </button>\n      </RoughArrow>\n    </div>\n  );\n}`
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedGuideKey === "arrow" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto leading-relaxed">
                  <code>{`import { RoughArrow } from "@/components/ui/roughly";

export function CalloutDemo() {
  return (
    <div className="p-12 flex justify-center">
      <RoughArrow
        placement="top-right"
        variant="curved"
        arrowhead="open"
        color="#F59E0B"
        label="Interactive Studio ✨"
        labelFont="caveat"
        distance={65}
      >
        <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold shadow-lg">
          Launch Console
        </button>
      </RoughArrow>
    </div>
  );
}`}</code>
                </pre>
              </div>
            </div>

            {/* Step 5: Handwriting Cursive Fonts */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#111114] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Step 05
                </span>
                <span className="text-xs font-mono text-neutral-500">Optional Styling</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white font-sans">
                  Handwritten Callout Fonts Setup
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  To use handwriting script for callouts (<code className="text-indigo-300 font-mono text-xs">&quot;caveat&quot;</code>, <code className="text-indigo-300 font-mono text-xs">&quot;reenie-beanie&quot;</code>, or <code className="text-indigo-300 font-mono text-xs">&quot;cedarville-cursive&quot;</code>), load Google Fonts in your root layout:
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[11px] font-mono text-neutral-400">app/layout.tsx</span>
                  <button
                    onClick={() =>
                      handleCopyGuide(
                        "fonts",
                        `<head>\n  <link\n    rel="stylesheet"\n    href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Cedarville+Cursive&family=Reenie+Beanie&display=swap"\n  />\n</head>`
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-white/[0.04] hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedGuideKey === "fonts" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto leading-relaxed">
                  <code>{`<head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Cedarville+Cursive&family=Reenie+Beanie&display=swap"
  />
</head>`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. API Reference Table ───────────────────────────── */}
        <section className="space-y-4 max-w-5xl mx-auto w-full">
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
                    Curve trajectory: &quot;curved&quot; (parabolic arc) | &quot;s-curve&quot; (double wave) | &quot;straight&quot;
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">arrowhead</td>
                  <td className="p-3 text-indigo-400">ArrowheadStyle</td>
                  <td className="p-3 text-neutral-500">&quot;open&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Style of arrow tip: &quot;open&quot; (&gt;) | &quot;filled&quot; (solid triangle)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">label</td>
                  <td className="p-3 text-indigo-400">ReactNode</td>
                  <td className="p-3 text-neutral-500">undefined</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Handwritten callout text displayed at the tail of the arrow
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">labelFont</td>
                  <td className="p-3 text-indigo-400">ArrowLabelFont</td>
                  <td className="p-3 text-neutral-500">&quot;caveat&quot;</td>
                  <td className="p-3 font-sans text-neutral-400">
                    Handwriting font family for callout text: &quot;caveat&quot; (default) | &quot;reenie-beanie&quot; | &quot;cedarville-cursive&quot;
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
