"use client";

import type { IconType } from "react-icons";
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
  SiMysql,
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

type SkillIcon = { icon?: IconType; color: string };

const FG = "fg";

const ICONS: Record<string, SkillIcon> = {
  typescript: { icon: SiTypescript, color: "#3178C6" },
  javascript: { icon: SiJavascript, color: "#F7DF1E" },
  rust: { icon: SiRust, color: "#DEA584" },
  python: { icon: SiPython, color: "#3776AB" },
  "c++": { icon: SiCplusplus, color: "#00599C" },
  cpp: { icon: SiCplusplus, color: "#00599C" },
  sql: { icon: SiMysql, color: "#4479A1" },
  solidity: { icon: SiSolidity, color: FG },
  react: { icon: SiReact, color: "#61DAFB" },
  nextjs: { icon: SiNextdotjs, color: FG },
  tailwind: { icon: SiTailwindcss, color: "#06B6D4" },
  tailwindcss: { icon: SiTailwindcss, color: "#06B6D4" },
  shadcn: { icon: SiShadcnui, color: FG },
  shadcnui: { icon: SiShadcnui, color: FG },
  motion: { icon: SiFramer, color: FG },
  framermotion: { icon: SiFramer, color: "#0055FF" },
  threejs: { icon: SiThreedotjs, color: FG },
  zustand: { color: "#443E38" },
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
  claudecode: { icon: SiClaude, color: "#D97757" },
  openai: { icon: SiOpenai, color: FG },
  chatgpt: { icon: SiOpenai, color: FG },
  gemini: { icon: SiGooglegemini, color: "#8E75B2" },
  langchain: { icon: SiLangchain, color: FG },
  langgraph: { icon: SiLanggraph, color: FG },
  cursor: { color: "#8A8A8A" },
  groq: { color: "#F55036" },
  opencode: { color: "#8A8A8A" },
};

const keyOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9+]/g, "");

/** The coloured logo for a skill, or a letter badge when there's no logo. */
export function SkillLogo({ name }: { name: string }) {
  const entry = ICONS[keyOf(name)] ?? ICONS[keyOf(name).replace(/\+/g, "")];
  const color = !entry || entry.color === FG ? "var(--pf-fg)" : entry.color;

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
