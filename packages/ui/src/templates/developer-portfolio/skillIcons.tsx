"use client";

import type { CSSProperties, ReactElement } from "react";
import type { IconType } from "react-icons";
import { Database } from "lucide-react";
import { FaAws } from "react-icons/fa";
import {
  SiBun,
  SiClaude,
  SiCloudflare,
  SiCplusplus,
  SiDocker,
  SiDrizzle,
  SiExpress,
  SiFramer,
  SiGooglegemini,
  SiJavascript,
  SiLangchain,
  SiLanggraph,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenai,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiRust,
  SiShadcnui,
  SiSocketdotio,
  SiSolidity,
  SiSupabase,
  SiTailwindcss,
  SiTauri,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
  SiVite,
} from "react-icons/si";

// Brand logos for the skills strip, in each brand's own colour. Logos that are black by design
// use the page's text colour ("fg") so they read on both themes. Tools without a logo get a
// letter badge in their brand colour.

type GlyphProps = { className?: string; style?: CSSProperties; "aria-hidden"?: boolean | "true" };
type SkillIcon = { icon?: IconType | ((props: GlyphProps) => ReactElement); src?: string; color: string };

// Logos missing from react-icons, drawn from their official marks (Simple Icons / Lobe Icons /
// motion.dev). All fill with currentColor so the colour comes from the map below.
const glyph = (viewBox: string, d: string, evenOdd = false) =>
  function Glyph(props: GlyphProps) {
    return (
      <svg viewBox={viewBox} fill="currentColor" fillRule={evenOdd ? "evenodd" : undefined} {...props}>
        <path d={d} />
      </svg>
    );
  };

const CursorLogo = glyph(
  "0 0 24 24",
  "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"
);
const OpenCodeLogo = glyph("0 0 24 24", "M22 24H2V0h20zM17 4.8H7v14.4h10z", true);
const GroqLogo = glyph(
  "0 0 24 24",
  "M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z"
);
const ClaudeCodeLogo = glyph(
  "0 0 24 24",
  "M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z",
  true
);
const MotionLogo = glyph(
  "-0.5 -8.2 26.4 25.4",
  "M 9.587 0 L 4.57 9 L 0 9 L 3.917 1.972 C 4.524 0.883 6.039 0 7.301 0 Z M 20.794 2.25 C 20.794 1.007 21.817 0 23.079 0 C 24.341 0 25.364 1.007 25.364 2.25 C 25.364 3.493 24.341 4.5 23.079 4.5 C 21.817 4.5 20.794 3.493 20.794 2.25 Z M 10.443 0 L 15.013 0 L 9.997 9 L 5.427 9 Z M 15.841 0 L 20.411 0 L 16.494 7.028 C 15.887 8.117 14.372 9 13.11 9 L 10.825 9 Z"
);
const DatabaseIcon = (props: GlyphProps) => <Database strokeWidth={2.25} {...props} />;

const FG = "fg";

const ICONS: Record<string, SkillIcon> = {
  typescript: { icon: SiTypescript, color: "#3178C6" },
  javascript: { icon: SiJavascript, color: "#F7DF1E" },
  rust: { icon: SiRust, color: "#DEA584" },
  python: { icon: SiPython, color: "#3776AB" },
  "c++": { icon: SiCplusplus, color: "#00599C" },
  cpp: { icon: SiCplusplus, color: "#00599C" },
  sql: { icon: DatabaseIcon, color: "#60A5FA" },
  solidity: { icon: SiSolidity, color: FG },
  react: { icon: SiReact, color: "#61DAFB" },
  nextjs: { icon: SiNextdotjs, color: FG },
  tailwind: { icon: SiTailwindcss, color: "#06B6D4" },
  tailwindcss: { icon: SiTailwindcss, color: "#06B6D4" },
  shadcn: { icon: SiShadcnui, color: FG },
  shadcnui: { icon: SiShadcnui, color: FG },
  motion: { icon: MotionLogo, color: FG },
  framermotion: { icon: SiFramer, color: "#0055FF" },
  threejs: { icon: SiThreedotjs, color: FG },
  zustand: { src: "/developer-portfolio/zustand.svg", color: "#443E38" },
  nodejs: { icon: SiNodedotjs, color: "#5FA04E" },
  express: { icon: SiExpress, color: FG },
  bun: { icon: SiBun, color: FG },
  socketio: { icon: SiSocketdotio, color: FG },
  postgresql: { icon: SiPostgresql, color: "#4169E1" },
  postgres: { icon: SiPostgresql, color: "#4169E1" },
  mongodb: { icon: SiMongodb, color: "#47A248" },
  redis: { icon: SiRedis, color: "#FF4438" },
  drizzle: { icon: SiDrizzle, color: "#C5F74F" },
  drizzleorm: { icon: SiDrizzle, color: "#C5F74F" },
  prisma: { icon: SiPrisma, color: FG },
  supabase: { icon: SiSupabase, color: "#3FCF8E" },
  vercel: { icon: SiVercel, color: FG },
  cloudflare: { icon: SiCloudflare, color: "#F38020" },
  aws: { icon: FaAws, color: "#FF9900" },
  docker: { icon: SiDocker, color: "#2496ED" },
  tauri: { icon: SiTauri, color: "#24C8D8" },
  vite: { icon: SiVite, color: "#646CFF" },
  claude: { icon: SiClaude, color: "#D97757" },
  claudecode: { icon: ClaudeCodeLogo, color: "#D97757" },
  openai: { icon: SiOpenai, color: FG },
  chatgpt: { icon: SiOpenai, color: FG },
  gemini: { icon: SiGooglegemini, color: "#8E75B2" },
  langchain: { icon: SiLangchain, color: FG },
  langgraph: { icon: SiLanggraph, color: FG },
  cursor: { icon: CursorLogo, color: FG },
  groq: { icon: GroqLogo, color: "#F55036" },
  opencode: { icon: OpenCodeLogo, color: FG },
};

const keyOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9+]/g, "");

/** The coloured logo for a skill, or a letter badge when there's no logo. */
export function SkillLogo({ name }: { name: string }) {
  const entry = ICONS[keyOf(name)] ?? ICONS[keyOf(name).replace(/\+/g, "")];
  const color = !entry || entry.color === FG ? "var(--pf-fg)" : entry.color;

  if (entry?.src) {
    return <img src={entry.src} alt="" aria-hidden="true" className="size-5 shrink-0 object-contain" />;
  }
  if (entry?.icon) {
    const Icon = entry.icon;
    return <Icon aria-hidden="true" className="size-5 shrink-0" style={{ color }} />;
  }
  return (
    <span
      aria-hidden="true"
      className="pf-mono grid size-5 shrink-0 place-items-center rounded-[5px] text-[11px] font-bold leading-none text-white"
      style={{ background: entry ? entry.color : "var(--pf-subtle)" }}
    >
      {name.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase()}
    </span>
  );
}
