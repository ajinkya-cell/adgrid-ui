"use client";

// Recessive axes shared by the cartesian charts: grid lines cut faintly into the tray, tick labels
// in tertiary ink at 10.5px. The zero line is one step firmer, so the baseline reads.

const LABEL = "rgb(115 115 115)";
const FONT = { fontSize: 10.5, fontFeatureSettings: "'tnum'" } as const;

export function YGrid({
  ticks,
  y,
  x0,
  x1,
  format,
  grid = true,
}: {
  ticks: number[];
  y: (v: number) => number;
  x0: number;
  x1: number;
  format: (v: number) => string;
  grid?: boolean;
}) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <g key={t}>
          {(grid || t === 0) && (
            <line
              x1={x0}
              x2={x1}
              y1={Math.round(y(t)) + 0.5}
              y2={Math.round(y(t)) + 0.5}
              stroke={t === 0 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.045)"}
            />
          )}
          <text x={x0 - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fill={LABEL} style={FONT}>
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Category labels along the bottom, thinned so they never collide. */
export function XLabels({
  labels,
  x,
  y,
  width,
  minGap = 52,
  edgeAlign = true,
}: {
  labels: string[];
  x: (i: number) => number;
  y: number;
  width: number;
  minGap?: number;
  edgeAlign?: boolean;
}) {
  const n = labels.length;
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(width / minGap))));
  return (
    <g aria-hidden>
      {labels.map((l, i) => {
        if (i % every !== 0) return null;
        const anchor = edgeAlign && n > 1 && i === 0 ? "start" : edgeAlign && n > 1 && i === n - 1 ? "end" : "middle";
        return (
          <text key={i} x={x(i)} y={y} textAnchor={anchor} fill={LABEL} style={FONT}>
            {l}
          </text>
        );
      })}
    </g>
  );
}

/** Rough width of a tick label, to size the left gutter. */
export const labelWidth = (labels: string[]) => Math.max(14, ...labels.map((l) => l.length * 6.2)) + 12;
