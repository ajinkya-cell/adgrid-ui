"use client";

import React, { forwardRef, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { CodeBlock } from "./CodeBlock";
import { countWords, land, usePacedWords } from "./StreamingText";

// A model's reply, rendered: headings, paragraphs, lists (nested), quotes, tables, rules, fenced
// code (as a CodeBlock) and the usual inline marks: **bold**, *italic*, ~~struck~~, `code`,
// [links](…) and bare URLs. A small built-in parser, no dependency, nothing raw goes into the DOM.
//
// It streams like StreamingText: words are let out on a steady beat and each one fades up out of a
// soft blur, so a reply builds as one smooth wave. Half-finished markup never flickers on screen:
// mid-stream, an unclosed ** or ` is closed for it, and a code fence that's still open renders as
// a code block that grows.
//
// Styling is the system's: inline code sits in a tiny socket, rules are machined cut lines, links
// are underlined in light rather than coloured.

export interface MarkdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The markdown so far (live) or the whole reply (reveal). */
  text: string;
  /** Live only: more text is still coming. */
  streaming?: boolean;
  /** Play `text` in word by word on its own. */
  reveal?: boolean;
  /** The beat words are let out on, in ms. Default 32. */
  wordInterval?: number;
  /** Land words with the blur as they arrive. Off: show text as it comes. Default true. */
  animate?: boolean;
}

// ─── Block parser ───────────────────────────────────────────────────────────

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang?: string; code: string }
  | { type: "quote"; blocks: Block[] }
  | { type: "list"; ordered: boolean; start: number; items: Block[][] }
  | { type: "table"; head: string[]; align: ("left" | "center" | "right" | undefined)[]; rows: string[][] }
  | { type: "rule" };

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/;
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^ {0,3}([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^ {0,3}>\s?/;
const ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());

function startsBlock(line: string, next?: string) {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    ITEM.test(line) ||
    (line.includes("|") && next !== undefined && TABLE_SEP.test(next))
  );
}

function parse(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith(fence[1])) body.push(lines[i++]);
      i++; // the closing fence (or the end, while it's still streaming)
      blocks.push({ type: "code", lang: fence[2] || undefined, code: body.join("\n") });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trim() && QUOTE.test(lines[i])) body.push(lines[i++].replace(QUOTE, ""));
      blocks.push({ type: "quote", blocks: parse(body.join("\n")) });
      continue;
    }

    const item = line.match(ITEM);
    if (item) {
      const indent = item[1].length;
      const ordered = /\d/.test(item[2]);
      const items: Block[][] = [];
      let current: string[] = [];
      while (i < lines.length) {
        const l = lines[i];
        const m = l.match(ITEM);
        if (m && m[1].length === indent && /\d/.test(m[2]) === ordered) {
          if (current.length) items.push(parse(current.join("\n")));
          current = [m[3]];
          i++;
        } else if (l.trim() && (l.match(/^\s*/)![0].length > indent || !startsBlock(l, lines[i + 1]))) {
          // Indented deeper (a nested list or continuation) or a lazy continuation line.
          current.push(l.slice(Math.min(indent + 2, l.match(/^\s*/)![0].length)));
          i++;
        } else if (!l.trim() && lines[i + 1] !== undefined && lines[i + 1].match(/^\s*/)![0].length > indent) {
          current.push("");
          i++;
        } else break;
      }
      if (current.length) items.push(parse(current.join("\n")));
      blocks.push({ type: "list", ordered, start: ordered ? parseInt(item[2], 10) : 1, items });
      continue;
    }

    if (line.includes("|") && lines[i + 1] !== undefined && TABLE_SEP.test(lines[i + 1])) {
      const head = cells(line);
      const align = cells(lines[i + 1]).map((c) =>
        c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : c.startsWith(":") ? "left" : undefined
      );
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(cells(lines[i++]));
      blocks.push({ type: "table", head, align, rows });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && (para.length === 0 || !startsBlock(lines[i], lines[i + 1]))) para.push(lines[i++]);
    blocks.push({ type: "paragraph", text: para.join("\n") });
  }
  return blocks;
}

