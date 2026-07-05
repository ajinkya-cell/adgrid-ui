"use client";

import { useState } from "react";

import {
  AnisotropicKnob,
  BreathingGrid,
  BrushedTitaniumButton,
  ChromeInput,
  ChromeSelect,
  CoverflowCarousel,
  DotMatrix,
  ExpandOnHover,
  FloatingEmbers,
  GravityCardStack,
  GuillocheButton,
  ImageParallax,
  ImageReveal,
  InfiniteScroll,
  LaserVaultPassword,
  LiquidGoldButton,
  LivingText,
  LuminaWave,
  MechanicalTimer,
  MetallicForm,
  MorphingNav,
  NowPlayingCard,
  PixelMeltBackground,
  PremiumHero,
  SimpleCard,
  SlingshotChassis,
  SpotlightGrid,
  TextShuffle,
  VoidButton,
  WheelPicker,
  ScrollProgress,
} from "@adgrid-ui/ui";
import { Cards } from "../../../../../packages/ui/src/animated/Cards";
import type { RegistryEntry } from "@/registry";

const imageOne = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80";
const imageTwo = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80";

const expandItems = [
  {
    id: "taj",
    title: "The Eternal Taj",
    subtitle: "Mausoleum / Agra",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&auto=format&fit=crop",
    description: "White marble, morning mist, and the quiet geometry of permanence.",
    badge: "Heritage",
    accent: "#E2E8F0",
  },
  {
    id: "varanasi",
    title: "Varanasi Riverfront",
    subtitle: "Ganga Aarti / Kashi",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=900&auto=format&fit=crop",
    description: "Stone steps descending into ritual light and ancient chants.",
    badge: "Spiritual",
    accent: "#A3A3A3",
  },
  {
    id: "jaipur",
    title: "Jaipur Palace",
    subtitle: "Hawa Mahal / Jaipur",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&auto=format&fit=crop",
    description: "A honeycomb facade shaped by wind, privacy, and royal street theatre.",
    badge: "Architecture",
    accent: "#D4D4D4",
  },
];

function FullscreenLabel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-center shadow-2xl backdrop-blur-md">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">{title}</div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">{subtitle}</div>
      </div>
    </div>
  );
}


function ScrollProgressDemo(props: any) {
  return (
    <div className="w-full text-white bg-[#111111] p-12">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide browser scrollbar only when scroll-progress demo is active */
        html, body {
          scrollbar-width: none !important;
        }
        ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}} />
      <ScrollProgress
        color="#e7e5df"
        glow
        ticks={42}
        {...props}
      />
      <div className="mx-auto max-w-2xl space-y-12 py-24">
        <h1 className="text-5xl font-bold uppercase tracking-tight text-white mb-8">
          Scroll Field Demo
        </h1>
        {[...Array(12)].map((_, i) => (
          <p key={i} className="text-lg leading-8 text-neutral-300 my-6">
            This is paragraph {i + 1} of a long scrollable document. We are rendering this text to create an overflow container so that the custom scroll progress indicator can be fully demonstrated. Scroll down with your mouse wheel or trackpad to see the tick marks illuminate as you move through the document. The faster you scroll, the more the indicator stretches and glows. Drag the scrollbar directly to scrub the scroll position in real-time.
          </p>
        ))}
      </div>
    </div>
  );
}

