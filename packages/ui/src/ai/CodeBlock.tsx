"use client";

import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

// Code, set in a well cut into the page. A tray along the top carries the language (or a filename)
// and a copy key; the code sits below in a monospace column that scrolls sideways rather than
// wrapping, so lines keep their shape.
//
// Highlighting is monochrome, like the rest of the system: light and weight instead of hue.
// Keywords are the brightest thing in the block, calls a step down, plain code in the middle,
// strings quieter, comments quietest and italic. It's a small built-in tokenizer that knows the
// common shapes of C-like languages, Python and shell, with no dependency and nothing to load.
// Turn it off with `highlight={false}`, or pass already-highlighted nodes as `children`.
//
// Safe to stream into: the block just grows as `code` does.

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onCopy"> {
  code: string;
  /** Shown in the tray and used to pick comment style. */
  language?: string;
  /** Shown in the tray instead of the language. */
  filename?: string;
  /** Number each line. Default false. */
  showLineNumbers?: boolean;
  /** Built-in monochrome highlighting. Default true. */
  highlight?: boolean;
  /** Show the copy key. Default true. */
  copyable?: boolean;
  /** Called after the code is copied. */
  onCopy?: (code: string) => void;
  /** Scroll vertically past this height, in px. */
  maxHeight?: number;
  /** Your own rendering of the code (e.g. from Shiki), in place of the built-in one. */
  children?: ReactNode;
}

type Kind = "plain" | "keyword" | "call" | "string" | "number" | "comment" | "punct";

const KIND_CLASS: Record<Kind, string> = {
  plain: "text-[#bcbcbc]",
  keyword: "text-[#fafafa]",
  call: "text-[#e2e2e2]",
  string: "text-[#8e8e8e]",
  number: "text-[#d6d6d6]",
  comment: "text-[#5c5c5c] italic",
  punct: "text-[#767676]",
};

const KEYWORDS = new Set(
  (
    "abstract as async await break case catch class const continue debugger def default del delete do elif else enum export " +
    "extends false finally fn for from func function global go if impl import in instanceof interface is lambda let match " +
    "mod module mut new nil none not null of or and package pass private protected pub public raise readonly return self " +
    "static struct super switch then this throw true try type typeof undefined use var void when where while with yield " +
    "True False None echo fi done esac export local"
  ).split(" ")
);

const HASH_COMMENT = new Set(["python", "py", "bash", "sh", "shell", "zsh", "yaml", "yml", "ruby", "rb", "toml", "r", "perl", "dockerfile", "makefile"]);

/** Splits code into runs of one kind. Whole-code, so block comments and strings may span lines. */
function tokenize(code: string, language?: string): { kind: Kind; text: string }[] {
  const hash = language ? HASH_COMMENT.has(language.toLowerCase()) : false;
  const comment = hash ? String.raw`#[^\n]*` : String.raw`\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)`;
  const pattern = new RegExp(
    [
      `(${comment})`,
      String.raw`("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|` + "`(?:\\\\.|[^`\\\\])*`?)",
      String.raw`(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b|\b0x[\da-f]+\b)`,
      String.raw`([A-Za-z_$][\w$]*)(?=\s*\()`,
      String.raw`([A-Za-z_$][\w$]*)`,
      String.raw`([{}()[\];,.:<>=+\-*/%!&|^~?@]+)`,
    ].join("|"),
    "gi"
  );
  const out: { kind: Kind; text: string }[] = [];
  let last = 0;
  for (const m of code.matchAll(pattern)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "plain", text: code.slice(last, at) });
    const [text, c, s, n, call, word] = m;
    const kind: Kind = c ? "comment" : s ? "string" : n ? "number" : call ? (KEYWORDS.has(call) ? "keyword" : "call") : word ? (KEYWORDS.has(word) ? "keyword" : "plain") : "punct";
    out.push({ kind, text });
    last = at + text.length;
  }
  if (last < code.length) out.push({ kind: "plain", text: code.slice(last) });
  return out;
}

/** Tokens split into lines, each line a list of runs. */
function toLines(code: string, language: string | undefined, highlight: boolean) {
  const runs = highlight ? tokenize(code, language) : [{ kind: "plain" as Kind, text: code }];
  const lines: { kind: Kind; text: string }[][] = [[]];
  for (const run of runs) {
    run.text.split("\n").forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ kind: run.kind, text: part });
    });
  }
  return lines;
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and insecure origins: fall back to a hidden textarea.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language,
    filename,
    showLineNumbers = false,
    highlight = true,
    copyable = true,
    onCopy,
    maxHeight,
    children,
    className,
    ...rest
  },
  ref
) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    if (!(await writeClipboard(code))) return;
    setCopied(true);
    onCopy?.(code);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  // Trailing newline from a fence shouldn't leave an empty numbered line.
  const lines = children ? null : toLines(code.replace(/\n$/, ""), language, highlight);
  const label = filename ?? language;

  return (
    <div
      {...rest}
      ref={ref}
      data-language={language}
      className={cn(
        "not-prose overflow-hidden rounded-2xl border border-white/[0.07] bg-[#070707]",
        "shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]",
        className
      )}
    >
      {(label || copyable) && (
        <div className="flex h-9 items-center justify-between gap-3 border-b border-black/80 bg-[#0c0c0d] pr-1.5 pl-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
          <span className="truncate font-mono text-xs text-neutral-500">{label}</span>
          {copyable && (
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? "Copied" : "Copy code"}
              className={cn(
                "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-transparent px-2 text-xs font-medium tracking-tight text-neutral-400",
                "transition-colors duration-150 hover:border-white/[0.06] hover:bg-[#151516] hover:text-neutral-100",
                "outline-white/40 outline-offset-2 focus-visible:outline focus-visible:outline-1"
              )}
            >
              <span className="relative grid size-3.5 place-items-center" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("absolute size-3.5 transition-[opacity,scale] duration-200", copied ? "scale-50 opacity-0" : "opacity-100")}
                >
                  <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                  <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("absolute size-3.5 transition-[opacity,scale] duration-200", copied ? "opacity-100" : "scale-50 opacity-0")}
                >
                  <path d="M5 12l5 5l10 -10" />
                </svg>
              </span>
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
          <span className="sr-only" aria-live="polite">
            {copied ? "Copied to clipboard" : ""}
          </span>
        </div>
      )}

      <pre
        className={cn(
          "overflow-auto py-3 font-mono text-[13px] leading-[1.65]",
          "[scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]"
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <code className="block w-max min-w-full">
          {children ??
            lines!.map((runs, i) => (
              <span key={i} className="flex pr-4">
                {showLineNumbers ? (
                  <span aria-hidden="true" className="w-12 shrink-0 pr-4 text-right text-neutral-700 tabular-nums select-none">
                    {i + 1}
                  </span>
                ) : (
                  <span className="w-4 shrink-0" />
                )}
                <span className="whitespace-pre">
                  {runs.length === 0
                    ? "\n"
                    : runs.map((run, j) => (
                        <span key={j} className={KIND_CLASS[run.kind]}>
                          {run.text}
                        </span>
                      ))}
                  {runs.length > 0 && "\n"}
                </span>
              </span>
            ))}
        </code>
      </pre>
    </div>
  );
});
