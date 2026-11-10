"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { FG, FOCUS, LINE, MUTED, SUBTLE, externalProps } from "../parts";
import type { PortfolioData } from "../types";

// A small working shell in the hero. It opens with whoami / status / contact already run, then
// takes commands: `help` lists them. Every answer is read from the portfolio data, so it stays
// right when the data changes. Keys typed here never reach the host page's shortcuts.

/** Their local time and how far it is from the visitor's. Null until mounted, so SSR matches. */
export function useLocalTime(timezone: string) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;
  try {
    const time = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(now);
    const theirs = new Date(now.toLocaleString("en-US", { timeZone: timezone })).getTime();
    const mine = new Date(now.toLocaleString("en-US")).getTime();
    const hours = Math.round(((theirs - mine) / 3_600_000) * 2) / 2;
    const diff = hours === 0 ? "same time as you" : `${Math.abs(hours)}h ${hours > 0 ? "ahead of" : "behind"} you`;
    return { time, diff };
  } catch {
    return null;
  }
}

const LINK = cn("text-[var(--pf-fg)] underline decoration-[var(--pf-subtle)] underline-offset-4 hover:decoration-[var(--pf-fg)]", FOCUS);
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function A({ href, children, download }: { href: string; children: ReactNode; download?: boolean }) {
  return (
    <a href={href} className={LINK} download={download || undefined} {...externalProps(href)}>
      {children}
    </a>
  );
}

function Prompt() {
  return <span className="select-none text-emerald-500">❯</span>;
}

/** Live status line: availability, place and local time (re-renders as the clock ticks). */
function Status({ data }: { data: PortfolioData }) {
  const { profile } = data;
  const local = useLocalTime(profile.timezone);
  return (
    <p className="flex flex-wrap items-center gap-x-2">
      {profile.available ? (
        <span className="flex items-center gap-1.5 text-emerald-500">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
          available for projects
        </span>
      ) : (
        <span>heads down, not taking work</span>
      )}
      <span aria-hidden="true">·</span>
      <span>{profile.location.toLowerCase()}</span>
      {local && (
        <>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{local.time}</span>
          <span className={SUBTLE}>({local.diff})</span>
        </>
      )}
    </p>
  );
}

type Entry = { id: number; cmd?: string; out?: ReactNode };

export interface TerminalProps {
  data: PortfolioData;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  /** Opens the booking dialog; without it `book` follows bookingUrl. */
  onBook?: () => void;
}

