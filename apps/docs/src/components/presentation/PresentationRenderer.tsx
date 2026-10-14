"use client";

// Note: CoverflowCarousel is imported from "@adgrid-ui/ui" in the imports section below and rendered under the "coverflow-carousel" case in the switch-statement inside the PresentationRenderer component.

import { useRef, useState, useEffect } from "react";

import {
  AnisotropicKnob,
  BreathingGrid,
  BreathingBackground,
  BrushedTitaniumButton,
  ButtonAlpha,
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

  NowPlayingCard,
  PixelMeltBackground,
  PremiumHero,
  SimpleCard,
  Marquee,
  Marquee2,
  Accordion,
  StickerCard,
  Datepicker,
  NavBar1,
  SpotlightGrid,
  FlickeringGrid,
  FlickeringGridPlayground,
  DotPattern,
  DotPatternPlayground,
  TextShuffle,
  VoidButton,
  WheelPicker,
  ScrollProgress,
  RulerScrollbar,
  ScrollWater,
  MoonPull,
  StackedCards,
  TiltedCollage,
  TapedMarquee,
  Choice,
  ChoiceGroup,
  Modal,
  Dialog,
  DialogButton,
  Tabs,
  TabsList,
  Tab,
  TabsPanel,
  SegmentedControl,
  Drawer,
  Nav,
  NavGroup,
  NavItem,
  NavSection,
  Progress,
  Combobox,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Breadcrumbs,
  WeaponWheel,
  Hero,
  AnimatedIcons1,
  ForgeUILanding,
  RaysLanding,
  BreathingScaleCard,
  GithubHeatmap,
  DeveloperIdCard,
  Sidebar,
  CommandPalette,
  Switch,
  OTPInput,
  Tooltip,
  Timeline,
  Toaster,
  toast,
  Spinner,
  FileUpload,
  type FileUploadItem,
  Button,
  TextField,
  Popover,
  DropdownMenu,
  MenuItem,
  MenuCheckboxItem,
  MenuSeparator,
  MenuGroup,
  usePopoverClose,
  Globe,
  BentoGrid,
  BentoGridItem,
  Meter,
  MatrixRippleBackground,
  StackedCardFanDemo,
} from "@adgrid-ui/ui";
import { Cards } from "../../../../../packages/ui/src/animated/Cards";
import type { RegistryEntry } from "@/registry";
import { usePresentationStore } from "@/lib/presentation/store";
import {
  IconGitBranch,
  IconBrandGithub,
  IconBrandGitlab,
  IconShieldCheck,
  IconBrandChrome,
  IconEye,
  IconBrandNextjs,
  IconBrandRust,
  IconBrandDocker,
  IconBrandTailwind,
  IconBrandGolang,
  IconDatabase,
  IconBrandSvelte,
  IconTerminal2,
  IconBolt,
  IconTrash,
  IconLayoutGrid,
  IconList,
  IconLayoutKanban,
  IconPlus,
  IconArrowRight,
  IconDotsVertical,
  IconUser,
  IconSettings,
  IconLogout,
  IconCopy,
  IconPencil,
  IconSearch,
  IconMail,
  IconChevronDown,
  IconShare,
} from "@tabler/icons-react";

const imageParallaxDemo = "/utils/image-parallax.png";


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
    subtitle: "Cyberpunk Classic",
    description:
      "In Neo-Tokyo, a secret military project endangers the city when it turns a biker gang member into a rampaging psychic psychopath.",
    year: "1988",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "spirited-away",
    title: "Spirited Away",
    subtitle: "Studio Ghibli",
    description:
      "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
    year: "2001",
    image:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "evangelion",
    title: "Neon Genesis Evangelion",
    subtitle: "Mecha Psychological",
    description:
      "A teenage boy finds himself recruited by his estranged father to pilot a giant biomechanical mecha against otherworldly entities.",
    year: "1995",
    image:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=85&auto=format&fit=crop",
  },
  {
    id: "your-name",
    title: "Your Name",
    subtitle: "Romantic Fantasy",
    description:
      "Two teenagers share a profound, magical connection upon discovering they are swapping bodies across space and time.",
    year: "2016",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=85&auto=format&fit=crop",
  },
];



function RulerScrollbarDemo(props: any) {
  return (
    <div className="w-full text-white p-12">
      <RulerScrollbar hideNativeScrollbar {...props} />
      <div className="mx-auto max-w-2xl space-y-12 py-24">
        <h1 className="text-5xl tracking-tight text-white mb-8">
          Scroll the <em className="font-serif">page</em>
        </h1>
        {[...Array(14)].map((_, i) => (
          <p key={i} className="text-lg leading-8 text-neutral-300 my-6">
            Paragraph {i + 1}. Keep an eye on the ruler at the right edge: the ticks around your current position quietly brighten and stretch a little wider, and that soft highlight travels down the ruler as you move through the page. Drag the ruler to jump anywhere.
          </p>
        ))}
      </div>
    </div>
  );
}

