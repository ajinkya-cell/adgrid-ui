"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "../lib/utils";
import {
  ReactOriginal,
  NextjsOriginal,
  TypescriptOriginal,
  TailwindcssOriginal,
  NodejsOriginal,
  GoOriginal,
  DockerOriginal,
  PythonOriginal,
  PostgresqlOriginal,
  RedisOriginal,
  GraphqlPlain,
  GithubOriginal,
  FigmaOriginal,
  ViteOriginal,
  VuejsOriginal,
  SassOriginal,
} from "devicons-react";

export type Marquee2Variant = "wave" | "arch" | "valley" | "double-wave" | "straight";

export interface Marquee2Props {
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  variant?: Marquee2Variant;
  showTitleOnHover?: boolean;
  showTitle?: boolean;
}

const DEFAULT_ICONS = [
  { name: "React", Icon: ReactOriginal },
  { name: "Next.js", Icon: NextjsOriginal },
  { name: "TypeScript", Icon: TypescriptOriginal },
  { name: "Tailwind CSS", Icon: TailwindcssOriginal },
  { name: "Node.js", Icon: NodejsOriginal },
  { name: "Go", Icon: GoOriginal },
  { name: "Docker", Icon: DockerOriginal },
  { name: "Python", Icon: PythonOriginal },
  { name: "PostgreSQL", Icon: PostgresqlOriginal },
  { name: "Redis", Icon: RedisOriginal },
  { name: "GraphQL", Icon: GraphqlPlain },
  { name: "GitHub", Icon: GithubOriginal },
  { name: "Figma", Icon: FigmaOriginal },
  { name: "Vite", Icon: ViteOriginal },
  { name: "Vue", Icon: VuejsOriginal },
  { name: "Sass", Icon: SassOriginal },
];

const PATHS: Record<Marquee2Variant, string> = {
  wave: "M -100 225 C 180 80, 440 80, 720 225 C 1000 370, 1260 370, 1540 225",
  arch: "M -100 400 C 320 0, 1120 0, 1540 400",
  valley: "M -100 50 C 320 450, 1120 450, 1540 50",
  "double-wave":
    "M -100 225 C 0 125, 210 125, 310 225 C 410 325, 620 325, 720 225 C 820 125, 1030 125, 1130 225 C 1230 325, 1440 325, 1540 225",
  straight: "M -100 225 L 1540 225",
};

export default function Marquee2({
  className,
  speed = 1,
  pauseOnHover = true,
  variant = "wave",
  showTitleOnHover = true,
  showTitle,
}: Marquee2Props) {
  const isTitleEnabled = showTitle ?? showTitleOnHover;
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const isHoveredRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const selectedPathD = PATHS[variant] || PATHS.wave;

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const totalLength = path.getTotalLength();
    const iconCount = DEFAULT_ICONS.length;

    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!isHoveredRef.current || !pauseOnHover) {
        progressRef.current = (progressRef.current + delta * 50 * speed) % totalLength;
      }

      const currentProgress = progressRef.current;
      const newPos: { x: number; y: number }[] = [];

      for (let i = 0; i < iconCount; i++) {
        const offset = (currentProgress + (i / iconCount) * totalLength) % totalLength;
        const pt = path.getPointAtLength(offset);
        newPos.push({ x: pt.x, y: pt.y });
      }

      setPositions(newPos);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, pauseOnHover, variant]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={cn(
        "relative w-full h-[450px] overflow-hidden select-none bg-transparent flex items-center justify-center",
        className
      )}
    >
      {/* Invisible Motion Reference Path */}
      <svg
        viewBox="0 0 1440 450"
        className="w-full h-full absolute inset-0 overflow-visible pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          ref={pathRef}
          d={selectedPathD}
          fill="none"
          stroke="none"
        />
      </svg>

      {/* Pure Devicons floating dynamically along path */}
      <div className="absolute inset-0 pointer-events-none">
        {positions.map((pos, idx) => {
          const item = DEFAULT_ICONS[idx];
          const IconComp = item.Icon;

          const leftPercent = (pos.x / 1440) * 100;
          const topPercent = (pos.y / 450) * 100;

          return (
            <div
              key={idx}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute pointer-events-auto transition-transform duration-200 hover:scale-130 hover:z-30 cursor-pointer group"
            >
              <div className="relative flex flex-col items-center justify-center p-2 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
                <IconComp size={48} />
                {/* Tooltip on hover */}
                {isTitleEnabled && (
                  <span className="absolute -bottom-8 px-2 py-0.5 rounded bg-neutral-900/90 border border-white/10 text-[10px] font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                    {item.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
