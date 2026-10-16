"use client";

import { forwardRef, useId, type PointerEvent } from "react";
import { ChartCard, ChartTray, type ChartCardProps } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import { XLabels, YGrid, labelWidth } from "./axes";
import { useActiveIndex, useTween, useWidth } from "./hooks";
import { areaPath, compact, linear, linePath, niceDomain, num, smoothPath, tone, type Pt } from "./scale";

// Lines over time, lit from above. The first series is the popout line, the lightest thing in the
// plot; the others step down in luminance and dash. The area variant hangs a soft white wash under
// each line (lighting, not decoration). A crosshair with pearls follows the pointer or the arrow
// keys. On mount the lines rise from the baseline; on new data they glide.

export type Datum = Record<string, string | number | null | undefined>;

export interface ChartSeries {
  /** The field in each datum that holds this series' value. */
  key: string;
  label: string;
  /** Luminance step, 0 (popout) to 3. Defaults to the series' index, so colour follows the entity. */
  tone?: number;
}

export interface LineChartProps extends Omit<ChartCardProps, "legend" | "table" | "children"> {
  data: Datum[];
  series: ChartSeries[];
  /** The field holding each point's category or time label. */
  xKey: string;
  variant?: "line" | "area";
  curve?: "linear" | "smooth";
  /** Plot height in px. Default 180. */
  height?: number;
  grid?: boolean;
  legend?: boolean;
  tooltip?: boolean;
  /** A pearl on the last point of the first series. Default true. */
  endMarker?: boolean;
  yMin?: number;
  yMax?: number;
  formatValue?: (value: number) => string;
  formatX?: (x: string | number) => string;
  animateOnMount?: boolean;
}

const PAD = { r: 14, t: 16, b: 28 };

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(function LineChart(
  {
    data,
    series,
    xKey,
    variant = "line",
    curve = "smooth",
    height = 180,
    grid = true,
    legend = true,
    tooltip = true,
    endMarker = true,
    yMin,
    yMax,
    formatValue = compact,
    formatX = String,
    animateOnMount = true,
    ...card
  },
  ref
) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [plotRef, width] = useWidth<HTMLDivElement>();
  const n = data.length;
  const raw = series.flatMap((s) => data.map((d) => num(d[s.key])));
  const shown = useTween(raw, animateOnMount);
  const { active, setActive, focusProps } = useActiveIndex(n);

  const dataMin = raw.length ? Math.min(...raw) : 0;
  const dataMax = raw.length ? Math.max(...raw) : 1;
  const floor = yMin ?? (variant === "area" || (dataMin >= 0 && dataMin <= dataMax * 0.4) ? Math.min(0, dataMin) : dataMin);
  const { min, max, ticks } = niceDomain(floor, yMax ?? dataMax, height < 140 ? 3 : 4);

  const padL = labelWidth(ticks.map(formatValue));
  const iw = Math.max(1, width - padL - PAD.r);
  const xAt = (i: number) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const yAt = linear(min, max, height - PAD.b, PAD.t);
  const smooth = curve === "smooth";
  const points = (si: number): Pt[] => data.map((_, i) => [xAt(i), yAt(shown[si * n + i])]);

  const onPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - rect.left) / rect.width) * (n - 1));
    setActive(Math.min(Math.max(i, 0), n - 1));
  };

  const toneOf = (si: number) => series[si].tone ?? si;
  const labelId = `${uid}-label`;

  return (
    <ChartCard
      {...card}
      ref={ref}
      labelId={labelId}
      legend={legend && series.length > 1 ? series.map((s, si) => ({ label: s.label, tone: toneOf(si) })) : undefined}
      table={{
        columns: [xKey, ...series.map((s) => s.label)],
        rows: data.map((d) => [formatX(d[xKey] ?? ""), ...series.map((s) => formatValue(num(d[s.key])))]),
      }}
    >
      <ChartTray ref={plotRef} style={{ height }} role="img" aria-labelledby={card.label ? labelId : undefined} {...focusProps}>
        {width > 0 && (
          <svg width={width} height={height} className="absolute inset-0 block overflow-visible">
            <defs>
              {series.map((s, si) => (
                <linearGradient key={s.key} id={`${uid}-a${si}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={tone(toneOf(si)).area} />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>

            <YGrid ticks={ticks} y={yAt} x0={padL} x1={width - PAD.r} format={formatValue} grid={grid} />
            <XLabels labels={data.map((d) => formatX(d[xKey] ?? ""))} x={xAt} y={height - 10} width={iw} />

            {/* Later series underneath, so the popout line is always on top. */}
            {series
              .map((s, si) => ({ s, si }))
              .reverse()
              .map(({ s, si }) => {
                const t = tone(toneOf(si));
                const pts = points(si);
                return (
                  <g key={s.key}>
                    {variant === "area" && <path d={areaPath(pts, yAt(Math.max(min, Math.min(0, max))), smooth)} fill={`url(#${uid}-a${si})`} />}
                    <path
                      d={smooth ? smoothPath(pts) : linePath(pts)}
                      fill="none"
                      stroke={t.stroke}
                      strokeWidth={toneOf(si) === 0 ? 2 : 1.5}
                      strokeDasharray={t.dash}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}

            {endMarker && active == null && n > 0 && series.length > 0 && (
              <Pearl x={xAt(n - 1)} y={yAt(shown[n - 1])} tone={toneOf(0)} />
            )}

            {active != null && (
              <g>
                <line
                  x1={Math.round(xAt(active)) + 0.5}
                  x2={Math.round(xAt(active)) + 0.5}
                  y1={PAD.t - 6}
                  y2={height - PAD.b}
                  stroke="rgba(255,255,255,0.12)"
                />
                {series.map((s, si) => (
                  <Pearl key={s.key} x={xAt(active)} y={yAt(shown[si * n + active])} tone={toneOf(si)} />
                ))}
              </g>
            )}

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
            x={xAt(active ?? n - 1)}
            y={Math.min(...series.map((_, si) => yAt(num(data[active ?? n - 1]?.[series[si].key]))), height)}
            bound={width}
            title={formatX(data[active ?? n - 1]?.[xKey] ?? "")}
            rows={series.map((s, si) => ({
              label: s.label,
              value: formatValue(num(data[active ?? n - 1]?.[s.key])),
              tone: toneOf(si),
            }))}
          />
        )}
      </ChartTray>
    </ChartCard>
  );
});

/** A data point: a popout pearl seated in a ring of the tray's colour; hollow for later series. */
export function Pearl({ x, y, tone: i, r = 3.5 }: { x: number; y: number; tone: number; r?: number }) {
  const t = tone(i);
  return (
    <g aria-hidden>
      <circle cx={x} cy={y} r={r + 2.5} fill="#0c0c0d" />
      {i === 0 ? (
        <circle cx={x} cy={y} r={r} fill="#f5f5f5" />
      ) : (
        <circle cx={x} cy={y} r={r - 0.75} fill="#0c0c0d" stroke={t.stroke} strokeWidth="1.5" />
      )}
    </g>
  );
}

/** LineChart with the area variant. */
export const AreaChart = forwardRef<HTMLDivElement, Omit<LineChartProps, "variant">>(function AreaChart(props, ref) {
  return <LineChart {...props} ref={ref} variant="area" />;
});

export default LineChart;