// Demo prints for the paper components: patterns and textures, desaturated by Unsplash (sat=-100).
// Each URL crops to the listed size, so width/height are exact.
const unsplash = (id: string, width: number, height: number) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&h=${height}&fit=crop&auto=format&q=80&sat=-100`;
const print = (id: string, width: number, height: number, alt: string, wide?: boolean) => ({
  src: unsplash(id, width, height),
  width,
  height,
  alt,
  wide,
});
const PAPER_PRINTS = [
  print("1497250681960-ef046c08a56e", 800, 1100, "Fern fronds packed edge to edge"),
  print("1553356084-58ef4a67b2a7", 1000, 800, "Swirls of marbled paint"),
  print("1605106702734-205df224ecce", 800, 1000, "A geometric quilt of black and white triangles"),
  print("1558591710-4b4a1ae0f04d", 1200, 800, "Rippled white waves"),
  print("1511447333015-45b65e60f6d5", 800, 1000, "Nested triangles of light receding into the dark"),
  print("1550537687-c91072c4792d", 1000, 1000, "A repeating tile of interlocking arcs"),
  print("1502691876148-a84978e59af8", 800, 1100, "Wooden slats lining a corridor"),
  print("1557672172-298e090bd0f1", 1200, 800, "Soft bands of marbled paint"),
  print("1517999144091-3d9dca6d1e43", 1000, 750, "Dark stones piled together"),
  print("1496096265110-f83ad7f96608", 800, 1100, "Streaks of light falling in lines"),
  print("1567095761054-7a02e69e5c43", 1100, 800, "Ink spreading through dark water"),
  print("1520121401995-928cd50d4e27", 800, 1000, "Overlapping leaves on a branch"),
  print("1541701494587-cb58502866ab", 1000, 800, "Smoke curling in the dark"),
  print("1574169208507-84376144848b", 900, 900, "Dark marbled ink"),
];
const PAPER_STRIP = print("1618005182384-a83a8bd57fbe", 2800, 540, "Layered curves of light and shadow", true);

function MoonPullDemo(props: any) {
  const [open, setOpen] = useState(false);
  const curtain = "transition-transform duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none";
  return (
    // The whole present page is the stage: the moon hangs from the top of the screen and the
    // panel drops over all of it.
    <div className="relative h-dvh w-full">
      <div className="absolute inset-0">
        <div className="absolute inset-0 overflow-hidden">
          {/* The scene: steps back while the panel is down. */}
          <div
            className="absolute inset-0 grid place-items-center transition-[scale,opacity,filter] duration-[1100ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ scale: open ? "0.96" : "1", opacity: open ? 0.6 : 1, filter: open ? "blur(2px)" : "none" }}
          >
            <div className="text-center">
              <p className="font-serif text-4xl italic tracking-tight text-white/85 md:text-6xl">Explore more components</p>
              <p className="mt-3 text-sm text-neutral-500">Pull the circle to see how this one is made.</p>
            </div>
          </div>
          {/* The panel glides down like a title curtain; its content trails behind. */}
          <div
            className={`absolute inset-0 grid place-items-center bg-[#151515] ${curtain}`}
            style={{ translate: open ? "0 0" : "0 -100%" }}
            aria-hidden={!open}
          >
            <div className={`max-w-lg px-8 text-center ${curtain}`} style={{ translate: open ? "0 0" : "0 -35%" }}>
              <p className="font-serif text-4xl italic text-white/90">About</p>
              <p className="mt-4 text-base leading-7 text-neutral-400">
                Made with React and Tailwind CSS, in a single file with no dependencies. The cord is a
                small spring simulation on requestAnimationFrame, drawn as an SVG curve with a yarn
                texture; the glow and the hint are plain CSS.
              </p>
              <ul className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
                {["React", "Tailwind CSS", "SVG", "No animation library", "Keyboard: Enter / Space", "Reduced-motion aware"].map((tag) => (
                  <li key={tag} className="rounded-full border border-white/10 px-3 py-1">
                    {tag}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-neutral-500">Pull the circle again to go back.</p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-10">
          <MoonPull
            open={open}
            onPull={() => setOpen((o) => !o)}
            closedLabel="Pull the moon to open About"
            openLabel="Pull the moon to go back home"
            {...props}
          />
        </div>
      </div>
    </div>
  );
}

function StackedCardsDemo(props: any) {
  return (
    <div className="w-full px-4 py-24 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-5xl tracking-tight">
          A pile of <em className="font-serif">prints</em>
        </h1>
        <div className="mt-12">
          <StackedCards images={PAPER_PRINTS} topSrc={PAPER_PRINTS[2].src} {...props} />
        </div>
        <div className="h-[40vh]" />
      </div>
    </div>
  );
}

function TiltedCollageDemo(props: any) {
  const prints = [...PAPER_PRINTS.slice(0, 7), PAPER_STRIP, ...PAPER_PRINTS.slice(7)];
  return (
    <TiltedCollage
      images={prints}
      {...props}
      columns={Number(props.columns ?? 3) as 2 | 3 | 4}
      className="mx-auto w-full max-w-6xl py-8"
    />
  );
}

function TapedMarqueeDemo(props: any) {
  const seconds = Number(props.seconds ?? 60);
  const tiltOffset = Number(props.tiltOffset ?? 0);
  return (
    <div className="flex min-h-dvh w-full flex-col justify-center py-16 text-white">
      <h1 className="mb-6 px-8 text-center text-5xl tracking-tight">
        Pinned <em className="font-serif">along a line</em>
      </h1>
      <TapedMarquee photos={PAPER_PRINTS.slice(0, 7)} {...props} />
      {/* A second row: slower, reversed and tilted out of step, so the two never line up. */}
      <TapedMarquee
        photos={PAPER_PRINTS.slice(7)}
        {...props}
        seconds={Math.round((seconds * 85) / 70)}
        reverse={!props.reverse}
        tiltOffset={tiltOffset + 3}
      />
    </div>
  );
}

const NOTIFICATION_OPTIONS = [
  { value: "digest", label: "Weekly digest", description: "A summary of activity across your projects, every Monday." },
  { value: "deploys", label: "Deployments", description: "When a production deploy succeeds or fails." },
  { value: "security", label: "Security alerts", description: "New sign-ins and changes to access keys." },
];
const PLAN_OPTIONS = [
  { value: "hobby", label: "Hobby", description: "Free for personal projects and experiments." },
  { value: "pro", label: "Pro", description: "$20 a month. Unlimited projects and team previews." },
  { value: "enterprise", label: "Enterprise", description: "Custom limits, SSO and a dedicated contact." },
];

function ChoiceDemo(props: any) {
  const variant = props.variant === "card" ? "card" : "default";
  const size = props.size ?? "md";
  const disabled = Boolean(props.disabled);
  const invalid = Boolean(props.invalid);
  const [selected, setSelected] = useState<string[]>(["digest", "security"]);
  const [plan, setPlan] = useState("pro");
  const all = selected.length === NOTIFICATION_OPTIONS.length;

  return (
    <div className="w-[min(420px,calc(100vw-32px))]">
      {props.type === "radio" ? (
        <ChoiceGroup
          label="Plan"
          description="You can change this at any time."
          value={plan}
          onValueChange={setPlan}
          variant={variant}
          size={size}
          disabled={disabled}
          invalid={invalid}
        >
          {PLAN_OPTIONS.map((option) => (
            <Choice key={option.value} {...option} />
          ))}
        </ChoiceGroup>
      ) : (
        <div className="flex flex-col gap-5">
          {/* A parent that goes indeterminate while only some of its children are on. */}
          <Choice
            label="All notifications"
            checked={all}
            indeterminate={selected.length > 0 && !all}
            onCheckedChange={(checked) => setSelected(checked ? NOTIFICATION_OPTIONS.map((o) => o.value) : [])}
            size={size}
            disabled={disabled}
          />
          <div className="h-px bg-black/50 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />
          <ChoiceGroup
            type="checkbox"
            value={selected}
            onValueChange={setSelected}
            variant={variant}
            size={size}
            disabled={disabled}
            invalid={invalid}
          >
            {NOTIFICATION_OPTIONS.map((option) => (
              <Choice key={option.value} {...option} />
            ))}
          </ChoiceGroup>
        </div>
      )}
      {invalid && <p className="mt-4 text-[13px] text-[rgb(229_115_115)]">Choose at least one option to continue.</p>}
    </div>
  );
}

function ModalDemo(props: any) {
  const [selected, setSelected] = useState<string[]>(["deploys", "security"]);
  return (
    <Modal
      size={props.size ?? "md"}
      dismissible={props.dismissible ?? true}
      title={props.title ?? "Notification settings"}
      description={props.description ?? "Choose what reaches your inbox. Changes apply to every workspace you belong to."}
      trigger={<DialogButton>Notification settings</DialogButton>}
      footer={
        <>
          <DialogButton close>Cancel</DialogButton>
          <DialogButton tone="primary" close>
            Save changes
          </DialogButton>
        </>
      }
    >
      <ChoiceGroup type="checkbox" value={selected} onValueChange={setSelected}>
        {NOTIFICATION_OPTIONS.map((option) => (
          <Choice key={option.value} {...option} />
        ))}
      </ChoiceGroup>
    </Modal>
  );
}

const TAB_ITEMS = [
  { value: "overview", label: "Overview" },
  { value: "deployments", label: "Deployments" },
  { value: "analytics", label: "Analytics" },
  { value: "settings", label: "Settings" },
];
const TAB_PANELS: Record<string, { title: string; body: string; stats: [string, string][] }> = {
  overview: { title: "Aurora", body: "Production is healthy. The last deploy went out 12 minutes ago from main.", stats: [["Uptime", "99.98%"], ["Regions", "4"], ["Builds today", "11"]] },
  deployments: { title: "Deployments", body: "Every push to main ships to production; every pull request gets its own preview.", stats: [["Succeeded", "128"], ["Failed", "3"], ["Avg. build", "41s"]] },
  analytics: { title: "Analytics", body: "Traffic over the last 7 days, across all regions and preview URLs.", stats: [["Visitors", "24.1k"], ["Page views", "88.3k"], ["Bounce", "31%"]] },
  settings: { title: "Settings", body: "Domains, environment variables and who can deploy to production.", stats: [["Domains", "2"], ["Variables", "17"], ["Members", "6"]] },
};

function TabsDemo(props: any) {
  const variant = props.variant === "underline" ? "underline" : "segment";
  return (
    <div className="w-[min(520px,calc(100vw-32px))]">
      <Tabs defaultValue="overview" variant={variant} size={props.size ?? "md"} fullWidth={Boolean(props.fullWidth)}>
        <TabsList aria-label="Project">
          {TAB_ITEMS.map((tab) => (
            <Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tab>
          ))}
        </TabsList>
        {TAB_ITEMS.map(({ value }) => {
          const panel = TAB_PANELS[value]!;
          return (
            <TabsPanel
              key={value}
              value={value}
              className="rounded-2xl border border-black/50 bg-[#0c0c0d] p-5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.05)]"
            >
              <h3 className="text-sm font-medium tracking-tight text-neutral-100">{panel.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{panel.body}</p>
              <dl className="mt-5 grid grid-cols-3 gap-4">
                {panel.stats.map(([label, stat]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="text-xs text-neutral-500">{label}</dt>
                    <dd className="text-lg font-medium tracking-tight text-neutral-100 tabular-nums">{stat}</dd>
                  </div>
                ))}
              </dl>
            </TabsPanel>
          );
        })}
      </Tabs>
    </div>
  );
}

const RANGE_OPTIONS = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

function SegmentedControlDemo(props: any) {
  const size = props.size ?? "md";
  const fullWidth = Boolean(props.fullWidth);
  const disabled = Boolean(props.disabled);
  const [range, setRange] = useState("7d");
  const [view, setView] = useState("grid");

  return (
    <div className="flex w-[min(420px,calc(100vw-32px))] flex-col items-center gap-8">
      <div className="flex w-full flex-col items-center gap-3">
        <SegmentedControl
          aria-label="Time range"
          options={RANGE_OPTIONS}
          value={range}
          onValueChange={setRange}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled}
        />
        <p className="text-[13px] text-neutral-500">
          Showing the last <span className="text-neutral-300">{RANGE_OPTIONS.find((o) => o.value === range)?.label}</span>
        </p>
      </div>
      <SegmentedControl
        aria-label="View"
        options={[
          { value: "grid", icon: <IconLayoutGrid />, "aria-label": "Grid view" },
          { value: "list", icon: <IconList />, "aria-label": "List view" },
          { value: "board", icon: <IconLayoutKanban />, "aria-label": "Board view" },
        ]}
        value={view}
        onValueChange={setView}
        size={size}
        disabled={disabled}
      />
    </div>
  );
}

function ProgressDemo(props: any) {
  const size = props.size ?? "md";
  const value = props.indeterminate ? null : Number(props.value ?? 64);
  return (
    <div className="flex w-[min(420px,calc(100vw-32px))] flex-col gap-7">
      <Progress label="Uploading assets" value={value} size={size} showValue={props.showValue ?? true} />
      <Progress label="Building" value={null} size={size} />
      <Progress
        label="Storage"
        value={7.4}
        max={10}
        size={size}
        showValue
        formatValue={(v, max) => `${v} of ${max} GB`}
      />
    </div>
  );
}

const FRAMEWORKS = [
  { value: "next", label: "Next.js", description: "React", icon: <IconBrandNextjs />, keywords: ["react", "vercel"] },
  { value: "svelte", label: "SvelteKit", description: "Svelte", icon: <IconBrandSvelte /> },
  { value: "astro", label: "Astro", description: "Islands", icon: <IconBolt /> },
  { value: "remix", label: "Remix", description: "React", icon: <IconBrandChrome />, keywords: ["react"] },
  { value: "rust", label: "Axum", description: "Rust", icon: <IconBrandRust /> },
  { value: "go", label: "Gin", description: "Go", icon: <IconBrandGolang /> },
  { value: "docker", label: "Custom image", description: "Docker", icon: <IconBrandDocker /> },
  { value: "legacy", label: "Gatsby", description: "Deprecated", icon: <IconDatabase />, disabled: true },
];

function ButtonDemo(props: any) {
  const size = props.size ?? "md";
  const loading = Boolean(props.loading);
  const disabled = Boolean(props.disabled);
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size={size} loading={loading} disabled={disabled} trailingIcon={<IconArrowRight />}>
          Deploy
        </Button>
        <Button variant="secondary" size={size} loading={loading} disabled={disabled} leadingIcon={<IconPlus />}>
          New project
        </Button>
        <Button variant="ghost" size={size} loading={loading} disabled={disabled}>
          Cancel
        </Button>
        <Button variant="danger" size={size} loading={loading} disabled={disabled} leadingIcon={<IconTrash />}>
          Delete
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size={size} iconOnly aria-label="Copy" disabled={disabled}>
          <IconCopy />
        </Button>
        <Button variant="ghost" size={size} iconOnly aria-label="Edit" disabled={disabled}>
          <IconPencil />
        </Button>
        <Button variant="primary" size={size} iconOnly aria-label="Add" disabled={disabled}>
          <IconPlus />
        </Button>
      </div>
    </div>
  );
}

function TextFieldDemo(props: any) {
  const size = props.size ?? "md";
  const disabled = Boolean(props.disabled);
  const [email, setEmail] = useState("ada@");
  const invalid = Boolean(props.invalid) || (email.length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
  return (
    <div className="flex w-[min(400px,calc(100vw-32px))] flex-col gap-5">
      <TextField
        label="Email"
        type="email"
        size={size}
        disabled={disabled}
        leading={<IconMail />}
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        description="We'll send the invite here."
        error={invalid ? "Enter a full email address, like ada@lovelace.dev." : undefined}
      />
      <TextField label="Password" type="password" size={size} disabled={disabled} defaultValue="correct horse" required />
      <TextField label="Subdomain" size={size} disabled={disabled} defaultValue="acme" trailing=".adgrid.app" />
      <TextField
        label="Bio"
        multiline
        autoResize
        disabled={disabled}
        maxLength={160}
        placeholder="A line or two about you"
        description="Shown on your public profile."
      />
    </div>
  );
}

function PopoverDemo(props: any) {
  const [grid, setGrid] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const side = props.side ?? "bottom";
  const align = props.align ?? "start";
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <DropdownMenu
        side={side}
        align={align}
        aria-label="Project actions"
        trigger={
          <Button variant="secondary" trailingIcon={<IconChevronDown />}>
            Actions
          </Button>
        }
      >
        <MenuGroup label="Project">
          <MenuItem icon={<IconPencil />} shortcut="R">
            Rename
          </MenuItem>
          <MenuItem icon={<IconCopy />} shortcut="⌘D">
            Duplicate
          </MenuItem>
          <MenuItem icon={<IconShare />}>Share</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup label="View">
          <MenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
            Show grid
          </MenuCheckboxItem>
          <MenuCheckboxItem checked={minimap} onCheckedChange={setMinimap}>
            Show minimap
          </MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem icon={<IconSettings />} disabled>
          Settings
        </MenuItem>
        <MenuItem icon={<IconTrash />} destructive shortcut="⌫">
          Delete project
        </MenuItem>
      </DropdownMenu>

      <DropdownMenu
        side={side}
        align="end"
        matchTriggerWidth={false}
        aria-label="Account"
        trigger={
          <Button variant="ghost" iconOnly aria-label="Account menu">
            <IconDotsVertical />
          </Button>
        }
      >
        <MenuItem icon={<IconUser />}>Profile</MenuItem>
        <MenuItem icon={<IconSettings />} shortcut="⌘,">
          Preferences
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon={<IconLogout />}>Log out</MenuItem>
      </DropdownMenu>

      <Popover
        side={side}
        align={align}
        aria-label="Invite a teammate"
        trigger={<Button leadingIcon={<IconPlus />}>Invite</Button>}
      >
        <InviteForm />
      </Popover>
    </div>
  );
}

function InviteForm() {
  const close = usePopoverClose();
  return (
    <form
      className="flex w-[280px] flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium tracking-tight text-neutral-100">Invite a teammate</span>
        <span className="text-[13px] text-neutral-500">They'll get access to this project.</span>
      </div>
      <TextField size="sm" type="email" placeholder="name@company.com" leading={<IconSearch />} aria-label="Email" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button size="sm" type="submit">
          Send invite
        </Button>
      </div>
    </form>
  );
}

function SpinnerDemo(props: any) {
  const size = props.size ?? "md";
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-6">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
      <div className="flex items-center gap-3">
        <DialogButton tone="primary" loading>
          Save changes
        </DialogButton>
        <span className="flex items-center gap-2 text-[13px] text-neutral-400">
          <Spinner size={size} label={null} className="text-neutral-400" />
          Syncing 12 files…
        </span>
      </div>
    </div>
  );
}

