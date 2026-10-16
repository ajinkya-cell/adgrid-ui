"use client";

import { useMemo, type ReactNode } from "react";
import {
  AreaChart,
  BarChart,
  ChartCard,
  DonutChart,
  LineChart,
  RadarChart,
  RadialBarChart,
  ScatterChart,
  Sparkline,
  type ChartSize,
} from "@adgrid-ui/ui";

// The /present showcase for the charts: a quiet product dashboard where every chart type appears
// once, with real-looking numbers. The tweaker can focus one type, and "shuffle" swaps in a second
// data set so the glide between values is visible.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

// A small seeded generator, so the second data set is the same on every toggle.
function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function build(seed: number) {
  const rand = rng(seed || 1);
  const vary = (v: number, spread = 0.18) => (seed ? Math.round(v * (1 - spread / 2 + rand() * spread) * 10) / 10 : v);

  const revenueThis = [42.1, 46.8, 44.9, 52.3, 57.6, 61.2, 58.7, 66.4, 71.9, 77.5, 83.2, 91.4].map((v) => vary(v));
  const revenueLast = [31.2, 33.8, 35.9, 37.4, 40.6, 42.9, 43.8, 46.5, 49.7, 52.1, 54.6, 58.3].map((v) => vary(v));
  const revenue = MONTHS.map((m, i) => ({ month: m, thisYear: revenueThis[i], lastYear: revenueLast[i] }));

  const signups = DAYS.map((d, i) => ({
    day: d,
    thisWeek: Math.round(vary([182, 214, 236, 198, 251, 143, 121][i], 0.4)),
    lastWeek: Math.round(vary([164, 190, 201, 212, 219, 131, 104][i], 0.4)),
  }));

  const plans = MONTHS.map((m, i) => ({
    month: m,
    team: Math.round(vary(92 + i * 9 + (i % 3) * 4, 0.3)),
    pro: Math.round(vary(310 + i * 24 + (i % 4) * 9, 0.3)),
    free: Math.round(vary(640 + i * 38 + (i % 2) * 22, 0.3)),
  }));

  const pages = [
    { page: "/pricing", views: 4210 },
    { page: "/docs/getting-started", views: 3480 },
    { page: "/blog/machined-ui", views: 2130 },
    { page: "/changelog", views: 1640 },
    { page: "/careers", views: 820 },
  ]
    .map((p) => ({ ...p, views: Math.round(vary(p.views, 0.5)) }))
    .sort((a, b) => b.views - a.views);

  const traffic = [
    { label: "Organic search", value: 4820 },
    { label: "Direct", value: 2950 },
    { label: "Referral", value: 1730 },
    { label: "Social", value: 980 },
    { label: "Email", value: 520 },
  ].map((t) => ({ ...t, value: Math.round(vary(t.value, 0.5)) }));

  const goals = [
    { label: "Revenue", value: 82 },
    { label: "Activation", value: 64 },
    { label: "Retention", value: 91 },
    { label: "NPS", value: 47 },
  ].map((g) => ({ ...g, value: Math.min(100, Math.round(vary(g.value, 0.5))) }));

  const latency = HOURS.map((h, i) => ({
    hour: h,
    p50: Math.round(vary([118, 112, 109, 121, 138, 152, 149, 144, 141, 137, 128, 124][i], 0.25)),
    p95: Math.round(vary([212, 204, 198, 226, 268, 301, 288, 276, 270, 259, 241, 233][i], 0.25)),
  }));

  const plansRadar = ["Speed", "Storage", "Security", "Support", "Integrations", "Price"].map((axis, i) => ({
    axis,
    team: Math.round(vary([88, 72, 94, 81, 76, 58][i], 0.3)),
    pro: Math.round(vary([74, 55, 70, 62, 68, 84][i], 0.3)),
  }));

  const deals = rng(seed + 11);
  const points = (count: number, xBase: number, yBase: number) =>
    Array.from({ length: count }, (_, i) => {
      const x = Math.round(xBase + deals() * 50);
      return { x, y: Math.round(yBase + x * (0.6 + deals() * 0.9) + deals() * 18), z: Math.round(5 + deals() * 60), label: `Deal ${i + 1}` };
    });

  const kpi = {
    users: [9.8, 10.1, 10.4, 10.2, 10.9, 11.3, 11.1, 11.8, 12.2, 12.0, 12.5, 12.84].map((v) => vary(v, 0.08)),
    churn: [2.4, 2.3, 2.35, 2.2, 2.1, 2.15, 2.0, 1.95, 2.0, 1.9, 1.85, 1.8].map((v) => vary(v, 0.1)),
    requests: [1.4, 1.6, 1.5, 1.8, 1.7, 1.9, 2.1, 1.9, 2.0, 2.2, 2.1, 2.4].map((v) => vary(v, 0.2)),
  };

  return {
    revenue,
    signups,
    plans,
    pages,
    traffic,
    goals,
    latency,
    plansRadar,
    inbound: points(12, 6, 18),
    outbound: points(10, 20, 8),
    kpi,
  };
}

