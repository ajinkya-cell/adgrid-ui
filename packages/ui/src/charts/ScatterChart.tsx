"use client";

import { forwardRef, useId, useState, type PointerEvent } from "react";
import { ChartCard, ChartTray, type ChartCardProps } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { XLabels, YGrid, labelWidth } from "./axes";
import { useTween, useWidth } from "./hooks";
import { clamp, compact, linear, niceDomain, tone } from "./scale";

// Two measures against each other, one pearl per record. The first series is solid popout
// pearls, the second hollow rings, later ones smaller and dimmer, and each pearl sits in a 2px ring
// of the tray's colour so overlaps stay legible. A third value can size the pearls (bubbles).
// The nearest pearl to the pointer lifts, with dashed guides back to both axes.

export interface ScatterPoint {
  x: number;
  y: number;
  /** Sizes the pearl when the chart has a size channel. */
  z?: number;
  label?: string;
}

export interface ScatterSeries {
  key: string;
  label: string;
  tone?: number;
  points: ScatterPoint[];
}

export interface ScatterChartProps extends Omit<ChartCardProps, "legend" | "table" | "children"> {
  series: ScatterSeries[];
  xLabel?: string;
  yLabel?: string;
  /** Label for the size channel in the tooltip. */
  zLabel?: string;
  height?: number;
  grid?: boolean;
  legend?: boolean;
  tooltip?: boolean;
  formatX?: (v: number) => string;
  formatY?: (v: number) => string;
  formatZ?: (v: number) => string;
  animateOnMount?: boolean;
}

const PAD = { r: 14, t: 14, b: 28 };

