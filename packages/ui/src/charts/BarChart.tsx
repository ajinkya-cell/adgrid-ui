"use client";

import { forwardRef, useId, type PointerEvent } from "react";
import { cn } from "../lib/utils";
import { ChartCard, ChartTray, PopoutGradient, Swatch, type ChartCardProps } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { XLabels, YGrid, labelWidth } from "./axes";
import { useActiveIndex, useTween, useWidth } from "./hooks";
import type { ChartSeries, Datum } from "./LineChart";
import { barPath, compact, linear, niceDomain, num, tone } from "./scale";

// Bars as machined parts. Each bar sits in a slot cut into the tray, and the value rises out of it
// as a popout part with a rounded data end; zero stays a firm cut line, and negatives hang below
// it. Grouped bars stand side by side; stacked segments are split by 2px cuts. Horizontal bars
// become a ranked list: label and value on one line, a recessed track with its fill underneath.
// Hovering a category dims the rest.

export interface BarChartProps extends Omit<ChartCardProps, "legend" | "table" | "children"> {
  data: Datum[];
  series: ChartSeries[];
  xKey: string;
  orientation?: "vertical" | "horizontal";
  stacked?: boolean;
  /** Show the recessed slot behind each bar. Default true. */
  slots?: boolean;
  /** Plot height in px for vertical bars. Default 180. */
  height?: number;
  grid?: boolean;
  legend?: boolean;
  tooltip?: boolean;
  formatValue?: (value: number) => string;
  formatX?: (x: string | number) => string;
  animateOnMount?: boolean;
}

