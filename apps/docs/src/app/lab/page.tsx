"use client";

import { useState } from "react";
import {
  DotMatrix,
  AnisotropicKnob,
  MorphingNav,
  ScrollPathContainer,
  ScrollPathProcess,
  ExpandOnHover,
  TextShuffle,
  LivingText,
  LaserVaultPassword,
  GravityCardStack,
  MetallicForm,
  WeaponWheel,
  VoidButton,
  BrushedTitaniumButton,
  LiquidGoldButton,
  GuillocheButton,
  SpotlightGrid,
} from "@adgrid-ui/ui";

import {
  IconTerminal2,
  IconCode,
  IconBrandReact,
  IconDatabase,
  IconBrandDocker,
  IconBolt,
} from "@tabler/icons-react";

// ─── Data ───

const expandItems = [
  {
    id: "taj",
    title: "The Eternal Taj",
    subtitle: "Agra",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=85&auto=format&fit=crop",
    description: "White marble, morning mist.",
    badge: "Heritage",
    accent: "#E2E8F0",
  },
  {
    id: "varanasi",
    title: "Varanasi Riverfront",
    subtitle: "Kashi",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=85&auto=format&fit=crop",
    description: "Stone steps, ritual light.",
    badge: "Spiritual",
    accent: "#A3A3A3",
  },
  {
    id: "jaipur",
    title: "Jaipur Palace",
    subtitle: "Jaipur",
    image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200&q=85&auto=format&fit=crop",
    description: "Wind, privacy, royal theatre.",
    badge: "Architecture",
    accent: "#D4D4D4",
  },
];

const formFields = [
  {
    name: "callsign",
    label: "OPERATOR ID",
    type: "text" as const,
    placeholder: "Enter call sign",
    required: true,
  },
  {
    name: "channel",
    label: "SECURE CHANNEL",
    type: "email" as const,
    placeholder: "freq@channel.net",
    required: true,
  },
  {
    name: "clearance",
    label: "CLEARANCE LEVEL",
    type: "select" as const,
    options: [
      { value: "alpha", label: "ALPHA" },
      { value: "beta", label: "BETA" },
      { value: "omega", label: "OMEGA" },
    ],
    required: true,
  },
];

const wheelItems = [
  {
    id: "terminal",
    name: "Terminal",
    category: "CORE_SYSTEM",
    icon: IconTerminal2,
    description: "Command interface for system operations and diagnostics.",
    stats: { dx: 90, performance: 85, reliability: 80, versatility: 88 },
    subItems: [
      { id: "shell", name: "Shell Access", icon: IconCode, category: "CLI", description: "Direct shell interface with command history." },
      { id: "monitor", name: "SysMonitor", icon: IconBolt, category: "Diagnostics", description: "Real-time system performance monitoring." },
    ],
  },
  {
    id: "ui",
    name: "UI Engine",
    category: "RENDER_LAYER",
    icon: IconBrandReact,
    description: "Component rendering pipeline and layout management.",
    stats: { dx: 85, performance: 78, reliability: 82, versatility: 92 },
    subItems: [
      { id: "bento", name: "Bento Grid", icon: IconCode, category: "Layout", description: "Asymmetrical grid layout engine." },
      { id: "hud", name: "HUD Overlay", icon: IconBolt, category: "Display", description: "Heads-up display overlay system." },
    ],
  },
  {
    id: "data",
    name: "Data Core",
    category: "STORAGE",
    icon: IconDatabase,
    description: "Persistent storage and real-time data synchronization.",
    stats: { dx: 75, performance: 92, reliability: 95, versatility: 72 },
    subItems: [
      { id: "cache", name: "Cache Layer", icon: IconBolt, category: "Memory", description: "High-speed in-memory cache." },
      { id: "store", name: "Data Store", icon: IconCode, category: "Persist", description: "Persistent structured data storage." },
    ],
  },
  {
    id: "deploy",
    name: "Deploy",
    category: "OPS",
    icon: IconBrandDocker,
    description: "Container orchestration and deployment pipeline.",
    stats: { dx: 78, performance: 88, reliability: 90, versatility: 80 },
    subItems: [
      { id: "container", name: "Containers", icon: IconBrandDocker, category: "Runtime", description: "Isolated container runtime environment." },
      { id: "pipeline", name: "Pipeline", icon: IconBolt, category: "CI/CD", description: "Automated build and deployment pipeline." },
    ],
  },
];

// ─── LabCard Component ───

interface LabCardProps {
  id: string;
  label: string;
  status: string;
  colSpan: string;
  height?: string;
  children: React.ReactNode;
  title: string;
  description: string;
  statLeft: string;
  statRight: string;
  noPadding?: boolean;
}

