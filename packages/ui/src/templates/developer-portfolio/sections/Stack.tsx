"use client";

import { cn } from "../../../lib/utils";
import { FG, Section } from "../parts";
import { SkillLogo } from "../skillIcons";
import type { StackGroup } from "../types";

/** One endless row of skills. The list is drawn twice so the loop has no seam. */
function MarqueeRow({ items, reverse, duration }: { items: string[]; reverse?: boolean; duration: number }) {
  const chip = (item: string, key: string, hidden?: boolean) => (
    <li key={key} aria-hidden={hidden || undefined} className={cn("flex shrink-0 items-center gap-2 text-[15px] font-medium", FG)}>
      <SkillLogo name={item} />
      {item}
    </li>
  );
  return (
    <div className="pf-marquee-wrap overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <ul
        className="pf-marquee flex w-max gap-8 py-2"
        style={{ animationDirection: reverse ? "reverse" : "normal", ["--pf-marquee-duration" as string]: `${duration}s` }}
      >
        {items.map((item) => chip(item, item))}
        {items.map((item) => chip(item, `${item}-copy`, true))}
      </ul>
    </div>
  );
}

export function Stack({ groups }: { groups: StackGroup[] }) {
  const all = groups.flatMap((group) => group.items);
  if (!all.length) return null;
  const half = Math.ceil(all.length / 2);
  const rows = all.length > 8 ? [all.slice(0, half), all.slice(half)] : [all];

  return (
    <Section id="skills" title="Skills" note={groups.map((group) => group.label).join(" · ")}>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <MarqueeRow key={i} items={row} reverse={i % 2 === 1} duration={row.length * 3.5} />
        ))}
      </div>
    </Section>
  );
}