const PAD = { r: 10, t: 14, b: 28 };
const GAP = 2;
const RADIUS = 4;
const POPOUT_CSS = "linear-gradient(180deg,#f5f5f5 0%,#d9d9d9 100%)";

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    data,
    series,
    xKey,
    orientation = "vertical",
    stacked = false,
    slots = true,
    height = 180,
    grid = true,
    legend = true,
    tooltip = true,
    formatValue = compact,
    formatX = String,
    animateOnMount = true,
    ...card
  },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const labelId = `${uid}-label`;
  const [plotRef, width] = useWidth<HTMLDivElement>();
  const n = data.length;
  const m = series.length;
  const raw = series.flatMap((s) => data.map((d) => num(d[s.key])));
  const shown = useTween(raw, animateOnMount);
  const { active, setActive, focusProps } = useActiveIndex(n);
  const toneOf = (si: number) => series[si].tone ?? si;
  const val = (si: number, i: number) => shown[si * n + i];
  const target = (si: number, i: number) => raw[si * n + i];

  const sums = data.map((_, i) => series.reduce((acc, __, si) => acc + Math.max(0, target(si, i)), 0));
  const negs = data.map((_, i) => series.reduce((acc, __, si) => acc + Math.min(0, target(si, i)), 0));
  const hi = stacked ? Math.max(0, ...sums) : Math.max(0, ...raw);
  const lo = stacked ? Math.min(0, ...negs) : Math.min(0, ...raw);

  const shared = {
    ...card,
    ref,
    labelId,
    legend: legend && m > 1 ? series.map((s, si) => ({ label: s.label, tone: toneOf(si), mark: "bar" as const })) : undefined,
    table: {
      columns: [xKey, ...series.map((s) => s.label)],
      rows: data.map((d) => [formatX(d[xKey] ?? ""), ...series.map((s) => formatValue(num(d[s.key])))]),
    },
  };

  if (orientation === "horizontal") {
    const top = hi || 1;
    return (
      <ChartCard {...shared}>
        <ChartTray
          className="px-4 py-3.5"
          role="list"
          aria-labelledby={card.label ? labelId : undefined}
          {...focusProps}
          onPointerLeave={() => setActive(null)}
        >
          <div className="flex flex-col gap-3">
            {data.map((d, i) => (
              <div
                key={i}
                role="listitem"
                onPointerEnter={() => setActive(i)}
                className={cn(
                  "transition-opacity duration-150",
                  active != null && active !== i && "opacity-45"
                )}
              >
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className={cn("truncate transition-colors duration-150", active === i ? "text-neutral-100" : "text-neutral-400")}>
                    {formatX(d[xKey] ?? "")}
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5 font-medium tabular-nums text-neutral-100">
                    {stacked ? (
                      formatValue(sums[i])
                    ) : (
                      series.map((s, si) => (
                        <span key={s.key} className="flex items-center gap-1.5">
                          {m > 1 && <Swatch tone={toneOf(si)} mark="bar" />}
                          <span className={si > 0 ? "text-neutral-400" : undefined}>{formatValue(target(si, i))}</span>
                        </span>
                      ))
                    )}
                  </span>
                </div>
                {(stacked ? [0] : series.map((_, si) => si)).map((si) => (
                  <div
                    key={si}
                    className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#070707] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    {stacked ? (
                      (() => {
                        let acc = 0;
                        const last = series.reduce((l, _, k) => (val(k, i) > 0 ? k : l), -1);
                        return series.map((s, k) => {
                          const v = Math.max(0, val(k, i));
                          const left = (acc / top) * 100;
                          acc += v;
                          const cut = k > 0 ? GAP : 0;
                          return (
                            <span
                              key={s.key}
                              className={cn("absolute inset-y-0", k === last && "rounded-r-full")}
                              style={{
                                left: `calc(${left}% + ${cut}px)`,
                                width: `max(0px, calc(${(v / top) * 100}% - ${cut}px))`,
                                background: toneOf(k) === 0 ? POPOUT_CSS : tone(toneOf(k)).fill,
                              }}
                            />
                          );
                        });
                      })()
                    ) : (
                      <span
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${(Math.max(0, val(si, i)) / top) * 100}%`,
                          background: toneOf(si) === 0 ? POPOUT_CSS : tone(toneOf(si)).fill,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ChartTray>
      </ChartCard>
    );
  }

  const { min, max, ticks } = niceDomain(lo, hi, height < 140 ? 3 : 4);
  const padL = labelWidth(ticks.map(formatValue));
  const iw = Math.max(1, width - padL - PAD.r);
  const bw = iw / Math.max(1, n);
  const yAt = linear(min, max, height - PAD.b, PAD.t);
  const y0 = yAt(0);
  const gap = 3;
  const barW = stacked
    ? Math.min(Math.max(bw * 0.5, 6), 28)
    : Math.min(Math.max((bw * 0.64 - (m - 1) * gap) / Math.max(1, m), 3), 16);
  const groupW = stacked ? barW : m * barW + (m - 1) * gap;
  const center = (i: number) => padL + bw * i + bw / 2;
  const barX = (i: number, si: number) => center(i) - groupW / 2 + (stacked ? 0 : si * (barW + gap));
  const fill = (si: number) => (toneOf(si) === 0 ? `url(#${uid}-pop)` : tone(toneOf(si)).fill);
  const slotPath = (x: number) => barPath(x, PAD.t, barW, height - PAD.b - PAD.t, Math.min(RADIUS, barW / 2) + 1, "none");

  const onPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActive(Math.min(Math.max(Math.floor(((e.clientX - rect.left) / rect.width) * n), 0), n - 1));
  };

  const bars = (i: number) => {
    if (!stacked) {
      return series.map((s, si) => {
        const v = val(si, i);
        const y1 = yAt(v);
        const x = barX(i, si);
        return (
          <path
            key={s.key}
            d={v >= 0 ? barPath(x, y1, barW, y0 - y1, RADIUS, "top") : barPath(x, y0, barW, y1 - y0, RADIUS, "bottom")}
            fill={fill(si)}
          />
        );
      });
    }
    let pos = 0;
    let neg = 0;
    const topPos = series.reduce((l, _, k) => (val(k, i) > 0 ? k : l), -1);
    const topNeg = series.reduce((l, _, k) => (val(k, i) < 0 ? k : l), -1);
    return series.map((s, si) => {
      const v = val(si, i);
      const x = barX(i, si);
      if (v >= 0) {
        const yb = yAt(pos) - (pos > 0 ? GAP : 0);
        pos += v;
        const yt = yAt(pos);
        return <path key={s.key} d={barPath(x, yt, barW, yb - yt, RADIUS, si === topPos ? "top" : "none")} fill={fill(si)} />;
      }
      const yt = yAt(neg) + (neg < 0 ? GAP : 0);
      neg += v;
      const yb = yAt(neg);
      return <path key={s.key} d={barPath(x, yt, barW, yb - yt, RADIUS, si === topNeg ? "bottom" : "none")} fill={fill(si)} />;
    });
  };

  const anchor = active ?? 0;
  const anchorTop = stacked ? sums[anchor] : Math.max(0, ...series.map((_, si) => target(si, anchor)));

  return (
    <ChartCard {...shared}>
      <ChartTray ref={plotRef} style={{ height }} role="img" aria-labelledby={card.label ? labelId : undefined} {...focusProps}>
        {width > 0 && (
          <svg width={width} height={height} className="absolute inset-0 block overflow-visible">
            <defs>
              <PopoutGradient id={`${uid}-pop`} />
            </defs>
            <YGrid ticks={ticks} y={yAt} x0={padL} x1={width - PAD.r} format={formatValue} grid={grid} />
            <XLabels labels={data.map((d) => formatX(d[xKey] ?? ""))} x={center} y={height - 10} width={iw} minGap={40} edgeAlign={false} />

            {active != null && (
              <rect x={padL + bw * active + 2} y={PAD.t - 8} width={bw - 4} height={height - PAD.b - PAD.t + 12} rx="8" fill="rgba(255,255,255,0.025)" />
            )}

            {data.map((_, i) => (
              <g
                key={i}
                className="transition-opacity duration-150"
                style={{ opacity: active != null && active !== i ? 0.4 : 1 }}
              >
                {slots && (stacked ? [0] : series.map((_, si) => si)).map((si) => <path key={si} d={slotPath(barX(i, si))} fill="#070707" />)}
                {bars(i)}
              </g>
            ))}

            <line x1={padL} x2={width - PAD.r} y1={Math.round(y0) + 0.5} y2={Math.round(y0) + 0.5} stroke="rgba(255,255,255,0.1)" />

            <rect
              x={padL}
              y={0}
              width={iw}
              height={height}
              fill="transparent"
              onPointerMove={onPointer}
              onPointerDown={onPointer}
              onPointerLeave={() => setActive(null)}
            />
          </svg>
        )}
        {tooltip && width > 0 && (
          <ChartTooltip
            open={active != null}
            x={center(anchor)}
            y={yAt(anchorTop) - 4}
            bound={width}
            title={formatX(data[anchor]?.[xKey] ?? "")}
            rows={series.map((s, si) => ({ label: s.label, value: formatValue(target(si, anchor)), tone: toneOf(si), mark: "bar" as const }))}
          />
        )}
      </ChartTray>
    </ChartCard>
  );
});

export default BarChart;