function FileUploadDemo(props: any) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setInterval>>());

  useEffect(() => {
    const running = timers.current;
    return () => running.forEach((timer) => clearInterval(timer));
  }, []);

  // Fake an upload: the bar climbs in uneven steps, then the row settles on "Uploaded".
  const upload = (added: FileUploadItem[]) => {
    added.forEach((item) => {
      setFiles((current) => current.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 0 } : f)));
      const timer = setInterval(() => {
        setFiles((current) =>
          current.map((f) => {
            if (f.id !== item.id) return f;
            const progress = Math.min((f.progress ?? 0) + 6 + Math.random() * 14, 100);
            if (progress >= 100) {
              clearInterval(timer);
              timers.current.delete(item.id);
              return { ...f, status: "done", progress: 100 };
            }
            return { ...f, progress };
          })
        );
      }, 220);
      timers.current.set(item.id, timer);
    });
  };

  return (
    <div className="flex w-[min(420px,calc(100vw-32px))] flex-col gap-1.5">
      <span className="text-sm font-medium tracking-tight text-neutral-100">Attachments</span>
      <FileUpload
        value={files}
        onValueChange={setFiles}
        onFilesAdded={upload}
        onRemove={(item) => {
          clearInterval(timers.current.get(item.id));
          timers.current.delete(item.id);
        }}
        accept={props.accept ?? "image/*,.pdf"}
        maxSize={5 * 1024 * 1024}
        maxFiles={props.maxFiles ?? 4}
        multiple={props.multiple ?? true}
        disabled={Boolean(props.disabled)}
        invalid={Boolean(props.invalid)}
      />
    </div>
  );
}

