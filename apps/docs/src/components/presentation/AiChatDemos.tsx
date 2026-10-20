"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Button,
  ChatSidebar,
  CodeBlock,
  Conversation,
  Markdown,
  Message,
  MessageAction,
  MessageActions,
  PromptInput,
  PromptSuggestions,
  StreamingText,
  Toaster,
  TypingIndicator,
  toast,
  type ChatThread,
  type MessageFeedback,
  type MessageStatus,
  type PromptInputStatus,
} from "@adgrid-ui/ui";
import {
  IconBulb,
  IconKey,
  IconMessages,
  IconPaperclip,
  IconPlus,
  IconRefresh,
  IconShare,
  IconSparkles,
  IconTable,
  IconVolume,
  IconWorld,
} from "@tabler/icons-react";

// Demos for the AI chat components. Every reply is a scripted stream, so the docs need no API key.

interface ChatTurn {
  id: string;
  from: "user" | "assistant";
  content: string;
  status: MessageStatus;
}

type Size = "sm" | "md" | "lg";

const REPLIES = [
  "Three pieces make a chat:\n\n1. **Conversation**: the scrolling thread. It holds the bottom while a reply streams.\n2. **Message**: one turn. Give it `content`, or render `<Markdown>` inside it.\n3. **PromptInput**: the composer underneath.\n\n```tsx\n<Conversation busy={status === \"streaming\"}>\n  {messages.map((m) => (\n    <Message key={m.id} from={m.role} status={m.status}>\n      <Markdown text={m.text} streaming={m.status === \"streaming\"} />\n    </Message>\n  ))}\n</Conversation>\n<PromptInput status={status} onSubmit={send} onStop={stop} />\n```\n\nNew words come out on a steady beat, so even a bursty stream reads smoothly.",
  "No backend needed here: every reply in this demo is a **scripted stream**.\n\nIn your app, wire it to the AI SDK:\n\n- pass `useChat`'s `status` straight to `PromptInput`\n- map each message to a `Message`, with its `role` as `from`\n- call `stop()` from `onStop`\n\nThe statuses line up one to one.",
  "Light comes from directly above. Top edges catch it, bottom lips fall into shadow, and *whatever matters rises out of its socket*.\n\n> Watch the send key: it sits dark in its socket while the field is empty and rises the moment you type.\n\n| Surface | Holds | Feels |\n| --- | --- | --- |\n| Raised | buttons, cards | lifted |\n| Well | inputs, code | sunk |\n| Popout | the selected thing | lightest |",
  "Scroll up while I'm writing and the thread lets go, so you can read back in peace. A small key appears at the bottom; press it and you're back with the latest words.",
];

const SUGGESTIONS = [
  { label: "How do I build a chat?", description: "The three components and how they fit", icon: <IconMessages stroke={1.6} />, value: "How do I build a chat with these?" },
  { label: "Do I need an API key?", description: "Wiring it to the AI SDK", icon: <IconKey stroke={1.6} /> },
  { label: "Why does the send key move?", description: "Light, sockets and popouts", icon: <IconBulb stroke={1.6} /> },
  { label: "Show me a table", description: "Markdown renders as it streams", icon: <IconTable stroke={1.6} />, value: "Can you show me a table?" },
];

const HISTORY: ChatTurn[] = [
  { id: "h1", from: "user", content: "What makes this chat feel different?", status: "done" },
  {
    id: "h2",
    from: "assistant",
    content:
      "Each side is its own object. Your messages are raised bubbles; mine sit flat on the page, so a long answer reads like a **document** rather than a stack of balloons.\n\nAsk me something and watch the reply stream in.",
    status: "done",
  },
];

