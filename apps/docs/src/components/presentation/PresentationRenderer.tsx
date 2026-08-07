"use client";

import { useState } from "react";

import {
  AnisotropicKnob,
  BreathingGrid,
  BreathingBackground,
  BrushedTitaniumButton,
  ButtonAlpha,
  BeveledBeamShowcase,
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
  SpotlightText,
  LuminaWave,
  MatrixRain,

  MorphingNav,
  NowPlayingCard,
  PixelMeltBackground,
  PremiumHero,
  SimpleCard,
  DashedFeatureCard,
  DashedMarquee,
  Marquee2,
  BevelAccordion,
  StickerCard,
  Datepicker,
  NavBar1,
  BevelAlertDialog,
  SpotlightGrid,
  FlickeringGrid,
  FlickeringGridPlayground,
  DotPattern,
  DotPatternPlayground,
  TextShuffle,
  VoidButton,
  WheelPicker,
  ScrollProgress,
  CardsTwo,
  WeaponWheel,
  Hero,
  AnimatedIcons1,
  ForgeUILanding,
  MoonLanding,
  RaysLanding,
  BreathingScaleCard,
  GithubHeatmap,
  DeveloperIdCard,
  Sidebar,
  CommandPalette,
  Switch,
  OTPInput,
  Tooltip,
  Stepper,
  Globe,
  BentoGrid,
  BentoGridItem,
} from "@adgrid-ui/ui";
import { Cards } from "../../../../../packages/ui/src/animated/Cards";
import {
  ScrollPathContainer,
  ScrollPathWaves,
  ScrollPathCircuit,
  ScrollPathProcess,
} from "../../../../../packages/ui/src/animated/scrollpath";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import {
  IconBrandReact,
  IconBrandNodejs,
  IconBrandPython,
  IconBrandDocker,
  IconDatabase,
  IconGitBranch,
  IconShieldCheck,
  IconTerminal2,
  IconBrandNextjs,
  IconBrandTailwind,
  IconBrandSvelte,
  IconBrandGolang,
  IconBrandRust,
  IconBolt,
  IconFlame,
  IconCpu,
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandVscode,
  IconCode,
  IconTerminal,
  IconBrandChrome,
  IconEye,
} from "@tabler/icons-react";

const imageOne = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80";
const imageTwo = "/utils/image-parallax.png";

