"use client";

import { forwardRef, useId, type PointerEvent } from "react";
import { ChartCard, ChartTray, type ChartCardProps } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { useActiveIndex, useTween, useWidth } from "./hooks";
import { Pearl, type ChartSeries, type Datum } from "./LineChart";
import { compact, linePath, niceDomain, num, polar, tone, type Pt } from "./scale";

// Several measures around a circle, one polygon per series. The web is cut faintly into the tray;
// the first series is a popout outline over a faint wash, later ones are dashed. Pointing at a
// spoke (or arrowing to it) brightens it, seats pearls on every series and opens the tooltip.

export interface RadarChartProps extends Omit<ChartCardProps, "legend" | "table" | "children"> {
  /** One datum per axis. */
  data: Datum[];
  series: ChartSeries[];
  /** The field holding each axis' name. */
  xKey: string;
  /** Top of the scale. Default: the data's maximum, rounded up. */
  max?: number;
  /** Rings in the web. Default 4. */
  levels?: number;
  /** Plot height in px. Default 248. */
  height?: number;
  legend?: boolean;
  tooltip?: boolean;
  formatValue?: (value: number) => string;
  animateOnMount?: boolean;
}

export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(function RadarChart(
  {
    data,
    series,
    xKey,
    max: maxProp,
    levels = 4,
    height = 248,
    legend = true,
    tooltip = true,
    formatValue = compact,
    animateOnMount = true,
    ...card
  },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const labelId = `${uid}-label`;
  const [plotRef, width] = useWidth<HTMLDivElement>();
  const n = data.length;
  const raw = series.flatMap((s) => data.map((d) => num(d[s.key])));
  const shown = useTween(raw, animateOnMount);
  const { active, setActive, focusProps } = useActiveIndex(n);
  const toneOf = (si: number) => series[si].tone ?? si;

  const top = maxProp ?? niceDomain(0, Math.max(1, ...raw), levels).max;
  const cx = width / 2;
  const cy = height / 2 + 2;
  const R = Math.max(10, Math.min(width / 2 - 64, height / 2 - 30));
  const step = 360 / Math.max(1, n);
  const at = (i: number, v: number): Pt => polar(cx, cy, (Math.max(0, v) / top) * R, i * step);
  const ring = (f: number) => `${linePath(data.map((_, i) => polar(cx, cy, R * f, i * step)))}Z`;

  const onPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - cx;
    const dy = e.clientY - rect.top - cy;
    if (Math.hypot(dx, dy) < 8) return;
    const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    setActive(Math.round(deg / step) % n);
  };

  const anchor = active ?? 0;
  const [tx, ty] = polar(cx, cy, R + 6, anchor * step);

  return (
    <ChartCard
      {...card}
      ref={ref}
      labelId={labelId}
      legend={legend && series.length > 1 ? series.map((s, si) => ({ label: s.label, tone: toneOf(si) })) : undefined}
      table={{
        columns: [xKey, ...series.map((s) => s.label)],
        rows: data.map((d) => [String(d[xKey] ?? ""), ...series.map((s) => formatValue(num(d[s.key])))]),
      }}
    >
      <ChartTray ref={plotRef} style={{ height }} role="img" aria-labelledby={card.label ? labelId : undefined} {...focusProps}>
        {width > 0 && n > 2 && (
          <svg width={width} height={height} className="absolute inset-0 block overflow-visible">
            <g aria-hidden>
              {Array.from({ length: levels }, (_, l) => (
                <path
                  key={l}
                  d={ring((l + 1) / levels)}
                  fill={l === levels - 1 ? "#070707" : "none"}
                  fillOpacity={l === levels - 1 ? 0.6 : undefined}
                  stroke={l === levels - 1 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)"}
                />
              ))}
              {data.map((d, i) => {
                const [x, y] = polar(cx, cy, R, i * step);
                const [lx, ly] = polar(cx, cy, R + 16, i * step);
                const s = Math.sin((i * step * Math.PI) / 180);
                const cosv = Math.cos((i * step * Math.PI) / 180);
                return (
                  <g key={i}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke={active === i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}
                      className="transition-[stroke] duration-150"
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={s > 0.3 ? "start" : s < -0.3 ? "end" : "middle"}
                      dominantBaseline={cosv > 0.5 ? "auto" : cosv < -0.5 ? "hanging" : "middle"}
                      fill={active === i ? "rgb(245 245 245)" : "rgb(115 115 115)"}
                      style={{ fontSize: 10.5 }}
                      className="transition-[fill] duration-150"
                    >
                      {String(d[xKey] ?? "")}
                    </text>
                  </g>
                );
              })}
            </g>

            {series
              .map((s, si) => ({ s, si }))
              .reverse()
              .map(({ s, si }) => {
                const t = tone(toneOf(si));
                const pts = data.map((_, i) => at(i, shown[si * n + i]));
                const lead = toneOf(si) === 0;
                return (
                  <g key={s.key}>
                    <path
                      d={`${linePath(pts)}Z`}
                      fill="#fff"
                      fillOpacity={lead ? 0.07 : t.area * 0.6}
                      stroke={t.stroke}
                      strokeWidth={lead ? 1.75 : 1.5}
                      strokeDasharray={t.dash}
                      strokeLinejoin="round"
                    />
                    {lead && active == null && pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.25" fill="#f5f5f5" />)}
                  </g>
                );
              })}

            {active != null &&
              series.map((s, si) => {
                const [x, y] = at(active, shown[si * n + active]);
                return <Pearl key={s.key} x={x} y={y} tone={toneOf(si)} />;
              })}

            <rect
              width={width}
              height={height}
              fill="transparent"
              onPointerMove={onPointer}
              onPointerDown={onPointer}
              onPointerLeave={() => setActive(null)}
            />
          </svg>
        )}
        {tooltip && width > 0 && n > 2 && (
          <ChartTooltip
            open={active != null}
            x={tx}
            y={Math.min(ty, cy) - 6}
            bound={width}
            title={String(data[anchor]?.[xKey] ?? "")}
            rows={series.map((s, si) => ({ label: s.label, value: formatValue(raw[si * n + anchor]), tone: toneOf(si) }))}
          />
        )}
      </ChartTray>
    </ChartCard>
  );
});

export default RadarChart;