/** A fake model: types for a beat, then streams a reply a few tokens at a time. */
function useScriptedChat(initial: ChatTurn[]) {
  const [turns, setTurns] = useState<ChatTurn[]>(initial);
  const [status, setStatus] = useState<PromptInputStatus>("ready");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyIndex = useRef(0);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clear, []);

  const stream = (id: string, text: string) => {
    const reply = /table/i.test(text) ? REPLIES[2] : REPLIES[replyIndex.current++ % REPLIES.length];
    const tokens = reply.split(/(\s+)/);
    setStatus("submitted");
    let at = 0;
    const tick = () => {
      at = Math.min(tokens.length, at + 2 + Math.floor(Math.random() * 3));
      const done = at >= tokens.length;
      setTurns((all) => all.map((t) => (t.id === id ? { ...t, content: tokens.slice(0, at).join(""), status: done ? "done" : "streaming" } : t)));
      if (done) {
        timer.current = null;
        setStatus("ready");
      } else {
        timer.current = setTimeout(tick, 45 + Math.random() * 55);
      }
    };
    timer.current = setTimeout(() => {
      setStatus("streaming");
      tick();
    }, 900);
  };

  const send = (text: string) => {
    clear();
    const id = String(Date.now());
    setTurns((all) => [
      ...all,
      { id: `u${id}`, from: "user", content: text, status: "done" },
      { id: `a${id}`, from: "assistant", content: "", status: "typing" },
    ]);
    stream(`a${id}`, text);
  };

  const regenerate = (id: string) => {
    clear();
    setTurns((all) => all.map((t) => (t.id === id ? { ...t, content: "", status: "typing" } : t)));
    stream(id, "");
  };

  const stop = () => {
    clear();
    setStatus("ready");
    // A reply stopped before its first word has nothing to keep.
    setTurns((all) => all.filter((t) => t.status !== "typing").map((t) => (t.status === "streaming" ? { ...t, status: "done" } : t)));
  };

  const reset = () => {
    clear();
    setStatus("ready");
    setTurns([]);
  };

  return { turns, status, send, stop, reset, regenerate };
}

function Avatar() {
  return <IconSparkles stroke={1.6} />;
}

function Toolbar() {
  const [search, setSearch] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" iconOnly aria-label="Attach a file">
        <IconPaperclip stroke={1.6} />
      </Button>
      <Button
        variant={search ? "secondary" : "ghost"}
        size="sm"
        aria-pressed={search}
        leadingIcon={<IconWorld stroke={1.6} />}
        onClick={() => setSearch((on) => !on)}
      >
        Search
      </Button>
    </>
  );
}

const FRAME =
  "flex overflow-hidden rounded-3xl border border-white/[0.08] border-t-white/[0.13] bg-[linear-gradient(180deg,#1b1b1d_0%,#151516_100%)] shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_14px_30px_-10px_rgba(0,0,0,0.5),0_1px_4px_-1px_rgba(0,0,0,0.35)]";

const SOCKET =
  "grid place-items-center rounded-full border border-white/[0.06] bg-[#070707] text-neutral-300 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]";