function ComboboxDemo(props: any) {
  const [framework, setFramework] = useState<string | null>("next");
  const invalid = Boolean(props.invalid);
  return (
    <div className="flex w-[min(360px,calc(100vw-32px))] flex-col gap-1.5">
      <label id="framework-label" htmlFor="framework" className="text-sm font-medium tracking-tight text-neutral-100">
        Framework
      </label>
      <Combobox
        id="framework"
        aria-labelledby="framework-label"
        options={FRAMEWORKS}
        value={framework}
        onValueChange={setFramework}
        placeholder={props.placeholder ?? "Search frameworks…"}
        size={props.size ?? "md"}
        clearable={props.clearable ?? true}
        disabled={Boolean(props.disabled)}
        invalid={invalid}
      />
      <p className={invalid ? "text-[13px] text-[rgb(229_115_115)]" : "text-[13px] text-neutral-500"}>
        {invalid ? "Choose a framework to continue." : "Sets the build command and output directory."}
      </p>
    </div>
  );
}

const DEPLOYS = [
  { id: "dpl_8f2k", branch: "main", status: "Ready", region: "fra1", duration: 41, requests: 18240 },
  { id: "dpl_7c1a", branch: "feat/billing", status: "Building", region: "iad1", duration: 0, requests: 0 },
  { id: "dpl_6b9e", branch: "main", status: "Ready", region: "sfo1", duration: 38, requests: 9311 },
  { id: "dpl_5a3d", branch: "fix/auth-redirect", status: "Failed", region: "fra1", duration: 12, requests: 0 },
  { id: "dpl_4e0c", branch: "main", status: "Ready", region: "hnd1", duration: 45, requests: 27502 },
];
const STATUS_DOT: Record<string, string> = {
  Ready: "bg-[rgb(126_190_152)]",
  Building: "bg-[rgb(214_178_106)]",
  Failed: "bg-[rgb(229_115_115)]",
};
type DeployKey = "branch" | "duration" | "requests";

