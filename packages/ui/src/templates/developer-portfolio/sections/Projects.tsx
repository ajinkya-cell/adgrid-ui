"use client";

import { useId, useState } from "react";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Roughly } from "../../../animated/Roughly";
import { DASH, DOTS, FG, FOCUS, HAND, LINE, LinkButton, MUTED, SUBTLE, Section, SocialIcon, StatusPill, Tags, formatRange } from "../parts";
import type { Project } from "../types";

function Thumbnail({ project }: { project: Project }) {
  return (
    <div className={cn("aspect-[16/10] overflow-hidden rounded-lg border", LINE)}>
      {project.image ? (
        <img src={project.image} alt={`${project.name} screenshot`} className="size-full object-cover" loading="lazy" />
      ) : (
        <div className={cn("grid size-full place-items-center bg-[var(--pf-panel)]", DOTS)}>
          <span className={cn("pf-display text-2xl font-extrabold tracking-tight", SUBTLE)}>{project.name}</span>
        </div>
      )}
    </div>
  );
}

export function Projects({
  items,
  allUrl,
  note,
  initialCount = 4,
}: {
  items: Project[];
  allUrl?: string;
  /** Handwritten sticky note under the title column. */
  note?: string;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  if (!items.length) return null;
  const visible = expanded ? items : items.slice(0, initialCount);
  const hidden = items.length - initialCount;
  return (
    <Section
      id="projects"
      title="Projects"
      count={items.length}
      note="Things I've built, shipped and still maintain."
      aside={
        allUrl || note ? (
          // The sticky hangs below the link; its 150px note at 20px needs ~110px, reserved by pb.
          <div className={note ? "pb-[110px]" : undefined}>
            {note ? (
              <Roughly.Sticky note={note} placement="bottom" offset={14} pin="tape" width={150} font={HAND} fontSize={26} animationDelay={300}>
                {allUrl ? (
                  <a href={allUrl} className={cn("inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline", FG, FOCUS)}>
                    See all projects <ArrowRight className="size-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="block h-px w-px" />
                )}
              </Roughly.Sticky>
            ) : (
              allUrl && (
                <a href={allUrl} className={cn("inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline", FG, FOCUS)}>
                  See all projects <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              )
            )}
          </div>
        ) : undefined
      }
    >
      <ul id={listId} className="space-y-4">
        {visible.map((project) => (
          <li key={project.name} className={cn("grid gap-4 rounded-lg border p-3 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:p-4", DASH)}>
            <Thumbnail project={project} />
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className={cn("pf-display flex items-center gap-2 text-xl font-bold tracking-tight", FG)}>
                    {project.name}
                    {project.liveUrl && !project.end && <StatusPill tone="green">Live</StatusPill>}
                  </h3>
                  {project.start && <p className={cn("pf-mono text-xs", SUBTLE)}>{formatRange(project.start, project.end)}</p>}
                </div>
                <div className="flex gap-1.5">
                  {project.liveUrl && (
                    <LinkButton href={project.liveUrl} className="h-7 rounded px-2 text-xs" aria-label={`${project.name} live site`}>
                      <ExternalLink aria-hidden="true" />
                      Live
                    </LinkButton>
                  )}
                  {project.sourceUrl && (
                    <LinkButton href={project.sourceUrl} className="h-7 rounded px-2 text-xs" aria-label={`${project.name} on GitHub`}>
                      <SocialIcon platform="github" />
                      GitHub
                    </LinkButton>
                  )}
                </div>
              </div>
              <p className={cn("mt-2 text-sm leading-relaxed", MUTED)}>{project.description}</p>
              {project.tags.length > 0 && (
                <>
                  <p className={cn("mt-3 text-xs font-semibold", FG)}>Technologies used:</p>
                  <Tags items={project.tags} className="mt-1.5" />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((value) => !value)}
          className={cn("mx-auto mt-4 flex items-center gap-1.5 rounded-md text-[13px] underline-offset-4 hover:underline", MUTED, FOCUS)}
        >
          {expanded ? "Show less" : `Show ${hidden} more`}
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
        </button>
      )}
      {allUrl && (
        <div className="mt-5 flex justify-center md:hidden">
          <LinkButton href={allUrl} variant="solid">
            See all projects
            <ArrowRight aria-hidden="true" />
          </LinkButton>
        </div>
      )}
    </Section>
  );
}