/** A whole chat: header, thread, composer. Shared by the Conversation and Chat Sidebar demos. */
function ChatPanel({
  initial,
  onTurnsChange,
  title = "Assistant",
  headerAction,
  size = "md",
  typingIndicator = "dots",
  conversationProps,
}: {
  initial: ChatTurn[];
  onTurnsChange?: (turns: ChatTurn[]) => void;
  title?: string;
  headerAction?: ReactNode;
  size?: Size;
  typingIndicator?: "dots" | "shimmer";
  conversationProps?: { busy?: boolean; contentClassName?: string; scrollButtonLabel?: string };
}) {
  const { turns, status, send, stop, reset, regenerate } = useScriptedChat(initial);
  const busy = status === "submitted" || status === "streaming";
  const [ratings, setRatings] = useState<Record<string, MessageFeedback>>({});

  const changed = useRef(onTurnsChange);
  changed.current = onTurnsChange;
  useEffect(() => {
    changed.current?.(turns);
  }, [turns]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-black/60 px-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <span className="truncate text-sm font-medium tracking-tight text-neutral-100">{title}</span>
        {headerAction ?? (
          <Button variant="ghost" size="sm" leadingIcon={<IconPlus stroke={1.6} />} onClick={reset}>
            New chat
          </Button>
        )}
      </div>

      <Conversation
        busy={busy || Boolean(conversationProps?.busy)}
        className="flex-1 bg-[#0c0c0d]"
        contentClassName={`mx-auto w-full max-w-[720px] px-5 ${conversationProps?.contentClassName ?? ""}`}
        scrollButtonLabel={conversationProps?.scrollButtonLabel || undefined}
        empty={
          <div className="m-auto flex w-full max-w-[520px] flex-col items-center gap-5 text-center">
            <span className={`${SOCKET} size-11 [&_svg]:size-5`}>
              <Avatar />
            </span>
            <p className="text-lg font-medium tracking-tight text-neutral-100">How can I help?</p>
            <PromptSuggestions variant="card" size="sm" suggestions={SUGGESTIONS} onSelect={send} className="w-full" />
          </div>
        }
      >
        <AnimatePresence initial={false}>
          {turns.map((turn, i) => {
            const isLast = i === turns.length - 1;
            return (
              <Message
                key={turn.id}
                from={turn.from}
                content={turn.from === "user" ? turn.content : undefined}
                status={turn.status}
                size={size}
                typingIndicator={typingIndicator}
                avatar={turn.from === "assistant" ? <Avatar /> : undefined}
                actions={
                  turn.from === "assistant" ? (
                    <MessageActions
                      copyText={turn.content}
                      onRegenerate={isLast && !busy ? () => regenerate(turn.id) : undefined}
                      feedback={ratings[turn.id] ?? null}
                      onFeedbackChange={(value) => setRatings((r) => ({ ...r, [turn.id]: value }))}
                    />
                  ) : undefined
                }
              >
                {turn.from === "assistant" ? <Markdown text={turn.content} streaming={turn.status === "streaming"} /> : undefined}
              </Message>
            );
          })}
        </AnimatePresence>
      </Conversation>

      <div className="flex flex-col gap-2 bg-[#0c0c0d] px-3 pb-3">
        <div className="mx-auto w-full max-w-[720px]">
          <PromptInput size={size} status={status} onSubmit={send} onStop={stop} toolbar={<Toolbar />} />
        </div>
        <p className="text-center text-xs text-neutral-600">Replies are scripted for this demo.</p>
      </div>
    </div>
  );
}

export function ConversationDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  return (
    <div className={`${FRAME} h-[min(640px,calc(100vh-180px))] w-[min(700px,calc(100vw-32px))]`}>
      <ChatPanel
        initial={HISTORY}
        size={(liveProps.size as Size) ?? "md"}
        typingIndicator={(liveProps.typingIndicator as "dots" | "shimmer") ?? "dots"}
        conversationProps={{
          busy: Boolean(liveProps.busy),
          contentClassName: liveProps.contentClassName as string | undefined,
          scrollButtonLabel: liveProps.scrollButtonLabel as string | undefined,
        }}
      />
    </div>
  );
}

// ─── Chat Sidebar ───────────────────────────────────────────────────────────

const DAY = 86_400_000;

function seedThreads(): { threads: ChatThread[]; store: Record<string, ChatTurn[]> } {
  const now = Date.now();
  const t = (id: string, title: string, ago: number, pinned = false): ChatThread => ({ id, title, updatedAt: now - ago, pinned });
  const threads = [
    t("design", "What makes this chat feel different?", 20 * 60_000),
    t("tokens", "Design tokens for the dark theme", 2 * 3_600_000, true),
    t("streaming", "Smoothing a bursty token stream", 26 * 3_600_000),
    t("sidebar", "Grouping chats by date", 3 * DAY),
    t("a11y", "Announcing replies to screen readers", 5 * DAY),
    t("shiki", "Monochrome syntax highlighting without a dependency", 12 * DAY),
    t("launch", "Launch checklist for the AI components", 40 * DAY),
  ];
  const canned = (q: string, a: string): ChatTurn[] => [
    { id: `${q}-u`, from: "user", content: q, status: "done" },
    { id: `${q}-a`, from: "assistant", content: a, status: "done" },
  ];
  return {
    threads,
    store: {
      design: HISTORY,
      tokens: canned("Which tokens does the dark theme use?", "Four surfaces do almost all the work:\n\n- **raised** for buttons and cards\n- **tray** for content inside them\n- **well** for inputs and code\n- **popout** for the one selected thing\n\nColour only appears to carry meaning, like `danger` on an error."),
      streaming: canned("Why did my stream look jerky?", "Tokens arrive in bursts. Show them as they come and words pop in clumps.\n\nBuffer them instead and let them out on a steady beat, quickening when the buffer runs long. That's what `StreamingText` and `Markdown` do."),
      sidebar: canned("How are chats grouped?", "By when they were last touched: **Pinned**, Today, Yesterday, Previous 7 days, Previous 30 days, then by month."),
      a11y: canned("Do screen readers hear every token?", "No. The thread is a log region, and while a reply streams it's marked busy, so the reply is announced once it's finished."),
      shiki: canned("Can code be highlighted without colour?", "Yes, with light and weight:\n\n```ts\n// comments are quietest\nconst beat = 32; // numbers a step up\nexport function land(word: string) {\n  return `landed: ${word}`;\n}\n```"),
      launch: canned("What's left before launch?", "1. Markdown and code blocks\n2. Message actions\n3. ~~Sidebar~~ done\n4. Voice"),
    },
  };
}