const pctDelta = (series: number[]) => {
  const a = series[series.length - 2];
  const b = series[series.length - 1];
  return a ? ((b - a) / a) * 100 : 0;
};

type ChartType = "all" | "line" | "area" | "bar" | "stacked" | "horizontal" | "donut" | "radar" | "scatter" | "radial" | "sparkline";

export function ChartsDemo(props: Record<string, unknown>) {
  const type = (props.type as ChartType) ?? "all";
  const curve = (props.curve as "smooth" | "linear") ?? "smooth";
  const grid = (props.grid as boolean) ?? true;
  const legend = (props.legend as boolean) ?? true;
  const shuffle = (props.shuffle as boolean) ?? false;
  const deltas = (props.deltas as boolean) ?? false;
  const focusSize = ((props.size as ChartSize) ?? "lg") as ChartSize;
  const d = useMemo(() => build(shuffle ? 7 : 0), [shuffle]);

  const all = type === "all";
  const size: ChartSize = all ? "fluid" : focusSize;
  const shared = { grid, legend, size };
  const revenueNow = d.revenue[d.revenue.length - 1].thisYear;
  const latencyNow = d.latency[d.latency.length - 1].p50;

  const charts: Record<Exclude<ChartType, "all">, ReactNode> = {
    area: (
      <AreaChart
        {...shared}
        label="Revenue"
        description="Monthly recurring, thousands of dollars"
        value={`$${revenueNow.toFixed(1)}k`}
        valueCaption="December"
        delta={deltas ? pctDelta(d.revenue.map((r) => r.thisYear)) : undefined}
        data={d.revenue}
        xKey="month"
        series={[
          { key: "thisYear", label: "This year" },
          { key: "lastYear", label: "Last year" },
        ]}
        curve={curve}
        height={all ? 244 : 220}
        formatValue={(v) => `$${Math.round(v)}k`}
      />
    ),
    donut: (
      <DonutChart
        size={size}
        legend={legend}
        label="Traffic sources"
        description="Sessions, last 30 days"
        data={d.traffic}
        diameter={152}
        thickness={18}
        centerLabel="sessions"
      />
    ),
    bar: (
      <BarChart
        {...shared}
        label="Signups"
        description="This week against last"
        data={d.signups}
        xKey="day"
        series={[
          { key: "thisWeek", label: "This week" },
          { key: "lastWeek", label: "Last week" },
        ]}
        height={176}
      />
    ),
    radial: (
      <RadialBarChart
        size={size}
        label="Quarterly goals"
        description="Progress to target"
        data={d.goals}
        diameter={196}
        centerValue={`${Math.round(d.goals.reduce((a, g) => a + g.value, 0) / d.goals.length)}%`}
        centerLabel="average"
      />
    ),
    radar: (
      <RadarChart
        size={size}
        legend={legend}
        label="Plan comparison"
        description="Scored out of 100"
        data={d.plansRadar}
        xKey="axis"
        series={[
          { key: "team", label: "Team" },
          { key: "pro", label: "Pro" },
        ]}
        max={100}
        height={228}
      />
    ),
    line: (
      <LineChart
        {...shared}
        label="API latency"
        description="Milliseconds, last 24 hours"
        value={`${latencyNow} ms`}
        valueCaption="p50 now"
        delta={deltas ? pctDelta(d.latency.map((l) => l.p50)) : undefined}
        higherIsBetter={false}
        data={d.latency}
        xKey="hour"
        series={[
          { key: "p50", label: "p50" },
          { key: "p95", label: "p95" },
        ]}
        curve={curve}
        height={150}
      />
    ),
    scatter: (
      <ScatterChart
        {...shared}
        label="Deals closed"
        description="Size against time to close"
        series={[
          { key: "inbound", label: "Inbound", points: d.inbound },
          { key: "outbound", label: "Outbound", points: d.outbound },
        ]}
        xLabel="Days to close"
        yLabel="Deal size"
        zLabel="Seats"
        formatY={(v) => `$${v}k`}
        height={196}
      />
    ),
    horizontal: (
      <BarChart
        {...shared}
        label="Top pages"
        description="Views, last 7 days"
        orientation="horizontal"
        data={d.pages}
        xKey="page"
        series={[{ key: "views", label: "Views" }]}
        formatValue={(v) => Math.round(v).toLocaleString("en-US")}
      />
    ),
    stacked: (
      <BarChart
        {...shared}
        label="Accounts by plan"
        description="Active accounts at month end"
        stacked
        data={d.plans}
        xKey="month"
        series={[
          { key: "team", label: "Team" },
          { key: "pro", label: "Pro" },
          { key: "free", label: "Free" },
        ]}
        height={200}
      />
    ),
    sparkline: <KpiTiles d={d} size={size} deltas={deltas} />,
  };

  if (!all) {
    return <div className="flex w-full justify-center p-6">{charts[type] ?? charts.area}</div>;
  }

  return (
    <div className="@container w-full max-w-[1120px] p-2 sm:p-6">
      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-6 [&>div>*]:h-full">
        <KpiTiles d={d} size="fluid" deltas={deltas} />
        <div className="@3xl:col-span-4">{charts.area}</div>
        <div className="@3xl:col-span-2">{charts.donut}</div>
        <div className="@3xl:col-span-2">{charts.bar}</div>
        <div className="@3xl:col-span-2">{charts.radial}</div>
        <div className="@3xl:col-span-2">{charts.radar}</div>
        <div className="@3xl:col-span-2">{charts.line}</div>
        <div className="@3xl:col-span-2">{charts.scatter}</div>
        <div className="@3xl:col-span-2">{charts.horizontal}</div>
        <div className="@3xl:col-span-6">{charts.stacked}</div>
      </div>
    </div>
  );
}