const weaponWheelDevItems = [
  {
    id: "ide",
    name: "Terminal & Editor",
    category: "IDE / Dev Environment",
    icon: "neovim",
    description: "Your mission control center. Custom shell configs, NeoVim, VS Code, keybinds, and macros for blisteringly fast code execution and command management.",
    tips: [
      "Set up tmux to maintain persistent local sessions.",
      "Use keyboard shortcuts to avoid grabbing the mouse.",
    ],
    stats: { dx: 95, performance: 75, reliability: 80, versatility: 90 },
    subItems: [
      { id: "neovim", name: "NeoVim Editor", icon: "neovim", category: "Text Editor", description: "Hyper-extensible Vim-based text editor built for extreme speed and keybinding flow." },
      { id: "vscode", name: "VS Code Editor", icon: "vscode", category: "IDE Studio", description: "Modern, feature-rich IDE with full ecosystem extensions and visual debugging." },
      { id: "terminal", name: "Tmux Terminal", icon: "terminal", category: "Multiplexer", description: "Terminal multiplexer to manage multiple CLI panes and persistent sessions." },
    ],
  },
  {
    id: "frontend",
    name: "React & Next.js",
    category: "User Interfaces",
    icon: "react",
    description: "Component-driven layout engine. Tailwind styling, server actions, client side rendering, hooks, and responsive UX design to wow your end users.",
    tips: [
      "Use React Server Components to minimize bundle size.",
      "Keep state colocated with the components that use it.",
    ],
    stats: { dx: 90, performance: 70, reliability: 75, versatility: 80 },
    subItems: [
      { id: "nextjs", name: "Next.js Framework", icon: "nextjs", category: "React Framework", description: "Production-ready server-side rendering framework with built-in routing and caching." },
      { id: "react", name: "React Library", icon: "react", category: "UI Library", description: "Declarative, component-based library for building interactive frontend applications." },
      { id: "tailwind", name: "Tailwind CSS", icon: "tailwind", category: "Styling Engine", description: "Utility-first CSS framework for rapid styling directly within HTML structures." },
      { id: "svelte", name: "Svelte Compile", icon: "svelte", category: "Compiler", description: "Highly efficient compiler-based reactive UI framework with zero virtual DOM overhead." },
    ],
  },
  {
    id: "backend",
    name: "Node.js & Go",
    category: "APIs & Services",
    icon: "nodejs",
    description: "Asynchronous backend runtimes. REST endpoints, GraphQL servers, WebSockets, rate limiters, middleware pipelines, and cluster scaling.",
    tips: [
      "Use lightweight Go microservices for compute-heavy tasks.",
      "Implement structured logging for production debugging.",
    ],
    stats: { dx: 80, performance: 90, reliability: 85, versatility: 85 },
    subItems: [
      { id: "nodejs", name: "Node.js Platform", icon: "nodejs", category: "JS Runtime", description: "Asynchronous, event-driven JavaScript runtime built on Chrome's V8 engine." },
      { id: "golang", name: "Go Language", icon: "golang", category: "System Language", description: "Statically typed system language with concurrent goroutines and extreme speed." },
      { id: "rust", name: "Rust Language", icon: "rust", category: "Safe Compiler", description: "Blazing fast system compiler with memory safety and zero-cost abstractions." },
    ],
  },
  {
    id: "database",
    name: "PostgreSQL & Redis",
    category: "Data Storage",
    icon: "postgres",
    description: "Relational persistence and fast in-memory key-value caching. Structured ACID transactions, query optimizations, indexing, and connection pools.",
    tips: [
      "Analyze query plans with EXPLAIN ANALYZE before deploying.",
      "Set TTL on cache entries to prevent memory leaks.",
    ],
    stats: { dx: 75, performance: 95, reliability: 95, versatility: 70 },
    subItems: [
      { id: "postgres", name: "PostgreSQL DB", icon: "postgres", category: "SQL Store", description: "Powerful, open source object-relational SQL database with robust JSON support." },
      { id: "redis", name: "Redis Cache", icon: "redis", category: "KV In-Memory", description: "In-memory key-value store optimized for lightning-fast transient cache queries." },
      { id: "mongodb", name: "MongoDB DB", icon: "mongodb", category: "NoSQL Store", description: "Flexible document-oriented database storing JSON-like dynamic schemaless structures." },
    ],
  },
  {
    id: "devops",
    name: "Docker & K8s",
    category: "Infrastructure",
    icon: "docker",
    description: "Containerized environments and orchestration. CI/CD pipelines, cloud deployment, load balancing, SSL management, and automated rollouts.",
    tips: [
      "Write multi-stage Dockerfiles to build lightweight images.",
      "Define resource requests/limits in Kubernetes manifests.",
    ],
    stats: { dx: 60, performance: 85, reliability: 90, versatility: 95 },
    subItems: [
      { id: "docker", name: "Docker Platform", icon: "docker", category: "Virtual Containers", description: "Packaged, isolated application environments that run identically on any machine." },
      { id: "github", name: "GitHub Actions", icon: "github", category: "CI/CD Pipeline", description: "Automated workflow runner for build automation, testing, and cloud delivery pipelines." },
    ],
  },
  {
    id: "ai",
    name: "Python & LLMs",
    category: "Machine Learning",
    icon: "python",
    description: "Data analysis, ML frameworks, and generative AI models. Local model orchestration, embeddings search, prompt engineering, and agentic workflows.",
    tips: [
      "Use vector databases for RAG semantic memory retrieval.",
      "Prefer streaming responses for better conversational UX.",
    ],
    stats: { dx: 85, performance: 80, reliability: 70, versatility: 90 },
    subItems: [
      { id: "python", name: "Python Language", icon: "python", category: "Data Science", description: "Dynamic language with massive libraries for AI, data analysis, and scripts." },
      { id: "graphql", name: "GraphQL API", icon: "graphql", category: "Query API", description: "Declarative API query language providing client-specified data fetching." },
    ],
  },
  {
    id: "git",
    name: "Git & Workflows",
    category: "Version Control",
    icon: IconGitBranch,
    description: "Distributed version control. Branching strategies, interactive rebasing, merge conflict resolution, pre-commit hooks, and code review flows.",
    tips: [
      "Write semantic, descriptive commit messages (Conventional Commits).",
      "Keep commits atomic to make debugging regression bugs trivial.",
    ],
    stats: { dx: 85, performance: 90, reliability: 95, versatility: 100 },
    subItems: [
      { id: "github", name: "GitHub Services", icon: IconBrandGithub, category: "Code Hub", description: "Cloud repository hosting, code reviews, discussions, and developer workflows." },
      { id: "gitlab", name: "GitLab Platform", icon: IconBrandGitlab, category: "CI/CD Hub", description: "Integrated devops platform covering project management and code pipelines." },
    ],
  },
  {
    id: "testing",
    name: "Jest & Playwright",
    category: "Quality Assurance",
    icon: IconShieldCheck,
    description: "Automated regression prevention. Unit tests, integration tests, E2E browser flows, visual regression checking, and coverage reports.",
    tips: [
      "Test user-visible behavior rather than internal implementation details.",
      "Run regression test suites in parallel on CI/CD pipelines.",
    ],
    stats: { dx: 70, performance: 65, reliability: 100, versatility: 75 },
    subItems: [
      { id: "jest", name: "Jest Framework", icon: IconShieldCheck, category: "Unit Testing", description: "Delightful JavaScript testing framework with mocking and snapshot tools." },
      { id: "playwright", name: "Playwright E2E", icon: IconBrandChrome, category: "E2E Testing", description: "Fast, reliable end-to-end browser automation for modern web applications." },
      { id: "cypress", name: "Cypress Testing", icon: IconEye, category: "UI Automation", description: "Front-end testing tool that runs directly inside visual browser environments." },
    ],
  },
];

