"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, Check, Copy, Github, Linkedin, MessageSquare, Send } from "lucide-react";
import { Button, SegmentedControl, TextField } from "@adgrid-ui/ui";
import { CalBooker } from "./CalBooker";
import { CONTACT, type ContactTopic } from "./contact.config";

// Flat surfaces only: a hairline edge and a slightly lit top border, no drop shadow, no bevel.
const CARD = "rounded-2xl border border-white/[0.06] border-t-white/[0.09] bg-[#0c0c0d]";
const LABEL = "text-[13px] text-neutral-500";
const EASE = [0.32, 0.72, 0, 1] as const;

type Mode = "call" | "message";

export function ContactView() {
  const [topic, setTopic] = useState<ContactTopic>("project");
  const [mode, setMode] = useState<Mode>("call");
  const reduceMotion = useReducedMotion() ?? false;

  // `/contact?tab=message` opens straight on the form.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "message") setMode("message");
  }, []);

  // void-lint-ignore: #09090b is the docs site page background, shared with /issues
  return (
    <main className="flex min-h-screen justify-center bg-[#09090b] px-4 pb-24 pt-28 font-inter text-neutral-300 sm:px-6 sm:pt-32">
      <div className="w-full max-w-5xl">
        <header className="grid gap-10 md:grid-cols-[1.15fr_1fr_1fr] md:gap-8">
          <Identity />

          <section className="flex flex-col gap-3">
            <p className={LABEL}>What brings you here?</p>
            <SegmentedControl
              aria-label="What brings you here?"
              options={CONTACT.topics.map((t) => ({ value: t.value, label: t.label }))}
              value={topic}
              onValueChange={(v) => setTopic(v as ContactTopic)}
              className="max-w-full"
            />
          </section>

          <section className="flex flex-col gap-3">
            <p className={LABEL}>Or reach me directly</p>
            <EmailCard />
            <div className="flex gap-2">
              <SocialLink href={CONTACT.socials.github} label="GitHub">
                <Github />
              </SocialLink>
              <SocialLink href={CONTACT.socials.linkedin} label="LinkedIn">
                <Linkedin />
              </SocialLink>
              <SocialLink href={CONTACT.socials.x} label="X">
                <XGlyph />
              </SocialLink>
            </div>
          </section>
        </header>

        <div className="mt-16 flex justify-center sm:mt-20">
          <SegmentedControl
            aria-label="How do you want to get in touch?"
            size="lg"
            options={[
              { value: "call", label: "Book a call", icon: <Calendar /> },
              { value: "message", label: "Send a message", icon: <MessageSquare /> },
            ]}
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
          />
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -4, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.26, ease: EASE }}
            >
              {mode === "call" ? (
                <div className={`${CARD} h-[700px] overflow-hidden`}>
                  <CalBooker />
                </div>
              ) : (
                <MessageForm topic={topic} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function Identity() {
  const now = useNow();
  const time = now
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: CONTACT.timezone }).format(now)
    : null;
  const available = now ? isWorkingHours(now) : false;

  return (
    <section className="flex items-center gap-5">
      <div className="shrink-0 -rotate-3 rounded-[6px] bg-neutral-200 p-1.5 pb-5">
        {/* eslint-disable-next-line @next/next/no-img-element -- void-lint-ignore: photo */}
        <img
          src={CONTACT.photo}
          alt={CONTACT.name}
          width={76}
          height={76}
          className="size-[76px] rounded-[2px] object-cover object-top"
        />
      </div>
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-neutral-100">{CONTACT.name}</h1>
        <p className="text-[13px] text-neutral-400">{CONTACT.role}</p>
        <p className="flex items-center gap-2 text-[13px] text-neutral-500" aria-live="off">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${available ? "bg-[rgb(126_190_152)]" : "bg-neutral-600"}`}
          />
          <span className="tabular-nums">{time ?? " "}</span>
          <span>in {CONTACT.place}</span>
          <span className="sr-only">{available ? "(usually replies today)" : "(outside working hours)"}</span>
        </p>
      </div>
    </section>
  );
}

function EmailCard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  };

  return (
    <div className={`${CARD} flex items-center justify-between gap-3 px-4 py-3`}>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">Email</p>
        <a
          href={`mailto:${CONTACT.email}`}
          className="block truncate text-sm font-medium text-neutral-100 outline-white/40 outline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-1"
        >
          {CONTACT.email}
        </a>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email"}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-neutral-400 outline-white/40 outline-offset-2 transition-colors duration-150 hover:bg-white/[0.04] hover:text-neutral-100 focus-visible:outline focus-visible:outline-1"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`${CARD} inline-flex size-10 items-center justify-center rounded-xl text-neutral-400 outline-white/40 outline-offset-2 transition-colors duration-150 hover:border-white/[0.12] hover:text-neutral-100 focus-visible:outline focus-visible:outline-1 [&_svg]:size-4`}
    >
      {children}
    </a>
  );
}

function MessageForm({ topic }: { topic: ContactTopic }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const topicLabel = CONTACT.topics.find((t) => t.value === topic)?.label ?? "Hello";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = `[${topicLabel}] from ${name.trim()}`;
    const body = `${message.trim()}\n\n— ${name.trim()}${email.trim() ? ` (${email.trim()})` : ""}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={submit} className={`${CARD} mx-auto max-w-2xl space-y-5 p-5 sm:p-7`}>
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-100">Send a message</h2>
        <p className="text-[13px] leading-relaxed text-neutral-400">
          About: <span className="text-neutral-200">{topicLabel}</span>. Change it above if that's not right.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" required autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <TextField
        label="Message"
        name="message"
        multiline
        autoResize
        rows={5}
        maxRows={12}
        required
        placeholder="What are you working on?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          {sent ? "Your mail app should have opened with the message ready." : "Opens your mail app with the message filled in."}
        </p>
        <Button type="submit" variant="primary" trailingIcon={<Send />}>
          Send message
        </Button>
      </div>
    </form>
  );
}

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function isWorkingHours(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
    timeZone: CONTACT.timezone,
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  return day !== "Sat" && day !== "Sun" && hour >= CONTACT.hours.start && hour < CONTACT.hours.end;
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