export function ChatSidebarDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const [{ threads, store }, setData] = useState(seedThreads);
  const [activeId, setActiveId] = useState<string | null>("design");
  const active = threads.find((t) => t.id === activeId);

  const newChat = () => {
    const id = `new-${Date.now()}`;
    setData((d) => ({ threads: [{ id, title: "New chat", updatedAt: Date.now() }, ...d.threads], store: { ...d.store, [id]: [] } }));
    setActiveId(id);
  };

  const save = (id: string, turns: ChatTurn[]) =>
    setData((d) => {
      if (d.store[id] === turns) return d;
      const firstQuestion = turns.find((t) => t.from === "user")?.content;
      const grew = turns.length !== (d.store[id]?.length ?? 0);
      return {
        store: { ...d.store, [id]: turns },
        threads: d.threads.map((t) =>
          t.id === id
            ? { ...t, title: t.title === "New chat" && firstQuestion ? firstQuestion.slice(0, 48) : t.title, updatedAt: grew ? Date.now() : t.updatedAt }
            : t
        ),
      };
    });

  const sidebar = (
    <ChatSidebar
      threads={threads}
      activeId={activeId}
      onSelect={setActiveId}
      onNewChat={newChat}
      searchable={liveProps.searchable !== false}
      onShare={(id) => {
        const title = threads.find((t) => t.id === id)?.title ?? "Chat";
        void navigator.clipboard?.writeText(`https://example.com/share/${id}`).catch(() => {});
        toast.success("Link copied", { description: title });
      }}
      onRename={(id, title) => setData((d) => ({ ...d, threads: d.threads.map((t) => (t.id === id ? { ...t, title } : t)) }))}
      onArchive={(id) => {
        const archived = threads.find((t) => t.id === id);
        if (!archived) return;
        setData((d) => ({ ...d, threads: d.threads.filter((t) => t.id !== id) }));
        if (id === activeId) setActiveId(null);
        toast("Chat archived", {
          description: archived.title,
          action: { label: "Undo", onClick: () => setData((d) => ({ ...d, threads: [...d.threads, archived] })) },
        });
      }}
      onPinChange={(id, pinned) => setData((d) => ({ ...d, threads: d.threads.map((t) => (t.id === id ? { ...t, pinned } : t)) }))}
      onDelete={(id) => {
        setData((d) => ({ ...d, threads: d.threads.filter((t) => t.id !== id) }));
        if (id === activeId) setActiveId(null);
      }}
      emptyLabel={(liveProps.emptyLabel as string) || undefined}
      footer={
        <div className="flex items-center gap-2.5 px-1">
          <span className={`${SOCKET} size-8 text-xs font-medium`}>AD</span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium tracking-tight text-neutral-100">Ada Dev</span>
            <span className="text-xs text-neutral-500">Free plan</span>
          </span>
        </div>
      }
    />
  );

  return (
    <div className={`${FRAME} h-[min(660px,calc(100vh-180px))] w-[min(1040px,calc(100vw-32px))]`}>
      <div className="hidden w-[272px] shrink-0 border-r border-black/70 shadow-[1px_0_0_rgba(255,255,255,0.04)] sm:flex">{sidebar}</div>
      {active ? (
        <ChatPanel
          key={active.id}
          initial={store[active.id] ?? []}
          onTurnsChange={(turns) => save(active.id, turns)}
          title={active.title}
          headerAction={<span />}
        />
      ) : (
        <div className="grid flex-1 place-items-center bg-[#0c0c0d] p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-neutral-500">Pick a chat, or start a new one.</p>
            <Button variant="secondary" size="sm" leadingIcon={<IconPlus stroke={1.6} />} onClick={newChat}>
              New chat
            </Button>
          </div>
        </div>
      )}
      <Toaster position="bottom-center" />
    </div>
  );
}