const expandItems = [
  {
    id: "akira",
    title: "Akira",
    year: "1988",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "spirited-away",
    title: "Spirited Away",
    year: "2001",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "evangelion",
    title: "Neon Genesis Evangelion",
    year: "1995",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "your-name",
    title: "Your Name",
    year: "2016",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=85&auto=format&fit=crop",
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

function ScrollPathDrawDemo(props: any) {
  const [variant, setVariant] = useState<"waves" | "circuit" | "process">("waves");
  const [mode, setMode] = useState<"scroll-jack" | "passive">("scroll-jack");

  return (
    <div className="w-full text-white bg-[#0a0a0a] min-h-screen relative">
      {/* Top Floating Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Variant:</span>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as any)}
            className="bg-zinc-900 border border-white/15 rounded-md px-2 py-1 text-xs text-white outline-none cursor-pointer"
          >
            <option value="waves">Waves (Original)</option>
            <option value="circuit">Cyberpunk Circuit</option>
            <option value="process">Step Timeline</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Mode:</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="bg-zinc-900 border border-white/15 rounded-md px-2 py-1 text-xs text-white outline-none cursor-pointer"
          >
            <option value="scroll-jack">Scroll Jack</option>
            <option value="passive">Passive Scroll</option>
          </select>
        </div>
      </div>

      {mode === "scroll-jack" ? (
        <div className="w-full">
          <ScrollPathContainer mode="scroll-jack" {...props}>
            {variant === "waves" && <ScrollPathWaves />}
            {variant === "circuit" && <ScrollPathCircuit />}
            {variant === "process" && <ScrollPathProcess />}
          </ScrollPathContainer>

          <div className="min-h-screen bg-zinc-900/50 border-t border-white/5 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-5xl font-bold mb-4">Continue Scrolling</h2>
              <p className="text-xl text-zinc-400 font-mono">Scroll locking is now released!</p>
            </div>
          </div>
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-5xl font-bold mb-4">Additional Section</h2>
              <p className="text-xl text-zinc-500 font-mono">End of scroll path demo</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-24 max-w-4xl mx-auto px-6 space-y-12 w-full">
          <h1 className="text-5xl font-bold uppercase tracking-tight text-white mb-8">
            Passive Scroll Path
          </h1>
          <p className="text-lg leading-8 text-neutral-300">
            Scroll down to see the SVG drawing animate passively based on its viewport position, without scroll locking.
          </p>
          {[...Array(3)].map((_, i) => (
            <p key={i} className="text-lg leading-8 text-neutral-400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}

          <div className="border border-white/10 rounded-3xl bg-zinc-950/40 p-4">
            <ScrollPathContainer mode="passive" {...props}>
              {variant === "waves" && <ScrollPathWaves />}
              {variant === "circuit" && <ScrollPathCircuit />}
              {variant === "process" && <ScrollPathProcess />}
            </ScrollPathContainer>
          </div>

          {[...Array(4)].map((_, i) => (
            <p key={i} className="text-lg leading-8 text-neutral-400">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
      )}
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
  const playTactileSounds = usePresentationStore((state) => state.settings.playTactileSounds !== false);
  const [framework, setFramework] = useState("Next.js");

  switch (entry.slug) {
    case "image-reveal":
      return <ImageReveal />;
    case "image-parallax": {
      const imageParallaxProps = {
        src: imageTwo,
        alt: "Aerial mountain landscape",
        height: 420,
        depth: 10,
        tiltAmount: 5,
        ...liveProps,
      };
      return <ImageParallax {...(imageParallaxProps as any)} />;
    }
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
    case "spotlight-text": {
      const spotlightTextProps = {
        text: "Antimetal",
        theme: "light" as const,
        spotlightRadius: 120,
        showBulb: true,
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="relative bg-surface-charcoal border-y border-border-hairline rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_35px_70px_-10px_rgba(0,0,0,1),inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 p-6">
            <SpotlightText {...(spotlightTextProps as Parameters<typeof SpotlightText>[0])} />
          </div>
        </div>
      );
    }
    case "gravity-card-stack":
      return <GravityCardStack />;
    case "morphing-nav":
      return <MorphingNav />;
    case "coverflow-carousel":
      return <CoverflowCarousel />;
    case "cards-two": {
      const sampleCards = [
        {
          id: 1,
          title: "Spatial Computing",
          subtitle: "Apple Vision Pro",
          description: "Digital content blends seamlessly with physical space for infinite screen canvases.",
          image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
          badge: "Spatial",
        },
        {
          id: 2,
          title: "Glyph Interface",
          subtitle: "Nothing Phone (2)",
          description: "A screen-less tech interface communicating through glyph lights and sound patterns.",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
          badge: "Glyphs",
        },
        {
          id: 3,
          title: "Linear Cycles",
          subtitle: "Productivity",
          description: "Streamline software releases and keep product engineering teams aligned instantly.",
          image: "https://images.unsplash.com/photo-1618005198143-d528b96f2e47?w=800&q=80",
          badge: "Linear",
        },
        {
          id: 4,
          title: "Frosted Glass UI",
          subtitle: "Design Trend",
          description: "Frosted glass panels refract light and colors dynamically based on background physics.",
          image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
          badge: "Glass",
        },
        {
          id: 5,
          title: "Bento Boxes",
          subtitle: "Editorial Grid",
          description: "Curated grids displaying multiple fields of info in a structured, neat grid layout.",
          image: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&q=80",
          badge: "Bento",
        },
        {
          id: 6,
          title: "Framer Motion 3D",
          subtitle: "GPU Animations",
          description: "Smooth GPU accelerated layout transitions on standard CSS 3D transforms.",
          image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80",
          badge: "Motion",
        },
        {
          id: 7,
          title: "Monospace Typography",
          subtitle: "Editorials",
          description: "Sleek and highly structured type layouts with raw industrial aesthetics.",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
          badge: "Editorial",
        },
        {
          id: 8,
          title: "Ray Traced Shadows",
          subtitle: "Atmospherics",
          description: "Stunning ray traced lighting computations reflecting off dark metallic panels.",
          image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&q=80",
          badge: "Shadows",
        },
        {
          id: 9,
          title: "Micro-interactions",
          subtitle: "UI Feedback",
          description: "Tiny micro-animations reacting dynamically to user attention inputs.",
          image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
          badge: "Inputs",
        },
        {
          id: 10,
          title: "Generative Grids",
          subtitle: "Algorithms",
          description: "Procedural grid layouts calculated on-the-fly to fit responsive screens.",
          image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
          badge: "Math",
        },
        {
          id: 11,
          title: "Anisotropic Surfaces",
          subtitle: "Brushed Metals",
          description: "Complex lighting reflections computed along custom micro-brushed directions.",
          image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
          badge: "Materials",
        },
        {
          id: 12,
          title: "Tactile Keypads",
          subtitle: "Neomorphism",
          description: "Extremely soft shadows representing a physical, button-like interface.",
          image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
          badge: "Tactile",
        },
        {
          id: 13,
          title: "Organic Curves",
          subtitle: "Fluids",
          description: "Generative fluid physics simulating natural gas/water movements dynamically.",
          image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
          badge: "Fluids",
        },
        {
          id: 14,
          title: "Parallax Horizons",
          subtitle: "Depth Fields",
          description: "Multi-layered scrolling panels translating independently in spatial space.",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
          badge: "Depth",
        },
        {
          id: 15,
          title: "Obsidian Colorways",
          subtitle: "Palettes",
          description: "A combination of obsidian black and neon green highlights for spatial devices.",
          image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
          badge: "Colors",
        },
        {
          id: 16,
          title: "Dynamic Shaders",
          subtitle: "Interactive",
          description: "Real-time noise and wave shaders updating dynamically on GPU draw calls.",
          image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
          badge: "Shaders",
        }
      ];

      const cardsTwoProps = {
        cards: sampleCards,
        radius: 650, // Larger radius to accommodate 16 cards spaced out beautifully
        gap: 40,
        cardWidth: 260,
        cardHeight: 365,
        background: "gradient" as const,
        ringTiltX: 18, // 18 degree isometric tilt matches the video description
        faceCamera: false, // Ensures tangent alignment for narrowing/skewing at the sides
        ...liveProps,
        hideBackCards: true, // Force hide back cards to keep the center layout completely clean
      };

      return (
        <div className="flex items-center justify-center w-full min-h-[580px] py-16">
          <CardsTwo {...cardsTwoProps} />
        </div>
      );
    }
    // ── Buttons category ───────────────────────────────────────────────────
    case "void-button": {
      const voidProps = {
        variant: "ambient" as const,
        style: "default" as const,
        children: "Void Button",
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px]">
          <VoidButton variant={voidProps.variant} style={voidProps.style}>
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
    case "button-alpha": {
      const alphaProps = {
        children: "ACTIVATE",
        shape: "pill" as const,
        theme: "charcoal" as const,
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px]">
          <ButtonAlpha shape={alphaProps.shape} theme={alphaProps.theme}>
            {alphaProps.children}
          </ButtonAlpha>
        </div>
      );
    }
    case "animated-beam": {
      const beamProps = {
        variant: "default" as const,
        pathWidth: 3.5,
        pathOpacity: 0.9,
        duration: 3.5,
        ...liveProps,
      };

      const leftItems = [
        { id: "database", icon: <IconDatabase size={20} className="text-red-500" />, beamStartColor: "#ef4444", beamStopColor: "#ea580c" },
        { id: "nodejs", icon: <IconBrandNodejs size={20} className="text-emerald-500" />, beamStartColor: "#22c55e", beamStopColor: "#16a34a" },
        { id: "python", icon: <IconBrandPython size={20} className="text-yellow-500" />, beamStartColor: "#eab308", beamStopColor: "#ca8a04" },
      ];

      const rightItems = [
        { id: "nextjs", icon: <IconBrandNextjs size={20} className="text-white" />, beamStartColor: "#ffffff", beamStopColor: "#d4d4d8" },
        { id: "docker", icon: <IconBrandDocker size={20} className="text-cyan-400" />, beamStartColor: "#06b6d4", beamStopColor: "#0284c7" },
        { id: "github", icon: <IconBrandGithub size={20} className="text-purple-400" />, beamStartColor: "#a855f7", beamStopColor: "#9333ea" },
      ];

      return (
        <div className="flex items-center justify-center w-full min-h-[350px]">
          <BeveledBeamShowcase
            variant={beamProps.variant}
            centerIcon={<IconBrandReact size={32} className="text-cyan-400 animate-[spin_12s_linear_infinite]" />}
            centerShape="circle"
            leftItems={leftItems}
            rightItems={rightItems}
            pathWidth={beamProps.pathWidth}
            pathOpacity={beamProps.pathOpacity}
            duration={beamProps.duration}
          />
        </div>
      );
    }
    case "pixel-melt":
      return <><PixelMeltBackground /><FullscreenLabel title="Pixel Melt" subtitle="Move your cursor" /></>;
    case "breathing-grid":
      return <><BreathingGrid /><FullscreenLabel title="Breathing Grid" subtitle="Cursor-responsive field" /></>;
    case "breathing-background":
      return (
        <>
          <BreathingBackground {...(liveProps as any)} />
          <FullscreenLabel title="Breathing Background" subtitle="Ambient Pattern Field" />
        </>
      );
    case "floating-embers":
      return <><FloatingEmbers /><FullscreenLabel title="Floating Embers" subtitle="Scroll and cursor drift" /></>;
    case "spotlight-grid":
      return <SpotlightGrid><FullscreenLabel title="Spotlight Grid" subtitle="Move through the field" /></SpotlightGrid>;
    case "lumina-wave":
      return <><LuminaWave /><FullscreenLabel title="Lumina Wave" subtitle="Interactive aurora surface" /></>;
    case "matrix-rain": {
      const rainProps = {
        speed: 1.0,
        density: 1.0,
        fontSize: 16,
        decayRate: 0.05,
        glowStrength: 8,
        opacity: 0.35,
        color: "#525252",
        glowColor: "#ffffff",
        ...liveProps,
      };
      return (
        <MatrixRain
          speed={rainProps.speed}
          density={rainProps.density}
          fontSize={rainProps.fontSize}
          decayRate={rainProps.decayRate}
          glowStrength={rainProps.glowStrength}
          opacity={rainProps.opacity}
          color={rainProps.color}
          glowColor={rainProps.glowColor}
        />
      );
    }

    case "chrome-input":
      return <ChromeInput placeholder="Transmission ID" className="w-[320px]" />;
    case "chrome-select":
      return <ChromeSelect className="w-[320px]" options={[{ label: "Obsidian", value: "obsidian" }, { label: "Titanium", value: "titanium" }, { label: "Carbon", value: "carbon" }]} />;
    case "anisotropic-knob":
      return <AnisotropicKnob size={132} sound={playTactileSounds} {...liveProps} />;
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
    case "scroll-path-draw":
      return <ScrollPathDrawDemo {...liveProps} />;
    case "now-playing-card":
      return <NowPlayingCard song={{ isPlaying: true, title: "Main Chala Jaunga", artist: "Fiddlecraft", album: "Hawai Jahaaz", image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/c7/65/41c765a0-5a1e-3e35-9c22-5d664da2b95e/cover.jpg/600x600bb.jpg", songUrl: "https://open.spotify.com", playedAt: null }} />;
    case "wheel-picker": {
      const wheelPickerProps = {
        items: ["React", "Vue", "Angular", "Next.js", "Svelte", "Solid", "Qwik"],
        value: framework,
        onChange: setFramework,
        variant: "glass" as const,
        loop: false,
        sound: playTactileSounds,
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
    case "weapon-wheel": {
      const [activeTool, setActiveTool] = useState(weaponWheelDevItems[0]);

      const weaponWheelProps = {
        items: weaponWheelDevItems,
        activeId: activeTool.id,
        onChange: (item: any) => setActiveTool(item),
        triggerKey: "q",
        inline: true,
        variant: "default" as const,
        ...liveProps,
      };

      return (
        <div className="w-full max-w-6xl p-4 flex flex-col items-center justify-center min-h-[700px] select-none">
          <WeaponWheel
            {...weaponWheelProps}
            className="w-full"
          />
        </div>
      );
    }

    case "hero": {
      const heroProps = {
        name: "stephanie",
        bgColor: "#1E3FEB",
        gridOpacity: 0.06,
        fontFamily: "instrument" as const,
        monoFontFamily: "dotgothic" as const,
        iconVariant: "flower" as const,
        iconAnimation: "static" as const,
        iconPosition: "inline" as const,
        iconSize: 36,
        iconRotation: 0,
        pixelDensity: "medium" as const,
        enableParallax: true,
        animationSpeed: "normal" as const,
        backgroundIconVariant: "cross" as const,
        backgroundIconCount: 8,
        introduction: "I build high-end interactive visual systems and graphics for digital exhibitions, museums, and products.",
        ...liveProps,
      };

      return (
        <div className="w-full h-screen relative select-none">
          <Hero {...(heroProps as any)} />
        </div>
      );
    }
    case "forgeui-landing": {
      return (
        <div className="w-full min-h-screen relative">
          <ForgeUILanding 
            onDocumentation={() => console.log("Documentation clicked")}
          />
        </div>
      );
    }
    case "moon-landing": {
      return (
        <div className="w-full min-h-screen relative">
          <MoonLanding />
        </div>
      );
    }
    case "rays-landing": {
      return (
        <div className="w-full min-h-screen relative">
          <RaysLanding {...liveProps} />
        </div>
      );
    }
    case "breathing-scale-card": {
      return (
        <div className="flex items-center justify-center w-full min-h-[450px] p-8">
          <BreathingScaleCard className="w-full max-w-md" {...(liveProps as any)}>
            <h3 className="font-['Inter',sans-serif] text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white via-white/85 to-white/35 bg-clip-text text-transparent">
              Breathing Card
            </h3>
          </BreathingScaleCard>
        </div>
      );
    }
    case "github-heatmap": {
      return (
        <div className="flex items-center justify-center w-full min-h-[450px] p-4 md:p-8">
          <GithubHeatmap className="w-full max-w-4xl" username="ajinkya-cell" {...(liveProps as any)} />
        </div>
      );
    }
    case "developer-id-card": {
      return (
        <div className="flex items-center justify-center w-full min-h-[550px] p-4 md:p-8">
          <DeveloperIdCard {...(liveProps as any)} />
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
          />
        </div>
      );
    case "dashed-feature-card": {
      const cardProps = {
        title: "My Issues",
        description: "Issue tracker",
        showCorners: true,
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[400px]">
          <DashedFeatureCard {...(cardProps as Parameters<typeof DashedFeatureCard>[0])} />
        </div>
      );
    }
    case "dashed-marquee": {
      const dummyMarqueeItems = [
        { id: 1, title: "Next.js Framework", description: "Production build server", icon: <IconBrandNextjs size={20} /> },
        { id: 2, title: "Rust Compiler", description: "Systems execution speed", icon: <IconBrandRust size={20} /> },
        { id: 3, title: "Docker Container", description: "Kubernetes orchestration", icon: <IconBrandDocker size={20} /> },
        { id: 4, title: "Tailwind Styling", description: "Design tokens layout", icon: <IconBrandTailwind size={20} /> },
        { id: 5, title: "Go Microservice", description: "Concurrent backend router", icon: <IconBrandGolang size={20} /> },
        { id: 6, title: "Database Layer", description: "Postgres connection pool", icon: <IconDatabase size={20} /> },
        { id: 7, title: "Svelte Frontend", description: "Reactive compiler DOM", icon: <IconBrandSvelte size={20} /> },
      ];

      const canvasColor = usePresentationStore((state) => state.settings.canvasColor ?? "#111111");

      const marqueeProps = {
        items: dummyMarqueeItems,
        fadeColor: canvasColor,
        ...liveProps,
      };

      return (
        <div className="w-full h-screen flex items-center justify-center">
          <DashedMarquee {...marqueeProps} className="w-full h-full border-none" />
        </div>
      );
    }
    case "bevel-accordion": {
      const dummyAccordionItems = [
        {
          id: "1",
          title: "System Engine Settings",
          description: "Manage execution defaults",
          content: "Configure global widgets, refresh intervals, security sessions, and administrative account permissions from a single interface.",
          icon: <IconTerminal2 size={16} />,
        },
        {
          id: "2",
          title: "Database Sync Layer",
          description: "Realtime data replications",
          content: "Monitor read/write operations, backup states, replication lags, and cloud synchronization processes across multi-region databases.",
          icon: <IconDatabase size={16} />,
        },
        {
          id: "3",
          title: "API Integrations",
          description: "Webhooks and key channels",
          content: "Set up incoming webhook listeners, developer API key authentication headers, logs routing, and developer options for third-party platforms.",
          icon: <IconBolt size={16} />,
        },
      ];
      const accordionProps = {
        items: dummyAccordionItems,
        ...liveProps,
      };
      return (
        <div className="w-full min-h-screen flex items-center justify-center p-6 bg-transparent">
          <div className="w-full max-w-xl">
            <BevelAccordion {...(accordionProps as Parameters<typeof BevelAccordion>[0])} />
          </div>
        </div>
      );
    }
    case "marquee-2": {
      const marquee2Props = {
        ...liveProps,
      };
      return (
        <div className="w-full min-h-screen flex items-center justify-center p-6 bg-transparent">
          <Marquee2 {...(marquee2Props as Parameters<typeof Marquee2>[0])} />
        </div>
      );
    }
    case "sticker-card": {
      const stickerCardProps = {
        ...liveProps,
      };
      return (
        <div className="pt-16">
          <StickerCard {...(stickerCardProps as Parameters<typeof StickerCard>[0])} />
        </div>
      );
    }
    case "datepicker": {
      const datepickerProps = {
        ...liveProps,
      };
      return (
        <div className="w-full min-h-screen flex items-center justify-center pb-32 p-6 bg-transparent">
          <Datepicker {...(datepickerProps as Parameters<typeof Datepicker>[0])} />
        </div>
      );
    }
    case "navbar-1": {
      const navbarProps = {
        ...liveProps,
      };
      return (
        <div className="w-full min-h-screen flex items-center justify-center p-6 bg-transparent">
          <NavBar1 {...(navbarProps as Parameters<typeof NavBar1>[0])} />
        </div>
      );
    }
    case "bevel-alert-dialog": {
      return (
        <BevelAlertDialogDemo liveProps={liveProps} />
      );
    }
    case "flickering-grid":
      return (
        <div className="relative w-full h-full min-h-[450px] border border-white/5 bg-[#030303] rounded-2xl overflow-hidden">
          <FlickeringGrid className="absolute inset-0 w-full h-full" color="#a78bfa" squareSize={4} gridGap={6} flickerChance={0.3} maxOpacity={0.3} />
        </div>
      );
    case "flickering-grid-playground":
      return <FlickeringGridPlayground />;
    case "dot-pattern":
      return (
        <div className="relative w-full h-full min-h-[450px] border border-white/5 bg-[#030303] rounded-2xl overflow-hidden">
          <DotPattern className="absolute inset-0 w-full h-full" color="#a78bfa" width={16} height={16} cr={1.2} />
        </div>
      );
    case "dot-pattern-playground":
      return <DotPatternPlayground />;
    case "animated-icons-1":
      return <AnimatedIcons1 />;
    case "sidebar":
      return <SidebarDemo liveProps={liveProps} />;
    case "command-palette":
      return <CommandPaletteDemo />;
    case "switch":
      return <Switch {...liveProps} />;
    case "otp-input":
      return <OTPInputDemo />;
    case "tooltip":
      return <TooltipDemo />;
    case "stepper":
    case "timeline":
      return <StepperDemo />;
    case "globe":
      return <Globe />;
    case "bento-grid":
      return <BentoGridDemo liveProps={liveProps} />;
    default:
      return <div className="font-mono text-xs uppercase tracking-[0.24em] text-white/45">Preview unavailable</div>;
  }
}

function BentoGridDemo({ liveProps }: { liveProps?: Record<string, unknown> }) {
  const variant = (liveProps?.variant as "beveled" | "radiant") ?? "beveled";

  return (
    <div className="w-full py-6 px-3 flex flex-col items-center justify-center">
      <BentoGrid>
        <BentoGridItem
          variant={variant}
          className="col-span-12 md:col-span-8"
          title="Next.js App Router"
          description="Server components, streaming SSR, and automated edge route bundling."
          icon="nextjs"
        />
        <BentoGridItem
          variant={variant}
          className="col-span-12 md:col-span-4"
          title="GitHub Integration"
          description="Automated CI/CD workflows and version control registry sync."
          icon="github"
        />
        <BentoGridItem
          variant={variant}
          className="col-span-12 md:col-span-4"
          title="Express API Gateway"
          description="Low-latency REST and WebSocket microservice routing."
          icon="express"
        />
        <BentoGridItem
          variant={variant}
          className="col-span-12 md:col-span-4"
          title="PostgreSQL Cluster"
          description="ACID-compliant relational database engine with automated query optimization."
          icon="postgres"
        />
        <BentoGridItem
          variant={variant}
          className="col-span-12 md:col-span-4"
          title="TypeScript Core"
          description="Strict end-to-end type safety with automatic prop inference."
          icon="typescript"
        />
        <BentoGridItem
          variant={variant}
          className="col-span-12 md:col-span-6"
          title="Redis In-Memory Cache"
          description="Sub-millisecond data persistence and pub/sub message brokering."
          icon="redis"
        />
        <BentoGridItem
          variant={variant}
          className="col-span-12 md:col-span-6"
          title="Node.js Runtime"
          description="Asynchronous event-driven backend performance."
          icon="nodejs"
        />
      </BentoGrid>
    </div>
  );
}

function SidebarDemo({ liveProps }: { liveProps: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<"left" | "right">("left");

  const openSidebar = (side: "left" | "right") => {
    setActiveSide(side);
    setIsOpen(true);
  };

  return (
    <div className="w-full flex flex-wrap items-center justify-center p-12 gap-4 font-['DM_Sans',sans-serif]">
      {/* DM Sans font loader */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      <button
        type="button"
        onClick={() => openSidebar("left")}
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40), 0 4px 12px rgba(0, 0, 0, 0.5)",
          fontFamily: "'DM Sans', sans-serif",
        }}
        className="px-6 h-12 rounded-xl text-xs font-bold text-neutral-200 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 hover:text-white cursor-pointer active:scale-95 transition-all font-['DM_Sans',sans-serif]"
      >
        Open Sidebar Left
      </button>

      <button
        type="button"
        onClick={() => openSidebar("right")}
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40), 0 4px 12px rgba(0, 0, 0, 0.5)",
          fontFamily: "'DM Sans', sans-serif",
        }}
        className="px-6 h-12 rounded-xl text-xs font-bold text-neutral-200 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 hover:text-white cursor-pointer active:scale-95 transition-all font-['DM_Sans',sans-serif]"
      >
        Open Sidebar Right
      </button>

      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        side={activeSide}
        {...liveProps}
      />
    </div>
  );
}

function CommandPaletteDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 gap-6 min-h-[500px] font-['DM_Sans',sans-serif] select-none">
      {/* DM Sans font loader tag */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-xl font-bold tracking-wide text-white font-['DM_Sans',sans-serif]">
          Tactile Command Palette
        </h3>
        <p className="text-xs text-neutral-400 font-['DM_Sans',sans-serif] leading-relaxed">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">⌘ K</kbd> anywhere or click the button below to open the command palette.
        </p>
      </div>

      {/* Centered Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 4px 14px rgba(0, 0, 0, 0.6)",
        }}
        className="px-6 h-12 rounded-xl text-xs font-bold text-neutral-200 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 hover:text-white hover:border-white/30 cursor-pointer active:scale-95 transition-all font-['DM_Sans',sans-serif] flex items-center gap-2.5"
      >
        <span>Open Command Palette</span>
        <kbd className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono text-[10px] uppercase border border-white/10 tracking-wider">⌘ K</kbd>
      </button>

      {/* Modal Viewport Overlay Mode */}
      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        inline={false}
      />
    </div>
  );
}

function OTPInputDemo() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-6 min-h-[400px] font-['DM_Sans',sans-serif] select-none">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      <OTPInput length={6} correctPin="777777" />

      <div className="text-center text-xs font-mono text-neutral-400">
        Try entering passcode <code className="text-[#a78bfa] font-bold">777777</code> or <code className="text-[#a78bfa] font-bold">123456</code>
      </div>
    </div>
  );
}

