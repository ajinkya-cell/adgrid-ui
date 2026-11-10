import type { PortfolioData } from "./types";

// Default content: Ajinkya Dharkar's portfolio (ajinkya.org). Replace all of it through the
// `data` prop. Images and the resume live in apps/docs/public/developer-portfolio/.
const ASSETS = "/developer-portfolio";

export const defaultPortfolioData: PortfolioData = {
  profile: {
    name: "Ajinkya Dharkar",
    role: "Creator",
    company: "Void UI",
    companyUrl: "https://voidui.in",
    location: "India",
    timezone: "Asia/Kolkata",
    avatar: `${ASSETS}/avatar.jpg`,
    cover: `${ASSETS}/cover.jpg`,
    coverVideo: `${ASSETS}/cover.mp4`,
    coverPosition: "center 62%",
    handle: "@ajinkya-cell",
    verified: false,
    tagline: "I help founders turn ideas into crazy looking softwares.",
    taglineEmphasis: "crazy looking softwares",
    building: { label: "voidui.in", url: "https://voidui.in" },
    available: true,
    email: "ajinkyadharkar88@gmail.com",
    bookingUrl: "https://cal.com/ajinkya-dharkar-oqbbdf/let-s-chat",
    calLink: "ajinkya-dharkar-oqbbdf/let-s-chat",
    bookingNote: "I'm very flexible with time zone communications.",
  },
  intro: [
    "Hi, I'm **Ajinkya**, a curious engineer who builds software that genuinely **needs to exist**.",
    "Creator of **Void UI**, open-source dark-first React components: **57 components** through a shadcn-compatible CLI.",
    "Shipped **Rusper**, native Windows voice dictation in **Rust + Tauri** with sub-300ms speech-to-text.",
  ],
  featured: [
    { platform: "x", title: "Ajinkya Dharkar", subtitle: "@ajinkyacell", action: "Follow", url: "https://x.com/ajinkyacell" },
    { platform: "community", title: "Void UI", subtitle: "Open-source React components", action: "Explore", url: "https://voidui.in", live: true },
  ],
  openSourceUrl: "https://github.com/ajinkya-cell/adgrid-ui",
  socials: [
    { platform: "github", label: "GitHub", url: "https://github.com/ajinkya-cell" },
    { platform: "x", label: "X", url: "https://x.com/ajinkyacell" },
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/ajinkya-dharkar-a844b1258/" },
    { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/ajinkya_dharkar/" },
    { platform: "email", label: "Email", url: "mailto:ajinkyadharkar88@gmail.com" },
  ],
  resumes: [{ label: "Resume", url: `${ASSETS}/resume.pdf` }],
  about: [
    "I build software that I feel genuinely needs to exist. Whenever an idea sparks for an application that solves real friction or reimagines interaction, I sit down and build it. I am always learning and refining my skills.",
    "Behind the screen I like a good balance: coding and learning new things, the gym, and following MMA for the discipline and mindset behind it. I play chess, which taught me to think a few moves ahead and stay calm in a bad position. I read Robert Greene and admire Jaun Elia's writing.",
  ],
  stack: [
    { label: "Languages", items: ["TypeScript", "JavaScript", "Rust", "Python", "C++", "SQL", "Solidity"] },
    { label: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "shadcn/ui", "Motion", "Three.js", "Zustand"] },
    { label: "Backend & data", items: ["Node.js", "Express", "Bun", "Socket.io", "PostgreSQL", "MongoDB", "Redis", "Drizzle", "Prisma", "Supabase"] },
    { label: "Infra", items: ["Vercel", "Cloudflare", "AWS", "Docker", "Tauri"] },
    { label: "AI", items: ["Claude Code", "OpenCode", "Cursor", "Gemini", "Groq", "LangChain", "LangGraph"] },
  ],
  experience: [
    {
      company: "Void UI",
      url: "https://voidui.in",
      location: "India",
      mode: "Remote",
      roles: [
        {
          title: "Creator & Maintainer",
          type: "Open source",
          start: "2026-01",
          bullets: [
            "Built an open-source, dark-first React component library with 57 interactive components.",
            "Designed tactile interactions with spring physics, custom WebGL shaders and synthesized Web Audio click sounds.",
            "Shipped a Code Studio with live props tweakers, the Roughly hand-drawn annotation suite and a shadcn-compatible CLI registry.",
          ],
          tags: ["Next.js 16", "React 19", "TypeScript", "Framer Motion", "Three.js", "Tailwind CSS"],
        },
      ],
    },
    {
      company: "Independent",
      location: "India",
      mode: "Remote",
      roles: [
        {
          title: "Full-stack Developer",
          type: "Freelance",
          start: "2025-01",
          bullets: [
            "Help founders turn ideas into polished, production-ready software.",
            "Built MoodMetrics, a real-time crypto sentiment engine fusing five data sources with Llama 3.1 via Nvidia NIM.",
            "Built Rusper, a native Windows voice dictation app in Rust and Tauri v2 with sub-300ms speech-to-text.",
          ],
          tags: ["Next.js", "TypeScript", "Rust", "PostgreSQL", "Drizzle ORM", "Tauri"],
        },
      ],
    },
  ],
  projects: [
    {
      name: "MoodMetrics",
      description:
        "Real-time crypto sentiment engine blending Reddit AI analysis, news, funding rates and Fear & Greed, with a strategy backtester and quant tools.",
      image: `${ASSETS}/projects/mood-metrics.jpg`,
      tags: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM", "Nvidia NIM", "pgvector"],
      liveUrl: "https://mm.ajinkya.org/",
      sourceUrl: "https://github.com/ajinkya-cell/mood-metrics",
    },
    {
      name: "Rusper",
      description:
        "Native Windows voice dictation and in-place AI editing in Rust + Tauri. Sub-300ms speech-to-text at 200+ WPM into any app, using your own free Groq key.",
      image: `${ASSETS}/projects/rusper.jpg`,
      tags: ["Rust", "Tauri v2", "React", "TypeScript", "Groq LPU", "Win32 API"],
      liveUrl: "https://rusper.ajinkya.org/",
      sourceUrl: "https://github.com/ajinkya-cell/rusper",
    },
    {
      name: "Void UI",
      description:
        "Open-source, dark-first React components with tactile springs, WebGL and synthesized click sounds. 57 components, installable through a shadcn-compatible CLI.",
      image: `${ASSETS}/projects/void.jpg`,
      tags: ["Next.js 16", "React 19", "TypeScript", "Framer Motion", "Three.js", "Tailwind CSS", "Web Audio API"],
      liveUrl: "https://voidui.in/",
      sourceUrl: "https://github.com/ajinkya-cell/adgrid-ui",
    },
  ],
  projectsUrl: "https://ajinkya.org/myProjects",
  projectsNote: "the ones I'm actually proud of",
  githubUsername: "ajinkya-cell",
  recognition: [
    {
      title: "Foundations of Cybersecurity",
      kind: "Certificate",
      issuer: "Google · Coursera",
      url: "https://coursera.org/verify/7MCVXLGXXAVZ",
    },
  ],
  education: [],
  posts: [],
};