/** Mid-stream, close marks that are still open so they style now instead of flashing as symbols. */
function closeOpenMarks(text: string) {
  let out = text;
  const fences = (out.match(/^ {0,3}(`{3,}|~{3,})/gm) ?? []).length;
  if (fences % 2 === 1) return out; // inside an open code fence: leave it alone
  const tail = out.slice(out.lastIndexOf("\n\n") + 1);
  if ((tail.match(/`/g) ?? []).length % 2 === 1) out += "`";
  if ((tail.replace(/`[^`]*`/g, "").match(/\*\*/g) ?? []).length % 2 === 1) out += "**";
  if ((tail.replace(/`[^`]*`/g, "").match(/~~/g) ?? []).length % 2 === 1) out += "~~";
  return out;
}

// ─── Rendering ──────────────────────────────────────────────────────────────

const INLINE = new RegExp(
  [
    "(`+)([^`]+?)\\1", // code
    "\\*\\*([^\\s*](?:[^*]*?[^\\s*])?)\\*\\*", // bold
    "__([^\\s_](?:[^_]*?[^\\s_])?)__",
    "~~([^\\s~](?:[^~]*?[^\\s~])?)~~", // struck
    "\\*([^\\s*](?:[^*]*?[^\\s*])?)\\*", // italic
    "(?<![\\w])_([^\\s_](?:[^_]*?[^\\s_])?)_(?![\\w])",
    "\\[([^\\]]+)\\]\\(([^)\\s]+)(?:\\s+\"[^\"]*\")?\\)", // link
    "(https?:\\/\\/[^\\s<>()]+[^\\s<>().,;:!?'\"])", // bare URL
  ].join("|"),
  "g"
);

const safeHref = (href: string) => (/^(https?:|mailto:|\/|#)/i.test(href) ? href : undefined);

interface Ctx {
  /** Next word index, in reading order. */
  n: number;
  /** Words below this render still (history at mount). */
  settled: number;
  /** Highest word index that has landed; a remounted word below it doesn't land again. */
  landed: React.MutableRefObject<number>;
  animate: boolean;
  reduce: boolean;
}

function words(text: string, ctx: Ctx): ReactNode[] {
  return text.split(/(\s+)/).map((part) => {
    if (!part || /^\s+$/.test(part)) return part;
    const index = ctx.n++;
    if (!ctx.animate || index < ctx.settled) return part;
    return (
      <span
        key={index}
        className="inline-block"
        ref={(el) => {
          if (!el || index <= ctx.landed.current) return;
          ctx.landed.current = index;
          land(el, ctx.reduce);
        }}
      >
        {part}
      </span>
    );
  });
}

function inline(text: string, ctx: Ctx): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  const lines = (s: string) =>
    s.split("\n").flatMap((line, i) => (i === 0 ? words(line, ctx) : [<br key={`br${k++}`} />, ...words(line, ctx)]));

  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(<React.Fragment key={k++}>{lines(text.slice(last, at))}</React.Fragment>);
    const [whole, , code, bold, bold2, struck, em, em2, label, href, url] = m;
    if (code !== undefined) {
      out.push(
        <code
          key={k++}
          className="rounded-md border border-white/[0.06] bg-[#070707] px-[0.4em] py-[0.15em] font-mono text-[0.86em] text-neutral-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.04)]"
        >
          {words(code, ctx)}
        </code>
      );
    } else if (bold ?? bold2) {
      out.push(
        <strong key={k++} className="font-semibold text-neutral-100">
          {inline(bold ?? bold2, ctx)}
        </strong>
      );
    } else if (struck) {
      out.push(
        <del key={k++} className="text-neutral-500">
          {inline(struck, ctx)}
        </del>
      );
    } else if (em ?? em2) {
      out.push(
        <em key={k++} className="italic">
          {inline(em ?? em2, ctx)}
        </em>
      );
    } else {
      const target = safeHref(href ?? url);
      const content = label !== undefined ? inline(label, ctx) : words(url, ctx);
      out.push(
        target ? (
          <a
            key={k++}
            href={target}
            target={target.startsWith("http") ? "_blank" : undefined}
            rel={target.startsWith("http") ? "noreferrer noopener" : undefined}
            className="text-neutral-100 underline decoration-white/30 underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:decoration-white/80"
          >
            {content}
          </a>
        ) : (
          <React.Fragment key={k++}>{words(whole, ctx)}</React.Fragment>
        )
      );
    }
    last = at + whole.length;
  }
  if (last < text.length) out.push(<React.Fragment key={k++}>{lines(text.slice(last))}</React.Fragment>);
  return out;
}

const HEADING_CLASS = [
  "",
  "text-[1.4em] font-semibold tracking-tight text-neutral-100",
  "text-[1.2em] font-semibold tracking-tight text-neutral-100",
  "text-[1.05em] font-semibold tracking-tight text-neutral-100",
  "font-semibold text-neutral-100",
  "font-semibold text-neutral-200",
  "font-semibold text-neutral-300",
];