function LabCard({
  id,
  label,
  status,
  colSpan,
  height = "h-[400px]",
  children,
  title,
  description,
  statLeft,
  statRight,
  noPadding = false,
}: LabCardProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`
        ${colSpan} ${height}
        border border-border-hairline bg-pure-black
        ${noPadding ? "" : "p-6"}
        flex flex-col justify-between relative overflow-hidden
        group hover:border-white transition-colors duration-300
        spotlight-card border-glow-card
        rounded-lg shadow-2xl
      `}
    >
      {/* Spotlight overlay */}
      <div className="spotlight-overlay" />
      <div className="border-beam" />

      {/* HUD Corner Accents */}
      <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-white/60 pointer-events-none z-20" />
      <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-white/60 pointer-events-none z-20" />
      <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-white/60 pointer-events-none z-20" />
      <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-white/60 pointer-events-none z-20" />

      {/* Header */}
      <div className="flex justify-between items-start z-10 select-none">
        <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold uppercase flex items-center gap-1.5">
          <span className="text-emerald-400/80">◆</span>
          {id}
          <span className="text-text-muted/50 mx-0.5">//</span>
          <span className="text-text-muted font-normal">{label}</span>
        </span>
        <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
          {status}
        </span>
      </div>

      {/* Component Display Area */}
      <div className={`relative z-10 flex-1 flex items-center justify-center overflow-hidden ${noPadding ? "" : "-mx-6 -my-2"}`}>
        {children}
      </div>

      {/* Title + Description */}
      <div className="flex flex-col gap-1 z-10 select-none mt-3">
        <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="font-body text-text-muted text-[11px] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer Stats */}
      <div className="mt-3 border-t border-border-hairline pt-3 select-none z-10">
        <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
          <span>{statLeft}</span>
          <span>{statRight}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function LabPage() {
  const [matrixText, setMatrixText] = useState("VOID UI");
  const [knobValue, setKnobValue] = useState(42);

  return (
    <main className="w-full min-h-screen bg-pure-black py-20 px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 select-none border-b border-border-hairline pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-border-hairline bg-surface-charcoal/40 backdrop-blur-md rounded mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] text-text-muted tracking-[0.25em] uppercase">
                System Online // Terminal Active
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl uppercase font-bold tracking-tighter text-white mb-3">
              Component Lab
            </h1>
            <p className="font-body text-text-muted max-w-lg text-sm leading-relaxed">
              Declassified military terminal interface. Interactive HUD dashboard showcasing live VOID/UI primitives, animated systems, and tactile controls.
            </p>
          </div>
          <div className="font-mono text-xs text-text-muted uppercase tracking-wider text-right">
            <div>DISP: 13 / 128 ASSETS</div>
            <div className="mt-1 text-emerald-500">LATENCY: 4MS // STABLE</div>
          </div>
        </div>

        {/* ─── Bento Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* 01 — DotMatrix (Span 7) */}
          <LabCard
            id="SYS_01"
            label="DOT_MATRIX"
            status="LED_ACTIVE"
            colSpan="md:col-span-7"
            title="DotMatrix"
            description="Programmable LED dot matrix supporting Perlin noise, typewriter bitmaps, Web Audio, and cursor repelling."
            statLeft="Cols: 32"
            statRight="Mode: Text"
          >
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="scale-75 -my-4 max-w-full">
                <DotMatrix
                  animation="text"
                  text={matrixText}
                  columns={32}
                  rows={8}
                  speed={1.5}
                  color="#e7e5df"
                  glow={true}
                />
              </div>
              <input
                type="text"
                value={matrixText}
                maxLength={12}
                onChange={(e) => setMatrixText(e.target.value.toUpperCase())}
                placeholder="TYPE TO RENDER..."
                className="w-full max-w-xs bg-[#111111] border border-white/5 focus:border-white/20 rounded-md px-3 py-1.5 font-mono text-[10px] text-white outline-none placeholder-white/20"
              />
            </div>
          </LabCard>

          {/* 02 — AnisotropicKnob (Span 5) */}
          <LabCard
            id="SYS_02"
            label="ANISOTROPIC_DIAL"
            status="SKEUO_ACTIVE"
            colSpan="md:col-span-5"
            title="AnisotropicKnob"
            description="Machined metal rotary dial with dynamic rotating anisotropic highlights and snapper increments."
            statLeft="Dial: Tactile"
            statRight="Type: Metal"
          >
            <div className="flex flex-col items-center gap-3 scale-90">
              <AnisotropicKnob
                size={120}
                label="FREQUENCY"
                min={0}
                max={100}
                step={1}
                sound={true}
                value={knobValue}
                onChange={setKnobValue}
              />
              <span className="font-mono text-[10px] text-text-muted tracking-widest">
                VAL: {knobValue}Hz
              </span>
            </div>
          </LabCard>

          {/* 03 — MorphingNav (Span 4) */}
          <LabCard
            id="SYS_03"
            label="SVG_MORPH"
            status="FLOW_ACTIVE"
            colSpan="md:col-span-4"
            title="MorphingNav"
            description="Interactive navigation bar with liquid morphing SVG background shapes."
            statLeft="Morph: 0.6s"
            statRight="Borders: Hairline"
          >
            <div className="w-full scale-90 flex items-center justify-center">
              <MorphingNav />
            </div>
          </LabCard>

          {/* 04 — ScrollPathProcess (Span 8) */}
          <LabCard
            id="SYS_04"
            label="SCROLL_TIMELINE"
            status="PASSIVE_MODE"
            colSpan="md:col-span-8"
            title="ScrollPathProcess"
            description="Timelines and roadmaps drawn on-scroll to guide the user's focus through connected steps."
            statLeft="Steps: 3 Connected"
            statRight="Aesthetic: Neon"
          >
            <div className="w-full h-[220px] overflow-hidden flex items-center justify-center scale-[0.5] origin-center">
              <ScrollPathContainer mode="passive" className="h-full w-full">
                <ScrollPathProcess glow={true} strokeWidth={4} />
              </ScrollPathContainer>
            </div>
          </LabCard>

          {/* 05 — ExpandOnHover (Span 6) */}
          <LabCard
            id="SYS_05"
            label="GALLERY_STRETCH"
            status="SPRING_RDY"
            colSpan="md:col-span-6"
            title="ExpandOnHover"
            description="Interactive slide system displaying high-contrast imagery with spring expansions."
            statLeft="Images: 3"
            statRight="Easing: Spring"
          >
            <div className="w-full scale-90 flex items-center justify-center -my-6">
              <ExpandOnHover items={expandItems} variant="modern" animation="spring" />
            </div>
          </LabCard>

          {/* 06 — TextShuffle (Span 6) */}
          <LabCard
            id="SYS_06"
            label="TYPO_SHUFFLE"
            status="DECRYPT_LOOP"
            colSpan="md:col-span-6"
            title="TextShuffle"
            description="Decrypting text visualizer revealing characters dynamically with cipher and blur effects."
            statLeft="Font: Inter"
            statRight="Effect: BlurReveal"
          >
            <div className="py-6">
              <TextShuffle
                words={["OBSIDIAN", "TACTILE", "PREMIUM", "ENGINEERED"]}
                variant="blurReveal"
                fontSize="clamp(1.5rem, 4vw, 2.5rem)"
                fontWeight={800}
                loop={true}
              />
            </div>
          </LabCard>

          {/* 07 — LivingText (Span 7) */}
          <LabCard
            id="SYS_07"
            label="LIVING_TYPE"
            status="CURSOR_TRACK"
            colSpan="md:col-span-7"
            title="LivingText"
            description="Cursor-reactive text that stretches, rotates, and pushes characters dynamically based on proximity."
            statLeft="Radius: 170px"
            statRight="Mode: All"
          >
            <div className="py-6 w-full flex justify-center">
              <LivingText
                text="INTERACTIVE"
                radius={170}
                strength={46}
                mode="all"
                liquify={true}
              />
            </div>
          </LabCard>

          {/* 08 — LaserVaultPassword (Span 5) */}
          <LabCard
            id="SYS_08"
            label="LASER_VAULT"
            status="SECURE"
            colSpan="md:col-span-5"
            title="LaserVaultPassword"
            description="Passcode vault keypad with laser-etch cooling characters and tactile friction-metal clicks."
            statLeft="Digits: 4-6"
            statRight="Auth: Local"
          >
            <div className="scale-75 w-full flex items-center justify-center">
              <LaserVaultPassword />
            </div>
          </LabCard>

          {/* 09 — GravityCardStack (Span 6) */}
          <LabCard
            id="SYS_09"
            label="PHYSICS_STACK"
            status="MATTER_JS"
            colSpan="md:col-span-6"
            height="h-[500px]"
            title="GravityCardStack"
            description="Falling rigid body physics cards reacting to scroll triggers with cloth-style motion."
            statLeft="Bodies: 6"
            statRight="Engine: Matter.js"
          >
            <div className="w-full h-full relative overflow-hidden rounded-md border border-white/5">
              <GravityCardStack />
            </div>
          </LabCard>

          {/* 10 — MetallicForm (Span 6) */}
          <LabCard
            id="SYS_10"
            label="METALLIC_FORM"
            status="INCEPT"
            colSpan="md:col-span-6"
            height="h-[500px]"
            title="MetallicForm"
            description="Machined-metal obsidian form with sequential entry animations, validation overlays, and typing signals."
            statLeft="Fields: 3"
            statRight="Submit: Tactile"
          >
            <div className="w-full scale-[0.85] origin-center overflow-hidden">
              <MetallicForm
                title="OPERATOR ENTRY"
                subtitle="Secure channel registration"
                fields={formFields}
                onSubmit={async () => {
                  await new Promise((r) => setTimeout(r, 800));
                }}
                submitLabel="AUTHENTICATE"
              />
            </div>
          </LabCard>

          {/* 11 — WeaponWheel (Span 4) */}
          <LabCard
            id="SYS_11"
            label="RADIAL_SEL"
            status="INLINE_MODE"
            colSpan="md:col-span-4"
            title="WeaponWheel"
            description="Interactive radial selection menu inspired by GTA V with SVG slices and live stats."
            statLeft="Slices: Dynamic"
            statRight="Input: Hold Q"
          >
            <div className="w-full h-full flex items-center justify-center scale-90">
              <WeaponWheel items={wheelItems} inline={true} variant="default" />
            </div>
          </LabCard>

          {/* 12 — LuxuryButtons (Span 8) */}
          <LabCard
            id="SYS_12"
            label="LUXURY_DECK"
            status="ALL_SYSTEMS_GO"
            colSpan="md:col-span-8"
            height="h-[340px]"
            title="Luxury Buttons"
            description="Collection of premium tactile buttons: Void reveal, anisotropic titanium, liquid gold, and Guilloché."
            statLeft="Variants: 4"
            statRight="Surface: Machined"
          >
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-[8px] text-text-muted tracking-wider uppercase self-start">
                  01 // Void Reveal
                </span>
                <VoidButton className="w-full h-11 text-[10px]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-[8px] text-text-muted tracking-wider uppercase self-start">
                  02 // Titanium
                </span>
                <BrushedTitaniumButton className="w-full h-11 text-[10px]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-[8px] text-text-muted tracking-wider uppercase self-start">
                  03 // Liquid Gold
                </span>
                <LiquidGoldButton className="w-full h-11 text-[10px]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="font-mono text-[8px] text-text-muted tracking-wider uppercase self-start">
                  04 // Guilloché
                </span>
                <GuillocheButton className="w-full h-11 text-[10px]" />
              </div>
            </div>
          </LabCard>

          {/* 13 — SpotlightGrid (Span 12) */}
          <div className="md:col-span-12 h-[320px] border border-border-hairline relative overflow-hidden group hover:border-white transition-colors duration-300 spotlight-card border-glow-card rounded-lg shadow-2xl">
            <div className="spotlight-overlay" />
            <div className="border-beam" />

            {/* HUD Corner Accents */}
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-white/60 pointer-events-none z-20" />
            <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-white/60 pointer-events-none z-20" />
            <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-white/60 pointer-events-none z-20" />
            <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-white/60 pointer-events-none z-20" />

            {/* Header overlay */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20 select-none">
              <span className="font-mono text-[10px] text-white bg-surface-variant px-2 py-1 tracking-widest font-bold uppercase">
                SYS_13
              </span>
              <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
                DUAL_SPOTLIGHT
              </span>
            </div>

            {/* Background */}
            <div className="absolute inset-0 z-0">
              <SpotlightGrid />
            </div>

            {/* Footer overlay */}
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <div className="flex flex-col gap-1 select-none">
                <h3 className="font-display text-lg uppercase font-bold text-white tracking-tight">
                  SpotlightGrid
                </h3>
                <p className="font-body text-text-muted text-[11px] leading-relaxed max-w-md">
                  Dark grid with decorative tech icons and dual-layer mouse-following spotlight using screen and color-dodge blend modes.
                </p>
              </div>
              <div className="mt-3 border-t border-border-hairline pt-3 select-none">
                <div className="flex justify-between font-mono text-[10px] text-text-muted uppercase">
                  <span>Blend: Screen / Dodge</span>
                  <span>Tracking: Cursor</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer Telemetry ─── */}
        <div className="mt-20 border-t border-border-hairline pt-8 flex flex-col md:flex-row justify-between items-center gap-4 select-none">
          <div className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
            TERMINAL_ID: VOID_LAB_V1 // GRID: {13} ACTIVE
          </div>
          <div className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
            COORD_X: 144.02 // COORD_Y: 28.00 // LATENCY: 4MS
          </div>
        </div>
      </div>
    </main>
  );
}