// ─── Single components ─────────────────────────────────────────────────────

export function PromptInputDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const [status, setStatus] = useState<PromptInputStatus>("ready");
  const [sent, setSent] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const submit = (text: string) => {
    setSent(text);
    setStatus("submitted");
    timers.current = [setTimeout(() => setStatus("streaming"), 600), setTimeout(() => setStatus("ready"), 3200)];
  };
  const stop = () => {
    timers.current.forEach(clearTimeout);
    setStatus("ready");
  };

  return (
    <div className="flex w-[min(560px,calc(100vw-32px))] flex-col gap-3">
      <PromptInput
        size={(liveProps.size as Size) ?? "md"}
        maxRows={(liveProps.maxRows as number) ?? 8}
        disabled={Boolean(liveProps.disabled)}
        placeholder={(liveProps.placeholder as string) || undefined}
        status={status}
        onSubmit={submit}
        onStop={stop}
        toolbar={<Toolbar />}
      />
      <p className="h-5 truncate px-1 text-xs text-neutral-500">
        {status === "ready" ? (sent ? `Sent: “${sent}”` : "Enter to send · Shift+Enter for a new line") : status === "submitted" ? "Submitted…" : "Streaming a reply… press the key to stop"}
      </p>
    </div>
  );
}

export function MessageDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const size = (liveProps.size as Size) ?? "md";
  const [retry, setRetry] = useState<MessageStatus>("error");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onRetry = () => {
    setRetry("typing");
    timer.current = setTimeout(() => setRetry("done"), 1400);
  };

  const answer =
    (liveProps.content as string) || "Dark machined objects, lit from directly above.\n\nThey rise when they matter and sink when they hold something.";

  return (
    <div className="flex w-[min(600px,calc(100vw-32px))] flex-col gap-6">
      <Message from="user" size={size} content="Can you summarise the design system in two lines?" />
      <Message
        from="assistant"
        size={size}
        avatar={<Avatar />}
        actions={<MessageActions copyText={answer} onRegenerate={() => {}} onFeedbackChange={() => {}} />}
        content={answer}
      />
      <Message from="user" size={size} content="And the colour palette?" />
      <Message
        from="assistant"
        size={size}
        avatar={<Avatar />}
        status={retry}
        typingIndicator={(liveProps.typingIndicator as "dots" | "shimmer") ?? "dots"}
        error="The connection dropped before the reply arrived."
        onRetry={onRetry}
        content={retry === "done" ? "Monochrome first. Light and shadow do the work; colour only appears to carry meaning, like an error." : ""}
      />
    </div>
  );
}

const STREAM_SAMPLE =
  "Every surface here is a physical object. Buttons have weight, cards have depth, and inputs are wells cut into the frame.\n\nThe light has a single source, overhead. Top edges catch it; bottom lips fall into shadow.";

/** Live mode: appends the text a few tokens at a time, like a model stream would. */
function useFakeStream(text: string) {
  const [shown, setShown] = useState("");
  const [streaming, setStreaming] = useState(true);

  useEffect(() => {
    const tokens = text.split(/(\s+)/);
    let at = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      at = Math.min(tokens.length, at + 2 + Math.floor(Math.random() * 3));
      setShown(tokens.slice(0, at).join(""));
      if (at < tokens.length) timer = setTimeout(tick, 45 + Math.random() * 55);
      else setStreaming(false);
    };
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [text]);

  return { shown, streaming };
}

