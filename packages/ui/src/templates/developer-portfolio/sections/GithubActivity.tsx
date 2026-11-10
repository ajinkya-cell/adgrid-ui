"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DASH, FOCUS, MUTED, SUBTLE, Section, SocialIcon } from "../parts";

// A flat contribution graph: grey squares that get lighter (dark theme) or darker (light theme)
// with activity. Pulls the last year from a public contributions API; if that fails it shows a
// sample year, labelled as such, so the section never sits empty.

interface Day {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_BG = ["bg-[var(--pf-l0)]", "bg-[var(--pf-l1)]", "bg-[var(--pf-l2)]", "bg-[var(--pf-l3)]", "bg-[var(--pf-l4)]"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sampleYear(): Day[] {
  const days: Day[] = [];
  const end = new Date();
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const r = rand();
    const count = r < (weekend ? 0.55 : 0.2) ? 0 : Math.floor(r * (weekend ? 5 : 14));
    const level = (count === 0 ? 0 : count < 4 ? 1 : count < 8 ? 2 : count < 12 ? 3 : 4) as Day["level"];
    days.push({ date: iso(d), count, level });
  }
  return days;
}

function useContributions(username: string) {
  const [state, setState] = useState<{ days: Day[]; sample: boolean } | null>(null);
  useEffect(() => {
    let alive = true;
    setState(null);
    fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((payload: { contributions?: Day[] }) => {
        if (!alive) return;
        const days = payload.contributions ?? [];
        setState(days.length ? { days, sample: false } : { days: sampleYear(), sample: true });
      })
      .catch(() => alive && setState({ days: sampleYear(), sample: true }));
    return () => {
      alive = false;
    };
  }, [username]);
  return state;
}

export function GithubActivity({ username }: { username: string }) {
  const data = useContributions(username);

  const { weeks, months, total } = useMemo(() => {
    const days = data?.days ?? [];
    if (!days.length) return { weeks: [] as (Day | null)[][], months: [] as { col: number; label: string }[], total: 0 };
    const [y, m, d] = days[0].date.split("-").map(Number);
    const pad = new Date(y, m - 1, d).getDay(); // weeks start on Sunday
    const cells: (Day | null)[] = [...Array(pad).fill(null), ...days];
    const weeks: (Day | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const months: { col: number; label: string }[] = [];
    weeks.forEach((week, col) => {
      const first = week.find(Boolean);
      if (!first) return;
      const month = Number(first.date.slice(5, 7)) - 1;
      if (!months.length || months[months.length - 1].label !== MONTHS[month]) {
        if (!months.length || col - months[months.length - 1].col >= 3) months.push({ col, label: MONTHS[month] });
      }
    });
    return { weeks, months, total: days.reduce((sum, day) => sum + day.count, 0) };
  }, [data]);

  if (!username) return null;
  return (
    <Section
      id="github"
      title="GitHub"
      note="What I've been committing lately."
      aside={
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className={cn("pf-mono flex items-center gap-1.5 rounded-md text-xs transition-colors hover:text-[var(--pf-fg)] [&_svg]:size-3.5", MUTED, FOCUS)}
        >
          <SocialIcon platform="github" />@{username}
          <ArrowUpRight aria-hidden="true" />
        </a>
      }
    >
      <div className={cn("rounded-lg border p-4", DASH)}>
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[640px]">
            <div className={cn("relative mb-1.5 h-4 text-xs", MUTED)} aria-hidden="true">
              {months.map((month) => (
                <span key={`${month.label}-${month.col}`} className="absolute" style={{ left: `${(month.col / Math.max(weeks.length, 1)) * 100}%` }}>
                  {month.label}
                </span>
              ))}
            </div>
            <div
              role="img"
              aria-label={data ? `${total} contributions in the last year` : "Loading contributions"}
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${Math.max(weeks.length, 53)}, minmax(0, 1fr))` }}
            >
              {(weeks.length ? weeks : Array.from({ length: 53 }, () => Array(7).fill(null))).map((week, col) => (
                <div key={col} className="grid grid-rows-7 gap-[3px]">
                  {Array.from({ length: 7 }, (_, row) => {
                    const day = week[row];
                    return (
                      <span
                        key={row}
                        title={day ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}` : undefined}
                        className={cn("aspect-square w-full rounded-[2px]", day ? LEVEL_BG[day.level] : weeks.length ? "bg-transparent" : "animate-pulse bg-[var(--pf-l0)]")}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={cn("mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px]", MUTED)}>
          <p>
            {data ? (
              <>
                This year, I achieved <span className="pf-mono font-semibold text-[var(--pf-fg)]">{total.toLocaleString()}</span> contributions
                {data.sample && <span className={SUBTLE}> (sample data)</span>}
              </>
            ) : (
              "Loading contributions…"
            )}
          </p>
          <p className="flex items-center gap-1 text-xs" aria-hidden="true">
            Less
            {LEVEL_BG.map((bg) => (
              <span key={bg} className={cn("size-2.5 rounded-[2px]", bg)} />
            ))}
            More
          </p>
        </div>
      </div>
    </Section>
  );
}