export const ScatterChart = forwardRef<HTMLDivElement, ScatterChartProps>(function ScatterChart(
  {
    series,
    xLabel = "x",
    yLabel = "y",
    zLabel = "size",
    height = 200,
    grid = true,
    legend = true,
    tooltip = true,
    formatX = compact,
    formatY = compact,
    formatZ = compact,
    animateOnMount = true,
    ...card
  },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const labelId = `${uid}-label`;
  const [plotRef, width] = useWidth<HTMLDivElement>();
  const all = series.flatMap((s, si) => s.points.map((p, pi) => ({ ...p, si, pi })));
  const coords = useTween(all.flatMap((p) => [p.x, p.y]), false);
  const [grow] = useTween([1], animateOnMount, 1.1);
  const toneOf = (si: number) => series[si].tone ?? si;

  const xs = all.map((p) => p.x);
  const ys = all.map((p) => p.y);
  const zs = all.map((p) => p.z ?? 0);
  const xd = niceDomain(Math.min(...xs, 0), Math.max(...xs, 1), 5);
  const yd = niceDomain(Math.min(...ys, 0), Math.max(...ys, 1), 4);
  const zMax = Math.max(...zs, 0);
  const radius = (z: number | undefined, si: number) =>
    zMax > 0 && z != null ? 3.5 + Math.sqrt(z / zMax) * 7.5 : toneOf(si) >= 2 ? 3 : 4;

  const padL = labelWidth(yd.ticks.map(formatY));
  const iw = Math.max(1, width - padL - PAD.r);
  const xAt = linear(xd.min, xd.max, padL, padL + iw);
  const yAt = linear(yd.min, yd.max, height - PAD.b, PAD.t);
  const xTicks = xd.ticks;

  const [activeKey, setActiveKey] = useState<number | null>(null);
  const active = activeKey == null ? null : all[activeKey] ?? null;

  const onPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    let best = -1;
    let bestD = 28;
    all.forEach((_, k) => {
      const d = Math.hypot(xAt(coords[k * 2]) - px, yAt(coords[k * 2 + 1]) - py);
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    });
    setActiveKey(best < 0 ? null : best);
  };

  return (
    <ChartCard
      {...card}
      ref={ref}
      labelId={labelId}
      legend={legend && series.length > 1 ? series.map((s, si) => ({ label: s.label, tone: toneOf(si), mark: "dot" as const })) : undefined}
      table={{
        columns: ["Series", xLabel, yLabel, ...(zMax > 0 ? [zLabel] : [])],
        rows: all.map((p) => [p.label ?? series[p.si].label, formatX(p.x), formatY(p.y), ...(zMax > 0 ? [formatZ(p.z ?? 0)] : [])]),
      }}
    >
      <ChartTray ref={plotRef} style={{ height }} role="img" aria-labelledby={card.label ? labelId : undefined}>
        {width > 0 && (
          <svg width={width} height={height} className="absolute inset-0 block overflow-visible">
            <YGrid ticks={yd.ticks} y={yAt} x0={padL} x1={width - PAD.r} format={formatY} grid={grid} />
            {grid &&
              xTicks.map((t) => (
                <line key={t} x1={Math.round(xAt(t)) + 0.5} x2={Math.round(xAt(t)) + 0.5} y1={PAD.t} y2={height - PAD.b} stroke="rgba(255,255,255,0.03)" />
              ))}
            <XLabels labels={xTicks.map(formatX)} x={(i) => xAt(xTicks[i])} y={height - 10} width={iw} minGap={40} />

            {active && activeKey != null && (
              <g aria-hidden>
                <line
                  x1={xAt(coords[activeKey * 2])}
                  x2={xAt(coords[activeKey * 2])}
                  y1={yAt(coords[activeKey * 2 + 1])}
                  y2={height - PAD.b}
                  stroke="rgba(255,255,255,0.16)"
                  strokeDasharray="2 3"
                />
                <line
                  x1={padL}
                  x2={xAt(coords[activeKey * 2])}
                  y1={yAt(coords[activeKey * 2 + 1])}
                  y2={yAt(coords[activeKey * 2 + 1])}
                  stroke="rgba(255,255,255,0.16)"
                  strokeDasharray="2 3"
                />
              </g>
            )}

            {/* Later series underneath. Each pearl grows in, left to right. */}
            {[...all.keys()].reverse().map((k) => {
              const p = all[k];
              const ti = toneOf(p.si);
              const t = tone(ti);
              const xf = (p.x - xd.min) / (xd.max - xd.min || 1);
              const g = clamp(grow * 1.6 - xf * 0.6, 0, 1);
              const r = radius(p.z, p.si) * g + (activeKey === k ? 1.5 : 0);
              if (r <= 0.2) return null;
              const x = xAt(coords[k * 2]);
              const y = yAt(coords[k * 2 + 1]);
              const dim = activeKey != null && activeKey !== k;
              return (
                <g key={k} style={{ opacity: dim ? 0.5 : 1 }} className="transition-opacity duration-150">
                  <circle cx={x} cy={y} r={r + 2} fill="#0c0c0d" />
                  {ti % 2 === 1 ? (
                    <circle cx={x} cy={y} r={Math.max(0.5, r - 0.75)} fill="#0c0c0d" stroke={t.stroke} strokeWidth="1.5" />
                  ) : (
                    <circle cx={x} cy={y} r={r} fill={ti === 0 ? "#f5f5f5" : t.fill} />
                  )}
                </g>
              );
            })}

            <rect
              x={padL}
              y={0}
              width={iw}
              height={height}
              fill="transparent"
              onPointerMove={onPointer}
              onPointerDown={onPointer}
              onPointerLeave={() => setActiveKey(null)}
            />
          </svg>
        )}
        {tooltip && width > 0 && (
          <ChartTooltip
            open={active != null}
            x={active ? xAt(active.x) : 0}
            y={active ? yAt(active.y) - radius(active.z, active.si) - 2 : 0}
            bound={width}
            title={active ? active.label ?? series[active.si].label : ""}
            rows={
              active
                ? [
                    { label: xLabel, value: formatX(active.x), tone: toneOf(active.si), mark: "dot" as const },
                    { label: yLabel, value: formatY(active.y), tone: toneOf(active.si), mark: "dot" as const },
                    ...(zMax > 0 && active.z != null ? [{ label: zLabel, value: formatZ(active.z), tone: toneOf(active.si), mark: "dot" as const }] : []),
                  ]
                : []
            }
          />
        )}
      </ChartTray>
    </ChartCard>
  );
});

export default ScatterChart;