function TableDemo(props: any) {
  const [sort, setSort] = useState<{ key: DeployKey; dir: "ascending" | "descending" }>({ key: "requests", dir: "descending" });
  const [selected, setSelected] = useState("dpl_8f2k");
  const rows = [...DEPLOYS].sort((a, b) => {
    const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0;
    return sort.dir === "ascending" ? order : -order;
  });
  const sortBy = (key: DeployKey) =>
    setSort((current) => ({ key, dir: current.key === key && current.dir === "descending" ? "ascending" : "descending" }));
  const sortOf = (key: DeployKey) => (sort.key === key ? sort.dir : false);

  return (
    <div className="w-[min(720px,calc(100vw-32px))]">
      <Table
        title={props.title ?? "Deployments"}
        description={props.description ?? "Production deploys from the last 24 hours."}
        action={<DialogButton className="h-8 px-3 text-[13px]">Redeploy</DialogButton>}
        footer={
          <>
            <span>{DEPLOYS.length} deployments</span>
            <span className="tabular-nums">Updated 2 min ago</span>
          </>
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Deployment</TableHead>
            <TableHead sort={sortOf("branch")} onSort={() => sortBy("branch")}>Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Region</TableHead>
            <TableHead numeric sort={sortOf("duration")} onSort={() => sortBy("duration")}>Build</TableHead>
            <TableHead numeric sort={sortOf("requests")} onSort={() => sortBy("requests")}>Requests</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} selected={row.id === selected} onClick={() => setSelected(row.id)} className="cursor-pointer">
              <TableCell primary className="font-mono text-[13px]">{row.id}</TableCell>
              <TableCell>{row.branch}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <span className={`size-1.5 rounded-full ${STATUS_DOT[row.status]}`} />
                  {row.status}
                </span>
              </TableCell>
              <TableCell className="font-mono text-[13px]">{row.region}</TableCell>
              <TableCell numeric>{row.duration ? `${row.duration}s` : "—"}</TableCell>
              <TableCell numeric>{row.requests ? row.requests.toLocaleString("en-US") : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BreadcrumbsDemo(props: any) {
  return (
    <Breadcrumbs
      maxItems={props.maxItems ?? 4}
      separator={props.separator ?? "/"}
      items={[
        { label: "Acme", href: "#", icon: <IconBolt /> },
        { label: "Projects", href: "#" },
        { label: "Aurora", href: "#" },
        { label: "Deployments", href: "#" },
        { label: "dpl_8f2k" },
      ]}
    />
  );
}

function DialogDemo(props: any) {
  const danger = (props.tone ?? "danger") === "danger";
  return (
    <Dialog
      tone={danger ? "danger" : "default"}
      icon={danger ? <IconTrash size={18} stroke={1.75} /> : <IconShieldCheck size={18} stroke={1.75} />}
      title={props.title ?? "Delete this project?"}
      description={props.description ?? "This permanently removes Aurora and its 24 deployments. It can't be undone."}
      confirmLabel={props.confirmLabel ?? "Delete project"}
      cancelLabel={props.cancelLabel ?? "Cancel"}
      // A slow request, so the confirm button shows its spinner.
      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1200))}
      trigger={<DialogButton tone={danger ? "danger" : "secondary"}>{props.confirmLabel ?? "Delete project"}</DialogButton>}
    />
  );
}