function LiveStream({ text, caret, wordInterval }: { text: string; caret: boolean; wordInterval?: number }) {
  const { shown, streaming } = useFakeStream(text);
  return <StreamingText text={shown} streaming={streaming} caret={caret} wordInterval={wordInterval} className={STREAM_CLASS} />;
}

const STREAM_CLASS = "min-h-[9.5em] w-full text-[15px] leading-relaxed text-neutral-300";

export function StreamingTextDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const [run, setRun] = useState(0);
  const text = (liveProps.text as string) || STREAM_SAMPLE;
  const caret = liveProps.caret !== false;
  const key = `${run}-${liveProps.reveal}-${liveProps.wordInterval}-${text}`;
  return (
    <div className="flex w-[min(520px,calc(100vw-32px))] flex-col items-start gap-5">
      {liveProps.reveal === false ? (
        <LiveStream key={key} text={text} caret={caret} wordInterval={liveProps.wordInterval as number | undefined} />
      ) : (
        <StreamingText key={key} reveal text={text} wordInterval={liveProps.wordInterval as number | undefined} caret={caret} className={STREAM_CLASS} />
      )}
      <Button variant="secondary" size="sm" leadingIcon={<IconRefresh stroke={1.6} />} onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </div>
  );
}

export function TypingIndicatorDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const size = (liveProps.size as Size) ?? "md";
  const label = (liveProps.label as string) || "Thinking";
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex items-center gap-14">
        <TypingIndicator variant="dots" size={size} label={label} />
        <TypingIndicator variant="shimmer" size={size} label={label} />
      </div>
      <div className="w-[min(420px,calc(100vw-32px))]">
        <Message from="assistant" status="typing" size={size} avatar={<Avatar />} typingIndicator="shimmer" />
      </div>
    </div>
  );
}

const MARKDOWN_SAMPLE = `## Shipping the chat

The thread, the composer and the reply are **three components**. Replies render as markdown while they stream, so *nothing flickers*.

- Inline \`code\` sits in a small socket
- Links like [the AI SDK](https://ai-sdk.dev) are underlined in light
- Lists nest:
  - two spaces deeper
  - and back

\`\`\`ts
export async function reply(prompt: string) {
  const stream = await model.stream(prompt);
  for await (const token of stream) emit(token); // paced on the client
}
\`\`\`

| Piece | Job |
| --- | --- |
| Conversation | holds the bottom |
| Markdown | renders as it streams |

> Half-finished **bold** or \`code\` is closed for you mid-stream.`;

function LiveMarkdown({ text, wordInterval }: { text: string; wordInterval?: number }) {
  const { shown, streaming } = useFakeStream(text);
  return <Markdown text={shown} streaming={streaming} wordInterval={wordInterval} className="text-[14.5px] leading-relaxed text-neutral-300" />;
}

export function MarkdownDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const [run, setRun] = useState(0);
  const text = (liveProps.text as string) || MARKDOWN_SAMPLE;
  const animate = liveProps.animate !== false;
  const key = `${run}-${animate}-${liveProps.wordInterval}-${text}`;
  return (
    <div className="flex h-[min(640px,calc(100vh-180px))] w-[min(640px,calc(100vw-32px))] flex-col gap-4">
      <div className="min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-color:#2a2a2c_transparent] [scrollbar-width:thin]">
        {animate ? (
          <LiveMarkdown key={key} text={text} wordInterval={liveProps.wordInterval as number | undefined} />
        ) : (
          <Markdown key={key} text={text} animate={false} className="text-[14.5px] leading-relaxed text-neutral-300" />
        )}
      </div>
      <Button variant="secondary" size="sm" className="self-start" leadingIcon={<IconRefresh stroke={1.6} />} onClick={() => setRun((r) => r + 1)}>
        Stream again
      </Button>
    </div>
  );
}