function KpiTiles({ d, size, deltas }: { d: ReturnType<typeof build>; size: ChartSize; deltas: boolean }) {
  const { users, churn, requests } = d.kpi;
  const tiles = (
    <>
      <ChartCard
        size={size}
        label="Active users"
        description="Monthly"
        value={Math.round(users[users.length - 1] * 1000).toLocaleString("en-US")}
        delta={deltas ? pctDelta(users) : undefined}
      >
        <Sparkline className="mt-4" data={users} variant="area" label="Active users over 12 months" />
      </ChartCard>
      <ChartCard
        size={size}
        label="Churn"
        description="Accounts lost per month"
        value={`${churn[churn.length - 1].toFixed(1)}%`}
        delta={deltas ? churn[churn.length - 1] - churn[churn.length - 2] : undefined}
        formatDelta={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(2)} pts`}
        higherIsBetter={false}
      >
        <Sparkline className="mt-4" data={churn} label="Churn over 12 months" />
      </ChartCard>
      <ChartCard
        size={size}
        label="Requests"
        description="API calls per day"
        value={`${requests[requests.length - 1].toFixed(1)}M`}
        delta={deltas ? pctDelta(requests) : undefined}
      >
        <Sparkline className="mt-4" data={requests} variant="bar" label="API requests over 12 days" />
      </ChartCard>
    </>
  );
  if (size === "fluid") {
    return <div className="grid grid-cols-1 gap-4 @xl:grid-cols-3 @3xl:col-span-6">{tiles}</div>;
  }
  return <div className="flex flex-wrap justify-center gap-4">{tiles}</div>;
}

export default ChartsDemo;