function ScrollWaterDemo(props: any) {
  return (
    <div className="w-full text-white p-12">
      <ScrollWater {...props} />
      <div className="mx-auto max-w-2xl space-y-12 py-24">
        <h1 className="text-5xl tracking-tight text-white mb-8">
          Read to the <em className="font-serif">bottom</em>
        </h1>
        {[...Array(14)].map((_, i) => (
          <p key={i} className="text-lg leading-8 text-neutral-300 my-6">
            Paragraph {i + 1}. Watch the circle in the corner: the water inside it rises with how much of the page you have read, while two waves drift past each other on the surface. Reach the end and the circle fills completely, an arrow surfaces, and one click carries you back to the top.
          </p>
        ))}
      </div>
    </div>
  );
}

function ScrollProgressDemo(props: any) {
  return (
    <div className="w-full text-white p-12">
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


function AnisotropicKnobGalleryDemo(props: Record<string, unknown>) {
  const [val, setVal] = useState(20);

  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;
    const duration = 5000; // 5-second smooth oscillation cycle

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % duration;
      // Oscillate smoothly using sine wave between 15 and 85
      const progress = (Math.sin((elapsed / duration) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      const currentVal = Math.round(15 + progress * 70);
      setVal(currentVal);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <AnisotropicKnob size={132} sound={false} value={val} label="VOLUME" {...props} />;
}

function WheelPickerDemo({
  liveProps = {},
  playTactileSounds = true,
}: {
  liveProps?: Record<string, unknown>;
  playTactileSounds?: boolean;
}) {
  const [framework, setFramework] = useState("Next.js");

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

function WeaponWheelDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
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

const dummyMarqueeItems = [
  { id: 1, title: "Next.js Framework", description: "Production build server", icon: <IconBrandNextjs size={20} /> },
  { id: 2, title: "Rust Compiler", description: "Systems execution speed", icon: <IconBrandRust size={20} /> },
  { id: 3, title: "Docker Container", description: "Kubernetes orchestration", icon: <IconBrandDocker size={20} /> },
  { id: 4, title: "Tailwind Styling", description: "Design tokens layout", icon: <IconBrandTailwind size={20} /> },
  { id: 5, title: "Go Microservice", description: "Concurrent backend router", icon: <IconBrandGolang size={20} /> },
  { id: 6, title: "Database Layer", description: "Postgres connection pool", icon: <IconDatabase size={20} /> },
  { id: 7, title: "Svelte Frontend", description: "Reactive compiler DOM", icon: <IconBrandSvelte size={20} /> },
];

function MarqueeDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const canvasColor = usePresentationStore((state) => state.settings.canvasColor ?? "#111111");

  const marqueeProps = {
    items: dummyMarqueeItems,
    fadeColor: canvasColor,
    ...liveProps,
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Marquee {...marqueeProps} className="w-full h-full border-none" />
    </div>
  );
}

export function PresentationRenderer({
  entry,
  liveProps = {},
  hideIntro: _hideIntro = false,
  mode = "present",
}: {
  entry: RegistryEntry;
  liveProps?: Record<string, unknown>;
  hideIntro?: boolean;
  mode?: "gallery" | "present";
}) {
  const playTactileSounds = usePresentationStore((state) => state.settings.playTactileSounds !== false);

  switch (entry.slug) {
    case "image-reveal": {
      const imageRevealProps = {
        images: [
          "https://unsplash.com/photos/white-flower-in-tilt-shift-lens-GHQJhB2ATKM",
          "https://unsplash.com/photos/delicate-white-flowers-against-a-dark-blurred-background-gCWctwbJesc",
          "https://unsplash.com/photos/close-up-of-a-flower-HNh9EfacXXM",
          "https://unsplash.com/photos/purple-flower-in-close-up-photography-RKk9yMOONZs",
          "https://unsplash.com/photos/a-close-up-of-a-flower-SByu-FXu0Pw",
        ],
        ...liveProps,
      };
      return <ImageReveal {...(imageRevealProps as any)} />;
    }
    case "image-parallax": {
      const imageParallaxProps = {
        src: imageParallaxDemo,
        alt: "Aerial mountain landscape",
        depth: 10,
        tiltAmount: 5,
        ...liveProps,
      };
      return (
        <div className="w-full max-w-4xl mx-auto">
          <ImageParallax {...(imageParallaxProps as any)} />
        </div>
      );
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
        colorMode: "default" as const,
        spotlightRadius: 140,
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px] p-6">
          <SpotlightText {...(spotlightTextProps as Parameters<typeof SpotlightText>[0])} />
        </div>
      );
    }
    case "gravity-card-stack":
      return <GravityCardStack />;

    case "coverflow-carousel":
      return (
        <div className="w-full max-w-6xl flex items-center justify-center">
          <CoverflowCarousel className="h-[480px] translate-y-15 md:h-[520px] min-h-0 md:min-h-0" />
        </div>
      );

    // ── Buttons category ───────────────────────────────────────────────────
    case "void-button": {
      const voidProps = {
        variant: "default" as const,
        style: "default" as const,
        length: 192,
        children: "Default",
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px] p-6">
          <VoidButton
            variant={voidProps.variant}
            style={voidProps.style}
            length={voidProps.length}
          >
            {voidProps.children}
          </VoidButton>
        </div>
      );
    }
    case "brushed-titanium-button": {
      const titaniumProps = {
        disabled: false,
        length: 192,
        children: "TITANIUM",
        ...liveProps,
      };
      return (
        <div className="flex items-center justify-center w-full min-h-[300px] p-6">
          <BrushedTitaniumButton
            disabled={titaniumProps.disabled}
            length={titaniumProps.length}
          >
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

    case "pixel-melt":
      return <PixelMeltBackground />;
    case "breathing-grid":
      return <BreathingGrid />;
    case "breathing-background":
      return <BreathingBackground {...(liveProps as any)} />;
    case "floating-embers":
      return <FloatingEmbers />;
    case "spotlight-grid":
      return <SpotlightGrid />;
    case "lumina-wave":
      return <LuminaWave />;
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
      if (mode === "gallery") {
        return <AnisotropicKnobGalleryDemo size={132} {...liveProps} />;
      }
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

    case "ruler-scrollbar":
      return <RulerScrollbarDemo {...liveProps} />;
    case "scroll-progress":
      return <ScrollProgressDemo {...liveProps} />;
    case "scroll-water":
      return <ScrollWaterDemo {...liveProps} />;
    case "moon-pull":
      return <MoonPullDemo {...liveProps} />;
    case "stacked-cards":
      return <StackedCardsDemo {...liveProps} />;
    case "tilted-collage":
      return <TiltedCollageDemo {...liveProps} />;
    case "taped-marquee":
      return <TapedMarqueeDemo {...liveProps} />;
    case "choice":
      return <ChoiceDemo {...liveProps} />;
    case "modal":
      return <ModalDemo {...liveProps} />;
    case "dialog":
      return <DialogDemo {...liveProps} />;
    case "tabs":
      return <TabsDemo {...liveProps} />;
    case "segmented-control":
      return <SegmentedControlDemo {...liveProps} />;
    case "drawer":
      return <DrawerDemo {...liveProps} />;
    case "nav":
      return <NavDemo />;
    case "progress":
      return <ProgressDemo {...liveProps} />;
    case "combobox":
      return <ComboboxDemo {...liveProps} />;
    case "spinner":
      return <SpinnerDemo {...liveProps} />;
    case "button":
      return <ButtonDemo {...liveProps} />;
    case "text-field":
      return <TextFieldDemo {...liveProps} />;
    case "popover":
      return <PopoverDemo {...liveProps} />;
    case "file-upload":
      return <FileUploadDemo {...liveProps} />;
    case "table":
      return <TableDemo {...liveProps} />;
    case "breadcrumbs":
      return <BreadcrumbsDemo {...liveProps} />;

    case "now-playing-card":
      return <NowPlayingCard song={{ isPlaying: true, title: "Main Chala Jaunga", artist: "Fiddlecraft", album: "Hawai Jahaaz", image: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/c7/65/41c765a0-5a1e-3e35-9c22-5d664da2b95e/cover.jpg/600x600bb.jpg", songUrl: "https://open.spotify.com", playedAt: null }} />;
    case "wheel-picker":
      return <WheelPickerDemo liveProps={liveProps} playTactileSounds={playTactileSounds} />;
    case "weapon-wheel":
      return <WeaponWheelDemo liveProps={liveProps} />;

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
          <GithubHeatmap
            {...(liveProps as any)}
            className="w-full max-w-4xl"
            username="ajinkya-cell"
          />
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
      return (
        <div className="w-full max-w-xl flex items-center justify-center p-4">
          <ExpandOnHover
            items={expandItems}
            variant="modern"
            animation="spring"
            {...(liveProps as unknown as Partial<Parameters<typeof ExpandOnHover>[0]>)}
          />
        </div>
      );
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
        <div className="flex items-center justify-center w-full h-full min-h-[360px]">
          <SimpleCard
            title="Working Knowledge"
            description="Practical skills and insights gained through hands-on experience that drive real-world problem solving."
            imageUrl="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=520&h=380&fit=crop&auto=format"
          />
        </div>
      );
    case "marquee":
    case "dashed-marquee":
      return <MarqueeDemo liveProps={liveProps} />;
    case "accordion":
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
            <Accordion {...(accordionProps as Parameters<typeof Accordion>[0])} />
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
    case "timeline":
      return <TimelineDemo />;
    case "globe":
      return <Globe />;
    case "meter":
      return (
        <div className="w-full min-h-[400px] flex items-center justify-center p-6 bg-transparent">
          <Meter value={45} {...liveProps} />
        </div>
      );
    case "toast":
      return <ToastDemo {...liveProps} />;
    case "bento-grid":
      return <BentoGridDemo liveProps={liveProps} />;
    case "matrix-ripple-background":
      return <MatrixRippleBackground {...liveProps} />;
    case "stacked-card-fan":
      return <StackedCardFanDemo {...liveProps} />;
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ToastDemo(props: any) {
  const position = props.position ?? "bottom-right";
  const shows: { label: string; run: () => void }[] = [
    { label: "Default", run: () => toast("Changes saved", { description: "Your profile is up to date." }) },
    { label: "Success", run: () => toast.success("Deployment ready", { description: "main → production in 41s." }) },
    {
      label: "Error",
      run: () =>
        toast.error("Couldn't reach the server", {
          description: "Check your connection and try again.",
          action: { label: "Retry", onClick: () => toast.success("Connected") },
        }),
    },
    { label: "Warning", run: () => toast.warning("Storage almost full", { description: "7.4 of 10 GB used." }) },
    {
      label: "Promise",
      run: () => {
        toast.promise(wait(1800), { loading: "Publishing…", success: "Published", error: "Couldn't publish" });
      },
    },
    {
      label: "Action",
      run: () => toast("Message archived", { action: { label: "Undo", onClick: () => toast("Message restored") } }),
    },
  ];
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center p-4">
      <div className="grid w-[min(360px,100%)] grid-cols-2 gap-2.5 sm:grid-cols-3">
        {shows.map((show) => (
          <DialogButton key={show.label} onClick={show.run}>
            {show.label}
          </DialogButton>
        ))}
      </div>
      <Toaster
        position={position}
        expand={Boolean(props.expand)}
        visibleToasts={props.visibleToasts ?? 3}
        duration={props.duration ?? 5000}
      />
    </div>
  );
}

function SidebarDemo({ liveProps }: { liveProps: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const side = liveProps.side === "right" ? "right" : "left";

  if (liveProps.inline) {
    return (
      <div className="w-full p-8">
        <Sidebar inline />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-12">
      <DialogButton onClick={() => setIsOpen(true)}>Open sidebar</DialogButton>
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} side={side} />
    </div>
  );
}

const DRAWER_STATUS = [
  { value: "ready", label: "Ready", description: "Built and serving traffic." },
  { value: "building", label: "Building", description: "Queued or in progress." },
  { value: "failed", label: "Failed", description: "Stopped with an error." },
];

function DrawerDemo(props: any) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string[]>(["ready", "building"]);
  const [env, setEnv] = useState("production");
  const side = props.side === "left" ? "left" : "right";

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      side={side}
      size={props.size ?? "md"}
      dismissible={props.dismissible ?? true}
      title={props.title ?? "Filters"}
      description={props.description ?? "Narrow the deployments list. Filters apply as soon as you save."}
      trigger={<DialogButton>Filters</DialogButton>}
      footer={
        <>
          <DialogButton onClick={() => setStatus([])}>Clear</DialogButton>
          <DialogButton tone="primary" onClick={() => setOpen(false)}>
            Save filters
          </DialogButton>
        </>
      }
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium tracking-tight text-neutral-100">Environment</span>
          <SegmentedControl
            aria-label="Environment"
            fullWidth
            value={env}
            onValueChange={setEnv}
            options={[
              { value: "production", label: "Production" },
              { value: "preview", label: "Preview" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        <ChoiceGroup type="checkbox" label="Status" value={status} onValueChange={setStatus}>
          {DRAWER_STATUS.map((option) => (
            <Choice key={option.value} {...option} />
          ))}
        </ChoiceGroup>
      </div>
    </Drawer>
  );
}

function NavDemo() {
  return (
    <div className="w-[min(280px,calc(100vw-32px))] rounded-3xl border border-white/[0.08] border-t-white/[0.16] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)] p-3 shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)]">
      <Nav aria-label="Project" defaultValue="overview">
        <NavGroup label="Project">
          <NavItem value="overview" icon={<IconEye />}>Overview</NavItem>
          <NavSection label="Deployments" icon={<IconGitBranch />} defaultOpen>
            <NavItem value="production" badge="3">Production</NavItem>
            <NavItem value="previews">Previews</NavItem>
            <NavItem value="rollbacks">Rollbacks</NavItem>
          </NavSection>
          <NavItem value="storage" icon={<IconDatabase />}>Storage</NavItem>
          <NavItem value="logs" icon={<IconTerminal2 />}>Logs</NavItem>
        </NavGroup>
        <NavGroup label="Security">
          <NavItem value="access" icon={<IconShieldCheck />}>Access</NavItem>
          <NavItem value="danger" icon={<IconTrash />} disabled>Delete project</NavItem>
        </NavGroup>
      </Nav>
    </div>
  );
}

function CommandPaletteDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-[500px] w-full flex-col items-center justify-center gap-5 p-8">
      <DialogButton onClick={() => setIsOpen(true)}>
        Search
        <span className="ml-1 flex items-center gap-1 text-[11px] text-neutral-500">
          <kbd className="font-sans">⌘</kbd>
          <kbd className="font-sans">K</kbd>
        </span>
      </DialogButton>

      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
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

function TimelineDemo() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-8 min-h-[380px] w-full max-w-xl mx-auto font-['DM_Sans',sans-serif] select-none">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');` }} />

      <Timeline />
    </div>
  );
}