export function PresentationRenderer({
  entry,
  liveProps = {},
}: {
  entry: RegistryEntry;
  liveProps?: Record<string, unknown>;
}) {
  const [framework, setFramework] = useState("Next.js");

  switch (entry.slug) {
    case "image-reveal":
      return <ImageReveal src={imageOne} alt="Mountain landscape" width={420} height={540} />;
    case "image-parallax":
      return <ImageParallax src={imageTwo} alt="Aerial mountain landscape" height={420} caption="Above the Clouds" subcaption="Swiss Alps / morning pass" />;
    case "living-text": {
      const livingTextProps = {
        text: "LIVING TEXT",
        radius: 170,
        strength: 46,
        mode: "all" as const,
        liquify: true,
        ...liveProps,
      };
      return <LivingText {...(livingTextProps as Parameters<typeof LivingText>[0])} />;
    }
    case "gravity-card-stack":
      return <GravityCardStack />;
    case "morphing-nav":
      return <MorphingNav />;
    case "coverflow-carousel":
      return <CoverflowCarousel />;
    // ── Buttons category ───────────────────────────────────────────────────
    case "void-button": {
      const voidProps = {
        variant: "ambient" as const,
        disabled: false,
        children: "Void Button",
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px]">
          <VoidButton variant={voidProps.variant} disabled={voidProps.disabled}>
            {voidProps.children}
          </VoidButton>
        </div>
      );
    }
    case "brushed-titanium-button": {
      const titaniumProps = {
        disabled: false,
        children: "Titanium Button",
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px]">
          <BrushedTitaniumButton disabled={titaniumProps.disabled}>
            {titaniumProps.children}
          </BrushedTitaniumButton>
        </div>
      );
    }
    case "liquid-gold-button": {
      const goldProps = {
        children: "Liquid Gold",
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px]">
          <LiquidGoldButton>{goldProps.children}</LiquidGoldButton>
        </div>
      );
    }
    case "guilloche-button": {
      const guillocheProps = {
        children: "Guilloché",
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px]">
          <GuillocheButton>{guillocheProps.children}</GuillocheButton>
        </div>
      );
    }
    case "pixel-melt":
      return <><PixelMeltBackground /><FullscreenLabel title="Pixel Melt" subtitle="Move your cursor" /></>;
    case "breathing-grid":
      return <><BreathingGrid /><FullscreenLabel title="Breathing Grid" subtitle="Cursor-responsive field" /></>;
    case "floating-embers":
      return <><FloatingEmbers /><FullscreenLabel title="Floating Embers" subtitle="Scroll and cursor drift" /></>;
    case "spotlight-grid":
      return <SpotlightGrid><FullscreenLabel title="Spotlight Grid" subtitle="Move through the field" /></SpotlightGrid>;
    case "lumina-wave":
      return <><LuminaWave /><FullscreenLabel title="Lumina Wave" subtitle="Interactive aurora surface" /></>;
    case "chrome-input":
      return <ChromeInput placeholder="Transmission ID" className="w-[320px]" />;
    case "chrome-select":
      return <ChromeSelect className="w-[320px]" options={[{ label: "Obsidian", value: "obsidian" }, { label: "Titanium", value: "titanium" }, { label: "Carbon", value: "carbon" }]} />;
    case "metallic-form":
      return (
        <MetallicForm
          title="Access Request"
          subtitle="Machined input system for high-friction workflows."
          submitLabel="Transmit"
          fields={[
            { name: "name", label: "Name", placeholder: "Ada Lovelace", required: true },
            { name: "email", label: "Email", type: "email", placeholder: "ada@void.dev", required: true },
            {
              name: "clearance",
              label: "Clearance",
              type: "select",
              required: true,
              options: [
                { value: "operator", label: "Operator" },
                { value: "architect", label: "Architect" },
                { value: "observer", label: "Observer" },
              ],
            },
            { name: "message", label: "Message", type: "textarea", placeholder: "State the request vector." },
          ]}
          onSubmit={async () => {}}
        />
      );
    case "anisotropic-knob":
      return <AnisotropicKnob label="DECIBELS" size={132} />;
    case "mechanical-timer":
      return <MechanicalTimer />;
    case "slingshot-chassis":
      return <SlingshotChassis />;
    case "laser-vault-password":
      return <LaserVaultPassword />;
    case "premium-hero":
      return <div className="min-h-dvh w-full bg-white"><PremiumHero /></div>;
    case "dot-matrix": {
      const dotMatrixProps = {
        animation: "scroll-text" as const,
        text: "VOID UI",
        columns: 44,
        rows: 12,
        color: "#e7e5df",
        glow: true,
        ...liveProps,
      };
      return <DotMatrix {...(dotMatrixProps as Parameters<typeof DotMatrix>[0])} />;
    }
    case "scroll-progress":
      return <ScrollProgressDemo {...liveProps} />;
    case "now-playing-card":
      return <NowPlayingCard song={{ isPlaying: true, title: "Main Chala Jaunga", artist: "Fiddlecraft", album: "Hawai Jahaaz", image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/c7/65/41c765a0-5a1e-3e35-9c22-5d664da2b95e/cover.jpg/600x600bb.jpg", songUrl: "https://open.spotify.com", playedAt: null }} />;
    case "wheel-picker": {
      const wheelPickerProps = {
        items: ["React", "Vue", "Angular", "Next.js", "Svelte", "Solid", "Qwik"],
        value: framework,
        onChange: setFramework,
        variant: "glass" as const,
        loop: false,
        sound: false,
        ...liveProps,
      };
      return (
        <div className="flex flex-col items-center gap-7">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">Selected Framework</div>
            <div className="mt-2 font-display text-3xl font-bold text-white">{framework}</div>
          </div>
          <div className="w-[240px]">
            <WheelPicker {...(wheelPickerProps as Parameters<typeof WheelPicker>[0])} />
          </div>
        </div>
      );
    }
    case "expand-on-hover":
      return <div className="w-full max-w-xl"><ExpandOnHover items={expandItems} variant="modern" animation="spring" /></div>;
    case "text-shuffle": {
      const textShuffleProps = {
        words: ["Like This?", "Connect", "For More", "Such Projects"],
        variant: "blurReveal" as const,
        fontSize: "clamp(2.5rem,8vw,6rem)",
        fontWeight: 800,
        ...liveProps,
      };
      return <TextShuffle {...(textShuffleProps as Parameters<typeof TextShuffle>[0])} />;
    }
    case "infinite-scroll":
      return (
        <InfiniteScroll
          slides={[
            { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", label: "Mountain landscape" },
            { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80", label: "Forest trail" },
            { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80", label: "Foggy forest" },
          ]}
        />
      );
    case "cards":
      return (
        <div className="flex items-center justify-center w-full min-h-[900px]">
          <Cards />
        </div>
      );
    case "simple-card":
      return (
        <div className="flex items-center justify-center w-full min-h-[400px]">
          <SimpleCard
            title="Working Knowledge"
            description="Practical skills and insights gained through hands-on experience that drive real-world problem solving."
            imageUrl="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=520&h=380&fit=crop&auto=format"
            accent="from-amber-950/80 to-stone-950/95"
            topBorderColor="rgba(251,191,36,0.28)"
          />
        </div>
      );
    default:
      return <div className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Preview unavailable</div>;
  }
}
