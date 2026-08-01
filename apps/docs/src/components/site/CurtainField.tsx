"use client";

type Strand = {
  d: string;
  delay: number;
  duration: number;
  opacity: number;
  width: number;
};

// 4 Perfectly parallel concentric curves for the Top-Right curtain.
// Each curve is strictly offset by (dx = +36, dy = +14), ensuring zero line crossings.
const topRightStrands: Strand[] = [
  { d: "M 520 330 C 560 220, 680 120, 880 40", delay: 0, duration: 22, opacity: 0.55, width: 1.4 },
  { d: "M 556 344 C 596 234, 716 134, 916 54", delay: 1.2, duration: 24, opacity: 0.45, width: 1.2 },
  { d: "M 592 358 C 632 248, 752 148, 952 68", delay: 2.4, duration: 26, opacity: 0.35, width: 1.0 },
  { d: "M 628 372 C 668 262, 788 162, 988 82", delay: 3.6, duration: 28, opacity: 0.25, width: 0.85 },
];

export function CurtainField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div className="absolute inset-0 bg-radial-vignette" />
      <div className="absolute inset-0 bg-grain opacity-[0.4]" />

      <svg
        className="absolute inset-0 h-full w-full opacity-90"
        viewBox="0 0 1000 800"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Multi-stop gradient fading out smoothly at both ends of each strand */}
          <linearGradient id="strandGradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="25%" stopColor="#a78bfa" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#f2f2f4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e8e8ea" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Top-Right Parallel Strand Cluster */}
        <g>
          {topRightStrands.map((s, i) => (
            <path
              key={`tr-${i}`}
              d={s.d}
              stroke="url(#strandGradient)"
              strokeWidth={s.width}
              strokeLinecap="round"
              className="strand-breathe"
              style={{
                ["--strand-o" as string]: s.opacity,
                animationDelay: `${-s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </g>

        {/* Bottom-Left Strand Cluster (Exact 180° Rotational Symmetry around Center (500, 400)) */}
        <g transform="rotate(180 500 400)">
          {topRightStrands.map((s, i) => (
            <path
              key={`bl-${i}`}
              d={s.d}
              stroke="url(#strandGradient)"
              strokeWidth={s.width}
              strokeLinecap="round"
              className="strand-breathe"
              style={{
                ["--strand-o" as string]: s.opacity,
                animationDelay: `${-s.delay * 1.3}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