const CODE_SAMPLES: Record<string, string> = {
  tsx: `import { Conversation, Message, PromptInput } from "@adgrid-ui/ui";

// One chat: the thread, its turns, and the composer.
export function Chat({ messages, status, send, stop }: ChatProps) {
  return (
    <>
      <Conversation busy={status === "streaming"}>
        {messages.map((m) => (
          <Message key={m.id} from={m.role} content={m.text} />
        ))}
      </Conversation>
      <PromptInput status={status} onSubmit={send} onStop={stop} />
    </>
  );
}`,
  python: `import asyncio

# Let tokens out on a steady beat instead of in bursts.
async def pace(stream, beat=0.032):
    buffer = []
    async for token in stream:
        buffer.append(token)
        while buffer:
            yield buffer.pop(0)
            await asyncio.sleep(beat / max(1, len(buffer) / 12))`,
  bash: `# Add a component to your project
npx shadcn@latest add "https://void-ui-phi.vercel.app/r/code-block.json"

pnpm dev  # then open /present/primitives/code-block`,
};

export function CodeBlockDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const language = (liveProps.language as string) || "tsx";
  return (
    <div className="w-[min(640px,calc(100vw-32px))]">
      <CodeBlock
        code={CODE_SAMPLES[language] ?? CODE_SAMPLES.tsx}
        language={language}
        filename={(liveProps.filename as string) || undefined}
        showLineNumbers={Boolean(liveProps.showLineNumbers)}
        highlight={liveProps.highlight !== false}
        copyable={liveProps.copyable !== false}
      />
    </div>
  );
}

export function MessageActionsDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const [feedback, setFeedback] = useState<MessageFeedback>(null);
  const [log, setLog] = useState("Hover the keys, then press one.");
  const size = (liveProps.size as "sm" | "md") ?? "sm";
  const text = "Inner surfaces are always one tier deeper than the surface they sit in.";
  return (
    <div className="flex w-[min(520px,calc(100vw-32px))] flex-col gap-4">
      <Message
        from="assistant"
        avatar={<Avatar />}
        content={text}
        actions={
          <MessageActions
            size={size}
            copyText={text}
            onCopy={() => setLog("Copied the reply.")}
            onRegenerate={() => setLog("Regenerate pressed.")}
            feedback={feedback}
            onFeedbackChange={(value) => {
              setFeedback(value);
              setLog(value ? `Rated ${value === "up" ? "good" : "bad"}.` : "Rating taken back.");
            }}
          >
            <MessageAction label="Read aloud" size={size} onClick={() => setLog("Read aloud pressed.")}>
              <IconVolume stroke={1.6} />
            </MessageAction>
            <MessageAction label="Share" size={size} onClick={() => setLog("Share pressed.")}>
              <IconShare stroke={1.6} />
            </MessageAction>
          </MessageActions>
        }
      />
      <p className="pl-11 text-xs text-neutral-500" aria-live="polite">
        {log}
      </p>
    </div>
  );
}

export function PromptSuggestionsDemo({ liveProps = {} }: { liveProps?: Record<string, unknown> }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const variant = (liveProps.variant as "pill" | "card") ?? "card";
  const size = (liveProps.size as "sm" | "md") ?? "md";
  return (
    <div className="flex w-[min(560px,calc(100vw-32px))] flex-col items-center gap-5">
      <PromptSuggestions
        key={`${run}-${variant}-${size}`}
        variant={variant}
        size={size}
        animate={liveProps.animate !== false}
        suggestions={variant === "card" ? SUGGESTIONS : SUGGESTIONS.map((s) => ({ label: s.label, icon: s.icon }))}
        onSelect={setPicked}
        className={variant === "pill" ? "justify-center" : "w-full"}
      />
      <p className="h-5 text-xs text-neutral-500">{picked ? `Would send: “${picked}”` : "Pick one."}</p>
      <Button variant="ghost" size="sm" leadingIcon={<IconRefresh stroke={1.6} />} onClick={() => setRun((r) => r + 1)}>
        Play again
      </Button>
    </div>
  );
}
