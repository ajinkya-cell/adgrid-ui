"use client";

import { forwardRef, useId, useState, type PointerEvent, type ReactNode } from "react";
import { ChartCard, ChartTray, type ChartCardProps } from "./ChartCard";
import { useTween, useWidth } from "./hooks";
import { SLICE_FILLS, arcPath, clamp } from "./scale";

// Progress toward several goals as concentric rings. Each ring is a recessed track cut into the
// tray; the progress is a popout arc in it, outermost first and stepping down in luminance
// inward. The rings run 270° clockwise from twelve o'clock and their names sit in the open
// quarter. Hovering a ring dims the others and puts its number in the middle.

export interface RadialBarDatum {
  label: string;
  value: number;
  /** Default 100. */
  max?: number;
}

export interface RadialBarChartProps extends Omit<ChartCardProps, "legend" | "table" | "children"> {
  data: RadialBarDatum[];
  /** Diameter in px. Default 208. */
  diameter?: number;
  /** Ring thickness in px. Default 10. */
  thickness?: number;
  /** Space between rings in px. Default 6. */
  gap?: number;
  /** Shown in the middle when nothing is active. */
  centerValue?: ReactNode;
  centerLabel?: ReactNode;
  /** Formats a ring's value. Default: percent of its max. */
  formatValue?: (value: number, max: number) => string;
  animateOnMount?: boolean;
}

const SWEEP = 270;
const defaultFormat = (v: number, max: number) => `${Math.round((v / (max || 1)) * 100)}%`;

export const RadialBarChart = forwardRef<HTMLDivElement, RadialBarChartProps>(function RadialBarChart(
  {
    data,
    diameter = 208,
    thickness = 10,
    gap = 6,
    centerValue,
    centerLabel,
    formatValue = defaultFormat,
    animateOnMount = true,
    ...card
  },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const labelId = `${uid}-label`;
  const [trayRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const fracs = data.map((d) => clamp(d.value / (d.max ?? 100), 0, 1));
  const shown = useTween(fracs, animateOnMount, 1);

  const D = Math.max(120, Math.min(diameter, width ? width - 24 : diameter));
  const c = D / 2;
  const rOuter = c - thickness / 2 - 2;
  const radius = (k: number) => rOuter - k * (thickness + gap);
  const rings = data.filter((_, k) => radius(k) - thickness / 2 > 8);

  const onPointer = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const d = Math.hypot(e.clientX - rect.left - c, e.clientY - rect.top - c);
    const k = Math.round((rOuter - d) / (thickness + gap));
    setActive(k >= 0 && k < rings.length && Math.abs(radius(k) - d) <= thickness / 2 + gap / 2 ? k : null);
  };

  const face =
    active == null
      ? { value: centerValue, label: centerLabel }
      : { value: formatValue(data[active].value, data[active].max ?? 100), label: data[active].label };

  return (
    <ChartCard
      {...card}
      ref={ref}
      labelId={labelId}
      table={{
        columns: ["Goal", "Value", "Target"],
        rows: data.map((d) => [d.label, formatValue(d.value, d.max ?? 100), String(d.max ?? 100)]),
      }}
    >
      <ChartTray ref={trayRef} className="flex justify-center p-4">
        <div className="relative" style={{ width: D, height: D }}>
          <svg
            width={D}
            height={D}
            className="block overflow-visible"
            role="img"
            aria-labelledby={card.label ? labelId : undefined}
            onPointerMove={onPointer}
            onPointerLeave={() => setActive(null)}
          >
            <defs>
              <linearGradient id={`${uid}-pop`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={D}>
                <stop offset="0%" stopColor="#f5f5f5" />
                <stop offset="100%" stopColor="#d9d9d9" />
              </linearGradient>
            </defs>
            {rings.map((d, k) => {
              const r = radius(k);
              const f = shown[k];
              const dim = active != null && active !== k;
              return (
                <g key={k} className="transition-opacity duration-150" style={{ opacity: dim ? 0.4 : 1 }}>
                  <path d={arcPath(c, c, r, 0, SWEEP)} fill="none" stroke="#070707" strokeWidth={thickness} strokeLinecap="round" />
                  {f > 0.002 && (
                    <path
                      d={arcPath(c, c, r, 0, Math.max(0.5, SWEEP * f))}
                      fill="none"
                      stroke={k === 0 ? `url(#${uid}-pop)` : SLICE_FILLS[Math.min(k, SLICE_FILLS.length - 1)]}
                      strokeWidth={thickness - 2}
                      strokeLinecap="round"
                    />
                  )}
                  <text
                    x={c - 10}
                    y={c - r}
                    textAnchor="end"
                    dominantBaseline="middle"
                    style={{ fontSize: 10.5, fontFeatureSettings: "'tnum'" }}
                  >
                    <tspan fill={active === k ? "rgb(245 245 245)" : "rgb(163 163 163)"}>{d.label}</tspan>
                    <tspan fill="rgb(115 115 115)" dx="5">
                      {formatValue(d.value, d.max ?? 100)}
                    </tspan>
                  </text>
                </g>
              );
            })}
          </svg>
          {(face.value != null || face.label != null) && (
            <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              {face.value != null && (
                <span className="text-[20px] font-semibold leading-none tracking-[-0.04em] text-neutral-100 tabular-nums">{face.value}</span>
              )}
              {face.label != null && <span className="mt-1.5 max-w-[40%] truncate text-[11px] text-neutral-500">{face.label}</span>}
            </div>
          )}
        </div>
      </ChartTray>
    </ChartCard>
  );
});

export default RadialBarChart;