function render(blocks: Block[], ctx: Ctx): ReactNode {
  return blocks.map((block, i) => {
    switch (block.type) {
      case "heading": {
        const Tag = `h${block.level}` as "h1";
        return (
          <Tag key={i} className={cn(HEADING_CLASS[block.level], i > 0 && "!mt-5")}>
            {inline(block.text, ctx)}
          </Tag>
        );
      }
      case "paragraph":
        return <p key={i}>{inline(block.text, ctx)}</p>;
      case "code":
        // Counts as words so the pacer lets the code out at the same beat, but shows as a block.
        ctx.n += block.code.match(/\S+/g)?.length ?? 0;
        return <CodeBlock key={i} code={block.code} language={block.lang} className="!my-4" />;
      case "quote":
        return (
          <blockquote key={i} className="border-l-2 border-white/[0.12] pl-4 text-neutral-400">
            {render(block.blocks, ctx)}
          </blockquote>
        );
      case "list": {
        const Tag = block.ordered ? "ol" : "ul";
        return (
          <Tag
            key={i}
            start={block.ordered && block.start !== 1 ? block.start : undefined}
            className={cn(
              "space-y-1.5 pl-[1.4em]",
              block.ordered ? "list-decimal marker:text-neutral-500 marker:tabular-nums" : "list-disc marker:text-neutral-600"
            )}
          >
            {block.items.map((item, j) => (
              <li key={j} className="space-y-1.5 pl-1">
                {render(item, ctx)}
              </li>
            ))}
          </Tag>
        );
      }
      case "table":
        return (
          <div
            key={i}
            className="!my-4 overflow-x-auto rounded-xl border border-white/[0.07] [scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]"
          >
            <table className="w-full border-collapse text-[0.93em]">
              <thead className="bg-[#0c0c0d]">
                <tr>
                  {block.head.map((cell, j) => (
                    <th
                      key={j}
                      style={{ textAlign: block.align[j] }}
                      className="border-b border-black/80 px-3.5 py-2 text-left font-medium whitespace-nowrap text-neutral-100 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
                    >
                      {inline(cell, ctx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-t border-white/[0.05] first:border-t-0">
                    {block.head.map((_, j) => (
                      <td key={j} style={{ textAlign: block.align[j] }} className="px-3.5 py-2 align-top">
                        {inline(row[j] ?? "", ctx)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "rule":
        return <hr key={i} className="!my-5 h-px border-0 bg-black/70 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />;
    }
  });
}

/** Cuts `text` after its first `count` words, keeping the whitespace that follows. */
function prefix(text: string, count: number) {
  if (count <= 0) return "";
  let seen = 0;
  for (const m of text.matchAll(/\S+/g)) {
    if (++seen === count) return text.slice(0, (m.index ?? 0) + m[0].length);
  }
  return text;
}

export const Markdown = forwardRef<HTMLDivElement, MarkdownProps>(function Markdown(
  { text, streaming = false, reveal = false, wordInterval = 32, animate = true, className, ...rest },
  ref
) {
  const total = countWords(text, false);
  const available = countWords(text, !reveal && streaming);
  const { visible, reduce } = usePacedWords(animate ? available : total, { reveal: animate && reveal, wordInterval, restartKey: text });

  const shown = animate ? prefix(text, visible) : text;
  const live = (streaming && !reveal) || visible < total;
  const blocks = parse(live ? closeOpenMarks(shown) : shown);

  // History present at mount renders still; reveal lands everything.
  const settled = useRef<number | null>(null);
  const landed = useRef(-1);
  const ctx: Ctx = { n: 0, settled: settled.current ?? (reveal ? 0 : Infinity), landed, animate, reduce };
  const tree = render(blocks, ctx);
  if (settled.current === null) {
    settled.current = reveal ? 0 : ctx.n;
    landed.current = settled.current - 1;
  }

  return (
    <div
      {...rest}
      ref={ref}
      data-state={live ? "streaming" : "done"}
      className={cn("break-words", className)}
    >
      {reveal && <div className="sr-only">{render(parse(text), { n: 0, settled: Infinity, landed, animate: false, reduce })}</div>}
      <div aria-hidden={reveal || undefined} className="space-y-3 [&>*:first-child]:!mt-0">
        {tree}
      </div>
    </div>
  );
});
