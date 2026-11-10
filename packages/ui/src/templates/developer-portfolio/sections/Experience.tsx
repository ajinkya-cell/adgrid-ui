"use client";

import { useId, useState } from "react";
import { Briefcase, ChevronDown, CodeXml, ExternalLink, Rocket, SquareTerminal } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DASH, FG, FOCUS, LINE, MUTED, SUBTLE, Section, StatusPill, Tags, externalProps, formatDuration, formatPeriod, formatRange } from "../parts";
import type { Experience as ExperienceItem, ExperienceIcon } from "../types";

const TILE_ICONS: Record<ExperienceIcon, typeof Rocket> = {
  terminal: SquareTerminal,
  rocket: Rocket,
  briefcase: Briefcase,
  code: CodeXml,
};

/**
 * One company on the timeline: a status dot on the dashed line, logo, name, the latest role and
 * its dates. Opening it shows every role with its type, period and duration, the tools used and
 * what was done.
 */
function Company({ item, defaultOpen }: { item: ExperienceItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const current = item.roles.some((role) => !role.end);
  const TileIcon = item.icon ? TILE_ICONS[item.icon] : null;
  const latest = item.roles[0];
  const earliest = item.roles[item.roles.length - 1];

  return (
    <li className="relative pl-8">
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-[7px] top-[22px] size-[11px] rounded-full border-2 border-[var(--pf-bg)]",
          current ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]" : "bg-rose-500"
        )}
      />
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn("group flex w-full items-center gap-3 rounded-lg py-2.5 text-left", FOCUS)}
      >
        {item.logo ? (
          <img src={item.logo} alt="" className={cn("size-10 shrink-0 rounded-lg border object-cover", LINE)} />
        ) : TileIcon ? (
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--pf-fg)] text-[var(--pf-bg)]">
            <TileIcon className="size-5" strokeWidth={2.25} />
          </span>
        ) : (
          <span aria-hidden="true" className="pf-display grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--pf-fg)] text-lg font-extrabold text-[var(--pf-bg)]">
            {item.company[0]}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("font-semibold tracking-tight", FG)}>{item.company}</span>
            <StatusPill tone={current ? "green" : "red"}>{current ? "Active" : "Done"}</StatusPill>
          </span>
          <span className={cn("block truncate text-sm", MUTED)}>{latest.title}</span>
        </span>
        <span className={cn("hidden text-right text-xs sm:block", MUTED)}>
          {formatRange(earliest.start, latest.end)}
          <span className={cn("block", SUBTLE)}>
            {item.location} · {item.mode}
          </span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200", SUBTLE, open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div id={panelId} className={cn("mb-3 ml-[52px] space-y-5 border-t pt-4", DASH)}>
          {item.url && (
            <a href={item.url} className={cn("inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline", MUTED, FOCUS)} {...externalProps(item.url)}>
              {item.url.replace(/^https?:\/\//, "")}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
          {item.roles.map((role) => (
            <div key={`${role.title}-${role.start}`}>
              <p className={cn("font-medium tracking-tight", FG)}>{role.title}</p>
              <p className={cn("mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px]", MUTED)}>
                <span>{role.type}</span>
                <span aria-hidden="true" className={cn("h-3.5 border-l", LINE)} />
                <span className="pf-mono tabular-nums">{formatPeriod(role.start, role.end)}</span>
                <span aria-hidden="true" className={cn("h-3.5 border-l", LINE)} />
                <span>{formatDuration(role.start, role.end)}</span>
              </p>
              {role.tags.length > 0 && (
                <>
                  <p className={cn("mt-3 text-xs font-semibold", FG)}>Technologies &amp; Tools</p>
                  <Tags items={role.tags} className="mt-1.5" />
                </>
              )}
              {role.bullets.length > 0 && (
                <>
                  <p className={cn("mt-3 text-xs font-semibold", FG)}>What I&rsquo;ve done</p>
                  <ul className={cn("mt-1.5 space-y-1 text-sm leading-relaxed", MUTED)}>
                    {role.bullets.map((bullet) => (
                      <li key={bullet} className="relative pl-3.5 before:absolute before:left-0 before:top-0 before:content-['•']">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

export function Experience({ items, initialCount = 3 }: { items: ExperienceItem[]; initialCount?: number }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  if (!items.length) return null;
  const visible = expanded ? items : items.slice(0, initialCount);
  const hidden = items.length - initialCount;

  return (
    <Section id="experience" title="Experience" note="Where I've worked and what I shipped there.">
      <div className={cn("rounded-lg border px-3 py-2 sm:px-4", DASH)}>
        <ol
          id={listId}
          className="relative before:absolute before:bottom-6 before:left-3 before:top-6 before:border-l before:border-dashed before:border-[var(--pf-dash)]"
        >
          {visible.map((item, i) => (
            <Company key={item.company} item={item} defaultOpen={i === 0} />
          ))}
        </ol>
        {hidden > 0 && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((value) => !value)}
            className={cn("mb-1 ml-8 mt-1 rounded-md text-[13px] underline-offset-4 hover:underline", MUTED, FOCUS)}
          >
            {expanded ? "Show less" : `Show ${hidden} more`}
          </button>
        )}
      </div>
    </Section>
  );
}
