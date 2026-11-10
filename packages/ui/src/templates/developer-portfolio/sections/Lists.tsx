"use client";

import { ArrowRight, ArrowUpRight, Award, BadgeCheck, Code2, GraduationCap, Trophy } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DASH, FG, FOCUS, IconBox, LINE, MUTED, SUBTLE, Section, externalProps, formatDay, formatMonthNum, formatPeriod } from "../parts";
import type { Education as EducationItem, Post, Recognition as RecognitionItem, RecognitionKind } from "../types";

// Achievements, Education and Writing.

const KIND_ICON: Record<RecognitionKind, React.ReactNode> = {
  Award: <Award />,
  Hackathon: <Trophy />,
  Certificate: <BadgeCheck />,
  "Open source": <Code2 />,
};

function Meta({ items }: { items: React.ReactNode[] }) {
  return (
    <p className={cn("mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px]", MUTED)}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-x-2">
          {i > 0 && <span aria-hidden="true" className={cn("h-3.5 border-l", LINE)} />}
          {item}
        </span>
      ))}
    </p>
  );
}

export function Recognition({ items }: { items: RecognitionItem[] }) {
  if (!items.length) return null;
  return (
    <Section id="achievements" title="Achievements" count={items.length} note="Hackathons, awards and certifications.">
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.title} className={cn("flex items-start gap-3 rounded-lg border p-3.5", DASH)}>
            <IconBox className="mt-0.5">{KIND_ICON[item.kind]}</IconBox>
            <div className="min-w-0 flex-1">
              <p className={cn("font-medium leading-snug tracking-tight", FG)}>
                {item.url ? (
                  <a href={item.url} className={cn("underline-offset-4 hover:underline", FOCUS)} {...externalProps(item.url)}>
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </p>
              <Meta items={[item.kind, item.issuer, item.date && <span key="d" className="pf-mono tabular-nums">{formatMonthNum(item.date)}</span>].filter(Boolean)} />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Education({ items }: { items: EducationItem[] }) {
  if (!items.length) return null;
  return (
    <Section id="education" title="Education">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.school}-${item.start}`} className="flex items-start gap-3">
            <IconBox className="mt-0.5">
              <GraduationCap />
            </IconBox>
            <div className="min-w-0 flex-1">
              <p className={cn("font-medium tracking-tight", FG)}>{item.school}</p>
              <Meta items={[item.degree, item.field, <span key="p" className="pf-mono tabular-nums">{formatPeriod(item.start, item.end)}</span>]} />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Writing({ posts, allUrl }: { posts: Post[]; allUrl?: string }) {
  if (!posts.length) return null;
  return (
    <Section
      id="writing"
      title="Writing"
      count={posts.length}
      note="Latest notes on building for the web."
      aside={
        allUrl ? (
          <a href={allUrl} className={cn("inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline", FG, FOCUS)}>
            Read all posts <ArrowRight className="size-3.5" aria-hidden="true" />
          </a>
        ) : undefined
      }
    >
      <ul className={cn("divide-y border-y", DASH, "divide-dashed divide-[var(--pf-dash)]")}>
        {posts.map((post) => (
          <li key={post.url + post.title}>
            <a href={post.url} className={cn("group -mx-2 block rounded-md px-2 py-4 transition-colors hover:bg-[var(--pf-panel)]", FOCUS)} {...externalProps(post.url)}>
              <p className={cn("pf-mono text-xs", SUBTLE)}>
                <time dateTime={post.date}>{formatDay(post.date)}</time> · {post.readMinutes} min read
              </p>
              <p className={cn("pf-display mt-1 flex items-center gap-1.5 text-lg font-bold leading-snug tracking-tight", FG)}>
                {post.title}
                <ArrowUpRight className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </p>
              {post.summary && <p className={cn("mt-1 text-sm leading-relaxed", MUTED)}>{post.summary}</p>}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
