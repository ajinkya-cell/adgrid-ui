"use client";

import { forwardRef, useId, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { ChartCard, ChartTray, PopoutGradient, Swatch, type ChartCardProps } from "./ChartCard";
import { useTween, useWidth } from "./hooks";
import { compact, ringSegment, sliceFill } from "./scale";

// Parts of a whole, as a ring of machined segments in a recessed socket. The first slice is
// popout and the rest step down in luminance, split by 2px cuts. The total sits in a sunken face
// in the middle; hovering or focusing a slice (in the ring or the list) lifts it out by 3px and
// puts its numbers in the face. On mount the ring sweeps round from twelve o'clock.

export interface DonutDatum {
  label: string;
  value: number;
}

export interface DonutChartProps extends Omit<ChartCardProps, "legend" | "table" | "children"> {
  /** Slices, in the order they should run. Put the largest first so it gets the popout. */
  data: DonutDatum[];
  variant?: "donut" | "pie";
  /** Ring diameter in px. Default 168. */
  diameter?: number;
  /** Ring thickness in px. Default 20. */
  thickness?: number;
  /** Shown in the face when nothing is active. Default: the formatted total. */
  centerValue?: ReactNode;
  /** Under the centre value. Default "Total". */
  centerLabel?: ReactNode;
  /** The list of slices beside the ring. Default true. */
  legend?: boolean;
  formatValue?: (value: number) => string;
  animateOnMount?: boolean;
}

const pct = (v: number, total: number) => `${total ? Math.round((v / total) * 1000) / 10 : 0}%`;

export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(function DonutChart(
  {
    data,
    variant = "donut",
    diameter = 168,
    thickness = 20,
    centerValue,
    centerLabel = "Total",
    legend = true,
    formatValue = compact,
    animateOnMount = true,
    ...card
  },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const labelId = `${uid}-label`;
  const [trayRef, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const raw = data.map((d) => Math.max(0, d.value));
  const values = useTween(raw, false);
  const [sweep] = useTween([1], animateOnMount, 1);
  const total = values.reduce((a, b) => a + b, 0);
  const targetTotal = raw.reduce((a, b) => a + b, 0);
  const side = width === 0 || width >= 340;

  const D = diameter;
  const c = D / 2;
  const r1 = c - 4;
  const r0 = variant === "pie" ? 0 : Math.max(8, r1 - thickness);
  const gapDeg = ((2 / Math.max(12, (r0 + r1) / 2)) * 180) / Math.PI;

  let a = 0;
  const slices = values.map((v, i) => {
    const span = total ? (v / total) * 360 * sweep : 0;
    const start = a;
    a += span;
    return { i, start, span };
  });

  const face = active == null
    ? { value: centerValue ?? formatValue(targetTotal), label: centerLabel }
    : { value: pct(raw[active], targetTotal), label: data[active]?.label };

  return (
    <ChartCard
      {...card}
      ref={ref}
      labelId={labelId}
      table={{ columns: ["Slice", "Value", "Share"], rows: data.map((d) => [d.label, formatValue(d.value), pct(d.value, targetTotal)]) }}
    >
      <ChartTray ref={trayRef} className={cn("flex flex-1 items-center justify-center gap-5 p-4", side ? "flex-row" : "flex-col gap-3")}>
        <div className="relative shrink-0" style={{ width: D, height: D }}>
          <svg
            width={D}
            height={D}
            className="block overflow-visible"
            role="img"
            aria-labelledby={card.label ? labelId : undefined}
            onPointerLeave={() => setActive(null)}
          >
            <defs>
              <PopoutGradient id={`${uid}-pop`} />
            </defs>
            {/* The socket the ring sits in. */}
            <path d={ringSegment(c, c, r0, r1, 0, 360)} fill="#070707" />
            {slices.map(({ i, start, span }) => {
              if (span <= gapDeg) return null;
              const lift = active === i ? 3 : 0;
              return (
                <path
                  key={i}
                  d={ringSegment(c, c, r0 && r0 + lift * 0.3, r1 + lift, start + gapDeg / 2, start + span - gapDeg / 2)}
                  fill={sliceFill(i, `${uid}-pop`)}
                  className="transition-opacity duration-150"
                  style={{ opacity: active != null && active !== i ? 0.45 : 1 }}
                  onPointerEnter={() => setActive(i)}
                />
              );
            })}
            {r0 > 0 && (
              <circle cx={c} cy={c} r={Math.max(0, r0 - 7)} fill="#070707" stroke="rgba(255,255,255,0.04)" />
            )}
          </svg>
          {r0 > 0 && (
            <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[22px] font-semibold leading-none tracking-[-0.04em] text-neutral-100 tabular-nums">{face.value}</span>
              <span className="mt-1.5 max-w-[60%] truncate text-[11px] text-neutral-500">{face.label}</span>
            </div>
          )}
        </div>

        {legend && (
          <ul className={cn("flex min-w-0 flex-col gap-0.5", side ? "flex-1" : "w-full")}>
            {data.map((d, i) => (
              <li key={i}>
                <button
                  type="button"
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    "flex h-7 w-full items-center gap-2.5 rounded-lg px-2 text-left text-xs outline-none transition-colors duration-150",
                    "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/40",
                    active === i ? "bg-white/[0.03] text-neutral-100" : "text-neutral-400"
                  )}
                >
                  <Swatch tone={i} mark="bar" fill={sliceFill(i, `${uid}-pop`)} />
                  <span className="min-w-0 flex-1 truncate">{d.label}</span>
                  <span className="font-medium tabular-nums text-neutral-100">{formatValue(d.value)}</span>
                  <span className="w-10 text-right tabular-nums text-neutral-500">{pct(d.value, targetTotal)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ChartTray>
    </ChartCard>
  );
});

export default DonutChart;