function TooltipDemo() {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-8 min-h-[400px] font-['DM_Sans',sans-serif] select-none">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-lg font-bold text-white tracking-wide">Magnetic Hologram Tooltip</h3>
        <p className="text-xs text-neutral-400">Hover over the 3D buttons below to reveal interactive magnetic hologram popovers tracking your cursor position.</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <Tooltip content="3D Vault Shield Activated" side="top">
          <button
            type="button"
            style={{
              backgroundColor: "#171717",
              boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 4px 14px rgba(0, 0, 0, 0.6)",
            }}
            className="px-5 h-11 rounded-xl text-xs font-bold text-neutral-200 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 hover:text-white cursor-pointer active:scale-95 transition-all"
          >
            Hover Top
          </button>
        </Tooltip>

        <Tooltip content="Laser Encrypted Security Protocol" side="bottom">
          <button
            type="button"
            style={{
              backgroundColor: "#171717",
              boxShadow: "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.12), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.45), 0 4px 14px rgba(0, 0, 0, 0.6)",
            }}
            className="px-5 h-11 rounded-xl text-xs font-bold text-neutral-200 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 hover:text-white cursor-pointer active:scale-95 transition-all"
          >
            Hover Bottom
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

function StepperDemo() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-8 min-h-[380px] w-full max-w-xl mx-auto font-['DM_Sans',sans-serif] select-none">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      <Stepper />
    </div>
  );
}


function BevelAlertDialogDemo({ liveProps }: { liveProps: any }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-transparent gap-6">
      {/* Tactile console trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: "#171717",
          boxShadow:
            "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1.5px 0 0 rgba(0, 0, 0, 0.40), 0 4px 12px rgba(0, 0, 0, 0.5)",
        }}
        className="px-6 h-12 rounded-xl text-[10px] font-mono tracking-widest uppercase font-bold text-neutral-300 border-t border-white/20 border-x border-white/[0.02] border-b border-white/10 hover:text-white cursor-pointer active:scale-95 transition-transform"
      >
        Initialize Alarm Console
      </button>

      {/* The Alert Dialog */}
      <BevelAlertDialog
        title="ALARM CONSOLE INITIALIZED"
        description="The security deck has booted successfully. All perimeter sensor scans are active and operating within nominal parameters."
        confirmLabel="PROCEED"
        cancelLabel="DISMISS"
        {...liveProps}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={async () => {
          // Simulate machine override task
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setIsOpen(false);
        }}
      />
    </div>
  );
}