export function Terminal({ data, theme, onToggleTheme, onBook }: TerminalProps) {
  const { profile } = data;
  const user = profile.name.split(" ")[0].toLowerCase();
  const host = (profile.location.split(",").pop() ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);

  // ─── Command table ────────────────────────────────────────────────────────
  const commands = useMemo(() => {
    const projectBySlug = new Map(data.projects.map((p) => [slug(p.name), p]));
    const list = (rows: [ReactNode, ReactNode][]) => (
      <div className="grid grid-cols-[max-content_1fr] gap-x-4">
        {rows.map(([k, v], i) => (
          <div key={i} className="contents">
            <span className={FG}>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    );

    const whoami = () => (
      <p>
        {profile.role.toLowerCase()}
        {profile.company && (
          <>
            {" @ "}
            {profile.companyUrl ? <A href={profile.companyUrl}>{profile.company.toLowerCase()}</A> : profile.company.toLowerCase()}
          </>
        )}
      </p>
    );
    const contact = () => (
      <p>
        <A href={`mailto:${profile.email}`}>{profile.email}</A>
      </p>
    );
    const skills = (arg?: string) => {
      const groups = arg ? data.stack.filter((g) => g.label.toLowerCase().startsWith(arg.toLowerCase())) : data.stack;
      if (!groups.length) return <p>skills: no group called &ldquo;{arg}&rdquo;. try: {data.stack.map((g) => g.label.toLowerCase()).join(", ")}</p>;
      return list(groups.map((g) => [g.label.toLowerCase(), g.items.join(", ")]));
    };
    const about = () => (
      <div className="space-y-1.5">
        {data.about.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    );

    type Cmd = { desc: string; usage?: string; run: (args: string[]) => ReactNode | "clear" };
    const table: Record<string, Cmd> = {
      help: {
        desc: "list commands",
        run: () =>
          list(
            Object.entries(table)
              .filter(([, c]) => c.desc)
              .map(([name, c]) => [c.usage ?? name, c.desc])
          ),
      },
      whoami: { desc: "who is this", run: whoami },
      status: { desc: "availability and local time", run: () => <Status data={data} /> },
      about: { desc: "a little about me", run: about },
      projects: {
        desc: "things I've built",
        run: () =>
          list(
            data.projects.map((p) => [
              slug(p.name),
              <>
                {p.description.split(". ")[0].replace(/\.$/, "")}.{" "}
                {p.liveUrl && <A href={p.liveUrl}>live</A>}
                {p.liveUrl && p.sourceUrl && " · "}
                {p.sourceUrl && <A href={p.sourceUrl}>code</A>}
              </>,
            ])
          ),
      },
      open: {
        desc: "open a project",
        usage: "open <project>",
        run: ([name]) => {
          if (!name) return <p>usage: open &lt;project&gt; · projects: {[...projectBySlug.keys()].join(", ")}</p>;
          const p = projectBySlug.get(slug(name));
          const url = p?.liveUrl ?? p?.sourceUrl;
          if (!p || !url) return <p>open: no project called &ldquo;{name}&rdquo;. try `projects`</p>;
          window.open(url, "_blank", "noopener");
          return <p>opening {p.name}… <A href={url}>{url.replace(/^https?:\/\//, "")}</A></p>;
        },
      },
      skills: { desc: "my stack", usage: "skills [group]", run: ([g]) => skills(g) },
      socials: { desc: "where to find me", run: () => list(data.socials.map((s) => [s.label.toLowerCase(), <A key={s.url} href={s.url}>{s.url.replace(/^mailto:|^https?:\/\/(www\.)?/, "")}</A>])) },
      contact: { desc: "how to reach me", run: contact },
      resume: {
        desc: "download my resume",
        run: () =>
          data.resumes.length ? (
            <div>
              {data.resumes.map((r) => (
                <p key={r.url}>
                  <A href={r.url} download>
                    {r.label.toLowerCase()}.pdf
                  </A>{" "}
                  <span className={SUBTLE}>(click to download)</span>
                </p>
              ))}
            </div>
          ) : (
            <p>no resume yet</p>
          ),
      },
      book: {
        desc: "book a call",
        run: () => {
          if (onBook) {
            onBook();
            return <p>opening the booking calendar…</p>;
          }
          if (profile.bookingUrl) {
            window.open(profile.bookingUrl, "_blank", "noopener");
            return <p>opening <A href={profile.bookingUrl}>{profile.bookingUrl.replace(/^https?:\/\//, "")}</A>…</p>;
          }
          return <p>no booking link. try `contact`</p>;
        },
      },
      theme: {
        desc: "switch light / dark",
        run: () => {
          onToggleTheme();
          return <p>switched to {theme === "dark" ? "light" : "dark"} mode</p>;
        },
      },
      ls: { desc: "list files", run: () => <p className={FG}>about.txt  contact.txt  skills.txt  projects/  resume.pdf</p> },
      cat: {
        desc: "print a file",
        usage: "cat <file>",
        run: ([file]) => {
          switch (file) {
            case "about.txt":
              return about();
            case "contact.txt":
              return contact();
            case "skills.txt":
              return skills();
            case "projects":
            case "projects/":
              return <p>cat: projects: is a directory. try `projects`</p>;
            case "resume.pdf":
              return <p>cat: resume.pdf: binary file. try `resume`</p>;
            case undefined:
              return <p>usage: cat &lt;file&gt; · try `ls`</p>;
            default:
              return <p>cat: {file}: no such file</p>;
          }
        },
      },
      date: { desc: "what time is it", run: () => <p>{new Date().toString()}</p> },
      echo: { desc: "say something", usage: "echo <text>", run: (args) => <p>{args.join(" ")}</p> },
      history: { desc: "past commands", run: () => list(history.map((h, i) => [String(i + 1).padStart(3, " "), h])) },
      clear: { desc: "clear the screen", run: () => "clear" },
      // Undocumented.
      sudo: { desc: "", run: () => <p>{user} is not in the sudoers file. this incident will be reported.</p> },
      exit: { desc: "", run: () => <p>there&rsquo;s no leaving. try `book` instead.</p> },
    };
    return table;
  }, [data, profile, theme, onToggleTheme, onBook, history, user]);

  const boot = (): Entry[] => [
    { id: nextId.current++, cmd: "whoami", out: commands.whoami.run([]) as ReactNode },
    { id: nextId.current++, cmd: "status", out: <Status data={data} /> },
    { id: nextId.current++, cmd: "contact", out: commands.contact.run([]) as ReactNode },
    {
      id: nextId.current++,
      out: (
        <p className={SUBTLE}>
          type <span className={FG}>help</span> to see what else I can do
        </p>
      ),
    },
  ];
  const [entries, setEntries] = useState<Entry[]>(boot);

  // Keep the newest output in view inside the terminal (never scrolls the page).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const run = (raw: string) => {
    const line = raw.trim();
    if (line) setHistory((h) => [...h, line]);
    setCursor(null);
    setValue("");
    if (!line) {
      setEntries((e) => [...e, { id: nextId.current++, cmd: "" }]);
      return;
    }
    const [name, ...args] = line.split(/\s+/);
    const command = commands[name.toLowerCase()];
    const out = command
      ? command.run(args)
      : (
          <p>
            command not found: {name}. type <span className={FG}>help</span>
          </p>
        );
    if (out === "clear") setEntries([]);
    else setEntries((e) => [...e, { id: nextId.current++, cmd: line, out }]);
  };

  const complete = () => {
    const [name, ...rest] = value.trimStart().split(/\s+/);
    if (!rest.length) {
      const matches = Object.keys(commands).filter((c) => commands[c].desc && c.startsWith(name.toLowerCase()));
      if (matches.length === 1) setValue(`${matches[0]} `);
      else if (matches.length > 1) setEntries((e) => [...e, { id: nextId.current++, cmd: value, out: <p className={FG}>{matches.join("  ")}</p> }]);
      return;
    }
    const pool = name === "open" ? data.projects.map((p) => slug(p.name)) : name === "cat" ? ["about.txt", "contact.txt", "skills.txt", "resume.pdf"] : name === "skills" ? data.stack.map((g) => g.label.toLowerCase().split(/\s/)[0]) : [];
    const partial = rest[rest.length - 1] ?? "";
    const matches = pool.filter((p) => p.startsWith(partial.toLowerCase()));
    if (matches.length === 1) setValue(`${name} ${matches[0]}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Typing here must not trigger the host page's shortcuts (arrow keys, letters).
    event.stopPropagation();
    if (event.key === "Enter") {
      event.preventDefault();
      run(value);
    } else if (event.key === "Tab") {
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor === null) return;
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setValue("");
      } else {
        setCursor(i);
        setValue(history[i]);
      }
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      setEntries([]);
    }
  };

  return (
    <div className={cn("pf-mono mt-6 overflow-hidden rounded-lg border bg-[var(--pf-panel)] text-[13px] leading-6", LINE)}>
      <div className={cn("flex items-center gap-2 border-b px-3 py-2", LINE)}>
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span className={cn("mx-auto pr-12 text-xs", SUBTLE)}>
          {user}@{host}: ~
        </span>
      </div>
      {/* Clicking anywhere in the window puts the cursor in the prompt (unless text is being selected). */}
      <div
        ref={scrollRef}
        onClick={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
        }}
        className={cn("max-h-[300px] cursor-text overflow-y-auto px-4 py-3 [scrollbar-width:thin]", MUTED)}
      >
        <div role="log" aria-live="polite" aria-label="Terminal output" className="space-y-1.5">
          {entries.map((entry) => (
            <div key={entry.id}>
              {entry.cmd !== undefined && (
                <p>
                  <Prompt /> <span className={FG}>{entry.cmd}</span>
                </p>
              )}
              {entry.out}
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <Prompt />
          <label htmlFor={inputId} className="sr-only">
            Terminal command
          </label>
          <input
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="type help"
            className={cn("min-w-0 flex-1 bg-transparent caret-emerald-500 outline-none placeholder:text-[var(--pf-subtle)]", FG)}
          />
        </div>
      </div>
    </div>
  );
}
